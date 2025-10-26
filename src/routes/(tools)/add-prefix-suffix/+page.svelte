<script lang="ts">
	type ExportFormat = "txt" | "csv";

	type ToolState = {
		input: string;
		prefix: string;
		suffix: string;
		skipEmpty: boolean;
		trimWhitespace: boolean;
		includeLineNumbers: boolean;
		startNumber: number;
		numberPadding: number;
		numberSeparator: string;
	};

	const SAMPLE_LINES = ["Alpha", "Bravo", "Charlie", "Delta"];

	const defaults: ToolState = {
		input: SAMPLE_LINES.join("\n"),
		prefix: "PRE-",
		suffix: "-POST",
		skipEmpty: true,
		trimWhitespace: true,
		includeLineNumbers: false,
		startNumber: 1,
		numberPadding: 2,
		numberSeparator: ". ",
	};

	const createState = (overrides: Partial<ToolState> = {}): ToolState => ({
		...defaults,
		...overrides,
	});

	let state: ToolState = createState();
	let result = "";
	let processedLineCount = 0;
	let sourceLineCount = state.input.split(/\r?\n/).length;
	let copied = false;
	let downloadStatus: null | "txt" | "csv" = null;
	let exportFormat: ExportFormat = "txt";

	function updateLineCounts(rawLines: string[]) {
		sourceLineCount = rawLines.length;
	}

	function buildResult() {
		const lines = state.input.replace(/\r\n?/g, "\n").split("\n");
		updateLineCounts(lines);

		const startNumber = Number.isFinite(state.startNumber)
			? Math.floor(state.startNumber)
			: defaults.startNumber;
		const padding = Math.max(
			0,
			Math.floor(
				Number.isFinite(state.numberPadding)
					? state.numberPadding
					: defaults.numberPadding,
			),
		);
		let runningIndex = startNumber;

		const transformed = lines
			.map((raw) => {
				let current = state.trimWhitespace ? raw.trim() : raw;

				if (state.skipEmpty && current.length === 0) {
					return null;
				}

				let lineNumber = "";
				if (state.includeLineNumbers) {
					const padded = `${runningIndex}`.padStart(
						padding || 1,
						"0",
					);
					lineNumber = `${padded}${state.numberSeparator}`;
					runningIndex += 1;
				}

				return `${state.prefix}${lineNumber}${current}${state.suffix}`;
			})
			.filter((value): value is string => value !== null);

		processedLineCount = transformed.length;
		result = transformed.join("\n");
	}

	function handleInputChange(event: Event, key: keyof ToolState) {
		const target = event.target as HTMLInputElement | HTMLTextAreaElement;

		if (key === "startNumber" || key === "numberPadding") {
			const numericValue = Number(target.value);
			state = {
				...state,
				[key]: Number.isFinite(numericValue)
					? numericValue
					: defaults[key],
			};
		} else if (
			key === "skipEmpty" ||
			key === "trimWhitespace" ||
			key === "includeLineNumbers"
		) {
			const checkbox = target as HTMLInputElement;
			state = { ...state, [key]: checkbox.checked };
		} else {
			state = { ...state, [key]: target.value };
		}

		buildResult();
	}

	function applySample() {
		state = createState();
		buildResult();
	}

	function clearAll() {
		state = createState({
			input: "",
			prefix: "",
			suffix: "",
		});
		buildResult();
	}

	async function copyToClipboard() {
		if (!result) {
			return;
		}

		try {
			await navigator.clipboard.writeText(result);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (error) {
			console.error("Clipboard copy failed", error);
		}
	}

	function downloadResult(format: ExportFormat) {
		if (!result) {
			return;
		}

		const blob = new Blob([result], {
			type:
				format === "csv"
					? "text/csv;charset=utf-8"
					: "text/plain;charset=utf-8",
		});
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `prefix-suffix-output.${format}`;
		link.click();
		URL.revokeObjectURL(url);
		downloadStatus = format;
		setTimeout(() => {
			downloadStatus = null;
		}, 2000);
	}

	$: buildResult();
</script>

<section class="space-y-6">
	<div class="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
		<div class="space-y-6">
			<article
				class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
			>
				<header
					class="mb-6 flex flex-wrap items-center justify-between gap-3"
				>
					<div>
						<h2
							class="text-lg font-semibold text-slate-900 dark:text-white"
						>
							Configure Text
						</h2>
						<p class="text-xs text-slate-500 dark:text-slate-400">
							Set your prefix, suffix, and source lines. Results
							update instantly.
						</p>
					</div>
					<div class="flex gap-2">
						<button
							type="button"
							class="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
							on:click={applySample}
						>
							Load Example
						</button>
						<button
							type="button"
							class="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-slate-900 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200"
							on:click={clearAll}
						>
							Clear
						</button>
					</div>
				</header>

				<div class="grid gap-4 md:grid-cols-2">
					<label class="space-y-2">
						<span
							class="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-500"
							>Prefix</span
						>
						<input
							type="text"
							class="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
							placeholder="e.g. PRE-"
							bind:value={state.prefix}
							on:input={(event) =>
								handleInputChange(event, "prefix")}
							autocomplete="off"
						/>
					</label>
					<label class="space-y-2">
						<span
							class="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-500"
							>Suffix</span
						>
						<input
							type="text"
							class="block w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
							placeholder="e.g. -POST"
							bind:value={state.suffix}
							on:input={(event) =>
								handleInputChange(event, "suffix")}
							autocomplete="off"
						/>
					</label>
				</div>

				<label class="mt-6 block space-y-2">
					<span
						class="block text-xs font-semibold uppercase tracking-[0.35em] text-slate-500"
						>Source Lines</span
					>
					<textarea
						rows="10"
						class="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm font-mono leading-relaxed text-slate-900 shadow-inner focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
						placeholder="Paste or type one entry per line"
						bind:value={state.input}
						on:input={(event) => handleInputChange(event, "input")}
					/>
				</label>
			</article>

			<article
				class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
			>
				<h2
					class="text-lg font-semibold text-slate-900 dark:text-white"
				>
					Formatting Options
				</h2>
				<p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
					Adjust how lines are cleaned and numbered.
				</p>

				<div
					class="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-900/50"
				>
					<label
						class="flex items-center gap-3 text-slate-700 dark:text-slate-200"
					>
						<input
							type="checkbox"
							class="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-300 dark:border-slate-600 dark:bg-slate-800"
							checked={state.trimWhitespace}
							on:change={(event) =>
								handleInputChange(event, "trimWhitespace")}
						/>
						<span>Trim surrounding whitespace</span>
					</label>

					<label
						class="flex items-center gap-3 text-slate-700 dark:text-slate-200"
					>
						<input
							type="checkbox"
							class="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-300 dark:border-slate-600 dark:bg-slate-800"
							checked={state.skipEmpty}
							on:change={(event) =>
								handleInputChange(event, "skipEmpty")}
						/>
						<span>Skip empty lines</span>
					</label>

					<label
						class="flex items-center gap-3 text-slate-700 dark:text-slate-200"
					>
						<input
							type="checkbox"
							class="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-300 dark:border-slate-600 dark:bg-slate-800"
							checked={state.includeLineNumbers}
							on:change={(event) =>
								handleInputChange(event, "includeLineNumbers")}
						/>
						<span>Include line numbers before each entry</span>
					</label>
				</div>

				{#if state.includeLineNumbers}
					<div class="mt-5 grid gap-4 md:grid-cols-3">
						<label class="space-y-1">
							<span
								class="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
								>Start number</span
							>
							<input
								type="number"
								min="0"
								class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
								bind:value={state.startNumber}
								on:input={(event) =>
									handleInputChange(event, "startNumber")}
							/>
						</label>
						<label class="space-y-1">
							<span
								class="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
								>Padding</span
							>
							<input
								type="number"
								min="0"
								max="6"
								class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
								bind:value={state.numberPadding}
								on:input={(event) =>
									handleInputChange(event, "numberPadding")}
							/>
						</label>
						<label class="space-y-1">
							<span
								class="block text-xs font-semibold uppercase tracking-[0.3em] text-slate-500"
								>Separator</span
							>
							<input
								type="text"
								class="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
								bind:value={state.numberSeparator}
								on:input={(event) =>
									handleInputChange(event, "numberSeparator")}
								placeholder=". "
							/>
						</label>
					</div>
				{/if}
			</article>
		</div>

		<div class="space-y-6">
			<article
				class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
			>
				<header
					class="flex flex-wrap items-center justify-between gap-3"
				>
					<div>
						<h2
							class="text-lg font-semibold text-slate-900 dark:text-white"
						>
							Formatted Output
						</h2>
						<p class="text-xs text-slate-500 dark:text-slate-400">
							{processedLineCount}
							{processedLineCount === 1 ? "line" : "lines"} from {sourceLineCount}
							source {sourceLineCount === 1 ? "line" : "lines"}.
						</p>
					</div>
					<div class="flex flex-wrap items-center gap-2">
						<button
							type="button"
							class="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
							on:click={copyToClipboard}
							disabled={!result}
						>
							{copied ? "Copied!" : "Copy"}
						</button>
						<div
							class="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-300"
						>
							<label class="flex items-center gap-1">
								<input
									type="radio"
									name="export-format"
									value="txt"
									checked={exportFormat === "txt"}
									on:change={() => (exportFormat = "txt")}
								/>
								<span>TXT</span>
							</label>
							<label class="flex items-center gap-1">
								<input
									type="radio"
									name="export-format"
									value="csv"
									checked={exportFormat === "csv"}
									on:change={() => (exportFormat = "csv")}
								/>
								<span>CSV</span>
							</label>
						</div>
						<button
							type="button"
							class="rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-slate-900 transition hover:bg-emerald-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
							on:click={() => downloadResult(exportFormat)}
							disabled={!result}
						>
							{downloadStatus === exportFormat
								? "Saved!"
								: `Download ${exportFormat.toUpperCase()}`}
						</button>
					</div>
				</header>

				<textarea
					readOnly
					rows="16"
					class="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-mono leading-relaxed text-slate-900 shadow-inner focus:outline-none dark:border-slate-600 dark:bg-slate-900/60 dark:text-emerald-100"
					value={result}
				/>
			</article>

			<article
				class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900"
			>
				<h2
					class="text-lg font-semibold text-slate-900 dark:text-white"
				>
					Workflow Notes
				</h2>
				<ul
					class="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300"
				>
					<li>
						<span
							class="font-semibold text-slate-800 dark:text-slate-100"
							>Numbers:</span
						>
						combine with padding to generate IDs like
						<code class="rounded bg-slate-800/10 px-1 py-0.5"
							>TASK-03</code
						>.
					</li>
					<li>
						<span
							class="font-semibold text-slate-800 dark:text-slate-100"
							>Exports:</span
						> choose CSV when pasting into spreadsheets or databases.
					</li>
					<li>
						<span
							class="font-semibold text-slate-800 dark:text-slate-100"
							>Cleaning:</span
						> keeping “Trim whitespace” on avoids double spaces from
						copy/paste.
					</li>
				</ul>
			</article>
		</div>
	</div>
</section>
