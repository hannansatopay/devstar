<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import { adjustLightness, normalizeHex, toCssRgb } from "$lib/utils/color";

  const PRESETS = [
    { label: "Soft card", radius: 32, distance: 18, blur: 42, intensity: 18 },
    {
      label: "Rounded button",
      radius: 60,
      distance: 12,
      blur: 30,
      intensity: 16,
    },
    {
      label: "Pill control",
      radius: 999,
      distance: 10,
      blur: 26,
      intensity: 14,
    },
    {
      label: "Pressed inset",
      radius: 28,
      distance: -12,
      blur: 24,
      intensity: 20,
    },
  ];

  let surfaceColor = "#e2e8f0";
  let elementRadius = 32;
  let distance = 18;
  let blur = 42;
  let intensity = 18;
  let size = 220;
  let inset = false;

  $: normalizedColor = normalizeHex(surfaceColor);
  $: highlightColor = adjustLightness(normalizedColor, intensity);
  $: shadowColor = adjustLightness(normalizedColor, -intensity);
  $: shadowDistance = Math.abs(distance);
  $: boxShadow = inset
    ? `inset ${shadowDistance}px ${shadowDistance}px ${blur}px ${withAlpha(shadowColor, 0.45)}, inset -${shadowDistance}px -${shadowDistance}px ${blur}px ${withAlpha(highlightColor, 0.8)}`
    : `-${shadowDistance}px -${shadowDistance}px ${blur}px ${withAlpha(highlightColor, 0.85)}, ${shadowDistance}px ${shadowDistance}px ${blur}px ${withAlpha(shadowColor, 0.45)}`;
  $: cssSnippet = `:root {
  --surface: ${normalizedColor};
  --shadow: ${withAlpha(shadowColor, 0.45)};
  --highlight: ${withAlpha(highlightColor, 0.85)};
}

body {
  background: var(--surface);
  font-family: system-ui, sans-serif;
}

.neo-card {
  width: ${size}px;
  height: ${size}px;
  border-radius: ${elementRadius}px;
  background: var(--surface);
  box-shadow: ${boxShadow};
  display: grid;
  place-items: center;
  color: ${getTextColor(normalizedColor)};
  letter-spacing: 0.08em;
  text-transform: uppercase;
}`;

  function applyPreset(preset: (typeof PRESETS)[number]) {
    elementRadius = preset.radius;
    distance = preset.distance;
    blur = preset.blur;
    intensity = preset.intensity;
    inset = preset.distance < 0;
  }

  function handleSurfaceHexInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    surfaceColor = normalizeHex(input.value);
  }

  function withAlpha(hex: string, alpha: number) {
    const normalized = hex.replace("#", "");
    const bigint = Number.parseInt(normalized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function getTextColor(hex: string) {
    const rgb = toCssRgb(hex)
      .replace(/[^\d,]/g, "")
      .split(",")
      .map((value) => Number.parseInt(value.trim(), 10));
    const luminance = (0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2]) / 255;
    return luminance > 0.6
      ? "rgba(15, 23, 42, 0.75)"
      : "rgba(255, 255, 255, 0.65)";
  }
</script>

<section class="space-y-6">
  <div
    class="gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
  >
    <div class="space-y-6">
      <div
        class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
        >
          Surface color
        </p>
        <div class="mt-3 flex items-center gap-3">
          <input
            class="h-12 w-20 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950"
            type="color"
            bind:value={surfaceColor}
          />
          <input
            class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-mono uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            value={normalizedColor}
            on:input={handleSurfaceHexInput}
          />
        </div>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <label
            class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
          >
            <span>Radius</span>
            <span>{Math.round(elementRadius)}px</span>
          </label>
          <input
            class="mt-2 w-full accent-indigo-600"
            type="range"
            min="4"
            max="160"
            bind:value={elementRadius}
          />
        </div>
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <label
            class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
          >
            <span>Element size</span>
            <span>{Math.round(size)}px</span>
          </label>
          <input
            class="mt-2 w-full accent-indigo-600"
            type="range"
            min="120"
            max="320"
            bind:value={size}
          />
        </div>
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <label
            class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
          >
            <span>Distance</span>
            <span>{distance}px</span>
          </label>
          <input
            class="mt-2 w-full accent-indigo-600"
            type="range"
            min="-24"
            max="24"
            bind:value={distance}
          />
        </div>
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <label
            class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
          >
            <span>Blur</span>
            <span>{Math.round(blur)}px</span>
          </label>
          <input
            class="mt-2 w-full accent-indigo-600"
            type="range"
            min="8"
            max="80"
            bind:value={blur}
          />
        </div>
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <label
            class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
          >
            <span>Intensity</span>
            <span>{Math.round(intensity)}%</span>
          </label>
          <input
            class="mt-2 w-full accent-indigo-600"
            type="range"
            min="6"
            max="26"
            bind:value={intensity}
          />
        </div>
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <label
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
            >Mode</label
          >
          <div class="mt-3 flex gap-3">
            <button
              class={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                inset
                  ? "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-200"
                  : "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300"
              }`}
              type="button"
              on:click={() => (inset = false)}
            >
              Raise
            </button>
            <button
              class={`flex-1 rounded-full border px-3 py-2 text-xs font-semibold uppercase tracking-wide transition ${
                inset
                  ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300"
                  : "border-slate-300 text-slate-600 dark:border-slate-700 dark:text-slate-200"
              }`}
              type="button"
              on:click={() => (inset = true)}
            >
              Press
            </button>
          </div>
        </div>
      </div>

      <div
        class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
        >
          Presets
        </p>
        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          {#each PRESETS as preset}
            <button
              class="rounded-xl border border-slate-300 bg-white px-4 py-3 text-left text-sm text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300 dark:focus:ring-indigo-900"
              type="button"
              on:click={() => applyPreset(preset)}
            >
              <span class="block font-semibold">{preset.label}</span>
              <span
                class="mt-1 block text-xs text-slate-500 dark:text-slate-300"
              >
                radius {preset.radius}px | distance {preset.distance}px | blur {preset.blur}px
              </span>
            </button>
          {/each}
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div
        class="relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 via-slate-50 to-white p-6 shadow-sm dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"
        style={`background:${normalizedColor}`}
      >
        <div class="flex h-80 items-center justify-center">
          <div
            class="neo-card text-sm font-semibold uppercase tracking-[0.3em] text-slate-600 dark:text-slate-200"
            style={`width:${size}px;height:${size}px;border-radius:${elementRadius}px;background:${normalizedColor};box-shadow:${boxShadow};color:${getTextColor(normalizedColor)};`}
          />
        </div>
        <div class="mt-4 grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
          <div
            class="flex items-center rounded-xl justify-between rounded-lg border border-white/60 bg-white px-3 py-2 backdrop-blur"
          >
            <span>Highlight</span>
            <span class="font-mono">{withAlpha(highlightColor, 0.85)}</span>
          </div>
          <div
            class="flex items-center rounded-xl justify-between rounded-lg border border-white/60 bg-white px-3 py-2 backdrop-blur"
          >
            <span>Shadow</span>
            <span class="font-mono">{withAlpha(shadowColor, 0.45)}</span>
          </div>
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
      >
        <div class="mb-2 flex items-center justify-between">
          <p
            class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
          >
            CSS output
          </p>
          <Copy
            text={cssSnippet}
            customClass="!relative !top-auto !right-auto"
          />
        </div>
        <pre
          class="overflow-x-auto rounded-lg bg-slate-900/90 p-4 text-[12px] text-emerald-300 shadow-inner dark:bg-black">{cssSnippet}</pre>
      </div>
    </div>
  </div>
</section>
