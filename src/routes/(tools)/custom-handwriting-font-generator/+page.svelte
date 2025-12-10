<script lang="ts">
  import { browser } from "$app/environment";
  import { onDestroy, onMount } from "svelte";
  import { derived, get, writable } from "svelte/store";
  import ImageTracer from "imagetracerjs";

  type GlyphMap = Record<string, string | null>;

  const STORAGE_KEY = "custom-handwriting-font-generator-glyphs-v1";
  const LEGACY_LIST_KEY = "savedLetters";
  const canvasSize = 320;

  const glyphOrder = [
    ...Array.from({ length: 26 }, (_, index) =>
      String.fromCharCode(65 + index),
    ),
    ...Array.from({ length: 26 }, (_, index) =>
      String.fromCharCode(97 + index),
    ),
    ..."0123456789",
  ];

  const createEmptyGlyphMap = (): GlyphMap =>
    Object.fromEntries(glyphOrder.map((letter) => [letter, null])) as GlyphMap;

  const glyphs = writable<GlyphMap>(createEmptyGlyphMap());

  const progressStats = derived(glyphs, ($glyphs) => {
    const completed = glyphOrder.reduce(
      (total, letter) => total + ($glyphs[letter] ? 1 : 0),
      0,
    );
    const percent = Math.min(
      100,
      Math.round((completed / glyphOrder.length) * 100) || 0,
    );
    return { completed, percent };
  });
  const totalLetters = glyphOrder.length;

  onDestroy(() => {
    teardownCanvas();
  });

  let drawingCanvas: HTMLCanvasElement | null = null;
  let drawingCtx: CanvasRenderingContext2D | null = null;
  let isDrawing = false;
  let isEraser = false;
  let penWidth = 4;
  let eraserWidth = 18;
  const DEFAULT_PEN_COLOR = "#0f172a";
  const DEFAULT_BOARD_COLOR = "#ffffff";
  const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i;

  let penColor = DEFAULT_PEN_COLOR;
  let boardColor = DEFAULT_BOARD_COLOR;
  $: safePenColor = HEX_COLOR_PATTERN.test(penColor)
    ? penColor
    : DEFAULT_PEN_COLOR;
  $: safeBoardColor = HEX_COLOR_PATTERN.test(boardColor)
    ? boardColor
    : DEFAULT_BOARD_COLOR;
  $: if (!HEX_COLOR_PATTERN.test(penColor)) {
    penColor = DEFAULT_PEN_COLOR;
  }
  $: if (!HEX_COLOR_PATTERN.test(boardColor)) {
    boardColor = DEFAULT_BOARD_COLOR;
  }
  let showGuides = true;
  let previewText = "Craft bold personal fonts directly in your browser.";
  let previewSize = 42;
  let previewSpacing = 8;
  let previewGap = 12;
  let previewGlyphs: Array<{ character: string; glyph: string | null }> = [];
  let char = glyphOrder[0];
  let currentIndex = 0;
  let lastSavedStamp: Date | null = null;
  let importError = "";
  let exporting = false;
  let downloading = false;

  const pointerEvents = ["pointerup", "pointerleave", "pointercancel"];

  onMount(() => {
    if (!browser) return;
    setupCanvas();
    loadGlyphsFromStorage();
    restoreGlyphOnCanvas(char);
  });

  function setupCanvas() {
    if (!drawingCanvas) return;
    drawingCtx = drawingCanvas.getContext("2d");
    if (!drawingCtx) return;
    drawingCtx.lineCap = "round";
    drawingCtx.lineJoin = "round";
    refreshToolSettings();

    drawingCanvas.addEventListener("pointerdown", handlePointerDown);
    drawingCanvas.addEventListener("pointermove", handlePointerMove);
    pointerEvents.forEach((event) =>
      drawingCanvas?.addEventListener(event, stopDrawing),
    );
  }

  function teardownCanvas() {
    if (!drawingCanvas) return;
    drawingCanvas.removeEventListener("pointerdown", handlePointerDown);
    drawingCanvas.removeEventListener("pointermove", handlePointerMove);
    pointerEvents.forEach((event) =>
      drawingCanvas?.removeEventListener(event, stopDrawing),
    );
  }

  function refreshToolSettings() {
    if (!drawingCtx) return;
    drawingCtx.lineWidth = isEraser ? eraserWidth : penWidth;
    drawingCtx.strokeStyle = isEraser ? safeBoardColor : safePenColor;
  }

  $: {
    safePenColor;
    safeBoardColor;
    penWidth;
    eraserWidth;
    isEraser;
    refreshToolSettings();
  }

  function handlePointerDown(event: PointerEvent) {
    if (!drawingCanvas || !drawingCtx) return;
    event.preventDefault();
    const { x, y } = getPointerPosition(event);
    drawingCanvas.setPointerCapture(event.pointerId);
    drawingCtx.beginPath();
    drawingCtx.moveTo(x, y);
    isDrawing = true;
  }

  function handlePointerMove(event: PointerEvent) {
    if (!isDrawing || !drawingCtx) return;
    event.preventDefault();
    const { x, y } = getPointerPosition(event);
    drawingCtx.lineTo(x, y);
    drawingCtx.stroke();
  }

  function stopDrawing() {
    if (!isDrawing || !drawingCtx) return;
    drawingCtx.closePath();
    isDrawing = false;
  }

  function getPointerPosition(event: PointerEvent) {
    if (!drawingCanvas) return { x: 0, y: 0 };
    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width / rect.width;
    const scaleY = drawingCanvas.height / rect.height;
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  function goToLetter(letter: string) {
    const index = glyphOrder.indexOf(letter);
    if (index === -1) return;
    currentIndex = index;
    char = glyphOrder[currentIndex];
    restoreGlyphOnCanvas(char);
  }

  function switchLetter(delta: number) {
    currentIndex =
      (currentIndex + delta + glyphOrder.length) % glyphOrder.length;
    char = glyphOrder[currentIndex];
    restoreGlyphOnCanvas(char);
  }

  function setTool(mode: "pen" | "eraser") {
    isEraser = mode === "eraser";
    refreshToolSettings();
  }

  function restoreGlyphOnCanvas(letter: string) {
    if (!drawingCtx || !drawingCanvas) return;
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    const svgString = get(glyphs)[letter];
    if (!svgString) return;
    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      drawingCtx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }

  function updateGlyph(letter: string, svgString: string | null) {
    glyphs.update((map) => {
      const next = { ...map, [letter]: svgString };
      persistGlyphMap(next);
      return next;
    });
  }

  function persistGlyphMap(next: GlyphMap) {
    safeSetItem(STORAGE_KEY, JSON.stringify(next));
  }

  function safeGetItem(key: string) {
    if (!browser) return null;
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn("Storage unavailable:", error);
      return null;
    }
  }

  function safeSetItem(key: string, value: string) {
    if (!browser) return;
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn("Storage unavailable:", error);
    }
  }

  function safeRemoveItem(key: string) {
    if (!browser) return;
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn("Storage unavailable:", error);
    }
  }

  function loadGlyphsFromStorage() {
    const base = createEmptyGlyphMap();
    if (!browser) {
      glyphs.set(base);
      return;
    }

    let restored = base;

    try {
      const raw = safeGetItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as GlyphMap;
        restored = { ...restored, ...parsed };
      }
    } catch (error) {
      console.warn("Unable to parse saved glyphs", error);
    }

    try {
      const legacyList: string[] =
        JSON.parse(safeGetItem(LEGACY_LIST_KEY) || "[]") ?? [];
      legacyList.forEach((letter) => {
        const legacyGlyph = safeGetItem(letter);
        if (legacyGlyph) {
          restored[letter] = legacyGlyph;
        }
      });
    } catch (error) {
      console.warn("Unable to migrate legacy glyphs", error);
    }

    glyphs.set(restored);
  }

  async function saveGlyph() {
    if (!drawingCanvas) return;
    const svgString = await canvasToSVG();
    updateGlyph(char, svgString);
    lastSavedStamp = new Date();
    safeSetItem(char, svgString);
    const saved = JSON.parse(safeGetItem(LEGACY_LIST_KEY) || "[]");
    if (!saved.includes(char)) {
      saved.push(char);
      safeSetItem(LEGACY_LIST_KEY, JSON.stringify(saved));
    }
    switchLetter(1);
  }

  function clearCurrentCanvas() {
    if (!drawingCtx || !drawingCanvas) return;
    drawingCtx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
  }

  function deleteGlyph(letter: string) {
    updateGlyph(letter, null);
    safeRemoveItem(letter);
    const saved = JSON.parse(safeGetItem(LEGACY_LIST_KEY) || "[]");
    const nextList = saved.filter((entry: string) => entry !== letter);
    safeSetItem(LEGACY_LIST_KEY, JSON.stringify(nextList));
    if (letter === char) {
      clearCurrentCanvas();
    }
  }

  function resetCollection() {
    if (
      browser &&
      !window.confirm(
        "This will remove every saved glyph in this collection. Continue?",
      )
    ) {
      return;
    }
    const emptyMap = createEmptyGlyphMap();
    glyphs.set(emptyMap);
    persistGlyphMap(emptyMap);
    glyphOrder.forEach((letter) => safeRemoveItem(letter));
    safeRemoveItem(LEGACY_LIST_KEY);
    lastSavedStamp = null;
    clearCurrentCanvas();
  }

  async function handleDownloadSvg() {
    downloading = true;
    const svgString = await canvasToSVG();
    if (!svgString) {
      downloading = false;
      return;
    }
    const blob = new Blob([svgString], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `glyph-${char}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
    downloading = false;
  }

  async function handleExportGlyphs() {
    exporting = true;
    const entries = Object.entries(get(glyphs)).filter(([, value]) =>
      Boolean(value),
    );
    const payload = Object.fromEntries(entries);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "handwriting-glyphs.json";
    anchor.click();
    URL.revokeObjectURL(url);
    exporting = false;
  }

  function handleImportGlyphs(event: Event) {
    importError = "";
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(
          typeof reader.result === "string" ? reader.result : "{}",
        ) as GlyphMap;
        const nextMap = JSON.parse(JSON.stringify(get(glyphs))) as GlyphMap;
        Object.entries(imported).forEach(([letter, value]) => {
          if (glyphOrder.includes(letter) && typeof value === "string") {
            nextMap[letter] = value;
            safeSetItem(letter, value);
          }
        });
        glyphs.set(nextMap);
        persistGlyphMap(nextMap);
        importError = "";
        restoreGlyphOnCanvas(char);
      } catch (error) {
        console.error("Unable to import glyphs", error);
        importError =
          "Import failed. Please provide a JSON file that was exported from this tool.";
      }
    };
    reader.readAsText(file);
  }

  function hexToRgb(hex: string) {
    const normalized = hex.replace("#", "");
    const parsed = Number.parseInt(
      normalized.length === 3
        ? normalized
            .split("")
            .map((char) => `${char}${char}`)
            .join("")
        : normalized,
      16,
    );
    return {
      r: (parsed >> 16) & 255,
      g: (parsed >> 8) & 255,
      b: parsed & 255,
    };
  }

  async function canvasToSVG() {
    if (!drawingCanvas) return "";
    return new Promise<string>((resolve) => {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = drawingCanvas.width;
      tempCanvas.height = drawingCanvas.height;
      const tempCtx = tempCanvas.getContext("2d");
      if (!tempCtx) {
        resolve("");
        return;
      }
      tempCtx.drawImage(drawingCanvas, 0, 0);
      const { r: bgR, g: bgG, b: bgB } = hexToRgb(boardColor);
      const imageData = tempCtx.getImageData(
        0,
        0,
        tempCanvas.width,
        tempCanvas.height,
      );
      const data = imageData.data;
      for (let index = 0; index < data.length; index += 4) {
        const [r, g, b] = [data[index], data[index + 1], data[index + 2]];
        const isBackground =
          Math.abs(r - bgR) < 6 &&
          Math.abs(g - bgG) < 6 &&
          Math.abs(b - bgB) < 6;
        if (isBackground) {
          data[index + 3] = 0;
        }
      }
      tempCtx.putImageData(imageData, 0, 0);
      const pngData = tempCanvas.toDataURL("image/png");
      const options = {
        ltres: 1,
        qtres: 1,
        pathomit: 8,
        rightangleenhance: true,
      };
      ImageTracer.imageToSVG(
        pngData,
        (svgString: string) => resolve(svgString),
        options,
      );
    });
  }

  $: currentGlyphPreview = $glyphs?.[char] ?? null;
  $: previewGlyphs = previewText.split("").map((character) => ({
    character,
    glyph: $glyphs?.[character] ?? null,
  }));
  $: canvasBackgroundStyle = showGuides
    ? `background-color:${boardColor};background-image:linear-gradient(rgba(15,23,42,0.08) 1px, transparent 1px),linear-gradient(90deg, rgba(15,23,42,0.08) 1px, transparent 1px);background-size:28px 28px,28px 28px;`
    : `background-color:${boardColor};`;

  function formatTimestamp(date: Date) {
    return `${date.toLocaleDateString()} · ${date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  }

  function inlinePreviewSvg(svg?: string | null) {
    if (!svg) return "";
    let normalized = svg.trim();
    normalized = normalized.replace(/<\?xml[\s\S]*?\?>/gi, "");
    normalized = normalized.replace(/width="[^"]*"/i, "");
    normalized = normalized.replace(/height="[^"]*"/i, "");
    if (!/viewBox=/i.test(normalized)) {
      normalized = normalized.replace(
        "<svg",
        '<svg viewBox="0 0 320 320"',
      );
    }
    if (!/preserveAspectRatio=/i.test(normalized)) {
      normalized = normalized.replace(
        "<svg",
        '<svg preserveAspectRatio="xMidYMid meet"',
      );
    }
    if (!/style="/i.test(normalized)) {
      normalized = normalized.replace(
        "<svg",
        '<svg style="width:100%;height:100%;display:block;"',
      );
    } else {
      normalized = normalized.replace(
        /style="([^"]*)"/i,
        'style="$1;width:100%;height:100%;display:block;"',
      );
    }
    return normalized;
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,0.55fr)_minmax(0,1.45fr)]">
    <div class="space-y-6 min-w-0">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/90"
      >
        <header class="flex items-start justify-between gap-3">
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Glyph progress
            </p>
            <h2
              class="mt-1 text-2xl font-semibold text-slate-900 dark:text-white"
            >
              {$progressStats.completed} / {totalLetters} drawn
            </h2>
          </div>
          <button
            type="button"
            class="rounded-full border border-rose-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-rose-500 transition hover:border-rose-300 hover:text-rose-600 dark:border-rose-400/40 dark:text-rose-300"
            on:click={resetCollection}
          >
            Reset collection
          </button>
        </header>
        <div class="mt-4">
          <div class="flex items-center justify-between text-xs font-semibold">
            <span class="text-slate-500 dark:text-slate-400">Completion</span>
            <span class="text-slate-900 dark:text-white">
              {$progressStats.percent}%
            </span>
          </div>
          <div class="mt-3 h-3 w-full rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              class="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-indigo-500 to-sky-400 transition-all dark:from-fuchsia-400 dark:via-indigo-400 dark:to-sky-300"
              style={`width: ${$progressStats.percent}%;`}
            ></div>
          </div>
          {#if lastSavedStamp}
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Last saved: {formatTimestamp(lastSavedStamp)}
            </p>
          {/if}
        </div>
        <div class="mt-4 flex flex-wrap gap-3">
          <label
            class="inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
          >
            Import set
            <input
              type="file"
              accept="application/json"
              class="sr-only"
              on:change={handleImportGlyphs}
            />
          </label>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
            on:click={handleExportGlyphs}
          >
            {exporting ? "Exporting…" : "Export set"}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
            on:click={handleDownloadSvg}
            disabled={downloading}
          >
            {downloading ? "Preparing SVG…" : "Download current"}
          </button>
        </div>
        {#if importError}
          <p
            class="mt-3 text-xs font-semibold text-rose-500 dark:text-rose-300"
          >
            {importError}
          </p>
        {/if}
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/90"
      >
        <div class="flex items-center justify-between">
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Glyph palette
            </p>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Tap to jump between letters, numbers, or revisit saved strokes.
            </p>
          </div>
          <span
            class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white dark:bg-white dark:text-slate-900"
          >
            {char}
          </span>
        </div>
        <div
          class="mt-4 grid grid-cols-4 gap-2 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7"
        >
          {#each glyphOrder as letter}
            <button
              type="button"
              class={`aspect-square rounded-2xl border text-lg font-semibold transition ${
                letter === char
                  ? "border-indigo-400 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-200"
                  : $glyphs?.[letter]
                    ? "border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-500/40 dark:bg-emerald-500/10 dark:text-emerald-200"
                    : "border-slate-200 text-slate-500 hover:border-slate-300 dark:border-slate-800 dark:text-slate-400 dark:hover:border-slate-700"
              }`}
              on:click={() => goToLetter(letter)}
            >
              {letter}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <div class="space-y-6 min-w-0">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/90"
      >
        <header class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Drawing desk
            </p>
            <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">
              Character {char}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Pen strokes are vectorized via ImageTracer for crisp SVG previews.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <button
              type="button"
              class="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
              on:click={() => switchLetter(-1)}
            >
              Previous
            </button>
            <button
              type="button"
              class="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-slate-300 dark:border-slate-700 dark:text-slate-200"
              on:click={() => switchLetter(1)}
            >
              Next
            </button>
          </div>
        </header>

        <div class="mt-6 grid gap-4 lg:grid-cols-2">
          <div class="space-y-3">
            <label
              class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Pen color
              <input
                type="color"
                bind:value={penColor}
                class="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950 dark:[color-scheme:dark]"
              />
            </label>
            <label
              class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Board color
              <input
                type="color"
                bind:value={boardColor}
                class="h-12 w-full cursor-pointer rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950 dark:[color-scheme:dark]"
              />
            </label>
            <label
              class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
            >
              <input
                type="checkbox"
                class="h-4 w-4 accent-indigo-600"
                bind:checked={showGuides}
              />
              Show baseline guides
            </label>
          </div>
        <div class="space-y-3">
          <div class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300">
            <div class="flex rounded-full border border-slate-200 p-1 dark:border-slate-700">
              <button
                type="button"
                class={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                  !isEraser
                    ? "bg-indigo-600 text-white dark:bg-indigo-500"
                    : "text-slate-600 hover:text-indigo-600 dark:text-slate-200"
                }`}
                on:click={() => setTool("pen")}
              >
                Pen
              </button>
              <button
                type="button"
                class={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide transition ${
                  isEraser
                    ? "bg-amber-400 text-slate-900 dark:bg-amber-300 dark:text-slate-900"
                    : "text-slate-600 hover:text-amber-500 dark:text-slate-200"
                }`}
                on:click={() => setTool("eraser")}
              >
                Eraser
              </button>
            </div>
          </div>
            {#if !isEraser}
              <label
                class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Pen width
                <input type="range" min="1" max="16" bind:value={penWidth} />
              </label>
            {:else}
              <label
                class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Eraser width
                <input type="range" min="8" max="32" bind:value={eraserWidth} />
              </label>
            {/if}
          </div>
        </div>

        <div class="mt-6 flex flex-col gap-4">
          <div
            class="items-center relative mx-auto w-full max-w-sm rounded-[32px] border-4 border-dashed border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900 sm:max-w-md"
          >
            <canvas
              bind:this={drawingCanvas}
              width={canvasSize}
              height={canvasSize}
              class="block h-auto w-full rounded-2xl border border-slate-200 shadow-inner dark:border-slate-800"
              style={`aspect-ratio:1/1;${canvasBackgroundStyle}`}
            >
              Your browser does not support the canvas element.
            </canvas>
            {#if currentGlyphPreview}
              <span
                class="absolute right-4 top-3 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-500 shadow dark:border-slate-600 dark:bg-slate-900/80 dark:text-slate-200"
              >
                saved
              </span>
            {/if}
          </div>

          <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              class="rounded-full border border-slate-300 px-4 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-rose-200 hover:text-rose-500 dark:border-slate-700 dark:text-slate-200"
              on:click={() => deleteGlyph(char)}
            >
              Remove glyph
            </button>
            <button
              type="button"
              class="rounded-full bg-gradient-to-r from-indigo-600 to-violet-500 px-6 py-2 text-center text-xs font-semibold uppercase tracking-wide text-white shadow transition hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:from-indigo-500 dark:to-violet-500 dark:hover:brightness-110 dark:focus:ring-indigo-700"
              on:click={saveGlyph}
            >
              Save & next
            </button>
          </div>
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/90"
      >
        <header class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Live preview
            </p>
            <h2 class="text-2xl font-semibold text-slate-900 dark:text-white">
              Compose sample phrases
            </h2>
          </div>
          <div
            class="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Size</span>
            <input type="range" min="28" max="72" bind:value={previewSize} />
            <span>Spacing</span>
            <input type="range" min="0" max="24" bind:value={previewSpacing} />
          </div>
        </header>

        <textarea
          class="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-800"
          rows="3"
          bind:value={previewText}
        ></textarea>

        <div
          class="mt-4 flex flex-wrap rounded-2xl border border-slate-200 bg-white/85 p-4 text-slate-900 dark:border-slate-700 dark:bg-slate-900/80 dark:text-white"
          style={`gap:${previewGap}px;`}
        >
          {#each previewGlyphs as preview}
            {#if preview.glyph}
              <div
                class="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-700"
                style={`height:${previewSize}px;width:${previewSize}px;`}
              >
                {@html inlinePreviewSvg(preview.glyph)}
              </div>
            {:else}
              <div
                class="flex items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white/60 px-2 text-center text-slate-500 dark:border-slate-600 dark:bg-slate-900/30 dark:text-slate-300"
                style={`height:${previewSize}px;width:${previewSize}px;`}
              >
                <span
                  class="font-semibold"
                  style={`font-size:${previewSize * 0.5}px;letter-spacing:${previewSpacing}px;`}
                >
                  {preview.character}
                </span>
              </div>
            {/if}
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
