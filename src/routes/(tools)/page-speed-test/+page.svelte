<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import { browser } from "$app/environment";

  type Metric = {
    label: string;
    value: string;
    description: string;
  };

  let url = "https://example.com";
  let isTesting = false;
  let metrics: Metric[] = [];
  let rawResult: Record<string, unknown> | null = null;
  let error = "";

  $: connectionInfo = browser
    ? navigator.connection ||
      (navigator as any).mozConnection ||
      (navigator as any).webkitConnection
    : null;

  async function runTest() {
    if (!browser) return;
    const target = normalizeUrl(url);
    if (!target) {
      error = "Enter a valid URL (https://example.com).";
      return;
    }
    error = "";
    metrics = [];
    rawResult = null;
    isTesting = true;

    try {
      const response = await fetch("/page-speed-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: target }),
      });

      if (!response.ok) {
        const failure = await response.json().catch(() => null);
        throw new Error(
          failure && typeof failure.message === "string"
            ? failure.message
            : "Unable to measure the provided URL.",
        );
      }

      const payload = (await response.json()) as {
        url: string;
        status: number;
        ok: boolean;
        ttfb: number;
        download: number;
        total: number;
        bytes: number;
      };

      metrics = [
        {
          label: "HTTP status",
          value: `${payload.status} ${payload.ok ? "OK" : "Error"}`,
          description: "Response code returned by the origin server.",
        },
        {
          label: "Time to first byte",
          value: `${payload.ttfb.toFixed(1)} ms`,
          description: "Server response time from request start to first byte.",
        },
        {
          label: "Download time",
          value: `${payload.download.toFixed(1)} ms`,
          description:
            "Time spent downloading the response body from the server proxy.",
        },
        {
          label: "Total duration",
          value: `${payload.total.toFixed(1)} ms`,
          description: "Overall round-trip time for the request and response.",
        },
        {
          label: "Transfer size",
          value: payload.bytes
            ? `${(payload.bytes / 1024).toFixed(1)} KB`
            : "Unknown",
          description: "Measured payload size observed by the server proxy.",
        },
      ];

      rawResult = { ...payload, checkedAt: new Date().toISOString() };
    } catch (cause) {
      console.error(cause);
      error =
        cause instanceof Error
          ? cause.message
          : "Unable to run the page speed test.";
    } finally {
      isTesting = false;
    }
  }

  function normalizeUrl(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    try {
      return new URL(`https://${trimmed}`).toString();
    } catch {
      return "";
    }
  }
</script>

<section class="space-y-6">
  <div
    class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
  >
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Target URL
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          We perform a simple cross-origin fetch and record response timings.
        </p>
      </div>
      <Copy text={normalizeUrl(url)} label="Copy URL" floating={false} />
    </div>
    <label
      class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
    >
      <span>URL</span>
      <input
        class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
        type="url"
        bind:value={url}
        placeholder="https://example.com"
      />
    </label>
    <button
      type="button"
      class="inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
      on:click={runTest}
      disabled={isTesting}
    >
      {isTesting ? "Testingâ€¦" : "Run test"}
    </button>
    {#if error}
      <p
        class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
      >
        {error}
      </p>
    {/if}
  </div>

  <div class="grid gap-6 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)]">
    <div
      class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
    >
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
        Connection info
      </h2>
      {#if connectionInfo}
        <ul class="space-y-2 text-sm text-slate-600 dark:text-slate-300">
          <li>
            Effective type: <span class="font-semibold"
              >{connectionInfo.effectiveType}</span
            >
          </li>
          <li>
            Downlink: <span class="font-semibold"
              >{connectionInfo.downlink} Mbps</span
            >
          </li>
          <li>
            RTT: <span class="font-semibold">{connectionInfo.rtt} ms</span>
          </li>
          <li>
            Save data: <span class="font-semibold"
              >{connectionInfo.saveData ? "On" : "Off"}</span
            >
          </li>
        </ul>
      {:else}
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Connection API not supported in this browser.
        </p>
      {/if}
    </div>

    <div
      class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Results
        </h2>
        {#if rawResult}
          <Copy
            text={JSON.stringify(rawResult, null, 2)}
            label="Copy JSON"
            floating={false}
          />
        {/if}
      </div>
      {#if isTesting}
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Measuring performanceâ€¦ (This may take a few seconds.)
        </p>
      {:else if metrics.length === 0}
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Run a test to see timings and transfer size.
        </p>
      {:else}
        <div class="grid gap-4 sm:grid-cols-2">
          {#each metrics as metric}
            <div
              class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
            >
              <p
                class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500"
              >
                {metric.label}
              </p>
              <p
                class="mt-2 text-lg font-semibold text-slate-900 dark:text-white"
              >
                {metric.value}
              </p>
              <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                {metric.description}
              </p>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</section>
