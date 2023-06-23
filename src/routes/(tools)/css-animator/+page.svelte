<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Label, Input, Range } from 'flowbite-svelte';
	import { Checkbox } from 'flowbite-svelte';

	export let data;

	// defaults
	let duration = 0.4;
	let iteration = 1;
	let infiniteIteration = false;
	let timingFunction = 'linear';
	let timingFunctionMapping = {"ease":"ease","ease-in":"ease-in","ease-out":"ease-out","ease-in-out":"ease-in-out","linear":"linear","easeIn":"ease-in","easeOut":"ease-out","easeInOut":"ease-in-out","easeInQuad":"cubic-bezier(0.550, 0.085, 0.680, 0.530)","easeInCubic":"cubic-bezier(0.550, 0.055, 0.675, 0.190)","easeInQuart":"cubic-bezier(0.895, 0.030, 0.685, 0.220)","easeInQuint":"cubic-bezier(0.755, 0.050, 0.855, 0.060)","easeInSine":"cubic-bezier(0.470, 0.000, 0.745, 0.715)","easeInExpo":"cubic-bezier(0.950, 0.050, 0.795, 0.035)","easeInCirc":"cubic-bezier(0.600, 0.040, 0.980, 0.335)","easeInBack":"cubic-bezier(0.600, -0.280, 0.735, 0.045)","easeOutQuad":"cubic-bezier(0.250, 0.460, 0.450, 0.940)","easeOutCubic":"cubic-bezier(0.215, 0.610, 0.355, 1.000)","easeOutQuart":"cubic-bezier(0.165, 0.840, 0.440, 1.000)","easeOutQuint":"cubic-bezier(0.230, 1.000, 0.320, 1.000)","easeOutSine":"cubic-bezier(0.390, 0.575, 0.565, 1.000)","easeOutExpo":"cubic-bezier(0.190, 1.000, 0.220, 1.000)","easeOutCirc":"cubic-bezier(0.075, 0.820, 0.165, 1.000)","easeOutBack":"cubic-bezier(0.175, 0.885, 0.320, 1.275)","easeInOutQuad":"cubic-bezier(0.455, 0.030, 0.515, 0.955)","easeInOutCubic":"cubic-bezier(0.645, 0.045, 0.355, 1.000)","easeInOutQuart":"cubic-bezier(0.770, 0.000, 0.175, 1.000)","easeInOutQuint":"cubic-bezier(0.860, 0.000, 0.070, 1.000)","easeInOutSine":"cubic-bezier(0.445, 0.050, 0.550, 0.950)","easeInOutExpo":"cubic-bezier(1.000, 0.000, 0.000, 1.000)","easeInOutCirc":"cubic-bezier(0.785, 0.135, 0.150, 0.860)","easeInOutBack":"cubic-bezier(0.680, -0.550, 0.265, 1.550)"};
	let steps = 2;
	let stepType = 'start';
	let timingType = false;
	let delay = 0;
	let direction = 'normal';
	let fillMode = 'both';

	let animationGroup = {
		'scale-up': ['scale-up-center', 'scale-up-top', 'scale-up-tr'],
		'scale-down': ['scale-down-center', 'scale-down-top']
	};

	let animation = '';

	function calculateAnimation() {
		if (timingType == false) {
			animation = `${duration}s ${timingFunctionMapping[timingFunction]} ${delay}s ${infiniteIteration?'infinite':iteration} ${direction} ${fillMode} rotate-90-cw`;
		} else {
			animation = `${duration}s steps(${steps}, ${stepType}) ${delay}s ${infiniteIteration?'infinite':iteration} ${direction} ${fillMode} rotate-90-cw`;
		}
		getKeyFrame();
	}

	function getKeyFrame() {
		let name = 'rotate-90-cw';
		const keyframes = getAnimationKeyframes(name);
		let keyframeProcessed = '';
		for (let i = 0; i < keyframes.length; i++) {
			keyframeProcessed += keyframes[i].cssText;
			keyframeProcessed += ' ';
		}
		let css = `.${name} { animation: ${animation}; } \n\n @keyframes ${name} { ${keyframeProcessed}}`
		console.log(css);
	}

	// Function to retrieve keyframes from a given animation name
	function getAnimationKeyframes(name: string) {
		const styleSheets = document.styleSheets;
		for (let i = 0; i < styleSheets.length; i++) {
			const cssRules = styleSheets[i].cssRules;
			for (let j = 0; j < cssRules.length; j++) {
				// @ts-ignore
				if (cssRules[j].name == name && cssRules[j] instanceof CSSKeyframesRule) {
					// @ts-ignore
					return cssRules[j].cssRules;
				}
			}
		}
		return null;
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="animation.css">
</svelte:head>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
			<div class="p-8">
				<Label>Duration</Label>
				<Input type="number" step="0.1" bind:value={duration} on:change={calculateAnimation} />

				<Label class="mt-3">Iteration</Label>
				<div class="flex">
					<div>
						<Input type="number" bind:value={iteration} on:change={calculateAnimation} />
					</div>
					<div class="flex items-center">
						<input bind:checked={infiniteIteration} on:change={calculateAnimation} id="infinite-iteration" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
						<label for="infinite-iteration" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Infinite</label>
					</div>
				</div>

				<Label class="mt-3">Timing Functions</Label>
				<select on:change={calculateAnimation} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" bind:value={timingFunction}><optgroup label="Native"><option>linear</option><option>ease</option><option>easeIn</option><option>easeOut</option><option>easeInOut</option></optgroup><optgroup label="Penner Equations"><option>easeInQuad</option><option>easeInCubic</option><option>easeInQuart</option><option>easeInQuint</option><option>easeInSine</option><option>easeInExpo</option><option>easeInCirc</option><option>easeInBack</option><option>easeOutQuad</option><option>easeOutCubic</option><option>easeOutQuart</option><option>easeOutQuint</option><option>easeOutSine</option><option>easeOutExpo</option><option>easeOutCirc</option><option>easeOutBack</option><option>easeInOutQuad</option><option>easeInOutCubic</option><option>easeInOutQuart</option><option>easeInOutQuint</option><option>easeInOutSine</option><option>easeInOutExpo</option><option>easeInOutCirc</option><option>easeInOutBack</option></optgroup></select>

				<div class="flex items-center mt-3">
					<input bind:checked={timingType} on:change={calculateAnimation} id="timing-type" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
					<label for="timing-type" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Use steps</label>
				</div>
				<div class="flex mt-3">
					<Input type="number" bind:value={steps} on:change={calculateAnimation} />
					<select on:change={calculateAnimation} bind:value={stepType} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"><option>start</option><option>end</option></select>
				</div>

				<Label class="mt-3">Delay</Label>
				<Input type="number" step="0.1" bind:value={delay} on:change={calculateAnimation} />

				<Label class="mt-3">Direction</Label>
				<select on:change={calculateAnimation} bind:value={direction} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"><option>normal</option><option>reverse</option><option>alternate</option><option>alternate-reverse</option></select>

				<Label class="mt-3">Fill Mode</Label>
				<select on:change={calculateAnimation} bind:value={fillMode} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"><option>none</option><option>forwards</option><option>backwards</option><option>both</option></select>
			</div>
			<div class="p-8 h-full flex rounded-lg relative bg-white">
				{#key animation}
					<div class="box m-auto bg-black" style="width: 150px; height: 150px; border-radius: 4px; animation: width: 150px; height: 150px; border-radius: 4px; animation: {animation};"/>
				{/key}
			</div>
		</div>
	</div>
</section>

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<h2 class="mb-4 text-2xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white">
			How does it work?
		</h2>
		<p class="mb-4 text-gray-500 dark:text-gray-400">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
			labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
			voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
			non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		</p>
	</div>
</section>

<style>
	.box {
		border-radius: 20px;
	}

	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
</style>