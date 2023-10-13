<script>
	import { Label, Input, Range } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import { P } from 'flowbite-svelte';
	import { tools } from '../../tools';
	import Copy from '$lib/Copy.svelte';
	// import ColorPalette from './components/ColorPalette.svelte';
	const title = tools['living-background-generator'].name;
	const description = tools['living-background-generator'].description;

	let clrList = ['#fff', '#000', '#f00'];

	const pushArr = () => {
		clrList.length < 5 ? (clrList = [...clrList, clrVal3]) : alert('Too many colors');
	};

	$: clrStyle = clrList.map((x) => {
		return `background: ${x};`;
	});

	let clrVal = '';

	const updateClrVal1 = () => {
		clrVal = '#0f0';
	};
	const updateClrVal2 = () => {
		clrVal = '#00f';
	};

	$: bgGradient = `background-image: linear-gradient(${angle}deg, ${clrList});`;

	let angle = 0;

	let speed = 4;

	$: gradientSpeed = `animation-duration: ${speed}s;`;

	let root;

	let colorInput;
	let alphaSlider;
	let colorDisplay;

	let clrVal3 = '#000';

	function updateColorDisplay() {
		const selectedColor = colorInput.value;
		const alphaValue = alphaSlider.value;
		colorDisplay.style.backgroundColor = selectedColor;
		colorDisplay.style.opacity = alphaValue;
	}
	// Set the initial color

	$: css = `
	.animated-background {
		height: 100vh;
		width: 100vw;
		background-size: 400% 400%;
		${bgGradient}
		animation: gradient ease infinite;
		animation-duration: ${speed}s;
	}

	@keyframes gradient {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}`;

	function copyFunction() {
		// Copy the text inside the text field
		navigator.clipboard.writeText(css);

		// Alert the copied text
		alert('Copied the styles');
	}
</script>

<section class="p-24" bind:this={root}>
	<Intro heading={title} {description} />
	<div class="grid grid-cols-2">
		<div class="flex flex-col justify-center items-center px-24">
			<div class="color-div mx-auto w-fit flex">
				{#each [...clrStyle] as clr}
					<div class="aspect-square h-[50px] mx-4" style={clr} />
				{/each}
			</div>

			<label class="mt-2 font-bold dark:text-white" for="">Select Color: </label>
			<div class="color-picker">
				<input
					class="w-12 h-12 mt-4"
					type="color"
					id="color-input"
					bind:value={clrVal3}
					on:input={updateColorDisplay}
				/>
				<!-- <input
					type="range"
					id="alpha-slider"
					min="0"
					max="1"
					step="0.01"
					value="1"
					on:input={updateColorDisplay}
				/> -->
				<!-- <div id="color-display" /> -->
			</div>

			<div class="my-8 w-fit mx-auto">
				<button class="text-[#2F4550] bg-[#B8DBD9] rounded-full px-2 rounded-lg" on:click={pushArr}>
					Add Color
				</button>
			</div>

			<div class="w-3/4">
				<Label class="mt-3">Angle</Label>
				<Range
					bind:value={angle}
					min="0"
					max="360"
					on:change={() => {
						console.log(angle);
					}}
				/>
				<Label class="mt-3">Duration</Label>
				<Range
					bind:value={speed}
					min="1"
					max="20"
					on:change={() => {
						console.log(speed);
					}}
				/>
			</div>
		</div>
		<div class="output h-96 m-8 aspect-square" style={bgGradient + gradientSpeed} />
	</div>
	<div class="dark:bg-white bg-gray-900 dark:text-black text-white w-3/4 h-62 overflow-scroll mx-auto relative">
		<pre>
			{@html css}
		</pre>
		<button class="text-[#2F4550] bg-[#B8DBD9] rounded-full px-2 rounded-lg absolute top-2 right-4" on:click={copyFunction}>
			Copy Code
		</button>
	</div>

	<!-- example with the default display and a custom Input component -->
	<!-- example with the ChromeVariant -->
	<!-- <ColorPicker bind:rgb components={ChromeVariant} isRight /> -->
</section>

<style>
	.output {
		background-size: 400% 400%;
		animation: gradient ease infinite;
		animation-duration: 15s;
	}

	@keyframes gradient {
		0% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
		100% {
			background-position: 0% 50%;
		}
	}

	.color-picker {
		display: flex;
		align-items: center;
	}

	
</style>
