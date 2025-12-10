<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import { browser } from "$app/environment";
  import jsBeautify from "js-beautify";
  import jsonBeautify from "json-beautify";
  import * as babelParser from "@babel/parser";
  import { onDestroy, onMount } from "svelte";
  import {
    ensurePrettierReady,
    hasPrettierConfig,
    runPrettier,
  } from "$lib/utils/prettier-client";

  type Language =
    | "javascript"
    | "typescript"
    | "json"
    | "html"
    | "css"
    | "markdown";

  type AstSummary =
    | {
        type: string;
        loc?: { start: number; end: number };
        children?: Array<{ key: string; nodes: AstSummary[] | string }>;
      }
    | string;

  type SummaryResult = {
    root?: AstSummary;
    body?: AstSummary[];
  };

  const languageOptions: Array<{
    value: Language;
    label: string;
    description: string;
  }> = [
    {
      value: "javascript",
      label: "JavaScript",
      description:
        "ES modules, JSX, decorators, and optional chaining supported.",
    },
    {
      value: "typescript",
      label: "TypeScript",
      description: "Parse TS/TSX syntax, including enums and interfaces.",
    },
    {
      value: "json",
      label: "JSON",
      description: "Pretty-print config files while preserving ordering.",
    },
    {
      value: "html",
      label: "HTML / XML",
      description: "Beautify markup, attributes, and embedded inline styles.",
    },
    {
      value: "css",
      label: "CSS / SCSS",
      description: "Align rules, combine selectors, and normalize spacing.",
    },
    {
      value: "markdown",
      label: "Markdown",
      description: "Normalize headings, lists, and fenced code blocks.",
    },
  ];

  const starterSnippets: Record<Language, string> = {
    javascript: `export const team = [
  { name: "Nova", role: "Design" },
  { name: "Kai", role: "Frontend" },
];

function greet(member) {
  return \`Welcome back, \${member.name}!\`;
}

team.forEach((person) => {
  console.log(greet(person));
});`,
    typescript: `type Launch = {
  id: string;
  at: Date;
  status: "scheduled" | "completed";
};

export function isOverdue(launch: Launch) {
  return launch.status === "scheduled" && launch.at < new Date();
}`,
    json: `{"project":"Devstar","features":["formatting","ast","snippets"],"active":true}`,
    html: `<article>
  <h2>Release notes</h2>
  <p>We ship improvements every week.</p>
  <button class="cta">Read more</button>
</article>`,
    css: `.cta {
color:#fff;
background:linear-gradient(135deg,#6366f1,#ec4899);
padding:1rem 1.5rem;
border-radius:1rem;
}`,
    markdown: `# Devstar formatter

## Highlights

- Instant AST insights
- Multi-language formatting
- Theme-aware previews

> Build delightful tools faster.`,
  };

  let language: Language = "javascript";
  let source = starterSnippets[language];
  let formatted = "";
  let formatError = "";
  let indentSize = 2;
  let wrap = 100;
  let maxAstDepth = 4;
  let astSummary: SummaryResult | null = null;
  let astError = "";
  let autoFormat = true;
  let runHandle: ReturnType<typeof setTimeout> | undefined;
  let isFormatting = false;

  function normalizeSource(value: string) {
    return value.replace(/\r\n/g, "\n");
  }

  function sanitizeJson(value: string) {
    return value
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/,\s*([}\]])/g, "$1");
  }

  function ensureTrailingNewline(value: string) {
    const trimmed = value.replace(/[ \t]+\n/g, "\n");
    return trimmed.endsWith("\n") ? trimmed : `${trimmed}\n`;
  }

  function normalizeFormatted(value: string, lang: Language) {
    let normalized = value
      .replace(/\r\n/g, "\n")
      .replace(/\t/g, "  ")
      .replace(/[ \t]+$/gm, "")
      .replace(/^\s*\n/, "")
      .replace(/^\s+/, "");

    if (lang === "html") {
      normalized = normalized
        .replace(/\n{2,}/g, "\n")
        .replace(
          />([^<]+)</g,
          (_, text) => `>${text.replace(/\s+/g, " ").trim()}<`,
        );
    } else {
      normalized = normalized.replace(/\n{3,}/g, "\n\n");
    }

    return ensureTrailingNewline(normalized);
  }

  function fallbackFormat(original: string) {
    switch (language) {
      case "javascript":
      case "typescript":
        return jsBeautify.js(original, {
          indent_size: indentSize,
          wrap_line_length: wrap,
          end_with_newline: true,
          max_preserve_newlines: 2,
          space_after_anon_function: true,
        });
      case "json": {
        const sanitized = sanitizeJson(original);
        const parsed = JSON.parse(sanitized);
        return jsonBeautify(parsed, null, indentSize);
      }
      case "html":
        return jsBeautify.html(original, {
          indent_size: indentSize,
          wrap_line_length: wrap,
          preserve_newlines: true,
          max_preserve_newlines: 1,
          end_with_newline: true,
          extra_liners: [],
        });
      case "css":
        return jsBeautify.css(original, {
          indent_size: indentSize,
          wrap_line_length: wrap,
          end_with_newline: true,
        });
      case "markdown":
        return tidyMarkdown(original);
      default:
        return original;
    }
  }

  function extractErrorMessage(err: unknown) {
    if (err instanceof Error) {
      const firstLine = err.message.split("\n")[0]?.trim();
      return firstLine || "Formatting failed. Please review the syntax.";
    }
    return "Formatting failed. Please review the syntax.";
  }

  async function formatCode() {
    const original = normalizeSource(source);
    const jsonReady = language === "json" ? sanitizeJson(original) : original;
    isFormatting = true;
    try {
      let output = original;

      const canUsePrettier =
        browser && (await ensurePrettierReady()) && hasPrettierConfig(language);
      if (canUsePrettier) {
        output = await runPrettier(
          language,
          language === "json" ? jsonReady : original,
          {
            tabWidth: indentSize,
            printWidth: wrap,
            singleQuote: false,
            trailingComma: "es5",
            endOfLine: "lf",
          },
        );
      } else {
        output = fallbackFormat(jsonReady);
      }

      formatted = normalizeFormatted(output, language);
      formatError = "";
    } catch (err) {
      formatted = normalizeFormatted(original, language);
      formatError = extractErrorMessage(err);
    } finally {
      isFormatting = false;
    }
  }

  function tidyMarkdown(input: string) {
    return input
      .replace(/\t/g, "  ")
      .replace(/\r\n?/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  function summarizeAst(node: any, depth = 0): AstSummary {
    if (!node || typeof node.type !== "string") {
      return typeof node === "string" ? node : "";
    }
    const summary: AstSummary = {
      type: node.type,
    };
    if (node.loc) {
      summary.loc = {
        start: node.loc.start.line,
        end: node.loc.end.line,
      };
    }
    if (depth >= maxAstDepth) {
      return summary;
    }
    const childKeys = Object.keys(node).filter((key) => {
      const value = (node as any)[key];
      if (!value) return false;
      if (Array.isArray(value)) {
        return value.some((entry) => entry && typeof entry.type === "string");
      }
      return typeof value === "object" && typeof value.type === "string";
    });
    if (childKeys.length) {
      summary.children = childKeys.slice(0, 6).map((key) => {
        const value = (node as any)[key];
        if (Array.isArray(value)) {
          const items = value
            .filter((entry) => entry && typeof entry.type === "string")
            .slice(0, 6)
            .map((entry) => summarizeAst(entry, depth + 1));
          return {
            key,
            nodes: items.length ? items : "...",
          };
        }
        return {
          key,
          nodes: summarizeAst(value, depth + 1),
        };
      });
    }
    return summary;
  }

  function generateAst() {
    if (!browser) return;
    if (language !== "javascript" && language !== "typescript") {
      astSummary = null;
      astError =
        "AST inspection is available for JavaScript and TypeScript inputs.";
      return;
    }
    try {
      const input = formatted ? formatted : source;
      const ast = babelParser.parse(input, {
        sourceType: "module",
        errorRecovery: true,
        allowAwaitOutsideFunction: true,
        plugins: [
          "jsx",
          "classProperties",
          "dynamicImport",
          "optionalChaining",
          "decorators-legacy",
          "topLevelAwait",
          language === "typescript" ? "typescript" : "flow",
        ],
      });
      const summary: SummaryResult = {
        root: summarizeAst(ast.program, 0),
        body: ast.program.body
          .slice(0, 10)
          .map((node: unknown) => summarizeAst(node, 1)),
      };
      astSummary = summary;
      astError = "";
    } catch (err) {
      astSummary = null;
      astError = extractErrorMessage(err);
    }
  }

  async function runFormatter() {
    await formatCode();
    generateAst();
  }

  function resetPreset(option: Language) {
    language = option;
    source = starterSnippets[option];
    void runFormatter();
  }

  onMount(() => {
    if (browser) {
      void runFormatter();
    }
  });

  $: if (autoFormat && browser) {
    const snapshot = {
      language,
      source,
      indentSize,
      wrap,
      maxAstDepth,
    };
    clearTimeout(runHandle);
    runHandle = setTimeout(() => {
      if (
        snapshot.language === language &&
        snapshot.source === source &&
        snapshot.indentSize === indentSize &&
        snapshot.wrap === wrap &&
        snapshot.maxAstDepth === maxAstDepth
      ) {
        void runFormatter();
      }
    }, 180);
  }

  onDestroy(() => {
    clearTimeout(runHandle);
  });
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-3">
    <aside class="space-y-6 lg:col-span-1">
      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Language presets
        </h2>
        <div class="pb-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          {#each languageOptions as option}
            <button
              type="button"
              class={`min-w-[220px] rounded-2xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 md:min-w-0 ${
                language === option.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-indigo-400/70"
              }`}
              on:click={() => resetPreset(option.value)}
            >
              <span class="text-sm font-semibold">{option.label}</span>
              <span
                class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
              >
                {option.description}
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
          Formatting options
        </h2>
        <div class="grid gap-4 sm:grid-cols-2">
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Indent size</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="number"
              min="1"
              max="8"
              bind:value={indentSize}
            />
          </label>
          <label
            class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Wrap column</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="number"
              min="40"
              max="200"
              step="10"
              bind:value={wrap}
            />
          </label>
        </div>
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>AST depth</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="number"
            min="1"
            max="6"
            bind:value={maxAstDepth}
          />
        </label>
        <label
          class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <input
            class="size-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400"
            type="checkbox"
            bind:checked={autoFormat}
          />
          Auto format and parse while typing
        </label>
        <button
          type="button"
          class="inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          on:click={() => void runFormatter()}
          disabled={isFormatting}
        >
          {isFormatting ? "Updating..." : "Update preview"}
        </button>
      </div>
    </aside>

    <div class="lg:col-span-2 grid gap-6 lg:grid-cols-2">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Source input
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 text-wrap">
              Paste the code you want to format or parse.
            </p>
          </div>
          <Copy text={source} label="Copy input" floating={false} />
        </div>
        <textarea
          class="mt-4 h-64 w-full resize-y overflow-auto whitespace-pre rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40 sm:h-80"
          bind:value={source}
          spellcheck="false"
        />
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Formatted output
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 text-wrap">
              Ready-to-ship snippet with consistent indentation and wrapping.
            </p>
          </div>
          <Copy text={formatted} label="Copy output" floating={false} />
        </div>
        {#if formatError}
          <p
            class="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
          >
            {formatError}
          </p>
        {/if}
        <textarea
          class="mt-4 h-64 w-full resize-y overflow-auto whitespace-pre rounded-2xl border border-slate-200 bg-slate-900/95 p-4 font-mono text-sm leading-relaxed text-emerald-200 shadow-inner transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-emerald-300 dark:focus:border-emerald-500 dark:focus:ring-emerald-700/40 sm:h-80"
          bind:value={formatted}
          spellcheck="false"
          readonly
        />
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85 lg:col-span-2"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              AST overview
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 text-wrap">
              Structured summary of top-level nodes and child relationships.
            </p>
          </div>
          <Copy
            text={astSummary ? JSON.stringify(astSummary, null, 2) : ""}
            label="Copy AST"
            floating={false}
          />
        </div>
        {#if astError}
          <p
            class="mt-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
          >
            {astError}
          </p>
        {:else if astSummary}
          <pre
            class="mt-4 max-h-72 overflow-auto rounded-2xl border border-slate-200 bg-slate-900/95 p-4 font-mono text-sm leading-relaxed text-sky-200 dark:border-slate-700 dark:bg-black">
  {JSON.stringify(astSummary, null, 2)}
</pre>
        {:else}
          <p
            class="mt-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          >
            Select JavaScript or TypeScript, then run the formatter to view the
            AST summary.
          </p>
        {/if}
      </div>
    </div>
  </div>
</section>
