<script lang="ts">
  import { onMount } from "svelte";
  import Copy from "$lib/Copy.svelte";

  type Preset = {
    id: string;
    label: string;
    description: string;
    path: string;
    viewBox: string;
  };

  const PRESETS: Preset[] = [
    {
      id: "signature",
      label: "Signature stroke",
      description: "Organic stroke that mimics a quick pen flourish.",
      path: "M4 12C8 7 12 7 16 12C20 17 24 17 28 12C32 7 36 7 40 12",
      viewBox: "0 0 44 24",
    },
    {
      id: "checkmark",
      label: "Checkmark",
      description: "Classic success tick built from a three-point path.",
      path: "M2 12L10 20L28 4",
      viewBox: "0 0 32 24",
    },
    {
      id: "loop",
      label: "Loop arc",
      description: "A looping curve that works well for loading glyphs.",
      path: "M4 14C4 4 20 4 20 14C20 24 36 24 36 14",
      viewBox: "0 0 40 28",
    },
    {
      id: "pulse",
      label: "Heartbeat pulse",
      description: "Jagged pulse line useful for animated health indicators.",
      path: "M2 14H10L14 6L18 18L22 10L26 18H34",
      viewBox: "0 0 36 24",
    },
    {
      id: "star-loop",
      label: "Star loop",
      description:
        "Continuous looping star—great for subtle accent animations.",
      path: "M20 2L24.5 14H36L26.5 21.5L30.5 34L20 26.5L9.5 34L13.5 21.5L4 14H15.5Z",
      viewBox: "0 0 40 36",
    },
  ];

  const CUSTOM_PRESET = {
    id: "custom",
    label: "Custom path",
    description:
      "Paste any SVG path data and configure the animation settings.",
  };

  const EASES = [
    "ease",
    "ease-in",
    "ease-out",
    "ease-in-out",
    "linear",
    "cubic-bezier(0.4, 0, 0.2, 1)",
    "cubic-bezier(0.33, 1, 0.68, 1)",
  ];

  const controlId = {
    strokeColor: "svg-animator-stroke-color",
    fillColor: "svg-animator-fill-color",
    strokeWidth: "svg-animator-stroke-width",
    duration: "svg-animator-duration",
    delay: "svg-animator-delay",
  } as const;

  let activePreset = PRESETS[0].id;
  let svgContent = PRESETS[0].path;
  let viewBox = PRESETS[0].viewBox;
  let strokeColor = "#2563eb";
  let strokeWidth = 3;
  let fillColor = "transparent";
  let duration = 2;
  let delay = 0;
  let repeat = true;
  let easing = EASES[0];
  let reverse = false;

  let pathLength = 0;
  let pathElement: SVGPathElement | null = null;
  let previewSeed = 0;

  $: dashLength = Math.max(1, Math.round(pathLength));
  $: animationName = `svg-anim-${activePreset}`;
  $: iterationMode = repeat ? "infinite" : "forwards";
  $: dashStart = reverse ? dashLength : dashLength;
  $: dashEnd = reverse ? -dashLength : 0;
  $: animationCss = `@keyframes ${animationName} {
  0% { stroke-dashoffset: ${dashStart}; }
  100% { stroke-dashoffset: ${dashEnd}; }
}

.animate-preview path {
  fill: ${fillColor};
  stroke: ${strokeColor};
  stroke-width: ${strokeWidth};
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: ${dashLength};
  stroke-dashoffset: ${reverse ? 0 : dashLength};
  animation: ${animationName} ${duration}s ${easing} ${delay}s ${iterationMode};
  transform-origin: center;
  will-change: stroke-dashoffset;
}`;
  $: cssSnippet = animationCss;
  $: previewStyle = `<style>${animationCss}</style>`;
  $: animationTrigger = `${svgContent}|${viewBox}|${strokeColor}|${strokeWidth}|${fillColor}|${duration}|${delay}|${repeat}|${easing}|${reverse}|${previewSeed}`;
  $: selectedPreset =
    PRESETS.find((preset) => preset.id === activePreset) ?? CUSTOM_PRESET;

  onMount(() => {
    updateLength();
  });

  function updateLength() {
    if (!pathElement) return;
    try {
      pathLength = pathElement.getTotalLength();
    } catch {
      pathLength = 0;
    }
  }

  function applyPreset(preset: Preset) {
    activePreset = preset.id;
    svgContent = preset.path;
    viewBox = preset.viewBox;
    previewSeed += 1;
    requestAnimationFrame(updateLength);
  }

  function handlePathInput(event: Event) {
    const textarea = event.currentTarget as HTMLTextAreaElement | null;
    if (!textarea) return;
    svgContent = textarea.value;
    activePreset = CUSTOM_PRESET.id;
    requestAnimationFrame(updateLength);
  }

  function handleViewBoxInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    viewBox = input.value;
    activePreset = CUSTOM_PRESET.id;
  }

  function replay() {
    previewSeed += 1;
  }
</script>

