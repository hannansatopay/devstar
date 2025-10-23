<script>
  import * as XLSX from "xlsx";

  let sqlContent = "";
  let filename = "";
  let errorMessage = "";
  let resultPreview = "";

  const insertRegex =
    /INSERT\s+INTO\s+`?([\w-]+)`?\s*\(([^)]+)\)\s*VALUES\s*(.+);?/ims;

  function handleFile(event) {
    const file = event?.target?.files?.[0];
    if (!file) {
      return;
    }
    filename = file.name;
    const reader = new FileReader();
    reader.onload = (evt) => {
      sqlContent = evt.target?.result ?? "";
      resultPreview = "";
      errorMessage = "";
    };
    reader.onerror = () => {
      errorMessage = "Unable to read the selected file.";
    };
    reader.readAsText(file);
  }

  function parseSql(content) {
    const match = content.match(insertRegex);
    if (!match) {
      throw new Error(
        "Only INSERT statements are supported. Ensure your SQL follows the INSERT INTO ... VALUES syntax.",
      );
    }

    const [, tableName, headerBlock, valuesBlock] = match;
    const headers = headerBlock
      .split(",")
      .map((column) => column.replace(/`/g, "").trim());

    const tuples = [];
    const valueRegex = /\(([^)]+)\)/g;
    let tupleMatch;
    while ((tupleMatch = valueRegex.exec(valuesBlock)) !== null) {
      const valueList = tupleMatch[1]
        .split(/,(?=(?:[^']*'[^']*')*[^']*$)/)
        .map((value) =>
          value
            .trim()
            .replace(/^'(.*)'$/, "$1")
            .replace(/\\'/g, "'"),
        );
      tuples.push(valueList);
    }

    if (!tuples.length) {
      throw new Error("No value tuples were found in the statement.");
    }

    return { data: [headers, ...tuples], table: tableName };
  }

  function convert(format) {
    if (!sqlContent.trim()) {
      errorMessage = "Upload a SQL file or paste an INSERT statement first.";
      return;
    }

    try {
      const parsed = parseSql(sqlContent);
      errorMessage = "";
      resultPreview = buildPreview(parsed);

      switch (format) {
        case "csv":
          exportCsv(parsed);
          break;
        case "xlsx":
          exportXlsx(parsed);
          break;
        case "mysql":
          exportSql(parsed, "mysql");
          break;
        case "sqlite":
          exportSql(parsed, "sqlite");
          break;
      }
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to parse the SQL statement.";
    }
  }

  function buildPreview({ data, table }) {
    const [headers, ...rows] = data;
    const sample = rows.slice(0, 5);
    const headline = `Detected table: ${table}\nColumns: ${headers.join(", ")}`;
    const body = sample.map((row) => row.join(" | ")).join("\n");
    const summary =
      rows.length > sample.length
        ? `\n� ${rows.length - sample.length} more rows`
        : "";
    return `${headline}\n\n${body}${summary}`;
  }

  function exportCsv({ data }) {
    const csv = data
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    downloadBlob(csv, "converted.csv", "text/csv;charset=utf-8");
  }

  function exportXlsx({ data }) {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");
    XLSX.writeFile(workbook, "converted.xlsx");
  }

  function exportSql({ data, table }, dialect) {
    const [headers, ...rows] = data;
    const statements = rows.map((row) => {
      const formattedValues = row
        .map((value) => `'${value.replace(/'/g, "''")}'`)
        .join(", ");
      return `INSERT INTO ${table} (${headers.join(", ")}) VALUES (${formattedValues});`;
    });

    if (dialect === "sqlite") {
      statements.unshift("BEGIN TRANSACTION;");
      statements.push("COMMIT;");
    }

    const filename =
      dialect === "sqlite" ? "converted.sqlite" : "converted.sql";
    downloadBlob(statements.join("\n"), filename, "text/plain;charset=utf-8");
  }

  function downloadBlob(content, filename, type) {
    const blob = new Blob([content], { type });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div
    class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div
      class="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900/70 dark:hover:border-indigo-700 dark:hover:bg-slate-900"
    >
      <input
        type="file"
        accept=".sql,.txt"
        class="hidden"
        id="file-input"
        on:change={handleFile}
      />
      <label
        for="file-input"
        class="cursor-pointer text-sm font-semibold text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-300"
      >
        {filename ? `Selected: ${filename}` : "Click to upload a SQL file"}
      </label>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Only INSERT statements are required. Other SQL will be ignored.
      </p>
    </div>

    <textarea
      class="min-h-[160px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
      placeholder="Paste an INSERT INTO statement here..."
      bind:value={sqlContent}
    ></textarea>

    {#if errorMessage}
      <p class="text-sm text-rose-600 dark:text-rose-300">{errorMessage}</p>
    {/if}

    <div class="flex flex-wrap gap-3">
      <button
        class="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        on:click={() => convert("csv")}
      >
        Convert to CSV
      </button>
      <button
        class="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
        on:click={() => convert("xlsx")}
      >
        Convert to XLSX
      </button>
      <button
        class="inline-flex items-center rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-200"
        on:click={() => convert("mysql")}
      >
        Convert to MySQL
      </button>
      <button
        class="inline-flex items-center rounded-full bg-purple-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300"
        on:click={() => convert("sqlite")}
      >
        Convert to SQLite
      </button>
    </div>
  </div>

  {#if resultPreview}
    <div
      class="space-y-3 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
        Preview
      </h2>
      <pre
        class="whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{resultPreview}</pre>
    </div>
  {/if}
</section>
