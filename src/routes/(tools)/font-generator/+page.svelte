<script>
  import { onMount, onDestroy, tick } from "svelte";
  import ImageTracer from "imagetracerjs";
  import opentype from "opentype.js";

  const glyphGroups = [
    { label: "Uppercase", chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("") },
    { label: "Lowercase", chars: "abcdefghijklmnopqrstuvwxyz".split("") },
    { label: "Digits", chars: "0123456789".split("") },
    {
      label: "Punctuation",
      chars: [
        ".",
        ",",
        "!",
        "?",
        ":",
        ";",
        "\"",
        "'",
        "-",
        "_",
        "(",
        ")",
        "[",
        "]",
        "{",
        "}",
        "/",
        "\\",
        "&",
        "@",
        "#",
        "%",
        "+",
        "=",
        "*",
        "<",
        ">",
        "|",
        "~",
        "`",
      ],
    },
    { label: "Space", chars: [" "] },
  ];

  const glyphOrder = glyphGroups.flatMap((group) => group.chars);
  const STORAGE_KEY = "font-generator-glyphs-v1";
  const SETTINGS_KEY = "font-generator-settings-v1";
  const DEFAULT_FONT_NAME = "My Handwriting";
  const CANVAS_SIZE = 512;
  const UNITS_PER_EM = 1024;
  const FALLBACK_PREVIEW_FONT =
    '"ui-rounded","SF Pro Rounded","Segoe UI","Helvetica Neue",system-ui,sans-serif';

  const traceOptions = {
    ltres: 1,
    qtres: 1,
    pathomit: 8,
    colorsampling: 0,
    numberofcolors: 2,
    roundcoords: 1,
    strokewidth: 1,
    viewbox: true,
    scale: 1,
  };

  function createInitialGlyphMap() {
    const map = {};
    glyphOrder.forEach((char) => {
      map[char] = { strokes: [] };
    });
    return map;
  }

  function cloneStrokes(strokes) {
    return (strokes || []).map((stroke) => ({
      width: Number(stroke.width ?? 6),
      points: (stroke.points || []).map((point) => ({
        x: Number(point.x),
        y: Number(point.y),
      })),
    }));
  }

  function glyphName(char) {
    if (char === " ") {
      return "space";
    }
    return `u${char.codePointAt(0).toString(16)}`;
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  let glyphMap = createInitialGlyphMap();
  let activeGlyphIndex = 0;
  let activeGlyph = glyphOrder[activeGlyphIndex];
  let activeStrokes = glyphMap[activeGlyph].strokes;
  let hasActiveStrokes = false;

  let penSize = 8;
  let showGuides = true;
  let letterSpacing = 0;
  let lineHeight = 1.4;
  let baselineRatio = 0.78;
  let ascenderRatio = 0.2;
  let descenderRatio = 0.94;
  let sideBearingRatio = 0.08;
  let spaceWidth = 0.35;

  let previewText =
    "The quick brown fox jumps over the lazy dog.\nPack my box with five dozen liquor jugs.\n1234567890";
  let fontName = DEFAULT_FONT_NAME;

  let canvas;
  let ctx;
  let offscreenCanvas;
  let offscreenCtx;
  let isDrawing = false;
  let currentStroke = [];
  let pointerId = null;

  let generating = false;
  let generateError = "";
  let successMessage = "";
  let fontObjectUrl = "";
  let activeFontFace = null;
  let previewFontFamily = FALLBACK_PREVIEW_FONT;
  let downloadFileName = "font-generator.ttf";

  const totalGlyphs = glyphOrder.length;

  $: activeGlyph = glyphOrder[activeGlyphIndex];
  $: activeStrokes = glyphMap[activeGlyph]?.strokes ?? [];
  $: hasActiveStrokes = activeStrokes.length > 0;
  $: completedCount = glyphOrder.reduce(
    (count, char) =>
      count + ((glyphMap[char]?.strokes?.length ?? 0) > 0 ? 1 : 0),
    0,
  );
  $: progressPercent = Math.round((completedCount / totalGlyphs) * 100);
  $: downloadFileName = `${toSafeFileName(fontName || DEFAULT_FONT_NAME)}.ttf`;

  $: if (ctx) {
    redraw();
  }

  onMount(() => {
    if (!canvas) {
      return;
    }

    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    offscreenCanvas = document.createElement("canvas");
    offscreenCanvas.width = CANVAS_SIZE;
    offscreenCanvas.height = CANVAS_SIZE;
    offscreenCtx = offscreenCanvas.getContext("2d", { willReadFrequently: true });
    offscreenCtx.lineCap = "round";
    offscreenCtx.lineJoin = "round";

    loadState();
    redraw();
  });

  onDestroy(() => {
    if (fontObjectUrl) {
      URL.revokeObjectURL(fontObjectUrl);
      fontObjectUrl = "";
    }
    if (activeFontFace && document?.fonts?.delete) {
      try {
        document.fonts.delete(activeFontFace);
      } catch (error) {
        console.error("Unable to remove previous font face", error);
      }
    }
  });

  function loadState() {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const storedGlyphs = localStorage.getItem(STORAGE_KEY);
      if (storedGlyphs) {
        const parsed = JSON.parse(storedGlyphs);
        const base = createInitialGlyphMap();
        glyphOrder.forEach((char) => {
          if (parsed?.[char]?.strokes?.length) {
            base[char] = { strokes: cloneStrokes(parsed[char].strokes) };
          }
        });
        glyphMap = base;
      }

      const storedSettings = localStorage.getItem(SETTINGS_KEY);
      if (storedSettings) {
        const settings = JSON.parse(storedSettings);
        fontName = settings.fontName ?? fontName;
        penSize = settings.penSize ?? penSize;
        showGuides = settings.showGuides ?? showGuides;
        letterSpacing = settings.letterSpacing ?? letterSpacing;
        lineHeight = settings.lineHeight ?? lineHeight;
        baselineRatio = clamp(settings.baselineRatio ?? baselineRatio, 0.5, 0.9);
        ascenderRatio = clamp(settings.ascenderRatio ?? ascenderRatio, 0.05, 0.45);
        descenderRatio = clamp(settings.descenderRatio ?? descenderRatio, 0.85, 0.98);
        sideBearingRatio = clamp(
          settings.sideBearingRatio ?? sideBearingRatio,
          0,
          0.25,
        );
        spaceWidth = clamp(settings.spaceWidth ?? spaceWidth, 0.15, 0.9);
      }
    } catch (error) {
      console.error("Unable to restore saved font generator state", error);
    }
  }

  function persistGlyphMap() {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const payload = {};
      glyphOrder.forEach((char) => {
        payload[char] = {
          strokes: cloneStrokes(glyphMap[char]?.strokes ?? []),
        };
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.error("Unable to save glyph data", error);
    }
  }

  function persistSettings() {
    if (typeof window === "undefined") {
      return;
    }
    try {
      localStorage.setItem(
        SETTINGS_KEY,
        JSON.stringify({
          fontName,
          penSize,
          showGuides,
          letterSpacing,
          lineHeight,
          baselineRatio,
          ascenderRatio,
          descenderRatio,
          sideBearingRatio,
          spaceWidth,
        }),
      );
    } catch (error) {
      console.error("Unable to save settings", error);
    }
  }

  function selectGlyph(char) {
    const nextIndex = glyphOrder.indexOf(char);
    if (nextIndex !== -1) {
      activeGlyphIndex = nextIndex;
    }
  }

  function previousGlyph() {
    activeGlyphIndex =
      (activeGlyphIndex - 1 + glyphOrder.length) % glyphOrder.length;
  }

  function nextGlyph() {
    activeGlyphIndex = (activeGlyphIndex + 1) % glyphOrder.length;
  }

  function isGlyphComplete(char) {
    return (glyphMap[char]?.strokes?.length ?? 0) > 0;
  }

  function pointerToCanvasPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_SIZE,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_SIZE,
    };
  }
  function handlePointerDown(event) {
    if (!ctx) {
      return;
    }
    event.preventDefault();
    if (pointerId === null && event.pointerId !== undefined) {
      pointerId = event.pointerId;
      canvas.setPointerCapture(event.pointerId);
    }

    const point = pointerToCanvasPosition(event);
    isDrawing = true;
    currentStroke = [{ x: point.x, y: point.y }];

    ctx.save();
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = penSize;
    ctx.beginPath();
    ctx.moveTo(point.x, point.y);
    ctx.restore();
  }

  function handlePointerMove(event) {
    if (!isDrawing || !ctx) {
      return;
    }
    event.preventDefault();
    const point = pointerToCanvasPosition(event);
    const lastPoint = currentStroke[currentStroke.length - 1];

    if (!lastPoint || Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y) >= 0.5) {
      currentStroke.push({ x: point.x, y: point.y });
      ctx.save();
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = penSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
      ctx.restore();
    }
  }

  function handlePointerUp(event) {
    if (!isDrawing) {
      return;
    }
    event.preventDefault();
    isDrawing = false;

    if (pointerId !== null && event.pointerId === pointerId) {
      canvas.releasePointerCapture(pointerId);
      pointerId = null;
    }

    if (currentStroke.length > 1) {
      const stroke = {
        width: penSize,
        points: currentStroke.map((point) => ({
          x: Number(point.x.toFixed(2)),
          y: Number(point.y.toFixed(2)),
        })),
      };
      const existing = glyphMap[activeGlyph]?.strokes ?? [];
      glyphMap = {
        ...glyphMap,
        [activeGlyph]: {
          strokes: [...existing, stroke],
        },
      };
      persistGlyphMap();
      redraw();
    }

    currentStroke = [];
  }

  function undoStroke() {
    if (!hasActiveStrokes) {
      return;
    }
    const updated = activeStrokes.slice(0, -1);
    glyphMap = {
      ...glyphMap,
      [activeGlyph]: { strokes: updated },
    };
    persistGlyphMap();
    redraw();
  }

  function clearGlyph() {
    if (!hasActiveStrokes) {
      return;
    }
    glyphMap = {
      ...glyphMap,
      [activeGlyph]: { strokes: [] },
    };
    persistGlyphMap();
    redraw();
  }

  function resetAllGlyphs() {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm(
        "This will remove all glyph drawings. Continue?",
      );
      if (!confirmed) {
        return;
      }
    }
    glyphMap = createInitialGlyphMap();
    persistGlyphMap();
    redraw();
  }

  function drawGuides() {
    if (!ctx) {
      return;
    }
    const xPadding = 24;
    const ascenderY = ascenderRatio * CANVAS_SIZE;
    const baselineY = baselineRatio * CANVAS_SIZE;
    const descenderY = descenderRatio * CANVAS_SIZE;
    const xHeightRatio =
      baselineRatio - (baselineRatio - ascenderRatio) * 0.6;
    const xHeightY = xHeightRatio * CANVAS_SIZE;

    ctx.save();
    ctx.strokeStyle = "rgba(59,130,246,0.35)";
    ctx.setLineDash([6, 10]);
    ctx.lineWidth = 1;

    const drawLine = (y) => {
      ctx.beginPath();
      ctx.moveTo(xPadding, y);
      ctx.lineTo(CANVAS_SIZE - xPadding, y);
      ctx.stroke();
    };

    drawLine(ascenderY);
    drawLine(xHeightY);
    drawLine(baselineY);
    drawLine(descenderY);

    ctx.restore();
  }

  function drawStrokes(context, strokes, { clearBefore = true } = {}) {
    if (!context) {
      return;
    }
    if (clearBefore) {
      context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
    context.save();
    context.strokeStyle = "#111827";
    context.lineCap = "round";
    context.lineJoin = "round";

    strokes.forEach((stroke) => {
      if (!stroke?.points || stroke.points.length < 2) {
        return;
      }
      context.lineWidth = stroke.width ?? penSize;
      const [start, ...rest] = stroke.points;
      context.beginPath();
      context.moveTo(start.x, start.y);
      rest.forEach((point) => {
        context.lineTo(point.x, point.y);
      });
      context.stroke();
    });

    context.restore();
  }

  function redraw() {
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    if (showGuides) {
      drawGuides();
    }
    drawStrokes(ctx, activeStrokes, { clearBefore: false });
  }

  function enforceMetricBounds() {
    ascenderRatio = clamp(ascenderRatio, 0.05, baselineRatio - 0.05);
    descenderRatio = clamp(descenderRatio, baselineRatio + 0.02, 0.98);
    baselineRatio = clamp(
      baselineRatio,
      ascenderRatio + 0.05,
      descenderRatio - 0.05,
    );
  }

  function setAscender(value) {
    ascenderRatio = Number(value);
    enforceMetricBounds();
    persistSettings();
    redraw();
  }

  function setBaseline(value) {
    baselineRatio = Number(value);
    enforceMetricBounds();
    persistSettings();
    redraw();
  }

  function setDescender(value) {
    descenderRatio = Number(value);
    enforceMetricBounds();
    persistSettings();
    redraw();
  }

  function setPenSize(value) {
    penSize = Number(value);
    persistSettings();
  }

  function setShowGuides(value) {
    showGuides = value;
    persistSettings();
    redraw();
  }

  function setSideBearing(value) {
    sideBearingRatio = Number(value);
    persistSettings();
  }

  function setSpaceWidth(value) {
    spaceWidth = Number(value);
    persistSettings();
  }

  function setLetterSpacing(value) {
    letterSpacing = Number(value);
    persistSettings();
  }

  function setLineHeight(value) {
    lineHeight = Number(value);
    persistSettings();
  }

  function toAlphaBounds(imageData) {
    const { data, width, height } = imageData;
    let minX = width;
    let maxX = 0;
    let minY = height;
    let maxY = 0;

    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        const idx = (y * width + x) * 4 + 3;
        if (data[idx] > 0) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX === 0 && minX === width) {
      return null;
    }

    const padding = 2;
    return {
      minX: Math.max(0, minX - padding),
      maxX: Math.min(width, maxX + padding),
      minY: Math.max(0, minY - padding),
      maxY: Math.min(height, maxY + padding),
    };
  }

  function tracedataToOpenTypePath(tracedata, bounds, leftMargin) {
    const resultPath = new opentype.Path();
    if (!tracedata?.layers?.length) {
      return resultPath;
    }

    const scale = UNITS_PER_EM / CANVAS_SIZE;

    const toX = (value) =>
      leftMargin + (value - bounds.minX) * scale;
    const toY = (value) =>
      (baselineRatio - value / CANVAS_SIZE) * UNITS_PER_EM;

    tracedata.layers.forEach((layer, layerIndex) => {
      const color = tracedata.palette?.[layerIndex];
      if (!color) {
        return;
      }

      const alpha = color.a ?? 255;
      const brightness = (color.r + color.g + color.b) / 3;
      if (alpha < 32 || brightness > 245) {
        return;
      }

      layer.forEach((shape, pathIndex) => {
        if (shape.isholepath) {
          return;
        }
        appendSegments(shape.segments, false);

        if (shape.holechildren?.length) {
          shape.holechildren.forEach((childIndex) => {
            const holeShape = layer[childIndex];
            if (holeShape) {
              appendSegments(holeShape.segments, true);
            }
          });
        }
      });
    });

    return resultPath;

    function appendSegments(segments, reverse) {
      if (!segments || !segments.length) {
        return;
      }

      if (!reverse) {
        const firstSegment = segments[0];
        resultPath.moveTo(toX(firstSegment.x1), toY(firstSegment.y1));

        segments.forEach((segment) => {
          if (segment.type === "L") {
            resultPath.lineTo(toX(segment.x2), toY(segment.y2));
          } else if (segment.type === "Q") {
            resultPath.quadraticCurveTo(
              toX(segment.x2),
              toY(segment.y2),
              toX(segment.x3),
              toY(segment.y3),
            );
          }
        });
      } else {
        const lastSegment = segments[segments.length - 1];
        const startPoint = lastSegment.hasOwnProperty("x3")
          ? { x: lastSegment.x3, y: lastSegment.y3 }
          : { x: lastSegment.x2, y: lastSegment.y2 };
        resultPath.moveTo(toX(startPoint.x), toY(startPoint.y));

        for (let index = segments.length - 1; index >= 0; index -= 1) {
          const segment = segments[index];
          if (segment.type === "L") {
            resultPath.lineTo(toX(segment.x1), toY(segment.y1));
          } else if (segment.type === "Q") {
            resultPath.quadraticCurveTo(
              toX(segment.x2),
              toY(segment.y2),
              toX(segment.x1),
              toY(segment.y1),
            );
          }
        }
      }

      resultPath.closePath();
    }
  }

  function buildGlyph(char) {
    if (char === " ") {
      return new opentype.Glyph({
        name: "space",
        unicode: 32,
        advanceWidth: Math.round(UNITS_PER_EM * spaceWidth),
        path: new opentype.Path(),
      });
    }

    const glyphData = glyphMap[char];
    if (!glyphData?.strokes?.length) {
      return new opentype.Glyph({
        name: glyphName(char),
        unicode: char.codePointAt(0),
        advanceWidth: Math.round(UNITS_PER_EM * 0.6),
        path: new opentype.Path(),
      });
    }

    drawStrokes(offscreenCtx, glyphData.strokes, { clearBefore: true });
    const imageData = offscreenCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const bounds = toAlphaBounds(imageData);

    if (!bounds) {
      return new opentype.Glyph({
        name: glyphName(char),
        unicode: char.codePointAt(0),
        advanceWidth: Math.round(UNITS_PER_EM * 0.6),
        path: new opentype.Path(),
      });
    }

    const widthPixels = Math.max(4, bounds.maxX - bounds.minX);
    const widthUnits = widthPixels * (UNITS_PER_EM / CANVAS_SIZE);
    const leftMargin = Math.round(UNITS_PER_EM * sideBearingRatio);
    const rightMargin = Math.round(UNITS_PER_EM * sideBearingRatio);
    const advanceWidth = Math.max(
      Math.round(leftMargin + widthUnits + rightMargin),
      Math.round(UNITS_PER_EM * 0.3),
    );

    const tracedata = ImageTracer.imagedataToTracedata(imageData, traceOptions);
    const path = tracedataToOpenTypePath(tracedata, bounds, leftMargin);

    return new opentype.Glyph({
      name: glyphName(char),
      unicode: char.codePointAt(0),
      advanceWidth,
      path,
    });
  }

  function createNotDefGlyph() {
    const path = new opentype.Path();
    const boxWidth = Math.round(UNITS_PER_EM * 0.6);
    path.moveTo(0, -UNITS_PER_EM * 0.2);
    path.lineTo(boxWidth, -UNITS_PER_EM * 0.2);
    path.lineTo(boxWidth, UNITS_PER_EM * 0.8);
    path.lineTo(0, UNITS_PER_EM * 0.8);
    path.closePath();    path.moveTo(boxWidth * 0.2, UNITS_PER_EM * 0.7);
    path.lineTo(boxWidth * 0.8, UNITS_PER_EM * 0.7);
    path.lineTo(boxWidth * 0.8, -UNITS_PER_EM * 0.1);
    path.lineTo(boxWidth * 0.2, -UNITS_PER_EM * 0.1);
    path.closePath();

    return new opentype.Glyph({
      name: ".notdef",
      unicode: 0,
      advanceWidth: boxWidth,
      path,
    });
  }

  async function generateFont() {
    if (generating) {
      return;
    }
    generateError = "";
    successMessage = "";
    generating = true;

    try {
      await tick();
      const glyphs = [createNotDefGlyph()];
      glyphOrder.forEach((char) => {
        glyphs.push(buildGlyph(char));
      });

      const ascender = Math.round((baselineRatio - ascenderRatio) * UNITS_PER_EM);
      const descender = -Math.round(
        (descenderRatio - baselineRatio) * UNITS_PER_EM,
      );
      const familyName = fontName.trim() || DEFAULT_FONT_NAME;

      const font = new opentype.Font({
        familyName,
        styleName: "Regular",
        unitsPerEm: UNITS_PER_EM,
        ascender,
        descender,
        glyphs,
      });

      const arrayBuffer = font.toArrayBuffer();
      const blob = new Blob([arrayBuffer], { type: "font/ttf" });

      if (fontObjectUrl) {
        URL.revokeObjectURL(fontObjectUrl);
      }
      fontObjectUrl = URL.createObjectURL(blob);

      await loadFontFace(familyName, fontObjectUrl);
      previewFontFamily = `"${familyName}", ${FALLBACK_PREVIEW_FONT}`;
      successMessage = "Font generated. Preview it below or download the TTF file.";
    } catch (error) {
      console.error("Unable to generate font", error);
      generateError =
        error?.message || "Something went wrong while generating the font.";
    } finally {
      generating = false;
    }
  }

  async function loadFontFace(name, url) {
    if (typeof FontFace === "undefined") {
      return;
    }
    try {
      if (activeFontFace && document?.fonts?.delete) {
        document.fonts.delete(activeFontFace);
      }
      const fontFace = new FontFace(name, `url(${url})`);
      const loadedFace = await fontFace.load();
      document.fonts.add(loadedFace);
      activeFontFace = loadedFace;
    } catch (error) {
      console.error("Unable to register FontFace", error);
    }
  }

  function downloadFont() {
    if (!fontObjectUrl) {
      return;
    }
    const link = document.createElement("a");
    link.href = fontObjectUrl;
    link.download = downloadFileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function toSafeFileName(value) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "")
      .slice(0, 60) || "font-generator";
  }
