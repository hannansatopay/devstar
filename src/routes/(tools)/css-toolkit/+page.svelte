<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  const toNumber = (value: number | string) => {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // Fluid typography clamp
  let clampMinSize = 18;
  let clampMaxSize = 32;
  let clampMinViewport = 360;
  let clampMaxViewport = 1440;
  let clampUnit: "px" | "rem" = "px";
  let clampPreview =
    "Fluid typography keeps copy comfortable across devices. Resize the window to see this text adapt.";

  function clampFormula(
    minSizeValue = clampMinSize,
    maxSizeValue = clampMaxSize,
    minViewportValue = clampMinViewport,
    maxViewportValue = clampMaxViewport,
    unitValue: "px" | "rem" = clampUnit,
  ) {
    const minSize = toNumber(minSizeValue);
    const maxSize = toNumber(maxSizeValue);
    const minViewport = toNumber(minViewportValue);
    const maxViewport = toNumber(maxViewportValue);
    const deltaSize = maxSize - minSize;
    const deltaViewport = maxViewport - minViewport || 1;
    const slope = (deltaSize / deltaViewport) * 100;
    const intercept = minSize - (deltaSize / deltaViewport) * minViewport;

    const minValue =
      unitValue === "px"
        ? `${minSize.toFixed(2)}px`
        : `${(minSize / 16).toFixed(4)}rem`;
    const maxValue =
      unitValue === "px"
        ? `${maxSize.toFixed(2)}px`
        : `${(maxSize / 16).toFixed(4)}rem`;
    const preferred =
      unitValue === "px"
        ? `calc(${intercept.toFixed(2)}px + ${slope.toFixed(4)}vw)`
        : `calc(${(intercept / 16).toFixed(4)}rem + ${slope.toFixed(4)}vw)`;

    return `clamp(${minValue}, ${preferred}, ${maxValue})`;
  }

  // Soft shadows
  let shadowMode: "box" | "text" = "box";
  let shadowOffsetX = 0;
  let shadowOffsetY = 26;
  let shadowBlur = 52;
  let shadowSpread = -18;
  let shadowColor = "#312e81";
  let shadowOpacity = 0.32;

  let textShadowOffsetX = 0;
  let textShadowOffsetY = 18;
  let textShadowBlur = 16;
  let textShadowColor = "#00ccff";
  let textShadowOpacity = 0.45;

  function toRgba(hex: string, alpha: number | string) {
    const normalized = hex.replace("#", "");
    const bigint = parseInt(normalized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const resolvedAlpha = toNumber(alpha);
    return `rgba(${r}, ${g}, ${b}, ${resolvedAlpha.toFixed(2)})`;
  }

  const boxShadowCss = (
    offsetX: number | string,
    offsetY: number | string,
    blur: number | string,
    spread: number | string,
    colorValue: string,
    opacityValue: number | string,
  ) => {
    return `${toNumber(offsetX)}px ${toNumber(offsetY)}px ${toNumber(blur)}px ${toNumber(spread)}px ${toRgba(colorValue, opacityValue)}`;
  };

  const textShadowCss = (
    offsetX: number | string,
    offsetY: number | string,
    blur: number | string,
    colorValue: string,
    opacityValue: number | string,
  ) => {
    return `${toNumber(offsetX)}px ${toNumber(offsetY)}px ${toNumber(blur)}px ${toRgba(colorValue, opacityValue)}`;
  };

  // Flexbox layout generator
  const flexDirectionOptions = [
    { label: "Row", value: "row" },
    { label: "Row reverse", value: "row-reverse" },
    { label: "Column", value: "column" },
    { label: "Column reverse", value: "column-reverse" },
  ];

  const flexWrapOptions = [
    { label: "No wrap", value: "nowrap" },
    { label: "Wrap", value: "wrap" },
    { label: "Wrap reverse", value: "wrap-reverse" },
  ];

  const flexJustifyOptions = [
    { label: "Start", value: "flex-start" },
    { label: "Center", value: "center" },
    { label: "End", value: "flex-end" },
    { label: "Space between", value: "space-between" },
    { label: "Space around", value: "space-around" },
    { label: "Space evenly", value: "space-evenly" },
  ];

  const flexAlignOptions = [
    { label: "Stretch", value: "stretch" },
    { label: "Start", value: "flex-start" },
    { label: "Center", value: "center" },
    { label: "End", value: "flex-end" },
    { label: "Baseline", value: "baseline" },
  ];

  let flexDirection: (typeof flexDirectionOptions)[number]["value"] = "column";
  let flexWrap: (typeof flexWrapOptions)[number]["value"] = "wrap";
  let flexJustify: (typeof flexJustifyOptions)[number]["value"] =
    "space-between";
  let flexAlign: (typeof flexAlignOptions)[number]["value"] = "center";
  let flexGap = 24;

  const flexItems = ["Navbar", "Sidebar", "Hero", "Metrics", "CTA"];

  // Grid layout generator
  const gridModes: Array<{
    label: string;
    value: "auto-fit" | "auto-fill" | "fixed";
  }> = [
    { label: "Auto-fit", value: "auto-fit" },
    { label: "Auto-fill", value: "auto-fill" },
    { label: "Fixed columns", value: "fixed" },
  ];

  let gridMode: (typeof gridModes)[number]["value"] = "auto-fit";
  let gridColumns = 3;
  let gridMinWidth = 220;
  let gridGap = 20;
  let gridMinHeight = 180;

  let gridTemplate = "repeat(auto-fit, minmax(220px, 1fr))";
  let gridPreviewItems: number[] = [];
  $: {
    const columns = Math.max(1, Math.round(toNumber(gridColumns)));
    const minWidth = Math.max(60, Math.round(toNumber(gridMinWidth)));
    gridTemplate =
      gridMode === "fixed"
        ? `repeat(${columns}, minmax(0, 1fr))`
        : `repeat(${gridMode}, minmax(${minWidth}px, 1fr))`;
    gridPreviewItems = Array.from(
      { length: gridMode === "fixed" ? Math.max(columns * 2, 6) : 6 },
      (_, index) => index + 1,
    );
  }

  // CSS sprite generator
  let spriteUrl = "/assets/sprite.png";
  let spriteCellWidth = 64;
  let spriteCellHeight = 64;
  let spriteColumns = 4;
  let spriteRows = 3;
  let spritePrefix = "icon";

  let spritePreviewArray: number[] = [];
  const spritePreviewBackground =
    "linear-gradient(135deg, rgba(79,70,229,0.35), rgba(236,72,153,0.35))";
  const spriteCellStyle = (
    index: number,
    columns: number,
    rows: number,
    width: number,
    height: number,
  ) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const posX = -(column * width);
    const posY = -(row * height);
    return `width:${width}px;height:${height}px;background-image:${spritePreviewBackground};background-size:${columns * 100}% ${rows * 100}%;background-position:${posX}px ${posY}px;border-radius:12px;display:flex;align-items:center;justify-content:center;`;
  };

  // Unit converter
  let baseFontSize = 16;
  let pxValue = 16;
  let remValue = pxValue / baseFontSize;
  let emValue = remValue;
  let percentValue = (pxValue / baseFontSize) * 100;

  function updateFromPx(value: string) {
    const px = Number(value);
    if (!Number.isFinite(px)) return;
    pxValue = px;
    remValue = Number((px / baseFontSize).toFixed(4));
    emValue = remValue;
    percentValue = Number(((px / baseFontSize) * 100).toFixed(2));
  }

  function updateFromRem(value: string) {
    const rem = Number(value);
    if (!Number.isFinite(rem)) return;
    remValue = rem;
    emValue = rem;
    pxValue = Number((rem * baseFontSize).toFixed(2));
    percentValue = Number((rem * 100).toFixed(2));
  }

  function updateFromPercent(value: string) {
    const percent = Number(value);
    if (!Number.isFinite(percent)) return;
    percentValue = percent;
    remValue = Number((percent / 100).toFixed(4));
    emValue = remValue;
    pxValue = Number(((percent / 100) * baseFontSize).toFixed(2));
  }

  function updateBaseFont(value: string) {
    const base = Number(value);
    if (!Number.isFinite(base) || base <= 0) return;
    baseFontSize = base;
    updateFromPx(String(pxValue));
  }

  // Gradient text
  let gradientAngle = 90;
  let gradientColors = ["#6366f1", "#ec4899", "#f59e0b"];
  let gradientSample =
    "Gradient text highlights hero headlines without heavy imagery.";

  function updateGradientColor(index: number, value: string) {
    gradientColors = gradientColors.map((color, idx) =>
      idx === index ? value : color,
    );
  }

  function addGradientStop() {
    if (gradientColors.length >= 5) return;
    gradientColors = [...gradientColors, "#a855f7"];
  }

  function removeGradientStop(index: number) {
    if (gradientColors.length <= 2) return;
    gradientColors = gradientColors.filter((_, idx) => idx !== index);
  }

  $: clampValue = clampFormula(
    clampMinSize,
    clampMaxSize,
    clampMinViewport,
    clampMaxViewport,
    clampUnit,
  );
  $: clampPreviewStyle = `font-size:${clampValue};`;
  $: boxShadowValue = boxShadowCss(
    shadowOffsetX,
    shadowOffsetY,
    shadowBlur,
    shadowSpread,
    shadowColor,
    shadowOpacity,
  );
  $: textShadowValue = textShadowCss(
    textShadowOffsetX,
    textShadowOffsetY,
    textShadowBlur,
    textShadowColor,
    textShadowOpacity,
  );
  $: shadowPreviewStyle =
    shadowMode === "box"
      ? `box-shadow:${boxShadowValue};`
      : `text-shadow:${textShadowValue};`;
  $: shadowCodeSnippet =
    shadowMode === "box"
      ? `box-shadow: ${boxShadowValue};`
      : `text-shadow: ${textShadowValue};`;
  $: flexSnippet = `display: flex;\nflex-direction: ${flexDirection};\nflex-wrap: ${flexWrap};\njustify-content: ${flexJustify};\nalign-items: ${flexAlign};\ngap: ${toNumber(flexGap)}px;`;
  $: gridSnippet = `display: grid;\ngrid-template-columns: ${gridTemplate};\ngap: ${toNumber(gridGap)}px;\ngrid-auto-rows: minmax(${toNumber(gridMinHeight)}px, auto);`;
  $: spriteCellWidthPx = Math.max(1, Math.round(toNumber(spriteCellWidth)));
  $: spriteCellHeightPx = Math.max(1, Math.round(toNumber(spriteCellHeight)));
  $: spriteColumnsCount = Math.max(1, Math.round(toNumber(spriteColumns)));
  $: spriteRowsCount = Math.max(1, Math.round(toNumber(spriteRows)));
  $: spriteTotal = spriteColumnsCount * spriteRowsCount;
  $: spritePreviewArray = Array.from(
    { length: Math.min(spriteTotal, 8) },
    (_, index) => index,
  );
  $: spriteBaseSnippet = `.sprite {\n  display: inline-block;\n  width: ${spriteCellWidthPx}px;\n  height: ${spriteCellHeightPx}px;\n  background-image: url("${spriteUrl}");\n  background-repeat: no-repeat;\n}`;
  $: spriteClassSnippet = Array.from({ length: spriteTotal })
    .map((_, index) => {
      const column = index % spriteColumnsCount;
      const row = Math.floor(index / spriteColumnsCount);
      const posX = -(column * spriteCellWidthPx);
      const posY = -(row * spriteCellHeightPx);
      return `.${spritePrefix}-${index + 1} {\n  background-position: ${posX}px ${posY}px;\n}`;
    })
    .join("\n\n");
  $: gradientSnippet = `background: linear-gradient(${toNumber(
    gradientAngle,
  )}deg, ${gradientColors.join(", ")});\n-webkit-background-clip: text;\ncolor: transparent;`;
  $: gradientPreviewStyle = `background:linear-gradient(${toNumber(
    gradientAngle,
  )}deg, ${gradientColors.join(", ")});-webkit-background-clip:text;color:transparent;`;
</script>

<section class="space-y-6">
  <!-- Soft shadows -->
  <div class="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
    <section
      class="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Soft shadows
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Craft eased shadows for surfaces or glowing typography.
          </p>
        </div>
        <Copy text={shadowCodeSnippet} label="Copy CSS" floating={false} />
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class={`flex-1 rounded-2xl border px-3 py-2 text-sm transition ${shadowMode === "box" ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"}`}
          on:click={() => (shadowMode = "box")}
        >
          Element shadow
        </button>
        <button
          type="button"
          class={`flex-1 rounded-2xl border px-3 py-2 text-sm transition ${shadowMode === "text" ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200" : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"}`}
          on:click={() => (shadowMode = "text")}
        >
          Text shadow
        </button>
      </div>

      {#if shadowMode === "box"}
        <div class="grid gap-3 sm:grid-cols-2">
          <label
            class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Offset X</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="range"
              min="-80"
              max="80"
              bind:value={shadowOffsetX}
            />
          </label>
          <label
            class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Offset Y</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="range"
              min="-80"
              max="120"
              bind:value={shadowOffsetY}
            />
          </label>
          <label
            class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Blur</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="range"
              min="0"
              max="160"
              bind:value={shadowBlur}
            />
          </label>
          <label
            class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Spread</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="range"
              min="-60"
              max="40"
              bind:value={shadowSpread}
            />
          </label>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Color</span>
            <input
              class="h-12 w-full rounded-2xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
              type="color"
              bind:value={shadowColor}
            />
          </label>
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Opacity</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="range"
              min="0"
              max="1"
              step="0.01"
              bind:value={shadowOpacity}
            />
          </label>
        </div>
      {:else}
        <div class="grid gap-3 sm:grid-cols-2">
          <label
            class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Offset X</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="range"
              min="-40"
              max="40"
              bind:value={textShadowOffsetX}
            />
          </label>
          <label
            class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Offset Y</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="range"
              min="-40"
              max="60"
              bind:value={textShadowOffsetY}
            />
          </label>
          <label
            class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Blur</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="range"
              min="0"
              max="120"
              bind:value={textShadowBlur}
            />
          </label>
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Color</span>
            <input
              class="h-12 w-full rounded-2xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
              type="color"
              bind:value={textShadowColor}
            />
          </label>
        </div>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Opacity</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="range"
            min="0"
            max="1"
            step="0.01"
            bind:value={textShadowOpacity}
          />
        </label>
      {/if}
    </section>

    <section
      class="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"
    >
      <h3
        class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        Preview
      </h3>
      {#if shadowMode === "box"}
        <p
          class="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-2xl font-semibold text-slate-800 dark:text-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-950"
          style={shadowPreviewStyle}
        >
          This surface floats off the page.
        </p>
      {:else}
        <p
          class="rounded-3xl border border-slate-200 bg-white px-6 py-12 text-center text-2xl font-semibold text-slate-800 dark:text-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-950"
          style={shadowPreviewStyle}
        >
          Glowing headline
        </p>
      {/if}
      <div
        class="rounded-2xl border border-slate-200 bg-slate-100/70 p-4 font-mono text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200"
      >
        {shadowCodeSnippet}
      </div>
    </section>
  </div>

  <!-- Flexbox layout -->
  <div class="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
    <section
      class="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Flexbox layout
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Dial in direction, wrapping, alignment, and spacing for component
            layouts.
          </p>
        </div>
        <Copy text={flexSnippet} label="Copy CSS" floating={false} />
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Direction</span>
          <select
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            bind:value={flexDirection}
          >
            {#each flexDirectionOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </label>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Wrap</span>
          <select
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            bind:value={flexWrap}
          >
            {#each flexWrapOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </label>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Justify content</span>
          <select
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            bind:value={flexJustify}
          >
            {#each flexJustifyOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </label>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Align items</span>
          <select
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            bind:value={flexAlign}
          >
            {#each flexAlignOptions as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </label>
      </div>
      <label
        class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        <span>Gap: {toNumber(flexGap)}px</span>
        <input
          class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
          type="range"
          min="0"
          max="64"
          step="4"
          bind:value={flexGap}
        />
      </label>
    </section>

    <section
      class="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"
    >
      <h3
        class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        Preview
      </h3>
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-950"
        style={`display:flex;flex-direction:${flexDirection};flex-wrap:${flexWrap};justify-content:${flexJustify};align-items:${flexAlign};gap:${toNumber(flexGap)}px;`}
      >
        {#each flexItems as item}
          <div
            class="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {item}
          </div>
        {/each}
      </div>
      <div
        class="rounded-2xl border border-slate-200 bg-slate-100/70 p-4 font-mono text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200"
      >
        {flexSnippet}
      </div>
    </section>
  </div>

  <!-- Grid layout -->
  <div class="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
    <section
      class="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Grid layout
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Compose auto-fit grids or fixed column templates with gaps and
            heights.
          </p>
        </div>
        <Copy text={gridSnippet} label="Copy CSS" floating={false} />
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Mode</span>
          <select
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            bind:value={gridMode}
          >
            {#each gridModes as option}
              <option value={option.value}>{option.label}</option>
            {/each}
          </select>
        </label>
        {#if gridMode === "fixed"}
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Columns: {gridColumns}</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="range"
              min="2"
              max="6"
              bind:value={gridColumns}
            />
          </label>
        {:else}
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Min width (px)</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="number"
              min="120"
              max="400"
              bind:value={gridMinWidth}
            />
          </label>
        {/if}
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Gap: {toNumber(gridGap)}px</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="range"
            min="0"
            max="64"
            step="4"
            bind:value={gridGap}
          />
        </label>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Min height: {gridMinHeight}px</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="range"
            min="120"
            max="320"
            step="10"
            bind:value={gridMinHeight}
          />
        </label>
      </div>
    </section>

    <section
      class="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"
    >
      <h3
        class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        Preview
      </h3>
      <div
        class="grid rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-950"
        style={`display:grid;grid-template-columns:${gridTemplate};gap:${toNumber(gridGap)}px;`}
      >
        {#each gridPreviewItems as item}
          <div
            class="rounded-2xl border border-slate-200 bg-slate-100 px-4 py-6 text-center text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            style={`min-height:${toNumber(gridMinHeight)}px;`}
          >
            Cell {item}
          </div>
        {/each}
      </div>
      <div
        class="rounded-2xl border border-slate-200 bg-slate-100/70 p-4 font-mono text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200"
      >
        {gridSnippet}
      </div>
    </section>
  </div>

  <!-- CSS sprite generator -->
  <div class="grid gap-6 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
    <section
      class="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            CSS sprite generator
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Plan sprite sheets and generate CSS background positions.
          </p>
        </div>
        <Copy
          text={`${spriteBaseSnippet}

${spriteClassSnippet}`}
          label="Copy CSS"
          floating={false}
        />
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Sprite URL</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="text"
            bind:value={spriteUrl}
          />
        </label>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Class prefix</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="text"
            bind:value={spritePrefix}
          />
        </label>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Cell width (px)</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="number"
            min="8"
            max="256"
            bind:value={spriteCellWidth}
          />
        </label>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Cell height (px)</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="number"
            min="8"
            max="256"
            bind:value={spriteCellHeight}
          />
        </label>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Columns</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="number"
            min="1"
            max="12"
            bind:value={spriteColumns}
          />
        </label>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Rows</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="number"
            min="1"
            max="12"
            bind:value={spriteRows}
          />
        </label>
      </div>
    </section>

    <section
      class="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"
    >
      <h3
        class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        Preview
      </h3>
      <div
        class="flex flex-wrap gap-3 rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-950"
      >
        {#each spritePreviewArray as index}
          <span
            class="flex items-center justify-center text-[11px] font-semibold text-slate-600 dark:text-slate-300"
            style={spriteCellStyle(
              index,
              spriteColumnsCount,
              spriteRowsCount,
              spriteCellWidthPx,
              spriteCellHeightPx,
            )}
          >
            {spritePrefix}-{index + 1}
          </span>
        {/each}
        {#if spritePreviewArray.length === 0}
          <p class="text-sm text-slate-500 dark:text-slate-400">
            Increase columns or rows to generate positions.
          </p>
        {/if}
      </div>
      <div
        class="rounded-2xl border border-slate-200 bg-slate-100/70 p-4 font-mono text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200 overflow-auto"
      >
        {spriteBaseSnippet}

        {spriteClassSnippet}
      </div>
    </section>
  </div>

  <!-- Unit converter & gradient text -->
  <div class="grid gap-6 lg:grid-cols-2">
    <section
      class="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Unit converter
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Translate between px, rem, em, and % with a configurable root size.
          </p>
        </div>
        <Copy
          text={`/* Base font size */\n:root { font-size: ${baseFontSize}px; }`}
          label="Copy root"
          floating={false}
        />
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Base font size</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="number"
            min="8"
            max="32"
            value={baseFontSize}
            on:input={(event) => updateBaseFont(event.currentTarget.value)}
          />
        </label>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Pixels</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="number"
            value={pxValue}
            on:input={(event) => updateFromPx(event.currentTarget.value)}
          />
        </label>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Rem</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="number"
            step="0.001"
            value={remValue}
            on:input={(event) => updateFromRem(event.currentTarget.value)}
          />
        </label>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Em</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="number"
            step="0.001"
            value={emValue}
            on:input={(event) => updateFromRem(event.currentTarget.value)}
          />
        </label>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Percent</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="number"
            step="0.1"
            value={percentValue}
            on:input={(event) => updateFromPercent(event.currentTarget.value)}
          />
        </label>
      </div>
      <p
        class="rounded-2xl border border-slate-200 bg-slate-100/70 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
      >
        1rem = {baseFontSize}px | 1em = {baseFontSize}px | {percentValue}% = {pxValue}px
      </p>
    </section>

    <section
      class="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Gradient text
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Blend brand palettes into headlines using background-clip tricks.
          </p>
        </div>
        <Copy text={gradientSnippet} label="Copy CSS" floating={false} />
      </div>
      <div
        class="flex flex-wrap items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        <label class="flex items-center gap-2">
          <span>Angle</span>
          <input
            class="w-32 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="range"
            min="0"
            max="360"
            bind:value={gradientAngle}
          />
        </label>
        <span>{toNumber(gradientAngle)}&deg;</span>
      </div>
      <div class="flex flex-wrap gap-3">
        {#each gradientColors as color, index}
          <div class="flex items-center gap-2">
            <input
              class="h-12 w-12 rounded-2xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
              type="color"
              value={color}
              on:input={(event) =>
                updateGradientColor(index, event.currentTarget.value)}
            />
            {#if gradientColors.length > 2}
              <button
                class="text-xs font-semibold uppercase tracking-wide text-rose-500 dark:text-rose-300"
                type="button"
                on:click={() => removeGradientStop(index)}
              >
                Remove
              </button>
            {/if}
          </div>
        {/each}
        {#if gradientColors.length < 5}
          <button
            class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
            type="button"
            on:click={addGradientStop}
          >
            Add stop
          </button>
        {/if}
      </div>
      <p
        class="rounded-3xl border border-slate-200 bg-slate-100/70 p-6 text-lg font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
        style={gradientPreviewStyle}
      >
        {gradientSample}
      </p>
      <div
        class="rounded-2xl border border-slate-200 bg-slate-100/70 p-4 font-mono text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-200"
      >
        {gradientSnippet}
      </div>
    </section>
  </div>
</section>
