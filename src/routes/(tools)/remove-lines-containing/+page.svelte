
<script lang="ts">
    import { onMount } from 'svelte';
    import { Button } from 'flowbite-svelte';
    import jsPDF from 'jspdf';
    import Intro from '$lib/Intro.svelte';

    export let data;
    let text = "";
    let keyword = "";
    let filteredText = "";
    let ignoreCase = false;

    
    function handleInput(event) {
        const newText = event.target.value;
      
    }
    $: {
        const lines = text.split('\n');
        if (ignoreCase) {
            const keywordLower = keyword.toLowerCase();
            filteredText = lines.filter(line => !line.toLowerCase().includes(keywordLower)).join('\n');
        } else {
            filteredText = lines.filter(line => !line.includes(keyword)).join('\n');
        }
    }

    function copyText() {
        if (filteredText.length > 0) {
            var textarea = document.createElement("textarea");
            textarea.value = `FilteredText:  ${filteredText}`;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }
    }

    function downloadText() {
        if (text.length > 0) {
            const combinedText = `InputText: ${text}\n\nKeyword to filter lines: ${keyword}\n\nFilteredText: ${filteredText}`;
            const textBlob = new Blob([combinedText], { type: 'text/plain' });

            const anchor = document.createElement('a');
            anchor.href = URL.createObjectURL(textBlob);
            anchor.download = 'Result.txt';
            anchor.click();
            URL.revokeObjectURL(anchor.href);
        }
    }

    function downloadPDF() {
    if (text.length > 0) {
        const pdf = new jsPDF();

        const lines = text.split('\n');
        
        const lineSpacing = 10; // Adjust the spacing between lines as needed

        let y = 10; // Initial y-coordinate
        pdf.text("InputText:", 10, y);
        // Add text for each line
        lines.forEach(line => {
            pdf.text(line, 20, y+10);
            y += lineSpacing; 
        });
        
        pdf.text("Keyword to filter lines:", 10, y+10);
        y += lineSpacing; // Increase y-coordinate for the next line
        pdf.text(keyword, 70, y);
      
        pdf.text("FilteredText:", 10, y+10);
        y += lineSpacing; // Increase y-coordinate for the next line
        pdf.text(filteredText, 50, y+10);

        pdf.save("Result.pdf");
    }
}

</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
        <div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
            <div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
                <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea1">
					<textarea placeholder="Enter keyword to apply filter to the text" id="textbox" rows="1" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                     on:input={handleInput} bind:value={keyword}/>
				</div>
                <div>
                    <label class="grey-text"> 
                        <input type="checkbox" bind:checked={ignoreCase} />
                        Ignore Case
                    </label>
                </div>
                <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea1">
                    <textarea placeholder="Enter Text" id="textbox" rows="8" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    bind:value={text} on:input={handleInput}/>
                </div>
                <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea2">
                    <textarea readonly placeholder="Result" id="textbox" rows="8" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
                        bind:value={filteredText}
                        on:input={handleInput} />
                </div>
            </div>
            <div id="buttonArea">
                <Button color="blue" on:click={downloadText}>Download as Text</Button>
                <Button color="blue" on:click={copyText}>Copy</Button>
				<Button color="blue" on:click={downloadPDF}>Download as PDF</Button>
            </div>
        </div>
    </div>
</section>

<style>    
    #textbox{
	
        resize: none;
    }
    #tarea1{
        margin-right: 10px;
    }
    #tarea2{
        margin-left: 10px;
    }
    #buttonArea {
        margin-top: 30px;
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 30px; 
    }
    .card {
        box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
    }
    :is(.dark .card) {
        box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
    }
    .grey-text {
        color: rgb(218, 210, 210);
    }
</style>



  