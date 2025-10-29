<script lang="ts">
  import { onDestroy } from "svelte";

  const ACCEPT = "video/*,.mp4,.webm,.mkv,.mov,.avi,.mpeg,.mpg";

  let sourceFile: File | null = null;
  let previewUrl = "";
  let duration = 0;
  let trimStart = 0;
  let trimEnd = 0;
  let targetWidth = 1280;
  let thumbWidth = 640;
  let muted = false;

  let statusVideo = "Upload a video to get started.";
  let statusAudio = "";
  let statusThumbnail = "";

  let exportingVideo = false;
  let exportingAudio = false;
  let exportingThumbnail = false;

  let videoUrl = "";
  let videoSize = "";
  let audioUrl = "";
  let audioSize = "";
  let thumbnailUrl = "";

  let videoElement: HTMLVideoElement;

  function resetPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = "";
    }
  }

  function resetOutputs() {
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
    videoUrl = "";
    videoSize = "";
    audioUrl = "";
    audioSize = "";
    thumbnailUrl = "";
  }

  function handleFile(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    sourceFile = file;
    resetOutputs();
    resetPreview();
    statusAudio = "";
    statusThumbnail = "";
    statusVideo = file
      ? "Video loaded. Adjust the trims and export."
      : "Upload a video to get started.";
    if (input) {
      input.value = "";
    }
    if (file) {
      previewUrl = URL.createObjectURL(file);
      trimStart = 0;
      trimEnd = 0;
      duration = 0;
      setTimeout(() => videoElement?.load(), 0);
    }
  }

  function onLoadedMetadata() {
    duration = videoElement?.duration ?? 0;
    trimStart = 0;
    trimEnd = duration;
  }

  function humanSize(bytes: number) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const idx = Math.min(
      units.length - 1,
      Math.floor(Math.log(bytes) / Math.log(1024)),
    );
    return `${(bytes / Math.pow(1024, idx)).toFixed(idx === 0 ? 0 : 2)} ${units[idx]}`;
  }

  async function perform(action: "video" | "audio" | "thumbnail") {
    if (!sourceFile) {
      if (action === "video") statusVideo = "Select a video first.";
      if (action === "audio") statusAudio = "Select a video first.";
      if (action === "thumbnail") statusThumbnail = "Select a video first.";
      return;
    }

    if (trimEnd <= trimStart) {
      const message = "End time must be greater than start time.";
      if (action === "video") statusVideo = message;
      if (action === "audio") statusAudio = message;
      if (action === "thumbnail") statusThumbnail = message;
      return;
    }

    const params = new URLSearchParams({
      action,
      start: String(trimStart),
      end: String(trimEnd),
    });

    if (action === "video") {
      exportingVideo = true;
      statusVideo = "Exporting clip on the server...";
      params.set("width", String(targetWidth));
      params.set("muted", muted ? "true" : "false");
    } else if (action === "audio") {
      exportingAudio = true;
      statusAudio = "Extracting audio track...";
    } else {
      exportingThumbnail = true;
      statusThumbnail = "Capturing thumbnail frame...";
      params.set("thumbWidth", String(thumbWidth));
    }

    try {
      const headers: Record<string, string> = {
        "X-File-Name": encodeURIComponent(sourceFile.name),
        "Content-Type": sourceFile.type || "application/octet-stream",
      };

      const response = await fetch(`/api/media/video?${params}`, {
        method: "POST",
        headers,
        body: sourceFile,
      });
      if (!response.ok) {
        const details = (await response.text()) || response.statusText;
        throw new Error(details);
      }

      const blob = await response.blob();
      if (action === "video") {
        if (videoUrl) URL.revokeObjectURL(videoUrl);
        videoUrl = URL.createObjectURL(blob);
        videoSize = humanSize(blob.size);
        statusVideo = "Clip ready. Download or preview below.";
      } else if (action === "audio") {
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        audioUrl = URL.createObjectURL(blob);
        audioSize = humanSize(blob.size);
        statusAudio = "Audio extracted successfully.";
      } else {
        if (thumbnailUrl) URL.revokeObjectURL(thumbnailUrl);
        thumbnailUrl = URL.createObjectURL(blob);
        statusThumbnail = "Thumbnail captured.";
      }
    } catch (err) {
      const message = (err as Error).message;
      if (action === "video") statusVideo = `Export failed: ${message}`;
      if (action === "audio")
        statusAudio = `Audio extraction failed: ${message}`;
      if (action === "thumbnail")
        statusThumbnail = `Thumbnail capture failed: ${message}`;
      console.error(err);
    } finally {
      if (action === "video") exportingVideo = false;
      if (action === "audio") exportingAudio = false;
      if (action === "thumbnail") exportingThumbnail = false;
    }
  }

  onDestroy(() => {
    resetOutputs();
    resetPreview();
  });
