<script>
  const aggregateOptions = ["", "COUNT", "SUM", "AVG", "MIN", "MAX"];

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
  let columnSettings = {};
  let distinctSelect = false;

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

  $: {
    const next = { ...columnSettings };
    selectedColumns.forEach((column) => {
      if (!next[column]) {
        next[column] = { aggregate: "", alias: "" };
      }
    });
    Object.keys(next).forEach((column) => {
      if (!selectedColumns.includes(column)) {
        delete next[column];
      }
    });
    columnSettings = next;
  }

  $: generateSQL();

  function buildSelectParts() {
    const parts = selectedColumns.map((column) => {
      const settings = columnSettings[column] ?? { aggregate: "", alias: "" };
      const base = `${selectedTable}.${column}`;
      const expression = settings.aggregate
        ? `${settings.aggregate}(${base})`
        : base;
      return settings.alias?.trim()
        ? `${expression} AS ${settings.alias.trim()}`
        : expression;
    });

    if (summarization.trim()) {
      parts.push(summarization.trim());
    }

    return parts;
  }

  function generateSQL() {
    if (!selectedTable) {
      generatedSQL = "Please select a table.";
      return;
    }

    const selectParts = buildSelectParts();
    if (!selectParts.length) {
      generatedSQL = "Please select at least one column.";
      return;
    }

    let baseQuery = `SELECT ${distinctSelect ? "DISTINCT " : ""}${selectParts.join(", ")} FROM ${selectedTable}`;

    if (joinTable && joinCondition.trim()) {
      baseQuery += ` ${joinType} ${joinTable} ON ${joinCondition.trim()}`;
    }

    if (filters.length) {
      const filterStrings = filters.map(
        (filter) => `${filter.column} ${filter.operator} '${filter.value}'`,
      );
      baseQuery += ` WHERE ${filterStrings.join(" AND ")}`;
    }

    if (groupBy.trim()) {
      baseQuery += ` GROUP BY ${groupBy.trim()}`;
    }

    if (sortBy) {
      baseQuery += ` ORDER BY ${sortBy} ${sortOrder}`;
    }

    generatedSQL = baseQuery;
  }

  function selectAllColumns() {
    if (!selectedTable) return;
    const available = columns[selectedTable] ?? [];
    if (selectedColumns.length === available.length) {
      selectedColumns = [];
    } else {
      selectedColumns = [...available];
    }
    generateSQL();
  }

  function addFilter() {
    if (!filterColumn || !filterValue.trim()) return;
    filters = [
      ...filters,
      {
        column: filterColumn,
        operator: filterOperator,
        value: filterValue.trim(),
      },
    ];
    filterColumn = "";
    filterOperator = "=";
    filterValue = "";
    generateSQL();
  }

  function removeFilter(index) {
    filters = filters.filter((_, i) => i !== index);
    generateSQL();
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
            Table &amp; Columns
          </h2>
          {#if selectedTable}
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500"
              >{selectedTable}</span
            >
          {/if}
        </div>

        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            class="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Table
            <select
              bind:value={selectedTable}
              on:change={() => {
                selectedColumns = [];
                generateSQL();
              }}
              class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            >
              <option value="" disabled selected>Select a table</option>
              {#each tables as table}
                <option value={table}>{table}</option>
              {/each}
            </select>
          </label>

          <label
            class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <input
              type="checkbox"
              class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              bind:checked={distinctSelect}
              on:change={() => generateSQL()}
            />
            DISTINCT
          </label>
        </div>

        {#if selectedTable}
          <div class="mt-4 space-y-3">
            <div
              class="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              <span>Columns</span>
              <button
                type="button"
                class="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
                on:click={selectAllColumns}
              >
                {selectedColumns.length ===
                (columns[selectedTable]?.length ?? 0)
                  ? "Clear"
                  : "Select all"}
              </button>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              {#each columns[selectedTable] ?? [] as column}
                <div
                  class="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
                >
                  <label
                    class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
                  >
                    <input
                      type="checkbox"
                      class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      bind:group={selectedColumns}
                      value={column}
                      on:change={() => generateSQL()}
                    />
                    {column}
                  </label>

                  {#if selectedColumns.includes(column)}
                    <div
                      class="mt-3 grid gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400 sm:grid-cols-2"
                    >
                      <label>
                        Aggregate
                        <select
                          bind:value={columnSettings[column].aggregate}
                          on:change={() => generateSQL()}
                          class="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                        >
                          {#each aggregateOptions as option}
                            <option value={option}>{option || "None"}</option>
                          {/each}
                        </select>
                      </label>
                      <label>
                        Alias
                        <input
                          bind:value={columnSettings[column].alias}
                          on:input={() => generateSQL()}
                          placeholder="Optional alias"
                          class="mt-1 w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                        />
                      </label>
                    </div>
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
          Join (optional)
        </h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          <label
            class="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Join table
            <select
              bind:value={joinTable}
              on:change={() => generateSQL()}
              class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            >
              <option value="" disabled selected>Select a table</option>
              {#each tables as table}
                {#if table !== selectedTable}
                  <option value={table}>{table}</option>
                {/if}
              {/each}
            </select>
          </label>
          <label
            class="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Join type
            <select
              bind:value={joinType}
              on:change={() => generateSQL()}
              class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            >
              <option value="INNER JOIN">INNER JOIN</option>
              <option value="LEFT JOIN">LEFT JOIN</option>
              <option value="RIGHT JOIN">RIGHT JOIN</option>
              <option value="FULL JOIN">FULL JOIN</option>
            </select>
          </label>
        </div>
        <label
          class="mt-3 block text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          Join condition
          <input
            type="text"
            bind:value={joinCondition}
            on:input={() => generateSQL()}
            placeholder="e.g., users.id = orders.user_id"
            class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          />
        </label>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
          Filters, sorting &amp; grouping
        </h2>
        <div class="mt-4 space-y-4">
          <div class="grid gap-3 sm:grid-cols-4">
            <select
              bind:value={filterColumn}
              class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            >
              <option value="" disabled selected>Select column</option>
              {#if selectedTable}
                {#each columns[selectedTable] ?? [] as column}
                  <option value={column}>{column}</option>
                {/each}
              {/if}
            </select>
            <select
              bind:value={filterOperator}
              class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            >
              <option value="=">=</option>
              <option value="!=">!=</option>
              <option value=">">&gt;</option>
              <option value="<">&lt;</option>
              <option value=">=">&gt;=</option>
              <option value="<=">&lt;=</option>
              <option value="LIKE">LIKE</option>
            </select>
            <input
              type="text"
              bind:value={filterValue}
              placeholder="Value"
              class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            />
            <button
              type="button"
              class="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              on:click={addFilter}>Add filter</button
            >
          </div>

          {#if filters.length}
            <div class="space-y-2">
              {#each filters as filter, index}
                <div
                  class="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                >
                  <span class="text-slate-700 dark:text-slate-200">
                    {filter.column}
                    {filter.operator}
                    {filter.value}
                  </span>
                  <button
                    type="button"
                    class="text-xs font-semibold text-rose-600 hover:underline dark:text-rose-300"
                    on:click={() => removeFilter(index)}>Remove</button
                  >
                </div>
              {/each}
            </div>
          {/if}

          <div class="grid gap-3 sm:grid-cols-2">
            <label
              class="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Sort by
              <select
                bind:value={sortBy}
                on:change={() => generateSQL()}
                class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              >
                <option value="">None</option>
                {#if selectedTable}
                  {#each columns[selectedTable] ?? [] as column}
                    <option value={column}>{column}</option>
                  {/each}
                {/if}
              </select>
            </label>
            <label
              class="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Direction
              <select
                bind:value={sortOrder}
                on:change={() => generateSQL()}
                class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              >
                <option value="ASC">ASC</option>
                <option value="DESC">DESC</option>
              </select>
            </label>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <label
              class="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Group by
              <select
                bind:value={groupBy}
                on:change={() => generateSQL()}
                class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              >
                <option value="">None</option>
                {#if selectedTable}
                  {#each columns[selectedTable] ?? [] as column}
                    <option value={column}>{column}</option>
                  {/each}
                {/if}
              </select>
            </label>
            <label
              class="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >
              Summarization
              <input
                type="text"
                bind:value={summarization}
                on:input={() => generateSQL()}
                placeholder="e.g. COUNT(id)"
                class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              />
            </label>
          </div>
        </div>
      </div>
    </div>

    <div
      class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <h2 class="text-xl font-semibold text-slate-900 dark:text-white">
          Generated SQL
        </h2>
        <div class="flex items-center gap-2">
          <button
            type="button"
            class="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            on:click={generateSQL}>Refresh</button
          >
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            on:click={() => navigator.clipboard?.writeText(generatedSQL)}
            disabled={!generatedSQL}>Copy</button
          >
        </div>
      </div>
      <textarea
        rows="16"
        readonly
        class="w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm text-slate-800 shadow-inner focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >{generatedSQL}</textarea
      >
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Tip: combine GROUP BY with aggregate functions (e.g., COUNT, SUM) to
        produce summaries per group.
      </p>
    </div>
  </div>
</section>
