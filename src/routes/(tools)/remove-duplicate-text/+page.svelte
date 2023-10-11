
<script lang="ts">
	
	import jsPDF from 'jspdf';
	import Intro from '$lib/Intro.svelte';
	import { Textarea,Button } from 'flowbite-svelte';
    export const removeDuplicateOptions = [
	'Remove Duplicate Words',
	'Remove Duplicate Lines',
  ]


	export let data;
	let inputValue = "";
	let outputValue = "";
	let selectedValue = '';

	function handleChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    selectedValue = selectElement.value;
	handleOptionChange(selectedValue);
  }
  const inputElement = document.querySelector("#input-textarea-id");
  if (inputElement) {
    inputElement.addEventListener("input", handleInput);
  }
	function handleInput(event: Event) {
  const inputElement = document.querySelector<HTMLInputElement>("#input-textarea-id");
  if (inputElement) {  
    inputValue = inputElement.value;
  }
  handleOptionChange((document.querySelector<HTMLSelectElement>("select") as HTMLSelectElement).value);
}


function handleOptionChange(selectedOption: string) {
	  switch (selectedOption) {

		case "Remove Duplicate Words":
        const sentences = inputValue.split('.'); // Split input text into sentences
      const cleanedSentences = sentences.map(sentence => {
        const words = sentence.split(' '); // Split sentence into words
        const uniqueWords = Array.from(new Set(words)); // Remove duplicate words
        return uniqueWords.join(' '); // Join unique words back into sentence
      });
      outputValue = cleanedSentences.join('.');
		  break;


		case "Remove Duplicate Lines":
		  const lines = inputValue.split('\n'); // Split input text into lines
    const uniqueLines = Array.from(new Set(lines)); // Remove duplicates
    outputValue = uniqueLines.join('\n');


	  }
	}
    
	function downloadAsText() {
  const textarea = document.querySelector<HTMLTextAreaElement>("#output-textarea-id");
  const text = textarea?.value;

  if (typeof text === "string") {
    const blob = new Blob([text], { type: "text/plain" });

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "output.txt";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
  }
}

function downloadPDF() {
		const doc = new jsPDF();
		doc.text(outputValue, 20, 20);
		doc.save('DevStarRemoveDuplicate.pdf');
	}

    
  
	function copyToClipboard() {
	  const textarea = document.querySelector("#output-textarea-id");
	  const textareaElement = textarea as HTMLTextAreaElement;
textareaElement.select();

	  document.execCommand("copy");
	}

    	
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg" id="box">
			<select on:change={handleChange} 
				class="rounded-lg bg-gray-50 text-gray-900 text-sm border-0 border-t-2 border-white focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
				<option>--Select Option-- </option>
				{#each removeDuplicateOptions as option}
				<option value={option}>{option}</option>
			{/each}
		</select>	
			<div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
				
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea1">
					<Textarea placeholder="Enter Text" id="input-textarea-id" rows="8" name="message"
					on:input={handleInput}/>
					
				</div>

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea2">
					
				<Textarea
					placeholder="Result ...."
					readOnly
					id="output-textarea-id"
					
					rows="8"
					
					style="border-radius:0"
					bind:value={outputValue}
					/>
				</div>

			</div>

			<div class="buttons" >
				<Button color="blue" on:click={copyToClipboard}>Copy</Button>
				<Button color="blue" on:click={downloadAsText}>Download as txt</Button>
				<Button color="blue" on:click={downloadPDF}>Download as pdf</Button>
			
			  </div>

		</div>
	</div>
</section>

<style>
	
	
	#box{
		border:2px solid gray ;
		padding:35px;
	}
	
	#tarea1{
		margin-right: 10px;
	}

	#tarea2{
		margin-left: 10px;
	}
	.buttons {
		margin-top: 30px;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 30px;

	}
</style>




