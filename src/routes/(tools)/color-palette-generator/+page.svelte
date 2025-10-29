<script lang="ts">
  import { onMount } from "svelte";
  import Copy from "$lib/Copy.svelte";
  import {
    adjustLightness,
    blend,
    normalizeHex,
    rotateHue,
    toCssHsl,
    toCssRgb,
  } from "$lib/utils/color";

  type GeneratorMode =
    | "curated"
    | "analogous"
    | "triadic"
    | "complementary"
    | "random";

  const DEFAULT_COUNT = 5;

  let baseColor = "#2563eb";
  let mode: GeneratorMode = "curated";
  let count = DEFAULT_COUNT;
  let palette: string[] = [];
  let cssTokens = "";

  let lockedStates: boolean[] = [];
  let lockedColors: (string | null)[] = [];

  $: normalizedBase = normalizeHex(baseColor);
  $: ensureLockArrays(count);
  $: palette = generatePalette(mode, normalizedBase, count);
  $: cssTokens = palette
    .map((color, index) => `--color-${index + 1}: ${color};`)
    .join("\n");

  onMount(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const tagName = (event.target as HTMLElement | null)?.tagName ?? "";
      if (event.code === "Space" && !["INPUT", "TEXTAREA"].includes(tagName)) {
        event.preventDefault();
        shufflePalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  function ensureLockArrays(size: number) {
    if (lockedStates.length < size) {
      lockedStates = [
        ...lockedStates,
        ...Array(size - lockedStates.length).fill(false),
      ];
    } else if (lockedStates.length > size) {
      lockedStates = lockedStates.slice(0, size);
    }

    if (lockedColors.length < size) {
      lockedColors = [
        ...lockedColors,
        ...Array(size - lockedColors.length).fill(null),
      ];
    } else if (lockedColors.length > size) {
      lockedColors = lockedColors.slice(0, size);
    }
  }

  function generatePalette(
    generator: GeneratorMode,
    color: string,
    size: number,
  ) {
    ensureLockArrays(size);

    const basePalette = computeBasePalette(generator, color, size);
    const previousLocked = lockedColors;

    const nextLocked = basePalette.map((value, index) => {
      if (lockedStates[index]) {
        return previousLocked[index] ?? normalizeHex(value);
      }
      return null;
    });

    lockedColors = nextLocked;
    return basePalette.map((value, index) => nextLocked[index] ?? value);
  }

  function computeBasePalette(
    generator: GeneratorMode,
    color: string,
    size: number,
  ) {
    switch (generator) {
      case "curated":
        return curatedPalette(color, size);
      case "analogous":
        return analogousPalette(color, size);
      case "triadic":
        return triadicPalette(color, size);
      case "complementary":
        return complementaryPalette(color, size);
      case "random":
        return randomPalette(size);
      default:
        return curatedPalette(color, size);
    }
  }

  function curatedPalette(color: string, size: number) {
    const seen = new Set<string>();
    const results: string[] = [];
    const base = normalizeHex(color);
    const complement = rotateHue(base, 180);

    pushUnique(results, base, seen);

    const hueOffsets = [-30, 26, 180, 120, -120, 210, -210, 60, -60];
    hueOffsets.forEach((offset) =>
      pushUnique(results, rotateHue(base, offset), seen),
    );

    const tonalVariations = [
      adjustLightness(base, 16),
      adjustLightness(base, -20),
      adjustLightness(complement, 18),
      adjustLightness(complement, -16),
      adjustLightness(rotateHue(base, 32), 12),
      adjustLightness(rotateHue(base, -32), -14),
      blend(base, complement, 0.32),
      blend(base, rotateHue(base, 120), 0.45),
    ];
    tonalVariations.forEach((hex) => pushUnique(results, hex, seen));

    while (results.length < size) {
      pushUnique(results, randomHex(), seen);
    }

    return results.slice(0, size);
  }

  function analogousPalette(color: string, size: number) {
    const seen = new Set<string>();
    const results: string[] = [];
    const spread = 80;

    for (let index = 0; index < size; index += 1) {
      const ratio = size === 1 ? 0 : index / (size - 1);
      const offset = -spread / 2 + ratio * spread;
      const rotated = rotateHue(color, offset);
      const lightShift = [12, -14, 6][index % 3];
      pushUnique(results, adjustLightness(rotated, lightShift), seen);
    }

    while (results.length < size) {
      pushUnique(results, randomHex(), seen);
    }

    return results.slice(0, size);
  }

  function triadicPalette(color: string, size: number) {
    const seen = new Set<string>();
    const results: string[] = [];
    const base = normalizeHex(color);
    const triadA = rotateHue(base, 120);
    const triadB = rotateHue(base, -120);

    [base, triadA, triadB].forEach((hex) => pushUnique(results, hex, seen));
    const tonal = [
      adjustLightness(base, 20),
      adjustLightness(base, -18),
      adjustLightness(triadA, 14),
      adjustLightness(triadB, -14),
      blend(base, triadA, 0.4),
    ];
    tonal.forEach((hex) => pushUnique(results, hex, seen));

    while (results.length < size) {
      pushUnique(results, randomHex(), seen);
    }

    return results.slice(0, size);
  }

  function complementaryPalette(color: string, size: number) {
    const seen = new Set<string>();
    const results: string[] = [];
    const base = normalizeHex(color);
    const complement = rotateHue(base, 180);

    [base, complement, rotateHue(base, 24), rotateHue(base, -24)].forEach(
      (hex) => pushUnique(results, hex, seen),
    );
    const tonal = [
      adjustLightness(base, 18),
      adjustLightness(base, -22),
      adjustLightness(complement, 18),
      adjustLightness(complement, -18),
      blend(base, complement, 0.45),
    ];
    tonal.forEach((hex) => pushUnique(results, hex, seen));

    while (results.length < size) {
      pushUnique(results, randomHex(), seen);
    }

    return results.slice(0, size);
  }

  function randomPalette(size: number) {
    const seen = new Set<string>();
    const results: string[] = [];

    while (results.length < size) {
      pushUnique(results, randomHex(), seen);
    }

    return results;
  }

  function pushUnique(collection: string[], hex: string, seen: Set<string>) {
    const normalized = normalizeHex(hex);
    if (!seen.has(normalized)) {
      seen.add(normalized);
      collection.push(normalized);
    }
  }

  function randomHex() {
    return `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;
  }

  function handleBaseHexInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    baseColor = normalizeHex(input.value);
  }

  function shufflePalette() {
    baseColor = randomHex();
    palette = generatePalette(mode, normalizeHex(baseColor), count);
  }

  function refreshPalette() {
    palette = generatePalette(mode, normalizedBase, count);
  }

  function toggleLock(index: number) {
    ensureLockArrays(count);
    lockedStates = lockedStates.map((value, idx) =>
      idx === index ? !value : value,
    );

    const updated = lockedColors.slice();
    if (lockedStates[index]) {
      updated[index] = normalizeHex(palette[index]);
    } else {
      updated[index] = null;
    }
    lockedColors = updated;
    palette = generatePalette(mode, normalizedBase, count);
  }

  function getReadableText(hex: string) {
    const rgb = toCssRgb(hex).match(/\d+/g)?.map(Number) ?? [0, 0, 0];
    const luminance =
      (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    return luminance > 0.6 ? "#0f172a" : "#f8fafc";
  }

  function getMutedText(hex: string) {
    const primary = getReadableText(hex);
    return primary === "#f8fafc"
      ? "rgba(248, 250, 252, 0.72)"
      : "rgba(15, 23, 42, 0.66)";
  }
</script>

<section class="space-y-6">
  <div
    class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 lg:flex-row lg:items-center lg:justify-between"
  >
    <label
      class="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
    >
      <span>Base</span>
      <input
        class="h-10 w-10 cursor-pointer rounded-full border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950"
        type="color"
        bind:value={baseColor}
      />
      <input
        class="w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-[13px] font-mono uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400"
        value={normalizedBase}
        on:input={handleBaseHexInput}
      />
    </label>

    <label
      class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
    >
      <span>Harmony</span>
      <select
        class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
        bind:value={mode}
      >
        <option value="curated">Curated (Coolors-style)</option>
        <option value="analogous">Analogous arc</option>
        <option value="triadic">Triadic spread</option>
        <option value="complementary">Complementary mix</option>
        <option value="random">Freestyle random</option>
      </select>
    </label>

    <label
      class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
    >
      <span>Count</span>
      <div class="flex items-center gap-3">
        <input
          class="w-40 accent-indigo-600"
          type="range"
          min="3"
          max="10"
          bind:value={count}
        />
        <span class="text-sm text-slate-600 dark:text-slate-300">{count}</span>
      </div>
    </label>

    <button
      class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-300 dark:focus:ring-indigo-900"
      type="button"
      on:click={refreshPalette}
    >
      Update
    </button>

    <button
      class="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-700"
      type="button"
      on:click={shufflePalette}
    >
      Shuffle
      <span
        class="text-xs uppercase tracking-wide text-indigo-200/80 dark:text-indigo-100/90"
        >Space</span
      >
    </button>
  </div>

  <div
    class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
  >
    {#each palette as color, index}
      <div
        class="group relative flex-1 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/90"
        style={`background:${color};`}
      >
        <button
          class="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm backdrop-blur transition hover:bg-white dark:bg-slate-900/80 dark:text-slate-200"
          type="button"
          on:click={() => toggleLock(index)}
        >
          {lockedStates[index] ? "Locked" : "Lock"}
        </button>

        <div
          class="flex h-64 flex-col justify-between p-6"
          style={`color:${getReadableText(color)};`}
        >
          <div
            class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide"
            style={`color:${getMutedText(color)};`}
          >
            <span>Color {index + 1}</span>
          </div>

          <div class="space-y-3">
            <div>
              <p class="text-3xl font-semibold tracking-wide">
                {color.toUpperCase()}
              </p>
              <p class="text-sm" style={`color:${getMutedText(color)};`}>
                {toCssRgb(color)}
              </p>
              <p class="text-sm" style={`color:${getMutedText(color)};`}>
                {toCssHsl(color)}
              </p>
            </div>
            <Copy
              text={color}
              customClass="!relative !top-auto !right-auto inline-flex items-center"
            />
          </div>
        </div>
      </div>
    {/each}
  </div>

  <div
    class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="flex items-center justify-between">
      <p
        class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        CSS variables
      </p>
      <Copy text={cssTokens} customClass="!relative !top-auto !right-auto" />
    </div>
    <pre
      class="mt-3 overflow-x-auto rounded-2xl bg-slate-900/95 p-4 text-[12px] text-emerald-300 shadow-inner dark:bg-black">{cssTokens}</pre>
  </div>
</section>
