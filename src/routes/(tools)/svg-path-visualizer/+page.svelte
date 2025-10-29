<script lang="ts">
  import { onMount } from "svelte";
  import Copy from "$lib/Copy.svelte";

  type Sample = {
    id: string;
    name: string;
    description: string;
    path: string;
    viewBox: string;
  };

  const SAMPLES: Sample[] = [
    {
      id: "wave",
      name: "Wave",
      description: "Smooth bezier curve — great for decorative line work.",
      path: "M4 32C16 12 32 12 44 32C56 52 72 52 84 32",
      viewBox: "0 0 88 64",
    },
    {
      id: "heart",
      name: "Heart",
      description: "Closed heart shape built with cubic curves.",
      path: "M24 14C14 14 8 24 16 36L40 60L64 36C72 24 66 14 56 14C48 14 42 20 40 24C38 20 32 14 24 14Z",
      viewBox: "0 0 80 72",
    },
    {
      id: "star",
      name: "Star",
      description: "Five point star drawn with straight segments.",
      path: "M40 8L48 30H72L52 44L60 66L40 52L20 66L28 44L8 30H32Z",
      viewBox: "0 0 80 74",
    },
    {
      id: "checkmark",
      name: "Checkmark",
      description: "Simple checkmark ideal for success indicators.",
      path: "M10 34L26 50L60 16",
      viewBox: "0 0 72 64",
    },
    {
      id: "spiral",
      name: "Spiral",
      description: "Logarithmic spiral approximated with cubic curves.",
      path: "M44 8C28 8 16 20 16 36C16 50 26 62 40 64C54 66 66 56 68 42C70 30 62 20 50 18C40 16 32 24 32 34",
      viewBox: "0 0 80 80",
    },
  ];

  const CUSTOM_SAMPLE = {
    id: "custom",
    name: "Custom",
    description: "Enter your own path data below.",
  };

  let activeSampleId = SAMPLES[0].id;
  let pathData = SAMPLES[0].path;
  let viewBox = SAMPLES[0].viewBox;
  let strokeColor = "#2563eb";
  let strokeWidth = 4;
  let fillColor = "transparent";
  let autoFit = true;
  let pathLength = 0;
  let bbox = { x: 0, y: 0, width: 0, height: 0 };
  let commandCount = 0;
  let pathRef: SVGPathElement | null = null;

  const controlId = {
    strokeColor: "svg-path-stroke-color",
    fillColor: "svg-path-fill-color",
    strokeWidth: "svg-path-stroke-width",
  } as const;

  $: selectedSample =
    SAMPLES.find((sample) => sample.id === activeSampleId) ?? CUSTOM_SAMPLE;
  $: updateMetrics();

  onMount(() => updateMetrics());

  function updateMetrics() {
    if (!pathRef) return;
    try {
      pathLength = Math.round(pathRef.getTotalLength());
      const { x, y, width, height } = pathRef.getBBox();
      bbox = {
        x: round(x),
        y: round(y),
        width: round(width),
        height: round(height),
      };
      commandCount = (pathData.match(/[a-zA-Z]/g) ?? []).length;
      if (autoFit) {
        viewBox = `${Math.floor(x - 10)} ${Math.floor(y - 10)} ${Math.ceil(width + 20)} ${Math.ceil(height + 20)}`;
      }
    } catch {
      pathLength = 0;
      bbox = { x: 0, y: 0, width: 0, height: 0 };
      commandCount = 0;
    }
  }

  function round(value: number) {
    return Number.isFinite(value) ? Number(value.toFixed(2)) : 0;
  }

  function applySample(sample: Sample) {
    activeSampleId = sample.id;
    pathData = sample.path;
    viewBox = sample.viewBox;
    autoFit = true;
    requestAnimationFrame(updateMetrics);
  }

  function handlePathInput(event: Event) {
    const textarea = event.currentTarget as HTMLTextAreaElement | null;
    if (!textarea) return;
    pathData = textarea.value;
    activeSampleId = CUSTOM_SAMPLE.id;
    requestAnimationFrame(updateMetrics);
  }

  function handleViewBoxInput(event: Event) {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    viewBox = input.value;
    activeSampleId = CUSTOM_SAMPLE.id;
  }

  function toggleAutoFit(event: Event) {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    autoFit = input.checked;
    if (autoFit) {
      requestAnimationFrame(updateMetrics);
    }
  }
</script>

<section class="space-y-6">
  <div
    class="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)]"
  >
    <div class="space-y-4">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div
          class="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <svg
            class="h-64 w-full"
            {viewBox}
            fill={fillColor}
            stroke={strokeColor}
            stroke-width={strokeWidth}
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path bind:this={pathRef} d={pathData} />
            <rect
              x={bbox.x}
              y={bbox.y}
              width={bbox.width}
              height={bbox.height}
              class="pointer-events-none"
              fill="none"
              stroke="rgba(148, 163, 184, 0.45)"
              stroke-dasharray="4 4"
            />
          </svg>
        </div>
        <div
          class="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300 sm:grid-cols-3"
        >
          <div>
            <p
              class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Length
            </p>
            <p class="mt-1 font-mono text-slate-700 dark:text-slate-200">
              {pathLength}px
            </p>
          </div>
          <div>
            <p
              class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Commands
            </p>
            <p class="mt-1 font-mono text-slate-700 dark:text-slate-200">
              {commandCount}
            </p>
          </div>
          <div>
            <p
              class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Bounding box
            </p>
            <p class="mt-1 font-mono text-slate-700 dark:text-slate-200">
              x:{bbox.x} y:{bbox.y}<br />
              w:{bbox.width} h:{bbox.height}
            </p>
          </div>
        </div>

        <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
          Use the bounding box to align the path within larger canvases.
          Auto-fit can be disabled to keep a manual viewBox in place.
        </p>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
      >
        <p
          class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Tips
        </p>
        <ul class="mt-2 space-y-2 leading-relaxed">
          <li>
            Convert absolute commands to relative (or vice versa) to simplify
            editing.
          </li>
          <li>
            For hand-drawn shapes, reduce the number of control points to
            improve animation performance.
          </li>
          <li>
            Combine this tool with the SVG Animator to preview draw-on effects.
          </li>
        </ul>
      </div>
    </div>

    <div class="space-y-4">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="space-y-5">
          <div
            class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div class="flex items-center justify-between">
              <label
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                SVG path data
              </label>
              <Copy
                text={pathData}
                label="Copy path"
                customClass="!relative !top-auto !right-auto"
              />
            </div>
            <textarea
              class="mt-3 h-32 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-mono text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={pathData}
              on:input={handlePathInput}
            />

            <div class="flex items-center justify-between">
              <label
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                ViewBox
              </label>
              <Copy
                text={viewBox}
                label="Copy viewBox"
                customClass="!relative !top-auto !right-auto"
              />
            </div>

            <input
              class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-mono text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={viewBox}
              on:input={handleViewBoxInput}
            />
            <label
              class="mt-6 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <input
                class="h-4 w-4 accent-indigo-600"
                type="checkbox"
                bind:checked={autoFit}
                on:change={toggleAutoFit}
              />
              Auto-fit
            </label>
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
                  class="h-12 w-20 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950"
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
                  class="h-12 w-20 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950"
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
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Samples
        </p>
        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          {#each SAMPLES as sample}
            <button
              class={`rounded-xl border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900 ${
                activeSampleId === sample.id
                  ? "border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-300"
                  : "border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
              }`}
              type="button"
              on:click={() => applySample(sample)}
            >
              <span class="block font-semibold">{sample.name}</span>
              <span
                class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
                >{sample.description}</span
              >
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
