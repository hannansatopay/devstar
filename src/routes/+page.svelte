<script>
	import { Search } from 'flowbite-svelte';
	import { Card } from 'flowbite-svelte';

	export let data;
	let query = '';

	$: results = Object.values(data.tools).filter((tool) => {
		return (tool.name.toLowerCase().includes(query.toLowerCase()) || tool.description.toLowerCase().includes(query.toLowerCase()));
	});
</script>

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:px-12">
		<!-- <a href="#" class="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">
			<span class="text-xs bg-blue-600 rounded-full text-white px-4 py-1.5 mr-3">New</span>
			<span class="text-sm font-medium">Phase-I launched! Explore the story</span>
			<i class="icon-angle-right ml-2" />
		</a> -->
		<h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
			A Comprehensive Developer Toolkit
		</h1>
		<p class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
			Maximize your efficiency and productivity as a developer with our free online developer
			toolkit. Experience the convenience of our user-friendly platform and unlock your full
			potential. Our comprehensive collection of tools has got you covered!
		</p>
		<div class="px-4 mx-auto text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-36">
			<Search bind:value={query} />
		</div>
	</div>
</section><section class="bg-white dark:bg-gray-900">
	<div class="py-4 px-4 mx-auto max-w-screen-xl">
		{#if results.length}
			<div class="grid gap-2 space-y-0 grid-cols-2 lg:grid-cols-4">
				{#each results as tool}
					<Card href={tool.link} class="items-center text-center">
						<i class="icon-{tool.icon} mb-2 text-gray-500 dark:text-gray-400 text-4xl" />
						<h5 class="text-lg font-semibold tracking-tight text-gray-900 dark:text-white">
							{tool.name}
						</h5>
					</Card>
				{/each}
			</div>
		{:else}
			<div class="mx-auto max-w-screen-xl">
				<div class="mx-auto max-w-screen-sm text-center">
					<p class="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
						No Results Found
					</p>
					<p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
						We couldn't find any matching tool
					</p>
					<a href="/contact" class="font-medium text-sm px-5 py-2.5 text-center my-4 text-gray-500 dark:text-gray-400 underline">Request this tool</a>
				</div>
			</div>
		{/if}
	</div>
</section>
