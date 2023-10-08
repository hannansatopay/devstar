<script lang="ts"> 
	import { Input, Select } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import { Button } from 'flowbite-svelte';
    import jsPDF from 'jspdf';
    

	

	export let data;

  let inputText = '';
  let searchStr = '';
  let occurrences = 0;

  function countOccurrences() {
    const regex = new RegExp(searchStr, 'g');
    const matches = inputText.match(regex);

    if (matches) {
      occurrences = matches.length;
    } else {
      occurrences = 0;
    }
  }
  function downloadPDF() {
  const doc = new jsPDF();
  doc.text(`Input Text: ${inputText}`, 20, 20);
  doc.text(`Search String: ${searchStr}`, 20, 30);
  doc.text(`Occurrences: ${occurrences}`, 20, 40);
  doc.save('Occurrence-counter.pdf');
}
  
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
        <div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
            <div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
                <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea1">
                    <textarea placeholder="Input Text" id="textbox" rows="8" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    bind:value={inputText}/>
                </div>
                <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea2">
                    <textarea placeholder="Search String" id="textbox" rows="8" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    bind:value={searchStr}/>
                </div>
			</div><br>
			
      <div id="buttonArea">
				<button on:click={countOccurrences}>Count Occurrences</button>
				<button on:click={downloadPDF}>Download as pdf</button>
			</div>
			<div class="result-box">
				<p>Occurrences: {occurrences}</p>
			

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

  .result-box {
    border: 1px solid #ccc;
    padding: 10px;
    margin-top: 20px;
    border-radius: 5px;
    background-color: #f0f0f0;
  }
  #buttonArea {
		margin-top: 0px;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 0px; /* Adjust the gap between buttons as needed */
	}

</style>
