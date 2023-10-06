<script lang="ts">
	import { Input, Select } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';

	export let data;

	
let originalString = "";
let searchString = "";
let replacementString = "";
	let validationMessage = "";
	let resultString="";
	let buttonClicked=false;
	let showToast = false;
    let toastMessage = '';
	let isDarkMode=false;
    


  function showToastMessage(message) {
    showToast = true;
    toastMessage = message;

    // Hide the toast after a delay (e.g., 3 seconds)
    setTimeout(() => {
      showToast = false;
      toastMessage = '';
    }, 3000);
  }
	$: {
    if (buttonClicked) {
      findAndReplace();
    }
  }
  function clearValidationMessage() {
    validationMessage = "";
  }

	function findAndReplace() {
		const inputElement1 = document.getElementById('originalString') as HTMLInputElement;
        const inputValue1 = inputElement1.value.trim(); 
		const inputElement2 = document.getElementById('searchString') as HTMLInputElement;
        const inputValue2 = inputElement2.value.trim(); 
		const inputElement3 = document.getElementById('replacementString') as HTMLInputElement;
        const inputValue3 = inputElement3.value.trim(); 
		if (inputValue1===''){
			validationMessage = "Please enter original string.";
			resultString="";
			return;
	}
	  else if (inputValue2==='') {
		validationMessage = "Please enter search string.";
		resultString="";
		return;
	  }
	  else if(inputValue3===''){
		validationMessage = "Please enter replacement string.";
		resultString="";
		return;
	  }

    if (originalString.includes(searchString)) {
      resultString = originalString.replace(new RegExp(searchString, 'g'), replacementString);
    } else {
      resultString = "Search string not found in the original string.";
    }
	validationMessage = "";
	}
	function copyText() {
    const el = document.createElement('textarea');
    el.value = resultString;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
	
    
  }
  function downloadFile() {
    const resultString1 = resultString;
    const blob = new Blob([resultString1], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'downloaded_file.txt'; // Specify the filename
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
			<div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden">
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<Input type="text" id="originalString" placeholder="Enter Any String" bind:value={originalString} class="rounded-none border-0 " on:input={clearValidationMessage}/>
				</div><br>
				 <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<Input type="text" id="searchString" placeholder="Enter Search String" bind:value={searchString} class="rounded-none border-0 " on:input={clearValidationMessage}/>
				</div> <br>
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<Input type="text" id="replacementString" placeholder="Enter Replacement String" bind:value={replacementString} class="rounded-none border-0" on:input={clearValidationMessage}/>
				</div> 
			</div><br>
			<button on:click={() => { findAndReplace(); buttonClicked = true; }}>Find and Replace</button><br>
			<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea2">
				<textarea readOnly placeholder="Result" id="textbox" rows="3" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
				bind:value={resultString}/>
			
			</div><br>
			{#if buttonClicked && validationMessage}
           <p style="color: red; font-weight:lighter">{validationMessage}</p>
           {/if}
			<div class="button-container">
				<button  on:click={() => {copyText();showToastMessage('Text copied to clipboard!')}}>Copy</button>
				<button  on:click={downloadFile}>Download</button>
				
			  </div>
			  <div class="toast {showToast ? 'show-toast' : ''}">{toastMessage}</div>

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
	button {
	  display: block;
	  margin:1% auto;
	  color: aliceblue;
	  background-color: rgb(65, 37, 228);
	  padding: 10px 20px;
	  border: none;
	  border-radius: 5px;
	  cursor: pointer;
	  cursor: pointer;
      transition: background-color 0.3s;
	}
	button:hover {
	  background-color: rgb(113, 109, 247);
	}
	p{
		color: rgb(23, 94, 122);
		font-weight: bold;
	}
	.button-container {
     display: flex;
     margin-right: 10px;
  }
  .toast {
    display: none;
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: #fff;
    padding: 10px 20px;
    border-radius: 5px;
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
  }

  .show-toast {
    display: block;
  }
</style>
