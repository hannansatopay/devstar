<script lang="ts">
  import { faker } from "@faker-js/faker";
  import { v4 as uuidv4 } from "uuid";

  type ColumnType = "text" | "number" | "email" | "phone" | "date" | "boolean";

  type Column = {
    id: string;
    name: string;
    type: ColumnType;
  };

  type Row = Record<string, string>;

  const typeOptions: { value: ColumnType; label: string }[] = [
    { value: "text", label: "Text" },
    { value: "number", label: "Number" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "date", label: "Date" },
    { value: "boolean", label: "Yes/No" },
  ];

  let columns: Column[] = [
    { id: uuidv4(), name: "Full name", type: "text" },
    { id: uuidv4(), name: "Email", type: "email" },
    { id: uuidv4(), name: "Country", type: "text" },
  ];

  let rows: Row[] = Array.from({ length: 5 }, () => createEmptyRow());

  function createEmptyRow(): Row {
    const row: Row = {};
    columns.forEach((column) => {
      row[column.id] = "";
    });
    return row;
  }

  function addColumn() {
    const column: Column = {
      id: uuidv4(),
      name: `Column ${columns.length + 1}`,
      type: "text",
    };
    columns = [...columns, column];
    rows = rows.map((row) => ({ ...row, [column.id]: "" }));
  }

  function removeColumn(columnId: string) {
    if (columns.length <= 1) return;
    columns = columns.filter((column) => column.id !== columnId);
    rows = rows.map((row) => {
      const { [columnId]: _, ...rest } = row;
      return rest;
    });
  }

  function addRow() {
    rows = [...rows, createEmptyRow()];
  }

  function removeRow(index: number) {
    rows = rows.filter((_, idx) => idx !== index);
  }

  function updateCell(rowIndex: number, columnId: string, value: string) {
    rows = rows.map((row, index) =>
      index === rowIndex ? { ...row, [columnId]: value } : row,
    );
  }

  function handleCellInput(event: Event, rowIndex: number, columnId: string) {
    const target = event.currentTarget as HTMLInputElement | null;
    updateCell(rowIndex, columnId, target?.value ?? "");
  }

  function fillWithSampleData() {
    rows = rows.map((row) => {
      const generated: Row = { ...row };
      columns.forEach((column) => {
        generated[column.id] = generateSampleValue(column.type);
      });
      return generated;
    });
  }

  function generateSampleValue(type: ColumnType): string {
    switch (type) {
      case "number":
        return String(faker.number.int({ min: 100, max: 9999 }));
      case "email":
        return faker.internet.email().toLowerCase();
      case "phone":
        return faker.phone.number("+1-###-###-####");
      case "date":
        return faker.date
          .between({
            from: new Date("2022-01-01"),
            to: new Date("2024-12-31"),
          })
          .toISOString()
          .slice(0, 10);
      case "boolean":
        return Math.random() > 0.5 ? "Yes" : "No";
      default:
        return faker.person.fullName();
    }
  }

  function exportAsCSV() {
    if (!rows.length) return;
    const headers = columns.map((column) => column.name);
    const csvRows = rows.map((row) =>
      columns
        .map((column) => {
          const cell = row[column.id] ?? "";
          if (cell.includes('"') || cell.includes(",") || cell.includes("\n")) {
            return `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        })
        .join(","),
    );
    const csv = [headers.join(","), ...csvRows].join("\n");
    triggerDownload(csv, "text/csv", "interactive-table.csv");
  }

  function exportAsJSON() {
    if (!rows.length) return;
    const json = rows.map((row) => {
      const record: Record<string, string> = {};
      columns.forEach((column) => {
        record[column.name] = row[column.id] ?? "";
      });
      return record;
    });
    triggerDownload(
      JSON.stringify(json, null, 2),
      "application/json",
      "interactive-table.json",
    );
  }

  function triggerDownload(content: string, type: string, filename: string) {
    const blob = new Blob([content], { type: `${type};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Columns
        </h2>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Define the structure of your dataset. Rename columns, change data
          types, and remove them as needed.
        </p>

        <div class="mt-4 space-y-3">
          {#each columns as column, index}
            <div
              class="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 sm:flex-row sm:items-center"
            >
              <div class="flex flex-1 items-center gap-2">
                <span
                  class="text-xs font-semibold text-slate-400 dark:text-slate-500"
                  >{index + 1}</span
                >
                <input
                  class="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  bind:value={column.name}
                  placeholder="Column name"
                />
              </div>
              <div class="flex items-center gap-2">
                <select
                  class="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  bind:value={column.type}
                >
                  {#each typeOptions as option}
                    <option value={option.value}>{option.label}</option>
                  {/each}
                </select>
                <button
                  type="button"
                  class="rounded-full border border-rose-400 px-3 py-1 text-xs font-semibold text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/60 dark:text-rose-300 dark:hover:bg-rose-500/10"
                  on:click={() => removeColumn(column.id)}
                  disabled={columns.length <= 1}
                >
                  Remove
                </button>
              </div>
            </div>
          {/each}
        </div>

        <button
          type="button"
          class="mt-4 inline-flex items-center justify-center rounded-full border border-dashed border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-200"
          on:click={addColumn}
        >
          + Add column
        </button>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Rows
        </h2>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Populate rows manually or fill them with realistic placeholder data.
        </p>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-transparent bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            on:click={addRow}
          >
            Add row
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
            on:click={fillWithSampleData}
            disabled={!rows.length}
          >
            Fill with sample data
          </button>
        </div>

        <div class="mt-4 space-y-3">
          {#each rows as row, rowIndex}
            <div
              class="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
            >
              <div class="flex items-center justify-between gap-3">
                <span
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Row {rowIndex + 1}
                </span>
                <button
                  type="button"
                  class="rounded-full border border-rose-400 px-3 py-1 text-xs font-semibold text-rose-500 transition hover:bg-rose-50 dark:border-rose-400/60 dark:text-rose-300 dark:hover:bg-rose-500/10"
                  on:click={() => removeRow(rowIndex)}
                >
                  Remove row
                </button>
              </div>
              <div class="mt-3 grid gap-3 md:grid-cols-2">
                {#each columns as column}
                  <label
                    class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >
                    {column.name}
                    <input
                      class="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                      value={row[column.id]}
                      on:input={(event) =>
                        handleCellInput(event, rowIndex, column.id)}
                    />
                  </label>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Table preview
        </h2>
        {#if rows.length}
          <div
            class="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700"
          >
            <table class="min-w-full table-fixed border-collapse text-sm">
              <thead
                class="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"
              >
                <tr>
                  {#each columns as column}
                    <th
                      class="whitespace-nowrap border-b border-slate-200 px-3 py-2 text-left dark:border-slate-700"
                    >
                      {column.name}
                    </th>
                  {/each}
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                {#each rows as row}
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    {#each columns as column}
                      <td
                        class="whitespace-pre-wrap px-3 py-2 text-slate-700 dark:text-slate-200"
                      >
                        {row[column.id]}
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <p class="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Add at least one row to see a live preview of your table.
          </p>
        {/if}
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Export
        </h2>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Download the current dataset in your preferred format.
        </p>
        <div class="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-blue-500 px-5 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-400/60 dark:text-blue-300 dark:hover:bg-blue-500/10"
            on:click={exportAsCSV}
            disabled={!rows.length}
          >
            Export CSV
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
            on:click={exportAsJSON}
            disabled={!rows.length}
          >
            Export JSON
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
