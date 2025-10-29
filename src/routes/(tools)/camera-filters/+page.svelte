<script lang="ts">
  import { onDestroy } from "svelte";
  import Copy from "$lib/Copy.svelte";
  import sampleImage from "./defaultimg.jpg?url";

  type FilterState = {
    brightness: number;
    contrast: number;
    saturation: number;
    temperature: number;
    hue: number;
    blur: number;
    sepia: number;
    grayscale: number;
    invert: number;
  };

  const DEFAULT_FILTERS: FilterState = {
    brightness: 100,
    contrast: 100,
    saturation: 110,
    temperature: 0,
    hue: 0,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    invert: 0,
  };

  let filters: FilterState = structuredClone(DEFAULT_FILTERS);
  let imageSrc: string = sampleImage;
  let currentFileName = "sample-image.jpg";
  let objectUrl: string | null = null;
  let downloading = false;
  let canvasEl: HTMLCanvasElement;

  $: filterString = [
    `brightness(${filters.brightness}%)`,
    `contrast(${filters.contrast}%)`,
    `saturate(${filters.saturation}%)`,
    `hue-rotate(${filters.hue}deg)`,
    `sepia(${filters.sepia}%)`,
    `grayscale(${filters.grayscale}%)`,
    `invert(${filters.invert}%)`,
    `blur(${filters.blur}px)`,
  ].join(" ");

  $: temperatureString =
    filters.temperature >= 0
      ? `rgb(${255}, ${255 - filters.temperature}, ${255 - filters.temperature})`
      : `rgb(${255 + filters.temperature}, ${255}, ${255})`;

  $: cssSnippet = `filter: ${filterString};`;

  function resetFilters() {
    filters = structuredClone(DEFAULT_FILTERS);
  }

  function handleFile(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
    }
    objectUrl = URL.createObjectURL(file);
    imageSrc = objectUrl;
    currentFileName = file.name;
    input.value = "";
  }

  async function downloadImage() {
    if (!canvasEl) return;
    downloading = true;
    try {
      const img = await loadImage(imageSrc);
      const ctx = canvasEl.getContext("2d");
      if (!ctx) return;
      canvasEl.width = img.naturalWidth;
      canvasEl.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
      ctx.filter = filterString;
      ctx.drawImage(img, 0, 0, canvasEl.width, canvasEl.height);

      if (filters.temperature !== 0) {
        ctx.fillStyle = temperatureString;
        ctx.globalAlpha = Math.abs(filters.temperature) / 255;
        ctx.fillRect(0, 0, canvasEl.width, canvasEl.height);
        ctx.globalAlpha = 1;
      }

      const link = document.createElement("a");
      link.href = canvasEl.toDataURL("image/png");
      const safeName =
        currentFileName.replace(/\.[^/.]+$/, "") || "filtered-photo";
      link.download = `${safeName}-filtered.png`;
      link.click();
    } finally {
      downloading = false;
    }
  }

  function updateTemperature(value: number) {
    filters = { ...filters, temperature: value };
  }

  function handleTemperatureInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    const value = Number.parseInt(input.value, 10);
    updateTemperature(Number.isNaN(value) ? 0 : value);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please drop an image file.");
      return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    imageSrc = objectUrl;
    currentFileName = file.name;
  }

  function preventDefault(event: DragEvent) {
    event.preventDefault();
  }

  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  onDestroy(() => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  });
</script>

