<script lang="ts">
	import { Button, GradientButton } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import { onMount } from 'svelte';
	import { TabulatorFull as Tabulator } from 'tabulator-tables';
	import 'tabulator-tables/dist/css/tabulator.min.css';
  
	export let data;
	let innerWidth: any = null;
	let innerHeight: any = null;
  
	let table: any = null;
  
	onMount(() => {
	  // Function to initialize Tabulator
	  const initTabulator = () => {
		// Options for the Tabulator instance
		const tableOptions = {
		  columns: [],
		  data: [], // Initial empty data
		};
  
		// Initialize Tabulator
		table = new Tabulator('#my-table', tableOptions);
	  };
  
	  // Call the function to initialize Tabulator
	  initTabulator();
	});
  
	// Function to handle opening a new spreadsheet
	const openNewSpreadsheet = () => {
	  const input = document.createElement('input');
	  input.type = 'file';
  
	  input.addEventListener('change', (event) => {
		const file = (event.target as HTMLInputElement).files?.[0];
  
		if (file) {
		  const reader = new FileReader();
  
		  reader.onload = (e) => {
			const csvData = (e.target as FileReader).result;
  
			// Clear existing data
			table.setData([]);
  
			// Parse the CSV data and set it to the table
			Papa.parse(csvData as string, {
			  header: true,
			  skipEmptyLines: true,
			  dynamicTyping: true,
			  complete: (result) => {
				table.setColumns(result.meta.fields);
				table.setData(result.data);
			  },
			});
		  };
  
		  // Read the file as text
		  reader.readAsText(file);
		}
	  });
  
	  // Trigger the file input dialog
	  input.click();
	};
  
	// Function to handle creating a new spreadsheet
	const createNewSpreadsheet = () => {
	  // Clear existing data
	  table.setData([]);
	};
  </script>
  
  <Intro heading={data.meta.title} description={data.meta.description} />
  
  <svelte:window bind:innerWidth bind:innerHeight />
  
  <section class="bg-white dark:bg-gray-900">
	<div class="flex justify-center items-center">
	  <Button on:click={openNewSpreadsheet} size="xl" outline color="blue" class="m-6">
		Open New Spreadsheet<br/>(.csv)
	  </Button>
	  <GradientButton on:click={createNewSpreadsheet} size="xl" color="blue" class="m-6">
		Create New Spreadsheet<br/>(.csv)
	  </GradientButton>
	</div>
  
	<!-- Table container -->
	<div id="my-table"></div>
  </section>