<script>
    import {onMount} from 'svelte';
    export let image;
    let brightness = 100;
    let contrast = 100;
    let exposure = 0;
    let gamma = 1;
    let clarity = 100; // Default clarity to 100%
    let vignette = 0;
    let saturation = 100; // Default saturation to 100%
    let imageUrl = image; // Set your image path here
    let initialImageUrl = ''; // To store the initial image URL for discarding changes
    let lastSavedState = {}; // To store the last saved state
  
    let isChangesSaved = false; // Flag to track if changes are saved

    const updateImage = () => {
      const imgContainer = document.querySelector('.image-container');
      if (imgContainer) {
        const img = imgContainer.querySelector('img');
        if (img) {
          const blurAmount = (100 - clarity) / 10; // Clarity calculation
          img.style.filter = `
            brightness(${brightness}%)
            contrast(${contrast}%)
            saturate(${saturation}%)
            blur(${blurAmount}px)
            opacity(${1 - exposure / 100})
          `;
  
          img.style.transform = `scale(${gamma})`;
  
          // Adjust vignette to create an inward effect
          const vignetteSize = vignette * 2; // Adjust the multiplier as needed
  
          // Create an overlay div for vignette effect
          let overlay = imgContainer.querySelector('.vignette-overlay');
          if (!overlay) {
            overlay = document.createElement('div');
            overlay.classList.add('vignette-overlay');
            imgContainer.appendChild(overlay);
          }
          overlay.style.background = `
            radial-gradient(
              ellipse closest-side,
              rgba(0, 0, 0, 0) 0%,
              rgba(0, 0, 0, 0.8) ${vignetteSize}%,
              rgba(0, 0, 0, 0.8) 100%
            )
          `;
  
          isChangesSaved = false; // Changes are not saved until the user explicitly saves them
        }
      }
    };
  
    const saveChanges = () => {
      console.log("Changes saved!");
      lastSavedState = {
        brightness, contrast, exposure, gamma, clarity, vignette, saturation, imageUrl
      }; // Save the current state
      isChangesSaved = true;
    };
  
    const discardChanges = () => {
      if (lastSavedState.imageUrl) {
        imageUrl = lastSavedState.imageUrl;
        brightness = lastSavedState.brightness;
        contrast = lastSavedState.contrast;
        exposure = lastSavedState.exposure;
        gamma = lastSavedState.gamma;
        clarity = lastSavedState.clarity;
        vignette = lastSavedState.vignette;
        saturation = lastSavedState.saturation;
        updateImage();
        isChangesSaved = true; // Mark changes as discarded
      }
    };
  
    const downloadImage = () => {
      const canvas = document.createElement('canvas');
      const img = document.getElementById('image');
      const ctx = canvas.getContext('2d');
  
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
  
      const blurAmount = (100 - clarity) / 10; // Clarity calculation
  
      ctx.filter = `
        brightness(${brightness}%)
        contrast(${contrast}%)
        saturate(${saturation}%)
        blur(${blurAmount}px)
      `;
      ctx.globalAlpha = 1 - exposure / 100;
  
      // Draw image
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
      // Apply vignette effect
      const vignetteSize = vignette * 2; // Adjust the multiplier as needed
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) / 2
      );
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
      gradient.addColorStop(1, `rgba(0, 0, 0, ${vignetteSize / 100})`);
  
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      // Download the canvas as an image
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = 'image.png';
      link.click();
    };
  
    // Initial load of the image
    onMount(() => {
      initialImageUrl = imageUrl; // Store initial image URL for discarding changes
      lastSavedState = {
        brightness, contrast, exposure, gamma, clarity, vignette, saturation, imageUrl
      };
      updateImage();
    });
  </script>
  
  <div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
    <div class="p-4">
      <div class="mb-4">
        <label for="brightness" class="block text-sm font-medium text-black dark:text-white">Brightness</label>
        <input type="range" id="brightness" class="filter-slider" min="0" max="200" bind:value={brightness} on:input={updateImage} />
      </div>
  
      <div class="mb-4">
        <label for="contrast" class="block text-sm font-medium text-black dark:text-white">Contrast</label>
        <input type="range" id="contrast" class="filter-slider" min="0" max="200" bind:value={contrast} on:input={updateImage} />
      </div>
  
      <div class="mb-4">
        <label for="exposure" class="block text-sm font-medium text-black dark:text-white">Exposure</label>
        <input type="range" id="exposure" class="filter-slider" min="-100" max="100" bind:value={exposure} on:input={updateImage} />
      </div>
  
      <div class="mb-4">
        <label for="gamma" class="block text-sm font-medium text-black dark:text-white">Gamma</label>
        <input type="range" id="gamma" class="filter-slider" min="0.1" max="10" step="0.1" bind:value={gamma} on:input={updateImage} />
      </div>
  
      <div class="mb-4">
        <label for="clarity" class="block text-sm font-medium text-black dark:text-white">Clarity</label>
        <input type="range" id="clarity" class="filter-slider" min="0" max="100" bind:value={clarity} on:input={updateImage} />
      </div>
  
      <div class="mb-4">
        <label for="saturation" class="block text-sm font-medium text-black dark:text-white">Saturation</label>
        <input type="range" id="saturation" class="filter-slider" min="0" max="200" bind:value={saturation} on:input={updateImage} />
      </div>
  
      <div class="mb-4 flex space-x-4">
        <button on:click={saveChanges} disabled={isChangesSaved} class="save-button">Save</button>
        <button on:click={discardChanges} disabled={isChangesSaved} class="discard-button">Discard</button>
        <button on:click={downloadImage} class="download-button">Download</button>
      </div>
    </div>
  
    <div class="p-4">
      {#if imageUrl}
        <div class="image-container">
          <img id="image" src={imageUrl} class="w-full" alt=" " />
        </div>
      {/if}
    </div>
  </div>
  
  <style>
    .filter-slider {
      width: 100%;
    }
  
    .image-container {
      position: relative;
      overflow: hidden;
      width: 100%;
      margin-bottom: 1rem;
    }
  
    .image-container img {
      display: block;
      max-width: 100%;
      height: auto;
    }
  
    .save-button,
    .discard-button,
    .download-button {
      display: inline-block;
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      background-color: #007BFF;
      color: #fff;
      cursor: pointer;
    }
  
    .save-button[disabled],
    .discard-button[disabled] {
      background-color: #6c757d;
      cursor: not-allowed;
    }
  
    .vignette-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }
  
    /* Ensure both halves occupy equal space in the grid */
    .card {
      display: grid;
      grid-template-columns: 1fr 1fr;
    }
  
    /* Adjust layout for smaller screens if needed */
    @media (max-width: 768px) {
      .card {
        grid-template-columns: 1fr; /* Stack columns on smaller screens */
      }
    }
  </style>
  