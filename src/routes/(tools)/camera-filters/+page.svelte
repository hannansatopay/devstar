<script>
	import { onMount, onDestroy } from "svelte";

	let video;
	let canvas;
	let captureCanvas;
	let stream;
	let filter = "none";
	let cameraStarted = false;
	let capturedImage = "";
	let buttonText = "Start Camera";

	async function startCamera() {
    try {
      stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;
      await video.play(); 
      cameraStarted = true;
      buttonText = 'Start Capturing Video'; 
      drawToCanvas();
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

	function applyFilter(event) {
		filter = event.target.value;
	}

	function capturePhoto() {
		const ctx = captureCanvas.getContext("2d");
		const scaleFactor = video.videoWidth / 320;
		captureCanvas.width = video.videoWidth;
		captureCanvas.height = video.videoHeight;
		ctx.filter = filter;
		ctx.drawImage(video, 0, 0, 320, 240);
		ctx.drawImage(video, 0, 0, captureCanvas.width, captureCanvas.height);
		capturedImage = captureCanvas.toDataURL("image/png");
	}

	function downloadImage() {
		const link = document.createElement("a");
		link.href = capturedImage;
		link.download = "captured-image.png";
		link.click();
	}
</script>

<div
	class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg"
>
	<button on:click={startCamera} class="btn">{buttonText}</button>
	{#if cameraStarted}

		<select on:change={applyFilter} for='abc'>
			<option value="none">None</option>
			<option value="grayscale(100%)">Grayscale</option>
			<option value="sepia(100%)">Sepia</option>
			<option value="blur(5px)">Blur</option>
			<option value="brightness(150%)">Brightness</option>
			<option value="contrast(200%)">Contrast</option>
			<option value="hue-rotate(90deg)">Hue Rotate</option>
			<option value="invert(100%)">Invert</option>
			<option value="saturate(200%)">Saturate</option>
		</select>
		<canvas bind:this={canvas} width="320px" height="240px"></canvas>
		<button on:click={capturePhoto} class="btn cap-img">
			Capture Photo</button
		>
		{#if capturedImage}
			<h2>Captured Image:</h2>
			<img src={capturedImage} alt="Captured Image" />
			<button on:click={downloadImage} class="btn downl-btn">Download Image</button>
		{/if}
	{/if}

	<canvas
		bind:this={captureCanvas}
		width="320px"
		height="240px"
		style="display: none;"
	></canvas>
	<video bind:this={video} style="display: none;" autoplay></video>
</div>

<style>
	canvas {
		width: 320px;
		height: 240px;
		border: 1px solid black;
		margin: 20px;
	}

	select {
		margin-left: 150px;
		width: 300px;
	}

	img {
		margin-top: -430px;
		border: 1px solid black;
		width: 320px; 
		height: 240px; 
		object-fit: contain; 
	}
	.btn {
		background-color: rgb(120, 71, 255);
		border-radius: 30px;
		color: #dadddf;
		width: 12rem;
		margin: 20px;
		padding: 0.5rem;
	}

	.btn:hover {
		background-color: rgb(97, 42, 248);
		transition-duration: 0.1s;
	}
	.cap-img {
		position: relative;
		top: -244px;
		left: -240px;
		margin: 10px;
	}
	h2{
		color: azure;
		position: relative;
		top:-360px;
		left:600px
	}
	.downl-btn{
		position: relative;
		top:-150px;
		left:600px
	}
</style>
