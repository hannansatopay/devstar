<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import {
    SCREENSHOT_PROVIDERS,
    resolveScreenshotProvider,
  } from "$lib/data/websiteScreenshotProviders";

  let targetUrl = "https://developer.mozilla.org/";
  let previewWidth = 1024;
  let fullPage = true;
  let providerId = SCREENSHOT_PROVIDERS[0].id;
  let provider = SCREENSHOT_PROVIDERS[0];
  $: provider =
    resolveScreenshotProvider(providerId) ?? SCREENSHOT_PROVIDERS[0];

  $: sanitizedUrl = sanitize(targetUrl);
  $: previewSrc = sanitizedUrl
    ? provider.build(sanitizedUrl, previewWidth, fullPage)
    : "";
  let downloading = false;
  let downloadError = "";

  function sanitize(value: string) {
    try {
      const parsed = new URL(
        value.startsWith("http") ? value : `https://${value}`,
      );
      return parsed.toString();
    } catch {
      return "";
    }
  }

  async function downloadScreenshot() {
    if (!previewSrc || !sanitizedUrl) return;
    downloading = true;
    downloadError = "";
    try {
      const params = new URLSearchParams({
        provider: provider.id,
        url: sanitizedUrl,
        width: Math.round(previewWidth).toString(),
        full: fullPage ? "1" : "0",
      });
      const response = await fetch(
        `/api/tools/screenshot?${params.toString()}`,
      );
      if (!response.ok) {
        const message = await extractErrorMessage(response);
        throw new Error(message);
      }
      const blob = await response.blob();
      const extension = extensionFromMime(response.headers.get("content-type"));
      const fileName = `screenshot-${provider.id}.${extension}`;
      const blobUrl = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = fileName;
      anchor.click();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      downloadError =
        (error instanceof Error
          ? error.message
          : "The download could not be completed.") +
        " Opening the provider link instead.";
      window.open(previewSrc, "_blank", "noopener");
    } finally {
      downloading = false;
    }
  }

  async function extractErrorMessage(response: Response) {
    try {
      const data = await response.json();
      if (typeof data?.message === "string") {
        return data.message;
      }
    } catch {
      try {
        const text = await response.text();
        if (text) return text;
      } catch {
        // ignore
      }
    }
    return `Unexpected response (${response.status})`;
  }

  function extensionFromMime(mime: string | null) {
    switch (mime) {
      case "image/jpeg":
        return "jpg";
      case "image/webp":
        return "webp";
      case "image/png":
      default:
        return "png";
    }
  }
</script>

<section class="space-y-6">
  <div
    class="gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
  >
    <div class="space-y-6">
      <div
        class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80"
      >
        <label
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Website URL
        </label>
        <input
          class="mt-3 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={targetUrl}
          placeholder="https://example.com"
        />
        <p class="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          A valid, publicly accessible URL is required. Private networks or
          pages behind authentication cannot be captured.
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <label
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >Provider</label
          >
          <select
            class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={providerId}
          >
            {#each SCREENSHOT_PROVIDERS as option}
              <option value={option.id}>{option.label}</option>
            {/each}
          </select>
        </div>
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <label
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >Width</label
          >
          <input
            class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            type="number"
            min="320"
            max="1920"
            step="10"
            bind:value={previewWidth}
          />
          <label
            class="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <input
              class="h-4 w-4 accent-indigo-600"
              type="checkbox"
              bind:checked={fullPage}
            />
            Capture full page
          </label>
        </div>
      </div>

      <div class="flex flex-wrap gap-3">
        <Copy
          text={previewSrc}
          label="Copy capture URL"
          customClass="!relative !top-auto !right-auto"
        />
        {#if sanitizedUrl}
          <a
            class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700"
            href={previewSrc}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open screenshot
          </a>
          <button
            class="inline-flex items-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300 dark:focus:ring-indigo-900"
            type="button"
            on:click={downloadScreenshot}
            disabled={downloading}
          >
            {downloading ? "Preparing download..." : "Download PNG"}
          </button>
        {/if}
      </div>

      <p class="text-xs text-slate-500 dark:text-slate-400">
        Screenshots are provided by third-party services. Requests are proxied
        through this app to avoid cross-origin download blocks. High-volume
        usage may require an API key or paid plan—always review each provider’s
        terms.
      </p>

      {#if downloadError}
        <p class="text-xs text-amber-600 dark:text-amber-400">
          {downloadError}
        </p>
      {/if}
    </div>

    <div class="space-y-4">
      <div
        class="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        {#if sanitizedUrl}
          <img
            class="w-full rounded-lg border border-white/40 bg-white/60 object-contain shadow-sm dark:border-white/10 dark:bg-white/5"
            src={previewSrc}
            alt={`Screenshot preview of ${sanitizedUrl}`}
            loading="lazy"
          />
        {:else}
          <div
            class="flex h-60 items-center justify-center text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Enter a valid URL to preview
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
