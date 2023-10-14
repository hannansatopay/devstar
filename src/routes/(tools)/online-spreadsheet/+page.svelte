<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import SpreadsheetPage from './SpreadsheetPage.svelte';
	
	export let data;
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<SpreadsheetPage />
</section>