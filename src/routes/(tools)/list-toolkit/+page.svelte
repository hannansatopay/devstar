<script>
  import Copy from "$lib/Copy.svelte";

  let input = "apple\nOrange\nbanana\napple\npear";
  let trimItems = true;
  let removeEmpty = true;
  let unique = true;
  let caseSensitive = false;
  let ordering = "none";
  let prefix = "";
  let suffix = "";
  let numberingStyle = "none";
  let shuffleToken = 0;

  const numberingOptions = [
    { label: "1.", value: "1." },
    { label: "1)", value: "1)" },
    { label: "1 -", value: "1 -" },
  ];

  const orderingOptions = [
    { label: "Keep original order", value: "none" },
    { label: "Sort ascending (A to Z)", value: "asc" },
    { label: "Sort descending (Z to A)", value: "desc" },
    { label: "Random shuffle", value: "shuffle" },
  ];

  $: items = buildList(
    input,
    trimItems,
    removeEmpty,
    unique,
    caseSensitive,
    ordering,
    prefix,
    suffix,
    numberingStyle,
    shuffleToken,
  );
  $: result = items.join("\n");

  function buildList(
    source,
    shouldTrim,
    shouldRemoveEmpty,
    enforceUnique,
    isCaseSensitive,
    orderPreference,
    itemPrefix,
    itemSuffix,
    numberingChoice,
    shuffleSeed,
  ) {
    let lines = source.split(/\r?\n/);
    if (shouldTrim) {
      lines = lines.map((line) => line.trim());
    }
    if (shouldRemoveEmpty) {
      lines = lines.filter((line) => line.length > 0);
    }

    if (enforceUnique) {
      const seen = new Set();
      lines = lines.filter((item) => {
        const key = isCaseSensitive ? item : item.toLowerCase();
        if (seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
    }

    if (orderPreference === "asc") {
      lines = [...lines].sort((a, b) => a.localeCompare(b));
    } else if (orderPreference === "desc") {
      lines = [...lines].sort((a, b) => b.localeCompare(a));
    } else if (orderPreference === "shuffle") {
      lines = shuffle([...lines], shuffleSeed);
    }

    return lines.map((item, index) => {
      const numberPrefix =
        numberingChoice && numberingChoice.length && numberingChoice !== "none"
          ? `${formatNumber(index + 1, numberingChoice)} `
          : "";
      return `${numberPrefix}${itemPrefix}${item}${itemSuffix}`;
    });
  }

  function formatNumber(position, style) {
    return style.replace("1", position.toString());
  }

  function shuffle(source, seed) {
    if (!source.length) {
      return source;
    }
    const random = mulberry32(Math.floor(seed * 1_000_000) || Date.now());
    for (let index = source.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(random() * (index + 1));
      [source[index], source[swapIndex]] = [source[swapIndex], source[index]];
    }
    return source;
  }

  function mulberry32(seed) {
    return function () {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffleNow() {
    ordering = "shuffle";
    shuffleToken = Math.random();
  }

  function copyInputToOutput() {
    ordering = "none";
    unique = false;
    trimItems = false;
    removeEmpty = false;
    prefix = "";
    suffix = "";
    numberingStyle = "none";
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
    <div
      class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <textarea
        class="min-h-[220px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
        bind:value={input}
        placeholder="Enter one item per line..."
      ></textarea>

      <div class="grid gap-3 md:grid-cols-2">
        <label
          class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            bind:checked={trimItems}
          />
          Trim whitespace
        </label>
        <label
          class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            bind:checked={removeEmpty}
          />
          Remove empty lines
        </label>
        <label
          class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            bind:checked={unique}
          />
          Remove duplicates
        </label>
        <label
          class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            bind:checked={caseSensitive}
          />
          Case-sensitive uniqueness
        </label>
      </div>

      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Ordering
        <select
          class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={ordering}
        >
          {#each orderingOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <div class="grid gap-3 md:grid-cols-2">
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Prefix
          <input
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={prefix}
          />
        </label>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Suffix
          <input
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={suffix}
          />
        </label>
      </div>

      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Numbering style
        <select
          class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={numberingStyle}
        >
          <option value="none">None</option>
          {#each numberingOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <div class="flex flex-wrap gap-3">
        <button
          class="inline-flex items-center rounded-full border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
          type="button"
          on:click={shuffleNow}
        >
          Shuffle current list
        </button>
        <button
          class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          type="button"
          on:click={copyInputToOutput}
        >
          Reset transforms
        </button>
      </div>
    </div>

    <div
      class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Transformed list
        </h2>
      </div>
      <div class="relative">
        <pre
          class="min-h-[260px] whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">{result}</pre>
        <Copy text={result} customClass="top-3 right-3" />
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Lines are always separated by newlines in the output. Copy the text or
        paste it into spreadsheets, emails, or notes.
      </p>
    </div>
  </div>
</section>
