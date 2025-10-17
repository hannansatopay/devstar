<script lang="ts">
	import { onDestroy } from 'svelte';
import ClockCard from './ClockCard.svelte';
import { allTimezones, popular } from './timezones';
import type { TimezoneClock, TimezoneOption } from './types';

const defaultSelection = ['America/New_York', 'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'];

let now = new Date();
let searchTerm = '';
let selectedTimezones: TimezoneClock[] = [];
let interval: ReturnType<typeof setInterval>;

function parseOffset(label: string) {
		const match = label.match(/([+-])(\d{1,2})(?::(\d{2}))?/);
		if (!match) return 0;
		const sign = match[1] === '-' ? -1 : 1;
		const hours = Number.parseInt(match[2], 10);
		const minutes = match[3] ? Number.parseInt(match[3], 10) : 0;
		return sign * (Math.abs(hours) + minutes / 60);
	}

	function extractTimeData(timezone: string) {
		const timeFormatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			hour12: false,
			year: 'numeric',
			month: 'numeric',
			day: 'numeric',
			hour: 'numeric',
			minute: 'numeric',
			second: 'numeric'
		});

		const dateFormatter = new Intl.DateTimeFormat([], {
			timeZone: timezone,
			weekday: 'long',
			month: 'short',
			day: 'numeric'
		});

		const displayTimeFormatter = new Intl.DateTimeFormat([], {
			timeZone: timezone,
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		});

		const offsetFormatter = new Intl.DateTimeFormat('en-US', {
			timeZone: timezone,
			timeZoneName: 'shortOffset'
		});

		const parts = timeFormatter.formatToParts(now);
		const getPart = (type: Intl.DateTimeFormatPartTypes) =>
			Number(parts.find((part) => part.type === type)?.value ?? '0');

		const offsetLabel =
			offsetFormatter.formatToParts(now).find((part) => part.type === 'timeZoneName')?.value ?? 'UTC';

		return {
			hour: getPart('hour'),
			minute: getPart('minute'),
			second: getPart('second'),
			displayTime: displayTimeFormatter.format(now),
			displayDate: dateFormatter.format(now),
			offsetLabel,
			offset: parseOffset(offsetLabel)
		};
	}

function createClock(option: TimezoneOption): TimezoneClock {
	const { hour, minute, second, displayTime, displayDate, offsetLabel, offset } = extractTimeData(
		option.timezone
	);

	return {
			id: option.id,
			city: option.city,
			country: option.country,
			timezone: option.timezone,
			hour,
			minute,
		second,
		displayTime,
		displayDate,
		offset,
		offsetLabel
	};
}

function initializeClocks() {
	selectedTimezones = defaultSelection
		.map((tz) => allTimezones.find((item) => item.timezone === tz))
		.filter(Boolean)
		.map((option) => createClock(option as TimezoneOption));
}

function updateClocks() {
	now = new Date();
	selectedTimezones = selectedTimezones
		.map((clock) => {
			const option = allTimezones.find((item) => item.id === clock.id);
			if (!option) return clock;
			return { ...createClock(option) };
		});
}

function removeClock(clock: TimezoneClock) {
	selectedTimezones = selectedTimezones.filter((item) => item.id !== clock.id);
}

function addClock(option: TimezoneOption) {
	const baseOption = allTimezones.find((item) => item.timezone === option.timezone) ?? option;

	const existingIndex = selectedTimezones.findIndex((item) => item.id === baseOption.id);
	if (existingIndex !== -1) {
		const [existing] = selectedTimezones.splice(existingIndex, 1);
		selectedTimezones = [existing, ...selectedTimezones];
	} else {
		selectedTimezones = [createClock(baseOption), ...selectedTimezones];
	}
	updateClocks();
	searchTerm = '';
}

function filteredOptions(group: TimezoneOption[]) {
		if (!searchTerm.trim()) return group;
		const normalized = searchTerm.toLowerCase();
		return group.filter((option) => option.label.toLowerCase().includes(normalized));
	}

	initializeClocks();
	updateClocks();
	interval = setInterval(updateClocks, 1000);

	onDestroy(() => {
		clearInterval(interval);
	});
</script>

