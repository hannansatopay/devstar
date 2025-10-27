<script lang="ts">
  import { onDestroy } from "svelte";

  type CatalogEntry = {
    id: string;
    title: string;
    description: string;
    outputs: string[];
    match: RegExp[];
    convertable: boolean;
    note?: string;
  };

  const FORMAT_CATALOG: CatalogEntry[] = [
    {
      id: "image",
      title: "Image",
      description:
        "Convert raster images between popular formats (PNG, JPG, WEBP).",
      outputs: ["png", "jpg", "webp"],
      match: [/^image\//i],
      convertable: true,
      note: "Conversion runs in your browser using Canvas, so sensitive files stay local.",
    },
    {
      id: "audio",
      title: "Audio",
      description:
        "Inspect basic metadata for audio clips. Browser-based conversion is coming soon.",
      outputs: ["aac", "flac", "mp3", "ogg", "wav"],
      match: [/^audio\//i],
      convertable: false,
      note: "Use a dedicated audio editor for high-fidelity conversions.",
    },
    {
      id: "video",
      title: "Video",
      description: "Preview container and codec information for video files.",
      outputs: ["mp4", "webm", "mov", "avi"],
      match: [/^video\//i],
      convertable: false,
      note: "Transcoding video requires server-side tooling.",
    },
    {
      id: "document",
      title: "Document",
      description:
        "Quickly preview document metadata such as size and extension.",
      outputs: ["pdf", "docx", "txt"],
      match: [/pdf$/i, /(doc|ppt|xls)[x]?$/i],
      convertable: false,
    },
  ];

  let selectedFile: File | null = null;
  let fileUrl = "";
  let convertedUrl = "";
  let conversionError = "";
  let converting = false;
  let selectedCategory: CatalogEntry | null = null;
  let outputFormat = "";
  let imagePreviewUrl = "";
  let metadata: { sizeLabel: string; typeLabel: string } | null = null;

  function resetState() {
    convertedUrl = "";
    conversionError = "";
    converting = false;
  }

  function revokeUrls() {
    if (fileUrl) {
      URL.revokeObjectURL(fileUrl);
      fileUrl = "";
    }
    if (imagePreviewUrl) {
      URL.revokeObjectURL(imagePreviewUrl);
      imagePreviewUrl = "";
    }
    if (convertedUrl.startsWith("blob:")) {
      URL.revokeObjectURL(convertedUrl);
      convertedUrl = "";
    }
  }

  onDestroy(() => {
    revokeUrls();
  });

  function detectCategory(file: File): CatalogEntry | null {
    const mime = file.type.toLowerCase();
    const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
    for (const entry of FORMAT_CATALOG) {
      if (
        entry.match.some((regex) => regex.test(mime) || regex.test(extension))
      ) {
        return entry;
      }
    }
    return null;
  }

  function humanFileSize(bytes: number) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const exponent = Math.min(
      Math.floor(Math.log(bytes) / Math.log(1024)),
      units.length - 1,
    );
    const value = bytes / Math.pow(1024, exponent);
    return `${value.toFixed(value >= 10 ? 0 : 1)} ${units[exponent]}`;
  }

  function handleFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    revokeUrls();
    selectedFile = file;
    resetState();
    metadata = null;
    if (!file) {
      selectedCategory = null;
      outputFormat = "";
      return;
    }

    selectedCategory = detectCategory(file);
    outputFormat = selectedCategory?.outputs[0] ?? "";
    fileUrl = URL.createObjectURL(file);
    metadata = {
      sizeLabel: humanFileSize(file.size),
      typeLabel: file.type || `.${file.name.split(".").pop()}`,
    };

    if (selectedCategory?.id === "image") {
      imagePreviewUrl = fileUrl;
    }
  }

  function clearFile() {
    selectedFile = null;
    selectedCategory = null;
    outputFormat = "";
    metadata = null;
    resetState();
    revokeUrls();
  }

  async function convertImage(file: File, format: string) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(new Error("Unable to read file"));
      reader.onload = () => {
        const image = new Image();
        image.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = image.width;
          canvas.height = image.height;
          const context = canvas.getContext("2d");
          if (!context) {
            reject(new Error("Canvas context unavailable"));
            return;
          }
          context.drawImage(image, 0, 0);
          try {
            const dataUrl = canvas.toDataURL(`image/${format}`);
            resolve(dataUrl);
          } catch (error) {
            reject(
              new Error("This browser cannot export to the selected format."),
            );
          }
        };
        image.onerror = () => reject(new Error("Unable to decode image"));
        image.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    });
  }

  async function handleConvert() {
    if (!selectedFile || !selectedCategory) return;
    conversionError = "";
    convertedUrl && URL.revokeObjectURL(convertedUrl);
    convertedUrl = "";
    converting = true;
    try {
      if (!selectedCategory.convertable) {
        throw new Error("This format is read-only in the browser preview.");
      }
      if (!outputFormat) {
        throw new Error("Choose an output format to continue.");
      }
      if (selectedCategory.id === "image") {
        const dataUrl = await convertImage(selectedFile, outputFormat);
        convertedUrl = dataUrl;
      } else {
        throw new Error("Conversion not implemented for this file type yet.");
      }
    } catch (error) {
      conversionError =
        error instanceof Error ? error.message : "Conversion failed.";
    } finally {
      converting = false;
    }
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
    <div class="space-y-6">
      <div
        class="flex flex-col gap-4 rounded-3xl border-2 border-dashed border-slate-300 bg-white/80 p-6 text-center shadow-sm transition hover:border-blue-400 dark:border-slate-600 dark:bg-slate-900/60 dark:hover:border-sky-500"
      >
        <div class="flex flex-col items-center gap-2">
          <p class="text-sm font-medium text-slate-700 dark:text-slate-200">
            {selectedFile ? selectedFile.name : "Choose or drop a file"}
          </p>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            PNG, JPG, WebP, MP3, MP4, PDF and more.
          </p>
        </div>
        <div class="flex items-center justify-center gap-3">
          <label
            class="inline-flex cursor-pointer items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            <input type="file" class="hidden" on:change={handleFileChange} />
            <span>Select file</span>
          </label>
          {#if selectedFile}
            <button
              type="button"
              class="rounded-full border border-rose-300 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-400/60 dark:text-rose-300 dark:hover:bg-rose-500/10"
              on:click={clearFile}
            >
              Clear
            </button>
          {/if}
        </div>
      </div>

      {#if selectedFile && selectedCategory}
        <div
          class="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
        >
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              File details
            </h2>
            <span
              class="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900"
            >
              {selectedCategory.title}
            </span>
          </div>
          <dl
            class="grid gap-3 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2"
          >
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                File name
              </dt>
              <dd class="font-medium">{selectedFile.name}</dd>
            </div>
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Size
              </dt>
              <dd class="font-medium">{metadata?.sizeLabel}</dd>
            </div>
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Type
              </dt>
              <dd class="font-medium text-wrap text-break">
                {metadata?.typeLabel}
              </dd>
            </div>
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Output format
              </dt>
              <dd>
                <select
                  class="mt-1 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  bind:value={outputFormat}
                  disabled={!selectedCategory.outputs.length}
                >
                  {#if !selectedCategory.outputs.length}
                    <option value="">No browser-friendly outputs</option>
                  {:else}
                    {#each selectedCategory.outputs as option}
                      <option value={option}>{option.toUpperCase()}</option>
                    {/each}
                  {/if}
                </select>
              </dd>
            </div>
          </dl>

          {#if selectedCategory.note}
            <p
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-800/70 dark:text-slate-300"
            >
              {selectedCategory.note}
            </p>
          {/if}

          <div class="flex flex-wrap items-center gap-3">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-full border border-transparent bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              on:click={handleConvert}
              disabled={!selectedCategory.convertable || converting}
            >
              {converting
                ? "Converting�"
                : selectedCategory.convertable
                  ? "Convert"
                  : "Preview only"}
            </button>
            {#if convertedUrl}
              <a
                class="inline-flex items-center justify-center rounded-full border border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
                href={convertedUrl}
                download={`converted.${outputFormat || "png"}`}
              >
                Download converted
              </a>
            {/if}
            {#if conversionError}
              <span
                class="rounded-full border border-rose-400 px-3 py-1 text-xs font-semibold text-rose-500 dark:border-rose-400/70 dark:text-rose-300"
              >
                {conversionError}
              </span>
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Preview
        </h2>
        {#if selectedCategory?.id === "image" && selectedFile}
          <div
            class="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-900/70"
          >
            {#if imagePreviewUrl}
              <img
                src={imagePreviewUrl}
                alt="Original preview"
                class="mx-auto max-h-[320px] w-full object-contain"
              />
            {/if}
          </div>
        {:else if selectedFile}
          <div
            class="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300"
          >
            <p>
              <span class="font-semibold">File selected:</span>
              {selectedFile.name}
            </p>
            <p>
              The current browser demo focuses on image conversion. Use the
              controls on the left to inspect metadata or prepare for desktop
              conversion.
            </p>
          </div>
        {:else}
          <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Select a file to see a preview or metadata summary.
          </p>
        {/if}
      </div>

      {#if convertedUrl && selectedCategory?.id === "image"}
        <div
          class="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 shadow-sm dark:border-emerald-500/50 dark:bg-emerald-500/10"
        >
          <h3
            class="text-sm font-semibold text-emerald-700 dark:text-emerald-200"
          >
            Converted preview
          </h3>
          <img
            src={convertedUrl}
            alt="Converted preview"
            class="mt-3 max-h-[260px] w-full rounded-2xl border border-emerald-200 object-contain dark:border-emerald-500/40"
          />
        </div>
      {/if}
    </div>
  </div>
</section>
