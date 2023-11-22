<script lang="ts">
// 	import Intro from '../Intro.svelte';
// 	import { Label, Input, Range, BreadcrumbItem } from 'flowbite-svelte';
// 	import { Radio } from 'flowbite-svelte'
// 	import { Checkbox } from 'flowbite-svelte'

// 	export let data;

// 	import { Select } from 'flowbite-svelte';
	
//     import { Datepicker } from "flowbite-svelte";
// 	import { onMount } from 'svelte';

// 	let birthDate = null;
// 	let currentDate = null;
// 	let age = 0;
	
// 	onMount(() => {
// 		calculateAge();
// 	});

// 	function calculateAge(){
// 		if (birthDate && currentDate){
// 			const birth = new Date(birthDate);
//       const current = new Date(currentDate);
//       const diff = current.getTime() - birth.getTime();
//       age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
//     }
//   }

	
</script>


<!-- <Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
	
    <Datepicker
	 datepickerTitle="Birth Date"
	 on:selected={value => (birthDate = value)}
	 on:change={calculateAge}
	 />

    <Datepicker
	 datepickerTitle="Current Age"
	 on:selected={value =>(currentDate = value)}
	 on:change={calculateAge}
	 />

	 {#if age > 0 }
	 <p>Your age is {age}</p>
	 {/if}
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
</section> -->

<svelte:head>
	<!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/flowbite/1.7.0/datepicker.min.js"></script> -->
</svelte:head>
<script lang="ts">
	// import { onMount } from 'svelte';
	// import Intro from '$lib/Intro.svelte';
	// export let data;

	// let birthDate = '29/06/2023';
	// let currentDate = null;
	// let age = 0;

	// function calculateAge() {
	// 	console.log(document.getElementById("birth-date").value, birthDate);
	// 	// if (birthDate && currentDate){
	// 	// 	const birth = new Date(birthDate);
	// 	// 	const current = new Date(currentDate);
	// 	// 	const diff = current.getTime() - birth.getTime();
	// 	// 	age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    // 	// }
  	// }

	// onMount(() => {
	// 	console.log(document.getElementById("birth-date"));
	// 	document.getElementById("birth-date").addEventListener('input', (event) => {
	// 		const inputValue = event.target.value;
	// 		console.log('Input value:', inputValue);
	// 	});
	// });
</script>

<!-- <Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="relative max-w-sm">
			<div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
				<svg class="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
				<path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
				</svg>
			</div>
			<input datepicker datepicker-autohide datepicker-format="dd/mm/yyyy" type="text" id="birth-date" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Date of birth">
		</div>

		<button on:click={calculateAge}>Hello</button>
		
		{#if age > 0 }
			<p>Your age is {age}</p>
		{/if}
	</div>
</section> -->