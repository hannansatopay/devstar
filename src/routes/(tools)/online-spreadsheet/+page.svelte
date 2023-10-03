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
	const openNewSpreadsheet = async () => {
	  const input = document.createElement('input');
	  input.type = 'file';
  
	  input.addEventListener('change', async (event) => {
		const file = (event.target as HTMLInputElement).files?.[0];
  
		if (file) {
		  const fileContent = await readFile(file);
		  const csvData = parseCSV(fileContent);
  
		  // Clear existing data
		  table.clearData();
  
		  // Set columns and data to the table
		  table.setColumns(csvData.headers);
		  table.setData(csvData.data);
		}
	  });
  
	  // Trigger the file input dialog
	  input.click();
	};
  
	// Function to handle creating a new spreadsheet
	const createNewSpreadsheet = () => {
	  // Clear existing data
	  table.clearData();
	};
  
	// Function to read file content
	const readFile = (file) => {
	  return new Promise((resolve, reject) => {
		const reader = new FileReader();
  
		reader.onload = (e) => {
		  resolve(e.target.result);
		};
  
		reader.onerror = (e) => {
		  reject(e);
		};
  
		reader.readAsText(file);
	  });
	};
  
	// Function to parse CSV content
	const parseCSV = (csvContent) => {
	  const lines = csvContent.split('\n');
	  const headers = lines[0].split(',');
	  const data = [];
  
	  for (let i = 1; i < lines.length; i++) {
		const values = lines[i].split(',');
		if (values.length === headers.length) {
		  const row = {};
		  headers.forEach((header, index) => {
			row[header] = values[index];
		  });
		  data.push(row);
		}
	  }
  
	  return { headers, data };
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
  