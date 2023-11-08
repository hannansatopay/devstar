<script lang="ts">

    import { Button } from 'flowbite-svelte';
    import Intro from '$lib/Intro.svelte';
    import jsPDF from 'jspdf';
    import Tesseract from 'tesseract.js';

    export let data;

    let inputImage: File | null = null;
    let output = '';

    async function logTesseract() {
        if (inputImage) {
            try {
                const result = await Tesseract.recognize(inputImage, 'eng', {
                    logger: m => console.log(m)
                });
                output = result.data.text;
            } catch (error) {
                console.error('Error:', error);
            }
        }
    }

    function copyText() {
		if (output.length > 0) {
			const textarea = document.createElement("textarea");
			textarea.value = output;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
		}
	}
      
       
	function downloadText() {
		if (output.length > 0) {
		const filename = "devstar_output.txt";
		const blob = new Blob([output], { type: 'text/plain' });
		const url = window.URL.createObjectURL(blob);
	
		const a = document.createElement('a');
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
            <div class="items-center mx-auto max-w-screen-xl overflow-hidden">

                <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300 mb-4">
                    <input type="file" accept="image/*" on:change={(e) => { inputImage = e.target.files[0]; }} />
                </div>

                <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
                    <textarea placeholder="Extracted Text" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                    bind:value={output} rows="8"/>
                </div>

            </div>

			<div class="items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden">
				<div class="mt-8 gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-4 overflow-hidden">
                    <Button color="blue" on:click={logTesseract}>Extract Text from Image</Button>
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