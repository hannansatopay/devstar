<script lang="ts">
  	import { Label, Input, Range } from 'flowbite-svelte';

	import Intro from '$lib/Intro.svelte';
	import Copy from '$lib/Copy.svelte';

	export let data;

	// defaults
	let background = '#e0e0e0';
	let size = 250;
	let radius = 50;
	let distance = 20;
	let intensity = 0.15;
	let blur = 60;

	function colorLuminance(hex: string, lum: number): string {
		hex = String(hex).replace(/[^0-9a-f]/gi, '');
		if (hex.length < 6) {
			hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
		}
		lum = lum || 0;

		const rgb = `#${hex.match(/.{2}/g)?.map(component => {
			let c = parseInt(component, 16);
			c = Math.round(Math.min(Math.max(0, c + c * lum), 255));
			return c.toString(16).padStart(2, '0');
		}).join('')}`;

		return rgb;
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
				<Input type="color" bind:value={background} class="p-1"/>

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
				<Copy text={`border-radius: ${radius}px;\nbackground: ${background};\nbox-shadow: ${distance}px ${distance}px ${blur}px ${colorLuminance( background, intensity * -1 )}, -${distance}px -${distance}px ${blur}px ${colorLuminance( background, intensity )};`}/>
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
