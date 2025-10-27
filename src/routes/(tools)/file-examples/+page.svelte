<script lang="ts">
  import { onDestroy } from "svelte";
  import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

  type ExampleResult = {
    previewType: "text" | "image";
    preview: string;
    downloadUrl: string;
    fileName: string;
    info: string;
  };

  let generatingId: string | null = null;
  let activeResult: ExampleResult | null = null;
  let message = "";

  const examples = [
    {
      id: "csv",
      title: "Sample CSV",
      description: "A tidy 10-row dataset describing fictional customers.",
      async generate(): Promise<ExampleResult> {
        const headers = ["id", "full_name", "email", "country", "spend"];
        const rows = Array.from({ length: 10 }, (_, index) => {
          const spend = (Math.random() * 500 + 50).toFixed(2);
          return [
            String(index + 1),
            `Customer ${index + 1}`,
            `customer${index + 1}@example.com`,
            ["USA", "Canada", "UK", "Germany", "Australia"][index % 5],
            spend,
          ];
        });
        const csv = [
          headers.join(","),
          ...rows.map((row) => row.join(",")),
        ].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
        const downloadUrl = URL.createObjectURL(blob);
        return {
          previewType: "text",
          preview: csv,
          downloadUrl,
          fileName: "sample-customers.csv",
          info: "Comma-separated values with five columns and ten rows.",
        };
      },
    },
    {
      id: "json",
      title: "Sample JSON",
      description: "Structured JSON containing product records and pricing.",
      async generate(): Promise<ExampleResult> {
        const data = Array.from({ length: 6 }, (_, index) => ({
          sku: `SKU-${1000 + index}`,
          name: `Product ${index + 1}`,
          category: ["Hardware", "Software", "Accessories"][index % 3],
          price: Number((Math.random() * 120 + 20).toFixed(2)),
          inStock: Math.random() > 0.3,
        }));
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], {
          type: "application/json;charset=utf-8",
        });
        const downloadUrl = URL.createObjectURL(blob);
        return {
          previewType: "text",
          preview: json,
          downloadUrl,
          fileName: "sample-products.json",
          info: "Pretty-printed JSON array with six product objects.",
        };
      },
    },
    {
      id: "png",
      title: "Sample PNG",
      description: "A transparent PNG badge generated on the fly.",
      async generate(): Promise<ExampleResult> {
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 180;
        const context = canvas.getContext("2d");
        if (!context) {
          throw new Error("Unable to create canvas context.");
        }
        const gradient = context.createLinearGradient(0, 0, 320, 180);
        gradient.addColorStop(0, "#2563eb");
        gradient.addColorStop(1, "#9333ea");
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = "rgba(255,255,255,0.85)";
        context.font = "bold 28px 'Segoe UI', sans-serif";
        context.fillText("Devkit", 70, 95);
        context.fillStyle = "rgba(255,255,255,0.75)";
        context.font = "16px 'Segoe UI', sans-serif";
        context.fillText("Sample image asset", 88, 125);
        const dataUrl = canvas.toDataURL("image/png");
        const downloadUrl = dataUrl;
        return {
          previewType: "image",
          preview: dataUrl,
          downloadUrl,
          fileName: "sample-badge.png",
          info: "Transparent PNG rendered from canvas at 320×180 pixels.",
        };
      },
    },
    {
      id: "pdf",
      title: "Sample PDF",
      description:
        "One-page PDF featuring typography, shapes, and bullet lists.",
      async generate(): Promise<ExampleResult> {
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([595, 842]);
        const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
        const bodyFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const drawText = (
          text: string,
          x: number,
          y: number,
          size: number,
          bold = false,
        ) =>
          page.drawText(text, {
            x,
            y,
            size,
            font: bold ? font : bodyFont,
            color: rgb(0.2, 0.2, 0.24),
          });
        drawText("Devkit Sample PDF", 60, 780, 24, true);
        drawText("Generated programmatically with pdf-lib.", 60, 750, 12);
        page.drawRectangle({
          x: 60,
          y: 720,
          width: 475,
          height: 1.2,
          color: rgb(0.8, 0.85, 0.92),
        });
        const bullets = [
          "Lightweight example for pipeline testing.",
          "Shows text, shapes, and consistent margins.",
          "Ready for distribution or QA comparisons.",
        ];
        bullets.forEach((item, index) => {
          page.drawCircle({
            x: 72,
            y: 690 - index * 24,
            size: 3,
            color: rgb(0.2, 0.45, 0.85),
          });
          drawText(item, 90, 683 - index * 24, 12);
        });
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([pdfBytes], { type: "application/pdf" });
        const downloadUrl = URL.createObjectURL(blob);
        return {
          previewType: "text",
          preview: "PDF document ready. Download to view.",
          downloadUrl,
          fileName: "sample-handout.pdf",
          info: "A4-sized single-page PDF created in the browser.",
        };
      },
    },
  ];

  function revokeActive() {
    if (activeResult?.downloadUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(activeResult.downloadUrl);
    }
    activeResult = null;
  }

  onDestroy(() => revokeActive());

  async function handleGenerate(exampleId: string) {
    const example = examples.find((entry) => entry.id === exampleId);
    if (!example) return;
    generatingId = exampleId;
    message = "";
    try {
      revokeActive();
      activeResult = await example.generate();
      message = `Generated ${activeResult.fileName}`;
    } catch (error) {
      message =
        error instanceof Error
          ? error.message
          : "Unable to generate the requested example.";
    } finally {
      generatingId = null;
    }
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
    <div class="grid lg:grid-cols-2 gap-6">
      {#each examples as example}
        <article
          class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-sky-500/70"
        >
          <header class="flex items-start justify-between gap-4">
            <div>
              <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
                {example.title}
              </h2>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
                {example.description}
              </p>
            </div>
          </header>
          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full border border-transparent bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              on:click={() => handleGenerate(example.id)}
              disabled={generatingId === example.id}
            >
              {generatingId === example.id
                ? "Generating…"
                : "Generate & preview"}
            </button>
          </div>
        </article>
      {/each}
    </div>

    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Preview & download
        </h2>
        {#if message}
          <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
            {message}
          </p>
        {/if}
        {#if activeResult}
          {#if activeResult.previewType === "image"}
            <div
              class="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/70"
            >
              <img
                src={activeResult.preview}
                alt="Generated example"
                class="mx-auto max-h-[220px] w-full object-contain"
              />
            </div>
          {:else}
            <pre
              class="mt-4 max-h-[260px] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200">
              {activeResult.preview}
            </pre>
          {/if}
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {activeResult.info}
          </p>
          <a
            class="mt-4 inline-flex items-center justify-center rounded-full border border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
            href={activeResult.downloadUrl}
            download={activeResult.fileName}
          >
            Download {activeResult.fileName}
          </a>
        {:else}
          <p class="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Pick an example on the left to generate a downloadable test file and
            inspect it instantly.
          </p>
        {/if}
      </div>
    </div>
  </div>
</section>
