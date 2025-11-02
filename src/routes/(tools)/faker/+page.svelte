<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import { faker } from "@faker-js/faker";

  type DataShape = Record<string, string | number | boolean>;
  type Dataset = "profile" | "company" | "commerce" | "internet" | "location";
  type OutputFormat = "table" | "json" | "csv";

  const datasetOptions: Array<{
    value: Dataset;
    label: string;
    description: string;
  }> = [
    {
      value: "profile",
      label: "Profiles",
      description:
        "Names, roles, phones, and emails - perfect for seeding user lists.",
    },
    {
      value: "company",
      label: "Companies",
      description: "Business names, catchphrases, and addresses.",
    },
    {
      value: "commerce",
      label: "Products",
      description: "Product names, prices, and categories.",
    },
    {
      value: "internet",
      label: "Internet",
      description: "Usernames, URLs, and IP addresses.",
    },
    {
      value: "location",
      label: "Locations",
      description: "Cities, coordinates, and postal codes.",
    },
  ];

  const formatOptions: OutputFormat[] = ["table", "json", "csv"];
  let dataset: Dataset = "profile";
  let outputFormat: OutputFormat = "table";
  let rowCount = 6;
  let seed = 2025;
  let records: DataShape[] = [];

  $: csvOutput = convertToCsv(records);
  $: jsonOutput = JSON.stringify(records, null, 2);

  function generate() {
    faker.seed(seed);
    records = Array.from({ length: Math.min(rowCount, 50) }, () =>
      buildRow(dataset),
    );
  }

  function buildRow(type: Dataset): DataShape {
    switch (type) {
      case "profile":
        return {
          name: faker.person.fullName(),
          jobTitle: faker.person.jobTitle(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          registered: faker.date.past().toISOString().slice(0, 10),
        };
      case "company":
        return {
          company: faker.company.name(),
          slogan: faker.company.catchPhrase(),
          industry: faker.company.bsBuzz(),
          taxId: faker.finance.accountNumber(),
          city: faker.location.city(),
        };
      case "commerce":
        return {
          product: faker.commerce.productName(),
          sku: faker.string.alphanumeric({ length: 8, casing: "upper" }),
          price: `${faker.commerce.price({ min: 9, max: 320 })} ${faker.finance.currencyCode()}`,
          department: faker.commerce.department(),
          material: faker.commerce.productMaterial(),
        };
      case "internet":
        return {
          username: faker.internet.userName(),
          domain: faker.internet.domainName(),
          url: faker.internet.url(),
          ipv4: faker.internet.ipv4(),
          ipv6: faker.internet.ipv6(),
        };
      case "location":
        return {
          city: faker.location.city(),
          country: faker.location.country(),
          latitude: Number(faker.location.latitude()),
          longitude: Number(faker.location.longitude()),
          postalCode: faker.location.zipCode(),
        };
      default:
        return {};
    }
  }

  function convertToCsv(rows: DataShape[]) {
    if (!rows.length) return "";
    const headers = Object.keys(rows[0]);
    const lines = rows.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          return typeof value === "string" && value.includes(",")
            ? `"${value.replace(/"/g, '""')}"`
            : String(value ?? "");
        })
        .join(","),
    );
    return [headers.join(","), ...lines].join("\n");
  }

  function downloadCsv() {
    if (!csvOutput || typeof window === "undefined") return;
    const blob = new Blob([csvOutput], { type: "text/csv;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `fake-data-${dataset}-${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  generate();
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
    <div class="space-y-6">
      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Dataset
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Choose the kind of mock data you need for your scenario.
            </p>
          </div>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          {#each datasetOptions as option}
            <button
              type="button"
              class={`rounded-2xl border px-4 py-3 text-left text-sm transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 ${
                dataset === option.value
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-indigo-400/70"
              }`}
              on:click={() => {
                dataset = option.value;
                generate();
              }}
            >
              <span class="text-sm font-semibold">{option.label}</span>
              <span
                class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
              >
                {option.description}
              </span>
            </button>
          {/each}
        </div>

        <label
          class="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex-wrap"
        >
          <span>Rows</span>
          <input
            class="w-24 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="number"
            min="1"
            max="50"
            bind:value={rowCount}
            on:input={generate}
          />
        </label>

        <label
          class="flex items-center justify-between gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 flex-wrap"
        >
          <span>Seed (deterministic)</span>
          <input
            class="w-32 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
            type="number"
            bind:value={seed}
            on:input={generate}
          />
        </label>

        <button
          type="button"
          class="inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          on:click={generate}
        >
          Regenerate data
        </button>
      </div>

      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex items-center justify-between flex-wrap gap-3">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Output format
          </h2>
          <div class="flex flex-wrap items-center gap-2">
            <Copy text={jsonOutput} label="Copy JSON" floating={false} />
            <button
              type="button"
              class="inline-flex items-center rounded-full border border-transparent bg-slate-200 px-3 py-2 text-sm font-semibold tracking-wide text-slate-700 transition hover:bg-slate-300 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              on:click={downloadCsv}
              disabled={!csvOutput}
            >
              Download CSV
            </button>
          </div>
        </div>

        <div class="grid gap-2 md:grid-cols-3 sm:grid-cols-2">
          {#each formatOptions as format}
            <button
              type="button"
              class={`flex-1 rounded-2xl border px-3 py-2 text-sm transition ${
                outputFormat === format
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
              }`}
              on:click={() => (outputFormat = format)}
            >
              {format}
            </button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Final Output Section -->
    <div
      class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85 overflow-hidden"
    >
      <p
        class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-4"
      >
        Final output
      </p>

      <!-- Responsive Scroll Container -->
      <div class="overflow-x-auto w-full max-w-full">
        {#if outputFormat === "table"}
          {#if records.length}
            <div class="overflow-x-auto w-full">
              <table
                class="min-w-full divide-y divide-slate-200 text-left text-sm dark:divide-slate-700"
              >
                <thead
                  class="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-900/50 dark:text-slate-400"
                >
                  <tr>
                    {#each Object.keys(records[0]) as heading}
                      <th class="px-4 py-3 font-semibold">{heading}</th>
                    {/each}
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  {#each records as row, index}
                    <tr
                      class={index % 2 === 0
                        ? "bg-white dark:bg-slate-900/40"
                        : ""}
                    >
                      {#each Object.values(row) as value}
                        <td
                          class="px-4 py-3 font-mono text-xs text-slate-700 dark:text-slate-300 break-words max-w-[200px]"
                        >
                          {value}
                        </td>
                      {/each}
                    </tr>
                  {/each}
                </tbody>
              </table>
            </div>
          {:else}
            <p class="text-sm text-slate-600 dark:text-slate-300">
              Generate some records to populate the table.
            </p>
          {/if}
        {:else if outputFormat === "json"}
          <div
            class="overflow-auto rounded-2xl border border-slate-200 bg-slate-900/95 p-4 dark:border-slate-700 dark:bg-black max-w-full"
          >
            <pre class="text-sm text-emerald-200 whitespace-pre-wrap break-all">
{jsonOutput}</pre>
          </div>
        {:else}
          <div
            class="overflow-auto rounded-2xl border border-slate-200 bg-slate-900/95 p-4 dark:border-slate-700 dark:bg-black max-w-full"
          >
            <pre class="text-sm text-sky-200 whitespace-pre-wrap break-all">
{csvOutput}</pre>
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
