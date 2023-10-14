<script>
	import { Button, GradientButton, ButtonGroup } from 'flowbite-svelte';

	let isSpreadsheetOpen = false;
	let rowData = []; // To store user-entered data
  let numRows = 3;
  let numCols = 11;

	function toggleSpreadsheet() {
		isSpreadsheetOpen = !isSpreadsheetOpen;
	}

	//     function saveData() {
	//     // Extract data from the table and save it to rowData
	//     const tableRows = document.querySelectorAll('tbody tr');

	//     rowData = Array.from(tableRows).map((row) => {
	//       const cells = row.querySelectorAll('td');
	//       return Array.from(cells).map((cell) => cell.textContent || '');
	//     });
	//   }

	function downloadSheet() {
		const tableRows = document.querySelectorAll('tbody tr');

		rowData = Array.from(tableRows).map((row) => {
			const cells = row.querySelectorAll('td');
			return Array.from(cells).map((cell) => cell.textContent || '');
		});

		const data = rowData.map((row) => row.join(',')).join('\n');
		const blob = new Blob([data], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'spreadsheet.csv';
		document.body.appendChild(a);
		a.click();
		window.URL.revokeObjectURL(url);
	}

	function goBack() {
		isSpreadsheetOpen = false;
	}

  function addRow() {
		numRows++;
	}

	function addColumn() {
		numCols++;
	}
</script>

<main>
	<!-- <button>Open Spreadsheet</button> -->
	{#if !isSpreadsheetOpen}
		<div class="flex justify-center items-center"> <!--Two buttons added from flowbite-svelte-->
			<Button size="xl" outline color="blue" class="m-6">Upload Your Spreadsheet<br />(.csv)</Button>
			<GradientButton size="xl" color="blue" class="m-6" on:click={toggleSpreadsheet}>Create New Spreadsheet<br />(.csv)</GradientButton>
		</div>
		<!-- {:else} -->
	{/if}

	{#if isSpreadsheetOpen}
		<!-- <Button size="xl" outline color="blue" class="m-6" on:click={saveData}>Save Data</Button> -->
		<div class="flex justify-center item-center mt-4 ml-4 mr-4">
			<ButtonGroup>
				<GradientButton size="md" color="blue" class="mb-4" on:click={downloadSheet}>Download Sheet</GradientButton>
				<Button size="md" outline color="blue" class="mb-4" on:click={addRow}>Add Row</Button>
				<!-- For Future Implementation -->
				<!-- 
				<Button size="xl" color="blue" class="mb-4"><b>Bold</b></Button>
				<Button size="xl" outline color="blue" class="mb-4"><u>Underline</u></Button>
				<Button size="xl" color="blue" class="mb-4"><i>Italic</i></Button>
				 -->
         <Button size="md" outline color="blue" class="mb-4" on:click={addColumn}>Add Column</Button>
				<GradientButton size="md" color="blue" class="mb-4" on:click={goBack}>Back</GradientButton>
			</ButtonGroup>
		</div>

		<div class="w-100 h-100 ml-4 mr-4 mb-4 scrollable-container">
			<table>
				<thead>
					<tr>
						<th class="describers" />
						{#each Array(numCols) as _, i}
							<th class="content describers">{String.fromCharCode(65 + i)}</th>
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
</main>

<style>
	table {
		border-collapse: collapse;
		background-color: azure;
	}

	table, th {
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
		background-color: #1E66F2;
		color: azure;
	}

	/* For Implementing Scroll Functionality */
	.scrollable-container { 
		overflow-x: auto; 
		overflow-y: auto; 
	}
</style>