<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Label, Input, Range } from 'flowbite-svelte';
	import { Radio } from 'flowbite-svelte';
	import { Checkbox } from 'flowbite-svelte';

	export let data;

	import { Select } from 'flowbite-svelte';

	let newItem = '';
	// let todoList: any[];
	
    let todoList = [];
	
	function addToList() {
		todoList = [...todoList, {text: newItem, status: false}];
		newItem = '';
	}
	
	function removeFromList(index: number) {
		todoList.splice(index, 1)
		todoList = todoList;
    }

	function clearCompleted() {
    todoList = todoList.filter(todoList => !todoList);
  }



</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<!--  -->

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card gap-16 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">

			<input bind:value={newItem} type="text" placeholder="new todo item..">
			<button on:click={addToList} class="optn-btn">Add</button>
			
			<br/>
			{#each todoList as item, index}
				<input bind:checked={item.status} type="checkbox">
				<span class:checked={item.status}>{item.text}</span>
			<button on:click={removeFromList} class="optn-btn">Delete</button>

				<br/>
			{/each} 


			<div id="four-c">
		

				<button on:click={clearCompleted} class="optn-btn">Clear Completed</button>

			</div>
		</div>
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
	<!-- </div> -->
</section><style>
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
		width: 100vw;
		height: 100vh;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.checked {
        text-decoration: line-through;
    }
	/* from frontendmentor */


	.optn-btn {
		font-size: 0.9rem;
		font-weight: 600;
		background-color: transparent;
		outline: none;
		border: none;
		cursor: pointer;
		/* color: var(--LightGrayishBlue); */
	}

		


</style>
