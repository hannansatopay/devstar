<script lang="ts">
  import { onDestroy } from "svelte";
  import Copy from "$lib/Copy.svelte";

  type Matrix = [number, number, number][];

  const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1526481280695-3c4693f74552?auto=format&fit=crop&w=1200&q=80";

  const MATRICES: Record<
    string,
    { label: string; description: string; matrix: Matrix }
  > = {
    normal: {
      label: "Normal vision",
      description: "Default rendering without a filter.",
      matrix: [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1],
      ],
    },
    protanopia: {
      label: "Protanopia",
      description: "Red-blindness. Reds shift toward greens.",
      matrix: [
        [0.567, 0.433, 0],
        [0.558, 0.442, 0],
        [0, 0.242, 0.758],
      ],
    },
    protanomaly: {
      label: "Protanomaly",
      description: "Red-weakness. Reds appear dimmer.",
      matrix: [
        [0.817, 0.183, 0],
        [0.333, 0.667, 0],
        [0, 0.125, 0.875],
      ],
    },
    deuteranopia: {
      label: "Deuteranopia",
      description: "Green-blindness. Greens shift toward reds.",
      matrix: [
        [0.625, 0.375, 0],
        [0.7, 0.3, 0],
        [0, 0.3, 0.7],
      ],
    },
    deuteranomaly: {
      label: "Deuteranomaly",
      description: "Green-weakness. Greens lose intensity.",
      matrix: [
        [0.8, 0.2, 0],
        [0.258, 0.742, 0],
        [0, 0.142, 0.858],
      ],
    },
    tritanopia: {
      label: "Tritanopia",
      description: "Blue-yellow blindness. Blues shift toward greens.",
      matrix: [
        [0.95, 0.05, 0],
        [0, 0.433, 0.567],
        [0, 0.475, 0.525],
      ],
    },
    tritanomaly: {
      label: "Tritanomaly",
      description: "Blue-yellow weakness. Blues appear muted.",
      matrix: [
        [0.967, 0.033, 0],
        [0, 0.733, 0.267],
        [0, 0.183, 0.817],
      ],
    },
    achromatopsia: {
      label: "Achromatopsia",
      description: "Complete color blindness. Image becomes grayscale.",
      matrix: [
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
        [0.299, 0.587, 0.114],
      ],
    },
    achromatomaly: {
      label: "Achromatomaly",
      description: "Partial color blindness. Reduced saturation.",
      matrix: [
        [0.618, 0.32, 0.062],
        [0.163, 0.775, 0.062],
        [0.163, 0.32, 0.516],
      ],
    },
  };

  let selected = "protanopia";
  let severity = 1;
  let imageSrc = DEFAULT_IMAGE;
  let currentFileName = "sample-photo.jpg";
  let objectUrl: string | null = null;

  let canvasEl: HTMLCanvasElement;
  let baseData: ImageData | null = null;

  $: applyFilter();

  function handleFile(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(file);
    imageSrc = objectUrl;
    currentFileName = file.name;
    loadImage(imageSrc);
    input.value = "";
  }

  function loadImage(src: string) {
    if (!canvasEl) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvasEl.width = img.width;
      canvasEl.height = img.height;
      ctx.drawImage(img, 0, 0, img.width, img.height);
      baseData = ctx.getImageData(0, 0, img.width, img.height);
      applyFilter();
    };
    img.src = src;
  }

  function applyFilter() {
    if (!canvasEl || !baseData) return;
    const ctx = canvasEl.getContext("2d");
    if (!ctx) return;

    const { matrix } = MATRICES[selected];
    if (selected === "normal" || severity === 0) {
      ctx.putImageData(baseData, 0, 0);
      return;
    }

    const output = ctx.createImageData(baseData.width, baseData.height);
    const base = baseData.data;
    const out = output.data;

    for (let i = 0; i < base.length; i += 4) {
      const r = base[i];
      const g = base[i + 1];
      const b = base[i + 2];
      const a = base[i + 3];

      const nr = r * matrix[0][0] + g * matrix[0][1] + b * matrix[0][2];
      const ng = r * matrix[1][0] + g * matrix[1][1] + b * matrix[1][2];
      const nb = r * matrix[2][0] + g * matrix[2][1] + b * matrix[2][2];

      out[i] = blendChannel(r, nr, severity);
      out[i + 1] = blendChannel(g, ng, severity);
      out[i + 2] = blendChannel(b, nb, severity);
      out[i + 3] = a;
    }

    ctx.putImageData(output, 0, 0);
  }

  function blendChannel(original: number, transformed: number, mix: number) {
    return Math.round(original * (1 - mix) + transformed * mix);
  }

  function downloadImage() {
    if (!canvasEl) return;
    const link = document.createElement("a");
    link.href = canvasEl.toDataURL("image/png");
    const safeName = currentFileName.replace(/\.[^/.]+$/, "") || "simulated";
    link.download = `${safeName}-${selected}.png`;
    link.click();
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
    loadImage(imageSrc);
  }

  function preventDefault(event: DragEvent) {
    event.preventDefault();
  }

  onDestroy(() => {
    if (objectUrl) URL.revokeObjectURL(objectUrl);
  });
