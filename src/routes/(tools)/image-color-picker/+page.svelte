<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Label, Input, Range } from 'flowbite-svelte';
	import { Tooltip, Button } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	import { Fileupload } from 'flowbite-svelte';

	export let data;

	let canvas: HTMLCanvasElement;

	let colors = [];
	let numberofColors = 5;

	function drawImageOnCanvas(file) {
		const ctx = canvas.getContext('2d');

		// Create new image element
		const img = new Image();

		// Set image source to the uploaded file
		if (typeof file === 'string') {
			img.src = file;
		} else {
			img.src = URL.createObjectURL(file);
		}

		// When image is loaded, draw it on the canvas
		img.onload = function () {
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0);
			getDominantColors();
		};
	}

	function handleFileUpload(event) {
		const file = event.target.files[0];
		drawImageOnCanvas(file);
	}

	onMount(() => {
		drawImageOnCanvas('/office-long-1.png');
	});

	function updateColors(type) {
		numberofColors = numberofColors + type;
		getDominantColors();
	}

	function getDominantColors() {
		// Get the image data
		const imageData = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);

		const rgbArray = buildRgb(imageData.data);

		/**
		 * Color quantization
		 * A process that reduces the number of colors used in an image
		 * while trying to visually maintin the original image as much as possible
		 */
		const quantColors = quantization(rgbArray, 0);

		console.log(quantColors);

		colors = quantColors;

		// // Loop through the pixels and count each color
		// const colorCounts = {};
		// const pixels = imageData.data;
		// for (let i = 0; i < pixels.length; i += 4) {
		// 	const r = pixels[i];
		// 	const g = pixels[i + 1];
		// 	const b = pixels[i + 2];
		// 	const rgb = `${r},${g},${b}`;
		// 	if (rgb in colorCounts) {
		// 		colorCounts[rgb]++;
		// 	} else {
		// 		colorCounts[rgb] = 1;
		// 	}
		// }

		// // Sort the colors by count in descending order
		// const sortedColors = Object.keys(colorCounts).sort((a, b) => colorCounts[b] - colorCounts[a]);

		// // Return the top numColors colors
		// const dominantColors = [];
		// for (let i = 0; i < numberofColors && i < sortedColors.length; i++) {
		// 	const [r, g, b] = sortedColors[i].split(',').map(Number);
		// 	dominantColors.push({ r, g, b });
		// }
		// colors = dominantColors;
	}

	const buildRgb = (imageData) => {
  const rgbValues = [];
  // note that we are loopin every 4!
  // for every Red, Green, Blue and Alpha
  for (let i = 0; i < imageData.length; i += 4) {
    const rgb = {
      r: imageData[i],
      g: imageData[i + 1],
      b: imageData[i + 2],
    };

    rgbValues.push(rgb);
  }

  return rgbValues;
};

// returns what color channel has the biggest difference
const findBiggestColorRange = (rgbValues) => {
  /**
   * Min is initialized to the maximum value posible
   * from there we procced to find the minimum value for that color channel
   *
   * Max is initialized to the minimum value posible
   * from there we procced to fin the maximum value for that color channel
   */
  let rMin = Number.MAX_VALUE;
  let gMin = Number.MAX_VALUE;
  let bMin = Number.MAX_VALUE;

  let rMax = Number.MIN_VALUE;
  let gMax = Number.MIN_VALUE;
  let bMax = Number.MIN_VALUE;

  rgbValues.forEach((pixel) => {
    rMin = Math.min(rMin, pixel.r);
    gMin = Math.min(gMin, pixel.g);
    bMin = Math.min(bMin, pixel.b);

    rMax = Math.max(rMax, pixel.r);
    gMax = Math.max(gMax, pixel.g);
    bMax = Math.max(bMax, pixel.b);
  });

  const rRange = rMax - rMin;
  const gRange = gMax - gMin;
  const bRange = bMax - bMin;

  // determine which color has the biggest difference
  const biggestRange = Math.max(rRange, gRange, bRange);
  if (biggestRange === rRange) {
    return "r";
  } else if (biggestRange === gRange) {
    return "g";
  } else {
    return "b";
  }
};

/**
 * Median cut implementation
 * can be found here -> https://en.wikipedia.org/wiki/Median_cut
 */
const quantization = (rgbValues, depth) => {
  const MAX_DEPTH = 2;

  // Base case
  if (depth === MAX_DEPTH || rgbValues.length === 0) {
    const color = rgbValues.reduce(
      (prev, curr) => {
        prev.r += curr.r;
        prev.g += curr.g;
        prev.b += curr.b;

        return prev;
      },
      {
        r: 0,
        g: 0,
        b: 0,
      }
    );

    color.r = Math.round(color.r / rgbValues.length);
    color.g = Math.round(color.g / rgbValues.length);
    color.b = Math.round(color.b / rgbValues.length);

    return [color];
  }

  /**
   *  Recursively do the following:
   *  1. Find the pixel channel (red,green or blue) with biggest difference/range
   *  2. Order by this channel
   *  3. Divide in half the rgb colors list
   *  4. Repeat process again, until desired depth or base case
   */
  const componentToSortBy = findBiggestColorRange(rgbValues);
  rgbValues.sort((p1, p2) => {
    return p1[componentToSortBy] - p2[componentToSortBy];
  });

  const mid = rgbValues.length / 2;
  return [
    ...quantization(rgbValues.slice(0, mid), depth + 1),
    ...quantization(rgbValues.slice(mid + 1), depth + 1),
  ];
};
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div
			class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg"
		>
			<div class="p-8">
				<Label>Palette</Label>
				<div class="flex">
					<Button on:click={() => updateColors(-1)}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-5 h-5 mr-2 text-purple-500 dark:text-green-500"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
							/></svg
						>
					</Button>
					<div class="palette flex w-full">
						{#each colors as color}
							<div
								style="background: rgb({color.r},{color.g},{color.b}); cursor: pointer;height: 100%;position: relative;flex-grow: 1;"
							/>
						{/each}
					</div>
					<Button on:click={() => updateColors(1)}>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="w-5 h-5 mr-2 text-purple-500 dark:text-green-500"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
							/></svg
						>
					</Button>
				</div>

				<Fileupload on:change={handleFileUpload} />
			</div>
			<div class="p-8 h-full flex rounded-lg relative justify-center items-center">
				<canvas bind:this={canvas} />
			</div>
		</div>
	</div>
</section>

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<h2
			class="mb-4 text-2xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white"
		>
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
