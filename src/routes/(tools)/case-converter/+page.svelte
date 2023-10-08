<script lang="ts">
	
	
	import { PDFDocument, rgb } from "pdf-lib";
	import Intro from '$lib/Intro.svelte';
	import { Textarea } from 'flowbite-svelte';
	export let data;
	let inputValue = "";
	let outputValue = "";
	let selectedValue = '';

	

	function handleChange(event: Event) {
    const selectElement = event.target as HTMLSelectElement;
    selectedValue = selectElement.value;
	handleOptionChange(selectedValue);
  }
  const inputElement = document.querySelector("#iptextarea-id");
  if (inputElement) {
    inputElement.addEventListener("input", handleInput);
  }
	function handleInput(event: Event) {
  const inputElement = document.querySelector<HTMLInputElement>("#iptextarea-id");
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
  const textarea = document.querySelector<HTMLTextAreaElement>("#textarea-id");
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

  
	async function downloadAsPdf() {
	  const textarea = document.querySelector("#textarea-id");
	  if(!textarea){
		return ;
	  }
	  const textareaElement = textarea as HTMLTextAreaElement;
const text = textareaElement.value;

	  const maxLinesPerPage = 30; 
	  const lineHeight = 20; 
	  const pageWidth = 500; 
	  const pageHeight = 700; 
	  const margin = 50; 
  
	  const lines = text.split("\n");
	  const totalPages = Math.ceil(lines.length / maxLinesPerPage);
  
	  const pdfDoc = await PDFDocument.create();
	  for (let pageNum = 0; pageNum < totalPages; pageNum++) {
		const page = pdfDoc.addPage([pageWidth, pageHeight]);
		const startLine = pageNum * maxLinesPerPage;
		const endLine = Math.min(startLine + maxLinesPerPage, lines.length);
		const pageLines = lines.slice(startLine, endLine);
  
		
		const fontSize = 12; 
		const textX = margin;
		let textY = pageHeight - margin;
  
		for (const line of pageLines) {
		  page.drawText(line, {
			x: textX,
			y: textY,
			size: fontSize,
			color: rgb(0, 0, 0),
			maxWidth: pageWidth - 2 * margin,
			lineHeight: fontSize * 1.2, 
			opacity: 1, 
		  });
		  textY -= lineHeight;
		}
  
		if (pageNum < totalPages - 1) {
		  pdfDoc.addPage(); 
		}
	  }
  
	  const pdfBytes = await pdfDoc.save();
  
	  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  
	  const url = URL.createObjectURL(blob);
  
	  const a = document.createElement("a");
	  a.href = url;
	  a.download = "output.pdf";
	  a.style.display = "none";
	  document.body.appendChild(a);
	  a.click();
	  document.body.removeChild(a);
  
	  URL.revokeObjectURL(url);
	}
  
	function copyToClipboard() {
	  const textarea = document.querySelector("#textarea-id");
	  const textareaElement = textarea as HTMLTextAreaElement;
textareaElement.select();

	  document.execCommand("copy");
	}

	
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg" id="box">
			<div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea1" >
					<Textarea
		  placeholder="Enter Text ...."
		  id="iptextarea-id"
		  rows="8"
		  name="message"
		  on:input={handleInput}
		  />
				</div>

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea2">
					<Textarea
			placeholder="Result ...."
			id="textarea-id"
		rows="8"
		bind:value={outputValue}/>
		  <div class="dropdown-container">
			<select on:change={handleChange}>

			  <option/>
			  <option value="Text Case Inversion">Text Case Inversion</option>
			  <option value="Sentence Case">Sentence Case</option>
			  <option value="Upper Case">Upper Case</option>
			  <option value="Lower Case">Lower Case</option>
			  <option value="camelCase">Camel Case</option>
			  <option value="Capitalize Case">Capitalize Case</option>
			  <option value="De-Capitalize Case">De-Capitalize Case</option>		  >
			  <option value="kebab-Case">kebab-Case</option>
			  <option value="Snake Case">Snake Case</option>
			</select>
		  </div>
				</div>

			</div>

			<div class="buttons" >
				<button on:click={copyToClipboard}>Copy</button>
				<button on:click={downloadAsText}>Download as Text</button>
	  
				<button on:click={downloadAsPdf}>Download as PDF</button>
			  </div>

		</div>
	</div>
</section>

<style>
	
	section {
	  display: flex;
	  flex-direction: row;
	  align-items: center;
	  justify-content: center;
	  background-color: tranparent;
	}
	#box{
		border:2px solid gray ;
		padding:35px;
	}
	.dropdown-container {
	  position: absolute;
	  top:45px;
	  right:38px;
	}
  
	select {
	  background-color: transparent;
	  color: #141314;
	  padding: 8px;
	  border: none;
	  font-size: 16px;
	  width: 30px;
	  height: 15px;
	}
	.buttons {
	  display: flex;
	  gap: 20px;
	  margin-top: 30px;

	}
  
	button {
	  padding: 5px;
	  background-color: #007bff;
	  color: white;
	  border-radius: 7px;
	  border: none;
	  width:190px;
	  cursor: pointer;
	}
  
	button:hover {
	  background-color: #0056b3;
	}
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

    button {
      width: 100%; 
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
  }
</style>
