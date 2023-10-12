<script lang="ts">
	
	import { Button } from 'flowbite-svelte';
	import jsPDF from 'jspdf';
	import Intro from '$lib/Intro.svelte';

	export let data;
	
	export const caseConversionOptions = [
		'Text Case Inversion',
		'Sentence Case',
		'Lower Case',
		'Upper Case',
		'Capitalize Case',
		'De-Capitalize Case',
		'Snake Case',
		'Camel Case',
		'Kebab Case'
	];
	
	let input = "";
	let output = "";
	let selectedValue = '';

	function handleChange(event: Event) {
		const selectElement = event.target as HTMLSelectElement;
		selectedValue = selectElement.value;
		handleOptionChange(selectedValue);
	}

	const inputElement = document.querySelector("#input-textarea-id");
	
	if (inputElement) {
		inputElement.addEventListener("input", handleInput);
	}

	function handleInput(event: Event) {
		const inputElement = document.querySelector<HTMLInputElement>("#input-textarea-id");
		if (inputElement) {
			input = inputElement.value;
		}

		handleOptionChange((document.querySelector<HTMLSelectElement>("select") as HTMLSelectElement).value);
	}

	function handleOptionChange(selectedOption: string) {
		switch (selectedOption) {
			case "Text Case Inversion":
			output = input
				.split("")
				.map((char) =>
				char === char.toLowerCase()
					? char.toUpperCase()
					: char.toLowerCase()
				)
				.join("");
			break;
			case "Sentence Case":
			output = input.charAt(0).toUpperCase() + input.slice(1);
			break;
			case "Upper Case":
			output = input.toUpperCase();
			break;
			case "Lower Case":
			output = input.toLowerCase();
			break;
			case "Capitalize Case":
			output = input
				.split(/[\s\n]+/)
				.map(
				(word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
				)
				.join(" ");
			break;
			case "De-Capitalize Case":
			output = input
				.split(/[\s\n]+/)
				.map((word) => word.charAt(0).toLowerCase() + word.slice(1))
				.join(" ");
			break;
			case "Snake Case":
			output = input?.toLowerCase().replace(/\s+/g, "_");
			break;
			case "Camel Case":
			output = input
				?.toLowerCase()
				.replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
			break;
			case "Kebab Case":
			output = input?.toLowerCase().replace(/\s+/g, "-");
		}
	}
  
	function copyText() {
		if (output.length > 0) {
			var textarea = document.createElement("textarea");
			textarea.value = output;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
		}
	}

	function downloadText() {
		if (output.length > 0) {
			var filename = "DevStarPalindrome.txt";
			var blob = new Blob([output], { type: 'text/plain' });
			var url = window.URL.createObjectURL(blob);
			
			var a = document.createElement('a');
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();
			
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		}
	}
  
	function downloadPDF() {
		const doc = new jsPDF();
		doc.text(output, 20, 20);
		doc.save('DevStarPalindrome.pdf');
	}
	
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg" id="box">

			<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea1">
				<select on:change={handleChange} 
					class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
					<option>Select Conversion</option>
					{#each caseConversionOptions as option}
					<option value={option}>{option}</option>
					{/each}
				</select>	
			</div>
						
			<div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden" id="textbox">
				
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea1">
					<textarea placeholder="Enter Text" id="input-textarea-id" rows="8" name="message" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					on:input={handleInput}/>
				</div>

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea2">
					<textarea readOnly rows="8" placeholder="Result" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					bind:value={output}/>
				</div>

			</div>

			<div id="buttonArea">
				<Button color="blue" on:click={copyText}>Copy</Button>
				<Button color="blue" on:click={downloadText}>Download as txt</Button>
				<Button color="blue" on:click={downloadPDF}>Download as pdf</Button>
			</div>

		</div>
	</div>
</section>

<style>	

	#textbox > div > textarea{
		resize: none;
	}

	#textbox{
		margin-top: 20px;
		gap:20px;
	}

	#buttonArea {
		margin-top: 30px;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 30px; /* Adjust the gap between buttons as needed */
	}

	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}

</style>