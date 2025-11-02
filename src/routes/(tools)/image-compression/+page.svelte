<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  type OutputFormat = "image/jpeg" | "image/webp";

  let fileInput: HTMLInputElement;
  let originalSource = "";
  let originalName = "image";
  let originalSize = 0;
  let originalWidth = 0;
  let originalHeight = 0;

  let compressedSource = "";
  let compressedDataUrl = "";
  let compressedSize = 0;
  let format: OutputFormat = "image/jpeg";
  let quality = 70;

  let loading = false;
  let errorMessage = "";
  let lastSignature = "";

  function handleBrowse() {
    fileInput?.click();
  }

  async function handleFileChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement | null;
    const file = target?.files?.[0];
    if (!file) return;
    loading = true;
    errorMessage = "";

    try {
      originalSource = await readFileAsDataUrl(file);
      originalName = file.name.replace(/\.[^/.]+$/, "") || "image";
      originalSize = file.size;
      const img = await loadImage(originalSource);
      originalWidth = img.width;
      originalHeight = img.height;
      await recompress();
    } catch (error) {
      console.error(error);
      errorMessage = "Unable to read or compress the selected file.";
    } finally {
      loading = false;
      if (target) target.value = "";
    }
  }

  async function recompress() {
    if (!originalSource) return;
    const signature = JSON.stringify({ format, quality });
    lastSignature = signature;
    loading = true;
    errorMessage = "";

    try {
      const img = await loadImage(originalSource);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable");
      ctx.drawImage(img, 0, 0, img.width, img.height);

      const compressionQuality =
        format === "image/jpeg" ? quality / 100 : quality / 100;
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (result) => {
            if (result) resolve(result);
            else reject(new Error("Compression failed"));
          },
          format,
          compressionQuality,
        );
      });
      compressedSource = URL.createObjectURL(blob);
      compressedDataUrl = canvas.toDataURL(format, compressionQuality);
      compressedSize = blob.size;
    } catch (error) {
      console.error(error);
      errorMessage = "Compression failed. Try a different image or format.";
      compressedSource = "";
      compressedDataUrl = "";
      compressedSize = 0;
    } finally {
      loading = false;
    }
  }

  function clearAll() {
    originalSource = "";
    compressedSource = "";
    errorMessage = "";
  }

  function downloadCompressed() {
    if (!compressedSource) return;
    const anchor = document.createElement("a");
    const extension = format === "image/jpeg" ? "jpg" : "webp";
    anchor.href = compressedSource;
    anchor.download = `${originalName}-compressed.${extension}`;
    anchor.click();
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
  }

  function readFileAsDataUrl(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") resolve(reader.result);
        else reject(new Error("Unable to read file"));
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function loadImage(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  $: settingsSignature = JSON.stringify({ format, quality });
  $: if (originalSource && settingsSignature !== lastSignature && !loading) {
    recompress();
  }
</script>

<section class="space-y-6">
  <div class="flex flex-col gap-6 px-4 lg:flex-row">
    <div class="flex flex-1 flex-col gap-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-center gap-3">
          <button
            class="rounded-full border border-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-500 transition hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
            type="button"
            on:click={handleBrowse}
          >
            {originalSource ? "Replace image" : "Upload image"}
          </button>
          {#if originalSource}
            <button
              class="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-500 dark:hover:text-rose-300"
              type="button"
              on:click={clearAll}
            >
              Clear
            </button>
          {/if}
          <input
            class="hidden"
            type="file"
            accept="image/*"
            bind:this={fileInput}
            on:change={handleFileChange}
          />
        </div>

        <div class="mt-6 grid gap-4 md:grid-cols-2">
          <div
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Output format</span>
            <div class="flex gap-2">
              <button
                class={`flex-1 rounded-full border px-3 py-2 text-xs transition ${
                  format === "image/jpeg"
                    ? "border-indigo-500 bg-indigo-100 font-semibold text-indigo-600 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300"
                    : "border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                }`}
                type="button"
                on:click={() => (format = "image/jpeg")}
              >
                JPEG
              </button>
              <button
                class={`flex-1 rounded-full border px-3 py-2 text-xs transition ${
                  format === "image/webp"
                    ? "border-indigo-500 bg-indigo-100 font-semibold text-indigo-600 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300"
                    : "border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                }`}
                type="button"
                on:click={() => (format = "image/webp")}
              >
                WebP
              </button>
            </div>
          </div>

          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Quality {quality}%
            <input
              class="w-full accent-indigo-500"
              type="range"
              min="10"
              max="100"
              step="5"
              bind:value={quality}
            />
          </label>
        </div>

        <div
          class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          Compression happens locally using the Canvas API. WebP offers higher
          compression than JPEG while preserving transparency.
        </div>
      </div>

      {#if errorMessage}
        <div
          class="rounded-2xl border border-rose-200 bg-rose-100/70 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
        >
          {errorMessage}
        </div>
      {/if}
    </div>

    <div class="flex flex-1 flex-col gap-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        {#if !originalSource}
          <div
            class="flex min-h-[360px] flex-col items-center justify-center gap-3 text-center text-sm text-slate-500 dark:text-slate-400"
          >
            Upload an image to see side-by-side comparisons of the original and
            compressed versions.
          </div>
        {:else}
          <div class="grid gap-4 md:grid-cols-2">
            <div
              class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <p
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Original
              </p>
              <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {originalWidth} × {originalHeight} · {formatBytes(originalSize)}
              </p>
              <img
                alt="Original preview"
                class="mt-3 max-h-56 w-full rounded-lg object-contain"
                src={originalSource}
              />
            </div>
            <div
              class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900"
            >
              <div class="flex items-center justify-between">
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Compressed
                </p>
                <Copy
                  text={compressedDataUrl}
                  label="Copy URL"
                  floating={false}
                  customClass="rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300 dark:focus:ring-indigo-900"
                />
              </div>
              {#if loading}
                <div
                  class="mt-12 flex items-center justify-center text-sm text-slate-500 dark:text-slate-400"
                >
                  <span
                    class="h-6 w-6 animate-spin rounded-full border-2 border-slate-400 border-t-indigo-500"
                  ></span>
                </div>
              {:else if compressedSource}
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Output size {formatBytes(compressedSize)} ({compressedSize &&
                  originalSize
                    ? Math.round((compressedSize / originalSize) * 100)
                    : 0}% of original)
                </p>
                <img
                  alt="Compressed preview"
                  class="mt-3 max-h-56 w-full rounded-lg object-contain"
                  src={compressedSource}
                />
                <button
                  class="mt-4 w-full rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-700"
                  type="button"
                  on:click={downloadCompressed}
                >
                  Download compressed file
                </button>
              {:else}
                <div
                  class="mt-12 text-center text-sm text-slate-500 dark:text-slate-400"
                >
                  Compression failed. Try a different format.
                </div>
              {/if}
            </div>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
