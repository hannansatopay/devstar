<script lang="ts">
	import { Input } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';

	// Define variables for rent calculation
	let rentAmount = 1000;
	let numberOfMonths = 12;
	let result = 0;

	function calculateRent() {
		// Calculate the total rent
		result = rentAmount * numberOfMonths;
	}
</script>

<Intro heading="Rent Calculator" description="Calculate your yearly rent expense" />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
			<div
				class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden"
			>
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<Input
						type="number"
						class="rounded-none border-0"
						bind:value={rentAmount}
						on:input={calculateRent}
					/>
					<label for="rentAmount" class="text-gray-900 text-sm">Monthly Rent Amount</label>
				</div>
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<Input
						type="number"
						class="rounded-none border-0"
						bind:value={numberOfMonths}
						on:input={calculateRent}
					/>
					<label for="numberOfMonths" class="text-gray-900 text-sm">Number of Months</label>
				</div>
			</div>
			<div class="mt-3">
				<p class="text-gray-900 text-lg font-semibold">Total Rent for {numberOfMonths} Months:</p>
				<p class="text-gray-900 text-3xl font-bold">${result}</p>
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
