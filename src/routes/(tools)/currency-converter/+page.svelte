<script lang="ts">
    import { Button } from 'flowbite-svelte';
    import jsPDF from 'jspdf';
    import Intro from '$lib/Intro.svelte';
	import Copy from '$lib/Copy.svelte';
  
    export let data;
  
    let amount = 1;
    let result = 0;
  
    const exchangeRates = {
      usdToInr: 83.14,
      gbpToInr: 102.89,
      eurToInr: 89.20,

      usdToGbp: 0.81,
      inrToGbp: 0.0097,
      eurToGbp: 0.87,

      usdToEur: 0.93,
      gbpToEur: 1.15,
      inrToEur: 0.011,

      gbpToUsd: 1.24,
      inrToUsd: 0.012,
      eurToUsd: 1.07,


    };
  
    let userInput = 'usdToInr'; 
   
  
    function convertCurrency() {
      const rateKey = userInput;
      result = (amount * exchangeRates[rateKey]).toFixed(3);
    }
    function copyText() {
      if (result.length > 0) {
          const textarea = document.createElement("textarea");
          textarea.value = result;
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
      }
      
       
        function downloadText() {
          if (result.length > 0) {
            const filename = "DevStar.txt";
            const blob = new Blob([result], { type: 'text/plain' });
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
          if (result.length > 0) {
            const doc = new jsPDF();
            doc.text(result, 20, 20);
            doc.save('DevStaroutput.pdf');
          }
        }
</script>
  
<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
        <div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
            <div class="gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden" id="boxarea">
                <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
                    <select id="inputCurrency" bind:value={userInput} class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <option value="usdToInr">USD TO INR</option>
                        <option value="gbpToInr">GBP TO INR</option>
                        <option value="eurToInr">EUR TO INR</option>
                        <option value="usdToGbp">USD To GBP</option>
                        <option value="inrToGbp">INR TO GBP</option>
                        <option value="eurToGbp">EUR TO GBP</option>
                        <option value="usdToEur">USD TO EUR</option>
                        <option value="inrToEur">INR TO EUR</option>
                        <option value="gbpToEur">GBP TO EUR</option>
                        <option value="inrToUsd">INR TO USD</option>
                        <option value="gbpToUsd">GBP TO USD</option>
                        <option value="eurToUsd">EUR To USD</option>
                    </select>
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300 h-40">
                        <input type="number" bind:value={amount} step="0.01" min="0.01" class="w-full h-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                    </div>
                    <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300 h-50">
                        <input type="number" bind:value={result} readonly="true" class="w-full h-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" />
                    </div>
                </div>

                <div id="buttonArea" class="mt-4">
                    <Button color="blue" on:click={convertCurrency}>Convert</Button>
                    <Button color="blue" on:click={copyText}>Copy Text</Button>
                    <Button color="blue" on:click={downloadText}>Download as Text</Button>
                    <Button color="blue" on:click={downloadPDF}>Download as PDF</Button>

                </div>
            </div>
        </div>
    </div>
</section>




<style>
    #boxarea {
        margin-top: 20px;
        gap: 20px;
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
</style>
