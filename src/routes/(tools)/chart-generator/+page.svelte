
<script lang="ts">
	import Chart from "./Chart.svelte";
	import Chart1 from "./Chart.svelte";
	import Intro from '$lib/Intro.svelte'
	export let data;
	export let arr;
</script>
<Intro heading={data.meta.title} description={data.meta.description} />
<section class="bg-white dark:bg-gray-900">

</section>
<div class="flex justify-center items-center">
	<Chart/>
</div>

<style>
	
	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
</style>