<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import { PDFDocument, rgb } from "pdf-lib";
  import Tesseract from "tesseract.js";

  type CompressionLevel = "none" | "standard" | "strong";
  type PaperTone = "warm" | "neutral" | "cool";

  type JobStatus = "idle" | "processing" | "done" | "error";

  type JobOptions = {
    scannedLook: boolean;
    tone: PaperTone;
    cleanBackground: boolean;
    addNoise: boolean;
    tilt: boolean;
    compression: CompressionLevel;
    runOcr: boolean;
  };

  type Job = {
    id: string;
    file: File;
    name: string;
    size: number;
    status: JobStatus;
    options: JobOptions;
    progress: string;
    outputUrl?: string;
    ocrTextUrl?: string;
    error?: string;
  };

  type Snapshot = {
    width: number;
    height: number;
    dataUrl: string;
    ocrText?: string;
  };

  const tonePalette: Record<PaperTone, { label: string; color: string }> = {
    warm: { label: "Warm ivory", color: "#f7f2e4" },
    neutral: { label: "Neutral matte", color: "#f4f5f3" },
    cool: { label: "Cool blueprint", color: "#e7ecf5" },
  };

  const defaultOptions: JobOptions = {
    scannedLook: true,
    tone: "warm",
    cleanBackground: true,
    addNoise: true,
    tilt: true,
    compression: "standard",
    runOcr: false,
  };

  let jobs: Job[] = [];
  let processingAll = false;
  let pdfjsLib: any = null;

  function refreshJobs() {
    jobs = [...jobs];
  }

  onMount(async () => {
    await ensurePdfJs();
  });

  onDestroy(() => {
    jobs.forEach((job) => revokeJob(job));
  });

  function revokeJob(job: Job) {
    if (job.outputUrl) {
      URL.revokeObjectURL(job.outputUrl);
      job.outputUrl = undefined;
    }
    if (job.ocrTextUrl) {
      URL.revokeObjectURL(job.ocrTextUrl);
      job.ocrTextUrl = undefined;
    }
  }

  async function ensurePdfJs() {
    if (pdfjsLib) return pdfjsLib;
    const [{ default: workerSrc }, pdfjs] = await Promise.all([
      import("pdfjs-dist/build/pdf.worker.min.js?url"),
      import("pdfjs-dist/legacy/build/pdf"),
    ]);
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
    pdfjsLib = pdfjs;
    return pdfjsLib;
  }

  function handleFileInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const files = Array.from(target.files ?? []);
    if (!files.length) return;
    addJobs(files);
    target.value = "";
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    const files = Array.from(event.dataTransfer?.files ?? []);
    if (!files.length) return;
    addJobs(files);
  }

  function addJobs(files: File[]) {
    const nextJobs = files.map((file) => ({
      id: crypto.randomUUID(),
      file,
      name: file.name,
      size: file.size,
      status: "idle" as JobStatus,
      options: { ...defaultOptions },
      progress: "",
    }));
    jobs = [...jobs, ...nextJobs];
  }

  function removeJob(id: string) {
    const job = jobs.find((item) => item.id === id);
    if (job) revokeJob(job);
    jobs = jobs.filter((item) => item.id !== id);
  }

  function humanFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  async function processAllJobs() {
    if (processingAll) return;
    processingAll = true;
    for (const job of jobs) {
      if (job.status === "done") continue;
      await processJob(job);
    }
    processingAll = false;
  }

  async function processJob(job: Job) {
    const { file } = job;
    revokeJob(job);
    job.status = "processing";
    job.progress = "Reading file...";
    job.error = undefined;
    refreshJobs();

    try {
      const pdfjs = await ensurePdfJs();
      const buffer = new Uint8Array(await file.arrayBuffer());
      const isPdf =
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf");
      let snapshots: Snapshot[] = [];

      if (isPdf) {
        snapshots = await rasterizePdf(buffer, job, pdfjs);
      } else if (file.type.startsWith("image/")) {
        snapshots = await prepareImageSnapshot(buffer, job);
      } else {
        throw new Error(
          "Only PDF and common image formats (PNG, JPG) are supported.",
        );
      }

      job.progress = "Building final PDF...";
      refreshJobs();
      const output = await buildPdfFromSnapshots(snapshots, job.options);
      job.outputUrl = output.pdfUrl;
      if (output.ocrTextUrl) {
        job.ocrTextUrl = output.ocrTextUrl;
      }
      job.progress = `Completed (${(output.size / 1024 / 1024).toFixed(2)} MB)`;
      job.status = "done";
      refreshJobs();
    } catch (error) {
      job.status = "error";
      job.error =
        error instanceof Error ? error.message : "Unable to convert this file.";
      refreshJobs();
    }
  }
  async function rasterizePdf(
    buffer: Uint8Array,
    job: Job,
    pdfjs: any,
  ): Promise<Snapshot[]> {
    const loadingTask = pdfjs.getDocument({ data: buffer });
    const pdf = await loadingTask.promise;
    const results: Snapshot[] = [];
    const scale = 1.5;
    for (let pageIndex = 1; pageIndex <= pdf.numPages; pageIndex += 1) {
      const page = await pdf.getPage(pageIndex);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Unable to prepare drawing surface.");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      job.progress = `Rendering page ${pageIndex} of ${pdf.numPages}...`;
      refreshJobs();
      await page.render({ canvasContext: context, viewport }).promise;

      if (job.options.cleanBackground) {
        cleanCanvas(canvas);
      }

      let ocrText: string | undefined;
      if (job.options.runOcr) {
        ocrText = await runOcr(canvas, job, pageIndex, pdf.numPages);
      }

      const styled = stylizeCanvas(canvas, job.options);
      const quality = compressionQuality(job.options.compression);
      const dataUrl = styled.canvas.toDataURL("image/jpeg", quality);

      results.push({
        width: styled.width,
        height: styled.height,
        dataUrl,
        ocrText,
      });
    }

    return results;
  }

  async function prepareImageSnapshot(
    buffer: Uint8Array,
    job: Job,
  ): Promise<Snapshot[]> {
    const blob = new Blob([buffer]);
    const url = URL.createObjectURL(blob);
    const imageBitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Unable to prepare drawing surface.");
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    context.drawImage(imageBitmap, 0, 0);
    URL.revokeObjectURL(url);

    if (job.options.cleanBackground) {
      cleanCanvas(canvas);
    }

    let ocrText: string | undefined;
    if (job.options.runOcr) {
      ocrText = await runOcr(canvas, job, 1, 1);
    }

    const styled = stylizeCanvas(canvas, job.options);
    const quality = compressionQuality(job.options.compression);
    const dataUrl = styled.canvas.toDataURL("image/jpeg", quality);

    return [
      {
        width: styled.width,
        height: styled.height,
        dataUrl,
        ocrText,
      },
    ];
  }

  function cleanCanvas(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) return;
    const { width, height } = canvas;
    const imageData = context.getImageData(0, 0, width, height);
    const { data } = imageData;
    for (let index = 0; index < data.length; index += 4) {
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
      const boosted = Math.min(255, luminance * 1.08 + 14);
      const threshold = boosted > 210 ? 255 : boosted;
      data[index] = threshold;
      data[index + 1] = threshold;
      data[index + 2] = threshold;
    }
    context.putImageData(imageData, 0, 0);
  }

  async function runOcr(
    canvas: HTMLCanvasElement,
    job: Job,
    pageIndex: number,
    totalPages: number,
  ) {
    job.progress = `Recognizing text on page ${pageIndex} of ${totalPages}...`;
    refreshJobs();
    const dataUrl = canvas.toDataURL("image/png");
    const { data } = await Tesseract.recognize(dataUrl, "eng", {
      logger(message) {
        if (message.status === "recognizing text") {
          const percent = Math.round((message.progress ?? 0) * 100);
          job.progress = `OCR ${percent}% for page ${pageIndex} of ${totalPages}...`;
          refreshJobs();
        }
      },
    });
    return data.text.trim();
  }

  function stylizeCanvas(canvas: HTMLCanvasElement, options: JobOptions) {
    const margin = Math.round(Math.max(canvas.width, canvas.height) * 0.04);
    const angle =
      options.scannedLook && options.tilt ? (Math.random() - 0.5) * 4 : 0;
    const radians = (Math.PI / 180) * angle;
    const cos = Math.cos(radians);
    const sin = Math.sin(radians);
    const rotatedWidth =
      Math.abs(canvas.width * cos) + Math.abs(canvas.height * sin);
    const rotatedHeight =
      Math.abs(canvas.width * sin) + Math.abs(canvas.height * cos);
    const outputWidth = Math.ceil(rotatedWidth + margin * 2);
    const outputHeight = Math.ceil(rotatedHeight + margin * 2);
    const styled = document.createElement("canvas");
    styled.width = outputWidth;
    styled.height = outputHeight;
    const context = styled.getContext("2d");
    if (!context) {
      throw new Error("Unable to create canvas for styling.");
    }

    const toneColor = tonePalette[options.tone].color;
    context.fillStyle = toneColor;
    context.fillRect(0, 0, outputWidth, outputHeight);

    if (options.scannedLook) {
      context.fillStyle = "rgba(15,23,42,0.08)";
      context.shadowColor = "rgba(15,23,42,0.35)";
      context.shadowBlur = 24;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 16;
      context.save();
      context.translate(outputWidth / 2, outputHeight / 2);
      context.rotate(radians);
      context.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
      context.restore();
      context.shadowBlur = 0;
      context.shadowOffsetX = 0;
      context.shadowOffsetY = 0;
    } else {
      context.save();
      context.translate(outputWidth / 2, outputHeight / 2);
      context.rotate(radians);
      context.drawImage(canvas, -canvas.width / 2, -canvas.height / 2);
      context.restore();
    }

    if (options.addNoise) {
      const noise = createNoisePattern(outputWidth, outputHeight);
      context.globalAlpha = 0.12;
      context.drawImage(noise, 0, 0);
      context.globalAlpha = 1;
    }

    return { canvas: styled, width: outputWidth, height: outputHeight };
  }

  function createNoisePattern(width: number, height: number) {
    const noiseCanvas = document.createElement("canvas");
    noiseCanvas.width = width;
    noiseCanvas.height = height;
    const context = noiseCanvas.getContext("2d", { willReadFrequently: true });
    if (!context) return noiseCanvas;
    const imageData = context.createImageData(width, height);
    const { data } = imageData;
    for (let index = 0; index < data.length; index += 4) {
      const shade = 230 + Math.floor(Math.random() * 20);
      data[index] = shade;
      data[index + 1] = shade;
      data[index + 2] = shade;
      data[index + 3] = 255;
    }
    context.putImageData(imageData, 0, 0);
    return noiseCanvas;
  }

  function compressionQuality(level: CompressionLevel) {
    if (level === "none") return 0.95;
    if (level === "strong") return 0.6;
    return 0.82;
  }

  async function buildPdfFromSnapshots(
    snapshots: Snapshot[],
    options: JobOptions,
  ) {
    const pdfDoc = await PDFDocument.create();
    const ocrTexts: string[] = [];
    for (let index = 0; index < snapshots.length; index += 1) {
      const snapshot = snapshots[index];
      const page = pdfDoc.addPage([snapshot.width, snapshot.height]);
      const bytes = dataUrlToUint8Array(snapshot.dataUrl);
      const image = await pdfDoc.embedJpg(bytes);
      page.drawImage(image, {
        x: 0,
        y: 0,
        width: snapshot.width,
        height: snapshot.height,
      });
      if (options.runOcr && snapshot.ocrText) {
        ocrTexts.push(`Page ${index + 1}\n${snapshot.ocrText}`);
        page.drawText(snapshot.ocrText, {
          x: 32,
          y: snapshot.height - 72,
          size: 10,
          opacity: 0.001,
          color: rgb(0, 0, 0),
          maxWidth: snapshot.width - 64,
          lineHeight: 12,
        });
      }
    }

    const pdfBytes = await pdfDoc.save({ useObjectStreams: false });
    const pdfBlob = new Blob([pdfBytes], { type: "application/pdf" });
    const pdfUrl = URL.createObjectURL(pdfBlob);

    let ocrTextUrl: string | undefined;
    if (options.runOcr && ocrTexts.length) {
      const textBlob = new Blob([ocrTexts.join("\n\n")], {
        type: "text/plain;charset=utf-8",
      });
      ocrTextUrl = URL.createObjectURL(textBlob);
    }

    return {
      pdfUrl,
      ocrTextUrl,
      size: pdfBytes.byteLength,
    };
  }

  function dataUrlToUint8Array(dataUrl: string) {
    const base64 = dataUrl.split(",")[1];
    const binary = atob(base64);
    const length = binary.length;
    const bytes = new Uint8Array(length);
    for (let index = 0; index < length; index += 1) {
      bytes[index] = binary.charCodeAt(index);
    }
    return bytes;
  }
