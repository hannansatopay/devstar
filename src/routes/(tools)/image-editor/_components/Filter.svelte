<!-- Filter.svelte -->
<script>
   
  
    export let imageUrl; // Image URL passed as a prop
  
    let canvas;
    let ctx;
    let filter = 'original'; // Default filter
  
    // Filter logic
    function applyFilter(filter) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);
  
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
  
        switch (filter) {
          case 'night':
            applyNightFilter(data);
            break;
          case 'blackGold':
            applyBlackGoldFilter(data);
            break;
          case 'blueIce':
            applyBlueIceFilter(data);
            break;
          case 'greenOrange':
            applyGreenOrangeFilter(data);
            break;
          case 'cyberpunk':
            applyCyberpunkFilter(data);
            break;
          case 'milk':
            applyMilkFilter(data);
            break;
          default:
            // Default to original image if no filter matches
            break;
        }
  
        ctx.putImageData(imageData, 0, 0);
      };
      img.src = imageUrl;
    }
  
    function applyNightFilter(data) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] *= 0.5;      // Red channel
        data[i + 1] *= 0.5;  // Green channel
        data[i + 2] *= 0.5;  // Blue channel
      }
    }
  
    function applyBlackGoldFilter(data) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] *= 1.2;      // Red channel
        data[i + 1] *= 1.1;  // Green channel
        data[i + 2] *= 0.8;  // Blue channel
      }
    }
  
    function applyBlueIceFilter(data) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] *= 0.8;      // Red channel
        data[i + 1] *= 1.1;  // Green channel
        data[i + 2] *= 1.2;  // Blue channel
      }
    }
  
    function applyGreenOrangeFilter(data) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] *= 1.2;      // Red channel
        data[i + 1] *= 1.1;  // Green channel
        data[i + 2] *= 0.8;  // Blue channel
      }
    }
  
    function applyCyberpunkFilter(data) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] *= 1.5;      // Red channel
        data[i + 1] *= 0.5;  // Green channel
        data[i + 2] *= 1.5;  // Blue channel
      }
    }
  
    function applyMilkFilter(data) {
      for (let i = 0; i < data.length; i += 4) {
        data[i] *= 1.2;      // Red channel
        data[i + 1] *= 1.1;  // Green channel
        data[i + 2] *= 1.1;  // Blue channel
      }
    }
  
    // Initialize canvas on component mount
    onMount(() => {
      canvas = document.createElement('canvas');
      ctx = canvas.getContext('2d');
      document.getElementById('canvasDiv').appendChild(canvas);
      applyFilter(filter);
    });
  
    // Watch for changes in the imageUrl prop
    $: {
      if (imageUrl) {
        applyFilter(filter);
      }
    }
  
    // Cleanup
    onDestroy(() => {
      // Clean up resources if needed
    });
  
    // Handle filter change
    function changeFilter(newFilter) {
      filter = newFilter;
      applyFilter(filter);
    }
  </script>
  
  <div class="filter-container">
    <div id="canvasDiv"></div>
  
    <div class="filters">
      <button on:click={() => changeFilter('original')}>Original</button>
      <button on:click={() => changeFilter('night')}>Night</button>
      <button on:click={() => changeFilter('blackGold')}>Black Gold</button>
      <button on:click={() => changeFilter('blueIce')}>Blue Ice</button>
      <button on:click={() => changeFilter('greenOrange')}>Green Orange</button>
      <button on:click={() => changeFilter('cyberpunk')}>Cyberpunk</button>
      <button on:click={() => changeFilter('milk')}>Milk</button>
      <!-- Add more buttons for additional filters -->
    </div>
  </div>
  
  <style>
    .filter-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 20px;
    }
  
    .filters {
      display: flex;
      justify-content: center;
      margin-top: 10px;
    }
  
    button {
      padding: 8px 16px;
      margin: 0 5px;
      background-color: #007bff;
      color: #fff;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  
    button:hover {
      background-color: #0056b3;
    }
  
    #canvasDiv {
      max-width: 100%;
      border: 1px solid #ccc;
      border-radius: 8px;
    }
  </style>
  