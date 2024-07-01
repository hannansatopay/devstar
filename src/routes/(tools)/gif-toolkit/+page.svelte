<script>
	import { onMount } from 'svelte';
  
	let file = null;
	let flippedUrl = null;
	let previewUrl = null;
  
	async function handleFileUpload(event) {
	  const input = event.target;
	  if (input.files && input.files[0]) {
		file = input.files[0];
		previewUrl = URL.createObjectURL(file);
	  }
	}
  
	async function flipAndDownload() {
	  if (!file) return;
  
	  // Simulate flipping (replace with actual server-side processing)
	  try {
		// Assuming flipped GIF is the same as the original for demonstration
		flippedUrl = previewUrl;
	  } catch (error) {
		console.error('Error flipping GIF:', error.message);
	  }
	}
  
	function downloadFlipped() {
	  if (flippedUrl) {
		const a = document.createElement('a');
		a.href = flippedUrl;
		a.download = 'flipped.gif';
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	  }
	}
  
	// Initialize canvas and draw image when previewUrl changes
	let canvas;
	onMount(() => {
	  canvas = document.getElementById('previewCanvas');
	});
  
	$: if (previewUrl && canvas) {
	  const ctx = canvas.getContext('2d');
	  const img = new Image();
	  img.onload = function() {
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	  };
	  img.src = previewUrl;
	}
  </script>
  
  <style>
	.card {
	  display: grid;
	  grid-template-columns: 1fr 1fr;
	  gap: 16px;
	  max-width: 100%;
	  overflow: hidden;
	  border-radius: 8px;
	  background-color: #fff;
	  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	  padding: 16px;
	}
  
	.card img {
	  max-width: 100%;
	  max-height: 300px;
	  object-fit: contain;
	}
  
	.flex {
	  display: flex;
	  flex-direction: column;
	  gap: 8px;
	}
  
	.btn {
	  padding: 10px 20px;
	  font-size: 14px;
	  font-weight: bold;
	  text-align: center;
	  cursor: pointer;
	  border: none;
	  border-radius: 4px;
	  color: #fff;
	}
  
	.btn-primary {
	  background-color: #007bff;
	}
  
	.btn-primary:hover {
	  background-color: #0056b3;
	}
  
	.btn-secondary {
	  background-color: #28a745;
	}
  
	.btn-secondary:hover {
	  background-color: #218838;
	}
  
	.canvas-container {
	  display: flex;
	  justify-content: center;
	  align-items: center;
	  height: 300px; /* Adjust height as needed */
	}
  
	canvas {
	  max-width: 100%;
	  max-height: 100%;
	  object-fit: contain;
	}
  </style>
  
  <div class="card">
	<div class="flex">
	  <label for="file">Upload GIF:</label>
	  <input type="file" id="file" on:change={handleFileUpload}>
	  <button class="btn btn-primary" on:click={flipAndDownload}>Flip GIF</button>
	  <button class="btn btn-secondary" on:click={downloadFlipped} disabled={!flippedUrl}>Download Flipped GIF</button>
	</div>
  
	{#if previewUrl}
	  <div class="canvas-container">
		<canvas id="previewCanvas"></canvas>
	  </div>
	{/if}
  
	{#if flippedUrl}
	  <div class="flex justify-center items-center">
		<img src={flippedUrl} alt="Flipped GIF">
	  </div>
	{:else}
	  <div class="flex justify-center items-center">
		<p class="text-gray-500">Upload a GIF and click 'Flip GIF' to get started!</p>
	  </div>
	{/if}
  </div>