<!--
<script lang="ts">
	import { onMount } from 'svelte';
	import { Spinner } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
  	
	export let data;
	
</script>  -->

<!--<Intro heading={data.meta.title} description={data.meta.description} /> -->
<!--
<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
    <div class="bg-[#323A49] min-h-[16rem] md:w-2/3 rounded-lg mx-auto flex flex-col justify-center items-center text-center p-2">
	-->
		
		<!-- src/Calculator.svelte -->
		
<!-- src/Calculator.svelte -->
<!-- src/Calculator.svelte -->
<script>
	let inputRate = 5;
	let inputCompounding = "semiannually";
	let outputRate = 0;
	let outputCompounding = "annually"; // Default to "annually"
  
	function calculate() {
	  const nInput = getCompoundingFrequency(inputCompounding);
	  const t = 1; // For simplicity, we'll calculate for one year.
	  const rateDecimalInput = inputRate / 100;
  
	  const principal = 1000; // Fixed principal amount
  
	  const result = principal * Math.pow(1 + rateDecimalInput / nInput, nInput * t) - principal;
  
	  const nOutput = getCompoundingFrequency(outputCompounding);
	  outputRate = (Math.pow(1 + result / principal, nOutput) - 1) * 100;
	}
  
	function getCompoundingFrequency(compounding) {
	  switch (compounding) {
		case "annually":
		  return 1;
		case "semiannually":
		  return 2;
		case "quarterly":
		  return 4;
		case "monthly":
		  return 12;
		case "semimonthly":
		  return 24;
		case "biweekly":
		  return 26;
		case "weekly":
		  return 52;
		case "daily":
		  return 365;
		case "continuously":
		  return 365; // For continuously compounded interest
		default:
		  return 1;
	  }
	}
  
	function clearForm() {
	  inputRate = 0;
	  inputCompounding = "semiannually";
	  outputRate = 0;
	  outputCompounding = "annually"; // Reset to "annually"
	}
  </script>
  
  <main>
	<div class="calculator">
	  <h1 class="calculator-title">Compound Interest Calculator</h1>
  
	  <div class="calculator-inputs">
		<div class="input-group">
		  <label for="inputRate"><strong>Input Interest Rate (%)</strong></label>
		  <input type="number" bind:value={inputRate} step="0.01" id="inputRate" />
		</div>
  
		<div class="input-group">
		  <label for="inputCompounding"><strong>Compounding Frequency</strong></label>
		  <select bind:value={inputCompounding} id="inputCompounding">
			<option value="annually">Annually</option>
			<option value="semiannually">Semi-Annually</option>
			<option value="quarterly">Quarterly</option>
			<option value="monthly">Monthly (APY)</option>
			<option value="semimonthly">Semimonthly</option>
			<option value="biweekly">Biweekly</option>
			<option value="weekly">Weekly</option>
			<option value="daily">Daily</option>
			<option value="continuously">Continuously</option>
		  </select>
		</div>
	  </div>
  
	  <div class="calculator-buttons">
		<button on:click={calculate} class="calculate-button">Calculate</button>
		<button on:click={clearForm} class="clear-button">Clear</button>
	  </div>
  
	  {#if outputRate !== 0}
		<p class="result">
		  Input Interest: {inputRate}% ({inputCompounding}) = Output Interest: {outputRate.toFixed(5)}%
		</p>
	  {/if}
	</div>
  </main>
  
  <style>
	main {
	  display: flex;
	  justify-content: center;
	  align-items: center;
	  min-height: 100vh;
	  background: linear-gradient(90deg, #5C1C8B, #FFB14D); /* Gradient background color */
	}
  
	.calculator {
	  background: rgba(255, 255, 255, 0.9); /* Slightly transparent white background color */
	  border-radius: 10px;
	  padding: 20px;
	  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	  max-width: 400px;
	}
  
	.calculator-title {
	  font-size: 24px;
	  text-align: center;
	  color: #5C1C8B; /* Purple text color */
	}
  
	.calculator-inputs {
	  margin-top: 20px;
	}
  
	.input-group {
	  margin-bottom: 20px;
	}
  
	label {
	  display: block;
	  margin-bottom: 5px;
	  color: #333; /* Dark gray text color */
	}
  
	input, select {
	  width: 100%;
	  padding: 10px;
	  border: 1px solid #ccc;
	  border-radius: 4px;
	}
  
	.calculator-buttons {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  margin-top: 20px;
	}
  
	.calculate-button {
	  background: #5C1C8B; /* Purple background color */
	  color: #fff; /* White text color */
	  border: none;
	  border-radius: 4px;
	  padding: 10px 20px;
	  cursor: pointer;
	  transition: background 0.3s, color 0.3s;
	}
  
	.calculate-button:hover {
	  background: #492276; /* Darker purple on hover */
	}
  
	.clear-button {
	  background: #FFB14D; /* Orange background color */
	  color: #fff; /* White text color */
	  border: none;
	  border-radius: 4px;
	  padding: 10px 20px;
	  cursor: pointer;
	  transition: background 0.3s, color 0.3s;
	}
  
	.clear-button:hover {
	  background: #FF952B; /* Darker orange on hover */
	}
  
	.result {
	  margin-top: 20px;
	  font-size: 18px;
	  text-align: center;
	  color: #5C1C8B; /* Purple text color */
	}
  </style>
  
	  
  
	  
  
	
  
	  