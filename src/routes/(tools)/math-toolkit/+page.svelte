<script>
  const baseOptions = [
    { value: 2, label: "Binary (base 2)" },
    { value: 3, label: "Ternary (base 3)" },
    { value: 8, label: "Octal (base 8)" },
    { value: 10, label: "Decimal (base 10)" },
    { value: 12, label: "Duodecimal (base 12)" },
    { value: 16, label: "Hexadecimal (base 16)" },
    { value: 20, label: "Vigesimal (base 20)" },
    { value: 36, label: "Base 36" },
  ];

  let baseInput = "1011101";
  let fromBase = 2;
  let toBase = 10;
  $: baseConversion = convertBase(baseInput, fromBase, toBase);

  let nValue = 6;
  let rValue = 3;
  let allowRepetition = false;
  $: combinatorics = computeCombinatorics(nValue, rValue, allowRepetition);

  let quadA = 1;
  let quadB = -3;
  let quadC = 2;
  $: quadratic = solveQuadratic(quadA, quadB, quadC);

  function convertBase(rawValue, sourceBase, targetBase) {
    const digits = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const cleaned = rawValue.trim().toUpperCase();

    if (!cleaned) {
      return {
        result: "",
        error: "Enter a number to convert.",
        decimal: "",
        binary: "",
        hex: "",
      };
    }

    const validChars = digits.slice(0, sourceBase);
    const pattern = new RegExp(`^[+-]?[${validChars}]+$`);
    if (!pattern.test(cleaned)) {
      return {
        result: "",
        error: `Value contains digits outside base ${sourceBase}.`,
        decimal: "",
        binary: "",
        hex: "",
      };
    }

    let sign = 1n;
    let startIndex = 0;
    if (cleaned[0] === "-") {
      sign = -1n;
      startIndex = 1;
    } else if (cleaned[0] === "+") {
      startIndex = 1;
    }

    let total = 0n;
    const baseBigInt = BigInt(sourceBase);
    for (let index = startIndex; index < cleaned.length; index += 1) {
      const char = cleaned[index];
      const digit = BigInt(digits.indexOf(char));
      total = total * baseBigInt + digit;
    }
    total *= sign;

    const decimalString = total.toString();
    const targetString = toBaseString(total, targetBase, digits);

    return {
      result: targetString,
      error: "",
      decimal: decimalString,
      binary: toBaseString(total, 2, digits),
      hex: toBaseString(total, 16, digits),
    };
  }

  function toBaseString(value, base, digits) {
    const symbols = digits.slice(0, base);
    if (value === 0n) {
      return "0";
    }
    let result = "";
    let number = value;
    let prefix = "";
    if (number < 0n) {
      prefix = "-";
      number = -number;
    }
    const baseBig = BigInt(base);
    while (number > 0n) {
      const remainder = number % baseBig;
      number = number / baseBig;
      result = symbols[Number(remainder)] + result;
    }
    return prefix + result;
  }

  function computeCombinatorics(n, r, withRepetition) {
    if (!Number.isInteger(n) || !Number.isInteger(r)) {
      return { error: "n and r must be integers.", data: null };
    }
    if (n < 0 || r < 0) {
      return { error: "n and r must be non-negative.", data: null };
    }
    if (!withRepetition && r > n) {
      return {
        error: "r cannot exceed n when repetition is disabled.",
        data: null,
      };
    }
    if (withRepetition && n === 0) {
      return {
        error: "n must be at least 1 when repetition is allowed.",
        data: null,
      };
    }

    try {
      const nFactorial = factorialBigInt(n);
      const permutations =
        r <= n ? factorialBigInt(n) / factorialBigInt(n - r) : null;
      const combinations =
        r <= n
          ? nFactorial / (factorialBigInt(r) * factorialBigInt(n - r))
          : null;
      const combinationsWithRep = withRepetition
        ? factorialBigInt(n + r - 1) /
          (factorialBigInt(r) * factorialBigInt(n - 1))
        : null;

      return {
        error: "",
        data: {
          nFactorial: nFactorial.toString(),
          permutations: permutations?.toString() ?? "N/A",
          combinations: combinations?.toString() ?? "N/A",
          combinationsWithRepetition: combinationsWithRep?.toString() ?? "N/A",
        },
      };
    } catch (error) {
      return {
        error: "Values are too large to compute exactly.",
        data: null,
      };
    }
  }

  function factorialBigInt(value) {
    if (value === 0 || value === 1) {
      return 1n;
    }
    let result = 1n;
    for (let index = 2n; index <= BigInt(value); index += 1n) {
      result *= index;
    }
    return result;
  }

  function solveQuadratic(a, b, c) {
    if (![a, b, c].every((value) => Number.isFinite(value))) {
      return { error: "Provide numeric coefficients.", data: null };
    }
    if (a === 0) {
      if (b === 0) {
        return { error: "a and b cannot both be zero.", data: null };
      }
      const root = -c / b;
      return {
        error: "",
        data: {
          discriminant: 0,
          nature: "Linear equation",
          roots: [root],
          vertex: null,
          axis: null,
          factorized: `${formatCoefficient(b)}x ${formatSigned(c)} = 0`,
        },
      };
    }

    const discriminant = b * b - 4 * a * c;
    const twoA = 2 * a;
    let roots = [];
    let nature = "";

    if (discriminant > 0) {
      const sqrtDisc = Math.sqrt(discriminant);
      roots = [(-b - sqrtDisc) / twoA, (-b + sqrtDisc) / twoA];
      nature = "Two distinct real roots";
    } else if (discriminant === 0) {
      const root = -b / twoA;
      roots = [root, root];
      nature = "Repeated real root";
    } else {
      const sqrtDisc = Math.sqrt(-discriminant);
      const realPart = -b / twoA;
      const imaginaryPart = sqrtDisc / twoA;
      roots = [
        `${formatNumber(realPart, 6)} - ${formatNumber(imaginaryPart, 6)}i`,
        `${formatNumber(realPart, 6)} + ${formatNumber(imaginaryPart, 6)}i`,
      ];
      nature = "Complex conjugate roots";
    }

    const vertexX = -b / (2 * a);
    const vertexY = a * vertexX * vertexX + b * vertexX + c;
    const factorized = buildFactorizedForm(a, roots, discriminant);

    return {
      error: "",
      data: {
        discriminant,
        nature,
        roots,
        vertex: [vertexX, vertexY],
        axis: vertexX,
        factorized,
      },
    };
  }

  function buildFactorizedForm(a, roots, discriminant) {
    if (roots.length === 1) {
      return `${formatCoefficient(a)}(x ${formatSigned(-roots[0])})`;
    }
    if (discriminant < 0) {
      return "Does not factor over the reals";
    }
    const [r1, r2] = roots;
    return `${formatCoefficient(a)}(x ${formatSigned(-r1)})(x ${formatSigned(-r2)})`;
  }

  function formatSigned(value) {
    if (typeof value === "string") {
      return value.startsWith("-") ? `- ${value.slice(1)}` : `+ ${value}`;
    }
    return value < 0
      ? `- ${formatNumber(Math.abs(value), 6)}`
      : `+ ${formatNumber(value, 6)}`;
  }

  function formatCoefficient(value) {
    if (value === 1) {
      return "";
    }
    if (value === -1) {
      return "-";
    }
    return formatNumber(value, 6);
  }

  function formatNumber(value, digits = 4) {
    if (typeof value === "string") {
      return value;
    }
    if (!Number.isFinite(value)) {
      return value.toString();
    }
    return Number(value).toLocaleString(undefined, {
      maximumFractionDigits: digits,
    });
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div class="grid gap-6 lg:grid-cols-2">
    <div
      class="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="space-y-1">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Number system converter
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Translate integers between bases 2 through 36 with big-int precision.
        </p>
      </div>
      <div class="space-y-4">
        <label
          class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          Value to convert
          <input
            class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={baseInput}
            placeholder="Enter digits"
          />
        </label>
        <div class="grid gap-3 sm:grid-cols-2">
          <label
            class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            From base
            <select
              class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={fromBase}
            >
              {#each baseOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </label>
          <label
            class="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            To base
            <select
              class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={toBase}
            >
              {#each baseOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </label>
        </div>
        {#if baseConversion.error}
          <p
            class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
          >
            {baseConversion.error}
          </p>
        {:else}
          <div class="space-y-3">
            <div
              class="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              <span class="font-semibold text-slate-500 dark:text-slate-400"
                >Converted</span
              >
              <code class="font-mono text-indigo-700 dark:text-indigo-300"
                >{baseConversion.result}</code
              >
            </div>
            <div
              class="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              <span class="font-semibold text-slate-500 dark:text-slate-400"
                >Decimal</span
              >
              <code class="font-mono text-indigo-700 dark:text-indigo-300"
                >{baseConversion.decimal}</code
              >
            </div>
            <div
              class="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              <span class="font-semibold text-slate-500 dark:text-slate-400"
                >Binary</span
              >
              <code class="font-mono text-indigo-700 dark:text-indigo-300"
                >{baseConversion.binary}</code
              >
            </div>
            <div
              class="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              <span class="font-semibold text-slate-500 dark:text-slate-400"
                >Hex</span
              >
              <code class="font-mono text-indigo-700 dark:text-indigo-300"
                >{baseConversion.hex}</code
              >
            </div>
          </div>
        {/if}
      </div>
    </div>

    <div
      class="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="space-y-1">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Combinatorics
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Compute factorials, permutations, and combinations with or without
          repetition.
        </p>
      </div>
      <div class="space-y-4">
        <div class="grid gap-3 sm:grid-cols-2">
          <label
            class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            n (items)
            <input
              type="number"
              min="0"
              class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={nValue}
            />
          </label>
          <label
            class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            r (selected)
            <input
              type="number"
              min="0"
              class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={rValue}
            />
          </label>
        </div>
        <label
          class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <input
            type="checkbox"
            bind:checked={allowRepetition}
            class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          Allow repetition
        </label>

        {#if combinatorics.error}
          <p
            class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
          >
            {combinatorics.error}
          </p>
        {:else if combinatorics.data}
          <div class="space-y-2 text-sm">
            <div
              class="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              <span class="font-semibold text-slate-500 dark:text-slate-400"
                >n!</span
              >
              <code class="font-mono text-indigo-700 dark:text-indigo-300"
                >{combinatorics.data.nFactorial}</code
              >
            </div>
            <div
              class="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              <span class="font-semibold text-slate-500 dark:text-slate-400"
                >nPr</span
              >
              <code class="font-mono text-indigo-700 dark:text-indigo-300"
                >{combinatorics.data.permutations}</code
              >
            </div>
            <div
              class="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              <span class="font-semibold text-slate-500 dark:text-slate-400"
                >nCr</span
              >
              <code class="font-mono text-indigo-700 dark:text-indigo-300"
                >{combinatorics.data.combinations}</code
              >
            </div>
            <div
              class="flex items-center justify-between gap-3 rounded-xl border border-dashed border-slate-200 px-3 py-2 text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              <span class="font-semibold text-slate-500 dark:text-slate-400"
                >nHr</span
              >
              <code class="font-mono text-indigo-700 dark:text-indigo-300"
                >{combinatorics.data.combinationsWithRepetition}</code
              >
            </div>
          </div>
        {/if}
      </div>
    </div>

    <div
      class="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80 lg:col-span-2"
    >
      <div class="space-y-1">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Quadratic explorer
        </h2>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Understand the curve defined by ax^2 + bx + c = 0, including
          discriminant, roots, and vertex.
        </p>
      </div>
      <div class="grid gap-4 md:grid-cols-3">
        <label
          class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          a
          <input
            type="number"
            step="any"
            class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={quadA}
          />
        </label>
        <label
          class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          b
          <input
            type="number"
            step="any"
            class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={quadB}
          />
        </label>
        <label
          class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          c
          <input
            type="number"
            step="any"
            class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={quadC}
          />
        </label>
      </div>

      {#if quadratic.error}
        <p
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
        >
          {quadratic.error}
        </p>
      {:else if quadratic.data}
        <div class="grid gap-3 md:grid-cols-2">
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
          >
            <h3
              class="mb-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300"
            >
              Roots
            </h3>
            <ul class="space-y-1 text-sm text-slate-700 dark:text-slate-200">
              {#each quadratic.data.roots as root, index}
                <li>
                  Root {index + 1}: {typeof root === "number"
                    ? formatNumber(root, 6)
                    : root}
                </li>
              {/each}
            </ul>
          </div>
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
          >
            <h3
              class="mb-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300"
            >
              Characteristics
            </h3>
            <ul class="space-y-1 text-sm text-slate-700 dark:text-slate-200">
              <li>
                Discriminant: {formatNumber(quadratic.data.discriminant, 6)}
              </li>
              <li>Nature: {quadratic.data.nature}</li>
              <li>
                Vertex: ({formatNumber(quadratic.data.vertex[0], 6)}, {formatNumber(
                  quadratic.data.vertex[1],
                  6,
                )})
              </li>
              <li>
                Axis of symmetry: x = {formatNumber(quadratic.data.axis, 6)}
              </li>
              <li>Factorized form: {quadratic.data.factorized}</li>
            </ul>
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
