<script lang="ts">
  import { onDestroy } from "svelte";
  import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";

  type Placement =
    | "center"
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right";

  let pdfFile: File | null = null;
  let pdfName = "";

  let watermarkType: "text" | "image" = "text";

  let textValue = "Confidential";
  let textSize = 48;
  let textOpacity = 18;
  let textColor = "#0f172a";
  let textRotation = 45;
  let placement: Placement = "center";

  let imageFile: File | null = null;
  let imageOpacity = 25;
  let imageScale = 60;
  let imageRotation = 0;

  let processing = false;
  let statusMessage = "";
  let downloadUrl = "";
  let downloadName = "";

  const placementOptions: { value: Placement; label: string }[] = [
    { value: "center", label: "Center" },
    { value: "top-left", label: "Top left" },
    { value: "top-right", label: "Top right" },
    { value: "bottom-left", label: "Bottom left" },
    { value: "bottom-right", label: "Bottom right" },
  ];

  function revokeDownload() {
    if (downloadUrl) {
      URL.revokeObjectURL(downloadUrl);
      downloadUrl = "";
    }
  }

  onDestroy(() => revokeDownload());

  function handlePdfInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    const file = target.files?.[0] ?? null;
    pdfFile = file;
    pdfName = file?.name ?? "";
    statusMessage = "";
    revokeDownload();
  }

  function handleImageInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    imageFile = target.files?.[0] ?? null;
  }

  function hexToRgb(hex: string) {
    let normalized = hex.replace("#", "");
    if (normalized.length === 3) {
      normalized = normalized
        .split("")
        .map((char) => char + char)
        .join("");
    }
    if (normalized.length !== 6) {
      normalized = "0f172a";
    }
    const numeric = parseInt(normalized, 16);
    return {
      r: ((numeric >> 16) & 255) / 255,
      g: ((numeric >> 8) & 255) / 255,
      b: (numeric & 255) / 255,
    };
  }

  function textPosition(
    pageWidth: number,
    pageHeight: number,
    textWidth: number,
    textHeight: number,
    targetPlacement: Placement,
  ) {
    const marginX = Math.min(64, pageWidth * 0.08);
    const marginY = Math.min(64, pageHeight * 0.08);
    switch (targetPlacement) {
      case "top-left":
        return { x: marginX, y: pageHeight - marginY - textHeight };
      case "top-right":
        return {
          x: pageWidth - marginX - textWidth,
          y: pageHeight - marginY - textHeight,
        };
      case "bottom-left":
        return { x: marginX, y: marginY };
      case "bottom-right":
        return {
          x: pageWidth - marginX - textWidth,
          y: marginY,
        };
      default:
        return {
          x: (pageWidth - textWidth) / 2,
          y: (pageHeight - textHeight) / 2,
        };
    }
  }

  function imagePosition(
    pageWidth: number,
    pageHeight: number,
    width: number,
    height: number,
    targetPlacement: Placement,
  ) {
    const marginX = Math.min(64, pageWidth * 0.08);
    const marginY = Math.min(64, pageHeight * 0.08);
    switch (targetPlacement) {
      case "top-left":
        return { x: marginX, y: pageHeight - marginY - height };
      case "top-right":
        return {
          x: pageWidth - marginX - width,
          y: pageHeight - marginY - height,
        };
      case "bottom-left":
        return { x: marginX, y: marginY };
      case "bottom-right":
        return { x: pageWidth - marginX - width, y: marginY };
      default:
        return {
          x: (pageWidth - width) / 2,
          y: (pageHeight - height) / 2,
        };
    }
  }

  function baseName(fileName: string) {
    const match = fileName.match(/^(.*?)(\.[^.]*)?$/);
    return match?.[1] || "document";
  }

  async function applyWatermark() {
    if (!pdfFile) {
      statusMessage = "Select a PDF to get started.";
      return;
    }
    if (watermarkType === "image" && !imageFile) {
      statusMessage = "Upload a watermark image or switch to text mode.";
      return;
    }

    processing = true;
    statusMessage = "Applying watermark…";
    revokeDownload();
    try {
      const pdfBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      if (watermarkType === "text") {
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const color = hexToRgb(textColor);
        const content = textValue.trim() || "CONFIDENTIAL";
        for (const page of pages) {
          const { width, height } = page.getSize();
          const textWidth = font.widthOfTextAtSize(content, textSize);
          const textHeight = font.heightAtSize(textSize);
          const { x, y } = textPosition(
            width,
            height,
            textWidth,
            textHeight,
            placement,
          );
          page.drawText(content, {
            x,
            y,
            size: textSize,
            font,
            color: rgb(color.r, color.g, color.b),
            opacity: Math.min(Math.max(textOpacity / 100, 0.05), 0.8),
            rotate: degrees(textRotation),
          });
        }
      } else if (imageFile) {
        const imageBytes = await imageFile.arrayBuffer();
        const embedded =
          imageFile.type === "image/jpeg" || imageFile.type === "image/jpg"
            ? await pdfDoc.embedJpg(imageBytes)
            : await pdfDoc.embedPng(imageBytes);

        for (const page of pages) {
          const { width, height } = page.getSize();
          const maxScale = Math.min(
            (width * 0.8) / embedded.width,
            (height * 0.8) / embedded.height,
          );
          const scale = Math.min(Math.max(imageScale, 10), 200) / 100;
          const scalar = Math.min(scale, maxScale);
          const drawWidth = embedded.width * scalar;
          const drawHeight = embedded.height * scalar;
          const { x, y } = imagePosition(
            width,
            height,
            drawWidth,
            drawHeight,
            placement,
          );
          page.drawImage(embedded, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
            opacity: Math.min(Math.max(imageOpacity / 100, 0.05), 0.85),
            rotate: degrees(imageRotation),
          });
        }
      }

      const outputBytes = await pdfDoc.save();
      const blob = new Blob([outputBytes], { type: "application/pdf" });
      downloadUrl = URL.createObjectURL(blob);
      downloadName = `${baseName(pdfFile.name)}-watermarked.pdf`;
      statusMessage = "Watermark applied. Download your updated PDF.";
    } catch (error) {
      statusMessage =
        error instanceof Error
          ? error.message
          : "Unable to add a watermark to the PDF.";
      revokeDownload();
    } finally {
      processing = false;
    }
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Upload PDF
        </h2>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Choose the document you want to watermark. Files stay in the browser
          and never leave your device.
        </p>
        <label
          class="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white/80 px-6 py-8 text-center transition hover:border-blue-400 hover:bg-blue-50/60 dark:border-slate-600 dark:bg-slate-900/70 dark:hover:border-blue-400/60 dark:hover:bg-blue-500/10"
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
          <span
            class="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            {pdfName ? pdfName : "Select a PDF file"}
          </span>
          <span class="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Supports PDF files up to 20 MB.
          </span>
          <input
            type="file"
            accept="application/pdf"
            class="hidden"
            on:change={handlePdfInput}
          />
        </label>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Watermark settings
        </h2>
        <div
          class="mt-4 flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800/80"
        >
          <button
            type="button"
            class={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${watermarkType === "text" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
            on:click={() => (watermarkType = "text")}
          >
            Text watermark
          </button>
          <button
            type="button"
            class={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${watermarkType === "image" ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-300"}`}
            on:click={() => (watermarkType = "image")}
          >
            Image watermark
          </button>
        </div>

        <div class="mt-5 grid gap-4">
          <label
            class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Placement
            <select
              class="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              bind:value={placement}
            >
              {#each placementOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </label>

          {#if watermarkType === "text"}
            <label
              class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Text
              <input
                class="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                bind:value={textValue}
                placeholder="Confidential"
              />
            </label>
            <div class="grid gap-4 sm:grid-cols-2">
              <label
                class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Font size
                <input
                  type="range"
                  min="18"
                  max="96"
                  step="1"
                  bind:value={textSize}
                />
                <span
                  class="text-[11px] font-normal normal-case text-slate-500 dark:text-slate-400"
                >
                  {textSize}px
                </span>
              </label>
              <label
                class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Opacity
                <input
                  type="range"
                  min="5"
                  max="80"
                  step="1"
                  bind:value={textOpacity}
                />
                <span
                  class="text-[11px] font-normal normal-case text-slate-500 dark:text-slate-400"
                >
                  {textOpacity}%
                </span>
              </label>
              <label
                class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Rotation
                <input
                  type="range"
                  min="-90"
                  max="90"
                  step="1"
                  bind:value={textRotation}
                />
                <span
                  class="text-[11px] font-normal normal-case text-slate-500 dark:text-slate-400"
                >
                  {textRotation}&deg;
                </span>
              </label>
              <label
                class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Color
                <input
                  type="color"
                  class="h-10 w-full rounded-xl border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900"
                  bind:value={textColor}
                />
              </label>
            </div>
          {:else}
            <label
              class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Upload image
              <input
                type="file"
                accept="image/*"
                class="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                on:change={handleImageInput}
              />
              <span
                class="text-[11px] font-normal normal-case text-slate-500 dark:text-slate-400"
              >
                Transparent PNGs work best for subtle overlays.
              </span>
            </label>
            <div class="grid gap-4 sm:grid-cols-2">
              <label
                class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Scale
                <input
                  type="range"
                  min="10"
                  max="200"
                  step="1"
                  bind:value={imageScale}
                />
                <span
                  class="text-[11px] font-normal normal-case text-slate-500 dark:text-slate-400"
                >
                  {imageScale}%
                </span>
              </label>
              <label
                class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Opacity
                <input
                  type="range"
                  min="5"
                  max="85"
                  step="1"
                  bind:value={imageOpacity}
                />
                <span
                  class="text-[11px] font-normal normal-case text-slate-500 dark:text-slate-400"
                >
                  {imageOpacity}%
                </span>
              </label>
              <label
                class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Rotation
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="1"
                  bind:value={imageRotation}
                />
                <span
                  class="text-[11px] font-normal normal-case text-slate-500 dark:text-slate-400"
                >
                  {imageRotation}&deg;
                </span>
              </label>
            </div>
          {/if}
        </div>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-transparent bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-blue-400"
            on:click={applyWatermark}
            disabled={processing}
          >
            {processing ? "Working…" : "Apply watermark"}
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400/60 dark:hover:text-blue-200"
            on:click={() => {
              watermarkType = "text";
              textValue = "Confidential";
              textSize = 48;
              textOpacity = 18;
              textColor = "#0f172a";
              textRotation = 45;
              imageFile = null;
              imageOpacity = 25;
              imageScale = 60;
              imageRotation = 0;
            }}
          >
            Reset settings
          </button>
        </div>
        {#if statusMessage}
          <p
            class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
          >
            {statusMessage}
          </p>
        {/if}
      </div>
    </div>

    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Document overview
        </h2>
        {#if pdfFile}
          <dl
            class="mt-4 grid gap-3 text-sm text-slate-700 dark:text-slate-200"
          >
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                File
              </dt>
              <dd class="font-semibold">{pdfName}</dd>
            </div>
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Size
              </dt>
              <dd class="font-semibold">
                {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
              </dd>
            </div>
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Watermark mode
              </dt>
              <dd class="font-semibold">
                {watermarkType === "text" ? "Text overlay" : "Image overlay"}
              </dd>
            </div>
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Placement
              </dt>
              <dd class="font-semibold">
                {placementOptions.find((option) => option.value === placement)
                  ?.label}
              </dd>
            </div>
          </dl>
        {:else}
          <p class="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Upload a PDF to display document details and enable export options.
          </p>
        {/if}
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Download
        </h2>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Once the watermark is applied, download the updated PDF. The original
          file is never modified.
        </p>
        {#if downloadUrl}
          <a
            class="mt-4 inline-flex items-center justify-center rounded-full border border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
            href={downloadUrl}
            download={downloadName || "watermarked.pdf"}
          >
            Download watermarked PDF
          </a>
        {:else}
          <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
            Generate a watermark to activate the download button.
          </p>
        {/if}
      </div>
    </div>
  </div>
</section>
