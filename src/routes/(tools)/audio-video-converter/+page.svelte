<script lang="ts">
  import { onDestroy } from "svelte";

  const formats = [
    { label: "MP3 · Audio", value: "mp3" },
    { label: "WAV · Audio", value: "wav" },
    { label: "OGG · Audio", value: "ogg" },
    { label: "MP4 · Video", value: "mp4" },
    { label: "WEBM · Video", value: "webm" },
    { label: "MKV · Video", value: "mkv" },
    { label: "GIF · Animation", value: "gif" },
  ];

  const ACCEPT =
    "audio/*,video/*,image/gif,.mkv,.avi,.mov,.flv,.wmv,.m4a,.m4v,.aac,.flac,.mpg,.mpeg,.3gp";

  let sourceFile: File | null = null;
  let targetFormat = "mp3";
  let status = "Waiting for a file...";
  let converting = false;

  let previewUrl = "";
  let previewType: "video" | "audio" | null = null;

  let outputUrl = "";
  let outputName = "";
  let outputSize = "";

  function resetPreview() {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = "";
    }
    previewType = null;
  }

  function resetOutput() {
    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
    }
    outputUrl = "";
    outputName = "";
    outputSize = "";
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

  function handleFile(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    sourceFile = file;
    resetOutput();
    resetPreview();
    status = file ? "Ready to convert." : "Waiting for a file...";
    if (input) {
      input.value = "";
    }
    if (file) {
      const type = file.type;
      if (type.startsWith("video")) {
        previewUrl = URL.createObjectURL(file);
        previewType = "video";
      } else if (type.startsWith("audio")) {
        previewUrl = URL.createObjectURL(file);
        previewType = "audio";
      }
    }
  }

  async function convert() {
    if (!sourceFile) {
      status = "Select a file first.";
      return;
    }

    converting = true;
    status = "Uploading for conversion...";
    resetOutput();

    try {
      const params = new URLSearchParams({ target: targetFormat });
      const headers: Record<string, string> = {
        "X-File-Name": encodeURIComponent(sourceFile.name),
      };
      headers["Content-Type"] = sourceFile.type || "application/octet-stream";

      const response = await fetch(`/api/media/convert?${params}`, {
        method: "POST",
        headers,
        body: sourceFile,
      });

      if (!response.ok) {
        const details = (await response.text()) || response.statusText;
        throw new Error(details);
      }

      const blob = await response.blob();
      outputUrl = URL.createObjectURL(blob);
      const base = sourceFile.name.replace(/\.[^/.]+$/, "") || "converted";
      outputName = `${base}.${targetFormat}`;
      outputSize = humanSize(blob.size);
      status = "Conversion complete.";
    } catch (err) {
      console.error(err);
      status = `Conversion failed: ${(err as Error).message}`;
    } finally {
      converting = false;
    }
  }

  onDestroy(() => {
    resetOutput();
    resetPreview();
  });
</script>

<section class="space-y-6">
  <div class="grid gap-6 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
    <div
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
    >
      <label
        class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        <span>Choose a media file</span>
        <input
          class="mt-2 w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-indigo-600 dark:hover:bg-slate-900"
          type="file"
          accept={ACCEPT}
          on:change={handleFile}
        />
      </label>

      <label
        class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        <span>Convert to</span>
        <select
          class="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={targetFormat}
        >
          {#each formats as format}
            <option value={format.value}>{format.label}</option>
          {/each}
        </select>
      </label>

      <button
        class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:focus:ring-indigo-700"
        type="button"
        on:click={convert}
        disabled={!sourceFile || converting}
      >
        {converting ? "Converting..." : "Convert media"}
      </button>

      <p class="text-xs text-slate-500 dark:text-slate-400">{status}</p>
    </div>

    <div class="space-y-4">
      {#if previewUrl && previewType === "video"}
        <div
          class="rounded-2xl border border-slate-200 bg-black/70 p-3 shadow-sm dark:border-slate-800"
        >
          <!-- svelte-ignore a11y-media-has-caption -->
          <video class="w-full rounded-xl" src={previewUrl} controls></video>
        </div>
      {:else if previewUrl && previewType === "audio"}
        <div
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Audio preview
          </p>
          <audio class="mt-3 w-full" src={previewUrl} controls></audio>
        </div>
      {/if}

      {#if outputUrl}
        <div
          class="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
        >
          <p class="text-xs font-semibold uppercase tracking-wide">
            Converted file
          </p>
          <p>{outputName} · {outputSize}</p>
          <a
            class="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700"
            href={outputUrl}
            download={outputName}
          >
            Download
          </a>
        </div>
      {/if}
    </div>
  </div>
</section>
