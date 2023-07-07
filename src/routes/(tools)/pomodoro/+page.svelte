<script lang="ts">
	import Intro from '$lib/Intro.svelte';

	export let data;

	// start
	const minutesToSeconds = (minutes: number) => minutes * 60;
	const secondsToMinutes = (seconds: number) => Math.floor(seconds / 60);

	let pomodoroTime = minutesToSeconds(25);
	let interval: any;
	let start = false;
	let currentTab = 'pomodoro';

	const padWithZeroes = (number: number) => number.toString().padStart(2, '0');

	// for template in MM:SS
	function formatTime(timeInSeconds: number) {
		const minutes = secondsToMinutes(timeInSeconds);
		const remainingSeconds = timeInSeconds % 60;
		return `${padWithZeroes(minutes)}:${padWithZeroes(remainingSeconds)}`;
	}

	// update:when pomodoro counts down arrive to 0 we use updated func
	function startPomodoro() {
		start = true;
		interval = setInterval(() => {
			if (pomodoroTime == 0) {
				clearInterval(interval);
			}
			pomodoroTime = pomodoroTime - 1;
		}, 1000);
	}

	function pause() {
		clearInterval(interval);
		start = false;
	}

	function tab(tab: string) {
		currentTab = tab;
		if (tab == 'pomodoro') {
			pomodoroTime = minutesToSeconds(25);
		} else if (tab == 'shortBreak') {
			pomodoroTime = minutesToSeconds(5);
		} else if (tab == 'longBreak') {
			pomodoroTime = minutesToSeconds(15);
		}
		pause();
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section>
	<div class="bg-[#323A49] md:w-1/3 text-center p-4 rounded-lg mx-auto">
		<ul class="flex justify-center text-xl">
			<li class:underline={currentTab === 'pomodoro'} on:click={() => tab('pomodoro')} class="p-3 cursor-pointer underline-offset-8 text-white font-medium">Pomodoro</li>
			<li class:underline={currentTab === 'shortBreak'} on:click={() => tab('shortBreak')} class="p-3 cursor-pointer underline-offset-8 text-white font-medium">
				Short Break
			</li>
			<li class:underline={currentTab === 'longBreak'} on:click={() => tab('longBreak')} class="p-3 cursor-pointer underline-offset-8 text-white font-medium">
				Long Break
			</li>
		</ul>
		<p class="text-white text-8xl my-6">{formatTime(pomodoroTime)}</p>
		<footer>
			{#if start == false}
				<button
					on:click={startPomodoro}
					type="button"
					class="px-5 py-3 text-base my-2 font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
					>Start</button
				>
			{:else}
				<button
					on:click={pause}
					type="button"
					class="px-5 py-3 text-base my-2 font-medium text-white focus:outline-none rounded-lg border border-white focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800"
					>Pause</button
				>
			{/if}
		</footer>
	</div>
</section>