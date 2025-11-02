<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  const ICON_SIZES = [16, 32, 48, 64, 96, 128, 192, 256];

  let sourceUrl = "";
  let iconName = "favicon";
  let background = "#ffffff";
  let padding = 10;
  type IconShape = "square" | "rounded" | "circle";

  const ICON_SHAPES: IconShape[] = ["square", "rounded", "circle"];

  let shape: IconShape = "square";
  let icons: Record<number, string> = {};
  let regenerating = false;
  let errorMessage = "";
  let refreshToken = 0;

  $: htmlSnippet = ICON_SIZES.map(
    (size) =>
      `<link rel="icon" type="image/png" sizes="${size}x${size}" href="${iconName}-${size}.png">`,
  ).join("\n");

  async function handleFileChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement | null;
    const file = target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    regenerating = true;
    errorMessage = "";

    reader.onload = () => {
      sourceUrl = typeof reader.result === "string" ? reader.result : "";
      iconName = file.name.replace(/\.[^/.]+$/, "") || "favicon";
      triggerRefresh();
    };

    reader.onerror = () => {
      errorMessage = "Unable to read the selected image. Try a different file.";
      regenerating = false;
      sourceUrl = "";
    };

    reader.readAsDataURL(file);
  }

  function triggerRefresh() {
    refreshToken += 1;
  }

  $: if (sourceUrl) {
    refreshIcons(refreshToken);
  } else {
    icons = {};
  }

  async function refreshIcons(token: number) {
    regenerating = true;
    errorMessage = "";
    try {
      const image = await loadImage(sourceUrl);
      const nextIcons: Record<number, string> = {};

      for (const size of ICON_SIZES) {
        nextIcons[size] = await renderIcon(image, size, {
          padding,
          background,
          shape,
        });
        if (token !== refreshToken) {
          return;
        }
      }
      icons = nextIcons;
    } catch (error) {
      console.error(error);
      errorMessage = "Unable to generate favicons for this image.";
    } finally {
      if (token === refreshToken) {
        regenerating = false;
      }
    }
  }

  function setShape(option: IconShape) {
    shape = option;
    triggerRefresh();
  }

  async function renderIcon(
    image: HTMLImageElement,
    size: number,
    options: { padding: number; background: string; shape: IconShape },
  ) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context unavailable");

    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, size, size);

    if (options.shape !== "square") {
      ctx.save();
      ctx.beginPath();
      if (options.shape === "circle") {
        ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      } else {
        const radius = size * 0.25;
        drawRoundedRect(ctx, 0, 0, size, size, radius);
      }
      ctx.clip();
    }

    const pad = (options.padding / 100) * size;
    const inner = size - pad * 2;

    const scaling = Math.min(inner / image.width, inner / image.height);
    const drawWidth = image.width * scaling;
    const drawHeight = image.height * scaling;

    const offsetX = (size - drawWidth) / 2;
    const offsetY = (size - drawHeight) / 2;

    ctx.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);

    if (options.shape !== "square") {
      ctx.restore();
    }

    return canvas.toDataURL("image/png");
  }

  function drawRoundedRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number,
  ) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }

  function downloadIcon(size: number) {
    const url = icons[size];
    if (!url) return;
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${iconName}-${size}.png`;
    anchor.click();
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
</script>

<section class="space-y-6">
  <div class="flex flex-col gap-6 lg:flex-row">
    <div class="flex flex-1 flex-col gap-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-center gap-3">
          <button
            class="rounded-full border border-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-500 transition hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
            type="button"
            on:click={() => document.getElementById("favicon-input")?.click()}
          >
            {sourceUrl ? "Replace image" : "Upload logo"}
          </button>
          {#if sourceUrl}
            <span class="text-xs text-slate-500 dark:text-slate-400"
              >Editing favicons for <strong>{iconName}</strong></span
            >
          {/if}
          <input
            id="favicon-input"
            class="hidden"
            type="file"
            accept="image/*"
            on:change={handleFileChange}
          />
        </div>

        <div class="mt-6 grid gap-5 md:grid-cols-2">
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Icon name
            <input
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="text"
              bind:value={iconName}
            />
          </label>

          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Background
            <div class="flex items-center gap-3">
              <input
                type="color"
                class="h-11 w-20 cursor-pointer rounded border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950"
                bind:value={background}
                on:change={triggerRefresh}
              />
              <input
                class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                type="text"
                bind:value={background}
                on:change={triggerRefresh}
              />
            </div>
          </label>

          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Padding {padding}%
            <input
              class="w-full accent-indigo-500"
              type="range"
              min="0"
              max="35"
              bind:value={padding}
              on:input={triggerRefresh}
            />
          </label>

          <div
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Shape
            <div class="flex gap-2">
              {#each ICON_SHAPES as option}
                <button
                  class={`flex-1 rounded-full border px-3 py-2 text-xs transition ${
                    shape === option
                      ? "border-indigo-500 bg-indigo-100 font-semibold text-indigo-600 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300"
                      : "border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                  }`}
                  type="button"
                  on:click={() => setShape(option)}
                >
                  {option}
                </button>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            HTML snippet
          </p>
          <Copy
            text={htmlSnippet}
            label="Copy snippet"
            floating={false}
            customClass="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300 dark:focus:ring-indigo-900"
          />
        </div>
        <pre
          class="mt-3 max-h-48 overflow-x-auto rounded-2xl bg-slate-900/95 p-4 text-[12px] text-emerald-300 shadow-inner dark:bg-black">{htmlSnippet}</pre>
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
        class="rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950"
      >
        {#if !sourceUrl}
          <div
            class="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center text-sm text-slate-500 dark:text-slate-400"
          >
            <span
              class="rounded-full border border-dashed border-slate-300 px-4 py-2"
              >Upload an image to generate favicons</span
            >
            <p class="max-w-sm text-xs text-slate-400 dark:text-slate-500">
              Transparent PNGs with square dimensions work best. Padding and
              background color help adapt any logo to the favicon canvas.
            </p>
          </div>
        {:else}
          <div class="grid gap-4 sm:grid-cols-2">
            {#each ICON_SIZES as size}
              <div
                class="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900"
              >
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  {size} × {size}
                </p>
                <div
                  class="mx-auto my-3 flex h-24 w-24 items-center justify-center rounded-xl bg-slate-50 shadow-inner dark:bg-slate-950"
                >
                  {#if regenerating}
                    <span
                      class="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-indigo-500"
                    ></span>
                  {:else if icons[size]}
                    <img
                      alt={`Favicon ${size}px`}
                      class="h-10 w-10 rounded"
                      src={icons[size]}
                    />
                  {/if}
                </div>
                <div class="flex flex-col gap-2">
                  <Copy
                    text={icons[size]}
                    label="Copy data URL"
                    floating={false}
                  />
                  <button
                    class="rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-700"
                    type="button"
                    on:click={() => downloadIcon(size)}
                    disabled={!icons[size] || regenerating}
                  >
                    Download PNG
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
