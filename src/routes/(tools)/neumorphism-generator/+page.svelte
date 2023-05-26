<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Label, Input, Range } from 'flowbite-svelte';
	import { Tooltip, Button } from 'flowbite-svelte';

	export let data;

	// defaults
	let background = '#e0e0e0';
	let size = 250;
	let radius = 50;
	let distance = 20;
	let intensity = 0.15;
	let blur = 60;

	function colorLuminance(hex: string | any[], lum: number) {
		// validate hex string
		hex = String(hex).replace(/[^0-9a-f]/gi, '');
		if (hex.length < 6) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		}
		lum = lum || 0;

		// convert to decimal and change luminosity
		let rgb = '#',
			c,
			i;
		for (i = 0; i < 3; i++) {
			c = parseInt(hex.substr(i * 2, 2), 16);
			c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16);
			rgb += ('00' + c).substr(c.length);
		}

		return rgb;
	}

	function copyStyle(e: any) {
		e.target.innerText = 'Copied';
		const element = document.createElement('textarea');
		element.value = `border-radius: ${radius}px;\nbackground: ${background};\nbox-shadow: ${distance}px ${distance}px ${blur}px ${colorLuminance( background, intensity * -1 )}, -${distance}px -${distance}px ${blur}px ${colorLuminance( background, intensity )};`;
		document.body.appendChild(element);
		element.select();
		document.execCommand('copy');
		document.body.removeChild(element);
		setTimeout(()=>{
			e.target.innerText = 'Copy';
		}, 1000);
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div
			class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg"
		>
			<div class="p-8">
				<Label>Color</Label>
				<Input type="color" bind:value={background} />

				<Label class="mt-3">Size</Label>
				<Range bind:value={size} min="50" max="250" />

				<Label class="mt-3">Radius</Label>
				<Range bind:value={radius} />

				<Label class="mt-3">Distance</Label>
				<Range bind:value={distance} min="5" max="50" />

				<Label class="mt-3">Intensity</Label>
				<Range bind:value={intensity} min="0.01" max="0.6" step="0.01" />

				<Label class="mt-3">Blur</Label>
				<Range bind:value={blur} min="0" max="100" />
			</div>
			<div class="p-8 h-full flex rounded-lg relative" style="background: {background};">
				<div
					class="bg-green-100 dark:bg-green-200 text-green-700 dark:text-green-800 rounded-lg py-1 px-2 text-sm font-medium absolute top-4 right-4 cursor-pointer"
					on:click={copyStyle}
				>
					Copy
				</div>
				<div
					class="box m-auto"
					style="background: {background}; box-shadow: {distance}px {distance}px {blur}px {colorLuminance(
						background,
						intensity * -1
					)}, -{distance}px -{distance}px {blur}px {colorLuminance(
						background,
						intensity
					)}; width: {size}px; height: {size}px; border-radius: {radius}px;"
				/>
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