</script>
<section class="bg-gray-50 dark:bg-gray-950">
  <div class="mx-auto max-w-6xl px-4 py-10 md:py-14">
    <header class="mb-8 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-[1px] shadow-lg">
      <div class="rounded-2xl bg-white p-6 dark:bg-gray-900">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-2">
            <p class="text-xs font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">
              Font Generator
            </p>
            <h1 class="text-2xl font-bold text-gray-900 dark:text-white md:text-3xl">
              Turn your handwriting into a shareable font
            </h1>
            <p class="max-w-2xl text-sm text-gray-600 dark:text-gray-300 md:text-base">
              Draw each character, fine-tune font metrics, preview live typography, and export a
              ready-to-install TTF with one click.
            </p>
          </div>
          <div class="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm dark:border-gray-700 dark:text-gray-200">
            <span class="inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
            {completedCount}/{totalGlyphs} glyphs completed ({progressPercent}%)
          </div>
        </div>
      </div>
    </header>

    <div class="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside class="space-y-6">
        <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="mb-4 flex items-center justify-between gap-2">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Glyph Library
            </h2>
            <button
              type="button"
              class="rounded-full border border-red-200 px-3 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
              on:click={resetAllGlyphs}
            >
              Reset All
            </button>
          </div>

          <div class="space-y-5">
            {#each glyphGroups as group (group.label)}
              <div>
                <h3 class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {group.label}
                </h3>
                <div class="glyph-grid">
                  {#each group.chars as char (char)}
                    <button
                      type="button"
                      class="glyph-tile"
                      class:active={activeGlyph === char}
                      class:done={isGlyphComplete(char)}
                      on:click={() => selectGlyph(char)}
                    >
                      {char === " " ? "?" : char}
                    </button>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 class="mb-3 text-lg font-semibold text-gray-900 dark:text-white">
            Font Settings
          </h2>
          <div class="space-y-5 text-sm text-gray-700 dark:text-gray-200">
            <label class="flex flex-col gap-1">
              <span class="font-semibold text-gray-600 dark:text-gray-300">Font family name</span>
              <input
                class="rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                bind:value={fontName}
                on:change={persistSettings}
                placeholder="My Handwriting"
              />
            </label>

            <label class="flex items-center justify-between gap-3">
              <span class="font-semibold text-gray-600 dark:text-gray-300">Show guides</span>
              <input
                type="checkbox"
                class="h-4 w-4 accent-indigo-500"
                checked={showGuides}
                on:change={(event) => setShowGuides(event.currentTarget.checked)}
              />
            </label>

            <div class="settings-grid">
              <div class="metric-slider">
                <label>
                  <span>Pen size</span>
                  <span>{penSize}px</span>
                </label>
                <input
                  type="range"
                  min="2"
                  max="24"
                  step="1"
                  value={penSize}
                  on:input={(event) => setPenSize(event.currentTarget.value)}
                />
              </div>
              <div class="metric-slider">
                <label>
                  <span>Ascender line</span>
                  <span>{Math.round(ascenderRatio * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.05"
                  max="0.45"
                  step="0.01"
                  value={ascenderRatio}
                  on:input={(event) => setAscender(event.currentTarget.value)}
                />
              </div>
              <div class="metric-slider">
                <label>
                  <span>Baseline</span>
                  <span>{Math.round(baselineRatio * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="0.9"
                  step="0.01"
                  value={baselineRatio}
                  on:input={(event) => setBaseline(event.currentTarget.value)}
                />
              </div>
              <div class="metric-slider">
                <label>
                  <span>Descender line</span>
                  <span>{Math.round(descenderRatio * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.85"
                  max="0.98"
                  step="0.005"
                  value={descenderRatio}
                  on:input={(event) => setDescender(event.currentTarget.value)}
                />
              </div>
              <div class="metric-slider">
                <label>
                  <span>Side bearing</span>
                  <span>{Math.round(sideBearingRatio * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="0.25"
                  step="0.01"
                  value={sideBearingRatio}
                  on:input={(event) => setSideBearing(event.currentTarget.value)}
                />
              </div>
              <div class="metric-slider">
                <label>
                  <span>Space width</span>
                  <span>{Math.round(spaceWidth * 100)}%</span>
                </label>
                <input
                  type="range"
                  min="0.15"
                  max="0.9"
                  step="0.01"
                  value={spaceWidth}
                  on:input={(event) => setSpaceWidth(event.currentTarget.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div class="space-y-6">
        <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
            <div class="flex items-center gap-4">
              <button
                type="button"
                class="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                on:click={previousGlyph}
              >
                Prev
              </button>
              <div class="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-200 bg-indigo-50 text-3xl font-bold text-indigo-600 shadow-inner dark:border-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200">
                {activeGlyph === " " ? "?" : activeGlyph}
              </div>
              <button
                type="button"
                class="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700 transition hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                on:click={nextGlyph}
              >
                Next
              </button>
            </div>
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-100 disabled:opacity-40 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                on:click={undoStroke}
                disabled={!hasActiveStrokes}
              >
                Undo stroke
              </button>
              <button
                type="button"
                class="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-40 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                on:click={clearGlyph}
                disabled={!hasActiveStrokes}
              >
                Clear glyph
              </button>
            </div>
          </div>

          <div class="rounded-2xl border border-dashed border-gray-300 bg-white p-4 shadow-inner dark:border-gray-700 dark:bg-gray-950">
            <div class="canvas-shell">
              <canvas
                bind:this={canvas}
                class="h-full w-full"
                on:pointerdown|preventDefault={handlePointerDown}
                on:pointermove|preventDefault={handlePointerMove}
                on:pointerup|preventDefault={handlePointerUp}
                on:pointerleave|preventDefault={handlePointerUp}
              >
                Your browser does not support canvas.
              </canvas>
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="mb-4 flex flex-wrap items-center justify-between gap-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">
              Live Preview
            </h2>
            <div class="flex items-center gap-4 text-xs font-medium text-gray-500 dark:text-gray-300">
              <label class="flex items-center gap-2">
                <span>Letter spacing</span>
                <input
                  type="range"
                  min="-50"
                  max="120"
                  step="1"
                  value={letterSpacing}
                  on:input={(event) => setLetterSpacing(event.currentTarget.value)}
                />
              </label>
              <label class="flex items-center gap-2">
                <span>Line height</span>
                <input
                  type="range"
                  min="1"
                  max="2"
                  step="0.05"
                  value={lineHeight}
                  on:input={(event) => setLineHeight(event.currentTarget.value)}
                />
              </label>
            </div>
          </div>

          <div class="grid gap-4 lg:grid-cols-2">
            <textarea
              class="min-h-[220px] rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-700"
              bind:value={previewText}
            />
            <div
              class="preview-output border border-gray-200 bg-white p-4 text-base text-gray-900 shadow-inner dark:border-gray-700 dark:bg-gray-950 dark:text-white"
              style={`font-family: ${previewFontFamily}; letter-spacing: ${(
                letterSpacing / 100
              ).toFixed(2)}em; line-height: ${lineHeight.toFixed(2)};`}
            >
              {previewText}
            </div>
          </div>
        </div>

        <div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div class="flex flex-wrap items-center gap-4">
            <button
              type="button"
              class="rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
              on:click={generateFont}
              disabled={generating}
            >
              {generating ? "Generating..." : "Generate font"}
            </button>
            <button
              type="button"
              class="rounded-full border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
              on:click={downloadFont}
              disabled={!fontObjectUrl}
            >
              Download TTF
            </button>
            <span class="text-xs text-gray-500 dark:text-gray-400">
              File name: {downloadFileName}
            </span>
          </div>

          {#if generateError}
            <p class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-sm dark:border-red-900 dark:bg-red-950 dark:text-red-200">
              {generateError}
            </p>
          {/if}

          {#if successMessage}
            <p class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 shadow-sm dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              {successMessage}
            </p>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
<style>
  .glyph-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
    gap: 0.5rem;
  }

  .glyph-tile {
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.9rem;
    padding: 0.5rem;
    font-size: 1rem;
    font-weight: 700;
    border: 1px solid rgba(229, 231, 235, 1);
    background: rgba(255, 255, 255, 0.8);
    color: #1f2937;
    transition:
      transform 0.15s ease,
      box-shadow 0.15s ease,
      border-color 0.15s ease,
      background 0.15s ease;
  }

  .glyph-tile:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 18px -12px rgba(79, 70, 229, 0.35);
  }

  .glyph-tile.done {
    border-color: rgba(16, 185, 129, 0.8);
  }

  .glyph-tile.active {
    border-color: rgba(99, 102, 241, 0.85);
    background: rgba(99, 102, 241, 0.08);
    color: rgba(55, 48, 163, 1);
    box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.12);
  }

  :global(.dark) .glyph-tile {
    border-color: rgba(55, 65, 81, 0.7);
    background: rgba(17, 24, 39, 0.7);
    color: rgba(229, 231, 235, 0.88);
  }

  :global(.dark) .glyph-tile.active {
    border-color: rgba(165, 180, 252, 0.9);
    background: rgba(99, 102, 241, 0.18);
    color: rgba(199, 210, 254, 1);
  }

  .canvas-shell {
    position: relative;
    width: 100%;
  }

  .canvas-shell::before {
    content: "";
    display: block;
    padding-bottom: 100%;
  }

  .canvas-shell canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .preview-output {
    min-height: 220px;
    border-radius: 1.25rem;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .metric-slider label {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.85rem;
    font-weight: 600;
    color: inherit;
  }

  .metric-slider input[type="range"] {
    width: 100%;
  }

  .settings-grid {
    display: grid;
    gap: 1rem;
  }

  @media (min-width: 640px) {
    .settings-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
</style>

