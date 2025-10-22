<script>
  let urlInput = "https://example.com";
  let loading = false;
  let errorMessage = "";
  let results = null;

  async function runAudit() {
    if (!urlInput.trim()) {
      errorMessage = "Enter a URL to analyze.";
      return;
    }
    loading = true;
    errorMessage = "";
    results = null;
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
          /* ignore JSON parsing issues */
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
      results = buildReport(doc, baseUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      errorMessage = `Unable to load the page (${message}). The site may block requests or be unreachable.`;
    } finally {
      loading = false;
    }
  }

  function buildReport(doc, baseUrl) {
    const title =
      doc.querySelector("title")?.textContent?.trim() ?? "Not found";
    const metaDescription =
      doc.querySelector('meta[name="description"]')?.getAttribute("content") ??
      "Not found";
    const headings = Array.from(doc.querySelectorAll("h1, h2, h3"));
    const h1 = headings.filter((node) => node.tagName.toLowerCase() === "h1");
    const h2 = headings.filter((node) => node.tagName.toLowerCase() === "h2");
    const h3 = headings.filter((node) => node.tagName.toLowerCase() === "h3");

    const textContent = doc.body?.textContent ?? "";
    const words = textContent
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .filter((word) => word.length > 0);

    const images = Array.from(doc.querySelectorAll("img"));
    const imagesMissingAlt = images.filter(
      (img) => !(img.getAttribute("alt") || "").trim(),
    );

    const links = Array.from(doc.querySelectorAll("a[href]"));
    const origin = (() => {
      try {
        return new URL(baseUrl).origin;
      } catch (error) {
        return "";
      }
    })();

    const linkMetrics = links.reduce(
      (acc, anchor) => {
        const href = anchor.getAttribute("href") ?? "";
        const rel = anchor.getAttribute("rel") ?? "";
        const absolute = toAbsoluteUrl(href, baseUrl);
        if (absolute.startsWith(origin)) {
          acc.internal += 1;
        } else if (/^https?:/i.test(absolute)) {
          acc.external += 1;
        } else if (absolute.startsWith("mailto:")) {
          acc.mailto += 1;
        } else {
          acc.other += 1;
        }
        if (rel.split(/\s+/).includes("nofollow")) {
          acc.nofollow += 1;
        }
        return acc;
      },
      { internal: 0, external: 0, mailto: 0, other: 0, nofollow: 0 },
    );

    const lighthouseHints = buildHints({
      title,
      metaDescription,
      h1Count: h1.length,
      wordCount: words.length,
      imagesMissingAlt: imagesMissingAlt.length,
    });

    return {
      title,
      titleLength: title === "Not found" ? 0 : title.length,
      metaDescription,
      descriptionLength:
        metaDescription === "Not found" ? 0 : metaDescription.length,
      headings: { h1: h1.length, h2: h2.length, h3: h3.length },
      wordCount: words.length,
      imageCount: images.length,
      imagesMissingAlt: imagesMissingAlt.length,
      linkMetrics,
      hints: lighthouseHints,
    };
  }

  function toAbsoluteUrl(href, base) {
    try {
      return new URL(href, base).href;
    } catch (error) {
      return href;
    }
  }

  function buildHints(metrics) {
    const hints = [];
    if (metrics.title === "Not found") {
      hints.push({ type: "error", message: "Missing <title> tag." });
    } else if (metrics.titleLength < 30) {
      hints.push({
        type: "warn",
        message: "Title is shorter than 30 characters.",
      });
    } else if (metrics.titleLength > 65) {
      hints.push({
        type: "warn",
        message: "Title exceeds 65 characters and may be truncated.",
      });
    }

    if (metrics.metaDescription === "Not found") {
      hints.push({ type: "error", message: "Missing meta description." });
    } else if (
      metrics.descriptionLength < 110 ||
      metrics.descriptionLength > 170
    ) {
      hints.push({
        type: "warn",
        message:
          "Meta description length should be between 110 and 170 characters.",
      });
    }

    if (metrics.h1Count === 0) {
      hints.push({ type: "error", message: "No H1 heading found." });
    } else if (metrics.h1Count > 1) {
      hints.push({ type: "warn", message: "Multiple H1 headings detected." });
    }

    if (metrics.wordCount < 200) {
      hints.push({
        type: "warn",
        message: "Body content has fewer than 200 words.",
      });
    }

    if (metrics.imagesMissingAlt > 0) {
      hints.push({
        type: "warn",
        message: `${metrics.imagesMissingAlt} image(s) missing alt text.`,
      });
    }

    if (hints.length === 0) {
      hints.push({ type: "success", message: "No major issues detected." });
    }

    return hints;
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
        on:click={runAudit}
        disabled={loading}
      >
        {loading ? "Scanning..." : "Run SEO check"}
      </button>
    </div>
    {#if errorMessage}
      <p class="mt-2 text-xs text-rose-500 dark:text-rose-300">
        {errorMessage}
      </p>
    {/if}
    <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
      Note: Some sites block cross-origin fetches. Paste accessible URLs for
      best results.
    </p>
  </div>

  {#if results}
    <div class="grid gap-6 lg:grid-cols-2">
      <div
        class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          On-page basics
        </h2>
        <dl class="space-y-3 text-sm">
          <div
            class="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <dt class="text-slate-500 dark:text-slate-400">Title</dt>
            <dd class="flex-1 text-right text-slate-700 dark:text-slate-200">
              {results.title}
            </dd>
          </div>
          <div
            class="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <dt class="text-slate-500 dark:text-slate-400">Title length</dt>
            <dd class="font-mono text-indigo-700 dark:text-indigo-300">
              {results.titleLength}
            </dd>
          </div>
          <div
            class="flex items-start justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <dt class="text-slate-500 dark:text-slate-400">Meta description</dt>
            <dd class="flex-1 text-right text-slate-700 dark:text-slate-200">
              {results.metaDescription}
            </dd>
          </div>
          <div
            class="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <dt class="text-slate-500 dark:text-slate-400">
              Description length
            </dt>
            <dd class="font-mono text-indigo-700 dark:text-indigo-300">
              {results.descriptionLength}
            </dd>
          </div>
          <div
            class="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <dt class="text-slate-500 dark:text-slate-400">Word count</dt>
            <dd class="font-mono text-indigo-700 dark:text-indigo-300">
              {results.wordCount}
            </dd>
          </div>
        </dl>

        <div
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Headings
          </h3>
          <ul class="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <li>
              H1: <span class="font-mono text-indigo-700 dark:text-indigo-300"
                >{results.headings.h1}</span
              >
            </li>
            <li>
              H2: <span class="font-mono text-indigo-700 dark:text-indigo-300"
                >{results.headings.h2}</span
              >
            </li>
            <li>
              H3: <span class="font-mono text-indigo-700 dark:text-indigo-300"
                >{results.headings.h3}</span
              >
            </li>
          </ul>
        </div>
      </div>

      <div
        class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Media & links
        </h2>
        <dl class="space-y-3 text-sm">
          <div
            class="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <dt class="text-slate-500 dark:text-slate-400">Images</dt>
            <dd class="font-mono text-indigo-700 dark:text-indigo-300">
              {results.imageCount}
            </dd>
          </div>
          <div
            class="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <dt class="text-slate-500 dark:text-slate-400">
              Images missing alt
            </dt>
            <dd class="font-mono text-indigo-700 dark:text-indigo-300">
              {results.imagesMissingAlt}
            </dd>
          </div>
        </dl>

        <div
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Link distribution
          </h3>
          <ul class="mt-2 space-y-1 text-sm text-slate-600 dark:text-slate-300">
            <li>
              Internal links: <span
                class="font-mono text-indigo-700 dark:text-indigo-300"
                >{results.linkMetrics.internal}</span
              >
            </li>
            <li>
              External links: <span
                class="font-mono text-indigo-700 dark:text-indigo-300"
                >{results.linkMetrics.external}</span
              >
            </li>
            <li>
              Mailto links: <span
                class="font-mono text-indigo-700 dark:text-indigo-300"
                >{results.linkMetrics.mailto}</span
              >
            </li>
            <li>
              Other links: <span
                class="font-mono text-indigo-700 dark:text-indigo-300"
                >{results.linkMetrics.other}</span
              >
            </li>
            <li>
              Nofollow links: <span
                class="font-mono text-indigo-700 dark:text-indigo-300"
                >{results.linkMetrics.nofollow}</span
              >
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div
      class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Recommendations
      </h2>
      <ul class="mt-3 space-y-2 text-sm">
        {#each results.hints as hint}
          <li
            class="rounded-xl border px-3 py-2"
            class:border-rose-200={hint.type === "error"}
            class:bg-rose-50={hint.type === "error"}
            class:border-amber-200={hint.type === "warn"}
            class:bg-amber-50={hint.type === "warn"}
            class:border-emerald-200={hint.type === "success"}
            class:bg-emerald-50={hint.type === "success"}
            class:dark:border-rose-900={hint.type === "error"}
            class:dark:bg-rose-950={hint.type === "error"}
            class:dark:border-amber-900={hint.type === "warn"}
            class:dark:bg-amber-950={hint.type === "warn"}
            class:dark:border-emerald-900={hint.type === "success"}
            class:dark:bg-emerald-950={hint.type === "success"}
          >
            <span class="font-medium text-slate-700 dark:text-slate-200"
              >{hint.message}</span
            >
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</section>
