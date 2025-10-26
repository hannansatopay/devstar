<script>
  const defaultStopWords = [
    "a",
    "about",
    "above",
    "after",
    "again",
    "against",
    "all",
    "am",
    "an",
    "and",
    "any",
    "are",
    "as",
    "at",
    "be",
    "because",
    "been",
    "before",
    "being",
    "below",
    "between",
    "both",
    "but",
    "by",
    "could",
    "did",
    "do",
    "does",
    "doing",
    "down",
    "during",
    "each",
    "few",
    "for",
    "from",
    "further",
    "had",
    "has",
    "have",
    "having",
    "he",
    "her",
    "here",
    "hers",
    "herself",
    "him",
    "himself",
    "his",
    "how",
    "i",
    "if",
    "in",
    "into",
    "is",
    "it",
    "its",
    "itself",
    "let",
    "me",
    "more",
    "most",
    "my",
    "myself",
    "no",
    "nor",
    "not",
    "of",
    "off",
    "on",
    "once",
    "only",
    "or",
    "other",
    "our",
    "ours",
    "ourselves",
    "out",
    "over",
    "own",
    "same",
    "she",
    "should",
    "so",
    "some",
    "such",
    "than",
    "that",
    "the",
    "their",
    "theirs",
    "them",
    "themselves",
    "then",
    "there",
    "these",
    "they",
    "this",
    "those",
    "through",
    "to",
    "too",
    "under",
    "until",
    "up",
    "very",
    "was",
    "we",
    "were",
    "what",
    "when",
    "where",
    "which",
    "while",
    "who",
    "whom",
    "why",
    "will",
    "with",
    "you",
    "your",
    "yours",
    "yourself",
    "yourselves",
  ];

  const defaultText = `SEO friendly content starts with clear focus. Use this checker to discover the keywords that appear most often. Rewrite sentences to keep copy natural.`;

  let textInput = defaultText;
  let customStopWords = "";
  let includeDefaultStops = true;
  let topLimit = 20;
  let minWordLength = 3;
  let includeNumbers = false;
  let results = [];
  let summary = null;

  analyze();

  function analyze() {
    if (!textInput.trim()) {
      results = [];
      summary = null;
      return;
    }

    const stopSet = buildStopSet(includeDefaultStops, customStopWords);
    const tokens = tokenize(textInput, stopSet, {
      minWordLength,
      includeNumbers,
    });
    const totalWords = tokens.length;

    const frequency = new Map();
    tokens.forEach((token) => {
      frequency.set(token, (frequency.get(token) ?? 0) + 1);
    });

    const sorted = Array.from(frequency.entries())
      .map(([word, count]) => ({
        word,
        count,
        density: totalWords > 0 ? (count / totalWords) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
      .slice(0, topLimit);

    results = sorted;
    summary = {
      totalWords,
      uniqueWords: frequency.size,
      stopWordsIgnored: buildStopSet(includeDefaultStops, customStopWords, true)
        .size,
    };
  }

  function buildStopSet(includeDefault, custom, countOnly = false) {
    const set = new Set();
    if (includeDefault) {
      defaultStopWords.forEach((word) => set.add(word));
    }
    if (custom) {
      custom
        .split(/[\s,]+/)
        .map((item) => item.trim().toLowerCase())
        .filter(Boolean)
        .forEach((word) => set.add(word));
    }
    if (countOnly) {
      return set;
    }
    return set;
  }

  function tokenize(text, stopSet, options) {
    const cleansed = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(Boolean)
      .filter((word) => {
        if (!options.includeNumbers && /^\d+$/.test(word)) {
          return false;
        }
        if (word.length < options.minWordLength) {
          return false;
        }
        return !stopSet.has(word);
      });
    return cleansed;
  }

  function exportCSV() {
    if (!results.length) {
      return;
    }
    const header = "Keyword,Count,Density";
    const rows = results.map(
      (row) => `${row.word},${row.count},${row.density.toFixed(2)}%`,
    );
    const csv = [header, ...rows].join("\n");
    downloadFile(csv, "keyword-density.csv", "text/csv");
  }

  function downloadFile(content, filename, mime) {
    const blob = new Blob([content], { type: mime });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
    <div
      class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="flex flex-col gap-1">
        <label
          class="text-sm font-semibold text-slate-700 dark:text-slate-200"
          for="text-input">Content</label
        >
        <textarea
          id="text-input"
          class="min-h-[220px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={textInput}
          on:input={analyze}
          placeholder="Paste or type the text you want to analyze"
        ></textarea>
      </div>

      <div class="mt-4 grid gap-4 md:grid-cols-2">
        <label
          class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <input
            type="checkbox"
            bind:checked={includeDefaultStops}
            on:change={analyze}
            class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Include common stop words
        </label>
        <label
          class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <input
            type="checkbox"
            bind:checked={includeNumbers}
            on:change={analyze}
            class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Keep numeric tokens
        </label>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Minimum word length
          <input
            type="number"
            min="1"
            class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={minWordLength}
            on:input={analyze}
          />
        </label>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Show top keywords
          <input
            type="number"
            min="1"
            max="100"
            class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={topLimit}
            on:input={analyze}
          />
        </label>
      </div>
    </div>

    <div class="flex flex-col gap-4">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
      >
        <label
          class="text-sm font-semibold text-slate-700 dark:text-slate-200"
          for="custom-stop"
        >
          Additional stop words
        </label>
        <textarea
          id="custom-stop"
          class="mt-2 min-h-[120px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={customStopWords}
          on:input={analyze}
          placeholder="Comma or space separated words to ignore"
        ></textarea>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Stop words help remove filler terms so keyword density focuses on what
          matters.
        </p>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
      >
        <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Summary
        </h3>
        {#if summary}
          <dl class="mt-3 space-y-2 text-sm">
            <div class="flex items-center justify-between">
              <dt class="text-slate-500 dark:text-slate-400">Total words</dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {summary.totalWords}
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-500 dark:text-slate-400">Unique words</dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {summary.uniqueWords}
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-500 dark:text-slate-400">
                Stop words ignored
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {summary.stopWordsIgnored}
              </dd>
            </div>
          </dl>
        {:else}
          <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Add some content to see word metrics.
          </p>
        {/if}
        <button
          class="mt-4 w-full rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
          on:click={exportCSV}
          disabled={!results.length}
        >
          Download CSV
        </button>
      </div>
    </div>
  </div>

  <div
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
  >
    <h2 class="mb-4 text-lg font-semibold text-slate-900 dark:text-slate-100">
      Top keywords
    </h2>
    {#if results.length}
      <div class="overflow-x-auto">
        <table
          class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700"
        >
          <thead class="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
                >Keyword</th
              >
              <th
                class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
                >Count</th
              >
              <th
                class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
                >Density</th
              >
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            {#each results as row}
              <tr
                class="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900/70 dark:even:bg-slate-900"
              >
                <td
                  class="px-4 py-3 font-medium text-slate-700 dark:text-slate-200"
                  >{row.word}</td
                >
                <td
                  class="px-4 py-3 text-right font-mono text-indigo-700 dark:text-indigo-300"
                  >{row.count}</td
                >
                <td
                  class="px-4 py-3 text-right font-mono text-indigo-700 dark:text-indigo-300"
                  >{row.density.toFixed(2)}%</td
                >
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <p class="text-sm text-slate-500 dark:text-slate-400">
        No keywords to show. Adjust your filters or add more content.
      </p>
    {/if}
  </div>
</section>
