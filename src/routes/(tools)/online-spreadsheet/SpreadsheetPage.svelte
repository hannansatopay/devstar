<script>
	import { Button, GradientButton } from 'flowbite-svelte';

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
        <Button size="xl" outline color="blue" class="m-6" on:click={toggleSpreadsheet}>Create a New Spreadsheet<br/>(.csv)</Button>
	    <GradientButton size="xl" color="blue" class="m-6">Open Existing Spreadsheet<br/>(.csv)</GradientButton>
    {:else}
        <Button size="xl" outline color="blue" class="m-6" on:click={goBack}>Back</Button>
    {/if}
    
    {#if isSpreadsheetOpen}
      <!-- <Button size="xl" outline color="blue" class="m-6" on:click={saveData}>Save Data</Button> -->
      <Button size="xl" outline color="blue" class="m-6" on:click={downloadSheet}>Download Sheet</Button>
      <table>
        <thead>
          <tr>
            <th class="untouch-field"></th> <!-- Empty cell for numbering -->
            <th class="content untouch-field">A</th>
            <th class="content untouch-field">B</th>
            <th class="content untouch-field">C</th>
            <th class="content untouch-field">D</th>
            <th class="content untouch-field">E</th>
            <!-- Add more headers as needed -->
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="row-numbering untouch-field">1</td> <!-- Numbered row -->
            <td contenteditable="true" class="content"></td>
            <td contenteditable="true" class="content"></td>
            <td contenteditable="true" class="content"></td>
            <td contenteditable="true" class="content"></td>
            <td contenteditable="true" class="content"></td>
            <!-- Add more cells as needed -->
          </tr>
          <!-- Add more rows as needed -->
          <tr>
            <td class="row-numbering untouch-field">2</td> <!-- Numbered row -->
            <td contenteditable="true" class="content"></td>
            <td contenteditable="true" class="content"></td>
            <td contenteditable="true" class="content"></td>
            <td contenteditable="true" class="content"></td>
            <td contenteditable="true" class="content"></td>
            <!-- Add more cells as needed -->
          </tr>
          <tr>
            <td class="row-numbering untouch-field">3</td> <!-- Numbered row -->
            <td contenteditable="true" class="content"></td>
            <td contenteditable="true" class="content"></td>
            <td contenteditable="true" class="content"></td>
            <td contenteditable="true" class="content"></td>
            <td contenteditable="true" class="content"></td>
            <!-- Add more cells as needed -->
          </tr>
        </tbody>
      </table>
    {/if}
  </main>
  
  <style>
    table {
      border-collapse: collapse;
      width: 100%;
      background-color: white;
    }
  
    table, th, td {
      border: 1px solid #000;
      padding: 8px;
    }

    .content {
        width: 125px;
        overflow-x: auto;
        white-space: nowrap;
    }

    .row-numbering {
        width: 35px;
    }

    .untouch-field {
        background-color: #c3bdbd;
    }
  </style>
  