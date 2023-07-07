<script lang="ts">
	import { Label, Textarea, Button } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';

	export let data;

	let string = '';

	function download() {
		const link = document.createElement('a');

		const mimeType = string.split(';')[0].split(':')[1];
		const extension = mimeType.split('/')[1];

		const imageUrl = b64toBlob(string);
		link.href = imageUrl;
		link.download = `image.${extension}`;

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(imageUrl);
	}

	// Helper function to convert Base64 to Blob
	function b64toBlob(b64Data) {
		b64Data = b64Data.split(',')[1];
		const mimeType = b64Data.split(';')[0].split(':')[1];
		const byteCharacters = atob(b64Data);
		const byteArrays = [];

		for (let offset = 0; offset < byteCharacters.length; offset += 512) {
			const slice = byteCharacters.slice(offset, offset + 512);

			const byteNumbers = new Array(slice.length);
			for (let i = 0; i < slice.length; i++) {
			byteNumbers[i] = slice.charCodeAt(i);
			}

			const byteArray = new Uint8Array(byteNumbers);
			byteArrays.push(byteArray);
		}

		return URL.createObjectURL(new Blob(byteArrays, { type: mimeType }));
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="lg:grid lg:grid-cols-2 gap-8 card items-center mx-auto max-w-screen-xl rounded-lg">
		<div class="p-8 h-full flex flex-col">
			<Label for="textarea" class="mb-2">Base64 String</Label>
			<Textarea id="textarea" rows="4" bind:value={string} class="h-full max-h-96 resize-none"/>
		</div>
		<div class="p-8 relative bg-gray-100">
			{#if string}
				<img src={b64toBlob(string)} class="w-full">
				<Button color="green" on:click={download} class="absolute top-4 right-4">Download</Button>
			{:else}
				<div role="status" class="space-y-8 animate-pulse md:space-y-0 md:space-x-8 md:flex md:items-center">
					<div class="flex justify-center items-center w-full h-64 bg-gray-300 rounded dark:bg-gray-700"><svg width="48" height="48" class="text-gray-200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 640 512"><path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z"></path></svg></div>
				</div>
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