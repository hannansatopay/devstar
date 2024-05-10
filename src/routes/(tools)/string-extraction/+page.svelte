<script lang="ts"> 

  import { Button } from 'flowbite-svelte';
  import Intro from '$lib/Intro.svelte';
  import jsPDF from 'jspdf';
  
  export let data;

  let inputString = '';
  let startIndex = 0;
  let endIndex = 0;
  let extractedSubstring = '';

  function extractSubstring() {
    // Check if startIndex and endIndex are within valid bounds
    if (startIndex >= 0 && endIndex >= 0 && endIndex >= startIndex && endIndex <= inputString.length) {
      extractedSubstring = inputString.substring(startIndex, endIndex);
    } else {
      extractedSubstring = 'Invalid indices';
    }
  }

  function downloadPDF() {
    const doc = new jsPDF();
    doc.text(`Input String: ${inputString}`, 20, 20);
    doc.text(`Start Imdex: ${startIndex}`, 20, 30);
    doc.text(`End Index: ${endIndex}`, 20, 40);
    doc.text(`Extracted Substring: ${extractedSubstring}`, 20, 40);
    doc.save('Extracted Substring.pdf');
  }

  function copyText() {
    if (inputString.length > 0) {
      var textarea = document.createElement("textarea");
      textarea.value = extractedSubstring;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }

  function downloadText() {
    if (inputString.length > 0) {
      var filename = "Extracted Substring.txt";
      var content = `Input String: ${inputString}\nStart Imdex: ${startIndex}\nEnd Index: ${endIndex}\nExtracted Substring: ${extractedSubstring}`;

      var blob = new Blob([content], { type: 'text/plain' });
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

</script>
  
<Intro heading={data.meta.title} description={data.meta.description} />
  
<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
			<form>
	
				<div class="grid gap-6 mb-6 md:grid-cols-2">

					<div>
						<label for="" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start Index</label>
						<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
							<input type="number" id="" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							bind:value={startIndex} on:change={extractSubstring} placeholder="" required>
						</div>
					</div>

					<div>
						<label for="" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">End Index</label>
						<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
							<input type="number" id="" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							bind:value={endIndex} on:change={extractSubstring} placeholder="" required>
						</div>
					</div>
 
				</div>
        <div class="grid gap-6 mb-6 md:grid-cols-2">

				<div>
					<label for="" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Input String</label>
					<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
						<textarea placeholder="Input String" id="textbox" rows="4" bind:value={inputString} class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" on:input={extractSubstring}/>
					</div>
				</div>

				<div id="boxarea">
					<label for="" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Extracted Substring</label>
					<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
						<textarea readOnly placeholder="Result" id="textbox" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						bind:value={extractedSubstring}/>
					</div>
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
    gap:20px;
  }

  .card {
    box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
  }

  :is(.dark .card) {
    box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
  }
  
  #buttonArea {
    margin-top: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 30px; /* Adjust the gap between buttons as needed */
  }

</style>