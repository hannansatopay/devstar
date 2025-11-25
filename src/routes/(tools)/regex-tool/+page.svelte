<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import { browser } from "$app/environment";
  import { onDestroy } from "svelte";

  type FlagKey = "g" | "i" | "m" | "s" | "u" | "y";

  type FlagOption = {
    key: FlagKey;
    label: string;
    description: string;
  };

  type PatternPreset = {
    label: string;
    description: string;
    pattern: string;
    flags?: string;
    sample: string;
  };

  type MatchDetail = {
    text: string;
    index: number;
    end: number;
    groups: Array<{ name: string | null; value: string }>;
  };

  type HighlightSegment = {
    text: string;
    match: boolean;
  };

  const flagOptions: FlagOption[] = [
    {
      key: "g",
      label: "Global",
      description:
        "Find every occurrence instead of stopping at the first match.",
    },
    {
      key: "i",
      label: "Case insensitive",
      description: "Ignore character casing during matching.",
    },
    {
      key: "m",
      label: "Multiline",
      description: "`^` and `$` match line boundaries.",
    },
    {
      key: "s",
      label: "Dotall",
      description: "`.` also matches newline characters.",
    },
    {
      key: "u",
      label: "Unicode",
      description: "Treat pattern as Unicode — enables \\p{} classes.",
    },
    {
      key: "y",
      label: "Sticky",
      description:
        "Match from the last index only (useful for incremental parsing).",
    },
  ];

  const presets: PatternPreset[] = [
    {
      label: "Email address",
      description: "Captures most RFC 5322 compliant email addresses.",
      pattern: "^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}$",
      flags: "i",
      sample:
        "Reach us via support@devstar.app or onboarding@devstar.app soon.",
    },
    {
      label: "ISO date",
      description: "Matches YYYY-MM-DD date strings with leading zeros.",
      pattern: "\\b\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b",
      sample:
        "Timeline: 2025-01-01 kickoff, 2025-03-18 beta, 2025-05-30 launch.",
    },
    {
      label: "Hex color",
      description: "Supports 3 or 6 digit hex color references.",
      pattern: "#(?:[0-9a-fA-F]{3}){1,2}\\b",
      sample: "Primary palette: #1D4ED8, #EC4899, #10B981, and accent #fff.",
    },
    {
      label: "URL capture",
      description:
        "A pragmatic matcher for http(s) URLs with optional query params.",
      pattern: "https?:\\/\\/[^\\s/$.?#].[^\\s]*",
      sample:
        "Docs: https://docs.devstar.app/regex?tab=quickstart and http://localhost:4173",
    },
    {
      label: "Named group example",
      description: "Uses named groups to capture international phone numbers.",
      pattern:
        "\\+(?<country>\\d{1,3})[- ]?(?<block>\\d{3})[- ]?(?<suffix>\\d{4,5})",
      sample: "Hotlines: +1-800-5555, +44 7700 900123, +91 98765 43210",
    },
  ];

  let pattern = presets[0].pattern;
  let testInput = presets[0].sample;
  let replacement = "";
  let replacementResult = "";
  let error = "";
  let matches: MatchDetail[] = [];
  let segments: HighlightSegment[] = [];
  let elapsed = 0;
  let autoRun = true;
  let runHandle: ReturnType<typeof setTimeout> | undefined;

  let flagState: Record<FlagKey, boolean> = {
    g: true,
    i: false,
    m: false,
    s: false,
    u: false,
    y: false,
  };

  function buildFlags(custom?: string) {
    const toggled = Object.entries(flagState)
      .filter(([, value]) => value)
      .map(([key]) => key)
      .join("");

    if (!custom) return toggled;

    const merged = new Set<string>([...custom.split(""), ...toggled.split("")]);
    return Array.from(merged).join("");
  }

  function prepareRegex(source: string, customFlags?: string) {
    const flags = buildFlags(customFlags);
    return new RegExp(source, flags);
  }

  function run() {
    try {
      const start = performance.now();
      const regex = prepareRegex(pattern);
      const iterationFlags = regex.flags.includes("g")
        ? regex.flags
        : `${regex.flags}g`;
      const iterator = new RegExp(
        regex.source,
        Array.from(new Set(iterationFlags.split(""))).join(""),
      );
      const all = [...testInput.matchAll(iterator)];

      matches = all.map((entry) => {
        const index = entry.index ?? 0;
        const groups: Array<{ name: string | null; value: string }> = [];
        if (entry.groups) {
          for (const [name, value] of Object.entries(entry.groups)) {
            groups.push({ name, value });
          }
        } else if (entry.length > 1) {
          entry.slice(1).forEach((value, idx) => {
            groups.push({ name: `Group ${idx + 1}`, value: value ?? "" });
          });
        }
        return {
          text: entry[0],
          index,
          end: index + entry[0].length,
          groups,
        };
      });

      segments = buildSegments(testInput, matches);
      replacementResult = testInput.replace(regex, replacement);
      elapsed = Number((performance.now() - start).toFixed(3));
      error = "";
    } catch (err) {
      matches = [];
      segments = [{ text: testInput, match: false }];
      replacementResult = "";
      elapsed = 0;
      error =
        err instanceof Error
          ? err.message
          : "Unable to evaluate expression. Double-check escaping and flags.";
    }
  }

  function buildSegments(input: string, details: MatchDetail[]) {
    if (!details.length) return [{ text: input, match: false }];
    const slices: HighlightSegment[] = [];
    let cursor = 0;

    for (const item of details) {
      if (item.index > cursor) {
        slices.push({ text: input.slice(cursor, item.index), match: false });
      }
      slices.push({ text: input.slice(item.index, item.end), match: true });
      cursor = item.end;
    }

    if (cursor < input.length) {
      slices.push({ text: input.slice(cursor), match: false });
    }

    return slices.filter((slice) => slice.text.length > 0);
  }

  function applyPreset(preset: PatternPreset) {
    pattern = preset.pattern;
    testInput = preset.sample;
    if (preset.flags) {
      flagState = {
        g: preset.flags.includes("g"),
        i: preset.flags.includes("i"),
        m: preset.flags.includes("m"),
        s: preset.flags.includes("s"),
        u: preset.flags.includes("u"),
        y: preset.flags.includes("y"),
      };
    }
    run();
  }

  $: if (autoRun && browser) {
    const snapshot = {
      pattern,
      testInput,
      replacement,
      flagState: { ...flagState },
    };
    clearTimeout(runHandle);
    runHandle = setTimeout(() => {
      const flagsMatch = Object.entries(snapshot.flagState).every(
        ([key, value]) => flagState[key as FlagKey] === value,
      );
      if (
        snapshot.pattern === pattern &&
        snapshot.testInput === testInput &&
        snapshot.replacement === replacement &&
        flagsMatch
      ) {
        run();
      }
    }, 160);
  }

  onDestroy(() => {
    clearTimeout(runHandle);
  });
