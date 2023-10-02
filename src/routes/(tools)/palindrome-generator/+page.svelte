<script lang="ts">
	import { Textarea, Label } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';

	export let data;

	var palindrome="";

	function generatePalindrome(input){
		palindrome = input.target.value;
		for (var i = input.target.value.length - 1; i >= 0; i--) {
                palindrome += input.target.value[i];
            }
	}

</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
		
			<div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea1">
					<Textarea placeholder="Enter Text" id="textarea-id" rows="8" name="message"
					on:input={generatePalindrome}/>
				
				</div>
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea2">
					<Textarea placeholder="Result" id="textarea-id" rows="8" name="message" 
					bind:value={palindrome}/>

				</div>
			</div>

	</div>
</section>

<style>	

	#tarea1{
		margin-right: 10px;
	}

	#tarea2{
		margin-left: 10px;
	}

	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}

</style>