<script lang="ts">
	import { Input } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
  
	// Define variables for rent calculation
	let rentAmount = 1000;
	let numberOfMonths = 12;
	let numberOfPersons = 1;
	let result = 0;
	let errorMessage = '';
  
	function calculateRent() {
	  if (rentAmount < 0) {
		errorMessage = 'Monthly Rent Amount must be positive.';
		return; // Don't calculate if the amount is negative
	  }
  
	  errorMessage = ''; // Clear error message if no error
  
	  // Calculate the total rent
	  result = rentAmount * numberOfMonths * numberOfPersons;
	}
  
	// Validate the number of persons input
	function validatePersons() {
	  if (numberOfPersons < 1) {
		numberOfPersons = 1; // Ensure a minimum of 1 person
	  }
	}
  
	// Validate the number of months input
	function validateMonths() {
	  if (numberOfMonths < 1) {
		numberOfMonths = 1; // Ensure a minimum of 1 month
	  } else if (numberOfMonths > 12) {
		numberOfMonths = 12; // Limit to a maximum of 12 months
	  }
	}
  </script>
  
  <Intro heading="Rent Calculator" description="Calculate your yearly rent expense based on the number of months and persons (Max 12 months)" />
  
  <section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
	  <div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
		<div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
		  <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
			<Input type="number" class="rounded-none border-0" bind:value={rentAmount} />
			<label for="rentAmount" class="text-gray-900 text-sm">Monthly Rent Amount</label>
		  </div>
		  <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
			<Input type="number" class="rounded-none border-0" bind:value={numberOfMonths} on:input={validateMonths} />
			<label for="numberOfMonths" class="text-gray-900 text-sm">Number of Months (Max 12)</label>
		  </div>
		  <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
			<Input type="number" class="rounded-none border-0" bind:value={numberOfPersons} on:input={validatePersons} />
			<label for="numberOfPersons" class="text-gray-900 text-sm">Number of Persons (Min 1)</label>
		  </div>
		</div>
		<button on:click={calculateRent} class="mt-3 bg-blue-500 hover-bg-blue-600 text-white py-2 px-4 rounded-md">
		  Calculate Rent
		</button>
		{#if errorMessage}
		  <div class="mt-3 text-red-500 text-lg">{errorMessage}</div>
		{/if}
		<div class="mt-3">
		  <p class="text-gray-900 text-lg font-semibold">Total Rent for {numberOfMonths} Months and {numberOfPersons} Persons:</p>
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
  