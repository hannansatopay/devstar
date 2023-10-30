<script lang="ts">
	import { Label, Tooltip, Button, Dropdown, DropdownItem, Select } from 'flowbite-svelte';

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
		CompressSolid
	} from 'flowbite-svelte-icons';

	import Intro from '$lib/Intro.svelte';
	import Copy from '$lib/Copy.svelte';
	import xmlFormat from 'xml-formatter';
	import prettify from 'html-prettify';
	import xml2js from 'xml2js';
	import jsBeautify from 'js-beautify';
	

	export let data;

	let toolType = 'JSON';
	let convertTypeOne = 'CSV';
	let convertTypeTwo = 'JSON';

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
	let maximiseInputTextAreaToggle = false;
	let maximiseOutputTextAreaToggle = false;
	
	let tabs = 1;
	let tabsList = [
		{ value: 1, name: 'Tab Size: 1' },
		{ value: 2, name: 'Tab Size: 2' },
		{ value: 3, name: 'Tab Size: 3' }
	];

	function formatXML() {
		let inputXML = inputTextAreaContent;
		let formattedXML = xmlFormat(inputXML, {
			indentation: '    '.repeat(tabs),
			filter: (node) => node.type !== 'Comment',
			collapseContent: true,
			lineSeparator: '\n'
		});
		outputTextAreaContent = formattedXML;
	}

	function formatHTML() {
		let inputHTML = inputTextAreaContent;
		const prettifyOptions = {
			char: ' ',
			count: 4 * tabs
  		};
		let formattedHTML = prettify(inputHTML, prettifyOptions);
		outputTextAreaContent = formattedHTML;
	}
	function formatjs() {
		let inputJS = inputTextAreaContent;
		let beautifyOptions = {
    		"indent_size": tabs,
    		"indent_char": "    ",
		};
		let formattedJS = jsBeautify(inputJS, beautifyOptions);
		outputTextAreaContent = formattedJS;
	}

	function formatJSON() {
		try {
			let inputJSON = inputTextAreaContent;
			let parsedJSON = JSON.parse(inputJSON);
			let formattedJSON = JSON.stringify(parsedJSON, null, 4 * tabs);
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

	function minifyJS() {
		let inputJS = inputTextAreaContent;
		let codeWithoutComments = inputJS.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '');
  		let minifiedJS = codeWithoutComments.replace(/\s+/g, ' ').trim();
		outputTextAreaContent = minifiedJS;
	}

	function sampleHTML() {
		let samplehtml = `<!DOCTYPE html>
<html>
  <head>
    <title>Largest companies by market cap — US Stock Market</title>
    <meta charset="UTF-8">
  </head>
  <body>
	<h1>Employees :</h1>
	<h2>ID : 1</h2>
	<h3>First Name : Tom</h3>
	<h4>Last Name : Cruise</h4>
  </body>
</html>`;
		inputTextAreaContent = samplehtml;
	}

	function sampleXML() {
		let samplehtml = `<?xml version="1.0" encoding="UTF-8" ?>
<employees>
	<employee>
		<id>1</id>
		<firstName>Tom</firstName>
		<lastName>Cruise</lastName>
	</employee>
</employees>`;
		inputTextAreaContent = samplehtml;
	}

	function sampleJSON() {
		let samplejson = `{
  "employees": {
    "employee": [
      {
        "id": "1",
        "firstName": "Tom",
        "lastName": "Cruise"
      }
    ]
  }
}`;
		inputTextAreaContent = samplejson;
	}

	function sampleJS() {
		let samplejs = `function addNumbers(a, b) {return a + b;};
console.log('this is just and sample code');
const number1 = 5;
const number2 = 7;
const sum = addNumbers(number1, number2);`;
		inputTextAreaContent = samplejs;
	}

	function sampleCSV() {
		let samplecsv =
			'phone,os,price,storage\n' +
			'iPhone 15 Pro Max,IOS,$1299,256GB\n' +
			'Pixel 8 Pro,Android,$899,256GB\n' +
			'Samsung 23 Ultra,Android,$1199,256GB';
		inputTextAreaContent = samplecsv;
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

	function handleMaximiseScreen(event: any) {
		const textAreaType = event.currentTarget.getAttribute('data-text-area-type');
		let inputEditorWindow: any = document.getElementById("input-editor-window");
		let outputEditorWindow: any = document.getElementById("output-editor-window");
		
		if (textAreaType === 'input') {
			if (maximiseInputTextAreaToggle === false) {
				maximiseInputTextAreaToggle = true;
				outputEditorWindow.style.display = "none";
				inputTextArea.style.height = "60vh";
			}
			else {
				maximiseInputTextAreaToggle = false;
				outputEditorWindow.style.display = "block";
				inputTextArea.style.height = "25vh";
			}
		} else if (textAreaType === 'output') {
			if (maximiseOutputTextAreaToggle === false) {
				maximiseOutputTextAreaToggle = true;
				inputEditorWindow.style.display = "none";
				outputTextArea.style.height = "60vh";
			}
			else {
				maximiseOutputTextAreaToggle = false;
				inputEditorWindow.style.display = "block";
				outputTextArea.style.height = "25vh";
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
		else if (toolType === 'JS') formatjs();
	}

	function minify() {
		if (toolType === 'XML') minifyXML();
		else if (toolType === 'JSON') minifyJSON();
		else if (toolType === 'HTML') minifyHTML();
		else if (toolType === 'JS') minifyJS();
	}

	function sampleCode() {
		if (toolType === 'XML') sampleXML();
		else if (toolType === 'JSON') sampleJSON();
		else if (toolType === 'HTML') sampleHTML();
		else if (toolType === 'JS') sampleJS();
		else if (convertTypeOne == 'JSON') sampleJSON();
		else if (convertTypeOne == 'XML') sampleXML();
		else if (convertTypeOne == 'CSV') sampleCSV();
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

		outputTextAreaContent = JSON.stringify(jsonArray, null, 4 * tabs);
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

		outputTextAreaContent = JSON.stringify(result, null, 4 * tabs);
	}

	function flattenJSON(jsonObj, prefix = '') {
		let flat = {};
		for (const key in jsonObj) {
			if (typeof jsonObj[key] === 'object') {
				if (Array.isArray(jsonObj[key])) {
					jsonObj[key].forEach((item, index) => {
						const nested = flattenJSON(item, prefix + key + index + '.');
						flat = { ...flat, ...nested };
					});
				} else {
					const nested = flattenJSON(jsonObj[key], prefix + key + '.');
					flat = { ...flat, ...nested };
				}
			} else {
				flat[prefix + key] = jsonObj[key];
			}
		}
		return flat;
	}

	function convertJSON2CSV() {
		const jsonInput = inputTextAreaContent;
		let jsonObject;
		try {
			jsonObject = JSON.parse(jsonInput);
		} catch (error) {
			outputTextAreaContent = `Input is empty.`;
			return;
		}
		if (Array.isArray(jsonObject)) {
			if (jsonObject.length > 0) {
				const flatData = jsonObject.map((row) => flattenJSON(row));
				const keys = Object.keys(flatData[0]);
				const csv = [keys.join(',')]
					.concat(flatData.map((row) => keys.map((key) => row[key]).join(',')))
					.join('\n');
				outputTextAreaContent = csv;
			} else {
				outputTextAreaContent = 'Error: The JSON array is empty.';
			}
		} else if (typeof jsonObject === 'object') {
			const flatObject = flattenJSON(jsonObject);
			const keys = Object.keys(flatObject);
			const csv = [keys.join(','), keys.map((key) => flatObject[key]).join(',')].join('\n');
			outputTextAreaContent = csv;
		} else {
			outputTextAreaContent = 'Error';
		}
	}

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
		} else if (toolType === 'JS') {
			fileExtension = 'js';
			fileName = 'output.js';
			fileType = 'text/js';
		} 
		else {
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

	$: {
		if (toolType && convertTypeOne) {
			clearContent();
		}
	}
</script>

{ #if maximiseInputTextAreaToggle == false && maximiseOutputTextAreaToggle == false }
	<Intro heading={data.meta.title} description={data.meta.description} />
{ /if }

<div class="py-8 px-40 mx-auto">
	<div id="input-editor-window" class="mb-4 border border-gray-400 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
		<div class="flex items-center justify-between px-3 py-2 border-b dark:border-gray-600">
			<div class="flex flex-wrap items-center divide-gray-700 sm:divide-x dark:divide-gray-400">
				<div class="flex items-center space-x-1 sm:pr-4">
					<Button
						outline
						color="light"
						class="text-gray-700 cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600 px-3 py-1 rounded text-md font-thin">
						{#if toolType === 'CONVERT'}
							Converter
						{:else}
							{toolType} Formatter
						{/if}
						<ChevronDownSolid size="xs" class="ml-2" /></Button>
					<Dropdown bind:open={toolsDropdownOpen} class="w-40 h-48 overflow-y-auto">
						<DropdownItem
							on:click={() => {
								toolsDropdownOpen = false;
								toolType = 'JSON';
							}}>JSON Formatter</DropdownItem>
						<DropdownItem
							on:click={() => {
								toolsDropdownOpen = false;
								toolType = 'XML';
							}}>XML Formatter</DropdownItem>
						<DropdownItem
							on:click={() => {
								toolsDropdownOpen = false;
								toolType = 'HTML';
							}}>HTML Formatter</DropdownItem>
						<DropdownItem
							on:click={() => {
								toolsDropdownOpen = false;
								toolType ='JS';
							}}>JS Formatter</DropdownItem>
						<DropdownItem
							on:click={() => {
								toolsDropdownOpen = false;
								toolType = 'CONVERT';
							}}>Converter</DropdownItem>
					</Dropdown>

					{#if toolType === 'CONVERT'}
						<Button
							outline
							color="light"
							class="text-gray-700 cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600 px-3 py-1 rounded text-md font-thin"
							>{convertTypeOne}<ChevronDownSolid size="xs" class="ml-2" /></Button>
						<Dropdown bind:open={converterOneDropdownOpen}>
							<DropdownItem
								on:click={() => {
									converterOneDropdownOpen = false;
									convertTypeOne = 'JSON';
								}}>JSON</DropdownItem>
							<DropdownItem
								on:click={() => {
									converterOneDropdownOpen = false;
									convertTypeOne = 'XML';
								}}>XML</DropdownItem>
							<DropdownItem
								on:click={() => {
									converterOneDropdownOpen = false;
									convertTypeOne = 'CSV';
								}}>CSV</DropdownItem>
						</Dropdown>

						<button
							type="button"
							class="p-2 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600">
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
				</div>
			</div>
			<button
				type="button"
				class="p-2 text-gray-700 rounded cursor-pointer sm:ml-auto hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
				data-text-area-type="input"
				on:click={handleMaximiseScreen}
			>	
				{ #if maximiseInputTextAreaToggle === false }
					<ExpandSolid size="sm" />
				{ :else }
					<CompressSolid size="sm" />
				{ /if }
				<span class="sr-only">Full screen input</span>
			</button>
			<Tooltip color="blue" arrow={false}>
				{ #if maximiseInputTextAreaToggle === false }
					Maximise
				{ :else }
					Minimise
				{ /if }</Tooltip>
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

	{ #if toolType === 'CONVERT' }
		<Button
			color="blue"
			class="ml-1"
			data-text-area-type="output"
			on:click={convert}
			on:click={findSize}
			>Convert
		</Button>
	{ :else }
		{ #if maximiseOutputTextAreaToggle === false }
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
		{ /if }
	{ /if }

	<div id="output-editor-window" class="mt-4 border border-gray-400 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
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
				data-text-area-type="output"
				on:click={handleMaximiseScreen}
			>
			{ #if maximiseOutputTextAreaToggle === false }
				<ExpandSolid size="sm" />
			{ :else }
				<CompressSolid size="sm" />
			{ /if }
				<span class="sr-only">Full screen output</span>
			</button>
			<Tooltip color="blue" arrow={false}>
				{ #if maximiseOutputTextAreaToggle === false }
					Maximise
				{ :else }
					Minimise
				{ /if }
			</Tooltip>
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
			class="px-4 py-1 text-sm dark:bg-gray-700 rounded-b-lg text-gray-700 dark:text-gray-200 flex justify-start divide-x divide-gray-700 dark:divide-gray-400"
		>
			<p class="pr-4 pl-2">Ln : {outputTextAreaLnIndex}</p>
			<p class="px-4">Col : {outputTextAreaColIndex}</p>
			<p class="px-4">Size : {outputTextAreaSize} B</p>
			<p class="px-4"><Select class="py-0 w-32 pr-0 text-gray-700 dark:text-gray-200" items={tabsList} bind:value={tabs} on:change={format} /></p>
		</div>
	</div>
</div>
