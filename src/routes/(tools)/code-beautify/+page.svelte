<script lang="ts">
	import { Label, Tooltip, Button, Dropdown, DropdownItem } from 'flowbite-svelte';

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
		ChevronDownSolid,
		ArrowRightSolid,
		CotateSolid
	} from 'flowbite-svelte-icons';

	import Intro from '$lib/Intro.svelte';
	import Copy from '$lib/Copy.svelte';
	import xmlFormat from 'xml-formatter';
	import prettify from 'html-prettify';
	import xml2js from 'xml2js';

	export let data;

	// possible types :
	// JSON
	// XML
	// HTML
	// CSV
	// JS
	// SQL

	let toolType = 'JSON';
	let convertTypeOne = 'CSV';
	let convertTypeTwo = 'JSON';

	let toggle = true;

	let converterList: any = {
		JSON: ['XML', 'CSV'],
		XML: ['JSON', 'CSV'],
		CSV: ['XML', 'JSON']
	};

	$: inputTextAreaPlaceholder = toolType === 'CONVERT' ? convertTypeOne : toolType;
	$: outputTextAreaPlaceholder = toolType === 'CONVERT' ? convertTypeTwo : toolType;
	$: convertTypeTwo = converterList[convertTypeOne][0];

	let toolsDropdownOpen = false;
	let converterOneDropdownOpen = false;
	let converterTwoDropdownOpen = false;

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
			let formattedJSON = JSON.stringify(parsedJSON, null, 4);
			outputTextAreaContent = formattedJSON;
		} catch (error) {
			let formattedJSON = 'Invalid JSON';
			outputTextAreaContent = formattedJSON;
		}
	}

	//Validate function for json, html and xml
	function validateJSON() {
		try {
			let inputJSON = inputTextAreaContent;
			const parsed = JSON.parse(inputJSON);
			alert('Valid JSON');
		} catch (error: any) {
			alert('Invalid JSON input: ' + error.message);
		}
	}

	function validateXML() {
		try {
			let inputXML = inputTextAreaContent;
			const parser = new DOMParser();
			parser.parseFromString(inputXML, 'text/xml');
			alert('Valid XML');
		} catch (error) {
			alert('Invalid XML input');
		}
	}

	function validateHTML() {
		try {
			let inputHTML = inputTextAreaContent;
			const parser = new DOMParser();
			parser.parseFromString(inputHTML, 'text/html');
			alert('Valid HTML');
		} catch (error) {
			alert('Invalid HTML input');
		}
	}

	function validateContent() {
		if (toolType === 'JSON') {
			validateJSON();
		} else if (toolType === 'XML') {
			validateXML();
		} else if (toolType === 'HTML') {
			validateHTML();
		} else {
			alert('Validation is only available for JSON, XML, and HTML.');
		}
	}

	//xml indent
	function indentxml() {
		const spaces = ' '.repeat(parseInt(indentation.value));
		const indentedXml = inputTextAreaContent.replace(/\n/g, `\n${spaces}`);
		outputTextAreaContent = indentedXml;
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
    "employee": {  
        "name":       "Sam",   
        "salary":      56000,   
        "married":    true  
    }  
}  `;
		inputTextAreaContent = samplejson;
	}

	function findLineColumnIndex(event: any) {
		const textAreaType = event.target.getAttribute('data-text-area-type');

		if (textAreaType === 'input') {
			const startPos = inputTextArea.selectionStart;
			const textLines = inputTextAreaContent.substring(0, startPos).split('\n');
			inputTextAreaLnIndex = textLines.length;
			inputTextAreaColIndex = textLines[textLines.length - 1].length;
		} else if (textAreaType === 'output') {
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
		} else if (textAreaType === 'output') {
			outputTextAreaSize = outputTextAreaContent.length;
		}
	}

	// Full screen
	function handleMaximizeInput() {
		const textEditor = document.getElementById('inputTextEditor');
		if (textEditor) {
			if (!document.fullscreenElement) {
				textEditor.requestFullscreen();
			} else {
				document.exitFullscreen();
			}
		}
	}

	function handleMaximizeOutput() {
		const textEditor = document.getElementById('outputTextEditor');
		if (textEditor) {
			if (!document.fullscreenElement) {
				textEditor.requestFullscreen();
			} else {
				document.exitFullscreen();
			}
		}
	}

	function allowTabIndentation(event: any) {
		if (event.key === 'Tab') {
			event.preventDefault();

			let textAreaType = event.target.getAttribute('data-text-area-type');
			if (textAreaType === 'input') {
				const startPos = inputTextArea.selectionStart;
				const endPos = inputTextArea.selectionEnd;
				inputTextAreaContent =
					inputTextAreaContent.substring(0, startPos) +
					'    ' +
					inputTextAreaContent.substring(endPos);

				inputTextArea.value = inputTextAreaContent;

				inputTextArea.selectionStart = startPos + 4;
				inputTextArea.selectionEnd = startPos + 4;
			} else if (textAreaType === 'output') {
				const startPos = outputTextArea.selectionStart;
				const endPos = outputTextArea.selectionEnd;
				outputTextAreaContent =
					outputTextAreaContent.substring(0, startPos) +
					'    ' +
					outputTextAreaContent.substring(endPos);

				outputTextArea.value = outputTextAreaContent;

				outputTextArea.selectionStart = startPos + 4;
				outputTextArea.selectionEnd = startPos + 4;
			}
		}
	}

	function format() {
		if (toolType === 'XML') formatXML();
		else if (toolType === 'JSON') formatJSON();
		else if (toolType === 'HTML') formatHTML();
	}

	function minify() {
		if (toolType === 'XML') minifyXML();
		else if (toolType === 'JSON') minifyJSON();
		else if (toolType === 'HTML') minifyHTML();
	}

	function sampleCode() {
		if (toolType === 'XML') sampleXML();
		else if (toolType === 'JSON') sampleJSON();
		else if (toolType === 'HTML') sampleHTML();
		else if (convertTypeOne == 'JSON') sampleJSON();
	}

	function convert() {
        if (toolType === 'CONVERT') {
            if (convertTypeOne === 'CSV') {
                if (convertTypeTwo === 'JSON') convertCSV2JSON();
                else if (convertTypeTwo === 'XML') convertCSV2XML();
            } else if (convertTypeOne === 'XML') {
                if (convertTypeTwo === 'JSON') convertXML2JSON();
                else if (convertTypeTwo === 'CSV') convertXML2CSV();
            } else if (convertTypeOne === 'JSON') {
                if (convertTypeTwo === 'CSV') convertJSON2CSV();
                else if (convertTypeTwo === 'XML') convertJSON2XML();
            }
        }
    }
    function convertXML2CSV() {
    const inputXML = inputTextAreaContent; // Assuming inputTextAreaContent is a string
    if (!inputXML) {
        console.error('Input XML is empty.');
        outputTextAreaContent = '';
        return;
    }
    const parser = new DOMParser();
    let xmlDoc;
    try {
        xmlDoc = parser.parseFromString(inputXML, 'text/xml');
    } catch (error) {
        console.error('Error while parsing XML:', error);
        outputTextAreaContent = '';
        return;
    }
    if (!xmlDoc || !xmlDoc.documentElement) {
        console.error('Invalid XML format.');
        outputTextAreaContent = '';
        return;
    }
    const rows = xmlDoc.documentElement.children;
    if (!rows || rows.length === 0) {
        console.error('No row elements found in the XML.');
        outputTextAreaContent = '';
        return;
    }
    const headers = Object.keys(rows[0].children)
        .map((key) => rows[0].children[key].tagName)
        .join(',');
    let csvContent = headers + '\n';
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        const values = Object.keys(row.children).map((key) => row.children[key].textContent.trim());
        const rowContent = values.join(',');
        csvContent += rowContent + '\n';
    }
    outputTextAreaContent = csvContent;
}

	function convertCSV2JSON() {
		const inputCSV = inputTextAreaContent;
		const jsonArray = [];

		const rows = inputCSV.split('\n');
		const headers = rows[0].split(',');
		const dataRows = rows.slice(1);

		for (const dataRow of dataRows) {
			const jsonObject: any = {};
			const rowValues = dataRow.split(',');

			for (let i = 0; i < headers.length; i++) {
				jsonObject[headers[i]] = rowValues[i];
			}
			jsonArray.push(jsonObject);
		}

		outputTextAreaContent = JSON.stringify(jsonArray, null, 4);
	}

	function convertCSV2XML() {
		let rows = inputTextAreaContent.split('\n');
		let headers = rows[0].split(',');

		let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
		for (let i = 1; i < rows.length; i++) {
			let values = rows[i].split(',');
			xml += '<row>\n';
			for (let j = 0; j < headers.length; j++) {
				xml += `    <${headers[j]}>${values[j]}</${headers[j]}>\n`;
			}
			xml += '</row>\n';
		}
		xml += '</root>';

		outputTextAreaContent = xml;
	}

	function convertXML2JSON() {
		const inputXML = inputTextAreaContent;
		if (!inputXML) {
			console.error('Input XML is empty.');
			outputTextAreaContent = '';
			return;
		}

		const parser = new DOMParser();
		let xmlDoc;
		try {
			xmlDoc = parser.parseFromString(inputXML, 'text/xml');
		} catch (error) {
			console.error('Error while parsing XML:', error);
			outputTextAreaContent = '';
			return;
		}

		if (!xmlDoc || !xmlDoc.documentElement) {
			console.error('Invalid XML format.');
			outputTextAreaContent = '';
			return;
		}

		const result = {};
		const rootElement = xmlDoc.documentElement;
		if (rootElement.children.length === 0) {
			result[rootElement.tagName] = rootElement.textContent.trim();
		} else {
			const data = [];
			const children = rootElement.children;

			for (let i = 0; i < children.length; i++) {
				const child = children[i];
				const item = {};
				const subChildren = child.children;

				for (let j = 0; j < subChildren.length; j++) {
					const subChild = subChildren[j];
					item[subChild.tagName] = subChild.textContent.trim();
				}

				data.push(item);
			}

			result[rootElement.tagName] = { [children[0].tagName]: data };
		}

		outputTextAreaContent = JSON.stringify(result, null, 4);
	}

	function convertJSON2CSV() {}

	//json to xml
	function jsonToXml(jsonObject: Record<string, any>): string {
		const builder = new xml2js.Builder();
		return builder.buildObject(jsonObject);
	}

	function convertJSON2XML() {
		try {
			let jsonInput = JSON.parse(inputTextAreaContent);
			outputTextAreaContent = jsonToXml({ root: jsonInput });
		} catch (error) {
			outputTextAreaContent = 'Invalid JSON input';
		}
	}

	// delete functionality
	const clearContent = () => {
		inputTextAreaContent = '';
		outputTextAreaContent = '';
	};

	// download functionality
	const downloadFile = () => {
		const element = document.createElement('a');
		let fileExtension;
		let fileName;
		let fileType;

		if (toolType === 'JSON') {
			fileExtension = 'json';
			fileName = 'output.json';
			fileType = 'application/json';
		} else if (toolType === 'XML') {
			fileExtension = 'xml';
			fileName = 'output.xml';
			fileType = 'application/xml';
		} else if (toolType === 'HTML') {
			fileExtension = 'html';
			fileName = 'output.html';
			fileType = 'text/html';
		} else {
			fileExtension = 'txt';
			fileName = 'output.txt';
			fileType = 'text/plain';
		}

		const file = new Blob([outputTextAreaContent], { type: fileType });
		element.href = URL.createObjectURL(file);
		element.download = fileName;
		document.body.appendChild(element);
		element.click();
		document.body.removeChild(element);
	};

	// file upload
	const handleFileUpload = (event) => {
		const file = event.target.files[0];
		const reader = new FileReader();
		reader.onload = (e) => {
			const contents = e.target.result;
			inputTextAreaContent = contents;
		};
		reader.readAsText(file);
	};

	// print functionality
	const printContent = () => {
		window.print();
	};

	// url upload
	const handleURLUpload = async (event) => {
		try {
			let url = prompt('Please Enter URL : ');
			const response = await fetch(url);
			if (!response.ok) {
				alert('Network Error');
			} else {
				const data = await response.text();
				inputTextAreaContent = data;
			}
		} catch (error) {
			console.error('Error : ', error);
		}
	};

	// copy to clipboard
	const handleCopyClipboard = async (event) => {
		const textAreaType = event.currentTarget.getAttribute('data-text-area-type');
		let textCopied = '';

		if (textAreaType === 'input') {
			textCopied = inputTextAreaContent;
		} else if (textAreaType === 'output') {
			textCopied = outputTextAreaContent;
		}

		try {
			await navigator.clipboard.writeText(textCopied);
			alert('Text Copied');
		} catch (error) {
			alert('Error during copy');
		}
	};

	// switch button
	const handleSwitch = () => {
		[convertTypeOne, convertTypeTwo] = [convertTypeTwo, convertTypeOne];
	};
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
	<div
		class="w-full mb-4 border border-gray-400 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600"
	>
		<div class="flex items-center justify-between px-3 py-2 border-b dark:border-gray-600">
			<div class="flex flex-wrap items-center divide-gray-700 sm:divide-x dark:divide-gray-400">
				<div class="flex items-center space-x-1 sm:pr-4">
					<Button
						outline
						color="light"
						class="text-gray-700 cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600 px-3 py-1 rounded text-md font-thin"
					>
						{#if toolType === 'CONVERT'}
							Converter
						{:else}
							{toolType} Formatter
						{/if}
						<ChevronDownSolid size="xs" class="ml-2" /></Button
					>
					<Dropdown bind:open={toolsDropdownOpen}>
						<DropdownItem
							on:click={() => {
								toolsDropdownOpen = false;
								toolType = 'JSON';
							}}>JSON Formatter</DropdownItem
						>
						<DropdownItem
							on:click={() => {
								toolsDropdownOpen = false;
								toolType = 'XML';
							}}>XML Formatter</DropdownItem
						>
						<DropdownItem
							on:click={() => {
								toolsDropdownOpen = false;
								toolType = 'HTML';
							}}>HTML Formatter</DropdownItem
						>
						<DropdownItem
							on:click={() => {
								toolsDropdownOpen = false;
								toolType = 'CONVERT';
							}}>Converter</DropdownItem
						>
					</Dropdown>

					{#if toolType === 'CONVERT'}
						<Button
							outline
							color="light"
							class="text-gray-700 cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600 px-3 py-1 rounded text-md font-thin"
							>{convertTypeOne}<ChevronDownSolid size="xs" class="ml-2" /></Button
						>
						<Dropdown bind:open={converterOneDropdownOpen}>
							<DropdownItem
								on:click={() => {
									converterOneDropdownOpen = false;
									convertTypeOne = 'JSON';
								}}>JSON</DropdownItem
							>
							<DropdownItem
								on:click={() => {
									converterOneDropdownOpen = false;
									convertTypeOne = 'XML';
								}}>XML</DropdownItem
							>
							<DropdownItem
								on:click={() => {
									converterOneDropdownOpen = false;
									convertTypeOne = 'CSV';
								}}>CSV</DropdownItem
							>
						</Dropdown>

						<button
							type="button"
							class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
						>
							<ArrowRightSolid size="sm" />
							<span class="sr-only">Converts to</span>
						</button>
						<Tooltip color="blue" arrow={false}>Converted To</Tooltip>

						<Button
							outline
							color="light"
							class="text-gray-700 cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600 px-3 py-1 rounded text-md font-thin"
							>{convertTypeTwo}<ChevronDownSolid size="xs" class="ml-2" /></Button
						>
						<Dropdown bind:open={converterTwoDropdownOpen}>
							{#each converterList[convertTypeOne] as converterOption}
								<DropdownItem
									on:click={() => {
										converterTwoDropdownOpen = false;
										convertTypeTwo = converterOption;
									}}>{converterOption}</DropdownItem
								>
							{/each}
						</Dropdown>

						<button
							type="button"
							class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
							on:click={handleSwitch}
						>
							<CotateSolid size="sm" />
							<span class="sr-only">Switch</span>
						</button>
						<Tooltip color="blue" arrow={false}>Switch</Tooltip>
					{/if}
				</div>
				<div class="flex items-center space-x-1 sm:pr-4 sm:pl-4">
					<button
						type="button"
						data-text-area-type="input"
						class="px-2 py-1 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
						on:click={sampleCode}
						on:click={findSize}
					>
						Sample
						<span class="sr-only"
							>Sample
							{#if toolType === 'CONVERT'}
								{convertTypeOne}
							{:else}
								{toolType}
							{/if}
							Data</span
						>
					</button>
					<Tooltip color="blue" arrow={false}
						>Sample
						{#if toolType === 'CONVERT'}
							{convertTypeOne}
						{:else}
							{toolType}
						{/if}
						Data</Tooltip
					>
					<input type="file" id="fileInput" class="hidden" on:change={handleFileUpload} />

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
						on:click={() => {
							const input = document.getElementById('fileInput');
							input.click();
						}}
					>
						<FolderOpenSolid size="sm" />
						<span class="sr-only">Upload File</span>
					</button>
					<Tooltip color="blue" arrow={false}>Upload File</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
						on:click={handleURLUpload}
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
						on:click={validateContent}
					>
						<CheckSolid size="sm" />
						<span class="sr-only"
							>Validate
							{#if toolType === 'CONVERT'}
								{convertTypeOne}
							{:else}
								{toolType}
							{/if}
						</span>
					</button>
					<Tooltip color="blue" arrow={false}
						>Validate
						{#if toolType === 'CONVERT'}
							{convertTypeOne}
						{:else}
							{toolType}
						{/if}
					</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
						on:click={printContent}
					>
						<PrintSolid size="sm" />
						<span class="sr-only"
							>Print
							{#if toolType === 'CONVERT'}
								{convertTypeOne}
							{:else}
								{toolType}
							{/if}
						</span>
					</button>
					<Tooltip color="blue" arrow={false}
						>Print
						{#if toolType === 'CONVERT'}
							{convertTypeOne}
						{:else}
							{toolType}
						{/if}
					</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
						on:click={clearContent}
					>
						<TrashBinSolid size="sm" />
						<span class="sr-only">Delete Content</span>
					</button>
					<Tooltip color="blue" arrow={false}>Delete Content</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
						data-text-area-type="input"
						on:click={handleCopyClipboard}
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
						on:click={downloadFile}
					>
						<DownloadSolid size="sm" />
						<span class="sr-only"
							>Download
							{#if toolType === 'CONVERT'}
								{convertTypeOne}
							{:else}
								{toolType}
							{/if}
						</span>
					</button>
					<Tooltip color="blue" arrow={false}
						>Download
						{#if toolType === 'CONVERT'}
							{convertTypeOne}
						{:else}
							{toolType}
						{/if}
					</Tooltip>

					<!-- <label for="dropdown" class="text-white">Space:</label>
					<select
						id="dropdown"
						class="text-white rounded cursor-pointer dark:bg-gray-700 dark:border-gray-600"
						bind:value={spaceoption}
					>
						{#each Tabs as option (option)}
							<option value={option}>{option} Tabs</option>
						{/each}
					</select> -->
				</div>
			</div>
			<button
				type="button"
				class="p-2 text-gray-700 rounded cursor-pointer sm:ml-auto hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
				on:click={handleMaximizeInput}
			>
				<ExpandSolid size="sm" />
				<span class="sr-only">Full screen input</span>
			</button>
			<Tooltip color="blue" arrow={false}>Full Screen</Tooltip>
		</div>
		<div class="px-4 py-2 bg-white dark:bg-gray-800">
			<Label for="editor" class="sr-only">Code Editor</Label>
			<div id="inputTextEditor" class="textarea">
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
					placeholder="{inputTextAreaPlaceholder} Code"
				/>
			</div>
		</div>
		<div
			class="px-4 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-b-lg text-gray-700 dark:text-gray-200 flex justify-start divide-x divide-gray-700 dark:divide-gray-400"
		>
			<p class="pr-4 pl-2">Ln : {inputTextAreaLnIndex}</p>
			<p class="px-4">Col : {inputTextAreaColIndex}</p>
			<p class="px-4">Size : {inputTextAreaSize} B</p>
		</div>
	</div>

	{#if toolType === 'CONVERT'}
		<Button
			color="blue"
			class="ml-1"
			data-text-area-type="output"
			on:click={convert}
			on:click={findSize}
			>Convert
		</Button>
	{:else}
		<Button
			color="blue"
			class="mr-1"
			data-text-area-type="output"
			on:click={format}
			on:click={findSize}
			>Beautify
		</Button>
		<Button
			color="blue"
			class="ml-1"
			data-text-area-type="output"
			on:click={minify}
			on:click={findSize}
			>Minify
		</Button>
		<Button
			color="blue"
			size="5px"
			class="ml-1"
			data-text-area-type="output"
			on:click={indentxml}
			on:click={findSize}
		>
			<label for="indentation">Select Indentation</label>
			<select id="indentation"><option>2</option><option>4</option><option>8</option></select>
		</Button>
	{/if}

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
						<span class="sr-only"
							>Print
							{#if toolType === 'CONVERT'}
								{convertTypeTwo}
							{:else}
								{toolType}
							{/if}
						</span>
					</button>
					<Tooltip color="blue" arrow={false}
						>Print
						{#if toolType === 'CONVERT'}
							{convertTypeTwo}
						{:else}
							{toolType}
						{/if}
					</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
					>
						<TrashBinSolid size="sm" />
						<span class="sr-only"
							>Delete
							{#if toolType === 'CONVERT'}
								{convertTypeTwo}
							{:else}
								{toolType}
							{/if}
						</span>
					</button>
					<Tooltip color="blue" arrow={false}
						>Delete
						{#if toolType === 'CONVERT'}
							{convertTypeTwo}
						{:else}
							{toolType}
						{/if}
					</Tooltip>

					<button
						type="button"
						class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
						data-text-area-type="output"
						on:click={handleCopyClipboard}
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
						<span class="sr-only"
							>Download
							{#if toolType === 'CONVERT'}
								{convertTypeTwo}
							{:else}
								{toolType}
							{/if}
						</span>
					</button>
					<Tooltip color="blue" arrow={false}
						>Download
						{#if toolType === 'CONVERT'}
							{convertTypeTwo}
						{:else}
							{toolType}
						{/if}
					</Tooltip>
				</div>
			</div>
			<button
				type="button"
				class="p-2 text-gray-700 rounded cursor-pointer sm:ml-auto hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
				on:click={handleMaximizeOutput}
			>
				<ExpandSolid size="sm" />
				<span class="sr-only">Full screen output</span>
			</button>
			<Tooltip color="blue" arrow={false}>Full Screen</Tooltip>
		</div>
		<div class="px-4 py-2 bg-white dark:bg-gray-800">
			<Label for="editor" class="sr-only">Code Output</Label>
			<div id="outputTextEditor" class="textarea">
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
					placeholder="{outputTextAreaPlaceholder} Output"
				/>
			</div>
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
