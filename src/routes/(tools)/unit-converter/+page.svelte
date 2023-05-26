<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Label, Input, Range } from 'flowbite-svelte';
	import { Radio } from 'flowbite-svelte'
	import { Checkbox } from 'flowbite-svelte'
	import { Select } from 'flowbite-svelte';

	export let data;

	let type;
	let types = [
		{value:"length", name: "Length"},
		{value:"area", name: "Area"}
	];

	let from;
	let to;
	let metrics = [
		{value:"kilometer", name: "Kilometer"},
		{value:"meter", name: "Meter"},
		{value:"centimeter", name: "Centimeter"}
	];


</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
			<Select items={types} bind:value={type} />
		<div
			class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden"
		>
		<div class="rounded-lg overflow-hidden">
			<Input type="number" class="rounded-none"/>
			<Select items={metrics} bind:value={from} class="rounded-none"/>
		</div>
		<div class="rounded-lg overflow-hidden">
			<Input type="number" class="rounded-none"/>
			<Select items={metrics} bind:value={to} class="rounded-none"/>
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
