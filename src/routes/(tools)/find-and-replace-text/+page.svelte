<script lang="ts">
	import { Button, Input, Select } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
    import html2pdf from 'html2pdf.js'
	import jsPDF from 'jspdf';
	export let data;

	
let originalString = "";
let searchString = "";
let replacementString = "";
	let validationMessage = "";
	let resultString="";
	let buttonClicked=false;
    
	
	function downloadPDF() {
		if(resultString.length>0)
		{
            const doc = new jsPDF();
		doc.text(resultString, 20, 20);
		doc.save('find_and_replace_text.pdf');
		}
		
	}

	$: {
    if (buttonClicked) {
      findAndReplace();
    }
  }

	function findAndReplace() {
		const inputElement1 = document.getElementById('originalString') as HTMLInputElement;
        const inputValue1 = inputElement1.value.trim(); 
		const inputElement2 = document.getElementById('searchString') as HTMLInputElement;
        const inputValue2 = inputElement2.value.trim(); 
		const inputElement3 = document.getElementById('replacementString') as HTMLInputElement;
        const inputValue3 = inputElement3.value.trim(); 
		if (inputValue1===''){
			resultString="";
			return;
	}
	  else if (inputValue2==='') {
		resultString="";
		return;
	  }
	  else if(inputValue3===''){
		resultString="";
		return;
	  }

    if (originalString.includes(searchString)) {
      resultString = originalString.replace(new RegExp(searchString, 'g'), replacementString);
    } else {
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
    a.download = 'find_and_replace_text.txt'; 
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
			<div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden" id="boxarea">
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<Input type="text" id="searchString" placeholder="Enter Search String" bind:value={searchString} class="rounded-none border-0 " on:input={findAndReplace}/>
				</div>
				 <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<Input type="text" id="replacementString" placeholder="Enter Replacement String" bind:value={replacementString} class="rounded-none border-0 " on:input={findAndReplace} />
				</div> 
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea placeholder="Input String" id="originalString" rows="8"  bind:value={originalString} class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" on:input={findAndReplace}/>
				</div> 
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea2">
					<textarea readOnly placeholder="Result" id="textbox" rows="8" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" bind:value={resultString}/>
				
				</div><br>
			</div>
			{#if buttonClicked && validationMessage}
           <p style="color: red; font-weight:lighter">{validationMessage}</p>
           {/if}
			<div id="buttonArea">
				<Button color="blue" on:click={() => {copyText();}}>Copy</Button>
				<Button color="blue" on:click={downloadFile}>Download as txt</Button>
				<Button color="blue" on:click={downloadPDF}>Download as PDF</Button>
				
			  </div>

		</div>
	</div>
	 
</section>

<style>
	#textbox{
		resize: none;
	}
	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
	#buttonArea{
		margin-top: 30px;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 30px; /* Adjust the gap between buttons as needed */
	}
  #boxarea{
		gap:30px;
	}
</style>
