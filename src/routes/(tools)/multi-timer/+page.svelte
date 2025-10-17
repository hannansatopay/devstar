<script lang="ts">
	import { onDestroy } from 'svelte';

	type TimerMode = 'countdown' | 'stopwatch' | 'alarm';
	type TimerState = 'idle' | 'running' | 'paused' | 'finished';

	interface Lap {
		id: number;
		atMs: number;
	}

	interface Timer {
		id: number;
		label: string;
		mode: TimerMode;
		state: TimerState;
		durationMs: number;
		remainingMs: number;
		elapsedMs: number;
		autoRestart: boolean;
		lastUpdated: number | null;
		createdAt: Date;
		laps: Lap[];
		targetTimestamp: number | null;
		alarmDate?: string;
		alarmTime?: string;
		alarmDisplayDate?: string;
		alarmDisplayTime?: string;
	}

	const TICK_MS = 250;
	const ALARM_SOUND_URL = 'https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg';

	const pad2 = (value: number) => String(value).padStart(2, '0');

	function getDefaultAlarmOffsets() {
		const now = new Date();
		now.setMinutes(now.getMinutes() + 5);
		return {
			alarmDate: now.toISOString().slice(0, 10),
			alarmTime: `${pad2(now.getHours())}:${pad2(now.getMinutes())}`
		};
	}

	function buildAlarmMetadata(timestamp: number) {
		const date = new Date(timestamp);
		return {
			timestamp,
			date: date.toISOString().slice(0, 10),
			time: `${pad2(date.getHours())}:${pad2(date.getMinutes())}`,
			displayDate: date.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' }),
			displayTime: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
		};
	}

	function computeAlarmSchedule(dateStr: string | undefined, timeStr: string | undefined, reference = Date.now()) {
		if (!dateStr || !timeStr) {
			throw new Error('Select both a date and time for the alarm.');
		}

		const [hoursRaw, minutesRaw] = timeStr.split(':');
		const base = new Date(`${dateStr}T00:00:00`);
		base.setHours(Number(hoursRaw ?? 0), Number(minutesRaw ?? 0), 0, 0);

		if (Number.isNaN(base.getTime())) {
			throw new Error('Invalid alarm date or time.');
		}

		if (base.getTime() <= reference) {
			base.setDate(base.getDate() + 1);
		}

		return buildAlarmMetadata(base.getTime());
	}

	let timers: Timer[] = [];
	let nextId = 1;
	let tickHandle: ReturnType<typeof setInterval>;

	const defaultAlarm = getDefaultAlarmOffsets();

	let form = {
		label: '',
		mode: 'countdown' as TimerMode,
		hours: 0,
		minutes: 5,
		seconds: 0,
		autoRestart: false,
		alarmDate: defaultAlarm.alarmDate,
		alarmTime: defaultAlarm.alarmTime
	};

	let errors: string[] = [];
	let completionSound: HTMLAudioElement | null = null;

	$: runningCount = timers.filter((timer) => timer.state === 'running').length;
	$: finishedCount = timers.filter((timer) => timer.state === 'finished').length;

	function ensureAudio() {
		if (!completionSound) {
			completionSound = new Audio(ALARM_SOUND_URL);
		}
		return completionSound;
	}

	function playChime() {
		const audio = ensureAudio();
		audio.currentTime = 0;
		void audio.play().catch(() => {
			/* autoplay restrictions */
		});
	}

	function formatDuration(ms: number) {
		const totalSeconds = Math.max(0, Math.floor(ms / 1000));
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		const seconds = totalSeconds % 60;
		return [hours, minutes, seconds].map((value) => pad2(value)).join(':');
	}

	function formatDurationWithMs(ms: number) {
		const base = formatDuration(ms);
		const hundredths = Math.floor((ms % 1000) / 10);
		return `${base}.${pad2(hundredths)}`;
	}

	function validateForm() {
		const list: string[] = [];

		if (form.mode === 'countdown') {
			const total = Number(form.hours) * 3600 + Number(form.minutes) * 60 + Number(form.seconds);
			if (total <= 0) {
				list.push('Countdown timers require a duration greater than zero.');
			}
		} else if (form.mode === 'alarm') {
			try {
				const schedule = computeAlarmSchedule(form.alarmDate, form.alarmTime);
				if (schedule.timestamp - Date.now() < 1000) {
					list.push('Alarm time must be in the future.');
				}
			} catch (error) {
				list.push((error as Error).message);
			}
		}

		if (form.label.trim().length > 60) {
			list.push('Timer name must be 60 characters or fewer.');
		}

		errors = list;
		return list.length === 0;
	}

	function createTimer(event: Event) {
		event.preventDefault();
		if (!validateForm()) {
			return;
		}

		let schedule: ReturnType<typeof computeAlarmSchedule> | null = null;
		let durationMs = 0;

		if (form.mode === 'countdown') {
			durationMs =
				(Number(form.hours) * 3600 + Number(form.minutes) * 60 + Number(form.seconds)) * 1000;
		} else if (form.mode === 'alarm') {
			schedule = computeAlarmSchedule(form.alarmDate, form.alarmTime);
			durationMs = schedule.timestamp - Date.now();
		}

		durationMs = Math.max(0, durationMs);

		const timer: Timer = {
			id: nextId++,
			label: form.label.trim() || `Timer ${nextId - 1}`,
			mode: form.mode,
			state: form.mode === 'alarm' ? 'running' : 'idle',
			durationMs,
			remainingMs: durationMs,
			elapsedMs: 0,
			autoRestart: form.autoRestart && form.mode === 'countdown',
			lastUpdated: null,
			createdAt: new Date(),
			laps: [],
			targetTimestamp: schedule?.timestamp ?? null,
			alarmDate: schedule?.date,
			alarmTime: schedule?.time,
			alarmDisplayDate: schedule?.displayDate,
			alarmDisplayTime: schedule?.displayTime
		};

		timers = [timer, ...timers];

		if (form.mode === 'alarm') {
			form = {
				...form,
				label: '',
				autoRestart: false,
				alarmDate: schedule?.date ?? form.alarmDate,
				alarmTime: schedule?.time ?? form.alarmTime,
				hours: form.hours,
				minutes: form.minutes,
				seconds: form.seconds
			};
		} else {
			form = {
				...form,
				label: '',
				autoRestart: form.mode === 'countdown' ? form.autoRestart : false,
				hours: 0,
				minutes: form.mode === 'countdown' ? 5 : 0,
				seconds: 0
			};
		}

		errors = [];
	}

	function updateRunningTimers() {
		const now = Date.now();
		let changed = false;

		const updated = timers.map((timer) => {
			if (timer.mode === 'alarm') {
				if (timer.state !== 'running' || timer.targetTimestamp === null) {
					return timer;
				}

				const remaining = Math.max(0, timer.targetTimestamp - now);
				if (remaining <= 0) {
					playChime();
					changed = true;
					return {
						...timer,
						state: 'finished',
						remainingMs: 0,
						targetTimestamp: null
					};
				}

				if (remaining !== timer.remainingMs) {
					changed = true;
					return {
						...timer,
						remainingMs: remaining
					};
				}
				return timer;
			}

			if (timer.state !== 'running' || timer.lastUpdated === null) {
				return timer;
			}

			const delta = now - timer.lastUpdated;
			if (delta <= 0) {
				return timer;
			}

			changed = true;

			if (timer.mode === 'countdown') {
				let remaining = timer.remainingMs - delta;
				let state: TimerState = timer.state;
				let elapsed = timer.durationMs - Math.max(0, remaining);
				let lastUpdated = now;

				if (remaining <= 0) {
					playChime();
					if (timer.autoRestart && timer.durationMs > 0) {
						remaining = timer.durationMs;
						elapsed = 0;
					} else {
						remaining = 0;
						state = 'finished';
						lastUpdated = null;
					}
				}

				return {
					...timer,
					remainingMs: remaining,
					elapsedMs: elapsed,
					state,
					lastUpdated
				};
			}

			// Stopwatch branch
			const elapsed = timer.elapsedMs + delta;
			return {
				...timer,
				elapsedMs: elapsed,
				lastUpdated: now
			};
		});

		if (changed) {
			timers = updated;
		}
	}

	function toggleTimer(id: number) {
		updateRunningTimers();

		const now = Date.now();
		timers = timers.map((timer) => {
			if (timer.id !== id) {
			 return timer;
			}

			if (timer.mode === 'alarm') {
				if (timer.state === 'running') {
					return { ...timer, state: 'paused' };
				}

				if (timer.state === 'paused') {
					const resumeTimestamp = now + Math.max(0, timer.remainingMs);
					const meta = buildAlarmMetadata(resumeTimestamp);
					return {
						...timer,
						state: 'running',
						targetTimestamp: resumeTimestamp,
						alarmDate: meta.date,
						alarmTime: meta.time,
						alarmDisplayDate: meta.displayDate,
						alarmDisplayTime: meta.displayTime,
						durationMs: Math.max(0, resumeTimestamp - Date.now()),
						remainingMs: Math.max(0, resumeTimestamp - Date.now())
					};
				}

				const schedule = computeAlarmSchedule(timer.alarmDate ?? form.alarmDate, timer.alarmTime ?? form.alarmTime, now);
				return {
					...timer,
					state: 'running',
					targetTimestamp: schedule.timestamp,
					alarmDate: schedule.date,
					alarmTime: schedule.time,
					alarmDisplayDate: schedule.displayDate,
					alarmDisplayTime: schedule.displayTime,
					durationMs: Math.max(0, schedule.timestamp - Date.now()),
					remainingMs: Math.max(0, schedule.timestamp - Date.now())
				};
			}

			if (timer.state === 'running') {
				return { ...timer, state: 'paused', lastUpdated: null };
			}

			if (timer.state === 'finished' && timer.mode === 'countdown') {
				return {
					...timer,
					state: 'running',
					remainingMs: timer.durationMs,
					elapsedMs: 0,
					lastUpdated: now
				};
			}

			return { ...timer, state: 'running', lastUpdated: now };
		});
	}

	function resetTimer(id: number) {
		timers = timers.map((timer) => {
			if (timer.id !== id) {
				return timer;
			}

			if (timer.mode === 'alarm') {
				const schedule = computeAlarmSchedule(timer.alarmDate ?? form.alarmDate, timer.alarmTime ?? form.alarmTime);
				return {
					...timer,
					state: 'running',
					durationMs: Math.max(0, schedule.timestamp - Date.now()),
					remainingMs: Math.max(0, schedule.timestamp - Date.now()),
					elapsedMs: 0,
					lastUpdated: null,
					laps: [],
					targetTimestamp: schedule.timestamp,
					alarmDate: schedule.date,
					alarmTime: schedule.time,
					alarmDisplayDate: schedule.displayDate,
					alarmDisplayTime: schedule.displayTime
				};
			}

			return {
				...timer,
				state: 'idle',
				remainingMs: timer.durationMs,
				elapsedMs: 0,
				lastUpdated: null,
				laps: []
			};
		});
	}

	function deleteTimer(id: number) {
		timers = timers.filter((timer) => timer.id !== id);
	}

	function recordLap(id: number) {
		updateRunningTimers();
		timers = timers.map((timer) =>
			timer.id === id
				? {
						...timer,
						laps: [
							...timer.laps,
							{
								id: timer.laps.length + 1,
								atMs: timer.elapsedMs
							}
						]
				  }
				: timer
		);
	}

	function toggleMode(mode: TimerMode) {
		form.mode = mode;
		if (mode !== 'countdown') {
			form.autoRestart = false;
		}
		if (mode === 'alarm') {
			const nextDefaults = getDefaultAlarmOffsets();
			form.alarmDate = nextDefaults.alarmDate;
			form.alarmTime = nextDefaults.alarmTime;
		}
	}

	updateRunningTimers();
	tickHandle = setInterval(updateRunningTimers, TICK_MS);

	onDestroy(() => {
		clearInterval(tickHandle);
	});
