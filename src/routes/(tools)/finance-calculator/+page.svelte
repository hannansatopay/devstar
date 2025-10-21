<script lang="ts">
	const calculators = [
		{
			id: "roi",
			title: "ROI Calculator",
			description: "Evaluate how an investment performed.",
			icon: "ROI",
		},
		{
			id: "currency",
			title: "Currency Converter",
			description: "Convert between currencies with your own rate.",
			icon: "FX",
		},
		{
			id: "salary",
			title: "Salary Calculator",
			description: "Estimate your take-home pay after deductions.",
			icon: "PAY",
		},
		{
			id: "gst",
			title: "GST Calculator",
			description: "Apply Goods and Services Tax to a price.",
			icon: "GST",
		},
		{
			id: "homeLoan",
			title: "Home Loan Calculator",
			description: "Plan monthly payments for a home loan.",
			icon: "HOME",
		},
		{
			id: "tvm",
			title: "TVM Calculator",
			description: "Project future value using time value of money.",
			icon: "TVM",
		},
		{
			id: "stock",
			title: "Stock Return Calculator",
			description: "Measure total and percentage return on a trade.",
			icon: "STK",
		},
	] as const;

	type CalculatorId = (typeof calculators)[number]["id"];

	const currencyCodes = ["USD", "EUR", "GBP", "INR", "AUD", "CAD"] as const;
	type CurrencyCode = (typeof currencyCodes)[number];

	const currencyOptions = [
		{ code: "USD", label: "USD - US Dollar" },
		{ code: "EUR", label: "EUR - Euro" },
		{ code: "GBP", label: "GBP - British Pound" },
		{ code: "INR", label: "INR - Indian Rupee" },
		{ code: "AUD", label: "AUD - Australian Dollar" },
		{ code: "CAD", label: "CAD - Canadian Dollar" },
	] as const satisfies Array<{ code: CurrencyCode; label: string }>;

	type RoiOutcome = {
		roi: number | null;
		gain: number | null;
		endingValue: number | null;
		error: string;
	};

	type CurrencyOutcome = {
		converted: number;
		error: string;
	};

	type SalaryOutcome = {
		net: number;
		deductionRate: number;
		takeHomeShare: number;
		error: string;
	};

	type GstOutcome = {
		taxAmount: number;
		priceWith: number;
		error: string;
	};

	type HomeLoanOutcome = {
		emi: number;
		totalPayment: number;
		totalInterest: number;
		totalMonths: number;
		error: string;
	};

	type TvmOutcome = {
		futureValue: number;
		growth: number;
		error: string;
	};

	type StockOutcome = {
		totalReturn: number;
		percentageReturn: number | null;
		totalValue: number;
		totalCost: number;
		error: string;
	};

	const currencyFormatters = new Map<CurrencyCode, Intl.NumberFormat>();

	function formatCurrency(value: number, code: CurrencyCode) {
		if (!currencyFormatters.has(code)) {
			currencyFormatters.set(
				code,
				new Intl.NumberFormat("en-US", {
					style: "currency",
					currency: code,
					maximumFractionDigits: 2,
				}),
			);
		}
		const formatter = currencyFormatters.get(code)!;
		if (!Number.isFinite(value)) {
			return formatter.format(0);
		}
		return formatter.format(value);
	}

	const numberFormatter = new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 2,
	});

	const percentageFormatter = new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 2,
	});

	function formatNumber(value: number) {
		if (!Number.isFinite(value)) {
			return "0";
		}
		return numberFormatter.format(value);
	}

	function formatPercentage(value: number) {
		if (!Number.isFinite(value)) {
			return "0%";
		}
		return `${percentageFormatter.format(value)}%`;
	}

	function trendClass(value: number | null) {
		if (value === null) {
			return "text-slate-900 dark:text-white";
		}
		return value >= 0
			? "text-emerald-600 dark:text-emerald-300"
			: "text-red-600 dark:text-red-300";
	}

	function toNumber(value: number | string): number {
		if (typeof value === "number") {
			return Number.isFinite(value) ? value : 0;
		}
		if (typeof value === "string" && value.trim() !== "") {
			const parsed = Number(value);
			return Number.isFinite(parsed) ? parsed : 0;
		}
		return 0;
	}

	const inputClasses =
		"w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40";

	const baseCardClasses =
		"rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60";

	const subtleCardClasses =
		"rounded-2xl border border-slate-200/70 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/40";

	let selectedCalculator: CalculatorId = calculators[0].id;

	let roiForm = {
		initialInvestment: 10_000,
		finalValue: 12_500,
		currency: "USD" as CurrencyCode,
	};
	$: roiOutcome = computeRoi(roiForm);

	let currencyForm = {
		amount: 1_000,
		exchangeRate: 0.92,
		baseCurrency: "USD" as CurrencyCode,
		targetCurrency: "EUR" as CurrencyCode,
	};
	$: currencyOutcome = computeCurrency(currencyForm);

	let salaryForm = {
		grossSalary: 75_000,
		deductions: 15_000,
		currency: "USD" as CurrencyCode,
	};
	$: salaryOutcome = computeSalary(salaryForm);

	let gstForm = {
		priceWithout: 1_000,
		gstRate: 18,
		currency: "USD" as CurrencyCode,
	};
	$: gstOutcome = computeGst(gstForm);

	let homeLoanForm = {
		principal: 350_000,
		annualRate: 6.5,
		tenureYears: 30,
		currency: "USD" as CurrencyCode,
	};
	$: homeLoanOutcome = computeHomeLoan(homeLoanForm);

	let tvmForm = {
		presentValue: 15_000,
		interestRate: 5,
		periods: 10,
		currency: "USD" as CurrencyCode,
	};
	$: tvmOutcome = computeFutureValue(tvmForm);

	let stockForm = {
		initialPrice: 100,
		finalPrice: 140,
		shares: 50,
		currency: "USD" as CurrencyCode,
	};
	$: stockOutcome = computeStockReturn(stockForm);

	function computeRoi(form: typeof roiForm): RoiOutcome {
		const initial = Math.max(toNumber(form.initialInvestment), 0);
		const ending = Math.max(toNumber(form.finalValue), 0);

		if (initial <= 0) {
			return {
				roi: null,
				gain: null,
				endingValue: null,
				error: "Initial investment must be greater than zero.",
			};
		}

		const gain = ending - initial;
		const roi = (gain / initial) * 100;

		return { roi, gain, endingValue: ending, error: "" };
	}

	function computeCurrency(form: typeof currencyForm): CurrencyOutcome {
		const amount = Math.max(toNumber(form.amount), 0);
		const rate = toNumber(form.exchangeRate);

		if (rate <= 0) {
			return {
				converted: 0,
				error: "Exchange rate must be greater than zero.",
			};
		}

		return { converted: amount * rate, error: "" };
	}

	function computeSalary(form: typeof salaryForm): SalaryOutcome {
		const gross = Math.max(toNumber(form.grossSalary), 0);
		const deductions = Math.max(toNumber(form.deductions), 0);

		if (gross <= 0) {
			return {
				net: 0,
				deductionRate: 0,
				takeHomeShare: 0,
				error: "Gross salary must be greater than zero.",
			};
		}

		if (deductions > gross) {
			return {
				net: 0,
				deductionRate: 100,
				takeHomeShare: 0,
				error: "Deductions cannot exceed gross salary.",
			};
		}

		const net = gross - deductions;
		const deductionRate = (deductions / gross) * 100;
		const takeHomeShare = (net / gross) * 100;

		return { net, deductionRate, takeHomeShare, error: "" };
	}

	function computeGst(form: typeof gstForm): GstOutcome {
		const price = Math.max(toNumber(form.priceWithout), 0);
		const rate = Math.max(toNumber(form.gstRate), 0);

		if (price <= 0) {
			return {
				taxAmount: 0,
				priceWith: 0,
				error: "Enter a price greater than zero.",
			};
		}

		const taxAmount = price * (rate / 100);
		const priceWith = price + taxAmount;

		return { taxAmount, priceWith, error: "" };
	}

	function computeHomeLoan(form: typeof homeLoanForm): HomeLoanOutcome {
		const principal = Math.max(toNumber(form.principal), 0);
		const annualRate = Math.max(toNumber(form.annualRate), 0);
		const tenureYears = Math.max(toNumber(form.tenureYears), 0);

		if (principal <= 0) {
			return {
				emi: 0,
				totalPayment: 0,
				totalInterest: 0,
				totalMonths: 0,
				error: "Loan amount must be greater than zero.",
			};
		}

		const totalMonths = Math.round(tenureYears * 12);

		if (totalMonths <= 0) {
			return {
				emi: 0,
				totalPayment: 0,
				totalInterest: 0,
				totalMonths: 0,
				error: "Provide a loan tenure greater than zero.",
			};
		}

		if (annualRate === 0) {
			const emi = principal / totalMonths;
			return {
				emi,
				totalPayment: principal,
				totalInterest: 0,
				totalMonths,
				error: "",
			};
		}

		const monthlyRate = annualRate / 12 / 100;
		const factor = Math.pow(1 + monthlyRate, totalMonths);

		if (!Number.isFinite(factor) || factor <= 1) {
			return {
				emi: 0,
				totalPayment: 0,
				totalInterest: 0,
				totalMonths,
				error: "Unable to compute EMI with the provided values.",
			};
		}

		const emi = (principal * monthlyRate * factor) / (factor - 1);
		const totalPayment = emi * totalMonths;
		const totalInterest = totalPayment - principal;

		return { emi, totalPayment, totalInterest, totalMonths, error: "" };
	}

	function computeFutureValue(form: typeof tvmForm): TvmOutcome {
		const presentValue = Math.max(toNumber(form.presentValue), 0);
		const interestRate = toNumber(form.interestRate);
		const periods = Math.max(toNumber(form.periods), 0);

		if (presentValue <= 0) {
			return {
				futureValue: 0,
				growth: 0,
				error: "Present value must be greater than zero.",
			};
		}

		if (periods < 0) {
			return {
				futureValue: 0,
				growth: 0,
				error: "Number of periods cannot be negative.",
			};
		}

		const ratePerPeriod = interestRate / 100;
		const growthFactor = Math.pow(1 + ratePerPeriod, periods);

		if (!Number.isFinite(growthFactor)) {
			return {
				futureValue: 0,
				growth: 0,
				error: "Unable to calculate future value with the provided inputs.",
			};
		}

		const futureValue = presentValue * growthFactor;
		const growth = futureValue - presentValue;

		return { futureValue, growth, error: "" };
	}

	function computeStockReturn(form: typeof stockForm): StockOutcome {
		const initialPrice = Math.max(toNumber(form.initialPrice), 0);
		const finalPrice = Math.max(toNumber(form.finalPrice), 0);
		const shares = Math.max(toNumber(form.shares), 0);

		if (initialPrice <= 0) {
			return {
				totalReturn: 0,
				percentageReturn: null,
				totalValue: 0,
				totalCost: 0,
				error: "Initial share price must be greater than zero.",
			};
		}

		if (shares <= 0) {
			return {
				totalReturn: 0,
				percentageReturn: null,
				totalValue: 0,
				totalCost: 0,
				error: "Number of shares must be greater than zero.",
			};
		}

		const totalCost = initialPrice * shares;
		const totalValue = finalPrice * shares;
		const totalReturn = totalValue - totalCost;
		const percentageReturn =
			((finalPrice - initialPrice) / initialPrice) * 100;

		return {
			totalReturn,
			percentageReturn,
			totalValue,
			totalCost,
			error: "",
		};
	}
