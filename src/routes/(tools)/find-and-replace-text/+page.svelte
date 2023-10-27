<script lang="ts">
	import { Button, Input } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import jsPDF from 'jspdf';
	export let data;

	let originalString = "";
	let searchString = "";
	let replacementString = "";
	let validationMessage = "";
	let resultString="";
	let buttonClicked=false;
    
	
	function downloadPDF() {
		if(resultString.length>0) {
            const doc = new jsPDF();
			doc.text(resultString, 20, 20);
			doc.save('devstar_output.pdf');
		}	
	}

	$: {
		if (buttonClicked) {
			findAndReplace();
		}
	}

	function findAndReplace() {

		if (originalString===''){
			resultString="";
			return;
		}

		else if (searchString==='') {
			resultString="";
			return;
		}

		else if(replacementString===''){
			resultString="";
			return;
		}

		if (originalString.includes(searchString)) {
			resultString = originalString.replace(new RegExp(searchString, 'g'), replacementString);
		} 
		
		else {
			resultString = "Search string not found in the original string.";
		}
	}

	function copyText() {
		if(resultString.length>0){
			const el = document.createElement('textarea');
			el.value = resultString;
			document.body.appendChild(el);
			el.select();
			document.execCommand('copy');
			document.body.removeChild(el);
		}
	}

  	function downloadFile() {
		if (resultString.length>0){
			const resultString1 = resultString;
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
					<Input type="text" placeholder="Enter Search String" bind:value={searchString} class="rounded-none border-0 " 
					on:input={findAndReplace}/>
				</div>

				 <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<Input type="text" placeholder="Enter Replacement String" bind:value={replacementString} class="rounded-none border-0 " 
					on:input={findAndReplace} />
				</div> 

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea placeholder="Input String" rows="8"  bind:value={originalString} class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
					on:input={findAndReplace}/>
				</div> 

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea readOnly placeholder="Result" rows="8" class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
					bind:value={resultString}/>
				</div>

			</div>

			{#if buttonClicked && validationMessage}
				<p style="color: red; font-weight:lighter">{validationMessage}</p>
			{/if}

			<div class="items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden">
				<div class="mt-8 gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-3 overflow-hidden">
					<Button color="blue" on:click={copyText}>Copy</Button>
					<Button color="blue" on:click={downloadFile}>Download as txt</Button>
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