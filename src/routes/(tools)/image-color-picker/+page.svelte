<script lang="ts">
  import { onMount } from "svelte";
  import Copy from "$lib/Copy.svelte";
  import { normalizeHex, toCssHsl, toCssRgb } from "$lib/utils/color";

  type RGB = { r: number; g: number; b: number };
  type PaletteColor = { hex: string; rgb: string; hsl: string };

  let fileInput: HTMLInputElement;
  let canvas: HTMLCanvasElement;
  let containerEl: HTMLDivElement;

  let colors: PaletteColor[] = [];
  let hasImage = false;

  function drawImageOnCanvas(source: File | string) {
    if (!canvas || !containerEl) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const image = new Image();
    let objectUrl: string | null = null;

    if (typeof source === "string") {
      image.src = source;
    } else {
      objectUrl = URL.createObjectURL(source);
      image.src = objectUrl;
    }

    image.onload = () => {
      const maxWidth = containerEl.offsetWidth || 640;
      const scale = Math.min(maxWidth / image.width, 1);
      const canvasWidth = image.width * scale;
      const canvasHeight = image.height * scale;

      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
      containerEl.style.height = `${canvasHeight}px`;

      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(image, 0, 0, canvasWidth, canvasHeight);

      hasImage = true;
      extractPalette();

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };

    image.onerror = () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }

  function extractPalette() {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const rgbValues = buildRgb(imageData.data);
    const dominant = quantize(rgbValues, 0);

    const unique: RGB[] = [];
    const seen = new Set<string>();

    for (const color of dominant) {
      const hex = rgbToHex(color);
      if (!seen.has(hex)) {
        seen.add(hex);
        unique.push(color);
      }
      if (unique.length === 6) break;
    }

    if (unique.length < 6) {
      for (const color of dominant) {
        if (unique.length === 6) break;
        unique.push(color);
      }
    }

    colors = unique.slice(0, 6).map(formatColor);
  }

  function buildRgb(buffer: Uint8ClampedArray) {
    const values: RGB[] = [];
    for (let index = 0; index < buffer.length; index += 4) {
      const alpha = buffer[index + 3];
      if (alpha === 0) continue;
      values.push({
        r: buffer[index],
        g: buffer[index + 1],
        b: buffer[index + 2],
      });
    }
    return values;
  }

  function findLargestRange(pixels: RGB[]) {
    let rMin = Number.POSITIVE_INFINITY;
    let gMin = Number.POSITIVE_INFINITY;
    let bMin = Number.POSITIVE_INFINITY;
    let rMax = Number.NEGATIVE_INFINITY;
    let gMax = Number.NEGATIVE_INFINITY;
    let bMax = Number.NEGATIVE_INFINITY;

    for (const pixel of pixels) {
      rMin = Math.min(rMin, pixel.r);
      gMin = Math.min(gMin, pixel.g);
      bMin = Math.min(bMin, pixel.b);
      rMax = Math.max(rMax, pixel.r);
      gMax = Math.max(gMax, pixel.g);
      bMax = Math.max(bMax, pixel.b);
    }

    const rRange = rMax - rMin;
    const gRange = gMax - gMin;
    const bRange = bMax - bMin;

    if (rRange >= gRange && rRange >= bRange) return "r";
    if (gRange >= rRange && gRange >= bRange) return "g";
    return "b";
  }

  function quantize(pixels: RGB[], depth: number): RGB[] {
    const MAX_DEPTH = 3;
    if (depth === MAX_DEPTH || pixels.length === 0) {
      const color = pixels.reduce(
        (acc, curr) => {
          acc.r += curr.r;
          acc.g += curr.g;
          acc.b += curr.b;
          return acc;
        },
        { r: 0, g: 0, b: 0 },
      );

      const count = pixels.length || 1;
      color.r = Math.round(color.r / count);
      color.g = Math.round(color.g / count);
      color.b = Math.round(color.b / count);
      return [color];
    }

    const component = findLargestRange(pixels);
    pixels.sort((a, b) => a[component] - b[component]);

    const mid = Math.floor(pixels.length / 2);
    return [
      ...quantize(pixels.slice(0, mid), depth + 1),
      ...quantize(pixels.slice(mid), depth + 1),
    ];
  }

  function rgbToHex({ r, g, b }: RGB) {
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b
      .toString(16)
      .padStart(2, "0")}`.toUpperCase();
  }

  function formatColor(rgb: RGB): PaletteColor {
    const hex = normalizeHex(rgbToHex(rgb));
    return {
      hex: hex.toUpperCase(),
      rgb: toCssRgb(hex),
      hsl: toCssHsl(hex),
    };
  }

  function getContrastColor(hex: string) {
    const normalized = hex.replace("#", "");
    const r = Number.parseInt(normalized.substring(0, 2), 16);
    const g = Number.parseInt(normalized.substring(2, 4), 16);
    const b = Number.parseInt(normalized.substring(4, 6), 16);
    const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return luminance > 0.55 ? "#0f172a" : "#f8fafc";
  }

  function handleFileUpload(event: Event) {
    const target = event.currentTarget as HTMLInputElement | null;
    const file = target?.files?.[0];
    if (!file) return;
    drawImageOnCanvas(file);
    if (target) target.value = "";
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    drawImageOnCanvas(file);
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
  }

  function openFileDialog() {
    fileInput?.click();
  }

  function handleDropAreaKey(event: KeyboardEvent) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openFileDialog();
    }
  }

  onMount(() => {
    drawImageOnCanvas("/quino-al-J1_1YigSUPA-unsplash.jpg");
  });
</script>

<section class="space-y-6">
  <div
    class="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,0.58fr)_minmax(0,1.42fr)]"
  >
    <div class="space-y-4">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/80"
        on:dragover={handleDragOver}
        on:drop={handleDrop}
      >
        <div
          class="group relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-900/90 transition hover:border-indigo-400 hover:bg-slate-900/80 dark:border-slate-700"
          on:click={openFileDialog}
          on:keydown={handleDropAreaKey}
          role="button"
          tabindex="0"
        >
          <div
            bind:this={containerEl}
            class="relative flex h-full min-h-[260px] w-full cursor-pointer items-center justify-center overflow-hidden"
          >
            <canvas bind:this={canvas} class="absolute inset-0 h-full w-full" />
            {#if !hasImage}
              <div
                class="pointer-events-none flex flex-col items-center gap-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-300 dark:text-slate-400"
              >
                <span class="rounded-full border border-slate-400/50 px-3 py-1"
                  >Click or drop an image</span
                >
                <span class="text-[11px] text-slate-400 dark:text-slate-500"
                  >Drag files into this area to sample colors</span
                >
              </div>
            {/if}
          </div>
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-slate-900/15 dark:from-white/10"
          ></div>
        </div>
        <div class="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div class="space-y-1 text-xs text-slate-500 dark:text-slate-400">
            <p
              class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Need inspiration?
            </p>
            <p>
              Try cropping before upload to focus the extractor on a specific
              subject.
            </p>
          </div>
          <button
            class="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-700"
            type="button"
            on:click={openFileDialog}
          >
            Browse image
          </button>
          <input
            class="hidden"
            type="file"
            accept="image/*"
            bind:this={fileInput}
            on:change={handleFileUpload}
          />
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
      >
        <p
          class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Tips
        </p>
        <ul class="mt-2 space-y-2 leading-relaxed">
          <li>Use high-contrast images for richer palette variety.</li>
          <li>
            Click any swatch row to copy a specific format; use “Copy all
            formats” for quick sharing.
          </li>
          <li>
            The sampled colors are approximations of dominant hues—tweak them
            further in your design tool if needed.
          </li>
        </ul>
      </div>
    </div>

    <div class="space-y-4">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Palette
        </p>
        {#if colors.length === 0}
          <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Upload an image to generate color swatches.
          </p>
        {:else}
          <div class="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {#each colors as swatch, index}
              <div
                class="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700 dark:bg-slate-950"
              >
                <div class="space-y-3">
                  <div
                    class="h-20 w-full rounded-xl border border-white/60 shadow-inner dark:border-white/10"
                    style={`background:${swatch.hex};`}
                  />
                  <div class="flex items-center justify-between">
                    <p
                      class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
                    >
                      Swatch {index + 1}
                    </p>
                  
                  </div>
                  <div class="space-y-3 text-[13px]">
                    {#each [{ label: "HEX", value: swatch.hex }, { label: "RGB", value: swatch.rgb }, { label: "HSL", value: swatch.hsl }] as entry}
                      <div
                        class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-800"
                      >
                        <div class="flex flex-col">
                          <span
                            class="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
                            >{entry.label}</span
                          >
                          <span
                            class="font-mono text-sm text-slate-700 dark:text-slate-200"
                            >{entry.value}</span
                          >
                        </div>
                        <Copy
                          text={entry.value}
                          label="Copy"
                          floating={false}
                          customClass="!bg-white !text-slate-600 !shadow-none border border-slate-300 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide hover:!bg-indigo-50 focus:!outline-none focus:!ring-2 focus:!ring-indigo-200 rounded-full dark:border-slate-700 dark:!bg-slate-900/60 dark:!text-slate-200 dark:hover:!bg-slate-800 dark:focus:!ring-indigo-900"
                        />
                      </div>
                    {/each}
                  </div>
                </div>
                <Copy
                  text={`${swatch.hex} | ${swatch.rgb} | ${swatch.hsl}`}
                  label="Copy all formats"
                  floating={false}
                  customClass="mt-4"
                />
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
