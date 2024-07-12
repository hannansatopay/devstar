<script>
    import { onMount } from 'svelte';
    import { parseGIF, decompressFrames } from 'gifuct-js';
  
    let gifFile;
    let spriteSheet;
    let frameCount = 0;
    let rows = 1;
    let columns;
    let frameRate = 250;
    let playbackReversed = false;
    let skipFrames = '';
    let gifBackgroundColor = '';
    let newBackgroundColor = '';
    let colorToneThreshold = 10;
    let padding = 0;
  
    let canvas;
    let ctx;
    let frames = [];
    let status = '';
  
    onMount(() => {
      canvas = document.getElementById('spriteSheetCanvas');
      ctx = canvas.getContext('2d');
    });
  
    function handleFileInput(event) {
      gifFile = event.target.files[0];
      status = `File selected: ${gifFile.name}`; 
  
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.getElementById('gifPreview');
        img.src = e.target.result;
      };
      reader.readAsDataURL(gifFile);
    }
  
    async function generateSpriteSheet() {
      if (!gifFile) {
        alert('Please select a GIF file first.');
        return;
      }
  
      status = 'Generating sprite sheet...';
  
      spriteSheet = null;
      frames = [];
      frameCount = 0;
  
      try {
        frames = await extractFrames(gifFile);
        frameCount = frames.length;
        status = `Extracted ${frameCount} frames. Rendering sprite sheet...`;
        await renderSpriteSheet();
        status = 'Sprite sheet generated successfully!';
      } catch (error) {
        console.error('Error generating sprite sheet:', error);
        status = `Error: ${error.message}`;
        alert('An error occurred while generating the sprite sheet. Check the console for details.');
      }
    }
  
    async function extractFrames(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result;
            const gif = parseGIF(arrayBuffer);
            const frames = decompressFrames(gif, true);
            resolve(frames);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('File reading error'));
        reader.readAsArrayBuffer(file);
      });
    }
  
    async function renderSpriteSheet() {
      const layout = calculateLayout(frameCount, rows, columns);
  
      const frameWidth = frames[0].dims.width;
      const frameHeight = frames[0].dims.height;
  
      canvas.width = layout.width * frameWidth + padding * 2;
      canvas.height = layout.height * frameHeight + padding * 2;
  
      ctx.clearRect(0, 0, canvas.width, canvas.height);
  
      let frameIndex = 0;
      for (let y = 0; y < layout.height; y++) {
        for (let x = 0; x < layout.width; x++) {
          if (frameIndex < frameCount) {
            const frame = frames[frameIndex];
            const imageData = new ImageData(frame.patch, frame.dims.width, frame.dims.height);
            ctx.putImageData(
              imageData,
              x * frameWidth + padding + frame.dims.left,
              y * frameHeight + padding + frame.dims.top
            );
            frameIndex++;
          }
        }
      }
  
      canvas.style.margin = 'auto';
      canvas.style.display = 'block';
  
      spriteSheet = canvas.toDataURL('image/png');
    }
  
    function calculateLayout(frameCount, rows, columns) {
      if (rows && columns) {
        return { width: columns, height: rows };
      } else if (rows) {
        return { width: Math.ceil(frameCount / rows), height: rows };
      } else if (columns) {
        return { width: columns, height: Math.ceil(frameCount / columns) };
      } else {
        return { width: frameCount, height: 1 };
      }
    }
  </script>
  
  <main>
    <div class="container">
      <h1>GIF to SpriteSheet Converter</h1>
      <div class="converter">
        <div class="input-section">
          <label for="gifFileInput" class="file-label">Select GIF File:</label>
          <input id="gifFileInput" type="file" accept="image/gif" on:change={handleFileInput} class="file-input">
        </div>
        <div class="preview-section">
          <img id="gifPreview" alt="GIF Preview" class="gif-preview">
        </div>
        <div class="input-section">
          <label for="rowsInput">Rows:</label>
          <input id="rowsInput" type="number" bind:value={rows} min="1">
          <label for="columnsInput">Columns:</label>
          <input id="columnsInput" type="number" bind:value={columns} min="1">
        </div>
        <div class="input-section">
          <label for="frameRateInput">Frame Rate (ms):</label>
          <input id="frameRateInput" type="number" bind:value={frameRate} min="1">
          <label for="playbackReversedInput">Reverse Playback:</label>
          <input id="playbackReversedInput" type="checkbox" bind:checked={playbackReversed}>
        </div>
        <div class="input-section">
          <label for="skipFramesInput">Skip Frames:</label>
          <input id="skipFramesInput" type="text" bind:value={skipFrames} placeholder="e.g. 1,3,5">
          <label for="gifBackgroundColorInput">GIF Background Color:</label>
          <input id="gifBackgroundColorInput" type="text" bind:value={gifBackgroundColor}>
        </div>
        <div class="input-section-row">
          <div class="input-section">
            <label for="newBackgroundColorInput">New Background Color:</label>
            <input id="newBackgroundColorInput" type="text" bind:value={newBackgroundColor}>
          </div>
          <div class="input-section">
            <label for="paddingInput">Padding:</label>
            <input id="paddingInput" type="number" bind:value={padding} min="0">
          </div>
          <div class="input-section">
            <label for="colorToneThresholdInput">Color Tone Threshold (%):</label>
            <input id="colorToneThresholdInput" type="number" bind:value={colorToneThreshold} min="0" max="100">
          </div>
        </div>
        <div class="button-row">
          <button on:click={generateSpriteSheet}>Generate Sprite Sheet</button>
        </div>
        <p>{status}</p>
      </div>
      <div class="output-section">
        {#if spriteSheet}
          <h2 class="highlighted-text">Generated Sprite Sheet</h2>
          <img src={spriteSheet} alt="Sprite Sheet" class="sprite-sheet">
          <div>
            <a href={spriteSheet} download="sprite_sheet.png">Download Sprite Sheet</a>
          </div>
        {/if}
      </div>
    </div>
    <canvas id="spriteSheetCanvas"></canvas>
  </main>
  
  <style>
    .container {
      max-width: 100%;
      margin: 0 auto;
      padding: 20px;
    }
  
    h1 {
      text-align: center;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 20px;
      font-weight: 600;
      color: #ff6347;
    }
  
    .converter {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
    }
  
    .input-section {
      display: flex;
      flex-direction: column;
      margin-bottom: 10px;
      width: 200px;
      margin-right: 20px;
    }
  
    .input-section-row {
      display: flex;
      justify-content: space-between;
      width: 100%;
    }
  
    .input-section label {
      margin-bottom: 5px;
    }
  
    .input-section input {
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
  
    .file-label {
      display: inline-block;
      cursor: pointer;
      padding: 10px;
      background-color: #4CAF50;
      color: white;
      border-radius: 20px;
      transition: background-color 0.3s ease;
    }
  
    .file-label:hover {
      background-color: #45a049;
    }
  
    .file-input {
      display: none;
    }
  
    .preview-section {
      width: 100%;
      text-align: center;
      margin-bottom: 20px;
    }
  
    .gif-preview {
      max-width: 200px;
      max-height: 200px;
      margin: auto;
      display: block;
    }
  
    .button-row {
      text-align: center;
      margin-top: 20px;
      width: 100%;
    }
  
    .button-row button {
      padding: 10px 20px;
      font-size: 18px;
      background-color: #4CAF50;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    .button-row button:hover {
      background-color: #45a049;
    }
  
    .output-section {
      margin-top: 20px;
      text-align: center;
    }
  
    .sprite-sheet {
      max-width: 100%;
    }
  
    .highlighted-text {
      color: #FF5722;
    }
  </style>