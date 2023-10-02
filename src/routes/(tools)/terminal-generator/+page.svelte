<script lang="ts">
	// import Intro from '$lib/Intro.svelte';
	import { Label, Input, Range, Radio, Checkbox } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	export let data;

	let innerWidth: any = null;
	let innerHeight: any = null;

	onMount(() => {
		innerWidth = window.innerWidth;
		innerHeight = window.innerHeight;
	});
</script>

<!-- <Intro heading={data.meta.title} description={data.meta.description} /> -->
<!--or-->
<section class="bg-gray-200 dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:px-12">
		<h1
			class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white"
		>
			Terminal Generator
		</h1>
		<p class="text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
			A dynamic tool designed to enhance the appearance of your source code in terminal
			environments. It leverages a wide array of customizable terminal themes to breathe fresh
			aesthetics into your code, making reading and debugging an enjoyable experience. Whether you
			desire a minimalist look, neon retro, or something entirely unique, it's flexibility ensures
			your terminal mirrors your style.
		</p>
	</div>
</section>

<svelte:window bind:innerWidth bind:innerHeight />

<section class="bg-gray-200 dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
		<div class="block max-w-lg mx-auto w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
			<h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">Functions </h5>	
			<p class="font-normal text-gray-700 dark:text-gray-400">1st</p>
		</div>
	</div>
</section>
