<script lang="ts">
	import Tabulator from 'tabulator-tables';

	import Intro from '$lib/Intro.svelte';
	import { Label, Input, Range, Radio, Checkbox } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	
	export let data;

	// Might need these for tabular view
	let innerWidth: any = null; // defining this solve the of svelte:window tag  
	let innerHeight: any = null; // and now all other elements are visible
	let screenWidth: any = null;
	let screenHeight: any = null;

    document.addEventListener('DOMContentLoaded', () => {
    const createButtons = document.querySelectorAll('.create-button');
    const tableContainer = document.getElementById('tableContainer');

    // Function to create the table when any "Create New Spreadsheet" button is clicked
    createButtons.forEach((button) => {
        button.addEventListener('click', () => {
            const table = new Tabulator.default(tableContainer, {
                // Tabulator configuration options here
                columns: [
                    { title: 'Column 1', field: 'col1' },
                    { title: 'Column 2', field: 'col2' },
                    // Add more columns as needed
                ],
                data: [], // Initial data (can be empty)
                // Other configuration options go here
            });

            // You can populate the table with data as needed
            // For example:
            // table.setData([{ col1: 'Value 1', col2: 'Value 2' }]);
        });
    });

    // You can also add logic for the "Open New Spreadsheet" button if needed
    // Example:
    /*
    const openButtons = document.querySelectorAll('.open-button');
    openButtons.forEach((button) => {
        button.addEventListener('click', () => {
            // Add logic for opening a new spreadsheet here
        });
    });
    */
});
     
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<svelte:window bind:innerWidth bind:innerHeight />

<section class="bg-white dark:bg-gray-800">
    <div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
        <div class="flex justify-center space-x-4">
            <button id="openButton" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-5 px-20 rounded">
                Open New Spreadsheet (.csv)
            </button>
            <button id="createButton" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-5 px-20 rounded">
                Create New Spreadsheet (.csv)
            </button>
        </div>
    </div>
</section>

