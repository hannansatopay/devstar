<script>
  let urlInput = "https://example.com";
  let loading = false;
  let errorMessage = "";
  let metrics = null;

  async function testPerformance() {
    if (!urlInput.trim()) {
      errorMessage = "Enter a URL to test.";
      return;
    }
    loading = true;
    errorMessage = "";
    metrics = null;
    try {
      const timing = await measure(urlInput.trim());
      metrics = timing;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errorMessage = `Unable to run the test (${message}). The site may block requests or be unreachable.`;
    } finally {
      loading = false;
    }
  }

  async function measure(targetUrl) {
    if (typeof performance === "undefined" || typeof fetch === "undefined") {
      throw new Error(
        "Performance APIs are not available in this environment.",
      );
    }
    const requestUrl = `/api/fetch-html?url=${encodeURIComponent(targetUrl)}`;
    const start = performance.now();
    const response = await fetch(requestUrl);
    const bodyStart = performance.now();
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
    const end = performance.now();

    const html = payload?.html ?? "";
    if (!html) {
      throw new Error("Empty response received from the target URL.");
    }
    const baseUrl = payload?.finalUrl ?? targetUrl;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const resources = Array.from(
      doc.querySelectorAll("img,script,link[rel='stylesheet']"),
    );
    const remoteStatus =
      typeof payload?.status === "number" ? payload.status : 0;
    const ok = remoteStatus >= 200 && remoteStatus < 400;

    return {
      status: remoteStatus,
      ok,
      totalTime: end - start,
      responseTime: bodyStart - start,
      contentDownload: end - bodyStart,
      resourceCount: resources.length,
      scripts: resources.filter(
        (node) => node.tagName.toLowerCase() === "script",
      ).length,
      stylesheets: resources.filter(
        (node) => node.tagName.toLowerCase() === "link",
      ).length,
      images: resources.filter((node) => node.tagName.toLowerCase() === "img")
        .length,
      contentLength: html.length,
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
        on:click={testPerformance}
        disabled={loading}
      >
        {loading ? "Testing..." : "Run test"}
      </button>
    </div>
    {#if errorMessage}
      <p class="mt-2 text-xs text-rose-500 dark:text-rose-300">
        {errorMessage}
      </p>
    {/if}
    <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
      Timing uses a simple fetch; results may differ from lab tools like
      Lighthouse. Cross-origin restrictions can block testing.
    </p>
  </div>

  {#if metrics}
    <div
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Performance summary
      </h2>
      <dl class="grid gap-3 text-sm md:grid-cols-2">
        <div
          class="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Status
          </p>
          <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
            {metrics.status}
          </p>
        </div>
        <div
          class="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Total time (ms)
          </p>
          <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
            {metrics.totalTime.toFixed(2)}
          </p>
        </div>
        <div
          class="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Response time (ms)
          </p>
          <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
            {metrics.responseTime.toFixed(2)}
          </p>
        </div>
        <div
          class="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Content download (ms)
          </p>
          <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
            {metrics.contentDownload.toFixed(2)}
          </p>
        </div>
        <div
          class="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Content length
          </p>
          <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
            {metrics.contentLength} bytes
          </p>
        </div>
        <div
          class="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Resources found
          </p>
          <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
            {metrics.resourceCount}
          </p>
        </div>
      </dl>

      <div
        class="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
      >
        <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Resource breakdown
        </h3>
        <ul class="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
          <li>
            Scripts: <span
              class="font-mono text-indigo-700 dark:text-indigo-300"
              >{metrics.scripts}</span
            >
          </li>
          <li>
            Stylesheets: <span
              class="font-mono text-indigo-700 dark:text-indigo-300"
              >{metrics.stylesheets}</span
            >
          </li>
          <li>
            Images: <span class="font-mono text-indigo-700 dark:text-indigo-300"
              >{metrics.images}</span
            >
          </li>
        </ul>
      </div>
    </div>
  {/if}
</section>
