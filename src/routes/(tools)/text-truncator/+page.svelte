<script lang="ts">

	import { Button } from 'flowbite-svelte';
	import jsPDF from 'jspdf';
	import Intro from '$lib/Intro.svelte';

	export let data;

	let text = '';
	let direction = 'end';
	let limit = 10;
	let output = '';

	function updateTruncatedText() {
		if (limit <= 0) {
			output = '';
		} else if (text.length > limit) {
			if (direction === 'end') {
				output = text.slice(0, limit) + '...';
			} else {
				output = '...' + text.slice(-limit);
			}
		} else {
			output = text;
		}
	}

	function onDirectionChange(event) {
		direction = event.target.value;
		updateTruncatedText();
	}

	$: {
		updateTruncatedText();
	}

	function copyText() {
		if (output.length > 0) {
			var textarea = document.createElement('textarea');
			textarea.value = output;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand('copy');
			document.body.removeChild(textarea);
		}
	}

	function downloadText() {
		if (output.length > 0) {
			var filename = 'devstar_output.txt';
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

				<div>
					<label for="" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
						Number of Characters:
					</label >
					<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
						<input class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						type="number" bind:value={limit} on:input={updateTruncatedText}/>
					</div>
				</div>

				<div>
					<label for="" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
						Truncate from:
					</label>
					<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
						<select class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						bind:value={direction} on:change={onDirectionChange}>
							<option value="end">End</option>
							<option value="start">Start</option>
						</select>
					</div>
				</div>	

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					placeholder="Enter Text" rows="8" bind:value={text} on:input={updateTruncatedText}/>
				</div>

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					readonly placeholder="Result" rows="8" bind:value={output}/>
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