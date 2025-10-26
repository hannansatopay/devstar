<script>
  let urlInput = "https://example.com";
  let loading = false;
  let errorMessage = "";
  let result = null;

  async function detect() {
    if (!urlInput.trim()) {
      errorMessage = "Enter a URL to inspect.";
      return;
    }
    loading = true;
    errorMessage = "";
    result = null;
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
          /* ignore */
        }
        throw new Error(message);
      }
      const payload = await response.json();
      const html = payload?.html ?? "";
      if (!html) {
        throw new Error("Empty response received from the target URL.");
      }
      const baseUrl = payload?.finalUrl ?? targetUrl;
      result = parseSource(html, baseUrl);
      if (!result.theme && result.plugins.length === 0) {
        errorMessage =
          "No WordPress fingerprints detected. The site may not use WordPress or blocks detection.";
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errorMessage = `Unable to fetch the page (${message}). The site may block requests or be unreachable.`;
    } finally {
      loading = false;
    }
  }

  function parseSource(html, baseUrl) {
    const themeMatch = html.match(/wp-content\/themes\/([\w-]+)/i);
    const theme = themeMatch ? themeMatch[1] : "";
    const plugins = Array.from(
      html.matchAll(/wp-content\/plugins\/([\w-]+)/gi),
    ).map((match) => match[1]);
    const uniquePlugins = Array.from(new Set(plugins));
    const generatorMeta =
      html.match(/<meta\s+name="generator"\s+content="([^"]+)"/i)?.[1] ?? "";
    const stylesheet = theme
      ? toAbsoluteUrl(`/wp-content/themes/${theme}/style.css`, baseUrl)
      : "";
    return {
      theme,
      stylesheet,
      generator: generatorMeta,
      plugins: uniquePlugins.map((slug) => ({
        slug,
        guessUrl: toAbsoluteUrl(`/wp-content/plugins/${slug}/`, baseUrl),
      })),
    };
  }

  function toAbsoluteUrl(path, base) {
    try {
      return new URL(path, base).href;
    } catch (error) {
      return path;
    }
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
        on:click={detect}
        disabled={loading}
      >
        {loading ? "Scanning..." : "Detect theme"}
      </button>
    </div>
    {#if errorMessage}
      <p class="mt-2 text-xs text-rose-500 dark:text-rose-300">
        {errorMessage}
      </p>
    {/if}
    <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
      Detection relies on WordPress file paths inside the page source.
      Obfuscated or cached pages may hide this information.
    </p>
  </div>

  {#if result}
    <div
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Theme details
      </h2>
      {#if result.theme}
        <div
          class="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <p class="text-sm text-slate-700 dark:text-slate-200">
            <span class="font-semibold">Theme:</span>
            {result.theme}
          </p>
          {#if result.stylesheet}
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Stylesheet: <a
                class="text-indigo-600 hover:underline dark:text-indigo-300"
                href={result.stylesheet}
                target="_blank"
                rel="noreferrer">{result.stylesheet}</a
              >
            </p>
          {/if}
        </div>
      {:else}
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Theme could not be detected.
        </p>
      {/if}

      <div
        class="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
      >
        <p class="text-sm text-slate-700 dark:text-slate-200">
          <span class="font-semibold">Generator meta:</span>
          {result.generator || "Not present"}
        </p>
      </div>

      <div
        class="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
      >
        <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          Plugins
        </h3>
        {#if result.plugins.length}
          <ul class="mt-2 space-y-2 text-sm">
            {#each result.plugins as plugin}
              <li
                class="rounded-lg border border-slate-200 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              >
                <span class="font-semibold text-slate-700 dark:text-slate-200"
                  >{plugin.slug}</span
                >
                <div class="text-xs text-slate-500 dark:text-slate-400">
                  {plugin.guessUrl}
                </div>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="text-sm text-slate-500 dark:text-slate-400">
            No plugin signatures found.
          </p>
        {/if}
      </div>
    </div>
  {/if}
</section>
