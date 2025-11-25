<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  type GradientKind =
    | "linear"
    | "radial"
    | "radial-ellipse"
    | "conic"
    | "repeating-linear"
    | "repeating-radial";

  type GradientStop = {
    id: number;
    color: string;
    position: number;
  };

  const clamp = (value: number | string, min = 0, max = 100) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return min;
    return Math.min(max, Math.max(min, Math.round(parsed)));
  };

  const randomHex = () =>
    `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;

  let stopId = 0;
  const createStop = (color: string, position: number): GradientStop => ({
    id: ++stopId,
    color,
    position: clamp(position),
  });

  let gradientKind: GradientKind = "linear";
  let angle = 45;
  let centreX = 50;
  let centreY = 50;
  let repeatScale = 120;
  let previewHeight = 320;

  let stops: GradientStop[] = [
    createStop("#6366f1", 0),
    createStop("#ec4899", 40),
    createStop("#fbbf24", 100),
  ];

  let gradientCss = "";
  let cssSnippet = "";
  let htmlSnippet = "";
  let inlineStyle = "";
  let summary = "";

  const gradientOptions: Array<{
    value: GradientKind;
    label: string;
    meta: string;
  }> = [
    {
      value: "linear",
      label: "Linear",
      meta: "Directional blend with angle",
    },
    {
      value: "radial",
      label: "Radial (circle)",
      meta: "Soft centre fade for spotlight",
    },
    {
      value: "radial-ellipse",
      label: "Radial (ellipse)",
      meta: "Elliptical focal emphasis",
    },
    {
      value: "conic",
      label: "Conic",
      meta: "Angular sweep great for charts",
    },
    {
      value: "repeating-linear",
      label: "Repeating linear",
      meta: "Striped backgrounds or loaders",
    },
    {
      value: "repeating-radial",
      label: "Repeating radial",
      meta: "Rippled rings and waveforms",
    },
  ];

  const requiresAngle = (kind: GradientKind) =>
    kind === "linear" || kind === "repeating-linear" || kind === "conic";

  const requiresCentre = (kind: GradientKind) =>
    kind === "radial" ||
    kind === "radial-ellipse" ||
    kind === "repeating-radial";

  const requiresRepeatScale = (kind: GradientKind) =>
    kind === "repeating-linear" || kind === "repeating-radial";

  const buildStops = (list: GradientStop[], reverse = false) => {
    const ordered = [...list].sort((a, b) => a.position - b.position);
    const data = reverse ? ordered.slice().reverse() : ordered;
    return data
      .map((stop, index, array) => {
        const position =
          array.length === 1
            ? 0
            : Math.round((index / Math.max(1, array.length - 1)) * 100);
        return `${stop.color} ${position}%`;
      })
      .join(", ");
  };

  const buildRepeatingStops = (list: GradientStop[]) => {
    const ordered = [...list].sort((a, b) => a.position - b.position);
    const scale = Math.max(10, repeatScale);
    return ordered
      .map((stop, index) => {
        const position = Math.round(
          (index / Math.max(1, ordered.length - 1)) * scale,
        );
        return `${stop.color} ${position}px`;
      })
      .join(", ");
  };

  function regenerateGradient() {
    const stopInfo = buildStops(stops);
    const reversedStopInfo = buildStops(stops, true);
    const repeatStops = buildRepeatingStops(stops);

    switch (gradientKind) {
      case "linear":
        gradientCss = `linear-gradient(${angle}deg, ${stopInfo})`;
        break;
      case "radial":
        gradientCss = `radial-gradient(circle at ${centreX}% ${centreY}%, ${stopInfo})`;
        break;
      case "radial-ellipse":
        gradientCss = `radial-gradient(ellipse at ${centreX}% ${centreY}%, ${stopInfo})`;
        break;
      case "conic":
        gradientCss = `conic-gradient(from ${angle}deg at ${centreX}% ${centreY}%, ${stopInfo})`;
        break;
      case "repeating-linear":
        gradientCss = `repeating-linear-gradient(${angle}deg, ${repeatStops})`;
        break;
      case "repeating-radial":
        gradientCss = `repeating-radial-gradient(circle at ${centreX}% ${centreY}%, ${repeatStops})`;
        break;
      default:
        gradientCss = `linear-gradient(${angle}deg, ${stopInfo})`;
        break;
    }

    inlineStyle = `background: ${gradientCss}; min-height: ${previewHeight}px;`;
    cssSnippet = `background: ${gradientCss};`;
    htmlSnippet = `<div class="gradient-background"></div>`;
    summary = `${gradientKind.replace("-", " ")} • ${stops.length} stop${
      stops.length === 1 ? "" : "s"
    }`;
  }

  const addStop = () => {
    if (stops.length >= 8) return;
    const ordered = [...stops].sort((a, b) => a.position - b.position);
    if (!ordered.length) {
      stops = [createStop(randomHex(), 0)];
      regenerateGradient();
      return;
    }
    let widestGap = -1;
    let insertPosition = 50;
    for (let i = 0; i < ordered.length - 1; i += 1) {
      const gap = ordered[i + 1].position - ordered[i].position;
      if (gap > widestGap) {
        widestGap = gap;
        insertPosition = ordered[i].position + gap / 2;
      }
    }
    stops = [...ordered, createStop(randomHex(), insertPosition)];
    regenerateGradient();
  };

  const randomizeStops = () => {
    stops = stops.map((stop) => ({ ...stop, color: randomHex() }));
    regenerateGradient();
  };

  const distributeStops = () => {
    if (stops.length < 2) return;
    const ordered = [...stops].sort((a, b) => a.position - b.position);
    const spread = 100 / (ordered.length - 1);
    stops = ordered.map((stop, index) => ({
      ...stop,
      position: Math.round(index * spread),
    }));
    regenerateGradient();
  };

  const reverseStops = () => {
    const ordered = [...stops].sort((a, b) => a.position - b.position);
    stops = ordered.reverse().map((stop, index) => ({
      ...stop,
      position: Math.round((index / Math.max(1, ordered.length - 1)) * 100),
    }));
    regenerateGradient();
  };

  const updateStopColor = (id: number, color: string) => {
    stops = stops.map((stop) => (stop.id === id ? { ...stop, color } : stop));
    regenerateGradient();
  };

  const updateStopPosition = (id: number, position: number | string) => {
    stops = stops.map((stop) =>
      stop.id === id ? { ...stop, position: clamp(position) } : stop,
    );
    regenerateGradient();
  };

  const removeStop = (id: number) => {
    if (stops.length <= 1) return;
    stops = stops.filter((stop) => stop.id !== id);
    regenerateGradient();
  };

  const copyCss = () => navigator.clipboard.writeText(cssSnippet);
  const copyInline = () => navigator.clipboard.writeText(inlineStyle);
  const copyHtml = () => navigator.clipboard.writeText(htmlSnippet);

  const handleKindChange = (value: GradientKind) => {
    gradientKind = value;
    regenerateGradient();
  };

  const handleAngleInput = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    angle = Number(input.value);
    regenerateGradient();
  };

  const handleCentreInput = (event: Event, axis: "x" | "y") => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    const value = Number(input.value);
    if (axis === "x") {
      centreX = clamp(value);
    } else {
      centreY = clamp(value);
    }
    regenerateGradient();
  };

  const handleRepeatScale = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    repeatScale = clamp(input.value, 8, 240);
    regenerateGradient();
  };

  const resetDefaults = () => {
    gradientKind = "linear";
    angle = 45;
    centreX = 50;
    centreY = 50;
    repeatScale = 120;
    previewHeight = 320;
    stops = [
      createStop("#6366f1", 0),
      createStop("#ec4899", 40),
      createStop("#fbbf24", 100),
    ];
    regenerateGradient();
  };

  const handleStopColorInput = (id: number, event: Event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    updateStopColor(id, input.value);
  };

  const handleStopPositionInput = (id: number, event: Event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    updateStopPosition(id, input.value);
  };

  const exportCss = () => {
    const blob = new Blob([`/* gradient generator */\n${cssSnippet}\n`], {
      type: "text/plain",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "gradient.css";
    link.click();
  };

  regenerateGradient();
</script>

<section class="space-y-6">
  <div class="flex flex-col lg:flex-row-reverse gap-6">
    <aside class="flex-1 space-y-6">
      <div
        class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Gradient preview
          </h2>
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            {summary}
          </p>
        </div>
        <div class="p-6">
          <div
            class="rounded-[28px] border border-white/40 bg-slate-100/60 shadow-inner backdrop-blur dark:border-white/10 dark:bg-slate-950/60"
          >
            <div
              class="gradient-preview rounded-[24px]"
              style={inlineStyle}
            ></div>
          </div>
          <div class="mt-6 flex flex-wrap gap-3">
            <Copy text={cssSnippet} label="Copy CSS" floating={false} />
            <Copy
              text={inlineStyle}
              label="Copy inline style"
              floating={false}
            />
            <Copy text={copyHtml} label="Copy HTML" floating={false} />
          </div>
          <div class="mt-6 grid gap-4 md:grid-cols-2">
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                HTML snippet
              </p>
              <pre
                class="mt-2 max-h-36 overflow-auto rounded-2xl bg-slate-900/95 p-4 text-[12px] text-emerald-200 shadow-inner dark:bg-black">{htmlSnippet}</pre>
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                CSS snippet
              </p>
              <pre
                class="mt-2 max-h-36 overflow-auto rounded-2xl bg-slate-900/95 p-4 text-[12px] text-emerald-200 shadow-inner dark:bg-black">{cssSnippet}</pre>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <div class="flex-1 space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Presets
        </p>
        <div class="mt-3 grid gap-2 sm:grid-cols-2">
          {#each gradientOptions as option}
            <button
              type="button"
              class={`flex w-full flex-col rounded-xl border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 ${
                gradientKind === option.value
                  ? "border-indigo-500 bg-indigo-100 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                  : "border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
              }`}
              on:click={() => handleKindChange(option.value)}
            >
              <span class="font-semibold">{option.label}</span>
              <span class="text-xs text-slate-500 dark:text-slate-400"
                >{option.meta}</span
              >
            </button>
          {/each}
        </div>
      </div>

      <div
        class="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-600 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-indigo-400 dark:text-indigo-200 dark:hover:bg-indigo-500/10 dark:focus:ring-indigo-900"
            on:click={addStop}
            disabled={stops.length >= 8}
          >
            Add color
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-emerald-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-emerald-600 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-400 dark:text-emerald-200 dark:hover:bg-emerald-500/10 dark:focus:ring-emerald-900"
            on:click={randomizeStops}
          >
            Randomize colours
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-100 dark:focus:ring-slate-800"
            on:click={distributeStops}
            disabled={stops.length < 2}
          >
            Even spacing
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-400 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-slate-100 dark:focus:ring-slate-800"
            on:click={reverseStops}
            disabled={stops.length < 2}
          >
            Reverse order
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-slate-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-rose-400 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-slate-600 dark:text-slate-200 dark:hover:border-rose-500 dark:hover:text-rose-300 dark:focus:ring-rose-900"
            on:click={resetDefaults}
          >
            Reset all
          </button>
        </div>

        <div class="grid gap-4 md:grid-cols-2">
          {#each [...stops].sort((a, b) => a.position - b.position) as stop, index (stop.id)}
            <div
              class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
            >
              <div class="flex flex-col gap-4">
                <div class="flex items-center gap-3">
                  <input
                    class="h-12 w-20 cursor-pointer rounded border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950"
                    type="color"
                    value={stop.color}
                    on:input={(event) => handleStopColorInput(stop.id, event)}
                  />
                  <input
                    class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                    value={stop.color}
                    on:input={(event) => handleStopColorInput(stop.id, event)}
                  />
                </div>
                <div class="flex items-center gap-3">
                  <input
                    class="flex-1 accent-indigo-500"
                    type="range"
                    min="0"
                    max="100"
                    value={stop.position}
                    on:input={(event) =>
                      handleStopPositionInput(stop.id, event)}
                  />
                  <span
                    class="w-12 text-right text-xs font-semibold text-slate-500 dark:text-slate-400"
                  >
                    {stop.position}%
                  </span>
                </div>
                <button
                  type="button"
                  class="self-start rounded-full border border-rose-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-rose-500 transition hover:bg-rose-50 disabled:opacity-50 dark:border-rose-500 dark:text-rose-300 dark:hover:bg-rose-500/10"
                  on:click={() => removeStop(stop.id)}
                  disabled={stops.length <= 1}
                >
                  Remove
                </button>
              </div>
              <p class="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
                Color {index + 1} • {stop.color} at {stop.position}%
              </p>
            </div>
          {/each}
        </div>
      </div>

      <div
        class="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 md:grid-cols-2"
      >
        <div class="space-y-4">
          <label
            class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Preview height</span>
            <input
              class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="range"
              min="200"
              max="520"
              step="20"
              bind:value={previewHeight}
              on:input={regenerateGradient}
            />
            <span class="mt-1 block text-xs text-slate-400 dark:text-slate-500">
              {previewHeight}px tall
            </span>
          </label>

          {#if requiresAngle(gradientKind)}
            <label
              class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Angle</span>
              <input
                class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
                type="range"
                min="0"
                max="360"
                value={angle}
                on:input={handleAngleInput}
              />
              <span
                class="mt-1 block text-xs text-slate-400 dark:text-slate-500"
              >
                {angle}°
              </span>
            </label>
          {/if}

          {#if requiresRepeatScale(gradientKind)}
            <label
              class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Repeat scale</span>
              <input
                class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
                type="range"
                min="20"
                max="200"
                step="5"
                bind:value={repeatScale}
                on:input={handleRepeatScale}
              />
              <span
                class="mt-1 block text-xs text-slate-400 dark:text-slate-500"
              >
                {repeatScale}px stripe width
              </span>
            </label>
          {/if}
        </div>

        <div class="space-y-4">
          {#if requiresCentre(gradientKind) || gradientKind === "conic"}
            <label
              class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Centre X</span>
              <input
                class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
                type="range"
                min="0"
                max="100"
                value={centreX}
                on:input={(event) => handleCentreInput(event, "x")}
              />
              <span
                class="mt-1 block text-xs text-slate-400 dark:text-slate-500"
              >
                {centreX}%
              </span>
            </label>
            <label
              class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Centre Y</span>
              <input
                class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
                type="range"
                min="0"
                max="100"
                value={centreY}
                on:input={(event) => handleCentreInput(event, "y")}
              />
              <span
                class="mt-1 block text-xs text-slate-400 dark:text-slate-500"
              >
                {centreY}%
              </span>
            </label>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
