<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { Button, Chevron, Dropdown, DropdownItem, Search } from 'flowbite-svelte';
	import { countries } from 'countries-list';

	const dispatch = createEventDispatcher();

	let searchQuery = '';
	const countryArray = Object.entries(countries).map(([code, country]) => ({
		code: code,
		name: country.name,
		extension: country.phone
	}));
	let filteredCountries = countryArray;
	let country = null;
	let dropdownOpen = false;

	function search() {
		// Filter countries based on search query
		searchQuery = searchQuery.toLowerCase();
		filteredCountries = countryArray.filter((country) => {
			return country.name.toLowerCase().includes(searchQuery);
		});
	}

	function selectCountry(c) {
		country = c;
		searchQuery = '';
		dropdownOpen = false;
		dispatch('country', country);
	}
</script>

<Button color="none" class="flex-shrink-0 text-gray-900 bg-gray-100 border border-gray-300 dark:border-gray-700 dark:text-white hover:bg-gray-200 focus:ring-gray-300 dark:bg-gray-600 dark:hover:bg-gray-700 dark:focus:ring-gray-800">
    {#if country}
        <div class="fflag fflag-{country.code} ff-md mr-1"></div> {country.name}
    {:else}
        <Chevron>Select country</Chevron>
    {/if}
</Button>
<Dropdown ulClass="overflow-y-auto h-28 px-3 pb-3 text-sm" bind:open={dropdownOpen}>
    <div slot="header" class="p-3">
        <Search size="md" bind:value={searchQuery} on:input={search} class="rounded-lg border"/>
    </div>
    {#each filteredCountries as country}
        <DropdownItem on:click={()=>selectCountry(country)}><div class="fflag fflag-{country.code} ff-md"></div> {country.name}</DropdownItem>
    {/each}
</Dropdown>