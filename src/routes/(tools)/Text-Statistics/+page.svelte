<script>
  import Copy from "$lib/Copy.svelte";

  let text = `Text statistics help you understand readability, variety, and rhythm. Paste or type any passage to explore counts, frequency tables, and estimated reading time.`;

  $: stats = analyse(text);
  $: statsSummary = stats
    ? JSON.stringify(
        {
          words: stats.wordCount,
          characters: stats.characters,
          letters: stats.letters,
          sentences: stats.sentenceCount,
          paragraphs: stats.paragraphCount,
          averageWordLength: Number(stats.avgWordLength.toFixed(2)),
          averageSentenceLength: Number(stats.avgSentenceLength.toFixed(2)),
          estimatedReadingMinutes: Number(stats.readingTime.toFixed(1)),
          uniqueWords: stats.uniqueWords,
          topWords: stats.topWords,
          wordLengthDistribution: stats.lengthDistribution,
        },
        null,
        2,
      )
    : "";

  function analyse(value) {
    const trimmed = value.replace(/\r/g, "").trim();
    if (!trimmed) {
      return null;
    }

    const words = trimmed
      .split(/\s+/)
      .map((word) => word.trim())
      .filter(Boolean);
    const characters = trimmed.replace(/\s/g, "");
    const letters = trimmed.replace(/[^A-Za-z]/g, "");
    const sentences = trimmed
      .split(/(?<=[.!?])\s+/)
      .map((item) => item.trim())
      .filter(Boolean);
    const paragraphs = trimmed
      .split(/\n+/)
      .filter((chunk) => chunk.trim().length > 0);

    const wordCount = words.length || 1;
    const sentenceCount = Math.max(1, sentences.length);
    const paragraphCount = Math.max(1, paragraphs.length);
    const avgWordLength =
      words.reduce((sum, word) => sum + word.replace(/[^\w]/g, "").length, 0) /
      wordCount;
    const avgSentenceLength = wordCount / sentenceCount;
    const readingTime = Math.max(0.5, wordCount / 200);

    const frequencies = new Map();
    const lengthBuckets = new Map();

    words.forEach((word) => {
      const cleaned = word.toLowerCase().replace(/[^a-z0-9']/g, "");
      if (!cleaned) {
        return;
      }
      frequencies.set(cleaned, (frequencies.get(cleaned) ?? 0) + 1);

      const length = cleaned.replace(/[^a-z0-9]/g, "").length;
      if (length > 0) {
        lengthBuckets.set(length, (lengthBuckets.get(length) ?? 0) + 1);
      }
    });

    const topWords = Array.from(frequencies.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    const lengthDistribution = Array.from(lengthBuckets.entries()).sort(
      (a, b) => a[0] - b[0],
    );

    const readingGrade =
      0.39 * (wordCount / sentenceCount) +
      11.8 * (countSyllables(words) / wordCount) -
      15.59;

    return {
      wordCount,
      characters: characters.length,
      letters: letters.length,
      sentenceCount,
      paragraphCount,
      avgWordLength,
      avgSentenceLength,
      readingTime,
      uniqueWords: frequencies.size,
      topWords,
      readingGrade,
      lengthDistribution,
    };
  }

  function countSyllables(words) {
    return words.reduce((total, word) => {
      const cleaned = word
        .toLowerCase()
        .trim()
        .replace(/[^a-z]/g, "");
      if (!cleaned) return total;
      if (cleaned.length <= 3) return total + 1;
      const groups = cleaned
        .replace(/(?:[^laeiouy]|ed|es|[^laeiouy]e)$/g, "")
        .replace(/^y/, "")
        .match(/[aeiouy]{1,2}/g);
      return total + (groups ? groups.length : 1);
    }, 0);
  }
</script>

<section class="space-y-6">
  <div
    class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-950"
  >
    <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
      Text to analyse
      <textarea
        class="mt-1 min-h-[260px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
        bind:value={text}
      ></textarea>
    </label>
    <p class="text-xs text-slate-500 dark:text-slate-400">
      Statistics refresh automatically. Reading grade uses the Flesch–Kincaid
      formula and assumes 200 words per minute for estimated reading time.
    </p>
  </div>

  {#if stats}
    <div
      class="grid grid-cols-1 lg:grid-cols-2 gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-950"
    >
      <div class="space-y-4 mb-4">
        <div class="grid gap-3 md:grid-cols-2">
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Words
            </p>
            <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {stats.wordCount}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Characters (no spaces)
            </p>
            <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {stats.characters}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Letters
            </p>
            <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {stats.letters}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Paragraphs
            </p>
            <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {stats.paragraphCount}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Average word length
            </p>
            <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {stats.avgWordLength.toFixed(2)} characters
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Average sentence length
            </p>
            <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {stats.avgSentenceLength.toFixed(2)} words
            </p>
          </div>
        </div>

        <div
          class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
        >
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Estimated reading time
          </p>
          <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {stats.readingTime.toFixed(1)} minutes
          </p>
        </div>

        <div
          class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Top words
          </p>
          {#if stats.topWords.length}
            <ul class="mt-2 grid gap-2 sm:grid-cols-2">
              {#each stats.topWords as [word, count]}
                <li
                  class="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                >
                  <span>{word}</span>
                  <span class="text-slate-400">× {count}</span>
                </li>
              {/each}
            </ul>
          {:else}
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
              No word frequency information available.
            </p>
          {/if}
        </div>

        <div
          class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Word-length distribution
          </p>
          {#if stats.lengthDistribution.length}
            <div
              class="mt-2 overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
            >
              <table
                class="min-w-full divide-y divide-slate-200 text-xs dark:divide-slate-700"
              >
                <thead
                  class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                >
                  <tr>
                    <th
                      class="px-3 py-2 text-left font-semibold uppercase tracking-wide"
                      >Length</th
                    >
                    <th
                      class="px-3 py-2 text-left font-semibold uppercase tracking-wide"
                      >Count</th
                    >
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                  {#each stats.lengthDistribution as [length, count]}
                    <tr>
                      <td class="px-3 py-2">{length} letters</td>
                      <td class="px-3 py-2">{count}</td>
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
              No measurable word lengths found.
            </p>
          {/if}
        </div>

        <div
          class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Flesch-Kincaid grade level
          </p>
          <p class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {stats.readingGrade.toFixed(1)}
          </p>
        </div>
      </div>

      <div
        class="relative rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      >
        <Copy text={statsSummary} customClass="top-3 right-3" />
        <p class="mb-2 font-semibold uppercase tracking-wide">Export summary</p>
        <pre
          class="whitespace-pre-wrap break-words text-[11px] leading-relaxed">{statsSummary}</pre>
      </div>
    </div>
  {:else}
    <div
      class="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
    >
      Type or paste text to generate statistics.
    </div>
  {/if}
</section>
