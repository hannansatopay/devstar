<script>
  import { onMount } from "svelte";
  import Copy from "$lib/Copy.svelte";

  const recordTypes = ["A", "AAAA", "CNAME", "MX", "NS", "TXT", "SOA"];
  const endpoint = "https://dns.google/resolve";
  const isBrowser = typeof window !== "undefined";

  const statusMessages = {
    0: "NOERROR – request completed successfully",
    1: "FORMERR – malformed request",
    2: "SERVFAIL – resolver failure",
    3: "NXDOMAIN – name does not exist",
    4: "NOTIMP – unsupported query",
    5: "REFUSED – request refused",
  };

  let domain = "example.com";
  let recordType = "A";
  let loading = false;
  let response = null;
  let answers = [];
  let authority = [];
  let additional = [];
  let errorMessage = "";
  let history = [];
  let showRaw = false;

  onMount(() => {
    runLookup();
  });

  async function runLookup() {
    if (!isBrowser) return;
    const trimmed = domain.trim();
    if (!trimmed) {
      errorMessage = "Enter a domain or subdomain.";
      return;
    }

    loading = true;
    errorMessage = "";
    response = null;
    answers = [];
    authority = [];
    additional = [];

    try {
      const params = new URLSearchParams({
        name: trimmed,
        type: recordType,
        cd: "0",
        do: "1",
      });
      const res = await fetch(`${endpoint}?${params.toString()}`, {
        headers: { accept: "application/dns-json" },
      });
      if (!res.ok) throw new Error(`Resolver returned ${res.status}`);
      const json = await res.json();
      response = json;
      answers = normaliseSection(json.Answer);
      authority = normaliseSection(json.Authority);
      additional = normaliseSection(json.Additional);

      if (json.Status !== 0 && !answers.length) {
        errorMessage =
          json.Comment ||
          statusMessages[json.Status] ||
          "No results were returned for this query.";
      }

      history = [
        {
          id: `${trimmed}_${recordType}_${Date.now()}`,
          domain: trimmed,
          type: recordType,
          status: json.Status,
          timestamp: new Date().toLocaleTimeString(),
          answers,
        },
        ...history,
      ].slice(0, 6);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "Lookup failed.";
    } finally {
      loading = false;
    }
  }

  function normaliseSection(section = []) {
    if (!Array.isArray(section)) return [];
    return section.map((entry) => ({
      name: entry.name,
      ttl: entry.TTL,
      data: entry.data,
      type: typeCodeToName(entry.type),
    }));
  }

  function typeCodeToName(code) {
    const map = {
      1: "A",
      2: "NS",
      5: "CNAME",
      6: "SOA",
      12: "PTR",
      15: "MX",
      16: "TXT",
      28: "AAAA",
    };
    return map[code] ?? code;
  }

  function digCommand() {
    const trimmed = domain.trim();
    return trimmed ? `dig ${trimmed} ${recordType}` : "";
  }

  function exportPayload() {
    if (!response) return "";
    return JSON.stringify(response, null, 2);
  }

  function downloadResults() {
    if (!isBrowser || !response) return;
    const payload = exportPayload();
    if (!payload) return;
    const blob = new Blob([payload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(domain.trim() || "lookup").replace(/[^\w.-]+/g, "_")}-${recordType}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function sectionPayload(section) {
    return section.length ? JSON.stringify(section, null, 2) : "";
  }

  function statusLabel() {
    if (!response) return "No response yet";
    const status = response.Status;
    return statusMessages[status] ?? `Status ${status}`;
  }

  $: summaryBadges = [
    response ? { label: "Response", value: statusLabel() } : null,
    answers.length ? { label: "Answer records", value: answers.length } : null,
    authority.length
      ? { label: "Authority records", value: authority.length }
      : null,
    additional.length
      ? { label: "Additional records", value: additional.length }
      : null,
  ].filter(Boolean);

  $: resolverMeta = response
    ? [
        { label: "Recursion desired", value: response.RD ? "Yes" : "No" },
        { label: "Recursion available", value: response.RA ? "Yes" : "No" },
        { label: "Authenticated data", value: response.AD ? "Yes" : "No" },
        { label: "Checking disabled", value: response.CD ? "Yes" : "No" },
        { label: "Truncated", value: response.TC ? "Yes" : "No" },
      ]
    : [];
</script>

<section class="space-y-6">
  <header class="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
    <article
      class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
    >
      <span
        class="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300"
        >DNS toolkit</span
      >
      <h1 class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
        NS lookup
      </h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Resolve hostnames against Google's public resolver. Inspect answer,
        authority, and additional sections without leaving the browser.
      </p>
      <form
        class="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,200px)]"
        on:submit|preventDefault={runLookup}
      >
        <label
          class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Domain or host</span>
          <input
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            placeholder="example.com"
            bind:value={domain}
          />
        </label>
        <label
          class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Record type</span>
          <select
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={recordType}
          >
            {#each recordTypes as type}
              <option value={type}>{type}</option>
            {/each}
          </select>
        </label>
        <div class="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:focus:ring-indigo-700"
            type="submit"
            disabled={loading}
          >
            {#if loading}
              <span
                class="mr-2 inline-flex h-3 w-3 animate-spin rounded-full border-2 border-white/60 border-t-transparent"
              ></span>
            {/if}
            Run lookup
          </button>
          <button
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            type="button"
            on:click={() => {
              domain = "";
              answers = [];
              authority = [];
              additional = [];
              response = null;
              errorMessage = "";
            }}
          >
            Reset form
          </button>
        </div>
      </form>

      {#if errorMessage}
        <div
          class="mt-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200"
        >
          {errorMessage}
        </div>
      {/if}

      {#if summaryBadges.length}
        <ul class="mt-4 flex flex-wrap gap-2 text-xs">
          {#each summaryBadges as badge}
            <li
              class="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
            >
              {badge.label}:
              <span class="ml-1 font-normal">{badge.value}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </article>

    <aside
      class="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
    >
      {#if digCommand()}
        <Copy text={digCommand()} label="Copy dig command" />
      {/if}
      <p
        class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        Command line
      </p>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Reproduce the query locally with <code
          class="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800"
          >dig</code
        >. Useful for comparing resolver behaviour.
      </p>
      <pre
        class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{digCommand() ||
          "dig <host> <type>"}</pre>
      <div class="mt-4 flex flex-wrap gap-3">
        <button
          class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
          type="button"
          disabled={!response}
          on:click={() => (showRaw = !showRaw)}
        >
          {showRaw ? "Hide raw JSON" : "Show raw JSON"}
        </button>
        <button
          class="inline-flex items-center rounded-full border border-indigo-300 px-4 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed dark:border-indigo-800 dark:text-indigo-200 dark:hover:bg-indigo-900/20 dark:focus:ring-indigo-700"
          type="button"
          disabled={!response}
          on:click={downloadResults}
        >
          Download JSON
        </button>
      </div>
    </aside>
  </header>

  <div class="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.55fr)]">
    <div class="space-y-6">
      <article
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Answer section
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {answers.length} records returned
            </p>
          </div>
          <Copy
            text={sectionPayload(answers)}
            label="Copy answers"
            floating={false}
          />
        </div>
        {#if answers.length}
          <ul class="mt-4 space-y-3 text-sm">
            {#each answers as answer}
              <li
                class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
              >
                <div
                  class="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400"
                >
                  <span
                    class="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
                  >
                    {answer.type}
                  </span>
                  <span class="font-semibold text-slate-600 dark:text-slate-300"
                    >TTL {answer.ttl}</span
                  >
                </div>
                <p
                  class="mt-2 break-words font-mono text-sm text-slate-900 dark:text-slate-100"
                >
                  {answer.data}
                </p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {answer.name}
                </p>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
            {loading
              ? "Querying resolver..."
              : "No answer section returned for this request."}
          </p>
        {/if}
      </article>

      <article
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Authority section
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {authority.length} records returned
            </p>
          </div>
          <Copy
            text={sectionPayload(authority)}
            label="Copy authority"
            floating={false}
          />
        </div>
        {#if authority.length}
          <ul class="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
            {#each authority as record}
              <li
                class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div class="flex justify-between">
                  <span class="font-semibold text-slate-800 dark:text-slate-100"
                    >{record.name}</span
                  >
                  <span class="uppercase text-indigo-600 dark:text-indigo-300"
                    >{record.type}</span
                  >
                </div>
                <p
                  class="mt-1 break-words font-mono text-sm text-slate-900 dark:text-slate-200"
                >
                  {record.data}
                </p>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
            No authority records were returned.
          </p>
        {/if}
      </article>

      <article
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2
              class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Additional section
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {additional.length} records returned
            </p>
          </div>
          <Copy
            text={sectionPayload(additional)}
            label="Copy additional"
            floating={false}
          />
        </div>
        {#if additional.length}
          <ul class="mt-4 space-y-3 text-xs text-slate-600 dark:text-slate-300">
            {#each additional as record}
              <li
                class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <div class="flex justify-between">
                  <span class="font-semibold text-slate-800 dark:text-slate-100"
                    >{record.name}</span
                  >
                  <span class="uppercase text-indigo-600 dark:text-indigo-300"
                    >{record.type}</span
                  >
                </div>
                <p class="mt-1 break-words font-mono text-[12px]">
                  {record.data}
                </p>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
            No additional records available.
          </p>
        {/if}
      </article>

      {#if showRaw && response}
        <div
          class="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <div class="flex flex-wrap items-center justify-between gap-3">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Raw response
            </span>
            <div
              class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400"
            >
              <span>size {(exportPayload().length / 1024).toFixed(1)} KB</span>
              <Copy
                text={exportPayload()}
                label="Copy raw JSON"
                floating={false}
              />
            </div>
          </div>
          <pre
            class="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4 font-mono text-[12px] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">{exportPayload()}</pre>
        </div>
      {/if}
    </div>

    <aside class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Resolver metadata
        </p>
        {#if response}
          <ul class="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            <li
              class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <p
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Status
              </p>
              <p class="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                {statusLabel()}
              </p>
            </li>
            {#each resolverMeta as item}
              <li
                class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
              >
                <p
                  class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  {item.label}
                </p>
                <p
                  class="mt-1 font-semibold text-slate-900 dark:text-slate-100"
                >
                  {item.value}
                </p>
              </li>
            {/each}
          </ul>
          <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Google DNS honours DNSSEC when available. The <span
              class="font-semibold">Authenticated data</span
            > flag indicates validated signatures.
          </p>
        {:else}
          <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Run a lookup to reveal metadata returned by the resolver.
          </p>
        {/if}
      </div>

      {#if history.length}
        <div
          class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
        >
          <div class="flex items-center justify-between gap-3">
            <span
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Recent lookups</span
            >
            <button
              class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
              type="button"
              on:click={() => (history = [])}
            >
              Clear
            </button>
          </div>
          <ul class="mt-3 space-y-3">
            {#each history as item}
              <li
                class="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-indigo-500 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500 dark:hover:bg-slate-900/60"
                on:click={() => {
                  domain = item.domain;
                  recordType = item.type;
                  runLookup();
                }}
              >
                <div
                  class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
                >
                  <span>{item.timestamp}</span>
                  <span class="uppercase text-indigo-600 dark:text-indigo-300"
                    >{item.type}</span
                  >
                </div>
                <p
                  class="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100"
                >
                  {item.domain}
                </p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {item.answers.length} records • {statusMessages[
                    item.status
                  ] ?? `Status ${item.status}`}
                </p>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </aside>
  </div>
</section>
