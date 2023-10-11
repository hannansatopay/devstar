
<script lang="ts">
	import Chart from "./Chart.svelte";
	import Chart1 from "./Chart1.svelte";
	import Intro from '$lib/Intro.svelte'
	export let data;
	export let arr;
</script>
<Intro heading={data.meta.title} description={data.meta.description} />
<section class="bg-white dark:bg-gray-900">

</section>
<!-- <div class="text-white-400 text-5xl flex justify-center m-5 p-5">
	<h1>Sample Chart</h1>
</div>
<Chart /> -->
<!-- <div class="flex ml-20 mr-20 justify-center items-center">
	<div class="w-2/4 h-80 bg-blue-400">left</div>
	<div class="w-2/4 h-80 bg-blue-300">right</div>
</div> -->
<div>
	<Chart1/>
</div>

<style>
	
	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
</style>