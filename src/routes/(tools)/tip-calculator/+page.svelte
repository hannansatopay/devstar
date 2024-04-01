<script >
	import { onMount } from 'svelte';
	import { Input, Label } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import axios from 'axios';
  
	export let data;
  
	let billAmount = 0;
	let tipPercentage = 0;
	let numberOfPeople = 1;
	let tipAmount = 0;
	let totalAmount = 0;
	let tipPerPerson = 0;
	let amountPerPerson = 0;
  
	function calculateSplit() {
	  // Convert the input values to numbers using the parseFloat function
  billAmount = parseFloat(billAmount);
  tipAmount = (billAmount * (parseFloat(tipPercentage) / 100));
  totalAmount = (billAmount + tipAmount);
  tipPerPerson = (tipAmount / parseFloat(numberOfPeople));
  amountPerPerson = (totalAmount / parseFloat(numberOfPeople));
	  // Round the results to 2 decimal places
  tipAmount = tipAmount.toFixed(2);
  totalAmount = totalAmount.toFixed(2);
  tipPerPerson = tipPerPerson.toFixed(2);
  amountPerPerson = amountPerPerson.toFixed(2);
	}
  
	onMount(() => {
	  billAmount = 0;
	  tipPercentage = 15; // Default tip percentage
	  numberOfPeople = 1; // Default to one person
	  calculateSplit();
	});
  </script>
  
  <Intro heading={data.meta.title} description={data.meta.description} />
  
  <section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
	  <div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
		<div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
		  <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
			<Label class="bg-white dark:bg-gray-900 px-4 py-5">Bill Amount</Label>
			<Input type="number" class="rounded-none border-0" bind:value={billAmount} />
			<Label class="bg-white dark:bg-gray-900 px-4 py-5">% Tip</Label>
			<Input type="number" class="rounded-none border-0" bind:value={tipPercentage} />
			<Label class="bg-white dark:bg-gray-900 px-4 py-5">Number of People</Label>
			<Input type="number" class="rounded-none border-0" bind:value={numberOfPeople} />
		  </div>
		  <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300 mx-4">
			<ul class="bg-white dark:bg-gray-900 px-4 py-5 text-black dark:text-white text-2xl">
			  <li>Tip Amount: {tipAmount}</li>
			  <li>Total Amount: {totalAmount}</li>
			  <li>Tip per Person: {tipPerPerson}</li>
			  <li>Amount per Person: {amountPerPerson}</li>
			</ul>
		  </div>
		</div>
		<button on:click={calculateSplit} class="m-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover-bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
		  Split Bill
		</button>
	  </div>
	</div>
  </section>
  