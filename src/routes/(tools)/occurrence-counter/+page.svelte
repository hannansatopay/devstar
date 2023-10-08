<script lang="ts"> 
  import { Button } from 'flowbite-svelte';
  import Intro from '$lib/Intro.svelte';
  import jsPDF from 'jspdf';
  
  
    export let data;
  
    let inputText = '';
    let searchStr = '';
    let occurrences = 0;
  
    function countOccurrences() {
      if (!inputText || !searchStr) {
        occurrences = 0;
        return;
      }
      
      const regex = new RegExp(searchStr, 'g');
      const matches = inputText.match(regex);
      occurrences = matches ? matches.length : 0;
    }
    function downloadPDF() {
    const doc = new jsPDF();
    doc.text(`Input Text: ${inputText}`, 20, 20);
    doc.text(`Search String: ${searchStr}`, 20, 30);
    doc.text(`Occurrences: ${occurrences}`, 20, 40);
    doc.save('Occurrence-counter.pdf');
    }
    function copyText() {
          if (inputText.length > 0) {
              var textarea = document.createElement("textarea");
              textarea.value = occurrences.toString();
              document.body.appendChild(textarea);
              textarea.select();
              document.execCommand("copy");
              document.body.removeChild(textarea);
          }
        }
  
    function downloadText() {
    if (inputText.length > 0) {
      var filename = "DevStarPalindrome.txt";
      var content = `Input Text: ${inputText}\nSearch String: ${searchStr}\nOccurrences: ${occurrences}`;
  
      var blob = new Blob([content], { type: 'text/plain' });
      var url = window.URL.createObjectURL(blob);
  
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
  
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  }
  </script>
  
  <Intro heading={data.meta.title} description={data.meta.description} />
  
  <section class="bg-white dark:bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
      <div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
          <div class="mt-2 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden"> 
                  <div class="grid grid-cols-2 gap-2">
                      <div class="col-span-1"> 
                        <div class="rounded-lg overflow-hidden border border-gray-300">
                          <textarea placeholder="Search String" id="textbox" rows="1" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" style="resize: none;" bind:value={searchStr}></textarea>
                        </div>
                      </div>
                      <div class="col-span-1">
                          <div class="relative">
                            <div class="rounded-lg overflow-hidden border border-gray-300">
                              <textarea placeholder="" id="textbox" rows="1" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" style="resize: none;"
                              on:input={countOccurrences}></textarea>
                             <p class="absolute inset-y-0 left-2 flex items-center text-sm text-gray-400">Occurrences: {occurrences}</p>
                            </div>
                          </div>
                      </div>
                  </div>

              <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300 mt-6" id="tarea1">
                  <textarea placeholder="Input Text" id="textbox" rows="8" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" style="resize: none;"
                  on:input={countOccurrences} bind:value={inputText}></textarea>
              </div>
          </div>
      
          <div id="buttonArea">
            <Button color="blue" on:click={copyText}>Copy</Button>
            <Button color="blue" on:click={downloadText}>Download as txt</Button>
            <Button color="blue" on:click={downloadPDF}>Download as pdf</Button>
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
    
    #buttonArea {
      margin-top: 30px;
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 30px; /* Adjust the gap between buttons as needed */
    }
  
  </style>
  