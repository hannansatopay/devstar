<script>
	import { Button, GradientButton, ButtonGroup } from 'flowbite-svelte';

	let isSpreadsheetOpen = false;
	let rowData = []; // To store user-entered data

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
				<Button size="md" outline color="blue" class="mb-4">Add Row</Button>
				<!-- For Future Implementation -->
				<!-- 
				<Button size="xl" color="blue" class="mb-4"><b>Bold</b></Button>
				<Button size="xl" outline color="blue" class="mb-4"><u>Underline</u></Button>
				<Button size="xl" color="blue" class="mb-4"><i>Italic</i></Button>
				 -->
				<Button size="md" outline color="blue" class="mb-4">Add Column</Button>
				<GradientButton size="md" color="blue" class="mb-4" on:click={goBack}>Back</GradientButton>
			</ButtonGroup>
		</div>

		<div class="w-100 h-100 ml-4 mr-4 mb-4 scrollable-container">
			<table>
				<thead>
					<tr>
						<th class="describers" />
						<!-- Empty cell for numbering -->
						<th class="content describers">A</th>
						<th class="content describers">B</th>
						<th class="content describers">C</th>
						<th class="content describers">D</th>
						<th class="content describers">E</th>
						<th class="content describers">F</th>
						<th class="content describers">G</th>
						<th class="content describers">H</th>
						<th class="content describers">I</th>
						<th class="content describers">J</th>
						<th class="content describers">K</th>
						<!-- Add more headers as needed -->
					</tr>
				</thead>
				<tbody>
					<tr>
						<td class="row-numbering describers"><b>1</b></td>
						<!-- Numbered row -->
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<!-- Add more cells as needed -->
					</tr>
					<!-- Add more rows as needed -->
					<tr>
						<td class="row-numbering describers"><b>2</b></td>
						<!-- Numbered row -->
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<!-- Add more cells as needed -->
					</tr>
					<tr>
						<td class="row-numbering describers"><b>3</b></td>
						<!-- Numbered row -->
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<td contenteditable="true" class="content" />
						<!-- Add more cells as needed -->
					</tr>
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