<section class="space-y-6">
  <div
    class="flex flex-col-reverse gap-6 lg:grid lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)]"
  >
    <div class="space-y-4">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        {@html previewStyle}
        {#key animationTrigger}
          <svg
            class="animate-preview h-56 w-full rounded-2xl bg-slate-100 p-6 dark:bg-slate-900"
            {viewBox}
            fill={fillColor}
            stroke={strokeColor}
            stroke-width={strokeWidth}
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path bind:this={pathElement} d={svgContent} />
          </svg>
        {/key}
        <div class="mt-4 flex flex-wrap gap-3">
          <button
            class="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-700"
            type="button"
            on:click={replay}
          >
            Replay animation
          </button>
          <Copy
            text={`<svg viewBox="${viewBox}"><path d="${svgContent}" /></svg>`}
            label="Copy SVG"
            customClass="!relative !top-auto !right-auto"
          />
        </div>
        <p class="mt-3 text-xs text-slate-500 dark:text-slate-300">
          Hint: keep paths reasonably sized for smoother animations. Offset <code
            >stroke-dasharray</code
          > equals the total path length, so complex paths may benefit from simplification.
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
          <Copy
            text={cssSnippet}
            customClass="!relative !top-auto !right-auto"
          />
        </div>
        <pre
          class="max-h-72 overflow-x-auto rounded-2xl bg-slate-900/90 p-4 text-[12px] text-emerald-300 shadow-inner dark:bg-black">{cssSnippet}</pre>
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
            <div class="mb-2 flex items-center justify-between">
              <label
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Path data
              </label>
              <Copy
                text={svgContent}
                label="Copy path"
                customClass="!relative !top-auto !right-auto"
              />
            </div>
            <textarea
              class="mt-3 h-32 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-mono text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={svgContent}
              on:input={handlePathInput}
            />
            <label
              class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              ViewBox
            </label>
            <input
              class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-mono text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={viewBox}
              on:input={handleViewBoxInput}
            />
          </div>

          <div class="grid gap-4 sm:grid-cols-2">
            <div
              class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <label
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                for={controlId.strokeColor}
              >
                Stroke
              </label>
              <div class="mt-3 flex items-center gap-3">
                <input
                  class="h-12 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950"
                  type="color"
                  id={controlId.strokeColor}
                  bind:value={strokeColor}
                />
                <input
                  class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-mono uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                  bind:value={strokeColor}
                />
              </div>
            </div>

            <div
              class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <label
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                for={controlId.fillColor}
              >
                Fill
              </label>
              <div class="mt-3 flex items-center gap-3">
                <input
                  class="h-12 w-16 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950"
                  type="color"
                  id={controlId.fillColor}
                  bind:value={fillColor}
                />
                <input
                  class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-mono uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                  bind:value={fillColor}
                />
              </div>
            </div>

            <div
              class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <label
                class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                for={controlId.strokeWidth}
              >
                <span>Stroke width</span>
                <span>{strokeWidth}px</span>
              </label>
              <input
                class="mt-2 w-full accent-indigo-600"
                type="range"
                min="1"
                max="12"
                id={controlId.strokeWidth}
                bind:value={strokeWidth}
              />
            </div>
          </div>

          <div
            class="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Animation
            </p>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              <label
                class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                for={controlId.duration}
              >
                <span>Duration ({duration.toFixed(1)}s)</span>
                <input
                  class="w-full accent-indigo-600"
                  type="range"
                  min="0.5"
                  max="6"
                  step="0.1"
                  id={controlId.duration}
                  bind:value={duration}
                />
              </label>
              <label
                class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                for={controlId.delay}
              >
                <span>Delay ({delay.toFixed(1)}s)</span>
                <input
                  class="w-full accent-indigo-600"
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  id={controlId.delay}
                  bind:value={delay}
                />
              </label>
              <label
                class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                <span>Timing</span>
                <select
                  class="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                  bind:value={easing}
                >
                  {#each EASES as ease}
                    <option value={ease}>{ease}</option>
                  {/each}
                </select>
              </label>
              <div
                class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                <label class="inline-flex items-center gap-2">
                  <input
                    class="h-4 w-4 accent-indigo-600"
                    type="checkbox"
                    bind:checked={repeat}
                  />
                  <span>Loop</span>
                </label>
                <label class="inline-flex items-center gap-2">
                  <input
                    class="h-4 w-4 accent-indigo-600"
                    type="checkbox"
                    bind:checked={reverse}
                  />
                  <span>Reverse</span>
                </label>
              </div>
            </div>
          </div>

          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Presets
            </p>
            <div class="mt-3 grid gap-2 sm:grid-cols-2">
              {#each PRESETS as preset}
                <button
                  class={`rounded-xl border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 ${
                    activePreset === preset.id
                      ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300"
                      : "border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
                  }`}
                  type="button"
                  on:click={() => applyPreset(preset)}
                >
                  <span class="block font-semibold">{preset.label}</span>
                  <span
                    class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
                    >{preset.description}</span
                  >
                </button>
              {/each}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
