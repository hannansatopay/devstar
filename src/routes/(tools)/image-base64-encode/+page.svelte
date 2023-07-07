<script lang="ts">
	import { Label, Textarea } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import Copy from '$lib/Copy.svelte';
  	
	export let data;

	let fileInput;
	let string = '';

	function handleFileInputChange(event) {
		fileToBase64(event.target.files[0]).then(base64String => {
			string = base64String;
		}).catch(error => {
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
		<div class="card gap-12 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg p-8">
			<Label for="textarea" class="mb-2">Base64 Encoded String</Label>
			<div class="relative">
				<Textarea bind:value={string} id="textarea" rows="4" class="h-full max-h-96 resize-none overflow-x-hidden" readonly/>
				{#if string}
					<Copy text={string}/>
				{/if}
			</div>
			<button on:click={()=>fileInput.click()} type="button" class="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Browse image</button>
			<input type="file" class="hidden" accept="image/*" bind:this={fileInput} on:change={handleFileInputChange}>				
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
