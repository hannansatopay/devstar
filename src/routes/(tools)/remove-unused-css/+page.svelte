<script lang="ts">
	import { browser } from "$app/environment";
	import Copy from "$lib/Copy.svelte";

	type StyleSnapshot =
		| {
				type: "style";
				selectors: string[];
				declarations: string;
				original: string;
		  }
		| {
				type: "media";
				condition: string;
				children: StyleSnapshot[];
		  }
		| {
				type: "other";
				original: string;
		  };

	type Stats = {
		totalSelectors: number;
		removedSelectors: number;
		removedRules: number;
		originalBytes: number;
		cleanedBytes: number;
	};

	const SAMPLE_HTML = `<main class="hero">
  <h2 id="title">Craftlab</h2>
  <p class="lead">Ship polished UIs faster</p>
  <button class="btn btn-primary">Get started</button>
</main>
<footer class="footer muted">
  <a class="link" href="/">Documentation</a>
</footer>`;

	const SAMPLE_CSS = `.hero {
  padding: 3rem 2rem;
  background: linear-gradient(135deg,#6366f1,#ec4899);
  color: white;
}

.lead {
  font-size: 1.1rem;
}

.btn {
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
}

.btn-primary {
  background: rgba(255,255,255,0.15);
  border: 1px solid rgba(255,255,255,0.5);
}

.ghost-button {
  border: 2px dashed #94a3b8;
}

@media (min-width: 768px) {
  .hero {
    padding: 5rem 4rem;
  }

  .grid-layout {
    display: grid;
  }
}

.footer {
  padding: 1.5rem;
}

.unused-rule .child {
  opacity: 0.3;
}
`;

	let htmlInput = "";
	let cssInput = "";
	let cleanedCss = "";
	let removedLog: string[] = [];
	let stats: Stats | null = null;
	let errorMessage = "";
	let isProcessing = false;
	$: hasCssSource = cssInput.trim().length > 0;
	$: hasCleanedSource = cleanedCss.trim().length > 0;

	const readableBytes = (bytes: number) => {
		if (bytes === 0) return "0 B";
		const units = ["B", "KB", "MB"];
		const exponent = Math.min(
			Math.floor(Math.log(bytes) / Math.log(1024)),
			units.length - 1,
		);
		const value = bytes / 1024 ** exponent;
		return `${value.toFixed(exponent === 0 ? 0 : 1)} ${units[exponent]}`;
	};

	function handleFileInput(event: Event, target: "html" | "css") {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = String(e.target?.result ?? "");
			if (target === "html") {
				htmlInput = text;
			} else {
				cssInput = text;
			}
			resetResults();
		};
		reader.readAsText(file);
		input.value = "";
	}

	function loadSample() {
		htmlInput = SAMPLE_HTML.trim();
		cssInput = SAMPLE_CSS.trim();
		resetResults();
	}

	function resetResults() {
		cleanedCss = "";
		removedLog = [];
		stats = null;
		errorMessage = "";
	}

	function collectUsed(doc: Document) {
		const tags = new Set<string>();
		const classes = new Set<string>();
		const ids = new Set<string>();

		doc.querySelectorAll("*").forEach((element) => {
			tags.add(element.tagName.toLowerCase());
			element.classList.forEach((cls) =>
				classes.add(`.${cls.toLowerCase()}`),
			);
			if (element.id) {
				ids.add(`#${element.id.toLowerCase()}`);
			}
		});

		return { tags, classes, ids };
	}

	function createSnapshots(css: string): StyleSnapshot[] {
		if (!browser) return [];

		const style = document.createElement("style");
		style.textContent = css;
		document.head.appendChild(style);

		let rules: CSSRuleList | undefined;
		try {
			rules = style.sheet?.cssRules;
		} catch (error) {
			console.error("Unable to read CSS rules", error);
		} finally {
			document.head.removeChild(style);
		}

		return rules ? snapshotRules(rules) : [];
	}

	function snapshotRules(ruleList: CSSRuleList): StyleSnapshot[] {
		return Array.from(ruleList).map((rule) => {
			if (rule.type === CSSRule.STYLE_RULE) {
				const styleRule = rule as CSSStyleRule;
				return {
					type: "style",
					selectors: styleRule.selectorText
						.split(",")
						.map((selector) => selector.trim())
						.filter(Boolean),
					declarations: styleRule.style.cssText,
					original: styleRule.cssText,
				};
			}

			if (rule.type === CSSRule.MEDIA_RULE) {
				const mediaRule = rule as CSSMediaRule;
				return {
					type: "media",
					condition: mediaRule.conditionText,
					children: snapshotRules(mediaRule.cssRules),
				};
			}

			return {
				type: "other",
				original: rule.cssText,
			};
		});
	}

	function sanitizeToken(token: string) {
		return token
			.replace(/\[[^\]]+]/g, "")
			.replace(/::?[a-zA-Z-]+(\([^()]*\))?/g, "")
			.trim();
	}

	function selectorMatchesSets(
		selector: string,
		sets: ReturnType<typeof collectUsed>,
	) {
		const tokens = selector.split(/[\s>+~]+/).filter(Boolean);
		return tokens.some((token) => {
			const clean = sanitizeToken(token);
			if (!clean) return false;

			if (clean.startsWith(".")) {
				return sets.classes.has(clean.toLowerCase());
			}

			if (clean.startsWith("#")) {
				return sets.ids.has(clean.toLowerCase());
			}

			return sets.tags.has(clean.toLowerCase());
		});
	}

	function selectorIsUsed(
		selector: string,
		doc: Document,
		sets: ReturnType<typeof collectUsed>,
	) {
		const trimmed = selector.trim();
		if (!trimmed) return false;

		if (!browser) return true;

		try {
			const testSelector = trimmed.replace(/::(before|after)/gi, "");
			if (doc.querySelector(testSelector)) return true;
		} catch (error) {
			// Fallback to manual checks
		}

		return selectorMatchesSets(trimmed, sets);
	}

	function indentBlock(block: string, depth = 1) {
		const padding = "  ".repeat(depth);
		return block
			.split("\n")
			.map((line) => (line.trim() ? `${padding}${line}` : line))
			.join("\n");
	}

	function filterSnapshots(
		nodes: StyleSnapshot[],
		doc: Document,
		sets: ReturnType<typeof collectUsed>,
		counter: {
			totalSelectors: number;
			removedSelectors: number;
			removedRules: number;
		},
		log: string[],
		depth = 0,
	): string[] {
		const kept: string[] = [];

		for (const node of nodes) {
			if (node.type === "style") {
				const usedSelectors: string[] = [];
				const unusedSelectors: string[] = [];

				node.selectors.forEach((selector) => {
					counter.totalSelectors += 1;
					if (selectorIsUsed(selector, doc, sets)) {
						usedSelectors.push(selector);
					} else {
						unusedSelectors.push(selector);
					}
				});

				if (unusedSelectors.length === node.selectors.length) {
					counter.removedSelectors += unusedSelectors.length;
					counter.removedRules += 1;
					log.push(`Removed rule: ${unusedSelectors.join(", ")}`);
					continue;
				}

				if (unusedSelectors.length) {
					counter.removedSelectors += unusedSelectors.length;
					log.push(
						`Removed selectors inside rule: ${unusedSelectors.join(", ")}`,
					);
				}

				const selectorList = usedSelectors.join(", ");
				const declaration = node.declarations.trim();
				const block = declaration
					? `${selectorList} { ${declaration} }`
					: `${selectorList} {}`;
				kept.push(block);
				continue;
			}

			if (node.type === "media") {
				const inner = filterSnapshots(
					node.children,
					doc,
					sets,
					counter,
					log,
					depth + 1,
				);
				if (inner.length) {
					const mediaBlock = `@media ${node.condition} {\n${indentBlock(inner.join("\n"), 1)}\n}`;
					kept.push(mediaBlock);
				} else {
					counter.removedRules += 1;
					log.push(
						`Removed empty media query: @media ${node.condition}`,
					);
				}
				continue;
			}

			kept.push(node.original);
		}

		return kept;
	}

	function downloadCleanedCss() {
		if (!browser || !cleanedCss) return;

		const blob = new Blob([cleanedCss], { type: "text/css" });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = "cleaned-styles.css";
		anchor.click();
		URL.revokeObjectURL(url);
	}

	function removeUnusedCss() {
		if (!browser) {
			errorMessage = "This tool needs a browser environment.";
			return;
		}

		if (!htmlInput.trim() || !cssInput.trim()) {
			errorMessage = "Provide both HTML and CSS content to analyse.";
			return;
		}

		isProcessing = true;
		errorMessage = "";
		cleanedCss = "";
		removedLog = [];
		stats = null;

		setTimeout(() => {
			try {
				const parser = new DOMParser();
				const parsed = parser.parseFromString(htmlInput, "text/html");
				const used = collectUsed(parsed);
				const snapshots = createSnapshots(cssInput);

				const counter = {
					totalSelectors: 0,
					removedSelectors: 0,
					removedRules: 0,
				};
				const log: string[] = [];
				const keptBlocks = filterSnapshots(
					snapshots,
					parsed,
					used,
					counter,
					log,
				);
				const result = keptBlocks.join("\n\n").trim();

				cleanedCss = result;
				removedLog = log;
				stats = {
					totalSelectors: counter.totalSelectors,
					removedSelectors: counter.removedSelectors,
					removedRules: counter.removedRules,
					originalBytes: cssInput.length,
					cleanedBytes: result.length,
				};
			} catch (error) {
				console.error(error);
				errorMessage =
					error instanceof Error
						? error.message
						: "Unable to process CSS.";
			} finally {
				isProcessing = false;
			}
		}, 16);
	}
