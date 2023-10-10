<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import { Button, GradientButton } from 'flowbite-svelte';
	import { onMount } from 'svelte';
	// import { Fileupload, Label, Helper } from 'flowbite-svelte';
	// import CsvEditor from './CsvEditor.svelte';
	// import Editabletable from './EditableTable.svelte';
	import { Grid } from 'ag-grid-community';
	import type { GridOptions } from 'ag-grid-community';
	import 'ag-grid-community/styles/ag-grid.css';
	import 'ag-grid-community/styles/ag-theme-alpine';

	export let data;

	let grid: Grid;
	
	const uppercaseLetters = [];

	for (let i = 65; i <= 90; i++) {
		uppercaseLetters.push(String.fromCharCode(i));
	}
	for (let i = 0; i < 26; i++) {

	}
	const gridOptions: GridOptions = {
			columnDefs: [
				{ field: "A" },
				{ field: "B" },
				{ field: "C" },
				{ field: "D" },
				{ field: "E" },
				{ field: "F" },
			],
			defaultColDef: {
				sortable: true,
				filter: true,
				flex: 1,
				resizable: true,
				editable: true
			},
			rowData: [ 
				{ A: "athlete", B: "age", C: "country", D: "year", E: "date", F: "sport"},
				{ A: "athlete", B: "age", C: "country", D: "year", E: "date", F: "sport"},
				{ A: "athlete", B: "age", C: "country", D: "year", E: "date", F: "sport"},
				{ A: "athlete", B: "age", C: "country", D: "year", E: "date", F: "sport"},
				{ A: "athlete", B: "age", C: "country", D: "year", E: "date", F: "sport"},
				{ A: "athlete", B: "age", C: "country", D: "year", E: "date", F: "sport"},
			]
		}
		
	onMount(() => {
		const gridEl = document.getElementById('Spreadsheet');
		if (!gridEl) {
			throw new Error('Grid Element not found!');
		}
		grid = new Grid(gridEl, gridOptions);
	});

</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="flex justify-center items-center">
		<div id="Spreadsheet" class="ag-theme-alpine" />
	</div>
</section>
