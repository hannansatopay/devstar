<script lang="ts">

	import { Button } from 'flowbite-svelte';
	import jsPDF from 'jspdf';
	import Intro from '$lib/Intro.svelte';

	export let data;

	var output = "";
	var charCount = "";
	var wordCount = "";
	var sentenceCount = "";
	var paragraphCount = "";
	var mostCommonCharsJoint = "";
	var charFrequency = "";
	var mostCommonWordsJoint = "";
	var wordFrequency = "";
	var averageWordLength = "";
	var readingTime = "";

	function analyzeText(input) {
		// Character Count
		charCount = input.target.value.length;

		// Word Count
		wordCount = input.target.value.split(/\s+/).filter(word => word !== '').length;

		// Sentence Count
		sentenceCount = input.target.value.split(/[.!?]+/).filter(sentence => sentence !== '').length;

		// Paragraph Count
		paragraphCount = input.target.value.split('\n').filter(paragraph => paragraph !== '').length;

		// Most Common Characters and Character Frequency (ignoring spaces)
		const charMap = {};
		const textWithoutSpaces = input.target.value.replace(/\s/g, ''); // Remove spaces from the text
		textWithoutSpaces.split('').forEach(char => {
			charMap[char] = (charMap[char] || 0) + 1;
		});
		var mostCommonChars = Object.keys(charMap).sort((a, b) => charMap[b] - charMap[a]).slice(0, 5);
		mostCommonCharsJoint= mostCommonChars.join(', ');
		charFrequency = mostCommonChars.map(char => `${char}: ${charMap[char]}`).join(', ');

		// Most Common Words and Word Frequency
		const wordMap = {};
		input.target.value.split(/\s+/).forEach(word => {
			wordMap[word] = (wordMap[word] || 0) + 1;
		});
		var mostCommonWords = Object.keys(wordMap).sort((a, b) => wordMap[b] - wordMap[a]).slice(0, 5);
		mostCommonWordsJoint = mostCommonWords.join(', ');
		wordFrequency = mostCommonWords.map(word => `${word}: ${wordMap[word]}`).join(', ');

		// Average Word Length
		const totalWordLength = input.target.value.split(/\s+/).reduce((acc, word) => acc + word.length, 0);
		averageWordLength = (totalWordLength / wordCount).toFixed(2);

		// Reading Time (Assuming average reading speed is 200 words per minute)
		var readingTimeMinutes = wordCount / 200;
		var readingTimeHours = readingTimeMinutes / 60;
		readingTime = `${Math.floor(readingTimeHours)} hours and ${Math.ceil(readingTimeMinutes)} minutes`;

		output = `Character Count: ${charCount}\nWord Count: ${wordCount}\nSentence Count: ${sentenceCount}\nParagraph Count: ${paragraphCount}\nMost Common Characters: ${mostCommonCharsJoint}\nCharacter Frequency: ${charFrequency}\nMost Common Words: ${mostCommonWordsJoint}\nWord Frequency: ${wordFrequency}\nAverage Word Length: ${averageWordLength}\nReading Time: ${readingTime}\n`;

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
			var filename = "devstar_output.txt";
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
		if (output.length > 0) {
			const doc = new jsPDF();
			doc.text(output, 20, 20);
			doc.save('devstar_output.pdf');
		}
	}

</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">

			<div class="gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">

				<div class="w-full border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
				
					<div class="px-4 py-1 bg-white rounded-t-lg dark:bg-gray-800">
						<textarea id="comment" rows=24 class="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400" 
						placeholder="Enter Text..." on:input={analyzeText}></textarea>
					</div>
	
					<div class="items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden">
						<div class="m-2 gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-3 overflow-hidden">
							<Button color="blue" on:click={copyText}>Copy</Button>
							<Button color="blue" on:click={downloadText}>Download as txt</Button>
							<Button color="blue" on:click={downloadPDF}>Download as pdf</Button>
						</div>	
					</div>	
								
				</div>
	
				<div class="relative overflow-x-auto rounded-lg">
					<table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
						<thead class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
							<tr>
								<th scope="col" class="px-6 py-3">
									Parameter
								</th>
								<th scope="col" class="px-6 py-3">
									Value
								</th>
							</tr>
						</thead>
						<tbody>
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
								<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
									Character Count
								</th>
								<td class="px-6 py-4">
									{charCount}
								</td>
							</tr>
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
								<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
									Word Count
								</th>
								<td class="px-6 py-4">
									{wordCount}
								</td>
							</tr>
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
								<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
									Sentence Count
								</th>
								<td class="px-6 py-4">
									{sentenceCount}
								</td>
							</tr>
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
								<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
									Paragraph Count
								</th>
								<td class="px-6 py-4">
									{paragraphCount}
								</td>
							</tr>
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
								<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
									Most Common Characters
								</th>
								<td class="px-6 py-4">
									{mostCommonCharsJoint}
								</td>
							</tr>
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
								<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
									Character Frequency
								</th>
								<td class="px-6 py-4">
									{charFrequency}
								</td>
							</tr>
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
								<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
									Most Common Words
								</th>
								<td class="px-6 py-4">
									{mostCommonWordsJoint}
								</td>
							</tr>
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
								<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
									Word Frequency
								</th>
								<td class="px-6 py-4">
									{wordFrequency}
								</td>
							</tr>
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
								<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
									Average Word Length
								</th>
								<td class="px-6 py-4">
									{averageWordLength}
								</td>
							</tr>
							<tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
								<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
									Reading Time
								</th>
								<td class="px-6 py-4">
									{readingTime}
								</td>
							</tr>
						</tbody>
					</table>
				</div>
				
			</div>
			
		</div>
	</div>
</section>

<style>	

	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}

</style>