<script>
    import { saveAs } from 'file-saver';
    import { parseGIF, decompressFrames } from 'gifuct-js';
    import { onMount } from 'svelte';
  
    let gifFile;
    let modifiedGifBlob;
    let gifURL;
    let originalGif;
    let downloadLink;
    let modifiedGifUrl;
    let isRendering = false;
    let gifJs = null;
  
    async function handleFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.type === 'image/gif') {
        gifFile = file;
        gifURL = URL.createObjectURL(file);
        originalGif = gifURL;
        await processGif();
      } else {
        alert('Please upload a valid GIF file.');
      }
    }
  
    async function processGif() {
      if (!gifFile || isRendering) return;
      isRendering = true;
  
      const arrayBuffer = await gifFile.arrayBuffer();
      const gif = parseGIF(arrayBuffer);
      const frames = decompressFrames(gif, true);
  
      const processedFrames = await processBoomerang(frames);
  
      if (!gifJs) {
        gifJs = (await import('gif.js.optimized')).default;
      }
  
      const gifCreator = new gifJs({
        workers: 2,
        quality: 10,
        workerScript: '/node_modules/gif.js.optimized/dist/gif.worker.js'
      });
  
      processedFrames.forEach(({ canvas, delay }) => {
        gifCreator.addFrame(canvas, { delay });
      });
  
      gifCreator.on('finished', (blob) => {
        modifiedGifBlob = blob;
        modifiedGifUrl = URL.createObjectURL(blob);
        isRendering = false;
      });
  
      gifCreator.render();
    }
  
    async function processBoomerang(frames) {
      const processedFrames = [];
  
      frames.forEach(frame => {
        processedFrames.push(frame);
      });
  
      for (let i = frames.length - 2; i >= 0; i--) {
        processedFrames.push(frames[i]);
      }
  
      return await Promise.all(processedFrames.map(frame => processFrame(frame)));
    }
  
    async function processFrame(frame) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = frame.dims.width;
      canvas.height = frame.dims.height;
  
      const imageData = new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height);
      ctx.putImageData(imageData, 0, 0);
  
      return { canvas, delay: frame.delay };
    }
  
    function downloadModifiedGif() {
      if (modifiedGifBlob) {
        saveAs(modifiedGifBlob, 'boomeranged.gif');
      }
    }
  
    onMount(async () => {
      if (typeof window !== 'undefined') {
        gifJs = (await import('gif.js.optimized')).default;
      }
    });
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
  
    .gif-preview {
      text-align: center;
      margin-top: 20px;
      color: #ff6347;
    }
  
    .gif-preview table {
      margin: auto;
      width: 100%;
      border-collapse: collapse;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }
  
    .gif-preview table tr:first-child td {
      padding: 10px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
  
    .gif-preview table tr:first-child td h3 {
      margin-top: 0;
      font-size: 18px;
    }
  
    .gif-preview table tr td {
      padding: 20px;
      vertical-align: middle;
    }
  
    .gif-preview table tr td img {
      width: 100%;  
      height: 100%; 
      object-fit: cover; 
      display: block;
      margin: auto;
      border-radius: 8px;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
    }
  
    .gif-preview table tr:last-child td {
      text-align: center;
      padding: 20px;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  
    .gif-preview table tr:last-child td button {
      background-color: #007bff;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    .gif-preview table tr:last-child td button:hover {
      background-color: #0056b3;
    }
  </style>
  
  <div class="container">
    <h1 class="title">GIF Boomerang Converter</h1>
  
    <div class="upload-container">
      <input type="file" accept="image/gif" on:change={handleFileUpload} id="gif-upload" style="display: none;">
      <label for="gif-upload" class="upload-button">Upload GIF</label>
    </div>
  
    {#if gifURL}
      <div class="gif-preview">
        <table style="margin: auto;">
          <tr>
            <td style="text-align: center;">
              <h3>Original GIF</h3>
              <img src={originalGif} alt="Original GIF" style="max-width: 100%;">
            </td>
            <td style="text-align: center;">
              <h3>Boomeranged GIF</h3>
              <img src={modifiedGifUrl} alt="Boomeranged GIF" style="max-width: 100%;">
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: center;">
              <button on:click={downloadModifiedGif}>Download Boomeranged GIF</button>
            </td>
          </tr>
        </table>
      </div>
    {/if}
  </div>