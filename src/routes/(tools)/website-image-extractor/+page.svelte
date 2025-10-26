<script>
  let urlInput = "https://example.com";
  let loading = false;
  let errorMessage = "";
  let images = [];

  async function extract() {
    if (!urlInput.trim()) {
      errorMessage = "Enter a URL to fetch images.";
      return;
    }
    loading = true;
    errorMessage = "";
    images = [];
    try {
      const targetUrl = urlInput.trim();
      const response = await fetch(
        `/api/fetch-html?url=${encodeURIComponent(targetUrl)}`,
      );
      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const payload = await response.json();
          message = payload?.message ?? payload?.error ?? message;
        } catch (parseError) {
          /* ignore JSON parse failures */
        }
        throw new Error(message);
      }
      const payload = await response.json();
      const html = payload?.html ?? "";
      if (!html) {
        throw new Error("Empty response received from the target URL.");
      }
      const baseUrl = payload?.finalUrl ?? targetUrl;
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      images = Array.from(doc.querySelectorAll("img"))
        .map((img) => {
          const src = img.getAttribute("src") ?? "";
          const alt = img.getAttribute("alt") ?? "";
          const width = img.getAttribute("width") ?? "";
          const height = img.getAttribute("height") ?? "";
          const absoluteSrc = toAbsoluteUrl(src, baseUrl);
          return {
            src: absoluteSrc,
            alt: alt.trim(),
            width: width.trim(),
            height: height.trim(),
          };
        })
        .filter((item) => item.src);
      if (!images.length) {
        errorMessage = "No images detected on this page.";
      }
    } catch (error) {
      errorMessage = `Unable to fetch images (${error.message}). The site may block requests or be unreachable.`;
    } finally {
      loading = false;
    }
  }

  function toAbsoluteUrl(href, base) {
    try {
      return new URL(href, base).href;
    } catch (error) {
      return href;
    }
  }

  function downloadCSV() {
    if (!images.length) {
      return;
    }
    const header = "Source,Alt text,Width,Height";
    const rows = images.map((img) => {
      const alt = img.alt.replace(/"/g, '""');
      return `"${img.src.replace(/"/g, '""')}","${alt}","${img.width}","${img.height}"`;
    });
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "images.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
</script>

<section class="space-y-6">
  <div
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="flex flex-col gap-3 md:flex-row">
      <input
        class="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
        bind:value={urlInput}
        placeholder="https://www.yourdomain.com"
      />
      <button
        class="inline-flex items-center justify-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
        on:click={extract}
        disabled={loading}
      >
        {loading ? "Fetching..." : "Extract images"}
      </button>
    </div>
    {#if errorMessage}
      <p class="mt-2 text-xs text-rose-500 dark:text-rose-300">
        {errorMessage}
      </p>
    {/if}
    <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
      Extraction relies on cross-origin fetch. If blocked, try hosting the page
      content locally.
    </p>
  </div>

  {#if images.length}
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Found {images.length} image(s)
      </h2>
      <button
        class="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
        on:click={downloadCSV}
      >
        Download CSV
      </button>
    </div>
    <div class="grid gap-4 md:grid-cols-2">
      {#each images as image}
        <div
          class="flex gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
        >
          <div
            class="hidden h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950/70 md:block"
          >
            <img
              src={image.src}
              alt={image.alt}
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
          <div class="flex-1 space-y-2 text-sm">
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Source
              </p>
              <a
                href={image.src}
                target="_blank"
                rel="noreferrer"
                class="break-all text-indigo-600 hover:underline dark:text-indigo-300"
                >{image.src}</a
              >
            </div>
            <div>
              <p
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Alt text
              </p>
              <p class="text-slate-700 dark:text-slate-200">
                {image.alt || "N/A"}
              </p>
            </div>
            <div
              class="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400"
            >
              {#if image.width}
                <span>Width: {image.width}</span>
              {/if}
              {#if image.height}
                <span>Height: {image.height}</span>
              {/if}
            </div>
          </div>
        </div>
      {/each}
    </div>
  {/if}
</section>
