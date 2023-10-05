<script lang="ts">
	import { Label, Input, Select, Textarea } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import Copy from '$lib/Copy.svelte';

	export let data;

	// Based on your project, you will get 3 options in type
	// if type === 'JSON' --> TEAM JSON PARSER
	// if type === 'HTML' --> TEAM HTML PARSER
	// if type === 'XML' --> TEAM XML PARSER
	let type = 'JSON';
	let types = [
		{ value: 'JSON', name: 'JSON Parser' },
		{ value: 'HTML', name: 'HTML Parser' },
		{ value: 'XML', name: 'XML Parser' }
	];

	let space = 1;

	// This the input you get from textarea
	// MANIPULATE THIS - and text will get disaplyed in same text area
	// as it is binded
	let string = '';
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card gap-16 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
			<div class="p-8 lg:grid lg:grid-cols-2 gap-16">
				<Label>Select Language
					<Select items={types} bind:value={type} />
				</Label>

				<Label>Spaces
					<Input type="number" bind:value={space} min="1" max="10" />
				</Label>
			</div>
			<div class="p-10 relative border-t-2 border-gray-500 text-gray-900 dark:text-white">
				<Label for="textarea" class="mb-2">{type} Code</Label>
				
				<Textarea id="textarea" rows="20" bind:value={string} class="h-full max-h-96 resize-none"/>
				
				<Copy />
				<button type="button" class="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Beautify</button>
			</div>
		</div>
	</div>
</section>

<style>
</style>