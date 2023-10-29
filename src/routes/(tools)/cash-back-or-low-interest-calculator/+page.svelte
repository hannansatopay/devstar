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

	async function calculateOffers() {
    const cashBackAmount = parseFloat(document.getElementById('ccashback').value);
    const interestRateHigh = parseFloat(document.getElementById('cinterestrate').value);
    const interestRateLow = parseFloat(document.getElementById('cinterestratelow').value);
    const autoPrice = parseFloat(document.getElementById('cloanamount').value);

    // Calculate the offers
    const offer1 = autoPrice - cashBackAmount + (autoPrice * (interestRateHigh / 100));
    const offer2 = autoPrice * (1 - interestRateLow / 100);

    // Display the alert with the offer that provides the highest cashback
    if (offer1 > offer2) {
      alert('Cashback offer provides the highest cashback: ' + offer1);
    } else {
      alert('Low Interest Rate offer provides the highest cashback: ' + offer2);
    }
  }
  </script>
  
  <Intro heading={data.meta.title} description={data.meta.description} />
    
  

<style>
	#svg1 {
position: relative;
left: 0px;
top:10px;
}
#svg2 {
position: relative;
left: -5px;
top:10px;
}
#svg3 {
position: relative;
left: -10px;
top:10px;
}
</style>

<section class="bg-white dark:bg-gray-900">
<div class="bg-white py-2 text-neutral-50 dark:bg-gray-900">
  <div id="svg1">
	  <table id="calinputtable" class="panel" align="center">
		  <tr>
			<td id="sectitle" class=" text-2xl font-extrabold sm:px-16 xl:px-48 text-gray-900 dark:text-white">Cash Back Offer</td>
		  </tr>
		  <tr>
			<td class="text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">Cash Back Amount</td>
			<td align="right" class="text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400"><input type="text" name="ccashback" id="ccashback" value="1000" class="inhalf indollar " /></td>
		  </tr>
		  <tr>
			<td class="text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">Interest Rate (High)</td>
			<td align="right" class="text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400"><input type="text" name="cinterestrate" id="cinterestrate" value="5" class="inhalf inpct" /></td>
		  </tr>
		  <tr>
			  <td colspan="3">&nbsp;</td>
			</tr>
			<tr>
	  </table>
  </div>

  <div id="svg2">
	  <table align="center">
		  <tr>
	  <td colspan="3" id="sectitle" class=" text-2xl font-extrabold sm:px-16 xl:px-48 text-gray-900 dark:text-white">Low Interest Rate Offer</td>
  </tr>
  <tr>
	<td class="text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">Interest Rate (Low)</td>
	<td align="right" class="text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400"><input type="text" name="cinterestratelow" id="cinterestratelow" value="2" class="inhalf inpct" /></td>
  </tr>
  <tr>
	<td colspan="3">&nbsp;</td>
  </tr>
</table>
  </div>
  <div id="svg3">
	  <table align="center" class="sm:px-16 xl:px-48">
  <tr>
	<td colspan="3" id="sectitle" class=" text-2xl font-extrabold text-gray-900 sm:px-16 xl:px-48 dark:text-white">Other Information</td>
  </tr>
  <tr>
	<td class="text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48  dark:text-gray-400">Auto Price</td>
	<td align="right" class="text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400"><input type="text" name="cloanamount" id="cloanamount" value="50000" class="inhalf indollar" /></td>
  </tr>

  <tr>
	<td colspan="2" align="center" style="padding-top:8px;">
	  <input name="printit" value="0" type="hidden" />
	</td>
  </tr>
</table>
</div>
<div align="center">
	<button on:click={calculateOffers} class="m-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
		Calculate
	  </button>
</div>
</div>
</section>
