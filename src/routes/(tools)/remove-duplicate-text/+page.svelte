<script lang="ts">
	
	import jsPDF from 'jspdf';
	import Intro from '$lib/Intro.svelte';
	import { Button } from 'flowbite-svelte';

	export let data;

    export const removeDuplicateOptions = [
		'Remove Duplicate Words',
		'Remove Duplicate Lines',
	]

	var output;
	var selectedOption;

	function removeDuplicates(input) {
		switch (selectedOption) {

			case "Remove Duplicate Words":
			var sentences = input.target.value.split('.'); // Split input text into sentences
				var cleanedSentences = sentences.map(sentence => {
				var words = sentence.split(' '); // Split sentence into words
				var uniqueWords = Array.from(new Set(words)); // Remove duplicate words
				return uniqueWords.join(' '); // Join unique words back into sentence
			});

			output = cleanedSentences.join('.');
			break;

			case "Remove Duplicate Lines":
			var lines = input.target.value.split('\n'); // Split input text into lines
			var uniqueLines = Array.from(new Set(lines)); // Remove duplicates
			output = uniqueLines.join('\n');
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
				<select bind:value={selectedOption} 
					class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
					<option>Select Option</option>
					{#each removeDuplicateOptions as option}
					<option value={option}>{option}</option>
					{/each}
				</select>	
			</div>
						
			<div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden" id="textbox">
				
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea1">
					<textarea placeholder="Enter Text" id="input-textarea-id" rows="8" name="message" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					on:input={removeDuplicates}/>
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