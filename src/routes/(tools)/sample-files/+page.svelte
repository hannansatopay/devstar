<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import { filesTypes } from './file-types.js';
	import { Label, Input, Range, Select } from 'flowbite-svelte';
	import { Radio } from 'flowbite-svelte'
	import { Checkbox } from 'flowbite-svelte'

	export let data;

	let type;
	let format;
	let size;
	let options = [];

	function getLinkByDetails(details) {
		const foundOption = filesTypes[type][format].options.find(option => option.details === details);
		return foundOption ? foundOption.link : null;
	}

	function onChangeType() {
		setTimeout(() => {
			format = Object.keys(filesTypes[type])[0];
			onChangeFormat();
		}, 10);
	}

	function onChangeFormat() {
		setTimeout(() => {
			options = filesTypes[type][format].options;
			size = options[0].details;
		}, 10);
	}
	onChangeFormat();
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card gap-12 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg lg:grid lg:grid-cols-2">
			<div class="p-8 h-full">
				<Label>File type</Label>
				<select on:change={onChangeType} bind:value={type} class="text-lowercase capitalize bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
					{#each Object.keys(filesTypes) as type}
						<option>{type}</option>
					{/each}
				</select>

				{#if type}
					<Label class="mt-3">File format</Label>
					<select on:change={onChangeFormat} bind:value={format} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
						{#each Object.keys(filesTypes[type]) as format}
							<option>{format}</option>
						{/each}
					</select>
				{/if}
			</div>
			<div class="p-8 h-full">
				{#if type && format && options}
					<h4 class="mb-4 text-2xl font-medium text-gray-900 dark:text-white">
						{filesTypes[type][format]?.full}
					</h4>
					<p class="mb-4 text-gray-700 dark:text-white">
						{filesTypes[type][format]?.details}
					</p>
					<Label>File Size</Label>
					<select bind:value={size} class="mb-5 text-lowercase capitalize bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
						{#each options as sample}
							<option>{sample.details}</option>
						{/each}
					</select>
					{#if size}
						<a href="/samples/{getLinkByDetails(size)}" download class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Download</a>
					{/if}
				{/if}
			</div>
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
</style>
