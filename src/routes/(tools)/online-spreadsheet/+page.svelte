<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import { Button, GradientButton } from 'flowbite-svelte';
	import { Fileupload, Label, Helper } from 'flowbite-svelte';
	import CsvEditor from './CsvEditor.svelte';

	export let data;
	

	// Might need these for tabular view
	let innerWidth: any = null; // defining this solve the error of svelte:window tag  
	let innerHeight: any = null; // and now all other elements are visible
	let screenWidth: any = null;
	let screenHeight: any = null;
	
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<svelte:window bind:innerWidth bind:innerHeight />

<section class="bg-white dark:bg-gray-900">
	<div class="flex justify-center items-center">
		<Button size="xl" color="blue" class="m-6">Create New Spreadsheet</Button>
	</div>

	<h1 class="flex justify-center text-gray-500 dark:text-gray-400 mt-2 mb-6">OR</h1>

	<div class="flex flex-wrap justify-center">
		<!-- <Label for="with_helper" class="pb-2 ml-10">Upload Spreadsheet</Label>
		<Fileupload id="with_helper" class="mb-2 ml-10 mr-10" accept=".csv"/>
		<Helper class="ml-10 mb-10">CSV Files Only</Helper> -->
		<CsvEditor />
	</div>
	
	
</section>