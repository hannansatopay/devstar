<script lang="ts">
  type LineItem = {
    id: number;
    description: string;
    quantity: number;
    rate: number;
    taxRate: number;
  };

  const isBrowser = typeof window !== "undefined";

  let invoiceNumber = `INV-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(
    new Date().getDate(),
  ).padStart(2, "0")}`;
  let issueDate = new Date().toISOString().slice(0, 10);
  let dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  let fromName = "";
  let fromEmail = "";
  let fromAddress = "";
  let billToName = "";
  let billToEmail = "";
  let billToAddress = "";
  let notes =
    "Thank you for your business! Payment is due within 7 days via bank transfer or card. Please reference the invoice number.";

  let items: LineItem[] = [
    {
      id: 1,
      description: "Discovery call and project scoping",
      quantity: 1,
      rate: 120,
      taxRate: 0,
    },
    {
      id: 2,
      description: "Design and implementation",
      quantity: 10,
      rate: 85,
      taxRate: 5,
    },
  ];

  let currency = "USD";
  let previewRef: HTMLDivElement | null = null;
  let downloadingPng = false;

  let html2canvasLoader: Promise<any> | null = null;

  const currencyOptions = [
    "USD",
    "EUR",
    "GBP",
    "INR",
    "CAD",
    "AUD",
    "NZD",
    "JPY",
    "CNY",
    "SGD",
    "AED",
  ];
  const currencySymbols: Record<string, string> = {
    USD: "$",
    EUR: "\u20AC",
    GBP: "\u00A3",
    INR: "\u20B9",
    CAD: "CA$",
    AUD: "A$",
    NZD: "NZ$",
    JPY: "\u00A5",
    CNY: "\u00A5",
    SGD: "S$",
    AED: "AED",
  };

  const fallbackFormatter = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

  let currencyFormatter = createFormatter(currency);

  function createFormatter(nextCurrency: string) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: nextCurrency,
        minimumFractionDigits: 2,
      });
    } catch (error) {
      console.warn(
        "Unsupported currency provided to formatter",
        nextCurrency,
        error,
      );
      return fallbackFormatter;
    }
  }

  function getCurrencyDisplayName(code: string) {
    try {
      if (typeof Intl.DisplayNames !== "undefined") {
        const displayNames = new Intl.DisplayNames(undefined, {
          type: "currency",
        });
        return displayNames.of(code) ?? code;
      }
    } catch (error) {
      console.warn("Unable to resolve currency display name", code, error);
    }
    return code;
  }

  $: subtotal = items.reduce((acc, item) => acc + item.quantity * item.rate, 0);
  $: totalTax = items.reduce(
    (acc, item) => acc + (item.quantity * item.rate * item.taxRate) / 100,
    0,
  );
  $: totalDue = subtotal + totalTax;
  $: currencyFormatter = createFormatter(currency);
  $: currencySymbol = currencySymbols[currency] ?? currency;
  $: currencyDisplayName = getCurrencyDisplayName(currency);

  function addItem() {
    const nextId = Math.max(0, ...items.map((item) => item.id)) + 1;
    items = [
      ...items,
      {
        id: nextId,
        description: "",
        quantity: 1,
        rate: 0,
        taxRate: 0,
      },
    ];
  }

  function removeItem(id: number) {
    if (items.length <= 1) return;
    items = items.filter((item) => item.id !== id);
  }

  function resetInvoice() {
    items = [{ id: 1, description: "", quantity: 1, rate: 0, taxRate: 0 }];
    fromName = "";
    fromEmail = "";
    fromAddress = "";
    billToName = "";
    billToEmail = "";
    billToAddress = "";
    notes = "";
  }

  function formatCurrency(value: number) {
    return currencyFormatter.format(isFinite(value) ? value : 0);
  }

  async function loadHtml2Canvas() {
    if (!html2canvasLoader) {
      html2canvasLoader = import("html2canvas").catch(
        () => import("https://cdn.skypack.dev/html2canvas@1.4.1"),
      );
    }
    const module = await html2canvasLoader;
    return module.default ?? module.html2canvas ?? module;
  }

  async function downloadAsPng() {
    if (!isBrowser || !previewRef) return;
    downloadingPng = true;
    try {
      const html2canvas = await loadHtml2Canvas();
      const canvas = await html2canvas(previewRef, {
        backgroundColor: "#ffffff",
        scale: window.devicePixelRatio > 1 ? 2 : 1.5,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${invoiceNumber || "invoice"}.png`;
      link.click();
    } catch (error) {
      console.error("Unable to export invoice PNG", error);
      alert("PNG export failed. Please try again.");
    } finally {
      downloadingPng = false;
    }
  }

  function printPreview() {
    if (!isBrowser) return;
    const preview = document.getElementById("invoice-preview");
    if (!preview) return;
    const printContents = preview.innerHTML;
    const printWindow = window.open("", "_blank", "width=900,height=1200");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>${invoiceNumber}</title>
          <link rel="stylesheet" href="https://unpkg.com/tailwindcss@3.4.10/dist/tailwind.min.css">
        </head>
        <body class="bg-white text-slate-900">
          <div class="max-w-3xl mx-auto p-8">
            ${printContents}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }
</script>

<section class="space-y-6">
  <div class="grid lg:grid-cols-2 gap-6">
    <div
      class="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="grid gap-4 sm:grid-cols-2">
        <label
          class="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Invoice number</span>
          <input
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
            bind:value={invoiceNumber}
          />
        </label>

        <label
          class="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Currency</span>
          <select
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
            bind:value={currency}
          >
            {#each currencyOptions as option}
              <option value={option}>{option}</option>
            {/each}
          </select>
        </label>

        <label
          class="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Issue date</span>
          <input
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
            type="date"
            bind:value={issueDate}
          />
        </label>

        <label
          class="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Due date</span>
          <input
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
            type="date"
            bind:value={dueDate}
          />
        </label>
      </div>
      <p class="mt-4 text-xs font-medium text-slate-500 dark:text-slate-400">
        Currency: <span class="font-semibold text-slate-700 dark:text-slate-200"
          >{currencyDisplayName}</span
        >
        <span class="ml-1 text-slate-400 dark:text-slate-500"
          >({currencySymbol} · {currency})</span
        >
      </p>
    </div>

    <div
      class="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
    >
      <label
        class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        <span>Notes</span>
        <textarea
          class="w-full min-h-[120px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
          bind:value={notes}
          placeholder="Payment instructions, reminders, or personalised thank-you notes."
        ></textarea>
      </label>
    </div>
  </div>

  <div class="grid lg:grid-cols-2 gap-6">
    <div
      class="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
    >
      <p
        class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        From
      </p>
      <div class="mt-4 space-y-3">
        <label
          class="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Name</span>
          <input
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
            bind:value={fromName}
          />
        </label>
        <label
          class="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Email</span>
          <input
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
            type="email"
            bind:value={fromEmail}
          />
        </label>
        <label
          class="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Address</span>
          <textarea
            class="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
            rows="3"
            bind:value={fromAddress}
          ></textarea>
        </label>
      </div>
    </div>

    <div
      class="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
    >
      <p
        class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        Bill to
      </p>
      <div class="mt-4 space-y-3">
        <label
          class="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Name</span>
          <input
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
            bind:value={billToName}
          />
        </label>
        <label
          class="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Email</span>
          <input
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
            type="email"
            bind:value={billToEmail}
          />
        </label>
        <label
          class="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Address</span>
          <textarea
            class="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
            rows="3"
            bind:value={billToAddress}
          ></textarea>
        </label>
      </div>
    </div>
  </div>

  <div
    class="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">
        Line items
      </p>
      <button
        class="inline-flex items-center rounded-full border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-800 dark:text-emerald-200 dark:hover:bg-emerald-900/40 dark:focus:ring-emerald-700"
        type="button"
        on:click={addItem}
      >
        Add item
      </button>
    </div>

    <div class="mt-4 space-y-4">
      {#each items as item}
        <div
          class="space-y-3 rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-700"
        >
          <label
            class="space-y-1 font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>Description</span>
            <textarea
              class="w-full min-h-[52px] resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
              bind:value={item.description}
            ></textarea>
          </label>
          <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label
              class="space-y-1 font-semibold text-slate-700 dark:text-slate-200"
            >
              <span>Quantity</span>
              <input
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
                type="number"
                min="0"
                step="1"
                bind:value={item.quantity}
              />
            </label>
            <label
              class="space-y-1 font-semibold text-slate-700 dark:text-slate-200"
            >
              <span>Rate ({currencySymbol})</span>
              <input
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
                type="number"
                min="0"
                step="0.01"
                bind:value={item.rate}
              />
            </label>
            <label
              class="space-y-1 font-semibold text-slate-700 dark:text-slate-200"
            >
              <span>Tax %</span>
              <input
                class="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
                type="number"
                min="0"
                step="0.1"
                bind:value={item.taxRate}
              />
            </label>
            <div class="flex flex-col justify-end gap-2">
              <p
                class="text-sm font-semibold text-slate-600 dark:text-slate-300"
              >
                {formatCurrency(
                  item.quantity * item.rate +
                    (item.quantity * item.rate * item.taxRate) / 100,
                )}
              </p>
              <button
                class="self-start rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:opacity-40 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-900/30 dark:focus:ring-rose-700"
                type="button"
                on:click={() => removeItem(item.id)}
                disabled={items.length <= 1}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  </div>

  <div
    class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <p
        class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        Preview
      </p>
      <span class="text-xs text-slate-400 dark:text-slate-500"
        >Exports use this layout</span
      >
    </div>

    <div
      id="invoice-preview"
      bind:this={previewRef}
      class="mt-6 max-w-full overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 text-sm font-sans leading-relaxed text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
    >
      <div
        class="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-700"
      >
        <div>
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Invoice
          </p>
          <p class="text-lg font-semibold text-slate-900 dark:text-white">
            {invoiceNumber}
          </p>
          <p class="text-xs text-slate-400 dark:text-slate-500">
            Currency: {currencySymbol} · {currency}
          </p>
        </div>
        <div class="text-right text-xs text-slate-500 dark:text-slate-400">
          <p>Issued {issueDate}</p>
          <p>Due {dueDate}</p>
        </div>
      </div>

      <div class="mt-4 grid gap-3 text-xs sm:grid-cols-2">
        <div>
          <p
            class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            From
          </p>
          <p
            class="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100"
          >
            {fromName || "-"}
          </p>
          <p>{fromEmail || "-"}</p>
          <p class="whitespace-pre-line">{fromAddress || "-"}</p>
        </div>
        <div>
          <p
            class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Bill to
          </p>
          <p
            class="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100"
          >
            {billToName || "-"}
          </p>
          <p>{billToEmail || "-"}</p>
          <p class="whitespace-pre-line">{billToAddress || "-"}</p>
        </div>
      </div>

      <div
        class="mt-6 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700"
      >
        <table
          class="min-w-full divide-y divide-slate-200 text-left text-xs dark:divide-slate-700"
        >
          <thead
            class="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            <tr>
              <th class="px-4 py-3 font-semibold uppercase tracking-wide"
                >Item</th
              >
              <th
                class="px-4 py-3 font-semibold uppercase tracking-wide text-right"
                >Qty</th
              >
              <th
                class="px-4 py-3 font-semibold uppercase tracking-wide text-right"
                >Rate ({currencySymbol})</th
              >
              <th
                class="px-4 py-3 font-semibold uppercase tracking-wide text-right"
                >Tax</th
              >
              <th
                class="px-4 py-3 font-semibold uppercase tracking-wide text-right"
                >Amount ({currencySymbol})</th
              >
            </tr>
          </thead>
          <tbody
            class="divide-y divide-slate-200 bg-white dark:divide-slate-800 dark:bg-slate-900"
          >
            {#each items as item}
              <tr>
                <td class="px-4 py-3 text-sm text-slate-700 dark:text-slate-200"
                  >{item.description || "-"}</td
                >
                <td
                  class="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-300"
                  >{item.quantity}</td
                >
                <td
                  class="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-300"
                  >{formatCurrency(item.rate)}</td
                >
                <td
                  class="px-4 py-3 text-right text-sm text-slate-600 dark:text-slate-300"
                  >{item.taxRate}%</td
                >
                <td
                  class="px-4 py-3 text-right text-sm font-semibold text-slate-900 dark:text-white"
                >
                  {formatCurrency(
                    item.quantity * item.rate +
                      (item.quantity * item.rate * item.taxRate) / 100,
                  )}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="mt-6 space-y-2 text-sm">
        <div
          class="flex items-center justify-between text-slate-600 dark:text-slate-300"
        >
          <span>Subtotal ({currencySymbol})</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div
          class="flex items-center justify-between text-slate-600 dark:text-slate-300"
        >
          <span>Total tax ({currencySymbol})</span>
          <span>{formatCurrency(totalTax)}</span>
        </div>
        <div
          class="flex items-center justify-between border-t border-slate-200 pt-2 font-semibold text-slate-900 dark:border-slate-700 dark:text-white"
        >
          <span>Total due ({currencySymbol})</span>
          <span>{formatCurrency(totalDue)}</span>
        </div>
      </div>

      {#if notes}
        <div
          class="mt-5 rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-300"
        >
          <p
            class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Notes
          </p>
          <p class="mt-1 whitespace-pre-line">{notes}</p>
        </div>
      {/if}
    </div>
  </div>

  <div
    class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
  >
    <p
      class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
    >
      Actions
    </p>
    <div class="mt-3 flex flex-wrap gap-3">
      <button
        class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
        type="button"
        on:click={downloadAsPng}
        disabled={downloadingPng}
      >
        {downloadingPng ? "Preparing PNG..." : "Download PNG"}
      </button>
      <button
        class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
        type="button"
        on:click={printPreview}
      >
        Print preview
      </button>
      <button
        class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
        type="button"
        on:click={resetInvoice}
      >
        Reset invoice
      </button>
    </div>
  </div>
</section>
