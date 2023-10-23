<script lang="ts">
	import { Label } from 'flowbite-svelte';

	import Intro from '$lib/Intro.svelte';
	import {fileFormats} from './formats';

	
	let selectedFormat = ''; 
	let inputFile = '', fileName='', extension='', outputFile = '';
	let supportedFormats = fileFormats;

	const getFileFormat = ()=>{
		if(inputFile.length){
			let path = inputFile.split('\\');
			let file = path[path.length-1].split('.');
			fileName = file[0];
			extension = file[1];
	
			for(let format in fileFormats){
				fileFormats[format]['outputFormat'].forEach((ext,key)=>{
					if(extension===ext){
						supportedFormats = fileFormats[format];
						return;
					}
				})
			}
		}else{
			fileName='';
			extension='';
		}
	}

	const downloadFile = async () => {
		const blob = new Blob([inputFile], { type: 'application/octet-stream' });
		const a = document.createElement('a');
		a.href = URL.createObjectURL(blob);
		a.download = fileName + selectedFormat;
		a.style.display = 'none';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
	export let data;
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12 card overflow-hidden rounded-lg">
		<form class="gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-3 " on:submit|preventDefault={convertFormat}>
			<div class="p-8">
				<Label>Input File</Label>
				<div class="flex items-center">
					<input type="file" name="input-file" class="rounded-lg border border-gray-400 dark:border-white dark: bg-white w-full" bind:value={inputFile} on:change={getFileFormat} required/>
				</div>
			</div>
			<div class="p-8">
				<Label>Output Format</Label>
				<div class="flex items-center">
					<select bind:value={selectedFormat} class="rounded-lg border border-gray-400 dark:border-white w-full" required>
					<option value="">Select Output Format</option>
					{#if fileName==='' && extension===''}
						{#each Object.keys(fileFormats) as fileType}
							<option value={fileType} disabled class="text-center font-bold">*******{fileFormats[fileType].name}*******</option>
							{#each fileFormats[fileType].outputFormat as val}
								<option value={val}>{val}</option>
							{/each}
						{/each}
					{:else}
						<option disabled class="text-center font-bold">*******{supportedFormats['name']}*******</option>
						{#each supportedFormats['outputFormat'] as val}
							{#if val !== extension}
								<option value={val}>{val}</option>
							{/if}
						{/each}
					{/if}
					
					</select>
				</div>

			</div>
			<div class="p-8">
				<div class="p-4 flex rounded-lg  items-center justify-center">
					<button type="submit" class="bg-gray-800 px-4 py-2 rounded-lg text-white border border-gray-400 dark:border-white w-24 mt-4 card">Convert</button>
				</div>
			</div>
		</form>

		{#if outputFile!==''}
			<div class="rounded-lg grid grid-cols-1 lg:grid-cols-3  gap-2 lg:gap-16  m-8  overflow-hidden">
				<div class="py-2 px-8 bg-white border border-gray-200 lg:col-span-2 ">{outputFile} This is the file name</div>
				<div class="flex items-center justify-center ">
					<button class="bg-green-700 border text-white p-2 rounded-lg w-24">Preview</button>
					<button class="bg-blue-700 border text-white p-2 rounded-lg w-24 mx-2" on:click={downloadFile}>Download</button>
				</div>
			</div>
		{/if}
	</div>

</section>

<style>
	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}
	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.1) 0 0 0 2px;
	}
</style>