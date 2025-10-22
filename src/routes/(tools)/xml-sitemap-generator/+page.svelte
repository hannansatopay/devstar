<script>
  const frequencies = [
    "always",
    "hourly",
    "daily",
    "weekly",
    "monthly",
    "yearly",
    "never",
  ];

  let entries = [createEntry()];
  let generated = "";

  updateSitemap();

  function createEntry() {
    return {
      loc: "https://example.com/",
      lastmod: new Date().toISOString().slice(0, 10),
      changefreq: "weekly",
      priority: "0.5",
    };
  }

  function addEntry() {
    entries = [...entries, createEntry()];
    updateSitemap();
  }

  function removeEntry(index) {
    if (entries.length === 1) {
      entries = [createEntry()];
    } else {
      entries = entries.filter((_, idx) => idx !== index);
    }
    updateSitemap();
  }

  function updateField(index, field, value) {
    entries = entries.map((entry, idx) =>
      idx === index ? { ...entry, [field]: value } : entry,
    );
    updateSitemap();
  }

  function updateSitemap() {
    const lines = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ];
    entries.forEach((entry) => {
      const loc = entry.loc.trim();
      if (!loc) {
        return;
      }
      lines.push("  <url>");
      lines.push(`    <loc>${escapeXml(loc)}</loc>`);
      if (entry.lastmod.trim()) {
        lines.push(`    <lastmod>${escapeXml(entry.lastmod.trim())}</lastmod>`);
      }
      if (entry.changefreq) {
        lines.push(
          `    <changefreq>${escapeXml(entry.changefreq)}</changefreq>`,
        );
      }
      if (entry.priority) {
        lines.push(`    <priority>${escapeXml(entry.priority)}</priority>`);
      }
      lines.push("  </url>");
    });
    lines.push("</urlset>");
    generated = lines.join("\n");
  }

  function escapeXml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");
  }

  function copySitemap() {
    navigator.clipboard?.writeText(generated).catch(() => {
      /* ignore */
    });
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div
    class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
  >
    <p class="text-sm text-slate-500 dark:text-slate-400">
      Add URLs with optional metadata to build an XML sitemap that search
      engines understand.
    </p>
    <div class="space-y-5">
      {#each entries as entry, index}
        <div
          class="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div class="flex items-center justify-between">
            <h3
              class="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              URL {index + 1}
            </h3>
            <button
              class="text-xs font-semibold text-slate-600 hover:text-slate-500 focus:outline-none dark:text-slate-300"
              on:click={() => removeEntry(index)}
            >
              Remove
            </button>
          </div>
          <label
            class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Location
            <input
              class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              value={entry.loc}
              on:input={(event) =>
                updateField(index, "loc", event.currentTarget.value)}
              placeholder="https://example.com/page"
            />
          </label>
          <div class="grid gap-3 md:grid-cols-3">
            <label
              class="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Last modified
              <input
                type="date"
                class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                value={entry.lastmod}
                on:input={(event) =>
                  updateField(index, "lastmod", event.currentTarget.value)}
              />
            </label>
            <label
              class="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Change frequency
              <select
                class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                value={entry.changefreq}
                on:change={(event) =>
                  updateField(index, "changefreq", event.currentTarget.value)}
              >
                {#each frequencies as option}
                  <option value={option}>{option}</option>
                {/each}
              </select>
            </label>
            <label
              class="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Priority (0.0 - 1.0)
              <input
                type="number"
                min="0"
                max="1"
                step="0.1"
                class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                value={entry.priority}
                on:input={(event) =>
                  updateField(index, "priority", event.currentTarget.value)}
              />
            </label>
          </div>
        </div>
      {/each}
    </div>
    <button
      class="w-full rounded-full border border-dashed border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
      on:click={addEntry}
    >
      Add another URL
    </button>
  </div>

  <div
    class="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-xs text-slate-100 shadow-inner dark:border-slate-800 dark:bg-slate-950/90"
  >
    <div class="flex items-center justify-between">
      <h2 class="text-sm font-semibold text-slate-100">XML sitemap</h2>
      <button
        class="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600"
        on:click={copySitemap}
      >
        Copy
      </button>
    </div>
    <pre
      class="mt-3 whitespace-pre-wrap break-words font-mono text-[12px] leading-5">{generated}</pre>
  </div>
</section>
