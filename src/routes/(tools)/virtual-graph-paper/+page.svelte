<script lang="ts">
  import { onDestroy, onMount } from "svelte";

  type Point = { x: number; y: number };
  type Tool =
    | "pen"
    | "line"
    | "rectangle"
    | "circle"
    | "arrow"
    | "eraser"
    | "text";

  type Action =
    | { type: "path"; points: Point[]; color: string; width: number }
    | { type: "erase"; points: Point[]; width: number }
    | {
        type: "shape";
        shape: "line" | "rectangle" | "circle" | "arrow";
        start: Point;
        end: Point;
        stroke: string;
        width: number;
        fill?: string | null;
      }
    | {
        type: "text";
        position: Point;
        value: string;
        color: string;
        size: number;
      };

  let canvas: HTMLCanvasElement | null = null;
  let container: HTMLDivElement | null = null;
  let ctx: CanvasRenderingContext2D | null = null;
  let observer: ResizeObserver | null = null;

  let tool: Tool = "pen";
  let strokeColor = "#1f2937";
  let fillColor = "#38bdf8";
  let lineWidth = 3;
  let showGrid = true;
  let snapToGrid = true;
  let gridSize = 24;
  let background = "#f8fafc";

  let drawing = false;
  let startPoint: Point | null = null;
  let currentPoints: Point[] = [];
  let preview: Action | null = null;

  let actions: Action[] = [];
  let redoStack: Action[] = [];

  const toolOptions: Array<{ id: Tool; label: string }> = [
    { id: "pen", label: "Pen" },
    { id: "line", label: "Line" },
    { id: "rectangle", label: "Rectangle" },
    { id: "circle", label: "Circle" },
    { id: "arrow", label: "Arrow" },
    { id: "text", label: "Text" },
    { id: "eraser", label: "Eraser" },
  ];

  onMount(() => {
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    ctx = context;
    observer = new ResizeObserver(() => resizeCanvas());
    if (container) observer.observe(container);
    resizeCanvas();
    render();
  });

  onDestroy(() => {
    observer?.disconnect();
  });

  function resizeCanvas() {
    if (!canvas || !container) return;
    const { width } = container.getBoundingClientRect();
    const height = Math.max(360, Math.min(720, width * 0.6));
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx?.setTransform(1, 0, 0, 1, 0, 0);
    ctx?.scale(dpr, dpr);
    render();
  }

  function pointerDown(event: PointerEvent) {
    if (!ctx || !canvas) return;
    canvas.setPointerCapture(event.pointerId);
    drawing = true;
    redoStack = [];
    const point = toPoint(event);
    startPoint = point;
    if (tool === "pen" || tool === "eraser") {
      currentPoints = [point];
    }
  }

  function pointerMove(event: PointerEvent) {
    if (!drawing || !ctx) return;
    const point = toPoint(event);
    if (tool === "pen" || tool === "eraser") {
      currentPoints = [...currentPoints, point];
      preview =
        tool === "pen"
          ? {
              type: "path",
              points: currentPoints,
              color: strokeColor,
              width: lineWidth,
            }
          : { type: "erase", points: currentPoints, width: lineWidth * 2 };
    } else if (startPoint) {
      preview = {
        type: "shape",
        shape: tool === "line" ? "line" : tool === "arrow" ? "arrow" : tool,
        start: startPoint,
        end: point,
        stroke: strokeColor,
        width: lineWidth,
        fill: tool === "rectangle" || tool === "circle" ? fillColor : null,
      };
    }
    render();
  }

  function pointerUp(event: PointerEvent) {
    if (!drawing) return;
    canvas?.releasePointerCapture(event.pointerId);
    const point = toPoint(event);
    drawing = false;
    if (tool === "pen") {
      const points = [...currentPoints, point];
      if (points.length > 1)
        actions = [
          ...actions,
          { type: "path", points, color: strokeColor, width: lineWidth },
        ];
    } else if (tool === "eraser") {
      const points = [...currentPoints, point];
      actions = [...actions, { type: "erase", points, width: lineWidth * 2 }];
    } else if (tool === "text") {
      const value = window.prompt("Enter text label", "");
      if (value) {
        actions = [
          ...actions,
          {
            type: "text",
            position: point,
            value,
            color: strokeColor,
            size: Math.max(14, lineWidth * 6),
          },
        ];
      }
    } else if (startPoint) {
      const shape =
        tool === "line"
          ? "line"
          : tool === "arrow"
            ? "arrow"
            : (tool as "rectangle" | "circle");
      actions = [
        ...actions,
        {
          type: "shape",
          shape,
          start: startPoint,
          end: point,
          stroke: strokeColor,
          width: lineWidth,
          fill: tool === "rectangle" || tool === "circle" ? fillColor : null,
        },
      ];
    }
    startPoint = null;
    currentPoints = [];
    preview = null;
    render();
  }

  function cancelDrawing(event?: PointerEvent) {
    if (event && canvas) {
      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        /* ignore */
      }
    }
    drawing = false;
    currentPoints = [];
    startPoint = null;
    preview = null;
    render();
  }

  function selectTool(next: Tool) {
    if (tool !== next) {
      tool = next;
      preview = null;
      drawing = false;
    }
  }

  function toPoint(event: PointerEvent): Point {
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    return snapToGrid ? snapPoint({ x, y }) : { x, y };
  }

  function snapPoint(point: Point) {
    const step = Math.max(6, gridSize);
    return {
      x: Math.round(point.x / step) * step,
      y: Math.round(point.y / step) * step,
    };
  }

  function render() {
    if (!ctx || !canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width / dpr;
    const height = canvas.height / dpr;
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    if (showGrid) drawGrid();
    for (const action of actions) drawAction(action);
    if (preview) drawAction(preview, true);
  }

  function drawGrid() {
    if (!ctx || !canvas) return;
    const step = Math.max(8, gridSize);
    ctx.save();
    ctx.strokeStyle = "#cbd5f5";
    ctx.lineWidth = 1;
    ctx.setLineDash([step * 0.02, step * 0.98]);
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);
    for (let x = 0; x <= width; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y <= height; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawAction(action: Action, isPreview = false) {
    if (!ctx) return;
    ctx.save();
    if (action.type === "path") {
      ctx.strokeStyle = action.color;
      ctx.lineWidth = action.width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.globalAlpha = isPreview ? 0.7 : 1;
      ctx.beginPath();
      action.points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    } else if (action.type === "erase") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = action.width;
      ctx.lineCap = "round";
      ctx.beginPath();
      action.points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    } else if (action.type === "shape") {
      ctx.strokeStyle = action.stroke;
      ctx.lineWidth = action.width;
      ctx.lineCap = "round";
      ctx.globalAlpha = isPreview ? 0.75 : 1;
      const { start, end } = action;
      if (action.shape === "line") {
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      } else if (action.shape === "rectangle") {
        const width = end.x - start.x;
        const height = end.y - start.y;
        if (action.fill) {
          ctx.fillStyle = action.fill;
          ctx.globalAlpha = 0.25;
          ctx.fillRect(start.x, start.y, width, height);
          ctx.globalAlpha = 1;
        }
        ctx.strokeRect(start.x, start.y, width, height);
      } else if (action.shape === "circle") {
        const radius = Math.hypot(end.x - start.x, end.y - start.y);
        ctx.beginPath();
        ctx.arc(start.x, start.y, radius, 0, Math.PI * 2);
        if (action.fill) {
          ctx.fillStyle = action.fill;
          ctx.globalAlpha = 0.25;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        ctx.stroke();
      } else if (action.shape === "arrow") {
        drawArrow(start, end, action.stroke, action.width);
      }
    } else if (action.type === "text") {
      ctx.fillStyle = action.color;
      ctx.font = `${action.size}px "Inter","Segoe UI",sans-serif`;
      ctx.fillText(action.value, action.position.x, action.position.y);
    }
    ctx.restore();
  }

  function drawArrow(start: Point, end: Point, color: string, width: number) {
    if (!ctx) return;
    const head = Math.max(12, width * 4);
    const angle = Math.atan2(end.y - start.y, end.x - start.x);
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(end.x, end.y);
    ctx.lineTo(
      end.x - head * Math.cos(angle - Math.PI / 8),
      end.y - head * Math.sin(angle - Math.PI / 8),
    );
    ctx.lineTo(
      end.x - head * Math.cos(angle + Math.PI / 8),
      end.y - head * Math.sin(angle + Math.PI / 8),
    );
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function undo() {
    if (!actions.length) return;
    const last = actions[actions.length - 1];
    actions = actions.slice(0, -1);
    redoStack = [...redoStack, last];
    render();
  }

  function redo() {
    if (!redoStack.length) return;
    const next = redoStack[redoStack.length - 1];
    redoStack = redoStack.slice(0, -1);
    actions = [...actions, next];
    render();
  }

  function clearCanvas() {
    actions = [];
    redoStack = [];
    render();
  }

  function downloadPNG() {
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = "virtual-graph-paper.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
</script>

<section class="space-y-6">
  <div
    class="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900/80"
  >
    <div
      class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <div class="flex flex-wrap items-center gap-2">
        {#each toolOptions as option}
          <button
            class="rounded-full border px-3 py-1.5 text-xs font-semibold transition {tool ===
            option.id
              ? 'border-emerald-400 bg-emerald-500/10 text-emerald-500 dark:border-emerald-500'
              : 'border-slate-300 text-slate-600 hover:border-slate-400 dark:border-slate-700 dark:text-slate-300'}"
            on:click={() => selectTool(option.id)}
          >
            {option.label}
          </button>
        {/each}
      </div>
      <div class="flex flex-wrap items-center gap-3 text-xs">
        <label class="flex items-center gap-2">
          <span class="font-medium text-slate-600 dark:text-slate-300"
            >Stroke</span
          >
          <input
            type="color"
            bind:value={strokeColor}
            class="h-9 w-16 rounded-md border border-slate-300 bg-white/90 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <label class="flex items-center gap-2">
          <span class="font-medium text-slate-600 dark:text-slate-300"
            >Fill</span
          >
          <input
            type="color"
            bind:value={fillColor}
            class="h-9 w-16 rounded-md border border-slate-300 bg-white/90 dark:border-slate-600 dark:bg-slate-800"
          />
        </label>
        <label class="flex items-center gap-2">
          <span class="font-medium text-slate-600 dark:text-slate-300"
            >Width</span
          >
          <input
            type="range"
            min="1"
            max="16"
            bind:value={lineWidth}
            class="accent-emerald-500"
          />
        </label>
      </div>
    </div>
    <div
      class="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300"
    >
      <label class="inline-flex items-center gap-2">
        <input
          type="checkbox"
          bind:checked={showGrid}
          class="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400 dark:border-slate-600"
        />
        Show grid
      </label>
      <label class="inline-flex items-center gap-2">
        <input
          type="checkbox"
          bind:checked={snapToGrid}
          class="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400 dark:border-slate-600"
        />
        Snap to grid
      </label>
      <label class="flex items-center gap-2">
        Grid size
        <input
          type="range"
          min="12"
          max="48"
          step="2"
          bind:value={gridSize}
          class="accent-emerald-500"
        />
      </label>
      <label class="flex items-center gap-2">
        Canvas background
        <input
          type="color"
          bind:value={background}
          class="h-9 w-16 rounded-md border border-slate-300 bg-white/90 dark:border-slate-600 dark:bg-slate-800"
        />
      </label>
    </div>
    <div class="flex flex-wrap gap-3 text-sm">
      <button
        class="rounded-full border border-transparent bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-600"
        on:click={undo}
      >
        Undo
      </button>
      <button
        class="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
        on:click={redo}
      >
        Redo
      </button>
      <button
        class="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-400 hover:text-rose-600 dark:border-slate-700 dark:text-slate-200"
        on:click={clearCanvas}
      >
        Clear canvas
      </button>
      <button
        class="rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
        on:click={downloadPNG}
      >
        Export PNG
      </button>
    </div>
    <div
      bind:this={container}
      class="relative overflow-hidden rounded-3xl border border-slate-200 bg-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-900"
    >
      <canvas
        bind:this={canvas}
        class="h-full w-full touch-none"
        on:pointerdown={pointerDown}
        on:pointermove={pointerMove}
        on:pointerup={pointerUp}
        on:pointerleave={cancelDrawing}
        on:pointercancel={cancelDrawing}
      >
        Your browser does not support the HTML canvas element.
      </canvas>
    </div>
  </div>
</section>
