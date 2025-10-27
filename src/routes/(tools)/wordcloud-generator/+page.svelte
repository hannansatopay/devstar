<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import cloud from "d3-cloud";

  type PaletteKey = keyof typeof palettes;
  type RotationMode = "mixed" | "horizontal" | "vertical" | "angled";

  type LayoutWord = {
    text: string;
    size: number;
    x: number;
    y: number;
    rotate: number;
    fill: string;
  };

  const palettes = {
    aurora: {
      label: "Aurora Glow",
      colors: [
        "#7C3AED",
        "#38BDF8",
        "#F97316",
        "#FB7185",
        "#22D3EE",
        "#FBBF24",
      ],
    },
    citrus: {
      label: "Citrus Burst",
      colors: [
        "#FACC15",
        "#F97316",
        "#EF4444",
        "#10B981",
        "#FDE68A",
        "#34D399",
      ],
    },
    ocean: {
      label: "Ocean Depths",
      colors: [
        "#0EA5E9",
        "#1D4ED8",
        "#0F172A",
        "#22D3EE",
        "#38BDF8",
        "#64748B",
      ],
    },
    noir: {
      label: "Modern Noir",
      colors: [
        "#0F172A",
        "#1F2937",
        "#365314",
        "#E2E8F0",
        "#94A3B8",
        "#334155",
      ],
    },
  } as const;

  const fonts = [
    "Poppins",
    "Inter",
    "Playfair Display",
    "Fira Sans",
    "Merriweather",
    "Josefin Sans",
    "Lato",
    "Space Grotesk",
  ];

  let sourceText = "This is a sample word cloud text. Feel free to replace it!";
  let paletteKey: PaletteKey = "aurora";
  let fontFamily = "Poppins";
  let rotation: RotationMode = "mixed";
  let minFont = 18;
  let maxFont = 72;
  let padding = 4;
  let backgroundColor = "#f8fafc";
  let wordLimit = 120;

  let layoutWords: LayoutWord[] = [];
  let wordSummary: Array<{ text: string; weight: number }> = [];
  let loading = false;
  let errorMessage = "";

  let dimensions = { width: 640, height: 384 };
  let svgElement: SVGSVGElement | null = null;
  let container: HTMLDivElement | null = null;
  let resizeObserver: ResizeObserver | null = null;

  const d3Cloud: any = cloud;

  $: computedMinFont = Math.max(8, Number(minFont) || 8);
  $: computedMaxFont = Math.max(
    computedMinFont + 2,
    Number(maxFont) || computedMinFont + 2,
  );
  $: computedWordLimit = Math.max(10, Math.min(300, Number(wordLimit) || 120));
  $: computedPadding = Math.max(0, Math.min(40, Number(padding) || 0));

  const rotationOptions: Array<{ value: RotationMode; label: string }> = [
    { value: "mixed", label: "Mixed" },
    { value: "horizontal", label: "Horizontal" },
    { value: "vertical", label: "Vertical" },
    { value: "angled", label: "Angled" },
  ];

  function deterministicHash(value: string) {
    let hash = 0;
    for (let index = 0; index < value.length; index += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(index);
      hash |= 0;
    }
    return hash;
  }

  function tokenise(value: string) {
    const map = new Map<string, number>();
    value
      .replace(/[\r\n]+/g, " ")
      .split(/\s+/)
      .map((token) => token.trim().toLowerCase())
      .filter((token) => token.length > 1 && /[a-z0-9]/i.test(token))
      .forEach((token) => {
        map.set(token, (map.get(token) ?? 0) + 1);
      });
    return Array.from(map.entries())
      .map(([text, weight]) => ({ text, weight }))
      .sort((a, b) => b.weight - a.weight);
  }

  function rotationFor(word: string) {
    const hash = deterministicHash(word);
    if (rotation === "horizontal") return 0;
    if (rotation === "vertical") return 90;
    if (rotation === "angled") {
      const angles = [-45, -30, -15, 0, 15, 30, 45];
      return angles[Math.abs(hash) % angles.length];
    }
    return Math.abs(hash) % 2 === 0 ? 0 : 90;
  }

  function updateDimensions(width: number) {
    const safeWidth = Math.max(320, Math.min(Math.round(width), 640));
    const safeHeight = Math.round(safeWidth * 0.6);
    dimensions = { width: safeWidth, height: safeHeight };
  }

  async function generateCloud() {
    const tokens = tokenise(sourceText);
    wordSummary = tokens.slice(0, 8);
    if (!tokens.length) {
      layoutWords = [];
      errorMessage = "Add some words to build your word cloud.";
      return;
    }

    const minSize = computedMinFont;
    const maxSize = computedMaxFont;
    if (minSize >= maxSize) {
      errorMessage =
        "Maximum font size must be greater than minimum font size.";
      return;
    }

    const limit = computedWordLimit;
    const paddingSize = computedPadding;

    loading = true;
    errorMessage = "";
    layoutWords = [];

    const palette = palettes[paletteKey];
    const limited = tokens.slice(0, limit);
    const weights = limited.map((item) => item.weight);
    const maxWeight = Math.max(...weights);
    const minWeight = Math.min(...weights);

    const scale = (weight: number) => {
      if (maxWeight === minWeight) return (minSize + maxSize) / 2;
      const normalised = (weight - minWeight) / (maxWeight - minWeight);
      return Math.round(minSize + normalised * (maxSize - minSize));
    };

    const layout = d3Cloud()
      .size([dimensions.width, dimensions.height])
      .words(
        limited.map((item) => ({
          text: item.text,
          weight: item.weight,
        })),
      )
      .padding(paddingSize)
      .rotate((word: { text?: string }) => rotationFor(word.text ?? ""))
      .font(fontFamily)
      .fontSize((word: { weight?: number }) => scale(word.weight ?? 1));

    layout.on(
      "end",
      (
        words: Array<{
          text?: string;
          size?: number;
          x?: number;
          y?: number;
          rotate?: number;
        }>,
      ) => {
        layoutWords = words.map((word, index) => {
          const text = word.text ?? "";
          const paletteIndex =
            Math.abs(deterministicHash(text || `${index}`)) %
            palette.colors.length;
          return {
            text,
            size: word.size ?? minSize,
            x: word.x ?? 0,
            y: word.y ?? 0,
            rotate: word.rotate ?? 0,
            fill: palette.colors[paletteIndex],
          };
        });
        loading = false;
      },
    );

    try {
      layout.start();
    } catch (error) {
      console.error("Unable to generate cloud", error);
      errorMessage = "Something went wrong while generating your word cloud.";
      loading = false;
    }
  }

  function exportSvg() {
    if (!svgElement) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const blob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "word-cloud.svg";
    link.click();
    URL.revokeObjectURL(url);
  }

  function exportPng() {
    if (!svgElement) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([source], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);
    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const context = canvas.getContext("2d");
      if (!context) return;
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      URL.revokeObjectURL(svgUrl);
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "word-cloud.png";
      link.click();
    };
    image.onerror = () => URL.revokeObjectURL(svgUrl);
    image.src = svgUrl;
  }

  function clearInputs() {
    sourceText = "";
    layoutWords = [];
    wordSummary = [];
    errorMessage = "";
  }

  onMount(() => {
    if (container) {
      updateDimensions(container.clientWidth);
      resizeObserver = new ResizeObserver((entries) => {
        if (!entries.length) return;
        updateDimensions(entries[0].contentRect.width);
        if (layoutWords.length) generateCloud();
      });
      resizeObserver.observe(container);
    }
    generateCloud();
  });

  onDestroy(() => {
    resizeObserver?.disconnect();
  });
