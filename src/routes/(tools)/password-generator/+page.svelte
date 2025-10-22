<script lang="ts">
	import Copy from "$lib/Copy.svelte";
	import { browser } from "$app/environment";

	type CharacterSetKey = "uppercase" | "lowercase" | "numbers" | "symbols";

	const CHARACTER_SETS: Record<CharacterSetKey, string> = {
		uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		lowercase: "abcdefghijklmnopqrstuvwxyz",
		numbers: "0123456789",
		symbols: "!@#$%^&*()-_=+[]{};:,.<>/?",
	};

	const CHARACTER_SET_KEYS = Object.keys(CHARACTER_SETS) as CharacterSetKey[];
	const MIN_LENGTH = 6;
	const MAX_LENGTH = 64;
	const QUICK_LENGTHS = [12, 16, 20, 24];
	const CHARACTER_SET_LABELS: Record<CharacterSetKey, string> = {
		uppercase: "Uppercase (A-Z)",
		lowercase: "Lowercase (a-z)",
		numbers: "Numbers (0-9)",
		symbols: "Symbols (!@#...)",
	};

	const SIMILAR_PATTERN = /[O0I1l|]/g;

	const STRENGTH_SCALE = [
		{ threshold: 0, label: "Very weak", tone: "bg-rose-200 text-rose-800" },
		{ threshold: 28, label: "Weak", tone: "bg-amber-200 text-amber-800" },
		{
			threshold: 36,
			label: "Good",
			tone: "bg-emerald-200 text-emerald-800",
		},
		{
			threshold: 60,
			label: "Strong",
			tone: "bg-indigo-200 text-indigo-800",
		},
		{
			threshold: 128,
			label: "Excellent",
			tone: "bg-purple-200 text-purple-800",
		},
	];

	let length = 16;
	let includeSets: Record<CharacterSetKey, boolean> = {
		uppercase: true,
		lowercase: true,
		numbers: true,
		symbols: false,
	};
	let excludeSimilar = false;
	let extraCharacters = "";

	let password = "";
	let entropyBits = 0;
	let poolSize = 0;
	let strengthLabel = "";
	let strengthTone = "";
	let configError = "";
	let history: string[] = [];
	let activeSetCount = 0;

	$: {
		if (!Number.isFinite(length) || Number.isNaN(length)) {
			length = MIN_LENGTH;
		} else if (length < MIN_LENGTH) {
			length = MIN_LENGTH;
		} else if (length > MAX_LENGTH) {
			length = MAX_LENGTH;
		}
	}

	$: activeSetCount = Object.values(includeSets).filter(Boolean).length;

	function filteredSet(chars: string) {
		const unique = Array.from(new Set(chars.split("")));
		const clean = excludeSimilar
			? unique.filter((char) => !SIMILAR_PATTERN.test(char))
			: unique;
		SIMILAR_PATTERN.lastIndex = 0;
		return clean.join("");
	}

	function buildPool() {
		const activeSets = Object.entries(includeSets)
			.filter(([, enabled]) => enabled)
			.map(([key]) => key as CharacterSetKey);

		const pools = activeSets.map((key) => filteredSet(CHARACTER_SETS[key]));

		if (extraCharacters.trim()) {
			pools.push(filteredSet(extraCharacters));
		}

		const combined = pools.join("");
		return { pools, combined, activeSets };
	}

	function randomIndex(max: number) {
		if (
			!browser ||
			typeof crypto === "undefined" ||
			!crypto.getRandomValues
		) {
			return Math.floor(Math.random() * max);
		}

		const buffer = new Uint32Array(1);
		crypto.getRandomValues(buffer);
		return buffer[0] % max;
	}

	function shuffle<T>(array: T[]) {
		for (let i = array.length - 1; i > 0; i -= 1) {
			const j = randomIndex(i + 1);
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	function classifyStrength(entropy: number) {
		let match = STRENGTH_SCALE[0];
		for (const step of STRENGTH_SCALE) {
			if (entropy >= step.threshold) {
				match = step;
			}
		}
		strengthLabel = match.label;
		strengthTone = match.tone;
	}

	function generatePassword(updateHistory = false) {
		const { pools, combined, activeSets } = buildPool();

		if (!combined.length) {
			configError =
				"Enable at least one character set or add custom characters.";
			password = "";
			entropyBits = 0;
			poolSize = 0;
			return;
		}

		configError = "";
		poolSize = combined.length;
		entropyBits = length * Math.log2(poolSize);
		classifyStrength(entropyBits);

		const characters: string[] = [];

		activeSets.forEach((key, index) => {
			const set = pools[index];
			if (!set.length) return;
			characters.push(set[randomIndex(set.length)]);
		});

		const customSet = pools[pools.length - 1];
		const setOffset =
			activeSets.length === pools.length
				? pools.length - 1
				: pools.length;

		while (characters.length < length) {
			const pool =
				pools[randomIndex(pools.length)] || customSet || combined;
			if (!pool.length) break;
			characters.push(pool[randomIndex(pool.length)]);
		}

		const generated = shuffle(characters).slice(0, length).join("");
		password = generated;

		if (updateHistory && generated) {
			history = [
				generated,
				...history.filter((entry) => entry !== generated),
			].slice(0, 5);
		}
	}

	function handleGenerate() {
		generatePassword(true);
	}

	function toggleSet(key: CharacterSetKey) {
		const enabledCount = Object.values(includeSets).filter(Boolean).length;
		includeSets = {
			...includeSets,
			[key]: includeSets[key] ? enabledCount > 1 : true,
		};
	}

	const SETTINGS_SIGNATURE = () => ({
		length,
		uppercase: includeSets.uppercase,
		lowercase: includeSets.lowercase,
		numbers: includeSets.numbers,
		symbols: includeSets.symbols,
		excludeSimilar,
		extras: extraCharacters,
	});

	$: signature = JSON.stringify(SETTINGS_SIGNATURE());
	$: if (signature) {
		generatePassword(false);
	}
</script>

<section class="mx-auto space-y-6 px-4 py-6">
	<div class="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
		<div class="space-y-6">
			<div
				class="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
			>
				<div class="flex flex-wrap items-center justify-between gap-4">
					<div>
						<p
							class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
						>
							Password length
						</p>
						<p
							class="mt-2 text-3xl font-semibold text-slate-900 dark:text-white"
						>
							{length} characters
						</p>
						<p class="text-xs text-slate-400 dark:text-slate-500">
							Longer passwords create exponentially more
							combinations.
						</p>
					</div>
					<input
						type="number"
						min={MIN_LENGTH}
						max={MAX_LENGTH}
						step="1"
						bind:value={length}
						class="h-12 w-24 rounded-2xl border border-slate-200 bg-white/90 px-3 text-center text-lg font-semibold text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400"
					/>
				</div>
				<input
					type="range"
					min={MIN_LENGTH}
					max={MAX_LENGTH}
					bind:value={length}
					class="mt-6 w-full accent-indigo-600"
				/>
				<div
					class="mt-2 flex items-center justify-between text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500"
				>
					<span>{MIN_LENGTH}</span>
					<span>32</span>
					<span>{MAX_LENGTH}</span>
				</div>
				<div class="mt-4 flex flex-wrap gap-2">
					{#each QUICK_LENGTHS as quickLength}
						<button
							type="button"
							on:click={() => (length = quickLength)}
							class={`rounded-full border px-4 py-1.5 text-xs font-semibold transition ${
								length === quickLength
									? "border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-500/20 dark:text-indigo-200"
									: "border-slate-300 bg-white/90 text-slate-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
							}`}
						>
							{quickLength} chars
						</button>
					{/each}
				</div>
			</div>

			<div
				class="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
			>
				<div class="flex items-start justify-between gap-4">
					<div>
						<p
							class="text-sm font-semibold text-slate-700 dark:text-slate-200"
						>
							Character sets
						</p>
						<p
							class="mt-1 text-xs text-slate-500 dark:text-slate-400"
						>
							Select at least one set to build the pool.
						</p>
					</div>
					<span
						class="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500"
						>{activeSetCount} active</span
					>
				</div>
				<div class="mt-4 grid gap-3 sm:grid-cols-2">
					{#each CHARACTER_SET_KEYS as key}
						<button
							type="button"
							on:click={() => toggleSet(key)}
							aria-pressed={includeSets[key]}
							class={`flex w-full items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition ${
								includeSets[key]
									? "border-indigo-500 bg-indigo-500/90 text-white shadow-sm"
									: "border-slate-300 bg-white/90 text-slate-600 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
							}`}
						>
							<div class="space-y-1">
								<p class="text-sm font-semibold leading-tight">
									{CHARACTER_SET_LABELS[key]}
								</p>
								<p class="text-xs font-medium opacity-80">
									{filteredSet(CHARACTER_SETS[key]).length} characters
								</p>
							</div>
							<div
								class={`mt-1 h-2 w-2 shrink-0 rounded-full ${
									includeSets[key]
										? "bg-white"
										: "bg-slate-300 dark:bg-slate-600"
								}`}
							/>
						</button>
					{/each}
				</div>
			</div>

			<div
				class="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
			>
				<p
					class="text-sm font-semibold text-slate-700 dark:text-slate-200"
				>
					Advanced options
				</p>
				<div class="mt-4 space-y-4">
					<label
						class="flex items-start gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-inner dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
					>
						<input
							type="checkbox"
							class="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-800"
							bind:checked={excludeSimilar}
						/>
						<span>
							<span class="font-semibold"
								>Exclude similar characters</span
							>
							<span
								class="mt-1 block text-xs text-slate-400 dark:text-slate-500"
								>Removes O, 0, I, l, 1 and | for easier reading.</span
							>
						</span>
					</label>

					<div>
						<label
							class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
						>
							Custom characters
						</label>
						<input
							type="text"
							placeholder="Add symbols that must appear (e.g. ~`|)"
							class="mt-2 w-full rounded-2xl border border-slate-200 bg-white/90 px-3 py-2 text-sm font-mono text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
							bind:value={extraCharacters}
						/>
						<p
							class="mt-1 text-xs text-slate-400 dark:text-slate-500"
						>
							These characters join the pool and can appear
							multiple times.
						</p>
					</div>
				</div>

				<button
					type="button"
					on:click={handleGenerate}
					class="mt-6 w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
					disabled={Boolean(configError)}
				>
					Generate password
				</button>

				{#if configError}
					<p
						class="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-900/30 dark:text-rose-200"
					>
						{configError}
					</p>
				{/if}
			</div>
		</div>

		<div class="space-y-6">
			<div
				class="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
			>
				<div class="flex items-center justify-between gap-3">
					<div
						class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
					>
						Generated password
					</div>
					{#if strengthLabel}
						<span
							class={`rounded-xl px-3 py-1 text-xs font-semibold ${strengthTone}`}
						>
							{strengthLabel}
						</span>
					{/if}
				</div>

				<div
					class="relative mt-5 rounded-2xl border border-slate-200 bg-slate-900/90 p-5 text-slate-100 shadow-inner dark:border-slate-600 dark:bg-black/60"
				>
					<pre
						class="max-h-32 overflow-auto break-all pr-10 font-mono text-lg leading-tight">{password}</pre>
					<Copy text={password} />
				</div>

				<div class="mt-4 grid gap-3 sm:grid-cols-3">
					<div
						class="rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-300"
					>
						<p
							class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500"
						>
							Character pool
						</p>
						<p
							class="mt-1 font-semibold text-slate-700 dark:text-slate-100"
						>
							{poolSize}
						</p>
					</div>
					<div
						class="rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-300"
					>
						<p
							class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500"
						>
							Entropy
						</p>
						<p
							class="mt-1 font-semibold text-slate-700 dark:text-slate-100"
						>
							{entropyBits ? entropyBits.toFixed(1) : "0"} bits
						</p>
					</div>
					<div
						class="rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-300"
					>
						<p
							class="text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500"
						>
							Active sets
						</p>
						<p
							class="mt-1 font-semibold text-slate-700 dark:text-slate-100"
						>
							{activeSetCount}
						</p>
					</div>
				</div>
			</div>

			{#if history.length}
				<div
					class="rounded-3xl border border-slate-200/80 bg-white/80 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
				>
					<p
						class="text-sm font-semibold text-slate-700 dark:text-slate-200"
					>
						Recent passwords
					</p>
					<ul
						class="mt-4 space-y-2 text-xs text-slate-500 dark:text-slate-300"
					>
						{#each history as entry}
							<li
								class="relative flex items-center justify-between gap-2 rounded-2xl border border-slate-200/70 bg-white/90 px-3 py-3 pr-14 dark:border-slate-600 dark:bg-slate-900/60"
							>
								<span
									class="truncate font-mono text-sm text-slate-700 dark:text-slate-200"
									>{entry}</span
								>
								<Copy
									text={entry}
									customClass="!top-1/2 -translate-y-1/2"
								/>
							</li>
						{/each}
					</ul>
				</div>
			{/if}

			<div
				class="rounded-3xl border border-slate-200/80 bg-white/80 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
			>
				<p class="font-semibold text-slate-700 dark:text-slate-200">
					Why entropy matters
				</p>
				<p class="mt-2 leading-relaxed">
					Entropy estimates how unpredictable your password is. Each
					extra bit doubles the number of combinations an attacker
					must try. Aim for 60+ bits for everyday accounts and go even
					higher for master passwords or password managers.
				</p>
			</div>
		</div>
	</div>
</section>
