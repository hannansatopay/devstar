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

    </div>
	
	</div>
</section>