<script lang="ts">
	import { 
		Label, 
		Select, 
		Tooltip,
		Button,
		Dropdown,
		DropdownItem,
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

	export let data;

	// Based on your project, you will get 3 options in type
	// if type === 'JSON' --> TEAM JSON PARSER
	// if type === 'HTML' --> TEAM HTML PARSER
	// if type === 'XML' --> TEAM XML PARSER
	let type = 'JSON';

	let dropdownOpen = false;

	// This the input you get from textarea
	// MANIPULATE THIS - and text will get disaplyed in same text area
	// as it is binded
	let inputTextAreaContent = '';
	let outputTextAreaContent = '';

	let bitCount = 0;
	let lineIndex = 1;
	let colIndex = 0;
	let inputTextArea: HTMLTextAreaElement;
	let outputTextArea: HTMLTextAreaElement;

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

	}

	function formatJSON() {

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

	}

	function minifyHTML() {

	}

	function findLineColumnIndex() {
		let textLines = inputTextAreaContent.substring(0, inputTextArea.selectionStart).split('\n');
		lineIndex = textLines.length;
		colIndex = textLines[textLines.length - 1].length;
	}

	function findBitCount() {
		bitCount = inputTextAreaContent.length;
	}

	function format() {
		if (type === 'XML')
			formatXML()
		else if (type === 'JSON')
			formatJSON()
		else if (type === 'HTML')
			formatHTML()
	}

	function minify() {
		if (type === 'XML')
			minifyXML()
		else if (type === 'JSON')
			minifyJSON()
		else if (type === 'HTML')
			minifyHTML()
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
	<div class="w-full mb-4 border border-gray-400 rounded-lg bg-gray-100 dark:bg-gray-700 dark:border-gray-600">
		<div class="flex items-center justify-between px-3 py-2 border-b dark:border-gray-600">
			<div class="flex flex-wrap items-center divide-gray-700 sm:divide-x dark:divide-gray-400">
				<div class="flex items-center space-x-1 sm:pr-4">
					<Button outline color="light" class="text-gray-700 cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600 px-3 py-1 rounded text-md font-thin">{type} Formatter<ChevronDownSolid size="xs" class="ml-2" /></Button>
					<Dropdown bind:open={dropdownOpen}>
						<DropdownItem on:click={() => {
							dropdownOpen = false;
							type = 'JSON';
						}}>JSON Formatter</DropdownItem>
						<DropdownItem on:click={() => {
							dropdownOpen = false;
							type = 'XML';
						}}>XML Formatter</DropdownItem>
						<DropdownItem on:click={() => {
							dropdownOpen = false;
							type = 'HTML';
						}}>HTML Formatter</DropdownItem>
					</Dropdown>
					
					<button
						type="button"
						class="px-2 py-1 text-gray-700 rounded cursor-pointer hover:text-blue-800 hover:bg-gray-300 dark:text-gray-200 dark:hover:text-white dark:hover:bg-gray-600"
					>
						Sample
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
				on:keyup={findBitCount}
				on:mouseup={findLineColumnIndex}
				rows="8"
				class="block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
				placeholder="{type} Code"
			/>
		</div>
		<div
			class="px-4 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-b-lg text-gray-700 dark:text-gray-200 flex justify-start divide-x divide-gray-700 dark:divide-gray-400"
		>
			<p class="pr-4 pl-2">Ln : {lineIndex}</p>
			<p class="px-4">Col : {colIndex}</p>
			<p class="px-4">Size : {bitCount} B</p>
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
					<span
						class="px-2 py-1 text-gray-700 rounded dark:text-gray-200"
					>
						Output
					</span>
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
				on:keyup={findBitCount}
				on:mouseup={findLineColumnIndex}
				rows="8"
				class="block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
				placeholder="{type} Output"
			/>
		</div>
		<div
			class="px-4 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-b-lg text-gray-700 dark:text-gray-200 flex justify-start divide-x divide-gray-700 dark:divide-gray-400"
		>
			<p class="pr-4 pl-2">Ln : {lineIndex}</p>
			<p class="px-4">Col : {colIndex}</p>
			<p class="px-4">Size : {bitCount} B</p>
		</div>
	</div>
</div>