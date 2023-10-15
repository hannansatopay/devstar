<script>
    import { Button, GradientButton, ButtonGroup } from 'flowbite-svelte';
  
    let isSpreadsheetOpen = false;
    let rowData = []; // To store user-entered data
    let numRows = 3;
    let numCols = 11;
  
    function toggleSpreadsheet() {
      isSpreadsheetOpen = !isSpreadsheetOpen;
    }
  
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
  
    // Function to add a new row above the clicked row
    function addRowAbove(rowIndex) {
      numRows++;
      rowData.splice(rowIndex, 0, Array(numCols).fill(''));
    }
  
    // Function to add a new column to the left of the clicked column
    function addColumnLeft(colIndex) {
      numCols++;
      rowData.forEach((row) => row.splice(colIndex, 0, ''));
    }
  </script>
  
  <main>
    {#if !isSpreadsheetOpen}
      <div class="flex justify-center items-center">
        <Button size="xl" outline color="blue" class="m-6">Upload Your Spreadsheet<br />(.csv)</Button>
        <GradientButton size="xl" color="blue" class="m-6" on:click={toggleSpreadsheet}>Create New Spreadsheet<br />(.csv)</GradientButton>
      </div>
    {:else}
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
  
    table, th, td {
      border: 1px solid black;
      padding: 8px;
      text-align: center;
    }
  
    .content {
      width: 125px;
      overflow-x: auto;
      white-space: nowrap;
    }
  
    .row-numbering {
      width: 35px;
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
  