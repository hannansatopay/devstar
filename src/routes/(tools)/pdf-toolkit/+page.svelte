<script lang="ts">
  import { onDestroy } from "svelte";
  import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

  type CompressionLevel = "none" | "standard" | "strong";

  type SourceDocument = {
    id: string;
    name: string;
    bytes: Uint8Array;
    pageCount: number;
  };

  type PageConfig = {
    id: string;
    sourceId: string;
    sourceName: string;
    originalIndex: number;
    width: number;
    height: number;
    rotation: number;
    include: boolean;
    initialOrder: number;
  };

  let sources: SourceDocument[] = [];
  let pages: PageConfig[] = [];
  let compressionLevel: CompressionLevel = "standard";
  let headerText = "";
  let addPageNumbers = false;
  let statusMessage = "";
  let processing = false;
  let downloadUrl = "";
  let downloadName = "";
  let rangeInput = "";
  let rangeUrl = "";
  let rangeName = "";
  let extractingRange = false;

  let orderCounter = 0;

  $: selectedPages = pages.filter((page) => page.include);
  $: projectTitle =
    sources.length === 1
      ? baseName(sources[0].name)
      : sources.length > 1
        ? `${sources.length} PDFs merged`
        : "pdf-toolkit";

  function revokeUrl(url: string) {
    if (url) {
      URL.revokeObjectURL(url);
    }
  }

  onDestroy(() => {
    revokeUrl(downloadUrl);
    revokeUrl(rangeUrl);
  });

  function baseName(fileName: string) {
    const match = fileName.match(/^(.*?)(\.[^.]*)?$/);
    return match?.[1] || "document";
  }

  function formatSize(width: number, height: number) {
    const widthInches = width / 72;
    const heightInches = height / 72;
    return `${widthInches.toFixed(2)}" × ${heightInches.toFixed(2)}"`;
  }

  function createPageId() {
    return `page-${crypto.randomUUID()}`;
  }

  async function handleReplace(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    target.value = "";
    if (!files.length) return;
    await loadFiles(files, true);
  }

  async function handleAppend(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    target.value = "";
    if (!files.length) return;
    await loadFiles(files, false);
  }

  async function loadFiles(files: File[], replace: boolean) {
    const pdfFiles = files.filter(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf"),
    );
    if (!pdfFiles.length) {
      statusMessage = "Only PDF files are supported.";
      return;
    }
    if (replace) {
      revokeUrl(downloadUrl);
      revokeUrl(rangeUrl);
      sources = [];
      pages = [];
      statusMessage = "";
    }
    for (const file of pdfFiles) {
      await appendSource(file);
    }
    statusMessage = replace
      ? `Loaded ${pdfFiles.length} PDF${pdfFiles.length > 1 ? "s" : ""}.`
      : `Added ${pdfFiles.length} PDF${pdfFiles.length > 1 ? "s" : ""} to the project.`;
  }

  async function appendSource(file: File) {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const doc = await PDFDocument.load(bytes);
    const sourceId = crypto.randomUUID();
    sources = [
      ...sources,
      {
        id: sourceId,
        name: file.name,
        bytes,
        pageCount: doc.getPageCount(),
      },
    ];

    const newPages = doc.getPages().map((page, index) => {
      const { width, height } = page.getSize();
      const rotation = page.getRotation().angle;
      orderCounter += 1;
      return {
        id: createPageId(),
        sourceId,
        sourceName: file.name,
        originalIndex: index,
        width,
        height,
        rotation,
        include: true,
        initialOrder: orderCounter,
      };
    });
    pages = [...pages, ...newPages];
  }

  function movePage(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= pages.length) return;
    const reordered = [...pages];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    pages = reordered;
  }

  function toggleInclude(id: string) {
    pages = pages.map((page) =>
      page.id === id ? { ...page, include: !page.include } : page,
    );
  }

  function rotatePage(id: string, amount: number) {
    pages = pages.map((page) =>
      page.id === id
        ? { ...page, rotation: (((page.rotation + amount) % 360) + 360) % 360 }
        : page,
    );
  }

  function resetProject() {
    pages = pages
      .map((page) => ({
        ...page,
        include: true,
        rotation: 0,
      }))
      .sort((a, b) => a.initialOrder - b.initialOrder);
    statusMessage = "Restored original order and rotation.";
    revokeUrl(downloadUrl);
    revokeUrl(rangeUrl);
  }

  function parseRange(expression: string, max: number) {
    const cleaned = expression.replace(/\s+/g, "");
    if (!cleaned) return [];
    const segments = cleaned.split(",");
    const result = new Set<number>();
    for (const segment of segments) {
      const [startStr, endStr] = segment.split("-");
      const start = Number.parseInt(startStr, 10);
      if (Number.isNaN(start) || start < 1 || start > max) continue;
      if (!endStr) {
        result.add(start - 1);
      } else {
        const end = Number.parseInt(endStr, 10);
        if (Number.isNaN(end) || end < start) continue;
        for (let value = start; value <= Math.min(end, max); value += 1) {
          result.add(value - 1);
        }
      }
    }
    return Array.from(result).sort((a, b) => a - b);
  }

  function saveOptions(level: CompressionLevel) {
    if (level === "none") {
      return { useObjectStreams: false };
    }
    if (level === "strong") {
      return { useObjectStreams: true, addDefaultPage: false };
    }
    return { useObjectStreams: true };
  }

  async function assemblePdf(pageList: PageConfig[], nameHint: string) {
    if (!pageList.length) {
      throw new Error("No pages selected for export.");
    }
    const targetDoc = await PDFDocument.create();
    const sourceCache = new Map<string, PDFDocument>();
    for (const config of pageList) {
      const source = sources.find((entry) => entry.id === config.sourceId);
      if (!source) {
        throw new Error(
          `Missing source document for page ${config.originalIndex + 1}.`,
        );
      }
      let doc = sourceCache.get(source.id);
      if (!doc) {
        doc = await PDFDocument.load(source.bytes);
        sourceCache.set(source.id, doc);
      }
      const [copiedPage] = await targetDoc.copyPages(doc, [
        config.originalIndex,
      ]);
      copiedPage.setRotation(degrees(config.rotation));
      targetDoc.addPage(copiedPage);
    }

    if (headerText.trim() || addPageNumbers) {
      const font = await targetDoc.embedFont(StandardFonts.Helvetica);
      targetDoc.getPages().forEach((page, index) => {
        const { width, height } = page.getSize();
        const margin = 40;
        if (headerText.trim()) {
          const text = headerText.trim();
          const textWidth = font.widthOfTextAtSize(text, 10);
          page.drawText(text, {
            x: margin,
            y: height - margin + 10,
            size: 10,
            font,
            color: rgb(0.32, 0.36, 0.42),
          });
        }
        if (addPageNumbers) {
          const label = `Page ${index + 1}`;
          const labelWidth = font.widthOfTextAtSize(label, 10);
          page.drawText(label, {
            x: width / 2 - labelWidth / 2,
            y: margin - 20,
            size: 10,
            font,
            color: rgb(0.32, 0.36, 0.42),
          });
        }
      });
    }

    const pdfBytes = await targetDoc.save(saveOptions(compressionLevel));
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const name =
      nameHint ||
      (pageList.length === selectedPages.length
        ? `${projectTitle}-toolkit.pdf`
        : `${projectTitle}-extract.pdf`);
    return { url, name, size: pdfBytes.byteLength };
  }

  async function exportSelection() {
    if (!selectedPages.length) {
      statusMessage = "Select at least one page before exporting.";
      return;
    }
    try {
      processing = true;
      statusMessage = "Assembling PDF…";
      revokeUrl(downloadUrl);
      const { url, name } = await assemblePdf(
        selectedPages,
        `${projectTitle}-toolkit.pdf`,
      );
      downloadUrl = url;
      downloadName = name;
      statusMessage = "Export ready.";
    } catch (error) {
      statusMessage =
        error instanceof Error
          ? error.message
          : "Unable to export the selected pages.";
    } finally {
      processing = false;
    }
  }

  async function exportRange() {
    if (!rangeInput.trim()) {
      statusMessage = "Enter a page range such as 2-5 or 1,3,6-8.";
      return;
    }
    const indices = parseRange(rangeInput, selectedPages.length);
    if (!indices.length) {
      statusMessage = "No valid page numbers were found in the range.";
      return;
    }
    const pageList = indices
      .map((index) => selectedPages[index])
      .filter(Boolean);
    if (!pageList.length) {
      statusMessage = "None of the requested pages are currently selected.";
      return;
    }
    try {
      extractingRange = true;
      statusMessage = `Exporting pages: ${rangeInput}`;
      revokeUrl(rangeUrl);
      const { url, name } = await assemblePdf(
        pageList,
        `${projectTitle}-extract.pdf`,
      );
      rangeUrl = url;
      rangeName = name;
      statusMessage = "Range export ready.";
    } catch (error) {
      statusMessage =
        error instanceof Error
          ? error.message
          : "Unable to export the requested range.";
    } finally {
      extractingRange = false;
    }
  }
