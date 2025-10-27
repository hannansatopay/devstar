<script lang="ts">
  import { onDestroy } from "svelte";

  type ParsedCSV = {
    columns: string[];
    rows: string[][];
  };

  const presetDelimiters = [
    { id: ",", label: "Comma (,)" },
    { id: ";", label: "Semicolon (;)" },
    { id: "\t", label: "Tab (\\t)" },
  ];

  let selectedFileName = "";
  let rawInput = "";
  let delimiterChoice = presetDelimiters[0].id;
  let customDelimiter = "";
  let useCustomDelimiter = false;
  let hasHeaderRow = true;
  let parsed: ParsedCSV | null = null;
  let parseError = "";
  let previewLimit = 200;
  let selectedRows = 0;
  let columnSummary: { name: string; empty: number; numeric: number }[] = [];

  let jsonDownloadUrl = "";
  let csvDownloadUrl = "";

  function revokeDownloads() {
    if (jsonDownloadUrl) {
      URL.revokeObjectURL(jsonDownloadUrl);
      jsonDownloadUrl = "";
    }
    if (csvDownloadUrl) {
      URL.revokeObjectURL(csvDownloadUrl);
      csvDownloadUrl = "";
    }
  }

  onDestroy(() => revokeDownloads());

  function sanitizeDelimiter(): string {
    if (!useCustomDelimiter) return delimiterChoice;
    if (!customDelimiter.trim()) return delimiterChoice;
    return customDelimiter;
  }

  function parseCSVText(text: string, delimiter: string): ParsedCSV {
    const rows: string[][] = [];
    let current: string = "";
    let currentRow: string[] = [];
    let inQuotes = false;

    const pushCell = () => {
      currentRow.push(current);
      current = "";
    };

    const pushRow = () => {
      rows.push(currentRow);
      currentRow = [];
    };

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i];
      const next = text[i + 1];
      if (char === '"') {
        if (inQuotes && next === '"') {
          current += '"';
          i += 1;
        } else {
          inQuotes = !inQuotes;
        }
        continue;
      }
      if (!inQuotes && char === delimiter) {
        pushCell();
        continue;
      }
      if (!inQuotes && (char === "\n" || (char === "\r" && next !== "\n"))) {
        pushCell();
        pushRow();
        continue;
      }
      if (!inQuotes && char === "\r" && next === "\n") {
        pushCell();
        pushRow();
        i += 1;
        continue;
      }
      current += char;
    }
    pushCell();
    if (currentRow.length > 1 || currentRow[0] !== "") {
      pushRow();
    }

    if (!rows.length) {
      return { columns: [], rows: [] };
    }

    const longestRow = Math.max(...rows.map((row) => row.length));
    const normalizedRows = rows.map((row) => {
      if (row.length === longestRow) return row;
      return [...row, ...Array(longestRow - row.length).fill("")];
    });

    const columns =
      normalizedRows[0]?.map((_, index) =>
        hasHeaderRow
          ? normalizedRows[0][index] || `Column ${index + 1}`
          : `Column ${index + 1}`,
      ) ?? [];

    const dataRows = hasHeaderRow ? normalizedRows.slice(1) : normalizedRows;
    return { columns, rows: dataRows };
  }

  function analyzeColumns(data: ParsedCSV) {
    columnSummary = data.columns.map((name, columnIndex) => {
      let empty = 0;
      let numeric = 0;
      for (const row of data.rows) {
        const cell = row[columnIndex];
        if (cell.trim() === "") empty += 1;
        if (!Number.isNaN(Number(cell)) && cell.trim() !== "") numeric += 1;
      }
      return {
        name,
        empty,
        numeric,
      };
    });
  }

  function handleParse() {
    parseError = "";
    parsed = null;
    columnSummary = [];
    revokeDownloads();
    if (!rawInput.trim()) {
      parseError = "Paste CSV content or upload a file to begin.";
      return;
    }
    try {
      const delimiter = sanitizeDelimiter();
      const data = parseCSVText(rawInput, delimiter);
      parsed = data;
      analyzeColumns(data);
      selectedRows = data.rows.length;
      prepareDownloads(data);
    } catch (error) {
      parseError =
        error instanceof Error
          ? error.message
          : "Unable to parse CSV. Please verify the delimiter.";
    }
  }

  async function handleFileChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    selectedFileName = file.name;
    rawInput = await file.text();
    handleParse();
  }

  function prepareDownloads(data: ParsedCSV) {
    const headers = data.columns;
    const csvLines = [
      headers.join(","),
      ...data.rows.map((row) =>
        row
          .map((cell) => {
            if (
              cell.includes('"') ||
              cell.includes(",") ||
              cell.includes("\n")
            ) {
              return `"${cell.replace(/"/g, '""')}"`;
            }
            return cell;
          })
          .join(","),
      ),
    ];
    csvDownloadUrl = URL.createObjectURL(
      new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8" }),
    );

    const json = data.rows.map((row) => {
      const record: Record<string, string> = {};
      data.columns.forEach((column, index) => {
        record[column] = row[index] ?? "";
      });
      return record;
    });
    jsonDownloadUrl = URL.createObjectURL(
      new Blob([JSON.stringify(json, null, 2)], {
        type: "application/json;charset=utf-8",
      }),
    );
  }

  function limitedRows(rows: string[][]) {
    return rows.slice(0, previewLimit);
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Import CSV
        </h2>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Upload a CSV file or paste its contents to inspect, clean, and export
          the data.
        </p>

        <div class="mt-4 flex flex-wrap items-center gap-3">
          <label
            class="inline-flex cursor-pointer items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
          >
            <input
              type="file"
              class="hidden"
              accept=".csv,text/csv"
              on:change={handleFileChange}
            />
            <span>Select file</span>
          </label>
          <button
            class="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-400 hover:text-rose-500 dark:border-slate-600 dark:text-slate-200"
            type="button"
            on:click={() => {
              rawInput = "";
              selectedFileName = "";
              parsed = null;
              columnSummary = [];
              parseError = "";
              revokeDownloads();
            }}
          >
            Clear
          </button>
          {#if selectedFileName}
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400"
              >{selectedFileName}</span
            >
          {/if}
        </div>

        <label class="mt-6 flex flex-col gap-2 text-sm">
          <span
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Or paste CSV data
          </span>
          <textarea
            class="h-40 w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition hover:border-blue-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            bind:value={rawInput}
            placeholder="name,email,age&#10;Ada Lovelace,ada@example.com,36"
          />
        </label>

        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Delimiter
            </p>
            <div class="mt-2 flex flex-wrap items-center gap-2 text-sm">
              {#each presetDelimiters as option}
                <button
                  type="button"
                  class={`rounded-full px-3 py-1 font-medium transition ${
                    !useCustomDelimiter && delimiterChoice === option.id
                      ? "bg-blue-600 text-white"
                      : "border border-slate-300 bg-white text-slate-700 hover:border-blue-300 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
                  }`}
                  on:click={() => {
                    useCustomDelimiter = false;
                    delimiterChoice = option.id;
                  }}
                >
                  {option.label}
                </button>
              {/each}
              <label
                class="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300"
              >
                <input
                  type="checkbox"
                  bind:checked={useCustomDelimiter}
                  class="h-4 w-4 accent-blue-500"
                />
                Custom
              </label>
              <input
                type="text"
                class="h-10 w-20 rounded-xl border border-slate-300 px-3 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                placeholder="|"
                bind:value={customDelimiter}
                maxlength="2"
              />
            </div>
          </div>

          <div class="space-y-2 text-sm">
            <label
              class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <input
                type="checkbox"
                bind:checked={hasHeaderRow}
                class="h-4 w-4 accent-blue-500"
              />
              First row contains headers
            </label>
            <div>
              <label
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Preview limit
              </label>
              <input
                type="number"
                min="10"
                max="1000"
                class="mt-1 w-28 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                bind:value={previewLimit}
              />
            </div>
          </div>
        </div>

        <button
          type="button"
          class="mt-6 inline-flex items-center justify-center rounded-full border border-transparent bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          on:click={handleParse}
        >
          Parse CSV
        </button>

        {#if parseError}
          <p
            class="mt-4 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-600 dark:border-rose-500/60 dark:bg-rose-500/10 dark:text-rose-200"
          >
            {parseError}
          </p>
        {/if}
      </div>

      {#if parsed}
        <div
          class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
        >
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            Data overview
          </h3>
          <dl
            class="mt-4 grid gap-3 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2"
          >
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Rows
              </dt>
              <dd class="font-semibold">
                {parsed.rows.length.toLocaleString()}
              </dd>
            </div>
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Columns
              </dt>
              <dd class="font-semibold">{parsed.columns.length}</dd>
            </div>
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Preview rows
              </dt>
              <dd class="font-semibold">
                {Math.min(parsed.rows.length, previewLimit)}
              </dd>
            </div>
            <div>
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Selected rows
              </dt>
              <dd class="font-semibold">{selectedRows.toLocaleString()}</dd>
            </div>
          </dl>

          <div class="mt-4 flex flex-wrap items-center gap-3 text-sm">
            <a
              class="inline-flex items-center justify-center rounded-full border border-blue-500 px-5 py-2 font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-400/60 dark:text-blue-300 dark:hover:bg-blue-500/10"
              href={csvDownloadUrl}
              download={`${selectedFileName || "dataset"}.clean.csv`}
            >
              Download CSV
            </a>
            <a
              class="inline-flex items-center justify-center rounded-full border border-emerald-500 px-5 py-2 font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10"
              href={jsonDownloadUrl}
              download={`${selectedFileName || "dataset"}.json`}
            >
              Download JSON
            </a>
          </div>
        </div>

        <div
          class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
        >
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            Column summary
          </h3>
          <div class="mt-3 grid gap-3 xl:grid-cols-2">
            {#each columnSummary as summary}
              <div
                class="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
              >
                <p
                  class="text-sm font-semibold text-slate-800 dark:text-slate-100"
                >
                  {summary.name}
                </p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Empty cells: {summary.empty.toLocaleString()}
                </p>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Numeric-looking values: {summary.numeric.toLocaleString()}
                </p>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>

    <div class="space-y-6">
      {#if parsed}
        <div
          class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
        >
          <h3 class="text-lg font-semibold text-slate-900 dark:text-white">
            Preview
          </h3>
          <div class="mt-3 overflow-x-auto">
            <table
              class="min-w-full table-fixed border-collapse rounded-2xl text-sm"
            >
              <thead
                class="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"
              >
                <tr>
                  {#each parsed.columns as column, index}
                    <th
                      class="whitespace-nowrap border-b border-slate-200 px-3 py-2 text-left dark:border-slate-700"
                    >
                      {column || `Column ${index + 1}`}
                    </th>
                  {/each}
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                {#each limitedRows(parsed.rows) as row, rowIndex}
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    {#each row as cell}
                      <td
                        class="whitespace-pre-wrap px-3 py-2 text-sm text-slate-700 dark:text-slate-200"
                      >
                        {cell}
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          {#if parsed.rows.length > previewLimit}
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Showing the first {previewLimit} rows of {parsed.rows.length.toLocaleString()}
              total rows.
            </p>
          {/if}
        </div>
      {:else}
        <div
          class="rounded-3xl border border-dashed border-slate-300 bg-white/70 p-6 text-sm text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
        >
          Import data to see a live table preview, quality summary, and export
          options.
        </div>
      {/if}
    </div>
  </div>
</section>
