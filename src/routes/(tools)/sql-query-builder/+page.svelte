<script>
  import { onMount } from "svelte";

  let tables = ["users", "orders", "products"];
  let columns = {
    users: ["id", "name", "email"],
    orders: ["order_id", "user_id", "product_id", "quantity"],
    products: ["product_id", "product_name", "price"],
  };
  let selectedTable = "";
  let selectedColumns = [];
  let joinTable = "";
  let joinType = "INNER JOIN";
  let joinCondition = "";
  let filters = [];
  let filterColumn = "";
  let filterOperator = "=";
  let filterValue = "";
  let sortBy = "";
  let sortOrder = "ASC";
  let groupBy = "";
  let summarization = "";
  let generatedSQL = "";

  const generateSQL = () => {
    if (!selectedTable || selectedColumns.length === 0) {
      generatedSQL = "Please select a table and columns.";
      return;
    }

    let baseQuery = `SELECT ${selectedColumns.join(", ")} FROM ${selectedTable}`;

    if (joinTable && joinCondition) {
      baseQuery += ` ${joinType} ${joinTable} ON ${joinCondition}`;
    }

    if (filters.length > 0) {
      const filterStrings = filters.map(
        (filter) => `${filter.column} ${filter.operator} '${filter.value}'`
      );
      baseQuery += ` WHERE ${filterStrings.join(" AND ")}`;
    }

    if (groupBy) {
      baseQuery += ` GROUP BY ${groupBy}`;
    }

    if (summarization) {
      baseQuery += `, ${summarization}`;
    }

    if (sortBy) {
      baseQuery += ` ORDER BY ${sortBy} ${sortOrder}`;
    }

    generatedSQL = baseQuery;
  };

  const addFilter = () => {
    if (filterColumn && filterValue) {
      filters.push({
        column: filterColumn,
        operator: filterOperator,
        value: filterValue,
      });
      filterColumn = "";
      filterOperator = "=";
      filterValue = "";
    }
  };

  const removeFilter = (index) => {
    filters.splice(index, 1);
  };

  onMount(() => {
    // Set initial values or fetch initial data if needed
  });
</script>

<div class="container">
  <div class="left-pane">
    <label
      for="table"
      class="block mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      <span class="flex items-center">
        Select Table
        <img
          src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png"
          alt="Rocket"
          width="35"
          height="35"
          class="ml-3"
        />
      </span>
    </label>
    <select
      id="table"
      bind:value={selectedTable}
      on:change={() => (selectedColumns = [])}
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option value="" disabled selected>Select a table</option>
      {#each tables as table}
        <option value={table}>{table}</option>
      {/each}
    </select>

    {#if selectedTable}
      <label
        for="columns"
        class="block mt-4 mb-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
      >
        Select Columns
      </label>
      <div
        id="columns"
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white"
      >
        {#each columns[selectedTable] as column}
          <div>
            <input
              type="checkbox"
              bind:group={selectedColumns}
              value={column}
            />
            <label>{column}</label>
          </div>
        {/each}
      </div>
    {/if}

    <label
      for="joinTable"
      class="block mt-4 mb-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Join Table (optional)
    </label>
    <select
      id="joinTable"
      bind:value={joinTable}
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option value="" disabled selected>Select a table</option>
      {#each tables as table}
        <option value={table}>{table}</option>
      {/each}
    </select>

    <label
      for="joinType"
      class="block mt-4 mb-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Join Type
    </label>
    <select
      id="joinType"
      bind:value={joinType}
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option value="INNER JOIN">INNER JOIN</option>
      <option value="LEFT JOIN">LEFT JOIN</option>
      <option value="RIGHT JOIN">RIGHT JOIN</option>
      <option value="FULL JOIN">FULL JOIN</option>
    </select>

    <label
      for="joinCondition"
      class="block mt-4 mb-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Join Condition (optional)
    </label>
    <input
      type="text"
      id="joinCondition"
      bind:value={joinCondition}
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      placeholder="e.g., users.id = orders.user_id"
    />

    <label
      for="filters"
      class="block mt-4 mb-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Filters (optional)
    </label>
    <div
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white"
    >
      <div>
        <select
          bind:value={filterColumn}
          class="filter-dropdown mb-2 w-full text-gray-900 bg-gray-50 border border-gray-100 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="" disabled selected>Select column</option>
          {#each selectedTable ? columns[selectedTable] : [] as column}
            <option value={column}>{column}</option>
          {/each}
        </select>
        <select
          bind:value={filterOperator}
          class="filter-dropdown mb-2 w-full text-gray-900 bg-gray-50 border border-gray-100 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="=">=</option>
          <option value="!=">!=</option>
          <option value="<">Less Than</option>
          <option value="<=">Less Than Equal to</option>
          <option value=">">Greater Than</option>
          <option value=">=">Greater Than Equal to</option>
          <option value="LIKE">LIKE</option>
          <option value="IN">IN</option>
          <option value="BETWEEN">BETWEEN</option>
        </select>
        <input
          type="text"
          bind:value={filterValue}
          class="filter-input mb-2 w-full p-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-100 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="Value"
        />
        <button
          type="button"
          on:click={addFilter}
          class="add-filter-btn text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2.5 py-1 text-center mb-2"
          >Add Filter</button
        >
      </div>
      {#each filters as filter, index}
        <div class="filter-item mb-2">
          {filter.column}
          {filter.operator}
          {filter.value}
          <button
            type="button"
            on:click={() => removeFilter(index)}
            class="remove-filter-btn text-white bg-red-500 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-2.5 py-1 text-center ml-1 mb-2"
            >Remove</button
          >
        </div>
      {/each}
    </div>

    <label
      for="groupBy"
      class="block mt-4 mb-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Group By (optional)
    </label>
    <select
      id="groupBy"
      bind:value={groupBy}
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option value="" disabled selected>Select a column</option>
      {#each selectedTable ? columns[selectedTable] : [] as column}
        <option value={column}>{column}</option>
      {/each}
    </select>

    <label
      for="sortBy"
      class="block mt-4 mb-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Sort By (optional)
    </label>
    <select
      id="sortBy"
      bind:value={sortBy}
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option value="" disabled selected>Select a column</option>
      {#each selectedTable ? columns[selectedTable] : [] as column}
        <option value={column}>{column}</option>
      {/each}
    </select>

    <label
      for="sortOrder"
      class="block mt-4 mb-2 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Sort Order (optional)
    </label>
    <select
      id="sortOrder"
      bind:value={sortOrder}
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option value="ASC">Ascending</option>
      <option value="DESC">Descending</option>
    </select>
    <button
      type="button"
      on:click={generateSQL}
      class="generate-sql-btn text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center mb-4 mt-5"
      >Generate SQL</button
    >
  </div>

  <div class="right-pane">
    <div
      class="generated-sql text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 p-4 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
    >
      {generatedSQL}
    </div>
  </div>
</div>

<style>
  .container {
    display: flex;
    gap: 20px;
    padding: 20px;
  }
  .left-pane,
  .right-pane {
    flex: 1;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background-color: transparent;
  }
  .left-pane {
    flex: 2;
  }
  .right-pane {
    flex: 1;
  }
  .filter-dropdown,
  .filter-input,
  .add-filter-btn,
  .remove-filter-btn {
    margin-top: 10px;
  }
  .add-filter-btn,
  .remove-filter-btn {
    display: block;
  }
</style>
