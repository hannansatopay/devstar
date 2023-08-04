<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import { Label, Input, Range, BreadcrumbItem } from "flowbite-svelte";
	import { Radio } from "flowbite-svelte";
	import { Checkbox } from "flowbite-svelte";
	import { Select } from "flowbite-svelte";
	import { onMount } from "svelte";

	export let data;

	let birthDate = null;
	let currentDate = null;
	let age = 0;

	onMount(() => {
		calculateAge();
	});

	function calculateAge() {
		if (birthDate && currentDate) {
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
			on:selected={(value) => (birthDate = value)}
			on:change={calculateAge}
		/>

		<Datepicker
			datepickerTitle="Current Age"
			on:selected={(value) => (currentDate = value)}
			on:change={calculateAge}
		/>

		{#if age > 0}
			<p>Your age is {age}</p>
		{/if}
	</div>
</section>