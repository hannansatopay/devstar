<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  type AnimationPreset = {
    id: string;
    label: string;
    description: string;
    keyframes: (name: string) => string;
  };

  const PRESETS: AnimationPreset[] = [
    {
      id: "fade-up",
      label: "Fade up",
      description: "Soft fade with a subtle upward drift.",
      keyframes: (name) => `@keyframes ${name} {
  0% { opacity: 0; transform: translateY(18px); }
  60% { opacity: 1; }
  100% { opacity: 1; transform: translateY(0); }
}`,
    },
    {
      id: "pop-bounce",
      label: "Pop bounce",
      description: "Bouncy entrance with a spring feel.",
      keyframes: (name) => `@keyframes ${name} {
  0% { transform: scale(0.7); opacity: 0; }
  60% { transform: scale(1.05); opacity: 1; }
  80% { transform: scale(0.95); }
  100% { transform: scale(1); opacity: 1; }
}`,
    },
    {
      id: "slide-left",
      label: "Slide in (left)",
      description: "Slides from the left edge while fading in.",
      keyframes: (name) => `@keyframes ${name} {
  0% { transform: translateX(-40px); opacity: 0; }
  100% { transform: translateX(0); opacity: 1; }
}`,
    },
    {
      id: "flip-card",
      label: "Flip card",
      description: "3D flip animation perfect for card reveals.",
      keyframes: (name) => `@keyframes ${name} {
  0% { transform: rotateY(-90deg); opacity: 0; }
  50% { opacity: 1; }
  100% { transform: rotateY(0deg); opacity: 1; }
}`,
    },
    {
      id: "pulse-glow",
      label: "Pulse glow",
      description: "Continuous pulsing with glow emphasis.",
      keyframes: (name) => `@keyframes ${name} {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); }
  50% { transform: scale(1.05); box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
}`,
    },
    {
      id: "swing",
      label: "Swing",
      description: "Swinging motion around the top edge.",
      keyframes: (name) => `@keyframes ${name} {
  0% { transform: rotate(0deg); }
  20% { transform: rotate(12deg); }
  40% { transform: rotate(-9deg); }
  60% { transform: rotate(6deg); }
  80% { transform: rotate(-4deg); }
  100% { transform: rotate(0deg); }
}`,
    },
  ];

  const TIMINGS = [
    "ease",
    "ease-in",
    "ease-out",
    "ease-in-out",
    "linear",
    "cubic-bezier(0.4, 0, 0.2, 1)",
    "cubic-bezier(0.34, 1.56, 0.64, 1)",
  ];

  const DIRECTIONS = ["normal", "reverse", "alternate", "alternate-reverse"];

  let selectedId = PRESETS[0].id;
  let duration = 0.9;
  let delay = 0;
  let iterations = 1;
  let infinite = false;
  let timing = TIMINGS[0];
  let direction = DIRECTIONS[0];
  let previewSeed = 0;

  $: animationName = `anim-${selectedId}`;
  $: selectedPreset =
    PRESETS.find((preset) => preset.id === selectedId) ?? PRESETS[0];
  $: iterationString = infinite ? "infinite" : `${Math.max(iterations, 1)}`;
  $: animationDeclaration = `${animationName} ${duration.toFixed(2)}s ${timing} ${delay.toFixed(2)}s ${iterationString} ${direction}`;
  $: keyframesCss = selectedPreset.keyframes(animationName);
  $: cssSnippet = `${keyframesCss}

.animate-demo {
  animation: ${animationDeclaration};
  transform-origin: center;
  will-change: transform, opacity;
}`;
  $: previewStyle = `<style>${keyframesCss}</style>`;
  $: animationTrigger = `${selectedId}|${duration}|${delay}|${iterations}|${infinite}|${timing}|${direction}|${previewSeed}`;
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-2">
    <div class="space-y-4">
      <div
        class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80"
      >
        <label
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Animation preset
        </label>
        <select
          class="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={selectedId}
        >
          {#each PRESETS as preset}
            <option value={preset.id}>{preset.label}</option>
          {/each}
        </select>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {selectedPreset.description}
        </p>
      </div>

      <div class="grid gap-4 sm:grid-cols-2">
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <label
            class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Duration</span>
            <span>{duration.toFixed(2)}s</span>
          </label>
          <input
            class="mt-2 w-full accent-indigo-600"
            type="range"
            min="0.1"
            max="3"
            step="0.05"
            bind:value={duration}
          />
        </div>
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <label
            class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Delay</span>
            <span>{delay.toFixed(2)}s</span>
          </label>
          <input
            class="mt-2 w-full accent-indigo-600"
            type="range"
            min="0"
            max="3"
            step="0.05"
            bind:value={delay}
          />
        </div>
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <label
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Timing function
          </label>
          <select
            class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={timing}
          >
            {#each TIMINGS as value}
              <option {value}>{value}</option>
            {/each}
          </select>
        </div>
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <label
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Direction
          </label>
          <select
            class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={direction}
          >
            {#each DIRECTIONS as value}
              <option {value}>{value}</option>
            {/each}
          </select>
        </div>
        <div
          class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <label
            class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Iterations</span>
            <span>{infinite ? "∞" : iterations}</span>
          </label>
          <input
            class="mt-2 w-full accent-indigo-600"
            type="range"
            min="1"
            max="10"
            step="1"
            bind:value={iterations}
            disabled={infinite}
          />
          <label
            class="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <input
              class="h-4 w-4 accent-indigo-600"
              type="checkbox"
              bind:checked={infinite}
            />
            Infinite
          </label>
        </div>
      </div>
    </div>

    <div class="space-y-4">
      <div
        class="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 via-slate-50 to-white p-6 shadow-sm dark:border-slate-800 dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-950 dark:to-slate-900"
      >
        <div
          class="flex h-48 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white/70 dark:border-slate-800 dark:bg-slate-900"
        >
          {@html previewStyle}
          {#key animationTrigger}
            <div
              class="animate-demo relative flex h-28 w-28 items-center justify-center rounded-2xl bg-indigo-500 text-lg font-semibold text-white shadow-lg dark:bg-indigo-400"
              style={`animation: ${animationDeclaration}; transform-origin:center; will-change:transform,opacity;`}
            >
              Play
            </div>
          {/key}
        </div>
        <button
          class="mt-4 inline-flex w-full items-center justify-center rounded-full border border-indigo-500 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-500/10 dark:focus:ring-indigo-700"
          type="button"
          on:click={() => {
            previewSeed += 1;
          }}
        >
          Replay animation
        </button>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
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
          class="max-h-64 overflow-x-auto rounded-lg bg-slate-900/90 p-4 text-[12px] text-emerald-300 shadow-inner dark:bg-black">{cssSnippet}</pre>
      </div>
    </div>
  </div>
</section>
