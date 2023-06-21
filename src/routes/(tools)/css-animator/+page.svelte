<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Label, Input, Range } from 'flowbite-svelte';

	export let data;

	// defaults
	let duration = 0.4;
	let iteration = 1;

	let animation = '';

	function calculateAnimation() {
		animation = `${duration}s linear 0s ${iteration} normal both running rotate-90-cw`;
	}
</script>

<svelte:head>
	<style>
		@keyframes rotate-90-cw {
			0% {
				-webkit-transform: rotate(0);
				transform: rotate(0);
			}
			100% {
				-webkit-transform: rotate(90deg);
				transform: rotate(90deg);
			}
		}
	</style>
</svelte:head>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div
			class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg"
		>
			<div class="p-8">
				<Label>Duration</Label>
				<Input type="number" step="0.1" bind:value={duration} on:change={calculateAnimation} />

				<Label>Iteration</Label>
				<Input type="number" bind:value={iteration} on:change={calculateAnimation} />
			</div>
			<div class="p-8 h-full flex rounded-lg relative bg-white">
				{#key animation}
					<div
						class="box m-auto bg-black"
						style="width: 150px; height: 150px; border-radius: 4px; animation: width: 150px; height: 150px; border-radius: 4px; animation: {animation};"
					/>
				{/key}
			</div>
		</div>
	</div>
</section>

<section class="bg-white dark:bg-gray-900">
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
	.box {
		border-radius: 20px;
	}

	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
</style>