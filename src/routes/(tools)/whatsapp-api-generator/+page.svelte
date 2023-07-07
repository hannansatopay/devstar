<svelte:head>
	<link rel="stylesheet" type="text/css" href="freakflags.css">
</svelte:head>
<script lang="ts">
	import { Input, ButtonGroup, Label, Textarea, Helper } from 'flowbite-svelte';
	import CountrySelector from '$lib/CountrySelector.svelte';
	import Copy from '$lib/Copy.svelte';
	import Intro from '$lib/Intro.svelte';
	export let data;

	let country = '';
	let mobile = '';
	let message = '';
	const selectCountry = (event) => country = event.detail;
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card gap-16 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
			<div class="p-8">
				<Label class="mb-2">Type your WhatsApp phone number</Label>
				<ButtonGroup class="w-full">
					<CountrySelector on:country={selectCountry}/>
					<Input placeholder="Enter mobile number" bind:value={mobile}/>
				  </ButtonGroup>

				  <Label for="textarea-id" class="mt-4">Welcome message (Optional)</Label>
				  <Helper class="text-sm mb-2">Automatically add a custom message that pre-fills what your contacts will send, making it easier to start a conversation.</Helper>
				  <Textarea bind:value={message} id="textarea-id" placeholder="eg: Hello, I want to know more about your service. Can you help me?" rows="4"/>

				  {#if country && mobile.length >= 7}
				  <div class="relative mt-3">
					<input value={`https://wa.me/${country?country.extension:''}${mobile}?text=${message}`} type="text" class="block w-full p-4 text-sm text-gray-900 border border-green-500 rounded-lg bg-green-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" readonly>
					<Copy text={`https://wa.me/${country?country.extension:''}${mobile}?text=${message}`} customClass={'right-2.5 top-2.5 bottom-2.5'}/>
				  </div>
				  {/if}
			</div>
		</div>
	</div>
</section>

<style>
	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
</style>
