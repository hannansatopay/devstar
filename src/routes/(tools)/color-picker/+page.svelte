<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import {
    adjustLightness,
    hexToRgb,
    normalizeHex,
    rgbToHsl,
    toCssHsl,
    toCssRgb,
  } from "$lib/utils/color.ts";

  const LIGHT_STEPS = [-40, -25, -10, 0, 10, 25, 40];

  let color = "#2563eb";
  let customHex = color;
  let history: string[] = [];
  let eyedropperSupported = false;

  if (typeof window !== "undefined" && "EyeDropper" in window) {
    eyedropperSupported = true;
  }

  $: normalized = normalizeHex(color);
  $: baseRgb = hexToRgb(normalized);
  $: baseHsl = rgbToHsl(baseRgb);
  $: variations = LIGHT_STEPS.map((step) => ({
    step,
    value: adjustLightness(normalized, step),
  }));

  function handleHexInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    customHex = input.value;
  }

  function applyCustomHex() {
    color = normalizeHex(customHex);
  }

  function recordHistory(newColor: string) {
    history = [newColor, ...history.filter((item) => item !== newColor)].slice(
      0,
      8,
    );
  }

  $: recordHistory(normalized);

  async function pickFromScreen() {
    if (!eyedropperSupported) {
      alert("The EyeDropper API is not supported in this browser.");
      return;
    }
    try {
      const eye = new (window as any).EyeDropper();
      const result = await eye.open();
      color = normalizeHex(result.sRGBHex);
      customHex = color;
    } catch {
      // ignored
    }
  }
</script>

<section class="space-y-6">
  <div
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <div class="space-y-4">
        <div
          class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80"
        >
          <div class="mt-3 flex items-center justify-between">
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Select color
            </label>
            <button
              class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400 dark:focus:ring-slate-800"
              type="button"
              on:click={applyCustomHex}
            >
              Apply
            </button>
          </div>
          <div class="mt-3 flex items-center gap-3">
            <input
              class="h-12 w-20 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950"
              type="color"
              bind:value={color}
            />
            <input
              class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-mono uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              value={customHex}
              on:input={handleHexInput}
            />
          </div>
          {#if eyedropperSupported}
            <button
              class="mt-3 inline-flex w-full items-center justify-center rounded-full border border-indigo-500 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-500/10 dark:focus:ring-indigo-700"
              type="button"
              on:click={pickFromScreen}
            >
              Pick from screen
            </button>
          {/if}
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div
            class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              HEX
            </h3>
            <p class="mt-2 font-mono text-lg text-slate-900 dark:text-white">
              {normalized.toUpperCase()}
            </p>
            <Copy
              text={normalized}
              customClass="!relative !top-auto !right-auto mt-4"
            />
          </div>
          <div
            class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              RGB
            </h3>
            <p class="mt-2 font-mono text-lg text-slate-900 dark:text-white">
              {toCssRgb(normalized)}
            </p>
            <Copy
              text={toCssRgb(normalized)}
              customClass="!relative !top-auto !right-auto mt-4"
            />
          </div>
          <div
            class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              HSL
            </h3>
            <p class="mt-2 font-mono text-lg text-slate-900 dark:text-white">
              {toCssHsl(normalized)}
            </p>
            <Copy
              text={toCssHsl(normalized)}
              customClass="!relative !top-auto !right-auto mt-4"
            />
          </div>
          <div
            class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <h3
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              HSL values
            </h3>
            <p class="mt-2 text-sm text-slate-700 dark:text-slate-200">
              H <span class="font-semibold text-indigo-600 dark:text-indigo-300"
                >{Math.round(baseHsl.h)}</span
              >° · S
              <span class="font-semibold text-indigo-600 dark:text-indigo-300"
                >{Math.round(baseHsl.s)}</span
              >% · L
              <span class="font-semibold text-indigo-600 dark:text-indigo-300"
                >{Math.round(baseHsl.l)}</span
              >%
            </p>
          </div>
        </div>
      </div>

      <div class="space-y-4">
        <div
          class="relative h-56 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <div
            class="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"
          />
          <div
            class="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent"
          />
          <div class="absolute inset-0" style={`background:${normalized};`} />
          <div class="relative flex h-full items-end justify-between p-6">
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-white/80"
              >
                Preview
              </p>
              <p class="text-lg font-semibold text-white drop-shadow">
                {normalized.toUpperCase()}
              </p>
            </div>
            <div
              class="flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-700 shadow dark:bg-slate-900/80 dark:text-slate-200"
            >
              <span
                class="h-3 w-3 rounded-full border border-slate-300"
                style={`background:${normalized};`}
              />
              L:{Math.round(baseHsl.l)}
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            History
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            {#each history as swatch}
              <button
                class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400 dark:focus:ring-slate-800"
                type="button"
                on:click={() => (color = swatch)}
              >
                <span
                  class="h-3 w-3 rounded-full border border-slate-200"
                  style={`background:${swatch};`}
                />
                {swatch.toUpperCase()}
              </button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>

  <div
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
  >
    <p
      class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
    >
      Tints & shades
    </p>
    <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {#each variations as item}
        <div
          class="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70"
        >
          <div class="h-20" style={`background:${item.value};`} />
          <div class="space-y-1 p-3 text-xs">
            <p
              class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              {item.step === 0
                ? "Base tone"
                : item.step > 0
                  ? `Tint +${item.step}`
                  : `Shade ${item.step}`}
            </p>
            <p class="font-mono text-slate-700 dark:text-slate-200">
              {item.value.toUpperCase()}
            </p>
            <p class="font-mono text-slate-500 dark:text-slate-400">
              {toCssRgb(item.value)}
            </p>
            <Copy
              text={item.value}
              customClass="!relative !top-auto !right-auto"
            />
          </div>
        </div>
      {/each}
    </div>
  </div>
</section>