</script>

<section class="space-y-6">
  <div class=" flex flex-col gap-8 lg:flex-row">
    <div class="flex w-full flex-col gap-6 lg:max-w-md">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg dark:border-slate-800 dark:bg-slate-900"
      >
        <label class="flex flex-col gap-4">
          <div class="flex items-start justify-between gap-4">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Source text</span
            >
            <button
              type="button"
              class="rounded-full border border-transparent bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
              on:click={clearInputs}
            >
              Reset
            </button>
          </div>
          <textarea
            bind:value={sourceText}
            rows="6"
            placeholder="Paste or type the words you want to visualise."
            class="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-relaxed text-slate-900 transition focus:border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-100"
          />
        </label>

        <div class="grid gap-4 pt-4 sm:grid-cols-2">
          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Palette</span
            >
            <select
              bind:value={paletteKey}
              class="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {#each Object.entries(palettes) as [key, palette]}
                <option value={key}>{palette.label}</option>
              {/each}
            </select>
          </label>

          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Font family</span
            >
            <select
              bind:value={fontFamily}
              class="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {#each fonts as family}
                <option value={family}>{family}</option>
              {/each}
            </select>
          </label>

          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Rotation</span
            >
            <select
              bind:value={rotation}
              class="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            >
              {#each rotationOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </label>

          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Word limit</span
            >
            <input
              type="number"
              min="10"
              max="300"
              bind:value={wordLimit}
              class="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>
        </div>

        <div class="grid gap-4 pt-4 sm:grid-cols-2">
          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Min font</span
            >
            <input
              type="number"
              min="8"
              bind:value={minFont}
              class="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Max font</span
            >
            <input
              type="number"
              min={computedMinFont + 2}
              bind:value={maxFont}
              class="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Padding</span
            >
            <input
              type="number"
              min="0"
              max="40"
              bind:value={padding}
              class="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </label>

          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Background</span
            >
            <input
              type="color"
              bind:value={backgroundColor}
              class="h-11 w-full cursor-pointer rounded-2xl border border-slate-200 bg-white px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        </div>

        <div class="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-60"
            on:click={generateCloud}
          >
            {#if loading}
              <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  class="opacity-30"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="currentColor"
                  stroke-width="4"
                  stroke-linecap="round"
                />
              </svg>
              Generating
            {:else}
              Generate cloud
            {/if}
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
            on:click={exportSvg}
          >
            Export SVG
          </button>
          <button
            type="button"
            class="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-500 dark:hover:text-white"
            on:click={exportPng}
          >
            Export PNG
          </button>
        </div>

        {#if errorMessage}
          <p
            class="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-400/40 dark:bg-amber-500/10 dark:text-amber-200"
          >
            {errorMessage}
          </p>
        {/if}

        {#if wordSummary.length}
          <div class="mt-6">
            <h2
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Top keywords
            </h2>
            <ul class="mt-3 grid gap-2 text-sm">
              {#each wordSummary as item}
                <li
                  class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
                >
                  <span>{item.text}</span>
                  <span
                    class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500"
                    >{item.weight} &times;</span
                  >
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    </div>

    <div class="flex w-full flex-col gap-6" bind:this={container}>
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-lg font-semibold">Cloud preview</h2>
          <span
            class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500"
          >
            {dimensions.width} &times; {dimensions.height}
          </span>
        </div>
        <div
          class="mt-4 overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/40"
        >
          <svg
            bind:this={svgElement}
            width={dimensions.width}
            height={dimensions.height}
            viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
            preserveAspectRatio="xMidYMid meet"
            class="h-auto w-full"
            role="img"
          >
            <rect width="100%" height="100%" fill={backgroundColor} rx="24" />
            <g
              transform={`translate(${dimensions.width / 2}, ${dimensions.height / 2})`}
            >
              {#each layoutWords as word}
                <text
                  fill={word.fill}
                  font-family={fontFamily}
                  font-size={word.size}
                  text-anchor="middle"
                  transform={`translate(${word.x}, ${word.y}) rotate(${word.rotate})`}
                  class="select-none"
                >
                  {word.text}
                </text>
              {/each}
              {#if !layoutWords.length && !loading}
                <text
                  text-anchor="middle"
                  fill="#94a3b8"
                  font-size="18"
                  class="select-none"
                >
                  Add text and generate your cloud to preview it here.
                </text>
              {/if}
            </g>
          </svg>
        </div>
      </div>

      <div class="grid gap-3 text-sm sm:grid-cols-3">
        <div
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Palette
          </p>
          <div class="mt-2 flex gap-1">
            {#each palettes[paletteKey].colors as color}
              <span
                class="h-6 w-6 rounded-full border border-white shadow-inner dark:border-slate-700"
                style={`background:${color}`}
              />
            {/each}
          </div>
        </div>
        <div
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Words rendered
          </p>
          <p
            class="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100"
          >
            {layoutWords.length}
          </p>
        </div>
        <div
          class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
        >
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Font range
          </p>
          <p
            class="mt-2 text-xl font-semibold text-slate-900 dark:text-slate-100"
          >
            {computedMinFont}px &ndash; {computedMaxFont}px
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
