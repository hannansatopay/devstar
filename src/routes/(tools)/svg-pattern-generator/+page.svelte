<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import { normalizeHex } from "$lib/utils/color";

  type PatternType = "dots" | "grid" | "stripes" | "diagonal" | "triangles";

  let patternType: PatternType = "dots";
  let cellSize = 32;
  let shapeSize = 8;
  let rotation = 45;
  let fillColor = "#2563eb";
  let backgroundColor = "#f8fafc";

  const controlId = {
    cell: "svg-pattern-cell",
    shape: "svg-pattern-shape",
    angle: "svg-pattern-angle",
    primary: "svg-pattern-primary",
    background: "svg-pattern-background",
  } as const;

  $: normalizedFill = normalizeHex(fillColor);
  $: normalizedBackground = normalizeHex(backgroundColor);
  $: svgMarkup = createPattern(
    patternType,
    cellSize,
    shapeSize,
    rotation,
    normalizedFill,
    normalizedBackground,
  );
  $: dataUri = toDataUri(svgMarkup);

  function createPattern(
    type: PatternType,
    cell: number,
    size: number,
    angle: number,
    primary: string,
    background: string,
  ) {
    const id = "pattern-" + Math.random().toString(36).slice(2, 9);
    const cellRounded = Math.max(4, cell);
    const sizeRounded = Math.max(2, Math.min(size, cellRounded));

    let shape = "";
    switch (type) {
      case "dots":
        shape = `<circle cx="${cellRounded / 2}" cy="${cellRounded / 2}" r="${sizeRounded / 2}" fill="${primary}" />`;
        break;
      case "grid":
        shape = `<rect x="0" y="0" width="${cellRounded}" height="${sizeRounded / 5}" fill="${primary}" />
<rect x="0" y="0" width="${sizeRounded / 5}" height="${cellRounded}" fill="${primary}" />`;
        break;
      case "stripes":
        shape = `<rect x="0" y="0" width="${cellRounded}" height="${sizeRounded / 3}" fill="${primary}" />`;
        break;
      case "diagonal":
        shape = `<rect x="-${cellRounded}" y="0" width="${cellRounded * 3}" height="${sizeRounded / 3}" fill="${primary}" transform="rotate(${angle} ${cellRounded / 2} ${cellRounded / 2})" />`;
        break;
      case "triangles":
        shape = `<polygon points="0,${cellRounded} ${cellRounded / 2},${cellRounded - sizeRounded} ${cellRounded},${cellRounded}" fill="${primary}" />
<polygon points="0,0 ${cellRounded / 2},${sizeRounded} ${cellRounded},0" fill="${primary}" />`;
        break;
    }

    return `<svg xmlns="http://www.w3.org/2000/svg" width="${cellRounded}" height="${cellRounded}" viewBox="0 0 ${cellRounded} ${cellRounded}">
  <defs>
    <pattern id="${id}" width="${cellRounded}" height="${cellRounded}" patternUnits="userSpaceOnUse">
      <rect width="100%" height="100%" fill="${background}" />
      ${shape}
    </pattern>
  </defs>
  <rect width="100%" height="100%" fill="url(#${id})" />
</svg>`;
  }

  function toDataUri(svg: string) {
    const encoded = encodeURIComponent(svg)
      .replace(/'/g, "%27")
      .replace(/"/g, "%22");
    return `data:image/svg+xml,${encoded}`;
  }
</script>

<section class="space-y-6">
  <div
    class="gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950 md:grid md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]"
  >
    <div class="space-y-4">
      <div
        class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80"
      >
        <label
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Pattern type
        </label>
        <select
          class="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={patternType}
        >
          <option value="dots">Dots</option>
          <option value="grid">Grid</option>
          <option value="stripes">Horizontal stripes</option>
          <option value="diagonal">Diagonal stripes</option>
          <option value="triangles">Triangles</option>
        </select>
      </div>

      <div
        class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <label
          class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          for={controlId.cell}
        >
          <span>Pattern cell</span>
          <span>{cellSize}px</span>
        </label>
        <input
          class="mt-2 w-full accent-indigo-600"
          type="range"
          min="12"
          max="120"
          id={controlId.cell}
          bind:value={cellSize}
        />
      </div>
      <div
        class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <label
          class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          for={controlId.shape}
        >
          <span>Shape size</span>
          <span>{shapeSize}px</span>
        </label>
        <input
          class="mt-2 w-full accent-indigo-600"
          type="range"
          min="2"
          max="80"
          id={controlId.shape}
          bind:value={shapeSize}
        />
      </div>
      <div
        class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <label
          class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 {patternType !==
          'diagonal'
            ? 'opacity-60'
            : ''}"
          for={controlId.angle}
        >
          <span>Angle</span>
          <span>{rotation}deg</span>
        </label>
        <input
          class="mt-2 w-full accent-indigo-600 disabled:opacity-40"
          type="range"
          min="0"
          max="180"
          id={controlId.angle}
          bind:value={rotation}
          disabled={patternType !== "diagonal"}
        />
      </div>

      <div
        class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <label
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          for={controlId.primary}
        >
          Primary color
        </label>
        <div class="mt-3 flex items-center gap-3">
          <input
            class="h-12 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950"
            type="color"
            id={controlId.primary}
            bind:value={fillColor}
          />
          <input
            class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-mono uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={fillColor}
            aria-label="Primary color hex value"
          />
        </div>
      </div>
      <div
        class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <label
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          for={controlId.background}
        >
          Background color
        </label>
        <div class="mt-3 flex items-center gap-3">
          <input
            class="h-12 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950"
            type="color"
            id={controlId.background}
            bind:value={backgroundColor}
          />
          <input
            class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-mono uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={backgroundColor}
            aria-label="Background color hex value"
          />
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div
          class="overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            class="h-64 w-full bg-[length:auto] bg-center"
            style={`background-image:url('${dataUri}');`}
          />
        </div>
        <div
          class="mt-3 grid gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2"
        >
          <div>
            Cell: <span class="font-mono text-slate-700 dark:text-slate-200"
              >{cellSize}px</span
            >
          </div>
          <div>
            Shape: <span class="font-mono text-slate-700 dark:text-slate-200"
              >{shapeSize}px</span
            >
          </div>
          {#if patternType === "diagonal"}
            <div>
              Angle: <span class="font-mono text-slate-700 dark:text-slate-200"
                >{rotation}deg</span
              >
            </div>
          {/if}
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
      >
        <div class="mb-2 flex items-center justify-between">
          <p
            class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            SVG markup
          </p>
          <Copy
            text={svgMarkup}
            customClass="!relative !top-auto !right-auto"
          />
        </div>
        <pre
          class="overflow-x-auto rounded-lg bg-slate-900/90 p-4 text-[12px] text-emerald-300 shadow-inner dark:bg-black">{svgMarkup}</pre>
        <div class="mt-4 flex flex-wrap gap-3">
          <Copy
            text={dataUri}
            label="Copy data URI"
            customClass="!relative !top-auto !right-auto"
          />
          <a
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300 dark:focus:ring-indigo-900"
            download="pattern.svg"
            href={`data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup)}`}
          >
            Download SVG
          </a>
        </div>
      </div>
    </div>
  </div>
</section>
