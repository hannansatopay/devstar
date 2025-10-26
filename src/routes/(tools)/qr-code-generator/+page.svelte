<script>
  import { onMount } from "svelte";
  import QRCode from "qrcode";
  import Copy from "$lib/Copy.svelte";

  const errorCorrectionLevels = ["L", "M", "Q", "H"];
  const isBrowser = typeof window !== "undefined";

  let mode = "generate";
  let inputText = "https://developerstar.tools";
  let qrSize = 280;
  let qrMargin = 2;
  let errorCorrection = "M";
  let foreground = "#111827";
  let background = "#ffffff";
  let qrDataUrl = "";
  let generatorError = "";

  let scanError = "";
  let scanResult = null;
  let isScanning = false;
  let barcodeSupported = false;
  let scanHistory = [];
  let jsqrPromise;

  onMount(() => {
    barcodeSupported = isBrowser && "BarcodeDetector" in window;
    generateQr();
  });

  $: generateSignature =
    mode === "generate"
      ? [
          inputText,
          qrSize,
          qrMargin,
          errorCorrection,
          foreground,
          background,
        ].join("|")
      : null;

  $: if (generateSignature && mode === "generate") {
    void generateQr();
  }

  async function generateQr() {
    if (!isBrowser || mode !== "generate") return;
    if (!inputText.trim()) {
      qrDataUrl = "";
      generatorError = "Enter text or a URL to generate a QR code.";
      return;
    }
    generatorError = "";
    try {
      qrDataUrl = await QRCode.toDataURL(inputText, {
        width: Number(qrSize),
        margin: Number(qrMargin),
        errorCorrectionLevel: errorCorrection,
        color: { dark: foreground, light: background },
      });
    } catch (error) {
      console.error(error);
      generatorError = "Failed to render QR code.";
      qrDataUrl = "";
    }
  }

  function clearGenerator() {
    inputText = "";
    generatorError = "";
    qrDataUrl = "";
  }

  async function handleFileSelection(event) {
    if (!isBrowser) return;
    const file = event.target.files?.[0];
    if (!file) return;
    scanError = "";
    scanResult = null;
    isScanning = true;

    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement("canvas");
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(bitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      let decoded = null;
      if (barcodeSupported) {
        const detector = new BarcodeDetector({ formats: ["qr_code"] });
        const results = await detector.detect(bitmap);
        if (results.length) decoded = results[0].rawValue;
      }
      if (!decoded) {
        const jsQR = await ensureJsQR();
        if (!jsQR)
          throw new Error("No compatible decoder available in this browser.");
        const result = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "attemptBoth",
        });
        if (result) decoded = result.data;
      }
      if (!decoded) throw new Error("No QR code detected in this image.");

      scanResult = {
        data: decoded,
        width: bitmap.width,
        height: bitmap.height,
        fileName: file.name,
      };

      scanHistory = [
        {
          id: `${file.name}_${Date.now()}`,
          data: decoded,
          fileName: file.name,
          timestamp: new Date().toLocaleTimeString(),
        },
        ...scanHistory,
      ].slice(0, 6);
    } catch (error) {
      scanError =
        error instanceof Error
          ? error.message
          : "Unable to decode this QR code.";
    } finally {
      isScanning = false;
    }
  }

  async function ensureJsQR() {
    if (!isBrowser) return null;
    if (jsqrPromise) return jsqrPromise;
    jsqrPromise = new Promise((resolve, reject) => {
      if (window.jsQR) {
        resolve(window.jsQR);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js";
      script.async = true;
      script.onload = () => resolve(window.jsQR);
      script.onerror = () => reject(new Error("Failed to load jsQR decoder."));
      document.body.appendChild(script);
    });
    try {
      return await jsqrPromise;
    } catch (error) {
      console.error(error);
      jsqrPromise = undefined;
      return null;
    }
  }

  function downloadQr() {
    if (!qrDataUrl) return;
    const link = document.createElement("a");
    link.href = qrDataUrl;
    link.download = "qr-code.png";
    link.click();
  }

  function switchMode(nextMode) {
    if (mode === nextMode) return;
    mode = nextMode;
    if (nextMode === "generate") {
      generatorError = "";
      if (inputText.trim()) void generateQr();
    } else {
      scanError = "";
    }
  }

  $: scannerStatus = barcodeSupported
    ? "BarcodeDetector available – decoding locally"
    : "Falling back to jsQR decoder";
</script>

<section class="space-y-6">
  <header
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <span
          class="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300"
          >QR toolkit</span
        >
        <h1 class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
          QR code generator & scanner
        </h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Build campaign-ready QR codes with custom colours, then validate
          existing codes directly in the browser.
        </p>
      </div>
      <div
        class="flex rounded-full bg-slate-100 p-1 text-xs font-semibold dark:bg-slate-800"
      >
        <button
          type="button"
          class={`rounded-full px-4 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:focus-visible:ring-indigo-700 ${
            mode === "generate"
              ? "bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          }`}
          on:click={() => switchMode("generate")}
        >
          Generate
        </button>
        <button
          type="button"
          class={`rounded-full px-4 py-2 transition focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 dark:focus-visible:ring-indigo-700 ${
            mode === "scan"
              ? "bg-white text-slate-900 shadow dark:bg-slate-900 dark:text-white"
              : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
          }`}
          on:click={() => switchMode("scan")}
        >
          Scan
        </button>
      </div>
    </div>
  </header>

  {#if mode === "generate"}
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 space-y-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <label
              class="text-sm font-semibold text-slate-700 dark:text-slate-200"
              >Content</label
            >
            <Copy text={inputText} label="Copy content" floating={false} />
          </div>
          <textarea
            class="h-36 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            placeholder="Paste or type the data you want to encode"
            bind:value={inputText}
          ></textarea>
          <div
            class="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400"
          >
            <span>{inputText.length} characters</span>
            <span>•</span>
            <span>Error correction: {errorCorrection}</span>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <label
            class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>Size (px)</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="120"
              max="600"
              step="20"
              bind:value={qrSize}
            />
          </label>
          <label
            class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>Quiet zone (margin)</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="0"
              max="10"
              bind:value={qrMargin}
            />
          </label>
          <label
            class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>Error correction</span>
            <select
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={errorCorrection}
            >
              {#each errorCorrectionLevels as level}
                <option value={level}>{level}</option>
              {/each}
            </select>
          </label>
          <div
            class="grid grid-cols-2 gap-3 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <label class="space-y-2">
              <span>Foreground</span>
              <input
                class="h-12 w-full cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700"
                type="color"
                bind:value={foreground}
              />
            </label>
            <label class="space-y-2">
              <span>Background</span>
              <input
                class="h-12 w-full cursor-pointer rounded-xl border border-slate-200 dark:border-slate-700"
                type="color"
                bind:value={background}
              />
            </label>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button
            class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700"
            type="button"
            on:click={generateQr}
          >
            Regenerate
          </button>
          <button
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            type="button"
            on:click={clearGenerator}
          >
            Clear content
          </button>
        </div>

        {#if generatorError}
          <div
            class="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200"
          >
            {generatorError}
          </div>
        {/if}
      </div>

      <div class="space-y-6">
        <article
          class="relative rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
        >
          {#if qrDataUrl}
            <Copy text={qrDataUrl} label="Copy data URL" />
          {/if}
          <div class="flex items-center justify-between gap-3">
            <span
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Preview</span
            >
            <span class="text-xs text-slate-500 dark:text-slate-400"
              >{qrSize} × {qrSize}px</span
            >
          </div>
          {#if qrDataUrl}
            <div class="mt-4 flex flex-col items-center gap-4">
              <img
                src={qrDataUrl}
                alt="Generated QR code"
                class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950"
                style={`width:${qrSize}px;height:${qrSize}px`}
              />
              <div class="flex flex-wrap items-center gap-3">
                <button
                  class="inline-flex items-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700"
                  type="button"
                  on:click={downloadQr}
                >
                  Download PNG
                </button>
                <Copy text={qrDataUrl} label="Copy data URL" floating={false} />
              </div>
            </div>
          {:else}
            <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Add content on the left to render a QR code preview.
            </p>
          {/if}
        </article>

        <article
          class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Tips
          </p>
          <ul class="mt-3 space-y-2 leading-relaxed">
            <li class="flex gap-2">
              <span
                class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-500"
              ></span>
              <span
                >Keep a strong contrast between foreground and background for
                reliable scans.</span
              >
            </li>
            <li class="flex gap-2">
              <span
                class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-500"
              ></span>
              <span
                >Increase error correction to embed logos, but avoid shrinking
                the quiet zone below 2.</span
              >
            </li>
            <li class="flex gap-2">
              <span
                class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-500"
              ></span>
              <span
                >Track marketing links with UTM parameters or short URLs before
                encoding.</span
              >
            </li>
          </ul>
        </article>
      </div>
    </div>
  {:else}
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <label
          class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Select an image</span>
          <input
            class="w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm text-slate-600 outline-none transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            type="file"
            accept="image/*"
            on:change={handleFileSelection}
          />
        </label>
        <div
          class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          {scannerStatus}
        </div>
        {#if isScanning}
          <p class="text-xs text-indigo-600 dark:text-indigo-300">
            Scanning image…
          </p>
        {/if}
        {#if scanError}
          <div
            class="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200"
          >
            {scanError}
          </div>
        {/if}
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Works with PNG, JPG, and SVG files. Photos with glare or extreme
          perspective may require the fallback decoder.
        </p>
      </div>

      <div class="space-y-6">
        <article
          class="relative rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
        >
          {#if scanResult}
            <Copy text={scanResult.data} label="Copy payload" />
          {/if}
          <div class="flex items-center justify-between gap-3">
            <span
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Decoded payload</span
            >
            <span class="text-xs text-slate-500 dark:text-slate-400">
              {scanResult
                ? `${scanResult.width} × ${scanResult.height}px`
                : "Awaiting image"}
            </span>
          </div>
          {#if scanResult}
            <div class="mt-4 space-y-3">
              <textarea
                class="h-40 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-[13px] text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                readonly>{scanResult.data}</textarea
              >
              <div
                class="grid gap-2 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2"
              >
                <span>Source: {scanResult.fileName}</span>
                <span>Dimensions: {scanResult.width} × {scanResult.height}</span
                >
              </div>
            </div>
          {:else}
            <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
              Upload a QR code image to reveal its contents.
            </p>
          {/if}
        </article>

        {#if scanHistory.length}
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >Recent scans</span
              >
              <button
                class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
                type="button"
                on:click={() => (scanHistory = [])}
              >
                Clear
              </button>
            </div>
            <ul
              class="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400"
            >
              {#each scanHistory as entry}
                <li
                  class="rounded-xl border border-slate-200 bg-white px-4 py-2 shadow-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <p class="font-semibold text-slate-900 dark:text-slate-100">
                    {entry.fileName}
                  </p>
                  <p
                    class="mt-1 break-all text-[12px] text-slate-500 dark:text-slate-400"
                  >
                    {entry.data}
                  </p>
                  <p
                    class="mt-1 text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500"
                  >
                    {entry.timestamp}
                  </p>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</section>
