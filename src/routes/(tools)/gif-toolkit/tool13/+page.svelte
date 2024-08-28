<script>
    import { parseGIF, decompressFrames } from 'gifuct-js';
    import GIF from 'gif.js.optimized';
    import { saveAs } from 'file-saver';
  
    let resizedGifUrl = '';
    let width = 200; 
    let height = 200; 
    let gifFrames = [];
    let originalGif;
    let isRendering = false;
    let isProcessed = false;
  
    async function handleFileChange(event) {
      const gifFile = event.target.files[0];
      if (gifFile && gifFile.type === 'image/gif') {
        originalGif = URL.createObjectURL(gifFile);
        await parseGifFile(gifFile);
        isProcessed = false;
      }
    }
  
    async function parseGifFile(file) {
      const arrayBuffer = await file.arrayBuffer();
      const gif = parseGIF(arrayBuffer);
      gifFrames = decompressFrames(gif, true);
    }
  
    function processGif() {
      if (!gifFrames.length || isRendering) return;
      isRendering = true;
  
      const gifEncoder = new GIF({
        workers: 2,
        quality: 10,
        workerScript: 'node_modules/gif.js.optimized/dist/gif.worker.js'
      });
  
      gifFrames.forEach(frame => {
        const { imageData, delay } = resizeFrame(frame);
        gifEncoder.addFrame(imageData, { delay });
      });
  
      gifEncoder.on('finished', function(blob) {
        resizedGifUrl = URL.createObjectURL(blob);
        isRendering = false;
        isProcessed = true;
      });
  
      gifEncoder.render();
    }
  
    function resizeFrame(frame) {
      const { dims, patch } = frame;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
  
      canvas.width = dims.width;
      canvas.height = dims.height;
  
      const imageData = new ImageData(new Uint8ClampedArray(patch), dims.width, dims.height);
      ctx.putImageData(imageData, 0, 0);
  
      const resizedCanvas = document.createElement('canvas');
      const resizedCtx = resizedCanvas.getContext('2d');
  
      resizedCanvas.width = width;
      resizedCanvas.height = height;
  
      resizedCtx.drawImage(canvas, 0, 0, width, height);
  
      return {
        imageData: resizedCtx.getImageData(0, 0, width, height),
        delay: frame.delay
      };
    }
  
    function downloadResizedGif() {
      if (resizedGifUrl) {
        saveAs(resizedGifUrl, 'resized.gif');
      }
    }
  </script>
  
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
  
    .preview img,
    .preview canvas {
      max-width: 100%;
      height: auto;
      border: 2px solid #ccc;
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
  
    .button-container {
      margin-top: 20px;
    }
  
    .process-button,
    .download-button {
      display: inline-block;
      padding: 12px 24px;
      margin: 10px;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    .process-button {
      background-color: #007bff;
    }
  
    .process-button:hover {
      background-color: #0056b3;
    }
  
    .download-button {
      background-color: #007bff;
    }
  
    .download-button:hover {
      background-color: #0056b3;
    }
  </style>
  
  <div class="container">
    <div class="title">Resize a GIF</div>
    <div class="upload-container">
      <input type="file" accept="image/gif" on:change={handleFileChange} id="gif-upload" style="display: none;">
      <label for="gif-upload" class="upload-button">Upload GIF</label>
    </div>
    {#if originalGif}
      <div class="control-container">
        <label for="width">Width: </label>
        <input id="width" type="number" bind:value={width} min="1" />
      </div>
      <div class="control-container">
        <label for="height">Height: </label>
        <input id="height" type="number" bind:value={height} min="1" />
      </div>
      <div class="button-container">
        <a class="process-button" on:click={processGif}>Process GIF</a>
      </div>
      {#if isProcessed}
        <div class="preview-container">
          <div class="preview">
            <div>Original GIF</div>
            <img src={originalGif} alt="Original GIF">
          </div>
          <div class="preview">
            <div>Resized GIF</div>
            {#if resizedGifUrl}
              <img src={resizedGifUrl} alt="Resized GIF Preview">
            {/if}
          </div>
        </div>
        <div>
          <a class="download-button" on:click={downloadResizedGif}>Download Resized GIF</a>
        </div>
      {/if}
    {/if}
  </div>