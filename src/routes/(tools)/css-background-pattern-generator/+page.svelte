<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  type PatternType =
    | "horizontal-stripes"
    | "diagonal-stripes"
    | "dots"
    | "grid"
    | "zigzag"
    | "checkerboard"
    | "crosshatch"
    | "chevron";

  let pattern: PatternType = "horizontal-stripes";
  let colorA = "#1e293b";
  let colorB = "#38bdf8";
  let size = 12;
  let angle = 45;

  const controlId = {
    pattern: "css-pattern-type",
    primary: "css-pattern-primary",
    secondary: "css-pattern-secondary",
    size: "css-pattern-size",
    angle: "css-pattern-angle",
  } as const;

  $: css = buildCss(pattern, colorA, colorB, size, angle);

  function handlePrimaryHex(event: Event) {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    colorA = input.value;
  }

  function handleSecondaryHex(event: Event) {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    colorB = input.value;
  }

  function buildCss(
    type: PatternType,
    primary: string,
    secondary: string,
    unit: number,
    rotation: number,
  ) {
    switch (type) {
      case "horizontal-stripes":
        return `background-image: repeating-linear-gradient(0deg, ${primary}, ${primary} ${unit}px, ${secondary} ${unit}px, ${secondary} ${unit * 2}px);`;
      case "diagonal-stripes":
        return `background-image: repeating-linear-gradient(${rotation}deg, ${primary}, ${primary} ${unit}px, ${secondary} ${unit}px, ${secondary} ${unit * 2}px);`;
      case "dots":
        return `background-image: radial-gradient(circle at center, ${primary} 25%, transparent 26%), radial-gradient(circle at center, ${primary} 25%, transparent 26%);
background-size: ${unit * 2}px ${unit * 2}px;
background-position: 0 0, ${unit}px ${unit}px;
background-color: ${secondary};`;
      case "grid":
        return `background-image: linear-gradient(${primary} 1px, transparent 1px), linear-gradient(90deg, ${primary} 1px, transparent 1px);
background-size: ${unit}px ${unit}px;
background-color: ${secondary};`;
      case "zigzag":
        return `background-image: linear-gradient(${rotation}deg, ${primary} 25%, transparent 25%), linear-gradient(${rotation}deg, transparent 75%, ${primary} 75%), linear-gradient(${(rotation + 180) % 360}deg, ${primary} 25%, transparent 25%), linear-gradient(${(rotation + 180) % 360}deg, transparent 75%, ${primary} 75%);
background-size: ${unit * 4}px ${unit * 4}px;
background-position: 0 0, 0 0, ${unit * 2}px ${unit * 2}px, ${unit * 2}px ${unit * 2}px;
background-color: ${secondary};`;
      case "checkerboard": {
        const tile = unit * 2;
        return `background-image:
  linear-gradient(45deg, ${primary} 25%, transparent 25%, transparent 75%, ${primary} 75%),
  linear-gradient(-45deg, ${primary} 25%, transparent 25%, transparent 75%, ${primary} 75%);
background-size: ${tile}px ${tile}px;
background-position: 0 0, ${unit}px ${unit}px;
background-color: ${secondary};`;
      }
      case "crosshatch": {
        const stroke = Math.max(1, Math.round(unit / 4));
        const gap = Math.max(0, unit - stroke);
        return `background-image:
  repeating-linear-gradient(0deg, transparent 0 ${gap}px, ${primary} ${gap}px ${unit}px),
  repeating-linear-gradient(90deg, transparent 0 ${gap}px, ${primary} ${gap}px ${unit}px);
background-color: ${secondary};`;
      }
      case "chevron": {
        const height = unit * 4;
        const width = unit * 4;
        return `background-image:
  linear-gradient(${rotation}deg, ${primary} 25%, transparent 25%, transparent 50%, ${primary} 50%, ${primary} 75%, transparent 75%),
  linear-gradient(${(rotation + 180) % 360}deg, ${primary} 25%, transparent 25%, transparent 50%, ${primary} 50%, ${primary} 75%, transparent 75%);
background-size: ${width}px ${height}px;
background-color: ${secondary};`;
      }
    }
  }
</script>

<section class="space-y-6">
  <div
    class="flex flex-col-reverse gap-6 lg:grid lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)]"
  >
    <div class="space-y-4">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div
          class="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <div class="mx-auto aspect-[4/3] w-full max-w-3xl">
            <div
              class="h-full w-full rounded-xl border border-white/60 shadow-inner dark:border-white/10"
              style={css}
            />
          </div>
          <div
            class="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-slate-900/10 dark:from-white/10"
          ></div>
        </div>
        <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Try checkerboard or crosshatch for quick placeholders. Combine
          gradients to build dynamic hero backgrounds.
        </p>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
      >
        <div class="mb-2 flex items-center justify-between">
          <p
            class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            CSS output
          </p>
          <Copy text={css} customClass="!relative !top-auto !right-auto" />
        </div>
        <pre
          class="max-h-72 overflow-x-auto rounded-2xl bg-slate-900/90 p-4 text-[12px] text-emerald-300 shadow-inner dark:bg-black">{css}</pre>
      </div>
    </div>

    <div class="space-y-4">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="space-y-5">
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80"
          >
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              for={controlId.pattern}
            >
              Pattern type
            </label>
            <select
              class="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              id={controlId.pattern}
              bind:value={pattern}
            >
              <option value="horizontal-stripes">Horizontal stripes</option>
              <option value="diagonal-stripes">Diagonal stripes</option>
              <option value="dots">Halftone dots</option>
              <option value="grid">Grid</option>
              <option value="zigzag">Zigzag</option>
              <option value="checkerboard">Checkerboard</option>
              <option value="crosshatch">Crosshatch</option>
              <option value="chevron">Chevron</option>
            </select>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div
              class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <label
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                for={controlId.primary}
              >
                Primary color
              </label>
              <div class="mt-3 flex items-center gap-3">
                <input
                  class="h-12 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950"
                  type="color"
                  id={controlId.primary}
                  bind:value={colorA}
                />
                <input
                  class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-mono uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                  value={colorA}
                  on:input={handlePrimaryHex}
                  aria-label="Primary color hex value"
                />
              </div>
            </div>

            <div
              class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <label
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                for={controlId.secondary}
              >
                Secondary color
              </label>
              <div class="mt-3 flex items-center gap-3">
                <input
                  class="h-12 w-14 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950"
                  type="color"
                  id={controlId.secondary}
                  bind:value={colorB}
                />
                <input
                  class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-mono uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                  value={colorB}
                  on:input={handleSecondaryHex}
                  aria-label="Secondary color hex value"
                />
              </div>
            </div>
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div
              class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <label
                class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                for={controlId.size}
              >
                <span>Pattern size</span>
                <span>{size}px</span>
              </label>
              <input
                class="mt-2 w-full accent-indigo-600"
                type="range"
                min="4"
                max="40"
                step="1"
                id={controlId.size}
                bind:value={size}
              />
            </div>
            <div
              class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <label
                class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 {pattern ===
                  'diagonal-stripes' ||
                pattern === 'zigzag' ||
                pattern === 'chevron'
                  ? ''
                  : 'opacity-60'}"
                for={controlId.angle}
              >
                <span>Angle</span>
                <span>{angle}deg</span>
              </label>
              <input
                class="mt-2 w-full accent-indigo-600 disabled:opacity-40"
                type="range"
                min="0"
                max="180"
                step="1"
                id={controlId.angle}
                bind:value={angle}
                disabled={pattern !== "diagonal-stripes" &&
                  pattern !== "zigzag" &&
                  pattern !== "chevron"}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
