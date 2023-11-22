<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Label, Input, Range } from 'flowbite-svelte';
	import { Radio } from 'flowbite-svelte'

	export let data;

	import { Button, Dropdown, DropdownItem, Chevron, Checkbox, Search } from 'flowbite-svelte'

	import { validate, getCurrencies } from 'multicoin-address-validator';

	let coins = getCurrencies().map(coin=>coin.name);
	let filteredCoins = coins;
	let selectedCoin:any = null;
	let searchQuery = '';

	let address:any = null;

	function search() {
		filteredCoins = coins.filter(coin => coin.toLowerCase().includes(searchQuery.toLowerCase()));
	}

	let valid:any = null;

	function validateAddress() {
		valid = validate(address, selectedCoin);
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card gap-16 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
			
				<div class="flex">
					<Button class="flex-shrink-0 z-10 inline-flex items-center py-2.5 px-4 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white rounded-l-lg hover:bg-gray-200 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
						<Chevron>{selectedCoin||'Select coin'}</Chevron>
					</Button>
					<Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
						<div slot="header" class="p-3">
						  <Search size="md" bind:value={searchQuery} on:input={search}/>
						</div>
						{#each filteredCoins as coin}
							<li class="rounded p-2 hover:bg-gray-100 dark:hover:bg-gray-600">
							<Radio bind:group={selectedCoin} name="coin" value={coin}>{coin}</Radio>
							</li>
						{/each}
					  </Dropdown>
					<div class="relative w-full">
						<input type="search" bind:value={address} class="block p-2.5 w-full z-20 text-sm text-gray-900 bg-gray-50 rounded-r-lg border-l-gray-100 border-l-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500" placeholder="Enter address" required>
						<button on:click={validateAddress} type="button" class="absolute top-0 right-0 p-2.5 text-sm font-medium text-white bg-blue-700 rounded-r-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800" disabled={!address || !selectedCoin}>Validate</button>
					</div>
				</div>
		</div>
		{#if valid == true}
			<p class="mt-2 text-sm text-green-600 dark:text-green-500">The address is valid.</p>
		{/if}
		{#if valid == false}
			<p class="mt-2 text-sm text-red-600 dark:text-red-500">The address is invalid.</p>
		{/if}
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
