<script lang="ts">
  import { onMount } from "svelte";
  import Copy from "$lib/Copy.svelte";

  type Suggestion = {
    id: string;
    name: string;
    tagline: string;
    sources: string[];
  };

  const industries = [
    "Design",
    "Technology",
    "Consulting",
    "Food & Beverage",
    "SaaS",
    "Marketing",
    "Retail",
    "Health & Wellness",
    "Education",
    "Finance",
  ];

  const tones = [
    "Professional",
    "Playful",
    "Innovative",
    "Luxury",
    "Eco Friendly",
    "Tech Forward",
    "Minimalist",
    "Bold",
  ];

  const fallbackPrefixes = [
    "Bright",
    "North",
    "Prime",
    "Echo",
    "Urban",
    "Atlas",
    "Lumen",
    "Aero",
    "Nova",
    "Vertex",
  ];

  const fallbackDescriptors = [
    "Pulse",
    "Arc",
    "Craft",
    "Forge",
    "Shift",
    "Nest",
    "Flow",
    "Harbor",
    "Summit",
    "Bridge",
  ];

  const fallbackSuffixes = [
    "Labs",
    "Works",
    "Studio",
    "Collective",
    "Partners",
    "Dynamics",
    "Systems",
    "Foundry",
    "Workshop",
    "Grove",
  ];

  const maxQuantity = 24;

  let industry = industries[0];
  let tone = tones[0];
  let keywordsInput = "";
  let quantity: number | string = 12;
  let includeTaglines = true;
  let suggestions: Suggestion[] = [];
  let loading = false;
  let error = "";
  let lastUpdated: string | null = null;

  const isDefined = <T,>(value: T | null | undefined | false): value is T =>
    Boolean(value);

  const normaliseToken = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const startCase = (value: string) =>
    value
      .split(/[\s-]+/)
      .filter(Boolean)
      .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
      .join(" ");

  const unique = <T,>(items: Iterable<T>) => Array.from(new Set(items));

  const uid = () => Math.random().toString(36).slice(2, 9);

  async function fetchWords(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed request: ${response.status}`);
    }
    const data = (await response.json()) as Array<{ word: string }>;
    return data
      .map((entry) => normaliseToken(entry.word))
      .filter((word) => word.length > 2 && word.length < 14);
  }

  function buildTagline(descriptor: string | null, root: string | null): string {
    const toneText = tone.toLowerCase();
    const industryText = industry.toLowerCase();
    const descriptorText = descriptor ? startCase(descriptor) : tone;
    const focusText = root ? startCase(root) : industry;

    const templates = [
      `${descriptorText} ${industryText} solutions shaped around ${focusText}.`,
      `${focusText} for ${toneText} teams that want to stand out.`,
      `${descriptorText} thinking for modern ${industryText} brands.`,
      `Helping ${industryText} leaders turn ${focusText.toLowerCase()} into momentum.`,
    ];

    return templates[Math.floor(Math.random() * templates.length)];
  }

  function buildFallbackSuggestions(count: number, useTaglines: boolean): Suggestion[] {
    const results: Suggestion[] = [];
    const combinations = unique(
      fallbackPrefixes.flatMap((prefix) =>
        fallbackSuffixes.map((suffix) => `${prefix} ${suffix}`),
      ),
    );

    for (const name of combinations) {
      if (results.length >= count) break;
      results.push({
        id: uid(),
        name,
        tagline: useTaglines ? buildTagline(null, null) : "",
        sources: ["fallback"],
      });
    }

    return results;
  }

  async function generate() {
    loading = true;
    error = "";

    const requested = Math.min(maxQuantity, Math.max(3, Number(quantity) || 3));

    try {
      const keywordTokens = unique(
        keywordsInput
          .split(/[,\n]/)
          .map((token) => normaliseToken(token))
          .filter(Boolean),
      );

      const toneToken = normaliseToken(tone.split(" ")[0]);
      const topicTokens = unique(
        [normaliseToken(industry), ...keywordTokens].filter(Boolean),
      );

      const requestUrls = new Set<string>();
      requestUrls.add(
        `https://api.datamuse.com/words?topics=${encodeURIComponent(normaliseToken(industry))}&max=30`,
      );
      requestUrls.add(
        `https://api.datamuse.com/words?ml=${encodeURIComponent(normaliseToken(industry))}&max=30`,
      );
      requestUrls.add(
        `https://api.datamuse.com/words?rel_trg=${encodeURIComponent(toneToken)}&max=25`,
      );

      topicTokens.forEach((token) => {
        requestUrls.add(
          `https://api.datamuse.com/words?ml=${encodeURIComponent(token)}&max=25`,
        );
        requestUrls.add(
          `https://api.datamuse.com/words?rel_jjb=${encodeURIComponent(token)}&max=20`,
        );
      });

      if (topicTokens.length === 0) {
        requestUrls.add("https://api.datamuse.com/words?ml=brand&max=25");
      }

      const responses = await Promise.all(
        Array.from(requestUrls).map((url) =>
          fetchWords(url).catch((fetchError) => {
            console.warn("Name API request failed", url, fetchError);
            return [] as string[];
          }),
        ),
      );

      const wordPool = unique(responses.flat());

      const descriptorPool = unique([
        ...wordPool.filter((word) => word.length <= 8),
        ...fallbackDescriptors.map(normaliseToken),
      ]);

      const nounPool = unique([
        ...wordPool.filter((word) => word.length >= 4),
        ...topicTokens,
        normaliseToken(industry),
        ...fallbackSuffixes.map(normaliseToken),
      ]);

      if (nounPool.length === 0) {
        throw new Error("No nouns returned from API");
      }

      const results: Suggestion[] = [];
      const used = new Set<string>();
      const randomFrom = <T,>(pool: T[]) =>
        pool[Math.floor(Math.random() * pool.length)];

      let attempts = 0;
      while (results.length < requested && attempts < requested * 8) {
        attempts += 1;
        const noun = randomFrom(nounPool);
        const descriptor = descriptorPool.length
          ? randomFrom(descriptorPool)
          : null;
        const prefix = randomFrom(fallbackPrefixes);
        const suffix = randomFrom(fallbackSuffixes);

        const pattern = attempts % 3;
        let candidate = "";
        let focus = noun;
        let descriptorForTagline: string | null = descriptor;

        if (pattern === 0 && descriptor) {
          candidate = `${startCase(descriptor)} ${startCase(noun)}`;
        } else if (pattern === 1) {
          candidate = `${startCase(noun)} ${suffix}`;
        } else {
          candidate = `${prefix} ${startCase(noun)}`;
          descriptorForTagline = prefix;
        }

        const key = candidate.toLowerCase();
        if (used.has(key)) continue;
        used.add(key);

        const tagline = includeTaglines ? buildTagline(descriptorForTagline, focus) : "";
        results.push({
          id: uid(),
          name: candidate,
          tagline,
          sources: descriptorForTagline
            ? [descriptorForTagline, focus]
            : [focus],
        });
      }

      if (results.length === 0) {
        throw new Error("Unable to generate names from API response");
      }

      suggestions = results.slice(0, requested);
      lastUpdated = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (err) {
      console.error("Business name generation failed", err);
      error =
        "Unable to fetch name ideas right now. Showing offline suggestions.";
      suggestions = buildFallbackSuggestions(requested, includeTaglines);
      lastUpdated = null;
    } finally {
      loading = false;
    }
  }

  onMount(() => {
    generate();
  });
