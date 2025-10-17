<script lang="ts">
	import AnalogClock from './AnalogClock.svelte';
	import type { TimezoneClock } from './types';

	export let clock: TimezoneClock;
</script>

<article class="clock-card">
	<AnalogClock hour={clock.hour} minute={clock.minute} second={clock.second} />

	<div class="meta">
		<h3>{clock.city}</h3>
		<p>{clock.country}</p>
		<span class="time">{clock.displayTime}</span>
		<span class="date">{clock.displayDate}</span>
		<span class="offset">{clock.offsetLabel}</span>
	</div>
</article>

<style>
	.clock-card {
		display: grid;
		gap: 1rem;
		padding: 1.5rem;
		border-radius: 1.4rem;
		background: rgba(255, 255, 255, 0.92);
		border: 1px solid rgba(148, 163, 184, 0.35);
		box-shadow: 0 20px 40px -32px rgba(15, 23, 42, 0.7);
		backdrop-filter: blur(14px);
		color: #0f172a;
		transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
		justify-items: center;
	}

	.clock-card:hover {
		transform: translateY(-4px);
		border-color: rgba(99, 102, 241, 0.4);
		box-shadow: 0 24px 45px -35px rgba(67, 56, 202, 0.55);
	}

	.meta {
		display: grid;
		gap: 0.3rem;
		text-align: center;
	}

	h3 {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 700;
	}

	p {
		margin: 0;
		font-size: 0.9rem;
		color: rgba(71, 85, 105, 0.85);
	}

	.time {
		font-size: 1.1rem;
		font-weight: 600;
	}

	.date {
		font-size: 0.85rem;
		color: rgba(100, 116, 139, 0.85);
	}

	.offset {
		font-size: 0.8rem;
		font-weight: 700;
		color: rgba(99, 102, 241, 0.9);
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	:global(.dark) .clock-card {
		background: rgba(24, 30, 43, 0.86);
		color: rgba(226, 232, 240, 0.98);
		border-color: rgba(99, 102, 241, 0.2);
		box-shadow: 0 24px 55px -40px rgba(4, 6, 20, 0.9);
	}

	:global(.dark) .clock-card:hover {
		border-color: rgba(168, 85, 247, 0.45);
		box-shadow: 0 28px 60px -42px rgba(168, 85, 247, 0.7);
	}

	:global(.dark) .clock-card p {
		color: rgba(203, 213, 225, 0.75);
	}

	:global(.dark) .clock-card .date {
		color: rgba(148, 163, 184, 0.75);
	}

	:global(.dark) .clock-card .offset {
		color: rgba(168, 85, 247, 0.85);
	}
</style>
