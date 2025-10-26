<script>
  const sampleHeader = `Return-Path: <mailer@example.com>
Received: from mailout.example.com (mailout.example.com [203.0.113.18])
        by mx.google.com with ESMTPS id a12-20020a5d5202000000b002ac1f90c5f6si12345678qka.110.2024.01.15.08.31.42
        for <recipient@gmail.com>
        (version=TLS1_3 cipher=TLS_AES_256_GCM_SHA384 bits=256/256);
        Mon, 15 Jan 2024 08:31:42 -0800 (PST)
Received: from smtp-out.internal (smtp-out.internal [10.10.4.18])
        by mailout.example.com (Postfix) with ESMTPS id 4F123C02E3
        for <recipient@gmail.com>; Mon, 15 Jan 2024 16:31:38 +0000 (UTC)
Received: from author-laptop (unknown [198.51.100.42])
        by smtp-out.internal (Postfix) with ESMTPSA id 4F123C02D8
        for <recipient@gmail.com>; Mon, 15 Jan 2024 16:31:37 +0000 (UTC)
Authentication-Results: mx.google.com;
        dkim=pass header.i=@example.com header.s=selector1 header.b=abc123;
        spf=pass (google.com: domain of mailer@example.com designates 203.0.113.18 as permitted sender) smtp.mailfrom=mailer@example.com;
        dmarc=pass (p=NONE sp=NONE dis=NONE) header.from=example.com
Received-SPF: pass (google.com: domain of mailer@example.com designates 203.0.113.18 as permitted sender) client-ip=203.0.113.18;
From: Sender Name <sender@example.com>
To: Recipient One <recipient@gmail.com>
Subject: Updates from our January release
Date: Mon, 15 Jan 2024 16:31:35 +0000
Message-ID: <20240115163135.4F123C02D8@mailout.example.com>
MIME-Version: 1.0
Content-Type: text/html; charset="UTF-8"
`;

  let headerText = sampleHeader;

  const severityOrder = [
    "pass",
    "none",
    "neutral",
    "temperror",
    "softfail",
    "fail",
    "permerror",
  ];

  $: analysis = analyseHeaders(headerText);

  function parseHeaders(raw) {
    const lines = raw.replace(/\r/g, "").split("\n");
    const entries = [];
    let currentKey = "";
    let currentValue = "";

    for (const line of lines) {
      if (!line.trim() && !currentKey) continue;
      if (/^[ \t]/.test(line) && currentKey) {
        currentValue += " " + line.trim();
        continue;
      }

      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) {
        if (currentKey) {
          currentValue += " " + line.trim();
        }
        continue;
      }

      if (currentKey) {
        entries.push({ key: currentKey, value: currentValue.trim() });
      }

      currentKey = line.slice(0, separatorIndex).trim();
      currentValue = line.slice(separatorIndex + 1).trim();
    }

    if (currentKey) {
      entries.push({ key: currentKey, value: currentValue.trim() });
    }

    const map = new Map();
    for (const entry of entries) {
      const lower = entry.key.toLowerCase();
      if (!map.has(lower)) {
        map.set(lower, []);
      }
      map.get(lower).push(entry.value);
    }

    return { entries, map };
  }

  function analyseHeaders(raw) {
    const { map } = parseHeaders(raw);

    const summary = {
      subject: map.get("subject")?.[0] ?? "",
      from: map.get("from")?.[0] ?? "",
      to: map.get("to")?.join(", ") ?? "",
      date: map.get("date")?.[0] ?? "",
      messageId: map.get("message-id")?.[0] ?? "",
      replyTo: map.get("reply-to")?.[0] ?? "",
      returnPath: map.get("return-path")?.[0] ?? "",
    };

    const received = (map.get("received") ?? []).map((value, index, array) =>
      parseReceived(value, array.length - index),
    );

    const authLines = [
      ...(map.get("authentication-results") ?? []),
      ...(map.get("received-spf") ?? []),
      ...(map.get("authentication-results-original") ?? []),
    ];
    const authStatuses = extractAuthStatuses(authLines);

    const warnings = buildWarnings(received, authStatuses, summary);
    const score = computeScore(received, authStatuses);

    return {
      summary,
      received,
      authStatuses,
      warnings,
      score,
      rawCount: raw.trim().length ? (map.get("received")?.length ?? 0) : 0,
      hasData: raw.trim().length > 0,
    };
  }

  function parseReceived(value, hop) {
    const fromMatch = value.match(
      /from\s+([^;]+?)(?=\s+by|\s+with|\s+id|\s+for|;|$)/i,
    );
    const byMatch = value.match(/by\s+([^;]+?)(?=\s+with|\s+id|\s+for|;|$)/i);
    const withMatch = value.match(/with\s+([^;]+?)(?=\s+id|\s+for|;|$)/i);
    const forMatch = value.match(/for\s+(<[^>]+>)/i);
    const dateMatch = value.match(/;\s*(.+)$/);

    return {
      hop,
      from: fromMatch?.[1].trim() ?? "Unknown",
      by: byMatch?.[1].trim() ?? "Unknown",
      protocol: withMatch?.[1].trim() ?? "—",
      recipient: forMatch?.[1] ?? "",
      timestamp: dateMatch?.[1] ?? "",
    };
  }

  function extractAuthStatuses(lines) {
    const statuses = new Map();
    for (const line of lines) {
      if (!line) continue;
      const matches = line.matchAll(/(spf|dkim|dmarc)=([a-z_-]+)/gi);
      let matched = false;
      for (const match of matches) {
        matched = true;
        const method = match[1].toLowerCase();
        const result = match[2].toLowerCase();
        const description = extractAuthComment(line, method);
        statuses.set(method, {
          method: method.toUpperCase(),
          result,
          description: description || line,
        });
      }
      if (!matched) {
        const spfPrefix = line.match(
          /^(pass|fail|softfail|neutral|none|temperror|permerror)/i,
        );
        if (spfPrefix) {
          statuses.set("spf", {
            method: "SPF",
            result: spfPrefix[1].toLowerCase(),
            description: line,
          });
        }
      }
    }
    return Array.from(statuses.values());
  }

  function extractAuthComment(line, method) {
    const commentRegex = new RegExp(
      `${method}\\s*=\\s*\\w+\\s*\\(([^)]+)\\)`,
      "i",
    );
    const commentMatch = line.match(commentRegex);
    if (commentMatch?.[1]) {
      return commentMatch[1].trim();
    }
    return "";
  }

  function buildWarnings(received, authStatuses, summary) {
    const warnings = [];
    if (!received.length) {
      warnings.push(
        "No Received headers were detected. The message may be truncated.",
      );
    } else if (received.length < 2) {
      warnings.push(
        "Only a single hop detected — consider verifying intermediate relays.",
      );
    }

    for (const status of authStatuses) {
      if (status.result === "fail" || status.result === "permerror") {
        warnings.push(
          `${status.method} authentication failed: ${status.description}`,
        );
      } else if (
        status.result === "softfail" ||
        status.result === "temperror"
      ) {
        warnings.push(
          `${status.method} authentication reported ${status.result}. Delivery may still succeed, but review DNS records.`,
        );
      } else if (status.result === "none") {
        warnings.push(
          `${status.method} result is none. Configure DNS records to improve trust.`,
        );
      }
    }

    if (!summary.returnPath) {
      warnings.push(
        "Return-Path header missing — bounce handling may be unreliable.",
      );
    }

    return warnings;
  }

  function computeScore(received, authStatuses) {
    if (!received.length) return 15;
    let score = 100;
    for (const status of authStatuses) {
      if (status.result === "pass") continue;
      if (status.result === "none") {
        score -= 12;
      } else if (
        status.result === "softfail" ||
        status.result === "temperror"
      ) {
        score -= 25;
      } else if (status.result === "fail" || status.result === "permerror") {
        score -= 40;
      } else if (status.result === "neutral") {
        score -= 8;
      }
    }
    if (received.length < 2) score -= 10;
    return Math.max(0, Math.min(100, score));
  }

  function statusBadge(result) {
    const normalized = result.toLowerCase();
    if (normalized === "pass") {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200";
    }
    if (normalized === "fail" || normalized === "permerror") {
      return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200";
    }
    if (
      normalized === "softfail" ||
      normalized === "temperror" ||
      normalized === "neutral"
    ) {
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200";
    }
    return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }
  function severityIndex(result) {
    const value = result.toLowerCase();
    const index = severityOrder.indexOf(value);
    return index === -1 ? severityOrder.length : index;
  }

  function compareSeverity(a, b) {
    return severityIndex(a.result) - severityIndex(b.result);
  }
