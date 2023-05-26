<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Radio } from 'flowbite-svelte'
	import { Checkbox } from 'flowbite-svelte'
	import { Fileupload, Label } from 'flowbite-svelte'
  	let files = [];

	export let data;

	function handleFileInputChange(event) {
    	files = [...files, ...Array.from(event.target.files)];
  	}

	function convertFile(file) {
		fileToBase64(file)
		.then(base64String => {
			// Use the base64 encoded string here
			console.log(base64String);
		})
		.catch(error => {
			// Handle errors here
			console.error(error);
		});
	}

	function fileToBase64(file) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result);
		reader.onerror = error => reject(error);
	});
	}

</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div
			class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg"
		>
		<div class="p-8">
			<Label class="space-y-2 mb-2">
				<span>Upload file</span>
				<input type="file" accept="image/*" multiple on:change={handleFileInputChange}>
			  </Label>
		</div>
		<div class="p-8">
			{#if files}
				<h2>Selected files:</h2>
				{#each Array.from(files) as file}
					<p on:click={()=>convertFile(file)}>{file.name} ({file.size} bytes)</p>
				{/each}
			{/if}
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
