<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import {
    adjustLightness,
    blend,
    normalizeHex,
    rotateHue,
    toCssHsl,
    toCssRgb,
  } from "../../../lib/utils/color";

  const LIGHTNESS_STEPS = [-30, -20, -10, 0, 10, 20, 30];

  let baseColor = "#6750ff";
  let paletteSize = 5;
  let harmonyMode: "analogous" | "triadic" | "tetradic" | "split" = "analogous";

  $: normalized = normalizeHex(baseColor);
  $: shades = LIGHTNESS_STEPS.map((offset) => ({
    label:
      offset === 0
        ? "Base"
        : offset > 0
          ? `Light +${offset}`
          : `Dark ${offset}`,
    value: adjustLightness(normalized, offset),
  }));

  $: complementary = rotateHue(normalized, 180);
  $: triadic = [rotateHue(normalized, 120), rotateHue(normalized, -120)];
  $: analogous = [
    rotateHue(normalized, -30),
    normalized,
    rotateHue(normalized, 30),
  ];
  $: split = [
    rotateHue(normalized, -150),
    normalized,
    rotateHue(normalized, 150),
  ];
  $: tetradic = [
    normalized,
    rotateHue(normalized, 90),
    rotateHue(normalized, 180),
    rotateHue(normalized, 270),
  ];

  $: harmony = (() => {
    switch (harmonyMode) {
      case "analogous":
        return expandPalette(analogous, paletteSize);
      case "triadic":
        return expandPalette([normalized, ...triadic], paletteSize);
      case "tetradic":
        return expandPalette(tetradic, paletteSize);
      case "split":
        return expandPalette(split, paletteSize);
    }
  })();

  function expandPalette(colors: string[], desired: number) {
    if (desired <= 1) {
      return [colors[0] ?? normalized];
    }
    if (desired <= colors.length) {
      return colors.slice(0, desired);
    }
    const result: string[] = [];
    const steps = desired - 1;
    for (let index = 0; index <= steps; index += 1) {
      const ratio = steps === 0 ? 0 : index / steps;
      const from =
        colors[Math.floor((index / steps) * (colors.length - 1))] ?? colors[0];
      const to =
        colors[
          Math.min(
            Math.floor((index / steps) * (colors.length - 1) + 1),
            colors.length - 1,
          )
        ] ??
        colors.at(-1) ??
        normalized;
      result.push(blend(from, to, ratio % 1));
    }
    return result.slice(0, desired);
  }

  function randomColor() {
    baseColor = `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;
  }

  function handleHexChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    baseColor = normalizeHex(input.value);
  }

  $: harmoniesList = [
    { title: "Complementary", colors: [normalized, complementary] },
    { title: "Triadic", colors: [normalized, ...triadic] },
    { title: "Analogous", colors: analogous },
    { title: "Split complementary", colors: split },
    { title: "Tetradic", colors: tetradic },
  ];
</script>

<section class="space-y-6">
  <div class="gap-6 md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
    <div class="space-y-6">
      <div
        class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80"
      >
        <label
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Base color
        </label>
        <div class="mt-3 flex items-center gap-3">
          <input
            class="h-12 w-20 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950"
            type="color"
            bind:value={baseColor}
          />
          <input
            class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-mono uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            value={normalized}
            on:input={handleHexChange}
          />
          <button
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400 dark:focus:ring-slate-800"
            type="button"
            on:click={randomColor}
          >
            Surprise me
          </button>
        </div>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              RGB
            </p>
            <p
              class="mt-1 text-sm font-mono text-slate-700 dark:text-slate-200"
            >
              {toCssRgb(normalized)}
            </p>
          </div>
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              HSL
            </p>
            <p
              class="mt-1 text-sm font-mono text-slate-700 dark:text-slate-200"
            >
              {toCssHsl(normalized)}
            </p>
          </div>
        </div>
      </div>

      <div
        class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex flex-wrap items-center gap-4">
          <div class="flex items-center gap-2">
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Palette mode
            </label>
            <select
              class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs uppercase tracking-wide text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={harmonyMode}
            >
              <option value="analogous">Analogous</option>
              <option value="triadic">Triadic</option>
              <option value="tetradic">Tetradic</option>
              <option value="split">Split complementary</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Colors
            </label>
            <input
              class="w-32 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="3"
              max="10"
              bind:value={paletteSize}
            />
          </div>
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {#each harmony as color, index}
            <div
              class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div class="h-20" style={`background:${color};`} />
              <div class="space-y-1 p-3 text-xs">
                <p
                  class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Palette {index + 1}
                </p>
                <p class="font-mono text-slate-700 dark:text-slate-200">
                  {color.toUpperCase()}
                </p>
                <p class="font-mono text-slate-500 dark:text-slate-400">
                  {toCssRgb(color)}
                </p>
                <p class="font-mono text-slate-500 dark:text-slate-400">
                  {toCssHsl(color)}
                </p>
                <Copy
                  text={color}
                  customClass="!relative !top-auto !right-auto"
                />
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Shade ladder
        </p>
        <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {#each shades as shade}
            <div
              class="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
            >
              <div class="h-20" style={`background:${shade.value};`} />
              <div class="space-y-1 p-3 text-xs">
                <p
                  class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  {shade.label}
                </p>
                <p class="font-mono text-slate-700 dark:text-slate-200">
                  {shade.value.toUpperCase()}
                </p>
                <p class="font-mono text-slate-500 dark:text-slate-400">
                  {toCssRgb(shade.value)}
                </p>
                <p class="font-mono text-slate-500 dark:text-slate-400">
                  {toCssHsl(shade.value)}
                </p>
                <Copy
                  text={shade.value}
                  customClass="!relative !top-auto !right-auto"
                />
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Color harmonies
        </p>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          {#each harmoniesList as group}
            <div
              class="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/70"
            >
              <div class="flex items-center justify-between gap-2">
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  {group.title}
                </p>
                <Copy
                  text={group.colors.join(", ")}
                  customClass="!relative !top-auto !right-auto"
                />
              </div>
              <div class="flex gap-2">
                {#each group.colors as color}
                  <div
                    class="flex-1 overflow-hidden rounded-lg border border-white/40 shadow-sm dark:border-slate-800"
                  >
                    <div class="h-12" style={`background:${color};`} />
                    <p
                      class="px-2 py-1 text-center text-[11px] font-mono text-slate-600 dark:text-slate-300"
                    >
                      {color.toUpperCase()}
                    </p>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
