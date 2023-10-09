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

<section class="">
	<div class="">
    <div class=""></div>
	</div>
</section>