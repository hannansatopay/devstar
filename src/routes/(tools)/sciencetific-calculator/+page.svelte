<script lang="ts">
	const formatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 10, useGrouping: true });
	const historyFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 6, useGrouping: true });

	type AngleMode = 'deg' | 'rad';
	type KeyButton = {
		label: string;
		action: () => void;
		tone: 'number' | 'operator' | 'function' | 'accent' | 'primary';
		span?: number;
	};

	let expression = '';
	let previewExpression = '';
	let resultValue: number | null = null;
	let error: string | null = null;
	let angleMode: AngleMode = 'deg';
	let justEvaluated = false;
	let history: Array<{ expression: string; result: number }> = [];
	let ans: number | null = null;

	$: expressionLine = justEvaluated ? previewExpression || formatExpression(expression) : formatExpression(expression);
	$: largeDisplay = computeLargeDisplay();

	function formatExpression(value: string): string {
		if (!value) {
			return '0';
		}

		return value
			.replace(/ANS/g, 'Ans')
			.replace(/PI/g, 'π')
			.replace(/E/g, 'e')
			.replace(/\*/g, '×')
			.replace(/\//g, '÷')
			.replace(/%/g, ' mod ');
	}

	function computeLargeDisplay(): string {
		if (justEvaluated && resultValue !== null) {
			return formatter.format(resultValue);
		}

		if (!expression) {
			return '0';
		}

		const lastNumber = expression.match(/-?\d*\.?\d*$/);
		if (lastNumber && lastNumber[0]) {
			return lastNumber[0];
		}

		if (expression.endsWith('PI')) {
			return 'π';
		}

		if (expression.endsWith('E')) {
			return 'e';
		}

		if (expression.endsWith('ANS') && ans !== null) {
			return formatter.format(ans);
		}

		return formatExpression(expression);
	}

	function isOperator(char: string): boolean {
		return ['+', '-', '*', '/', '^', '%'].includes(char);
	}

	function resetAfterEvaluationForFreshEntry() {
		if (justEvaluated) {
			expression = '';
			resultValue = null;
			justEvaluated = false;
			previewExpression = '';
		}
	}

	function needsImplicitMultiply(includeNumbers = true): boolean {
		if (!expression) {
			return false;
		}

		if (expression.endsWith(')') || expression.endsWith('PI') || expression.endsWith('E') || expression.endsWith('ANS')) {
			return true;
		}

		return includeNumbers ? /\d$/.test(expression) : false;
	}

	function addDigit(digit: string) {
		resetAfterEvaluationForFreshEntry();
		if (error) {
			error = null;
		}

		if (needsImplicitMultiply(false)) {
			expression += '*';
		}

		expression += digit;
		resultValue = null;
	}

	function getActiveNumberSegment(): string {
		const match = expression.match(/-?\d*\.?\d*$/);
		return match ? match[0] : '';
	}

	function addDecimal() {
		resetAfterEvaluationForFreshEntry();
		if (error) {
			error = null;
		}

		if (needsImplicitMultiply(false)) {
			expression += '*';
		}

		const segment = getActiveNumberSegment();
		if (!segment) {
			expression += '0.';
			resultValue = null;
			return;
		}

		if (segment.includes('.')) {
			return;
		}

		expression += '.';
		resultValue = null;
	}

	function addOperator(symbol: string) {
		if (error) {
			error = null;
		}

		let op = symbol;
		if (symbol === '×') {
			op = '*';
		} else if (symbol === '÷') {
			op = '/';
		} else if (symbol === 'mod') {
			op = '%';
		}

		if (justEvaluated) {
			justEvaluated = false;
			previewExpression = '';
		}

		if (!expression) {
			if (ans !== null) {
				expression = ans.toString();
			} else if (op === '-') {
				expression = '-';
				return;
			} else {
				return;
			}
		}

		const lastChar = expression.slice(-1);

		if (isOperator(lastChar) || lastChar === '^') {
			expression = expression.slice(0, -1) + op;
		} else if (lastChar === '(') {
			if (op === '-') {
				expression += '-';
			}
			return;
		} else {
			expression += op;
		}

		resultValue = null;
	}

	function openParen() {
		resetAfterEvaluationForFreshEntry();
		if (error) {
			error = null;
		}

		if (needsImplicitMultiply()) {
			expression += '*';
		}

		expression += '(';
		resultValue = null;
	}

	function closeParen() {
		if (!expression) {
			return;
		}

		if (error) {
			error = null;
		}

		const openCount = (expression.match(/\(/g) ?? []).length;
		const closeCount = (expression.match(/\)/g) ?? []).length;

		if (openCount <= closeCount) {
			return;
		}

		const lastChar = expression.slice(-1);
		if (lastChar === '(' || isOperator(lastChar)) {
			return;
		}

		expression += ')';
		justEvaluated = false;
		resultValue = null;
	}

	function addFunction(name: string) {
		resetAfterEvaluationForFreshEntry();
		if (error) {
			error = null;
		}

		if (needsImplicitMultiply()) {
			expression += '*';
		}

		expression += `${name}(`;
		resultValue = null;
	}

	function addConstant(constant: 'PI' | 'E') {
		resetAfterEvaluationForFreshEntry();
		if (error) {
			error = null;
		}

		if (needsImplicitMultiply()) {
			expression += '*';
		}

		expression += constant;
		resultValue = null;
	}

	function addAns() {
		if (ans === null) {
			error = 'No stored answer yet.';
			return;
		}

		resetAfterEvaluationForFreshEntry();
		if (needsImplicitMultiply()) {
			expression += '*';
		}

		expression += 'ANS';
		error = null;
		resultValue = null;
	}

	function applyPower(power: number) {
		if (!expression) {
			return;
		}

		if (error) {
			error = null;
		}

		if (justEvaluated) {
			justEvaluated = false;
			previewExpression = '';
		}

		const lastChar = expression.slice(-1);
		if (!lastChar || lastChar === '(' || isOperator(lastChar)) {
			return;
		}

		expression += `^${power}`;
		resultValue = null;
	}

	function addFactorial() {
		addFunction('fact');
	}

	function clearAll() {
		expression = '';
		previewExpression = '';
		resultValue = null;
		error = null;
		justEvaluated = false;
	}

	function clearEntry() {
		if (!expression) {
			return;
		}

		if (error) {
			error = null;
		}

		resultValue = null;
		justEvaluated = false;

		if (expression.endsWith('ANS')) {
			expression = expression.slice(0, -3);
			return;
		}

		if (expression.endsWith('PI')) {
			expression = expression.slice(0, -2);
			return;
		}

		if (expression.endsWith('E')) {
			expression = expression.slice(0, -1);
			return;
		}

		const numericMatch = expression.match(/(.*?)(-?\d*\.?\d*)$/);
		if (numericMatch && numericMatch[2]) {
			expression = numericMatch[1];
			return;
		}

		const suffixes = ['sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'log(', 'ln(', 'sqrt(', 'abs(', 'exp(', 'fact('];
		for (const suffix of suffixes) {
			if (expression.endsWith(suffix)) {
				expression = expression.slice(0, -suffix.length);
				return;
			}
		}

		if (expression.endsWith(')') || isOperator(expression.slice(-1))) {
			expression = expression.slice(0, -1);
			return;
		}

		expression = '';
	}

	function backspace() {
		if (!expression) {
			return;
		}

		if (error) {
			error = null;
		}

		resultValue = null;
		justEvaluated = false;

		const suffixes = ['sin(', 'cos(', 'tan(', 'asin(', 'acos(', 'atan(', 'log(', 'ln(', 'sqrt(', 'abs(', 'exp(', 'fact('];
		for (const suffix of suffixes) {
			if (expression.endsWith(suffix)) {
				expression = expression.slice(0, -suffix.length);
				return;
			}
		}

		if (expression.endsWith('ANS')) {
			expression = expression.slice(0, -3);
			return;
		}

		if (expression.endsWith('PI')) {
			expression = expression.slice(0, -2);
			return;
		}

		expression = expression.slice(0, -1);
	}

	function evaluate() {
		if (!expression) {
			return;
		}

		let expr = expression;

		while (expr && isOperator(expr.slice(-1))) {
			expr = expr.slice(0, -1);
		}

		if (!expr) {
			return;
		}

		const openCount = (expr.match(/\(/g) ?? []).length;
		const closeCount = (expr.match(/\)/g) ?? []).length;
		if (closeCount < openCount) {
			expr += ')'.repeat(openCount - closeCount);
		}

		if (expr.includes('ANS') && ans === null) {
			error = 'No stored answer yet.';
			return;
		}

		const jsExpr = expr.replace(/\^/g, '**');

		const toRadians = (value: number) => (angleMode === 'deg' ? (value * Math.PI) / 180 : value);
		const fromRadians = (value: number) => (angleMode === 'deg' ? (value * 180) / Math.PI : value);
		const factorial = (value: number): number => {
			if (!Number.isFinite(value)) {
				throw new Error('Invalid input for factorial.');
			}

			if (value < 0 || Math.floor(value) !== value) {
				throw new Error('Factorial is defined for non-negative integers.');
			}

			let acc = 1;
			for (let i = 2; i <= value; i += 1) {
				acc *= i;
				if (!Number.isFinite(acc)) {
					throw new Error('Factorial result is too large.');
				}
			}

			return acc;
		};

		const scope = {
			sin: (x: number) => Math.sin(toRadians(x)),
			cos: (x: number) => Math.cos(toRadians(x)),
			tan: (x: number) => Math.tan(toRadians(x)),
			asin: (x: number) => fromRadians(Math.asin(x)),
			acos: (x: number) => fromRadians(Math.acos(x)),
			atan: (x: number) => fromRadians(Math.atan(x)),
			log: (x: number) => Math.log10(x),
			ln: (x: number) => Math.log(x),
			sqrt: (x: number) => Math.sqrt(x),
			abs: (x: number) => Math.abs(x),
			exp: (x: number) => Math.exp(x),
			pow: (x: number, y: number) => Math.pow(x, y),
			fact: factorial,
			PI: Math.PI,
			E: Math.E,
			ANS: ans ?? 0
		};

		try {
			const evaluator = Function(...Object.keys(scope), `"use strict"; return (${jsExpr});`);
			const computed = Number(evaluator(...Object.values(scope)));

			if (!Number.isFinite(computed)) {
				throw new Error('Result is not a real number.');
			}

			const displayExpression = formatExpression(expr);
			previewExpression = displayExpression;
			resultValue = computed;
			ans = computed;
			history = [{ expression: displayExpression, result: computed }, ...history].slice(0, 8);
			expression = computed.toString();
			justEvaluated = true;
			error = null;
		} catch (err) {
			error = err instanceof Error ? err.message : 'Could not evaluate expression.';
			resultValue = null;
			justEvaluated = false;
		}
	}

	function setAngle(mode: AngleMode) {
		angleMode = mode;
	}

	function getButtonToneClasses(button: KeyButton): string {
		switch (button.tone) {
			case 'number':
				return 'bg-slate-900/40 text-white hover:bg-emerald-500/30';
			case 'operator':
				return 'bg-slate-800/70 text-emerald-300 hover:bg-emerald-500/30 hover:text-white';
			case 'function':
				return 'bg-slate-800/60 text-sky-200 hover:bg-sky-500/30 hover:text-white';
			case 'accent':
				return 'bg-slate-800 text-amber-200 hover:bg-amber-500/30 hover:text-white';
			case 'primary':
				return 'bg-emerald-500 text-slate-900 hover:bg-emerald-400';
		}
	}

	const keypad: KeyButton[] = [
		// Row 1
		{ label: 'C', tone: 'accent', action: clearAll },
		{ label: 'CE', tone: 'accent', action: clearEntry },
		{ label: '⌫', tone: 'accent', action: backspace },
		{ label: '(', tone: 'function', action: openParen },
		{ label: ')', tone: 'function', action: closeParen },
		{ label: 'Ans', tone: 'accent', action: addAns },
		{ label: 'sin', tone: 'function', action: () => addFunction('sin') },
		{ label: 'cos', tone: 'function', action: () => addFunction('cos') },
		// Row 2
		{ label: 'tan', tone: 'function', action: () => addFunction('tan') },
		{ label: 'asin', tone: 'function', action: () => addFunction('asin') },
		{ label: 'acos', tone: 'function', action: () => addFunction('acos') },
		{ label: 'atan', tone: 'function', action: () => addFunction('atan') },
		{ label: 'log', tone: 'function', action: () => addFunction('log') },
		{ label: 'ln', tone: 'function', action: () => addFunction('ln') },
		{ label: 'sqrt', tone: 'function', action: () => addFunction('sqrt') },
		{ label: 'abs', tone: 'function', action: () => addFunction('abs') },
		// Row 3 (numbers on the right)
		{ label: 'exp', tone: 'function', action: () => addFunction('exp') },
		{ label: 'x^y', tone: 'operator', action: () => addOperator('^') },
		{ label: 'mod', tone: 'operator', action: () => addOperator('mod') },
		{ label: '^2', tone: 'operator', action: () => applyPower(2) },
		{ label: '^3', tone: 'operator', action: () => applyPower(3) },
		{ label: '7', tone: 'number', action: () => addDigit('7') },
		{ label: '8', tone: 'number', action: () => addDigit('8') },
		{ label: '9', tone: 'number', action: () => addDigit('9') },
		// Row 4
		{ label: 'fact', tone: 'function', action: addFactorial },
		{ label: 'π', tone: 'accent', action: () => addConstant('PI') },
		{ label: 'e', tone: 'accent', action: () => addConstant('E') },
		{ label: '÷', tone: 'operator', action: () => addOperator('÷') },
		{ label: '×', tone: 'operator', action: () => addOperator('×') },
		{ label: '4', tone: 'number', action: () => addDigit('4') },
		{ label: '5', tone: 'number', action: () => addDigit('5') },
		{ label: '6', tone: 'number', action: () => addDigit('6') },
		// Row 5
		{ label: '-', tone: 'operator', action: () => addOperator('-') },
		{ label: '+', tone: 'operator', action: () => addOperator('+') },
		{ label: '.', tone: 'number', action: addDecimal },
		{ label: '=', tone: 'primary', action: evaluate },
		{ label: '0', tone: 'number', action: () => addDigit('0') },
		{ label: '1', tone: 'number', action: () => addDigit('1') },
		{ label: '2', tone: 'number', action: () => addDigit('2') },
		{ label: '3', tone: 'number', action: () => addDigit('3') }
	];
</script>

<section class="mx-auto space-y-6 px-4 py-6">
	<div class="grid gap-6 lg:grid-cols-[minmax(420px,_2fr)_minmax(0,_1fr)]">
		<div class="relative overflow-hidden rounded-[2.5rem] bg-slate-900 text-white shadow-2xl shadow-emerald-900/20 ring-1 ring-slate-800">
			<div class="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-br from-emerald-500/30 via-slate-900 to-slate-950 blur-2xl"></div>

			<div class="calculator relative flex flex-col gap-6 p-6 lg:p-8">
				<div class="rounded-3xl border border-white/5 bg-slate-950/60 p-4 text-right shadow-inner shadow-black/40">
					<div class="text-xs uppercase tracking-[0.3em] text-slate-500">Expression</div>
					<div class="min-h-[1.5rem] text-sm text-slate-400">{expressionLine}</div>
					<div class="mt-2 text-[3rem] font-bold tabular-nums leading-tight">{largeDisplay}</div>
					{#if error}
						<p class="mt-3 rounded-2xl bg-red-500/15 px-3 py-2 text-xs text-red-200">{error}</p>
					{/if}
				</div>

				<div class="flex items-center justify-between rounded-full border border-white/10 bg-slate-800/70 px-4 py-2 text-sm">
					<span class="text-slate-300">Angle mode</span>
					<div class="flex gap-2">
						<button
							type="button"
							class={`rounded-full px-3 py-1 text-xs font-semibold transition ${
								angleMode === 'deg'
									? 'bg-emerald-400 text-slate-900 shadow-lg shadow-emerald-900/40'
									: 'bg-transparent text-slate-200 hover:bg-slate-700/80'
							}`}
							on:click={() => setAngle('deg')}
						>
							Deg
						</button>
						<button
							type="button"
							class={`rounded-full px-3 py-1 text-xs font-semibold transition ${
								angleMode === 'rad'
									? 'bg-emerald-400 text-slate-900 shadow-lg shadow-emerald-900/40'
									: 'bg-transparent text-slate-200 hover:bg-slate-700/80'
							}`}
							on:click={() => setAngle('rad')}
						>
							Rad
						</button>
					</div>
				</div>

				<div class="grid grid-cols-8 gap-2">
					{#each keypad as button, index (button.label + index)}
						<button
							type="button"
							class={`rounded-2xl border border-white/5 px-3 py-4 text-lg font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 active:translate-y-[1px] ${getButtonToneClasses(
								button
							)}`}
							style={button.span ? `grid-column: span ${button.span} / span ${button.span};` : undefined}
							on:click={button.action}
						>
							{button.label}
						</button>
					{/each}
				</div>
			</div>
		</div>

		<div class="details space-y-6">
			<section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
				<h2 class="text-lg font-semibold text-slate-900 dark:text-white">History</h2>
				{#if history.length === 0}
					<p class="mt-3 text-sm text-slate-600 dark:text-slate-400">No calculations yet. Run an expression to start your tape.</p>
				{:else}
					<ul class="mt-4 space-y-3">
						{#each history as item, index}
							<li class="flex items-baseline justify-between gap-3 border-b border-slate-100 pb-3 last:border-none last:pb-0 dark:border-slate-800">
								<div>
									<p class="text-xs uppercase tracking-[0.3em] text-emerald-500">{index === 0 ? 'Latest' : `#${index + 1}`}</p>
									<p class="mt-1 text-sm text-slate-700 dark:text-slate-200">{item.expression}</p>
								</div>
								<p class="text-lg font-semibold text-slate-900 dark:text-white">{historyFormatter.format(item.result)}</p>
							</li>
						{/each}
					</ul>
				{/if}
			</section>

			<section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
				<h2 class="text-lg font-semibold text-slate-900 dark:text-white">Tips</h2>
				<ul class="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
					<li>Select Deg or Rad before trigonometric operations to match your problem.</li>
					<li>`x^y`, `^2`, `^3`, and `fact` cover common power and factorial workflows—`fact` opens parentheses so you can provide the value.</li>
					<li>`Ans` recalls your most recent answer so you can chain long calculations effortlessly.</li>
				</ul>
			</section>
		</div>
	</div>
</section>
