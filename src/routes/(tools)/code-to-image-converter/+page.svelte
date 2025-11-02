<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import { browser } from "$app/environment";
  import html2canvas from "html2canvas";

  type Theme = "twilight" | "midnight" | "latte";
  type BackgroundMode = "gradient" | "solid";

  const starterCode = `export function launch(options) {
  const defaultOptions = {
    retries: 2,
    timeout: 12_000,
    tracking: true,
  };

  return {
    ...defaultOptions,
    ...options,
  };
}

console.log(launch({ tracking: false }));`;

  const themes: Record<
    Theme,
    {
      label: string;
      background: string;
      titleBar: string[];
      accent: string;
      codeColor: string;
      lineColor: string;
    }
  > = {
    twilight: {
      label: "Twilight",
      // 🌇 Based on “Twilight Horizon” — moody purple-orange dusk
      background: "bg-gradient-to-br from-[#312e81] via-[#6d28d9] to-[#f59e0b]",
      titleBar: ["bg-purple-500", "bg-pink-500", "bg-amber-400"],
      accent: "text-slate-100",
      codeColor: "#f1f5f9",
      lineColor: "rgba(203, 213, 225, 0.65)",
    },
    midnight: {
      label: "Midnight",
      // 🌌 Based on “Deep Ocean” — deep blue calm with professional contrast
      background: "bg-gradient-to-br from-[#0f172a] via-[#1e3a8a] to-[#2563eb]",
      titleBar: ["bg-indigo-500", "bg-blue-400", "bg-cyan-400"],
      accent: "text-white",
      codeColor: "#e0f2fe",
      lineColor: "rgba(147, 197, 253, 0.7)",
    },
    latte: {
      label: "Latte",
      // ☀️ Based on “Morning Latte” — soft warm tones for light mode
      background: "bg-gradient-to-br from-[#fff7ed] via-[#fde68a] to-[#f59e0b]",
      titleBar: ["bg-amber-400", "bg-orange-400", "bg-rose-400"],
      accent: "text-amber-200",
      codeColor: "#f97316",
      lineColor: "rgba(71, 85, 105, 0.65)",
    },
  };

  const gradients = [
    // 🌌 1. Deep Focus — calm, immersive, for dark mode coders
    "linear-gradient(135deg, #0f172a, #1e293b, #3b82f6)",

    // ⚡ 2. Electric Indigo — creative, inspiring energy
    "linear-gradient(135deg, #1e1b4b, #4338ca, #8b5cf6)",

    // 💻 3. Cyber Neon — futuristic, coder aesthetic
    "linear-gradient(135deg, #0f172a, #312e81, #22d3ee)",

    // 🌅 4. Morning Latte — soft light mode comfort
    "linear-gradient(135deg, #fff7ed, #fde68a, #f59e0b)",

    // 🌿 5. Emerald Mist — refreshing, balanced and positive
    "linear-gradient(135deg, #ecfdf5, #a7f3d0, #10b981)",

    // 🧊 6. Glacier Flow — cool and focused
    "linear-gradient(135deg, #f0f9ff, #bae6fd, #38bdf8)",

    // 🔥 7. Ember Glow — energetic and bold
    "linear-gradient(135deg, #7f1d1d, #b91c1c, #f97316)",

    // 🌇 8. Twilight Horizon — moody and cinematic
    "linear-gradient(135deg, #312e81, #6d28d9, #f59e0b)",

    // 🌸 9. Sakura Bloom — gentle, inspired creativity
    "linear-gradient(135deg, #fdf2f8, #fbcfe8, #f472b6)",

    // 🧠 10. Cognitive Calm — gray-blue clarity for readability
    "linear-gradient(135deg, #1e293b, #334155, #64748b)",

    // 🌞 11. Daylight Cream — warm, subtle light theme
    "linear-gradient(135deg, #fafaf9, #fefce8, #fde68a)",

    // 🪐 12. Space Drift — mysterious and elegant
    "linear-gradient(135deg, #020617, #1e1b4b, #312e81)",

    // 🧡 13. Sunset Bloom — emotional warmth
    "linear-gradient(135deg, #fed7aa, #fb923c, #f43f5e)",

    // 🌊 14. Deep Ocean — grounded, tranquil, immersive
    "linear-gradient(135deg, #0f172a, #1e3a8a, #2563eb)",

    // 🌤️ 15. Cloud Light — clean, minimal, airy light mode
    "linear-gradient(135deg, #f8fafc, #e2e8f0, #cbd5e1)",

    // 🎨 16. Prism Pulse — creative blend of spectrum tones
    "linear-gradient(135deg, #6366f1, #ec4899, #f59e0b)",
  ];

  let code = starterCode;
  let caption = "launch.ts";
  let watermark = "devstar";
  let showWatermark = true;
  let showLineNumbers = true;
  let theme: Theme = "twilight";
  let backgroundMode: BackgroundMode = "gradient";
  let gradientIndex = 0;
  let solidColor = "#1f2937";
  let padding: number | string = 36;
  let borderRadius: number | string = 28;
  let isExporting = false;
  let previewRef: HTMLDivElement | null = null;

  const codeColorOptions = ["#f8fafc", "#f97316", "#22d3ee", "#fef08a"];
  const lineColorOptions = [
    "rgba(226,232,240,0.65)",
    "#c084fc",
    "#fbbf24",
    "#22d3ee",
  ];

  let codeColor = themes[theme].codeColor;
  let lineNumberColor = themes[theme].lineColor;

  $: lines = code.replace(/\r\n/g, "\n").split("\n");

  $: previewPadding = `${Number(padding) || 0}px`;
  $: previewRadius = `${Number(borderRadius) || 0}px`;
  $: previewBackground =
    backgroundMode === "gradient" ? gradients[gradientIndex] : solidColor;
  $: previewContainerBackground =
    backgroundMode === "gradient" ? themes[theme].background : "bg-transparent";
  $: trimmedCaption = caption.trim();
  $: lineNumbers = Array.from(
    { length: lines.length },
    (_, index) => index + 1,
  );

  function nextGradient() {
    gradientIndex = (gradientIndex + 1) % gradients.length;
  }

  function selectTheme(key: Theme) {
    theme = key;
    codeColor = themes[key].codeColor;
    lineNumberColor = themes[key].lineColor;
  }

  const handlePaddingInput = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    padding = Number(input.value);
  };

  const handleRadiusInput = (event: Event) => {
    const input = event.currentTarget as HTMLInputElement | null;
    if (!input) return;
    borderRadius = Number(input.value);
  };

  async function exportImage() {
    if (!previewRef || !browser) return;
    try {
      if (typeof document !== "undefined" && (document as any).fonts?.ready) {
        await (document as any).fonts.ready;
      }
      isExporting = true;
      const canvas = await html2canvas(previewRef, {
        backgroundColor: null,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      const safeCaption = caption
        ? caption.replace(/[^\w.-]+/g, "-")
        : "code-snippet";
      link.download = `${safeCaption}.png`;
      link.click();
    } finally {
      isExporting = false;
    }
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
    <!-- Sidebar -->
    <aside class="space-y-6 w-full overflow-hidden">
      <!-- Presets -->
      <div
        class="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Presets
        </h2>
        <div class="grid gap-3 sm:grid-cols-2">
          {#each Object.entries(themes) as [key, value]}
            <button
              type="button"
              class={`rounded-2xl border px-4 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                theme === key
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-indigo-400/70"
              }`}
              on:click={() => selectTheme(key)}
            >
              <span class="text-sm font-semibold">{value.label}</span>
              <span
                class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
              >
                Styled with {value.titleBar.length} window controls
              </span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Layout Controls -->
      <div
        class="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Layout
        </h2>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Caption (optional)</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="text"
            bind:value={caption}
            placeholder="e.g. snippet.ts"
          />
        </label>
        <div class="grid gap-3 sm:grid-cols-2">
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Padding</span>
            <input
              type="range"
              min="24"
              max="72"
              step="4"
              bind:value={padding}
              on:input={handlePaddingInput}
              class="rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Radius</span>
            <input
              type="range"
              min="12"
              max="48"
              step="4"
              bind:value={borderRadius}
              on:input={handleRadiusInput}
              class="rounded-xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
            />
          </label>
        </div>

        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <label
            class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <input
              type="checkbox"
              bind:checked={showLineNumbers}
              class="size-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400"
            />
            Show line numbers
          </label>
          <label
            class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <input
              type="checkbox"
              bind:checked={showWatermark}
              class="size-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400"
            />
            Show watermark
          </label>
        </div>

        <div
          class="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
        >
          <span>Code colours</span>
          <div class="grid gap-3 sm:grid-cols-2">
            <div>
              <p
                class="text-[11px] font-semibold tracking-[0.2em] text-slate-400 dark:text-slate-500"
              >
                Code text
              </p>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                {#each codeColorOptions as color}
                  <button
                    type="button"
                    class={`size-8 rounded-full border transition ${codeColor === color ? "border-white ring-2 ring-indigo-400" : "border-slate-200 dark:border-slate-700"}`}
                    style={`background:${color}`}
                    on:click={() => (codeColor = color)}
                    aria-label={`Select code colour ${color}`}
                  ></button>
                {/each}
                <input
                  class="h-8 w-16 rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                  type="color"
                  bind:value={codeColor}
                  aria-label="Custom code colour"
                />
              </div>
            </div>
            <div>
              <p
                class="text-[11px] font-semibold tracking-[0.2em] text-slate-400 dark:text-slate-500"
              >
                Line numbers
              </p>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                {#each lineColorOptions as color}
                  <button
                    type="button"
                    class={`size-8 rounded-full border transition ${lineNumberColor === color ? "border-white ring-2 ring-indigo-400" : "border-slate-200 dark:border-slate-700"}`}
                    style={`background:${color}`}
                    on:click={() => (lineNumberColor = color)}
                    aria-label={`Select line colour ${color}`}
                  ></button>
                {/each}
                <input
                  class="h-8 w-16 rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
                  type="color"
                  bind:value={lineNumberColor}
                  aria-label="Custom line number colour"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Background -->
      <div
        class="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Background
        </h2>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class={`flex-1 rounded-2xl border px-3 py-2 text-sm transition ${
              backgroundMode === "gradient"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
            }`}
            on:click={() => (backgroundMode = "gradient")}
          >
            Gradient
          </button>
          <button
            type="button"
            class={`flex-1 rounded-2xl border px-3 py-2 text-sm transition ${
              backgroundMode === "solid"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
            }`}
            on:click={() => (backgroundMode = "solid")}
          >
            Solid
          </button>
        </div>

        {#if backgroundMode === "gradient"}
          <div class="grid grid-cols-4 gap-2">
            {#each gradients as gradient, index}
              <button
                type="button"
                class={`h-12 rounded-2xl border transition ${
                  gradientIndex === index
                    ? "border-indigo-500"
                    : "border-slate-200 dark:border-slate-700"
                }`}
                style={`background:${gradient}`}
                on:click={() => (gradientIndex = index)}
              ></button>
            {/each}
          </div>
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
            on:click={nextGradient}
          >
            Shuffle gradient
          </button>
        {:else}
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Pick color</span>
            <input
              class="h-12 w-full rounded-2xl border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900"
              type="color"
              bind:value={solidColor}
            />
          </label>
        {/if}
      </div>
    </aside>

    <!-- Right Panel -->
    <div class="space-y-6 w-full overflow-hidden">
      <!-- Code Input -->
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Code
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Paste any snippet. Markdown and plain text work too.
            </p>
          </div>
          <Copy text={code} label="Copy code" floating={false} />
        </div>
        <div class="overflow-x-auto w-full">
          <textarea
            class="mt-4 h-72 w-full min-w-[280px] resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40 sm:h-80"
            bind:value={code}
            spellcheck="false"
          />
        </div>
      </div>

      <!-- Preview -->
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Preview
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Configurable code frame rendered for export.
            </p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Copy text={watermark} label="Copy watermark" floating={false} />
            <button
              type="button"
              class="inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              on:click={exportImage}
              disabled={isExporting}
            >
              {isExporting ? "Exporting..." : "Download PNG"}
            </button>
          </div>
        </div>

        <!-- Scrollable Preview Container -->
        <div
          class="mt-6 flex justify-center overflow-auto rounded-3xl border border-slate-100 bg-slate-100/80 p-4 sm:p-6 dark:border-slate-800 dark:bg-slate-900/50"
        >
          <div
            bind:this={previewRef}
            class="relative w-full max-w-3xl min-w-[280px]"
          >
            <div
              class={`relative overflow-hidden rounded-[32px] border border-white/10 shadow-[0_40px_120px_-60px_rgba(15,23,42,0.85)] backdrop-blur-sm transition ${previewContainerBackground}`}
              style:border-radius={previewRadius}
            >
              <div
                class="absolute inset-0 rounded-[32px] opacity-80"
                style:background={previewBackground}
                style:border-radius={previewRadius}
              ></div>
              {#if backgroundMode === "gradient"}
                <div
                  class="absolute inset-0 rounded-[32px] bg-gradient-to-br from-white/10 via-transparent to-black/55"
                  style:border-radius={previewRadius}
                ></div>
              {/if}
              <div
                class="relative flex flex-col gap-5"
                style:padding={previewPadding}
                style:border-radius={previewRadius}
              >
                <!-- Title Bar -->
                <div
                  class="flex items-center justify-between mb-3 text-white/80"
                >
                  <div class="flex items-center gap-2">
                    {#each themes[theme].titleBar as dot}
                      <span
                        class={`size-3 rounded-full border border-white/30 shadow-inner ${dot}`}
                      ></span>
                    {/each}
                    {#if trimmedCaption}
                      <span
                        class="rounded-full bg-black/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/70"
                      >
                        {trimmedCaption}
                      </span>
                    {/if}
                  </div>
                </div>
                <!-- Preview Container -->
                <div
                  class="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-900/95 p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/90"
                >
                  <!-- Code Area -->
                  <div
                    class={`flex gap-4 ${showLineNumbers ? "items-stretch" : ""}`}
                  >
                    {#if showLineNumbers}
                      <div
                        class="flex flex-col justify-between items-end gap-1.5 border-r border-white/20 pr-3 text-xs font-semibold tracking-[0.2em]"
                        style:color={lineNumberColor}
                      >
                        {#each lineNumbers as number}
                          <span class="leading-relaxed">{number}</span>
                        {/each}
                      </div>
                    {/if}

                    <div class="flex-1 flex flex-col justify-between gap-1.5">
                      {#each lines as line}
                        <span
                          class="whitespace-pre-wrap text-sm leading-relaxed"
                          style:color={codeColor}
                        >
                          {line || " "}
                        </span>
                      {/each}
                    </div>
                  </div>
                </div>

                <!-- Watermark -->
                {#if showWatermark}
                  <div class="mt-4 flex justify-end pr-1">
                    <span
                      class="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em]"
                      style:color={lineNumberColor}
                    >
                      {watermark}
                    </span>
                  </div>
                {/if}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
