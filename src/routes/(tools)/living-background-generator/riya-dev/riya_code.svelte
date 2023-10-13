<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import { Label, Input, Range, Radio, Checkbox } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { tools } from '../../../tools';
	import Copy from '$lib/Copy.svelte';

    const title = tools['living-background-generator'].name;
	const description = tools['living-background-generator'].description;

	export let data../living-background-generator/$types.js;
	let innerWidth: any = null;
	let innerHeight: any = null;
	let screenWidth: any = null;
	let screenHeight: any = null;
	let css = '';

	onMount(() => {
		screenWidth = screen.width;
		screenHeight = screen.height;
	});
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<svelte:window bind:innerWidth bind:innerHeight />

<section class="bg-white dark:bg-gray-900">
	<br />
	<hr />

	<div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-12 items-center content-center">
		<div class="sm:grid sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 justify-items-center">
			<div class="w-2 m-2 p-6 bg-purple-800 border border-gray-200" />
			<div class="w-2 m-2 p-6 bg-pink-600 border border-gray-200" />
			<div class="w-2 m-2 p-6 bg-orange-500 border border-gray-200" />
			<div class="w-2 m-2 p-6 bg-yellow-300 border border-gray-200" />
		</div>

		<br />
		<div
			class="card gap-16 m-4 items-center mx-auto max-w-screen-xl md:grid md:grid-cols-2 overflow-hidden rounded-lg"
		>
			<div class="p-8">
				<Label>Color Palette</Label>
				<br />
				<Label>Color Palette component</Label>
				<br />
				<Label>Add color button</Label>
				<br />
				<Label>Random button</Label>
				<br />
				<Label>Choose the gradient type button</Label>
				<br />
				<Label>Angle</Label>
				<br />
				<Label>Speed</Label>
			</div>
			<div class="p-8 h-full flex rounded-lg relative" />
		</div>
		<br />
		<div
			class="card m-4 items-center mx-auto max-w-screen-xl lg:grid md:max-h-96 overflow-hidden rounded-lg"
		>
			<div class="p-8 box rounded-lg md:max-h-96 relative bg-gray-100"><Copy text={css} /></div>
		</div>
	</div>
</section>

<style>
	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
	.h-full{
		min-height: 300px;
		background: rgb(116,0,211);
background: linear-gradient(90deg, rgba(116,0,211,1) 0%, rgba(171,0,130,1) 33.33%, rgba(213,92,0,1) 66.33%, rgba(255,231,0,1) 100%); 
	}

	.box{
		height: 300px;
	}
</style>
