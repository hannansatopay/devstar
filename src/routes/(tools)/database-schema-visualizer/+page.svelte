<script lang="ts">
  import { writable, derived, get } from "svelte/store";
  import Copy from "$lib/Copy.svelte";

  type Column = {
    id: string;
    name: string;
    type: string;
    nullable: boolean;
  };

  type Table = {
    id: string;
    name: string;
    notes: string;
    columns: Column[];
  };

  type Relationship = {
    id: string;
    type: "one-to-one" | "one-to-many" | "many-to-many";
    fromTableId: string;
    fromColumnId: string;
    toTableId: string;
    toColumnId: string;
    description: string;
  };

  const uid = () => Math.random().toString(36).slice(2, 10);

  const tables = writable<Table[]>([
    {
      id: uid(),
      name: "users",
      notes: "Primary account records",
      columns: [
        { id: uid(), name: "id", type: "uuid", nullable: false },
        { id: uid(), name: "email", type: "varchar(255)", nullable: false },
        { id: uid(), name: "created_at", type: "timestamptz", nullable: false },
      ],
    },
    {
      id: uid(),
      name: "projects",
      notes: "Collaborative projects owned by users",
      columns: [
        { id: uid(), name: "id", type: "uuid", nullable: false },
        { id: uid(), name: "owner_id", type: "uuid", nullable: false },
        { id: uid(), name: "title", type: "varchar(160)", nullable: false },
      ],
    },
  ]);

  const relationships = writable<Relationship[]>([
    {
      id: uid(),
      type: "one-to-many",
      fromTableId: get(tables)[0].id,
      fromColumnId: get(tables)[0].columns[0].id,
      toTableId: get(tables)[1].id,
      toColumnId: get(tables)[1].columns[1].id,
      description: "A user can own many projects",
    },
  ]);

  const schemaJSON = derived(
    [tables, relationships],
    ([$tables, $relationships]) =>
      JSON.stringify(
        {
          tables: $tables,
          relationships: $relationships,
        },
        null,
        2,
      ),
  );

  const schemaStats = derived(
    [tables, relationships],
    ([$tables, $relationships]) => {
      const totalColumns = $tables.reduce(
        (sum, table) => sum + table.columns.length,
        0,
      );
      return {
        tables: $tables.length,
        columns: totalColumns,
        relationships: $relationships.length,
      };
    },
  );

  const relationshipViews = derived(
    [relationships, tables],
    ([$relationships, $tables]) =>
      $relationships.map((relation) => {
        const fromTable = $tables.find(
          (table) => table.id === relation.fromTableId,
        );
        const toTable = $tables.find(
          (table) => table.id === relation.toTableId,
        );
        const fromColumn = fromTable?.columns.find(
          (column) => column.id === relation.fromColumnId,
        );
        const toColumn = toTable?.columns.find(
          (column) => column.id === relation.toColumnId,
        );
        return {
          ...relation,
          fromTable,
          toTable,
          fromColumn,
          toColumn,
        };
      }),
  );

  let tableForm = {
    name: "",
    notes: "",
  };

  let relationshipForm = {
    type: "one-to-many" as Relationship["type"],
    fromTableId: get(tables)[0]?.id ?? "",
    fromColumnId: get(tables)[0]?.columns[0]?.id ?? "",
    toTableId: get(tables)[1]?.id ?? "",
    toColumnId: get(tables)[1]?.columns[1]?.id ?? "",
    description: "",
  };

  let columnDrafts: Record<
    string,
    { name: string; type: string; nullable: boolean }
  > = {};

  $: availableTables = get(tables);

  $: if (availableTables.length && !relationshipForm.fromTableId) {
    relationshipForm = {
      ...relationshipForm,
      fromTableId: availableTables[0].id,
      fromColumnId: availableTables[0].columns[0]?.id ?? "",
    };
  }

  $: if (availableTables.length > 1 && !relationshipForm.toTableId) {
    relationshipForm = {
      ...relationshipForm,
      toTableId: availableTables[1].id,
      toColumnId: availableTables[1].columns[0]?.id ?? "",
    };
  }

  function setColumnDraft(
    tableId: string,
    draft: Partial<{ name: string; type: string; nullable: boolean }>,
  ) {
    const current = columnDrafts[tableId] ?? {
      name: "",
      type: "varchar(255)",
      nullable: false,
    };
    columnDrafts = {
      ...columnDrafts,
      [tableId]: {
        ...current,
        ...draft,
      },
    };
  }

  function toggleDraftNullable(tableId: string, event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    setColumnDraft(tableId, { nullable: input.checked });
  }

  function addTable() {
    if (!tableForm.name.trim()) return;
    const id = uid();
    tables.update((list) => [
      ...list,
      {
        id,
        name: tableForm.name.trim(),
        notes: tableForm.notes.trim(),
        columns: [{ id: uid(), name: "id", type: "uuid", nullable: false }],
      },
    ]);
    tableForm = { name: "", notes: "" };
  }

  function removeTable(id: string) {
    tables.update((list) => list.filter((table) => table.id !== id));
    relationships.update((list) =>
      list.filter((rel) => rel.fromTableId !== id && rel.toTableId !== id),
    );
    const draftCopy = { ...columnDrafts };
    delete draftCopy[id];
    columnDrafts = draftCopy;
  }

  function addColumn(tableId: string) {
    const draft = columnDrafts[tableId] ?? {
      name: "",
      type: "varchar(255)",
      nullable: false,
    };
    if (!draft.name.trim()) return;
    tables.update((list) =>
      list.map((table) =>
        table.id === tableId
          ? {
              ...table,
              columns: [
                ...table.columns,
                {
                  id: uid(),
                  name: draft.name.trim(),
                  type: draft.type.trim() || "varchar(255)",
                  nullable: draft.nullable,
                },
              ],
            }
          : table,
      ),
    );
    setColumnDraft(tableId, { name: "" });
  }

  function removeColumn(tableId: string, columnId: string) {
    tables.update((list) =>
      list.map((table) =>
        table.id === tableId
          ? {
              ...table,
              columns: table.columns.filter((column) => column.id !== columnId),
            }
          : table,
      ),
    );
    relationships.update((list) =>
      list.filter(
        (rel) => rel.fromColumnId !== columnId && rel.toColumnId !== columnId,
      ),
    );
  }

  function addRelationship() {
    const {
      fromTableId,
      fromColumnId,
      toTableId,
      toColumnId,
      type,
      description,
    } = relationshipForm;
    if (!fromTableId || !fromColumnId || !toTableId || !toColumnId) return;
    if (fromTableId === toTableId && fromColumnId === toColumnId) return;

    relationships.update((list) => [
      ...list,
      {
        id: uid(),
        type,
        fromTableId,
        fromColumnId,
        toTableId,
        toColumnId,
        description: description.trim(),
      },
    ]);

    relationshipForm = {
      ...relationshipForm,
      description: "",
    };
  }

  function removeRelationship(id: string) {
    relationships.update((list) => list.filter((rel) => rel.id !== id));
  }

  function columnsFor(tableId: string) {
    return get(tables).find((table) => table.id === tableId)?.columns ?? [];
  }
