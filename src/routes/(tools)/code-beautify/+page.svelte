<script lang="ts">
	import { 
		Label, 
		Tooltip, 
		Button, 
		Dropdown, 
		DropdownItem 
	} from 'flowbite-svelte';

	import {
		FolderOpenSolid,
		PapperClipSolid,
		ClockSolid,
		CheckSolid,
		PrintSolid,
		TrashBinSolid,
		FileCopySolid,
		DownloadSolid,
		ExpandSolid,
		ChevronDownSolid
	} from 'flowbite-svelte-icons';

	import Intro from '$lib/Intro.svelte';
	import Copy from '$lib/Copy.svelte';
	import xmlFormat from 'xml-formatter';
	import prettify from 'html-prettify';

	export let data;

	let type = 'JSON';

	let dropdownOpen = false;

	let inputTextAreaContent = '';
	let outputTextAreaContent = '';

	let inputTextAreaSize = 0;
	let outputTextAreaSize = 0;
	let inputTextAreaLnIndex = 1;
	let outputTextAreaLnIndex = 1;
	let inputTextAreaColIndex = 0;
	let outputTextAreaColIndex = 0;
	let inputTextArea: HTMLTextAreaElement;
	let outputTextArea: HTMLTextAreaElement;
	let spaceoption = 4;
	let Tabs = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

	function formatXML() {
		let inputXML = inputTextAreaContent;
		let formattedXML = xmlFormat(inputXML, {
			indentation: '  ',
			filter: (node) => node.type !== 'Comment',
			collapseContent: true,
			lineSeparator: '\n'
		});
		outputTextAreaContent = formattedXML;
	}

	function formatHTML() {
		let inputHTML = inputTextAreaContent;
		let formattedHTML = prettify(inputHTML);
		outputTextAreaContent = formattedHTML;

		}

	function formatJSON() {
		try {
			let inputJSON = inputTextAreaContent;
			let parsedJSON = JSON.parse(inputJSON);
			let formattedJSON = JSON.stringify(parsedJSON, null, spaceoption);
			outputTextAreaContent = formattedJSON;
		} catch (error) {
			let formattedJSON = 'Invalid JSON';
			outputTextAreaContent = formattedJSON;
		}
  	}

	function validateJSON() {
		try {
			let inputJSON = inputTextAreaContent;
			const parsed = JSON.parse(inputJSON);
			alert('Valid JSON');
		} catch (error: any) {
			alert('Invalid JSON input: ' + error.message);
		}
  	}

	function minifyXML() {
		let inputXML = inputTextAreaContent;
		let minifiedXML = xmlFormat.minify(inputXML, {
			filter: (node) => node.type !== 'Comment',
			collapseContent: true
		});
		outputTextAreaContent = minifiedXML;
	}

	function minifyJSON() {
		try {
			let inputJSON = inputTextAreaContent;
			let parsedJSON = JSON.parse(inputJSON);
			let minifiedJSON = JSON.stringify(parsedJSON);
			outputTextAreaContent = minifiedJSON;
		} catch (error) {
			let minifiedJSON = 'Invalid JSON';
			outputTextAreaContent = minifiedJSON;
		}
	}

	function minifyHTML() {
		let inputHTML = inputTextAreaContent;
		let minifiedHTML = inputHTML.replace(/>\s+</g, '><').trim();
		outputTextAreaContent = minifiedHTML;
	}

	function sampleHTML() {
		let samplehtml = `<div>
		<h1>Hello, World!</h1>
		<p>This is a sample HTML content.</p>
</div>`;
		inputTextAreaContent = samplehtml;
	}

	function sampleXML() {
		let samplehtml = `<?xml version="1.0" encoding="UTF-8"?>
		<book>
		<name>A Song of Ice and Fire</name>
		<author>George R. R. Martin</author>
		<language>English</language>
		<genre>Epic fantasy</genre>
</book>`;
		inputTextAreaContent = samplehtml;
	}

	function sampleJSON() {
		let samplejson = `{
			"glossary": {
			"title": "example glossary",
			"GlossDiv": {
				"title": "S",
				"GlossList": {
				"GlossEntry": {
					"ID": "SGML",
					"SortAs": "SGML",
					"GlossTerm": "Standard Generalized Markup Language",
					"Acronym": "SGML",
					"Abbrev": "ISO 8879:1986",
					"GlossDef": {
					"para": "A meta-markup language, used to create markup languages such as DocBook.",
					"GlossSeeAlso": ["GML", "XML"]
					},
					"GlossSee": "markup"
				}
				}
			}
			}
		}`;
		inputTextAreaContent = samplejson;
	}

	function findLineColumnIndex(event: any) {
		const textAreaType = event.target.getAttribute('data-text-area-type');
		
		if (textAreaType === 'input') {
			const startPos = inputTextArea.selectionStart;
			const textLines = inputTextAreaContent.substring(0, startPos).split('\n');
			inputTextAreaLnIndex = textLines.length;
			inputTextAreaColIndex = textLines[textLines.length - 1].length;
		}
		else if (textAreaType === 'output')	{
			const startPos = outputTextArea.selectionStart;
			const textLines = outputTextAreaContent.substring(0, startPos).split('\n');
			outputTextAreaLnIndex = textLines.length;
			outputTextAreaColIndex = textLines[textLines.length - 1].length;
		}
	}

	function findSize(event: any) {
		const textAreaType = event.target.getAttribute('data-text-area-type');
		
		if (textAreaType === 'input') {
			inputTextAreaSize = inputTextAreaContent.length;
		}
		else if (textAreaType === 'output')	{
			outputTextAreaSize = outputTextAreaContent.length;
		}
	}

	function allowTabIndentation(event: any) {
		if (event.key === 'Tab') {
			event.preventDefault()

			let textAreaType = event.target.getAttribute('data-text-area-type');
			if (textAreaType === 'input') {
				const startPos = inputTextArea.selectionStart;
    			const endPos = inputTextArea.selectionEnd;
        		inputTextAreaContent = inputTextAreaContent.substring(0, startPos) + '    ' + inputTextAreaContent.substring(endPos);
        
        		inputTextArea.value = inputTextAreaContent;

				inputTextArea.selectionStart = startPos + 4;
				inputTextArea.selectionEnd = startPos + 4;
			}
			else if (textAreaType === 'output') {
				const startPos = outputTextArea.selectionStart;
    			const endPos = outputTextArea.selectionEnd;
        		outputTextAreaContent = outputTextAreaContent.substring(0, startPos) + '    ' + outputTextAreaContent.substring(endPos);
        
        		outputTextArea.value = outputTextAreaContent;

				outputTextArea.selectionStart = startPos + 4;
				outputTextArea.selectionEnd = startPos + 4;
			}
		}
	}

	function format() {
		if (type === 'XML') 
			formatXML();
		else if (type === 'JSON') 
			formatJSON();
		else if (type === 'HTML') 
			formatHTML();
	}

	function minify() {
		if (type === 'XML') 
			minifyXML();
		else if (type === 'JSON') 
			minifyJSON();
		else if (type === 'HTML') 
			minifyHTML();
	}

	function sample() {
		if (type === 'XML') 
			sampleXML();
		else if (type === 'JSON') 
			sampleJSON();
		else if (type === 'HTML') 
			sampleHTML();
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
	<div class="w-full mb-4 border border-gray-400 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
		<div class="flex items-center justify-between px-3 py-2 border-b dark:border-gray-600">
			<div class="flex flex-wrap items-center divide-gray-700 sm:divide-x dark:divide-gray-400">
				<div class="flex items-center space-x-1 sm:pr-4">
					<Button
						outline
						color="light"
						class="text-gray-700 cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600 px-3 py-1 rounded text-md font-thin"
						>{type} Formatter<ChevronDownSolid size="xs" class="ml-2" /></Button
					>
					<Dropdown bind:open={dropdownOpen}>
						<DropdownItem on:click={() => {
							dropdownOpen = false;
							type = 'JSON';
						}}>JSON Formatter</DropdownItem
						>
						<DropdownItem on:click={() => {
							dropdownOpen = false;
							type = 'XML';
						}}>XML Formatter</DropdownItem
						>
						<DropdownItem on:click={() => {
							dropdownOpen = false;
							type = 'HTML';
						}}>HTML Formatter</DropdownItem
						>
					</Dropdown>

					<button
						type="button"
						class="px-2 py-1 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"on:click={sample}>Sample
						<span class="sr-only">Sample {type} Data</span>
					</button>
					<Tooltip color="blue" arrow={false}>Sample {type} Data</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
					>
						<FolderOpenSolid size="sm" />
						<span class="sr-only">Upload File</span>
					</button>
					<Tooltip color="blue" arrow={false}>Upload File</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
					>
						<PapperClipSolid size="sm" />
						<span class="sr-only">Load URL</span>
					</button>
					<Tooltip color="blue" arrow={false}>Load URL</Tooltip>
				</div>
				<div class="flex flex-wrap items-center space-x-1 sm:px-4">
					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
					>
						<ClockSolid size="sm" />
						<span class="sr-only">Load Previous Data</span>
					</button>
					<Tooltip color="blue" arrow={false}>Load Previous Data</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
						on:click={validateJSON}
					>
						<CheckSolid size="sm" />
						<span class="sr-only">Validate {type}</span>
					</button>
					<Tooltip color="blue" arrow={false}>Validate {type}</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
					>
						<PrintSolid size="sm" />
						<span class="sr-only">Print {type}</span>
					</button>
					<Tooltip color="blue" arrow={false}>Print {type}</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
					>
						<TrashBinSolid size="sm" />
						<span class="sr-only">Delete {type}</span>
					</button>
					<Tooltip color="blue" arrow={false}>Delete {type}</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
					>
						<FileCopySolid size="sm" />
						<span class="sr-only">Copy to Clipboard</span>
					</button>
					<Tooltip color="blue" arrow={false}>Copy to Clipboard</Tooltip>
				</div>
				<div class="flex flex-wrap items-center space-x-1 sm:px-4">
					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
					>
						<DownloadSolid size="sm" />
						<span class="sr-only">Download {type}</span>
					</button>
					<Tooltip color="blue" arrow={false}>Download {type}</Tooltip>
					<label for="dropdown" class="text-white">Space:</label>
					<select
						id="dropdown"
						class="text-white rounded cursor-pointer dark:bg-gray-700 dark:border-gray-600"
						bind:value={spaceoption}
					>
						{#each Tabs as option (option)}
							<option value={option}>{option} Tabs</option>
						{/each}
					</select>
				</div>
			</div>
			<button
				type="button"
				data-tooltip-target="tooltip-fullscreen"
				class="p-2 text-gray-700 rounded cursor-pointer sm:ml-auto hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
			>
				<ExpandSolid size="sm" />
				<span class="sr-only">Full screen</span>
			</button>
			<Tooltip color="blue" arrow={false}>Full Screen</Tooltip>
		</div>
		<div class="px-4 py-2 bg-white dark:bg-gray-800">
			<Label for="editor" class="sr-only">Code Editor</Label>
			<textarea
				bind:this={inputTextArea}
				bind:value={inputTextAreaContent}
				on:keyup={findLineColumnIndex}
				on:keyup={findSize}
				on:keydown={(e) => allowTabIndentation(e)}
				on:mouseup={findLineColumnIndex}
				data-text-area-type="input"
				rows="8"
				class="block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
				placeholder="{type} Code"
			/>
		</div>
		<div
			class="px-4 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-b-lg text-gray-700 dark:text-gray-200 flex justify-start divide-x divide-gray-700 dark:divide-gray-400"
		>
			<p class="pr-4 pl-2">Ln : {inputTextAreaLnIndex}</p>
			<p class="px-4">Col : {inputTextAreaColIndex}</p>
			<p class="px-4">Size : {inputTextAreaSize} B</p>
		</div>
	</div>

	<Button color="blue" class="mr-1" on:click={format}>Beautify</Button>
	<Button color="blue" class="ml-1" on:click={minify}>Minify</Button>

	<div
		class="w-full mt-4 border border-gray-400 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
	>
		<div class="flex items-center justify-between px-3 py-2 border-b dark:border-gray-600">
			<div class="flex flex-wrap items-center divide-gray-700 sm:divide-x dark:divide-gray-400">
				<div class="flex items-center space-x-1 sm:pr-4">
					<span class="px-2 py-1 text-gray-700 rounded dark:text-gray-200"> Output </span>
				</div>
				<div class="flex flex-wrap items-center space-x-1 sm:px-4">
					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
					>
						<ClockSolid size="sm" />
						<span class="sr-only">Load Previous Data</span>
					</button>
					<Tooltip color="blue" arrow={false}>Load Previous Data</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
					>
						<PrintSolid size="sm" />
						<span class="sr-only">Print {type}</span>
					</button>
					<Tooltip color="blue" arrow={false}>Print {type}</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
					>
						<TrashBinSolid size="sm" />
						<span class="sr-only">Delete {type}</span>
					</button>
					<Tooltip color="blue" arrow={false}>Delete {type}</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
					>
						<FileCopySolid size="sm" />
						<span class="sr-only">Copy to Clipboard</span>
					</button>
					<Tooltip color="blue" arrow={false}>Copy to Clipboard</Tooltip>
				</div>
				<div class="flex flex-wrap items-center space-x-1 sm:px-4">
					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
					>
						<DownloadSolid size="sm" />
						<span class="sr-only">Download {type}</span>
					</button>
					<Tooltip color="blue" arrow={false}>Download {type}</Tooltip>
				</div>
			</div>
			<button
				type="button"
				data-tooltip-target="tooltip-fullscreen"
				class="p-2 text-gray-700 rounded cursor-pointer sm:ml-auto hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
			>
				<ExpandSolid size="sm" />
				<span class="sr-only">Full screen</span>
			</button>
			<Tooltip color="blue" arrow={false}>Full Screen</Tooltip>
		</div>
		<div class="px-4 py-2 bg-white dark:bg-gray-800">
			<Label for="editor" class="sr-only">Code Output</Label>
			<textarea
				bind:this={outputTextArea}
				bind:value={outputTextAreaContent}
				on:keyup={findLineColumnIndex}
				on:keyup={findSize}
				on:keydown={(e) => allowTabIndentation(e)}
				on:mouseup={findLineColumnIndex}
				data-text-area-type="output"
				rows="8"
				class="block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
				placeholder="{type} Output"
			/>
		</div>
		<div
			class="px-4 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-b-lg text-gray-700 dark:text-gray-200 flex justify-start divide-x divide-gray-700 dark:divide-gray-400"
		>
			<p class="pr-4 pl-2">Ln : {outputTextAreaLnIndex}</p>
			<p class="px-4">Col : {outputTextAreaColIndex}</p>
			<p class="px-4">Size : {outputTextAreaSize} B</p>
		</div>
	</div>
</div>
