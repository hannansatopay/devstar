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
	import "ag-grid-community/styles/ag-theme-alpine.css"

	export let data;

	let grid: Grid;
	
	// const uppercaseLetters = [];

	// for (let i = 65; i <= 90; i++) {
	// 	uppercaseLetters.push(String.fromCharCode(i));
	// }
	// for (let i = 0; i < 26; i++) {

	// }
	const gridOptions: GridOptions = {
			columnDefs: [
				{ field: "Apple" },
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
				editable: true,
			},
			rowData: [ 
				{ Apple: "athlete", B: "age", C: "country", D: "year", E: "date", F: "sport"},
				{ Apple: "athlete", B: "age", C: "country", D: "year", E: "date", F: "sport"},
				{ Apple: "athlete", B: "age", C: "country", D: "year", E: "date", F: "sport"},
				{ Apple: "athlete", B: "age", C: "country", D: "year", E: "date", F: "sport"},
				{ Apple: "athlete", B: "age", C: "country", D: "year", E: "date", F: "sport"},
				{ Apple: "athlete", B: "age", C: "country", D: "year", E: "date", F: "sport"},
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
	<div id="Spreadsheet" style="display:flex width: 80%; height:500px" class="ag-theme-alpine ag-theme-acmecorp"/>
</section>

<style>
	/* set the background color of many elements across the grid */
.ag-theme-alpine {
    --ag-background-color: bg-gray-900;
}
/* change the font style of a single UI component */
.ag-theme-alpine .ag-header-cell-label {
    font-style: italic;
}

/* ag-theme-acmecorp.css */
.ag-theme-acmecorp {
    --ag-odd-row-background-color: bg-gray-900;
}
</style>
