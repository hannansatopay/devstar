<script>
	import { onMount } from 'svelte';
	import html2canvas from 'html2canvas';
	
	let code = `
	function helloWorld() {
	  console.log('Hello, world!');
	}
	`;
	
	let imageUrl = '';
  
	const convertToImage = async () => {
	  const codeElement = document.getElementById('code');
	  const canvas = await html2canvas(codeElement);
	  imageUrl = canvas.toDataURL('image/png');
	};
  
	const downloadImage = () => {
	  const link = document.createElement('a');
	  link.href = imageUrl;
	  link.download = 'code-image.png';
	  link.click();
	};
  </script>

  <style>
	#code {
	  font-family: monospace;
	  background-color: #f5f5f5;
	  padding: 20px;
	  border: 1px solid #ccc;
	  white-space: pre-wrap;
	}
	img {
	  margin-top: 20px;
	}
	button {
	  margin-top: 10px;
	  margin-right: 10px;
	}
  </style>

  <main>
	<h1><b>Code to Image Converter</h1>
	<textarea bind:value={code} rows="10" cols="50"></textarea>
	<div id="code">{code}</div>
	<button on:click={convertToImage}><b>Convert to Image</button>
	{#if imageUrl}
	  <img src={imageUrl} alt="Code Image">
	  <button on:click={downloadImage}><b>Download Image</button>
	{/if}
  </main>

