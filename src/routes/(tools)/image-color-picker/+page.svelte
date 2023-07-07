<script lang="ts">
	import { onMount } from 'svelte';
	import { Label } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';

	export let data;

	let fileInput;
	let canvas: HTMLCanvasElement;
	let colors = [];

	function drawImageOnCanvas(file) {
		const ctx = canvas.getContext('2d');
		canvas.width = canvas.offsetWidth;
    	canvas.height = canvas.offsetHeight;

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
			// Calculate the dimensions to fit the image within the container
			var container = document.getElementById('container');
			// Calculate the dimensions to fit the image within the container
			var maxWidth = container.offsetWidth;
			var imageWidth = img.width;
			var imageHeight = img.height;
			var scaleFactor = maxWidth / imageWidth;
			var canvasWidth = imageWidth * scaleFactor;
			var canvasHeight = imageHeight * scaleFactor;

			// Set the canvas size and draw the image
			canvas.width = canvasWidth;
			canvas.height = canvasHeight;

			// Update the container's height
			container.style.height = canvasHeight + 'px';
			ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
			getDominantColors();
		};
	}

	function getDominantColors() {
		const ctx = canvas.getContext('2d');
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const rgbArray = buildRgb(imageData.data);
		colors = quantization(rgbArray, 0).map(rgbToHex);
	}

	function buildRgb(imageData) {
		const rgbValues = new Array(Math.floor(imageData.length / 4));

		for (let i = 0, j = 0; i < imageData.length; i += 4, j++) {
			rgbValues[j] = {
				r: imageData[i],
				g: imageData[i + 1],
				b: imageData[i + 2],
			};
		}

		return rgbValues;
	}

	function findBiggestColorRange(rgbValues) {
		let rMin = Number.MAX_VALUE;
		let gMin = Number.MAX_VALUE;
		let bMin = Number.MAX_VALUE;
		let rMax = Number.MIN_VALUE;
		let gMax = Number.MIN_VALUE;
		let bMax = Number.MIN_VALUE;

		for (let i = 0; i < rgbValues.length; i++) {
			const pixel = rgbValues[i];
			rMin = Math.min(rMin, pixel.r);
			gMin = Math.min(gMin, pixel.g);
			bMin = Math.min(bMin, pixel.b);
			rMax = Math.max(rMax, pixel.r);
			gMax = Math.max(gMax, pixel.g);
			bMax = Math.max(bMax, pixel.b);
		}

		const rRange = rMax - rMin;
		const gRange = gMax - gMin;
		const bRange = bMax - bMin;

		if (rRange >= gRange && rRange >= bRange) {
			return 'r';
		} else if (gRange >= rRange && gRange >= bRange) {
			return 'g';
		} else {
			return 'b';
		}
	}

	function quantization(rgbValues, depth) {
		const MAX_DEPTH = 2;

		if (depth === MAX_DEPTH || rgbValues.length === 0) {
			const color = rgbValues.reduce(
			(prev, curr) => {
				prev.r += curr.r;
				prev.g += curr.g;
				prev.b += curr.b;
				return prev;
			},
			{ r: 0, g: 0, b: 0 }
			);

			const count = rgbValues.length || 1;
			color.r = Math.round(color.r / count);
			color.g = Math.round(color.g / count);
			color.b = Math.round(color.b / count);
			return [color];
		}

		const componentToSortBy = findBiggestColorRange(rgbValues);
		rgbValues.sort((p1, p2) => p1[componentToSortBy] - p2[componentToSortBy]);

		const mid = Math.floor(rgbValues.length / 2);
		return [
			...quantization(rgbValues.slice(0, mid), depth + 1),
			...quantization(rgbValues.slice(mid), depth + 1),
		];
	}

	function rgbToHex(rgb) {
		// Separate the RGB components
		var r = rgb.r;
		var g = rgb.g;
		var b = rgb.b;

		// Convert each component to a hexadecimal string
		var rHex = r.toString(16).padStart(2, '0');
		var gHex = g.toString(16).padStart(2, '0');
		var bHex = b.toString(16).padStart(2, '0');

		// Combine the hexadecimal values
		var hex = '#' + rHex + gHex + bHex;

		return hex;
	}

	function getContrastColor(hexColor) {
		// Remove the leading '#' if present
		hexColor = hexColor.replace('#', '');

		// Convert the hex color to RGB
		var r = parseInt(hexColor.substr(0, 2), 16);
		var g = parseInt(hexColor.substr(2, 2), 16);
		var b = parseInt(hexColor.substr(4, 2), 16);

		// Calculate the relative luminance of the color
		var relativeLuminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

		// Determine the contrast color based on the relative luminance
		var contrastColor = relativeLuminance > 0.5 ? '#000000' : '#ffffff';

		return contrastColor;
	}

	function copy(e, text) {
		e.target.innerText = 'Copied';
		const element = document.createElement('textarea');
		element.value = text;
		document.body.appendChild(element);
		element.select();
		document.execCommand('copy');
		document.body.removeChild(element);
		setTimeout(() => {
			e.target.innerText = text;
		}, 1000);
	}

	function handleFileUpload(event) {
		const file = event.target.files[0];
		drawImageOnCanvas(file);
	}

	onMount(() => {
		drawImageOnCanvas('/quino-al-J1_1YigSUPA-unsplash.jpg');
	});
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-12 overflow-hidden rounded-lg">
			<div class="p-8 col-span-5 flex h-full flex-col justify-between">
				<div>
					<Label class="mb-1">Palette</Label>
					<div class="flex">
						<div class="palette flex w-full h-10 rounded-lg overflow-hidden">
							{#each colors as color}
								<div on:click={(event)=>copy(event,color)} class="cursor-pointer relative flex flex-grow items-center justify-center" style="color:{getContrastColor(color)}; background: {color};">{color}</div>
							{/each}
						</div>
					</div>
				</div>

				<button on:click={()=>fileInput.click()} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Browse image</button>
				<input type="file" class="hidden" accept="image/*" bind:this={fileInput} on:change={handleFileUpload}>
			</div>
			<div class="p-8 h-full flex rounded-lg relative justify-center items-center col-span-7 bg-gray-100">
				<div class="canvas-container w-full" id="container">
					<canvas bind:this={canvas} class="canvas"/>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.canvas-container {
      position: relative;
    }

    .canvas {
      position: absolute;
      top: 0;
      left: 0;
    }

	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
</style>
