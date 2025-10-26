<script>
  import Copy from "$lib/Copy.svelte";

  let input = `PROJECT CHARTER

- Introduce the product vision
- List milestones
- Assign responsibilities

Planning roadmap:
1. Confirm scope
2. Collect assets
3. Schedule kickoff`;

  $: html = convertToHtml(input);

  function convertToHtml(source) {
    const lines = source.replace(/\r/g, "").split("\n");
    const blocks = [];
    let unorderedItems = [];
    let orderedItems = [];

    const flushUnordered = () => {
      if (!unorderedItems.length) return;
      const items = unorderedItems
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
      blocks.push(`<ul>${items}</ul>`);
      unorderedItems = [];
    };

    const flushOrdered = () => {
      if (!orderedItems.length) return;
      const items = orderedItems
        .map((item) => `<li>${escapeHtml(item)}</li>`)
        .join("");
      blocks.push(`<ol>${items}</ol>`);
      orderedItems = [];
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        flushUnordered();
        flushOrdered();
        return;
      }

      const unorderedMatch = trimmed.match(/^[-*•]\s+(.*)$/);
      if (unorderedMatch) {
        flushOrdered();
        unorderedItems.push(unorderedMatch[1]);
        return;
      }

      const orderedMatch = trimmed.match(/^\d+[.)]\s+(.*)$/);
      if (orderedMatch) {
        flushUnordered();
        orderedItems.push(orderedMatch[1]);
        return;
      }

      flushUnordered();
      flushOrdered();

      if (isLikelyHeading(trimmed)) {
        blocks.push(`<h2>${escapeHtml(trimmed)}</h2>`);
        return;
      }

      if (trimmed.endsWith(":") && trimmed.length <= 80) {
        blocks.push(`<h3>${escapeHtml(trimmed.slice(0, -1).trim())}</h3>`);
        return;
      }

      blocks.push(`<p>${escapeHtml(trimmed)}</p>`);
    });

    flushUnordered();
    flushOrdered();

    return blocks.join("\n");
  }

  function isLikelyHeading(text) {
    if (text.length > 80) return false;
    if (text.includes(".")) return false;
    const letters = text.replace(/[^A-Za-z]/g, "").length;
    if (!letters) return false;
    const uppercaseLetters = text.replace(/[^A-Z]/g, "").length;
    return uppercaseLetters / letters > 0.6;
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function downloadHtml() {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "converted.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <div
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Paste text from Word or notes
        <textarea
          class="mt-1 min-h-[260px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={input}
        ></textarea>
      </label>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        The converter recognises paragraphs, headings (lines in all caps or
        ending with a colon), bullet lists starting with -, *, or •, and
        numbered lists using digits followed by "." or ")".
      </p>
    </div>

    <div
      class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div
        class="relative rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        <button
          class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          type="button"
          on:click={downloadHtml}
        >
          Download HTML
        </button>
        <Copy text={html} customClass="top-3 right-3" />
        <pre class="whitespace-pre-wrap break-words pt-8">{html}</pre>
      </div>
      <div
        class="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Preview
        </p>
        {@html html}
      </div>
    </div>
  </div>
</section>
