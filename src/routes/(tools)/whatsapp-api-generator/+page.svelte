<svelte:head>
	<link rel="stylesheet" type="text/css" href="freakflags.css">
</svelte:head>
<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Radio } from 'flowbite-svelte'

	export let data;

	import { Input, InputAddon, ButtonGroup, Button, Chevron, Dropdown, DropdownItem, Search, Label } from 'flowbite-svelte';
	import { Textarea, Helper } from 'flowbite-svelte';

	import { countries } from 'countries-list';

	let searchQuery = '';

	function search() {
		// filteredCoins = coins.filter(coin => coin.toLowerCase().includes(searchQuery.toLowerCase()));
	}

	const countryArray = Object.entries(countries).map(([code, country]) => ({
		code: code,
		name: country.name,
		extension: country.phone
	}));
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card gap-16 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
			<div class="p-8">
				<Label class="mb-2">Type your WhatsApp phone number</Label>
				<ButtonGroup class="w-full">
					<Button color="none" class="flex-shrink-0 text-gray-900 bg-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white hover:bg-gray-200 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
					  <Chevron>Select country</Chevron>
					</Button>
					<Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
						<div slot="header" class="p-3">
							<Search size="md" bind:value={searchQuery} on:input={search}/>
						</div>
						{#each countryArray as country}
							  <DropdownItem><div class="fflag fflag-{country.code} ff-md"></div> {country.name}</DropdownItem>
						  {/each}
					</Dropdown>
					<Input placeholder="Search" />
				  </ButtonGroup>

				  <Label for="textarea-id" class="mt-4 mb-2">Welcome message (Optional)</Label>
				  <Textarea id="textarea-id" placeholder="Your message" rows="4" name="message"/>
				  <Helper class="text-sm">Automatically add a custom message that pre-fills what your contacts will send, making it easier to start a conversation.</Helper>
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
