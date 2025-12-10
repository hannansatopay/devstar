<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import { browser } from "$app/environment";

  type DeviceType = "mobile" | "tablet" | "desktop";

  type DevicePreset = {
    name: string;
    width: number;
    height: number;
    notes?: string;
  };

  const deviceCatalog: Record<DeviceType, DevicePreset[]> = {
    mobile: [
      { name: "iPhone 15 Pro", width: 393, height: 852 },
      { name: "Pixel 8", width: 412, height: 915 },
      { name: "Galaxy S23", width: 360, height: 780 },
      { name: "iPhone SE (2022)", width: 375, height: 667 },
      {
        name: "Galaxy Fold (outer)",
        width: 280,
        height: 653,
        notes: "Folded cover display",
      },
    ],
    tablet: [
      { name: "iPad Air (portrait)", width: 820, height: 1180 },
      { name: "iPad Pro 12.9", width: 1024, height: 1366 },
      { name: "Surface Go", width: 800, height: 1280 },
      { name: "Galaxy Tab S8", width: 800, height: 1340 },
      { name: "Kindle Fire HD", width: 800, height: 1280 },
    ],
    desktop: [
      { name: "1440p (27”)", width: 1440, height: 900 },
      { name: "Full HD (24”)", width: 1920, height: 1080 },
      { name: "MacBook Pro 14”", width: 1512, height: 982 },
      { name: "MacBook Air 13”", width: 1280, height: 832 },
      { name: "Ultra-wide 34”", width: 2560, height: 1080 },
    ],
  };

  const defaultUrl = "https://nuxt.studio/";
  let inputUrl = defaultUrl;
  let previewUrl = "";
  let type: DeviceType = "mobile";
  let orientation: "portrait" | "landscape" = "portrait";
  let zoom = 100;
  let isLoading = false;
  let lastUpdated: Date | null = null;
  let loadError = "";

  let selectedDevice = deviceCatalog[type][0];

  const orientationToggle: Array<{
    value: "portrait" | "landscape";
    label: string;
    description: string;
  }> = [
    {
      value: "portrait",
      label: "Portrait",
      description: "Default upright orientation.",
    },
    {
      value: "landscape",
      label: "Landscape",
      description: "Rotate device 90° clockwise.",
    },
  ];

  $: deviceWidth =
    orientation === "portrait" ? selectedDevice.width : selectedDevice.height;
  $: deviceHeight =
    orientation === "portrait" ? selectedDevice.height : selectedDevice.width;

  $: frameStyle = `width:${deviceWidth}px;height:${deviceHeight}px;min-width:${deviceWidth}px;min-height:${deviceHeight}px;transform:scale(${zoom / 100});transform-origin:top left;`;
  $: viewportStyle = `width:${deviceWidth}px; height:${deviceHeight}px;`;

  function normalizedUrl(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  }

  function loadPreview() {
    const url = normalizedUrl(inputUrl);
    if (!url) {
      loadError = "Enter a URL to load the preview.";
      return;
    }
    loadError = "";
    isLoading = true;
    previewUrl = url;
    lastUpdated = new Date();
  }

  function openInNewTab() {
    const url = normalizedUrl(previewUrl || inputUrl);
    if (!url || !browser) return;
    window.open(url, "_blank", "noopener");
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
    <aside class="space-y-6">
      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Load a page
        </h2>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>URL</span>
          <input
            class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="url"
            bind:value={inputUrl}
            placeholder="https://example.com"
          />
        </label>
        <div class="flex flex-wrap gap-2">
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            on:click={loadPreview}
          >
            Load preview
          </button>
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
            on:click={openInNewTab}
          >
            Open in new tab
          </button>
          <Copy
            text={previewUrl || inputUrl}
            label="Copy URL"
            floating={false}
          />
        </div>
        {#if loadError}
          <p
            class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
          >
            {loadError}
          </p>
        {/if}
      </div>

      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Device presets
        </h2>
        <div class="space-y-4">
          {#each Object.entries(deviceCatalog) as [groupKey, devices]}
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                {groupKey}
              </p>
              <div class="mt-2 grid gap-2 sm:grid-cols-2">
                {#each devices as preset}
                  <button
                    type="button"
                    class={`rounded-2xl border px-3 py-2 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                      preset === selectedDevice
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                        : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-indigo-400/70"
                    }`}
                    on:click={() => {
                      type = groupKey;
                      selectedDevice = preset;
                    }}
                  >
                    <span
                      class="block font-semibold text-slate-800 dark:text-white"
                    >
                      {preset.name}
                    </span>
                    <span
                      class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
                    >
                      {preset.width} × {preset.height}
                      {#if preset.notes}
                        · {preset.notes}
                      {/if}
                    </span>
                  </button>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>

      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Orientation & zoom
        </h2>
        <div class="grid gap-3 sm:grid-cols-2">
          {#each orientationToggle as item}
            <button
              type="button"
              class={`rounded-2xl border px-3 py-2 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                orientation === item.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-indigo-400/70"
              }`}
              on:click={() => (orientation = item.value)}
            >
              <span class="text-sm font-semibold">{item.label}</span>
              <span
                class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
              >
                {item.description}
              </span>
            </button>
          {/each}
        </div>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Zoom: {zoom}%</span>
          <input
            class="accent-indigo-600"
            type="range"
            min="30"
            max="120"
            step="5"
            bind:value={zoom}
          />
        </label>
      </div>
    </aside>

    <div
      class="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Live preview
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Using {selectedDevice.name} · {deviceWidth} × {deviceHeight}
          </p>
        </div>
      </div>

      <div class="relative mt-6 w-full overflow-x-auto">
        <div
          class="mx-auto rounded-3xl w-fit overflow-x-auto overflow-y-hidden"
        >
          {#if previewUrl}
            <div class="inline-flex w-[260px] md:w-[600px] lg:w-fit p-4">
              <div
                class="relative origin-top-left overflow-hidden rounded-[24px] border border-slate-300 bg-white shadow-inner transition dark:border-slate-700 dark:bg-slate-900"
                style={frameStyle}
              >
                <iframe
                  title="Responsive preview"
                  class="pointer-events-auto h-full w-full rounded-[inherit] border-0 bg-white"
                  style={viewportStyle}
                  src={previewUrl}
                  loading="lazy"
                  on:load={() => {
                    isLoading = false;
                    loadError = "";
                  }}
                />
                {#if isLoading}
                  <div
                    class="absolute inset-0 flex flex-col items-center justify-center rounded-[inherit] bg-white/80 text-sm font-semibold text-slate-500 backdrop-blur dark:bg-slate-950/70 dark:text-slate-300"
                  >
                    Loading preview…
                  </div>
                {/if}
              </div>
            </div>
          {:else}
            <div
              class="flex h-[420px] items-center justify-center p-4 text-sm font-semibold text-slate-500 dark:text-slate-400"
            >
              Enter a URL above to get started.
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
