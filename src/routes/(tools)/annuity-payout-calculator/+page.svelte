<script lang="ts">
	const frequencyConfig = {
		monthly: { label: "Monthly", periodsPerYear: 12 },
		quarterly: { label: "Quarterly", periodsPerYear: 4 },
		"semi-annually": { label: "Semi-Annually", periodsPerYear: 2 },
		annually: { label: "Annually", periodsPerYear: 1 },
	} as const;

	type FrequencyKey = keyof typeof frequencyConfig;

	const frequencyOptions: Array<{ value: FrequencyKey; label: string }> =
		Object.entries(frequencyConfig).map(([value, option]) => ({
			value: value as FrequencyKey,
			label: option.label,
		}));

	const currencyFormatter = new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

	const countFormatter = new Intl.NumberFormat("en-US", {
		maximumFractionDigits: 1,
	});

	let principalAmount = 500_000;
	let rate = 6;
	let years = 10;
	let frequency: FrequencyKey = "monthly";

	$: sanitizedPrincipal = Number(principalAmount) || 0;
	$: sanitizedRate = Number(rate) || 0;
	$: sanitizedYears = Number(years) || 0;
	$: activeFrequency = frequencyConfig[frequency] ?? frequencyConfig.monthly;
	$: paymentsPerYear = activeFrequency.periodsPerYear;
	$: totalPayments =
		sanitizedYears > 0 && paymentsPerYear > 0
			? sanitizedYears * paymentsPerYear
			: 0;

	$: calculationError = (() => {
		if (sanitizedPrincipal <= 0) {
			return "Principal amount must be greater than zero.";
		}
		if (sanitizedYears <= 0) {
			return "Years to payout must be greater than zero.";
		}
		if (sanitizedRate < 0) {
			return "Interest rate cannot be negative.";
		}
		if (!paymentsPerYear) {
			return "Select a valid withdrawal frequency.";
		}
		return "";
	})();

	$: periodicWithdrawal = (() => {
		if (calculationError || !totalPayments) {
			return 0;
		}

		if (sanitizedRate === 0) {
			return sanitizedPrincipal / totalPayments;
		}

		const periodicRate = sanitizedRate / 100 / paymentsPerYear;
		const discountFactor = 1 - Math.pow(1 + periodicRate, -totalPayments);

		if (!isFinite(discountFactor) || discountFactor <= 0) {
			return 0;
		}

		return (sanitizedPrincipal * periodicRate) / discountFactor;
	})();

	$: totalAmountReceived = calculationError
		? 0
		: periodicWithdrawal * totalPayments;
	$: totalInterestEarned = calculationError
		? 0
		: totalAmountReceived - sanitizedPrincipal;

	function formatAmount(value: number) {
		if (!isFinite(value) || value < 0.005) {
			return currencyFormatter.format(0);
		}

		return currencyFormatter.format(value);
	}

	function formatCount(value: number) {
		if (!isFinite(value) || value <= 0) {
			return "0";
		}

		return countFormatter.format(value);
	}
</script>

<section class="space-y-6">
	<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
		<form
			class="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur-sm transition dark:border-slate-800 dark:bg-slate-900/60"
			on:submit|preventDefault
		>
			<div class="grid gap-6">
				<label class="space-y-2">
					<span
						class="text-sm font-medium text-slate-600 dark:text-slate-300"
					>
						Starting principal
					</span>
					<input
						type="number"
						min="0"
						step="100"
						bind:value={principalAmount}
						class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
						placeholder="Enter the amount invested"
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
						step="0.1"
						bind:value={rate}
						class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
						placeholder="e.g. 6"
					/>
				</label>

				<label class="space-y-2">
					<span
						class="text-sm font-medium text-slate-600 dark:text-slate-300"
					>
						Years to payout
					</span>
					<input
						type="number"
						min="0"
						step="1"
						bind:value={years}
						class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
						placeholder="e.g. 10"
					/>
				</label>

				<label class="space-y-2">
					<span
						class="text-sm font-medium text-slate-600 dark:text-slate-300"
					>
						Withdrawal frequency
					</span>
					<select
						bind:value={frequency}
						class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
					>
						{#each frequencyOptions as option}
							<option value={option.value}>{option.label}</option>
						{/each}
					</select>
				</label>
			</div>
		</form>

		<div class="space-y-6">
			{#if calculationError}
				<p
					class="rounded-2xl border border-red-200/70 bg-red-50/90 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200"
				>
					{calculationError}
				</p>
			{/if}

			<div
				class="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60"
			>
				<h2
					class="text-2xl font-semibold text-slate-900 dark:text-white"
				>
					Results
				</h2>

				<div class="mt-6 grid gap-6">
					<div
						class="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-5 shadow-inner dark:border-emerald-500/30 dark:bg-emerald-900/20"
					>
						<p
							class="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300"
						>
							Periodic withdrawal
						</p>
						<p
							class="mt-2 text-3xl font-semibold text-emerald-700 dark:text-emerald-200"
						>
							{formatAmount(periodicWithdrawal)}
							<span
								class="text-base font-medium text-emerald-600/80 dark:text-emerald-200/80"
							>
								per {activeFrequency.label.toLowerCase()}
							</span>
						</p>
					</div>

					<div class="grid gap-5 sm:grid-cols-2">
						<div
							class="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/40"
						>
							<p
								class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
							>
								Total payments
							</p>
							<p
								class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white"
							>
								{formatCount(totalPayments)}
							</p>
						</div>
						<div
							class="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/40"
						>
							<p
								class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
							>
								Total received
							</p>
							<p
								class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white"
							>
								{formatAmount(totalAmountReceived)}
							</p>
						</div>
					</div>

					<div
						class="rounded-2xl border border-indigo-200/70 bg-indigo-50/70 p-5 dark:border-indigo-500/40 dark:bg-indigo-900/30"
					>
						<p
							class="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300"
						>
							Total interest earned
						</p>
						<p
							class="mt-2 text-2xl font-semibold text-indigo-700 dark:text-indigo-200"
						>
							{formatAmount(totalInterestEarned)}
						</p>
					</div>
				</div>
			</div>

			<div
				class="rounded-3xl border border-slate-200 bg-white/70 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300"
			>
				This calculator assumes fixed-rate annuities with withdrawals
				taken at the end of each period. For annuities with fees, taxes,
				or inflation adjustments you may need to adjust the numbers
				accordingly. Always consult with a financial professional before
				making investment decisions.
			</div>
		</div>
	</div>
</section>
