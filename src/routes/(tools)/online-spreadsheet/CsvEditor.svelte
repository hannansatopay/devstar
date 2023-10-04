<!-- CsvEditor.svelte -->
<script>
    let csvData = '';
    let parsedData = [];
    let isEditing = false;
  
    const handleFileInputChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          csvData = e.target.result;
          parseCSV();
        };
        reader.readAsText(file);
      }
    };
  
    const parseCSV = () => {
      parsedData = csvData
        .trim()
        .split('\n')
        .map((row) => row.split(','))
        .map((cols) => cols.map((col) => col.trim()));
    };
  
    const startEditing = () => {
      isEditing = true;
    };
  
    const saveEditing = () => {
      // Update csvData and parsedData as needed
      isEditing = false;
    };
  
    const cancelEditing = () => {
      isEditing = false;
    };
</script>

<style>
    /* Styling for the container */
    .csv-editor {
        max-width: 600px;
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #ccc;
        border-radius: 8px;
        background-color: white;
    }

    /* Styling for the buttons */
    .btn {
        margin-top: 10px;
    }

    /* Styling for the table */
    table {
        width: 100%;
        border-collapse: collapse;
    }

    th,
    td {
        padding: 8px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    th {
        background-color: #f2f2f2;
        font-weight: bold;
    }

    td[contenteditable='true'] {
        outline: none;
    }

    /* Styling for editable cells */
    td[contenteditable='true']:focus {
        background-color: #f0fff4; /* Example: Light green background when editing */
        border: 1px solid #48bb78; /* Example: Green border when editing */
    }
</style>
  
<div>
    <input type="file" accept=".csv" on:change={handleFileInputChange} />
    <button on:click={startEditing} class="bg-blue-500 text-white py-2 px-4 rounded mt-2" disabled={!csvData}>
      Edit CSV
    </button>
  
    {#if parsedData.length > 0}
      <table>
        <thead>
          <tr>
            {#each parsedData[0] as header (header)}
              <th>{header}</th>
            {/each}
          </tr>
        </thead>
        <tbody>
          {#each parsedData.slice(1) as row (row)}
            <tr>
              {#each row as col (col)}
                <td contenteditable={isEditing} class="border p-2">{col}</td>
              {/each}
            </tr>
          {/each}
        </tbody>
      </table>
      {#if isEditing}
        <button on:click={saveEditing} class="bg-green-500 text-white py-2 px-4 rounded mt-2">Save</button>
        <button on:click={cancelEditing} class="bg-red-500 text-white py-2 px-4 rounded mt-2">Cancel</button>
      {/if}
    {/if}
</div>
  