</script>

<section class="space-y-6">
  <div
    class="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="flex flex-col gap-8 lg:flex-row lg:items-start">
      <div class="flex-1 space-y-6">
        <header class="space-y-2">
          <p
            class="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-300"
          >
            Naming brief
          </p>
          <h1
            class="text-2xl font-semibold text-slate-900 dark:text-white sm:text-3xl"
          >
            Craft a memorable business name
          </h1>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            Generate brandable names using live data from the Datamuse API.
            Adjust tone, industry, and keywords to guide the results.
          </p>
        </header>

        <div class="grid gap-4 sm:grid-cols-2">
          <label
            class="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>Industry focus</span>
            <select
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={industry}
            >
              {#each industries as option}
                <option value={option}>{option}</option>
              {/each}
            </select>
          </label>

          <label
            class="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>Brand tone</span>
            <select
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={tone}
            >
              {#each tones as option}
                <option value={option}>{option}</option>
              {/each}
            </select>
          </label>

          <label
            class="sm:col-span-2 space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>Keywords (comma separated)</span>
            <textarea
              class="h-20 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={keywordsInput}
              placeholder="growth, analytics, platform"
            ></textarea>
          </label>

          <label
            class="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>How many names?</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="3"
              max={maxQuantity}
              bind:value={quantity}
            />
          </label>

          <label
            class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
          >
            <input
              class="h-4 w-4 accent-indigo-600"
              type="checkbox"
              bind:checked={includeTaglines}
            />
            Include short taglines
          </label>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button
            class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-70 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-700"
            type="button"
            on:click={generate}
            disabled={loading}
          >
            {loading ? "Generating names..." : "Generate names"}
          </button>
          {#if lastUpdated}
            <span class="text-xs text-slate-500 dark:text-slate-400"
              >Updated at {lastUpdated}</span
            >
          {/if}
        </div>
      </div>

      <aside
        class="w-full max-w-sm space-y-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-xs text-slate-600 shadow-inner dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-300"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          How this works
        </h2>
        <p>
          We query the <a
            class="text-indigo-600 underline decoration-indigo-300 dark:text-indigo-300"
            href="https://www.datamuse.com/api/"
            target="_blank"
            rel="noreferrer">Datamuse public API</a
          > for words related to your industry, tone, and keywords. The results are
          blended with curated prefixes and suffixes popular in startup naming.
        </p>
        <p>
          Toggle taglines to generate short descriptions you can reuse in decks,
          landing pages, or pitches.
        </p>
      </aside>
    </div>
  </div>

  <div class="space-y-4">
    {#if error}
      <div
        class="rounded-2xl border border-amber-300 bg-amber-50/80 px-4 py-3 text-sm text-amber-700 dark:border-amber-500 dark:bg-amber-900/40 dark:text-amber-200"
      >
        {error}
      </div>
    {/if}

    {#if loading}
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {#each Array(6) as _}
          <article
            class="h-full rounded-2xl border border-slate-200 bg-white/60 p-5 shadow-sm backdrop-blur animate-pulse dark:border-slate-800 dark:bg-slate-900/60"
          >
            <div class="h-6 w-2/3 rounded bg-slate-200 dark:bg-slate-700"></div>
            <div class="mt-4 space-y-2">
              <div
                class="h-3 w-full rounded bg-slate-200 dark:bg-slate-700"
              ></div>
              <div
                class="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700"
              ></div>
            </div>
          </article>
        {/each}
      </div>
    {:else}
      <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {#each suggestions as suggestion}
          <article
            class="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
          >
            <div class="space-y-3">
              <h2
                class="font-serif text-2xl font-semibold tracking-tight text-slate-900 dark:text-white"
              >
                {suggestion.name}
              </h2>
              {#if includeTaglines && suggestion.tagline}
                <p class="text-sm text-slate-600 dark:text-slate-300">
                  {suggestion.tagline}
                </p>
              {/if}
            </div>
            <div
              class="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
            >
              <Copy
                text={includeTaglines
                  ? `${suggestion.name} - ${suggestion.tagline}`
                  : suggestion.name}
                label="Copy"
                floating={false}
              />
              <span>#{suggestion.id}</span>
            </div>
          </article>
        {/each}
      </div>
    {/if}
  </div>
</section>
