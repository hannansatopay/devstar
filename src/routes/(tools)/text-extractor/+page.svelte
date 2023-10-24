<script lang="ts">
    import { Button } from 'flowbite-svelte';
    import Intro from '$lib/Intro.svelte';
    import Tesseract from 'tesseract.js'; // Import createWorker and recognize
  
    export let data;
  
    let inputImage: File | null = null;
    let extractedText = '';
    
    function logTesseract(){
        Tesseract.recognize(inputImage,'eng',{logger:m =>console.log(m)})
          .then(({data:{text}})=>{console.log(text);
        })
    }
    // async function extractText() {
    //   if (inputImage) {
    //     const worker = createWorker();
    //     await worker.load();
    //     await worker.loadLanguage('eng');
    //     await worker.initialize('eng');
    //     const { data: { text } } = await recognize(inputImage); // Use recognize from the imported Tesseract.js
    //     extractedText = text;
    //     await worker.terminate();
    //   }
    // }

  </script>
  

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
        <div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
            <div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
                <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
                    <input type="file" accept="image/*" on:change={(e) => { inputImage = e.target.files[0]; }} />
                </div>
                <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea2">
                    <textarea placeholder="Extracted Text" rows="8" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" bind:value={extractedText} />
                </div>
            </div>
            <div id="buttonArea">
                <Button color="blue" on:click={extractText}>Extract Text from Image</Button>
            </div>
        </div>
    </div>
</section>


<style>
	#tarea2{
		margin-left: 10px;
	}

	#buttonArea {
		margin-top: 30px;
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 30px; /* Adjust the gap between buttons as needed */
	}

	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
</style>