</script>

<section class="space-y-6">
	<div class="grid gap-6 lg:grid-cols-2">
		<div
			class="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900"
		>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<span
					class="text-sm font-semibold text-slate-700 dark:text-slate-100"
					>HTML source</span
				>
				<div class="flex flex-wrap items-center gap-2">
					<label
						class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
					>
						<input
							type="file"
							accept=".html,.htm,.txt"
							class="hidden"
							on:change={(event) =>
								handleFileInput(event, "html")}
						/>
						Upload
					</label>
					<button
						type="button"
						on:click={() => {
							htmlInput = "";
							resetResults();
						}}
						class="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-rose-400 hover:text-rose-600 dark:border-slate-600 dark:text-slate-300"
					>
						Clear
					</button>
				</div>
			</div>
			<textarea
				class="mt-4 h-56 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-mono text-slate-700 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:h-72 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
				placeholder="Paste HTML markup or upload a file"
				bind:value={htmlInput}
			/>
		</div>

		<div
			class="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900"
		>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<span
					class="text-sm font-semibold text-slate-700 dark:text-slate-100"
					>CSS source</span
				>
				<div class="flex flex-wrap items-center gap-2">
					<label
						class="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200 dark:hover:border-indigo-500 dark:hover:text-indigo-300"
					>
						<input
							type="file"
							accept=".css,.txt"
							class="hidden"
							on:change={(event) => handleFileInput(event, "css")}
						/>
						Upload
					</label>
					<button
						type="button"
						on:click={() => {
							cssInput = "";
							resetResults();
						}}
						class="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-rose-400 hover:text-rose-600 dark:border-slate-600 dark:text-slate-300"
					>
						Clear
					</button>
				</div>
			</div>
			<textarea
				class="mt-4 h-56 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-mono text-slate-700 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 sm:h-72 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-100"
				placeholder="Paste CSS styles or upload a file"
				bind:value={cssInput}
			/>
		</div>
	</div>

	<div class="flex flex-wrap items-center gap-3">
		<button
			type="button"
			on:click={loadSample}
			class="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200"
		>
			Load sample
		</button>
		<button
			type="button"
			on:click={removeUnusedCss}
			class="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
			disabled={isProcessing}
		>
			{#if isProcessing}
				<span
					class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
				></span>
				Processing...
			{:else}
				Clean CSS
			{/if}
		</button>
		{#if cleanedCss}
			<button
				type="button"
				on:click={downloadCleanedCss}
				class="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-200"
			>
				Download cleaned CSS
			</button>
		{/if}
	</div>

	{#if errorMessage}
		<p
			class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/40 dark:bg-rose-900/30 dark:text-rose-200"
		>
			{errorMessage}
		</p>
	{/if}

	{#if stats}
		<div
			class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
		>
			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				<div
					class="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-800/40"
				>
					<p
						class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
					>
						Total selectors
					</p>
					<p
						class="mt-1 text-2xl font-semibold text-slate-800 dark:text-white"
					>
						{stats.totalSelectors}
					</p>
				</div>
				<div
					class="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-4 dark:border-emerald-500/40 dark:bg-emerald-900/20"
				>
					<p
						class="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200"
					>
						Removed selectors
					</p>
					<p
						class="mt-1 text-2xl font-semibold text-emerald-700 dark:text-emerald-200"
					>
						{stats.removedSelectors}
					</p>
				</div>
				<div
					class="rounded-2xl border border-indigo-200/60 bg-indigo-50/70 p-4 dark:border-indigo-500/40 dark:bg-indigo-900/20"
				>
					<p
						class="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-200"
					>
						Rules removed
					</p>
					<p
						class="mt-1 text-2xl font-semibold text-indigo-700 dark:text-indigo-200"
					>
						{stats.removedRules}
					</p>
				</div>
				<div
					class="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 dark:border-slate-600 dark:bg-slate-800/40"
				>
					<p
						class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
					>
						Size saved
					</p>
					<p
						class="mt-1 text-2xl font-semibold text-slate-800 dark:text-white"
					>
						{readableBytes(
							stats.originalBytes - stats.cleanedBytes,
						)}
					</p>
				</div>
			</div>

			{#if removedLog.length}
				<div class="mt-6 space-y-2">
					<p
						class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
					>
						Removed selectors
					</p>
					<ul
						class="space-y-1 text-sm text-slate-600 dark:text-slate-300"
					>
						{#each removedLog as entry}
							<li
								class="rounded-xl border border-slate-200/70 bg-slate-50/80 px-3 py-2 dark:border-slate-600 dark:bg-slate-800/40"
							>
								{entry}
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</div>
	{/if}

	{#if hasCssSource || hasCleanedSource}
		<div class="grid gap-6 lg:grid-cols-2">
			<div
				class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
			>
				<div class="mb-3 flex items-center justify-between">
					<span
						class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
						>Original CSS</span
					>
					<span class="text-xs text-slate-400 dark:text-slate-500"
						>{hasCssSource
							? readableBytes(cssInput.length)
							: "0 B"}</span
					>
				</div>
				{#if hasCssSource}
					<pre
						class="custom-scrollbar h-56 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100 shadow-inner sm:h-72 dark:bg-black/80">{cssInput}</pre>
				{:else}
					<div
						class="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 text-sm text-slate-500 sm:h-72 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400"
					>
						Paste CSS on the left to preview the original source.
					</div>
				{/if}
			</div>
			<div
				class="min-w-0 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
			>
				<div class="mb-3 flex items-center justify-between">
					<span
						class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
						>Cleaned CSS</span
					>
					<div
						class="flex flex-wrap min-w-[100px] items-center gap-2 relative"
					>
						<span class="text-xs text-slate-400 dark:text-slate-500"
							>{hasCleanedSource
								? readableBytes(cleanedCss.length)
								: "0 B"}</span
						>
						{#if hasCleanedSource}
							<Copy
								text={cleanedCss}
								customClass="!static relative top-auto right-auto ml-auto"
							/>
						{/if}
					</div>
				</div>
				{#if hasCleanedSource}
					<pre
						class="custom-scrollbar h-56 overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-100 shadow-inner sm:h-72 dark:bg-black/80">{cleanedCss}</pre>
				{:else}
					<div
						class="flex h-56 items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 text-sm text-slate-500 sm:h-72 dark:border-slate-600 dark:bg-slate-900/40 dark:text-slate-400"
					>
						Run the cleaner to generate optimised CSS here.
					</div>
				{/if}
			</div>
		</div>
	{/if}
</section>
