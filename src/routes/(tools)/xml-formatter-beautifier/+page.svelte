<script>
  import { onMount } from "svelte";

  let sourceXml = `<note>
  <to>User</to>
  <from>Codex</from>
  <heading>XML Formatter</heading>
  <body>Paste XML to prettify or minify it instantly.</body>
</note>`;
  let formattedXml = "";
  let minifiedXml = "";
  let errorMessage = "";
  let indentSize = 2;
  let showAttributesInline = true;

  onMount(() => {
    formatXml();
  });

  function formatXml() {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(sourceXml, "application/xml");
      const parseError = xmlDoc.getElementsByTagName("parsererror")[0];
      if (parseError) {
        throw new Error(parseError.textContent || "Invalid XML");
      }
      const prettified = prettify(xmlDoc, indentSize, showAttributesInline);
      formattedXml = prettified;
      minifiedXml = prettified.replace(/>\s+</g, "><").trim();
      errorMessage = "";
    } catch (error) {
      errorMessage = error.message;
      formattedXml = "";
      minifiedXml = "";
    }
  }

  function prettify(xmlDocument, indent, attributesInline) {
    const serializer = new XMLSerializer();
    const xmlString = serializer.serializeToString(xmlDocument);
    const segments = xmlString
      .replace(/>\s+</g, "><")
      .replace(/\r?\n/g, "")
      .split(/</)
      .filter(Boolean)
      .map((segment) => "<" + segment);

    const spaces = (level) => " ".repeat(level * indent);
    let level = 0;
    const lines = [];

    segments.forEach((segment) => {
      if (segment.match(/^<\//)) {
        level = Math.max(level - 1, 0);
      }

      let line = segment;
      if (!attributesInline) {
        line = line.replace(/\s+(\w+=")/g, "\n$1");
      }

      lines.push(spaces(level) + line);

      if (segment.match(/^<[^!?/][^>]*[^/]>/)) {
        level += 1;
      }
    });

    return lines.join("\n");
  }

  function copy(value) {
    navigator.clipboard?.writeText(value).catch(() => {
      /* ignore */
    });
  }

  function download(value, name) {
    const blob = new Blob([value], { type: "application/xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
    <div
      class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80 space-y-4"
    >
      <label
        class="flex flex-col gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        Source XML
        <textarea
          class="min-h-[220px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={sourceXml}
          on:input={formatXml}
          placeholder="Paste XML here"
        ></textarea>
      </label>

      <div class="grid gap-4 md:grid-cols-2">
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Indent size
          <input
            type="number"
            min="1"
            max="8"
            class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={indentSize}
            on:input={formatXml}
          />
        </label>
        <label
          class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <input
            type="checkbox"
            bind:checked={showAttributesInline}
            on:change={formatXml}
            class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Keep attributes inline
        </label>
      </div>

      {#if errorMessage}
        <p
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
        >
          {errorMessage}
        </p>
      {/if}
    </div>

    <div class="space-y-4">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80 space-y-3"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Formatted XML
          </h3>
          <div class="flex gap-2">
            <button
              class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              on:click={() => copy(formattedXml)}
              disabled={!formattedXml}
            >
              Copy
            </button>
            <button
              class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              on:click={() => download(formattedXml, "formatted.xml")}
              disabled={!formattedXml}
            >
              Download
            </button>
          </div>
        </div>
        <pre
          class="max-h-72 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-5 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{formattedXml ||
            "<!-- Valid XML preview appears here -->"}</pre>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80 space-y-3"
      >
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Minified XML
          </h3>
          <div class="flex gap-2">
            <button
              class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              on:click={() => copy(minifiedXml)}
              disabled={!minifiedXml}
            >
              Copy
            </button>
            <button
              class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              on:click={() => download(minifiedXml, "minified.xml")}
              disabled={!minifiedXml}
            >
              Download
            </button>
          </div>
        </div>
        <pre
          class="max-h-36 overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-4 font-mono text-xs leading-5 text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{minifiedXml ||
            "<!-- Minified XML preview appears here -->"}</pre>
      </div>
    </div>
  </div>
</section>
