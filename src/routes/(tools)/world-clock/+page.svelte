<script>
	import { onMount } from 'svelte';
	import { timeZoneList } from './locale.js';
	import AnalogClock from './AnalogClock.svelte';

	let timezones = [
		{ city: 'New York', country: 'US', timezone: 'America/New_York' },
		{ city: 'London', country: 'UK', timezone: 'Europe/London' },
		{ city: 'Tokyo', country: 'Japan', timezone: 'Asia/Tokyo' },
		{ city: 'Sydney', country: 'AU', timezone: 'Australia/Sydney' }
	];

	let selectedTimezone = 'Asia/Kolkata';
	let currentTime = '';

	onMount(() => {
		updateClocks();
		setInterval(updateClocks, 1000);
	});

	function updateClocks() {
		const date = new Date().toLocaleTimeString('en-US', { timeZone: selectedTimezone });
		currentTime = date;
	}

	function handleTimezoneChange(event) {
		selectedTimezone = event.target.value;
		updateClocks();
	}
</script>

<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
	<div class="flex flex-col dark:text-white ml-auto">
		<div class="p-4 w-full">
			<div class="flex justify-between items-center mb-4">
				<h1 class="text-4xl font-semibold">{selectedTimezone}</h1>
				<div class="select dark:text-black">
					<select name="locales" id="list" bind:value={selectedTimezone} on:change={handleTimezoneChange} class="p-2 border rounded w-48">
						{#each timeZoneList.sort() as locale}
							<option value={locale}>{locale}</option>
						{/each}
					</select>
				</div>
			</div>
			<p class="show-date text-6xl">{currentTime}</p>
		</div>
		<div class="flex justify-around items-center p-4 mt-4 gap-3">
			{#each timezones as { city, country, timezone }, index}
				<AnalogClock {city} {country} {timezone} />
				{#if index < timezones.length - 1}
					<div class="h-52 border border-l-2 border-gray-500"></div>
				{/if}
			{/each}
		</div>
	</div>
</div>

<style>
	.card {
		text-align: center;
	}
	select {
		max-width: 200px;
	}
</style>