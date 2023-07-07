<script lang="ts">
	import { Input, Select } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import { conversionRates } from './conversion.js';

	export let data;

	let inputValue = 1;
	let selectedCategory = 'Area';
	let fromUnit = 'square-kilometer';
	let toUnit = 'square-meters';
	let result = 0;

	function formatNumber(number) {
		if (Number.isInteger(number)) {
			return number;
		} else if (number % 1 !== 0) {
			const formattedNumber = number.toFixed(4);
			const trimmedNumber = formattedNumber.replace(/\.?0+$/, ''); // Remove trailing zeros
			return trimmedNumber;
		} else {
			return number;
		}
	}

	function convertValueForward() {
		setTimeout(() => {
			if (conversionRates.hasOwnProperty(selectedCategory)) {
				// Check if the fromUnit and toUnit exist in the category
				if (conversionRates[selectedCategory].hasOwnProperty(fromUnit) && conversionRates[selectedCategory].hasOwnProperty(toUnit)) {
					// Calculate the conversion ratio
					const ratio = conversionRates[selectedCategory][fromUnit] / conversionRates[selectedCategory][toUnit];

					// Perform the conversion
					const convertedValue = inputValue * ratio;

					// Return the converted value
					result = formatNumber(convertedValue);
				} else {
					// Invalid fromUnit or toUnit
					throw new Error("Invalid source or target unit.");
				}
			} else {
				// Invalid category
				throw new Error("Invalid category.");
			}
		}, 10);
	}
	convertValueForward();

	function convertValueBackward() {
		if (conversionRates.hasOwnProperty(selectedCategory)) {
			// Check if the fromUnit and toUnit exist in the category
			if (conversionRates[selectedCategory].hasOwnProperty(fromUnit) && conversionRates[selectedCategory].hasOwnProperty(toUnit)) {
				// Calculate the conversion ratio
				const ratio = conversionRates[selectedCategory][toUnit] / conversionRates[selectedCategory][fromUnit];

				// Perform the conversion
				const convertedValue = result * ratio;

				// Return the converted value
				inputValue = formatNumber(convertedValue);
			} else {
				// Invalid fromUnit or toUnit
				throw new Error("Invalid source or target unit.");
			}
		} else {
			// Invalid category
			throw new Error("Invalid category.");
		}
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
			<select bind:value={selectedCategory} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
				{#each Object.keys(conversionRates) as category}
					<option value={category}>{category}</option>
				{/each}
			</select>
			<div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<Input type="number" class="rounded-none border-0" bind:value={inputValue} on:input={convertValueForward}/>
					<select on:change={convertValueForward} bind:value={fromUnit} class="lowercase capitalize bg-gray-50 text-gray-900 text-sm border-0 border-t-2 border-white focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
						{#each Object.keys(conversionRates[selectedCategory]) as item}
							<option value={item}>{item.replace(/-/g, ' ')}</option>
						{/each}
					</select>
				</div>
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<Input type="number" class="rounded-none border-0" bind:value={result} on:input={convertValueBackward}/>
					<select on:change={convertValueForward} bind:value={toUnit} class="lowercase capitalize bg-gray-50 text-gray-900 text-sm border-0 border-t-2 border-white focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
						{#each Object.keys(conversionRates[selectedCategory]) as item}
							<option value={item} disabled={fromUnit == item}>{item.replace(/-/g, ' ')}</option>
						{/each}
					</select>
				</div>
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
