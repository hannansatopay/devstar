<script lang="ts">
	import { onMount } from 'svelte';
	import { Input, Label } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import axios from 'axios';
  

	let someValue;



	export let data;
  
	const currencyCodes = [
		'ANG', 'TND', 'CAD', 'XCD', 'MVR', 'HRK', 'AUD', 'MWK', 'XAG', 'MAD',
	  'PHP', 'NAD', 'GNF', 'KES', 'MZN', 'BTN', 'MGA', 'AZN', 'XAU', 'RON',
	  'CHF', 'EGP', 'BSD', 'TWD', 'GGP', 'LVL', 'MMK', 'WST', 'ILS', 'BHD',
	  'GBP', 'TZS', 'SDG', 'LAK', 'DJF', 'BYN', 'MRO', 'RWF', 'PEN', 'EUR',
	  'ZMK', 'RSD', 'INR', 'MUR', 'BWP', 'GEL', 'KMF', 'UZS', 'RUB', 'CUC',
	  'BGN', 'JOD', 'NGN', 'BDT', 'PKR', 'BRL', 'KZT', 'CVE', 'HNL', 'NZD',
	  'ERN', 'NPR', 'ZMW', 'FKP', 'DZD', 'JMD', 'CRC', 'GMD', 'PLN', 'AMD',
	  'BMD', 'BZD', 'BBD', 'SBD', 'IDR', 'ALL', 'IQD', 'BIF', 'HKD', 'GIP',
	  'BAM', 'LKR', 'QAR', 'SAR', 'TOP', 'SEK', 'ZAR', 'ARS', 'MYR', 'BYR',
	  'KPW', 'CZK', 'STD', 'BTC', 'ZWL', 'LSL', 'COP', 'PAB', 'IRR', 'LTL',
	  'XPF', 'XOF', 'XDR', 'OMR', 'CNY', 'NIO', 'AOA', 'SCR', 'MOP', 'ISK',
	  'VND', 'VES', 'USD', 'UYU', 'VEF', 'UGX', 'UAH', 'DOP', 'TTD', 'BOB',
	  'NOK', 'TMT', 'TJS', 'SGD', 'THB', 'GHS', 'CLP', 'KHR', 'ETB', 'PGK',
	  'SYP', 'AED', 'SRD', 'LRD', 'MKD', 'KYD', 'CUP', 'SLL', 'LYD', 'SLE',
	  'SHP', 'FJD', 'IMP', 'JEP', 'PYG', 'KRW', 'SZL', 'GYD', 'MDL', 'MXN',
	  'HTG', 'JPY', 'SOS', 'MNT', 'AFN', 'GTQ', 'CLF', 'KGS', 'TRY', 'YER',
	  'HUF', 'BND', 'SSP', 'AWG', 'CDF', 'LBP', 'VUV', 'XAF', 'KWD', 'DKK'
	];
  
	const sortedCurrencyCodes = currencyCodes.sort();
  
	let num1 = 0;
	let amountt = 0;
	let selectedFromCurrency = '';
	let selectedToCurrency = '';


	let input1;
	let select1;
	let select2;

	onMount(() => {
  		// This code will only run in the browser
		  input1 = document.getElementById('input1');
		  select1 = document.getElementById('mySelect1');
		  select2 = document.getElementById('mySelect2');
	});

	input1?.addEventListener('change', (event) => {
		num1 = event?.target?.value;
		updateConversion();
	});

	select1?.addEventListener('change', (event) => {
		selectedFromCurrency = event?.target?.value;
		updateConversion();
	});

	select2?.addEventListener('change', (event) => {
		selectedToCurrency = event?.target?.value;
		updateConversion();
	});

	async function updateConversion() {
		if (!selectedFromCurrency || !selectedToCurrency || !num1) {
			console.error('Please select currencies and enter a valid amount.');
			return;
		}

		const options = {
			method: 'GET',
			url: 'https://currency-conversion-and-exchange-rates.p.rapidapi.com/convert',
			params: {
				from: selectedFromCurrency,
				to: selectedToCurrency,
				amount: num1,
			},
			headers: {
				'X-RapidAPI-Key': '1ee06155f4msh85bb0e5ca340082p189b39jsn0cfa04b860bc',
				'X-RapidAPI-Host': 'currency-conversion-and-exchange-rates.p.rapidapi.com',
			},
		};

		try {
			const response = await axios.request(options);
			amountt = response.data.result;
		} catch (error) {
			console.error(error);
		}
	}
  </script>
  
  <Intro heading={data.meta.title} description={data.meta.description} />
    
  <section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
	  <div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
		<div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
		  <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
			<Label class="bg-white dark:bg-gray-900 px-4 py-5">From</Label>
			<Input id="input1" type="number" class="rounded-none border-0" bind:value={num1} />
			<select id='mySelect1' class="lowercase capitalize bg-gray-50 text-gray-900 text-sm border-0 border-t-2 border-white focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
			bind:value={selectedFromCurrency}>
			  {#each currencyCodes as currency}
			  <option value={currency}>{currency}</option>
			  {/each}
			</select>
		  </div>
		  <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
			<Label class="bg-white dark:bg-gray-900 px-4 py-5">To</Label>
			<Input id="input2" type="number" class="rounded-none border-0" bind:value={amountt} />
			<select id='mySelect2' class="lowercase capitalize bg-gray-50 text-gray-900 text-sm border-0 border-t-2 border-white focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
			bind:value={selectedToCurrency}>
			  {#each currencyCodes as currency}
			  <option value={currency}>{currency}</option>
			  {/each}
			</select>
		  </div>
		</div>
		<button class="m-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" 
		on:click={updateConversion}>
		  Convert Currency
		</button>
	  </div>
	</div>
  </section>
  