<script>
  let urlInput = "https://example.com";
  let loading = false;
  let errorMessage = "";
  let linkSummary = null;
  let linkList = [];

  async function countLinks() {
    if (!urlInput.trim()) {
      errorMessage = "Enter a URL to analyze.";
      return;
    }
    loading = true;
    errorMessage = "";
    linkSummary = null;
    linkList = [];
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
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const data = analyzeLinks(doc, baseUrl);
      linkSummary = data.summary;
      linkList = data.links;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errorMessage = `Unable to fetch links (${message}). The site may block requests or be unreachable.`;
    } finally {
      loading = false;
    }
  }

  function analyzeLinks(doc, baseUrl) {
    const anchors = Array.from(doc.querySelectorAll("a[href]"));
    const origin = (() => {
      try {
        return new URL(baseUrl).origin;
      } catch (error) {
        return "";
      }
    })();

    const summary = {
      total: anchors.length,
      internal: 0,
      external: 0,
      anchors: 0,
      mailto: 0,
      tel: 0,
      javascript: 0,
      nofollow: 0,
    };

    const rows = anchors.map((anchor) => {
      const href = anchor.getAttribute("href") ?? "";
      const absoluteHref = toAbsolute(href, baseUrl);
      const rel = anchor.getAttribute("rel") ?? "";
      const text = anchor.textContent?.replace(/\s+/g, " ")?.trim() ?? "";
      const type = classifyLink(absoluteHref, origin);
      summary[type] += 1;
      if (rel.split(/\s+/).includes("nofollow")) {
        summary.nofollow += 1;
      }
      return {
        href: absoluteHref,
        text,
        type,
        rel,
      };
    });

    return {
      summary,
      links: rows,
    };
  }

  function classifyLink(href, origin) {
    if (!href) {
      return "javascript";
    }
    if (href.startsWith("#")) {
      return "anchors";
    }
    if (href.toLowerCase().startsWith("mailto:")) {
      return "mailto";
    }
    if (href.toLowerCase().startsWith("tel:")) {
      return "tel";
    }
    if (href.toLowerCase().startsWith("javascript:")) {
      return "javascript";
    }
    if (!/^https?:/i.test(href)) {
      return "internal";
    }
    return href.startsWith(origin) ? "internal" : "external";
  }

  function toAbsolute(href, base) {
    try {
      return new URL(href, base).href;
    } catch (error) {
      return href;
    }
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
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
        on:click={countLinks}
        disabled={loading}
      >
        {loading ? "Counting..." : "Count links"}
      </button>
    </div>
    {#if errorMessage}
      <p class="mt-2 text-xs text-rose-500 dark:text-rose-300">
        {errorMessage}
      </p>
    {/if}
    <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
      Link counting requires cross-origin access; if blocked, results will not
      load.
    </p>
  </div>

  {#if linkSummary}
    <div class="grid gap-6 lg:grid-cols-2">
      <div
        class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Overview
        </h2>
        <dl class="grid gap-3 text-sm md:grid-cols-2">
          <div
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Total links
            </p>
            <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {linkSummary.total}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Internal
            </p>
            <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {linkSummary.internal}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              External
            </p>
            <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {linkSummary.external}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Anchor links
            </p>
            <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {linkSummary.anchors}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Mailto
            </p>
            <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {linkSummary.mailto}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Tel
            </p>
            <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {linkSummary.tel}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Javascript
            </p>
            <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {linkSummary.javascript}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Nofollow
            </p>
            <p class="text-lg font-bold text-indigo-700 dark:text-indigo-300">
              {linkSummary.nofollow}
            </p>
          </div>
        </dl>
      </div>

      <div
        class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Link breakdown
        </h2>
        <div
          class="max-h-96 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <ul class="space-y-3 text-sm">
            {#each linkList as link}
              <li
                class="rounded-xl border border-slate-100 bg-white px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              >
                <div
                  class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
                >
                  <span class="font-semibold uppercase tracking-wide"
                    >{link.type}</span
                  >
                  {#if link.rel}
                    <span>rel={link.rel}</span>
                  {/if}
                </div>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  class="break-all text-sm text-indigo-600 hover:underline dark:text-indigo-300"
                  >{link.href}</a
                >
                {#if link.text}
                  <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Anchor text: {link.text}
                  </p>
                {/if}
              </li>
            {/each}
          </ul>
        </div>
      </div>
    </div>
  {/if}
</section>