</script>

<section class="space-y-6">
  <div class="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
    <div class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Email header
            </p>
            <h2
              class="text-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              Paste a raw header to analyze routing, authentication, and delays
            </h2>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              class="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
              type="button"
              on:click={() => {
                headerText = sampleHeader;
              }}
            >
              Load sample
            </button>
            <button
              class="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
              type="button"
              on:click={() => {
                headerText = "";
              }}
            >
              Clear
            </button>
          </div>
        </div>

        <label
          class="mt-5 block text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          Raw header
          <textarea
            class="mt-2 h-80 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={headerText}
            placeholder="Copy the full header from your email client (usually via 'Show Original' or 'View Source')."
          ></textarea>
        </label>

        <div class="mt-5 grid gap-3 sm:grid-cols-2">
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <p>Received hops</p>
            <p
              class="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              {analysis.received.length}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <p>Auth checks</p>
            <p
              class="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              {analysis.authStatuses.length}
            </p>
          </div>
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Parsed fields
        </p>
        <div class="mt-3 grid gap-4 sm:grid-cols-2">
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              From
            </p>
            <p class="mt-1 font-semibold text-slate-900 dark:text-slate-100">
              {analysis.summary.from || "Not present"}
            </p>
          </div>
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              To
            </p>
            <p class="mt-1 font-semibold text-slate-900 dark:text-slate-100">
              {analysis.summary.to || "Not present"}
            </p>
          </div>
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Subject
            </p>
            <p class="mt-1 font-semibold text-slate-900 dark:text-slate-100">
              {analysis.summary.subject || "Not present"}
            </p>
          </div>
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Message-ID
            </p>
            <p
              class="mt-1 break-words font-semibold text-slate-900 dark:text-slate-100"
            >
              {analysis.summary.messageId || "Not present"}
            </p>
          </div>
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Date
            </p>
            <p class="mt-1 font-semibold text-slate-900 dark:text-slate-100">
              {analysis.summary.date || "Not present"}
            </p>
          </div>
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Return-Path
            </p>
            <p
              class="mt-1 break-words font-semibold text-slate-900 dark:text-slate-100"
            >
              {analysis.summary.returnPath || "Not present"}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex items-center justify-between gap-3">
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Deliverability score
            </p>
            <p
              class="text-3xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {analysis.score}
            </p>
          </div>
          <div
            class="h-2 w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800"
          >
            <div
              class="h-full rounded-full bg-emerald-500 transition-all dark:bg-emerald-400"
              style={`width: ${analysis.score}%`}
            ></div>
          </div>
        </div>
        <p class="mt-3 text-sm text-slate-600 dark:text-slate-300">
          Scores factor in authentication results and hop count. Aim for 90+ for
          production mailings.
        </p>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Authentication
        </p>
        {#if analysis.authStatuses.length}
          <ul class="mt-3 space-y-3">
            {#each analysis.authStatuses
              .slice()
              .sort(compareSeverity) as status}
              <li
                class="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
              >
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p
                      class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
                    >
                      {status.method}
                    </p>
                    <p
                      class="mt-1 font-semibold text-slate-900 dark:text-slate-100"
                    >
                      {status.description}
                    </p>
                  </div>
                  <span
                    class={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadge(status.result)}`}
                  >
                    {status.result}
                  </span>
                </div>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            No authentication headers detected. Ensure SPF, DKIM, and DMARC are
            configured for your sending domain.
          </p>
        {/if}
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Delivery timeline
        </p>
        {#if analysis.received.length}
          <ol class="mt-4 space-y-4 text-sm">
            {#each analysis.received as hop, index (hop.hop)}
              <li
                class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
              >
                <div class="flex flex-wrap items-center justify-between gap-2">
                  <span
                    class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >
                    Hop {analysis.received.length - index}
                  </span>
                  <span class="text-xs text-slate-500 dark:text-slate-400"
                    >{hop.timestamp || "No timestamp"}</span
                  >
                </div>
                <div class="mt-2 space-y-1 text-slate-700 dark:text-slate-200">
                  <p><span class="font-semibold">From:</span> {hop.from}</p>
                  <p><span class="font-semibold">By:</span> {hop.by}</p>
                  <p>
                    <span class="font-semibold">With:</span>
                    {hop.protocol}
                  </p>
                  {#if hop.recipient}
                    <p>
                      <span class="font-semibold">For:</span>
                      {hop.recipient}
                    </p>
                  {/if}
                </div>
              </li>
            {/each}
          </ol>
        {:else}
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            No Received headers were found. Paste a complete header to inspect
            the routing path.
          </p>
        {/if}
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Warnings & recommendations
        </p>
        {#if analysis.warnings.length}
          <ul class="mt-3 space-y-2 leading-relaxed">
            {#each analysis.warnings as warning}
              <li class="flex gap-2">
                <span
                  class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-amber-500"
                ></span>
                <span>{warning}</span>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            No issues detected. SPF, DKIM, and DMARC all passed, and the
            delivery route looks healthy.
          </p>
        {/if}
      </div>
    </div>
  </div>
</section>
