<script>
	import { writable } from "svelte/store";
  
	const patternTypes = [
	  "Circle",
	  "Square",
	  "Triangle",
	  "Ring",
	  "HalfCircle",
	  "Minus",
	  "Dots",
	];
  
	let selectedPatternType = patternTypes[0];
	let patternColor = "#47d3ff";
	let backgroundColor = "#0e0606";
  
	let size = 32;
	let spacing = 30;
	let rotation = 0;
	let skew = 0;
	let opacity = 1;
  
	const resetSettings = () => {
	  size = 32;
	  spacing = 30;
	  rotation = 0;
	  skew = 0;
	  opacity = 1;
	};
  </script>
  
  <div
	class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg"
  ></div>
  
  <main class="container mx-auto p-4">
	<div class="flex flex-col space-y-4">
	  <div>
		<label for="patternType" class="font-bold dark:text-white"
		  >Pattern Type</label
		>
		<select
		  id="patternType"
		  bind:value={selectedPatternType}
		  class="w-full mt-1 p-2 border rounded font-bold dark:bg-[#6c778b] dark:text-[#e5e5e5]"
		>
		  {#each patternTypes as type}
			<option value={type}>{type}</option>
		  {/each}
		</select>
	  </div>
  
	  <div class="flex space-x-4">
		<div class="block">
		  <label for="patternColor" class="font-bold dark:text-white"
			>Pattern Color</label
		  >
		  <br />
		  <div class="flex gap-2">
			<input
			  type="color"
			  bind:value={patternColor}
			  class="flex self-center mt-1 dark:bg-[#6c778b]"
			/>
			<input
			  type="text"
			  bind:value={patternColor}
			  class="w-1/2 mt-1 p-1 border rounded dark:bg-[#6c778b] dark:text-[#e5e5e5]"
			/>
		  </div>
		</div>
		<div>
		  <div class="block">
			<label for="backgroundColor" class="font-bold dark:text-white"
			  >Background Color</label
			>
			<br />
			<div class="flex gap-2">
			  <input
				type="color"
				id="backgroundColor"
				bind:value={backgroundColor}
				class="flex self-center mt-1 dark:bg-[#6c778b]"
			  />
			  <input
				type="text"
				bind:value={backgroundColor}
				class="w-1/2 mt-1 p-1 border rounded dark:bg-[#6c778b] dark:text-[#e5e5e5]"
			  />
			</div>
		  </div>
		</div>
	  </div>
  
	  <div class="flex items-center justify-between">
		<h2 class="font-bold dark:text-white">Pattern Settings</h2>
		<button
		  on:click={resetSettings}
		  class="bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400 font-bold"
		  >Reset</button
		>
	  </div>
  
	  <div class="flex flex-col space-y-2">
		<div>
		  <label for="size" class="font-bold dark:text-white"
			>Size: {size}px</label
		  >
		  <input
			type="range"
			id="size"
			min="1"
			max="100"
			bind:value={size}
			class="w-full"
		  />
		</div>
		<div>
		  <label for="spacing" class="font-bold dark:text-white"
			>Spacing: {spacing}px</label
		  >
		  <input
			type="range"
			id="spacing"
			min="1"
			max="100"
			bind:value={spacing}
			class="w-full"
		  />
		</div>
		<div>
		  <label for="rotation" class="font-bold dark:text-white"
			>Rotation: {rotation}deg</label
		  >
		  <input
			type="range"
			id="rotation"
			min="0"
			max="360"
			bind:value={rotation}
			class="w-full"
		  />
		</div>
		<div>
		  <label for="skew" class="font-bold dark:text-white"
			>Skew: {skew}deg</label
		  >
		  <input
			type="range"
			id="skew"
			min="0"
			max="360"
			bind:value={skew}
			class="w-full"
		  />
		</div>
		<div>
		  <label for="opacity" class="font-bold dark:text-white"
			>Pattern Opacity: {opacity}</label
		  >
		  <input
			type="range"
			id="opacity"
			min="0"
			max="1"
			step="0.1"
			bind:value={opacity}
			class="w-full"
		  />
		</div>
	  </div>
	</div>
  
	<div
	  class="pattern-container mt-4"
	  style="background-color: {backgroundColor};display: grid; grid-template-columns: repeat(auto-fill, minmax({size +
		spacing}px, 1fr)); gap: {spacing}px;"
	>
	  {#each Array(96) as _, i}
		<div
		  class="pattern {selectedPatternType}"
		  style="
				 --patternColor: {patternColor};
				 --opacity: {opacity};
				 --rotation: {rotation}deg;
				 --skew: {skew}deg;
				 --size: {size}px;
				 --spacing: {spacing}px;"
		></div>
	  {/each}
	</div>
  </main>
  
  <style>
	.pattern-container {
	  overflow: hidden;
	}
  
	.pattern {
	  opacity: var(--opacity);
	  transform: rotate(var(--rotation)) skew(var(--skew));
	}
  
	.Circle,
	.Square {
	  background-color: var(--patternColor);
	  width: var(--size);
	  height: var(--size);
	}
  
	.Circle {
	  border-radius: 50%;
	}
  
	.Square {
	  background-color: var(--patternColor);
	}
  
	.Triangle {
	  width: 0;
	  height: 0;
	  border-left: calc(var(--size) / 2) solid transparent;
	  border-right: calc(var(--size) / 2) solid transparent;
	  border-bottom: var(--size) solid var(--patternColor);
	}
  
	.Ring {
	  width: var(--size);
	  height: var(--size);
	  border: calc(var(--size) / 5) solid var(--patternColor);
	  border-radius: 50%;
	  background: transparent;
	}
  
	.HalfCircle {
	  width: var(--size);
	  height: calc(var(--size) / 2);
	  background-color: var(--patternColor);
	  border-radius: calc(var(--size) / 2) calc(var(--size) / 2) 0 0;
	}
  
	.Minus {
	  width: var(--size);
	  height: 2px;
	  background-color: var(--patternColor);
	}
  
	.Dots {
	  background-color: var(--patternColor);
	  width: var(--size);
	  height: var(--size);
	  border-radius: 75%;
	  box-shadow:
		calc(var(--size) + var(--spacing)) 0 0 0 var(--patternColor),
		0 calc(var(--size) + var(--spacing)) 0 0 var(--patternColor),
		calc(var(--size) + var(--spacing)) calc(var(--size) + var(--spacing)) 0 0
		  var(--patternColor);
	}
  </style>  