<!-- EditableTable.svelte -->
<script>
    let rows = [
      { id: 1, name: 'John', age: 30 },
      { id: 2, name: 'Jane', age: 25 },
      // Add more initial rows as needed
    ];
  
    let editableRow = null;
  
    const editRow = (row) => {
      editableRow = { ...row };
    };
  
    const saveRow = () => {
      // Save the edited row and update the rows array
      const index = rows.findIndex((row) => row.id === editableRow.id);
      if (index !== -1) {
        rows[index] = { ...editableRow };
      }
      editableRow = null;
    };
  
    const cancelEdit = () => {
      editableRow = null;
    };
  </script>
  
  <!-- <style>
    /* Add your table styles here */
  </style> -->
  
  <table>
    <thead>
      <tr>
        <th>Name</th>
        <th>Age</th>
        <th>Action</th>
      </tr>
    </thead>
    <tbody>
      {#each rows as row (row.id)}
        <tr>
          {#if editableRow && editableRow.id === row.id}
            <td><input type="text" bind:value={editableRow.name} /></td>
            <td><input type="number" bind:value={editableRow.age} /></td>
            <td>
              <button on:click={saveRow}>Save</button>
              <button on:click={cancelEdit}>Cancel</button>
            </td>
          {:else}
            <td>{row.name}</td>
            <td>{row.age}</td>
            <td>
              <button on:click={() => editRow(row)}>Edit</button>
            </td>
          {/if}
        </tr>
      {/each}
    </tbody>
  </table>
  