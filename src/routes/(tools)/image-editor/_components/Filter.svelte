<script>
  import { onMount } from 'svelte';
  export let image;
  export let canvasWidth = 800; // Default canvas width
  export let canvasHeight = 600; // Default canvas height
  let canvas;
  let context;
  let img = new Image();
  let originalImage = new Image();
  let downloadLink;
  let history = [];
  let historyIndex = -1;
  let currentFilter = 'none';

  function saveState() {
    if (historyIndex < history.length - 1) {
      history = history.slice(0, historyIndex + 1);
    }
    history.push(canvas.toDataURL());
    historyIndex++;
  }

  const draw = () => {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.filter = currentFilter; // Apply the current filter
    context.drawImage(img, 0, 0, canvasWidth, canvasHeight);
    context.restore();
  };

  const applyFilter = (filter) => {
    currentFilter = filter;
    draw();
    saveState();
  };

  const applyPunchFilter = () => {
    currentFilter = 'saturate(200%)';
    draw();
    saveState();
  };

  const applySharpFilter = () => {
    // Apply a sharpen filter using convolution matrix
    const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight);
    const data = imageData.data;
    const sharpenKernel = [
      0, -1, 0,
      -1, 5, -1,
      0, -1, 0
    ];

    const applyKernel = (data, kernel) => {
      const side = Math.round(Math.sqrt(kernel.length));
      const halfSide = Math.floor(side / 2);
      const src = data.slice();
      for (let y = 0; y < canvasHeight; y++) {
        for (let x = 0; x < canvasWidth; x++) {
          let r = 0, g = 0, b = 0;
          for (let ky = 0; ky < side; ky++) {
            for (let kx = 0; kx < side; kx++) {
              const srcY = y + ky - halfSide;
              const srcX = x + kx - halfSide;
              if (srcY >= 0 && srcY < canvasHeight && srcX >= 0 && srcX < canvasWidth) {
                const offset = (srcY * canvasWidth + srcX) * 4;
                const wt = kernel[ky * side + kx];
                r += src[offset] * wt;
                g += src[offset + 1] * wt;
                b += src[offset + 2] * wt;
              }
            }
          }
          const dstOffset = (y * canvasWidth + x) * 4;
          data[dstOffset] = r;
          data[dstOffset + 1] = g;
          data[dstOffset + 2] = b;
        }
      }
      return data;
    };

    context.putImageData(new ImageData(applyKernel(data, sharpenKernel), canvasWidth, canvasHeight), 0, 0);
    saveState();
  };

  const applyAnneFilter = () => {
    currentFilter = 'sepia(100%) brightness(120%)';
    draw();
    saveState();
  };

  function loadSavedImage() {
    const dataURL = localStorage.getItem('savedImage');
    if (dataURL) {
      const img = new Image();
      img.src = dataURL;

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
      };
    }
  }

  const downloadImage = () => {
    const dataURL = canvas.toDataURL('image/png');
    localStorage.setItem('savedImage', dataURL);
    downloadLink.href = canvas.toDataURL();
    downloadLink.download = 'edited-image.png';
    downloadLink.click();
    saveState();
  };

  onMount(() => {
    canvas = document.getElementById('imageCanvas');
    context = canvas.getContext('2d');
    downloadLink = document.createElement('a');
    img.crossOrigin = 'anonymous';
    img.src = image;
    originalImage.crossOrigin = 'anonymous';
    originalImage.src = image;
    img.onload = () => {
      draw();
    };
  });
</script>

<style>
  .image-editor {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  canvas {
    border: 1px solid #ccc;
    max-width: 100%;
    height: auto;
  }
  .buttons {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1rem;
  }
  button {
    padding: 10px 20px;
    margin: 5px;
    border: none;
    border-radius: 5px;
    background-color: #4CAF50;
    color: white;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  button:hover {
    background-color: #45a049;
  }

  button:active {
    background-color: #397d3a;
  }

  .filter-btn {
    background-color: #FF5722;
  }

  .filter-btn:hover {
    background-color: #e64a19;
  }

  .filter-btn:active {
    background-color: #d84315;
  }

  .download-btn {
    background-color: #008CBA;
  }

  .download-btn:hover {
    background-color: #007bb5;
  }

  .download-btn:active {
    background-color: #006a99;
  }

  .punch-btn {
    background-color: #9C27B0;
  }

  .punch-btn:hover {
    background-color: #8E24AA;
  }

  .punch-btn:active {
    background-color: #7B1FA2;
  }

  .sharp-btn {
    background-color: #FF9800;
  }

  .sharp-btn:hover {
    background-color: #FB8C00;
  }

  .sharp-btn:active {
    background-color: #F57C00;
  }
</style>

<div class="image-editor">
  <canvas id="imageCanvas"></canvas>
  <div class='buttons'>
    <button on:click="{() => applyFilter('none')}">No Filter</button>
    <button class="filter-btn" on:click="{() => applyFilter('grayscale(100%)')}">Grayscale</button>
    <button class="filter-btn" on:click="{() => applyFilter('sepia(100%)')}">Sepia</button>
    <button class="filter-btn" on:click="{() => applyFilter('invert(100%)')}">Invert</button>
    <button class="filter-btn" on:click="{() => applyFilter('blur(5px)')}">Blur</button>
    <button class="filter-btn" on:click="{() => applyFilter('contrast(200%)')}">Contrast</button>
    <button class='punch-btn' on:click="{applyPunchFilter}">Punch</button>
    <button class='sharp-btn' on:click="{applySharpFilter}">Sharp</button>
    <button class='sharp-btn' on:click="{applyAnneFilter}">Anne</button>
    <button on:click="{loadSavedImage}">Load Saved Image</button>
    <button class='download-btn' on:click="{downloadImage}">Download Image</button>
  </div>
</div>