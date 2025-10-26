<script lang="ts">
	import Copy from "$lib/Copy.svelte";

	type ThumbnailPreset = {
		key: string;
		label: string;
		dimensions: string;
		filename: string;
	};

	const PRESETS: ThumbnailPreset[] = [
		{
			key: "max",
			label: "Maximum",
			dimensions: "1280 x 720",
			filename: "maxresdefault.jpg",
		},
		{
			key: "sd",
			label: "Standard",
			dimensions: "640 x 480",
			filename: "sddefault.jpg",
		},
		{
			key: "hq",
			label: "High",
			dimensions: "480 x 360",
			filename: "hqdefault.jpg",
		},
		{
			key: "mq",
			label: "Medium",
			dimensions: "320 x 180",
			filename: "mqdefault.jpg",
		},
	];

	const ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

	type PreviewState = "loading" | "ready" | "error";

	let inputValue = "";
	let videoId = "";
	let errorMessage = "";
	let statusMap: Record<string, PreviewState> = {};
	let lastVideoId = "";

	const trimmed = (value: string) => value.trim();

	function parseVideoId(value: string) {
		const candidate = trimmed(value);
		if (!candidate) return "";

		if (ID_PATTERN.test(candidate)) {
			return candidate;
		}

		try {
			const url = new URL(candidate);
			const host = url.hostname.replace(/^www\./, "");

			if (host === "youtube.com" || host === "m.youtube.com") {
				if (url.searchParams.has("v")) {
					return url.searchParams.get("v") ?? "";
				}
				const pathSegments = url.pathname.split("/").filter(Boolean);
				if (
					pathSegments[0] === "embed" ||
					pathSegments[0] === "shorts"
				) {
					return pathSegments[1] ?? "";
				}
			}

			if (host === "youtu.be") {
				return url.pathname.replace("/", "");
			}
		} catch (error) {
			return "";
		}

		return "";
	}

	function buildThumbnailUrl(id: string, preset: ThumbnailPreset) {
		return `https://img.youtube.com/vi/${id}/${preset.filename}`;
	}

	function updateStatusMap(id: string) {
		if (!id) {
			statusMap = {};
			return;
		}

		statusMap = PRESETS.reduce<Record<string, PreviewState>>(
			(accumulator, preset) => {
				accumulator[preset.key] = "loading";
				return accumulator;
			},
			{},
		);
	}

	function handleFetch() {
		const extracted = parseVideoId(inputValue);
		if (!extracted || !ID_PATTERN.test(extracted)) {
			errorMessage =
				"Please provide a full YouTube URL, short link, or the 11-character video ID.";
			videoId = "";
			updateStatusMap("");
			return;
		}

		videoId = extracted;
		errorMessage = "";
		updateStatusMap(videoId);
	}

	function markState(key: string, state: PreviewState) {
		statusMap = { ...statusMap, [key]: state };
	}

	$: if (videoId !== lastVideoId) {
		lastVideoId = videoId;
		updateStatusMap(videoId);
	}

	$: thumbnails = videoId
		? PRESETS.map((preset) => ({
				...preset,
				url: buildThumbnailUrl(videoId, preset),
			}))
		: [];
</script>

<section class="space-y-6">
	<div
		class="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60"
	>
		<div class="space-y-3">
			<label
				class="text-sm font-semibold text-slate-600 dark:text-slate-200"
			>
				YouTube link or video ID
			</label>
			<div class="flex flex-col gap-3 sm:flex-row">
				<input
					class="w-full rounded-2xl border border-slate-300 bg-white/90 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
					placeholder="https://youtu.be/dQw4w9WgXcQ"
					bind:value={inputValue}
					on:keydown={(event) => {
						if (event.key === "Enter") {
							event.preventDefault();
							handleFetch();
						}
					}}
				/>
				<button
					type="button"
					on:click={handleFetch}
					class="inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
				>
					Fetch thumbnails
				</button>
			</div>
			<p class="text-xs text-slate-400 dark:text-slate-500">
				Supports standard watch links, youtu.be short links, embed URLs,
				shorts URLs, or the raw video ID.
			</p>
			{#if errorMessage}
				<p
					class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-900/30 dark:text-rose-200"
				>
					{errorMessage}
				</p>
			{/if}
		</div>
	</div>

	{#if thumbnails.length}
		<div class="grid gap-6 md:grid-cols-2">
			{#each thumbnails as preset}
				<div
					class="space-y-3 rounded-3xl border border-slate-200 bg-white/80 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
				>
					<div class="flex items-center justify-between gap-3">
						<div>
							<p
								class="text-sm font-semibold text-slate-700 dark:text-slate-200"
							>
								{preset.label}
							</p>
							<p
								class="text-xs text-slate-400 dark:text-slate-500"
							>
								{preset.dimensions}
							</p>
						</div>
						<span
							class={`rounded-xl px-3 py-1 text-xs font-semibold ${
								statusMap[preset.key] === "ready"
									? "bg-emerald-200 text-emerald-800"
									: statusMap[preset.key] === "error"
										? "bg-rose-200 text-rose-800"
										: "bg-slate-200 text-slate-700"
							}`}
						>
							{statusMap[preset.key] === "ready"
								? "Available"
								: statusMap[preset.key] === "error"
									? "Unavailable"
									: "Checking"}
						</span>
					</div>

					<div
						class="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
					>
						{#if statusMap[preset.key] === "error"}
							<div
								class="flex h-48 items-center justify-center text-sm text-slate-500 dark:text-slate-400"
							>
								This resolution is not provided for this video.
							</div>
						{:else}
							<img
								src={preset.url}
								alt={`YouTube thumbnail ${preset.label}`}
								class="h-auto max-h-64 w-full object-contain"
								on:load={() => markState(preset.key, "ready")}
								on:error={() => markState(preset.key, "error")}
								loading="lazy"
							/>
						{/if}
					</div>

					<div class="flex flex-wrap items-center gap-2 text-sm">
						<a
							href={preset.url}
							target="_blank"
							rel="noopener noreferrer"
							class="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300"
						>
							Open image
						</a>
						<a
							href={preset.url}
							download={`youtube-${videoId}-${preset.key}.jpg`}
							target="_blank"
							rel="noopener noreferrer"
							class="rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300"
						>
							Download
						</a>
						<Copy text={preset.url} />
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div
			class="rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900/50 dark:text-slate-400"
		>
			Enter a YouTube link to generate download-ready thumbnails in every
			available resolution.
		</div>
	{/if}

	<div
		class="rounded-3xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
	>
		Max resolution thumbnails are only available if the uploader provided a
		high-resolution image. If it fails, try the standard, high, or medium
		variants instead.
	</div>
</section>
