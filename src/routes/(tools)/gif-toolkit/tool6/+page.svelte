<script>
    import { onMount } from 'svelte';
    import GIF from 'gif.js.optimized';
  
    let mode = 'monochrome';
    let gif;
    let previewUrl = '';
  
    function generateRandomColor(mode) {
      if (mode === 'monochrome') {
        const value = Math.floor(Math.random() * 256);
        return `rgb(${value}, ${value}, ${value})`;
      } else if (mode === 'rgb') {
        const r = Math.floor(Math.random() * 256);
        const g = Math.floor(Math.random() * 256);
        const b = Math.floor(Math.random() * 256);
        return `rgb(${r}, ${g}, ${b})`;
      } else if (mode === 'single-tone') {
        const value = Math.floor(Math.random() * 256);
        return `rgb(${value}, 0, 0)`;
      } else if (mode === 'custom') {
        // Example custom colors (can be customized)
        const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1'];
        return colors[Math.floor(Math.random() * colors.length)];
      }
    }
  
    function generateRandomGif() {
      gif = new GIF({
        workers: 2,
        quality: 10,
        workerScript: 'node_modules/gif.js.optimized/dist/gif.worker.js' // Reference the worker script correctly
      });
  
      const width = 200;
      const height = 200;
      const frameCount = 10;
  
      for (let i = 0; i < frameCount; i++) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = generateRandomColor(mode);
        ctx.fillRect(0, 0, width, height);
        gif.addFrame(canvas, { delay: 200 });
      }
  
      gif.on('finished', function(blob) {
        const url = URL.createObjectURL(blob);
        previewUrl = url;
      });
  
      gif.render();
    }
  
    function downloadGif() {
      if (previewUrl) {
        const a = document.createElement('a');
        a.href = previewUrl;
        a.download = 'random.gif';
        a.click();
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
  
    .controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
      margin-bottom: 20px;
    }
  
    .controls div {
      display: flex;
      align-items: center;
      gap: 20px;
    }
  
    .controls label {
      min-width: 200px;
      font-size: 18px;
      color: #ff6347;
    }
  
    .controls select, .controls button {
      padding: 10px;
      background-color: #374151;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    .controls button {
      background-color: #28a745;
    }
  
    .controls button:hover {
      background-color: #218838;
    }
  
    .preview {
      text-align: center;
      margin-top: 20px;
      color: #ff6347;
    }
  
    .preview table {
      margin: auto;
      width: 100%;
      border-collapse: collapse;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }
  
    .preview table tr:first-child td {
      padding: 10px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
  
    .preview table tr:first-child td h3 {
      margin-top: 0;
      font-size: 18px;
    }
  
    .preview table tr td {
      padding: 20px;
      vertical-align: middle;
    }
  
    .preview table tr td img {
      max-width: 100%;
      display: block;
      margin: auto;
      border-radius: 8px;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
    }
  
    .preview table tr:last-child td {
      text-align: center;
      padding: 20px;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  
    .preview table tr:last-child td button {
      background-color: #007bff;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    .preview table tr:last-child td button:hover {
      background-color: #0056b3;
    }
  </style>
  
  <div class="container">
    <h1 class="title">GIF Randomizer</h1>
  
    <div class="controls">
      <div>
        <label for="mode">Randomization Mode:</label>
        <select id="mode" bind:value={mode}>
          <option value="monochrome">Monochrome Randomness</option>
          <option value="rgb">RGB Randomness</option>
          <option value="single-tone">Single Color Tone Randomness</option>
          <option value="custom">Custom Color Randomness</option>
        </select>
      </div>
      <div>
        <button on:click={generateRandomGif}>Generate GIF</button>
      </div>
    </div>
  
    {#if previewUrl}
      <div class="preview">
        <table style="margin: auto;">
          <tr>
            <td style="text-align: center;">
              <h3>Preview:</h3>
              <img src={previewUrl} alt="Generated GIF preview">
            </td>
          </tr>
          <tr>
            <td style="text-align: center;">
              <button on:click={downloadGif}>Download GIF</button>
            </td>
          </tr>
        </table>
      </div>
    {/if}
  </div>