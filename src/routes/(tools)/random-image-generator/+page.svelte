<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import Copy from "$lib/Copy.svelte";

  type DimensionPreset = {
    id: string;
    label: string;
    width: number;
    height: number;
  };

  const dimensionPresets: DimensionPreset[] = [
    { id: "200x200", label: "Square - 200 x 200", width: 200, height: 200 },
    { id: "320x240", label: "Thumbnail - 320 x 240", width: 320, height: 240 },
    {
      id: "360x640",
      label: "Story preview - 360 x 640",
      width: 360,
      height: 640,
    },
    {
      id: "480x320",
      label: "Mobile landscape - 480 x 320",
      width: 480,
      height: 320,
    },
    {
      id: "480x640",
      label: "Mobile portrait - 480 x 640",
      width: 480,
      height: 640,
    },
    {
      id: "640x640",
      label: "Large square - 640 x 640",
      width: 640,
      height: 640,
    },
    {
      id: "720x480",
      label: "Blog feature - 720 x 480",
      width: 720,
      height: 480,
    },
    { id: "720x960", label: "Tall board - 720 x 960", width: 720, height: 960 },
    {
      id: "800x600",
      label: "Presentation - 800 x 600",
      width: 800,
      height: 600,
    },
    { id: "900x1200", label: "Poster - 900 x 1200", width: 900, height: 1200 },
    { id: "960x540", label: "Half HD - 960 x 540", width: 960, height: 540 },
    {
      id: "960x960",
      label: "Social square - 960 x 960",
      width: 960,
      height: 960,
    },
    {
      id: "1024x576",
      label: "Ultra-lite HD - 1024 x 576",
      width: 1024,
      height: 576,
    },
    {
      id: "1080x1080",
      label: "Instagram square - 1080 x 1080",
      width: 1080,
      height: 1080,
    },
    {
      id: "1080x1350",
      label: "Instagram portrait - 1080 x 1350",
      width: 1080,
      height: 1350,
    },
    {
      id: "1200x628",
      label: "Open graph - 1200 x 628",
      width: 1200,
      height: 628,
    },
    {
      id: "1200x800",
      label: "Hero landscape - 1200 x 800",
      width: 1200,
      height: 800,
    },
    {
      id: "1280x720",
      label: "HD cover - 1280 x 720",
      width: 1280,
      height: 720,
    },
    {
      id: "1366x768",
      label: "Notebook HD - 1366 x 768",
      width: 1366,
      height: 768,
    },
    {
      id: "1440x900",
      label: "Wide desktop - 1440 x 900",
      width: 1440,
      height: 900,
    },
    {
      id: "1536x1024",
      label: "HiDPI landscape - 1536 x 1024",
      width: 1536,
      height: 1024,
    },
    {
      id: "1600x900",
      label: "Wide promo - 1600 x 900",
      width: 1600,
      height: 900,
    },
    {
      id: "1920x1080",
      label: "Full HD - 1920 x 1080",
      width: 1920,
      height: 1080,
    },
    {
      id: "2048x1152",
      label: "Big cover - 2048 x 1152",
      width: 2048,
      height: 1152,
    },
    {
      id: "2048x1536",
      label: "Retina tablet - 2048 x 1536",
      width: 2048,
      height: 1536,
    },
  ];

  const fieldId = {
    query: "random-image-query",
    dimension: "random-image-dimension",
    grayscale: "random-image-grayscale",
    blur: "random-image-blur",
  } as const;

  let query = "creative workspace";
  let selectedDimensionId = "1280x720";
  let grayscale = false;
  let blur = 0;
  let downloadError = "";
  let viewportWidth = 1024;

  let imageUrl = "";
  let imageKey = 0;
  let loading = false;
  let loadError = false;
  let requestTimer: ReturnType<typeof setTimeout> | null = null;

  const makeSeed = () => `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  let seed = makeSeed();

  const clampBlur = (value: number | string) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return 0;
    return Math.min(10, Math.max(0, Math.round(parsed)));
  };

  $: activePreset =
    dimensionPresets.find((preset) => preset.id === selectedDimensionId) ??
    dimensionPresets[0];
  $: safeWidth = activePreset.width;
  $: safeHeight = activePreset.height;
  $: aspectRatio = `${safeWidth} / ${safeHeight}`;
  $: blurAmount = clampBlur(blur);
  $: blurLabel = `${blurAmount}px`;
  $: previewFilter =
    grayscale || blurAmount > 0
      ? `${grayscale ? "grayscale(1)" : "grayscale(0)"} blur(${blurAmount}px)`
      : "none";
  $: previewMaxWidth = viewportWidth >= 1024 ? 600 : 300;

  function buildUrl(currentSeed = seed) {
    const params = new URLSearchParams({
      topic: query.trim() || "creative",
      width: `${safeWidth}`,
      height: `${safeHeight}`,
      seed: currentSeed,
    });
    return `/api/tools/random-image?${params.toString()}`;
  }

  function refreshImage({ newSeed = false }: { newSeed?: boolean } = {}) {
    if (newSeed) {
      seed = makeSeed();
    }
    imageUrl = buildUrl(seed);
    imageKey += 1;
    loading = true;
    loadError = false;
    downloadError = "";
  }

  function debounceRefresh() {
    if (requestTimer) clearTimeout(requestTimer);
    requestTimer = setTimeout(() => {
      refreshImage({ newSeed: true });
      requestTimer = null;
    }, 400);
  }

  function handleImageLoad() {
    loading = false;
    loadError = false;
  }

  function handleImageError() {
    loading = false;
    loadError = true;
  }

  function blobToImage(blob: Blob) {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (event) => {
        URL.revokeObjectURL(url);
        reject(event);
      };
      img.src = url;
    });
  }

  async function downloadImage() {
    if (!imageUrl) return;
    downloadError = "";
    try {
      const response = await fetch(imageUrl, { cache: "no-store" });
      if (!response.ok)
        throw new Error(`Unexpected response ${response.status}`);

      const sourceImage = await blobToImage(await response.blob());
      const canvas = document.createElement("canvas");
      canvas.width = safeWidth;
      canvas.height = safeHeight;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas not supported in this browser");

      context.fillStyle = "#000";
      context.fillRect(0, 0, safeWidth, safeHeight);

      const scale = Math.max(
        safeWidth / sourceImage.width,
        safeHeight / sourceImage.height,
      );
      const drawWidth = sourceImage.width * scale;
      const drawHeight = sourceImage.height * scale;
      const offsetX = (safeWidth - drawWidth) / 2;
      const offsetY = (safeHeight - drawHeight) / 2;

      context.filter = previewFilter === "none" ? "none" : previewFilter;
      context.drawImage(sourceImage, offsetX, offsetY, drawWidth, drawHeight);

      const processedBlob: Blob = await new Promise((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error("Unable to prepare download"));
        }, "image/png");
      });

      const blobUrl = URL.createObjectURL(processedBlob);
      const anchor = document.createElement("a");
      anchor.href = blobUrl;
      anchor.download = `random-${safeWidth}x${safeHeight}.png`;
      anchor.click();
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error(error);
      downloadError =
        "Unable to process the filtered download, opening the raw image instead.";
      window.open(imageUrl, "_blank", "noopener");
    }
  }

  onMount(() => {
    refreshImage({ newSeed: true });
    if (typeof window !== "undefined") {
      const handleResize = () => {
        viewportWidth = window.innerWidth;
      };
      handleResize();
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
  });

  onDestroy(() => {
    if (requestTimer) clearTimeout(requestTimer);
  });

  let previousQuery = query.trim();
  $: {
    const current = query.trim();
    if (current !== previousQuery) {
      previousQuery = current;
      debounceRefresh();
    }
  }

  $: markdownSnippet = imageUrl
    ? `![${query || "Random image"}](${imageUrl})`
    : "";
</script>

<section class="space-y-6">
  <div class="grid gap-6 xl:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)]">
    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div
          class="relative mx-auto w-full rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900"
          style={`max-width:${previewMaxWidth}px`}
        >
          <div
            class="relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-800"
            style={`aspect-ratio:${aspectRatio}`}
          >
            {#if loadError}
              <div
                class="px-6 py-10 text-center text-sm text-slate-600 dark:text-slate-300"
              >
                Couldn't load a fresh image. Adjust the keywords or click
                shuffle again.
              </div>
            {:else}
              {#key imageKey}
                <img
                  class="h-full w-full object-cover transition-opacity duration-300"
                  src={imageUrl}
                  alt={`Inspiration image for ${query}`}
                  loading="lazy"
                  decoding="async"
                  on:load={handleImageLoad}
                  on:error={handleImageError}
                  style={`opacity:${loading ? 0.2 : 1};filter:${previewFilter};`}
                />
              {/key}
            {/if}
            {#if loading}
              <div
                class="absolute inset-0 flex flex-col items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
              >
                <span
                  class="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-indigo-500"
                ></span>
                Fetching pixels...
              </div>
            {/if}
          </div>
          <div
            class="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-white/15 via-transparent to-slate-900/20 dark:from-white/10"
          ></div>
          <span
            class="mt-3 block text-center text-xs text-slate-500 dark:text-slate-400"
          >
            Preview is capped at {previewMaxWidth}px wide for this screen.
            Downloads export at {safeWidth} x {safeHeight}px.
          </span>
        </div>

        <div class="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-700"
            on:click={() => refreshImage({ newSeed: true })}
          >
            Shuffle image
          </button>
          <Copy
            text={imageUrl}
            label="Copy image URL"
            floating={false}
            customClass="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300 dark:focus:ring-indigo-900"
          />
          <Copy
            text={markdownSnippet}
            label="Copy Markdown"
            floating={false}
            customClass="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300 dark:focus:ring-emerald-900"
          />
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-100 dark:focus:ring-slate-800"
            on:click={downloadImage}
          >
            Download {safeWidth}x{safeHeight}
          </button>
        </div>
        {#if downloadError}
          <p class="mt-2 text-xs text-amber-600 dark:text-amber-400">
            {downloadError}
          </p>
        {/if}
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
      >
        <p
          class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Workflow tips
        </p>
        <ul class="mt-2 space-y-2 leading-relaxed">
          <li>
            Images are refreshed automatically only when the search topic
            changes. Adjust dimensions or filters freely, then tap Shuffle to
            fetch a new source with those settings.
          </li>
          <li>
            The preview is intentionally scaled down (300px on phones, 600px on
            desktops) so you can evaluate composition without waiting on large
            downloads.
          </li>
        </ul>
      </div>
    </div>

    <div class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80"
      >
        <label
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          for={fieldId.query}
        >
          Search topic
        </label>
        <input
          class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          id={fieldId.query}
          type="search"
          placeholder="e.g. aurora borealis, vintage car"
          bind:value={query}
        />
        <p class="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          The preview updates a few hundred milliseconds after you stop typing.
        </p>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
      >
        <label
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          for={fieldId.dimension}
        >
          Dimension preset
        </label>
        <select
          class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          id={fieldId.dimension}
          bind:value={selectedDimensionId}
        >
          {#each dimensionPresets as preset}
            <option value={preset.id}>{preset.label}</option>
          {/each}
        </select>
        <p class="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
          Choose from curated widths and heights designed for real-world
          layouts. The preview will scale proportionally while downloads match
          the preset pixel-for-pixel.
        </p>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Effects
        </p>
        <div class="mt-3 space-y-3">
          <label class="flex items-center gap-2">
            <input
              class="h-4 w-4 accent-indigo-600"
              type="checkbox"
              id={fieldId.grayscale}
              bind:checked={grayscale}
            />
            <span class="text-[11px] uppercase tracking-wide"
              >Grayscale preview</span
            >
          </label>
          <div class="flex flex-col gap-2">
            <label
              class="flex items-center justify-between text-[11px] uppercase tracking-wide"
              for={fieldId.blur}
            >
              <span>Blur preview</span>
              <span>{blurLabel}</span>
            </label>
            <input
              class="accent-indigo-600"
              type="range"
              id={fieldId.blur}
              min="0"
              max="10"
              step="1"
              bind:value={blur}
            />
          </div>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">
            Filters are GPU-accelerated: they never refetch the image and are
            baked into the exported PNG.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
