<script lang="ts">
	
	import jsPDF from 'jspdf';
	import Intro from '$lib/Intro.svelte';
	import { Textarea,Button } from 'flowbite-svelte';
export const caseConversionOptions = [
	'Text Case Inversion',
	'Sentence Case',
	'Lower Case',
	'Upper Case',
	'Capitalize Case',
	'De-Capitalize Case',
	'Snake Case',
	'camelCase',
	'kebab-Case'
];

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
		case "Text Case Inversion":
		  outputValue = inputValue
			.split("")
			.map((char) =>
			  char === char.toLowerCase()
				? char.toUpperCase()
				: char.toLowerCase()
			)
			.join("");
		  break;
		case "Sentence Case":
		  outputValue = inputValue.charAt(0).toUpperCase() + inputValue.slice(1);
		  break;
		case "Upper Case":
		  outputValue = inputValue.toUpperCase();
		  break;
		case "Lower Case":
		  outputValue = inputValue.toLowerCase();
		  break;
		case "Capitalize Case":
		  outputValue = inputValue
			.split(/[\s\n]+/)
			.map(
			  (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
			)
			.join(" ");
		  break;
		case "De-Capitalize Case":
		  outputValue = inputValue
			.split(/[\s\n]+/)
			.map((word) => word.charAt(0).toLowerCase() + word.slice(1))
			.join(" ");
		  break;
		case "Snake Case":
		  outputValue = inputValue?.toLowerCase().replace(/\s+/g, "_");
		  break;
		case "camelCase":
		  outputValue = inputValue
			?.toLowerCase()
			.replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
		  break;
		case "kebab-Case":
		  outputValue = inputValue?.toLowerCase().replace(/\s+/g, "-");
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
		doc.save('DevStarCase.pdf');
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
				<option>--Select Conversion-- </option>
				{#each caseConversionOptions as option}
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
/* 
	@media screen and (max-width: 768px) {
	  
  
	  .buttons {
		margin-left: 0;
	  }
	}
	@media screen and (max-width: 768px) {
    #box {
      padding: 15px;
    }

    select {
      width: 100%;
      margin-top: 10px; 
    }

    .buttons {
      flex-direction: column; 
      align-items: center; 
      margin-top: 20px;
    }

  }

  @media screen and (max-width: 1024px) {
    #box {
      padding: 20px;
    }
  }

  @media screen and (min-width: 1025px) {
    #box {
      padding: 30px;
    }
  } */
</style>

