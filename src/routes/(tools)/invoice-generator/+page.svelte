<script lang="ts">
	import { Label, Input, Range } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';

	export let data;

	let background = '#e0e0e0';
	let size = 250;
	let radius = 50;
	let distance = 20;
	let intensity = 0.15;
	let blur = 60;

	let inputSets: any[] = [];
	let index = -1;
	let showFirstPair = false;
	let moveDescription = false;

	let subtotal = 0;
	let tax = 0;
	let total = 0;
	let balanceDue = 0;

	function updateTotals() {
		subtotal = inputSets.reduce((acc, inputSet) => {
			return acc + (inputSet.quantity * inputSet.rate || 0);
		}, 0);

		// You can calculate tax, total, and discounts as needed here.
		// For simplicity, I'll assume a tax rate of 10%.
		tax = subtotal * 0.1;
		total = subtotal + tax;
		balanceDue = total;
	}

	function addInputSet() {
		index += 1;
		inputSets = [...inputSets, { id: index, item: '', rate: '', quantity: 1, additionalInfo: '' }];
		showFirstPair = true;
		moveDescription = true;
		updateTotals();
	}

	function deleteInputSet(idToDelete) {
		const indexToDelete = inputSets.findIndex((inputSet) => inputSet.id === idToDelete);
		if (indexToDelete !== -1) {
			index -= 1;
			inputSets.splice(indexToDelete, 1);
			updateTotals();
		}
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="mx-auto max-w-screen-xl lg:px-12">
		<div class="card">
			<hr />
			<div id="invoice">
				<table class="w-full">
					<thead>
						<tr class="w-full">
							<th class="w-10" />
							<th class="text-start w-2/5">Item Description</th>
							<th class="text-end w-1/6 px-3">Rate</th>
							<th class="text-end w-1/6 px-3">Quantity</th>
							<th class="text-center w-fit">Amount</th>
							<th class="text-center w-fit">Tax (%)</th>
						</tr>
					</thead>
					<tbody>
						{#each inputSets as inputSet}
							{#if showFirstPair || index > 0}
								<tr>
									<td>
										<button
											class="w-10 h-10 border bg-sky-500 rounded m-3"
											on:click={() => deleteInputSet(inputSet.id)}>X</button
										>
									</td>
									<td>
										<input
											class="w-full rounded"
											type="text"
											min="0"
											placeholder="Item Description"
											bind:value={inputSet.item}
										/>
									</td>
									<td class="px-2">
										<input
											class="w-full rounded"
											type="number"
											min="0"
											placeholder="0.00"
											bind:value={inputSet.rate}
											on:change={updateTotals}
										/>
									</td>
									<td class="px-1">
										<input
											class="w-full rounded text-end"
											type="number"
											min="0"
											bind:value={inputSet.quantity}
											on:change={updateTotals}
										/>
									</td>
									<td>
										<p class="flex justify-center">{inputSet.quantity * inputSet.rate}</p>
									</td>
									<td class="text-center">
										<input class="mx-auto" type="checkbox" name="" id="" />
									</td>
								</tr>
								<tr>
									<td colspan="6">
										<input
											class="w-2/5 py-12 ml-16 rounded"
											type="text"
											placeholder="Additional Details"
											bind:value={inputSet.additionalInfo}
										/>
									</td>
								</tr>
								{#if index !== inputSets.length - 1}
									<tr>
										<td colspan="6">
											<hr />
										</td>
									</tr>
								{/if}
							{/if}
						{/each}
					</tbody>
				</table>
				<hr />
			</div>
			<button class="w-10 h-10 border bg-sky-500 rounded m-3" on:click={addInputSet}>+</button>
			<div
				class="card gap-12 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg lg:grid lg:grid-cols-2"
			>
				<div class="p-8 h-full" />
				<div class="p-8 h-full">
					<div class="mb-4 text-gray-700">
						<div class="invoice-summary-label">
							Subtotal: <span class="price">{subtotal.toFixed(2)}</span>
						</div>
						<div class="invoice-summary-label">
							Tax: <span class="price">{tax.toFixed(2)}</span>
						</div>
						<div class="invoice-summary-label">
							Total: <span class="price">{total.toFixed(2)}</span>
						</div>
						<div class="invoice-summary-label">
							Balance due: <span class="price">{balanceDue.toFixed(2)}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
		background-color: white;
	}
	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}
</style>