</script>

<div class="page">
	<div class="layout">
		<section class="create-panel">
			<header>
				<h1>Multi Timer</h1>
				<p>
					Create flexible countdowns, stopwatches, or alarms, run them in parallel, track laps, and auto-repeat
					completions to fit any workflow.
				</p>
			</header>

			<form class="form" on:submit={createTimer}>
				<div class="field">
					<label for="timer-label">Timer name</label>
					<input
						id="timer-label"
						type="text"
						placeholder="e.g. Tea break, Pomodoro, Interval set"
						maxlength="60"
						bind:value={form.label}
					/>
				</div>

				<div class="field mode-toggle">
					<label>Mode</label>
					<div class="mode-buttons">
						<button
							type="button"
							class:active={form.mode === 'countdown'}
							on:click={() => toggleMode('countdown')}
						>
							<span>Countdown</span>
							<small>Set a target duration</small>
						</button>
						<button
							type="button"
							class:active={form.mode === 'stopwatch'}
							on:click={() => toggleMode('stopwatch')}
						>
							<span>Stopwatch</span>
							<small>Track elapsed time</small>
						</button>
						<button
							type="button"
							class:active={form.mode === 'alarm'}
							on:click={() => toggleMode('alarm')}
						>
							<span>Alarm</span>
							<small>Trigger at a specific time</small>
						</button>
					</div>
				</div>

				{#if form.mode === 'countdown'}
					<div class="field time-picker">
						<label>Duration</label>
						<div class="time-inputs">
							<div>
								<span>Hours</span>
								<input type="number" min="0" bind:value={form.hours} />
							</div>
							<div>
								<span>Minutes</span>
								<input type="number" min="0" max="59" bind:value={form.minutes} />
							</div>
							<div>
								<span>Seconds</span>
								<input type="number" min="0" max="59" bind:value={form.seconds} />
							</div>
						</div>
					</div>

					<div class="field checkbox">
						<label>
							<input type="checkbox" bind:checked={form.autoRestart} />
							<span>Auto-restart when the countdown finishes</span>
						</label>
					</div>
				{:else if form.mode === 'alarm'}
					<div class="field alarm-picker">
						<label>Alarm time</label>
						<div class="alarm-inputs">
							<label>
								<span>Date</span>
								<input type="date" bind:value={form.alarmDate} min={new Date().toISOString().slice(0, 10)} />
							</label>
							<label>
								<span>Time</span>
								<input type="time" bind:value={form.alarmTime} />
							</label>
						</div>
						<p class="form-hint">Alarm times use your local timezone.</p>
					</div>
				{/if}

				{#if errors.length}
					<ul class="form-errors">
						{#each errors as error}
							<li>{error}</li>
						{/each}
					</ul>
				{/if}

				<button type="submit" class="primary-action">Create timer</button>

				<div class="summary-bar">
					<div>
						<strong>{timers.length}</strong>
						<span>Total timers</span>
					</div>
					<div>
						<strong>{runningCount}</strong>
						<span>Running</span>
					</div>
					<div>
						<strong>{finishedCount}</strong>
						<span>Finished</span>
					</div>
				</div>
			</form>
		</section>

		<section class="timers-panel">
			{#if timers.length === 0}
				<div class="empty-state">
					<h2>No timers yet</h2>
					<p>Create your first countdown, stopwatch, or alarm using the form above.</p>
				</div>
			{:else}
				<ul class="timer-list">
					{#each timers as timer (timer.id)}
						<li>
							<article class={`timer-card ${timer.state}`}>
								<header>
									<div class="title">
										<h3>{timer.label}</h3>
										<span class={`mode ${timer.mode}`}>
											{timer.mode === 'countdown' ? 'Countdown' : timer.mode === 'stopwatch' ? 'Stopwatch' : 'Alarm'}
										</span>
									</div>
									<small>
										Created {timer.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
									</small>
								</header>

								<div class="timer-display">
									<strong>
										{timer.mode === 'stopwatch'
											? formatDurationWithMs(timer.elapsedMs)
											: formatDuration(timer.remainingMs)}
									</strong>
									{#if timer.mode === 'countdown' && timer.durationMs > 0}
										<div class="progress">
											<div
												class="bar"
												style={`width: ${Math.max(
													0,
													Math.min(100, (100 * (timer.durationMs - timer.remainingMs)) / timer.durationMs)
												)}%;`}
											/>
										</div>
									{/if}
									{#if timer.mode === 'alarm'}
										<div class="alarm-meta">
											<span>Scheduled for</span>
											<div>
												<strong>{timer.alarmDisplayTime ?? '--:--'}</strong>
												<span>{timer.alarmDisplayDate ?? ''}</span>
											</div>
										</div>
									{/if}
								</div>

								<footer>
									<div class="controls">
										<button type="button" on:click={() => toggleTimer(timer.id)}>
											{timer.state === 'running'
												? 'Pause'
												: timer.state === 'finished'
												? timer.mode === 'alarm'
													? 'Rearm'
													: 'Restart'
												: 'Start'}
										</button>
										<button type="button" on:click={() => resetTimer(timer.id)} disabled={timer.state === 'idle'}>
											Reset
										</button>
										<button
											type="button"
											on:click={() => recordLap(timer.id)}
											disabled={timer.mode !== 'stopwatch' || timer.state !== 'running'}
										>
											Lap
										</button>
									</div>
									<button type="button" class="delete" on:click={() => deleteTimer(timer.id)}>
										Delete
									</button>
								</footer>

								{#if timer.mode === 'stopwatch' && timer.laps.length}
									<ul class="lap-list">
										{#each timer.laps as lap}
											<li>
												<span>Lap {lap.id}</span>
												<span>{formatDurationWithMs(lap.atMs)}</span>
											</li>
										{/each}
									</ul>
								{/if}

								{#if timer.state === 'finished'}
									<p class="finished-label">
										Finished - click {timer.mode === 'alarm' ? 'rearm' : 'restart'} to run again
									</p>
								{/if}
							</article>
						</li>
					{/each}
				</ul>
			{/if}
		</section>
	</div>
</div>

<style>
	.page {
		padding: clamp(1.5rem, 2vw, 2.5rem);
		background: linear-gradient(160deg, var(--surface-light, #f8f9fc) 0%, var(--surface-light-alt, #eef0f6) 100%);
		min-height: 100%;
		color: #111827;
	}

	:global(.dark) .page {
		background: linear-gradient(180deg, var(--surface-dark, #0d0e12) 0%, var(--surface-dark-alt, #12131b) 100%);
		color: #e5e7eb;
	}

	.layout {
		display: flex;
		flex-direction: column;
		gap: clamp(1.5rem, 2vw, 2.5rem);
		max-width: 960px;
		margin: 0 auto;
	}

	.create-panel {
		display: grid;
		gap: 1.5rem;
		padding: clamp(1.5rem, 2vw, 2.25rem);
		border-radius: 1.75rem;
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid rgba(148, 163, 184, 0.3);
		box-shadow: 0 28px 60px -45px rgba(15, 23, 42, 0.75);
		backdrop-filter: blur(18px);
	}

	:global(.dark) .create-panel {
		background: rgba(17, 23, 37, 0.85);
		border-color: rgba(99, 102, 241, 0.25);
		box-shadow: 0 32px 70px -48px rgba(2, 6, 23, 0.85);
	}

	header h1 {
		margin: 0;
		font-size: clamp(2rem, 3vw, 2.5rem);
		font-weight: 800;
	}

	header p {
		margin: 0.5rem 0 0;
		font-size: 0.95rem;
		color: rgba(71, 85, 105, 0.9);
		line-height: 1.6;
	}

	:global(.dark) header p {
		color: rgba(203, 213, 225, 0.75);
	}

	.form {
		display: grid;
		gap: 1.25rem;
	}

	.field {
		display: grid;
		gap: 0.6rem;
	}

	label {
		font-weight: 600;
		font-size: 0.9rem;
		color: rgba(55, 65, 81, 0.95);
	}

	:global(.dark) label {
		color: rgba(209, 213, 219, 0.9);
	}

	input[type='text'],
	input[type='number'] {
		width: 100%;
		padding: 0.8rem 1rem;
		border-radius: 0.9rem;
		border: 1px solid rgba(148, 163, 184, 0.35);
		background: rgba(255, 255, 255, 0.95);
		color: inherit;
		font-size: 0.95rem;
		transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	}

	input[type='text']:focus,
	input[type='number']:focus {
		outline: none;
		border-color: rgba(99, 102, 241, 0.6);
		box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
		background: rgba(255, 255, 255, 0.98);
	}

	input[type='number']::-webkit-inner-spin-button,
	input[type='number']::-webkit-outer-spin-button {
		height: 28px;
	}

	:global(.dark) input[type='text'],
	:global(.dark) input[type='number'] {
		background: rgba(23, 31, 47, 0.85);
		border-color: rgba(99, 102, 241, 0.18);
	}

	:global(.dark) input[type='text']:focus,
	:global(.dark) input[type='number']:focus {
		box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.18);
		border-color: rgba(168, 85, 247, 0.55);
	}

	.mode-buttons {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.6rem;
	}

	@media (max-width: 640px) {
		.mode-buttons {
			grid-template-columns: repeat(1, minmax(0, 1fr));
		}
	}

	.mode-buttons button {
		border: none;
		border-radius: 1rem;
		padding: 0.85rem 1rem;
		cursor: pointer;
		background: rgba(248, 250, 252, 0.9);
		box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.25);
		text-align: left;
		display: grid;
		gap: 0.25rem;
		transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	}

	.mode-buttons button span {
		font-weight: 600;
	}

	.mode-buttons button small {
		font-size: 0.8rem;
		color: rgba(71, 85, 105, 0.8);
	}

	.mode-buttons button:hover {
		transform: translateY(-2px);
		box-shadow: 0 18px 28px -25px rgba(99, 102, 241, 0.45);
	}

	.mode-buttons button.active {
		background: rgba(99, 102, 241, 0.92);
		color: #ffffff;
		box-shadow: 0 20px 32px -28px rgba(79, 70, 229, 0.55);
	}

	.mode-buttons button.active small {
		color: rgba(226, 232, 240, 0.95);
	}

	:global(.dark) .mode-buttons button {
		background: rgba(23, 31, 47, 0.8);
		box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.18);
	}

	:global(.dark) .mode-buttons button small {
		color: rgba(203, 213, 225, 0.75);
	}

	:global(.dark) .mode-buttons button.active {
		background: rgba(168, 85, 247, 0.9);
		box-shadow: 0 22px 34px -28px rgba(168, 85, 247, 0.55);
	}

	.time-picker .time-inputs {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.65rem;
	}

	.time-picker span {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		color: rgba(100, 116, 139, 0.9);
		margin-bottom: 0.3rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	:global(.dark) .time-picker span {
		color: rgba(148, 163, 184, 0.75);
	}

	.alarm-picker {
		display: grid;
		gap: 0.75rem;
	}

	.alarm-inputs {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
		gap: 0.75rem;
	}

	.alarm-inputs span {
		display: block;
		font-size: 0.75rem;
		font-weight: 600;
		color: rgba(100, 116, 139, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		margin-bottom: 0.3rem;
	}

	:global(.dark) .alarm-inputs span {
		color: rgba(148, 163, 184, 0.75);
	}

	.form-hint {
		margin: 0;
		font-size: 0.8rem;
		color: rgba(100, 116, 139, 0.8);
	}

	:global(.dark) .form-hint {
		color: rgba(148, 163, 184, 0.7);
	}

	.checkbox label {
		display: flex;
		align-items: center;
		gap: 0.6rem;
		font-weight: 500;
	}

	.checkbox input {
		width: 18px;
		height: 18px;
		border-radius: 0.4rem;
		border: 1px solid rgba(148, 163, 184, 0.4);
	}

	.form-errors {
		margin: 0;
		padding: 0.9rem 1rem;
		border-radius: 0.9rem;
		background: rgba(254, 226, 226, 0.85);
		color: rgba(185, 28, 28, 0.95);
		list-style: disc;
		padding-left: 2.2rem;
	}

	.primary-action {
		border: none;
		border-radius: 999px;
		padding: 0.9rem 1.8rem;
		font-weight: 600;
		cursor: pointer;
		background: linear-gradient(120deg, #6366f1, #8b5cf6, #ec4899);
		color: #fff;
		box-shadow: 0 20px 40px -30px rgba(99, 102, 241, 0.6);
		transition: transform 0.2s ease, box-shadow 0.2s ease;
	}

	.primary-action:hover {
		transform: translateY(-1px);
		box-shadow: 0 24px 48px -32px rgba(99, 102, 241, 0.7);
	}

	.summary-bar {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 0.75rem;
		padding: 0.85rem;
		border-radius: 1rem;
		background: rgba(248, 250, 252, 0.85);
		border: 1px solid rgba(148, 163, 184, 0.25);
	}

	.summary-bar div {
		display: grid;
		gap: 0.15rem;
		text-align: center;
	}

	.summary-bar strong {
		font-size: 1.2rem;
	}

	.summary-bar span {
		font-size: 0.8rem;
		color: rgba(100, 116, 139, 0.8);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	:global(.dark) .summary-bar {
		background: rgba(23, 31, 47, 0.75);
		border-color: rgba(99, 102, 241, 0.18);
	}

	:global(.dark) .summary-bar span {
		color: rgba(148, 163, 184, 0.7);
	}

	.timers-panel {
		padding: clamp(1.5rem, 2vw, 2rem);
		border-radius: 1.75rem;
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid rgba(148, 163, 184, 0.3);
		box-shadow: 0 32px 70px -50px rgba(15, 23, 42, 0.75);
		backdrop-filter: blur(18px);
		min-height: 320px;
	}

	:global(.dark) .timers-panel {
		background: rgba(17, 23, 37, 0.85);
		border-color: rgba(99, 102, 241, 0.25);
		box-shadow: 0 36px 80px -56px rgba(2, 6, 23, 0.85);
	}

	.empty-state {
		text-align: center;
		padding: 3rem 1rem;
		color: rgba(71, 85, 105, 0.85);
	}

	.empty-state h2 {
		margin: 0 0 0.6rem;
		font-size: 1.4rem;
	}

	.empty-state p {
		margin: 0;
		line-height: 1.5;
	}

	:global(.dark) .empty-state {
		color: rgba(203, 213, 225, 0.75);
	}

	.timer-list {
		margin: 0;
		padding: 0;
		list-style: none;
		display: flex;
		flex-wrap: nowrap;
		gap: 1.5rem;
		overflow-x: auto;
		scrollbar-width: thin;
		scrollbar-color: rgba(99, 102, 241, 0.4) transparent;
		padding-bottom: 0.5rem;
	}

	.timer-list::-webkit-scrollbar {
		height: 8px;
	}

	.timer-list::-webkit-scrollbar-thumb {
		background: linear-gradient(90deg, rgba(99, 102, 241, 0.6), rgba(168, 85, 247, 0.6));
		border-radius: 999px;
	}

	.timer-list::-webkit-scrollbar-track {
		background: transparent;
	}

	.timer-list li {
		flex: 0 0 320px;
		display: flex;
	}

	.timer-card {
		flex: 1 1 auto;
		height: 100%;
		display: grid;
		gap: 1rem;
		padding: 1.4rem;
		border-radius: 1.5rem;
		background: rgba(248, 250, 252, 0.92);
		border: 1px solid rgba(148, 163, 184, 0.3);
		box-shadow: 0 24px 50px -40px rgba(15, 23, 42, 0.65);
		position: relative;
		overflow: hidden;
	}

	.timer-card.running {
		border-color: rgba(99, 102, 241, 0.45);
		box-shadow: 0 30px 55px -42px rgba(79, 70, 229, 0.5);
		background: linear-gradient(145deg, rgba(244, 247, 255, 0.95), rgba(233, 233, 252, 0.92));
	}

	.timer-card.finished {
		border-color: rgba(52, 211, 153, 0.4);
		background: linear-gradient(145deg, rgba(240, 253, 244, 0.92), rgba(209, 250, 229, 0.88));
	}

	:global(.dark) .timer-card {
		background: rgba(23, 31, 47, 0.82);
		border-color: rgba(99, 102, 241, 0.2);
		box-shadow: 0 30px 60px -50px rgba(2, 6, 23, 0.85);
	}

	:global(.dark) .timer-card.running {
		border-color: rgba(168, 85, 247, 0.45);
		box-shadow: 0 36px 70px -54px rgba(168, 85, 247, 0.5);
		background: linear-gradient(150deg, rgba(31, 41, 55, 0.95), rgba(55, 48, 163, 0.32));
	}

	:global(.dark) .timer-card.finished {
		border-color: rgba(16, 185, 129, 0.45);
		background: linear-gradient(150deg, rgba(17, 24, 39, 0.94), rgba(5, 150, 105, 0.28));
	}

	header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
	}

	.title {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}

	h3 {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 700;
	}

	.mode {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.65rem;
		border-radius: 999px;
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-weight: 700;
	}

	.mode.countdown {
		background: rgba(59, 130, 246, 0.18);
		color: rgba(37, 99, 235, 0.95);
	}

	.mode.stopwatch {
		background: rgba(236, 72, 153, 0.18);
		color: rgba(219, 39, 119, 0.95);
	}

	.mode.alarm {
		background: rgba(16, 185, 129, 0.18);
		color: rgba(22, 163, 74, 0.9);
	}

	:global(.dark) .mode.countdown {
		background: rgba(59, 130, 246, 0.2);
		color: rgba(96, 165, 250, 0.95);
	}

	:global(.dark) .mode.stopwatch {
		background: rgba(236, 72, 153, 0.2);
		color: rgba(244, 114, 182, 0.95);
	}

	:global(.dark) .mode.alarm {
		background: rgba(16, 185, 129, 0.25);
		color: rgba(134, 239, 172, 0.9);
	}

	.timer-display {
		display: grid;
		gap: 0.75rem;
	}

	.timer-display strong {
		font-size: clamp(2rem, 3vw, 2.6rem);
		font-weight: 700;
		letter-spacing: 0.04em;
	}

	.progress {
		height: 8px;
		background: rgba(226, 232, 240, 0.8);
		border-radius: 999px;
		overflow: hidden;
	}

	.progress .bar {
		height: 100%;
		background: linear-gradient(120deg, #6366f1, #a855f7);
		border-radius: 999px;
		transition: width 0.2s ease;
	}

	.alarm-meta {
		display: grid;
		gap: 0.2rem;
		font-size: 0.85rem;
		color: rgba(100, 116, 139, 0.85);
	}

	.alarm-meta > div {
		display: flex;
		align-items: baseline;
		gap: 0.4rem;
	}

	.alarm-meta strong {
		font-size: 1.05rem;
		color: rgba(79, 70, 229, 0.9);
	}

	:global(.dark) .alarm-meta {
		color: rgba(148, 163, 184, 0.75);
	}

	:global(.dark) .alarm-meta strong {
		color: rgba(168, 85, 247, 0.9);
	}

	footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
	}

	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
	}

	.controls button {
		border-radius: 999px;
		border: none;
		padding: 0.65rem 1.25rem;
		font-weight: 600;
		cursor: pointer;
		background: rgba(79, 70, 229, 0.14);
		color: rgba(55, 48, 163, 0.95);
		transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	}

	.controls button:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 12px 24px -18px rgba(79, 70, 229, 0.45);
		background: rgba(79, 70, 229, 0.22);
	}

	.controls button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.delete {
		border: none;
		background: rgba(248, 113, 113, 0.18);
		color: rgba(220, 38, 38, 0.9);
		border-radius: 999px;
		padding: 0.55rem 1.1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s ease, transform 0.2s ease;
	}

	.delete:hover {
		background: rgba(248, 113, 113, 0.28);
		transform: translateY(-1px);
	}

	:global(.dark) .controls button {
		background: rgba(168, 85, 247, 0.2);
		color: rgba(233, 213, 255, 0.95);
	}

	:global(.dark) .delete {
		background: rgba(248, 113, 113, 0.22);
		color: rgba(254, 226, 226, 0.9);
	}

	.lap-list {
		margin: 0.5rem 0 0;
		padding: 0.75rem 0 0;
		list-style: none;
		border-top: 1px solid rgba(148, 163, 184, 0.25);
		display: grid;
		gap: 0.4rem;
	}

	.lap-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		font-size: 0.9rem;
		color: rgba(71, 85, 105, 0.9);
	}

	:global(.dark) .lap-list {
		border-color: rgba(148, 163, 184, 0.2);
	}

	:global(.dark) .lap-list li {
		color: rgba(203, 213, 225, 0.75);
	}

	.finished-label {
		margin: 0;
		font-size: 0.85rem;
		color: rgba(16, 185, 129, 0.85);
		font-weight: 600;
	}

	:global(.dark) .finished-label {
		color: rgba(52, 211, 153, 0.75);
	}
</style>
