<script>
  import { browser } from "$app/environment";

  let isTesting = false;
  let statusMessage = "Ready to test your connection.";
  let currentResult = {
    timestamp: null,
    latency: null,
    download: null,
    upload: null,
    issues: [],
  };
  let history = [];
  let issues = [];

  let payloadSize = 5; // MiB
  let iterations = 3;

  let supportsTiming = false;
  if (browser && typeof performance !== "undefined") {
    supportsTiming = true;
  }

  const downloadEndpoint = "https://speed.cloudflare.com/__down";
  const uploadEndpoint = "https://speed.cloudflare.com/__upload";
  const latencyEndpoint = "https://cloudflare.com/cdn-cgi/trace";

  function formatSpeed(mbps) {
    if (!Number.isFinite(mbps)) return "—";
    if (mbps >= 1000) {
      return `${(mbps / 1000).toFixed(2)} Gbps`;
    }
    return `${mbps.toFixed(2)} Mbps`;
  }

  function formatDuration(seconds) {
    if (!Number.isFinite(seconds)) return "—";
    if (seconds < 1) {
      return `${(seconds * 1000).toFixed(0)} ms`;
    }
    return `${seconds.toFixed(2)} s`;
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes)) return "—";
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`;
    }
    if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(2)} KiB`;
    }
    return `${bytes} B`;
  }

  function recordHistory(entry) {
    history = [entry, ...history].slice(0, 5);
  }

  async function runFullTest() {
    if (!browser) return;
    isTesting = true;
    issues = [];
    const session = {
      timestamp: new Date(),
      latency: null,
      download: null,
      upload: null,
      issues: [],
    };

    try {
      statusMessage = "Measuring latency…";
      session.latency = await measureLatency(iterations);
    } catch (error) {
      const message = normaliseError("latency", error);
      session.issues.push(message);
      issues = [...session.issues];
    }

    try {
      statusMessage = "Measuring download speed…";
      session.download = await measureDownload(payloadSize);
    } catch (error) {
      const message = normaliseError("download", error);
      session.issues.push(message);
      issues = [...session.issues];
    }

    try {
      statusMessage = "Measuring upload speed…";
      session.upload = await measureUpload(payloadSize / 2);
    } catch (error) {
      const message = normaliseError("upload", error);
      session.issues.push(message);
      issues = [...session.issues];
    }

    statusMessage = session.issues.length
      ? "Test finished with warnings."
      : "All tests completed successfully.";
    currentResult = session;
    recordHistory(session);
    isTesting = false;
  }

  function normaliseError(stage, error) {
    const label = stage.charAt(0).toUpperCase() + stage.slice(1);
    if (error instanceof Error && error.message) {
      return `${label} test failed: ${error.message}`;
    }
    if (typeof error === "string") {
      return `${label} test failed: ${error}`;
    }
    return `${label} test failed due to an unknown error.`;
  }

  async function measureLatency(count) {
    if (!supportsTiming) {
      throw new Error("High-resolution timing is unavailable.");
    }
    const samples = [];
    for (
      let index = 0;
      index < Math.max(1, Math.min(5, Math.round(count)));
      index += 1
    ) {
      const start = performance.now();
      const url = `${latencyEndpoint}?run=${Date.now()}-${index}`;
      const response = await fetch(url, { cache: "no-store", mode: "cors" });
      await response.text();
      const end = performance.now();
      samples.push(end - start);
    }
    samples.sort((a, b) => a - b);
    const average =
      samples.reduce((sum, value) => sum + value, 0) / samples.length;
    return {
      average,
      min: samples[0],
      max: samples[samples.length - 1],
      samples,
    };
  }

  async function measureDownload(sizeInMiB) {
    if (!supportsTiming) {
      throw new Error("High-resolution timing is unavailable.");
    }
    const bytes = Math.max(1, Math.round(sizeInMiB * 1024 * 1024));
    const url = `${downloadEndpoint}?bytes=${bytes}&cache-bust=${Date.now()}`;
    const start = performance.now();
    const response = await fetch(url, { cache: "no-store", mode: "cors" });
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }

    let received = 0;
    if (response.body?.getReader) {
      const reader = response.body.getReader();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        received += value?.length ?? 0;
      }
    } else {
      const buffer = await response.arrayBuffer();
      received = buffer.byteLength;
    }
    const end = performance.now();
    const durationSeconds = (end - start) / 1000;
    const effectiveBytes = received || bytes;
    const mbps = (effectiveBytes * 8) / (durationSeconds * 1_000_000);
    return {
      mbps,
      duration: durationSeconds,
      bytes: effectiveBytes,
    };
  }

  async function measureUpload(sizeInMiB) {
    if (!supportsTiming) {
      throw new Error("High-resolution timing is unavailable.");
    }
    const bytes = Math.max(256 * 1024, Math.round(sizeInMiB * 1024 * 1024));
    const payload = new Uint8Array(bytes);
    if (browser && window.crypto?.getRandomValues) {
      const chunkSize = 65_536;
      for (let offset = 0; offset < payload.length; offset += chunkSize) {
        const slice = payload.subarray(
          offset,
          Math.min(offset + chunkSize, payload.length),
        );
        window.crypto.getRandomValues(slice);
      }
    } else {
      for (let index = 0; index < payload.length; index += 1) {
        payload[index] = Math.floor(Math.random() * 256);
      }
    }
    const start = performance.now();
    const response = await fetch(`${uploadEndpoint}?cache-bust=${Date.now()}`, {
      method: "POST",
      mode: "cors",
      body: payload,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
    if (!response.ok) {
      throw new Error(`Server responded with ${response.status}`);
    }
    await response.text();
    const end = performance.now();
    const durationSeconds = (end - start) / 1000;
    const mbps = (bytes * 8) / (durationSeconds * 1_000_000);
    return {
      mbps,
      duration: durationSeconds,
      bytes,
    };
  }
</script>

<section class="space-y-6">
  <div
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Internet speed test
        </p>
        <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
          Measure latency, download, and upload directly in your browser
        </h2>
      </div>
      <span
        class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
      >
        {statusMessage}
      </span>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <label
        class="flex flex-col gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        Download payload size (MiB)
        <input
          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          type="number"
          min="1"
          max="50"
          step="1"
          bind:value={payloadSize}
        />
      </label>
      <label
        class="flex flex-col gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        Latency samples
        <input
          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          type="number"
          min="1"
          max="5"
          step="1"
          bind:value={iterations}
        />
      </label>
    </div>

    <div class="mt-6 flex flex-wrap items-center gap-3">
      <button
        class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:focus:ring-indigo-700"
        type="button"
        on:click={runFullTest}
        disabled={isTesting || !browser}
      >
        {#if isTesting}
          <span
            class="mr-2 inline-flex h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
          ></span>
        {/if}
        Run full test
      </button>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Tests use Cloudflare's public endpoints. Results may vary with VPNs,
        firewalls, or ad blockers.
      </p>
    </div>
  </div>

  <div class="grid gap-6 md:grid-cols-2">
    <div class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Latency
        </p>
        {#if currentResult.latency}
          <div class="mt-3 space-y-1">
            <p
              class="text-3xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {formatDuration(currentResult.latency.average / 1000)}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {formatDuration(currentResult.latency.min / 1000)} min · {formatDuration(
                currentResult.latency.max / 1000,
              )} max
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Samples: {currentResult.latency.samples
                .map((sample) => `${Math.round(sample)} ms`)
                .join(", ")}
            </p>
          </div>
        {:else}
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Run the test to measure round-trip time to Cloudflare.
          </p>
        {/if}
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Download
        </p>
        {#if currentResult.download}
          <div class="mt-3 space-y-1">
            <p
              class="text-3xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {formatSpeed(currentResult.download.mbps)}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Payload: {formatBytes(currentResult.download.bytes)} · Duration:
              {formatDuration(currentResult.download.duration)}
            </p>
          </div>
        {:else}
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Download results will appear after a test completes.
          </p>
        {/if}
      </div>
    </div>

    <div class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Upload
        </p>
        {#if currentResult.upload}
          <div class="mt-3 space-y-1">
            <p
              class="text-3xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {formatSpeed(currentResult.upload.mbps)}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Payload: {formatBytes(currentResult.upload.bytes)} · Duration: {formatDuration(
                currentResult.upload.duration,
              )}
            </p>
          </div>
        {:else}
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Upload results will appear after a test completes.
          </p>
        {/if}
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Session history
        </p>
        {#if history.length}
          <ul class="mt-3 space-y-3">
            {#each history as item}
              <li
                class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
              >
                <div
                  class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
                >
                  <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  <span
                    >{item.issues.length
                      ? `${item.issues.length} warning(s)`
                      : "OK"}</span
                  >
                </div>
                <div
                  class="mt-2 grid gap-2 text-xs text-slate-600 dark:text-slate-300"
                >
                  <span
                    >Latency: {item.latency
                      ? formatDuration(item.latency.average / 1000)
                      : "—"}</span
                  >
                  <span
                    >Download: {item.download
                      ? formatSpeed(item.download.mbps)
                      : "—"}</span
                  >
                  <span
                    >Upload: {item.upload
                      ? formatSpeed(item.upload.mbps)
                      : "—"}</span
                  >
                </div>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Results are stored locally for this session. Run a test to populate
            history.
          </p>
        {/if}
      </div>
    </div>
  </div>

  <div
    class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
  >
    <p
      class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
    >
      Troubleshooting
    </p>
    <ul class="mt-3 space-y-2 leading-relaxed">
      <li class="flex gap-2">
        <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-amber-500"
        ></span>
        <span
          >Firewalls or VPNs may block the test endpoints. Temporarily disable
          them or add an allow rule.</span
        >
      </li>
      <li class="flex gap-2">
        <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-amber-500"
        ></span>
        <span
          >For the most accurate upload measurement, keep the browser tab active
          until the test completes.</span
        >
      </li>
      <li class="flex gap-2">
        <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-amber-500"
        ></span>
        <span
          >Use wired connections to eliminate Wi-Fi noise. Repeat the test at
          different times for baseline metrics.</span
        >
      </li>
    </ul>

    {#if issues.length}
      <div
        class="mt-4 rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200"
      >
        <p class="font-semibold">Latest warnings</p>
        <ul class="mt-1 space-y-1">
          {#each issues as issue}
            <li>{issue}</li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</section>
