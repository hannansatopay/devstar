<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  type Pairing = {
    id: string;
    heading: { name: string; stack: string };
    body: { name: string; stack: string };
    vibe: string;
    useCases: string[];
  };

  const pairings: Pairing[] = [
    {
      id: "playfair-inter",
      heading: {
        name: "Playfair Display",
        stack: '"Playfair Display", "Times New Roman", serif',
      },
      body: {
        name: "Inter",
        stack: '"Inter", "Segoe UI", system-ui, sans-serif',
      },
      vibe: "Editorial - High contrast",
      useCases: ["Marketing websites", "Thought leadership blogs", "Reports"],
    },
    {
      id: "poppins-source",
      heading: {
        name: "Poppins",
        stack: '"Poppins", "Segoe UI", system-ui, sans-serif',
      },
      body: {
        name: "Source Sans Pro",
        stack: '"Source Sans Pro", "Helvetica Neue", sans-serif',
      },
      vibe: "Friendly - Rounded",
      useCases: ["Product onboarding", "SaaS dashboards", "Landing flows"],
    },
    {
      id: "spacegrotesk-figtree",
      heading: {
        name: "Space Grotesk",
        stack: '"Space Grotesk", "Roboto", sans-serif',
      },
      body: {
        name: "Figtree",
        stack: '"Figtree", "Helvetica Neue", sans-serif',
      },
      vibe: "Technical - Contemporary",
      useCases: ["Developer docs", "API marketing", "Pitch decks"],
    },
    {
      id: "lora-work",
      heading: { name: "Lora", stack: '"Lora", Georgia, serif' },
      body: {
        name: "Work Sans",
        stack: '"Work Sans", "Segoe UI", system-ui, sans-serif',
      },
      vibe: "Thoughtful - Balanced",
      useCases: ["Publishing platforms", "Knowledge bases", "Courses"],
    },
    {
      id: "montserrat-karla",
      heading: {
        name: "Montserrat",
        stack: '"Montserrat", "Helvetica Neue", sans-serif',
      },
      body: {
        name: "Karla",
        stack: '"Karla", "Segoe UI", system-ui, sans-serif',
      },
      vibe: "Bold - Geometric",
      useCases: ["Brand storytelling", "Event sites", "Portfolios"],
    },
  ];

  let selected = pairings[0];
  let headingText = "Build better products faster";
  let bodyText =
    "Use carefully curated font pairings to create clear hierarchies, better readability, and consistent voice across your interface.";

  $: snippet = buildSnippet(selected);

  function buildSnippet(pairing: Pairing) {
    return `:root {
  --font-heading: ${pairing.heading.stack};
  --font-body: ${pairing.body.stack};
}

h1, h2, h3 {
  font-family: var(--font-heading);
  font-weight: 600;
  letter-spacing: -0.025em;
}

body {
  font-family: var(--font-body);
  line-height: 1.6;
}`;
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
    <div class="space-y-6">
      <!-- Pairings -->
      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Pairings
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Choose a mix that suits the tone of your experience.
            </p>
          </div>
          <Copy text={snippet} label="Copy CSS" floating={false} />
        </div>

        <div class="space-y-3">
          {#each pairings as pairing}
            <button
              type="button"
              class={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                selected.id === pairing.id
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-indigo-400/70"
              }`}
              on:click={() => (selected = pairing)}
            >
              <span
                class="text-sm font-semibold text-slate-900 dark:text-white"
              >
                {pairing.heading.name} + {pairing.body.name}
              </span>
              <span
                class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
              >
                {pairing.vibe}
              </span>
              <span
                class="mt-2 block text-xs text-slate-400 dark:text-slate-500"
              >
                {pairing.useCases.join(" / ")}
              </span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Sample content -->
      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Sample content
        </h2>

        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Heading</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="text"
            bind:value={headingText}
          />
        </label>

        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Body</span>
          <textarea
            class="min-h-[120px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            bind:value={bodyText}
          />
        </label>
      </div>
    </div>

    <!-- Final Output -->
    <div
      class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900"
    >
      <p
        class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500"
      >
        Preview
      </p>

      <div
        class="mt-4 space-y-4 rounded-2xl border border-slate-200/60 bg-white px-6 py-8 shadow-inner dark:border-slate-700/60 dark:bg-slate-900"
      >
        <h2
          class="text-3xl font-semibold tracking-tight sm:text-4xl"
          style={`font-family:${selected.heading.stack}`}
        >
          {headingText}
        </h2>
        <p
          class="text-sm leading-relaxed sm:text-base"
          style={`font-family:${selected.body.stack}`}
        >
          {bodyText}
        </p>

        <div
          class="grid gap-3 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-2"
        >
          <div>
            <p class="text-[11px] uppercase tracking-wide">Heading Stack</p>
            <p class="mt-1 font-mono break-all">{selected.heading.stack}</p>
          </div>
          <div>
            <p class="text-[11px] uppercase tracking-wide">Body Stack</p>
            <p class="mt-1 font-mono break-all">{selected.body.stack}</p>
          </div>
        </div>
      </div>

      <div class="mt-6 space-y-3">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h3 class="text-sm font-semibold text-slate-900 dark:text-white">
            CSS snippet
          </h3>
          <Copy text={snippet} label="Copy CSS" floating={false} />
        </div>
        <pre
          class="max-h-64 overflow-auto rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 dark:text-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 break-all whitespace-pre-wrap">{snippet}</pre>
      </div>
    </div>
  </div>
</section>
