<script lang="ts">
  import { faker } from "@faker-js/faker";
  import { v4 as uuidv4 } from "uuid";
  import { onDestroy } from "svelte";

  type FieldType =
    | "increment"
    | "uuid"
    | "firstName"
    | "lastName"
    | "fullName"
    | "email"
    | "company"
    | "jobTitle"
    | "phone"
    | "country"
    | "city"
    | "street"
    | "postalCode"
    | "date"
    | "time"
    | "boolean"
    | "integer"
    | "float"
    | "sentence"
    | "paragraph";

  type Field = {
    id: string;
    name: string;
    type: FieldType;
  };

  const typeOptions: { value: FieldType; label: string; help: string }[] = [
    { value: "increment", label: "Sequential ID", help: "1, 2, 3…" },
    { value: "uuid", label: "UUID", help: "Globally unique identifier" },
    { value: "firstName", label: "First name", help: "Given names" },
    { value: "lastName", label: "Last name", help: "Family names" },
    { value: "fullName", label: "Full name", help: "First + last name" },
    { value: "email", label: "Email", help: "Randomized email address" },
    { value: "company", label: "Company", help: "Business names" },
    { value: "jobTitle", label: "Job title", help: "Professional titles" },
    { value: "phone", label: "Phone", help: "International phone format" },
    { value: "country", label: "Country", help: "Random country names" },
    { value: "city", label: "City", help: "Major city names" },
    { value: "street", label: "Street", help: "Street address lines" },
    { value: "postalCode", label: "Postal code", help: "Local postal codes" },
    { value: "date", label: "Date", help: "ISO date within last 3 years" },
    { value: "time", label: "Time", help: "24-hour time value" },
    { value: "boolean", label: "Yes / No", help: "Random boolean flag" },
    { value: "integer", label: "Integer", help: "Whole number (100-9999)" },
    { value: "float", label: "Decimal", help: "Two-decimal numeric value" },
    { value: "sentence", label: "Sentence", help: "Natural short sentence" },
    { value: "paragraph", label: "Paragraph", help: "Two-sentence excerpt" },
  ];

  let fields: Field[] = [
    { id: uuidv4(), name: "ID", type: "increment" },
    { id: uuidv4(), name: "Full name", type: "fullName" },
    { id: uuidv4(), name: "Email", type: "email" },
    { id: uuidv4(), name: "Country", type: "country" },
  ];

  const MAX_RECORDS = 5000;
  const PREVIEW_LIMIT = 50;

  let recordCount = 25;
  let seedInput = "";
  let generated: Record<string, string>[] = [];
  let generating = false;
  let message = "";
  let csvDownloadUrl = "";
  let jsonDownloadUrl = "";

  $: visibleRows = generated.slice(0, PREVIEW_LIMIT);

  function clampRecordCount() {
    if (recordCount < 1) recordCount = 1;
    if (recordCount > MAX_RECORDS) recordCount = MAX_RECORDS;
  }

  function addField() {
    fields = [
      ...fields,
      {
        id: uuidv4(),
        name: `Field ${fields.length + 1}`,
        type: "sentence",
      },
    ];
  }

  function removeField(id: string) {
    if (fields.length <= 1) return;
    fields = fields.filter((field) => field.id !== id);
  }

  function moveField(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= fields.length) return;
    const reordered = [...fields];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    fields = reordered;
  }

  function updateFieldName(id: string, name: string) {
    fields = fields.map((field) =>
      field.id === id ? { ...field, name } : field,
    );
  }

  function handleFieldNameInput(event: Event, id: string) {
    const target = event.currentTarget as HTMLInputElement | null;
    updateFieldName(id, target?.value ?? "");
  }

  function updateFieldType(id: string, type: FieldType) {
    fields = fields.map((field) =>
      field.id === id ? { ...field, type } : field,
    );
  }

  function handleFieldTypeChange(event: Event, id: string) {
    const target = event.currentTarget as HTMLSelectElement | null;
    const value = target?.value ?? "sentence";
    const option = typeOptions.find((item) => item.value === value);
    updateFieldType(id, option?.value ?? "sentence");
  }

  function seedFromString(value: string) {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 2_147_483_647 || 1;
  }

  function createRecord(rowIndex: number) {
    const record: Record<string, string> = {};
    fields.forEach((field) => {
      record[field.id] = createValue(field.type, rowIndex);
    });
    return record;
  }

  function createValue(type: FieldType, rowIndex: number): string {
    switch (type) {
      case "increment":
        return String(rowIndex + 1);
      case "uuid":
        return uuidv4();
      case "firstName":
        return faker.person.firstName();
      case "lastName":
        return faker.person.lastName();
      case "fullName":
        return faker.person.fullName();
      case "email":
        return faker.internet.email().toLowerCase();
      case "company":
        return faker.company.name();
      case "jobTitle":
        return faker.person.jobTitle();
      case "phone":
        return faker.phone.number("+1-###-###-####");
      case "country":
        return faker.location.country();
      case "city":
        return faker.location.city();
      case "street":
        return faker.location.streetAddress({ useFullAddress: false });
      case "postalCode":
        return faker.location.zipCode();
      case "date": {
        const end = new Date();
        const start = new Date();
        start.setFullYear(end.getFullYear() - 3);
        return faker.date
          .between({ from: start, to: end })
          .toISOString()
          .slice(0, 10);
      }
      case "time": {
        const hour = faker.number.int({ min: 0, max: 23 });
        const minute = faker.number.int({ min: 0, max: 59 });
        return `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
      }
      case "boolean":
        return Math.random() > 0.5 ? "TRUE" : "FALSE";
      case "integer":
        return String(faker.number.int({ min: 100, max: 9999 }));
      case "float":
        return faker.number
          .float({ min: 10, max: 5000, fractionDigits: 2 })
          .toString();
      case "paragraph":
        return faker.lorem.paragraphs({ min: 1, max: 1 });
      default:
        return faker.lorem.sentence();
    }
  }

  function fieldExportName(field: Field, index: number) {
    const trimmed = field.name.trim();
    return trimmed || `Field ${index + 1}`;
  }

  function escapeCsv(value: string) {
    if (/[",\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  function toCsv(rows: Record<string, string>[], headers: string[]) {
    const csvRows = rows.map((row) =>
      headers.map((header) => escapeCsv(row[header] ?? "")).join(","),
    );
    return [headers.join(","), ...csvRows].join("\r\n");
  }

  function clearDownloads() {
    if (csvDownloadUrl) {
      URL.revokeObjectURL(csvDownloadUrl);
      csvDownloadUrl = "";
    }
    if (jsonDownloadUrl) {
      URL.revokeObjectURL(jsonDownloadUrl);
      jsonDownloadUrl = "";
    }
  }

  onDestroy(() => clearDownloads());

  function prepareDownloads(data: Record<string, string>[]) {
    clearDownloads();
    if (!data.length) return;
    const headers = fields.map(fieldExportName);
    const exported = data.map((row) => {
      const output: Record<string, string> = {};
      fields.forEach((field, index) => {
        output[headers[index]] = row[field.id];
      });
      return output;
    });
    const jsonBlob = new Blob([JSON.stringify(exported, null, 2)], {
      type: "application/json",
    });
    jsonDownloadUrl = URL.createObjectURL(jsonBlob);

    const csvBlob = new Blob([toCsv(exported, headers)], {
      type: "text/csv;charset=utf-8",
    });
    csvDownloadUrl = URL.createObjectURL(csvBlob);
  }

  async function handleGenerate() {
    clampRecordCount();
    generating = true;
    message = "";
    clearDownloads();
    try {
      const seed = seedInput.trim();
      if (seed) {
        faker.seed(seedFromString(seed));
      } else {
        faker.seed(faker.number.int({ min: 1, max: 2_147_483_646 }));
      }
      generated = Array.from({ length: recordCount }, (_, index) =>
        createRecord(index),
      );
      prepareDownloads(generated);
      message = `Generated ${generated.length.toLocaleString()} records across ${fields.length} fields.`;
    } catch (error) {
      message =
        error instanceof Error
          ? error.message
          : "Unable to generate random data.";
      generated = [];
    } finally {
      generating = false;
    }
  }
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Schema builder
        </h2>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Define the columns you want to include in the dataset. Field names
          become column headers in exports.
        </p>

        <div class="mt-4 space-y-4">
          {#each fields as field, index (field.id)}
            <div
              class="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
            >
              <div class="flex flex-wrap items-center justify-between gap-3">
                <span
                  class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Field {index + 1}
                </span>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400/60 dark:hover:text-blue-300"
                    on:click={() => moveField(index, "up")}
                    disabled={index === 0}
                    aria-label="Move field up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400/60 dark:hover:text-blue-300"
                    on:click={() => moveField(index, "down")}
                    disabled={index === fields.length - 1}
                    aria-label="Move field down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    class="rounded-full border border-rose-400 px-3 py-1 text-xs font-semibold text-rose-500 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:border-rose-200 disabled:text-rose-300 dark:border-rose-400/60 dark:text-rose-300 dark:hover:bg-rose-500/10 dark:disabled:border-rose-900/40 dark:disabled:text-rose-800/40"
                    on:click={() => removeField(field.id)}
                    disabled={fields.length <= 1}
                    aria-label="Remove field"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div
                class="mt-3 grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
              >
                <label
                  class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Field name
                  <input
                    class="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    value={field.name}
                    on:input={(event) => handleFieldNameInput(event, field.id)}
                  />
                </label>

                <label
                  class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Data type
                  <select
                    class="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    value={field.type}
                    on:change={(event) =>
                      handleFieldTypeChange(event, field.id)}
                  >
                    {#each typeOptions as option}
                      <option value={option.value}>{option.label}</option>
                    {/each}
                  </select>
                  <span
                    class="text-[11px] font-normal normal-case text-slate-500 dark:text-slate-400"
                  >
                    {typeOptions.find((option) => option.value === field.type)
                      ?.help}
                  </span>
                </label>
              </div>
            </div>
          {/each}
        </div>

        <button
          type="button"
          class="mt-4 inline-flex items-center justify-center rounded-full border border-dashed border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-200"
          on:click={addField}
        >
          + Add field
        </button>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Generation options
        </h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <label
            class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Rows
            <input
              type="number"
              min="1"
              max={MAX_RECORDS}
              class="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              bind:value={recordCount}
            />
            <span
              class="text-[11px] font-normal normal-case text-slate-500 dark:text-slate-400"
            >
              Minimum 1 row, maximum {MAX_RECORDS.toLocaleString()} rows.
            </span>
          </label>
          <label
            class="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Seed (optional)
            <input
              class="rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              placeholder="Use a seed for reproducible data"
              bind:value={seedInput}
            />
            <span
              class="text-[11px] font-normal normal-case text-slate-500 dark:text-slate-400"
            >
              Use any word or number to generate the same dataset again.
            </span>
          </label>
        </div>
        <div class="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-transparent bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900 disabled:cursor-not-allowed disabled:bg-blue-400"
            on:click={handleGenerate}
            disabled={generating}
          >
            {generating ? "Generating…" : "Generate dataset"}
          </button>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-blue-400 hover:text-blue-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-blue-400/60 dark:hover:text-blue-200"
            on:click={() => {
              recordCount = 25;
              seedInput = "";
              generated = [];
              message = "";
              clearDownloads();
            }}
          >
            Reset inputs
          </button>
        </div>
        {#if message}
          <p
            class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
          >
            {message}
          </p>
        {/if}
      </div>
    </div>

    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Overview
        </h2>
        <dl
          class="mt-4 grid gap-3 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2"
        >
          <div>
            <dt
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Fields
            </dt>
            <dd class="font-semibold">{fields.length}</dd>
          </div>
          <div>
            <dt
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Requested rows
            </dt>
            <dd class="font-semibold">{recordCount.toLocaleString()}</dd>
          </div>
          <div>
            <dt
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Generated rows
            </dt>
            <dd class="font-semibold">{generated.length.toLocaleString()}</dd>
          </div>
          <div>
            <dt
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Previewed
            </dt>
            <dd class="font-semibold">
              {visibleRows.length} of {generated.length
                ? generated.length.toLocaleString()
                : "0"}
            </dd>
          </div>
        </dl>
        {#if seedInput.trim()}
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Seed <span class="font-semibold text-slate-700 dark:text-slate-200"
              >{seedInput}</span
            > is applied for repeatable output.
          </p>
        {/if}
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Data preview
        </h2>
        {#if visibleRows.length}
          <div
            class="mt-4 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-700"
          >
            <table class="min-w-full table-fixed border-collapse text-sm">
              <thead
                class="bg-slate-100 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"
              >
                <tr>
                  {#each fields as field, index}
                    <th
                      class="whitespace-nowrap border-b border-slate-200 px-3 py-2 text-left dark:border-slate-700"
                    >
                      {fieldExportName(field, index)}
                    </th>
                  {/each}
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                {#each visibleRows as row}
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/60">
                    {#each fields as field}
                      <td
                        class="whitespace-pre-wrap px-3 py-2 text-slate-700 dark:text-slate-200"
                      >
                        {row[field.id]}
                      </td>
                    {/each}
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
          {#if generated.length > PREVIEW_LIMIT}
            <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
              Showing the first {PREVIEW_LIMIT} rows of {generated.length.toLocaleString()}
              total.
            </p>
          {/if}
        {:else}
          <p class="mt-4 text-sm text-slate-600 dark:text-slate-300">
            Configure the schema and generate a dataset to see a live preview
            here.
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
          Download the generated dataset in a ready-to-share format. Column
          headers follow the field names you defined.
        </p>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <a
            class="inline-flex items-center justify-center rounded-full border border-blue-500 px-5 py-2 text-sm font-semibold text-blue-600 transition hover:bg-blue-50 dark:border-blue-400/60 dark:text-blue-300 dark:hover:bg-blue-500/10 disabled:pointer-events-none disabled:border-slate-300 disabled:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-600"
            href={csvDownloadUrl}
            download="random-data.csv"
            aria-disabled={!csvDownloadUrl}
          >
            Download CSV
          </a>
          <a
            class="inline-flex items-center justify-center rounded-full border border-emerald-500 px-5 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-400/60 dark:text-emerald-300 dark:hover:bg-emerald-500/10 disabled:pointer-events-none disabled:border-slate-300 disabled:text-slate-400 dark:disabled:border-slate-700 dark:disabled:text-slate-600"
            href={jsonDownloadUrl}
            download="random-data.json"
            aria-disabled={!jsonDownloadUrl}
          >
            Download JSON
          </a>
        </div>
        {#if !generated.length}
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Generate data first to enable downloads.
          </p>
        {/if}
      </div>
    </div>
  </div>
</section>
