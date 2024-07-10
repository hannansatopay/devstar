<script>
  import { saveAs } from 'file-saver';
  import { parseGIF, decompressFrames } from 'gifuct-js';

  let gifFile;
  let blurredGifBlob;
  let blurLevel = 5;
  let gifURL;
  let originalGif;
  let downloadLink;

  async function handleFileUpload(event) {
      const file = event.target.files[0];
      if (file && file.type === 'image/gif') {
          gifFile = file;
          gifURL = URL.createObjectURL(file);
          originalGif = gifURL;
          await blurGif();
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

<div class="container">
  <div class="title">Blur a GIF</div>
  <div class="upload-container">
      <input type="file" accept="image/gif" on:change={handleFileUpload} id="gif-upload" style="display: none;">
      <label for="gif-upload" class="upload-button">Upload GIF</label>
  </div>
  {#if gifFile}
      <div class="control-container">
          <label for="blurLevel">Blur Level: {blurLevel}</label>
          <input type="range" id="blurLevel" min="0" max="20" bind:value={blurLevel} on:input={blurGif} />
      </div>
      <div class="preview-container">
          <div class="preview">
              <div>Original GIF</div>
              <img src={originalGif} alt="Original GIF">
          </div>
          <div class="preview">
              <div>Blurred GIF</div>
              {#if blurredGifBlob}
                  <img src={URL.createObjectURL(blurredGifBlob)} alt="Blurred GIF Preview">
              {/if}
          </div>
      </div>
      <div>
          <a bind:this={downloadLink} class="download-button" on:click={downloadBlurredGif}>Download Blurred GIF</a>
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
    }
  
    .control-container label {
        font-weight: 600;
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