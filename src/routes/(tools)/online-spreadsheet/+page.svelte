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

	// const keyValuePairs = {};

	// for (let charCode = 65; charCode <= 90; charCode++) {
	// 	const letter = String.fromCharCode(charCode);
	// 	keyValuePairs[letter] = "\t\t"; // Assuming you want a tab character as the value
	// }
	const gridOptions: GridOptions = {
			columnDefs: [ { field: "ID", editable: false},
				{ field: "A" },{ field: "B" },{ field: "C" },{ field: "D" },{ field: "E" },{ field: "F" },{ field: "G" },{ field: "H" },
				{ field: "I" },{ field: "J" },{ field: "K" },{ field: "L" },{ field: "M" },{ field: "N" },{ field: "O" },{ field: "P" },
				{ field: "Q" },{ field: "R" },{ field: "S" },{ field: "T" },{ field: "U" },{ field: "V" },{ field: "W" },{ field: "X" },
				{ field: "Y" },{ field: "Z" },
			],
			defaultColDef: {
				sortable: true,
				filter: true,
				flex: 0,
				resizable: true,
				editable: true,
			},
			rowData: [ 		
				{ ID:1, A:"", B:"", C:"", D:"", E:"", F:"", G:"", H:"", I:"", J:"", K:"", L:"", M:"", N:"", O:"", P:"", Q:"", R:"", S:"", T:"", U:"", V:"", W:"", X:"", Y:"", Z:"",},
				{ ID:2, A:"", B:"", C:"", D:"", E:"", F:"", G:"", H:"", I:"", J:"", K:"", L:"", M:"", N:"", O:"", P:"", Q:"", R:"", S:"", T:"", U:"", V:"", W:"", X:"", Y:"", Z:"",},
				{ ID:3, A:"", B:"", C:"", D:"", E:"", F:"", G:"", H:"", I:"", J:"", K:"", L:"", M:"", N:"", O:"", P:"", Q:"", R:"", S:"", T:"", U:"", V:"", W:"", X:"", Y:"", Z:"",},
				{ ID:4, A:"", B:"", C:"", D:"", E:"", F:"", G:"", H:"", I:"", J:"", K:"", L:"", M:"", N:"", O:"", P:"", Q:"", R:"", S:"", T:"", U:"", V:"", W:"", X:"", Y:"", Z:"",},
				{ ID:5, A:"", B:"", C:"", D:"", E:"", F:"", G:"", H:"", I:"", J:"", K:"", L:"", M:"", N:"", O:"", P:"", Q:"", R:"", S:"", T:"", U:"", V:"", W:"", X:"", Y:"", Z:"",},
				{ ID:6, A:"", B:"", C:"", D:"", E:"", F:"", G:"", H:"", I:"", J:"", K:"", L:"", M:"", N:"", O:"", P:"", Q:"", R:"", S:"", T:"", U:"", V:"", W:"", X:"", Y:"", Z:"",},
				{ ID:7 ,A:"", B:"", C:"", D:"", E:"", F:"", G:"", H:"", I:"", J:"", K:"", L:"", M:"", N:"", O:"", P:"", Q:"", R:"", S:"", T:"", U:"", V:"", W:"", X:"", Y:"", Z:"",},
				{ ID:8, A:"", B:"", C:"", D:"", E:"", F:"", G:"", H:"", I:"", J:"", K:"", L:"", M:"", N:"", O:"", P:"", Q:"", R:"", S:"", T:"", U:"", V:"", W:"", X:"", Y:"", Z:"",},
				{ ID:9, A:"", B:"", C:"", D:"", E:"", F:"", G:"", H:"", I:"", J:"", K:"", L:"", M:"", N:"", O:"", P:"", Q:"", R:"", S:"", T:"", U:"", V:"", W:"", X:"", Y:"", Z:"",},
				{ ID:10, A:"", B:"", C:"", D:"", E:"", F:"", G:"", H:"", I:"", J:"", K:"", L:"", M:"", N:"", O:"", P:"", Q:"", R:"", S:"", T:"", U:"", V:"", W:"", X:"", Y:"", Z:"",},
			]
		}
		
	onMount(() => {
		const gridEl = document.getElementById('Spreadsheet');
		if (!gridEl) {
			throw new Error('Grid Element not found!');
		}
		grid = new Grid(gridEl, gridOptions);
	});

	function addRow() {
		const rowCount = gridOptions.api?.getDisplayedRowCount();
		if(!rowCount) {
			console.error("Grid API not accessible")
		}

		let newRow = {
			ID:1 + rowCount, A:"", B:"", C:"", D:"", E:"", F:"", G:"", H:"", I:"", J:"", K:"", L:"", M:"", N:"", O:"", P:"", Q:"", R:"", S:"", T:"", U:"", V:"", W:"", X:"", Y:"", Z:"",
		};

		gridOptions.api?.applyTransaction({
			add: [newRow],
			addIndex: rowCount
		})
	}

</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="mt-2 flex">
		<div id="Spreadsheet" style="height:500px; width:100%; margin:4px" class="ag-theme-alpine"/>
		<GradientButton on:click={addRow} class="w-32 h-32 ml-2 mr-2" size="sm" color="blue">Add Row</GradientButton>
	</div>
	
	
</section>

<!-- <style>
	/* set the background color of many elements across the grid */
.ag-theme-alpine {
    --ag-background-color-dark: bg-gray-900;
	--ag-background-color: bg-white
	
}
/* change the font style of a single UI component */
.ag-theme-alpine .ag-header-cell-label {
    font-style: italic;
}

/* ag-theme-acmecorp.css */
.ag-theme-acmecorp {
    --ag-odd-row-background-color: bg-gray-900;
}
</style> -->
