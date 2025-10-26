<script>
  let rules = [createRule("*")];
  let sitemaps = [""];
  let generated = "";

  updateRobots();

  function createRule(agent) {
    return {
      userAgent: agent,
      allow: ["/"],
      disallow: [""],
      crawlDelay: "",
    };
  }

  function addRule() {
    rules = [...rules, createRule("*")];
    updateRobots();
  }

  function removeRule(index) {
    if (rules.length === 1) {
      rules = [createRule("*")];
    } else {
      rules = rules.filter((_, idx) => idx !== index);
    }
    updateRobots();
  }

  function updateAllow(index, value, row) {
    const items = [...rules];
    const list = [...items[index].allow];
    list[row] = value;
    items[index].allow = list;
    rules = items;
    updateRobots();
  }

  function updateDisallow(index, value, row) {
    const items = [...rules];
    const list = [...items[index].disallow];
    list[row] = value;
    items[index].disallow = list;
    rules = items;
    updateRobots();
  }

  function addAllow(index) {
    rules = rules.map((rule, idx) =>
      idx === index ? { ...rule, allow: [...rule.allow, ""] } : rule,
    );
    updateRobots();
  }

  function addDisallow(index) {
    rules = rules.map((rule, idx) =>
      idx === index ? { ...rule, disallow: [...rule.disallow, ""] } : rule,
    );
    updateRobots();
  }

  function updateRuleAgent(index, value) {
    rules = rules.map((rule, idx) =>
      idx === index ? { ...rule, userAgent: value } : rule,
    );
    updateRobots();
  }

  function updateCrawlDelay(index, value) {
    rules = rules.map((rule, idx) =>
      idx === index ? { ...rule, crawlDelay: value } : rule,
    );
    updateRobots();
  }

  function updateSitemap(index, value) {
    const list = [...sitemaps];
    list[index] = value;
    sitemaps = list;
    updateRobots();
  }

  function addSitemap() {
    sitemaps = [...sitemaps, ""];
    updateRobots();
  }

  function removeSitemap(index) {
    if (sitemaps.length === 1) {
      sitemaps = [""];
    } else {
      sitemaps = sitemaps.filter((_, idx) => idx !== index);
    }
    updateRobots();
  }

  function updateRobots() {
    const lines = [];
    rules.forEach((rule, idx) => {
      const agent = rule.userAgent.trim() || "*";
      lines.push(`User-agent: ${agent}`);
      rule.allow
        .map((entry) => entry.trim())
        .filter((entry) => entry.length)
        .forEach((entry) => lines.push(`Allow: ${entry}`));
      rule.disallow
        .map((entry) => entry.trim())
        .filter((entry) => entry.length)
        .forEach((entry) => lines.push(`Disallow: ${entry}`));
      if (rule.crawlDelay.trim()) {
        lines.push(`Crawl-delay: ${rule.crawlDelay.trim()}`);
      }
      if (idx !== rules.length - 1) {
        lines.push("");
      }
    });

    sitemaps
      .map((entry) => entry.trim())
      .filter((entry) => entry.length)
      .forEach((entry) => lines.push(`Sitemap: ${entry}`));

    generated = lines.join("\n");
  }

  function copyRobots() {
    if (!generated.trim()) {
      return;
    }
    navigator.clipboard?.writeText(generated).catch(() => {
      /* ignore */
    });
  }
</script>

<section class="space-y-6 flex flex-col">
  <div
    class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
  >
    <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
      Rules
    </h2>
    <p class="text-sm text-slate-500 dark:text-slate-400">
      Define directives for each user agent, including allowed and disallowed
      paths and optional crawl delays.
    </p>
    <div class="space-y-5">
      {#each rules as rule, index}
        <div
          class="rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60"
        >
          <div class="flex items-center justify-between gap-3">
            <label
              class="flex-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              User agent
              <input
                class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                value={rule.userAgent}
                on:input={(event) =>
                  updateRuleAgent(index, event.currentTarget.value)}
              />
            </label>
            <button
              class="mt-6 inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
              on:click={() => removeRule(index)}
            >
              Remove
            </button>
          </div>

          <div class="mt-4 grid gap-3 md:grid-cols-2">
            <div>
              <div class="flex items-center justify-between">
                <span
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >Allow paths</span
                >
                <button
                  class="text-xs font-semibold text-indigo-600 hover:text-indigo-500 focus:outline-none"
                  on:click={() => addAllow(index)}
                  type="button"
                >
                  + path
                </button>
              </div>
              <div class="mt-2 space-y-2">
                {#each rule.allow as path, row}
                  <input
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                    value={path}
                    on:input={(event) =>
                      updateAllow(index, event.currentTarget.value, row)}
                    placeholder="/"
                  />
                {/each}
              </div>
            </div>
            <div>
              <div class="flex items-center justify-between">
                <span
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >Disallow paths</span
                >
                <button
                  class="text-xs font-semibold text-indigo-600 hover:text-indigo-500 focus:outline-none"
                  on:click={() => addDisallow(index)}
                  type="button"
                >
                  + path
                </button>
              </div>
              <div class="mt-2 space-y-2">
                {#each rule.disallow as path, row}
                  <input
                    class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                    value={path}
                    on:input={(event) =>
                      updateDisallow(index, event.currentTarget.value, row)}
                    placeholder="/private"
                  />
                {/each}
              </div>
            </div>
          </div>

          <label
            class="mt-4 block text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Crawl delay (seconds)
            <input
              type="number"
              min="0"
              class="mt-1 w-full max-w-xs rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              value={rule.crawlDelay}
              on:input={(event) =>
                updateCrawlDelay(index, event.currentTarget.value)}
            />
          </label>
        </div>
      {/each}
    </div>

    <button
      class="inline-flex w-full items-center justify-center rounded-full border border-dashed border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
      on:click={addRule}
    >
      Add another user agent
    </button>
  </div>

  <div
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
  >
    <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
      Sitemaps
    </h2>
    <p class="text-sm text-slate-500 dark:text-slate-400">
      List sitemap URLs to help search engines discover your content.
    </p>
    <div class="mt-3 space-y-3">
      {#each sitemaps as entry, index}
        <div class="flex flex-col gap-2 md:flex-row">
          <input
            class="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            value={entry}
            on:input={(event) =>
              updateSitemap(index, event.currentTarget.value)}
            placeholder="https://example.com/sitemap.xml"
          />
          <button
            class="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
            on:click={() => removeSitemap(index)}
          >
            Remove
          </button>
        </div>
      {/each}
    </div>
    <button
      class="mt-4 inline-flex items-center justify-center rounded-full border border-dashed border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
      on:click={addSitemap}
    >
      Add sitemap URL
    </button>
  </div>

  <div
    class="rounded-2xl border border-slate-200 bg-slate-900 p-6 text-xs text-slate-100 shadow-inner dark:border-slate-800 dark:bg-slate-950/90"
  >
    <div class="flex items-center justify-between gap-3">
      <h2 class="text-sm font-semibold text-slate-100">robots.txt</h2>
      <button
        class="rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-100 transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-600"
        on:click={copyRobots}
        type="button"
      >
        Copy
      </button>
    </div>
    <pre
      class="mt-3 whitespace-pre-wrap break-words font-mono text-[12px] leading-5">{generated ||
        "# Configure rules to generate robots.txt"}</pre>
  </div>
</section>
