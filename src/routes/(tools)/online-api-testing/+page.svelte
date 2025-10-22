<script lang="ts">
	import { browser } from "$app/environment";
	import Copy from "$lib/Copy.svelte";

	type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

	type HeaderRow = {
		id: string;
		key: string;
		value: string;
		enabled: boolean;
	};

	type ResponsePayload = {
		status: number;
		statusText: string;
		ok: boolean;
		duration: number;
		size: number;
		headers: Record<string, string>;
		body: string;
		raw: string;
	};

	const methods: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

	const methodSupportsBody = (method: HttpMethod) => method !== "GET";

	let method: HttpMethod = "GET";
	let endpoint = "https://jsonplaceholder.typicode.com/posts/1";
	let requestBody =
		'{\n  "title": "Craftlab",\n  "body": "Build faster.",\n  "userId": 99\n}';
	let headerRows: HeaderRow[] = [
		createHeaderRow("Content-Type", "application/json"),
		createHeaderRow("Accept", "application/json"),
	];

	let isLoading = false;
	let requestError = "";
	let responsePayload: ResponsePayload | null = null;
	let abortController: AbortController | null = null;

	function createHeaderRow(key = "", value = ""): HeaderRow {
		return {
			id: crypto.randomUUID(),
			key,
			value,
			enabled: Boolean(key),
		};
	}

	function toggleMethod(next: HttpMethod) {
		method = next;
		if (!methodSupportsBody(method)) {
			requestBody = "";
		}
	}

	function activeHeaders() {
		return headerRows.filter((row) => row.enabled && row.key.trim());
	}

	function addHeaderRow() {
		headerRows = [...headerRows, createHeaderRow()];
	}

	function removeHeaderRow(id: string) {
		if (headerRows.length === 1) {
			headerRows = [createHeaderRow()];
			return;
		}
		headerRows = headerRows.filter((row) => row.id !== id);
	}

	function buildCurlSnippet() {
		const parts: string[] = [`curl -X ${method} '${endpoint || ""}'`];
		activeHeaders().forEach((row) => {
			const safeValue = row.value.replace(/'/g, `'\\''`);
			parts.push(`  -H '${row.key.trim()}: ${safeValue}'`);
		});

		if (methodSupportsBody(method) && requestBody.trim()) {
			const safeBody = requestBody.replace(/'/g, `'\\''`);
			parts.push(`  -d '${safeBody}'`);
		}

		return parts.join(" \\\n");
	}

	$: curlSnippet = buildCurlSnippet();

	async function sendRequest() {
		if (!browser) {
			requestError = "Requests can only be sent from the browser.";
			return;
		}

		if (!endpoint.trim()) {
			requestError = "Enter a request URL.";
			return;
		}

		requestError = "";
		responsePayload = null;
		isLoading = true;

		if (abortController) {
			abortController.abort();
		}
		abortController = new AbortController();

		const start = performance.now();

		try {
			const headers = new Headers();
			const headerList = activeHeaders();
			headerList.forEach((row) =>
				headers.append(row.key.trim(), row.value),
			);

			const options: RequestInit = {
				method,
				headers,
				signal: abortController.signal,
			};

			if (methodSupportsBody(method) && requestBody.trim()) {
				const trimmed = requestBody.trim();
				let parsedBody: unknown = trimmed;
				let parsedSuccessfully = false;

				try {
					parsedBody = JSON.parse(trimmed);
					requestBody = JSON.stringify(parsedBody, null, 2);
					parsedSuccessfully = true;
				} catch (error) {
					parsedSuccessfully = false;
				}

				const hasContentType = headerList.some(
					(row) => row.key.trim().toLowerCase() === "content-type",
				);

				if (parsedSuccessfully) {
					options.body = JSON.stringify(parsedBody);
					if (!hasContentType) {
						headers.append("Content-Type", "application/json");
					}
				} else {
					options.body = trimmed;
				}
			}

			const response = await fetch(endpoint, options);
			const duration = performance.now() - start;
			const rawText = await response.text();
			const size = new Blob([rawText]).size;

			let formatted = rawText;
			try {
				formatted = JSON.stringify(JSON.parse(rawText), null, 2);
			} catch (error) {
				// not JSON, keep raw text
			}

			const headerSnapshot: Record<string, string> = {};
			response.headers.forEach((value, key) => {
				headerSnapshot[key] = value;
			});

			responsePayload = {
				status: response.status,
				statusText: response.statusText,
				ok: response.ok,
				duration,
				size,
				headers: headerSnapshot,
				body: formatted,
				raw: rawText,
			};

			if (!response.ok) {
				requestError = "Request completed with a non-success status.";
			}
		} catch (error) {
			if (error instanceof Error && error.name === "AbortError") {
				requestError = "Request aborted.";
			} else {
				requestError =
					error instanceof Error
						? error.message
						: "Unable to complete the request.";
			}
		} finally {
			isLoading = false;
			abortController = null;
		}
	}

	function cancelRequest() {
		if (abortController) {
			abortController.abort();
			abortController = null;
		}
	}
</script>

<section class="px-4 py-10 sm:px-6 lg:px-8">
	<div class="mx-auto grid max-w-6xl items-start gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
		<form
			class="min-w-0 space-y-6 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60"
			on:submit|preventDefault={sendRequest}
		>
			<div class="flex flex-wrap items-center gap-2">
				{#each methods as item}
					<button
						type="button"
						on:click={() => toggleMethod(item)}
						class={`rounded-xl border px-3 py-1.5 text-sm font-semibold transition ${
							method === item
								? "border-indigo-500 bg-indigo-500 text-white"
								: "border-slate-300 bg-white/70 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-500"
						}`}
					>
						{item}
					</button>
				{/each}
			</div>

			<div class="space-y-2">
				<label
					class="text-sm font-semibold text-slate-600 dark:text-slate-200"
					>Request URL</label
				>
				<input
					class="w-full rounded-2xl border border-slate-300 bg-white/90 px-3 py-3 text-sm text-slate-700 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
					type="url"
					placeholder="https://api.example.com/resource"
					bind:value={endpoint}
					required
				/>
			</div>

			<div class="space-y-3">
				<div class="flex items-center justify-between">
					<label
						class="text-sm font-semibold text-slate-600 dark:text-slate-200"
						>Headers</label
					>
					<button
						type="button"
						on:click={addHeaderRow}
						class="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300"
					>
						Add header
					</button>
				</div>

				<div class="space-y-2 text-sm">
					{#each headerRows as row (row.id)}
						<div
							class="grid items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/90 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/60 lg:grid-cols-[auto,1fr,1fr,auto]"
						>
							<label
								class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300"
							>
								<input
									type="checkbox"
									class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
									bind:checked={row.enabled}
								/>
								Enable
							</label>
							<input
								class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-700 focus:border-indigo-400 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
								placeholder="Header name"
								bind:value={row.key}
							/>
							<input
								class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-mono text-slate-700 focus:border-indigo-400 focus:outline-none dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
								placeholder="Header value"
								bind:value={row.value}
							/>
							<button
								type="button"
								class="rounded-lg border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-500 transition hover:border-rose-400 hover:text-rose-600 dark:border-slate-600 dark:text-slate-300"
								on:click={() => removeHeaderRow(row.id)}
							>
								&times;
							</button>
						</div>
					{/each}
				</div>
			</div>

			{#if methodSupportsBody(method)}
				<div class="space-y-2">
					<label
						class="text-sm font-semibold text-slate-600 dark:text-slate-200"
					>
						Request body
						<span class="ml-2 text-xs font-normal text-slate-400"
							>(JSON or raw text)</span
						>
					</label>
					<textarea
						class="h-48 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-3 text-sm font-mono text-slate-700 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
						placeholder={`{ "title": "Example" }`}
						bind:value={requestBody}
					/>
				</div>
			{/if}

			<div class="flex flex-wrap items-center gap-3">
				<button
					type="submit"
					class="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
					disabled={isLoading}
				>
					{#if isLoading}
						<span
							class="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
						></span>
						Sending...
					{:else}
						Send request
					{/if}
				</button>
				<button
					type="button"
					on:click={cancelRequest}
					class="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-rose-400 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:text-slate-300"
					disabled={!isLoading}
				>
					Cancel
				</button>
				<Copy text={curlSnippet} customClass="!static relative top-auto right-auto ml-auto" />
				<span class="text-xs text-slate-400 dark:text-slate-500">cURL preview</span>
			</div>

			{#if requestError && !isLoading}
				<p
					class="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/40 dark:bg-amber-900/30 dark:text-amber-200"
				>
					{requestError}
				</p>
			{/if}
		</form>

		<div
			class="min-w-0 space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60"
		>
			<div class="flex flex-wrap items-center justify-between gap-3">
				<div
					class={`inline-flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm font-semibold ${
						!responsePayload
							? "border border-slate-300 text-slate-500 dark:border-slate-600 dark:text-slate-300"
							: responsePayload.ok
								? "border border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-900/30 dark:text-emerald-200"
								: "border border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-500/40 dark:bg-rose-900/30 dark:text-rose-200"
					}`}
				>
					{#if responsePayload}
						<span>{responsePayload.status}</span>
						<span>{responsePayload.statusText || "No message"}</span
						>
					{:else}
						<span>Awaiting response</span>
					{/if}
				</div>

				{#if responsePayload}
					<div
						class="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400"
					>
						<span
							>Duration: {responsePayload.duration.toFixed(0)} ms</span
						>
						<span>Size: {responsePayload.size} bytes</span>
					</div>
				{/if}
			</div>

			{#if responsePayload}
				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<span
							class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
						>
							Response body
						</span>
						<Copy text={responsePayload.body} customClass="!static relative top-auto right-auto" />
					</div>
					<pre
						class="custom-scrollbar h-72 overflow-auto rounded-2xl bg-slate-900/90 p-4 text-xs text-slate-100 shadow-inner dark:bg-black/60">{responsePayload.body}</pre>
				</div>

				<div class="space-y-2">
					<p
						class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
					>
						Response headers
					</p>
					{#if Object.keys(responsePayload.headers).length}
						<dl
							class="max-h-48 space-y-2 overflow-auto rounded-2xl border border-slate-200/70 bg-white/90 p-3 text-xs dark:border-slate-600 dark:bg-slate-900/50"
						>
							{#each Object.entries(responsePayload.headers) as [key, value]}
								<div class="grid grid-cols-[auto,1fr] gap-2">
									<dt
										class="font-semibold text-slate-600 dark:text-slate-200"
									>
										{key}
									</dt>
									<dd
										class="text-slate-500 dark:text-slate-400"
									>
										{value}
									</dd>
								</div>
							{/each}
						</dl>
					{:else}
						<p
							class="rounded-xl border border-slate-200/70 bg-white/90 px-3 py-2 text-xs text-slate-500 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-400"
						>
							Response did not include headers.
						</p>
					{/if}
				</div>
			{:else}
				<div
					class="rounded-2xl border border-dashed border-slate-300 bg-white/70 px-4 py-6 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400"
				>
					Send a request to inspect the response payload, headers,
					latency, and payload size.
				</div>
			{/if}
		</div>
	</div>
</section>
