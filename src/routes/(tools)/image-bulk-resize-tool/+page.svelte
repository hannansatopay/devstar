<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  type ResizeMode = "fit" | "stretch";
  type ImageFormat = "image/png" | "image/jpeg";

  type Item = {
    id: string;
    name: string;
    originalUrl: string;
    originalWidth: number;
    originalHeight: number;
    originalSize: number;
    resizedUrl: string;
    resizedWidth: number;
    resizedHeight: number;
    resizedSize: number;
  };

  let fileInput: HTMLInputElement;
  let items: Item[] = [];
  let loading = false;
  let errorMessage = "";

  let targetWidth = 512;
  let targetHeight = 512;
  let mode: ResizeMode = "fit";
  let format: ImageFormat = "image/png";
  let quality = 80;
  let lastAppliedSignature = "";

  function handleBrowse() {
    fileInput?.click();
  }

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files);
    if (list.length === 0) return;

    loading = true;
    errorMessage = "";

    try {
      const newItems: Item[] = [];
      for (const file of list) {
        const originalUrl = await readFileAsDataUrl(file);
        const image = await loadImage(originalUrl);
        const resized = await resizeImage(image, {
          width: targetWidth,
          height: targetHeight,
          mode,
          format,
          quality: quality / 100,
        });

        newItems.push({
          id: createId(),
          name: file.name.replace(/\.[^/.]+$/, "") || "image",
          originalUrl,
          originalWidth: image.width,
          originalHeight: image.height,
          originalSize: file.size,
          resizedUrl: resized.dataUrl,
          resizedWidth: resized.width,
          resizedHeight: resized.height,
          resizedSize: resized.blob.size,
        });
      }

      items = [...items, ...newItems];
    } catch (error) {
      console.error(error);
      errorMessage =
        "One or more files could not be processed. Try using standard PNG or JPEG images.";
    } finally {
      loading = false;
    }
  }

  async function reprocessAll() {
    if (items.length === 0) return;
    loading = true;
    errorMessage = "";

    try {
      const updated: Item[] = [];
      for (const item of items) {
        const image = await loadImage(item.originalUrl);
        const resized = await resizeImage(image, {
          width: targetWidth,
          height: targetHeight,
          mode,
          format,
          quality: quality / 100,
        });

        updated.push({
          ...item,
          resizedUrl: resized.dataUrl,
          resizedWidth: resized.width,
          resizedHeight: resized.height,
          resizedSize: resized.blob.size,
        });
      }
      items = updated;
    } catch (error) {
      console.error(error);
      errorMessage = "Unable to reprocess the images with the new settings.";
    } finally {
      loading = false;
    }
  }

  function handleFileChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement | null;
    const files = target?.files;
    if (files) {
      handleFiles(files);
      target.value = "";
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    const files = event.dataTransfer?.files;
    if (files && files.length) {
      handleFiles(files);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  function removeItem(id: string) {
    items = items.filter((item) => item.id !== id);
  }

  function downloadItem(item: Item) {
    const anchor = document.createElement("a");
    anchor.href = item.resizedUrl;
    const extension = format === "image/png" ? "png" : "jpg";
    anchor.download = `${item.name}-${item.resizedWidth}x${item.resizedHeight}.${extension}`;
    anchor.click();
  }

  async function resizeImage(
    image: HTMLImageElement,
    options: {
      width: number;
      height: number;
      mode: ResizeMode;
      format: ImageFormat;
      quality: number;
    },
  ) {
    const { width, height } = computeTargetDimensions(
      image,
      options.width,
      options.height,
      options.mode,
    );
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable.");
    ctx.drawImage(image, 0, 0, width, height);

    const quality =
      options.format === "image/jpeg" ? options.quality : undefined;

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (result) => {
          if (result) resolve(result);
          else reject(new Error("Unable to encode image."));
        },
        options.format,
        quality,
      );
    });

    const dataUrl = canvas.toDataURL(options.format, quality);
    return { dataUrl, blob, width, height };
  }

  function computeTargetDimensions(
    image: HTMLImageElement,
    targetW: number,
    targetH: number,
    mode: ResizeMode,
  ) {
    if (mode === "stretch" || image.width === 0 || image.height === 0) {
      return { width: targetW, height: targetH };
    }
    const ratio = Math.min(targetW / image.width, targetH / image.height);
    return {
      width: Math.round(image.width * ratio),
      height: Math.round(image.height * ratio),
    };
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
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B";
    const sizes = ["B", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const value = bytes / Math.pow(1024, i);
    return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${sizes[i]}`;
  }

  function createId() {
    if (
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
    ) {
      return crypto.randomUUID();
    }
    return Math.random().toString(36).slice(2, 9);
  }

  $: settingsSignature = JSON.stringify({
    targetWidth,
    targetHeight,
    mode,
    format,
    quality: format === "image/jpeg" ? quality : 100,
  });
  $: if (
    items.length &&
    !loading &&
    settingsSignature !== lastAppliedSignature
  ) {
    lastAppliedSignature = settingsSignature;
    reprocessAll();
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 md:grid-cols-[minmax(0,0.45fr)_minmax(0,1.55fr)]">
    <div class="space-y-6">
      <div
        class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 shadow-sm transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900/80"
        on:dragover={handleDragOver}
        on:drop={handleDrop}
      >
        <div
          class="flex flex-col items-center justify-center gap-4 text-center"
        >
          <p
            class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
          >
            Drag & drop images or
            <button
              class="text-indigo-500 underline decoration-dotted decoration-indigo-400"
              type="button"
              on:click={handleBrowse}
            >
              browse files
            </button>
          </p>
          <p class="max-w-xl text-xs text-slate-500 dark:text-slate-400">
            Supported formats: PNG, JPG, WebP, GIF. Files are processed entirely
            in the browser.
          </p>
          <input
            class="hidden"
            type="file"
            accept="image/*"
            multiple
            bind:this={fileInput}
            on:change={handleFileChange}
          />
        </div>
      </div>
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Resize settings
        </p>
        <div class="mt-4 space-y-4">
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Target width (px)
            <input
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="32"
              max="4000"
              bind:value={targetWidth}
            />
          </label>
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Target height (px)
            <input
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="32"
              max="4000"
              bind:value={targetHeight}
            />
          </label>
          <div
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Resize mode
            <div class="flex gap-2">
              <button
                class={`flex-1 rounded-full border px-3 py-2 text-xs transition ${
                  mode === "fit"
                    ? "border-indigo-500 bg-indigo-100 font-semibold text-indigo-600 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300"
                    : "border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                }`}
                type="button"
                on:click={() => (mode = "fit")}
              >
                Fit (keep ratio)
              </button>
              <button
                class={`flex-1 rounded-full border px-3 py-2 text-xs transition ${
                  mode === "stretch"
                    ? "border-indigo-500 bg-indigo-100 font-semibold text-indigo-600 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300"
                    : "border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                }`}
                type="button"
                on:click={() => (mode = "stretch")}
              >
                Stretch
              </button>
            </div>
          </div>
          <div
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Output format
            <div class="flex gap-2">
              <button
                class={`flex-1 rounded-full border px-3 py-2 text-xs transition ${
                  format === "image/png"
                    ? "border-indigo-500 bg-indigo-100 font-semibold text-indigo-600 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300"
                    : "border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                }`}
                type="button"
                on:click={() => (format = "image/png")}
              >
                PNG
              </button>
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
            </div>
          </div>
          {#if format === "image/jpeg"}
            <label
              class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              JPEG quality {quality}%
              <input
                class="w-full accent-indigo-500"
                type="range"
                min="30"
                max="100"
                step="5"
                bind:value={quality}
              />
            </label>
          {/if}
        </div>
      </div>
      {#if loading}
        <div
          class="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
        >
          Preparing resized images…
        </div>
      {/if}
      {#if errorMessage}
        <div
          class="rounded-3xl border border-rose-200 bg-rose-100/70 p-4 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
        >
          {errorMessage}
        </div>
      {/if}
    </div>

    <div
      class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      {#if items.length === 0}
        <div
          class="flex min-h-[320px] flex-col items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400"
        >
          Upload images to generate a resized batch. You can adjust the settings
          at any time, and all items will update instantly.
        </div>
      {:else}
        <div class="grid gap-4 lg:grid-cols-2">
          {#each items as item}
            <div
              class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <p
                  class="text-sm font-semibold text-slate-600 dark:text-slate-200"
                >
                  {item.name}
                </p>
                <div
                  class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
                >
                  <span
                    >Original {item.originalWidth} × {item.originalHeight}</span
                  >
                  <span>({formatBytes(item.originalSize)})</span>
                  <span class="text-slate-400 dark:text-slate-500">→</span>
                  <span>Resized {item.resizedWidth} × {item.resizedHeight}</span
                  >
                  <span>({formatBytes(item.resizedSize)})</span>
                </div>
              </div>
              <div class="grid gap-4">
                <div
                  class="rounded-xl border border-slate-200 bg-white/90 p-4 shadow-inner dark:border-slate-600 dark:bg-slate-900"
                >
                  <p
                    class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >
                    Preview
                  </p>
                  <img
                    alt="Resized preview"
                    class="max-h-40 w-full rounded-lg object-contain"
                    src={item.resizedUrl}
                  />
                </div>
                <div class="flex flex-col justify-between gap-3">
                  <Copy
                    text={item.resizedUrl}
                    label="Copy data URL"
                    floating={false}
                  />
                  <div class="flex flex-wrap gap-2">
                    <button
                      class="flex-1 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-700"
                      type="button"
                      on:click={() => downloadItem(item)}
                    >
                      Download
                    </button>
                    <button
                      class="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-rose-400 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-500 dark:hover:text-rose-300 dark:focus:ring-rose-900"
                      type="button"
                      on:click={() => removeItem(item.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</section>