<div class="page">
	<header class="page-header">
		<div class="copy">
			<h1>World Clock</h1>
			<p>Monitor global cities with live analog clocks and discover new timezones fast.</p>
		</div>
		<div class="local">
			<span class="label">Local Time</span>
			<strong>{now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
			<span class="date">{now.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' })}</span>
		</div>
	</header>

	<section class="content">
		<aside class="controls">
			<div class="search">
				<label for="timezone-search">Add a city</label>
				<input
					id="timezone-search"
					type="search"
					placeholder="Search by city, country, or timezone"
					bind:value={searchTerm}
				/>
			</div>

			{#if searchTerm}
				<div class="panel-list scrollable results">
					<h2>Matches</h2>
					<ul>
						{#each filteredOptions(allTimezones) as option}
							<li>
								<button type="button" on:click={() => addClock(option)}>
									<span class="city">{option.city}</span>
									<span class="meta">{option.country}</span>
									<span class="tz">{option.timezone}</span>
								</button>
							</li>
						{/each}
						{#if filteredOptions(allTimezones).length === 0}
							<li class="empty">No matches found.</li>
						{/if}
					</ul>
				</div>
			{:else}
				<div class="panel-list scrollable">
					<h2>Popular</h2>
					<ul>
						{#each popular as option}
							<li>
								<button type="button" on:click={() => addClock(option)}>
									<span class="city">{option.city}</span>
									<span class="meta">{option.country}</span>
								</button>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		</aside>

		<main class="clock-board">
			{#if selectedTimezones.length === 0}
				<div class="empty-state">
					<h2>No clocks yet</h2>
					<p>Search for a city or pick a popular timezone to start your board.</p>
				</div>
			{:else}
				<div class="clock-row">
					{#each selectedTimezones as clock (clock.id)}
						<div class="card-wrapper">
							<ClockCard {clock} />
							<div class="card-actions">
								<button type="button" on:click={() => removeClock(clock)} aria-label="Remove timezone">
									✕
								</button>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</main>
	</section>
</div>

<style>
	.page {
		display: grid;
		gap: clamp(1.25rem, 2vw, 2rem);
		padding: clamp(1.2rem, 2vw, 2.2rem);
		background: linear-gradient(155deg, var(--surface-light, #f8f9fc), var(--surface-light-alt, #eef1f8));
		color: #0f172a;
		min-height: 100%;
	}

	:global(.dark) .page {
		background: linear-gradient(170deg, var(--surface-dark, #0d0e12), var(--surface-dark-alt, #141720));
		color: #e5e7eb;
	}

	.page-header {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1.4rem;
		padding: clamp(1.5rem, 2vw, 2.25rem);
		border-radius: 1.75rem;
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid rgba(148, 163, 184, 0.25);
		box-shadow: 0 22px 50px -38px rgba(15, 23, 42, 0.6);
		backdrop-filter: blur(16px);
	}

	:global(.dark) .page-header {
		background: rgba(19, 25, 38, 0.85);
		border-color: rgba(99, 102, 241, 0.25);
		box-shadow: 0 26px 60px -44px rgba(2, 6, 23, 0.85);
	}

	.copy {
		max-width: 520px;
	}

	.copy h1 {
		margin: 0 0 0.4rem;
		font-size: clamp(2.2rem, 3vw, 2.75rem);
		font-weight: 800;
	}

	.copy p {
		margin: 0;
		font-size: 0.95rem;
		color: rgba(71, 85, 105, 0.9);
		line-height: 1.6;
	}

	:global(.dark) .copy p {
		color: rgba(203, 213, 225, 0.75);
	}

	.local {
		display: grid;
		gap: 0.35rem;
		align-items: start;
		min-width: 200px;
	}

	.local .label {
		font-size: 0.8rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.1em;
		color: rgba(79, 70, 229, 0.85);
	}

	.local strong {
		font-size: clamp(1.9rem, 2.8vw, 2.4rem);
		font-weight: 700;
		letter-spacing: 0.04em;
	}

	.local .date {
		font-size: 0.9rem;
		color: rgba(71, 85, 105, 0.85);
	}

	:global(.dark) .local .label {
		color: rgba(129, 140, 248, 0.85);
	}

	:global(.dark) .local .date {
		color: rgba(148, 163, 184, 0.75);
	}

	.content {
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
		align-items: flex-start;
	}

	.controls {
		flex: 0 0 320px;
		display: grid;
		gap: 1.25rem;
		padding: 1.5rem;
		border-radius: 1.6rem;
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid rgba(148, 163, 184, 0.25);
		box-shadow: 0 20px 40px -32px rgba(15, 23, 42, 0.6);
		backdrop-filter: blur(14px);
	}

	:global(.dark) .controls {
		background: rgba(19, 25, 38, 0.85);
		border-color: rgba(99, 102, 241, 0.22);
		box-shadow: 0 24px 55px -40px rgba(2, 6, 23, 0.85);
	}

	.controls label {
		font-size: 0.85rem;
		font-weight: 600;
		color: rgba(55, 65, 81, 0.95);
	}

	:global(.dark) .controls label {
		color: rgba(209, 213, 219, 0.9);
	}

	.controls input[type='search'] {
		width: 100%;
		padding: 0.85rem 1rem;
		border-radius: 999px;
		border: 1px solid rgba(148, 163, 184, 0.35);
		background: rgba(255, 255, 255, 0.95);
		color: inherit;
		font-size: 0.95rem;
		transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	}

	.controls input[type='search']:focus {
		outline: none;
		border-color: rgba(99, 102, 241, 0.6);
		box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
		background: rgba(255, 255, 255, 0.98);
	}

	:global(.dark) .controls input[type='search'] {
		background: rgba(23, 31, 47, 0.8);
		border-color: rgba(99, 102, 241, 0.2);
	}

	:global(.dark) .controls input[type='search']:focus {
		border-color: rgba(168, 85, 247, 0.5);
		box-shadow: 0 0 0 4px rgba(168, 85, 247, 0.22);
	}

	.panel-list {
		display: grid;
		gap: 0.75rem;
	}

	.panel-list h2 {
		margin: 0;
		font-size: 1.05rem;
		font-weight: 700;
	}

	.panel-list ul {
		margin: 0;
		padding: 0;
		list-style: none;
		display: grid;
		gap: 0.45rem;
	}

	.panel-list li button {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
		padding: 0.75rem 1rem;
		border-radius: 1rem;
		border: none;
		background: rgba(248, 250, 252, 0.9);
		box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.25);
		cursor: pointer;
		color: inherit;
		text-align: left;
		transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	}

	.panel-list li button:hover {
		transform: translateY(-2px);
		box-shadow: 0 18px 32px -26px rgba(99, 102, 241, 0.45);
		background: rgba(237, 233, 254, 0.95);
	}

	.panel-list.scrollable {
		max-height: clamp(260px, 45vh, 360px);
		overflow-y: auto;
		scrollbar-width: thin;
		scrollbar-color: rgba(99, 102, 241, 0.4) transparent;
	}

	.panel-list.scrollable::-webkit-scrollbar {
		width: 6px;
	}

	.panel-list.scrollable::-webkit-scrollbar-thumb {
		background: linear-gradient(180deg, rgba(99, 102, 241, 0.55), rgba(168, 85, 247, 0.55));
		border-radius: 999px;
	}

	.panel-list.scrollable::-webkit-scrollbar-track {
		background: transparent;
	}

	.panel-list .city {
		font-weight: 600;
	}

	.panel-list .meta {
		font-size: 0.85rem;
		color: rgba(100, 116, 139, 0.8);
	}

	.panel-list .tz {
		font-size: 0.78rem;
		color: rgba(99, 102, 241, 0.85);
	}

	.panel-list.results .tz {
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.panel-list .empty {
		padding: 0.4rem 0;
		font-size: 0.85rem;
		color: rgba(148, 163, 184, 0.85);
		text-align: center;
	}

	:global(.dark) .panel-list li button {
		background: rgba(23, 31, 47, 0.78);
		box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.2);
	}

	:global(.dark) .panel-list li button:hover {
		background: rgba(67, 56, 202, 0.28);
		box-shadow: 0 18px 28px -24px rgba(168, 85, 247, 0.5);
	}

	:global(.dark) .panel-list .meta {
		color: rgba(203, 213, 225, 0.7);
	}

	.clock-board {
		flex: 1;
		min-width: 0;
		padding: clamp(1.4rem, 2vw, 2rem);
		border-radius: 1.8rem;
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid rgba(148, 163, 184, 0.3);
		box-shadow: 0 28px 64px -46px rgba(15, 23, 42, 0.7);
		backdrop-filter: blur(18px);
	}

	:global(.dark) .clock-board {
		background: rgba(18, 24, 37, 0.88);
		border-color: rgba(99, 102, 241, 0.25);
		box-shadow: 0 32px 74px -52px rgba(2, 6, 23, 0.85);
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

	.clock-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1.25rem;
	}

	.card-wrapper {
		position: relative;
		min-width: 240px;
		flex: 1 1 260px;
		max-width: 320px;
	}

	.card-actions {
		position: absolute;
		top: 0.75rem;
		right: 0.75rem;
		display: flex;
		gap: 0.5rem;
	}

	.card-actions button {
		width: 2.4rem;
		height: 2.4rem;
		border-radius: 999px;
		border: none;
		background: rgba(248, 250, 252, 0.92);
		color: rgba(30, 41, 59, 0.75);
		display: grid;
		place-items: center;
		font-size: 1.1rem;
		cursor: pointer;
		box-shadow: 0 16px 34px -26px rgba(15, 23, 42, 0.65);
		transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
	}

	.card-actions button:hover {
		transform: translateY(-2px);
		box-shadow: 0 20px 32px -24px rgba(79, 70, 229, 0.45);
		background: rgba(237, 233, 254, 0.92);
	}

	:global(.dark) .card-actions button {
		background: rgba(23, 31, 47, 0.78);
		color: rgba(226, 232, 240, 0.85);
		box-shadow: 0 20px 40px -30px rgba(2, 6, 23, 0.8);
	}

	:global(.dark) .card-actions button:hover {
		background: rgba(67, 56, 202, 0.35);
		box-shadow: 0 22px 40px -32px rgba(168, 85, 247, 0.5);
	}

	@media (max-width: 900px) {
		.controls {
			flex: 1 1 320px;
		}
	}
</style>
