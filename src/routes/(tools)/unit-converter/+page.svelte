<script>
  const categories = [
    {
      id: "length",
      title: "Length",
      description: "Distances, heights, and everyday linear measurements.",
      type: "factor",
      units: [
        { id: "meter", label: "Meter (m)", factor: 1 },
        { id: "kilometer", label: "Kilometer (km)", factor: 1000 },
        { id: "centimeter", label: "Centimeter (cm)", factor: 0.01 },
        { id: "millimeter", label: "Millimeter (mm)", factor: 0.001 },
        { id: "mile", label: "Mile (mi)", factor: 1609.344 },
        { id: "yard", label: "Yard (yd)", factor: 0.9144 },
        { id: "foot", label: "Foot (ft)", factor: 0.3048 },
        { id: "inch", label: "Inch (in)", factor: 0.0254 },
      ],
    },
    {
      id: "mass",
      title: "Mass",
      description: "Weights and mass across metric and imperial systems.",
      type: "factor",
      units: [
        { id: "kilogram", label: "Kilogram (kg)", factor: 1 },
        { id: "gram", label: "Gram (g)", factor: 0.001 },
        { id: "milligram", label: "Milligram (mg)", factor: 0.000001 },
        { id: "pound", label: "Pound (lb)", factor: 0.45359237 },
        { id: "ounce", label: "Ounce (oz)", factor: 0.0283495231 },
        { id: "stone", label: "Stone (st)", factor: 6.35029318 },
        { id: "tonne", label: "Metric tonne (t)", factor: 1000 },
      ],
    },
    {
      id: "temperature",
      title: "Temperature",
      description: "Convert among Celsius, Fahrenheit, Kelvin, and Rankine.",
      type: "custom",
      units: [
        {
          id: "celsius",
          label: "Celsius (deg C)",
          toBase: (value) => value + 273.15,
          fromBase: (value) => value - 273.15,
        },
        {
          id: "fahrenheit",
          label: "Fahrenheit (deg F)",
          toBase: (value) => (value + 459.67) * (5 / 9),
          fromBase: (value) => value * (9 / 5) - 459.67,
        },
        {
          id: "kelvin",
          label: "Kelvin (K)",
          toBase: (value) => value,
          fromBase: (value) => value,
        },
        {
          id: "rankine",
          label: "Rankine (deg R)",
          toBase: (value) => value * (5 / 9),
          fromBase: (value) => value * (9 / 5),
        },
      ],
    },
    {
      id: "time",
      title: "Time",
      description: "Seconds, minutes, hours, and beyond.",
      type: "factor",
      units: [
        { id: "second", label: "Second (s)", factor: 1 },
        { id: "millisecond", label: "Millisecond (ms)", factor: 0.001 },
        { id: "minute", label: "Minute (min)", factor: 60 },
        { id: "hour", label: "Hour (h)", factor: 3600 },
        { id: "day", label: "Day (d)", factor: 86400 },
        { id: "week", label: "Week", factor: 604800 },
      ],
    },
    {
      id: "area",
      title: "Area",
      description: "Surface coverage for land and spaces.",
      type: "factor",
      units: [
        { id: "square_meter", label: "Square meter (m^2)", factor: 1 },
        {
          id: "square_kilometer",
          label: "Square kilometer (km^2)",
          factor: 1_000_000,
        },
        { id: "square_foot", label: "Square foot (ft^2)", factor: 0.09290304 },
        { id: "square_inch", label: "Square inch (in^2)", factor: 0.00064516 },
        { id: "acre", label: "Acre", factor: 4046.8564224 },
        { id: "hectare", label: "Hectare (ha)", factor: 10_000 },
      ],
    },
    {
      id: "volume",
      title: "Volume",
      description: "Liquids and three-dimensional capacity.",
      type: "factor",
      units: [
        { id: "liter", label: "Liter (L)", factor: 0.001 },
        { id: "milliliter", label: "Milliliter (mL)", factor: 0.000001 },
        { id: "cubic_meter", label: "Cubic meter (m^3)", factor: 1 },
        { id: "cubic_foot", label: "Cubic foot (ft^3)", factor: 0.0283168466 },
        { id: "gallon_us", label: "US gallon", factor: 0.00378541178 },
        { id: "quart_us", label: "US quart", factor: 0.00094635295 },
        { id: "pint_us", label: "US pint", factor: 0.000473176475 },
        { id: "cup_us", label: "US cup", factor: 0.000236588238 },
      ],
    },
    {
      id: "data",
      title: "Data",
      description: "Digital storage in decimal units (kB = 1000 bytes).",
      type: "factor",
      units: [
        { id: "bit", label: "Bit (b)", factor: 1 / 8 },
        { id: "byte", label: "Byte (B)", factor: 1 },
        { id: "kilobyte", label: "Kilobyte (kB)", factor: 1000 },
        { id: "megabyte", label: "Megabyte (MB)", factor: 1_000_000 },
        { id: "gigabyte", label: "Gigabyte (GB)", factor: 1_000_000_000 },
        { id: "terabyte", label: "Terabyte (TB)", factor: 1_000_000_000_000 },
      ],
    },
  ];

  let categoryId = categories[0].id;
  let fromUnitId = categories[0].units[0].id;
  let toUnitId = categories[0].units[1].id;
  let amount = 1;
  let quickValue = "";

  $: currentCategory =
    categories.find((category) => category.id === categoryId) ?? categories[0];
  $: fromUnitId = ensureUnitId(currentCategory, fromUnitId, 0);
  $: toUnitId = ensureUnitId(
    currentCategory,
    toUnitId,
    Math.min(1, currentCategory.units.length - 1),
  );
  $: fromUnit =
    currentCategory.units.find((unit) => unit.id === fromUnitId) ??
    currentCategory.units[0];
  $: toUnit =
    currentCategory.units.find((unit) => unit.id === toUnitId) ??
    currentCategory.units[Math.min(1, currentCategory.units.length - 1)];
  $: conversion = convert(amount, currentCategory, fromUnit, toUnit);

  function ensureUnitId(category, unitId, fallbackIndex) {
    if (!category.units.some((unit) => unit.id === unitId)) {
      return category.units[fallbackIndex]?.id ?? category.units[0].id;
    }
    return unitId;
  }

  function convert(value, category, fromUnit, toUnit) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return { error: "Enter a numeric value.", result: null, rows: [] };
    }

    const baseValue =
      category.type === "custom"
        ? fromUnit.toBase(numericValue)
        : numericValue * fromUnit.factor;

    const targetValue =
      category.type === "custom"
        ? toUnit.fromBase(baseValue)
        : baseValue / toUnit.factor;

    const rows = category.units.map((unit) => {
      const converted =
        category.type === "custom"
          ? unit.fromBase(baseValue)
          : baseValue / unit.factor;
      return {
        id: unit.id,
        label: unit.label,
        value: converted,
      };
    });

    return {
      error: "",
      result: targetValue,
      baseValue,
      rows,
    };
  }

  function formatNumber(value, digits = 6) {
    if (value === null || value === undefined) {
      return "N/A";
    }
    if (!Number.isFinite(value)) {
      return value.toString();
    }
    return Number(value).toLocaleString(undefined, {
      maximumFractionDigits: digits,
    });
  }

  function applyQuickValue(sample) {
    quickValue = sample.label;
    amount = sample.value;
  }

  const quickSamples = [
    { category: "length", label: "Marathon distance", value: 42195 },
    { category: "mass", label: "Laptop weight", value: 1.35 },
    { category: "temperature", label: "Room temperature", value: 21 },
    { category: "volume", label: "Coffee mug", value: 0.35 },
    { category: "data", label: "HD movie", value: 8.5 },
  ];
