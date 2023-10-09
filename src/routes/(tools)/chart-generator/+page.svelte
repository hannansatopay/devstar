
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
<div class="decoration-gray-700 text-5xl flex justify-center m-3">
	<h1>XYChart</h1>
</div>
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