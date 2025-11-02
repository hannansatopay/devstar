<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  type Token = { text: string; highlight: boolean };
  type DiffKind = "equal" | "added" | "removed" | "changed";
  type PreparedLine = { raw: string; normalized: string };

  type DiffRow = {
    type: DiffKind;
    leftLine: number | null;
    rightLine: number | null;
    leftValue: string | null;
    rightValue: string | null;
    leftTokens: Token[];
    rightTokens: Token[];
  };

  type DiffStats = {
    leftLines: number;
    rightLines: number;
    matches: number;
    additions: number;
    deletions: number;
    changes: number;
    similarity: number;
  };

  type DiffResult = {
    rows: DiffRow[];
    stats: DiffStats;
  };

  const presets = [
    {
      id: "feature",
      label: "Feature iteration",
      description: "Compare two versions of a component hook.",
      left: `export function useFeatureFlag(flag) {
  const cache = new Map();

  return cache.get(flag) ?? false;
}`,
      right: `export function useFeatureFlag(flag, fallback = false) {
  const cache = new Map();
  if (cache.has(flag)) {
    return cache.get(flag);
  }

  const value = retrieve(flag, fallback);
  cache.set(flag, value);
  return value;
}`,
    },
    {
      id: "styles",
      label: "Styling tweaks",
      description: "Spot design updates between style rules.",
      left: `.button {
  background: linear-gradient(135deg, #6366f1, #ec4899);
  color: white;
  padding: 12px 24px;
  border-radius: 14px;
  box-shadow: 0 20px 40px -25px rgba(99, 102, 241, 0.45);
}`,
      right: `.button {
  background: linear-gradient(135deg, #4f46e5, #ec4899);
  color: white;
  padding: 12px 24px;
  border-radius: 18px;
  box-shadow: 0 24px 48px -24px rgba(76, 29, 149, 0.45);
  transition: transform 160ms ease;
}

.button:hover {
  transform: translateY(-2px);
}`,
    },
    {
      id: "config",
      label: "Configuration change",
      description: "Review environment updates before deploying.",
      left: `{
  "apiBase": "https://api.dev.devstar.app",
  "metrics": false,
  "features": ["search", "export"]
}`,
      right: `{
  "apiBase": "https://api.prod.devstar.app",
  "metrics": true,
  "features": ["search", "export", "insights"],
  "release": "2025.11.01"
}`,
    },
  ];

  let leftInput = presets[0].left;
  let rightInput = presets[0].right;
  let ignoreCase = false;
  let trimWhitespace = false;
  let collapseWhitespace = false;
  let diff: DiffResult = buildDiff(leftInput, rightInput, {
    ignoreCase,
    trimWhitespace,
    collapseWhitespace,
  });

  $: diff = buildDiff(leftInput, rightInput, {
    ignoreCase,
    trimWhitespace,
    collapseWhitespace,
  });

  function normalizeLine(
    raw: string,
    options: {
      ignoreCase: boolean;
      trimWhitespace: boolean;
      collapseWhitespace: boolean;
    },
  ) {
    let normalized = raw;
    if (options.trimWhitespace) {
      normalized = normalized.trim();
    }
    if (options.collapseWhitespace) {
      normalized = normalized.replace(/\s+/g, " ");
    }
    if (options.ignoreCase) {
      normalized = normalized.toLowerCase();
    }
    return normalized;
  }

  function prepareLines(
    value: string,
    options: {
      ignoreCase: boolean;
      trimWhitespace: boolean;
      collapseWhitespace: boolean;
    },
  ): PreparedLine[] {
    const lines = value.replace(/\r\n/g, "\n").split("\n");
    return lines.map((raw) => ({
      raw,
      normalized: normalizeLine(raw, options),
    }));
  }

  function inlineTokens(left: string | null, right: string | null) {
    const defaultTokens = {
      leftTokens: left ? [{ text: left, highlight: false }] : [],
      rightTokens: right ? [{ text: right, highlight: false }] : [],
    };
    if (!left || !right || left === right) {
      return defaultTokens;
    }

    let start = 0;
    const leftLength = left.length;
    const rightLength = right.length;
    const maxLength = Math.min(leftLength, rightLength);

    while (start < maxLength && left[start] === right[start]) {
      start += 1;
    }

    let endLeft = leftLength - 1;
    let endRight = rightLength - 1;
    while (
      endLeft >= start &&
      endRight >= start &&
      left[endLeft] === right[endRight]
    ) {
      endLeft -= 1;
      endRight -= 1;
    }

    if (start > endLeft && start > endRight) {
      return defaultTokens;
    }

    const leftTokens: Token[] = [];
    const rightTokens: Token[] = [];

    const prefixLeft = left.slice(0, start);
    const prefixRight = right.slice(0, start);
    if (prefixLeft) {
      leftTokens.push({ text: prefixLeft, highlight: false });
    }
    if (prefixRight) {
      rightTokens.push({ text: prefixRight, highlight: false });
    }

    const changedLeft = left.slice(start, endLeft + 1);
    const changedRight = right.slice(start, endRight + 1);
    if (changedLeft) {
      leftTokens.push({ text: changedLeft, highlight: true });
    }
    if (changedRight) {
      rightTokens.push({ text: changedRight, highlight: true });
    }

    const suffixLeft = left.slice(endLeft + 1);
    const suffixRight = right.slice(endRight + 1);
    if (suffixLeft) {
      leftTokens.push({ text: suffixLeft, highlight: false });
    }
    if (suffixRight) {
      rightTokens.push({ text: suffixRight, highlight: false });
    }

    return { leftTokens, rightTokens };
  }

  function buildDiff(
    leftRaw: string,
    rightRaw: string,
    options: {
      ignoreCase: boolean;
      trimWhitespace: boolean;
      collapseWhitespace: boolean;
    },
  ): DiffResult {
    const leftLines = prepareLines(leftRaw, options);
    const rightLines = prepareLines(rightRaw, options);
    const m = leftLines.length;
    const n = rightLines.length;
    const dp = Array.from({ length: m + 1 }, () =>
      new Array<number>(n + 1).fill(0),
    );

    for (let i = m - 1; i >= 0; i -= 1) {
      for (let j = n - 1; j >= 0; j -= 1) {
        if (leftLines[i].normalized === rightLines[j].normalized) {
          dp[i][j] = dp[i + 1][j + 1] + 1;
        } else {
          dp[i][j] = Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
      }
    }

    const ops: Array<{
      type: "equal" | "removed" | "added";
      leftIndex?: number;
      rightIndex?: number;
    }> = [];
    let i = 0;
    let j = 0;
    while (i < m && j < n) {
      if (leftLines[i].normalized === rightLines[j].normalized) {
        ops.push({ type: "equal", leftIndex: i, rightIndex: j });
        i += 1;
        j += 1;
      } else if (dp[i + 1][j] >= dp[i][j + 1]) {
        ops.push({ type: "removed", leftIndex: i });
        i += 1;
      } else {
        ops.push({ type: "added", rightIndex: j });
        j += 1;
      }
    }
    while (i < m) {
      ops.push({ type: "removed", leftIndex: i });
      i += 1;
    }
    while (j < n) {
      ops.push({ type: "added", rightIndex: j });
      j += 1;
    }

    const rows: DiffRow[] = [];
    let leftLine = 1;
    let rightLine = 1;

    for (let index = 0; index < ops.length; index += 1) {
      const op = ops[index];
      if (
        op.type === "equal" &&
        op.leftIndex !== undefined &&
        op.rightIndex !== undefined
      ) {
        const value = leftLines[op.leftIndex].raw;
        rows.push({
          type: "equal",
          leftLine,
          rightLine,
          leftValue: value,
          rightValue: value,
          leftTokens: value ? [{ text: value, highlight: false }] : [],
          rightTokens: value ? [{ text: value, highlight: false }] : [],
        });
        leftLine += 1;
        rightLine += 1;
        continue;
      }

      if (
        op.type === "removed" &&
        ops[index + 1]?.type === "added" &&
        op.leftIndex !== undefined &&
        ops[index + 1].rightIndex !== undefined
      ) {
        const leftValue = leftLines[op.leftIndex].raw;
        const rightValue = rightLines[ops[index + 1].rightIndex!].raw;
        const { leftTokens, rightTokens } = inlineTokens(leftValue, rightValue);
        rows.push({
          type: "changed",
          leftLine,
          rightLine,
          leftValue,
          rightValue,
          leftTokens,
          rightTokens,
        });
        leftLine += 1;
        rightLine += 1;
        index += 1;
        continue;
      }

      if (op.type === "removed" && op.leftIndex !== undefined) {
        const value = leftLines[op.leftIndex].raw;
        rows.push({
          type: "removed",
          leftLine,
          rightLine: null,
          leftValue: value,
          rightValue: null,
          leftTokens: value ? [{ text: value, highlight: true }] : [],
          rightTokens: [],
        });
        leftLine += 1;
        continue;
      }

      if (op.type === "added" && op.rightIndex !== undefined) {
        const value = rightLines[op.rightIndex].raw;
        rows.push({
          type: "added",
          leftLine: null,
          rightLine,
          leftValue: null,
          rightValue: value,
          leftTokens: [],
          rightTokens: value ? [{ text: value, highlight: true }] : [],
        });
        rightLine += 1;
      }
    }

    const stats: DiffStats = {
      leftLines: m,
      rightLines: n,
      matches: rows.filter((row) => row.type === "equal").length,
      additions: rows.filter((row) => row.type === "added").length,
      deletions: rows.filter((row) => row.type === "removed").length,
      changes: rows.filter((row) => row.type === "changed").length,
      similarity:
        m === 0 && n === 0
          ? 100
          : Math.round(
              (rows.filter((row) => row.type === "equal").length /
                Math.max(1, Math.max(m, n))) *
                100,
            ),
    };

    return { rows, stats };
  }

  function applyPreset(id: string) {
    const preset = presets.find((item) => item.id === id);
    if (!preset) return;
    leftInput = preset.left;
    rightInput = preset.right;
  }
</script>

<section class="space-y-6">
  <div class="flex flex-col gap-6 lg:flex-row">
    <aside class="w-full space-y-6 lg:max-w-sm">
      <div
        class="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <dl class="mt-5 grid grid-cols-2 gap-4 text-sm">
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          >
            <dt
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Similarity
            </dt>
            <dd
              class="mt-1 text-lg font-semibold text-indigo-600 dark:text-indigo-400"
            >
              {diff.stats.similarity}%
            </dd>
          </div>
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          >
            <dt
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Changes
            </dt>
            <dd
              class="mt-1 text-lg font-semibold text-slate-800 dark:text-white"
            >
              {diff.stats.additions + diff.stats.deletions + diff.stats.changes}
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
          Diff preferences
        </h2>
        <label
          class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <input
            class="size-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400"
            type="checkbox"
            bind:checked={ignoreCase}
          />
          Ignore letter casing
        </label>
        <label
          class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <input
            class="size-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400"
            type="checkbox"
            bind:checked={trimWhitespace}
          />
          Trim leading & trailing whitespace
        </label>
        <label
          class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <input
            class="size-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400"
            type="checkbox"
            bind:checked={collapseWhitespace}
          />
          Collapse duplicate spaces
        </label>
      </div>

      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Quick scenarios
        </h2>
        <div class="flex flex-col gap-3">
          {#each presets as preset}
            <button
              type="button"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200"
              on:click={() => applyPreset(preset.id)}
            >
              <span class="font-semibold text-slate-800 dark:text-white"
                >{preset.label}</span
              >
              <span
                class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
              >
                {preset.description}
              </span>
            </button>
          {/each}
        </div>
      </div>
    </aside>

    <div class="flex-1 space-y-6">
      <div class="grid gap-6 lg:grid-cols-2">
        <div
          class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
        >
          <div class="flex items-center justify-between gap-4">
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Original
            </h2>
            <button
              type="button"
              class="rounded-full border border-transparent bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              on:click={() => (leftInput = "")}
            >
              Clear
            </button>
          </div>
          <textarea
            class="mt-4 h-64 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40 sm:h-72"
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
            <button
              type="button"
              class="rounded-full border border-transparent bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
              on:click={() => (rightInput = "")}
            >
              Clear
            </button>
          </div>
          <textarea
            class="mt-4 h-64 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40 sm:h-72"
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
              Diff overview
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Highlighted rows show additions, deletions, or edits between both
              inputs.
            </p>
          </div>
          <Copy
            text={diff.rows
              .map((row) => `${row.leftValue ?? ""} => ${row.rightValue ?? ""}`)
              .join("\n")}
            label="Copy summary"
            floating={false}
          />
        </div>

        <div
          class="mt-4 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700"
        >
          <div
            class="grid grid-cols-[4rem_minmax(0,1fr)_4rem_minmax(0,1fr)] bg-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-900 dark:text-slate-300"
          >
            <div
              class="border-b border-slate-200 px-3 py-2 dark:border-slate-800"
            >
              Line
            </div>
            <div
              class="border-b border-slate-200 px-3 py-2 dark:border-slate-800"
            >
              Original
            </div>
            <div
              class="border-b border-slate-200 px-3 py-2 dark:border-slate-800"
            >
              Line
            </div>
            <div
              class="border-b border-slate-200 px-3 py-2 dark:border-slate-800"
            >
              Modified
            </div>
          </div>
          <div class="max-h-[28rem] overflow-auto text-sm">
            {#each diff.rows as row, idx (idx)}
              <div
                class={`grid grid-cols-[4rem_minmax(0,1fr)_4rem_minmax(0,1fr)] border-b border-slate-100 text-slate-700 last:border-none dark:border-slate-800 dark:text-slate-200 ${
                  row.type === "equal"
                    ? "bg-white dark:bg-transparent"
                    : row.type === "added"
                      ? "bg-emerald-50/70 dark:bg-emerald-900/30"
                      : row.type === "removed"
                        ? "bg-rose-50/70 dark:bg-rose-900/20"
                        : "bg-amber-50/80 dark:bg-amber-900/20"
                }`}
              >
                <div
                  class="border-r border-slate-100 px-3 py-2 font-mono text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500"
                >
                  {row.leftLine ?? ""}
                </div>
                <div class="px-3 py-2 font-mono text-[13px] leading-relaxed">
                  {#if row.leftTokens.length}
                    {#each row.leftTokens as token, tokenIndex (tokenIndex)}
                      <span
                        class={`${
                          token.highlight
                            ? "rounded bg-amber-300/70 px-0.5 text-slate-900 dark:bg-amber-400/20 dark:text-amber-100"
                            : ""
                        }`}
                      >
                        {token.text}
                      </span>
                    {/each}
                  {/if}
                </div>
                <div
                  class="border-l border-slate-100 px-3 py-2 font-mono text-xs text-slate-400 dark:border-slate-800 dark:text-slate-500"
                >
                  {row.rightLine ?? ""}
                </div>
                <div class="px-3 py-2 font-mono text-[13px] leading-relaxed">
                  {#if row.rightTokens.length}
                    {#each row.rightTokens as token, tokenIndex (tokenIndex)}
                      <span
                        class={`${
                          token.highlight
                            ? "rounded bg-emerald-300/70 px-0.5 text-slate-900 dark:bg-emerald-400/30 dark:text-emerald-100"
                            : ""
                        }`}
                      >
                        {token.text}
                      </span>
                    {/each}
                  {/if}
                </div>
              </div>
            {/each}
          </div>
        </div>
        <div
          class="mt-4 grid gap-3 text-xs text-slate-500 dark:text-slate-400 sm:grid-cols-3"
        >
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40"
          >
            <p class="font-semibold uppercase tracking-wide">Matches</p>
            <p
              class="mt-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              {diff.stats.matches}
            </p>
          </div>
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40"
          >
            <p class="font-semibold uppercase tracking-wide">Additions</p>
            <p
              class="mt-1 text-sm font-semibold text-emerald-600 dark:text-emerald-300"
            >
              +{diff.stats.additions}
            </p>
          </div>
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/40"
          >
            <p class="font-semibold uppercase tracking-wide">Deletions</p>
            <p
              class="mt-1 text-sm font-semibold text-rose-600 dark:text-rose-300"
            >
              -{diff.stats.deletions}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