</script>

<section class="space-y-6">
  <div class="gap-6 md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
    <div class="space-y-6">
      <div
        class="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:border-indigo-500"
        on:dragover={preventDefault}
        on:drop={handleDrop}
      >
        <p class="text-center">
          Drag & drop an image or <span
            class="font-semibold text-indigo-600 dark:text-indigo-400"
            >browse</span
          > to simulate different vision types.
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

      <div
        class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <label
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Simulation type
        </label>
        <select
          class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={selected}
          on:change={applyFilter}
        >
          {#each Object.entries(MATRICES) as [key, item]}
            <option value={key}>{item.label}</option>
          {/each}
        </select>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {MATRICES[selected].description}
        </p>

        <div class="mt-4">
          <label
            class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
          >
            <span>Severity</span>
            <span>{Math.round(severity * 100)}%</span>
          </label>
          <input
            class="w-full accent-indigo-600"
            type="range"
            min="0"
            max="1"
            step="0.05"
            bind:value={severity}
            on:input={applyFilter}
          />
        </div>
      </div>

      <div
        class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
      >
        <p
          class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Accessibility notes
        </p>
        <ul class="mt-2 space-y-2 leading-relaxed">
          <li>
            • Use the simulator to validate contrast and color combinations in
            your UI.
          </li>
          <li>
            • Consider adding redundant cues (text, symbols) alongside color.
          </li>
          <li>
            • Keep severity below 60% to mimic mild color vision deficiency.
          </li>
        </ul>
      </div>
    </div>

    <div class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div
          class="relative overflow-hidden rounded-xl bg-slate-200 dark:bg-slate-800"
        >
          <canvas bind:this={canvasEl} class="w-full">
            Your browser does not support canvas.
          </canvas>
        </div>
        <div class="mt-4 flex flex-wrap gap-3">
          <button
            class="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700"
            type="button"
            on:click={downloadImage}
          >
            Download simulated image
          </button>
          <Copy
            text={`filter: url('#${selected}-matrix');`}
            customClass="!relative !top-auto !right-auto"
          />
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
      >
        <p
          class="mb-2 font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Matrix coefficients
        </p>
        <table class="w-full table-fixed text-center text-[11px]">
          <thead>
            <tr class="text-slate-500 dark:text-slate-400">
              <th class="py-1">Row</th>
              <th class="py-1">R</th>
              <th class="py-1">G</th>
              <th class="py-1">B</th>
            </tr>
          </thead>
          <tbody>
            {#each MATRICES[selected].matrix as row, index}
              <tr class="border-t border-slate-200 dark:border-slate-800">
                <td
                  class="py-1 font-semibold text-slate-500 dark:text-slate-400"
                  >{index + 1}</td
                >
                <td class="py-1">{row[0].toFixed(3)}</td>
                <td class="py-1">{row[1].toFixed(3)}</td>
                <td class="py-1">{row[2].toFixed(3)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </div>
</section>

<svelte:window on:load={() => loadImage(imageSrc)} />
