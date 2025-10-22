<script>
  const limit = 40;
  let urlInput = "https://example.com";
  let loading = false;
  let errorMessage = "";
  let results = [];
  let summary = null;
  let checked = 0;

  async function checkLinks() {
    if (!urlInput.trim()) {
      errorMessage = "Enter a URL to scan.";
      return;
    }
    loading = true;
    errorMessage = "";
    results = [];
    summary = null;
    checked = 0;
    try {
      const targetUrl = urlInput.trim();
      const response = await fetch(
        `/api/fetch-html?url=${encodeURIComponent(targetUrl)}`,
      );
      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const payload = await response.json();
          message = payload?.message ?? payload?.error ?? message;
        } catch (parseError) {
          /* ignore */
        }
        throw new Error(message);
      }
      const payload = await response.json();
      const html = payload?.html ?? "";
      if (!html) {
        throw new Error("Empty response received from the target URL.");
      }
      const baseUrl = payload?.finalUrl ?? targetUrl;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const links = Array.from(doc.querySelectorAll("a[href]"))
        .map((anchor) => toAbsolute(anchor.getAttribute("href") ?? "", baseUrl))
        .filter((href) => /^https?:/i.test(href));
      const unique = Array.from(new Set(links)).slice(0, limit);
      const checks = [];
      for (const href of unique) {
        const result = await inspectLink(href);
        checks.push(result);
        checked = checks.length;
      }
      results = checks;
      summary = buildSummary(checks, unique.length, links.length);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errorMessage = `Unable to scan links (${message}). The site may block requests or be unreachable.`;
    } finally {
      loading = false;
    }
  }

  function toAbsolute(href, base) {
    try {
      return new URL(href, base).href;
    } catch (error) {
      return href;
    }
  }

  async function inspectLink(href) {
    try {
      const response = await fetch(
        `/api/check-link?url=${encodeURIComponent(href)}`,
      );
      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const payload = await response.json();
          message = payload?.message ?? payload?.error ?? message;
        } catch (parseError) {
          /* ignore */
        }
        return { href, status: "N/A", ok: false, message };
      }
      const payload = await response.json();
      const status =
        typeof payload?.status === "number"
          ? payload.status
          : Number(payload?.status);
      const resolvedStatus = Number.isFinite(status) ? Number(status) : "N/A";
      const statusText = payload?.statusText || "";
      if (typeof resolvedStatus === "number") {
        const ok = resolvedStatus >= 200 && resolvedStatus < 300;
        const warn = resolvedStatus >= 300 && resolvedStatus < 400;
        return {
          href,
          status: resolvedStatus,
          ok: ok || warn,
          message: statusText || (ok ? "OK" : warn ? "Redirect" : "Error"),
        };
      }
      return {
        href,
        status: "N/A",
        ok: false,
        message: statusText || "Unknown status",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return { href, status: "N/A", ok: false, message };
    }
  }

  function buildSummary(checks, scannedCount, totalCount) {
    const ok = checks.filter(
      (item) => item.ok && typeof item.status === "number" && item.status < 300,
    ).length;
    const warnings = checks.filter(
      (item) => item.status === 301 || item.status === 302,
    ).length;
    const broken = checks.filter(
      (item) => !item.ok && item.status !== 301 && item.status !== 302,
    ).length;
    return {
      ok,
      broken,
      warnings,
      scannedCount,
      totalCount,
    };
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="flex flex-col gap-3 md:flex-row">
      <input
        class="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
        bind:value={urlInput}
        placeholder="https://www.yourdomain.com"
      />
      <button
        class="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
        on:click={checkLinks}
        disabled={loading}
      >
        {loading ? `Checking ${checked}/${limit}` : "Check for broken links"}
      </button>
    </div>
    {#if errorMessage}
      <p class="mt-2 text-xs text-rose-500 dark:text-rose-300">
        {errorMessage}
      </p>
    {/if}
    <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
      Up to {limit} unique HTTP links are scanned using HEAD requests. Cross-origin
      restrictions may limit accuracy.
    </p>
  </div>

  {#if summary}
    <div class="grid gap-6 lg:grid-cols-2">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Summary
        </h2>
        <dl class="mt-3 grid gap-3 text-sm md:grid-cols-2">
          <div
            class="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 dark:border-emerald-900 dark:bg-emerald-950/70"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
            >
              Healthy
            </p>
            <p class="text-lg font-bold text-emerald-700 dark:text-emerald-300">
              {summary.ok}
            </p>
          </div>
          <div
            class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 dark:border-rose-900 dark:bg-rose-950/70"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300"
            >
              Broken
            </p>
            <p class="text-lg font-bold text-rose-700 dark:text-rose-300">
              {summary.broken}
            </p>
          </div>
          <div
            class="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 dark:border-amber-900 dark:bg-amber-950/70"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-300"
            >
              Redirects
            </p>
            <p class="text-lg font-bold text-amber-700 dark:text-amber-300">
              {summary.warnings}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Links scanned
            </p>
            <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {summary.scannedCount} / {summary.totalCount}
            </p>
          </div>
        </dl>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Link status
        </h2>
        <div
          class="mt-3 max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <table
            class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800"
          >
            <thead class="bg-slate-100 dark:bg-slate-800">
              <tr>
                <th
                  class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
                  >URL</th
                >
                <th
                  class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
                  >Status</th
                >
                <th
                  class="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
                  >Message</th
                >
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              {#each results as link}
                <tr
                  class="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900 dark:even:bg-slate-900/70"
                >
                  <td class="px-4 py-2">
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      class="break-all text-indigo-600 hover:underline dark:text-indigo-300"
                      >{link.href}</a
                    >
                  </td>
                  <td
                    class="px-4 py-2 font-mono text-sm"
                    class:text-emerald-600={link.ok}
                    class:text-rose-600={!link.ok &&
                      link.status !== 301 &&
                      link.status !== 302}
                    class:text-amber-600={link.status === 301 ||
                      link.status === 302}
                  >
                    {link.status}
                  </td>
                  <td class="px-4 py-2 text-slate-600 dark:text-slate-300"
                    >{link.message}</td
                  >
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
        <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Statuses marked "N/A" indicate the link could not be requested due to
          network or CORS limitations.
        </p>
      </div>
    </div>
  {/if}
</section>
