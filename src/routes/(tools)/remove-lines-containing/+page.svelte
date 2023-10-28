<script lang="ts">

	import { Button } from 'flowbite-svelte';
	import jsPDF from 'jspdf';
	import Intro from '$lib/Intro.svelte';

	export let data;
	let text = "";
	let keyword = "";
	let filteredText = "";
	let ignoreCase = false;

	function handleInput(event) {
		const newText = event.target.value;
	}

	$: {
		const lines = text.split('\n');
		if (ignoreCase) {
			const keywordLower = keyword.toLowerCase();
			filteredText = lines.filter(line => !line.toLowerCase().includes(keywordLower)).join('\n');
		} else {
			filteredText = lines.filter(line => !line.includes(keyword)).join('\n');
		}
	}

	function copyText() {
		if (filteredText.length > 0) {
			var textarea = document.createElement("textarea");
			textarea.value = `FilteredText:  ${filteredText}`;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
		}
	}

	function downloadText() {
		if (text.length > 0) {
			const combinedText = `InputText: ${text}\n\nKeyword to filter lines: ${keyword}\n\nFilteredText: ${filteredText}`;
			const textBlob = new Blob([combinedText], { type: 'text/plain' });

			const anchor = document.createElement('a');
			anchor.href = URL.createObjectURL(textBlob);
			anchor.download = 'devstar_output.txt';
			anchor.click();
			URL.revokeObjectURL(anchor.href);
		}
	}

	function downloadPDF() {
		if (text.length > 0) {
			const pdf = new jsPDF();

			const lines = text.split('\n');
			
			const lineSpacing = 10; // Adjust the spacing between lines as needed

			let y = 10; // Initial y-coordinate
			pdf.text("InputText:", 10, y);
			// Add text for each line
			lines.forEach(line => {
				pdf.text(line, 20, y+10);
				y += lineSpacing; 
			});
			
			pdf.text("Keyword to filter lines:", 10, y+10);
			y += lineSpacing; // Increase y-coordinate for the next line
			pdf.text(keyword, 70, y);
			
			pdf.text("FilteredText:", 10, y+10);
			y += lineSpacing; // Increase y-coordinate for the next line
			pdf.text(filteredText, 50, y+10);

			pdf.save("devstar_output.pdf");
		}
	}

</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">

			<div class="gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea placeholder="Enter keyword to apply filter to the text" rows="1" class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						on:input={handleInput} bind:value={keyword}/>
				</div >

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<ul class="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex dark:bg-gray-700 dark:border-gray-600 dark:text-white">
						<li class="w-full border-b border-gray-200 sm:border-b-0 sm:border-r dark:border-gray-600">
							<div class="flex items-center pl-3">
								<input id="vue-checkbox-list" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500"
								bind:checked={ignoreCase}>
								<label for="vue-checkbox-list" class="w-full py-2.5 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Ignore Case</label>
							</div>
						</li>
					</ul>
				</div>
					
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea placeholder="Enter Text" rows="8" class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					bind:value={text} on:input={handleInput}/>
				</div>

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea readonly placeholder="Result" rows="8" class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
						bind:value={filteredText} on:input={handleInput}/>
				</div>

			</div>

			<div class="items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden">
				<div class="mt-8 gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-3 overflow-hidden">
					<Button color="blue" on:click={copyText}>Copy</Button>
					<Button color="blue" on:click={downloadText}>Download as txt</Button>
					<Button color="blue" on:click={downloadPDF}>Download as pdf</Button>
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



	