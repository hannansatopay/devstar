<script lang="ts">
  import { derived, writable } from "svelte/store";
  import Copy from "$lib/Copy.svelte";

  type ChartPoint = {
    label: string;
    value: number;
  };

  const palettes: Record<string, string[]> = {
    aurora: ["#60a5fa", "#34d399", "#f97316", "#facc15", "#a855f7", "#f472b6"],
    breeze: ["#0284c7", "#4ade80", "#fbbf24", "#f87171", "#2dd4bf", "#f9a8d4"],
    noir: ["#f5f5f5", "#d4d4d8", "#a1a1aa", "#71717a", "#52525b", "#27272a"],
    sunset: ["#f97316", "#fb7185", "#facc15", "#22d3ee", "#a3e635", "#7dd3fc"],
    ocean: ["#0ea5e9", "#38bdf8", "#22d3ee", "#14b8a6", "#0ea5e9", "#0284c7"],
  };

  const seed = `Label,Value\nDiscovery,18\nDesign,26\nDevelopment,42\nLaunch,14`;
  const rawInput = writable(seed);
  const chartType = writable<"bar" | "line" | "pie">("bar");
  const paletteKey = writable<keyof typeof palettes>("aurora");
  const showLegend = writable(true);
  const showGrid = writable(true);
  const valueFormat = writable("0,0");

  const parsed = derived(rawInput, ($raw) => {
    const rows = $raw
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
    const points: ChartPoint[] = [];

    for (const row of rows) {
      const [label, rawValue] = row.split(/[;,\t]/);
      if (!label || rawValue === undefined) continue;
      const value = Number(rawValue.trim());
      if (Number.isFinite(value)) {
        points.push({ label: label.trim(), value });
      }
    }

    return points.length ? points : [{ label: "Sample", value: 1 }];
  });

  const totalValue = derived(parsed, ($points) =>
    $points.reduce((sum, point) => sum + Math.max(point.value, 0), 0),
  );

  const maxValue = derived(parsed, ($points) =>
    $points.reduce((max, point) => Math.max(max, point.value), 0),
  );

  type PieSegment = {
    point: ChartPoint;
    portion: number;
    start: number;
    end: number;
    mid: number;
    color: string;
  };

  const computeX = (index: number, length: number) =>
    60 + (index / Math.max(length - 1, 1)) * (containerWidth - 120);

  const computeY = (value: number, max: number) =>
    60 + (containerHeight - 140) * (1 - Math.max(value, 0) / Math.max(max, 1));

  const polarToCartesian = (angle: number, radius: number) => ({
    x: containerWidth / 2 + radius * Math.cos(angle),
    y: containerHeight / 2 + radius * Math.sin(angle),
  });

  const createPiePath = (segment: PieSegment, radius: number) => {
    const start = polarToCartesian(segment.start, radius);
    const end = polarToCartesian(segment.end, radius);
    const largeArc = segment.portion > 0.5 ? 1 : 0;
    return `M ${containerWidth / 2} ${containerHeight / 2} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
  };

  let linePoints = "";
  let pieRadius = 0;
  let pieSegments: PieSegment[] = [];

  $: pieRadius = Math.max(
    0,
    Math.min(containerWidth, containerHeight) / 2 - 40,
  );

  $: linePoints = $parsed
    .map(
      (point, index) =>
        `${computeX(index, $parsed.length)},${computeY(point.value, $maxValue)}`,
    )
    .join(" ");

  $: pieSegments = (() => {
    const segments: PieSegment[] = [];
    let arcPointer = 0;
    const total = $totalValue;
    const palette = palettes[$paletteKey];

    $parsed.forEach((point, index) => {
      const safeValue = Math.max(point.value, 0);
      const portion = total > 0 ? safeValue / total : 0;
      const arcLength = portion * Math.PI * 2;
      const start = arcPointer;
      const end = start + arcLength;
      segments.push({
        point,
        portion,
        start,
        end,
        mid: start + arcLength / 2,
        color: palette[index % palette.length],
      });
      arcPointer = end;
    });

    return segments;
  })();

  let svgRef: SVGSVGElement | null = null;
  let containerWidth = 720;
  let containerHeight = 420;

  function formatNumber(value: number, pattern: string) {
    if (pattern === "0%") {
      return `${(value * 100).toFixed(1)}%`;
    }

    if (pattern === "0.0a") {
      const abs = Math.abs(value);
      if (abs >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}m`;
      if (abs >= 1_000) return `${(value / 1_000).toFixed(1)}k`;
      return value.toFixed(1);
    }

    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 1,
    }).format(value);
  }

  function downloadSVG() {
    if (!svgRef) return;
    const clone = svgRef.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const blob = new Blob([clone.outerHTML], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `chart-${new Date().toISOString()}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const chartMetrics = derived(
    [parsed, totalValue, maxValue],
    ([$points, $total, $max]) => {
      const safeValues = $points.map((point) => Math.max(point.value, 0));
      const count = safeValues.length;
      const average = count
        ? safeValues.reduce((sum, value) => sum + value, 0) / count
        : 0;

      return {
        count,
        total: $total,
        max: $max,
        average,
      };
    },
  );

  const chartSummary = derived([parsed, chartType], ([$points, $chartType]) =>
    JSON.stringify(
      {
        type: $chartType,
        points: $points,
      },
      null,
      2,
    ),
  );
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center justify-between gap-4">
          <Copy text={$chartSummary} label="Copy JSON" floating={false} />
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-3">
          <div
            class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium dark:border-slate-800/60 dark:bg-slate-900/40"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Entries
            </p>
            <p
              class="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {$chartMetrics.count}
            </p>
          </div>
          <div
            class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium dark:border-slate-800/60 dark:bg-slate-900/40"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Total
            </p>
            <p
              class="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {formatNumber($chartMetrics.total, $valueFormat)}
            </p>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
            >
              Avg {formatNumber($chartMetrics.average, $valueFormat)}
            </p>
          </div>
          <div
            class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium dark:border-slate-800/60 dark:bg-slate-900/40"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Peak value
            </p>
            <p
              class="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100"
            >
              {formatNumber($chartMetrics.max, $valueFormat)}
            </p>
          </div>
        </div>

        <label class="mt-6 flex flex-col gap-2">
          <span class="text-xs font-semibold uppercase tracking-wide opacity-70"
            >Dataset</span
          >
          <textarea
            class="h-48 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm leading-relaxed transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
            bind:value={$rawInput}
            placeholder="Label,Value\nPlanning,12\nDesign,24"
          ></textarea>
        </label>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Chart type</span
            >
            <select
              class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
              bind:value={$chartType}
            >
              <option value="bar">Bar</option>
              <option value="line">Line</option>
              <option value="pie">Pie</option>
            </select>
          </label>

          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Palette</span
            >
            <select
              class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
              bind:value={$paletteKey}
            >
              {#each Object.keys(palettes) as key}
                <option value={key}>{key}</option>
              {/each}
            </select>
          </label>

          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Value format</span
            >
            <select
              class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
              bind:value={$valueFormat}
            >
              <option value="0,0">1 234</option>
              <option value="0.0a">1.2k</option>
              <option value="0%">85%</option>
            </select>
          </label>

          <div
            class="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium shadow-sm transition dark:border-slate-700 dark:bg-slate-950"
          >
            <input
              id="legend"
              type="checkbox"
              class="h-4 w-4 accent-blue-500"
              bind:checked={$showLegend}
            />
            <label for="legend" class="flex-1 cursor-pointer">Show legend</label
            >
          </div>

          <div
            class="flex items-center gap-3 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-medium shadow-sm transition dark:border-slate-700 dark:bg-slate-950"
          >
            <input
              id="grid"
              type="checkbox"
              class="h-4 w-4 accent-blue-500"
              bind:checked={$showGrid}
            />
            <label for="grid" class="flex-1 cursor-pointer"
              >Show grid lines</label
            >
          </div>
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 class="text-lg font-semibold">Parsed data</h2>
        <table class="mt-4 w-full table-fixed text-sm">
          <thead class="text-left text-xs uppercase tracking-wide opacity-60">
            <tr>
              <th class="pb-2">Label</th>
              <th class="pb-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
            {#each $parsed as point, index}
              <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                <td class="py-2 pr-4 font-medium">
                  <span
                    class="mr-3 inline-flex h-2.5 w-2.5 rounded-full"
                    style={`background:${palettes[$paletteKey][index % palettes[$paletteKey].length]}`}
                  ></span>
                  {point.label}
                </td>
                <td class="py-2 text-right font-semibold"
                  >{formatNumber(point.value, $valueFormat)}</td
                >
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-lg font-semibold">Preview</h2>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            on:click={downloadSVG}
          >
            Download SVG
          </button>
        </div>

        <div
          class="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <svg
            bind:this={svgRef}
            viewBox={`0 0 ${containerWidth} ${containerHeight}`}
            class="h-full w-full"
          >
            {#if $chartType === "bar"}
              {#if $showGrid}
                {#each Array.from({ length: 5 }) as _, i}
                  <line
                    x1="60"
                    y1={60 + (containerHeight - 140) * (i / 4)}
                    x2={containerWidth - 32}
                    y2={60 + (containerHeight - 140) * (i / 4)}
                    class="stroke-slate-300 dark:stroke-slate-700"
                    stroke-dasharray="4 6"
                  />
                {/each}
              {/if}

              {#each $parsed as point, index (point.label)}
                {#if $maxValue > 0}
                  <rect
                    x={80 + index * ((containerWidth - 160) / $parsed.length)}
                    y={60 +
                      (containerHeight - 140) *
                        (1 - Math.max(point.value, 0) / Math.max($maxValue, 1))}
                    width={(containerWidth - 200) / Math.max($parsed.length, 1)}
                    height={((containerHeight - 140) *
                      Math.max(point.value, 0)) /
                      Math.max($maxValue, 1)}
                    rx="12"
                    fill={palettes[$paletteKey][
                      index % palettes[$paletteKey].length
                    ]}
                  />
                  <text
                    x={80 +
                      index * ((containerWidth - 160) / $parsed.length) +
                      (containerWidth - 200) / Math.max($parsed.length, 1) / 2}
                    y={48 +
                      (containerHeight - 140) *
                        (1 - Math.max(point.value, 0) / Math.max($maxValue, 1))}
                    text-anchor="middle"
                    class="fill-slate-700 text-xs font-semibold dark:fill-slate-100"
                  >
                    {formatNumber(point.value, $valueFormat)}
                  </text>
                {/if}
                <text
                  x={80 +
                    index * ((containerWidth - 160) / $parsed.length) +
                    (containerWidth - 200) / Math.max($parsed.length, 1) / 2}
                  y={containerHeight - 60}
                  text-anchor="middle"
                  class="fill-slate-500 text-xs font-medium dark:fill-slate-400"
                >
                  {point.label}
                </text>
              {/each}

              <line
                x1="60"
                y1="60"
                x2="60"
                y2={containerHeight - 80}
                class="stroke-slate-400 dark:stroke-slate-600"
                stroke-width="2"
              />
              <line
                x1="60"
                y1={containerHeight - 80}
                x2={containerWidth - 32}
                y2={containerHeight - 80}
                class="stroke-slate-400 dark:stroke-slate-600"
                stroke-width="2"
              />
            {:else if $chartType === "line"}
              {#if $parsed.length > 1}
                {#if $showGrid}
                  {#each Array.from({ length: 5 }) as _, i}
                    <line
                      x1="60"
                      y1={60 + (containerHeight - 140) * (i / 4)}
                      x2={containerWidth - 32}
                      y2={60 + (containerHeight - 140) * (i / 4)}
                      class="stroke-slate-300 dark:stroke-slate-700"
                      stroke-dasharray="4 6"
                    />
                  {/each}
                {/if}

                <polyline
                  fill="none"
                  stroke={palettes[$paletteKey][0]}
                  stroke-width="6"
                  stroke-linecap="round"
                  points={linePoints}
                />

                {#each $parsed as point, index (point.label)}
                  {#if $maxValue > 0}
                    <circle
                      cx={computeX(index, $parsed.length)}
                      cy={computeY(point.value, $maxValue)}
                      r="10"
                      fill={palettes[$paletteKey][
                        index % palettes[$paletteKey].length
                      ]}
                      class="stroke-white stroke-[4] dark:stroke-slate-900"
                    />
                    <text
                      x={computeX(index, $parsed.length)}
                      y={computeY(point.value, $maxValue) - 20}
                      text-anchor="middle"
                      class="fill-slate-700 text-xs font-semibold dark:fill-slate-100"
                    >
                      {formatNumber(point.value, $valueFormat)}
                    </text>
                  {/if}
                  <text
                    x={computeX(index, $parsed.length)}
                    y={containerHeight - 60}
                    text-anchor="middle"
                    class="fill-slate-500 text-xs font-medium dark:fill-slate-400"
                  >
                    {point.label}
                  </text>
                {/each}
              {/if}
            {:else if pieSegments.length && pieRadius > 0}
              {#each pieSegments as segment (segment.point.label)}
                {#if segment.portion > 0}
                  <path
                    d={createPiePath(segment, pieRadius)}
                    fill={segment.color}
                  />
                  <text
                    x={containerWidth / 2 +
                      pieRadius * 0.6 * Math.cos(segment.mid)}
                    y={containerHeight / 2 +
                      pieRadius * 0.6 * Math.sin(segment.mid)}
                    text-anchor="middle"
                    class="fill-slate-800 text-xs font-semibold dark:fill-slate-100"
                  >
                    {formatNumber(segment.point.value, $valueFormat)}
                  </text>
                {/if}
              {/each}
            {/if}
          </svg>
        </div>

        {#if $showLegend}
          <div class="mt-6 grid gap-2 sm:grid-cols-2">
            {#each $parsed as point, index (point.label)}
              <div
                class="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium dark:border-slate-800 dark:bg-slate-900"
              >
                <span
                  class="inline-flex h-3 w-3 rounded-full"
                  style={`background:${palettes[$paletteKey][index % palettes[$paletteKey].length]}`}
                ></span>
                <div class="flex-1">
                  <p class="font-semibold">{point.label}</p>
                  <p class="text-xs opacity-70">
                    {formatNumber(point.value, $valueFormat)}
                  </p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
