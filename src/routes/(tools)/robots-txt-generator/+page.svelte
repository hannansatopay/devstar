<script lang="ts">
	import { Label, Input, Checkbox, Helper } from 'flowbite-svelte';
	import Tags from "svelte-tags-input";
	import Intro from '$lib/Intro.svelte';
	import Copy from '$lib/Copy.svelte';

	export let data;

	let delay: string = '';
	let sitemap = '';
	const searchRobots = {
		Googlebot: "Google",
		"Googlebot-Image": "Google Image",
		"Googlebot-Mobile": "Google Mobile",
		msnbot: "MSN Search",
		Slurp: "Yahoo",
		"Yahoo-MMCrawler": "Yahoo MM",
		"Yahoo-Blogs": "Yahoo Blogs",
		Teoma: "Ask/Teoma",
		Gigabot: "GigaBlast",
		"DMOZ Checker": "DMOZ Checker",
		Nutch: "Nutch",
		ia_archiver: "Alexa/Wayback"
	};
	let allowedRobots = [];
	let otherRobots = true;
	let directories = [];

	let generatedRobotsTxt = '';

	function generateRobotsTxt(delay, sitemap, allowedRobots, otherRobots, directories) {
		let robotsTxt = '';

		if (delay) {
			robotsTxt += `Crawl-delay: ${delay}\n`;
		}

		if (sitemap) {
			robotsTxt += `Sitemap: ${sitemap}\n`;
		}

		const disallowed = [];

		for (const robotKey in searchRobots) {
			if (!allowedRobots.includes(robotKey)) {
				disallowed.push(robotKey);
			}
		}

		if (!otherRobots) {
			allowedRobots.forEach(robot => {
				robotsTxt += `User-agent: ${robot}\n`;
				robotsTxt += 'Disallow:\n';
			});
		}

		if (disallowed.length) {
			disallowed.forEach(robot => {
				robotsTxt += `User-agent: ${robot}\n`;
				robotsTxt += 'Disallow: /\n';
			});
		}

		robotsTxt += otherRobots ? 'User-agent: *\nDisallow: \n' : 'User-agent: *\nDisallow: /\n';

		directories.forEach(directory => {
			robotsTxt += `Disallow: ${directory}\n`;
		});

		generatedRobotsTxt = robotsTxt;
	}

	$: {
		generateRobotsTxt(delay, sitemap, allowedRobots, otherRobots, directories);
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 rounded-lg">
		<div class="p-8">
			<Label>Crawl Delay</Label>
			<select bind:value={delay} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
				<option value="" selected>Default - No Delay</option>
				<option value="5">5 seconds</option>
				<option value="10">10 seconds</option>
				<option value="20">20 seconds</option>
				<option value="60">60 seconds</option>
				<option value="120">120 seconds</option>
			</select>

			<Label class="mt-3">Sitemap (Optional)</Label>
			<Input type="text" placeholder="http://example.com/sitemap.xml" bind:value={sitemap}/>

			<Label class="mt-3">Search Robots (Allowed)</Label>
			{#each Object.entries(searchRobots) as [key, value]}
				<Checkbox inline class="mr-2" bind:group={allowedRobots} value={key} checked>{value}</Checkbox>
			{/each}

			<Label class="mt-3">All other robots</Label>
			<select bind:value={otherRobots} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
				<option value={true}>Allowed</option>
				<option value={false}>Disallowed</option>
			</select>

			<Label class="mt-3">Restricted Directories</Label>
			<Helper class="text-sm mb-2">The path is relative to root and must contain a trailing slash "/"</Helper>
			<Tags bind:tags={directories} onlyUnique={true} allowPaste={true}/>
		</div>
		<div class="p-8 h-full flex rounded-lg relative justify-center items-center bg-gray-100">
			<Copy text={generatedRobotsTxt}/>
			<textarea value={generatedRobotsTxt} readonly class="custom-scrollbar focus:outline-0 focus:shadow-none block p-2.5 bg-transparent resize-none w-full h-full text-sm text-gray-900 border-0"/>
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