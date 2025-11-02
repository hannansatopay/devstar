<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import jsPDF from "jspdf";
  import Tesseract from "tesseract.js";

  type OcrState = "idle" | "processing" | "done" | "error";

  let fileInput: HTMLInputElement;
  let sourceUrl = "";
  let output = "";
  let ocrState: OcrState = "idle";
  let progressMessage = "";
  let errorMessage = "";
  let fileName = "image";

  function handleBrowse() {
    fileInput?.click();
  }

  function handleFileChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement | null;
    const file = target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        sourceUrl = reader.result;
        fileName = file.name.replace(/\.[^/.]+$/, "") || "image";
        output = "";
        ocrState = "idle";
        progressMessage = "";
        errorMessage = "";
      }
    };
    reader.readAsDataURL(file);
  }

  async function extractText() {
    if (!sourceUrl) return;
    ocrState = "processing";
    output = "";
    progressMessage = "Loading OCR engine…";
    errorMessage = "";

    try {
      const result = await Tesseract.recognize(sourceUrl, "eng", {
        logger: (message) => {
          if (message.status === "recognizing text") {
            const pct = Math.round((message.progress ?? 0) * 100);
            progressMessage = `Recognizing text… ${pct}%`;
          } else if (message.status) {
            progressMessage = `${message.status[0]?.toUpperCase()}${message.status.slice(1)}`;
          }
        },
      });
      output = result.data.text.trim();
      ocrState = "done";
      progressMessage = output ? "Extraction complete" : "No text detected";
    } catch (error) {
      console.error(error);
      ocrState = "error";
      errorMessage =
        "Could not extract text from this image. Try clearer input or a different language.";
    }
  }

  function downloadText() {
    if (!output) return;
    const blob = new Blob([output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fileName}-ocr.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function downloadPdf() {
    if (!output) return;
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(output, 180);
    doc.text(lines, 15, 20);
    doc.save(`${fileName}-ocr.pdf`);
  }

  function clearAll() {
    sourceUrl = "";
    output = "";
    ocrState = "idle";
    progressMessage = "";
    errorMessage = "";
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-3">
    <div class="flex flex-1 flex-col gap-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-center gap-3">
          <button
            class="rounded-full border border-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-500 transition hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
            type="button"
            on:click={handleBrowse}
          >
            {sourceUrl ? "Replace image" : "Upload image"}
          </button>
          {#if sourceUrl}
            <button
              class="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-500 dark:hover:text-rose-300"
              type="button"
              on:click={clearAll}
            >
              Clear
            </button>
          {/if}
          <input
            class="hidden"
            type="file"
            accept="image/*"
            bind:this={fileInput}
            on:change={handleFileChange}
          />
        </div>
        <div
          class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          OCR runs locally using your browser’s resources. For best results,
          supply sharp images with high contrast text.
        </div>
      </div>

      {#if errorMessage}
        <div
          class="rounded-2xl border border-rose-200 bg-rose-100/70 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
        >
          {errorMessage}
        </div>
      {/if}
    </div>

    <div class="lg:col-span-2 flex flex-1 flex-col gap-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="grid gap-4 md:grid-cols-2">
          <div
            class="flex min-h-[300px] flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-inner dark:border-slate-700 dark:bg-slate-900"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Image preview
            </p>
            {#if sourceUrl}
              <img
                alt="OCR source preview"
                class="max-h-64 w-full rounded-lg object-contain"
                src={sourceUrl}
              />
            {:else}
              <div
                class="grid flex-1 place-items-center text-sm text-slate-500 dark:text-slate-400"
              >
                Upload an image to start text recognition.
              </div>
            {/if}
          </div>

          <div class="flex min-h-[300px] flex-col gap-3">
            <div class="flex flex-wrap items-center gap-2">
              <button
                class="rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-700"
                type="button"
                on:click={extractText}
                disabled={!sourceUrl || ocrState === "processing"}
              >
                {ocrState === "processing" ? "Extracting…" : "Extract text"}
              </button>
              <Copy text={output} label="Copy text" floating={false} />
              <button
                class="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300 dark:focus:ring-emerald-900"
                type="button"
                on:click={downloadText}
                disabled={!output}
              >
                Download .txt
              </button>
              <button
                class="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300 dark:focus:ring-emerald-900"
                type="button"
                on:click={downloadPdf}
                disabled={!output}
              >
                Download .pdf
              </button>
            </div>

            {#if ocrState === "processing"}
              <div
                class="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <span
                  class="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-indigo-500"
                ></span>
                {progressMessage}
              </div>
            {/if}

            <textarea
              class="flex-1 rounded-2xl border border-slate-200 bg-white/80 p-4 text-[13px] text-slate-600 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              placeholder="Extracted text will appear here."
              bind:value={output}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
