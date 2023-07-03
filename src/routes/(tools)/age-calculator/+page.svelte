<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Label, Input, Range, BreadcrumbItem } from 'flowbite-svelte';
	import { Radio } from 'flowbite-svelte'
	import { Checkbox } from 'flowbite-svelte'

	export let data;

	import { Select } from 'flowbite-svelte';
	
    import { Datepicker } from "flowbite-svelte";
	import { onMount } from 'svelte';

	let birthDate = null;
	let currentDate = null;
	let age = 0;
	
	onMount(() => {
		calculateAge();
	});

	function calculateAge(){
		if (birthDate && currentDate){
			const birth = new Date(birthDate);
      const current = new Date(currentDate);
      const diff = current.getTime() - birth.getTime();
      age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }
  }

	
</script>


<Intro heading={data.meta.title} description={data.meta.description} />

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

		<!-- <div>
		<Datepicker datepickerTitle="Birth date" datepickerFormat="dd/mm/yyyy" bind:valu={birthDate} on:change={calculateAge}/>
		</div>
		<div>
		<Datepicker datepickerTitle="Current date" datepickerFormat="dd/mm/yyyy" bind:valu={currentDate} on:change={calculateAge} />
	<button on:click={age}>Calculate</button> -->
   
	<!-- </div>
		{#if birthDate && currentDate}
		<p>Your age is {age}</p>

		{/if} -->
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

	main {
    max-width: 400px;
    margin: 0 auto;
    padding: 2rem;
    text-align: center;
  }
</style>