</script>

<section class="space-y-6">
  <div class="grid gap-4 md:grid-cols-[240px_minmax(0,1fr)]">
    <aside
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
    >
      <label
        class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        Category
        <select
          class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={categoryId}
        >
          {#each categories as category}
            <option value={category.id}>{category.title}</option>
          {/each}
        </select>
      </label>

      <div class="space-y-2">
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Quick samples
        </p>
        <div class="flex flex-wrap gap-2">
          {#each quickSamples.filter((sample) => sample.category === categoryId) as sample}
            <button
              type="button"
              class="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
              on:click={() => applyQuickValue(sample)}
            >
              {sample.label}
            </button>
          {/each}
        </div>
      </div>

      <p class="text-xs text-slate-500 dark:text-slate-400">
        {currentCategory.description}
      </p>
    </aside>

    <div
      class="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="grid gap-4 md:grid-cols-2">
        <label
          class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          Amount
          <input
            type="number"
            step="any"
            class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={amount}
            on:input={() => (quickValue = "")}
          />
        </label>
        <div
          class="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400"
        >
          {quickValue
            ? `Sample applied: ${quickValue}`
            : "Enter a value or choose a sample"}
        </div>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <label
          class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          From unit
          <select
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={fromUnitId}
          >
            {#each currentCategory.units as unit}
              <option value={unit.id}>{unit.label}</option>
            {/each}
          </select>
        </label>
        <label
          class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          To unit
          <select
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={toUnitId}
          >
            {#each currentCategory.units as unit}
              <option value={unit.id}>{unit.label}</option>
            {/each}
          </select>
        </label>
      </div>

      {#if conversion.error}
        <p
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
        >
          {conversion.error}
        </p>
      {:else}
        <div
          class="rounded-2xl border border-indigo-200 bg-indigo-50 px-5 py-4 text-sm text-indigo-900 shadow-inner dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-100"
        >
          <p class="text-xs font-semibold uppercase tracking-wide">
            Converted result
          </p>
          <p class="text-lg font-bold">
            {formatNumber(amount, 8)}
            {fromUnit.label} = {formatNumber(conversion.result, 8)}
            {toUnit.label}
          </p>
        </div>

        <div
          class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-inner dark:border-slate-800 dark:bg-slate-900"
        >
          <table class="min-w-full text-sm">
            <thead
              class="bg-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              <tr>
                <th class="px-4 py-3">Unit</th>
                <th class="px-4 py-3 text-right">Value</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              {#each conversion.rows as row}
                <tr
                  class="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900/70 dark:even:bg-slate-900"
                >
                  <td
                    class="px-4 py-3 font-medium text-slate-700 dark:text-slate-200"
                    >{row.label}</td
                  >
                  <td
                    class="px-4 py-3 text-right font-mono text-slate-700 dark:text-slate-100"
                    >{formatNumber(row.value, 8)}</td
                  >
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </div>
  </div>
</section>
