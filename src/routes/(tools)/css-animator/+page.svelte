<svelte:head>
	<link rel="stylesheet" href="animation.css">
</svelte:head>
<script lang="ts">
	import { onMount } from 'svelte';
	import { Label, Input } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import Copy from '$lib/Copy.svelte';
	export let data;

	const animationGroup = {
		'scale-up': ['scale-up-center', 'scale-up-top', 'scale-up-tr', 'scale-up-right', 'scale-up-br', 'scale-up-bottom', 'scale-up-bl', 'scale-up-left', 'scale-up-tl', 'scale-up-hor-center', 'scale-up-hor-left', 'scale-up-hor-right', 'scale-up-ver-center', 'scale-up-ver-top', 'scale-up-ver-bottom'],
		'scale-down': ['scale-down-center', 'scale-down-top', 'scale-down-tr', 'scale-down-right', 'scale-down-br', 'scale-down-bottom', 'scale-down-bl', 'scale-down-left', 'scale-down-tl', 'scale-down-hor-center', 'scale-down-hor-left', 'scale-down-hor-right', 'scale-down-ver-center', 'scale-down-ver-top', 'scale-down-ver-bottom'],
		'rotate':['rotate-center', 'rotate-top', 'rotate-tr', 'rotate-right', 'rotate-br', 'rotate-bottom', 'rotate-bl', 'rotate-left', 'rotate-tl', 'rotate-hor-center', 'rotate-hor-top', 'rotate-hor-bottom', 'rotate-vert-center', 'rotate-vert-left', 'rotate-vert-right', 'rotate-diagonal-1', 'rotate-diagonal-2', 'rotate-diagonal-tr', 'rotate-diagonal-br', 'rotate-diagonal-bl', 'rotate-diagonal-tl'],
		'rotate-scale':['rotate-scale-up', 'rotate-scale-down', 'rotate-scale-up-hor', 'rotate-scale-down-hor', 'rotate-scale-up-ver', 'rotate-scale-down-ver', 'rotate-scale-up-diag-1', 'rotate-scale-down-diag-1', 'rotate-scale-up-diag-2', 'rotate-scale-down-diag-2'],
		'rotate-90':['rotate-90-cw', 'rotate-90-ccw', 'rotate-90-top-cw', 'rotate-90-top-ccw', 'rotate-90-tr-cw', 'rotate-90-tr-ccw', 'rotate-90-right-cw', 'rotate-90-right-ccw', 'rotate-90-br-cw', 'rotate-90-br-ccw', 'rotate-90-bottom-cw', 'rotate-90-bottom-ccw', 'rotate-90-bl-cw', 'rotate-90-bl-ccw', 'rotate-90-left-cw', 'rotate-90-left-ccw', 'rotate-90-tl-cw', 'rotate-90-tl-ccw', 'rotate-90-horizontal-fwd', 'rotate-90-horizontal-bck', 'rotate-90-vertical-fwd', 'rotate-90-vertical-bck'],
		'flip':['flip-horizontal-bottom', 'flip-horizontal-top', 'flip-horizontal-bck', 'flip-horizontal-fwd', 'flip-vertical-right', 'flip-vertical-left', 'flip-vertical-bck', 'flip-vertical-fwd', 'flip-diagonal-1-tr', 'flip-diagonal-1-bl', 'flip-diagonal-1-bck', 'flip-diagonal-1-fwd',  'flip-diagonal-2-br', 'flip-diagonal-2-tl', 'flip-diagonal-2-bck', 'flip-diagonal-2-fwd'],
		'flip-2':['flip-2-hor-top-1','flip-2-hor-top-2', 'flip-2-hor-top-bck', 'flip-2-hor-top-fwd', 'flip-2-ver-right-1', 'flip-2-ver-right-2', 'flip-2-ver-right-bck', 'flip-2-ver-right-fwd', 'flip-2-hor-bottom-1', 'flip-2-hor-bottom-2', 'flip-2-hor-bottom-bck', 'flip-2-hor-bottom-fwd', 'flip-2-ver-left-1', 'flip-2-ver-left-2', 'flip-2-ver-left-bck', 'flip-2-ver-left-fwd'],
		'flip-scale':['flip-scale-up-hor', 'flip-scale-down-hor', 'flip-scale-up-ver', 'flip-scale-down-ver', 'flip-scale-up-diag-1', 'flip-scale-down-diag-1', 'flip-scale-up-diag-2', 'flip-scale-down-diag-2'],
		'flip-scale-2':['flip-scale-2-hor-top', 'flip-scale-2-ver-right', 'flip-scale-2-hor-bottom', 'flip-scale-2-ver-left'],
		'swing':['swing-top-fwd', 'swing-top-bck', 'swing-top-right-fwd', 'swing-top-right-bck', 'swing-right-fwd', 'swing-right-bck', 'swing-bottom-right-fwd', 'swing-bottom-right-bck', 'swing-bottom-fwd', 'swing-bottom-bck', 'swing-bottom-left-fwd', 'swing-bottom-left-bck', 'swing-left-fwd', 'swing-left-bck', 'swing-top-left-fwd', 'swing-top-left-bck'],
		'slide':['slide-top', 'slide-tr', 'slide-right', 'slide-br', 'slide-bottom', 'slide-bl', 'slide-left', 'slide-tl'],
		'slide-bck':['slide-bck-center', 'slide-bck-top', 'slide-bck-tr', 'slide-bck-right', 'slide-bck-br', 'slide-bck-bottom', 'slide-bck-bl', 'slide-bck-left', 'slide-bck-tl'],
		'slide-fwd':['slide-fwd-center', 'slide-fwd-top', 'slide-fwd-tr', 'slide-fwd-right', 'slide-fwd-br', 'slide-fwd-bottom', 'slide-fwd-bl', 'slide-fwd-left', 'slide-fwd-tl'],
		'slide-rotate':['slide-rotate-hor-top', 'slide-rotate-hor-t-bck', 'slide-rotate-hor-t-fwd','slide-rotate-ver-right', 'slide-rotate-ver-r-bck', 'slide-rotate-ver-r-fwd', 'slide-rotate-hor-bottom', 'slide-rotate-hor-b-bck', 'slide-rotate-hor-b-fwd', 'slide-rotate-ver-left', 'slide-rotate-ver-l-bck', 'slide-rotate-ver-l-fwd'],
		'shadow-drop':['shadow-drop-center', 'shadow-drop-top', 'shadow-drop-right', 'shadow-drop-bottom', 'shadow-drop-left', 'shadow-drop-lr', 'shadow-drop-tb', 'shadow-drop-tr', 'shadow-drop-br', 'shadow-drop-bl', 'shadow-drop-tl'],
		'shadow-drop-2':['shadow-drop-2-center', 'shadow-drop-2-top', 'shadow-drop-2-right', 'shadow-drop-2-bottom', 'shadow-drop-2-left', 'shadow-drop-2-lr', 'shadow-drop-2-tb', 'shadow-drop-2-tr', 'shadow-drop-2-br', 'shadow-drop-2-bl', 'shadow-drop-2-tl'],
		'shadow-pop':['shadow-pop-tr', 'shadow-pop-br', 'shadow-pop-bl', 'shadow-pop-tl'],
		'shadow-inset':['shadow-inset-center', 'shadow-inset-top', 'shadow-inset-right', 'shadow-inset-bottom', 'shadow-inset-left', 'shadow-inset-lr', 'shadow-inset-tb', 'shadow-inset-tr', 'shadow-inset-br', 'shadow-inset-bl', 'shadow-inset-tl']
	};

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
	let animationType = 'scale-up';
	let animationSubType = 'scale-up-center';

	let animation = '';
	let css = '';

	function calculateAnimation() {
		setTimeout(() => {
			if (!animationGroup[animationType].includes(animationSubType)) animationSubType = animationGroup[animationType][0];
			if (timingType == false) {
				animation = `${duration}s ${timingFunctionMapping[timingFunction]} ${delay}s ${infiniteIteration?'infinite':iteration} ${direction} ${fillMode} ${animationSubType}`;
			} else {
				animation = `${duration}s steps(${steps}, ${stepType}) ${delay}s ${infiniteIteration?'infinite':iteration} ${direction} ${fillMode} ${animationSubType}`;
			}
			getKeyFrame();
		}, 10);
	}

	function getKeyFrame() {
		const keyframes = getAnimationKeyframes(animationSubType);
		let keyframeProcessed = '';
		for (let i = 0; i < keyframes.length; i++) {
			keyframeProcessed += keyframes[i].cssText;
			keyframeProcessed += ' ';
		}
		css = `.${animationSubType} { animation: ${animation}; } \n\n @keyframes ${animationSubType} { ${keyframeProcessed}}`;
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
	
	onMount(async () => {
		calculateAnimation();
	});
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
			<div class="p-8">
				<Label>Animation Type</Label>
				<select on:change={calculateAnimation} bind:value={animationType} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
					{#each Object.keys(animationGroup) as animation}
						<option>{animation}</option>
					{/each}
				</select>

				<Label class="mt-3">Animation Sub-type</Label>
				<select on:change={calculateAnimation} bind:value={animationSubType} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
					{#each animationGroup[animationType] as animation}
						<option>{animation}</option>
					{/each}
				</select>

				<Label class="mt-3">Duration</Label>
				<Input type="number" step="0.1" bind:value={duration} on:change={calculateAnimation} />

				<Label class="mt-3">Timing Functions</Label>
				<select on:change={calculateAnimation} disabled={timingType} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" bind:value={timingFunction}><optgroup label="Native"><option>linear</option><option>ease</option><option>easeIn</option><option>easeOut</option><option>easeInOut</option></optgroup><optgroup label="Penner Equations"><option>easeInQuad</option><option>easeInCubic</option><option>easeInQuart</option><option>easeInQuint</option><option>easeInSine</option><option>easeInExpo</option><option>easeInCirc</option><option>easeInBack</option><option>easeOutQuad</option><option>easeOutCubic</option><option>easeOutQuart</option><option>easeOutQuint</option><option>easeOutSine</option><option>easeOutExpo</option><option>easeOutCirc</option><option>easeOutBack</option><option>easeInOutQuad</option><option>easeInOutCubic</option><option>easeInOutQuart</option><option>easeInOutQuint</option><option>easeInOutSine</option><option>easeInOutExpo</option><option>easeInOutCirc</option><option>easeInOutBack</option></optgroup></select>

				<div class="flex items-center mt-3">
					<input bind:checked={timingType} on:change={calculateAnimation} id="timing-type" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
					<label for="timing-type" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Use steps</label>
				</div>
				<div class="flex mt-3 bg-gray-50 border border-gray-300 rounded-lg overflow-hidden">
					<Input type="number" bind:value={steps} on:change={calculateAnimation} disabled={!timingType} class="border-0"/>
					<select on:change={calculateAnimation} bind:value={stepType} disabled={!timingType} class="border border-white border-l-2 bg-gray-50 text-gray-900 text-sm focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"><option>start</option><option>end</option></select>
				</div>

				<Label class="mt-3">Delay</Label>
				<Input type="number" step="0.1" bind:value={delay} on:change={calculateAnimation} />

				<Label class="mt-3">Iteration Count</Label>
				<div class="flex">
					<div>
						<Input type="number" bind:value={iteration} on:change={calculateAnimation} disabled={infiniteIteration}/>
					</div>
					<div class="flex items-center ml-3">
						<input bind:checked={infiniteIteration} on:change={calculateAnimation} id="infinite-iteration" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600">
						<label for="infinite-iteration" class="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Infinite</label>
					</div>
				</div>

				<Label class="mt-3">Direction</Label>
				<select on:change={calculateAnimation} bind:value={direction} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"><option>normal</option><option>reverse</option><option>alternate</option><option>alternate-reverse</option></select>

				<Label class="mt-3">Fill Mode</Label>
				<select on:change={calculateAnimation} bind:value={fillMode} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"><option>none</option><option>forwards</option><option>backwards</option><option>both</option></select>
			</div>
			<div class="p-8 h-full flex rounded-lg relative bg-gray-100">
				<Copy text={css}/>
				{#key animation}
					<div class="box m-auto bg-black" style="width: 150px; height: 150px; border-radius: 4px; animation: width: 150px; height: 150px; border-radius: 4px; animation: {animation};"/>
				{/key}
			</div>
		</div>
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