<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import { Label, Input, Range, Radio, Checkbox } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	
	export let data;

	// Might need these for tabular view
	let innerWidth: any = null; // defining this solve the of svelte:window tag  
	let innerHeight: any = null; // and now all other elements are visible
	let screenWidth: any = null;
	let screenHeight: any = null;
	
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<svelte:window bind:innerWidth bind:innerHeight />

<section class="bg-white dark:bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-12 md:space-y-0 md: space-x-0">
            <div class="flex justify-center items-center">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-5 px-5 rounded">
                    Open New Spreadsheet (.csv)
                </button>
            </div>
            <div class="flex justify-center items-center">
                <button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-5 px-5 rounded">
                    Create New Spreadsheet (.csv)
                </button>
            </div>
        </div>
    </div>
</section>


