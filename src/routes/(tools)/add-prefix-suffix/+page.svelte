<script lang="ts">
	import { Button, Input } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import Contributors from '$lib/Contributors.svelte';
	import jsPDF from 'jspdf';
	
	export let data;

	let inputText = '';
	let suffix = '';
	let prefix = '';
	let results='';

	function downloadPDF() {
		if (results.length > 0) {
			const doc = new jsPDF();
			doc.text(results, 20, 20);
			doc.save('devstar_output.pdf');
		}
	}

	function updateText() {
		const lines=inputText.split('\n');
		results = lines.map(lines => `${prefix}${lines}${suffix}`).join('\n');
		
	}

	function copyText() {
		if (results.length > 0) {
			const el = document.createElement('textarea');
			el.value = results;
			document.body.appendChild(el);
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);
		}
	}

	function downloadFile() {
		if (results.length > 0) {
			const resultString1 = results;
			const blob = new Blob([resultString1], { type: 'text/plain' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = 'devstar_output.txt';
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
		}
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
			<div class="gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<Input type="text" placeholder="Prefix" bind:value={prefix} class="rounded-none border-0 " on:input={updateText}/>
				</div>

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<Input type="text" placeholder="Suffix" bind:value={suffix} class="rounded-none border-0 " on:input={updateText}/>
				</div>

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea placeholder="Input text" rows="8" bind:value={inputText} class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" on:input={updateText}/>
				</div>

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea readOnly placeholder="Result" bind:value={results} rows="8" class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"/>
				</div>
				
			</div>

			<div class="items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden">
				<div class="mt-8 gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-3 overflow-hidden">
					<Button color="blue" on:click={copyText}>Copy</Button>
					<Button color="blue" on:click={downloadFile}>Download as txt</Button>
					<Button color="blue" on:click={downloadPDF}>Download as PDF</Button>
				</div>	
			</div>

		</div>
	</div>
</section>

<Contributors contributors={data.meta.contributors}/>

<style>

	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}

</style>
