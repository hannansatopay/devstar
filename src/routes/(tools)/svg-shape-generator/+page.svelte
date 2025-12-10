<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  type Shape =
    | "rectangle"
    | "rounded-rectangle"
    | "pill"
    | "circle"
    | "triangle"
    | "diamond"
    | "hexagon"
    | "polygon"
    | "star"
    | "burst"
    | "heart";

  const shapeOptions: Array<{ label: string; value: Shape }> = [
    { label: "Rectangle", value: "rectangle" },
    { label: "Rounded rectangle", value: "rounded-rectangle" },
    { label: "Pill", value: "pill" },
    { label: "Circle", value: "circle" },
    { label: "Triangle", value: "triangle" },
    { label: "Diamond", value: "diamond" },
    { label: "Hexagon", value: "hexagon" },
    { label: "Regular polygon", value: "polygon" },
    { label: "Star", value: "star" },
    { label: "Burst", value: "burst" },
    { label: "Heart", value: "heart" },
  ];

  let shape: Shape = "rounded-rectangle";
  let width = 240;
  let height = 180;
  let radius = 28;
  let sides = 6;
  let starPoints = 5;
  let starRatio = 0.45;
  let burstPoints = 12;
  let burstVariance = 0.3;
  let fillColor = "#2563eb";
  let strokeColor = "#1f2937";
  let strokeWidth = 2;
  let viewBoxX = 0;
  let viewBoxY = 0;
  let viewWidth = width;
  let viewHeight = height;
  let syncViewBox = true;

  const clampNumber = (value: number | string, min: number, max: number, fallback: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.min(max, Math.max(min, parsed));
  };

  $: safeWidth = Math.round(clampNumber(width, 16, 1024, 160));
  $: safeHeight = Math.round(clampNumber(height, 16, 1024, 160));
  $: safeStroke = clampNumber(strokeWidth, 0.25, 40, 2);
  $: safeSides = Math.round(clampNumber(sides, 3, 16, 6));
  $: safeStarPoints = Math.round(clampNumber(starPoints, 3, 14, 5));
  $: safeStarRatio = clampNumber(starRatio, 0.1, 0.9, 0.45);
  $: safeBurstPoints = Math.round(clampNumber(burstPoints, 6, 32, 12));
  $: safeVariance = clampNumber(burstVariance, 0.05, 0.6, 0.3);
  $: safeRadius = Math.round(Math.min(clampNumber(radius, 0, 300, 32), Math.min(safeWidth, safeHeight) / 2));

  $: {
    // Depend on shape so the viewBox re-syncs whenever the shape type changes
    shape;
    if (syncViewBox) {
      viewBoxX = 0;
      viewBoxY = 0;
      viewWidth = safeWidth;
      viewHeight = safeHeight;
    }
  }

  const clampPositive = (value: number | string, fallback: number) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
    return parsed;
  };

  $: safeViewWidth = clampPositive(viewWidth, safeWidth);
  $: safeViewHeight = clampPositive(viewHeight, safeHeight);
  $: viewBox = `${viewBoxX} ${viewBoxY} ${safeViewWidth} ${safeViewHeight}`;

  const resetViewBoxToShape = () => {
    viewBoxX = 0;
    viewBoxY = 0;
    viewWidth = safeWidth;
    viewHeight = safeHeight;
    syncViewBox = true;
  };

  function handleShapeChange(event: Event) {
    const select = event.currentTarget as HTMLSelectElement | null;
    if (!select) return;
    shape = select.value as Shape;
    resetViewBoxToShape();
  }

  function regularPolygonPath(w: number, h: number, count: number) {
    const sidesClamped = Math.max(3, count);
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2;
    const points: string[] = [];
    for (let index = 0; index < sidesClamped; index += 1) {
      const angle = (index / sidesClamped) * Math.PI * 2 - Math.PI / 2;
      points.push(`${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`);
    }
    return `M${points.join("L")}Z`;
  }

  function roundedRectPath(w: number, h: number, r: number) {
    const rClamped = Math.min(Math.max(r, 0), Math.min(w, h) / 2);
    return `M${rClamped} 0H${w - rClamped}Q${w} 0 ${w} ${rClamped}V${h - rClamped}Q${w} ${h} ${w - rClamped} ${h}H${rClamped}Q0 ${h} 0 ${h - rClamped}V${rClamped}Q0 0 ${rClamped} 0Z`;
  }

  function starPath(w: number, h: number, points: number, ratio: number) {
    const cx = w / 2;
    const cy = h / 2;
    const outer = Math.min(w, h) / 2;
    const inner = outer * ratio;
    const coords: string[] = [];
    for (let index = 0; index < points * 2; index += 1) {
      const angle = (index / (points * 2)) * Math.PI * 2 - Math.PI / 2;
      const radius = index % 2 === 0 ? outer : inner;
      coords.push(`${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`);
    }
    return `M${coords.join("L")}Z`;
  }

  function burstPath(w: number, h: number, spikes: number, variance: number) {
    const cx = w / 2;
    const cy = h / 2;
    const outer = Math.min(w, h) / 2;
    const inner = outer * (1 - variance);
    const coords: string[] = [];
    for (let index = 0; index < spikes * 2; index += 1) {
      const angle = (index / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const radius = index % 2 === 0 ? outer : inner;
      coords.push(`${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`);
    }
    return `M${coords.join("L")}Z`;
  }

  function heartPath(w: number, h: number) {
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 4;
    const leftX = cx - radius;
    const rightX = cx + radius;
    const topY = cy - radius;
    const bottomY = h;
    const apexY = cy + radius;

    return `M ${cx} ${bottomY}
      C ${rightX + radius} ${apexY} ${w} ${topY} ${cx} ${topY + radius * 0.6}
      C 0 ${topY} ${leftX - radius} ${apexY} ${cx} ${bottomY}
      Z`.replace(/\s+/g, " ");
  }

  function buildPath(kind: Shape, w: number, h: number): string {
    switch (kind) {
      case "rectangle":
        return `M0 0H${w}V${h}H0Z`;
      case "rounded-rectangle":
        return roundedRectPath(w, h, safeRadius);
      case "pill": {
        const r = Math.min(h / 2, safeRadius);
        return `M${r} 0H${w - r}A${r} ${r} 0 0 1 ${w - r} ${h}H${r}A${r} ${r} 0 0 1 ${r} 0Z`;
      }
      case "circle": {
        const r = Math.min(w, h) / 2;
        return `M${w / 2} ${h / 2 - r}A${r} ${r} 0 1 1 ${w / 2 - 0.01} ${h / 2 - r}Z`;
      }
      case "triangle":
        return `M${w / 2} 0L${w} ${h}L0 ${h}Z`;
      case "diamond":
        return `M${w / 2} 0L${w} ${h / 2}L${w / 2} ${h}L0 ${h / 2}Z`;
      case "hexagon":
        return regularPolygonPath(w, h, 6);
      case "polygon":
        return regularPolygonPath(w, h, safeSides);
      case "star":
        return starPath(w, h, safeStarPoints, safeStarRatio);
      case "burst":
        return burstPath(w, h, safeBurstPoints, safeVariance);
      case "heart":
        return heartPath(w, h);
      default:
        return `M0 0H${w}V${h}H0Z`;
    }
  }

  $: pathData = buildPath(shape, safeWidth, safeHeight);
  $: translateX = -viewBoxX + (safeViewWidth - safeWidth) / 2;
  $: translateY = -viewBoxY + (safeViewHeight - safeHeight) / 2;
  $: needsTransform = Math.abs(translateX) > 0.01 || Math.abs(translateY) > 0.01;
  $: transformAttr = `translate(${translateX.toFixed(2)} ${translateY.toFixed(2)})`;
  $: aspectRatio = `${safeWidth} / ${safeHeight}`;

  $: svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" width="${safeWidth}" height="${safeHeight}" viewBox="${viewBox}" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${safeStroke}" stroke-linecap="round" stroke-linejoin="round" preserveAspectRatio="xMidYMid meet">
  ${needsTransform ? `<g transform="${transformAttr}">` : ""}
    <path d="${pathData}" />
  ${needsTransform ? "</g>" : ""}
</svg>`;

  $: downloadUri = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svgMarkup)}`;
</script>

<section class="space-y-6">
  <div class="grid gap-6 xl:grid-cols-[minmax(0,0.58fr)_minmax(0,1.42fr)]">
    <div class="space-y-4">
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>ViewBox</span>
          <span class="font-mono text-slate-700 dark:text-slate-200">{viewBox}</span>
        </div>
        <div class="mt-3 flex items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 p-6 dark:border-slate-800 dark:bg-slate-900">
          {#key `${shape}-${pathData}-${fillColor}-${strokeColor}-${viewBox}`}
            <svg
              class="w-full"
              viewBox={viewBox}
              fill={fillColor}
              stroke={strokeColor}
              stroke-width={safeStroke}
              preserveAspectRatio="xMidYMid meet"
              style:aspect-ratio={aspectRatio}
            >
              {#if needsTransform}
                <g transform={transformAttr}>
                  <path d={pathData} />
                </g>
              {:else}
                <path d={pathData} />
              {/if}
            </svg>
          {/key}
        </div>
        <div class="mt-4 flex flex-wrap gap-3">
          <Copy
            text={pathData}
            label="Copy path"
            floating={false}
            customClass="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300 dark:focus:ring-indigo-900"
          />
          <Copy
            text={svgMarkup}
            label="Copy SVG"
            floating={false}
            customClass="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300 dark:focus:ring-emerald-900"
          />
          <a
            class="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-700"
            download={`shape-${shape}-${safeWidth}x${safeHeight}.svg`}
            href={downloadUri}
          >
            Download SVG
          </a>
        </div>
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white p-6 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300">
        <p class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Generated SVG
        </p>
        <pre class="mt-2 max-h-72 overflow-auto rounded-2xl bg-slate-900/95 p-4 text-[12px] text-emerald-300 shadow-inner dark:bg-black">{svgMarkup}</pre>
      </div>
    </div>

    <div class="space-y-4">
      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/80">
          <label class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Shape type
          </label>
          <div class="mt-3 flex flex-wrap gap-2">
            <select
              class="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={shape}
              on:change={handleShapeChange}
            >
              {#each shapeOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </div>
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <label class="flex justify-between">
              <span>Width</span>
              <span>{safeWidth}px</span>
            </label>
            <input class="mt-2 w-full accent-indigo-500" type="range" min="40" max="512" bind:value={width} />
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <label class="flex justify-between">
              <span>Height</span>
              <span>{safeHeight}px</span>
            </label>
            <input class="mt-2 w-full accent-indigo-500" type="range" min="40" max="512" bind:value={height} />
          </div>

          {#if shape === "rounded-rectangle" || shape === "pill"}
            <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <label class="flex justify-between">
                <span>Corner radius</span>
                <span>{safeRadius}px</span>
              </label>
              <input class="mt-2 w-full accent-indigo-500" type="range" min="0" max="260" bind:value={radius} />
            </div>
          {/if}

          {#if shape === "polygon" || shape === "hexagon"}
            <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <label class="flex justify-between">
                <span>Sides</span>
                <span>{safeSides}</span>
              </label>
              <input class="mt-2 w-full accent-indigo-500" type="range" min="3" max="16" bind:value={sides} />
            </div>
          {/if}

          {#if shape === "star"}
            <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <label class="flex justify-between">
                <span>Points</span>
                <span>{safeStarPoints}</span>
              </label>
              <input class="mt-2 w-full accent-indigo-500" type="range" min="3" max="14" bind:value={starPoints} />
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <label class="flex justify-between">
                <span>Inner ratio</span>
                <span>{safeStarRatio.toFixed(2)}</span>
              </label>
              <input class="mt-2 w-full accent-indigo-500" type="range" min="0.1" max="0.9" step="0.05" bind:value={starRatio} />
            </div>
          {/if}

          {#if shape === "burst"}
            <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <label class="flex justify-between">
                <span>Spikes</span>
                <span>{safeBurstPoints}</span>
              </label>
              <input class="mt-2 w-full accent-indigo-500" type="range" min="6" max="32" bind:value={burstPoints} />
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
              <label class="flex justify-between">
                <span>Variance</span>
                <span>{safeVariance.toFixed(2)}</span>
              </label>
              <input class="mt-2 w-full accent-indigo-500" type="range" min="0.05" max="0.6" step="0.05" bind:value={burstVariance} />
            </div>
          {/if}
        </div>
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div class="grid gap-4 sm:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Fill color
            </label>
            <div class="mt-3 flex items-center gap-3">
              <input class="h-12 w-20 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950" type="color" bind:value={fillColor} />
              <input class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-mono uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900" bind:value={fillColor} />
            </div>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <label class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Stroke color
            </label>
            <div class="mt-3 flex items-center gap-3">
              <input class="h-12 w-20 cursor-pointer rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow dark:border-slate-700 dark:bg-slate-950" type="color" bind:value={strokeColor} />
              <input class="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-mono uppercase tracking-wide text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900" bind:value={strokeColor} />
            </div>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <label class="flex justify-between">
              <span>Stroke width</span>
              <span>{Number(safeStroke).toFixed(2)}</span>
            </label>
            <input class="mt-2 w-full accent-indigo-500" type="range" min="0.5" max="30" step="0.5" bind:value={strokeWidth} />
          </div>
        </div>
      </div>

      <div class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80">
        <div class="flex items-center justify-between">
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            ViewBox controls
          </p>
          <label class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
            <input class="h-4 w-4 accent-indigo-600" type="checkbox" bind:checked={syncViewBox} />
            Lock to shape bounds
          </label>
        </div>

        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <label for="viewbox-x">ViewBox X</label>
            <input
              class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              id="viewbox-x"
              type="number"
              bind:value={viewBoxX}
              disabled={syncViewBox}
            />
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <label for="viewbox-y">ViewBox Y</label>
            <input
              class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              id="viewbox-y"
              type="number"
              bind:value={viewBoxY}
              disabled={syncViewBox}
            />
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <label for="viewbox-width">ViewBox width</label>
            <input
              class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              id="viewbox-width"
              type="number"
              bind:value={viewWidth}
              disabled={syncViewBox}
            />
          </div>
          <div class="rounded-2xl border border-slate-200 bg-white p-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300">
            <label for="viewbox-height">ViewBox height</label>
            <input
              class="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              id="viewbox-height"
              type="number"
              bind:value={viewHeight}
              disabled={syncViewBox}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
