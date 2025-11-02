<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  let base64Input = "";
  let errorMessage = "";
  let fileName = "decoded-image";

  $: previewUrl = computePreviewUrl(base64Input);
  $: errorMessage = previewUrl.error;
  $: dataUrl = previewUrl.dataUrl;

  function computePreviewUrl(value: string) {
    const trimmed = value.trim();
    if (!trimmed) {
      return { dataUrl: "", error: "" };
    }

    try {
      if (trimmed.startsWith("data:")) {
        validateBase64(trimmed.split(",")[1] ?? "");
        return { dataUrl: ensureFileName(trimmed), error: "" };
      }

      const clean = trimmed.replace(/\s+/g, "");
      validateBase64(clean);
      return {
        dataUrl: ensureFileName(`data:image/png;base64,${clean}`),
        error: "",
      };
    } catch (error) {
      return {
        dataUrl: "",
        error:
          "The provided string is not valid Base64 or includes unsupported characters.",
      };
    }
  }

  function validateBase64(value: string) {
    if (!value) throw new Error("Empty string");
    atob(value);
  }

  function ensureFileName(url: string) {
    return url;
  }

  function downloadImage() {
    if (!dataUrl) return;
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    const extension = detectExtension(dataUrl);
    anchor.download = `${fileName || "image"}.${extension}`;
    anchor.click();
  }

  function detectExtension(url: string) {
    if (!url.startsWith("data:")) return "png";
    const mime = url.slice(5, url.indexOf(";"));
    const suffix = mime.split("/")[1];
    return suffix || "png";
  }
</script>

<section class="space-y-6">
  <div class="flex flex-col gap-6 px-4 lg:flex-row">
    <div class="flex flex-1 flex-col gap-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="space-y-4">
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Base64 string
            <textarea
              class="h-64 w-full rounded-2xl border border-slate-200 bg-white/80 p-4 text-[13px] font-mono text-slate-600 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              placeholder="Paste a Base64 string or data URL here"
              bind:value={base64Input}
            />
          </label>

          <div class="flex flex-wrap items-center gap-3">
            <label
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              File name
              <input
                class="ml-3 w-48 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                type="text"
                bind:value={fileName}
              />
            </label>
            <Copy
              text={dataUrl}
              label="Copy data URL"
              floating={false}
            />
            <button
              class="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300 dark:focus:ring-emerald-900"
              type="button"
              on:click={downloadImage}
              disabled={!dataUrl || Boolean(errorMessage)}
            >
              Download image
            </button>
          </div>

          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            Supports full `data:` URLs (e.g., <code
              >data:image/png;base64,…</code
            >) as well as raw Base64 strings. If no MIME type is present, the
            tool assumes a PNG output.
          </div>
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

    <div class="flex flex-1 flex-col gap-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div
          class="flex min-h-[360px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
        >
          {#if dataUrl && !errorMessage}
            <img
              alt="Decoded preview"
              class="max-h-72 w-full rounded-xl object-contain"
              src={dataUrl}
            />
          {:else}
            <div
              class="max-w-sm text-center text-sm text-slate-500 dark:text-slate-400"
            >
              Paste a Base64 string to display a preview and download the
              decoded image.
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