<section class="space-y-6">
  <div
    class="gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
  >
    <div class="space-y-6">
      <div
        class="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-indigo-500"
        on:dragover={preventDefault}
        on:drop={handleDrop}
      >
        <p class="text-center">
          Drop an image here or <span
            class="font-semibold text-indigo-600 dark:text-indigo-400"
            >browse</span
          > to apply filters.
        </p>
        <label
          class="inline-flex cursor-pointer items-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:hover:bg-indigo-500 dark:focus:ring-indigo-700"
        >
          <span>Select image</span>
          <input
            class="hidden"
            type="file"
            accept="image/*"
            on:change={handleFile}
          />
        </label>
        <p class="text-xs text-slate-400 dark:text-slate-500">
          Current: {currentFileName}
        </p>
      </div>

      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <p class="text-sm font-semibold text-slate-700 dark:text-slate-100">
            Filter settings
          </p>
          <button
            class="text-xs font-semibold text-indigo-600 transition hover:text-indigo-500 dark:text-indigo-400"
            on:click={resetFilters}
            type="button"
          >
            Reset
          </button>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div class="space-y-2">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Brightness</span>
              <span>{filters.brightness}%</span>
            </label>
            <input
              class="w-full accent-indigo-600"
              type="range"
              min="0"
              max="200"
              bind:value={filters.brightness}
            />
          </div>
          <div class="space-y-2">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Contrast</span>
              <span>{filters.contrast}%</span>
            </label>
            <input
              class="w-full accent-indigo-600"
              type="range"
              min="0"
              max="200"
              bind:value={filters.contrast}
            />
          </div>
          <div class="space-y-2">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Saturation</span>
              <span>{filters.saturation}%</span>
            </label>
            <input
              class="w-full accent-indigo-600"
              type="range"
              min="0"
              max="250"
              bind:value={filters.saturation}
            />
          </div>
          <div class="space-y-2">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Temperature</span>
              <span>{filters.temperature}</span>
            </label>
            <input
              class="w-full accent-indigo-600"
              type="range"
              min="-120"
              max="120"
              bind:value={filters.temperature}
              on:input={handleTemperatureInput}
            />
          </div>
          <div class="space-y-2">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Hue</span>
              <span>{filters.hue}°</span>
            </label>
            <input
              class="w-full accent-indigo-600"
              type="range"
              min="-180"
              max="180"
              bind:value={filters.hue}
            />
          </div>
          <div class="space-y-2">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Blur</span>
              <span>{filters.blur}px</span>
            </label>
            <input
              class="w-full accent-indigo-600"
              type="range"
              min="0"
              max="10"
              step="0.1"
              bind:value={filters.blur}
            />
          </div>
          <div class="space-y-2">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Sepia</span>
              <span>{filters.sepia}%</span>
            </label>
            <input
              class="w-full accent-indigo-600"
              type="range"
              min="0"
              max="100"
              bind:value={filters.sepia}
            />
          </div>
          <div class="space-y-2">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Grayscale</span>
              <span>{filters.grayscale}%</span>
            </label>
            <input
              class="w-full accent-indigo-600"
              type="range"
              min="0"
              max="100"
              bind:value={filters.grayscale}
            />
          </div>
          <div class="space-y-2">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Invert</span>
              <span>{filters.invert}%</span>
            </label>
            <input
              class="w-full accent-indigo-600"
              type="range"
              min="0"
              max="100"
              bind:value={filters.invert}
            />
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div
        class="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <div
          class="aspect-[3/2] w-full overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800"
          style={`filter: ${filterString};`}
        >
          <img
            src={imageSrc}
            alt="Filtered preview"
            class="h-full w-full object-contain"
            draggable="false"
          />
          {#if filters.temperature !== 0}
            <div
              class="pointer-events-none absolute inset-0 mix-blend-screen dark:mix-blend-lighten"
              style={`background:${temperatureString}; opacity:${Math.abs(filters.temperature) / 255};`}
            />
          {/if}
        </div>
        <button
          class="mt-4 inline-flex w-full items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:focus:ring-indigo-700"
          type="button"
          on:click={downloadImage}
          disabled={downloading}
        >
          {downloading ? "Preparing download..." : "Download filtered image"}
        </button>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
      >
        <div class="mb-2 flex items-center justify-between">
          <p
            class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            CSS snippet
          </p>
          <Copy
            text={cssSnippet}
            customClass="!relative !top-auto !right-auto"
          />
        </div>
        <pre
          class="overflow-x-auto rounded-lg bg-white p-3 text-slate-700 shadow-sm dark:bg-slate-950 dark:text-slate-200">{cssSnippet}</pre>
      </div>
    </div>
  </div>
</section>

<canvas bind:this={canvasEl} class="hidden"></canvas>
