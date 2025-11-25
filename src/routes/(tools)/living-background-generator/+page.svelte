<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  type GradientKind =
    | "linear"
    | "linear-stripes"
    | "radial-circle"
    | "repeating-radial"
    | "angular-sweep"
    | "diamond"
    | "mesh";

  type AnimationSpec = {
    name: string;
    timing?: string;
    direction?: string;
    keyframes: string;
  };

  type GeneratorOptions = {
    angle: number;
    centerX: number;
    centerY: number;
  };

  type GradientDefinition = {
    label: string;
    description: string;
    supportsAngle?: boolean;
    supportsCenter?: boolean;
    defaultCenter?: { x: number; y: number };
    generator: (palette: string[], options: GeneratorOptions) => string;
    defaultSize: string;
    defaultRepeat: string;
    animation?: AnimationSpec | null;
    customProperties?: string[];
  };

  const MAX_COLORS = 8;
  const DEFAULT_COLORS = ["#1d4ed8", "#9333ea", "#f97316", "#fde047"];

  const clamp = (value: number | string, min = 0, max = 100) => {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return min;
    return Math.min(max, Math.max(min, Math.round(parsed)));
  };

  const randomHex = () =>
    `#${Math.floor(Math.random() * 0xffffff)
      .toString(16)
      .padStart(6, "0")}`;

  const buildStopSequence = (palette: string[]) => {
    if (palette.length <= 1) return `${palette[0] ?? DEFAULT_COLORS[0]} 0%`;
    return palette
      .map((color, index) => {
        const pos = Math.round((index / (palette.length - 1)) * 100);
        return `${color} ${pos}%`;
      })
      .join(", ");
  };

  const buildStripeSequence = (palette: string[]) => {
    const colours = palette.length ? palette : DEFAULT_COLORS;
    const stripe = Math.max(6, Math.floor(100 / Math.max(1, colours.length)));
    return colours
      .map((color, index) => {
        const start = index * stripe;
        const end = (index + 1) * stripe;
        return `${color} ${start}px ${end}px`;
      })
      .join(", ");
  };

  const buildRingSequence = (palette: string[]) => {
    const colours = palette.length ? palette : DEFAULT_COLORS;
    const gap = Math.max(8, Math.floor(120 / Math.max(1, colours.length * 2)));
    return colours
      .map((color, index) => {
        const start = index * gap;
        const end = (index + 1) * gap;
        return `${color} ${start}px ${end}px`;
      })
      .join(", ");
  };

  const ensureColours = (palette: string[], needed: number) => {
    if (palette.length >= needed) return palette;
    const extended = [...palette];
    while (extended.length < needed) {
      extended.push(
        palette[extended.length % palette.length] ??
          DEFAULT_COLORS[extended.length % DEFAULT_COLORS.length],
      );
    }
    return extended;
  };

  const gradientDefinitions: Record<GradientKind, GradientDefinition> = {
    linear: {
      label: "Linear",
      description: "Directional gradient with smooth animation drift.",
      supportsAngle: true,
      defaultSize: "220% 220%",
      defaultRepeat: "no-repeat",
      generator: (palette, { angle }) =>
        `linear-gradient(${angle}deg, ${buildStopSequence(palette)})`,
      animation: {
        name: "bg-pan",
        timing: "ease-in-out",
        keyframes: `@keyframes bg-pan {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`,
      },
    },
    "linear-stripes": {
      label: "Linear stripes",
      description: "Repeating stripes ideal for loaders and ribbons.",
      supportsAngle: true,
      defaultSize: "320% 320%",
      defaultRepeat: "repeat",
      generator: (palette, { angle }) =>
        `repeating-linear-gradient(${angle}deg, ${buildStripeSequence(palette)})`,
      animation: {
        name: "stripe-slide",
        timing: "linear",
        keyframes: `@keyframes stripe-slide {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}`,
      },
    },
    "radial-circle": {
      label: "Radial circle",
      description: "Circular glow with smooth continuous breathing animation.",
      defaultSize: "100% 100%",
      defaultRepeat: "no-repeat",
      supportsCenter: true,
      defaultCenter: { x: 50, y: 50 },

      generator: (palette, { centerX, centerY }) => {
        return `
      radial-gradient(
        farthest-corner at ${centerX}% ${centerY}%,
        ${buildStopSequence(palette)}
      )
    `;
      },

      animation: {
        name: "lb-circle-zoom",
        timing: "ease-in-out",
        keyframes: `
      @keyframes lb-circle-zoom {
        0%, 100% {
          --lb-zoom: 100%;
          background-size: var(--lb-zoom) var(--lb-zoom); /* perfect circle */
          filter: brightness(1);
        }

        50% {
          --lb-zoom: 160%;
          background-size: var(--lb-zoom) var(--lb-zoom); /* perfect circle */
          filter: brightness(1.08);
        }
      }
    `,
      },

      customProperties: [
        `
      @property --lb-zoom {
        syntax: "<percentage>";
        inherits: false;
        initial-value: 100%;
      }
    `,
      ],
    },
    "repeating-radial": {
      label: "Repeating radial",
      description: "Rippled rings with subtle scale animation.",
      defaultSize: "240% 240%",
      defaultRepeat: "repeat",
      supportsCenter: true,
      defaultCenter: { x: 50, y: 50 },
      generator: (palette, { centerX, centerY }) =>
        `repeating-radial-gradient(circle at ${centerX}% ${centerY}%, ${buildRingSequence(palette)})`,
      animation: {
        name: "ripple-loop",
        timing: "ease-in-out",
        keyframes: `@keyframes ripple-loop {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.08); opacity: 0.9; }
}`,
      },
    },
    "angular-sweep": {
      label: "Angular sweep",
      description: "Alternating sweep for dramatic transitions.",
      supportsAngle: true,
      supportsCenter: true,
      defaultCenter: { x: 50, y: 50 },
      defaultSize: "220% 220%",
      defaultRepeat: "no-repeat",
      generator: (palette, { angle, centerX, centerY }) => {
        const animatedAngle = `calc(${angle}deg + var(--lb-angle, 0deg))`;
        return `conic-gradient(from ${animatedAngle} at ${centerX}% ${centerY}%, ${buildStopSequence(palette)})`;
      },
      animation: {
        name: "lb-angle-spin",
        timing: "linear",
        keyframes: `@keyframes lb-angle-spin {
  0% { --lb-angle: 0deg; }
  100% { --lb-angle: 360deg; }
}`,
      },
      customProperties: [
        `@property --lb-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}`,
      ],
    },
    diamond: {
      label: "Diamond gradient",
      description: "Diamond shaped focus using conic blending.",
      defaultSize: "220% 220%",
      defaultRepeat: "no-repeat",
      supportsCenter: true,
      defaultCenter: { x: 50, y: 50 },
      generator: (palette, { centerX, centerY }) => {
        const colours = ensureColours(palette, 4);
        const animatedAngle = `calc(-45deg + var(--lb-angle, 0deg))`;
        return `conic-gradient(from ${animatedAngle} at ${centerX}% ${centerY}%, ${colours[0]} 0deg, ${colours[1]} 90deg, ${colours[2]} 180deg, ${colours[3]} 270deg, ${colours[0]} 360deg)`;
      },
      animation: {
        name: "lb-diamond-glide",
        timing: "ease-in-out",
        keyframes: `@keyframes lb-diamond-glide {
  0%, 100% { --lb-angle: 0deg; transform: rotate(0deg) scale(1); filter: brightness(1); }
  28% { --lb-angle: 22deg; transform: rotate(2deg) scale(1.05); filter: brightness(1.06); }
  55% { --lb-angle: -18deg; transform: rotate(-1.5deg) scale(1.02); filter: brightness(1.03); }
  78% { --lb-angle: 12deg; transform: rotate(1deg) scale(1.04); filter: brightness(1.05); }
}`,
      },
      customProperties: [
        `@property --lb-angle {
  syntax: "<angle>";
  inherits: false;
  initial-value: 0deg;
}`,
      ],
    },
    mesh: {
      label: "Mesh gradient",
      description: "Organic mesh using layered radial gradients.",
      defaultSize: "100% 100%",
      defaultRepeat: "repeat",
      generator: (palette) => {
        const colours = ensureColours(palette, 4);
        return [
          `radial-gradient(at calc(20% + var(--lb-mesh-x, 0%)) calc(25% + var(--lb-mesh-y, 0%)), ${colours[0]} 0%, transparent 60%)`,
          `radial-gradient(at calc(80% - var(--lb-mesh-x, 0%)) calc(20% + var(--lb-mesh-y, 0%)), ${colours[1]} 0%, transparent 60%)`,
          `radial-gradient(at calc(20% + var(--lb-mesh-x, 0%)) calc(80% - var(--lb-mesh-y, 0%)), ${colours[2]} 0%, transparent 65%)`,
          `radial-gradient(at calc(70% - var(--lb-mesh-x, 0%)) calc(75% - var(--lb-mesh-y, 0%)), ${colours[3]} 0%, transparent 70%)`,
        ].join(", ");
      },
      animation: {
        name: "lb-mesh-drift",
        timing: "ease-in-out",
        direction: "alternate",
        keyframes: `@keyframes lb-mesh-drift {
  0% { --lb-mesh-x: 0%; --lb-mesh-y: 0%; filter: brightness(1); transform: scale(1); }
  33% { --lb-mesh-x: 12%; --lb-mesh-y: -8%; filter: brightness(1.06); transform: scale(1.04); }
  66% { --lb-mesh-x: -10%; --lb-mesh-y: 9%; filter: brightness(1.03); transform: scale(1.03); }
  100% { --lb-mesh-x: 4%; --lb-mesh-y: -6%; filter: brightness(1.05); transform: scale(1.04); }
}`,
      },
      customProperties: [
        `@property --lb-mesh-x {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}`,
        `@property --lb-mesh-y {
  syntax: "<percentage>";
  inherits: false;
  initial-value: 0%;
}`,
      ],
    },
  };

  const gradientOptions = Object.entries(gradientDefinitions).map(
    ([value, def]) => ({
      value: value as GradientKind,
      label: def.label,
      description: def.description,
    }),
  );

  const backgroundSizes = [
    "cover",
    "contain",
    "100% 100%",
    "150% 150%",
    "220% 220%",
    "320% 320%",
  ];

  const DEFAULT_CENTER = { x: 50, y: 50 };

  let colors = [...DEFAULT_COLORS];
  let gradientKind: GradientKind = "linear";
  let angle = 45;
  let animationSpeed = 5;
  let backgroundSize = gradientDefinitions[gradientKind].defaultSize;
  let backgroundRepeat = gradientDefinitions[gradientKind].defaultRepeat;
  let centerX =
    gradientDefinitions[gradientKind].defaultCenter?.x ?? DEFAULT_CENTER.x;
  let centerY =
    gradientDefinitions[gradientKind].defaultCenter?.y ?? DEFAULT_CENTER.y;
  let safeCenterX = DEFAULT_CENTER.x;
  let safeCenterY = DEFAULT_CENTER.y;

  let previewStyle = "";
  let cssSnippet = "";
  let htmlSnippet = "";
  let status = "";

  const notify = (message: string) => {
    status = message;
    setTimeout(() => (status = ""), 2000);
  };

  const animationKeyframes = Array.from(
    new Set(
      Object.values(gradientDefinitions)
        .map((definition) => definition.animation?.keyframes)
        .filter(Boolean) as string[],
    ),
  );

  const animationCustomProperties = Array.from(
    new Set(
      Object.values(gradientDefinitions).flatMap(
        (definition) => definition.customProperties ?? [],
      ),
    ),
  );

  const generatedAnimationCss = [
    ...animationCustomProperties,
    ...animationKeyframes,
  ].join("\n\n");

  const initialVariableMap: Partial<Record<GradientKind, string>> = {
    "radial-circle": "--lb-zoom: 140%;",
    "radial-ellipse": "--lb-zoom-x: 170%; --lb-zoom-y: 140%;",
    "angular-sweep": "--lb-angle: 0deg;",
    diamond: "--lb-angle: 0deg;",
    mesh: "--lb-mesh-x: 0%; --lb-mesh-y: 0%;",
  };

  const regenerateBackground = () => {
    const definition = gradientDefinitions[gradientKind];
    const palette = colors.length ? colors : DEFAULT_COLORS;
    const centerXValue = clamp(centerX, 0, 100);
    const centerYValue = clamp(centerY, 0, 100);
    const background = definition.generator(palette, {
      angle,
      centerX: centerXValue,
      centerY: centerYValue,
    });
    const animation = definition.animation
      ? `${definition.animation.name} ${animationSpeed}s ${definition.animation.timing ?? "ease-in-out"} infinite${
          definition.animation.direction
            ? ` ${definition.animation.direction}`
            : ""
        }`
      : "none";
    const transformOrigin = `${centerXValue}% ${centerYValue}%`;
    const initialVars = initialVariableMap[gradientKind] ?? "";

    const styleParts = initialVars ? [initialVars] : [];
    styleParts.push(
      `background:${background}`,
      `background-size:${backgroundSize}`,
      `background-repeat:${backgroundRepeat}`,
      `background-position:50% 50%`,
      `transform-origin:${transformOrigin}`,
      `animation:${animation}`,
      `animation-fill-mode:both`,
      `transform:translateZ(0)`,
    );

    previewStyle = styleParts.join(";");

    htmlSnippet = `<div class="living-background" data-variant="${gradientKind}">
  <div class="living-background__layer"></div>
</div>`;

    const cssLines = [
      `.living-background {`,
      `  position: relative;`,
      `  min-height: 320px;`,
      `  border-radius: 24px;`,
      `  overflow: hidden;`,
      `}`,
      `.living-background__layer {`,
      `  position: absolute;`,
      `  inset: 0;`,
      `  border-radius: inherit;`,
      `  background: ${background};`,
      `  background-size: ${backgroundSize};`,
      `  background-repeat: ${backgroundRepeat};`,
      `  background-position: 50% 50%;`,
      `  animation: ${animation};`,
      `  animation-fill-mode: both;`,
      `  pointer-events: none;`,
      `  transform: translateZ(0);`,
      `  transform-origin: ${transformOrigin};`,
      `  will-change: transform, filter, background-position;`,
      `}`,
    ];

    if (initialVars) {
      cssLines.splice(10, 0, `  ${initialVars}`);
    }

    if (definition.customProperties?.length) {
      cssLines.push("");
      cssLines.push(...definition.customProperties);
    }

    if (definition.animation) {
      cssLines.push(definition.animation.keyframes);
    }

    cssSnippet = cssLines.join("\n");
  };

  const addColor = () => {
    if (colors.length >= MAX_COLORS) {
      notify("You can only select up to 8 colours.");
      return;
    }
    colors = [...colors, randomHex()];
    regenerateBackground();
  };

  const updateColor = (index: number, value: string) => {
    colors = colors.map((color, i) => (i === index ? value : color));
    regenerateBackground();
  };

  const removeColor = (index: number) => {
    if (colors.length <= 1) {
      notify("Keep at least one colour active.");
      return;
    }
    colors = colors.filter((_, i) => i !== index);
    regenerateBackground();
  };

  const resetPalette = () => {
    colors = [...DEFAULT_COLORS];
    regenerateBackground();
  };

  const randomPalette = () => {
    const next = Array.from({ length: Math.max(4, colors.length) }, randomHex);
    colors = next.slice(0, MAX_COLORS);
    regenerateBackground();
  };

  $: safeCenterX = clamp(centerX, 0, 100);
  $: safeCenterY = clamp(centerY, 0, 100);

  const colorPickerValue = (value: string) => {
    const trimmed = value.trim();
    return /^#[0-9A-Fa-f]{6}$/.test(trimmed) ? trimmed : "#000000";
  };

  const handlePaletteInput = (index: number, event: Event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    updateColor(index, input.value);
  };

  $: palettePreviewStops = buildStopSequence(
    colors.length ? colors : DEFAULT_COLORS,
  );
  $: palettePreviewGradient = `linear-gradient(90deg, ${palettePreviewStops})`;

  const handleKindChange = (kind: GradientKind) => {
    gradientKind = kind;
    const definition = gradientDefinitions[kind];
    backgroundSize = definition.defaultSize;
    backgroundRepeat = definition.defaultRepeat;
    animationSpeed = kind === "linear-stripes" ? 10 : 5;
    angle = definition.supportsAngle ? 45 : 0;
    const centerDefaults = definition.defaultCenter ?? DEFAULT_CENTER;
    centerX = centerDefaults.x;
    centerY = centerDefaults.y;
    regenerateBackground();
  };

  const handleAngleInput = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    angle = clamp(input.value, 0, 360);
    regenerateBackground();
  };

  const handleCenterXInput = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    centerX = clamp(input.value, 0, 100);
    regenerateBackground();
  };

  const handleCenterYInput = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    centerY = clamp(input.value, 0, 100);
    regenerateBackground();
  };

  const handleAnimationSpeed = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    animationSpeed = Math.max(1, Number(input.value));
    regenerateBackground();
  };

  const handleBackgroundSize = (event: Event) => {
    const select = event.currentTarget as HTMLSelectElement | null;
    if (!select) return;
    backgroundSize = select.value;
    regenerateBackground();
  };

  const resetBackground = () => {
    const definition = gradientDefinitions[gradientKind];
    backgroundSize = definition.defaultSize;
    backgroundRepeat = definition.defaultRepeat;
    angle = definition.supportsAngle ? 45 : 0;
    animationSpeed = gradientKind === "linear-stripes" ? 10 : 5;
    const centerDefaults = definition.defaultCenter ?? DEFAULT_CENTER;
    centerX = centerDefaults.x;
    centerY = centerDefaults.y;
    regenerateBackground();
  };

  const copyHtml = () => navigator.clipboard.writeText(htmlSnippet);
  const copyCss = () => navigator.clipboard.writeText(cssSnippet);

  regenerateBackground();
