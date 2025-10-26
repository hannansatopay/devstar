<script>
  import { onMount } from "svelte";

  const examples = [
    { label: "Consecutive integers", values: "12, 13, 14, 15, 16" },
    { label: "Highly composite set", values: "24, 36, 60, 96" },
    { label: "Mixed integers", values: "-45, -30, 0, 54, 81" },
  ];

  let rawInput = examples[0].values;
  let numbers = [];
  let report = null;
  let error = "";
  let lastAnalyzed = "";

  onMount(() => {
    analyze();
  });

  function loadExample(values) {
    rawInput = values;
    analyze();
  }

  function clearAll() {
    rawInput = "";
    numbers = [];
    report = null;
    error = "";
    lastAnalyzed = "";
  }

  function analyze() {
    const tokens = rawInput
      .split(/[\s,;]+/)
      .map((value) => value.trim())
      .filter(Boolean);

    if (!tokens.length) {
      error = "Enter at least one integer.";
      report = null;
      numbers = [];
      return;
    }

    const parsed = [];
    for (const token of tokens) {
      if (!/^[-+]?\d+$/.test(token)) {
        error = `Invalid integer: "${token}"`;
        report = null;
        numbers = [];
        return;
      }
      parsed.push(Number.parseInt(token, 10));
    }

    numbers = parsed;
    report = buildReport(parsed);
    error = "";
    lastAnalyzed = rawInput;
  }

  function buildReport(list) {
    const count = list.length;
    const sorted = [...list].sort((a, b) => a - b);
    const sum = list.reduce((acc, value) => acc + value, 0);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    const mean = sum / count;
    const medianValue = computeMedian(sorted);
    const range = max - min;
    const variance =
      count > 1
        ? list.reduce((acc, value) => acc + Math.pow(value - mean, 2), 0) /
          count
        : 0;
    const stdDev = Math.sqrt(variance);

    const frequency = new Map();
    let zeroCount = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let evenCount = 0;
    let oddCount = 0;
    let primeCount = 0;

    const uniquePrimeFactors = new Set();
    const details = list.map((value) => {
      const detail = describeInteger(value);
      detail.primeFactors.forEach((prime) => uniquePrimeFactors.add(prime));
      if (detail.isPrime) {
        primeCount += 1;
      }
      if (value === 0) {
        zeroCount += 1;
      } else if (value > 0) {
        positiveCount += 1;
      } else {
        negativeCount += 1;
      }
      if (value % 2 === 0) {
        evenCount += 1;
      } else {
        oddCount += 1;
      }
      frequency.set(value, (frequency.get(value) ?? 0) + 1);
      return detail;
    });

    const gcdValue = list.reduce((acc, value) => gcd(acc, value));
    const lcmValue = list.reduce((acc, value) => lcm(acc, value));

    const modes = computeModes(frequency);
    const duplicateEntries = Array.from(frequency.entries())
      .filter(([, count]) => count > 1)
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count || a.value - b.value);

    return {
      sorted,
      details,
      summary: {
        count,
        min,
        max,
        range,
        sum,
        mean,
        median: medianValue,
        variance,
        stdDev,
        gcd: gcdValue,
        lcm: lcmValue,
        modes,
        uniquePrimeFactors: Array.from(uniquePrimeFactors).sort(
          (a, b) => a - b,
        ),
      },
      distribution: {
        zeroCount,
        positiveCount,
        negativeCount,
        evenCount,
        oddCount,
        primeCount,
      },
      duplicates: duplicateEntries,
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

  function computeMedian(sorted) {
    if (!sorted.length) {
      return 0;
    }
    const midpoint = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
    }
    return sorted[midpoint];
  }

  function computeModes(frequency) {
    if (!frequency.size) {
      return [];
    }
    let maxFrequency = 0;
    frequency.forEach((value) => {
      if (value > maxFrequency) {
        maxFrequency = value;
      }
    });
    if (maxFrequency <= 1) {
      return [];
    }
    const result = [];
    frequency.forEach((count, value) => {
      if (count === maxFrequency) {
        result.push(value);
      }
    });
    return result.sort((a, b) => a - b);
  }

  function gcd(a, b) {
    let x = Math.abs(a);
    let y = Math.abs(b);
    while (y !== 0) {
      const temp = x % y;
      x = y;
      y = temp;
    }
    return x;
  }

  function lcm(a, b) {
    if (a === 0 || b === 0) {
      return 0;
    }
    return Math.abs(a * b) / gcd(a, b);
  }

  function describeInteger(value) {
    const abs = Math.abs(value);
    const sign = value === 0 ? "zero" : value > 0 ? "positive" : "negative";
    const parity = value % 2 === 0 ? "even" : "odd";
    const primeInfo = primeBreakdown(abs);
    const primeFactorList = primeInfo.sequence;
    const divisorCount = primeInfo.divisorCount;
    const sumOfDivisors = primeInfo.sumOfDivisors;
    const properDivisorSum = abs > 0 ? sumOfDivisors - abs : null;
    const digitalRootValue = digitalRoot(abs);
    const sumOfDigitsValue = digitSum(abs);
    const classifications = buildClassification({
      value,
      abs,
      primeInfo,
      properDivisorSum,
    });

    return {
      value,
      abs,
      sign,
      parity,
      isPrime: primeInfo.isPrime,
      isComposite: primeInfo.isComposite,
      primeFactors: primeFactorList.map((entry) => entry.prime),
      factorString: primeInfo.factorString,
      divisorCount,
      properDivisorSum,
      sumOfDigits: sumOfDigitsValue,
      digitalRoot: digitalRootValue,
      classifications,
      isPerfectSquare: primeInfo.isPerfectSquare,
      isPerfectCube: primeInfo.isPerfectCube,
    };
  }

  function primeBreakdown(n) {
    if (n === 0) {
      return {
        isPrime: false,
        isComposite: false,
        sequence: [],
        factorString: "Not defined",
        divisorCount: null,
        sumOfDivisors: null,
        isPerfectSquare: false,
        isPerfectCube: false,
      };
    }

    if (n === 1) {
      return {
        isPrime: false,
        isComposite: false,
        sequence: [],
        factorString: "1",
        divisorCount: 1,
        sumOfDivisors: 1,
        isPerfectSquare: true,
        isPerfectCube: true,
      };
    }

    const factors = [];
    let remainder = n;
    let exponent;

    exponent = 0;
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

    const isPrime =
      factors.length === 1 &&
      factors[0].exponent === 1 &&
      factors[0].prime === n;
    const isComposite = !isPrime;

    const factorString = factors
      .map((entry) =>
        entry.exponent === 1
          ? `${entry.prime}`
          : `${entry.prime}^${entry.exponent}`,
      )
      .join(" x ");

    let divisorCount = 1;
    let sumOfDivisors = 1;
    for (const { prime, exponent } of factors) {
      divisorCount *= exponent + 1;
      sumOfDivisors *= (Math.pow(prime, exponent + 1) - 1) / (prime - 1);
    }

    const isSquare = factors.every(({ exponent }) => exponent % 2 === 0);
    const isCube = factors.every(({ exponent }) => exponent % 3 === 0);

    return {
      isPrime,
      isComposite,
      sequence: factors,
      factorString,
      divisorCount,
      sumOfDivisors,
      isPerfectSquare: isSquare,
      isPerfectCube: isCube,
    };
  }

  function digitalRoot(n) {
    if (n === 0) {
      return 0;
    }
    return 1 + ((n - 1) % 9);
  }

  function digitSum(n) {
    return n
      .toString()
      .split("")
      .reduce((acc, char) => acc + Number(char), 0);
  }

  function buildClassification({ value, abs, primeInfo, properDivisorSum }) {
    const labels = [];
    if (value === 0) {
      labels.push("Zero");
      return labels;
    }
    if (abs === 1) {
      labels.push("Unit");
      return labels;
    }
    if (primeInfo.isPrime) {
      labels.push("Prime");
    } else if (primeInfo.isComposite) {
      labels.push("Composite");
    }
    if (abs > 0 && properDivisorSum !== null) {
      if (properDivisorSum === abs) {
        labels.push("Perfect number");
      } else if (properDivisorSum < abs) {
        labels.push("Deficient");
      } else {
        labels.push("Abundant");
      }
    }
    if (primeInfo.isPerfectSquare) {
      labels.push("Perfect square");
    }
    if (primeInfo.isPerfectCube) {
      labels.push("Perfect cube");
    }
    if (isPowerOfTwo(abs)) {
      labels.push("Power of two");
    }
    if (isFibonacci(abs)) {
      labels.push("Fibonacci number");
    }
    if (isTriangular(abs)) {
      labels.push("Triangular number");
    }
    return labels;
  }

  function isPowerOfTwo(n) {
    if (n <= 0) {
      return false;
    }
    return Number.isInteger(Math.log2(n));
  }

  function isPerfectSquare(n) {
    return Number.isInteger(Math.sqrt(n));
  }

  function isFibonacci(n) {
    if (n === 0) {
      return true;
    }
    const test1 = 5 * n * n + 4;
    const test2 = 5 * n * n - 4;
    return isPerfectSquare(test1) || isPerfectSquare(test2);
  }

  function isTriangular(n) {
    if (n <= 0) {
      return false;
    }
    const value = Math.sqrt(8 * n + 1);
    return Number.isInteger(value);
  }
