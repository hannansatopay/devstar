   <script>
	import { onMount, onDestroy } from "svelte";
  
	let video;
	let canvas;
	let tempCanvas;
	let stream;
	let filter = "none";
	let cameraStarted = false;
	let capturedImage = "";
	let buttonText = "Start Camera";
	let filters = [
	  { name: 'none', style: 'none' },
	  { name: 'grayscale(100%)', style: 'grayscale(100%)' },
	  { name: 'sepia(100%)', style: 'sepia(100%)' },
	  { name: 'blur(5px)', style: 'blur(5px)' },
	  { name: 'brightness(150%)', style: 'brightness(150%)' },
	  { name: 'contrast(200%)', style: 'contrast(200%)' },
	  { name: 'hue-rotate(90deg)', style: 'hue-rotate(90deg)' },
	  { name: 'invert(100%)', style: 'invert(100%)' },
	  { name: 'saturate(200%)', style: 'saturate(200%)' },
	];
  
	async function startCamera() {
	  try {
		stream = await navigator.mediaDevices.getUserMedia({ video: true });
		video.srcObject = stream;
		await video.play();
		cameraStarted = true;
		buttonText = 'Start Capturing Video';
		drawToCanvas();
		captureForPreview();
	  } catch (err) {
		console.error('Error accessing the camera: ', err);
	  }
	}
  
	function drawToCanvas() {
	  const ctx = canvas.getContext("2d");
	  canvas.width = video.videoWidth;
	  canvas.height = video.videoHeight;
  
	  function draw() {
		if (video.readyState === video.HAVE_ENOUGH_DATA) {
		  // Check if video is ready
		  ctx.filter = filter;
		  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
		}
		requestAnimationFrame(draw);
	  }
  
	  draw();
	}
  
	function stopCamera() {
	  if (stream) {
		stream.getTracks().forEach((track) => track.stop());
	  }
	}
  
	onDestroy(() => {
	  stopCamera();
	});
  
	function applyFilter(filterStyle) {
	  filter = filterStyle;
	}
  
	function capturePhoto() {
	  const ctx = tempCanvas.getContext("2d");
	  tempCanvas.width = video.videoWidth;
	  tempCanvas.height = video.videoHeight;
	  ctx.filter = filter;
	  ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
	  capturedImage = tempCanvas.toDataURL("image/png");
	}
  
	function downloadImage() {
	  const link = document.createElement("a");
	  link.href = capturedImage;
	  link.download = "captured-image.png";
	  link.click();
	}
  
	function captureForPreview() {
	  const ctx = tempCanvas.getContext("2d");
	  tempCanvas.width = video.videoWidth;
	  tempCanvas.height = video.videoHeight;
	  ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
	  capturedImage = tempCanvas.toDataURL("image/png");
	}
  </script>
  
  <div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden rounded-lg">
	<div class="button-row">
	  <button on:click={startCamera} class="btn">{buttonText}</button>
	  {#if cameraStarted}
		<button on:click={capturePhoto} class="btn cap-img">Capture Photo</button>
		{#if capturedImage}
		  <button on:click={downloadImage} class="btn downl-btn">Download Image</button>
		{/if}
	  {/if}
	</div>
	
	{#if cameraStarted}
	  <div class="filter-preview">
		{#each filters as filter}
		  <img src={capturedImage} alt={filter.name} style="filter: {filter.style};" on:click={() => applyFilter(filter.style)} />
		{/each}
	  </div>
	  <div class="canvas-row">
		<canvas bind:this={canvas} width="320px" height="240px"></canvas>
		{#if capturedImage}
		  <img src={capturedImage} alt="Captured Image" class="captured-image" />
		{/if}
	  </div>
	{/if}
  
	<canvas bind:this={tempCanvas} width="320px" height="240px" style="display: none;"></canvas>
	<video bind:this={video} style="display: none;" autoplay></video>
  </div>
  
  <style>
	.button-row {
	  display: flex;
	  justify-content: center;
	  align-items: center;
	  gap: 4rem;
	  margin: 15px 0; 

	}
  
	.filter-preview {
	  display: flex;
	  flex-direction: row;
	  justify-content: center;
	  flex-wrap: wrap;

	}
	
	.filter-preview img {
		width: 74px;
		height: 55px;
		cursor: pointer;
		margin: 0px 15px;
		border-radius: 10px;
	  
	}
	
	.canvas-row {
		display: flex;
		justify-content: center;
		align-items: center;
		gap: 20px;
		margin-bottom: 20px;

	}
  
	canvas {
	  width: 320px;
	  height: 240px;
	  border: 1px solid black;
	}
  
	.captured-image {
	  width: 320px;
	  height: 240px;
	  border: 1px solid black;
	  object-fit: contain;
	}
  
	.btn {
	  background-color: rgb(120, 71, 255);
	  border-radius: 30px;
	  color: #dadddf;
	  width: 12rem;
	  padding: 0.5rem;
	}
  
	.btn:hover {
	  background-color: rgb(97, 42, 248);
	  transition-duration: 0.1s;
	}
  </style>
  