</script>

<section class="space-y-6">
  <div class="grid gap-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
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

        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-1 font-semibold">
            <span>Trim start (seconds)</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="0"
              step="0.1"
              bind:value={trimStart}
            />
          </label>
          <label class="space-y-1 font-semibold">
            <span>Trim end (seconds)</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="0"
              step="0.1"
              bind:value={trimEnd}
            />
          </label>
        </div>

        <div class="space-y-2">
          <div
            class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Start marker</span>
            <span>{trimStart.toFixed(1)}s</span>
          </div>
          <input
            class="w-full accent-indigo-600"
            type="range"
            min="0"
            max={Math.max(0, duration)}
            step="0.1"
            bind:value={trimStart}
          />
        </div>
        <div class="space-y-2">
          <div
            class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>End marker</span>
            <span>{trimEnd.toFixed(1)}s</span>
          </div>
          <input
            class="w-full accent-indigo-600"
            type="range"
            min="0"
            max={Math.max(0, duration)}
            step="0.1"
            bind:value={trimEnd}
          />
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-1 font-semibold">
            <span>Target width (video)</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="320"
              max="1920"
              step="10"
              bind:value={targetWidth}
            />
          </label>
          <label class="space-y-1 font-semibold">
            <span>Thumbnail width</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="160"
              max="1920"
              step="10"
              bind:value={thumbWidth}
            />
          </label>
        </div>

        <label
          class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <input
            class="h-4 w-4 accent-indigo-600"
            type="checkbox"
            bind:checked={muted}
          />
          Mute audio track
        </label>

        <div class="grid gap-3 md:grid-cols-3">
          <button
            class="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:focus:ring-indigo-700"
            type="button"
            on:click={() => perform("video")}
            disabled={!sourceFile || exportingVideo || trimEnd <= trimStart}
          >
            {exportingVideo ? "Exporting..." : "Export clip"}
          </button>

          <button
            class="inline-flex items-center justify-center rounded-full bg-slate-200 px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-300 disabled:cursor-not-allowed disabled:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:ring-slate-700"
            type="button"
            on:click={() => perform("audio")}
            disabled={!sourceFile || exportingAudio || trimEnd <= trimStart}
          >
            {exportingAudio ? "Extracting..." : "Extract audio"}
          </button>

          <button
            class="inline-flex items-center justify-center rounded-full bg-emerald-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-300 dark:focus:ring-emerald-700"
            type="button"
            on:click={() => perform("thumbnail")}
            disabled={!sourceFile || exportingThumbnail || trimEnd <= trimStart}
          >
            {exportingThumbnail ? "Capturing..." : "Save thumbnail"}
          </button>
        </div>

        <div class="space-y-2 text-xs text-slate-500 dark:text-slate-400">
          <p>{statusVideo}</p>
          {#if statusAudio}<p>{statusAudio}</p>{/if}
          {#if statusThumbnail}<p>{statusThumbnail}</p>{/if}
        </div>
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
            Preview
          </p>
          <!-- svelte-ignore a11y-media-has-caption -->
          <video
            class="mt-3 w-full rounded-xl bg-black"
            bind:this={videoElement}
            src={previewUrl}
            controls
            on:loadedmetadata={onLoadedMetadata}
          ></video>
          <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Duration: {duration.toFixed(1)}s
          </p>
        </div>
      {/if}

      {#if videoUrl}
        <div
          class="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
        >
          <p class="text-xs font-semibold uppercase tracking-wide">
            Edited clip
          </p>
          <!-- svelte-ignore a11y-media-has-caption -->
          <video class="w-full rounded-lg bg-black" src={videoUrl} controls
          ></video>
          <p class="text-xs text-emerald-600 dark:text-emerald-300">
            Size: {videoSize}
          </p>
          <a
            class="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700"
            download="edited-video.mp4"
            href={videoUrl}
          >
            Download video
          </a>
        </div>
      {/if}

      {#if audioUrl}
        <div
          class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Audio excerpt
          </p>
          <audio class="w-full" src={audioUrl} controls></audio>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Size: {audioSize}
          </p>
          <a
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            download="clip-audio.mp3"
            href={audioUrl}
          >
            Download audio
          </a>
        </div>
      {/if}

      {#if thumbnailUrl}
        <div
          class="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Thumbnail
          </p>
          <img
            class="mt-3 w-full rounded-xl border border-slate-200 dark:border-slate-700"
            src={thumbnailUrl}
            alt="Video thumbnail"
          />
          <a
            class="mt-3 inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            download="thumbnail.jpg"
            href={thumbnailUrl}
          >
            Download thumbnail
          </a>
        </div>
      {/if}
    </div>
  </div>
</section>
