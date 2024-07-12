<script>
  import { saveAs } from 'file-saver';
  import { parseGIF, decompressFrames } from 'gifuct-js';
  import gifshot from 'gifshot';
  import { onMount } from 'svelte';
  let gifFile;
  let modifiedGifBlob;
  let speedFactor = 1;
  let gifURL;
  let originalGif;
  let downloadLink;
  async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === 'image/gif') {
      gifFile = file;
      gifURL = URL.createObjectURL(file);
      originalGif = gifURL;
      await modifyGifSpeed();
    } else {
      alert('Please upload a valid GIF file.');
    }
  }
  async function modifyGifSpeed() {
    if (!gifFile) return;
    const frames = await extractFrames(gifFile);
    const adjustedInterval = 0.1 / speedFactor;
    modifiedGifBlob = await createModifiedGif(frames, frames[0].dims.width, frames[0].dims.height, adjustedInterval);
  }
  function downloadModifiedGif() {
    if (modifiedGifBlob) {
      saveAs(modifiedGifBlob, 'modified.gif');
    }
  }
  async function extractFrames(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const gif = parseGIF(e.target.result);
          const frames = decompressFrames(gif, true);
          resolve(frames);
        } catch (error) {
          reject(error);
        }
      };
      reader.readAsArrayBuffer(file);
    });
  }
  async function createModifiedGif(frames, width, height, interval) {
    const images = await Promise.all(frames.map(frame => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = frame.dims.width;
      canvas.height = frame.dims.height;
      const imageData = new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height);
      ctx.putImageData(imageData, 0, 0);
      return new Promise(resolve => {
        canvas.toBlob(blob => {
          const img = new Image();
          img.src = URL.createObjectURL(blob);
          img.onload = () => resolve(img.src);
        }, 'image/png');
      });
    }));
    return new Promise((resolve, reject) => {
      gifshot.createGIF({
        images,
        gifWidth: width,
        gifHeight: height,
        interval: interval,
        numFrames: images.length,
        frameDuration: interval * 100, // Multiply by 100 to get the correct duration in milliseconds
        sampleInterval: 10,
        numWorkers: 2
      }, function (obj) {
        if (!obj.error) {
          const blob = dataURLToBlob(obj.image);
          resolve(blob);
        } else {
          reject(obj.error);
        }
      });
    });
  }
  function dataURLToBlob(dataURL) {
    const byteString = atob(dataURL.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: 'image/gif' });
  }
</script>
<div class="container">
  <div class="title">Control GIF Speed</div>
  <div class="upload-container">
    <input type="file" accept="image/gif" on:change={handleFileUpload} id="gif-upload" style="display: none;">
    <label for="gif-upload" class="upload-button">Upload GIF</label>
  </div>
  {#if gifFile}
    <div class="control-container">
      <label for="speedFactor">Speed Factor: {speedFactor}</label>
      <input type="range" id="speedFactor" min="0.1" max="5" step="0.1" bind:value={speedFactor} on:input={modifyGifSpeed} />
    </div>
    <div class="preview-container">
      <div class="preview">
        <div>Original GIF</div>
        <img src={originalGif} alt="Original GIF">
      </div>
      <div class="preview">
        <div>Modified GIF</div>
        {#if modifiedGifBlob}
          <img src={URL.createObjectURL(modifiedGifBlob)} alt="Modified GIF Preview">
        {/if}
      </div>
    </div>
    <div>
      <a bind:this={downloadLink} class="download-button" on:click={downloadModifiedGif}>Download Modified GIF</a>
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
    color: #FF6347;
  }
  .upload-container {
    margin-bottom: 20px;
  }
  .upload-button {
    display: inline-block;
    padding: 12px 24px;
    background-color: #28A745;
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
    color: #FF6347;
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
    color: #FF6347;
  }
  .control-container label {
    font-weight: 600;
  }
  .download-button {
    display: inline-block;
    margin-top: 20px;
    padding: 12px 24px;
    background-color: #007BFF;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  .download-button:hover {
    background-color: #0056B3;
  }
</style>