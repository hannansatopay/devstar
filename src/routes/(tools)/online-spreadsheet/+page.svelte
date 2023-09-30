<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import { Button, GradientButton } from 'flowbite-svelte';
	

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
	<div class="flex justify-center items-center"> <!--Two buttons added from flowbite-svelte-->
		<Button size="xl" outline color="blue" class="m-6">Open New Spreadsheet<br/>(.csv)</Button>
	    <GradientButton size="xl" color="blue" class="m-6">Create New Spreadsheet<br/>(.csv)</GradientButton>
	</div>
</section>
