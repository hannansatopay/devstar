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

	let inputSets: any[] = [{ item: '', rate: '', quantity: 1, additionalInfo: '', taxRate: 0 }];
	let index = -1;
	let showFirstPair = true;
	let moveDescription = false;
	let showTaxInfo = false;
	let showDueInput = false;
	let selectedOption = 'None';
	let currentDate = new Date().toISOString().split('T')[0];
	let dueDate = currentDate;

	let subtotal = 0;
	let tax = 0;
	let total = 0;
	let balanceDue = 0;
	function updateTotals() {
		subtotal = inputSets.reduce((acc, inputSet) => {
			const itemAmount = inputSet.quantity * inputSet.rate || 0;
			const itemTax = itemAmount * (inputSet.taxRate / 100);
			inputSet.tax = itemTax; // Store tax for each item
			return acc + itemAmount;
		}, 0);

		tax = inputSets.reduce((acc, inputSet) => {
			return acc + inputSet.tax || 0;
		}, 0);

		total = subtotal + tax;
		balanceDue = total;
	}

	function addInputSet() {
		index += 1;
		inputSets = [
			...inputSets,
			{ id: index, item: '', rate: '', quantity: 1, additionalInfo: '', taxRate: 0 }
		];
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

	function onOptionChange() {
		if (selectedOption === 'None' || selectedOption === 'Due On Receipt') {
			showDueInput = false;
		} else {
			showDueInput = true;

			setTimeout(() => {
				const currentDateObj = new Date(currentDate);
				let dueDateObj = new Date(currentDateObj);

				if (selectedOption === 'Next Day') {
					dueDateObj.setDate(dueDateObj.getDate() + 1);
				} else if (selectedOption === '2 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 2);
				} else if (selectedOption === '3 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 3);
				} else if (selectedOption === '4 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 4);
				} else if (selectedOption === '5 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 5);
				} else if (selectedOption === '6 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 6);
				} else if (selectedOption === '7 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 7);
				} else if (selectedOption === '10 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 10);
				} else if (selectedOption === '14 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 14);
				} else if (selectedOption === '21 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 21);
				} else if (selectedOption === '30 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 30);
				} else if (selectedOption === '45 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 45);
				} else if (selectedOption === '60 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 60);
				} else if (selectedOption === '90 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 90);
				} else if (selectedOption === '120 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 120);
				} else if (selectedOption === '180 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 180);
				} else if (selectedOption === '365 Days') {
					dueDateObj.setDate(dueDateObj.getDate() + 365);
				}

				dueDate = dueDateObj.toISOString().split('T')[0];
			}, 10);
		}
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="mx-auto max-w-screen-xl lg:px-12">
		<div class="card">
			<div class="Invoice-Receipt w-full m-5 py-5">
				<div class="w-1/2">
					<div class="mb-4 flex justify-between items-center">
						<label class="mr-5" for="invoice_id">Number</label>
						<input
							type="text"
							name="number"
							placeholder="INV0001"
							required
							class="w-4/5 font-bold text-lg px-3 py-2 border rounded-lg"
						/>
					</div>
					<div class="mb-4 flex justify-between items-center">
						<label class="mr-5" for="invoice_id">Date</label>
						<input
							type="date"
							name="date"
							bind:value={currentDate}
							required
							class="w-4/5 px-3 py-2 border rounded-lg"
						/>
					</div>
					<div class="mb-4 flex justify-between items-center">
						<label class="mr-5" for="term">Terms</label>
						<select
							name="terms"
							id="terms"
							bind:value={selectedOption}
							on:change={onOptionChange}
							class="w-4/5 px-3 py-2 border rounded-lg"
						>
							<option value="None">None</option>
							<option value="Custom">Custom</option>
							<option value="Due On Receipt">Due On Receipt</option>
							<option value="Next Day">Next Day</option>
							<option value="2 Days">2 Days</option>
							<option value="3 Days">3 Days</option>
							<option value="4 Days">4 Days</option>
							<option value="5 Days">5 Days</option>
							<option value="6 Days">6 Days</option>
							<option value="7 Days">7 Days</option>
							<option value="10 Days">10 Days</option>
							<option value="14 Days">14 Days</option>
							<option value="21 Days">21 Days</option>
							<option value="30 Days">30 Days</option>
							<option value="45 Days">45 Days</option>
							<option value="60 Days">60 Days</option>
							<option value="90 Days">90 Days</option>
							<option value="120 Days">120 Days</option>
							<option value="180 Days">180 Days</option>
							<option selected value="365 Days">365 Days</option>
						</select>
					</div>
					<div>
						{#if showDueInput}
							<div class="mb-4 flex justify-between items-center">
								<label class="mr-5" for="due">Due</label>
								<input
									type="date"
									bind:value={dueDate}
									name="due"
									id="due"
									class="w-4/5 px-3 py-2 border rounded-lg"
								/>
							</div>
						{/if}
					</div>
				</div>
			</div>

			<hr class="border-t border-gray-400" />
			<div id="invoice">
				<table class="w-full">
					<thead class="mb-7">
						<tr class="w-full h-10">
							<th class="w-10" />
							<th class="text-start w-2/5">Description</th>
							<th class="text-end w-1/6 px-3">Rate</th>
							<th class="text-end w-1/6 px-3">Quantity</th>
							<th class="text-center w-fit">Amount</th>
							<th class="text-center w-fit">Tax(%)</th>
						</tr>
						<tr>
							<td class="border-t border-black" colspan="6">
								<hr />
							</td>
						</tr>
					</thead>
					<tbody>
						{#each inputSets as inputSet}
							{#if showFirstPair || index > 0}
								<tr>
									<td>
										<button
											class="w-10 h-10 font-bold border text-xl bg-gray-400 rounded-lg m-3"
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
											class="w-full text-end rounded"
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
										<p class="flex justify-center text-2xl">₹{inputSet.quantity * inputSet.rate}</p>
									</td>
									<td class="text-center">
										<input
											class="w-16 text-center text-l rounded"
											type="number"
											min="0"
											bind:value={inputSet.taxRate}
											on:change={updateTotals}
										/>
									</td>
								</tr>
								<tr>
									<td colspan="6">
										<textarea
											class="w-2/5 ml-16 rounded h-36 text-start pt-2 resize-none"
											placeholder="Additional Details"
											bind:value={inputSet.additionalInfo}
										/>
									</td>
								</tr>
								{#if index !== inputSets.length - 1}
									<tr>
										<td class="py-3" colspan="6">
											<hr />
										</td>
									</tr>
								{/if}
							{/if}
						{/each}
					</tbody>
				</table>
			</div>
			<button
				class="w-10 h-10 border font-bold text-3xl text-white bg-gray-600 rounded-lg shadow-lg m-3"
				on:click={addInputSet}>+</button
			>
			<hr class="py-5" />
			<div
				class="gap-12 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg lg:grid lg:grid-cols-2"
			>
				<div class="p-8 h-full" />
				<div class="p-8 h-full">
					<div class="w-1/2 text-gray-700">
						<div class="flex justify-between p-1 invoice-summary-label">
							Subtotal: <span class="price">₹{subtotal.toFixed(2)}</span>
						</div>
						<div class="flex justify-between p-1 invoice-summary-label">
							Tax: <span class="price">₹{tax.toFixed(2)}</span>
						</div>
						<div class="flex justify-between p-1 invoice-summary-label">
							Total: <span class="price">₹{total.toFixed(2)}</span>
						</div>
						<div class="flex justify-between font-bold text-lg p-1 invoice-summary-label">
							Balance due: <span class="price">₹{balanceDue.toFixed(2)}</span>
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
