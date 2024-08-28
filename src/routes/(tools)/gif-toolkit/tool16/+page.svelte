<script>
    import { onMount } from 'svelte';
    import { GifReader } from 'omggif';
  
    let gifFile = null;
    let gifInfo = {};
    let frameInfo = {};
    let frameNumber = 1;
    let gifUrl = '';
    let globalColorTable = [];
    let showGeneralGifInfo = true;
    let showGlobalColorTable = false;
    let showFrameInfo = true;
  
    const handleFileSelect = (event) => {
      const file = event.target.files[0];
      if (file && file.type === "image/gif") {
        gifFile = file;
        gifUrl = URL.createObjectURL(file);
        extractGifInfo(file);
      }
    };
  
    const extractGifInfo = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        const gifReader = new GifReader(new Uint8Array(arrayBuffer));
        gifInfo = {
          width: gifReader.width,
          height: gifReader.height,
          numFrames: gifReader.numFrames(),
        };
        frameInfo = {
          delay: gifReader.frameInfo(frameNumber - 1).delay,
        };
  
        const uint8View = new Uint8Array(arrayBuffer);
        const gctFlag = (uint8View[10] & 0x80) >> 7;
        const gctSize = uint8View[10] & 0x07;
        if (gctFlag) {
          const colorTableSize = 2 ** (gctSize + 1);
          for (let i = 0; i < colorTableSize; i++) {
            const offset = 13 + i * 3;
            globalColorTable.push({
              red: uint8View[offset],
              green: uint8View[offset + 1],
              blue: uint8View[offset + 2]
            });
          }
        }
      };
      reader.readAsArrayBuffer(file);
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
  
    .preview-container {
      margin-top: 20px;
    }
  
    .preview {
      width: 100%;
      text-align: center;
    }
  
    .preview img {
      max-width: 100%;
      height: auto;
      border-radius: 5px;
      margin-top: 10px;
    }
  
    .info-box {
      margin-top: 20px;
      padding: 15px;
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 5px;
      text-align: left;
    }
  
    .color-table {
      display: flex;
      flex-wrap: wrap;
      margin-top: 10px;
    }
  
    .color-swatch {
      width: 20px;
      height: 20px;
      margin: 1px;
    }
  </style>
  
  <div class="container">
    <div class="title">GIF Information Tool</div>
    <div class="upload-container">
      <input type="file" accept="image/gif" on:change={handleFileSelect} id="gif-upload" style="display: none;">
      <label for="gif-upload" class="upload-button">Upload GIF</label>
    </div>
  
    {#if gifFile}
      <div class="preview-container">
        <div class="preview">
          <div style="color: #ff6347;">GIF Preview</div>
          <img src={gifUrl} alt="GIF Preview" />
        </div>
  
        <div class="info-box">
          <h3 style="text-align: center; margin-bottom: 10px;">GIF Info</h3>
          {#if showGeneralGifInfo}
            <p><strong>Width:</strong> {gifInfo.width} px</p>
            <p><strong>Height:</strong> {gifInfo.height} px</p>
            <p><strong>Number of Frames:</strong> {gifInfo.numFrames}</p>
          {/if}
          {#if showFrameInfo}
            <p><strong>Frame Number:</strong> {frameNumber}</p>
            <p><strong>Frame Delay:</strong> {frameInfo.delay} ms</p>
          {/if}
          {#if showGlobalColorTable}
            <h4>Global Color Table</h4>
            <div class="color-table">
              {#each globalColorTable as color}
                <div class="color-swatch" style="background-color: rgb({color.red}, {color.green}, {color.blue});"></div>
              {/each}
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>