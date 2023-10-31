<script lang="ts">
	
	import { Button } from 'flowbite-svelte';
	import jsPDF from 'jspdf';
	import Intro from '$lib/Intro.svelte';

	export let data;
	
	export const caseConversionOptions = [
		'Unicode Encoder',
		'Unicode Decoder',
		
	];
	
	var output;

	var selectedOption;


	function switchcase(input) {
		switch (selectedOption) {

			case "Unicode Encoder":
				output = input.target.value
					.split("")
					.map((char) => char.charCodeAt(0))
					.map((code)=>`U#+${code.toString(16)}`)
					.join(" ");
				break;

			case "Unicode Decoder":
				output = input.target.value
					.split(" ")
					.map((code) => String.fromCodePoint(parseInt(code.slice(3), 16)))
					.join("");
		  		break;

			default:
				output = input.target.value;
				break;
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
		const doc = new jsPDF();
		doc.text(output, 20, 20);
		doc.save('devstar_output.pdf');
	}
	
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">

			<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
				<select bind:value={selectedOption}
					class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
					{#each caseConversionOptions as option}
					<option value={option}>{option}</option>
					{/each}
				</select>	
			</div>
						
			<div class="mt-4 gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
				
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea placeholder="Enter Text" id="input-textarea-id" rows="8" name="message" class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					on:input={switchcase}/>
				</div>

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea readOnly rows="8" placeholder="Result" class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					bind:value={output}/>
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