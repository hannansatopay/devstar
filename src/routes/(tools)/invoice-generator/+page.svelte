<script lang="ts">
	import { Label, Input, Range } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import Copy from '$lib/Copy.svelte';

	export let data;

	// defaults
	let background = '#e0e0e0';
	let size = 250;
	let radius = 50;
	let distance = 20;
	let intensity = 0.15;
	let blur = 60;

	let inputSets = [];
	let showFirstPair = false;
	let moveDescription = false;

	function addInputSet() {
		inputSets = [...inputSets, { item: '', rate: '', quantity: 1, additionalInfo: '' }];
		showFirstPair = true;
		moveDescription = true;
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="mx-auto max-w-screen-xl lg:px-12">
		<div
			class="card">
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
				{#each inputSets as inputSet, index}
					{#if showFirstPair || index > 0}
						<tr>
							<td>
								<button class=" w-10 h-10 border bg-sky-500 rounded m-3">X</button>
							</td>
							<td>
								<input
									class="w-full rounded"
									type="text"
									placeholder="Item Description"
									bind:value={inputSet.item}
								/>
							</td>
							<td class="px-2">
								<input
									class="w-full rounded"
									type="text"
									placeholder="0.00"
									bind:value={inputSet.rate}
								/>
							</td>
							<td class="px-1">
								<input class="w-full rounded text-end" type="text" bind:value={inputSet.quantity} />
							</td>
							<td>
								<p class="flex justify-center">$0.0</p>
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