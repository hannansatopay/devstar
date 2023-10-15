<script>
  import { onMount } from 'svelte';
  import { Button, GradientButton, ButtonGroup, } from 'flowbite-svelte';
  import * as XLSX from 'xlsx';

<<<<<<< Updated upstream
  let isSpreadsheetOpen = false;
  let rowData = [];
  let numRows = 8;
  let numCols = 11;
  let selectedCell = null;
=======
	let isSpreadsheetOpen = false;
	let rowData = []; // To store user-entered data
	let numRows = 8;
	let numCols = 13;
	let index = 1;
>>>>>>> Stashed changes

  onMount(() => {
    // Initialize rowData with empty strings
    rowData = Array.from({ length: numRows }, () => Array(numCols).fill(''));
  });

  function toggleSpreadsheet() {
    isSpreadsheetOpen = !isSpreadsheetOpen;

    // Reset selectedCell when toggling
    selectedCell = null;
  }

  function handleFileUpload() {
    document.getElementById('fileInput').click();
  }

  function handleFileChange(event) {
    const file = event.target.files[0];
    if (file) {
      parseExcel(file);
    }
  }

  function parseExcel(file) {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      // Set numRows and numCols based on parsed data
      numRows = jsonData.length;
      numCols = Math.max(...jsonData.map(row => row.length));

      // Initialize rowData with parsed data
      rowData = jsonData.map(row => {
        const emptyCells = Array(numCols - row.length).fill('');
        return row.concat(emptyCells);
      });

      isSpreadsheetOpen = true;
    };

    reader.readAsArrayBuffer(file);
  }

  function downloadSheet() {
    const data = rowData.map(row => row.join(',')).join('\n');
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

  function addColumn() {
    if (selectedCell) {
      const colIndex = selectedCell.cellIndex;
      rowData.forEach(row => row.splice(colIndex + 1, 0, ''));
      numCols++;
    } else {
      // If selectedCell is not set, add a column at the end
      rowData.forEach(row => row.push(''));
      numCols++;
    }
  }

  function selectCell(event) {
    selectedCell = event.target;
  }
</script>

<main>
  {#if !isSpreadsheetOpen}
    <div class="flex justify-center items-center">
      <input type="file" accept=".xlsx" id="fileInput" style="display: none" on:change={handleFileChange} />
      <Button size="xl" color="blue" class="m-6" on:click={handleFileUpload}>Upload New Spreadsheet<br />(.xlsx)</Button>
      <GradientButton size="xl" color="blue" class="m-6" on:click={toggleSpreadsheet}>Create New Spreadsheet<br />(.csv)</GradientButton>
    </div>
  {/if}

  {#if isSpreadsheetOpen}
    <div class="flex justify-center item-center mt-4 ml-4 mr-4">
      <ButtonGroup>
        <GradientButton size="md" color="blue" class="mb-4" on:click={downloadSheet}>Download Sheet</GradientButton>
        <Button size="md" outline color="blue" class="mb-4" on:click={addRow}>Add Row</Button>
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
                <td contenteditable="true" class="content" on:click={selectCell}>{rowData[rowIndex][colIndex]}</td>
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
    border: 1px solid black;
    padding: 8px;
    color: #1E1818;
  }
  td {
    padding: 12px;
    border: 1px solid black;
  }
  .content {
    width: 125px;
    overflow-x: auto;
    white-space: nowrap;
  }
  .row-numbering {
    width: 35px;
    border: 1px solid black;
  }
  .describers {
    background-color: #1E66F2;
    color: azure;
  }
  .scrollable-container {
    overflow-x: auto;
    overflow-y: auto;
  }
</style>