</script>

<section class="mx-auto space-y-6 px-4 py-6">
	<div class="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
		<aside
			class="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60"
		>
			<h2 class="text-lg font-semibold text-slate-900 dark:text-white">
				Choose a calculator
			</h2>
			<p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
				Pick a focus area to open its calculator and results panel.
			</p>

			<div class="mt-6 grid gap-3">
				{#each calculators as item}
					<button
						type="button"
						class={`flex w-full items-start gap-3 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-left text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/80 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:hover:border-indigo-500/50 dark:hover:bg-indigo-900/20 ${selectedCalculator === item.id ? "border-indigo-400 bg-indigo-50/90 text-indigo-700 dark:border-indigo-400/80 dark:text-indigo-200" : ""}`}
						on:click={() => (selectedCalculator = item.id)}
					>
						<span class="text-xl leading-none">{item.icon}</span>
						<span>
							<span class="block text-sm font-semibold"
								>{item.title}</span
							>
							<span
								class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
							>
								{item.description}
							</span>
						</span>
					</button>
				{/each}
			</div>
		</aside>

		<div class="space-y-8">
			{#if selectedCalculator === "roi"}
				<div class={baseCardClasses}>
					<div
						class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
					>
						<div>
							<h2
								class="text-2xl font-semibold text-slate-900 dark:text-white"
							>
								Return on Investment
							</h2>
							<p
								class="mt-1 text-sm text-slate-600 dark:text-slate-300"
							>
								Compare your starting amount to the ending value
								to see gain/loss and percentage ROI.
							</p>
						</div>
					</div>

					<form
						class="mt-6 grid gap-6 sm:grid-cols-2"
						on:submit|preventDefault
					>
						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Initial investment
							</span>
							<input
								type="number"
								min="0"
								step="0.01"
								class={inputClasses}
								bind:value={roiForm.initialInvestment}
								placeholder="e.g. 10000"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Ending value
							</span>
							<input
								type="number"
								min="0"
								step="0.01"
								class={inputClasses}
								bind:value={roiForm.finalValue}
								placeholder="e.g. 12500"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Currency
							</span>
							<select
								class={inputClasses}
								bind:value={roiForm.currency}
							>
								{#each currencyOptions as option}
									<option value={option.code}
										>{option.label}</option
									>
								{/each}
							</select>
						</label>
					</form>

					{#if roiOutcome.error}
						<p
							class="mt-6 rounded-2xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200"
						>
							{roiOutcome.error}
						</p>
					{:else}
						<div class="mt-6 grid gap-4 sm:grid-cols-3">
							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									Net gain / loss
								</p>
								<p
									class={`mt-2 text-2xl font-semibold ${trendClass(roiOutcome.gain)}`}
								>
									{formatCurrency(
										roiOutcome.gain ?? 0,
										roiForm.currency,
									)}
								</p>
							</div>

							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									ROI
								</p>
								<p
									class={`mt-2 text-2xl font-semibold ${trendClass(roiOutcome.roi)}`}
								>
									{formatPercentage(roiOutcome.roi ?? 0)}
								</p>
							</div>

							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									Ending value
								</p>
								<p
									class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white"
								>
									{formatCurrency(
										roiOutcome.endingValue ?? 0,
										roiForm.currency,
									)}
								</p>
							</div>
						</div>

						<p
							class="mt-4 text-xs text-slate-500 dark:text-slate-400"
						>
							ROI assumes no additional contributions or
							withdrawals beyond the initial investment.
						</p>
					{/if}
				</div>
			{/if}

			{#if selectedCalculator === "currency"}
				<div class={baseCardClasses}>
					<div
						class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
					>
						<div>
							<h2
								class="text-2xl font-semibold text-slate-900 dark:text-white"
							>
								Currency Converter
							</h2>
							<p
								class="mt-1 text-sm text-slate-600 dark:text-slate-300"
							>
								Set your own exchange rate to convert a base
								currency into a target currency.
							</p>
						</div>
					</div>

					<form
						class="mt-6 grid gap-6 sm:grid-cols-2"
						on:submit|preventDefault
					>
						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Amount
							</span>
							<input
								type="number"
								min="0"
								step="0.01"
								class={inputClasses}
								bind:value={currencyForm.amount}
								placeholder="e.g. 1000"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Exchange rate
							</span>
							<input
								type="number"
								min="0"
								step="0.0001"
								class={inputClasses}
								bind:value={currencyForm.exchangeRate}
								placeholder="e.g. 0.92"
							/>
							<span
								class="block text-xs text-slate-500 dark:text-slate-400"
							>
								Rate represents 1 {currencyForm.baseCurrency} = X
								{currencyForm.targetCurrency}.
							</span>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Base currency
							</span>
							<select
								class={inputClasses}
								bind:value={currencyForm.baseCurrency}
							>
								{#each currencyOptions as option}
									<option value={option.code}
										>{option.label}</option
									>
								{/each}
							</select>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Target currency
							</span>
							<select
								class={inputClasses}
								bind:value={currencyForm.targetCurrency}
							>
								{#each currencyOptions as option}
									<option value={option.code}
										>{option.label}</option
									>
								{/each}
							</select>
						</label>
					</form>

					{#if currencyOutcome.error}
						<p
							class="mt-6 rounded-2xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200"
						>
							{currencyOutcome.error}
						</p>
					{:else}
						<div class={`${subtleCardClasses} mt-6`}>
							<p
								class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
							>
								Converted amount
							</p>
							<p
								class="mt-2 text-3xl font-semibold text-slate-900 dark:text-white"
							>
								{formatCurrency(
									currencyOutcome.converted,
									currencyForm.targetCurrency,
								)}
							</p>
						</div>

						<p
							class="mt-4 text-xs text-slate-500 dark:text-slate-400"
						>
							Use a live exchange rate source for precise
							conversions. Fees and spreads from your bank or
							broker are not included here.
						</p>
					{/if}
				</div>
			{/if}

			{#if selectedCalculator === "salary"}
				<div class={baseCardClasses}>
					<div
						class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
					>
						<div>
							<h2
								class="text-2xl font-semibold text-slate-900 dark:text-white"
							>
								Salary Calculator
							</h2>
							<p
								class="mt-1 text-sm text-slate-600 dark:text-slate-300"
							>
								Estimate take-home pay after deductions like
								taxes, insurance, and retirement contributions.
							</p>
						</div>
					</div>

					<form
						class="mt-6 grid gap-6 sm:grid-cols-2"
						on:submit|preventDefault
					>
						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Gross salary
							</span>
							<input
								type="number"
								min="0"
								step="0.01"
								class={inputClasses}
								bind:value={salaryForm.grossSalary}
								placeholder="Annual, monthly, or per pay period"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Total deductions
							</span>
							<input
								type="number"
								min="0"
								step="0.01"
								class={inputClasses}
								bind:value={salaryForm.deductions}
								placeholder="Taxes, insurance, retirements"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Currency
							</span>
							<select
								class={inputClasses}
								bind:value={salaryForm.currency}
							>
								{#each currencyOptions as option}
									<option value={option.code}
										>{option.label}</option
									>
								{/each}
							</select>
						</label>
					</form>

					{#if salaryOutcome.error}
						<p
							class="mt-6 rounded-2xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200"
						>
							{salaryOutcome.error}
						</p>
					{:else}
						<div class="mt-6 grid gap-4 sm:grid-cols-3">
							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									Take-home pay
								</p>
								<p
									class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white"
								>
									{formatCurrency(
										salaryOutcome.net,
										salaryForm.currency,
									)}
								</p>
							</div>
							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									Deduction rate
								</p>
								<p
									class={`mt-2 text-2xl font-semibold ${trendClass(-salaryOutcome.deductionRate)}`}
								>
									{formatPercentage(
										salaryOutcome.deductionRate,
									)}
								</p>
							</div>
							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									Take-home ratio
								</p>
								<p
									class={`mt-2 text-2xl font-semibold ${trendClass(salaryOutcome.takeHomeShare)}`}
								>
									{formatPercentage(
										salaryOutcome.takeHomeShare,
									)}
								</p>
							</div>
						</div>

						<p
							class="mt-4 text-xs text-slate-500 dark:text-slate-400"
						>
							Adjust the numbers for your pay cadence. For
							additional insights separate mandatory and voluntary
							deductions.
						</p>
					{/if}
				</div>
			{/if}

			{#if selectedCalculator === "gst"}
				<div class={baseCardClasses}>
					<div
						class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
					>
						<div>
							<h2
								class="text-2xl font-semibold text-slate-900 dark:text-white"
							>
								GST Calculator
							</h2>
							<p
								class="mt-1 text-sm text-slate-600 dark:text-slate-300"
							>
								Compute the tax amount and the price inclusive
								of Goods and Services Tax.
							</p>
						</div>
					</div>

					<form
						class="mt-6 grid gap-6 sm:grid-cols-2"
						on:submit|preventDefault
					>
						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Price before GST
							</span>
							<input
								type="number"
								min="0"
								step="0.01"
								class={inputClasses}
								bind:value={gstForm.priceWithout}
								placeholder="e.g. 1000"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								GST rate (%)
							</span>
							<input
								type="number"
								min="0"
								step="0.01"
								class={inputClasses}
								bind:value={gstForm.gstRate}
								placeholder="e.g. 18"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Currency
							</span>
							<select
								class={inputClasses}
								bind:value={gstForm.currency}
							>
								{#each currencyOptions as option}
									<option value={option.code}
										>{option.label}</option
									>
								{/each}
							</select>
						</label>
					</form>

					{#if gstOutcome.error}
						<p
							class="mt-6 rounded-2xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200"
						>
							{gstOutcome.error}
						</p>
					{:else}
						<div class="mt-6 grid gap-4 sm:grid-cols-2">
							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									GST amount
								</p>
								<p
									class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white"
								>
									{formatCurrency(
										gstOutcome.taxAmount,
										gstForm.currency,
									)}
								</p>
							</div>
							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									Price with GST
								</p>
								<p
									class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white"
								>
									{formatCurrency(
										gstOutcome.priceWith,
										gstForm.currency,
									)}
								</p>
							</div>
						</div>

						<p
							class="mt-4 text-xs text-slate-500 dark:text-slate-400"
						>
							GST rates can vary based on the type of goods or
							services. Confirm the correct rate with your local
							regulations.
						</p>
					{/if}
				</div>
			{/if}

			{#if selectedCalculator === "homeLoan"}
				<div class={baseCardClasses}>
					<div
						class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
					>
						<div>
							<h2
								class="text-2xl font-semibold text-slate-900 dark:text-white"
							>
								Home Loan Calculator
							</h2>
							<p
								class="mt-1 text-sm text-slate-600 dark:text-slate-300"
							>
								Estimate your monthly EMI, total payment, and
								total interest for a fixed-rate loan.
							</p>
						</div>
					</div>

					<form
						class="mt-6 grid gap-6 sm:grid-cols-2"
						on:submit|preventDefault
					>
						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Loan amount
							</span>
							<input
								type="number"
								min="0"
								step="0.01"
								class={inputClasses}
								bind:value={homeLoanForm.principal}
								placeholder="e.g. 350000"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Annual interest rate (%)
							</span>
							<input
								type="number"
								min="0"
								step="0.01"
								class={inputClasses}
								bind:value={homeLoanForm.annualRate}
								placeholder="e.g. 6.5"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Tenure (years)
							</span>
							<input
								type="number"
								min="0"
								step="0.1"
								class={inputClasses}
								bind:value={homeLoanForm.tenureYears}
								placeholder="e.g. 30"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Currency
							</span>
							<select
								class={inputClasses}
								bind:value={homeLoanForm.currency}
							>
								{#each currencyOptions as option}
									<option value={option.code}
										>{option.label}</option
									>
								{/each}
							</select>
						</label>
					</form>

					{#if homeLoanOutcome.error}
						<p
							class="mt-6 rounded-2xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200"
						>
							{homeLoanOutcome.error}
						</p>
					{:else}
						<div class="mt-6 grid gap-4 sm:grid-cols-3">
							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									Monthly EMI
								</p>
								<p
									class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white"
								>
									{formatCurrency(
										homeLoanOutcome.emi,
										homeLoanForm.currency,
									)}
								</p>
							</div>
							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									Total interest
								</p>
								<p
									class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white"
								>
									{formatCurrency(
										homeLoanOutcome.totalInterest,
										homeLoanForm.currency,
									)}
								</p>
							</div>
							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									Total paid
								</p>
								<p
									class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white"
								>
									{formatCurrency(
										homeLoanOutcome.totalPayment,
										homeLoanForm.currency,
									)}
								</p>
							</div>
						</div>

						<p
							class="mt-4 text-xs text-slate-500 dark:text-slate-400"
						>
							Calculation assumes a fixed interest rate with equal
							monthly payments over
							{formatNumber(homeLoanOutcome.totalMonths)} months.
						</p>
					{/if}
				</div>
			{/if}

			{#if selectedCalculator === "tvm"}
				<div class={baseCardClasses}>
					<div
						class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
					>
						<div>
							<h2
								class="text-2xl font-semibold text-slate-900 dark:text-white"
							>
								Time Value of Money (Future Value)
							</h2>
							<p
								class="mt-1 text-sm text-slate-600 dark:text-slate-300"
							>
								Estimate how much a present value grows with
								compound interest over multiple periods.
							</p>
						</div>
					</div>

					<form
						class="mt-6 grid gap-6 sm:grid-cols-2"
						on:submit|preventDefault
					>
						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Present value
							</span>
							<input
								type="number"
								min="0"
								step="0.01"
								class={inputClasses}
								bind:value={tvmForm.presentValue}
								placeholder="e.g. 15000"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Interest rate per period (%)
							</span>
							<input
								type="number"
								step="0.01"
								class={inputClasses}
								bind:value={tvmForm.interestRate}
								placeholder="e.g. 5"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Number of periods
							</span>
							<input
								type="number"
								min="0"
								step="1"
								class={inputClasses}
								bind:value={tvmForm.periods}
								placeholder="e.g. 10"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Currency
							</span>
							<select
								class={inputClasses}
								bind:value={tvmForm.currency}
							>
								{#each currencyOptions as option}
									<option value={option.code}
										>{option.label}</option
									>
								{/each}
							</select>
						</label>
					</form>

					{#if tvmOutcome.error}
						<p
							class="mt-6 rounded-2xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200"
						>
							{tvmOutcome.error}
						</p>
					{:else}
						<div class="mt-6 grid gap-4 sm:grid-cols-2">
							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									Future value
								</p>
								<p
									class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white"
								>
									{formatCurrency(
										tvmOutcome.futureValue,
										tvmForm.currency,
									)}
								</p>
							</div>

							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									Total growth
								</p>
								<p
									class={`mt-2 text-2xl font-semibold ${trendClass(tvmOutcome.growth)}`}
								>
									{formatCurrency(
										tvmOutcome.growth,
										tvmForm.currency,
									)}
								</p>
							</div>
						</div>

						<p
							class="mt-4 text-xs text-slate-500 dark:text-slate-400"
						>
							This calculation assumes growth compounded once per
							period. For monthly or quarterly compounding adjust
							the interest rate and periods accordingly.
						</p>
					{/if}
				</div>
			{/if}

			{#if selectedCalculator === "stock"}
				<div class={baseCardClasses}>
					<div
						class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
					>
						<div>
							<h2
								class="text-2xl font-semibold text-slate-900 dark:text-white"
							>
								Stock Return Calculator
							</h2>
							<p
								class="mt-1 text-sm text-slate-600 dark:text-slate-300"
							>
								Calculate the gain/loss, return percentage, and
								ending value for a stock position.
							</p>
						</div>
					</div>

					<form
						class="mt-6 grid gap-6 sm:grid-cols-2"
						on:submit|preventDefault
					>
						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Initial price per share
							</span>
							<input
								type="number"
								min="0"
								step="0.01"
								class={inputClasses}
								bind:value={stockForm.initialPrice}
								placeholder="e.g. 100"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Final price per share
							</span>
							<input
								type="number"
								min="0"
								step="0.01"
								class={inputClasses}
								bind:value={stockForm.finalPrice}
								placeholder="e.g. 140"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Number of shares
							</span>
							<input
								type="number"
								min="0"
								step="1"
								class={inputClasses}
								bind:value={stockForm.shares}
								placeholder="e.g. 50"
							/>
						</label>

						<label class="space-y-2">
							<span
								class="text-sm font-medium text-slate-600 dark:text-slate-300"
							>
								Currency
							</span>
							<select
								class={inputClasses}
								bind:value={stockForm.currency}
							>
								{#each currencyOptions as option}
									<option value={option.code}
										>{option.label}</option
									>
								{/each}
							</select>
						</label>
					</form>

					{#if stockOutcome.error}
						<p
							class="mt-6 rounded-2xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200"
						>
							{stockOutcome.error}
						</p>
					{:else}
						<div class="mt-6 grid gap-4 sm:grid-cols-3">
							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									Total return
								</p>
								<p
									class={`mt-2 text-2xl font-semibold ${trendClass(stockOutcome.totalReturn)}`}
								>
									{formatCurrency(
										stockOutcome.totalReturn,
										stockForm.currency,
									)}
								</p>
							</div>
							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									Return %
								</p>
								<p
									class={`mt-2 text-2xl font-semibold ${trendClass(stockOutcome.percentageReturn)}`}
								>
									{formatPercentage(
										stockOutcome.percentageReturn ?? 0,
									)}
								</p>
							</div>
							<div class={subtleCardClasses}>
								<p
									class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
								>
									Ending value
								</p>
								<p
									class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white"
								>
									{formatCurrency(
										stockOutcome.totalValue,
										stockForm.currency,
									)}
								</p>
							</div>
						</div>

						<p
							class="mt-4 text-xs text-slate-500 dark:text-slate-400"
						>
							Dividends, trading fees, and taxes are not included.
							Add them to your initial or final values for more
							precise results.
						</p>
					{/if}
				</div>
			{/if}
		</div>
	</div>
</section>
