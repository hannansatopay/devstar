<script>
	import { writable } from 'svelte/store';

	// Define reactive variables for the form inputs
	let width = writable(300);
	let height = writable(150);
	let bgColor = writable('#ddd');
	let textColor = writable('#555');
	let text = writable('Placeholder');
	let base64String = writable('');
  
	// Derived store to dynamically generate the SVG content
	$: svgContent = `
	  <svg width="${$width}" height="${$height}" xmlns="http://www.w3.org/2000/svg">
		<rect width="100%" height="100%" fill="${$bgColor}" />
		<text x="50%" y="50%" alignment-baseline="middle" text-anchor="middle" font-size="24" fill="${$textColor}">
		  ${$text}
		</text>
	  </svg>`;
  
	// Function to download the generated SVG
	function downloadSVG(content) {
	  const blob = new Blob([content], { type: 'image/svg+xml' });
	  const url = URL.createObjectURL(blob);
	  const a = document.createElement('a');
	  a.href = url;
	  a.download = 'placeholder.svg';
	  document.body.appendChild(a);
	  a.click();
	  document.body.removeChild(a);
	  URL.revokeObjectURL(url);
	}
  
	// Function to copy SVG content to clipboard
	async function copyToClipboard(content) {
	  try {
		await navigator.clipboard.writeText(content);
		alert('SVG content copied to clipboard!');
	  } catch (err) {
		alert('Failed to copy SVG content.');
	  }
	}
  
	// Function to generate Base64 string
	function generateBase64(content) {
	  const base64Data = btoa(unescape(encodeURIComponent(content)));
	  $base64String = `data:image/svg+xml;base64,${base64Data}`;
	}
  </script>
  
  <div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg text-gray-900 dark:text-white">
	<div class="form-container p-8">
	  <div class="input-group text-gray-900 dark:text-white">
		<label for="width">Width:</label>
		<input id="width " type="number"class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="10" max="2000" bind:value={$width} />
	  </div>
	  <div class="input-group ">
		<label for="height">Height:</label>
		<input id="height" type="number" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" min="10" max="2000" bind:value={$height} />
	  </div>
	  <div class="input-group">
		<label for="bgColor">Background Color:</label>
		<input id="bgColor" type="color" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" bind:value={$bgColor} />
	  </div>
	  <div class="input-group">
		<label for="textColor">Text Color:</label>
		<input id="textColor" type="color"  class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" bind:value={$textColor} />
	  </div>
	  <div class="input-group">
		<label for="text">Text:</label>
		<input id="text" type="text" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" bind:value={$text} />
	  </div>
	  <div class="button-group">
		<button class="download-btn" on:click={() => downloadSVG(svgContent)}>Download SVG</button>
		<button class="copy-btn" on:click={() => copyToClipboard(svgContent)}>Copy SVG</button>
		<button class="base64-btn" on:click={() => generateBase64(svgContent)}>Generate Base64</button>
	  </div>
	</div>
	<div class="svg-preview p-8">
	  <h1>SVG Placeholder Preview</h1>
	  <div class="placeholder-preview">
		<img src={`data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`} alt="SVG Placeholder" />
	  </div>
	  {#if $base64String}
		<div class="base64-preview">
		  <h3>Base64 String:</h3>
		  <textarea readonly class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">{$base64String}</textarea>
		</div>
	  {/if}
	</div>
  </div>
   
<style>
 

  .form-container {
	border-right: 1px solid #5a555525;
    border-radius: 8px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
  }

  .input-group label {
    font-weight: bold;
    margin-bottom: 0.5rem;
  }

  .input-group input {
    padding: 0.5rem;
    font-size: 1rem;
    margin-bottom: 0.5rem;
	 
  }

  .button-group {
    display: flex;
    gap: 0.5rem;
  }

  .download-btn, .copy-btn, .base64-btn {
    background-color: #007bff;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .download-btn:hover, .copy-btn:hover, .base64-btn:hover {
    background-color: #0056b3;
  }

  .svg-preview {
    padding: 1rem;
    border-radius: 8px;
  }

  .placeholder-preview {
    margin-top: 1rem;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    border-radius: 8px;
  }

  .base64-preview {
    margin-top: 1rem;
    padding: 1rem;
    border-radius: 8px;
  }

  .base64-preview textarea {
    width: 100%;
    height: 100px;
    padding: 0.5rem;
    font-family: monospace;
    font-size: 0.875rem;
    border: none;
    
  }
</style>





