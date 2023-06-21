<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Label, Input, Range } from 'flowbite-svelte';
	import { Radio } from 'flowbite-svelte';
	import { Checkbox } from 'flowbite-svelte';

	export let data;

	import { Select } from 'flowbite-svelte';
	import { createEventDispatcher, onMount } from 'svelte';

const dispatch = createEventDispatcher();

let animationName = '';
let duration = 1;
let delay = 0;
let iterationCount = 1;
let timingFunction = 'linear';

let animatedElement;

function generateAnimation() {
  const animation = `
	@keyframes ${animationName} {
	  0% { opacity: 0; transform: translateY(50px); }
	  100% { opacity: 1; transform: translateY(0); }
	}

	.animated-element {
	  animation-name: ${animationName};
	  animation-duration: ${duration}s;
	  animation-delay: ${delay}s;
	  animation-iteration-count: ${iterationCount};
	  animation-timing-function: ${timingFunction};
	}
  `;

  dispatch('animationGenerated', { animation });
}

onMount(() => {
    const animatedElement = document.querySelector('.animated-element');

    const handleAnimationGenerated = (event) => {
      animatedElement.style.animation = event.detail.animation;
    };

    window.addEventListener('animationGenerated', handleAnimationGenerated);

    return () => {
      window.removeEventListener('animationGenerated', handleAnimationGenerated);
    };
  });



</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section>

	<div class="generator">
		<label for="animationName">Animation Name:</label>
		<input type="text" id="animationName" bind:value={animationName} />
	  
		<label for="duration">Duration (seconds):</label>
		<input type="number" id="duration" bind:value={duration} />
	  
		<label for="delay">Delay (seconds):</label>
		<input type="number" id="delay" bind:value={delay} />
	  
		<label for="iterationCount">Iteration Count:</label>
		<input type="number" id="iterationCount" bind:value={iterationCount} />
	  
		<label for="timingFunction">Timing Function:</label>
		<select id="timingFunction" bind:value={timingFunction}>
		  <option value="linear">Linear</option>
		  <option value="ease">Ease</option>
		  <option value="ease-in">Ease In</option>
		  <option value="ease-out">Ease Out</option>
		  <option value="ease-in-out">Ease In Out</option>
		</select>
	  
		<button on:click={generateAnimation}>Generate Animation</button>
	  </div>
	  
	  <div class="animated-element"></div>
	

	<!-- ends -->
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
	.generator {
		display: flex;
		flex-direction: flex-start;
		margin-bottom: 20px;
	}
	.generator input{
		margin-bottom: 10px;
	}
	.generator button{
		padding: 5px 10px;
		background-color: #007bff;
    color: #fff;
    border: none;
    cursor: pointer;
	}
	.animated-element {
    width: 100px;
    height: 100px;
    background-color: red;
    margin-bottom: 20px;
  }



</style>
