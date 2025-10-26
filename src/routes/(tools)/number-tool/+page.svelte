<script>
  let inputValue = "12345.6789";
  let roundingDigits = 2;
  $: report = analyzeNumber(inputValue, roundingDigits);

  function analyzeNumber(raw, digits) {
    const sanitized = raw.replace(/,/g, "").trim();
    if (!sanitized) {
      return { error: "Enter a number to analyze.", data: null };
    }

    const value = Number(sanitized);
    if (!Number.isFinite(value)) {
      return { error: "Provide a valid finite number.", data: null };
    }

    const absoluteValue = Math.abs(value);
    const integerPart = Math.trunc(value);
    const fractionalPart = value - integerPart;
    const fractionalAbs = Math.abs(fractionalPart);
    const precision = clamp(digits, 0, 12);
    const roundedValue = Number(value.toFixed(precision));

    const data = {
      original: value,
      normalized: sanitized,
      sign: value === 0 ? "zero" : value > 0 ? "positive" : "negative",
      absolute: absoluteValue,
      integerPart,
      fractionalPart,
      fractionalAbs,
      rounded: {
        digits: precision,
        round: roundedValue,
        floor: Math.floor(value),
        ceil: Math.ceil(value),
        trunc: Math.trunc(value),
      },
      reciprocal: value !== 0 ? 1 / value : null,
      square: value * value,
      cube: value * value * value,
      percentage: value * 100,
      scientific: value.toExponential(6),
      engineering: toEngineering(value),
      angle: {
        radians: value,
        degrees: value * (180 / Math.PI),
        gradians: value * (200 / Math.PI),
      },
      logarithms: buildLogarithms(value),
      roots: {
        squareRoot: value >= 0 ? Math.sqrt(value) : null,
        cubeRoot: Math.cbrt(value),
      },
      isInteger: Number.isInteger(value),
      parity: Number.isInteger(value)
        ? value % 2 === 0
          ? "even"
          : "odd"
        : "N/A",
      baseRepresentations: buildBaseRepresentations(value),
      ordinal: Number.isInteger(value) ? toOrdinal(integerPart) : null,
      roman: Number.isInteger(value) ? toRoman(integerPart) : null,
      words:
        Number.isInteger(value) && Math.abs(value) < 1_000_000
          ? toWords(integerPart)
          : null,
      integerInsights: Number.isInteger(value)
        ? buildIntegerInsights(Math.abs(integerPart))
        : null,
    };

    return { error: "", data };
  }

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function toEngineering(value) {
    if (value === 0) {
      return "0";
    }
    const exponent = Math.floor(Math.log10(Math.abs(value)) / 3) * 3;
    const mantissa = value / Math.pow(10, exponent);
    return `${mantissa.toFixed(6)} x 10^${exponent}`;
  }

  function buildLogarithms(value) {
    if (value <= 0) {
      return {
        log10: null,
        ln: null,
        log2: null,
      };
    }
    return {
      log10: Math.log10(value),
      ln: Math.log(value),
      log2: Math.log2(value),
    };
  }

  function buildBaseRepresentations(value) {
    if (!Number.isInteger(value) || !Number.isSafeInteger(value)) {
      return {
        binary: "N/A",
        octal: "N/A",
        hex: "N/A",
      };
    }
    const intValue = value;
    const prefix = intValue < 0 ? "-" : "";
    const absValue = Math.abs(intValue);
    return {
      binary: prefix + absValue.toString(2),
      octal: prefix + absValue.toString(8),
      hex: prefix + absValue.toString(16).toUpperCase(),
    };
  }

  function buildIntegerInsights(n) {
    if (n === 0) {
      return {
        digitalRoot: 0,
        sumOfDigits: 0,
        factors: "Not defined",
        divisorCount: null,
        classification: ["Zero"],
      };
    }
    if (n === 1) {
      return {
        digitalRoot: 1,
        sumOfDigits: 1,
        factors: "1",
        divisorCount: 1,
        classification: ["Unit"],
      };
    }

    const factors = primeFactorization(n);
    const factorString = factors
      .map(({ prime, exponent }) =>
        exponent === 1 ? `${prime}` : `${prime}^${exponent}`,
      )
      .join(" x ");
    const divisorCount = factors.reduce(
      (acc, { exponent }) => acc * (exponent + 1),
      1,
    );
    const sumOfDigits = n
      .toString()
      .split("")
      .reduce((acc, char) => acc + Number(char), 0);

    const digitalRootValue = digitalRoot(n);
    const classification = [];
    if (isPrime(n)) {
      classification.push("Prime");
    } else if (n > 1) {
      classification.push("Composite");
    }
    if (isPerfectSquare(n)) {
      classification.push("Perfect square");
    }
    if (isPowerOfTwo(n)) {
      classification.push("Power of two");
    }
    if (isFibonacci(n)) {
      classification.push("Fibonacci number");
    }

    return {
      digitalRoot: digitalRootValue,
      sumOfDigits,
      factors: factorString || "1",
      divisorCount,
      classification,
    };
  }

  function primeFactorization(n) {
    const factors = [];
    let remainder = n;
    let exponent = 0;
    while (remainder % 2 === 0) {
      exponent += 1;
      remainder /= 2;
    }
    if (exponent) {
      factors.push({ prime: 2, exponent });
    }
    let divisor = 3;
    const limit = Math.sqrt(remainder) + 1;
    while (divisor <= limit && remainder > 1) {
      exponent = 0;
      while (remainder % divisor === 0) {
        exponent += 1;
        remainder /= divisor;
      }
      if (exponent) {
        factors.push({ prime: divisor, exponent });
      }
      divisor += 2;
    }
    if (remainder > 1) {
      factors.push({ prime: remainder, exponent: 1 });
    }
    return factors;
  }

  function digitalRoot(n) {
    if (n === 0) {
      return 0;
    }
    return 1 + ((n - 1) % 9);
  }

  function isPrime(n) {
    if (n < 2) {
      return false;
    }
    if (n % 2 === 0) {
      return n === 2;
    }
    const limit = Math.sqrt(n);
    for (let divisor = 3; divisor <= limit; divisor += 2) {
      if (n % divisor === 0) {
        return false;
      }
    }
    return true;
  }

  function isPerfectSquare(n) {
    return Number.isInteger(Math.sqrt(n));
  }

  function isPowerOfTwo(n) {
    if (n <= 0) {
      return false;
    }
    return Number.isInteger(Math.log2(n));
  }

  function isFibonacci(n) {
    const test1 = 5 * n * n + 4;
    const test2 = 5 * n * n - 4;
    return (
      Number.isInteger(Math.sqrt(test1)) || Number.isInteger(Math.sqrt(test2))
    );
  }

  function toOrdinal(n) {
    const abs = Math.abs(n);
    const remainder = abs % 100;
    if (remainder >= 11 && remainder <= 13) {
      return `${n}th`;
    }
    switch (abs % 10) {
      case 1:
        return `${n}st`;
      case 2:
        return `${n}nd`;
      case 3:
        return `${n}rd`;
      default:
        return `${n}th`;
    }
  }

  function toRoman(n) {
    if (n <= 0 || n >= 4000) {
      return null;
    }
    const numerals = [
      [1000, "M"],
      [900, "CM"],
      [500, "D"],
      [400, "CD"],
      [100, "C"],
      [90, "XC"],
      [50, "L"],
      [40, "XL"],
      [10, "X"],
      [9, "IX"],
      [5, "V"],
      [4, "IV"],
      [1, "I"],
    ];
    let remainder = Math.abs(n);
    let result = "";
    for (const [value, symbol] of numerals) {
      while (remainder >= value) {
        result += symbol;
        remainder -= value;
      }
    }
    return n < 0 ? `-${result}` : result;
  }

  function toWords(n) {
    const units = [
      "zero",
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "nine",
      "ten",
      "eleven",
      "twelve",
      "thirteen",
      "fourteen",
      "fifteen",
      "sixteen",
      "seventeen",
      "eighteen",
      "nineteen",
    ];
    const tens = [
      "",
      "",
      "twenty",
      "thirty",
      "forty",
      "fifty",
      "sixty",
      "seventy",
      "eighty",
      "ninety",
    ];

    if (n < 0) {
      return `negative ${toWords(-n)}`;
    }
    if (n < 20) {
      return units[n];
    }
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const rest = n % 10;
      return rest === 0 ? tens[ten] : `${tens[ten]}-${units[rest]}`;
    }
    if (n < 1000) {
      const hundred = Math.floor(n / 100);
      const rest = n % 100;
      return rest === 0
        ? `${units[hundred]} hundred`
        : `${units[hundred]} hundred ${toWords(rest)}`;
    }
    const thousand = Math.floor(n / 1000);
    const rest = n % 1000;
    return rest === 0
      ? `${toWords(thousand)} thousand`
      : `${toWords(thousand)} thousand ${toWords(rest)}`;
  }

  function formatNumber(value, digits = 6) {
    if (value === null || value === undefined) {
      return "N/A";
    }
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

<section class="space-y-6">
  <div
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80 space-y-4"
  >
    <div class="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px] md:items-end">
      <label
        class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        Enter a number
        <input
          class="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-base text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={inputValue}
          placeholder="Example: -42.875"
        />
      </label>
      <label
        class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        Rounding precision: {roundingDigits} decimals
        <input
          type="range"
          min="0"
          max="10"
          bind:value={roundingDigits}
          class="mt-2 w-full accent-indigo-600"
        />
      </label>
    </div>
    {#if report.error}
      <p
        class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
      >
        {report.error}
      </p>
    {/if}
  </div>

  {#if report.data}
    <div class="grid gap-6">
      <div class="grid gap-4 lg:grid-cols-2">
        <div
          class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
        >
          <h2
            class="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            Core snapshot
          </h2>
          <dl class="space-y-3 text-sm">
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Original
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {formatNumber(report.data.original, 10)}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Absolute value
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {formatNumber(report.data.absolute, 10)}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Sign
              </dt>
              <dd class="capitalize text-slate-700 dark:text-slate-200">
                {report.data.sign}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Integer part
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {formatNumber(report.data.integerPart, 0)}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Fractional part
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {formatNumber(report.data.fractionalAbs, 10)}
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Square (x^2)
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {formatNumber(report.data.square, 6)}
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Cube (x^3)
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {formatNumber(report.data.cube, 6)}
              </dd>
            </div>
          </dl>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
        >
          <h2
            class="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            Rounding behaviour
          </h2>
          <dl class="space-y-3 text-sm">
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Round ({report.data.rounded.digits} dp)
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {formatNumber(
                  report.data.rounded.round,
                  report.data.rounded.digits,
                )}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Floor
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {formatNumber(report.data.rounded.floor, 0)}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Ceil
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {formatNumber(report.data.rounded.ceil, 0)}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Truncate
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {formatNumber(report.data.rounded.trunc, 0)}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Reciprocal
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.reciprocal === null
                  ? "N/A"
                  : formatNumber(report.data.reciprocal, 8)}
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Percentage
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {formatNumber(report.data.percentage, 6)}%
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="grid gap-4 lg:grid-cols-2">
        <div
          class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
        >
          <h2
            class="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            Representations
          </h2>
          <dl class="space-y-3 text-sm">
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Scientific notation
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.scientific}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Engineering notation
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.engineering}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Binary
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.baseRepresentations.binary}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Octal
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.baseRepresentations.octal}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Hexadecimal
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.baseRepresentations.hex}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Ordinal (if integer)
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.ordinal ?? "N/A"}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Roman numeral
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.roman ?? "N/A"}
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Words
              </dt>
              <dd class="text-right text-slate-700 dark:text-slate-200">
                {report.data.words ?? "N/A"}
              </dd>
            </div>
          </dl>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
        >
          <h2
            class="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            Logs & roots
          </h2>
          <dl class="space-y-3 text-sm">
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                log10(x)
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.logarithms.log10 === null
                  ? "undefined"
                  : formatNumber(report.data.logarithms.log10, 6)}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                ln(x)
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.logarithms.ln === null
                  ? "undefined"
                  : formatNumber(report.data.logarithms.ln, 6)}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                log2(x)
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.logarithms.log2 === null
                  ? "undefined"
                  : formatNumber(report.data.logarithms.log2, 6)}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                sqrt(x)
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.roots.squareRoot === null
                  ? "undefined"
                  : formatNumber(report.data.roots.squareRoot, 6)}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                cuberoot(x)
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {formatNumber(report.data.roots.cubeRoot, 6)}
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Angles
              </dt>
              <dd
                class="text-right font-mono text-indigo-700 dark:text-indigo-300"
              >
                {formatNumber(report.data.angle.degrees, 6)} degrees / {formatNumber(
                  report.data.angle.gradians,
                  6,
                )} gradians
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {#if report.data.integerInsights}
        <div
          class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
        >
          <h2
            class="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            Integer insights
          </h2>
          <dl class="space-y-3 text-sm">
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Prime factors
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.integerInsights.factors}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Divisor count
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.integerInsights.divisorCount ?? "N/A"}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Digital root
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.integerInsights.digitalRoot}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-2 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Sum of digits
              </dt>
              <dd class="font-mono text-indigo-700 dark:text-indigo-300">
                {report.data.integerInsights.sumOfDigits}
              </dd>
            </div>
            <div class="flex items-start justify-between">
              <dt class="font-semibold text-slate-500 dark:text-slate-400">
                Classification
              </dt>
              <dd class="text-right text-slate-700 dark:text-slate-200">
                {report.data.integerInsights.classification.length
                  ? report.data.integerInsights.classification.join(", ")
                  : "N/A"}
              </dd>
            </div>
          </dl>
        </div>
      {/if}
    </div>
  {/if}
</section>
