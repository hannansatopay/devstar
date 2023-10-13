<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import { Label, Input, Range, Radio, Checkbox } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { tools } from '../../tools';
	import Copy from '$lib/Copy.svelte';

	export let data;
	let innerWidth: any = null;
	let innerHeight: any = null;
	let screenWidth: any = null;
	let screenHeight: any = null;
	let css = '';

	onMount(() => {
		screenWidth = screen.width;
		screenHeight = screen.height;
	});

	let clrList = ['#833ab4', '#fd1d1d', '#fcb045'];

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

	let speed = 5;

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

<Intro heading={data.meta.title} description={data.meta.description} />

<svelte:window bind:innerWidth bind:innerHeight />

<section class="bg-white dark:bg-gray-900">
	<br />
	<hr />

	<div
		class="color-div py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-12 items-center content-center"
	>
		<!-- the color div part -->
		<div class="sm:grid sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-11 justify-items-center">
			<!-- <div class="w-2 m-2 p-6 bg-purple-800 border border-gray-200" /> -->
			{#each [...clrStyle] as clr}
				<div class="aspect-square h-[50px] mx-4 w-2 m-2 p-6 border border-gray-200" style={clr} />
			{/each}
		</div>

		<br />

		<!-- Color Palette part -->
		<div
			class="card gap-16 m-4 items-center mx-auto max-w-screen-xl md:grid md:grid-cols-2 overflow-hidden rounded-lg"
		>
			<div class="p-8">
				<Label class="mt-3">COLOR PALETTE</Label>
				<br />
				<Label class="mt-3">Choose color from the Box.</Label>
				<div class="color-picker">
					<input type="color" id="color-input" bind:value={clrVal3} on:input={updateColorDisplay} />
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

				<div class="my-8">
					<button class="m-4 w-40 p-4 rounded-lg" on:click={pushArr}>
						Add color
					</button>
                    <br>
                    <button class="m-4 w-40 p-4 rounded-lg">
						Random
					</button>
                    <br>
                    <button class="m-4 w-40 p-4 rounded-lg">
						Choose the type of Gradient
					</button>
				</div>

				<Label class="mt-3">ANGLE</Label>
				<Range
					bind:value={angle}
					min="0"
					max="360"
					on:change={() => {
						console.log(angle);
					}}
				/>
                <br>
				<Label class="mt-3">SPEED</Label>
				<Range
					bind:value={speed}
					min="1"
					max="20"
					on:change={() => {
						console.log(speed);
					}}
				/>
			</div>

			<div class="p-8 h-full flex rounded-lg relative output" style={bgGradient + gradientSpeed} />
		</div>
		<br />

		<!-- the text area part -->
		<div
			class="card m-4 items-center mx-auto max-w-screen-xl lg:grid md:max-h-96 overflow-hidden rounded-lg"
		>
			<div class="p-8 box rounded-lg md:max-h-96 relative bg-gray-100"><Copy text={css} /></div>
		</div>
	</div>
</section>

<style>
    button{
        background-color: #B8DBD9;
        color: #2F4550;
    }
	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
	.h-full {
		min-height: 300px;
		/*background: rgb(116, 0, 211);
		background: linear-gradient(
			90deg,
			rgba(116, 0, 211, 1) 0%,
			rgba(171, 0, 130, 1) 33.33%,
			rgba(213, 92, 0, 1) 66.33%,
			rgba(255, 231, 0, 1) 100%
		);*/
	}
	.box {
		height: 300px;
	}

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
</style>