</script>

<section class="space-y-6">
  <div
    class="grid gap-6 sm:gap-8 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"
  >
    <!-- Sidebar -->
    <aside class="space-y-6">
      <!-- Stats -->
      <div
        class="rounded-3xl border border-slate-200 bg-white/95 p-4 sm:p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85 grid grid-cols-2 gap-3 text-sm"
      >
        <div
          class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
        >
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Matches
          </p>
          <p
            class="mt-1 text-lg font-semibold text-indigo-600 dark:text-indigo-400"
          >
            {matches.length}
          </p>
        </div>
        <div
          class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
        >
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Runtime
          </p>
          <p class="mt-1 text-lg font-semibold text-slate-800 dark:text-white">
            {elapsed ? `${elapsed}ms` : "—"}
          </p>
        </div>
      </div>

      <!-- Pattern presets -->
      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Pattern presets
        </h2>
        <div class="flex flex-col gap-3">
          {#each presets as preset}
            <button
              type="button"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200"
              on:click={() => applyPreset(preset)}
            >
              <span
                class="block text-sm font-semibold text-slate-800 dark:text-white"
              >
                {preset.label}
              </span>
              <span
                class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
              >
                {preset.description}
              </span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Flags -->
      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Flags
        </h2>
        <div class="space-y-3">
          {#each flagOptions as option}
            <label
              class="flex flex-col sm:flex-row sm:items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-indigo-400/70"
            >
              <input
                class="mt-0.5 size-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400"
                type="checkbox"
                bind:checked={flagState[option.key]}
              />
              <span
                class="flex-1 normal-case text-slate-600 dark:text-slate-300"
              >
                <span class="font-semibold text-slate-800 dark:text-white">
                  {option.label}
                </span>
                <span
                  class="block text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500"
                >
                  /{option.key}
                </span>
                <span
                  class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
                >
                  {option.description}
                </span>
              </span>
            </label>
          {/each}
        </div>

        <label
          class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <input
            class="size-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400"
            type="checkbox"
            bind:checked={autoRun}
          />
          Auto-run while typing
        </label>

        <button
          type="button"
          class="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          on:click={run}
        >
          Run expression
        </button>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="space-y-6 overflow-x-hidden">
      <!-- Expression -->
      <div
        class="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Expression
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Use standard JavaScript regular expression syntax.
            </p>
          </div>
          <Copy
            text={`/${pattern}/${buildFlags()}`}
            label="Copy pattern"
            floating={false}
          />
        </div>

        <input
          class="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
          type="text"
          bind:value={pattern}
          placeholder="Enter regex pattern e.g. ^[A-Z]+$"
        />

        {#if error}
          <p
            class="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
          >
            {error}
          </p>
        {/if}
      </div>

      <!-- Test string -->
      <div
        class="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Test string
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Matches are highlighted inline; groups appear below.
            </p>
          </div>
          <Copy text={testInput} label="Copy string" floating={false} />
        </div>

        <textarea
          class="mt-4 h-48 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40 sm:h-56"
          bind:value={testInput}
          spellcheck="false"
        ></textarea>

        <div
          class="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
        >
          {#if segments.length}
            {#each segments as segment, index (index)}
              <span
                class={`${
                  segment.match
                    ? "rounded bg-indigo-500/30 px-1 text-indigo-900 dark:bg-indigo-500/20 dark:text-indigo-100"
                    : ""
                }`}>{segment.text}</span
              >
            {/each}
          {:else}
            <span>No matches yet.</span>
          {/if}
        </div>
      </div>

      <!-- Replacement -->
      <div
        class="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Replacement
          </h2>
          <Copy text={replacementResult} label="Copy output" floating={false} />
        </div>

        <input
          class="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
          type="text"
          bind:value={replacement}
          placeholder="Replacement string (supports $1, $<name>, etc.)"
        />

        <pre
          class="mt-4 max-h-48 overflow-auto rounded-2xl border border-slate-200 bg-slate-900/95 p-4 font-mono text-sm leading-relaxed text-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-emerald-300">{replacementResult}</pre>
      </div>

      <!-- Match details -->
      <div
        class="rounded-3xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Match details
          </h2>
          <Copy
            text={JSON.stringify(matches, null, 2)}
            label="Copy JSON"
            floating={false}
          />
        </div>

        {#if matches.length === 0}
          <p
            class="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          >
            Adjust the pattern or flags to start seeing matches and capture
            groups.
          </p>
        {:else}
          <div class="mt-4 space-y-3">
            {#each matches as match, matchIndex (matchIndex)}
              <div
                class="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-4 text-sm text-indigo-800 dark:border-indigo-500/50 dark:bg-indigo-500/10 dark:text-indigo-100"
              >
                <div class="flex flex-wrap items-center justify-between gap-3">
                  <span class="font-semibold">
                    Match {matchIndex + 1} · {match.text}
                  </span>
                  <span class="text-xs uppercase tracking-wide">
                    {match.index} – {match.end}
                  </span>
                </div>

                {#if match.groups.length}
                  <div class="mt-3 grid gap-2 sm:grid-cols-2">
                    {#each match.groups as group, groupIndex (groupIndex)}
                      <div
                        class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-600 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-300"
                      >
                        <p
                          class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500"
                        >
                          {group.name ?? `Group ${groupIndex + 1}`}
                        </p>
                        <p class="mt-1 font-mono text-sm">
                          {group.value || "∅"}
                        </p>
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
