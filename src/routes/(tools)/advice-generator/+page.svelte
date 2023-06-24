<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Label, Input, Range } from 'flowbite-svelte';
	import { Radio } from 'flowbite-svelte'
	import { Checkbox } from 'flowbite-svelte'

	export let data;

	import { Select } from 'flowbite-svelte';

	import { onMount } from "svelte";
	let advice;
	let adviceId;

	async function fetchdata(){
		await fetch("https://api.adviceslip.com/advice")
		.then((response) => response.json())
		.then((data) => {
			advice = data.slip.advice;
			adviceId = data.slip.id;
			console.log(data);
		});
	}
    let promise = fetchdata();
	function handleClick(){
		promise = fetchdata();
	}

	onMount(fetchdata);


	
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<!-- <div
			class="card gap-16 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg"
		> -->
		<main>
		<container>
			<div class="flexbox-col">
			  {#await promise}
				
				<div class="spinner" />
				{:then}
				<h2 class="adviceId">Advice #{adviceId}</h2>
				<h1 class="advice">"{advice}"</h1>
				{/await}
				
				  <button class="dice" on:click={handleClick}>
					Shuffle
				  </button>
	</div>
</main>
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
	/* .box {
		border-radius: 20px;
	}

	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	} */

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}

	main {
    display: flex;
    /* flex-direction: column; */
    /* align-items: center; */
    justify-content: center;
    /* height: 100vh; */
    /* background-color: hsl(218, 23%, 16%); */
  }

  container {
    background-color: hsl(217, 19%, 24%);
    width: 650px;
    border-radius: 10px;
    box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
  }

  .adviceId {
    text-transform: uppercase;
    color: hsl(229, 84%, 65%);
    text-size-adjust: 100%;
    letter-spacing: 4px;
    font-size: 12px;
    padding-top: 25px;
  }

  .flexbox-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 1rem;
    text-align: center;
  }


  .advice {
    font-size: 28px;
    color: hsl(194, 49%, 92%);
  }

  .dice {
    background-color: hsl(229, 84%, 65%);
    border: none;
    border-radius: 50%;
    height: 65px;
    width: 65px;
    margin-top: 2rem;
    cursor: pointer;
    position: relative;
    bottom: -3.5rem;

    -webkit-transition: all 800ms ease;
    -moz-transition: all 800ms ease;
    -ms-transition: all 800ms ease;
    -o-transition: all 800ms ease;
    transition: all 800ms ease;
  }

  

  .dice:hover {
    box-shadow: 0px 0px 65px 10px hsla(236, 85%, 69%, 0.367);
    -webkit-transform: rotate(360deg);
    -moz-transform: rotate(360deg);
    -o-transform: rotate(360deg);
    -ms-transform: rotate(360deg);
    transform: rotate(360deg);
  }

  h1 {
    padding: 25px 10px 0px 10px;
  }



  .spinner {
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .spinner:after {
    animation: changeContent 0.8s linear infinite;
    display: block;
    content: "⠋";
    font-size: 80px;
  }

  @keyframes changeContent {
    10% {
      content: "⠙";
    }
    20% {
      content: "⠹";
    }
    30% {
      content: "⠸";
    }
    40% {
      content: "⠼";
    }
    50% {
      content: "⠴";
    }
    60% {
      content: "⠦";
    }
    70% {
      content: "⠧";
    }
    80% {
      content: "⠇";
    }
    90% {
      content: "⠏";
    }
  }
</style>
