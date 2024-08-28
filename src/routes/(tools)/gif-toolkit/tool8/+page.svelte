<script>
    import { parseGIF, decompressFrames } from 'gifuct-js';
    import GIF from 'gif.js.optimized';
  
    let file;
    let gifData;
    let frames = [];
    let modifiedGifUrl;
    let startFrame = 0;
    let endFrame = 0;
  
    const handleFileUpload = async (event) => {
      const uploadedFile = event.target.files[0];
      if (uploadedFile) {
        const arrayBuffer = await uploadedFile.arrayBuffer();
        gifData = parseGIF(arrayBuffer);
        frames = decompressFrames(gifData, true);
        console.log('Frames extracted:', frames.length);
      }
    };
  
    const createImageFromFrame = (frame) => {
      const canvas = document.createElement('canvas');
      canvas.width = frame.dims.width;
      canvas.height = frame.dims.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      const imageData = new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height);
      ctx.putImageData(imageData, 0, 0);
      return canvas;
    };
  
    const removeFramesAndGenerateGif = () => {
      if (!frames.length) {
        alert('Please upload a GIF.');
        return;
      }
  
      if (startFrame === undefined || endFrame === undefined) {
        alert('Please enter a valid frame range.');
        return;
      }
  
      if (startFrame < 0 || endFrame < 0) {
        alert('Frame numbers must be non-negative.');
        return;
      }
  
      if (startFrame >= endFrame) {
        alert('Start frame must be less than end frame.');
        return;
      }
  
      if (endFrame >= frames.length) {
        alert('End frame must be less than the total number of frames.');
        return;
      }
  
      const filteredFrames = frames.filter((_, index) => index < startFrame || index > endFrame);
      const gif = new GIF({ workers: 2, quality: 10, workerScript: 'node_modules/gif.js.optimized/dist/gif.worker.js' });
  
      filteredFrames.forEach(frame => {
        const image = createImageFromFrame(frame);
        gif.addFrame(image, { delay: frame.delay });
      });
  
      gif.on('finished', (blob) => {
        modifiedGifUrl = URL.createObjectURL(blob);
      });
  
      gif.render();
    };
  
    const downloadGif = () => {
      if (modifiedGifUrl) {
        const link = document.createElement('a');
        link.href = modifiedGifUrl;
        link.download = 'modified.gif';
        link.click();
      }
    };
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
  
    .frame-inputs {
      display: flex;
      gap: 20px;
      justify-content: center;
      margin-bottom: 20px;
    }
  
    .frame-inputs label {
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #374151;
      color: white;
      padding: 10px;
      border-radius: 5px;
    }
  
    .frame-inputs input {
      margin-top: 5px;
      width: 120px;
      padding: 5px;
      border-radius: 5px;
      border: none;
      color: black;
    }
  
    .controls {
      margin-top: 10px;
    }
  
    .controls button {
      background-color: #28a745;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    .controls button:hover {
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
    <h1 class="title">GIF Frame Remover</h1>
  
    <div class="upload-container">
      <input type="file" accept="image/gif" on:change={handleFileUpload} id="gif-upload" style="display: none;">
      <label for="gif-upload" class="upload-button">Upload GIF</label>
    </div>
  
    {#if frames.length}
      <div class="frame-inputs">
        <label>
          Start Frame:
          <input type="number" bind:value={startFrame} min="0" />
        </label>
        <label>
          End Frame:
          <input type="number" bind:value={endFrame} min="0" />
        </label>
      </div>
  
      <div class="controls">
        <button on:click={removeFramesAndGenerateGif}>Remove Frames</button>
      </div>
  
      {#if modifiedGifUrl}
        <div class="gif-preview">
          <table>
            <tr>
              <td>
                <h3>Modified GIF</h3>
                <img src={modifiedGifUrl} alt="Modified GIF" />
              </td>
            </tr>
            <tr>
              <td>
                <button on:click={downloadGif}>Download Modified GIF</button>
              </td>
            </tr>
          </table>
        </div>
      {/if}
    {/if}
  </div>