<script lang="ts">
	type Gender = "female" | "male" | "non-binary";

	const defaults = {
		height: 170,
		weight: 65,
		age: 30,
		gender: "male" as Gender,
	};

	const bmiCategories = [
		{
			label: "Underweight",
			range: "< 18.5",
			guidance:
				"Focus on nutrient-dense meals and gradual strength training to build mass.",
		},
		{
			label: "Healthy weight",
			range: "18.5 - 24.9",
			guidance:
				"Maintain balanced meals, regular movement, and consistent sleep.",
		},
		{
			label: "Overweight",
			range: "25.0 - 29.9",
			guidance:
				"A modest calorie deficit and consistent activity can help with weight management.",
		},
		{
			label: "Obese",
			range: "30.0+",
			guidance:
				"Work with a healthcare professional to create a tailored nutrition and movement plan.",
		},
	] as const;

	const bmiFormatter = new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	});

	const weightFormatter = new Intl.NumberFormat("en-US", {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	});

	let height = defaults.height;
	let weight = defaults.weight;
	let age = defaults.age;
	let gender: Gender = defaults.gender;

	let bmi: number | null = null;
	let category = "";
	let interpretation = "";
	let healthyWeightRange = "";
	let errorMessage = "";

	function toNumber(value: number | string): number {
		if (typeof value === "number" && Number.isFinite(value)) {
			return value;
		}

		if (typeof value === "string" && value.trim() !== "") {
			const parsed = Number(value);
			return Number.isFinite(parsed) ? parsed : 0;
		}

		return 0;
	}

	function classifyBmi(value: number): string {
		if (value < 18.5) return "Underweight";
		if (value < 25) return "Healthy weight";
		if (value < 30) return "Overweight";
		return "Obese";
	}

	function interpretationMessage(
		currentCategory: string,
		ageValue: number,
		currentGender: Gender,
	) {
		const persona =
			currentGender === "female"
				? "woman"
				: currentGender === "male"
					? "man"
					: "person";

		switch (currentCategory) {
			case "Underweight":
				return `As a ${ageValue}-year-old ${persona}, consider meeting a healthcare provider to build a nutrition plan that supports gradual and sustainable weight gain.`;
			case "Healthy weight":
				return `Great job! Keep supporting your long-term well-being with balanced meals, strength and cardio training, and regular health check-ins.`;
			case "Overweight":
				return `Building daily movement habits and reviewing portion sizes can help you move toward your target range. Tracking progress with a professional adds accountability.`;
			case "Obese":
			default:
				return `Your BMI suggests an elevated health risk. Partner with your doctor or a registered dietitian to create a plan that aligns with your medical history and daily life.`;
		}
	}

	function calculateBMI() {
		const heightCm = toNumber(height);
		const weightKg = toNumber(weight);
		const ageValue = toNumber(age);

		if (heightCm <= 0) {
			errorMessage = "Please enter a valid height (in centimeters).";
			bmi = null;
			category = "";
			interpretation = "";
			healthyWeightRange = "";
			return;
		}

		if (weightKg <= 0) {
			errorMessage = "Please enter a valid weight (in kilograms).";
			bmi = null;
			category = "";
			interpretation = "";
			healthyWeightRange = "";
			return;
		}

		const heightMeters = heightCm / 100;
		const computedBmi = weightKg / (heightMeters * heightMeters);

		if (!Number.isFinite(computedBmi)) {
			errorMessage =
				"We could not calculate your BMI with the values provided.";
			bmi = null;
			category = "";
			interpretation = "";
			healthyWeightRange = "";
			return;
		}

		errorMessage = "";
		bmi = Number(computedBmi.toFixed(1));
		category = classifyBmi(bmi);
		interpretation = interpretationMessage(category, ageValue, gender);

		const minHealthyWeight = 18.5 * (heightMeters * heightMeters);
		const maxHealthyWeight = 24.9 * (heightMeters * heightMeters);

		healthyWeightRange = `${weightFormatter.format(minHealthyWeight)} kg - ${weightFormatter.format(maxHealthyWeight)} kg`;
	}

	function resetForm() {
		height = defaults.height;
		weight = defaults.weight;
		age = defaults.age;
		gender = defaults.gender;
		errorMessage = "";
		bmi = null;
		category = "";
		interpretation = "";
		healthyWeightRange = "";
	}

	calculateBMI();
</script>

