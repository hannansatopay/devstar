<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import { browser } from "$app/environment";
  import { onDestroy } from "svelte";

  type Mode = "line" | "word" | "character";

  type Operation = "equal" | "added" | "removed";

  type DiffSegment = {
    type: Operation;
    value: string;
  };

  type DiffStats = {
    additions: number;
    deletions: number;
    neutrals: number;
  };

  const presets = [
    {
      label: "Release notes",
      left: `## Release 1.8.0
- Added live collaboration beta
- Improved CLI output
- Fixed session timeout when deploying`,
      right: `## Release 1.9.0
- Added real-time collaboration
- Improved CLI output formatting
- Fixed session timeout when deploying
- Documented environment variables`,
    },
    {
      label: "Product copy",
      left: `We help teams plan, ship, and learn faster.`,
      right: `We help product teams plan, ship, and learn faster together.`,
    },
  ];

  const modeOptions: Mode[] = ["line", "word", "character"];
  let mode: Mode = "line";
  let leftInput = presets[0].left;
  let rightInput = presets[0].right;
  let segments: DiffSegment[] = [];
  let stats: DiffStats = { additions: 0, deletions: 0, neutrals: 0 };
  let autoRun = true;
  let runHandle: ReturnType<typeof setTimeout> | undefined;

  function tokenize(text: string, granularity: Mode) {
    switch (granularity) {
      case "line":
        return text.replace(/\r\n/g, "\n").split("\n");
      case "word":
        return text.match(/\w+|\s+|[^\s\w]+/g) ?? [text];
      default:
        return Array.from(text);
    }
  }

  function diffSequences(left: string[], right: string[]) {
    const m = left.length;
    const n = right.length;
    const dp = Array.from({ length: m + 1 }, () =>
      new Array<number>(n + 1).fill(0),
    );

    for (let i = m - 1; i >= 0; i -= 1) {
      for (let j = n - 1; j >= 0; j -= 1) {
        if (left[i] === right[j]) {
          dp[i][j] = dp[i + 1][j + 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
    }

    const ops: Array<{ type: Operation; value: string }> = [];
    let i = 0;
    let j = 0;

    while (i < m && j < n) {
      if (left[i] === right[j]) {
        ops.push({ type: "equal", value: left[i] });
        i += 1;
        j += 1;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        ops.push({ type: "removed", value: left[i] });
        i += 1;
      } else {
        ops.push({ type: "added", value: right[j] });
        j += 1;
      }
    }

    while (i < m) {
      ops.push({ type: "removed", value: left[i] });
      i += 1;
    }
    while (j < n) {
      ops.push({ type: "added", value: right[j] });
      j += 1;
    }

    return ops;
  }

  function collapseSegments(ops: Array<{ type: Operation; value: string }>) {
    const combined: DiffSegment[] = [];
    for (const op of ops) {
      const previous = combined[combined.length - 1];
      if (previous && previous.type === op.type) {
        previous.value += mode === "line" ? `\n${op.value}` : op.value;
      } else {
        combined.push({ ...op });
      }
    }
    return combined;
  }

  function runDiff() {
    const leftTokens = tokenize(leftInput, mode);
    const rightTokens = tokenize(rightInput, mode);
    const operations = diffSequences(leftTokens, rightTokens);
    segments = collapseSegments(operations);
    stats = {
      additions: operations.filter((item) => item.type === "added").length,
      deletions: operations.filter((item) => item.type === "removed").length,
      neutrals: operations.filter((item) => item.type === "equal").length,
    };
  }

  function applyPreset(index: number) {
    const preset = presets[index];
    leftInput = preset.left;
    rightInput = preset.right;
    runDiff();
  }

  $: if (autoRun && browser) {
    const snapshot = { mode, leftInput, rightInput };
    clearTimeout(runHandle);
    runHandle = setTimeout(() => {
      if (
        snapshot.mode === mode &&
        snapshot.leftInput === leftInput &&
        snapshot.rightInput === rightInput
      ) {
        runDiff();
      }
    }, 160);
  }

  onDestroy(() => {
    clearTimeout(runHandle);
  });
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
    <aside class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <dl class="mt-5 grid grid-cols-3 gap-3 text-sm">
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          >
            <dt
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Additions
            </dt>
            <dd
              class="mt-1 text-lg font-semibold text-emerald-600 dark:text-emerald-400"
            >
              +{stats.additions}
            </dd>
          </div>
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          >
            <dt
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Deletions
            </dt>
            <dd
              class="mt-1 text-lg font-semibold text-rose-600 dark:text-rose-400"
            >
              -{stats.deletions}
            </dd>
          </div>
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          >
            <dt
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Matches
            </dt>
            <dd
              class="mt-1 text-lg font-semibold text-slate-800 dark:text-white"
            >
              {stats.neutrals}
            </dd>
          </div>
        </dl>
      </div>

      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Presets
        </h2>
        <div class="flex flex-col gap-3">
          {#each presets as preset, index}
            <button
              type="button"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200"
              on:click={() => applyPreset(index)}
            >
              <span
                class="block text-sm font-semibold text-slate-800 dark:text-white"
              >
                {preset.label}
              </span>
              <span
                class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
              >
                Loads sample content to explore diff behaviour.
              </span>
            </button>
          {/each}
        </div>
      </div>

      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Options
        </h2>
        <div class="grid gap-3 sm:grid-cols-3">
          {#each modeOptions as option}
            <button
              type="button"
              class={`rounded-2xl border px-3 py-2 text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                mode === option
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-indigo-400/70"
              }`}
              on:click={() => (mode = option)}
            >
              {option}
            </button>
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
          Diff automatically while typing
        </label>
        <button
          type="button"
          class="inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          on:click={runDiff}
        >
          Run diff
        </button>
      </div>
    </aside>

    <div class="space-y-6">
      <div class="grid gap-6 lg:grid-cols-2">
        <div
          class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
        >
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Original
            </h2>
            <Copy text={leftInput} label="Copy" floating={false} />
          </div>
          <textarea
            class="mt-4 h-56 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40 sm:h-64"
            bind:value={leftInput}
            spellcheck="false"
          />
        </div>
        <div
          class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
        >
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Modified
            </h2>
            <Copy text={rightInput} label="Copy" floating={false} />
          </div>
          <textarea
            class="mt-4 h-56 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40 sm:h-64"
            bind:value={rightInput}
            spellcheck="false"
          />
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Diff output
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Additions highlight in emerald, deletions in rose, unchanged text
              in slate.
            </p>
          </div>
          <Copy
            text={segments
              .map(
                (segment) => `${segment.type.toUpperCase()}: ${segment.value}`,
              )
              .join(mode === "line" ? "\n" : "")}
            label="Copy summary"
            floating={false}
          />
        </div>
        <div
          class="mt-4 max-h-[30rem] overflow-auto rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
        >
          {#if segments.length === 0}
            <p>No differences yet — edit the inputs or run the diff.</p>
          {:else}
            {#each segments as segment, index (index)}
              <span
                class={`${
                  segment.type === "added"
                    ? "rounded bg-emerald-300/50 px-1 text-emerald-900 dark:bg-emerald-400/20 dark:text-emerald-100"
                    : segment.type === "removed"
                      ? "rounded bg-rose-300/50 px-1 text-rose-900 dark:bg-rose-400/20 dark:text-rose-100"
                      : ""
                }`}
              >
                {segment.value}
              </span>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