</script>

<section class="space-y-6">
  <div
    class="mx-auto grid w-full max-w-6xl gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
  >
    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-center justify-between gap-4">
          <Copy text={$schemaJSON} label="Copy JSON" floating={false} />
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-3">
          <div
            class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
          >
            <p class="text-xs uppercase tracking-wide opacity-70">Tables</p>
            <p
              class="mt-1 text-2xl font-semibold text-slate-900 dark:text-white"
            >
              {$schemaStats.tables}
            </p>
          </div>
          <div
            class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
          >
            <p class="text-xs uppercase tracking-wide opacity-70">Columns</p>
            <p
              class="mt-1 text-2xl font-semibold text-slate-900 dark:text-white"
            >
              {$schemaStats.columns}
            </p>
          </div>
          <div
            class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
          >
            <p class="text-xs uppercase tracking-wide opacity-70">
              Relationships
            </p>
            <p
              class="mt-1 text-2xl font-semibold text-slate-900 dark:text-white"
            >
              {$schemaStats.relationships}
            </p>
          </div>
        </div>

        <div class="mt-6 grid gap-4">
          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Table name</span
            >
            <input
              class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
              placeholder="e.g. invoices"
              bind:value={tableForm.name}
            />
          </label>
          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Notes</span
            >
            <textarea
              class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
              rows="2"
              bind:value={tableForm.notes}
              placeholder="Optional description"
            ></textarea>
          </label>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-2xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            on:click={addTable}
          >
            Add table
          </button>
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 class="text-lg font-semibold">New relationship</h2>
        <div class="mt-4 grid gap-4">
          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Cardinality</span
            >
            <select
              class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
              bind:value={relationshipForm.type}
            >
              <option value="one-to-one">One to One</option>
              <option value="one-to-many">One to Many</option>
              <option value="many-to-many">Many to Many</option>
            </select>
          </label>

          <div class="grid gap-3 sm:grid-cols-2">
            <label class="flex flex-col gap-2">
              <span
                class="text-xs font-semibold uppercase tracking-wide opacity-70"
                >From table</span
              >
              <select
                class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
                bind:value={relationshipForm.fromTableId}
              >
                {#each availableTables as table}
                  <option value={table.id}>{table.name}</option>
                {/each}
              </select>
            </label>
            <label class="flex flex-col gap-2">
              <span
                class="text-xs font-semibold uppercase tracking-wide opacity-70"
                >From column</span
              >
              <select
                class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline:none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
                bind:value={relationshipForm.fromColumnId}
              >
                {#each columnsFor(relationshipForm.fromTableId) as column}
                  <option value={column.id}>{column.name}</option>
                {/each}
              </select>
            </label>
          </div>

          <div class="grid gap-3 sm:grid-cols-2">
            <label class="flex flex-col gap-2">
              <span
                class="text-xs font-semibold uppercase tracking-wide opacity-70"
                >To table</span
              >
              <select
                class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
                bind:value={relationshipForm.toTableId}
              >
                {#each availableTables as table}
                  <option value={table.id}>{table.name}</option>
                {/each}
              </select>
            </label>
            <label class="flex flex-col gap-2">
              <span
                class="text-xs font-semibold uppercase tracking-wide opacity-70"
                >To column</span
              >
              <select
                class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline:none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
                bind:value={relationshipForm.toColumnId}
              >
                {#each columnsFor(relationshipForm.toTableId) as column}
                  <option value={column.id}>{column.name}</option>
                {/each}
              </select>
            </label>
          </div>

          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Notes</span
            >
            <input
              class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
              placeholder="Optional description"
              bind:value={relationshipForm.description}
            />
          </label>

          <button
            type="button"
            class="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            on:click={addRelationship}
          >
            Link tables
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div class="grid gap-6 md:grid-cols-2">
        {#each $tables as table (table.id)}
          <article
            class="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-blue-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-500/60"
          >
            <header class="flex items-start justify-between gap-4">
              <div>
                <h3 class="text-lg font-semibold">{table.name}</h3>
                {#if table.notes}
                  <p class="text-xs opacity-70">{table.notes}</p>
                {/if}
              </div>
              <button
                type="button"
                class="text-xs font-semibold text-rose-500 transition hover:text-rose-600"
                on:click={() => removeTable(table.id)}
              >
                Remove
              </button>
            </header>

            <ul class="space-y-2">
              {#each table.columns as column (column.id)}
                <li
                  class="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/60"
                >
                  <div class="space-y-1">
                    <p class="font-semibold">{column.name}</p>
                    <p class="text-xs opacity-70">
                      {column.type}{column.nullable ? " (nullable)" : ""}
                    </p>
                  </div>
                  <button
                    type="button"
                    class="text-xs font-semibold text-rose-500 transition hover:text-rose-600"
                    on:click={() => removeColumn(table.id, column.id)}
                  >
                    Delete
                  </button>
                </li>
              {/each}
            </ul>

            <div
              class="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm dark:border-slate-600 dark:bg-slate-900/40"
            >
              <p
                class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >
                Add column
              </p>
              <div class="mt-3 grid gap-3">
                <input
                  class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Column name"
                  value={(columnDrafts[table.id] ?? { name: "" }).name}
                  on:input={(event) =>
                    setColumnDraft(table.id, {
                      name: event.currentTarget.value,
                    })}
                />
                <input
                  class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
                  placeholder="Column type"
                  value={(columnDrafts[table.id] ?? { type: "varchar(255)" })
                    .type}
                  on:input={(event) =>
                    setColumnDraft(table.id, {
                      type: event.currentTarget.value,
                    })}
                />
                <label
                  class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide"
                >
                  <input
                    type="checkbox"
                    class="h-4 w-4 accent-blue-500"
                    checked={(columnDrafts[table.id] ?? { nullable: false })
                      .nullable}
                    on:change={(event) => toggleDraftNullable(table.id, event)}
                  />
                  Nullable
                </label>
                <button
                  type="button"
                  class="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 dark:bg-blue-500 dark:hover:bg-blue-600"
                  on:click={() => addColumn(table.id)}
                >
                  Add column
                </button>
              </div>
            </div>
          </article>
        {/each}
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 class="text-lg font-semibold">Relationships</h2>
        {#if $relationships.length === 0}
          <p class="mt-4 text-sm opacity-70">No relationships defined yet.</p>
        {:else}
          <ul class="mt-4 space-y-3">
            {#each $relationshipViews as relation (relation.id)}
              <li
                class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/60"
              >
                <div class="flex flex-wrap items-center gap-2">
                  <span
                    class="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/15 dark:text-blue-200"
                  >
                    {relation.type}
                  </span>
                  <p class="font-semibold">
                    {relation.fromTable?.name}.{relation.fromColumn?.name} → {relation
                      .toTable?.name}.{relation.toColumn?.name}
                  </p>
                </div>
                {#if relation.description}
                  <p class="mt-2 text-xs opacity-70">{relation.description}</p>
                {/if}
                <button
                  type="button"
                  class="mt-2 text-xs font-semibold text-rose-500 transition hover:text-rose-600"
                  on:click={() => removeRelationship(relation.id)}
                >
                  Remove
                </button>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
  </div>
</section>
