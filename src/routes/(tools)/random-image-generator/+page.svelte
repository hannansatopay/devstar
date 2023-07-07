<script lang="ts">
	import { Card } from 'flowbite-svelte';

	import Intro from '$lib/Intro.svelte';

	export let data;

	let images = [
		`https://picsum.photos/1080?q=${Math.random()}`,
		`https://picsum.photos/1080?q=${Math.random()}`,
		`https://picsum.photos/1080?q=${Math.random()}`,
		`https://picsum.photos/1080?q=${Math.random()}`
	];

	function refresh() {
		images = [
			`https://picsum.photos/1080?q=${Math.random()}`,
			`https://picsum.photos/1080?q=${Math.random()}`,
			`https://picsum.photos/1080?q=${Math.random()}`,
			`https://picsum.photos/1080?q=${Math.random()}`
		];
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12 text-center">
		<div class="md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-2 md:space-y-0">
			{#each images as image}
				<Card class="items-center text-center sm:p-0 overflow-hidden">
					<img src={image} class="w-full" alt="Random Picture">
				</Card>
			{/each}
		</div>
		<button on:click={refresh} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 mt-4">Refresh</button>
	</div>
</section>