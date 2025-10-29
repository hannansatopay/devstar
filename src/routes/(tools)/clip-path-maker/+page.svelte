<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  type Point = { x: number; y: number };

  const MIN_POINTS = 3;
  const MAX_POINTS = 8;

  let pointCount = 5;
  let points: Point[] = createInitialPoints(pointCount);
  let showGuides = true;
  let animate = true;

  $: {
    if (points.length < pointCount) {
      points = [...points, ...createInitialPoints(pointCount - points.length)];
    } else if (points.length > pointCount) {
      points = points.slice(0, pointCount);
    }
  }

  $: polygonValue = points
    .map((point) => `${point.x.toFixed(1)}% ${point.y.toFixed(1)}%`)
    .join(", ");
  $: clipPathValue = `polygon(${polygonValue})`;
  $: cssSnippet = `clip-path: ${clipPathValue};`;

  function createInitialPoints(count: number): Point[] {
    return Array.from({ length: count }, (_, index) => {
      const angle = (index / count) * Math.PI * 2;
      const radius = 40 + Math.random() * 30;
      const x = 50 + Math.cos(angle) * radius;
      const y = 50 + Math.sin(angle) * radius;
      return { x: clamp(x, 0, 100), y: clamp(y, 0, 100) };
    });
  }

  function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
  }

  function updatePoint(index: number, key: keyof Point, value: number) {
    points = points.map((point, idx) =>
      idx === index ? { ...point, [key]: clamp(value, 0, 100) } : point,
    );
  }

  function randomizePoints() {
    points = createInitialPoints(pointCount);
  }

  function generateLottiePlaceholder() {
    // placeholder for showing clip path movement in preview
    animate = false;
    requestAnimationFrame(() => {
      animate = true;
    });
  }

  function handlePointInput(index: number, key: keyof Point, event: Event) {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    const value = Number.parseFloat(input.value);
    updatePoint(index, key, Number.isNaN(value) ? 0 : value);
  }
</script>

<section class="space-y-6">
  <div class="flex flex-col gap-8 lg:flex-row">
    <div class="flex-1 space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-center gap-4">
          <div class="w-full sm:w-auto">
            <label
              class="flex items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Points</span>
              <span>{pointCount}</span>
            </label>
            <input
              class="w-full accent-indigo-600"
              type="range"
              min={MIN_POINTS}
              max={MAX_POINTS}
              bind:value={pointCount}
              on:change={generateLottiePlaceholder}
            />
          </div>
          <div class="flex items-center gap-4">
            <label
              class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <input
                class="h-4 w-4 accent-indigo-600"
                type="checkbox"
                bind:checked={showGuides}
              />
              Show guides
            </label>
            <button
              class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-400 dark:focus:ring-slate-800"
              type="button"
              on:click={randomizePoints}
            >
              Randomize shape
            </button>
          </div>
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          {#each points as point, index}
            <div
              class="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <p
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Point {index + 1}
              </p>
              <div class="mt-3 space-y-3">
                <div>
                  <label
                    class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
                  >
                    <span>X</span>
                    <span>{point.x.toFixed(1)}%</span>
                  </label>
                  <input
                    class="w-full accent-indigo-600"
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={point.x}
                    on:input={(event) => handlePointInput(index, "x", event)}
                  />
                </div>
                <div>
                  <label
                    class="flex justify-between text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
                  >
                    <span>Y</span>
                    <span>{point.y.toFixed(1)}%</span>
                  </label>
                  <input
                    class="w-full accent-indigo-600"
                    type="range"
                    min="0"
                    max="100"
                    step="0.5"
                    value={point.y}
                    on:input={(event) => handlePointInput(index, "y", event)}
                  />
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="mb-3 flex items-center justify-between">
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            CSS clip-path
          </p>
          <Copy
            text={cssSnippet}
            customClass="!relative !top-auto !right-auto"
          />
        </div>
        <pre
          class="overflow-x-auto rounded-lg bg-slate-900/90 p-4 text-xs text-emerald-300 shadow-inner dark:bg-black">{cssSnippet}</pre>
      </div>
    </div>

    <div class="flex-1 space-y-6">
      <div
        class="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div
          class="relative h-80 overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 via-sky-400 to-emerald-400 dark:from-indigo-400 dark:via-indigo-600 dark:to-slate-900"
        >
          <div
            class="absolute inset-0 bg-cover bg-center transition-all duration-500"
            style={`clip-path:${clipPathValue}; background-image: radial-gradient(circle at 15% 25%, rgba(255,255,255,0.2), transparent 60%), radial-gradient(circle at 75% 30%, rgba(255,255,255,0.15), transparent 55%), linear-gradient(135deg, rgba(255,255,255,0.15), transparent), url('https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80'); transform: scale(${animate ? 1 : 1});`}
          />
          {#if showGuides}
            <div class="pointer-events-none absolute inset-0">
              {#each points as point}
                <div
                  class="absolute h-[14px] w-[14px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/60 bg-indigo-500/80 shadow-sm backdrop-blur"
                  style={`left:${point.x}%; top:${point.y}%`}
                />
              {/each}
              <svg
                class="absolute inset-0 h-full w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <polygon
                  class="fill-transparent stroke-white/25"
                  stroke-width="0.6"
                  points={polygonValue}
                />
              </svg>
            </div>
          {/if}
        </div>
        <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Adjust points with the sliders to sculpt the polygon. Copy the CSS
          snippet and apply it to any element.
        </p>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
      >
        <h3 class="text-base font-semibold text-slate-800 dark:text-slate-100">
          Tips
        </h3>
        <ul class="mt-3 space-y-2 text-xs">
          <li>• Combine clip-path with CSS transitions for smooth reveals.</li>
          <li>
            • Use the randomize button as a starting point for organic shapes.
          </li>
          <li>• Toggle guides for a clean preview before exporting.</li>
        </ul>
      </div>
    </div>
  </div>
</section>
