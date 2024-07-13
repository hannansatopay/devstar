<script>
	import { onMount, onDestroy } from "svelte";
	
	let video;
	let canvas;
	let tempCanvas;
	let stream;
	let filter = "none";
	let cameraStarted = false;
	let capturedImage = "";
	let capturedImageForPreview = "";
	let buttonText = "Start Camera";
	let showCaptureButton = true;
	const placeholderImage = "src/routes/(tools)/camera-filters/defaultimg.jpg"; 
	const placeholderImageForCanvas = "src/routes/(tools)/camera-filters/defalutcanvas.png"
	let filters = [
	  { name: 'None', style: 'none' },
	  { name: 'Grayscale', style: 'grayscale(100%)' },
	  { name: 'Sepia', style: 'sepia(100%)' },
	  { name: 'Blur', style: 'blur(5px)' },
	  { name: 'Brightness', style: 'brightness(150%)' },
	  { name: 'Contrast', style: 'contrast(200%)' },
	  { name: 'Hue Rotate', style: 'hue-rotate(90deg)' },
	  { name: 'Invert', style: 'invert(100%)' },
	  { name: 'Saturate', style: 'saturate(200%)' },
	];

	onMount(() => {
		loadDefaultImage();
	});

	async function startCamera() {
	  try {
		stream = await navigator.mediaDevices.getUserMedia({ video: true });
		video.srcObject = stream;
		await video.play();
		cameraStarted = true;
		buttonText = 'Start Capturing Video';
		showCaptureButton = false; 
		drawToCanvas();
	  } catch (err) {
		console.error('Error accessing the camera: ', err);
	  }
	}

	function loadDefaultImage() {
	  const ctx = canvas.getContext("2d");
	  const img = new Image();
	  img.src = placeholderImageForCanvas;
	  img.onload = () => {
		canvas.width = img.width;
		canvas.height = img.height;
		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	  };
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
	  if (!cameraStarted) {
		alert("Please start the camera first.");
		return;
	  }
	  const ctx = tempCanvas.getContext("2d");
	  tempCanvas.width = video.videoWidth;
	  tempCanvas.height = video.videoHeight;
	  ctx.filter = filter;
	  ctx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
	  capturedImage = tempCanvas.toDataURL("image/png");
	  capturedImageForPreview = capturedImage; 
	}
	
	function downloadImage() {
	  const link = document.createElement("a");
	  link.href = capturedImage;
	  link.download = "captured-image.png";
	  link.click();
	}
</script>
  
<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden rounded-lg">
	<div class="button-row">
	  {#if showCaptureButton}
		<button on:click={startCamera} class="btn">{buttonText}</button>
	  {/if}

	  <button on:click={capturePhoto} class="btn cap-img" disabled={!cameraStarted}>Capture Photo</button>

	  <button on:click={downloadImage} class="btn downl-btn" disabled={!cameraStarted}>Download Image</button>
	</div>

	<div class="filter-options">
		{#each filters as { name, style }}
			<div class="filter-preview" on:click={() => applyFilter(style)}>
				<img src={placeholderImage} alt={name} style="filter: {style}" title={name} />
				<p style="color:white">{name}</p>
			</div>
		{/each}
	</div>

	<div class="canvas-row">
		<canvas bind:this={canvas} width="320px" height="240px"></canvas>
		{#if capturedImage}
		  <img src={capturedImage} alt="Captured Image" class="captured-image" />
		{/if}
	</div>

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
  
	.filter-options {
	  display: flex;
	  justify-content: center;
	  flex-wrap: wrap;
	  gap: 1rem;
	  margin-bottom: 1rem;
	}
  
	.filter-preview {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  cursor: pointer;
	  text-align: center;
	}
	
	.filter-preview img {
	  width: 74px;
	  height: 55px;
	  margin-bottom: 0.5rem;
	  border-radius: 10px;
	  border: 2px solid transparent;
	  transition: border 0.3s;
	}
	
	.filter-preview img:hover {
	  border: 2px solid #786f6f;
	}
	
	.filter-preview p {
	  margin: 0;
	  font-size: 0.75rem;
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
  
	.btn:disabled {
	  background-color: grey;
	  cursor: not-allowed;
	}
</style>