</script>

<section class="space-y-6">
  <div
    class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
  >
    <h1 class="text-lg font-semibold text-slate-900 dark:text-white">
      Upload PDFs
    </h1>
    <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
      Merge notes, reports, and cover pages, or start a brand new project. Use
      the buttons below to replace the current project or append additional
      documents.
    </p>
    <div class="mt-4 grid gap-4 sm:grid-cols-2">
      <label
        class="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/80 p-4 text-center transition hover:border-blue-400 hover:bg-blue-50/60 dark:border-slate-600 dark:bg-slate-900/70 dark:hover:border-blue-400/60 dark:hover:bg-blue-500/10"
      >
        <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Start new project
        </span>
        <span class="text-xs text-slate-500 dark:text-slate-400">
          Replaces the current workspace with the selected PDFs.
        </span>
        <input
          type="file"
          class="hidden"
          multiple
          accept=".pdf"
          on:change={handleReplace}
        />
      </label>
      <label
        class="flex cursor-pointer flex-col gap-2 rounded-2xl border border-dashed border-slate-300 bg-white/80 p-4 text-center transition hover:border-blue-400 hover:bg-blue-50/60 dark:border-slate-600 dark:bg-slate-900/70 dark:hover:border-blue-400/60 dark:hover:bg-blue-500/10"
      >
        <span class="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Add to project
        </span>
        <span class="text-xs text-slate-500 dark:text-slate-400">
          Append PDFs for merging or selective extraction.
        </span>
        <input
          type="file"
          class="hidden"
          multiple
          accept=".pdf"
          on:change={handleAppend}
        />
      </label>
    </div>
    {#if sources.length}
      <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Loaded {sources.length} PDF{sources.length > 1 ? "s" : ""} • {pages.length}
        pages available.
      </p>
    {/if}
  </div>

  {#if pages.length}
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
      <div class="space-y-6">
        <div
          class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
                Page manager
              </h2>
              <p class="text-sm text-slate-600 dark:text-slate-300">
                Reorder, exclude, or rotate pages before exporting. Source
                documents stay untouched.
              </p>
            </div>
            <button
              type="button"
              class="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400/60 dark:hover:text-blue-200"
              on:click={resetProject}
            >
              Reset changes
            </button>
          </div>

          <div class="mt-4 space-y-3">
            {#each pages as page, index (page.id)}
              <div
                class="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-blue-400/60"
              >
                <div class="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p
                      class="text-sm font-semibold text-slate-900 dark:text-slate-100"
                    >
                      Page {index + 1} • {page.sourceName}
                    </p>
                    <p class="text-xs text-slate-500 dark:text-slate-400">
                      Source #{page.originalIndex + 1} • {formatSize(
                        page.width,
                        page.height,
                      )}
                    </p>
                    <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      Rotation: {page.rotation}&deg;
                    </p>
                  </div>
                  <button
                    type="button"
                    class={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      page.include
                        ? "border border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-400/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                        : "border border-slate-300 text-slate-500 hover:text-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:text-slate-100"
                    }`}
                    on:click={() => toggleInclude(page.id)}
                  >
                    {page.include ? "Included" : "Excluded"}
                  </button>
                </div>

                <div class="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400/60 dark:hover:text-blue-200 dark:disabled:border-slate-800 dark:disabled:text-slate-700"
                    on:click={() => movePage(index, "up")}
                    disabled={index === 0}
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400/60 dark:hover:text-blue-200 dark:disabled:border-slate-800 dark:disabled:text-slate-700"
                    on:click={() => movePage(index, "down")}
                    disabled={index === pages.length - 1}
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400/60 dark:hover:text-blue-200"
                    on:click={() => rotatePage(page.id, -90)}
                  >
                    Rotate -90°
                  </button>
                  <button
                    type="button"
                    class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400/60 dark:hover:text-blue-200"
                    on:click={() => rotatePage(page.id, 90)}
                  >
                    Rotate +90°
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="space-y-6">
        <div
          class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
        >
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Settings
          </h2>
          <div class="mt-4 space-y-4">
            <label
              class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Header text
              <input
                class="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                placeholder="e.g. Semester Project Report"
                bind:value={headerText}
              />
              <span
                class="text-[11px] font-normal normal-case text-slate-500 dark:text-slate-400"
              >
                Appears at the top of each exported page.
              </span>
            </label>
            <label
              class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <input
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
                bind:checked={addPageNumbers}
              />
              Add page numbers
            </label>
            <label
              class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Compression
              <select
                class="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                bind:value={compressionLevel}
              >
                <option value="none">No compression (largest files)</option>
                <option value="standard">Balanced compression</option>
                <option value="strong">Maximum compression</option>
              </select>
            </label>
          </div>
        </div>

        <div
          class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
        >
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Split or extract
          </h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Use a range like <span class="font-semibold">2-5</span> or
            <span class="font-semibold">1,3,6-8</span> to export chapters or assignments
            without touching the rest of the project.
          </p>
          <div class="mt-4 flex flex-wrap items-center gap-3">
            <input
              class="min-w-[160px] flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              placeholder="e.g. 2-5,8"
              bind:value={rangeInput}
            />
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full border border-transparent bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-emerald-400"
              on:click={exportRange}
              disabled={!selectedPages.length || extractingRange}
            >
              {extractingRange ? "Exporting…" : "Export range"}
            </button>
          </div>
          {#if rangeUrl}
            <a
              class="mt-4 inline-flex items-center justify-center rounded-full border border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
              href={rangeUrl}
              download={rangeName}
            >
              Download range PDF
            </a>
          {/if}
        </div>

        <div
          class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
        >
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Export
          </h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
            Merge the selected pages, apply formatting, and download a
            submission-ready PDF.
          </p>
          <div class="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full border border-transparent bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-blue-400"
              on:click={exportSelection}
              disabled={processing || !selectedPages.length}
            >
              {processing ? "Exporting…" : "Export selected pages"}
            </button>
            {#if downloadUrl}
              <a
                class="inline-flex items-center justify-center rounded-full border border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                href={downloadUrl}
                download={downloadName}
              >
                Download PDF
              </a>
            {/if}
          </div>
          {#if statusMessage}
            <p
              class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
            >
              {statusMessage}
            </p>
          {/if}
        </div>

        <div
          class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
        >
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Summary
          </h2>
          <dl
            class="mt-4 grid gap-3 text-sm text-slate-700 dark:text-slate-200"
          >
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Source PDFs
              </dt>
              <dd class="font-semibold">{sources.length}</dd>
            </div>
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Total pages
              </dt>
              <dd class="font-semibold">{pages.length}</dd>
            </div>
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Included in export
              </dt>
              <dd class="font-semibold">
                {selectedPages.length} ({Math.round(
                  (selectedPages.length / pages.length) * 100,
                )}%)
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  {:else}
    <div
      class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
    >
      Upload one or more PDFs to unlock merging, splitting, and formatting
      features tailored for student submissions.
    </div>
  {/if}
</section>
