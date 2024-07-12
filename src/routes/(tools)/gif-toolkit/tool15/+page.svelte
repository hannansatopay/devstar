<script>
    import { onMount } from 'svelte';
    import { saveAs } from 'file-saver';
    import { parseGIF, decompressFrames } from 'gifuct-js';
    import GIF from 'gif.js.optimized';
  
    let gifFile;
    let frames = [];
    let gifCanvas;
    let ctx;
    let gifSpeed = 1;
    let frameIndex = 0;
    let timer;
    let processedGifURL;
    let originalGifURL;
  
    async function handleFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.type === 'image/gif') {
        gifFile = file;
        originalGifURL = URL.createObjectURL(file);
        const arrayBuffer = await gifFile.arrayBuffer();
        const parsedGif = parseGIF(arrayBuffer);
        frames = decompressFrames(parsedGif, true);
        frameIndex = 0;
  
        if (frames.length > 0) {
          playGIF();
        } else {
          console.error("No frames available in the GIF.");
        }
      } else {
        alert('Please upload a valid GIF file.');
      }
    }
  
    function playGIF() {
      if (!ctx || !frames.length) {
        console.error("Canvas context or frames are not initialized");
        return;
      }
  
      if (timer) clearInterval(timer);
  
      timer = setInterval(() => {
        const frame = frames[frameIndex];
        const imageData = new ImageData(
          new Uint8ClampedArray(frame.patch),
          frame.dims.width,
          frame.dims.height
        );
  
        ctx.putImageData(imageData, frame.dims.left, frame.dims.top);
        frameIndex = (frameIndex + 1) % frames.length;
      }, (100 / gifSpeed) * (frames[frameIndex].delay || 10));
    }
  
    function changeSpeed(event) {
      gifSpeed = parseFloat(event.target.value);
      playGIF();
    }
  
    async function saveGIF() {
      const gifCreator = new GIF({
        workers: 2,
        quality: 10,
        workerScript: 'node_modules/gif.js.optimized/dist/gif.worker.js'
      });
  
      frames.forEach(frame => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = frame.dims.width;
        canvas.height = frame.dims.height;
        const imageData = new ImageData(
          new Uint8ClampedArray(frame.patch),
          frame.dims.width,
          frame.dims.height
        );
        context.putImageData(imageData, 0, 0);
        gifCreator.addFrame(canvas, { delay: (frame.delay || 10) / gifSpeed });
      });
  
      gifCreator.on('finished', (blob) => {
        saveAs(blob, 'speed-controlled.gif');
        processedGifURL = URL.createObjectURL(blob);
      });
  
      gifCreator.render();
    }
  
    onMount(() => {
      if (gifCanvas) {
        ctx = gifCanvas.getContext('2d');
      } else {
        console.error("Canvas element not found");
      }
    });
  </script>
  
  <div class="container">
    <div class="title">GIF Playback Speed Controller</div>
    <div class="upload-container">
      <input type="file" accept="image/gif" on:change={handleFileUpload} id="gif-upload" style="display: none;">
      <label for="gif-upload" class="upload-button">Upload GIF</label>
    </div>
    {#if gifFile}
      <div class="control-container">
        <label for="gifSpeed">Playback Speed: {gifSpeed}x</label>
        <input type="range" id="gifSpeed" min="0.1" max="10" step="0.1" bind:value={gifSpeed} on:input={changeSpeed} />
      </div>
      <div class="preview-container">
        <div class="preview">
          <div>Original GIF</div>
          <img src={originalGifURL} alt="Original GIF">
        </div>
        <div class="preview">
          <div>Processed GIF</div>
          {#if processedGifURL}
            <img src={processedGifURL} alt="Processed GIF Preview">
          {/if}
        </div>
      </div>
      <canvas bind:this={gifCanvas} id="gifCanvas" width="500" height="500" style="display: none;"></canvas>
      <div>
        <button class="download-button" on:click={saveGIF}>Download Speed-Controlled GIF</button>
      </div>
    {/if}
  </div>
  
  <style>
    .container {
      max-width: 900px;
      margin: auto;
      text-align: center;
      color: white;
    }
  
    .title {
      font-size: 24px;
      margin-bottom: 20px;
      font-weight: 600;
      color: #ff6347;
    }
  
    .upload-container {
      margin-bottom: 20px;
    }
  
    .upload-button {
      display: inline-block;
      padding: 12px 24px;
      background-color: #28a745;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    .upload-button:hover {
      background-color: #218838;
    }
  
    .preview-container {
      display: flex;
      justify-content: space-around;
      margin-top: 20px;
      gap: 20px;
      font-size: 18px;
      color: #ff6347;
    }
  
    .preview {
      width: 45%;
      text-align: center;
    }
  
    .preview img {
      max-width: 100%;
      height: auto;
      border-radius: 5px;
      margin-top: 10px;
    }
  
    .control-container {
      margin: 20px 0;
      color: #ff6347;
    }
  
    .control-container label {
      font-weight: 600;
      font-size: 16px;
    }
  
    .download-button {
      display: inline-block;
      margin-top: 20px;
      padding: 12px 24px;
      background-color: #007bff;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      transition: background-color 0.3s ease;
    }
  
    .download-button:hover {
      background-color: #0056b3;
    }
  </style>