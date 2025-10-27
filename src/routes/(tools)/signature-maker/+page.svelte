<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  type StrokePoint = {
    x: number;
    y: number;
  };

  type Stroke = {
    color: string;
    width: number;
    points: StrokePoint[];
  };

  const strokePalette = [
    "#111827",
    "#0f766e",
    "#b45309",
    "#dc2626",
    "#2563eb",
    "#6b21a8",
  ];
  const typefaces = [
    "Dancing Script",
    "Great Vibes",
    "Pacifico",
    "Allura",
    "Caveat",
    "Playfair Display",
    "Pinyon Script",
  ];

  let mode: "draw" | "type" = "draw";
  let strokeColor = strokePalette[0];
  let backgroundColor = "#f8fafc";
  let transparentBackground = false;
  let strokeWidth = 3;

  let typedName = "Alex Jordan";
  let signatureFont = typefaces[0];
  let typedSize = 72;
  let typedWeight = 600;
  let typedItalic = true;
  let showBaseline = true;

  let strokes: Stroke[] = [];
  let currentStroke: Stroke | null = null;
  let drawing = false;

  let canvasWidth = 840;
  let canvasHeight = 360;
  let dpr = 1;

  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D | null = null;
  let resizeObserver: ResizeObserver | null = null;

  let previewDataUrl = "";
  let isExporting = false;

  function setupCanvas() {
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    canvasWidth = Math.max(560, Math.round(rect.width));
    canvasHeight = Math.round(canvasWidth * 0.45);
    dpr = window.devicePixelRatio || 1;
    canvas.width = canvasWidth * dpr;
    canvas.height = canvasHeight * dpr;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
    redraw();
  }

  function renderTo(
    context: CanvasRenderingContext2D,
    includeBackground: boolean,
    scale = dpr,
  ) {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.scale(scale, scale);
    if (includeBackground) {
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvasWidth, canvasHeight);
    } else {
      context.clearRect(0, 0, canvasWidth, canvasHeight);
    }
    context.lineCap = "round";
    context.lineJoin = "round";
    for (const stroke of strokes) {
      if (!stroke.points.length) continue;
      context.strokeStyle = stroke.color;
      context.lineWidth = stroke.width;
      context.beginPath();
      stroke.points.forEach((point, index) => {
        if (index === 0) context.moveTo(point.x, point.y);
        else context.lineTo(point.x, point.y);
      });
      context.stroke();
    }
    if (mode === "type" && typedName.trim().length) {
      context.font = `${typedItalic ? "italic " : ""}${typedWeight} ${Math.max(32, typedSize)}px '${signatureFont}', cursive`;
      context.fillStyle = strokeColor;
      context.textBaseline = "middle";
      const textWidth = context.measureText(typedName).width;
      context.fillText(
        typedName,
        (canvasWidth - textWidth) / 2,
        canvasHeight / 2,
      );
      if (showBaseline) {
        context.strokeStyle = `${strokeColor}33`;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(canvasWidth * 0.1, canvasHeight / 2 + typedSize * 0.35);
        context.lineTo(canvasWidth * 0.9, canvasHeight / 2 + typedSize * 0.35);
        context.stroke();
      }
    }
  }

  function redraw() {
    if (!ctx) return;
    renderTo(ctx, !transparentBackground || mode === "draw");
  }

  function toPoint(event: PointerEvent): StrokePoint {
    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  function pointerDown(event: PointerEvent) {
    if (mode !== "draw" || !ctx) return;
    event.preventDefault();
    drawing = true;
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch {
      /* noop */
    }
    currentStroke = {
      color: strokeColor,
      width: strokeWidth,
      points: [toPoint(event)],
    };
    strokes = [...strokes, currentStroke];
  }

  function pointerMove(event: PointerEvent) {
    if (!drawing || mode !== "draw" || !ctx || !currentStroke) return;
    event.preventDefault();
    const nextPoint = toPoint(event);
    const points = currentStroke.points;
    const previous = points[points.length - 1];
    if (!previous) return;
    points.push(nextPoint);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.strokeStyle = currentStroke.color;
    ctx.lineWidth = currentStroke.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(previous.x, previous.y);
    ctx.lineTo(nextPoint.x, nextPoint.y);
    ctx.stroke();
    ctx.restore();
  }

  function pointerUp(event: PointerEvent) {
    if (!drawing) return;
    event.preventDefault();
    drawing = false;
    try {
      canvas.releasePointerCapture(event.pointerId);
    } catch {
      /* noop */
    }
    currentStroke = null;
  }

  function pointerLeave(event: PointerEvent) {
    if (!drawing) return;
    pointerUp(event);
  }

  function clearSignature() {
    strokes = [];
    previewDataUrl = "";
    redraw();
  }

  function undoStroke() {
    if (!strokes.length) return;
    strokes = strokes.slice(0, -1);
    redraw();
  }

  function switchMode(nextMode: "draw" | "type") {
    if (mode === nextMode) return;
    mode = nextMode;
    if (mode === "type") {
      strokes = [];
    }
    redraw();
  }

  async function exportSignature() {
    if (!canvas) return;
    isExporting = true;
    try {
      const exportCanvas = document.createElement("canvas");
      exportCanvas.width = canvasWidth * dpr;
      exportCanvas.height = canvasHeight * dpr;
      const exportContext = exportCanvas.getContext("2d");
      if (!exportContext) return;
      renderTo(exportContext, !transparentBackground, dpr);
      const dataUrl = exportCanvas.toDataURL("image/png");
      previewDataUrl = dataUrl;
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "signature.png";
      link.click();
    } catch (error) {
      console.error("Unable to export signature", error);
    } finally {
      isExporting = false;
    }
  }

  onMount(() => {
    resizeObserver = new ResizeObserver(() => setupCanvas());
    resizeObserver.observe(canvas);
    setupCanvas();
  });

  onDestroy(() => {
    resizeObserver?.disconnect();
  });

  $: typedSignatureState = {
    typedName,
    strokeColor,
    signatureFont,
    typedSize,
    typedWeight,
    typedItalic,
    showBaseline,
    backgroundColor,
    transparentBackground,
  };

  $: if (ctx && mode === "type") {
    void typedSignatureState;
    redraw();
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Allura&family=Caveat&family=Dancing+Script:wght@400;600&family=Great+Vibes&family=Pacifico&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Pinyon+Script&display=swap"
  />
</svelte:head>

<section class="space-y-6">
  <div class="mx-auto flex w-full max-w-6xl flex-col gap-8 lg:flex-row">
    <div class="flex w-full flex-col gap-6 lg:max-w-md">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Draw, refine, or typeset a polished signature ready for documents
              and brand assets.
            </p>
          </div>
          <span
            class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
          >
            {mode === "draw" ? "Drawing" : "Typed"}
          </span>
        </div>

        <div class="mt-6 flex items-center gap-3">
          <button
            type="button"
            class={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === "draw"
                ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
            on:click={() => switchMode("draw")}
          >
            Draw
          </button>
          <button
            type="button"
            class={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              mode === "type"
                ? "bg-blue-600 text-white shadow-lg hover:bg-blue-700"
                : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
            on:click={() => switchMode("type")}
          >
            Type
          </button>
        </div>
        <div class="mt-3 flex flex-wrap items-center gap-2">
          {#each strokePalette as color}
            <button
              type="button"
              class={`h-8 w-8 rounded-full border-2 ${
                strokeColor === color ? "border-blue-500" : "border-slate-400"
              } shadow`}
              style={`background:${color}`}
              on:click={() => {
                strokeColor = color;
              }}
            ></button>
          {/each}
          <input
            type="color"
            bind:value={strokeColor}
            class="h-9 w-9 cursor-pointer rounded-full border border-slate-200 bg-white transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
          />
        </div>
      </div>

      {#if mode === "draw"}
        <div
          class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 class="text-lg font-semibold">Brush settings</h2>
          <div class="mt-4 space-y-5">
            <label class="flex flex-col gap-2 text-sm">
              <span
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >Stroke width</span
              >
              <input
                type="range"
                min="1"
                max="12"
                bind:value={strokeWidth}
                class="accent-blue-600"
              />
              <span class="text-xs text-slate-500 dark:text-slate-400"
                >{strokeWidth}px</span
              >
            </label>

            <div class="grid gap-3 sm:grid-cols-2">
              <label class="flex flex-col gap-2 text-sm">
                <span
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >Canvas background</span
                >
                <input
                  type="color"
                  bind:value={backgroundColor}
                  on:input={() => redraw()}
                  class="h-11 w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <label
                class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                <input
                  type="checkbox"
                  bind:checked={transparentBackground}
                  on:change={() => redraw()}
                  class="h-4 w-4 accent-blue-500"
                />
                Transparent background when exporting
              </label>
            </div>

            <div class="flex flex-wrap gap-2">
              <button
                type="button"
                class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
                on:click={undoStroke}
                disabled={!strokes.length}
              >
                Undo stroke
              </button>
              <button
                type="button"
                class="rounded-full border border-rose-500 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-400 dark:text-rose-300 dark:hover:bg-rose-500/10"
                on:click={clearSignature}
              >
                Clear canvas
              </button>
            </div>
          </div>
        </div>
      {:else}
        <div
          class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 class="text-lg font-semibold">Typed signature</h2>
          <div class="mt-4 space-y-4">
            <label class="flex flex-col gap-2 text-sm">
              <span
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >Name</span
              >
              <input
                bind:value={typedName}
                on:input={() => redraw()}
                type="text"
                placeholder="e.g. Alex Jordan"
                class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              />
            </label>

            <label class="flex flex-col gap-2 text-sm">
              <span
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >Typeface</span
              >
              <select
                bind:value={signatureFont}
                on:change={() => redraw()}
                class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {#each typefaces as face}
                  <option value={face}>{face}</option>
                {/each}
              </select>
            </label>

            <div class="grid gap-4 sm:grid-cols-2">
              <label class="flex flex-col gap-2 text-sm">
                <span
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >Font size</span
                >
                <input
                  type="range"
                  min="36"
                  max="140"
                  bind:value={typedSize}
                  on:input={() => redraw()}
                  class="accent-blue-600"
                />
                <span class="text-xs text-slate-500 dark:text-slate-400"
                  >{typedSize}px</span
                >
              </label>

              <label class="flex flex-col gap-2 text-sm">
                <span
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >Font weight</span
                >
                <select
                  bind:value={typedWeight}
                  on:change={() => redraw()}
                  class="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="400">Regular</option>
                  <option value="500">Medium</option>
                  <option value="600">Semibold</option>
                  <option value="700">Bold</option>
                </select>
              </label>
            </div>

            <div
              class="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  bind:checked={typedItalic}
                  on:change={() => redraw()}
                  class="h-4 w-4 accent-blue-500"
                />
                Italic
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  bind:checked={showBaseline}
                  on:change={() => redraw()}
                  class="h-4 w-4 accent-blue-500"
                />
                Show guideline
              </label>
              <label class="flex items-center gap-2">
                <input
                  type="checkbox"
                  bind:checked={transparentBackground}
                  on:change={() => redraw()}
                  class="h-4 w-4 accent-blue-500"
                />
                Transparent background
              </label>
            </div>
          </div>
        </div>
      {/if}

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 class="text-lg font-semibold">Export</h2>
        <p class="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Save your signature as a high-resolution PNG with optional transparent
          background.
        </p>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            on:click={exportSignature}
            disabled={isExporting}
          >
            {isExporting ? "Preparing..." : "Download PNG"}
          </button>
          <button
            type="button"
            class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
            on:click={clearSignature}
          >
            Clear workspace
          </button>
        </div>

        {#if previewDataUrl}
          <div class="mt-4 space-y-2">
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Last export preview
            </p>
            <div
              class="rounded-2xl border border-slate-200 bg-white/60 p-4 dark:border-slate-700 dark:bg-slate-900/50"
            >
              <img
                src={previewDataUrl}
                alt="Signature preview"
                class="mx-auto max-h-32 object-contain"
              />
            </div>
          </div>
        {/if}
      </div>
    </div>

    <div class="flex w-full flex-col gap-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 class="text-lg font-semibold">Canvas</h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Use your mouse, trackpad, stylus, or touch input to sketch. Typed mode
          keeps the canvas centred.
        </p>
        <div
          class="mt-4 overflow-hidden rounded-3xl border border-dashed border-slate-300 p-4 dark:border-slate-700"
          style={transparentBackground
            ? "background-image:linear-gradient(45deg, rgba(148,163,184,0.3) 25%, transparent 25%),linear-gradient(-45deg, rgba(148,163,184,0.3) 25%, transparent 25%),linear-gradient(45deg, transparent 75%, rgba(148,163,184,0.3) 75%),linear-gradient(-45deg, transparent 75%, rgba(148,163,184,0.3) 75%); background-size:26px 26px; background-position:0 0,0 13px,13px -13px,-13px 0;"
            : ""}
        >
          <div
            class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-inner dark:border-slate-700 dark:bg-slate-900/60"
          >
            <canvas
              bind:this={canvas}
              class="h-[360px] w-full cursor-crosshair touch-none bg-transparent"
              on:pointerdown={pointerDown}
              on:pointermove={pointerMove}
              on:pointerup={pointerUp}
              on:pointerleave={pointerLeave}
            ></canvas>
          </div>
        </div>
        <div
          class="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400"
        >
          <span
            >Tip: hold shift while drawing for steadier strokes on some devices.</span
          >
          <span
            >{Math.round(canvasWidth)} × {Math.round(canvasHeight)} px @ {dpr.toFixed(
              1,
            )}×</span
          >
        </div>
      </div>
    </div>
  </div>
</section>