</script>

<svelte:head>
  <style>
    .living-background,
    .living-background-preview {
      position: relative;
      min-height: 320px;
      border-radius: 24px;
      overflow: hidden;
    }

    .living-background__layer,
    .living-background-preview__layer {
      position: absolute;
      inset: 0;
      border-radius: inherit;
      will-change: transform, filter, background-position;
      pointer-events: none;
      background-position: 50% 50%;
      animation-fill-mode: both;
    }
  </style>
  {@html `<style>${generatedAnimationCss}</style>`}
</svelte:head>

<section class="space-y-6">
  <div class="flex flex-col gap-6 lg:flex-row-reverse">
    <aside class="flex-1 space-y-6">
      <div
        class="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="border-b border-slate-100 px-6 py-5 dark:border-slate-800">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Living background preview
          </h2>
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            {gradientDefinitions[gradientKind].description}
          </p>
        </div>
        <div class="p-6">
          <div
            class="rounded-[28px] border border-white/40 bg-slate-100/60 shadow-inner backdrop-blur dark:border-white/10 dark:bg-slate-950/60"
          >
            <div class="living-background living-background-preview">
              <div
                class="living-background__layer living-background-preview__layer"
                style={previewStyle}
              ></div>
            </div>
          </div>
          <div
            class="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span
              class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800"
            >
              Type:
              <span class="text-slate-700 dark:text-slate-200">
                {gradientDefinitions[gradientKind].label}
              </span>
            </span>
            <span
              class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800"
            >
              Colours:
              <span class="text-slate-700 dark:text-slate-200"
                >{colors.length}</span
              >
            </span>
            <span
              class="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 dark:bg-slate-800"
            >
              Size:
              <span class="text-slate-700 dark:text-slate-200"
                >{backgroundSize}</span
              >
            </span>
          </div>
          <div class="mt-6 flex flex-wrap gap-3">
            <Copy
              text={htmlSnippet}
              label="Copy HTML"
              floating={false}
              customClass="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300 dark:focus:ring-indigo-900"
            />
            <Copy
              text={cssSnippet}
              label="Copy CSS"
              floating={false}
              customClass="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-200 dark:focus:ring-emerald-900"
            />
          </div>
          <div class="mt-6 grid gap-4">
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                HTML
              </p>
              <pre
                class="mt-2 max-h-48 w-full overflow-auto rounded-2xl bg-slate-50 p-4 text-[12px] text-emerald-700 dark:text-emerald-200 shadow-inner dark:bg-black whitespace-pre-wrap break-words">{htmlSnippet}</pre>
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                CSS
              </p>
              <pre
                class="mt-2 max-h-48 w-full overflow-auto rounded-2xl bg-slate-50 p-4 text-[12px] text-emerald-700 dark:text-emerald-200 shadow-inner dark:bg-black whitespace-pre-wrap break-words">{cssSnippet}</pre>
            </div>
          </div>
        </div>
      </div>
    </aside>

    <div class="flex-1 space-y-6">
      <div
        class="palette rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        {#if status}
          <p
            class="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-300"
          >
            {status}
          </p>
        {/if}
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Palette
        </p>
        <div
          class="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
        >
          <span>
            {colors.length === 1
              ? "Single colour active"
              : `${colors.length} colours active`}
          </span>
          <span
            class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
          >
            {colors.length}/{MAX_COLORS}
          </span>
        </div>
        <div
          class="mt-4 h-2 w-full rounded-full bg-slate-200 shadow-inner dark:bg-slate-800"
          style={`background:${palettePreviewGradient}`}
        ></div>
        <div class="mt-5 grid gap-4 lg:grid-cols-2">
          {#each colors as color, index (index)}
            <article
              class="group rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-indigo-500/80"
            >
              <div class="flex items-center justify-between">
                <span
                  class="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Colour {index + 1}
                </span>
                <button
                  type="button"
                  class="inline-flex h-8 w-8 items-center justify-center rounded-full border border-rose-300 text-rose-500 transition hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-rose-500/60 dark:text-rose-300 dark:hover:bg-rose-500/20 dark:hover:text-rose-200 dark:focus:ring-rose-900"
                  on:click={() => removeColor(index)}
                  aria-label={`Remove colour ${color}`}
                >
                  <span aria-hidden="true" class="text-base leading-none"
                    >&times;</span
                  >
                </button>
              </div>
              <div class="mt-4 flex items-center gap-3">
                <div class="flex flex-1 flex-col gap-2">
                  <div class="flex items-center gap-2">
                    <input
                      class="h-11 w-16 cursor-pointer rounded-xl border border-slate-200 bg-white text-transparent shadow-sm transition hover:ring-2 hover:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:hover:ring-indigo-700/60"
                      type="color"
                      value={colorPickerValue(color)}
                      on:input={(event) => handlePaletteInput(index, event)}
                      aria-label={`Pick colour value for swatch ${index + 1}`}
                    />
                    <input
                      class="h-11 w-12 flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-mono uppercase tracking-wide text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
                      type="text"
                      value={color}
                      on:input={(event) => handlePaletteInput(index, event)}
                    />
                  </div>
                </div>
              </div>
            </article>
          {/each}
        </div>
        <div class="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-600 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-60 dark:border-indigo-400 dark:text-indigo-200 dark:hover:bg-indigo-500/10 dark:focus:ring-indigo-900"
            on:click={addColor}
            disabled={colors.length >= MAX_COLORS}
          >
            Add colour
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-200 dark:focus:ring-emerald-900"
            on:click={resetPalette}
          >
            Reset palette
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-amber-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-600 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-amber-500 dark:text-amber-200 dark:hover:bg-amber-500/10 dark:focus:ring-amber-900"
            on:click={randomPalette}
          >
            Random palette
          </button>
        </div>
        <p class="mt-3 text-xs text-slate-400 dark:text-slate-500">
          Shape the gradient with up to eight swatches. Tweak the hex code,
          sample a colour, or clear a slot when inspiration strikes.
        </p>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Gradient type
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
                >{option.description}</span
              >
            </button>
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
            <span>Animation speed</span>
            <input
              class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="range"
              min="1"
              max="40"
              step="1"
              bind:value={animationSpeed}
              on:input={handleAnimationSpeed}
            />
            <span class="mt-1 block text-xs text-slate-400 dark:text-slate-500"
              >{animationSpeed}s loop</span
            >
          </label>

          {#if gradientDefinitions[gradientKind].supportsAngle}
            <label
              class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Angle</span>
              <input
                class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
                type="range"
                min="0"
                max="360"
                bind:value={angle}
                on:input={handleAngleInput}
              />
              <span
                class="mt-1 block text-xs text-slate-400 dark:text-slate-500"
                >{angle}&deg;</span
              >
            </label>
          {/if}

          {#if gradientDefinitions[gradientKind].supportsCenter}
            <div class="grid gap-4 sm:grid-cols-2">
              <label
                class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                <span>Center X</span>
                <input
                  class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
                  type="range"
                  min="0"
                  max="100"
                  bind:value={centerX}
                  on:input={handleCenterXInput}
                />
                <span
                  class="mt-1 block text-xs text-slate-400 dark:text-slate-500"
                  >{safeCenterX}%</span
                >
              </label>
              <label
                class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                <span>Center Y</span>
                <input
                  class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
                  type="range"
                  min="0"
                  max="100"
                  bind:value={centerY}
                  on:input={handleCenterYInput}
                />
                <span
                  class="mt-1 block text-xs text-slate-400 dark:text-slate-500"
                  >{safeCenterY}%</span
                >
              </label>
            </div>
          {/if}
        </div>

        <div class="space-y-4">
          <label
            class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Background size</span>
            <select
              class="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              bind:value={backgroundSize}
              on:change={handleBackgroundSize}
            >
              {#each backgroundSizes as sizeOption}
                <option value={sizeOption}>{sizeOption}</option>
              {/each}
            </select>
          </label>

          <button
            type="button"
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-rose-400 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-500 dark:hover:text-rose-300 dark:focus:ring-rose-900"
            on:click={resetBackground}
          >
            Reset background
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
