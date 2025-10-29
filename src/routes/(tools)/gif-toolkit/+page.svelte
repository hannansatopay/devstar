<script lang="ts">
  import { onDestroy } from "svelte";

  const ACCEPT = "video/*,.mp4,.webm,.mkv,.mov,.avi";

  let sourceFile: File | null = null;
  let previewUrl = "";
  let gifUrl = "";
  let gifSize = "";
  let status = "Upload a clip to craft a GIF.";
  let generating = false;

  let startAt = 0;
  let duration = 4;
  let width = 480;
  let fps = 12;
  let speed = 1;

  function resetPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = "";
    }
  }

  function resetResult() {
    if (gifUrl) {
      URL.revokeObjectURL(gifUrl);
      gifUrl = "";
    }
    gifSize = "";
  }

  function handleFile(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    sourceFile = file;
    resetResult();
    resetPreview();
    status = file
      ? "Clip loaded. Adjust the settings and render."
      : "Upload a clip to craft a GIF.";
    if (input) {
      input.value = "";
    }
    if (file) {
      previewUrl = URL.createObjectURL(file);
    }
  }

  function humanSize(bytes: number) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB"];
    const idx = Math.min(
      units.length - 1,
      Math.floor(Math.log(bytes) / Math.log(1024)),
    );
    return `${(bytes / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
  }

  async function generate() {
    if (!sourceFile) {
      status = "Select a video file first.";
      return;
    }

    generating = true;
    status = "Rendering GIF on the server...";
    resetResult();

    try {
      const params = new URLSearchParams({
        start: String(startAt),
        duration: String(duration),
        width: String(width),
        fps: String(fps),
        speed: String(speed),
      });
      const headers: Record<string, string> = {
        "X-File-Name": encodeURIComponent(sourceFile.name),
      };
      headers["Content-Type"] = sourceFile.type || "application/octet-stream";

      const response = await fetch(`/api/media/gif?${params}`, {
        method: "POST",
        headers,
        body: sourceFile,
      });
      if (!response.ok) {
        const details = (await response.text()) || response.statusText;
        throw new Error(details);
      }

      const blob = await response.blob();
      gifUrl = URL.createObjectURL(blob);
      gifSize = humanSize(blob.size);
      status = "GIF ready. Download below.";
    } catch (err) {
      console.error(err);
      status = `Unable to render GIF: ${(err as Error).message}`;
    } finally {
      generating = false;
    }
  }

  onDestroy(() => {
    resetPreview();
    resetResult();
  });
</script>

<section class="space-y-6">
  <div class="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
    <div class="space-y-6">
      <div
        class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
      >
        <label class="space-y-2 font-semibold">
          <span>Source video</span>
          <input
            class="w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-indigo-600 dark:hover:bg-slate-900"
            type="file"
            accept={ACCEPT}
            on:change={handleFile}
          />
        </label>

        <div class="grid gap-3 md:grid-cols-2">
          <label class="space-y-1 font-semibold">
            <span>Start at (seconds)</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="0"
              step="0.1"
              bind:value={startAt}
            />
          </label>
          <label class="space-y-1 font-semibold">
            <span>Duration (seconds)</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="0.5"
              max="30"
              step="0.1"
              bind:value={duration}
            />
          </label>
          <label class="space-y-1 font-semibold">
            <span>Output width (px)</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="160"
              max="960"
              step="10"
              bind:value={width}
            />
          </label>
          <label class="space-y-1 font-semibold">
            <span>Frames per second</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="4"
              max="30"
              bind:value={fps}
            />
          </label>
          <label class="space-y-1 font-semibold">
            <span>Speed multiplier</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="0.25"
              max="4"
              step="0.25"
              bind:value={speed}
            />
          </label>
        </div>

        <button
          class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:focus:ring-indigo-700"
          type="button"
          on:click={generate}
          disabled={!sourceFile || generating}
        >
          {generating ? "Generating..." : "Generate GIF"}
        </button>

        <p class="text-xs text-slate-500 dark:text-slate-400">{status}</p>
      </div>
    </div>

    <div class="space-y-6">
      {#if previewUrl}
        <div
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
        >
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Preview video
          </p>
          <!-- svelte-ignore a11y-media-has-caption -->
          <video
            class="mt-3 w-full rounded-xl bg-black"
            src={previewUrl}
            controls
          ></video>
        </div>
      {/if}

      {#if gifUrl}
        <div
          class="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
        >
          <p class="text-xs font-semibold uppercase tracking-wide">
            Rendered GIF
          </p>
          <img
            class="w-full rounded-xl border border-emerald-200 dark:border-emerald-800"
            src={gifUrl}
            alt="Generated GIF preview"
          />
          <p class="text-xs text-emerald-600 dark:text-emerald-300">
            Size: {gifSize}
          </p>
          <a
            class="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700"
            href={gifUrl}
            download="clip.gif"
          >
            Download GIF
          </a>
        </div>
      {/if}
    </div>
  </div>
</section>
