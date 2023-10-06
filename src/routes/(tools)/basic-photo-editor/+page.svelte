<svelte:head>
	<title> Photo Editor</title>
</svelte:head>
<script lang="ts">
	import { onMount } from 'svelte';
	import { Label, Input } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import Copy from '$lib/Copy.svelte';
	export let data;

	
</script>

<Intro heading={data.meta.title} description={data.meta.description} />


<style>
	
</style>