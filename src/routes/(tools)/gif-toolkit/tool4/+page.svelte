<script>
  import { saveAs } from 'file-saver';
  import { parseGIF, decompressFrames, applyPalette } from 'gifuct-js';
  import GIF from 'gif.js.optimized';

  let gifFile;
  let modifiedGifBlob;
  let gifURL;
  let originalGif;
  let downloadLink;
  let modifiedGifUrl;
  let isRendering = false;
  let brightnessValue = 0;
  let contrastValue = 0;
  let sharpenValue = 0;

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

    const processedFrames = await Promise.all(frames.map(frame => processFrame(frame)));

    const gifCreator = new GIF({
      workers: 2,
      quality: 10,
      workerScript: 'node_modules/gif.js.optimized/dist/gif.worker.js'
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

  async function processFrame(frame) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = frame.dims.width;
    canvas.height = frame.dims.height;

    const imageData = new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height);
    ctx.putImageData(imageData, 0, 0);

    applyBrightness(ctx, canvas, brightnessValue);
    applyContrast(ctx, canvas, contrastValue);
    applySharpen(ctx, canvas, sharpenValue);

    return { canvas, delay: frame.delay };
  }

  function applyBrightness(ctx, canvas, brightness) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      data[i] += 255 * (brightness / 100);
      data[i + 1] += 255 * (brightness / 100);
      data[i + 2] += 255 * (brightness / 100);
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function applyContrast(ctx, canvas, contrast) {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {
      data[i] = factor * (data[i] - 128) + 128;
      data[i + 1] = factor * (data[i + 1] - 128) + 128;
      data[i + 2] = factor * (data[i + 2] - 128) + 128;
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function applySharpen(ctx, canvas, sharpen) {
    if (sharpen === 0) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;
    const buffer = new Uint8ClampedArray(data);

    const weights = [-1, -1, -1, -1, 9, -1, -1, -1, -1];

    for (let i = 1; i < height - 1; i++) {
      for (let j = 1; j < width - 1; j++) {
        const sumRed = (
          weights[0] * buffer[((i - 1) * width + j - 1) * 4] +
          weights[1] * buffer[((i - 1) * width + j) * 4] +
          weights[2] * buffer[((i - 1) * width + j + 1) * 4] +
          weights[3] * buffer[(i * width + j - 1) * 4] +
          weights[4] * buffer[(i * width + j) * 4] +
          weights[5] * buffer[(i * width + j + 1) * 4] +
          weights[6] * buffer[((i + 1) * width + j - 1) * 4] +
          weights[7] * buffer[((i + 1) * width + j) * 4] +
          weights[8] * buffer[((i + 1) * width + j + 1) * 4]
        );

        const sumGreen = (
          weights[0] * buffer[((i - 1) * width + j - 1) * 4 + 1] +
          weights[1] * buffer[((i - 1) * width + j) * 4 + 1] +
          weights[2] * buffer[((i - 1) * width + j + 1) * 4 + 1] +
          weights[3] * buffer[(i * width + j - 1) * 4 + 1] +
          weights[4] * buffer[(i * width + j) * 4 + 1] +
          weights[5] * buffer[(i * width + j + 1) * 4 + 1] +
          weights[6] * buffer[((i + 1) * width + j - 1) * 4 + 1] +
          weights[7] * buffer[((i + 1) * width + j) * 4 + 1] +
          weights[8] * buffer[((i + 1) * width + j + 1) * 4 + 1]
        );

        const sumBlue = (
          weights[0] * buffer[((i - 1) * width + j - 1) * 4 + 2] +
          weights[1] * buffer[((i - 1) * width + j) * 4 + 2] +
          weights[2] * buffer[((i - 1) * width + j + 1) * 4 + 2] +
          weights[3] * buffer[(i * width + j - 1) * 4 + 2] +
          weights[4] * buffer[(i * width + j) * 4 + 2] +
          weights[5] * buffer[(i * width + j + 1) * 4 + 2] +
          weights[6] * buffer[((i + 1) * width + j - 1) * 4 + 2] +
          weights[7] * buffer[((i + 1) * width + j) * 4 + 2] +
          weights[8] * buffer[((i + 1) * width + j + 1) * 4 + 2]
        );

        data[(i * width + j) * 4] = Math.min(Math.max(sumRed / sharpen + buffer[(i * width + j) * 4], 0), 255);
        data[(i * width + j) * 4 + 1] = Math.min(Math.max(sumGreen / sharpen + buffer[(i * width + j) * 4 + 1], 0), 255);
        data[(i * width + j) * 4 + 2] = Math.min(Math.max(sumBlue / sharpen + buffer[(i * width + j) * 4 + 2], 0), 255);
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }

  function downloadModifiedGif() {
    if (modifiedGifBlob) {
      saveAs(modifiedGifBlob, 'modified.gif');
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

  .adjustments {
    display: flex;
    flex-direction: column;
    gap: 20px;
    margin-bottom: 20px;
  }

  .adjustments div {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .adjustments label {
    min-width: 80px;
    font-size: 16px;
  }

  .gif-preview {
    text-align: center;
    margin-top: 20px;
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
    max-width: 100%;
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
  <h1 class="title">GIF Manipulator</h1>

  <div class="upload-container">
    <input type="file" accept="image/gif" on:change={handleFileUpload} id="gif-upload" style="display: none;">
    <label for="gif-upload" class="upload-button">Upload GIF</label>
  </div>

  {#if gifURL}
    <div class="adjustments">
      <div>
        <label for="brightness">Brightness:</label>
        <input type="range" id="brightness" min="-100" max="100" bind:value={brightnessValue} on:input={processGif}>
      </div>
      <div>
        <label for="contrast">Contrast:</label>
        <input type="range" id="contrast" min="-100" max="100" bind:value={contrastValue} on:input={processGif}>
      </div>
      <div>
        <label for="sharpen">Sharpen:</label>
        <input type="range" id="sharpen" min="0" max="100" bind:value={sharpenValue} on:input={processGif}>
      </div>
    </div>

    {#if modifiedGifUrl}
      <div class="gif-preview">
        <table style="margin: auto;">
          <tr>
            <td style="text-align: center;">
              <h3>Original GIF</h3>
              <img src={originalGif} alt="Original GIF" style="max-width: 100%;">
            </td>
            <td style="text-align: center;">
              <h3>Modified GIF</h3>
              <img src={modifiedGifUrl} alt="Modified GIF" style="max-width: 100%;">
            </td>
          </tr>
          <tr>
            <td colspan="2" style="text-align: center;">
              <button on:click={downloadModifiedGif}>Download Modified GIF</button>
            </td>
          </tr>
        </table>
      </div>
    {/if}
  {/if}
</div>