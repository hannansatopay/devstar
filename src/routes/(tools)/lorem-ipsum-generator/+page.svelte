<script>
  import Copy from "$lib/Copy.svelte";

  const sourceWords =
    "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua quis ipsum suspendisse ultrices gravida risus commodo viverra maecenas accumsan lacus vel facilisis".split(
      " ",
    );

  const presets = [
    { label: "Paragraphs", value: "paragraphs" },
    { label: "Sentences", value: "sentences" },
    { label: "Words", value: "words" },
  ];

  let generationMode = presets[0].value;
  let quantity = 3;
  let includeTitle = false;
  let includeHtml = false;
  let generated = "";

  $: generated = buildLorem({
    mode: generationMode,
    quantity,
    includeTitle,
    includeHtml,
  });

  function buildLorem({ mode, quantity, includeTitle, includeHtml }) {
    const count = Math.max(1, Math.min(50, Math.floor(quantity)));

    const builder =
      mode === "words"
        ? generateWords(count)
        : mode === "sentences"
          ? generateSentences(count)
          : generateParagraphs(count);

    const body = includeHtml
      ? builder.map((item) => `<p>${item}</p>`).join("\n")
      : builder.join("\n\n");
    if (!includeTitle) {
      return body;
    }

    const title = includeHtml ? "<h2>Lorem Ipsum</h2>" : "Lorem Ipsum";
    return includeHtml ? `${title}\n${body}` : `${title}\n\n${body}`;
  }

  function generateWords(count) {
    const words = [];
    for (let index = 0; index < count; index += 1) {
      const next = sourceWords[index % sourceWords.length];
      words.push(next);
    }
    return [sentenceCase(words.join(" "))];
  }

  function generateSentences(count) {
    const sentences = [];
    let pointer = 0;
    for (let index = 0; index < count; index += 1) {
      const length = 8 + ((index * 3) % 8);
      const words = [];
      for (let word = 0; word < length; word += 1) {
        words.push(sourceWords[(pointer + word) % sourceWords.length]);
      }
      pointer += length;
      sentences.push(sentenceCase(words.join(" ")) + ".");
    }
    return sentences;
  }

  function generateParagraphs(count) {
    return Array.from({ length: count }, (_, index) => {
      const sentences = generateSentences(3 + (index % 3));
      return sentences.join(" ");
    });
  }

  function sentenceCase(text) {
    if (!text) {
      return text;
    }
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  function download(format) {
    const type =
      format === "html"
        ? "text/html;charset=utf-8"
        : "text/plain;charset=utf-8";
    const blob = new Blob([generated], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = format === "html" ? "lorem-ipsum.html" : "lorem-ipsum.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div
    class="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
  >
    <div class="space-y-5">
      <div class="grid gap-3 md:grid-cols-2">
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Generate
          <select
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={generationMode}
          >
            {#each presets as preset}
              <option value={preset.value}>{preset.label}</option>
            {/each}
          </select>
        </label>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Quantity
          <input
            type="number"
            min="1"
            max="50"
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={quantity}
          />
        </label>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <label
          class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            bind:checked={includeTitle}
          />
          Include heading
        </label>
        <label
          class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            bind:checked={includeHtml}
          />
          HTML markup
        </label>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Choose between paragraphs, sentences, or direct word output to fit
        whichever placeholder text you need.
      </p>

      <div class="flex flex-wrap items-center gap-3">
        <button
          class="inline-flex items-center rounded-full border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
          on:click={() => download("txt")}
        >
          Download .txt
        </button>
        <button
          class="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
          on:click={() => download("html")}
        >
          Download .html
        </button>
      </div>
    </div>

    <div class="relative">
      <Copy text={generated} customClass="top-3 right-3" />
      <pre
        class="min-h-[280px] whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 pt-14 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">{generated}</pre>
    </div>
  </div>
</section>
