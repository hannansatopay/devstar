<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  type Preset = {
    label: string;
    settings: Partial<typeof filters>;
  };

  const DEFAULT_FILTERS = {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    hue: 0,
    blur: 0,
    grayscale: 0,
    sepia: 0,
  };

  const PRESETS: Preset[] = [
    { label: "Original", settings: { ...DEFAULT_FILTERS } },
    {
      label: "Vivid",
      settings: { brightness: 105, contrast: 110, saturation: 125, hue: 5 },
    },
    { label: "Mono", settings: { contrast: 110, grayscale: 100 } },
    { label: "Warm", settings: { saturation: 115, hue: -10, sepia: 10 } },
    { label: "Cool", settings: { saturation: 95, hue: 20, brightness: 105 } },
    {
      label: "Dramatic",
      settings: { contrast: 125, brightness: 95, saturation: 85 },
    },
  ];

  let sourceUrl = "";
  let imageName = "edited-image";
  let filters = cloneFilters();
  let rotation = 0;
  let flipX = false;
  let flipY = false;
  let loading = false;
  let errorMessage = "";

  $: hasImage = Boolean(sourceUrl);
  $: filterCss = buildFilterCss(filters);
  $: transformCss = buildTransformCss(rotation, flipX, flipY);

  function handleFileChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement | null;
    const file = target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    loading = true;
    errorMessage = "";

    reader.onload = () => {
      sourceUrl = typeof reader.result === "string" ? reader.result : "";
      imageName = file.name.replace(/\.[^/.]+$/, "") || "edited-image";
      loading = false;
      resetAdjustments();
    };

    reader.onerror = () => {
      errorMessage = "Unable to load the selected image.";
      loading = false;
    };

    reader.readAsDataURL(file);
  }

  function buildFilterCss(values: typeof DEFAULT_FILTERS) {
    return [
      `brightness(${values.brightness}%)`,
      `contrast(${values.contrast}%)`,
      `saturate(${values.saturation}%)`,
      `hue-rotate(${values.hue}deg)`,
      values.grayscale > 0 ? `grayscale(${values.grayscale}%)` : "",
      values.sepia > 0 ? `sepia(${values.sepia}%)` : "",
      values.blur > 0 ? `blur(${values.blur / 10}rem)` : "",
    ]
      .filter(Boolean)
      .join(" ");
  }

  function buildTransformCss(
    currentRotation: number,
    horizontal: boolean,
    vertical: boolean,
  ) {
    const transforms: string[] = [];
    if (horizontal) transforms.push("scaleX(-1)");
    if (vertical) transforms.push("scaleY(-1)");
    if (currentRotation !== 0) transforms.push(`rotate(${currentRotation}deg)`);
    return transforms.join(" ");
  }

  function applyPreset(preset: Preset) {
    filters = { ...filters, ...preset.settings };
  }

  function resetAdjustments() {
    filters = cloneFilters();
    rotation = 0;
    flipX = false;
    flipY = false;
  }

  function rotate(direction: "left" | "right") {
    rotation = (rotation + (direction === "left" ? -90 : 90) + 360) % 360;
  }

  async function downloadImage() {
    if (!sourceUrl) return;
    loading = true;
    try {
      const image = await loadImageElement(sourceUrl);
      const radians = (rotation * Math.PI) / 180;
      const sin = Math.abs(Math.sin(radians));
      const cos = Math.abs(Math.cos(radians));

      const targetWidth = image.width;
      const targetHeight = image.height;
      const canvasWidth = Math.round(targetWidth * cos + targetHeight * sin);
      const canvasHeight = Math.round(targetWidth * sin + targetHeight * cos);

      const canvas = document.createElement("canvas");
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas context unavailable.");

      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate(radians);
      if (flipX) ctx.scale(-1, 1);
      if (flipY) ctx.scale(1, -1);

      const baseWidth = flipX ? -targetWidth : targetWidth;
      const baseHeight = flipY ? -targetHeight : targetHeight;
      ctx.filter = filterCss;
      ctx.drawImage(
        image,
        -baseWidth / 2,
        -baseHeight / 2,
        baseWidth,
        baseHeight,
      );

      const link = document.createElement("a");
      link.download = `${imageName || "photo-editor"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error(error);
      errorMessage = "Something went wrong while exporting the image.";
    } finally {
      loading = false;
    }
  }

  function loadImageElement(url: string) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }

  function cloneFilters() {
    return {
      brightness: DEFAULT_FILTERS.brightness,
      contrast: DEFAULT_FILTERS.contrast,
      saturation: DEFAULT_FILTERS.saturation,
      hue: DEFAULT_FILTERS.hue,
      blur: DEFAULT_FILTERS.blur,
      grayscale: DEFAULT_FILTERS.grayscale,
      sepia: DEFAULT_FILTERS.sepia,
    };
  }
</script>

<section class="space-y-6">
  <div class="flex flex-col gap-6 px-4 lg:flex-row">
    <div class="flex flex-1 flex-col gap-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-col gap-4">
          <div class="flex flex-wrap items-center gap-3">
            <button
              class="rounded-full border border-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-500 transition hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
              type="button"
              on:click={() =>
                document.getElementById("photo-editor-file")?.click()}
            >
              {hasImage ? "Replace image" : "Upload image"}
            </button>
            {#if hasImage}
              <button
                class="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-500 dark:hover:text-rose-300"
                type="button"
                on:click={() => {
                  sourceUrl = "";
                  resetAdjustments();
                }}
              >
                Remove
              </button>
            {/if}
            <input
              id="photo-editor-file"
              class="hidden"
              type="file"
              accept="image/*"
              on:change={handleFileChange}
            />
            <div
              class="ml-auto flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
            >
              <span class="font-semibold uppercase tracking-wide">Rotate</span>
              <button
                class="rounded-full bg-white px-2 py-1 text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-900"
                type="button"
                on:click={() => rotate("left")}
                aria-label="Rotate left"
              >
                ⟲
              </button>
              <button
                class="rounded-full bg-white px-2 py-1 text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-100 dark:bg-slate-950 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-900"
                type="button"
                on:click={() => rotate("right")}
                aria-label="Rotate right"
              >
                ⟳
              </button>
              <label
                class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide"
              >
                <input
                  class="h-4 w-4 accent-indigo-500"
                  type="checkbox"
                  bind:checked={flipX}
                />
                Flip X
              </label>
              <label
                class="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide"
              >
                <input
                  class="h-4 w-4 accent-indigo-500"
                  type="checkbox"
                  bind:checked={flipY}
                />
                Flip Y
              </label>
            </div>
          </div>

          <div class="flex flex-wrap gap-3">
            {#each PRESETS as preset}
              <button
                class="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                type="button"
                on:click={() => applyPreset(preset)}
              >
                {preset.label}
              </button>
            {/each}
            <button
              class="rounded-full border border-emerald-500 px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
              type="button"
              on:click={resetAdjustments}
            >
              Reset adjustments
            </button>
          </div>
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="grid gap-5 md:grid-cols-2">
          <div class="space-y-3">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Brightness</span>
              <span>{filters.brightness}%</span>
            </label>
            <input
              class="w-full accent-indigo-500"
              type="range"
              min="50"
              max="150"
              bind:value={filters.brightness}
            />
          </div>
          <div class="space-y-3">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Contrast</span>
              <span>{filters.contrast}%</span>
            </label>
            <input
              class="w-full accent-indigo-500"
              type="range"
              min="50"
              max="160"
              bind:value={filters.contrast}
            />
          </div>
          <div class="space-y-3">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Saturation</span>
              <span>{filters.saturation}%</span>
            </label>
            <input
              class="w-full accent-indigo-500"
              type="range"
              min="0"
              max="200"
              bind:value={filters.saturation}
            />
          </div>
          <div class="space-y-3">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Hue</span>
              <span>{filters.hue}°</span>
            </label>
            <input
              class="w-full accent-indigo-500"
              type="range"
              min="-180"
              max="180"
              bind:value={filters.hue}
            />
          </div>
          <div class="space-y-3">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Blur</span>
              <span>{(filters.blur / 10).toFixed(1)}rem</span>
            </label>
            <input
              class="w-full accent-indigo-500"
              type="range"
              min="0"
              max="40"
              bind:value={filters.blur}
            />
          </div>
          <div class="space-y-3">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Grayscale</span>
              <span>{filters.grayscale}%</span>
            </label>
            <input
              class="w-full accent-indigo-500"
              type="range"
              min="0"
              max="100"
              bind:value={filters.grayscale}
            />
          </div>
          <div class="space-y-3">
            <label
              class="flex justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Sepia</span>
              <span>{filters.sepia}%</span>
            </label>
            <input
              class="w-full accent-indigo-500"
              type="range"
              min="0"
              max="100"
              bind:value={filters.sepia}
            />
          </div>
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div class="flex items-center gap-3">
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              for="photo-editor-name"
            >
              File name
            </label>
            <input
              id="photo-editor-name"
              class="w-48 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="text"
              bind:value={imageName}
            />
          </div>
          <button
            class="inline-flex items-center justify-center rounded-full bg-indigo-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-700"
            type="button"
            on:click={downloadImage}
            disabled={!hasImage || loading}
          >
            {loading ? "Processing…" : "Download edited image"}
          </button>
        </div>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Download exports a PNG with your current adjustments applied. Rotate
          and flip options are baked into the final image.
        </p>
      </div>
    </div>

    <div class="flex flex-1 flex-col gap-6">
      <div
        class="relative rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-inner backdrop-blur dark:border-slate-800 dark:bg-slate-900/60"
      >
        {#if !hasImage}
          <div
            class="flex min-h-[420px] flex-col items-center justify-center gap-4 text-center text-sm text-slate-500 dark:text-slate-400"
          >
            <span
              class="rounded-full border border-dashed border-slate-300 px-4 py-2"
              >Load an image to begin editing</span
            >
            <p class="max-w-sm text-xs text-slate-400 dark:text-slate-500">
              Brightness, contrast, saturation, and other adjustments will
              preview instantly. Your original file is never uploaded to a
              server.
            </p>
          </div>
        {:else}
          <div
            class="relative flex min-h-[420px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-900/40 dark:border-slate-700"
          >
            <img
              src={sourceUrl}
              alt="Edited preview"
              class="max-h-[480px] w-full object-contain transition"
              style={`filter:${filterCss};transform:${transformCss};`}
            />
          </div>
          <Copy
            text={`filter: ${filterCss};`}
            label="Copy CSS filters"
            floating={false}
            customClass="mt-4 w-full justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300 dark:focus:ring-indigo-900"
          />
        {/if}
      </div>

      {#if errorMessage}
        <div
          class="rounded-2xl border border-rose-200 bg-rose-100/70 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
        >
          {errorMessage}
        </div>
      {/if}
    </div>
  </div>
</section>
