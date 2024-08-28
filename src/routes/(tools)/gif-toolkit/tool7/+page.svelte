<script>
    let selectedColor = "#ffffff"; // Default color is white
    let gifUrl = ""; // URL of the generated GIF
  
    // Function to generate the GIF
    const generateGif = () => {
      gifUrl = generateColorGif(selectedColor);
    };
  
    // Function to handle color selection
    const selectColor = (color) => {
      selectedColor = color;
      generateGif();
    };
  
    // Function to download the generated GIF
    const downloadGif = () => {
      if (gifUrl) {
        const link = document.createElement('a');
        link.href = gifUrl;
        link.download = 'tiny.gif';
        link.click();
      }
    };
  
    // Function to generate a color-based 1x1 pixel GIF
    const generateColorGif = (color) => {
      const canvas = document.createElement("canvas");
      canvas.width = 1;
      canvas.height = 1;
      const ctx = canvas.getContext("2d");
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 1, 1);
      return canvas.toDataURL("image/gif");
    };
  
    // Generate initial GIF
    generateGif();
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
  
    .adjustments {
      display: flex;
      flex-direction: column;
      gap: 20px;
      margin-bottom: 20px;
    }
  
    .adjustments div {
      display: flex;
      align-items: center;
      gap: 20px;
    }
  
    .adjustments label {
      min-width: 80px;
      font-size: 18px;
      color: #ff6347;
    }
  
    .gif-preview {
      text-align: center;
      margin-top: 20px;
    }
  
    .gif-preview table {
      margin: auto;
      width: 100%;
      border-collapse: collapse;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      border-radius: 8px;
    }
  
    .gif-preview table tr:first-child td {
      padding: 10px;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
  
    .gif-preview table tr:first-child td h3 {
      margin-top: 0;
      font-size: 18px;
    }
  
    .gif-preview table tr td {
      padding: 20px;
      vertical-align: middle;
    }
  
    .gif-preview table tr td img {
      max-width: 100%;
      display: block;
      margin: auto;
      border-radius: 8px;
      box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
    }
  
    .gif-preview table tr:last-child td {
      text-align: center;
      padding: 20px;
      border-bottom-left-radius: 8px;
      border-bottom-right-radius: 8px;
    }
  
    .gif-preview table tr:last-child td button {
      background-color: #007bff;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    .gif-preview table tr:last-child td button:hover {
      background-color: #0056b3;
    }
  </style>
  
  <div class="container">
    <h1 class="title">Color GIF Generator</h1>
  
    <div class="adjustments">
      <div>
        <label for="colorPicker">Choose color:</label>
        <input type="color" id="colorPicker" bind:value={selectedColor} on:input={generateGif}>
      </div>
    </div>
  
    {#if gifUrl}
      <div class="gif-preview">
        <table>
          <tr>
            <td style="text-align: center;">
              <h4>1x1 Pixel GIF</h4>
              <img src={gifUrl} alt="Generated GIF" style="max-width: 100%;">
            </td>
          </tr>
          <tr>
            <td style="text-align: center;">
              <button on:click={downloadGif}>Download GIF</button>
            </td>
          </tr>
        </table>
      </div>
    {/if}
  </div>