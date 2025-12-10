<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import { browser } from "$app/environment";
  import { onDestroy, onMount } from "svelte";
  import jsBeautify from "js-beautify";
  import { format as sqlFormatter } from "sql-formatter";
  import jsonBeautify from "json-beautify";
  import * as babelParser from "@babel/parser";
  import {
    ensurePrettierReady,
    hasPrettierConfig,
    runPrettier,
  } from "$lib/utils/prettier-client";

  type Language = "javascript" | "typescript" | "json" | "html" | "css" | "sql";
  type MessageKind = "info" | "warning" | "error";

  type LintMessage = {
    kind: MessageKind;
    text: string;
    line?: number;
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
        "ES2017+ linting with semicolon checks and console usage hints.",
    },
    {
      value: "typescript",
      label: "TypeScript",
      description:
        "Strip types for formatting while preserving generics and enums.",
    },
    {
      value: "json",
      label: "JSON",
      description:
        "Validate structure, detect trailing commas, and pretty-print objects.",
    },
    {
      value: "html",
      label: "HTML",
      description: "Tidy markup and ensure accessible attribute casing.",
    },
    {
      value: "css",
      label: "CSS",
      description:
        "Align declarations, compress spacing, and flag duplicate properties.",
    },
    {
      value: "sql",
      label: "SQL",
      description:
        "Format queries for PostgreSQL / MySQL syntax with consistent casing.",
    },
  ];

  const starterSnippets: Record<Language, string> = {
    javascript: `function greet(name) {
  const message = \`Hello, \${name}!\`;
  console.log(message)
  return message;
}`,
    typescript: `type Todo = {
  id: number;
  title: string;
  done?: boolean;
};

export function toggle(todo: Todo) {
  return { ...todo, done: !todo.done };
}`,
    json: `{
  "product": "Devstar Toolkit",
  "features": ["Linting", "Formatting", "Automation"],
  "active": true,
}`,
    html: `<section class="hero">
  <h1>Ship polished UI</h1>
  <button class="cta">Start now</button>
</section>`,
    css: `.cta {
  color: white;
  background: #2563eb;
  background: linear-gradient(135deg, #2563eb, #ec4899);
  padding: 1rem 1.5rem;
}`,
    sql: `select id, email, created_at from users where active = true order by created_at desc limit 20;`,
  };

  let language: Language = "javascript";
  let source = starterSnippets[language];
  let formatted = "";
  let messages: LintMessage[] = [];
  let stats = { lines: 0, characters: 0 };
  let lintHandle: ReturnType<typeof setTimeout> | undefined;

  let indentSize = 2;
  let enforceSemicolons = true;
  let flagConsole = true;
  let maxColumn = 120;
  let isLinting = false;

  const builtinIdentifiers = new Set([
    "console",
    "window",
    "document",
    "globalThis",
    "process",
    "module",
    "exports",
    "require",
    "__dirname",
    "__filename",
  ]);

  function normalizeSource(value: string) {
    return value.replace(/\r\n/g, "\n");
  }

  function extractErrorMessage(err: unknown) {
    if (err instanceof Error) {
      const firstLine = err.message.split("\n")[0]?.trim() ?? "";
      return firstLine || "Unable to analyze the provided code.";
    }
    return "Unable to analyze the provided code.";
  }

  function sortMessages(entries: LintMessage[]) {
    const weight: Record<MessageKind, number> = {
      error: 0,
      warning: 1,
      info: 2,
    };
    return [...entries].sort((a, b) => {
      const severity = (weight[a.kind] ?? 3) - (weight[b.kind] ?? 3);
      if (severity !== 0) return severity;
      const lineA = a.line ?? Number.POSITIVE_INFINITY;
      const lineB = b.line ?? Number.POSITIVE_INFINITY;
      return lineA - lineB;
    });
  }

  function parseJavascriptSource(source: string, mode: Language) {
    try {
      const ast = babelParser.parse(source, {
        sourceType: "module",
        errorRecovery: true,
        allowAwaitOutsideFunction: true,
        plugins: [
          "jsx",
          "classProperties",
          "dynamicImport",
          "optionalChaining",
          "topLevelAwait",
          "decorators-legacy",
          mode === "typescript" ? "typescript" : "flow",
        ],
      });
      const parseIssues =
        Array.isArray((ast as any).errors) && (ast as any).errors.length
          ? (ast as any).errors.map((issue: any) => ({
              kind: "error" as MessageKind,
              text: (issue.message ?? "Syntax error").replace(
                /\s+\(\d+:\d+\)$/,
                "",
              ),
              line: issue.loc?.line,
            }))
          : [];
      return { ast, errors: parseIssues };
    } catch (err) {
      return {
        ast: null,
        errors: [
          {
            kind: "error" as MessageKind,
            text: extractErrorMessage(err),
          },
        ],
      };
    }
  }

  function traverseAst(
    node: any,
    visit: (node: any, parents: any[]) => void,
    parents: any[] = [],
  ) {
    if (!node || typeof node.type !== "string") return;
    visit(node, parents);
    parents.push(node);
    for (const key of Object.keys(node)) {
      const value = (node as Record<string, unknown>)[key];
      if (!value) continue;
      if (Array.isArray(value)) {
        for (const entry of value) {
          if (entry && typeof entry.type === "string") {
            traverseAst(entry, visit, parents);
          }
        }
      } else if (
        typeof value === "object" &&
        typeof (value as any).type === "string"
      ) {
        traverseAst(value as any, visit, parents);
      }
    }
    parents.pop();
  }

  function gatherPatternIdentifiers(
    pattern: any,
    visit: (name: string, line?: number) => void,
  ) {
    if (!pattern) return;
    switch (pattern.type) {
      case "Identifier":
        visit(pattern.name, pattern.loc?.start?.line);
        break;
      case "ObjectPattern":
        pattern.properties?.forEach((prop: any) => {
          if (prop.type === "RestElement") {
            gatherPatternIdentifiers(prop.argument, visit);
          } else if (prop.value) {
            gatherPatternIdentifiers(prop.value, visit);
          } else if (prop.argument) {
            gatherPatternIdentifiers(prop.argument, visit);
          }
        });
        break;
      case "ArrayPattern":
        pattern.elements?.forEach((element: any) => {
          gatherPatternIdentifiers(element, visit);
        });
        break;
      case "RestElement":
        gatherPatternIdentifiers(pattern.argument, visit);
        break;
      case "AssignmentPattern":
        gatherPatternIdentifiers(pattern.left, visit);
        break;
    }
  }

  function shouldCountIdentifierUsage(node: any, parent: any) {
    if (!parent || !node) return true;
    if (typeof parent.type === "string" && parent.type.startsWith("TS")) {
      return false;
    }
    switch (parent.type) {
      case "VariableDeclarator":
      case "FunctionDeclaration":
      case "FunctionExpression":
      case "ArrowFunctionExpression":
        if (parent.id === node) return false;
        if (parent.params && parent.params.includes(node)) return false;
        break;
      case "ImportSpecifier":
      case "ImportDefaultSpecifier":
      case "ImportNamespaceSpecifier":
        return false;
      case "MemberExpression":
      case "OptionalMemberExpression":
        if (parent.property === node && !parent.computed) {
          return false;
        }
        break;
      case "ObjectProperty":
      case "ObjectMethod":
      case "ClassMethod":
      case "ClassProperty":
      case "Property":
        if (parent.key === node && !parent.computed) {
          return false;
        }
        break;
      case "LabeledStatement":
        return false;
    }
    return true;
  }

  function isExportedDeclaration(target: any, parents: any[]) {
    if (!parents.length) return false;
    const direct = parents[parents.length - 1];
    const upper = parents[parents.length - 2];
    if (
      direct &&
      (direct.type === "ExportNamedDeclaration" ||
        direct.type === "ExportDefaultDeclaration") &&
      direct.declaration === target
    ) {
      return true;
    }
    if (
      upper &&
      (upper.type === "ExportNamedDeclaration" ||
        upper.type === "ExportDefaultDeclaration") &&
      upper.declaration === target
    ) {
      return true;
    }
    return false;
  }

  function inspectJavascript(code: string, mode: Language) {
    const findings: LintMessage[] = [];
    const { ast, errors } = parseJavascriptSource(code, mode);
    findings.push(...errors);
    if (!ast) {
      return findings;
    }

    const declared = new Map<string, number | undefined>();
    const referenced = new Set<string>();

    traverseAst(ast.program ?? ast, (node, parents) => {
      if (!node || typeof node.type !== "string") return;
      if (node.type.startsWith?.("TS")) return;

      switch (node.type) {
        case "VariableDeclarator": {
          const parent = parents[parents.length - 1];
          if (isExportedDeclaration(parent, parents)) {
            break;
          }
          gatherPatternIdentifiers(node.id, (name, line) => {
            if (!builtinIdentifiers.has(name)) {
              declared.set(name, line ?? node.loc?.start?.line);
            }
          });
          break;
        }
        case "FunctionDeclaration":
        case "ClassDeclaration":
          if (node.id && !isExportedDeclaration(node, parents)) {
            declared.set(
              node.id.name,
              node.loc?.start?.line ?? node.id.loc?.start?.line,
            );
          }
          break;
        case "DebuggerStatement":
          findings.push({
            kind: "warning",
            text: "Debugger statement found - remove before shipping.",
            line: node.loc?.start?.line,
          });
          break;
        case "CallExpression":
          if (
            node.callee?.type === "Identifier" &&
            node.callee.name === "eval"
          ) {
            findings.push({
              kind: "warning",
              text: "Avoid using eval() - it can be a security risk.",
              line: node.loc?.start?.line,
            });
          }
          break;
        case "Identifier": {
          const parent = parents[parents.length - 1];
          if (
            shouldCountIdentifierUsage(node, parent) &&
            !builtinIdentifiers.has(node.name)
          ) {
            referenced.add(node.name);
          }
          break;
        }
      }
    });

    for (const [name, line] of declared) {
      if (!referenced.has(name) && typeof line === "number") {
        findings.push({
          kind: "warning",
          text: `Identifier "${name}" is declared but never used.`,
          line,
        });
      }
    }

    return findings;
  }

  function analyzeLines(input: string) {
    const lines = normalizeSource(input).split("\n");
    const warnings: LintMessage[] = [];

    lines.forEach((raw, index) => {
      const lineNumber = index + 1;
      if (
        enforceSemicolons &&
        /[a-zA-Z0-9"'`\)\]]\s*$/.test(raw) &&
        !/;(\s*\/\/|$)/.test(raw)
      ) {
        if (
          !/^(if|for|while|switch|function|class|try|catch|else|do|return|import|export|interface|type)\b/.test(
            raw.trim(),
          )
        ) {
          warnings.push({
            kind: "warning",
            text: "Statement may be missing a semicolon.",
            line: lineNumber,
          });
        }
      }
      if (
        raw.includes(";;") &&
        !/for\s*\([^)]*;;[^)]*\)/.test(raw) &&
        !/^\s*;+\s*$/.test(raw)
      ) {
        warnings.push({
          kind: "warning",
          text: "Consecutive semicolons detected; remove redundant ';'.",
          line: lineNumber,
        });
      }
      if (flagConsole && raw.includes("console.") && !raw.includes("TODO")) {
        warnings.push({
          kind: "info",
          text: "Console statement detected - remember to remove debug logs in production.",
          line: lineNumber,
        });
      }
      if (raw.length > maxColumn) {
        warnings.push({
          kind: "warning",
          text: `Line exceeds ${maxColumn} characters.`,
          line: lineNumber,
        });
      }
    });

    return warnings;
  }

  async function lintJavascript(code: string, mode: Language) {
    const normalized = normalizeSource(code);
    let formattedCode = normalized;
    const prettierLanguage =
      mode === "typescript" ? "typescript" : "javascript";
    const canUsePrettier =
      browser &&
      (await ensurePrettierReady()) &&
      hasPrettierConfig(prettierLanguage);
    if (canUsePrettier) {
      try {
        formattedCode = await runPrettier(prettierLanguage, normalized, {
          tabWidth: indentSize,
          printWidth: maxColumn,
          trailingComma: "es5",
          semi: enforceSemicolons,
          singleQuote: false,
          endOfLine: "lf",
        });
      } catch (error) {
        console.warn(
          "Prettier formatting failed, falling back to js-beautify.",
          error,
        );
        formattedCode = jsBeautify.js(normalized, {
          indent_size: indentSize,
          max_preserve_newlines: 2,
          wrap_line_length: maxColumn,
          end_with_newline: true,
        });
      }
    } else {
      try {
        formattedCode = jsBeautify.js(normalized, {
          indent_size: indentSize,
          max_preserve_newlines: 2,
          wrap_line_length: maxColumn,
          end_with_newline: true,
        });
      } catch (err) {
        formattedCode = normalized;
        console.error("Beautify failed, falling back to raw source:", err);
      }
    }
    const warnings = analyzeLines(normalized);
    warnings.push(...inspectJavascript(normalized, mode));
    return { output: formattedCode, warnings };
  }

  function sanitizeJsonInput(value: string) {
    return value
      .replace(/^\s*\/\/.*$/gm, "")
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/,(\s*[}\]])/g, "$1");
  }

  function lintJson(code: string) {
    const normalized = normalizeSource(code);
    const warnings: LintMessage[] = [];
    try {
      if (/\,\s*[}\]]/.test(normalized)) {
        warnings.push({
          kind: "warning",
          text: "Trailing commas detected - JSON standard does not allow them.",
        });
      }
      const sanitized = sanitizeJsonInput(normalized);
      const parsed = JSON.parse(sanitized);
      const formattedJson = jsonBeautify(parsed, null, indentSize);
      return { output: `${formattedJson}\n`, warnings };
    } catch (err) {
      warnings.push({
        kind: "error",
        text: extractErrorMessage(err),
      });
      return { output: normalized, warnings };
    }
  }

  function lintHtml(code: string) {
    const normalized = normalizeSource(code);
    const formattedHtml = jsBeautify.html(normalized, {
      indent_size: indentSize,
      wrap_line_length: maxColumn,
      max_preserve_newlines: 1,
      end_with_newline: true,
    });
    const warnings: LintMessage[] = [];
    if (/<\/?[0-9]/i.test(normalized)) {
      warnings.push({
        kind: "error",
        text: "HTML tags cannot start with numeric characters.",
      });
    }
    if (browser) {
      const parser = new DOMParser();
      const parsed = parser.parseFromString(
        `<wrapper>${normalized}</wrapper>`,
        "text/html",
      );
      const parserError = parsed.querySelector("parsererror");
      if (parserError) {
        warnings.push({
          kind: "error",
          text:
            parserError.textContent?.replace(/\s+/g, " ").trim() ??
            "Invalid HTML structure detected.",
        });
      }
    }
    if (/<img(?![^>]*alt=)/i.test(normalized)) {
      warnings.push({
        kind: "warning",
        text: "Some <img> tags are missing alt attributes.",
      });
    }
    if (/<a(?![^>]*href=)/i.test(normalized)) {
      warnings.push({
        kind: "warning",
        text: "Anchor tags are missing href attributes.",
      });
    }
    if (/<button(?![^>]*type=)/i.test(normalized)) {
      warnings.push({
        kind: "info",
        text: 'Buttons default to type="submit"; set type explicitly for clarity.',
      });
    }
    if (/<div[^>]+on(click|mouseover|change|submit)/i.test(normalized)) {
      warnings.push({
        kind: "info",
        text: "Inline event handlers detected - prefer declarative listeners.",
      });
    }
    return { output: formattedHtml, warnings };
  }

  function lintCss(code: string) {
    const normalized = normalizeSource(code);
    let formattedCss = normalized;
    try {
      formattedCss = jsBeautify.css(normalized, {
        indent_size: indentSize,
        wrap_line_length: maxColumn,
        end_with_newline: true,
      });
    } catch (err) {
      console.error("CSS formatting failed; returning original source.", err);
      formattedCss = normalized;
    }

    const propertiesSeen = new Map<string, number>();
    const warnings: LintMessage[] = [];

    normalized.split("\n").forEach((line, index) => {
      const trimmed = line.trim();
      if (
        !trimmed ||
        trimmed.startsWith("/*") ||
        trimmed.startsWith("@") ||
        trimmed.endsWith("{") ||
        trimmed.endsWith("}")
      ) {
        return;
      }

      if (trimmed.includes(":")) {
        const [rawProperty, ...rest] = trimmed.split(":");
        const property = rawProperty.trim();
        const value = rest.join(":").trim();
        if (!/^[a-z-]+$/i.test(property)) {
          warnings.push({
            kind: "error",
            text: `Declaration "${property}" contains invalid characters.`,
            line: index + 1,
          });
        }
        if (!/;\s*(\/\*.*\*\/)?$/.test(trimmed)) {
          warnings.push({
            kind: "warning",
            text: "CSS declarations should end with a semicolon.",
            line: index + 1,
          });
        }
        if (/,(\s*\/\*.*\*\/)?\s*$/.test(value)) {
          warnings.push({
            kind: "error",
            text: "Dangling comma detected at the end of the declaration.",
            line: index + 1,
          });
        }
      } else if (trimmed.endsWith(";")) {
        const candidate = trimmed.replace(/;.*$/, "").trim();
        const propertyToken = candidate.split(/\s+/)[0] ?? "";
        if (
          propertyToken &&
          (!/^[a-z-]+$/i.test(propertyToken) || propertyToken.endsWith("-"))
        ) {
          warnings.push({
            kind: "error",
            text: `CSS property "${propertyToken}" looks invalid.`,
            line: index + 1,
          });
        }
        warnings.push({
          kind: "error",
          text: "Declaration appears to be missing a colon.",
          line: index + 1,
        });
      } else {
        warnings.push({
          kind: "info",
          text: "Possible malformed CSS declaration.",
          line: index + 1,
        });
      }
    });

    formattedCss.split("\n").forEach((line, index) => {
      const propertyMatch = line.trim().match(/^([a-zA-Z-]+)\s*:/);
      if (propertyMatch) {
        const property = propertyMatch[1];
        if (propertiesSeen.has(property)) {
          warnings.push({
            kind: "info",
            text: `Duplicate property "${property}" detected in the same rule.`,
            line: index + 1,
          });
        }
        propertiesSeen.set(property, index + 1);
      }
      if (line.includes("!important")) {
        warnings.push({
          kind: "info",
          text: "Avoid using !important; prefer more specific selectors.",
          line: index + 1,
        });
      }
    });

    return { output: formattedCss, warnings };
  }

  function lintSql(code: string) {
    const normalized = normalizeSource(code);
    const formattedSql = sqlFormatter(normalized, {
      language: "sql",
      indent: " ".repeat(indentSize),
      uppercase: true,
    });
    const warnings: LintMessage[] = [];
    const invalidIdentifiers = normalized.match(/\b[a-z_]+-[a-z_]+\b/gi);
    if (invalidIdentifiers) {
      warnings.push({
        kind: "error",
        text: `Identifiers cannot contain hyphens: ${invalidIdentifiers.join(", ")}`,
      });
    }
    if (/\bselect\s+\*/i.test(normalized)) {
      warnings.push({
        kind: "warning",
        text: "Avoid SELECT * in production queries; list the needed columns.",
      });
    }
    if (
      /\b(delete|update)\b/i.test(normalized) &&
      !/\bwhere\b/i.test(normalized)
    ) {
      warnings.push({
        kind: "warning",
        text: "UPDATE or DELETE without a WHERE clause can affect every row.",
      });
    } else if (
      !/\bwhere\b/i.test(normalized) &&
      /\bselect\b/i.test(normalized)
    ) {
      warnings.push({
        kind: "info",
        text: "Consider adding a WHERE clause to avoid scanning entire tables.",
      });
    }
    if (!/(limit|top)\b/i.test(normalized) && /\bselect\b/i.test(normalized)) {
      warnings.push({
        kind: "info",
        text: "Add LIMIT/TOP when exploring data to keep queries fast.",
      });
    }
    return { output: formattedSql, warnings };
  }

  async function lint() {
    isLinting = true;
    try {
      let result: { output: string; warnings: LintMessage[] };

      switch (language) {
        case "javascript":
        case "typescript":
          result = await lintJavascript(source, language);
          break;
        case "json":
          result = lintJson(source);
          break;
        case "html":
          result = lintHtml(source);
          break;
        case "css":
          result = lintCss(source);
          break;
        case "sql":
          result = lintSql(source);
          break;
        default:
          result = { output: source, warnings: [] };
      }

      formatted = result.output;
      messages = sortMessages(result.warnings);
      stats = {
        lines: formatted.split("\n").length,
        characters: formatted.length,
      };
    } catch (err) {
      messages = sortMessages([
        {
          kind: "error",
          text: extractErrorMessage(err),
        },
      ]);
      formatted = normalizeSource(source);
      stats = {
        lines: formatted.split("\n").length,
        characters: formatted.length,
      };
    } finally {
      isLinting = false;
    }
  }
  function resetToPreset(next: Language) {
    language = next;
    source = starterSnippets[next];
    void lint();
  }

  onMount(() => {
    void lint();
  });
  $: {
    const payload = {
      language,
      source,
      indentSize,
      enforceSemicolons,
      flagConsole,
      maxColumn,
    };
    clearTimeout(lintHandle);
    lintHandle = setTimeout(() => {
      const unchanged =
        payload.language === language &&
        payload.source === source &&
        payload.indentSize === indentSize &&
        payload.enforceSemicolons === enforceSemicolons &&
        payload.flagConsole === flagConsole &&
        payload.maxColumn === maxColumn;
      if (unchanged) {
        void lint();
      }
    }, 180);
  }

  onDestroy(() => {
    clearTimeout(lintHandle);
  });
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-3">
    <aside class="space-y-6 lg:col-span-1">
      <div
        class="rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <dl class="grid grid-cols-2 gap-4 text-sm">
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          >
            <dt
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Lines
            </dt>
            <dd
              class="mt-1 text-lg font-semibold text-indigo-600 dark:text-indigo-400"
            >
              {stats.lines}
            </dd>
          </div>
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          >
            <dt
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Characters
            </dt>
            <dd
              class="mt-1 text-lg font-semibold text-slate-800 dark:text-white"
            >
              {stats.characters}
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
          Language presets
        </h2>
        <div class="pb-2 grid grid-cols-1 md:grid-cols-2 gap-3">
          {#each languageOptions as option}
            <button
              type="button"
              class={`min-w-[220px] rounded-2xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 md:min-w-0 ${
                option.value === language
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-indigo-400/70"
              }`}
              on:click={() => resetToPreset(option.value)}
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
          Lint settings
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
            <span>Max column</span>
            <input
              class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
              type="number"
              min="60"
              max="200"
              step="10"
              bind:value={maxColumn}
            />
          </label>
        </div>
        <label
          class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <input
            class="size-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400"
            type="checkbox"
            bind:checked={enforceSemicolons}
            disabled={language === "json" ||
              language === "sql" ||
              language === "css" ||
              language === "html"}
          />
          Enforce missing semicolons
        </label>
        <label
          class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <input
            class="size-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400"
            type="checkbox"
            bind:checked={flagConsole}
            disabled={language !== "javascript" && language !== "typescript"}
          />
          Flag console statements
        </label>
        <button
          type="button"
          class="inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
          on:click={() => void lint()}
          disabled={isLinting}
        >
          {isLinting ? "Updating..." : "Update preview"}
        </button>
      </div>
    </aside>

    <div class="lg:col-span-2 grid gap-6 lg:grid-cols-2">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Source
          </h2>
          <button
            type="button"
            class="rounded-full border border-transparent bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
            on:click={() => (source = "")}
          >
            Clear
          </button>
        </div>
        <textarea
          class="mt-4 h-64 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40 sm:h-80"
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
              Linted output
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Copy or download once you are happy with the feedback.
            </p>
          </div>
          <Copy text={formatted} label="Copy output" floating={false} />
        </div>
        <textarea
          class="mt-4 h-64 w-full resize-y rounded-2xl border border-slate-200 bg-slate-900/95 p-4 font-mono text-sm leading-relaxed text-emerald-200 shadow-inner transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-emerald-300 dark:focus:border-emerald-500 dark:focus:ring-emerald-700/40 sm:h-80"
          bind:value={formatted}
          spellcheck="false"
          readonly
        />
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85 lg:col-span-2"
      >
        <div class="flex items-center justify-between gap-4">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Lint results
          </h2>
          <span
            class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"
          >
            {messages.length} issues
          </span>
        </div>
        <div class="mt-4 space-y-3">
          {#if messages.length === 0}
            <p
              class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
            >
              No issues detected â€” your code looks great!
            </p>
          {:else}
            {#each messages as message, index (index)}
              <div
                class={`rounded-2xl border px-4 py-3 text-sm ${
                  message.kind === "error"
                    ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
                    : message.kind === "warning"
                      ? "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-200"
                      : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
                }`}
              >
                <p class="font-semibold">
                  {message.kind === "error"
                    ? "Error"
                    : message.kind === "warning"
                      ? "Warning"
                      : "Info"}
                  {message.line ? ` Â· Line ${message.line}` : ""}
                </p>
                <p class="mt-1 text-sm">{message.text}</p>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
