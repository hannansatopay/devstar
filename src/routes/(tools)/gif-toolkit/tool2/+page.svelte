<script>
    import { saveAs } from 'file-saver';
    import { parseGIF, decompressFrames } from 'gifuct-js';
  
    let gifFile;
    let blurredGifBlob;
    let blurLevel = 5;
  
    async function handleFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.type === 'image/gif') {
        gifFile = file;
      } else {
        alert('Please upload a valid GIF file.');
      }
    }
  
    async function blurGif() {
      if (!gifFile) return;
  
      const firstFrame = await extractFirstFrame(gifFile);
      blurredGifBlob = await applyBlur(firstFrame, blurLevel);
    }
  
    function downloadBlurredGif() {
      if (blurredGifBlob) {
        saveAs(blurredGifBlob, 'blurred.gif');
      }
    }
  
    async function extractFirstFrame(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const gif = parseGIF(e.target.result);
          const frames = decompressFrames(gif, true);
          const firstFrame = frames[0];
  
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = firstFrame.dims.width;
          canvas.height = firstFrame.dims.height;
  
          const imageData = new ImageData(firstFrame.patch, firstFrame.dims.width, firstFrame.dims.height);
          ctx.putImageData(imageData, 0, 0);
  
          const img = new Image();
          img.src = canvas.toDataURL();
          img.onload = () => resolve(img);
        };
        reader.readAsArrayBuffer(file);
      });
    }
  
    async function applyBlur(img, blurLevel) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
  
      ctx.filter = `blur(${blurLevel}px)`;
      ctx.drawImage(img, 0, 0, img.width, img.height);
  
      return new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/gif');
      });
    }
  </script>
  
  <main>
    <h1>Blur GIF Tool</h1>
  
    <input type="file" accept="image/gif" on:change={handleFileUpload} />
  
    {#if gifFile}
      <div>
        <label for="blurLevel">Blur Level: {blurLevel}</label>
        <input type="range" id="blurLevel" min="0" max="20" bind:value={blurLevel} />
      </div>
      <button on:click={blurGif}>Blur GIF</button>
      <button on:click={downloadBlurredGif} disabled={!blurredGifBlob}>Download Blurred GIF</button>
    {/if}
  
    {#if blurredGifBlob}
      <h2>Preview</h2>
      <img src={URL.createObjectURL(blurredGifBlob)} alt="Blurred GIF Preview" />
    {/if}
  </main>
  
  <style>
    main {
      text-align: center;
      padding: 1em;
    }
    input[type="file"], button {
      margin: 0.5em;
    }
    input[type="range"] {
      width: 200px;
    }
  </style>