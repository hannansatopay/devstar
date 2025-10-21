<script lang="ts">
	import { onDestroy } from "svelte";

	type Mode = "focus" | "short" | "long";

	const defaultSettings = {
		focus: 25,
		short: 5,
		long: 15,
		cycles: 4,
	};

	const modes: Array<{ id: Mode; label: string; hint: string }> = [
		{ id: "focus", label: "Focus", hint: "Deep work sprint" },
		{ id: "short", label: "Short Break", hint: "Quick recharge" },
		{ id: "long", label: "Long Break", hint: "Reset after cycles" },
	];

	let settings = { ...defaultSettings };
	let activeMode: Mode = "focus";
	let secondsRemaining = settings.focus * 60;
	let isRunning = false;
	let completedFocusSessions = 0;
	let timer: ReturnType<typeof setInterval> | null = null;

	const clamp = (value: number, min: number, max: number) =>
		Math.min(Math.max(value, min), max);

	const formatTime = (seconds: number) => {
		const mins = Math.floor(seconds / 60);
		const secs = seconds % 60;
		return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
	};

	const durationFor = (mode: Mode) => {
		if (mode === "focus") return settings.focus * 60;
		if (mode === "short") return settings.short * 60;
		return settings.long * 60;
	};

	const clearTimer = () => {
		if (timer) {
			clearInterval(timer);
			timer = null;
		}
	};

	const pauseTimer = () => {
		clearTimer();
		isRunning = false;
	};

	const startTimer = () => {
		if (isRunning) return;
		clearTimer();
		isRunning = true;
		timer = setInterval(() => {
			if (secondsRemaining <= 1) {
				transitionSession(true);
			} else {
				secondsRemaining -= 1;
			}
		}, 1000);
	};

	const resetTimer = () => {
		pauseTimer();
		secondsRemaining = durationFor(activeMode);
	};

	const transitionSession = (autoStartNext = false) => {
		pauseTimer();

		if (activeMode === "focus") {
			completedFocusSessions += 1;
			if (completedFocusSessions % settings.cycles === 0) {
				activeMode = "long";
			} else {
				activeMode = "short";
			}
		} else {
			if (activeMode === "long") {
				completedFocusSessions = 0;
			}
			activeMode = "focus";
		}

		secondsRemaining = durationFor(activeMode);

		if (autoStartNext) {
			startTimer();
		}
	};

	const setMode = (mode: Mode) => {
		if (activeMode === mode) return;
		activeMode = mode;
		resetTimer();
	};

	const skipSession = () => {
		transitionSession(false);
	};

	const limits: Record<keyof typeof settings, { min: number; max: number }> =
		{
			focus: { min: 5, max: 120 },
			short: { min: 1, max: 30 },
			long: { min: 10, max: 60 },
			cycles: { min: 1, max: 12 },
		};

	const updateSetting = (key: keyof typeof settings, value: number) => {
		const { min, max } = limits[key];
		const sanitized = clamp(Math.round(value || 0), min, max);
		settings = { ...settings, [key]: sanitized };

		if (key === "cycles" && completedFocusSessions >= sanitized) {
			completedFocusSessions = completedFocusSessions % sanitized;
		}

		if (!isRunning) {
			secondsRemaining = durationFor(activeMode);
		} else if (key === "focus" && activeMode === "focus") {
			secondsRemaining = Math.min(secondsRemaining, durationFor("focus"));
		} else if (key === "short" && activeMode === "short") {
			secondsRemaining = Math.min(secondsRemaining, durationFor("short"));
		} else if (key === "long" && activeMode === "long") {
			secondsRemaining = Math.min(secondsRemaining, durationFor("long"));
		}
	};

	const currentCycleIndex = () => {
		const mod = completedFocusSessions % settings.cycles;
		if (activeMode === "focus") {
			return mod + 1;
		}
		return mod === 0 ? settings.cycles : mod;
	};

	const progress = () => {
		const total = durationFor(activeMode);
		return total === 0 ? 0 : 1 - secondsRemaining / total;
	};

	const handleSettingChange =
		(key: keyof typeof settings) => (event: Event) => {
			const target = event.target as HTMLInputElement;
			updateSetting(key, Number(target.value));
		};

	onDestroy(() => {
		clearTimer();
	});
</script>

