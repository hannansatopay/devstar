<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Label, Input, Range } from 'flowbite-svelte';
	import { Radio } from 'flowbite-svelte';
	import { Checkbox } from 'flowbite-svelte';

	export let data;

	import { Select } from 'flowbite-svelte';

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
		// start = true;
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
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section>
	<!-- starting -->
	<div class="container">
		<!-- <div class="nav">
			<li>Pomodoro</li>
			<li>Short Break</li>
			<li>Long Break</li>
		</div> -->
		<ul>
			<li class:active={currentTab === 'pomodoro'} on:click={() => tab('pomodoro')}>Pomodoro</li>
			<li class:active={currentTab === 'shortBreak'} on:click={() => tab('shortBreak')}>
				Short Break
			</li>
			<li class:active={currentTab === 'longBreak'} on:click={() => tab('longBreak')}>
				Long Break
			</li>
		</ul>
		<div>
			{formatTime(pomodoroTime)}
		</div>
		<footer>
			<!-- we added disable so that it will only switch or able one button at a time -->
			{#if start == false}
				<button on:click={startPomodoro}>Start</button>
			{:else}
				<button on:click={pause}>Pause</button>
			{/if}
		</footer>
	</div>

	<!-- ends -->
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<h2
			class="mb-4 text-2xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white"
		>
			How does it work?
		</h2>
		<p class="mb-4 text-gray-500 dark:text-gray-400">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
			labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
			voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
			non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		</p>
	</div>
</section>

<style>
	button {
		background-color: var(--base);
		border-color: var(--black);
		color: var(--black);
		font-size: 1.5em;
		font-weight: inherit;
		outline: none;
		text-transform: uppercase;
		transition: background-color 0.2s, color 0.2s, border-color 0.2s, opacity 0.2s;
	}

	button:disabled {
		opacity: 0.5;
	}

	button:focus,
	button:not(:disabled):hover {
		background-color: var(--base-light);
	}

	button:not(:disabled):active {
		background-color: var(--base-dark);
	}
	/*  */
	input,
	button,
	select,
	textarea {
		font-family: inherit;
		font-size: 1.5em;
		font-weight: inherit;
		padding: 0.4em;
		margin: 0 0 0.5em 0;
		box-sizing: border-box;
		border: 1px solid #ccc;
		border-radius: 5px;
	}
	:root {
		--black: #333;
		--base: white;
		--base-light: #f4f4f4;
		--base-dark: #ddd;

		--white: white;
		/* --accent: orangered;
 --accent-light: #ff4500d6;
 --accent-dark: #e83f00; */
	}

	/* start css */
	.container {
		/* background-color: #9b9b9b; */
		background-color: #9b9b9b;

		/* background: rgba(255, 255, 255, 0.1); */
		display: grid;
		grid-template-rows: auto auto auto;
		justify-content: center;
		width: 30%;
		padding: 10px 0px 30px;
		text-align: center;
		margin-left: 35%;
		margin-top: 0%;
		border-radius: 30px;
	}
	.container div {
		font-size: 7em;
		padding: 0;
		margin: 10px;
		font-style: var(--base);
		color: white;
	}

	ul {
		font-size: 20px;
		list-style-type: none;
		margin: 0;
		padding: 0;
		overflow: hidden;
	}

	li {
		float: left;
	}

	ul li {
		display: block;
		color: white;
		text-align: center;
		padding: 14px 16px;
		text-decoration: none;
		font-weight: 500;
	}
	li.active {
		color: rgb(89, 89, 89);
		display: block;
		/* text-decoration: underline; */
	}
	li {
		display: block;
		color: white;
		padding: 14px 16px;
		text-decoration: none;
	}
	/* li:hover:not(.active) {
    background-color: #ecdfdf;
} */


</style>
