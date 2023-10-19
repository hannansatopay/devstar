<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import FlowchartArea from './flowchartarea.svelte';
	import { selectedTool } from './toolstore';
	export let data;

	function setTool(tool) {
      selectedTool.set(tool);
    }
	function eraseit(){
		location.reload()
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<div class=" flex border-4 border-blue-900 dark:border-white mx-32 rounded-lg  ">
	<div class="border-2 text-white p-2  w-2/5  lg:w-1/4 sm:w-full bg-[#111827]">
		<div class="shapes m-2">
			<h3 class="text-center text font-bold  border">Shapes</h3>
			<button on:click={() => setTool('arrow')}>Arrow</button><br>
			<button on:click={() => setTool('triangle')}>Triangle</button><br>
			<button on:click={() => setTool('circle')}>Circle</button><br>
			<button on:click={() => setTool('oval')}>Oval</button><br>
			<button on:click={() => setTool('square')}>Square</button><br>
			<button on:click={() => setTool('rectangle')}>Rectangle</button><br>
			<button on:click={() => setTool('parallelogram')}>Parallelogram</button><br>
			<button on:click={() => setTool('diamond')}>Diamond</button><br>
		</div>
		<div class="tool m-2">
			<h3 class="text-center font-bold border">Tools</h3>
			<button on:click={() => setTool('text')}>Text</button><br>
			<button>Eraser</button><br>
			<button>Pencil</button><br>
			<button>Brush</button><br>
			<button>Colors</button><br>
			<section class="color">
				<input name="colour" class="bg-red-700" value="red" type="radio">
				<input name="colour"class="bg-blue-700" value="blue" type="radio">
				<input name="colour"class="bg-green-700" value="green" type="radio">
				<input name="colour"class="bg-black" value="black" type="radio">
				<input name="colour"class="bg-yellow-200" value="yellow" type="radio">
				<input name="colour"class="bg-white-200" value="white" type="radio">
			</section>
		</div>
		<div class=" py-1">
		<div class="function grid grid-cols-2 gap-1  ">
			<button class="border rounded-lg  px-1">Undo</button><button class="border rounded-lg px-1">Redo</button></div>
		<div class="eraseall border px-1 border rounded-lg my-1 text-center"><button on:click={eraseit}>Erase All</button></div>
		<div class="border px-1 border rounded-lg text-center"><button>Export</button></div>
		</div>
		
	</div>
	<FlowchartArea />

</div>