<section class="mx-auto space-y-6 px-4 py-6">
	<div class="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
		<div
			class="flex flex-col gap-6 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-slate-800/40 dark:bg-slate-900/70"
		>
			<div
				class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
			>
				<div class="space-y-1">
					<p
						class="text-sm font-medium uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400"
					>
						Session
					</p>
					<p
						class="text-2xl font-semibold text-slate-900 dark:text-slate-50"
					>
						{#if activeMode === "focus"}
							Focus sprint
						{:else if activeMode === "short"}
							Short reset
						{:else}
							Long reset
						{/if}
					</p>
					<p class="text-sm text-slate-500 dark:text-slate-400">
						Cycle {currentCycleIndex()} of {settings.cycles}
					</p>
				</div>
				<div class="flex flex-wrap gap-2">
					{#each modes as mode}
						<button
							class={`min-w-[7rem] rounded-full border px-4 py-2 text-left text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:focus-visible:ring-sky-500 dark:focus-visible:ring-offset-slate-900 ${
								activeMode === mode.id
									? "border-sky-400 bg-sky-100 text-sky-700 dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-100"
									: "border-slate-200 text-slate-500 hover:border-sky-200 hover:text-sky-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-sky-500/40 dark:hover:text-sky-200"
							}`}
							on:click={() => setMode(mode.id)}
							type="button"
						>
							<span class="block font-semibold">{mode.label}</span
							>
							<span
								class="block text-xs font-normal text-slate-400 dark:text-slate-500"
								>{mode.hint}</span
							>
						</button>
					{/each}
				</div>
			</div>

			<div
				class="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center"
			>
				<div class="flex w-full flex-col items-center gap-6">
					<div
						class="relative aspect-square w-full max-w-[280px] sm:max-w-[320px] md:max-w-[360px]"
					>
						<div
							class="absolute inset-0 rounded-full border border-slate-200/60 bg-white/80 shadow-inner dark:border-slate-800/50 dark:bg-slate-900/60"
							style={`background: conic-gradient(#38bdf8 ${progress() * 360}deg, rgba(148, 163, 184, 0.15) 0deg);`}
						/>
						<div
							class="absolute inset-[14px] grid place-items-center rounded-full bg-white/95 shadow-sm dark:bg-slate-950/80 sm:inset-[18px] md:inset-[20px]"
						>
							<p
								class="text-6xl font-semibold tabular-nums text-slate-900 dark:text-slate-50"
								aria-live="polite"
							>
								{formatTime(secondsRemaining)}
							</p>
							<p
								class="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500"
							>
								{isRunning ? "Counting down" : "Paused"}
							</p>
						</div>
					</div>

					<div
						class="flex flex-wrap items-center justify-center gap-3"
					>
						{#if !isRunning}
							<button
								type="button"
								class="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
								on:click={startTimer}
							>
								Start
							</button>
						{:else}
							<button
								type="button"
								class="inline-flex items-center justify-center rounded-full bg-rose-500 px-6 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
								on:click={pauseTimer}
							>
								Pause
							</button>
						{/if}

						<button
							type="button"
							class="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-500/50 dark:hover:text-sky-200 dark:focus-visible:ring-offset-slate-950"
							on:click={resetTimer}
						>
							Reset
						</button>

						<button
							type="button"
							class="inline-flex items-center justify-center rounded-full border border-transparent px-5 py-2 text-sm font-semibold text-slate-500 transition hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 dark:text-slate-400 dark:hover:text-slate-200 dark:focus-visible:ring-offset-slate-950"
							on:click={skipSession}
						>
							Skip
						</button>
					</div>
				</div>

				<div
					class="grid gap-4 rounded-3xl border border-slate-200/60 bg-white/70 p-5 shadow-sm dark:border-slate-800/40 dark:bg-slate-900/60"
				>
					<div
						class="flex items-center justify-between rounded-2xl border border-slate-200/60 bg-white/80 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-800/40 dark:bg-slate-900/50 dark:text-slate-300"
					>
						<span>Focus streak</span>
						<span
							class="text-lg font-semibold text-slate-900 dark:text-slate-50"
							>{completedFocusSessions}</span
						>
					</div>
					<div
						class="space-y-2 text-sm text-slate-500 dark:text-slate-400"
					>
						<p
							class="font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500"
						>
							Flow tips
						</p>
						<ul class="space-y-1">
							<li>
								• Protect focus by planning breaks in advance.
							</li>
							<li>
								• Use long breaks to reset your energy each
								cycle.
							</li>
							<li>
								• Adjust durations to mirror your peak flow
								windows.
							</li>
						</ul>
					</div>
				</div>
			</div>
		</div>

		<div
			class="flex flex-col gap-6 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-slate-800/40 dark:bg-slate-900/70"
		>
			<div class="space-y-2">
				<p
					class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400"
				>
					Personalise
				</p>
				<p class="text-base text-slate-600 dark:text-slate-300">
					Tune sprint lengths and long-break cadence to match your
					energy rhythm.
				</p>
			</div>

			<div class="grid gap-4">
				<label
					class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/70 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/60 dark:text-slate-300"
				>
					<span>Focus duration (minutes)</span>
					<input
						type="number"
						min="5"
						max="120"
						class="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-right text-sm font-semibold text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/60"
						bind:value={settings.focus}
						on:change={handleSettingChange("focus")}
					/>
				</label>

				<label
					class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/70 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/60 dark:text-slate-300"
				>
					<span>Short break (minutes)</span>
					<input
						type="number"
						min="1"
						max="30"
						class="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-right text-sm font-semibold text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/60"
						bind:value={settings.short}
						on:change={handleSettingChange("short")}
					/>
				</label>

				<label
					class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/70 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/60 dark:text-slate-300"
				>
					<span>Long break (minutes)</span>
					<input
						type="number"
						min="10"
						max="60"
						class="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-right text-sm font-semibold text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/60"
						bind:value={settings.long}
						on:change={handleSettingChange("long")}
					/>
				</label>

				<label
					class="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/60 bg-white/70 px-4 py-3 text-sm font-medium text-slate-600 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/60 dark:text-slate-300"
				>
					<span>Focus cycles before long break</span>
					<input
						type="number"
						min="1"
						max="12"
						class="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-right text-sm font-semibold text-slate-700 focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/60"
						bind:value={settings.cycles}
						on:change={handleSettingChange("cycles")}
					/>
				</label>
			</div>

			<div
				class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/60 bg-white/70 px-4 py-3 text-sm text-slate-600 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/60 dark:text-slate-300"
			>
				<span>Need a fresh start?</span>
				<button
					type="button"
					class="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-500 transition hover:border-sky-300 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-500/50 dark:hover:text-sky-200 dark:focus-visible:ring-offset-slate-950"
					on:click={() => {
						settings = { ...defaultSettings };
						activeMode = "focus";
						completedFocusSessions = 0;
						resetTimer();
					}}
				>
					Reset defaults
				</button>
			</div>
		</div>
	</div>
</section>
