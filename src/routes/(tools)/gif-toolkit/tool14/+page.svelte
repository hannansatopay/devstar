<script>
    import GIF from 'gif.js.optimized';
    import { parseGIF, decompressFrames } from 'gifuct-js';
  
    let gifUrl = "";
    let borderColor = "#000000";
    let borderWidth = 5;
    let canvas;
    let originalGifUrl = "";
    let borderedGifBlob = null;
    let isRendering = false;
    let frames = [];
    let currentFrame = 0;
    let frameInterval;
  
    function handleFileUpload(event) {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('image/gif')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (typeof e.target?.result === 'string') {
            gifUrl = e.target.result;
            originalGifUrl = gifUrl;
            loadGifFrames();
          }
        };
        reader.readAsDataURL(file);
      } else {
        alert('Please upload a valid GIF file.');
      }
    }
  
    async function loadGifFrames() {
      const response = await fetch(gifUrl);
      const buffer = await response.arrayBuffer();
      const gif = parseGIF(buffer);
      frames = decompressFrames(gif, true);
      currentFrame = 0;
      drawDynamicGif();
    }
  
    function drawDynamicGif() {
      const context = canvas.getContext('2d');
      if (context && frames.length) {
        const img = frames[currentFrame];
        canvas.width = img.dims.width + borderWidth * 2;
        canvas.height = img.dims.height + borderWidth * 2;
        context.fillStyle = borderColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        const frameImageData = new ImageData(new Uint8ClampedArray(img.patch), img.dims.width, img.dims.height);
        context.putImageData(frameImageData, borderWidth, borderWidth);
      }
    }
  
    function updateFrame() {
      if (frames.length) {
        currentFrame = (currentFrame + 1) % frames.length;
        drawDynamicGif();
      }
    }
  
    function startFrameLoop() {
      if (frameInterval) clearInterval(frameInterval);
      const delay = frames[currentFrame]?.delay || 100;
      frameInterval = setInterval(updateFrame, delay);
    }
  
    function updateBorderColor(event) {
      borderColor = event.target.value;
      if (gifUrl) drawDynamicGif();
    }
  
    function updateBorderWidth(event) {
      borderWidth = parseInt(event.target.value, 10);
      if (gifUrl) drawDynamicGif();
    }
  
    async function downloadGif() {
      if (isRendering || !gifUrl) return;
      isRendering = true;
  
      const gifEncoder = new GIF({
        workers: 2,
        quality: 10,
        workerScript: 'node_modules/gif.js.optimized/dist/gif.worker.js',
        width: frames[0].dims.width + borderWidth * 2,
        height: frames[0].dims.height + borderWidth * 2
      });
  
      for (const frame of frames) {
        const context = canvas.getContext('2d');
        if (context) {
          canvas.width = frame.dims.width + borderWidth * 2;
          canvas.height = frame.dims.height + borderWidth * 2;
          context.fillStyle = borderColor;
          context.fillRect(0, 0, canvas.width, canvas.height);
          const frameImageData = new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height);
          context.putImageData(frameImageData, borderWidth, borderWidth);
          gifEncoder.addFrame(context, { copy: true, delay: frame.delay });
        }
      }
  
      gifEncoder.on('finished', (blob) => {
        borderedGifBlob = blob;
        isRendering = false;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'bordered-gif.gif';
        link.click();
      });
  
      gifEncoder.render();
    }
  
    $: if (gifUrl) {
      startFrameLoop();
    }
  </script>
  
  <div class="container">
    <h1 class="title">Add a Border to Your GIF</h1>
    <div class="upload-container">
      <input type="file" accept="image/gif" on:change={handleFileUpload} id="gif-upload" style="display: none;" />
      <label for="gif-upload" class="upload-button">Upload GIF</label>
    </div>
  
    {#if gifUrl}
    <div class="control-container">
        <label for="border-color">Border Color:</label>
        <input type="color" id="border-color" value={borderColor} on:input={updateBorderColor} />
        
        <label for="border-width">Border Width (px):</label>
        <input type="number" id="border-width" value={borderWidth} on:input={updateBorderWidth} min="0" />
    </div>
      
  
      <div class="preview-container">
        <div class="preview">
          <div>Original GIF</div>
          <img src={originalGifUrl} alt="Original GIF" />
        </div>
        <div class="preview">
          <div>GIF with Border</div>
          <canvas bind:this={canvas}></canvas>
        </div>
      </div>
  
      <div>
        <button class="download-button" on:click={downloadGif}>Download GIF with Border</button>
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
  
    .control-container {
        margin: 20px 0;
        color: #ff6347;
    }

    .control-container label {
        font-weight: 600;
        font-size: 16px;
        margin-right: 10px;
        margin-bottom: 10px;
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
      border-radius: 5px;
      margin-top: 10px;
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