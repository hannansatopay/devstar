<script lang="ts">
	type Gender = "female" | "male" | "non-binary";

	type ActivityLevel =
		| "sedentary"
		| "light"
		| "moderate"
		| "active"
		| "very-active";

	const activityOptions: Array<{
		value: ActivityLevel;
		label: string;
		multiplier: number;
		description: string;
	}> = [
		{
			value: "sedentary",
			label: "Sedentary",
			multiplier: 1.2,
			description: "Little to no exercise, desk job.",
		},
		{
			value: "light",
			label: "Lightly active",
			multiplier: 1.375,
			description: "Exercise 1-3 days per week.",
		},
		{
			value: "moderate",
			label: "Moderately active",
			multiplier: 1.55,
			description: "Exercise 3-5 days per week.",
		},
		{
			value: "active",
			label: "Active",
			multiplier: 1.725,
			description: "Daily exercise or intense sessions 3-4 days.",
		},
		{
			value: "very-active",
			label: "Very active",
			multiplier: 1.9,
			description: "Physical job or intense training twice per day.",
		},
	];

	let age = 30;
	let gender: Gender = "male";
	let height = 175;
	let weight = 68;
	let goal = "Maintain current weight";
	let activity: ActivityLevel = "moderate";

	let error = "";

	$: parsedAge = Number.isFinite(Number(age)) ? Number(age) : NaN;
	$: parsedHeight = Number.isFinite(Number(height)) ? Number(height) : NaN;
	$: parsedWeight = Number.isFinite(Number(weight)) ? Number(weight) : NaN;

	$: validator();

	function validator() {
		if (parsedAge <= 0 || parsedAge > 120 || Number.isNaN(parsedAge)) {
			error = "Please provide a realistic age in years.";
			return;
		}
		if (
			parsedHeight <= 0 ||
			parsedHeight > 250 ||
			Number.isNaN(parsedHeight)
		) {
			error = "Please provide your height in centimeters.";
			return;
		}
		if (
			parsedWeight <= 0 ||
			parsedWeight > 350 ||
			Number.isNaN(parsedWeight)
		) {
			error = "Please provide your weight in kilograms.";
			return;
		}
		error = "";
	}

	function bmiValue(weightKg: number, heightCm: number) {
		if (!weightKg || !heightCm) return NaN;
		const h = heightCm / 100;
		return weightKg / (h * h);
	}

	function bmiCategory(bmi: number) {
		if (!Number.isFinite(bmi)) return "";
		if (bmi < 18.5) return "Underweight";
		if (bmi < 25) return "Healthy range";
		if (bmi < 30) return "Overweight";
		return "Obese";
	}

	function mifflinStJeor(
		weightKg: number,
		heightCm: number,
		ageYears: number,
		sex: Gender,
	) {
		const base = 10 * weightKg + 6.25 * heightCm - 5 * ageYears;
		if (sex === "male") return base + 5;
		if (sex === "female") return base - 161;
		return base - 78;
	}

	function activityMultiplier(option: ActivityLevel) {
		const match = activityOptions.find((item) => item.value === option);
		return match ? match.multiplier : 1.2;
	}

	function proteinTarget(weightKg: number, intensity: ActivityLevel) {
		const multipliers = {
			sedentary: 0.8,
			light: 1,
			moderate: 1.2,
			active: 1.4,
			"very-active": 1.6,
		} as const;
		const gramsPerKg = multipliers[intensity] ?? 1;
		return weightKg * gramsPerKg;
	}

	function hydrationTarget(weightKg: number, intensity: ActivityLevel) {
		const baseMl = weightKg * 35;
		const extra =
			intensity === "sedentary"
				? 0
				: intensity === "light"
					? 250
					: intensity === "moderate"
						? 500
						: intensity === "active"
							? 750
							: 1000;
		return baseMl + extra;
	}

	function calorieAdjustment(goalText: string) {
		if (/lose/i.test(goalText)) return -500;
		if (/gain/i.test(goalText)) return 300;
		return 0;
	}

	$: bmi = bmiValue(parsedWeight, parsedHeight);
	$: bmiLabel = bmiCategory(bmi);
	$: bmr = mifflinStJeor(parsedWeight, parsedHeight, parsedAge, gender);
	$: tdee = bmr * activityMultiplier(activity);
	$: adjustedCalories = tdee + calorieAdjustment(goal);
	$: proteinGrams = proteinTarget(parsedWeight, activity);
	$: hydrationMl = hydrationTarget(parsedWeight, activity);
</script>

