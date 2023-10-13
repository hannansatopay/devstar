<script>
	import { Label, Input, Range } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import { P } from 'flowbite-svelte';
	import { tools } from '../../tools';
	// import ColorPalette from './components/ColorPalette.svelte';
	const title = tools['living-background-generator'].name;
	const description = tools['living-background-generator'].description;

	let clrList = ['#fff', '#000', '#f00'];

	$: clrStyle = clrList.map((x) => {
		return `background: ${x};`;
	});

	console.log(clrStyle);

	const pushArr = () => {
		clrList = [...clrList, clrVal3];
	};

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

    let clrVal3 = '';


	function updateColorDisplay() {
		const selectedColor = colorInput.value;
		const alphaValue = alphaSlider.value;
		colorDisplay.style.backgroundColor = selectedColor;
		colorDisplay.style.opacity = alphaValue;
	}
	// Set the initial color
</script>

<section class="" bind:this={root}>
	<Intro heading={title} {description} />
	<div class="grid grid-cols-2 content-center">
		<div>
			<div class="color-div mx-auto w-fit flex">
				{#each [...clrStyle] as clr}
					<div class="aspect-square h-[50px] mx-4" style={clr} />
				{/each}
			</div>

			<div class="color-picker">
				<input type="color" id="color-input" bind:value={clrVal3} on:input={updateColorDisplay}/>
				<!-- <input
					type="range"
					id="alpha-slider"
					min="0"
					max="1"
					step="0.01"
					value="1"
					on:input={updateColorDisplay}
				/> -->
				<div id="color-display" />
			</div>

			<div class="my-8 w-fit mx-auto">
				<button class="text-white border-2 border-yellow p-4 rounded-lg" on:click={pushArr}>
					Add Color
				</button>
			</div>

			<Label class="mt-3">Angle</Label>
			<Range
				bind:value={angle}
				min="0"
				max="360"
				on:change={() => {
					console.log(angle);
				}}
			/>
			<Label class="mt-3">Speed</Label>
			<Range
				bind:value={speed}
				min="1"
				max="20"
				on:change={() => {
					console.log(speed);
				}}
			/>
		</div>
		<div class="output h-96 m-8 aspect-square" style={bgGradient + gradientSpeed} />
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

	#color-input {
		margin-right: 10px;
	}

	#color-display {
		width: 30px;
		height: 30px;
		border: 1px solid #000;
	}
</style>