</script>

<section class="space-y-6">
  <div
    class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
  >
    <div
      class="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/80 px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/60 dark:border-slate-600 dark:bg-slate-900/70 dark:hover:border-blue-400/60 dark:hover:bg-blue-500/10"
      on:drop={handleDrop}
      on:dragover={(event) => event.preventDefault()}
    >
      <svg
        class="h-12 w-12 text-blue-500 dark:text-blue-300"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="1.8"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 5v14m7-7H5"
        />
      </svg>
      <p class="mt-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
        Drop PDFs or note photos here
      </p>
      <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
        The converter supports PDF, PNG, and JPG files. You can add as many as
        you need.
      </p>
      <label
        class="mt-4 inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400/60 dark:hover:text-blue-200"
      >
        Browse files
        <input
          type="file"
          class="hidden"
          multiple
          accept=".pdf,image/png,image/jpeg"
          on:change={handleFileInput}
        />
      </label>
    </div>
  </div>

  {#if jobs.length}
    <div class="space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Conversion queue
          </h2>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            Configure options per file or run a batch conversion for all
            assignments.
          </p>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-transparent bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-blue-400"
            on:click={processAllJobs}
            disabled={processingAll ||
              jobs.every((job) => job.status === "done")}
          >
            {processingAll ? "Processing..." : "Process all"}
          </button>
        </div>
      </div>

      <div class="space-y-4">
        {#each jobs as job (job.id)}
          <article
            class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
          >
            <header class="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3
                  class="text-base font-semibold text-slate-900 dark:text-white"
                >
                  {job.name}
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  {humanFileSize(job.size)}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-300 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400/60 dark:hover:text-blue-200"
                  on:click={() => processJob(job)}
                  disabled={job.status === "processing"}
                >
                  {job.status === "processing" ? "Working..." : "Process"}
                </button>
                <button
                  type="button"
                  class="rounded-full border border-rose-400 px-3 py-1 text-xs font-semibold text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/60 dark:text-rose-300 dark:hover:bg-rose-500/10"
                  on:click={() => removeJob(job.id)}
                >
                  Remove
                </button>
              </div>
            </header>

            <div class="mt-4 grid gap-4 md:grid-cols-2">
              <label
                class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Paper tone
                <select
                  class="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  bind:value={job.options.tone}
                  disabled={job.status === "processing"}
                >
                  {#each Object.entries(tonePalette) as [value, details]}
                    <option {value}>{details.label}</option>
                  {/each}
                </select>
              </label>
              <label
                class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Compression
                <select
                  class="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  bind:value={job.options.compression}
                  disabled={job.status === "processing"}
                >
                  <option value="none">No compression (largest)</option>
                  <option value="standard">Balanced</option>
                  <option value="strong">Maximum compression</option>
                </select>
              </label>
              <label
                class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
                  bind:checked={job.options.scannedLook}
                  disabled={job.status === "processing"}
                />
                Scanned look (tone, shadow, tilt)
              </label>
              <label
                class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
                  bind:checked={job.options.cleanBackground}
                  disabled={job.status === "processing"}
                />
                Auto clean backgrounds
              </label>
              <label
                class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
                  bind:checked={job.options.addNoise}
                  disabled={job.status === "processing"}
                />
                Add subtle paper grain
              </label>
              <label
                class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                <input
                  type="checkbox"
                  class="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-900"
                  bind:checked={job.options.runOcr}
                  disabled={job.status === "processing"}
                />
                Apply OCR for searchable text
              </label>
            </div>

            <div class="mt-4 text-sm text-slate-600 dark:text-slate-300">
              {#if job.status === "processing"}
                <p>{job.progress}</p>
              {:else if job.status === "done"}
                <div class="flex flex-wrap items-center gap-3">
                  <a
                    class="inline-flex items-center justify-center rounded-full border border-blue-500 px-5 py-2 font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-400/60 dark:text-blue-300 dark:hover:bg-blue-500/10"
                    href={job.outputUrl}
                    download={`${job.name.replace(/\\.[^/.]+$/, "")}-scan.pdf`}
                  >
                    Download converted PDF
                  </a>
                  {#if job.ocrTextUrl}
                    <a
                      class="inline-flex items-center justify-center rounded-full border border-emerald-500 px-5 py-2 font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                      href={job.ocrTextUrl}
                      download={`${job.name.replace(/\\.[^/.]+$/, "")}-ocr.txt`}
                    >
                      Download OCR text
                    </a>
                  {/if}
                </div>
              {:else if job.status === "error"}
                <p class="text-rose-500 dark:text-rose-300">{job.error}</p>
              {:else}
                <p>Ready to process.</p>
              {/if}
            </div>
          </article>
        {/each}
      </div>
    </div>
  {:else}
    <div
      class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
    >
      Upload PDFs or note photos to start converting them into realistic scanned
      copies with searchable text and balanced file sizes.
    </div>
  {/if}
</section>
