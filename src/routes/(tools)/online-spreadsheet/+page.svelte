<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import {
		Button,
		GradientButton,
		Dropdown,
		DropdownItem,
		ChevronRight,
		DropdownDivider
	} from 'flowbite-svelte';
	import * as XLSX from 'xlsx';
	import { onMount } from 'svelte';

	export let data;

	let showUploadSection = false;
	let showCreateSection = false;
	let fileInput;

	let rowData = [];
	let numRows = 8;
	let numCols = 13;
	let index = 1;
	let selectedCell = null;

	function downloadSheet() {
		const tableRows = document.querySelectorAll('tbody tr');

		let row_Data = Array.from(tableRows).map((row) => {
			const cells = row.querySelectorAll('td');
			return Array.from(cells).map((cell) => cell.textContent || '');
		});

		const data = row_Data.map((row) => row.join(',')).join('\n');
		const blob = new Blob([data], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;

		// for giving unique name to files
		var uniqueNum = Math.random().toString(9).substr(2, 3);
		var uniqueStr = Math.random().toString(36).substr(2);
		a.download = `Spreadsheet_${uniqueNum + uniqueStr}.csv`;

		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
		document.body.removeChild(a);
		return;
	}

	// create logic:
	function createAddRow() {
		numRows++;
	}

	function createAddColumn() {
		numCols++;
	}

	function getColumnName(index) {
		if (index < 26) {
			// A to Z
			return String.fromCharCode(65 + index);
		} else {
			// After Z, A1, A2, A3...
			let firstChar = String.fromCharCode(65 + Math.floor(index / 26) - 1);
			let secondChar = String.fromCharCode(65 + (index % 26));
			return `${firstChar}${secondChar}`;
		}
	}

	// upload logic:

	function handleFileChange(event) {
		const file = event.target.files[0];
		if (file) {
			parseExcel(file);
		}
	}

	function parseExcel(file) {
		const reader = new FileReader();

		reader.onloadend = (e) => {
			const data = new Uint8Array(e.target.result);
			const workbook = XLSX.read(data, { type: 'array' });
			const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
			const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

			// Set numRows and numCols based on parsed data
			numRows = jsonData.length;
			numCols = Math.max(...jsonData.map((row) => row.length));

			// Initialize rowData with parsed data
			rowData = jsonData.map((row) => {
				const emptyCells = Array(numCols - row.length).fill('');
				return row.concat(emptyCells);
			});

			// showUploadSection = true;
			showUploadSection = !showUploadSection;
		};

		reader.readAsArrayBuffer(file);
	}

	function uploadAddRow() {
		if (selectedCell) {
			const rowIndex = selectedCell.parentNode.rowIndex;
			rowData.splice(rowIndex + 1, 0, Array(numCols).fill(''));
			numRows++;
		} else {
			// If selectedCell is not set, add a row at the end
			rowData.push(Array(numCols).fill(''));
			numRows++;
		}
	}

	function uploadAddColumn() {
		if (selectedCell) {
			const colIndex = selectedCell.cellIndex;
			rowData.forEach((row) => row.splice(colIndex + 1, 0, ''));
			numCols++;
		} else {
			// If selectedCell is not set, add a column at the end
			rowData.forEach((row) => row.push(''));
			numCols++;
		}
	}

	function deleteRow() {
		if (numRows > 1) numRows--;
	}

	function deleteColumn() {
		if (numCols > 1) numCols--;
	}

	function selectCell(event) {
		selectedCell = event.target;
	}

	onMount(() => {
		// Initialize rowData with empty strings
		rowData = Array.from({ length: numRows }, () => Array(numCols).fill(''));
	});
</script>

<Intro heading={data.meta.title} description={data.meta.description} />
<section class="bg-white dark:bg-gray-900">
	{#if !showCreateSection && !showUploadSection}
		<div class="flex justify-center items-center section-button mt-2 mb-4 mr-4 ml-4">
			<!--Two buttons added from flowbite-svelte-->
			<Button
				size="xl"
				outline
				color="blue"
				class="mr-2"
				on:click={() => {
					fileInput.click();
				}}>Upload Your Spreadsheet<br />(.xlsx)</Button
			>
			<input
				id="sheetuploader"
				type="file"
				class="hidden"
				accept=".xlsx"
				bind:this={fileInput}
				on:change={handleFileChange}
			/>
			<GradientButton
				size="xl"
				color="blue"
				class="ml-2"
				on:click={() => {
					showCreateSection = !showCreateSection;
				}}>Create New Spreadsheet<br />(.csv)</GradientButton
			>
		</div>
	{:else if showUploadSection}
		<div class="flex justify-start mt-4 ml-6 mr-4 mb-4">
			<GradientButton size="md" outline color="blue">Menu<ChevronRight /></GradientButton>
			<Dropdown placement="right-start">
				<DropdownItem on:click={downloadSheet}>Download Sheet</DropdownItem>
				<DropdownDivider />
				<DropdownItem on:click={uploadAddRow}>Add Row</DropdownItem>
				<!-- For Future Implementation if needed-->
				<!-- 
				<Button size="xl" color="blue" class="mb-4"><b>Bold</b></Button>
				<Button size="xl" outline color="blue" class="mb-4"><u>Underline</u></Button>
				<Button size="xl" color="blue" class="mb-4"><i>Italic</i></Button>
				-->
				<DropdownItem on:click={uploadAddColumn}>Add Column</DropdownItem>
				<DropdownItem on:click={deleteRow}>Remove Row</DropdownItem>
				<DropdownItem on:click={deleteColumn}>Remove Column</DropdownItem>
				<DropdownDivider />
				<DropdownItem
					on:click={() => {
						showUploadSection = false;
						selectedCell = null;
						rowData = [];
						numRows = 8;
						numCols = 13;
					}}>Exit Editor</DropdownItem
				>
			</Dropdown>
		</div>

		<div class="w-100 h-100 ml-4 mr-4 mb-4 scrollable-container">
			<table>
				<thead>
					<tr>
						<th class="describers" />
						{#each Array(numCols) as _, i}
							<th class="content describers">{getColumnName(i)}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each Array(numRows) as _, rowIndex}
						<tr>
							<td class="row-numbering describers"><b>{rowIndex + 1}</b></td>
							{#each Array(numCols) as _, colIndex}
								<td contenteditable="true" class="content" on:click={selectCell}
									>{rowData[rowIndex][colIndex]}</td
								>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:else if showCreateSection}
		<div class="flex justify-start mt-4 ml-6 mr-4 mb-4">
			<GradientButton size="md" outline color="blue">Menu<ChevronRight /></GradientButton>
			<Dropdown placement="right-start">
				<DropdownItem on:click={downloadSheet}>Download Sheet</DropdownItem>
				<DropdownDivider />
				<DropdownItem on:click={createAddRow}>Add Row</DropdownItem>
				<!-- For Future Implementation if needed-->
				<!-- 
				<Button size="xl" color="blue" class="mb-4"><b>Bold</b></Button>
				<Button size="xl" outline color="blue" class="mb-4"><u>Underline</u></Button>
				<Button size="xl" color="blue" class="mb-4"><i>Italic</i></Button>
				-->
				<DropdownItem on:click={createAddColumn}>Add Column</DropdownItem>
				<DropdownItem on:click={deleteRow}>Remove Row</DropdownItem>
				<DropdownItem on:click={deleteColumn}>Remove Column</DropdownItem>
				<DropdownDivider />
				<DropdownItem
					on:click={() => {
						showCreateSection = false;
						rowData = [];
						numRows = 8;
						numCols = 13;
					}}>Exit Editor</DropdownItem
				>
			</Dropdown>
		</div>

		<div class="w-100 h-100 ml-4 mr-4 mb-4 scrollable-container">
			<table>
				<thead>
					<tr>
						<th class="describers" />
						{#each Array(numCols) as _, i}
							<th class="content describers">{getColumnName(i)}</th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each Array(numRows) as _, rowIndex}
						<tr>
							<td class="row-numbering describers"><b>{rowIndex + 1}</b></td>
							{#each Array(numCols) as _, colIndex}
								<td contenteditable="true" class="content" />
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>

<style>
	table {
		border-collapse: collapse;
		background-color: azure;
	}

	table,
	th {
		/* border: 1px solid #236cf1; */
		border: 1px solid black;
		padding: 8px;
		color: #1e1818;
	}

	td {
		padding: 12px;
		/* border: 1px solid #236cf1; */
		border: 1px solid black;
		/* text-align: center; */ /*If needed*/
	}

	.content {
		width: 125px;
		overflow-x: auto;
		white-space: nowrap;
	}

	.row-numbering {
		width: 35px;
		/* border: 1px solid #236cf1; */
		border: 1px solid black;
	}

	.describers {
		/* background-color: #8f9bf1; */
		/* background-color: #3b83cc; */
		background-color: #1e66f2;
		color: azure;
	}

	/* For Implementing Scroll Functionality */
	.scrollable-container {
		overflow-x: auto;
		overflow-y: auto;
		max-height: 385px;
		max-width: fit-content;
	}

	.section-button {
		max-width: 100%;
	}
</style>
