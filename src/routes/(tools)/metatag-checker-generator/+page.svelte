<script>
  import { onMount } from "svelte";

  let urlInput = "https://example.com";
  let loading = false;
  let fetchError = "";
  let auditSummary = null;
  let auditMeta = [];

  let title = "Discover powerful meta tags";
  let description =
    "Generate and audit SEO meta tags with instant previews for search and social sharing.";
  let keywords = "seo, meta tags, generator";
  let ogTitle = "Meta Tag Preview";
  let ogDescription = "Craft high-impact titles and descriptions in seconds.";
  let ogImage = "https://example.com/preview.jpg";
  let twitterCard = "summary_large_image";

  onMount(() => {
    updateSnippet();
  });

  let snippet = "";

  function updateSnippet() {
    const lines = [];
    if (title.trim()) {
      lines.push(`<title>${escapeHtml(title.trim())}</title>`);
    }
    if (description.trim()) {
      lines.push(
        `<meta name="description" content="${escapeHtml(description.trim())}"/>`,
      );
    }
    if (keywords.trim()) {
      lines.push(
        `<meta name="keywords" content="${escapeHtml(keywords.trim())}"/>`,
      );
    }
    if (ogTitle.trim()) {
      lines.push(
        `<meta property="og:title" content="${escapeHtml(ogTitle.trim())}"/>`,
      );
    }
    if (ogDescription.trim()) {
      lines.push(
        `<meta property="og:description" content="${escapeHtml(ogDescription.trim())}"/>`,
      );
    }
    if (ogImage.trim()) {
      lines.push(
        `<meta property="og:image" content="${escapeHtml(ogImage.trim())}"/>`,
      );
    }
    if (twitterCard.trim()) {
      lines.push(
        `<meta name="twitter:card" content="${escapeHtml(twitterCard.trim())}"/>`,
      );
    }
    snippet = lines.join("\n");
  }

  function copySnippet() {
    if (!snippet) {
      return;
    }
    navigator.clipboard?.writeText(snippet).catch(() => {
      /* ignore */
    });
  }

  function cardPreviewDescription() {
    return description.trim()
      ? description.trim().slice(0, 160)
      : "Add a description to update this preview.";
  }

  async function audit() {
    if (!urlInput.trim()) {
      fetchError = "Enter a URL to inspect.";
      return;
    }
    loading = true;
    fetchError = "";
    auditMeta = [];
    auditSummary = null;
    try {
      const targetUrl = urlInput.trim();
      const response = await fetch(
        `/api/metatag-checker?url=${encodeURIComponent(targetUrl)}`,
      );
      if (!response.ok) {
        let message = `HTTP ${response.status}`;
        try {
          const payload = await response.json();
          message = payload?.message ?? payload?.error ?? message;
        } catch (parseError) {
          // ignore JSON parse issues and fall back to default message
        }
        throw new Error(message);
      }

      const payload = await response.json();
      const text = payload?.html ?? "";
      if (!text) {
        throw new Error("Empty response received from the target URL.");
      }

      const parser = new DOMParser();
      const doc = parser.parseFromString(text, "text/html");
      const pageTitle =
        doc.querySelector("title")?.textContent?.trim() ?? "Not found";
      const descriptionTag =
        doc
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") ?? "Not found";
      const keywordsTag =
        doc.querySelector('meta[name="keywords"]')?.getAttribute("content") ??
        "Not found";
      const ogTitleTag =
        doc
          .querySelector('meta[property="og:title"]')
          ?.getAttribute("content") ?? "Not found";
      const ogDescriptionTag =
        doc
          .querySelector('meta[property="og:description"]')
          ?.getAttribute("content") ?? "Not found";
      const ogImageTag =
        doc
          .querySelector('meta[property="og:image"]')
          ?.getAttribute("content") ?? "Not found";
      const twitterCardTag =
        doc
          .querySelector('meta[name="twitter:card"]')
          ?.getAttribute("content") ?? "Not found";

      auditSummary = {
        title: pageTitle,
        description: descriptionTag,
        keywords: keywordsTag,
      };

      const allMeta = Array.from(doc.querySelectorAll("meta"))
        .map((node) => ({
          name:
            node.getAttribute("name") ||
            node.getAttribute("property") ||
            node.getAttribute("http-equiv") ||
            "(unnamed)",
          value: node.getAttribute("content") ?? "",
        }))
        .filter((meta) => meta.value);

      auditMeta = [
        { label: "Title", value: pageTitle },
        { label: "Meta description", value: descriptionTag },
        { label: "Meta keywords", value: keywordsTag },
        { label: "og:title", value: ogTitleTag },
        { label: "og:description", value: ogDescriptionTag },
        { label: "og:image", value: ogImageTag },
        { label: "twitter:card", value: twitterCardTag },
      ];

      if (!allMeta.length) {
        fetchError = "No meta tags found or the response could not be parsed.";
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      fetchError = `Unable to fetch meta tags (${message}). The site may block requests or be unreachable.`;
    } finally {
      loading = false;
    }
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div class="grid gap-6 lg:grid-cols-2">
    <div
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="space-y-2">
        <label
          class="text-sm font-semibold text-slate-700 dark:text-slate-200"
          for="url-input">Audit page meta tags</label
        >
        <div class="flex flex-col gap-3 md:flex-row">
          <input
            id="url-input"
            class="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={urlInput}
            placeholder="https://www.yourdomain.com"
          />
          <button
            class="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
            on:click={audit}
            disabled={loading}
          >
            {loading ? "Auditing..." : "Run audit"}
          </button>
        </div>
        {#if fetchError}
          <p class="text-xs text-rose-500 dark:text-rose-300">{fetchError}</p>
        {/if}
      </div>

      {#if auditSummary}
        <div class="space-y-3">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Summary
          </h3>
          <dl class="space-y-2 text-sm">
            <div
              class="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <dt
                class="min-w-[100px] text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Title
              </dt>
              <dd class="text-slate-700 dark:text-slate-200">
                {auditSummary.title}
              </dd>
            </div>
            <div
              class="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <dt
                class="min-w-[100px] text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Description
              </dt>
              <dd class="text-slate-700 dark:text-slate-200">
                {auditSummary.description}
              </dd>
            </div>
            <div
              class="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
            >
              <dt
                class="min-w-[100px] text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Keywords
              </dt>
              <dd class="text-slate-700 dark:text-slate-200">
                {auditSummary.keywords}
              </dd>
            </div>
          </dl>
        </div>
      {/if}

      {#if auditMeta.length}
        <div class="space-y-2">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
            Common meta tags
          </h3>
          <ul class="space-y-2 text-sm">
            {#each auditMeta as item}
              <li
                class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
              >
                <p
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  {item.label}
                </p>
                <p class="text-slate-700 dark:text-slate-200">{item.value}</p>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>

    <div
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="grid gap-3">
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Title
          <input
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={title}
            on:input={updateSnippet}
          />
        </label>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Meta description
          <textarea
            class="mt-1 min-h-[90px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={description}
            on:input={updateSnippet}
          ></textarea>
        </label>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Keywords
          <input
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={keywords}
            on:input={updateSnippet}
            placeholder="keyword one, keyword two"
          />
        </label>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Open Graph title
          <input
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={ogTitle}
            on:input={updateSnippet}
          />
        </label>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Open Graph description
          <textarea
            class="mt-1 min-h-[80px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={ogDescription}
            on:input={updateSnippet}
          ></textarea>
        </label>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Open Graph image URL
          <input
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={ogImage}
            on:input={updateSnippet}
          />
        </label>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Twitter card type
          <select
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={twitterCard}
            on:change={updateSnippet}
          >
            <option value="summary">summary</option>
            <option value="summary_large_image">summary_large_image</option>
            <option value="app">app</option>
            <option value="player">player</option>
          </select>
        </label>
      </div>

      <div class="space-y-3">
        <div
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Search preview
          </p>
          <div class="mt-2 space-y-1">
            <p
              class="text-sm font-semibold text-indigo-600 dark:text-indigo-300"
            >
              {title || "Your SEO title appears here"}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              {urlInput || "www.example.com"}
            </p>
            <p class="text-sm text-slate-600 dark:text-slate-300">
              {cardPreviewDescription()}
            </p>
          </div>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-slate-900 p-4 text-xs text-slate-100 shadow-inner dark:border-slate-700 dark:bg-slate-950/90"
        >
          <pre
            class="whitespace-pre-wrap break-all font-mono text-[11px] leading-5">{snippet ||
              "<!-- Add meta inputs to generate code -->"}</pre>
        </div>

        <button
          class="w-full rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:opacity-60"
          on:click={copySnippet}
          disabled={!snippet}
        >
          Copy generated tags
        </button>
      </div>
    </div>
  </div>
</section>

