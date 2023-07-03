<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Label, Input, Range } from 'flowbite-svelte';
	import { Radio } from 'flowbite-svelte'
	import { Checkbox } from 'flowbite-svelte'
	import { MultiSelect, Select } from 'flowbite-svelte'
	import Tags from "svelte-tags-input";

	export let data;

	let selected = [{value:"us", name: "United States"}];
	let countries = [
		{value:"us", name: "United States"},
		{value:"ca", name: "Canada"},
		{value:"fr", name: "France"},
		{value:"jp", name: "Japan"},
		{value:"en", name: "England"},
	];

	let sitemap:any = null;

	let tags = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "American Samoa",
    "Andorra",
    "Angola",
    "Anguilla",
    "Antarctica",
    "Antigua and Barbuda",
    "Argentina"
	];

	function copy(e: any) {
		// e.target.innerText = 'Copied';
		// const element = document.createElement('textarea');
		// element.value = password;
		// document.body.appendChild(element);
		// element.select();
		// document.execCommand('copy');
		// document.body.removeChild(element);
		// setTimeout(()=>{
		// 	e.target.innerText = 'Copy';
		// }, 1000);
	}

</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div
			class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 rounded-lg"
		>
		<div class="p-8">
			<Label>Crawl Delay</Label>
			<select class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
				<option value="" selected>Default - No Delay</option>
				<option value="5">5 seconds</option>
				<option value="10">10 seconds</option>
				<option value="20">20 seconds</option>
				<option value="60">60 seconds</option>
				<option value="120">120 seconds</option>
			</select>

			<Label>Sitemap (Optional)</Label>
			<Input type="text" placeholder="http://example.com/sitemap.xml" bind:value={sitemap} />

			<Label>Search Robots (Allowed)</Label>
			<MultiSelect items={countries} bind:value={selected} highlighted/>

			<Label>Restricted Directories</Label>
			<Tags bind:tags={tags} class="relative !min-h-[55px] p-2 text-gray-900 bg-gray-50 border border-gray-300 flex items-center rounded-lg gap-2 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:border-2 dark:focus:border-2 focus:border-primary-500 focus:ring-primary-500 dark:focus:border-primary-500 dark:focus:ring-primary-500"/>
		</div>
		<div class="p-8 h-full flex rounded-lg relative justify-center items-center">
			<div
				class="bg-green-100 dark:bg-green-200 text-green-700 dark:text-green-800 rounded-lg py-1 px-2 text-sm font-medium absolute top-4 right-4 cursor-pointer"
				on:click={copy}
			>
				Copy
			</div>
		</div>
		</div>
	</div>
</section>

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<h2
			class="mb-4 text-2xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white"
		>
			How does it work?
		</h2>
		<p class="mb-4 text-gray-500 dark:text-gray-400">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
			labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
			voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
			non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		</p>
	</div>
</section>

<style>
	.box {
		border-radius: 20px;
	}

	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
</style>
