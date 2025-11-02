<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import html2canvas from "html2canvas";
  import { browser } from "$app/environment";
  import { onDestroy } from "svelte";

  type FrameKind = "browser" | "phone" | "laptop";

  let frame: FrameKind = "browser";
  let imageSrc = "";
  let title = "devstar.app";
  let background = "linear-gradient(135deg, #a855f7, #6366f1)";
  let shadow = true;
  let padding = 48;
  let cornerRadius = 32;
  let exportScale = 2;
  let exporting = false;
  let mockupRef: HTMLDivElement | null = null;
  let dragOver = false;

  const defaultImage =
    "https://images.unsplash.com/photo-1523475472560-d2df97ec485c?auto=format&fit=crop&w=900&q=60";

  if (browser) {
    imageSrc = defaultImage;
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === "string") {
        imageSrc = result;
      }
    };
    reader.readAsDataURL(file);
  }

  function onDrop(event: DragEvent) {
    event.preventDefault();
    dragOver = false;
    const file = event.dataTransfer?.files?.[0];
    if (file) handleFile(file);
  }

  function onDragOver(event: DragEvent) {
    event.preventDefault();
    dragOver = true;
  }

  function onDragLeave() {
    dragOver = false;
  }

  async function exportMockup() {
    if (!mockupRef || !browser) return;
    try {
      exporting = true;
      const canvas = await html2canvas(mockupRef, {
        backgroundColor: null,
        scale: exportScale,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `mockup-${frame}.png`;
      link.click();
    } finally {
      exporting = false;
    }
  }

  const frameOptions: FrameKind[] = ["browser", "phone", "laptop"];
  const backgrounds = [
    "linear-gradient(135deg, #0f172a, #312e81, #6366f1)",
    "linear-gradient(135deg, #fbbf24, #f97316, #ef4444)",
    "linear-gradient(135deg, #34d399, #22d3ee, #60a5fa)",
    "linear-gradient(135deg, #f5f3ff, #ede9fe, #fef9c3)",
    "#0f172a",
    "#1f2937",
    "#f1f5f9",
    "#ffffff",
  ];

  onDestroy(() => {
    dragOver = false;
  });
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
    <div class="space-y-6">
      <div
        class={`relative overflow-hidden rounded-3xl border-2 border-dashed px-6 py-12 text-center transition ${
          dragOver
            ? "border-indigo-400 bg-indigo-50 text-indigo-600 dark:border-indigo-300 dark:bg-indigo-500/10 dark:text-indigo-200"
            : "border-slate-300 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
        }`}
        on:drop={onDrop}
        on:dragover={onDragOver}
        on:dragleave={onDragLeave}
      >
        <p class="text-sm font-semibold uppercase tracking-wide">
          Drop image here or choose a file
        </p>
        <p class="mt-2 text-xs text-slate-400 dark:text-slate-500">
          PNG, JPG, or WebP up to 5 MB.
        </p>
        <label
          class="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
        >
          Browse files
          <input
            class="sr-only"
            type="file"
            accept="image/*"
            on:change={(event) => {
              const file = event.currentTarget.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </label>
      </div>

      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Frame options
          </h2>
          <Copy text={background} label="Copy background" floating={false} />
        </div>
        <div class="flex gap-2">
          {#each frameOptions as kind}
            <button
              type="button"
              class={`flex-1 rounded-2xl border px-3 py-2 text-sm transition ${
                frame === kind
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
              }`}
              on:click={() => (frame = kind)}
            >
              {kind}
            </button>
          {/each}
        </div>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Title</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="text"
            bind:value={title}
          />
        </label>
        <div class="grid gap-4 sm:grid-cols-2">
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Padding</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="range"
              min="24"
              max="96"
              step="8"
              bind:value={padding}
            />
          </label>
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Corner radius</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="range"
              min="12"
              max="48"
              step="4"
              bind:value={cornerRadius}
            />
          </label>
        </div>
        <div class="grid gap-2 sm:grid-cols-4">
          {#each backgrounds as color}
            <button
              type="button"
              class={`h-12 rounded-2xl border transition ${
                background === color
                  ? "border-indigo-500"
                  : "border-slate-200 dark:border-slate-700"
              }`}
              style={`background:${color}`}
              on:click={() => (background = color)}
            ></button>
          {/each}
        </div>
        <label
          class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <input
            class="size-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400"
            type="checkbox"
            bind:checked={shadow}
          />
          Include drop shadow
        </label>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Export scale</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="range"
            min="1"
            max="3"
            step="0.5"
            bind:value={exportScale}
          />
        </label>
        <button
          type="button"
          class="inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          on:click={exportMockup}
          disabled={exporting || !imageSrc}
        >
          {exporting ? "Exporting..." : "Download PNG"}
        </button>
      </div>
    </div>

    <div
      class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Preview
        </h2>
        <span class="text-xs text-slate-500 dark:text-slate-400">
          Drag to replace the screenshot anytime
        </span>
      </div>
      <div class="mt-6 overflow-auto">
        <div
          bind:this={mockupRef}
          class={`relative mx-auto flex max-w-3xl flex-col items-center justify-center rounded-[40px] p-10 transition`}
          style={`background:${background}; padding:${padding}px; border-radius:${cornerRadius}px; box-shadow:${
            shadow ? "0 60px 120px -50px rgba(15,23,42,0.6)" : "none"
          }`}
        >
          {#if frame === "browser"}
            <div
              class="w-full rounded-[30px] bg-white/95 shadow-lg dark:bg-slate-950"
            >
              <div
                class="flex items-center gap-2 rounded-t-[30px] border-b border-slate-200 px-6 py-4 dark:border-slate-800 dark:bg-slate-900"
              >
                <span class="size-3 rounded-full bg-rose-400" />
                <span class="size-3 rounded-full bg-amber-400" />
                <span class="size-3 rounded-full bg-emerald-400" />
                <div
                  class="ml-6 flex h-7 flex-1 items-center rounded-full bg-slate-100 px-3 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400"
                >
                  {title}
                </div>
              </div>
              <img
                class="h-full w-full rounded-b-[30px] object-cover"
                src={imageSrc}
                alt="Mockup screenshot"
                loading="lazy"
              />
            </div>
          {:else if frame === "phone"}
            <div
              class="relative w-[280px] rounded-[60px] border border-slate-200 bg-black shadow-2xl dark:border-slate-700"
            >
              <div
                class="absolute inset-x-16 top-3 h-4 rounded-full bg-slate-900/90"
              ></div>
              <img
                class="m-3 h-[520px] w-[246px] rounded-[44px] object-cover"
                src={imageSrc}
                alt="Phone mockup"
                loading="lazy"
              />
            </div>
          {:else}
            <div
              class="relative w-[520px] rounded-[18px] border border-slate-200 bg-slate-900 shadow-xl dark:border-slate-700"
            >
              <div
                class="absolute inset-x-24 -top-5 h-5 rounded-t-3xl bg-slate-800"
              ></div>
              <img
                class="mx-auto mt-4 w-[480px] rounded-xl object-cover"
                src={imageSrc}
                alt="Laptop mockup"
                loading="lazy"
              />
              <div class="mt-4 h-3 rounded-b-[18px] bg-slate-800"></div>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
