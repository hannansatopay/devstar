<script>
  import { onMount } from 'svelte';
  import { parseGIF, decompressFrames } from 'gifuct-js';
  import GIF from 'gif.js.optimized';

  let inputGif = null;
  let loopOption = 'infinite';
  let loopCount = 1;
  let error = '';
  let isProcessing = false;
  let canvasElement;
  let ctx;
  let gifFrames = [];
  let currentFrame = 0;
  let loopsDone = 0;
  let animationId = null;
  let gifWidth = 0;
  let gifHeight = 0;
  let lastFrameTime = 0;
  let speedMultiplier = 1; 
  let gifJs = null; 

  onMount(() => {
      if (typeof window !== 'undefined') {
          import('gif.js.optimized').then((module) => {
              gifJs = module.default;
          });
      }

      return () => {
          if (animationId) {
              cancelAnimationFrame(animationId);
          }
      };
  });

  async function handleGifInput(event) {
      const file = event.target.files[0];
      if (file) {
          inputGif = file;
          error = '';
          if (canvasElement) {
              ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          }
          speedMultiplier = 1;
      }
  }

  async function processGif() {
      if (!inputGif) {
          error = 'Please upload a GIF.';
          return;
      }

      isProcessing = true;
      error = '';

      try {
          const arrayBuffer = await inputGif.arrayBuffer();
          const gif = parseGIF(arrayBuffer);
          gifFrames = decompressFrames(gif, true);

          gifWidth = gifFrames[0].dims.width;
          gifHeight = gifFrames[0].dims.height;

          if (canvasElement) {
              canvasElement.width = gifWidth;
              canvasElement.height = gifHeight;
              ctx = canvasElement.getContext('2d');
          }

          startAnimation();
      } catch (e) {
          error = 'Error processing GIF: ' + e.message;
      } finally {
          isProcessing = false;
      }
  }

  function startAnimation() {
      if (animationId) {
          cancelAnimationFrame(animationId);
      }
      currentFrame = 0;
      loopsDone = 0;
      lastFrameTime = 0;
      animationId = requestAnimationFrame(renderNextFrame);
  }

  function renderNextFrame(timestamp) {
      if (!canvasElement || !ctx || gifFrames.length === 0) return;

      if (!lastFrameTime) lastFrameTime = timestamp;

      const frameDelay = speedMultiplier === 1
          ? gifFrames[currentFrame].delay * 10  
          : (gifFrames[currentFrame].delay * 10) / speedMultiplier; 
      const elapsedTime = timestamp - lastFrameTime;

      if (elapsedTime > frameDelay) {
          const frame = gifFrames[currentFrame];
          ctx.putImageData(new ImageData(frame.patch, frame.dims.width, frame.dims.height), frame.dims.left, frame.dims.top);

          currentFrame++;
          if (currentFrame >= gifFrames.length) {
              currentFrame = 0;
              loopsDone++;
              if (loopOption === 'infinite' || (loopOption === 'specific' && loopsDone < loopCount) || (loopOption === 'once' && loopsDone < 1)) {
                  lastFrameTime = timestamp;
                  animationId = requestAnimationFrame(renderNextFrame);
              }
          } else {
              lastFrameTime = timestamp;
              animationId = requestAnimationFrame(renderNextFrame);
          }
      } else {
          animationId = requestAnimationFrame(renderNextFrame);
      }
  }

  async function downloadGif() {
      if (!gifJs) {
          error = 'GIF.js library is not loaded.';
          return;
      }

      const gif = new gifJs({
          workers: 2,
          quality: 10,
          width: gifWidth,
          height: gifHeight
      });

      try {
          for (let i = 0; i < gifFrames.length; i++) {
              const frame = gifFrames[i];

              const imageData = new ImageData(frame.patch, frame.dims.width, frame.dims.height);

              const canvas = document.createElement('canvas');
              canvas.width = gifWidth;
              canvas.height = gifHeight;
              const context = canvas.getContext('2d');

              context.clearRect(0, 0, gifWidth, gifHeight);

              context.putImageData(imageData, frame.dims.left, frame.dims.top);

              gif.addFrame(canvas, { delay: frame.delay * 10 });
          }

          gif.on('finished', function(blob) {
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'modified.gif';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
          });

          gif.render();
      } catch (e) {
          error = 'Error rendering GIF: ' + e.message;
      }
  }
</script>

<div class="container">
  <div class="title">Change GIF Loop Count and Speed</div>
  <div class="upload-container">
      <input type="file" accept="image/gif" on:change={handleGifInput} id="gif-upload" style="display: none;">
      <label for="gif-upload" class="upload-button">Upload GIF</label>
  </div>

  {#if inputGif}
      <div class="control-container">
          <label for="loopOption">Loop Option:</label>
          <select id="loopOption" bind:value={loopOption}>
              <option value="infinite">Repeat Infinitely</option>
              <option value="once">Loop Once (Play Twice)</option>
              <option value="specific">Loop Specific Times</option>
          </select>
      </div>

      {#if loopOption === 'specific'}
          <div class="control-container">
              <label for="loopCount">Loop Count:</label>
              <input
                  type="number"
                  id="loopCount"
                  bind:value={loopCount}
                  min="1"
                  step="1"
              />
          </div>
      {/if}

      <div class="control-container">
          <label for="speedControl">Animation Speed: {speedMultiplier === 1 ? 'Original' : speedMultiplier.toFixed(1) + 'x'}</label>
          <input
              type="range"
              id="speedControl"
              bind:value={speedMultiplier}
              min="0.1"
              max="3"
              step="0.1"
          />
      </div>

      <div class="button-group">
          <button on:click={processGif} disabled={isProcessing || !inputGif}>
              {isProcessing ? 'Processing...' : 'Process GIF'}
          </button>
          <button on:click={downloadGif} disabled={!gifFrames.length || isProcessing}>
              Download GIF
          </button>
      </div>

      {#if error}
          <div class="error">{error}</div>
      {/if}

      <div class="preview-container">
          <div class="preview">
              <div>Processed GIF</div>
              <canvas bind:this={canvasElement}></canvas>
          </div>
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
  }

  .button-group {
      margin: 20px 0;
  }

  .button-group button {
      padding: 12px 24px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
      margin: 0 10px;
  }

  .button-group button:disabled {
      background-color: #6c757d;
      cursor: not-allowed;
  }

  .button-group button:hover:not(:disabled) {
      background-color: #0056b3;
  }

  .error {
      margin-top: 20px;
      color: red;
  }

  .preview-container {
      margin-top: 20px;
      color: #ff6347;
  }

  .preview {
      display: inline-block;
      margin-right: 20px;
  }

  .preview canvas {
      border-radius: 10px;
  }
</style>