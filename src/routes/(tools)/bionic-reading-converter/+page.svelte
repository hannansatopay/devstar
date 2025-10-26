<script>
  import Copy from "$lib/Copy.svelte";

  const sampleLibrary = [
    {
      label: "Product launch",
      text: "Introducing Aurora 2 our fastest, most intuitive productivity suite yet. Discover a calmer email experience, guided focus sessions, and analytics that surface what actually matters.",
    },
    {
      label: "News brief",
      text: "Scientists at the Monterey Institute have mapped a new migratory corridor for blue whales, giving conservation teams the data they need to re-route dense shipping traffic.",
    },
    {
      label: "How-to",
      text: "To reset your standing desk, hold the down button until the panel flashes. Release, then press the up button twice to calibrate the motor and resume normal use.",
    },
  ];

  const accentOptions = {
    indigo: { label: "Indigo", class: "text-indigo-600 dark:text-indigo-300" },
    emerald: {
      label: "Emerald",
      class: "text-emerald-600 dark:text-emerald-300",
    },
    rose: { label: "Rose", class: "text-rose-500 dark:text-rose-300" },
    amber: { label: "Amber", class: "text-amber-500 dark:text-amber-300" },
  };

  const themeOptions = {
    light: {
      label: "Daylight",
      wrapper: "bg-white text-slate-800",
      panel: "bg-slate-50/90 border border-slate-200 shadow-inner",
      meta: "text-slate-500",
    },
    sepia: {
      label: "Sepia",
      wrapper: "bg-[#f9f4ed] text-stone-800",
      panel: "bg-[#f5ede1] border border-[#e5d3c0]",
      meta: "text-stone-500",
    },
    dark: {
      label: "Midnight",
      wrapper: "bg-slate-950 text-slate-100",
      panel: "bg-slate-900/80 border border-slate-700",
      meta: "text-slate-400",
    },
  };

  const textSizeOptions = {
    compact: "text-sm sm:text-base",
    normal: "text-base sm:text-lg",
    reader: "text-lg sm:text-xl",
  };

  const lineHeightOptions = {
    snuggled: "leading-snug",
    relaxed: "leading-relaxed",
    spacious: "leading-loose",
  };

  const fixationPresets = [
    { label: "Fast skim", value: 30 },
    { label: "Balanced", value: 40 },
    { label: "Focused", value: 50 },
  ];

  const previewModes = [
    { value: "paragraph", label: "Paragraph view" },
    { value: "list", label: "Sentence list" },
  ];

  const sampleText = sampleLibrary[0].text;

  let input = sampleText;
  let fixation = 40;
  let previewMode = "paragraph";
  let accent = "indigo";
  let theme = "light";
  let textSize = "normal";
  let lineHeight = "relaxed";

  $: words = buildBionicWords(input, fixation / 100);
  $: plainText = words.map((token) => token.original).join("");
  $: htmlOutput = words
    .map((token) =>
      token.isWhitespace
        ? token.original
        : `<span class="bionic-word"><strong>${token.prefix}</strong>${token.suffix}</span>`,
    )
    .join("");
  $: wordCount = words.filter((token) => !token.isWhitespace).length;
  $: charCount = plainText.trim().length;
  $: readingMinutes = wordCount ? Math.max(1, Math.ceil(wordCount / 200)) : 0;

  $: accentClass = accentOptions[accent].class;
  $: themeConfig = themeOptions[theme];
  $: textSizeClass = textSizeOptions[textSize];
  $: lineHeightClass = lineHeightOptions[lineHeight];

  function applySample(text) {
    input = text;
  }

  function buildBionicWords(text, emphasisRatio) {
    if (!text.trim()) {
      return [];
    }
    return text.split(/(\s+)/).map((token) => {
      if (/^\s+$/.test(token)) {
        return { original: token, prefix: "", suffix: "", isWhitespace: true };
      }
      const clean = token.replace(/[^\p{Letter}\p{Number}]+$/gu, "");
      const punctuation = token.slice(clean.length);
      const prefixLength = Math.max(
        1,
        Math.floor(clean.length * emphasisRatio),
      );
      return {
        original: token,
        prefix: clean.slice(0, prefixLength),
        suffix: clean.slice(prefixLength) + punctuation,
        isWhitespace: false,
      };
    });
  }

  function sentencePieces(text) {
    return text.split(/(?<=\.)\s+/).filter(Boolean);
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            Input text
          </h2>
          <div class="flex flex-wrap gap-2">
            <button
              type="button"
              class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              on:click={() => (input = "")}
            >
              Clear
            </button>
            {#each sampleLibrary as sample}
              <button
                type="button"
                class="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                on:click={() => applySample(sample.text)}
              >
                {sample.label}
              </button>
            {/each}
          </div>
        </div>

        <textarea
          class="mt-3 min-h-[220px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={input}
          placeholder="Paste or type the text you want to highlight..."
        ></textarea>

        <div
          class="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]"
        >
          <label
            class="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Emphasis level ({fixation}%)
            <input
              type="range"
              min="20"
              max="60"
              step="5"
              class="mt-2 w-full accent-indigo-600"
              bind:value={fixation}
            />
          </label>
          <div class="flex items-end gap-2">
            {#each fixationPresets as preset}
              <button
                type="button"
                class={`w-full rounded-xl border ${fixation === preset.value ? "border-indigo-500 bg-indigo-50 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-200" : "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"} px-2 py-2 text-xs font-semibold`}
                on:click={() => (fixation = preset.value)}
              >
                {preset.label}
              </button>
            {/each}
          </div>
        </div>

        <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
          Lower fixation values bold fewer letters and favour rapid scanning,
          while higher levels improve clarity for dense passages.
        </p>

        <div class="mt-4 grid gap-3 sm:grid-cols-3">
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <p class="font-semibold text-slate-800 dark:text-slate-100">
              Words
            </p>
            <p>{wordCount}</p>
          </div>
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <p class="font-semibold text-slate-800 dark:text-slate-100">
              Characters
            </p>
            <p>{charCount}</p>
          </div>
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <p class="font-semibold text-slate-800 dark:text-slate-100">
              Read time
            </p>
            <p>{readingMinutes ? `${readingMinutes} min` : "�"}</p>
          </div>
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
          Display options
        </h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label
            class="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Theme
            <select
              bind:value={theme}
              class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            >
              {#each Object.keys(themeOptions) as option}
                <option value={option}>{themeOptions[option].label}</option>
              {/each}
            </select>
          </label>
          <label
            class="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Accent
            <select
              bind:value={accent}
              class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            >
              {#each Object.keys(accentOptions) as option}
                <option value={option}>{accentOptions[option].label}</option>
              {/each}
            </select>
          </label>
          <label
            class="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Text size
            <select
              bind:value={textSize}
              class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            >
              <option value="compact">Compact</option>
              <option value="normal">Comfort</option>
              <option value="reader">Reader</option>
            </select>
          </label>
          <label
            class="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Line height
            <select
              bind:value={lineHeight}
              class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            >
              <option value="snuggled">Snuggled</option>
              <option value="relaxed">Relaxed</option>
              <option value="spacious">Spacious</option>
            </select>
          </label>
        </div>

        <div class="mt-4 flex flex-wrap gap-2">
          {#each previewModes as mode}
            <button
              type="button"
              class={`rounded-full px-3 py-1 text-xs font-semibold transition ${previewMode === mode.value ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"}`}
              on:click={() => (previewMode = mode.value)}
            >
              {mode.label}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <div
      class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
          Preview
        </h2>
        <Copy text={htmlOutput} customClass="!relative !top-auto !right-auto" />
      </div>

      <div
        class={`rounded-2xl p-6 transition-all duration-300 ${themeConfig.wrapper}`}
      >
        <div
          class={`rounded-2xl px-5 py-6 ${themeConfig.panel} ${textSizeClass} ${lineHeightClass}`}
        >
          {#if previewMode === "paragraph"}
            <p>
              {#each words as token}
                {#if token.isWhitespace}
                  {token.original}
                {:else}
                  <span>
                    <span class={`font-semibold ${accentClass}`}
                      >{token.prefix}</span
                    >{token.suffix}
                  </span>
                {/if}
              {/each}
            </p>
          {:else}
            <ul class="list-disc space-y-2 pl-5">
              {#each sentencePieces(input) as sentence}
                <li>
                  {#each buildBionicWords(sentence, fixation / 100) as token}
                    {#if token.isWhitespace}
                      {token.original}
                    {:else}
                      <span>
                        <span class={`font-semibold ${accentClass}`}
                          >{token.prefix}</span
                        >{token.suffix}
                      </span>
                    {/if}
                  {/each}
                </li>
              {/each}
            </ul>
          {/if}
        </div>
      </div>

      <p class={`text-xs ${themeConfig.meta}`}>
        Copy buttons provide plain text and HTML snippets so you can drop the
        output into newsletters, blog posts, or documentation.
      </p>
    </div>
  </div>
</section>
