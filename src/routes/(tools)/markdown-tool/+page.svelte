<script>
  import Copy from "$lib/Copy.svelte";

  let markdown =
    "# Markdown Tool\n\nWrite *markdown* on the left and preview HTML on the right.\n\n- Support headings\n- Lists\n- **Bold** and *italic*\n- [Links](https://example.com)\n\n> Quotes and `inline code` are highlighted.";
  let html = "";

  $: html = renderMarkdown(markdown);

  function renderMarkdown(source) {
    const escapeHtml = (value) =>
      value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const lines = source.split(/\r?\n/);
    const blocks = [];
    let listBuffer = [];
    let codeBlock = null;

    const flushList = () => {
      if (!listBuffer.length) return;
      const items = listBuffer
        .map((line) => line.replace(/^[-*]\s+/, "").trim())
        .map((item) => `<li>${inlineFormat(item)}</li>`)
        .join("");
      blocks.push(`<ul>${items}</ul>`);
      listBuffer = [];
    };

    const inlineFormat = (text) => {
      return escapeHtml(text)
        .replace(/`([^`]+)`/g, "<code>$1</code>")
        .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
        .replace(/\*([^*]+)\*/g, "<em>$1</em>")
        .replace(
          /\[([^\]]+)\]\(([^)]+)\)/g,
          '<a href="$2" target="_blank" rel="noreferrer">$1</a>',
        );
    };

    lines.forEach((line) => {
      if (/^```/.test(line)) {
        if (codeBlock === null) {
          flushList();
          codeBlock = [];
        } else {
          blocks.push(
            `<pre><code>${escapeHtml(codeBlock.join("\n"))}</code></pre>`,
          );
          codeBlock = null;
        }
        return;
      }

      if (codeBlock !== null) {
        codeBlock.push(line);
        return;
      }

      if (/^\s*[-*]\s+/.test(line)) {
        listBuffer.push(line);
        return;
      }

      flushList();

      if (!line.trim()) {
        return;
      }

      const heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        const level = heading[1].length;
        blocks.push(
          `<h${level}>${inlineFormat(heading[2].trim())}</h${level}>`,
        );
        return;
      }

      const quote = line.match(/^>\s?(.*)$/);
      if (quote) {
        blocks.push(
          `<blockquote>${inlineFormat(quote[1].trim())}</blockquote>`,
        );
        return;
      }

      blocks.push(`<p>${inlineFormat(line)}</p>`);
    });

    flushList();
    if (codeBlock !== null) {
      blocks.push(
        `<pre><code>${escapeHtml(codeBlock.join("\n"))}</code></pre>`,
      );
    }

    return blocks.join("\n");
  }

  function downloadHtml() {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "markdown-preview.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-2">
    <div
      class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-950"
    >
      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Markdown input
        <textarea
          class="mt-1 min-h-[280px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={markdown}
        ></textarea>
      </label>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Supports headings (#), lists (-), bold (**), italics (*), links
        [text](url), block quotes, inline code, and fenced code blocks.
      </p>
    </div>

    <div
      class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-950"
    >
      <div class="flex flex-wrap items-center gap-3">
        <button
          class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          type="button"
          on:click={downloadHtml}
        >
          Download HTML
        </button>
      </div>
      <div
        class="relative rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
      >
        <Copy text={html} customClass="top-3 right-3" />
        <pre class="whitespace-pre-wrap break-words pt-6">
        {@html html}</pre>
      </div>
    </div>
  </div>
</section>
