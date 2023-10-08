<!-- src/BrightnessControl.svelte -->
<script>
    let brightnessValue = 100; // Initial brightness value
    let imageStyle = `brightness(${brightnessValue}%)`;
  
    function updateBrightness() {
      imageStyle = `brightness(${brightnessValue}%)`;
    }
  </script>
  
  <div class="brightness-control">
    <label for="brightness-slider">Brightness:</label>
    <input
      type="range"
      id="brightness-slider"
      min="0"
      max="200"
      step="1"
      bind:value={brightnessValue}
      on:input={updateBrightness}
    />
    <output>{brightnessValue}%</output>
  </div>
  
  <style>
    .brightness-control {
      margin-top: 20px;
    }
  </style>
  