<section class="mx-auto space-y-6 px-4 py-6">
	<div class="grid gap-8 grid-cols-1 lg:grid-cols-3">
		<form
			class="rounded-3xl border border-slate-200 bg-white/85 p-8 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60"
			on:submit|preventDefault={calculateBMI}
		>
			<h2 class="text-xl font-semibold text-slate-900 dark:text-white">
				Enter your details
			</h2>

			<div class="mt-6 grid gap-6">
				<label class="space-y-2">
					<span
						class="text-sm font-medium text-slate-600 dark:text-slate-300"
					>
						Height (cm)
					</span>
					<input
						type="number"
						step="1"
						bind:value={height}
						class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
						placeholder="e.g. 170"
					/>
				</label>

				<label class="space-y-2">
					<span
						class="text-sm font-medium text-slate-600 dark:text-slate-300"
					>
						Weight (kg)
					</span>
					<input
						type="number"
						step="0.1"
						bind:value={weight}
						class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
						placeholder="e.g. 65"
					/>
				</label>

				<label class="space-y-2">
					<span
						class="text-sm font-medium text-slate-600 dark:text-slate-300"
						>Age</span
					>
					<input
						type="number"
						step="1"
						bind:value={age}
						class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
						placeholder="e.g. 30"
					/>
				</label>

				<label class="space-y-2">
					<span
						class="text-sm font-medium text-slate-600 dark:text-slate-300"
						>Gender</span
					>
					<select
						bind:value={gender}
						class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200/70 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-500/40"
					>
						<option value="female">Female</option>
						<option value="male">Male</option>
						<option value="non-binary">Non-binary</option>
					</select>
				</label>
			</div>

			<div class="mt-8 flex flex-col gap-3 sm:flex-row">
				<button
					type="submit"
					class="inline-flex w-full items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 sm:w-auto"
				>
					Calculate BMI
				</button>
				<button
					type="button"
					class="inline-flex w-full items-center justify-center rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-slate-400 hover:text-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 dark:border-slate-700 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:text-white sm:w-auto"
					on:click={resetForm}
				>
					Reset
				</button>
			</div>
		</form>

		{#if errorMessage}
			<p
				class="rounded-2xl border border-red-200/70 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200"
			>
				{errorMessage}
			</p>
		{/if}

		{#if bmi !== null}
			<div
				class="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/60"
			>
				<h2
					class="text-xl font-semibold text-slate-900 dark:text-white"
				>
					Your results
				</h2>

				<div class="mt-6 space-y-6">
					<div
						class="rounded-2xl border border-emerald-200/70 bg-emerald-50/70 p-6 dark:border-emerald-500/30 dark:bg-emerald-900/20"
					>
						<p
							class="text-xs font-semibold uppercase tracking-wide text-emerald-600 dark:text-emerald-300"
						>
							Body mass index
						</p>
						<p
							class="mt-2 text-4xl font-semibold text-emerald-700 dark:text-emerald-200"
						>
							{bmiFormatter.format(bmi)}
						</p>
						<p
							class="mt-1 text-sm font-medium text-emerald-700/80 dark:text-emerald-200/80"
						>
							{category}
						</p>
					</div>

					{#if healthyWeightRange}
						<div
							class="rounded-2xl border border-indigo-200/70 bg-indigo-50/70 p-6 dark:border-indigo-500/40 dark:bg-indigo-900/20"
						>
							<p
								class="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300"
							>
								Healthy weight range for your height
							</p>
							<p
								class="mt-2 text-xl font-semibold text-indigo-700 dark:text-indigo-200"
							>
								{healthyWeightRange}
							</p>
						</div>
					{/if}

					<p
						class="text-sm leading-relaxed text-slate-600 dark:text-slate-300"
					>
						{interpretation}
					</p>
				</div>
			</div>
		{/if}

		<div
			class="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
		>
			<h3
				class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
			>
				BMI guide
			</h3>
			<ul class="mt-5 space-y-4">
				{#each bmiCategories as item}
					<li
						class="rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40"
					>
						<p
							class="text-sm font-semibold text-slate-900 dark:text-white"
						>
							{item.label} ({item.range})
						</p>
						<p
							class="mt-1 text-sm text-slate-600 dark:text-slate-300"
						>
							{item.guidance}
						</p>
					</li>
				{/each}
			</ul>
			<p class="mt-5 text-xs text-slate-500 dark:text-slate-400">
				Note: BMI does not distinguish between muscle and fat and may
				not reflect the whole picture for athletes, pregnant people, or
				individuals with unique body compositions. Pair these results
				with advice from your healthcare provider.
			</p>
		</div>
	</div>
</section>
