<script lang="ts">

	import { Button } from 'flowbite-svelte';
	import jsPDF from 'jspdf';
	import Intro from '$lib/Intro.svelte';

	export let data;

	var lines = 1;

	var output;

    function generateoutput(input) {
        var inputLines = input.target.value.split('\n').filter(line => line.trim() !== '');
        var selectedLines = [];

        if (lines > inputLines.length) {
            lines = inputLines.length;
        }

        while (selectedLines.length < lines) {
            var randomIndex = Math.floor(Math.random() * inputLines.length);
            var randomLine = inputLines[randomIndex];
            if (!selectedLines.includes(randomLine)) {
                selectedLines.push(randomLine);
            }
        }

        output = selectedLines.join('\n');
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
			var filename = "DevStar.txt";
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
			var doc = new jsPDF();
			doc.text(output, 20, 20);
			doc.save('DevStaroutput.pdf');
		}
	}

</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">

			<div>
				<label for="" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Number of Lines</label>
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<input type="number" id="" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					bind:value={lines}>
				</div>
			</div>

			<div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden" id="boxarea">

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea1">
					<textarea placeholder="Enter Text" id="textbox" rows="8" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					on:input={generateoutput}/>
				</div>

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea2">
					<textarea placeholder="Result" id="textbox" rows="8" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
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

	#textbox{
		resize: none;
	}

	#boxarea{
		margin-top:20px;
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