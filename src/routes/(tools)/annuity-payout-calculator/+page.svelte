<script lang="ts">
	import { Label, Input, Select } from "flowbite-svelte";
	export let data;
	let principalAmount = 500000;
	let rate = 6; // interest rate
	let years = 10; // time period
	let period = 12; // Amout of withdrawls in a year
	let result = 5550; // default value
	let error = ""; // space of error message
	let totalAmountReceived = 666000;
	let totalInterestReceived = 166000;

	let type = "monthly";
	let types = [
		{ value: "annually", name: "Annually" },
		{ value: "semi-annually", name: "Semi-Annually" },
		{ value: "quarterly", name: "Quaterly" },
		{ value: "monthly", name: "Monthly" },
	];

	function updatePeriod() {
		if (type == "monthly") {
			period = 12;
		} else if (type == "quarterly") {
			period = 4;
		} else if (type == "semi-annually") {
			period = 2;
		} else if (type == "annually") {
			period = 1;
		}
	}

	function validateValues() {
		if (rate <= 1) {
			rate = 1;
		}
		if (years <= 1) {
			years = 1;
		}
	}

	function calculate() {
		if (principalAmount <= 0) {
			error = "Principal Amount should be a non-zero positive value!";
			return;
		}
		error = "";
		let newrate = rate / 100;
		let numerator = 1 - (1 + newrate / period) ** (-years * period);
		let denominator = newrate / period;
		let ans = numerator / denominator;
		result = principalAmount / ans;
		totalAmountReceived = result * (years * period);
		totalInterestReceived = totalAmountReceived - principalAmount;
	}
</script>

<section class="py-2">
	<div
		class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg"
	>
		{#if error}
			<div class="text-color border-danger font-semibold">
				{error}
			</div>
		{/if}

		<div
			class="p-8 h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 overflow-hidden"
		>
			<Label class="text-sm lg:text-lg">
				Starting Principal
				<Input
					type="number"
					bind:value={principalAmount}
					class="text-xs lg:text-base mt-2"
				/>
			</Label>

			<Label class="text-sm lg:text-lg">
				Interest Rate %
				<Input
					type="number"
					bind:value={rate}
					on:change={validateValues}
					on:change={calculate}
					class="text-xs lg:text-base mt-2"
				/>
			</Label>

			<Label class="text-sm lg:text-lg">
				Years to payout
				<Input
					type="number"
					bind:value={years}
					on:change={validateValues}
					on:change={calculate}
					class="text-xs lg:text-base mt-2"
				/>
			</Label>

			<Label class="text-sm lg:text-lg"
				>Select an option
				<Select
					items={types}
					bind:value={type}
					on:change={updatePeriod}
					on:change={calculate}
					class="text-xs lg:text-base mt-2"
				/>
			</Label>
		</div>

		<div
			class="p-8 h-full flex rounded-lg relative bg-gray-100 overflow-hidden grid grid-cols-1"
		>
			<p class="text-gray-800 text-sm lg:text-lg font-semibold">
				You can withdraw
				<span class="text-green-500 text-lg lg:text-2xl font-semibold"
					>${new Intl.NumberFormat("en-IN", {
						maximumSignificantDigits: 3,
					}).format(result)}
				</span>
				{type}<br />
				Total of
				<span class="text-green-500 text-lg lg:text-2xl font-semibold"
					>{years * period}
				</span>
				payments of
				<span class="text-green-500 text-lg lg:text-2xl font-semibold"
					>${new Intl.NumberFormat("en-IN", {
						maximumSignificantDigits: 3,
					}).format(totalAmountReceived)}</span
				>
				<br />
				Total Interest on Investment is
				<span class="text-green-500 text-lg lg:text-2xl font-semibold"
					>${new Intl.NumberFormat("en-IN", {
						maximumSignificantDigits: 3,
					}).format(totalInterestReceived)}</span
				>
			</p>
		</div>
	</div>
</section>

<style>
	.border-danger {
		padding: 5px 5px;
		font-size: large;
		border-left: 5px solid rgb(175, 6, 6);
		background-color: rgba(241, 86, 86, 0.27);
	}
</style>