<section class="space-y-6">
	<div class="flex flex-col gap-8 lg:flex-row">
		<form
			class="w-full rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur sm:p-10 dark:border-slate-700 dark:bg-slate-900/60"
		>
			<div class="grid gap-6 sm:grid-cols-2">
				<label class="space-y-2">
					<span
						class="text-sm font-medium text-slate-500 dark:text-slate-300"
						>Age (years)</span
					>
					<input
						type="number"
						step="1"
						bind:value={age}
						class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
					/>
				</label>

				<label class="space-y-2">
					<span
						class="text-sm font-medium text-slate-500 dark:text-slate-300"
						>Gender</span
					>
					<select
						bind:value={gender}
						class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
					>
						<option value="male">Male</option>
						<option value="female">Female</option>
						<option value="non-binary">Non-binary</option>
					</select>
				</label>

				<label class="space-y-2">
					<span
						class="text-sm font-medium text-slate-500 dark:text-slate-300"
						>Height (cm)</span
					>
					<input
						type="number"
						step="0.1"
						bind:value={height}
						class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
					/>
				</label>

				<label class="space-y-2">
					<span
						class="text-sm font-medium text-slate-500 dark:text-slate-300"
						>Weight (kg)</span
					>
					<input
						type="number"
						step="0.1"
						bind:value={weight}
						class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
					/>
				</label>
			</div>

			<label class="mt-6 block space-y-2">
				<span
					class="text-sm font-medium text-slate-500 dark:text-slate-300"
					>Daily activity</span
				>
				<select
					bind:value={activity}
					class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
				>
					{#each activityOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
				<p class="text-xs text-slate-500 dark:text-slate-400">
					{activityOptions.find((item) => item.value === activity)
						?.description}
				</p>
			</label>

			<label class="mt-6 block space-y-2">
				<span
					class="text-sm font-medium text-slate-500 dark:text-slate-300"
					>Goal</span
				>
				<input
					type="text"
					bind:value={goal}
					placeholder="Maintain current weight / Lose 5kg / Gain muscle"
					class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
				/>
			</label>

			{#if error}
				<p
					class="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200"
				>
					{error}
				</p>
			{/if}
		</form>

		<div class="w-full space-y-6">
			<div
				class="rounded-3xl border border-slate-200 bg-white/90 p-8 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
			>
				<div class="grid gap-4 sm:grid-cols-2">
					<div
						class="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/40"
					>
						<p
							class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
						>
							BMI
						</p>
						<p
							class="mt-2 text-3xl font-semibold text-slate-900 dark:text-white"
						>
							{Number.isFinite(bmi) ? bmi.toFixed(1) : "--"}
						</p>
						<p class="text-sm text-slate-500 dark:text-slate-400">
							{bmiLabel || "Fill in your height and weight."}
						</p>
					</div>

					<div
						class="rounded-2xl border border-slate-200/60 bg-slate-50/80 p-5 dark:border-slate-700 dark:bg-slate-800/40"
					>
						<p
							class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
						>
							Basal metabolic rate
						</p>
						<p
							class="mt-2 text-3xl font-semibold text-slate-900 dark:text-white"
						>
							{Number.isFinite(bmr) ? Math.round(bmr) : "--"} kcal
						</p>
						<p class="text-sm text-slate-500 dark:text-slate-400">
							Calories your body needs at complete rest.
						</p>
					</div>

					<div
						class="rounded-2xl border border-emerald-200/60 bg-emerald-50/70 p-5 dark:border-emerald-500/40 dark:bg-emerald-900/20"
					>
						<p
							class="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-200"
						>
							Daily energy target
						</p>
						<p
							class="mt-2 text-3xl font-semibold text-emerald-700 dark:text-emerald-200"
						>
							{Number.isFinite(adjustedCalories)
								? Math.round(adjustedCalories)
								: "--"} kcal
						</p>
						<p
							class="text-sm text-emerald-700/80 dark:text-emerald-200/80"
						>
							Based on your activity and goal statement.
						</p>
					</div>

					<div
						class="rounded-2xl border border-indigo-200/60 bg-indigo-50/70 p-5 dark:border-indigo-500/40 dark:bg-indigo-900/20"
					>
						<p
							class="text-xs font-semibold uppercase tracking-wide text-indigo-700 dark:text-indigo-200"
						>
							Protein intake guide
						</p>
						<p
							class="mt-2 text-3xl font-semibold text-indigo-700 dark:text-indigo-200"
						>
							{Number.isFinite(proteinGrams)
								? Math.round(proteinGrams)
								: "--"} g/day
						</p>
						<p
							class="text-sm text-indigo-700/80 dark:text-indigo-200/80"
						>
							Adjust up if focusing on strength or hypertrophy.
						</p>
					</div>

					<div
						class="rounded-2xl border border-sky-200/60 bg-sky-50/70 p-5 dark:border-sky-500/40 dark:bg-sky-900/20"
					>
						<p
							class="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-200"
						>
							Hydration target
						</p>
						<p
							class="mt-2 text-3xl font-semibold text-sky-700 dark:text-sky-200"
						>
							{Number.isFinite(hydrationMl)
								? Math.round(hydrationMl / 100) / 10
								: "--"} L/day
						</p>
						<p class="text-sm text-sky-700/80 dark:text-sky-200/80">
							Increase on very hot days or extended workouts.
						</p>
					</div>
				</div>
			</div>

			<div
				class="rounded-3xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
			>
				This calculator uses the Mifflin-St Jeor equation to estimate
				your basal metabolic rate and scales it with your activity
				level. Discuss any nutrition or training plan with your
				healthcare provider, especially if you have existing medical
				conditions.
			</div>
		</div>
	</div>
</section>
