<script lang="ts">

	import { Button } from 'flowbite-svelte';
	import jsPDF from 'jspdf';
	import Intro from '$lib/Intro.svelte';

	export let data;

	var output;
	
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

			<div class="w-full border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
				
				<div class="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
					<textarea id="comment" rows="8" class="w-full px-0 text-sm text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400" 
					placeholder="Enter Text..." required bind:value={output}></textarea>
				</div>

				<div class="items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden">
					<div class="m-2 gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-3 overflow-hidden">
						<Button color="blue" on:click={copyText}>Copy</Button>
						<Button color="blue" on:click={downloadText}>Download as txt</Button>
						<Button color="blue" on:click={downloadPDF}>Download as pdf</Button>
					</div>	
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