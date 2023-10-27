<script lang="ts">

	import { Button } from 'flowbite-svelte';
	import jsPDF from 'jspdf';
	import Intro from '$lib/Intro.svelte';
	import { text } from '@sveltejs/kit';

	export let data;

	
  let inputText = '';
  let outputText = '';

  const textToMorseDictionary = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.',
    'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---',
    'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---',
    'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
    'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--',
    'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', ' ':'/',
    '/': ' ',
	
	
  };

  const morseToTextDictionary = Object.entries(textToMorseDictionary).reduce((acc, [key, value]) => {
    acc[value] = key;
    return acc;
  }, {});

  function translate() {
    const translationDirection = document.getElementById('translationDirection').value;

    if (translationDirection === 'morseToText') {
        outputText = morseToText(inputText);
    } else {
        outputText = textToMorse(inputText);
    }
}

  function isMorse(input) {
    // Heuristic to detect if the input is Morse code
    return /[-.\/\s]/.test(input);
  }

  function textToMorse(text) {
    text = text.toUpperCase(); // Convert input text to uppercase
    const words = text.split(' ');
    const morseWords = words.map(word => {
      const letters = word.split('');
      const morseLetters = letters.map(letter => textToMorseDictionary[letter] || '');
      return morseLetters.join(' ');
    });
    return morseWords.join(' / ');
  }

  function morseToText(morse) {
    const morseWords = morse.split(' / ');
    const textWords = morseWords.map(word => {
      const morseLetters = word.split(' ');
      const textLetters = morseLetters.map(letter => morseToTextDictionary[letter] || '');
      return textLetters.join('');
    });
    return textWords.join(' ');
  }
  function copyText() {
    if (outputText.length > 0) {
      var textarea = document.createElement("textarea");
      textarea.value = outputText;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
    }
  }

  function downloadText() {
    if (outputText.length > 0) {
      var filename = "morse_output.txt";
	  var content = `Input Text: ${inputText}\nResult: ${outputText}`;

      var blob = new Blob([outputText], { type: 'text/plain' });
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

  function downloadPDF() {
    const doc = new jsPDF();
	doc.text(`Input Text: ${inputText}`, 20, 20);
    doc.text(`Result: ${outputText}`, 20, 30);
    doc.save('morse_output.pdf');
  }
</script>
<Intro heading={data.meta.title} description={data.meta.description} />
<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
      <select id="translationDirection" class="rounded-lg overflow-hidden text-gray-200 dark:bg-gray-600 border border-gray-200">
        <option value="textToMorse">Text to Morse</option>
        <option value="morseToText">Morse to Text</option>
    </select>
			<div class="gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea placeholder="Enter Text" rows="8" class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					bind:value={inputText} on:input={translate}/>
					
				</div>

				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300" >
					<textarea placeholder="Result" rows="8" class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					bind:value={outputText}/>
				</div>

			</div>

			<div class="items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden">
        
				<div class="mt-8 gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-3 overflow-hidden">
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

