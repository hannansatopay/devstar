<script>
  let tables = ["users", "orders", "products", "customers", "employees"];
  let columns = {
    users: ["id", "name", "email", "address", "phone"],
    orders: ["order_id", "user_id", "product_id", "quantity", "order_date"],
    products: ["product_id", "product_name", "price", "stock"],
    customers: ["customer_id", "customer_name", "email", "address"],
    employees: ["employee_id", "employee_name", "position", "salary"],
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

  $: generateSQL();

  function generateSQL() {
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
  }
  function selectAllColumns() {
    if (selectedTable) {
      if (selectedColumns.length === columns[selectedTable].length) {
        selectedColumns = [];
      } else {
        selectedColumns = [...columns[selectedTable]];
      }
    }
  }
  function addFilter() {
    if (filterColumn && filterValue) {
      filters = [
        ...filters,
        { column: filterColumn, operator: filterOperator, value: filterValue },
      ];
      filterColumn = "";
      filterOperator = "=";
      filterValue = "";
    }
  }

  function removeFilter(index) {
    filters = filters.filter((_, i) => i !== index);
  }
</script>

<hr
  class="w-full h-0.5 mx-auto bg-gray-100 border-0 rounded mt-0 mb-10 dark:bg-gray-800"
/>
<div class="container">
  <div class="left-pane">
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <label
      class="block mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
      >Table - {selectedTable}</label
    >
    <hr
      class="w-69 h-0.5 mx-auto my-4 bg-gray-100 border-0 rounded ml-0 md:my-5 dark:bg-gray-800"
    />
    <label
      for="table"
      class="block mb-4 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Select Table
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
        class="block mt-4 mb-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white"
      >
        Select Columns
      </label>
      <div
        id="columns"
        class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white"
      >
        <div>
          <input
            type="checkbox"
            on:change={() => {
              selectAllColumns();
              generateSQL();
            }}
            checked={selectedColumns.length === columns[selectedTable].length}
          />
          <label>Select All</label>
        </div>
        {#each columns[selectedTable] as column}
          <div>
            <input
              type="checkbox"
              bind:group={selectedColumns}
              value={column}
              on:change={() => generateSQL()}
            />
            <label>{column}</label>
          </div>
        {/each}
      </div>
    {/if}

    <label
      for="joinTable"
      class="block mt-4 mb-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Join Table (optional)
    </label>
    <select
      id="joinTable"
      bind:value={joinTable}
      on:change={() => generateSQL()}
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option value="" disabled selected>Select a table</option>
      {#each tables as table}
        <option value={table}>{table}</option>
      {/each}
    </select>

    <label
      for="joinType"
      class="block mt-4 mb-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Join Type
    </label>
    <select
      id="joinType"
      bind:value={joinType}
      on:change={() => generateSQL()}
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option value="INNER JOIN">INNER JOIN</option>
      <option value="LEFT JOIN">LEFT JOIN</option>
      <option value="RIGHT JOIN">RIGHT JOIN</option>
      <option value="FULL JOIN">FULL JOIN</option>
    </select>

    <label
      for="joinCondition"
      class="block mt-4 mb-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Join Condition (optional)
    </label>
    <input
      type="text"
      id="joinCondition"
      bind:value={joinCondition}
      on:input={() => generateSQL()}
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      placeholder="e.g., users.id = orders.user_id"
    />

    <label
      for="filters"
      class="block mt-4 mb-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Filters (optional)
    </label>
    <div
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white"
    >
      <div>
        <select
          bind:value={filterColumn}
          on:change={() => generateSQL()}
          class="filter-dropdown mb-2 w-full text-gray-900 bg-gray-50 border border-gray-100 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
        >
          <option value="" disabled selected>Select column</option>
          {#each selectedTable ? columns[selectedTable] : [] as column}
            <option value={column}>{column}</option>
          {/each}
        </select>
        <select
          bind:value={filterOperator}
          on:change={() => generateSQL()}
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
          on:input={() => generateSQL()}
          class="filter-input mb-2 w-full p-2.5 text-sm text-gray-900 bg-gray-50 border border-gray-100 rounded-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white"
          placeholder="Value"
        />
        <button
          type="button"
          on:click={() => {
            addFilter();
            generateSQL();
          }}
          class="add-filter-btn text-white bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-2.5 py-1 text-center"
          >Add Filter</button
        >
      </div>

      {#each filters as filter, index}
        <div class="filter-row mb-2 flex items-center">
          <span>{filter.column} {filter.operator} {filter.value}</span>
          <button
            type="button"
            on:click={() => {
              removeFilter(index);
              generateSQL();
            }}
            class="remove-filter-btn text-white bg-red-500 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-2.5 py-1 text-center ml-2"
            >Remove</button
          >
        </div>
      {/each}
    </div>

    <label
      for="sortBy"
      class="block mt-4 mb-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Sort By (optional)
    </label>
    <select
      id="sortBy"
      bind:value={sortBy}
      on:change={() => generateSQL()}
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option value="" disabled selected>Select column</option>
      {#each selectedTable ? columns[selectedTable] : [] as column}
        <option value={column}>{column}</option>
      {/each}
    </select>

    <label
      for="sortOrder"
      class="block mt-2 mb-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Sort Order
    </label>
    <select
      id="sortOrder"
      bind:value={sortOrder}
      on:change={() => generateSQL()}
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option value="ASC">ASC</option>
      <option value="DESC">DESC</option>
    </select>

    <label
      for="groupBy"
      class="block mt-4 mb-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Group By (optional)
    </label>
    <select
      id="groupBy"
      bind:value={groupBy}
      on:change={() => generateSQL()}
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
    >
      <option value="" disabled selected>Select column</option>
      {#each selectedTable ? columns[selectedTable] : [] as column}
        <option value={column}>{column}</option>
      {/each}
    </select>

    <label
      for="summarization"
      class="block mt-4 mb-2 text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Summarization (optional)
    </label>
    <input
      type="text"
      id="summarization"
      bind:value={summarization}
      on:input={() => generateSQL()}
      class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      placeholder="e.g., COUNT(id), SUM(price)"
    />
  </div>
  <div
    class="h-100 w-0.5 my-4 mx-auto bg-gray-100 rounded ml-0 md:ml-7 dark:bg-gray-800"
  ></div>

  <div class="right-pane">
    <h2
      class="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      Generated SQL Query
    </h2>
    <textarea
      class="block wid p-4 mt-4 text-lg text-gray-900 bg-gray-50 rounded-lg border border-gray-100 dark:bg-gray-800 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white resize-none"
      rows="38.5"
      cols="105"
      readonly>{generatedSQL}</textarea
    >
  </div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }
  .left-pane {
    width: 25%;
  }
  .right-pane {
    width: 70%;
  }
  .filter-dropdown {
    display: block;
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .filter-input {
    display: block;
    width: 100%;
    padding: 0.5rem;
    margin-bottom: 0.5rem;
  }
  .add-filter-btn,
  .remove-filter-btn {
    display: inline-block;
    padding: 0.5rem 1rem;
    margin-bottom: 0.5rem;
  }
</style>
