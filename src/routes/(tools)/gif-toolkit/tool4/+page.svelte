<script>
  let uploadedGif = null;
  let contrastValue = 100;
  let sharpenValue = 0;
  let brightnessValue = 0;
  let originalUrl = '';
  let processedUrl = '';

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/gif')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedGif = e.target.result;
        updatePreview();
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a GIF file.');
    }
  };

  const updatePreview = () => {
    if (uploadedGif) {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        applyBrightness(imageData, brightnessValue);

        applyContrast(imageData, contrastValue);

        applySharpen(imageData, sharpenValue);

        ctx.putImageData(imageData, 0, 0);

        originalUrl = uploadedGif;
        processedUrl = canvas.toDataURL('image/gif');
      };
      img.src = uploadedGif;
    }
  };

  const applyContrast = (imageData, contrast) => {
    const data = imageData.data;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    for (let i = 0; i < data.length; i += 4) {
      data[i] = factor * (data[i] - 128) + 128;
      data[i + 1] = factor * (data[i + 1] - 128) + 128;
      data[i + 2] = factor * (data[i + 2] - 128) + 128;
    }
  };

  const applySharpen = (imageData, sharpen) => {
    if (sharpen === 0) return;
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
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
  };

  const applyBrightness = (imageData, brightness) => {
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] += 255 * (brightness / 100);
      data[i + 1] += 255 * (brightness / 100);
      data[i + 2] += 255 * (brightness / 100);
    }
  };

  const downloadPreview = () => {
    const a = document.createElement('a');
    a.href = processedUrl;
    a.download = 'modified.gif';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };
</script>

<div class="container">
  <div class="title">Brightness Changes GIF</div>
  <div class="upload-container">
    <input type="file" accept="image/gif" on:change={handleFileUpload} id="gif-upload" style="display: none;">
    <label for="gif-upload" class="upload-button">Upload GIF</label>
  </div>

  {#if uploadedGif}
    <div class="adjustments">
      <div>
        <label for="contrast">Contrast:</label>
        <input type="range" id="contrast" min="-100" max="100" bind:value={contrastValue} on:input={updatePreview}>
      </div>
      <div>
        <label for="sharpen">Sharpen:</label>
        <input type="range" id="sharpen" min="0" max="100" bind:value={sharpenValue} on:input={updatePreview}>
      </div>
      <div>
        <label for="brightness">Brightness:</label>
        <input type="range" id="brightness" min="-100" max="100" bind:value={brightnessValue} on:input={updatePreview}>
      </div>
    </div>

    <div class="preview-container">
      <div class="preview">
        <div>Original GIF</div>
        <img src={originalUrl} alt="Original GIF">
      </div>
      <div class="preview">
        <div>Processed GIF</div>
        <img src={processedUrl} alt="Processed GIF">
      </div>
    </div>

    <div>
      <button class="download-button" on:click={downloadPreview}>Download Modified GIF</button>
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
  }

  .preview {
    width: 45%;
    text-align: center;
  }

  .preview img {
    max-width: 100%;
    height: auto;
    border: 2px solid #ccc;
    border-radius: 5px;
    margin-top: 10px;
  }

  .download-button {
    display: inline-block;
    margin-top: 20px;
    padding: 12px 24px;
    background-color: #007bff;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .download-button:hover {
    background-color: #0056b3;
  }

  .adjustments {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
  }

  .adjustments div {
    width: 30%;
  }

  .adjustments label {
    display: block;
    margin-bottom: 5px;
  }

  .adjustments input[type="range"] {
    width: 100%;
  }
</style>