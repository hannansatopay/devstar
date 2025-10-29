<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import Copy from "$lib/Copy.svelte";

  type LoaderType = "spinner" | "dual-ring" | "bars" | "dots" | "progress";

  let type: LoaderType = "spinner";
  let color = "#6366f1";
  let size = 48;
  let speed = 1;

  $: cssSnippet = buildCss(type, color, size, speed);

  let styleEl: HTMLStyleElement | null = null;

  onMount(() => {
    styleEl = document.createElement("style");
    styleEl.textContent = `
      @keyframes loader-preview-spin { to { transform: rotate(360deg); } }
      @keyframes loader-preview-dual { 0% { transform: rotate(0deg); } 50% { transform: rotate(180deg); } 100% { transform: rotate(360deg); } }
      @keyframes loader-preview-bars { 0%,100% { transform: scaleY(0.4); opacity: 0.6; } 50% { transform: scaleY(1); opacity: 1; } }
      @keyframes loader-preview-dots { 0%,80%,100% { transform: scale(0.4); opacity: 0.5; } 40% { transform: scale(1); opacity: 1; } }
      @keyframes loader-preview-progress { 0% { transform: translateX(-100%); } 50% { transform: translateX(0%); } 100% { transform: translateX(100%); } }
    `;
    document.head.appendChild(styleEl);
  });

  onDestroy(() => {
    if (styleEl) {
      document.head.removeChild(styleEl);
      styleEl = null;
    }
  });

  function buildCss(
    loader: LoaderType,
    accent: string,
    dimension: number,
    duration: number,
  ) {
    switch (loader) {
      case "spinner":
        return `.loader {
  width: ${dimension}px;
  height: ${dimension}px;
  border: ${Math.max(2, Math.round(dimension / 8))}px solid ${withAlpha(accent, 0.2)};
  border-top-color: ${accent};
  border-radius: 9999px;
  animation: loader-spin ${duration}s linear infinite;
}

@keyframes loader-spin {
  to { transform: rotate(360deg); }
}`;
      case "dual-ring":
        return `.loader {
  width: ${dimension}px;
  height: ${dimension}px;
  border-radius: 9999px;
  border: ${Math.max(2, Math.round(dimension / 10))}px solid transparent;
  border-top-color: ${accent};
  border-left-color: ${accent};
  animation: loader-dual ${duration}s linear infinite;
}

@keyframes loader-dual {
  0% { transform: rotate(0deg); }
  50% { transform: rotate(180deg); }
  100% { transform: rotate(360deg); }
}`;
      case "bars":
        return `.loader {
  display: inline-flex;
  gap: ${Math.max(2, Math.round(dimension / 12))}px;
  height: ${dimension}px;
  align-items: flex-end;
}
.loader span {
  width: ${Math.max(4, Math.round(dimension / 8))}px;
  height: ${dimension * 0.3}px;
  background:${accent};
  border-radius: 9999px;
  animation: loader-bars ${duration}s ease-in-out infinite;
}
.loader span:nth-child(2) { animation-delay: ${duration / 6}s; }
.loader span:nth-child(3) { animation-delay: ${duration / 3}s; }

@keyframes loader-bars {
  0%, 100% { transform: scaleY(0.4); opacity: 0.6; }
  50% { transform: scaleY(1); opacity: 1; }
}`;
      case "dots":
        return `.loader {
  display: inline-flex;
  gap: ${Math.max(4, Math.round(dimension / 8))}px;
  align-items: center;
}
.loader span {
  width: ${Math.max(6, Math.round(dimension / 5))}px;
  height: ${Math.max(6, Math.round(dimension / 5))}px;
  border-radius: 9999px;
  background:${accent};
  animation: loader-dots ${duration}s ease-in-out infinite;
}
.loader span:nth-child(2) { animation-delay: ${duration / 3}s; }
.loader span:nth-child(3) { animation-delay: ${(duration / 3) * 2}s; }

@keyframes loader-dots {
  0%, 80%, 100% { transform: scale(0.4); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}`;
      case "progress":
        return `.loader {
  width: ${dimension * 4}px;
  height: ${Math.max(6, Math.round(dimension / 6))}px;
  border-radius: 9999px;
  background:${withAlpha(accent, 0.15)};
  overflow: hidden;
  position: relative;
}
.loader::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, ${accent}, transparent);
  animation: loader-progress ${duration}s ease-in-out infinite;
}

@keyframes loader-progress {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0%); }
  100% { transform: translateX(100%); }
}`;
    }
  }

  function withAlpha(hex: string, alpha: number) {
    const value = hex.replace("#", "");
    if (value.length !== 6) return hex;
    const r = Number.parseInt(value.slice(0, 2), 16);
    const g = Number.parseInt(value.slice(2, 4), 16);
    const b = Number.parseInt(value.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function handleColorInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    color = input.value;
  }
</script>

<section class="space-y-6">
  <div class="grid lg:grid-cols-2 gap-6">
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
              >Loader style</label
            >
            <select
              class="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={type}
            >
              <option value="spinner">Spinner</option>
              <option value="dual-ring">Dual ring</option>
              <option value="bars">Equalizer bars</option>
              <option value="dots">Bouncing dots</option>
              <option value="progress">Indeterminate bar</option>
            </select>
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Each style generates tailored CSS including keyframes.
            </p>
          </div>

          <div
            class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Accent color</label
            >
            <div class="mt-3 flex items-center gap-3">
              <input
                class="h-12 w-20 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950"
                type="color"
                bind:value={color}
              />
              <input
                class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-mono uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                value={color}
                on:input={handleColorInput}
              />
            </div>
          </div>

          <div
            class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <label
              class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Size</span>
              <span>{size}px</span>
            </label>
            <input
              class="mt-2 w-full accent-indigo-600"
              type="range"
              min="24"
              max="80"
              bind:value={size}
            />
          </div>

          <div
            class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <label
              class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Speed</span>
              <span>{speed.toFixed(2)}s</span>
            </label>
            <input
              class="mt-2 w-full accent-indigo-600"
              type="range"
              min="0.4"
              max="2.5"
              step="0.05"
              bind:value={speed}
            />
          </div>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div
          class="flex min-h-[8rem] items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-900"
        >
          {#if type === "spinner"}
            <div
              class="rounded-full border-b-transparent"
              style={`width:${size}px;height:${size}px;border:${Math.max(2, Math.round(size / 8))}px solid ${withAlpha(
                color,
                0.2,
              )};border-top-color:${color};border-radius:9999px;animation:loader-preview-spin ${speed}s linear infinite;`}
            />
          {:else if type === "dual-ring"}
            <div
              class="border-l-transparent border-t-transparent rounded-full"
              style={`width:${size}px;height:${size}px;border:${Math.max(2, Math.round(size / 10))}px solid ${color};border-color:${color} transparent ${color} transparent;animation:loader-preview-dual ${speed}s linear infinite;`}
            />
          {:else if type === "bars"}
            <div class="flex gap-2" style={`height:${size}px;`}>
              {#each Array(3) as _, idx}
                <span
                  class="inline-block rounded-full"
                  style={`width:${Math.max(4, Math.round(size / 8))}px;height:${size * 0.3}px;background:${color};animation:loader-preview-bars ${speed}s ease-in-out ${idx * (speed / 6)}s infinite;`}
                />
              {/each}
            </div>
          {:else if type === "dots"}
            <div class="flex items-center gap-3">
              {#each Array(3) as _, idx}
                <span
                  class="inline-block rounded-full"
                  style={`width:${Math.max(6, Math.round(size / 5))}px;height:${Math.max(6, Math.round(size / 5))}px;background:${color};animation:loader-preview-dots ${speed}s ease-in-out ${idx * (speed / 3)}s infinite;`}
                />
              {/each}
            </div>
          {:else if type === "progress"}
            <div
              class="relative overflow-hidden rounded-full"
              style={`width:${size * 4}px;height:${Math.max(6, Math.round(size / 6))}px;background:${withAlpha(color, 0.2)};`}
            >
              <span
                class="absolute inset-0 block"
                style={`background:linear-gradient(90deg, transparent, ${color}, transparent);animation:loader-preview-progress ${speed}s ease-in-out infinite;`}
              />
            </div>
          {/if}
        </div>
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
          <Copy
            text={cssSnippet}
            customClass="!relative !top-auto !right-auto"
          />
        </div>
        <pre
          class="max-h-64 overflow-x-auto rounded-2xl bg-slate-900/90 p-4 text-[12px] text-emerald-300 shadow-inner dark:bg-black">{cssSnippet}</pre>
      </div>
    </div>
  </div>
</section>
