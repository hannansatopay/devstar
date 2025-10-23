<script>
  import Copy from "$lib/Copy.svelte";

  let text =
    "Clear writing saves time. Paste any passage here to evaluate its readability and see which audiences will find it effortless-or demanding-to grasp.";
  let wordsPerMinute = 200;

  $: report = analyse(text, wordsPerMinute);
  $: exportSummary = report
    ? JSON.stringify(
        {
          words: report.wordCount,
          sentences: report.sentenceCount,
          syllables: report.syllables,
          complexWords: report.complexWords,
          fleschReadingEase: Number(report.fleschReadingEase.toFixed(1)),
          fleschKincaidGrade: Number(report.fleschKincaid.toFixed(1)),
          gunningFog: Number(report.gunningFog.toFixed(1)),
          smog: report.smog ? Number(report.smog.toFixed(1)) : null,
          colemanLiau: Number(report.colemanLiau.toFixed(1)),
          automatedReadability: Number(report.automatedReadability.toFixed(1)),
          readingTimeMinutes: Number(report.readingTime.toFixed(2)),
        },
        null,
        2,
      )
    : "";

  $: metricRows = report
    ? [
        {
          label: "Flesch-Kincaid grade",
          score: report.fleschKincaid.toFixed(1),
          guidance: `Best for ${report.gradeBand.toLowerCase()} readers.`,
        },
        {
          label: "Gunning Fog index",
          score: report.gunningFog.toFixed(1),
          guidance: "Aim for 8-10 to reach a broad audience.",
        },
        {
          label: "SMOG index",
          score: report.smog ? report.smog.toFixed(1) : "N/A",
          guidance: "Needs at least three sentences for accuracy.",
        },
        {
          label: "Coleman-Liau",
          score: report.colemanLiau.toFixed(1),
          guidance: "Focuses on characters per word.",
        },
        {
          label: "Automated readability index",
          score: report.automatedReadability.toFixed(1),
          guidance: "Helpful for technical documentation.",
        },
      ]
    : [];

  $: statCards = report
    ? [
        { label: "Words", value: report.wordCount },
        { label: "Sentences", value: report.sentenceCount },
        { label: "Syllables", value: report.syllables },
        { label: "Complex words", value: report.complexWords },
        {
          label: "Avg. words / sentence",
          value: report.avgWordsPerSentence.toFixed(2),
        },
        {
          label: "Avg. syllables / word",
          value: report.avgSyllablesPerWord.toFixed(2),
        },
        {
          label: "Reading time (minutes)",
          value: report.readingTime.toFixed(1),
        },
      ]
    : [];

  function analyse(value, wpm) {
    const cleaned = value.replace(/\r/g, "").trim();
    if (!cleaned) return null;

    let sentences = cleaned
      .split(/(?<=[.!?])\s+/)
      .map((segment) => segment.trim())
      .filter(Boolean);

    if (sentences.length <= 1 && /\n/.test(cleaned)) {
      const newlineSegments = cleaned
        .split(/\n+/)
        .map((segment) => segment.trim())
        .filter(Boolean);
      if (newlineSegments.length > sentences.length) {
        sentences = newlineSegments;
      }
    }

    const words = cleaned
      .split(/\s+/)
      .map((word) => word.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9]+$/g, ""))
      .filter(Boolean);

    if (!sentences.length || !words.length) {
      return null;
    }

    const characters = cleaned.replace(/\s/g, "");
    const letters = cleaned.replace(/[^A-Za-z]/g, "");

    const syllableCounts = words.map((word) =>
      Math.max(1, countSyllables(word)),
    );
    const syllables = syllableCounts.reduce((sum, item) => sum + item, 0);

    const complexWords = words.reduce((total, word, index) => {
      const syllablesForWord = syllableCounts[index];
      const isProperNoun = /^[A-Z][a-z]/.test(word);
      return total + (syllablesForWord >= 3 && !isProperNoun ? 1 : 0);
    }, 0);

    const wordCount = words.length;
    const sentenceCount = sentences.length;
    const avgWordsPerSentence = wordCount / sentenceCount;
    const avgSyllablesPerWord = syllables / wordCount;

    const fleschReadingEase =
      206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;
    const fleschKincaid =
      0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59;
    const gunningFog =
      0.4 * (avgWordsPerSentence + (100 * complexWords) / wordCount);
    const smog =
      sentenceCount >= 3
        ? 1.043 * Math.sqrt((complexWords * 30) / sentenceCount) + 3.1291
        : null;
    const colemanLiau =
      0.0588 * ((letters.length / wordCount) * 100) -
      0.296 * ((sentenceCount / wordCount) * 100) -
      15.8;
    const automatedReadability =
      4.71 * (characters.length / wordCount) +
      0.5 * avgWordsPerSentence -
      21.43;

    const readingTime = Math.max(0.5, wordCount / wpm);
    const longSentences = sentences
      .map((sentence) => ({
        sentence,
        wordCount: sentence.split(/\s+/).filter(Boolean).length,
      }))
      .filter((entry) => entry.wordCount >= 25)
      .sort((a, b) => b.wordCount - a.wordCount)
      .slice(0, 3);

    return {
      wordCount,
      sentenceCount,
      syllables,
      complexWords,
      characters: characters.length,
      letters: letters.length,
      fleschReadingEase,
      fleschKincaid,
      gunningFog,
      smog,
      colemanLiau,
      automatedReadability,
      avgWordsPerSentence,
      avgSyllablesPerWord,
      readingTime,
      classification: classifyFlesch(fleschReadingEase),
      gradeBand: gradeBandFromScore(fleschKincaid),
      longSentences,
    };
  }

  function countSyllables(word) {
    const cleaned = word
      .toLowerCase()
      .trim()
      .replace(/[^a-z]/g, "");
    if (!cleaned) return 0;
    if (cleaned.length <= 3) return 1;
    const matches = cleaned
      .replace(/(?:[^laeiouy]|ed|es|[^laeiouy]e)$/g, "")
      .replace(/^y/, "")
      .match(/[aeiouy]{1,2}/g);
    return matches ? matches.length : 1;
  }

  function classifyFlesch(score) {
    if (score >= 90)
      return {
        label: "Very Easy",
        description: "Easily understood by an average 5th-grade student.",
      };
    if (score >= 80)
      return {
        label: "Easy",
        description: "Conversational English suitable for middle school.",
      };
    if (score >= 70)
      return {
        label: "Fairly Easy",
        description: "Plain English, ideal for a 7th-grade audience.",
      };
    if (score >= 60)
      return {
        label: "Standard",
        description:
          "Comfortable for teens and adults; typical business writing.",
      };
    if (score >= 50)
      return {
        label: "Fairly Difficult",
        description:
          "Complex sentences - best for readers with some background knowledge.",
      };
    if (score >= 30)
      return {
        label: "Difficult",
        description: "Academic text, legal writing, or dense reports.",
      };
    return {
      label: "Very Difficult",
      description:
        "Professional or scholarly writing demanding advanced comprehension.",
    };
  }

  function gradeBandFromScore(score) {
    if (score <= 0) return "Kindergarten";
    if (score <= 5) return "Elementary";
    if (score <= 8) return "Middle school";
    if (score <= 12) return "High school";
    if (score <= 16) return "College";
    return "Postgraduate";
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="space-y-5 mb-6">
      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Text to evaluate
        <textarea
          class="mt-1 min-h-[180px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={text}
        ></textarea>
      </label>
      <div
        class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <div class="flex items-center justify-between">
          <span class="font-semibold">Reading speed</span>
          <span class="text-xs text-slate-500 dark:text-slate-400"
            >{wordsPerMinute} wpm</span
          >
        </div>
        <input
          class="mt-3 w-full accent-indigo-500"
          type="range"
          min="120"
          max="300"
          step="10"
          bind:value={wordsPerMinute}
        />
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Adjust the slider to match your audience. Public-facing content often
          targets 180-200 words per minute.
        </p>
      </div>
    </div>

    <div class="grid gap-6 lg:grid-cols-2">
      <div class="space-y-5">
        <div
          class="rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900 shadow-sm dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-100"
        >
          <p
            class="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-300"
          >
            Flesch reading ease
          </p>
          <div class="mt-2 flex items-baseline justify-between gap-3">
            <p class="text-4xl font-semibold">
              {report ? report.fleschReadingEase.toFixed(1) : "N/A"}
            </p>
            <span
              class="rounded-full bg-white px-3 py-1 text-xs font-semibold text-emerald-600 shadow dark:bg-emerald-900/60 dark:text-emerald-200"
            >
              {report ? report.gradeBand : "Awaiting input"}
            </span>
          </div>
          <p class="mt-3 text-base font-semibold">
            {report ? report.classification.label : "No passage analysed yet"}
          </p>
          <p class="mt-1 text-xs text-emerald-700 dark:text-emerald-200">
            {report
              ? report.classification.description
              : "Paste or type a passage above to generate readability insights in real time."}
          </p>
        </div>

        {#if report}
          <div class="grid gap-3 md:grid-cols-2">
            {#each statCards as stat}
              <div
                class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
              >
                <p>{stat.label}</p>
                <p
                  class="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100"
                >
                  {stat.value}
                </p>
              </div>
            {/each}
          </div>
        {:else}
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            Add at least one full sentence to see scorecards, grade levels, and
            editing suggestions.
          </div>
        {/if}
      </div>

      <div class="space-y-5">
        <div
          class="overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <table
            class="min-w-full divide-y divide-slate-200 dark:divide-slate-800"
          >
            <thead
              class="bg-slate-100 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"
            >
              <tr>
                <th class="px-4 py-3 text-left font-semibold">Metric</th>
                <th class="px-4 py-3 text-left font-semibold">Score</th>
                <th class="px-4 py-3 text-left font-semibold">Guidance</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              {#if report}
                {#each metricRows as row}
                  <tr>
                    <td class="px-4 py-3">{row.label}</td>
                    <td class="px-4 py-3">{row.score}</td>
                    <td class="px-4 py-3">{row.guidance}</td>
                  </tr>
                {/each}
              {:else}
                <tr>
                  <td class="px-4 py-3" colspan="3"
                    >Scores will appear once your passage includes analysable
                    sentences.</td
                  >
                </tr>
              {/if}
            </tbody>
          </table>
        </div>

        {#if report}
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Potential edits
            </p>
            {#if report.longSentences.length}
              <ul class="mt-2 space-y-2">
                {#each report.longSentences as item}
                  <li
                    class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
                  >
                    <span
                      class="mb-1 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {item.wordCount} words
                    </span>
                    <p>{item.sentence}</p>
                  </li>
                {/each}
              </ul>
            {:else}
              <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
                No sentences exceed 25 words. Great pacing!
              </p>
            {/if}
          </div>
        {/if}

        <div
          class="relative rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <Copy text={exportSummary} customClass="top-3 right-3" />
          <p class="mb-2 font-semibold uppercase tracking-wide">
            Export metrics
          </p>
          <pre
            class="whitespace-pre-wrap break-words text-[11px] leading-relaxed">
{report
              ? exportSummary
              : "// Metrics will populate once the passage has analysable sentences."}</pre>
        </div>
      </div>
    </div>
  </div>
</section>
