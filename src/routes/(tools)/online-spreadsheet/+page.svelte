<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import { Button, GradientButton } from 'flowbite-svelte';
	// import { EnvelopeSolid } from 'flowbite-svelte-icons';
	import { Label, Input, Range, Radio, Checkbox } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	export let data;

	// Might need these for tabular view
	let innerWidth: any = null; // defining this solve the of svelte:window tag  
	let innerHeight: any = null; // and now all other elements are visible
	let screenWidth: any = null;
	let screenHeight: any = null;
	
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<svelte:window bind:innerWidth bind:innerHeight />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
		<div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-12 md:space-y-0">
			//Code goes here
			<!-- <div class="flex flex-wrap gap-2"> -->
			<!-- <Button size="xl" outline color="green">Open New Spreadsheet (.csv)</Button> -->
			<Button size="xl" outline color="blue">Upload Spreadsheet (.csv)</Button>
			<GradientButton size="xl" color="blue">Create New Spreadsheet (.csv)</GradientButton>
			<!-- <Button size="xl"><EnvelopeSolid class="w-4 h-4 mr-2" />Create New Spreadsheet (.csv)</Button> -->
			<!-- </div> -->
		</div>
	</div>
</section>