</script>

<section class="space-y-6">
  <div
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 space-y-6"
  >
    <form class="space-y-4" on:submit|preventDefault={analyze}>
      <label
        class="block text-sm font-semibold text-slate-700 dark:text-slate-200"
        for="integer-input"
      >
        Enter integers (comma, space, or line separated)
      </label>
      <textarea
        id="integer-input"
        class="min-h-[140px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
        bind:value={rawInput}
        placeholder="Example: 18, 24, 30, 42"
      ></textarea>
      <div class="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          class="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          Analyze integers
        </button>
        <button
          type="button"
          class="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          on:click={clearAll}
        >
          Clear input
        </button>
        <span class="text-xs text-slate-500 dark:text-slate-400">
          {numbers.length
            ? `${numbers.length} integers analyzed`
            : "Awaiting input"}
        </span>
      </div>
    </form>

    <div class="flex flex-wrap items-center gap-2">
      {#each examples as example}
        <button
          type="button"
          class="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
          on:click={() => loadExample(example.values)}
        >
          {example.label}
        </button>
      {/each}
    </div>

    {#if error}
      <p
        class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 shadow-inner dark:border-rose-900 dark:bg-rose-950 dark:text-rose-200"
      >
        {error}
      </p>
    {/if}

    {#if lastAnalyzed && !error}
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Last analyzed input preserved - edit the list and run again to refresh
        insights.
      </p>
    {/if}
  </div>

  {#if report}
    <div class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 space-y-4"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Summary statistics
        </h2>
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div
            class="flex flex-col gap-1 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/30"
          >
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300"
            >
              Count
            </p>
            <span class="text-lg font-bold text-slate-900 dark:text-slate-100"
              >{report.summary.count}</span
            >
          </div>
          <div
            class="flex flex-col gap-1 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/30"
          >
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300"
            >
              Min to Max
            </p>
            <span class="text-lg font-bold text-slate-900 dark:text-slate-100"
              >{report.summary.min} to {report.summary.max}</span
            >
          </div>
          <div
            class="flex flex-col gap-1 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/30"
          >
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300"
            >
              Sum
            </p>
            <span class="text-lg font-bold text-slate-900 dark:text-slate-100"
              >{formatNumber(report.summary.sum)}</span
            >
          </div>
          <div
            class="flex flex-col gap-1 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/30"
          >
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300"
            >
              Mean
            </p>
            <span class="text-lg font-bold text-slate-900 dark:text-slate-100"
              >{formatNumber(report.summary.mean)}</span
            >
          </div>
          <div
            class="flex flex-col gap-1 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/30"
          >
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300"
            >
              Median
            </p>
            <span class="text-lg font-bold text-slate-900 dark:text-slate-100"
              >{formatNumber(report.summary.median)}</span
            >
          </div>
          <div
            class="flex flex-col gap-1 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/30"
          >
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300"
            >
              Mode
            </p>
            <span class="text-lg font-bold text-slate-900 dark:text-slate-100">
              {report.summary.modes.length
                ? report.summary.modes.join(", ")
                : "N/A"}
            </span>
          </div>
          <div
            class="flex flex-col gap-1 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/30"
          >
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300"
            >
              GCD
            </p>
            <span class="text-lg font-bold text-slate-900 dark:text-slate-100"
              >{report.summary.gcd}</span
            >
          </div>
          <div
            class="flex flex-col gap-1 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/30"
          >
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300"
            >
              LCM
            </p>
            <span class="text-lg font-bold text-slate-900 dark:text-slate-100"
              >{report.summary.lcm}</span
            >
          </div>
          <div
            class="flex flex-col gap-1 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/30"
          >
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300"
            >
              Range
            </p>
            <span class="text-lg font-bold text-slate-900 dark:text-slate-100"
              >{formatNumber(report.summary.range)}</span
            >
          </div>
          <div
            class="flex flex-col gap-1 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/30"
          >
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300"
            >
              Variance
            </p>
            <span class="text-lg font-bold text-slate-900 dark:text-slate-100"
              >{formatNumber(report.summary.variance)}</span
            >
          </div>
          <div
            class="flex flex-col gap-1 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/30"
          >
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300"
            >
              Std deviation
            </p>
            <span class="text-lg font-bold text-slate-900 dark:text-slate-100"
              >{formatNumber(report.summary.stdDev)}</span
            >
          </div>
          <div
            class="flex flex-col gap-1 rounded-2xl border border-indigo-200/70 bg-indigo-50/80 p-4 shadow-sm dark:border-indigo-800 dark:bg-indigo-900/30"
          >
            <p
              class="text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-indigo-600 dark:text-indigo-300"
            >
              Unique prime factors
            </p>
            <span
              class="text-sm font-semibold text-slate-800 dark:text-slate-100"
            >
              {report.summary.uniquePrimeFactors.length
                ? report.summary.uniquePrimeFactors.join(", ")
                : "None detected"}
            </span>
          </div>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-2">
        <div
          class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 space-y-3"
        >
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Distribution snapshot
          </h2>
          <dl class="space-y-2 text-sm">
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-1 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-600 dark:text-slate-300">
                Positive
              </dt>
              <dd
                class="font-mono font-semibold text-indigo-700 dark:text-indigo-300"
              >
                {report.distribution.positiveCount}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-1 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-600 dark:text-slate-300">
                Negative
              </dt>
              <dd
                class="font-mono font-semibold text-indigo-700 dark:text-indigo-300"
              >
                {report.distribution.negativeCount}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-1 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-600 dark:text-slate-300">
                Zero
              </dt>
              <dd
                class="font-mono font-semibold text-indigo-700 dark:text-indigo-300"
              >
                {report.distribution.zeroCount}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-1 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-600 dark:text-slate-300">
                Even
              </dt>
              <dd
                class="font-mono font-semibold text-indigo-700 dark:text-indigo-300"
              >
                {report.distribution.evenCount}
              </dd>
            </div>
            <div
              class="flex items-center justify-between border-b border-dashed border-slate-200 pb-1 dark:border-slate-700"
            >
              <dt class="font-semibold text-slate-600 dark:text-slate-300">
                Odd
              </dt>
              <dd
                class="font-mono font-semibold text-indigo-700 dark:text-indigo-300"
              >
                {report.distribution.oddCount}
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="font-semibold text-slate-600 dark:text-slate-300">
                Prime (positive)
              </dt>
              <dd
                class="font-mono font-semibold text-indigo-700 dark:text-indigo-300"
              >
                {report.distribution.primeCount}
              </dd>
            </div>
          </dl>
        </div>

        <div
          class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 space-y-3"
        >
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Sorted list
          </h2>
          <p
            class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            {report.sorted.join(", ")}
          </p>
          {#if report.duplicates.length}
            <div class="space-y-2">
              <h3
                class="text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Repeated integers
              </h3>
              <ul class="space-y-1 text-sm text-slate-600 dark:text-slate-400">
                {#each report.duplicates as item}
                  <li>{item.value} appears {item.count} times</li>
                {/each}
              </ul>
            </div>
          {/if}
        </div>
      </div>

      <div
        class="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <h2
          class="px-6 pt-6 text-lg font-semibold text-slate-900 dark:text-slate-100"
        >
          Detailed breakdown
        </h2>
        <table
          class="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-700"
        >
          <thead class="bg-slate-100 dark:bg-slate-800">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                >Integer</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                >Properties</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                >Prime factors</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                >Divisors</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                >Digital root</th
              >
              <th
                class="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-300"
                >Sum of digits</th
              >
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 dark:divide-slate-700">
            {#each report.details as detail}
              <tr
                class="odd:bg-white even:bg-slate-50 dark:odd:bg-slate-900/60 dark:even:bg-slate-900"
              >
                <td
                  class="px-6 py-3 font-medium text-slate-900 dark:text-slate-100"
                  >{detail.value}</td
                >
                <td class="px-6 py-3 text-slate-600 dark:text-slate-300">
                  {detail.classifications.length
                    ? detail.classifications.join(", ")
                    : "N/A"}
                </td>
                <td class="px-6 py-3 text-slate-600 dark:text-slate-300"
                  >{detail.factorString}</td
                >
                <td class="px-6 py-3 text-slate-600 dark:text-slate-300"
                  >{detail.divisorCount ?? "N/A"}</td
                >
                <td class="px-6 py-3 text-slate-600 dark:text-slate-300"
                  >{detail.digitalRoot}</td
                >
                <td class="px-6 py-3 text-slate-600 dark:text-slate-300"
                  >{detail.sumOfDigits}</td
                >
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</section>
