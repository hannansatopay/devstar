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
	$: gradientSpeed = `animation-duration: ${speed}s;`;

	const pushArr = () => {
		clrList.length < 6 ? (clrList = [...clrList, clrVal3]) : alert('Too many colors');
	};

	const removeOnClick = (e) => {
		clrList = clrList.filter((x, y) => x !== e.target.id);
		console.log(e.target.id);
	};

	$: clrStyle = clrList.map((x) => {
		return `background: ${x};`;
	});

	$: bgGradient =
		clrList.length > 1
			? `background-image: linear-gradient(${angle}deg, ${clrList.join(', ')});`
			: `background-color: ${clrList};`;

			let gradientType: 'linear' | 'angular' | 'radial' = 'linear';

const setGradientType = (type) => {
	gradientType = type;
};


    // let angle = 270;

    // let speed = 7;

    // $: gradientSpeed = `animation-duration: ${speed}s;`;

    // let colorInput;
    // let alphaSlider;
    // let colorDisplay;

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

	// Define reactive variables to check the currently selected gradient type
	$: isLinear = gradientType === 'linear';
	$: isAngular = gradientType === 'angular';
	$: isRadial = gradientType === 'radial';

	let output;

let isPaused = false;

$: if (output) {
	if (gradientType === 'linear') {
		isPaused = true;
		if (clrList.length > 1) {
			output.style.setProperty(
				'background-image',
				`linear-gradient(${angle}deg, ${clrList.join(', ')})`
			);
			output.style.setProperty('background-size', `400% 400%`);
		} else {
			bgGradient = `background-color: ${clrList};`;
		}
	} else if (gradientType === 'angular') {
		if (clrList.length > 1) {
			isPaused = false;

			output.style.setProperty(
				'background-image',
				`conic-gradient(from var(--angle), ${clrList.join(', ')})`
			);
			output.style.setProperty('background-size', `100% 100%`);

			let angle = 0;

			setInterval(() => {
				angle += 1;
				angle %= 360;
				output.style.setProperty('--angle', `${angle}deg`);
			}, 10);
		} else {
			bgGradient = `background-color: ${clrList};`;
		}
	} else {
		isPaused = true;
		if (clrList.length > 1) {
			output.style.setProperty(
				'background-image',
				`radial-gradient(ellipse var(--zoom) var(--zoom) at center, ${clrList.join(', ')})`
			);

			let zoom = 0;
			let threshold = false

			setInterval(() => {
				if(!threshold) {
					zoom += 1;
					if(zoom === 360) threshold = true
				}
				else {
					zoom -= 1;
					if(zoom === 0) threshold = false
				}
				
				output.style.setProperty('--zoom', `${zoom}%`);
			}, 10);
		} else {
			bgGradient = `background-color: ${clrList};`;
		}
	}
}

	// Define a reactive variable for the generated CSS code
	$: {
		if (gradientType === 'linear') {
			css = `
          .animated-background {
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
          .animated-background {
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
		} else if (gradientType === 'radial') {
			css = `
          .animated-background {
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
		}
	}

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
						id={`${clrList[i]}`}
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
							class="w-40 p-4 rounded-lg transition-transform transform hover:scale-105"
							class:opacity-50={!isLinear}
							class:glow={isLinear}
							on:click={() => setGradientType('linear')}
						>
							Linear Gradient
						</button>
						<button
							class="w-40 p-4 rounded-lg transition-transform transform hover:scale-105"
							class:opacity-50={!isAngular}
							class:glow={isAngular}
							on:click={() => setGradientType('angular')}
						>
							Angular Gradient
						</button>
						<button
							class="w-40 p-4 rounded-lg transition-transform transform hover:scale-105"
							class:opacity-50={!isRadial}
							class:glow={isRadial}
							on:click={() => setGradientType('radial')}
						>
							Radial Gradient
						</button>
					</div>
				</div>

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
				<Label class="mt-3">DURATION&nbsp;&nbsp;&nbsp;{speed}s</Label>
				<Range
					bind:value={speed}
					min="1"
					max="20"
					on:change={() => {
						console.log(speed);
					}}
				/>
			</div>

			<div
				class="p-8 h-full flex rounded-lg relative output"
				id="output"
				bind:this={output}
				style={gradientSpeed}
			/>
		</div>
		<br />

		<!-- The text area part -->
		<div
			class="card m-4 p-1 bg-gray-100 items-center mx-auto max-w-screen-xl lg:grid rounded-lg relative"
		>
			<pre class="whitespace-pre-line p-4">{@html css}</pre>
			<Copy text={css} on:click={copyFunction} />
		</div>
	</div>
</section>

<style>
	/* Add a hover effect to your buttons */
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

	#output {
		--angle: 0deg;
		--zoom: 1;
	}

	/* Define animations for different gradient types */
	.output {
		background-size: 400% 400%;
		animation: gradient 15s ease infinite;
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
</style>
