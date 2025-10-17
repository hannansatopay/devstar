<script lang="ts">
	export let hour = 0;
	export let minute = 0;
	export let second = 0;

	const minuteMarks = Array.from({ length: 60 });

	$: hourDeg = ((hour % 12) + minute / 60 + second / 3600) * 30;
	$: minuteDeg = (minute + second / 60) * 6;
	$: secondDeg = second * 6;
</script>

<div class="clock">
	<div class="face">
		<ul class="minutes">
			{#each minuteMarks as _, index}
				<li style={`transform: rotate(${index * 6}deg);`} class:strong={index % 5 === 0} />
			{/each}
		</ul>

		<div class="hands">
			<div class="hand hour" style={`transform: rotate(${hourDeg}deg);`} />
			<div class="hand minute" style={`transform: rotate(${minuteDeg}deg);`} />
			<div class="hand second" style={`transform: rotate(${secondDeg}deg);`} />
		</div>
	</div>
</div>

<style>
	.clock {
		width: min(160px, 42vw);
		height: min(160px, 42vw);
		margin: 0 auto;
	}

	.face {
		position: relative;
		width: 100%;
		height: 100%;
		border-radius: 50%;
		background: radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.95), rgba(241, 245, 249, 0.9));
		border: 6px solid rgba(148, 163, 184, 0.6);
		box-shadow:
			inset 0 0 18px rgba(15, 23, 42, 0.18),
			0 18px 26px -20px rgba(15, 23, 42, 0.6);
	}

	.minutes,
	.minutes li {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.minutes {
		position: absolute;
		inset: 0;
	}

	.minutes li {
		position: absolute;
		top: 6px;
		left: 50%;
		width: 2px;
		height: 12px;
		background: rgba(148, 163, 184, 0.6);
		transform-origin: center 74px;
	}

	.minutes li.strong {
		width: 3px;
		height: 18px;
		background: rgba(79, 70, 229, 0.8);
	}

	.hands {
		position: absolute;
		inset: 0;
		display: grid;
		place-items: center;
	}

	.hand {
		position: absolute;
		bottom: 50%;
		width: 4px;
		transform-origin: bottom center;
		border-radius: 999px;
		background: rgba(30, 41, 59, 0.92);
		box-shadow: 0 10px 20px -16px rgba(15, 23, 42, 0.85);
	}

	.hand.hour {
		height: 42px;
		background: rgba(30, 41, 59, 0.95);
	}

	.hand.minute {
		height: 60px;
		width: 3px;
		background: rgba(51, 65, 85, 0.9);
	}

	.hand.second {
		height: 66px;
		width: 2px;
		background: rgba(236, 72, 153, 0.9);
		box-shadow: 0 0 8px rgba(236, 72, 153, 0.6);
	}

	.center {
		position: absolute;
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: rgba(236, 72, 153, 0.95);
		border: 3px solid rgba(248, 250, 252, 0.95);
		box-shadow: 0 0 12px rgba(236, 72, 153, 0.35);
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	:global(.dark) .face {
		background: radial-gradient(circle at 30% 30%, rgba(30, 41, 59, 0.92), rgba(15, 23, 42, 0.92));
		border-color: rgba(99, 102, 241, 0.5);
		box-shadow:
			inset 0 0 22px rgba(8, 11, 24, 0.65),
			0 22px 35px -24px rgba(2, 6, 23, 0.9);
	}

	:global(.dark) .minutes li {
		background: rgba(99, 102, 241, 0.45);
	}

	:global(.dark) .minutes li.strong {
		background: rgba(129, 140, 248, 0.95);
		box-shadow: 0 0 10px rgba(129, 140, 248, 0.45);
	}

	:global(.dark) .hand {
		background: rgba(226, 232, 240, 0.95);
		box-shadow: 0 12px 24px -18px rgba(15, 23, 42, 0.75);
	}

	:global(.dark) .hand.second {
		background: rgba(249, 115, 22, 0.95);
		box-shadow: 0 0 14px rgba(249, 115, 22, 0.6);
	}

	:global(.dark) .center {
		background: rgba(249, 115, 22, 0.95);
		border-color: rgba(15, 23, 42, 0.9);
		box-shadow: 0 0 12px rgba(249, 115, 22, 0.65);
	}
</style>
