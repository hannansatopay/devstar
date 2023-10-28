<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import { Label, Range } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import Copy from '$lib/Copy.svelte';

	export let data;

	let colorInput: HTMLInputElement;
	let alphaSlider: HTMLInputElement;
	let colorDisplay: HTMLElement;
	let css = '';

	onMount(() => {
		colorInput = document.getElementById('color-input') as HTMLInputElement;
		alphaSlider = document.getElementById('alpha-slider') as HTMLInputElement;
		colorDisplay = document.getElementById('color-display') as HTMLElement;
	});

	let clrList = ['#000000', '#bb2d6f', '#fd9d1d', '#fcf437'];
	let clrVal3 = '#70DD33';
	let angle = 90;
	let speed = 7;
	let myBtn;
	let output: HTMLElement;

	$: gradientSpeed = `animation-duration: ${speed}s;`;

	// Define reactive variables to check the currently selected gradient type
	let isLinear = true;
	let isAngular = false;
	let isRadial = false;

	const pushArr = () => {
		clrList.length < 6 ? (clrList = [...clrList, clrVal3]) : alert('Too many colors');
	};

	const removeOnClick = (e) => {
		clrList.splice(Number(e.target.id), 1);
		clrList = clrList;
	};

	$: clrStyle = clrList.map((x) => {
		return `background: ${x};`;
	});

	let gradientType: 'linear' | 'angular' | 'radial' = 'linear';

	const setGradientType = (type) => {
		gradientType = type;

		if (type === 'linear') {
			isLinear = true;
			isAngular = false;
			isRadial = false;
		} else if (type === 'angular') {
			isLinear = false;
			isAngular = true;
			isRadial = false;
		} else if (type === 'radial') {
			isLinear = false;
			isAngular = false;
			isRadial = true;
		}
	};

	$: if (output) {
		if (gradientType === 'linear') {
			if (clrList.length > 1) {
				output.style.setProperty(
					'background-image',
					`linear-gradient(${angle}deg, ${clrList.join(', ')})`
				);
				output.style.setProperty('background-size', `400% 400%`);
				output.style.setProperty('animation-duration', `${speed}s`);
			} else {
				output.style.setProperty('background-image', `none`);
				output.style.setProperty('background-color', `${clrList}`);
			}
		} else if (gradientType === 'angular') {
			if (clrList.length > 1) {
				output.style.setProperty(
					'background-image',
					`conic-gradient(from var(--angle), ${clrList.join(', ')}`
				);

				output.style.setProperty('background-size', `100% 100%`);
				let angle = 0;

				const animateAngle = () => {
					angle += 1;
					angle %= 360;
					output.style.setProperty('--angle', `${angle}deg`);
					requestAnimationFrame(animateAngle);
				};

				requestAnimationFrame(animateAngle);
			} else {
				output.style.setProperty('background-image', `none`);
				output.style.setProperty('background-color', `${clrList}`);
			}
		} else {
			if (clrList.length > 1) {
				output.style.setProperty(
					'background-image',
					`radial-gradient(ellipse var(--zoom) var(--zoom) at center, ${clrList.join(', ')}`
				);

				output.style.setProperty('background-size', `100% 100%`);

				let zoom = 100;
				let zoomDirection = 1;

				const animateZoom = () => {
					if (zoom >= 200) {
						zoomDirection = -1;
					} else if (zoom <= 20) {
						zoomDirection = 1;
					}

					zoom += zoomDirection;
					output.style.setProperty('--zoom', `${zoom}%`);
					requestAnimationFrame(animateZoom);
				};

				requestAnimationFrame(animateZoom);
			} else {
				output.style.setProperty('background-image', `none`);
				output.style.setProperty('background-color', `${clrList}`);
			}
		}
	}

	$: bgGradient =
		gradientType === 'linear'
			? clrList.length > 1
				? `background-image: linear-gradient(${angle}deg, ${clrList.join(', ')});`
				: `background-color: ${clrList};`
			: gradientType === 'angular'
			? clrList.length > 1
				? `background-image: conic-gradient(from var(--angle), ${clrList.join(', ')});`
				: `background-color: ${clrList};`
			: gradientType === 'radial'
			? clrList.length > 1
				? `background-image: radial-gradient(ellipse var(--zoom) var(--zoom) at center, ${clrList.join(
						', '
				  )});`
				: `background-color: ${clrList};`
			: `background-color: ${clrList};`;

	const updateColorDisplay = () => {
		const selectedColor = colorInput.value;
		const alphaValue = alphaSlider.value;
		colorDisplay.style.backgroundColor = selectedColor;
		colorDisplay.style.opacity = alphaValue;
	};

	// Function for the Random button
	const changeGradient = () => {
		clrList = [getRandomColor(), getRandomColor(), getRandomColor(), getRandomColor()];
	};

	const getRandomColor = () => {
		const letters = '0123456789ABCDEF';
		let color = '#';
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	};

	// Define a reactive variable for the generated CSS code

	let html = `
		<div class="living-background" id="living-background">
			<h1>Living Background Generator</h1>
		</div>`;

	let js = '';

	$: {
		if (gradientType === 'linear') {
			css = `
          	.living-background {
			position: fixed;
			height: 100vh;
			widht: 100vw;
			z-index: -1;
            ${bgGradient}
            background-size: 400% 400%;
            animation: gradient ${speed}s ease infinite;
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

        `;
		} else if (gradientType === 'angular') {
			css = `
				.living-background {
					position: fixed;
					height: 100vh;
					widht: 100vw;
					z-index: -1;
					--angle: 0deg;
            		background-image: conic-gradient(from var(--angle), ${clrList.join(', ')});
					background-size: 100% 100%;
    			}`;

			js =
				`const livingBackground = document.getElementById('living-background');
				let angle = 0;

				const animateAngle = () => {
					angle += 1;
					angle %= 360;
				` +
				'livingBackground.style.setProperty(var(--angle), `${angle}deg`);' +
				`
					requestAnimationFrame(animateAngle);
				};
				
				requestAnimationFrame(animateAngle);`;
		} else if (gradientType === 'radial') {
			css = `
			.living-background {
					position: fixed;
					height: 100vh;
					widht: 100vw;
					z-index: -1;
					--zoom: 0%;
            		background-image: radial-gradient(ellipse var(--zoom) var(--zoom) at center, ${clrList.join(
									', '
								)};
					background-size: 100% 100%;
    		}`;

			js =
			`let zoom = 100;
			let zoomDirection = 1;

			const livingBackground = document.getElementById('living-background');

			const animateZoom = () => {
				if (zoom >= 200) {
					zoomDirection = -1;
				} else if (zoom <= 20) {
					zoomDirection = 1;
				}
				zoom += zoomDirection;
			
				` +
				'livingBackground.style.setProperty("--zoom", `${zoom}%`);' +
				`
			requestAnimationFrame(animateZoom);
			};

			requestAnimationFrame(animateZoom);
			`;
		}
	}

	// Output Tabs Logic

	let outputTab = 'CSS';

	const displayTab = (tab) => {
		outputTab = tab;
		console.log(tab);
	};

	// Function to copy the CSS code to the clipboard
	const copyFunction = () => {
		navigator.clipboard.writeText(css);
		alert('Copied the styles');
	};
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<br />
	<hr />

	<div
		class="color-div py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-12 items-center content-center"
	>
		<!-- The color div part -->

		<div
			class="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 2xl:grid-cols-14 gap-2 justify-center items-center"
		>
			{#each clrStyle as clr, i}
				<div class="relative rounded-lg w-20 h-20">
					<button
						class="absolute top-[-4px] right-0 rounded-full h-6 w-6 bg-[#B8DBD9] flex justify-center items-center"
						on:click={removeOnClick}
						bind:this={myBtn}
						id={`${i}`}
					>
						<svg
							class="cross w-[12px] h-[12px] text-gray-500"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 14 14"
						>
							<path
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
							/>
						</svg>
					</button>
					<div class="aspect-square h-[50px] mx-4" style={clr} />
				</div>
			{/each}
		</div>

		<br />

		<!-- Color Palette part -->
		<div
			class="card gap-16 m-4 items-center mx-auto max-w-screen-xl md:grid md:grid-cols-2 overflow-hidden rounded-lg"
		>
			<div class="p-8 text-center">
				<Label class="mt-3 text-2xl">COLOR PALETTE</Label>
				<br />
				<Label class="mt-3">Choose color from the box</Label>
				<br />
				<div class="color-picker">
					<input type="color" id="color-input" bind:value={clrVal3} on:input={updateColorDisplay} />
					<div id="color-display" />
				</div>

				<div class="my-8">
					<button class="m-4 w-40 p-4 rounded-lg" on:click={pushArr}><b>+</b> Add color </button>
					<br />
					<button class="m-4 w-40 p-4 rounded-lg" on:click={changeGradient}> Random Colors </button>
					<br />

					<!-- Add the gradient type buttons -->
					<div class="m-4 flex justify-center items-center space-x-4">
						<button
							class="w-30 p-4 rounded-lg transition-transform transform hover:scale-105"
							class:opacity-50={!isLinear}
							class:glow={isLinear}
							on:click={() => setGradientType('linear')}
						>
							Linear Gradient
						</button>
						<button
							class="w-30 p-4 rounded-lg transition-transform transform hover:scale-105"
							class:opacity-50={!isAngular}
							class:glow={isAngular}
							on:click={() => setGradientType('angular')}
						>
							Angular Gradient
						</button>
						<button
							class="w-30 p-4 rounded-lg transition-transform transform hover:scale-105"
							class:opacity-50={!isRadial}
							class:glow={isRadial}
							on:click={() => setGradientType('radial')}
						>
							Radial Gradient
						</button>
					</div>
				</div>
				<br />

				{#if isLinear}
					<!-- Angle input -->
					<Label class="mt-3">ANGLE&nbsp;&nbsp;&nbsp;{angle}°</Label>
					<Range
						bind:value={angle}
						min="0"
						max="360"
						on:change={() => {
							console.log(angle);
						}}
					/>
					<br />

					<!-- Duration input -->
					<Label class="mt-3">DURATION&nbsp;&nbsp;&nbsp;{speed}s</Label>
					<Range
						bind:value={speed}
						min="1"
						max="20"
						on:change={() => {
							console.log(speed);
						}}
					/>
				{/if}
			</div>

			<div class="p-8 h-full flex rounded-lg relative output" bind:this={output}>
				{#if gradientType === 'linear'}
					<div class="linear" />
				{/if}
				{#if gradientType === 'angular'}
					<div class="angular" />
				{/if}
				{#if gradientType === 'radial'}
					<div class="radial" />
				{/if}
			</div>
		</div>
		<br />

		<!-- The text area part -->
		<div
			class="card m-4 p-1 bg-gray-100 items-center mx-auto max-w-screen-xl lg:grid rounded-lg relative"
		>
			<div class="tab-buttons">
				<button on:click={() => displayTab('HTML')}>HTML</button>
				<button on:click={() => displayTab('CSS')}>CSS</button>
				<button on:click={() => displayTab('JS')}>JS</button>
			</div>
			<pre class="whitespace-pre-line p-4">
				{#if outputTab === 'HTML'}
					{html}
				{/if}
				{#if outputTab === 'CSS'}
					{css}
				{/if}
				{#if outputTab === 'JS'}
					{js}
				{/if}
			</pre>
			<Copy text={css} on:click={copyFunction} />
		</div>
	</div>
</section>

<style>
	/* Styles for output screen */
	.output {
		background-image: linear-gradient(90deg, #000000, #bb2d6f, #fd9d1d, #fcf437);
		animation: gradient 7s ease infinite;
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

	button {
		background-color: #2f4550;
		color: #b8dbd9;
		transition: background-color 0.3s ease;
		cursor: pointer;
	}

	:is(.dark button) {
		background-color: #b8dbd9;
		color: #2f4550;
		transition: background-color 0.3s ease;
		cursor: pointer;
	}

	button::after {
		background: rgba(0, 0, 0, 0);
		color: #b8dbd9;
		transition: all 0.3s ease;
	}

	:is(.dark button::after) {
		color: #2f4550;
		background-color: whitesmoke;
		transition: all 0.3s ease;
	}

	button:hover {
		color: #b8dbd9;
		background-color: black;
	}

	:is(.dark button:hover) {
		color: #2f4550;
		background-color: whitesmoke;
	}

	button:hover::after {
		background: rgba(184, 219, 217, 0.3);
	}

	:is(.dark button:hover::after) {
		color: #2f4550;
		background: whitesmoke;
	}

	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}

	.h-full {
		min-height: 300px;
	}

	.cross {
		pointer-events: none;
	}

	/* Add a class for glowing effect when selected */
	.glow {
		box-shadow: 0 0 20px rgb(47, 69, 80);
	}

	:is(.dark .glow) {
		box-shadow: 0 0 20px rgb(255, 255, 255);
	}

	@media only screen and (max-width: 700px) {
		pre,
		button {
			font-size: 2vh;
		}
	}

	.tab-buttons {
		/* position: absolute;
		top: 0;
		left: 0; */

		padding: 0.4rem;
	}

	.tab-buttons button {
		padding: 0.2rem;
		border-radius: 0.2rem;
		font-weight: bold;
		border: 1px solid black;
	}
</style>
