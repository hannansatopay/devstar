<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';
    import GIF from 'gif.js';
  
    let brightnessLevel = 1;
    let gifUrl = '';
    let modifiedGifUrl = '';
    let gif = writable(null);
    let gifBlob = null;
  
    const handleFileChange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        gifUrl = url;
        gif.set(await createGifFromUrl(url));
      }
    };
  
    const createGifFromUrl = (url) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = url;
        img.onload = () => {
          resolve(img);
        };
        img.onerror = reject;
      });
    };
  
    const changeBrightness = async () => {
      gif.subscribe(async (img) => {
        if (img) {
          const gif = new GIF({
            workers: 2,
            quality: 10,
          });
  
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
  
          canvas.width = img.width;
          canvas.height = img.height;
  
          ctx.filter = `brightness(${brightnessLevel})`;
          ctx.drawImage(img, 0, 0, img.width, img.height);
  
          gif.addFrame(canvas, { delay: 100 });
          gif.on('finished', (blob) => {
            gifBlob = blob;
            modifiedGifUrl = URL.createObjectURL(blob);
          });
  
          gif.render();
        }
      })();
    };
  
    const downloadGif = () => {
      if (gifBlob) {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(gifBlob);
        a.download = 'modified.gif';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    };
  </script>
  
  <style>
    .container {
      text-align: center;
      margin: 2rem;
    }
    .slider {
      width: 100%;
      max-width: 300px;
    }
  </style>
  
  <div class="container">
    <h1>Change GIF Brightness</h1>
    <input type="file" accept="image/gif" on:change={handleFileChange} />
    {#if gifUrl}
      <div>
        <h2>Original GIF:</h2>
        <img src={gifUrl} alt="Original GIF" />
      </div>
      <div>
        <label for="brightness">Brightness Level: {brightnessLevel}</label>
        <input
          class="slider"
          type="range"
          id="brightness"
          min="0"
          max="2"
          step="0.1"
          bind:value={brightnessLevel}
        />
      </div>
      <button on:click={changeBrightness}>Change Brightness</button>
      {#if modifiedGifUrl}
        <div>
          <h2>Modified GIF:</h2>
          <img src={modifiedGifUrl} alt="Modified GIF" />
          <button on:click={downloadGif}>Download Modified GIF</button>
        </div>
      {/if}
    {/if}
  </div>
  