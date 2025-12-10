type LanguageKey = "javascript" | "typescript" | "json" | "html" | "css" | "markdown";

type PrettierConfig = {
  parser: "babel" | "typescript" | "json" | "html" | "css" | "markdown";
  plugins: unknown[];
};

type PrettierFormat = (code: string, options: Record<string, unknown>) => string;

let loadPromise: Promise<void> | null = null;
let formatFn: PrettierFormat | null = null;
let configs: Partial<Record<LanguageKey, PrettierConfig>> = {};

function toPlugin(module: unknown) {
  const candidate = module as { default?: unknown };
  return candidate?.default ?? module;
}

async function loadPrettier() {
  const [
    standalone,
    babelModule,
    estreeModule,
    typescriptModule,
    htmlModule,
    postcssModule,
    markdownModule,
  ] = await Promise.all([
    import("../vendor/prettier/standalone.mjs"),
    import("../vendor/prettier/plugins/babel.mjs"),
    import("../vendor/prettier/plugins/estree.mjs"),
    import("../vendor/prettier/plugins/typescript.mjs"),
    import("../vendor/prettier/plugins/html.mjs"),
    import("../vendor/prettier/plugins/postcss.mjs"),
    import("../vendor/prettier/plugins/markdown.mjs"),
  ]);

  const babelPlugin = toPlugin(babelModule);
  const estreePlugin = toPlugin(estreeModule);
  const typescriptPlugin = toPlugin(typescriptModule);
  const htmlPlugin = toPlugin(htmlModule);
  const postcssPlugin = toPlugin(postcssModule);
  const markdownPlugin = toPlugin(markdownModule);

  formatFn = (standalone as { format: PrettierFormat }).format;
  configs = {
    javascript: { parser: "babel", plugins: [babelPlugin, estreePlugin] },
    typescript: { parser: "typescript", plugins: [typescriptPlugin, estreePlugin] },
    json: { parser: "json", plugins: [babelPlugin, estreePlugin] },
    html: { parser: "html", plugins: [htmlPlugin, postcssPlugin, babelPlugin, estreePlugin] },
    css: { parser: "css", plugins: [postcssPlugin] },
    markdown: { parser: "markdown", plugins: [markdownPlugin] },
  };
}

export async function ensurePrettierReady() {
  if (!loadPromise) {
    loadPromise = loadPrettier().catch((err) => {
      console.warn("Failed to initialize Prettier", err);
      loadPromise = null;
      throw err;
    });
  }
  try {
    await loadPromise;
    return Boolean(formatFn);
  } catch {
    return false;
  }
}

export function hasPrettierConfig(language: LanguageKey) {
  return Boolean(configs[language] && formatFn);
}

export async function runPrettier(
  language: LanguageKey,
  source: string,
  options: Record<string, unknown> = {},
) {
  if (!(await ensurePrettierReady()) || !formatFn) {
    throw new Error("Prettier is not ready");
  }
  const config = configs[language];
  if (!config) {
    throw new Error(`No Prettier parser registered for ${language}`);
  }
  return formatFn(source, {
    parser: config.parser,
    plugins: config.plugins,
    ...options,
  });
}
