<script lang="ts">

    import { Button } from 'flowbite-svelte';
    import jsPDF from 'jspdf';
    import Intro from '$lib/Intro.svelte';
      
    export let data;
    let input = '';
    let output = '';
    
    function clearInput() 
    {
        input = ''; 
    }
    function clearOutput()
    {
      output = ''; 
    }
    
    function updateOutput(result) {
      output = result;
    
      setTimeout(clearOutput, 4000);
    }
    function updateInput(value) {
            input = value;
    
            setTimeout(clearInput, 4000);
        }
      
        function Convert() {
          const userInput = input.replace(/,/g, '').trim();
          let result = '';
      
          if (!isNaN(userInput)) {
            result = toWords(userInput, false);
          } else {
            result = "Input is not a valid number.";
          }
        
      updateOutput(result);
      updateInput(userInput);
      
        }
      
       
        function isFinite(userInput) {
          return !(typeof userInput !== 'number' || userInput !== userInput || userInput === Infinity || userInput === -Infinity);
        }
      
        
        const ENDS_WITH_DOUBLE_ZERO_PATTERN = /(hundred|thousand|(m|b|tr|quadr)illion)$/;
        const ENDS_WITH_TEEN_PATTERN = /teen$/;
        const ENDS_WITH_Y_PATTERN = /y$/;
        const ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN = /(zero|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve)$/;
        const ordinalLessThanThirteen = {
          zero: 'zeroth',
          one: 'first',
          two: 'second',
          three: 'third',
          four: 'fourth',
          five: 'fifth',
          six: 'sixth',
          seven: 'seventh',
          eight: 'eighth',
          nine: 'ninth',
          ten: 'tenth',
          eleven: 'eleventh',
          twelve: 'twelfth'
        };
      
       
        function makeOrdinal(userInput) {
          if (ENDS_WITH_DOUBLE_ZERO_PATTERN.test(userInput) || ENDS_WITH_TEEN_PATTERN.test(userInput)) {
            return userInput + 'th';
          } else if (ENDS_WITH_Y_PATTERN.test(userInput)) {
            return userInput.replace(ENDS_WITH_Y_PATTERN, 'ieth');
          } else if (ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN.test(userInput)) {
            return userInput.replace(ENDS_WITH_ZERO_THROUGH_TWELVE_PATTERN, replaceWithOrdinalVariant);
          }
          return userInput;
        }
      
        function replaceWithOrdinalVariant(match, numberWord) {
          return ordinalLessThanThirteen[numberWord];
        }
      
        
        const TEN = 10;
        const ONE_HUNDRED = 100;
        const ONE_THOUSAND = 1000;
        const ONE_LAKH = 100000;
        const ONE_CRORE = 10000000;
      
    
        const LESS_THAN_TWENTY = [
          'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
          'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'
        ];
        const TENTHS_LESS_THAN_HUNDRED = [
          'zero', 'ten', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'
        ];
      
    
        function toWords(userInput, asOrdinal) {
          const words = generateWords(userInput);
          return asOrdinal ? makeOrdinal(words) : words;
        }
      
        function generateWords(userInput, words = [], addComma = false) {
      let remainder, word;
    
      if (userInput === 0) {
        return words.length === 0 ? 'zero' : words.join(' ').replace(/$/, '');
      }
    
      if (userInput < 0) {
        words.push('minus');
        userInput = Math.abs(userInput);
      }
    
      if (userInput < 20) {
        remainder = 0;
        word = LESS_THAN_TWENTY[userInput];
      } else if (userInput < ONE_HUNDRED) {
        remainder = userInput % TEN;
        word = TENTHS_LESS_THAN_HUNDRED[Math.floor(userInput / TEN)];
        if (remainder) {
          word += '-' + LESS_THAN_TWENTY[remainder];
          remainder = 0;
        }
      } else if (userInput < ONE_THOUSAND) {
        remainder = userInput % ONE_HUNDRED;
        word = generateWords(Math.floor(userInput / ONE_HUNDRED)) + ' hundred';
      } else if (userInput < ONE_LAKH) {
        remainder = userInput % ONE_THOUSAND;
        word = generateWords(Math.floor(userInput / ONE_THOUSAND)) + ' thousand';
      } else if (userInput < 100 * ONE_LAKH) {
        remainder = userInput % ONE_LAKH;
        word = generateWords(Math.floor(userInput / ONE_LAKH)) + ' lakh';
      } else if (userInput < 100 * ONE_CRORE) {
        remainder = userInput % ONE_CRORE;
        word = generateWords(Math.floor(userInput / ONE_CRORE)) + ' crore';
      } else {
        word = "Input exceeds the supported range.";
        remainder = 0;
      }
      if (addComma) {
        words.push(word);
        return generateWords(remainder, words, false); 
      } else {
        if (word.includes(",")) {
          const [beforeComma, afterComma] = word.split(",");
          words.push(beforeComma);
          words.push(afterComma);
        } else {
          words.push(word);
        }
        return generateWords(remainder, words, true); 
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
            const filename = "DevStar.txt";
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
            doc.save('DevStaroutput.pdf');
          }
        }
      </script>
      
      
      <Intro heading={data.meta.title} description={data.meta.description} />
    
      <section class="bg-white dark:bg-gray-900">
        <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
          <div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
            <div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden" id="boxarea">
              <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea1">
                <textarea placeholder="Enter Text" rows="8" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" bind:value={input}></textarea>
              </div>
              <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" id="tarea2">
                <textarea placeholder="Result" rows="8" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" readonly={true} bind:value={output}></textarea>
              </div>
            </div>
            <div id="buttonArea">
              <Button color="blue" on:click={Convert}>Convert</Button>
              <Button color="blue" on:click={copyText}>Copy</Button>
              <Button color="blue" on:click={downloadText}>Download as txt</Button>
              <Button color="blue" on:click={downloadPDF}>Download as pdf</Button>
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
      