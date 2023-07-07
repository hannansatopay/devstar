<script lang="ts">
	import { onMount } from 'svelte';
	import { Spinner } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
  	
	export let data;
	let advice: string | null = null;

	async function fetchData() {
    	advice = null;
		const response = await fetch('https://api.adviceslip.com/advice');
		const result = await response.json();
		advice = result['slip']['advice'];
	}

	onMount(async () => {
		fetchData();
	});
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
    <div class="bg-[#323A49] min-h-[16rem] md:w-2/3 rounded-lg mx-auto flex flex-col justify-center items-center text-center p-2">
      {#if !advice}
        <Spinner color="white" />
      {:else}
        <h1 class="text-white text-3xl p-4">"{advice}"</h1>
        <button on:click={fetchData} type="button" class="py-2.5 px-5 my-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700">Shuffle</button>
      {/if}
    </div>
	</div>
</section>