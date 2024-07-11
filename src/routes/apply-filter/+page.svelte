<script>
    import { onMount } from 'svelte';

    let imageSrc = '';
    let canvas;
    let context;
    let originalImageData;

    onMount(() => {
        const savedImageData = localStorage.getItem('imageData');
        if (savedImageData) {
            imageSrc = savedImageData;
            const image = new Image();
            image.onload = () => {
                context = canvas.getContext('2d');
                canvas.width = image.width;
                canvas.height = image.height;
                context.drawImage(image, 0, 0);
                originalImageData = context.getImageData(0, 0, canvas.width, canvas.height);
            };
            image.src = imageSrc;
        } else {
            alert('No image data found. Please upload an image first.');
        }
    });

    function applyFilter(filter) {
        if (!originalImageData) return;
        context.putImageData(originalImageData, 0, 0);
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        for (let i = 0; i < data.length; i += 4) {
            const red = data[i];
            const green = data[i + 1];
            const blue = data[i + 2];

            let [newRed, newGreen, newBlue] = [red, green, blue];

            switch (filter) {
                case 'night':
                    [newRed, newGreen, newBlue] = [red * 0.5, green * 0.5, blue * 0.5];
                    break;
                case 'blackGold':
                    [newRed, newGreen, newBlue] = [red * 1.2, green * 1.1, blue * 0.8];
                    break;
                case 'blueIce':
                    [newRed, newGreen, newBlue] = [red * 0.8, green * 1.1, blue * 1.2];
                    break;
                case 'greenOrange':
                    [newRed, newGreen, newBlue] = [red * 1.2, green * 1.1, blue * 0.8];
                    break;
                case 'cyberpunk':
                    [newRed, newGreen, newBlue] = [red * 1.5, green * 0.5, blue * 1.5];
                    break;
                case 'milk':
                    [newRed, newGreen, newBlue] = [red * 1.2, green * 1.1, blue * 1.1];
                    break;
                case 'jelly':
                    [newRed, newGreen, newBlue] = [red * 0.9, green * 1.2, blue * 1.1];
                    break;
                case 'natural':
                    [newRed, newGreen, newBlue] = [red * 1.1, green * 1.1, blue * 1.1];
                    break;
                case 'softGray':
                    [newRed, newGreen, newBlue] = [red * 0.8, green * 0.8, blue * 0.8];
                    break;
                case 'makeup':
                    [newRed, newGreen, newBlue] = [red * 1.3, green * 0.9, blue * 0.9];
                    break;
                case 'rosy':
                    [newRed, newGreen, newBlue] = [red * 1.3, green * 0.8, blue * 0.8];
                    break;
                case 'mint':
                    [newRed, newGreen, newBlue] = [red * 0.8, green * 1.2, blue * 1.1];
                    break;
                case 'grapefruit':
                    [newRed, newGreen, newBlue] = [red * 1.2, green * 0.9, blue * 0.9];
                    break;
                case 'summer':
                    [newRed, newGreen, newBlue] = [red * 1.1, green * 1.2, blue * 0.9];
                    break;
                case 'refreshing':
                    [newRed, newGreen, newBlue] = [red * 0.9, green * 1.3, blue * 1.2];
                    break;
                case 'elegant':
                    [newRed, newGreen, newBlue] = [red * 1.1, green * 1.1, blue * 1.2];
                    break;
                case 'tranquil':
                    [newRed, newGreen, newBlue] = [red * 0.9, green * 1.2, blue * 1.3];
                    break;
                case '1970':
                    [newRed, newGreen, newBlue] = [red * 1.1, green * 0.9, blue * 0.8];
                    break;
                case 'must':
                    [newRed, newGreen, newBlue] = [red * 0.8, green * 1.2, blue * 1.0];
                    break;
                case 'fashion':
                    [newRed, newGreen, newBlue] = [red * 1.2, green * 0.8, blue * 1.1];
                    break;
                case 'flourishing':
                    [newRed, newGreen, newBlue] = [red * 1.1, green * 1.2, blue * 0.8];
                    break;
                case 'warm':
                    [newRed, newGreen, newBlue] = [red * 1.2, green * 1.0, blue * 0.9];
                    break;
                case 'clear':
                    [newRed, newGreen, newBlue] = [red * 1.1, green * 1.1, blue * 1.2];
                    break;
                case 'sketch':
                    [newRed, newGreen, newBlue] = [red * 1.2, green * 1.2, blue * 1.2];
                    break;
                case 'lomo':
                    [newRed, newGreen, newBlue] = [red * 1.1, green * 1.0, blue * 1.2];
                    break;
                case 'vintage':
                    [newRed, newGreen, newBlue] = [red * 1.1, green * 0.9, blue * 0.8];
                    break;
                case 'time':
                    [newRed, newGreen, newBlue] = [red * 1.2, green * 1.1, blue * 1.0];
                    break;
                case 'blackWhite':
                    const gray = 0.3 * red + 0.59 * green + 0.11 * blue;
                    [newRed, newGreen, newBlue] = [gray, gray, gray];
                    break;
                case 'british':
                    [newRed, newGreen, newBlue] = [red * 1.2, green * 0.9, blue * 1.1];
                    break;
                default:
                    break;
            }

            data[i] = newRed;
            data[i + 1] = newGreen;
            data[i + 2] = newBlue;
        }

        context.putImageData(imageData, 0, 0);
        
    }
    function toggleVisibility(id) {
        const filters = document.getElementById(id);
        filters.classList.toggle('expanded');
    }

   
  function saveImage() {
      if (!canvas) return;
      const image = canvas.toDataURL('image/png');
      localStorage.setItem('imageData', image);
      alert('Image saved successfully!');
  }
  

</script>

<main>
  <div class="save-button">
    <button on:click={saveImage}>Save Image</button>
   
</div>
    <div class="container mx-auto p-5">
        <h1 class="text-white font-bold mb-5">Try Filters</h1>
        <div class="canvas-container">
            <canvas bind:this="{canvas}"></canvas>
        </div>
        <div class="filter-categories">
            <div class="filter-category">
                <h2 on:click={() => toggleVisibility('nightFilters')} class="filter-title">Night</h2>
                <div class="filters" id="nightFilters">
                    <div>
                    <div class="expanded">
                    <button style="background-color: #333;" on:click={() => applyFilter('night')}>Night</button>
                    <button style="background-color: #6c5b3f;" on:click={() => applyFilter('blackGold')}>Black Gold</button>
                    <button style="background-color: #0099ff;" on:click={() => applyFilter('blueIce')}>Blue Ice</button>
                    <button style="background-color: #ffcc00;" on:click={() => applyFilter('greenOrange')}>Green Orange</button>
                    <button style="background-color: #ff66cc;" on:click={() => applyFilter('cyberpunk')}>Cyberpunk</button>
                </div>
            </div>
            </div>
            </div>
            <div class="filter-category">
                <h2 on:click={() => toggleVisibility('portraitFilters')} class="filter-title">Portrait</h2>
                <div class="filters" id="portraitFilters">
                    <button style="background-color: #f2f0e6;" on:click={() => applyFilter('milk')}>Milk</button>
                    <button style="background-color: #ff4d4d;" on:click={() => applyFilter('jelly')}>Jelly</button>
                    <button style="background-color: #99cc99;" on:click={() => applyFilter('natural')}>Natural</button>
                    <button style="background-color: #cccccc;" on:click={() => applyFilter('softGray')}>Soft Gray</button>
                    <button style="background-color: #ff9999;" on:click={() => applyFilter('makeup')}>Makeup</button>
                    <button style="background-color: #ffb3e6;" on:click={() => applyFilter('rosy')}>Rosy</button>
                </div>
            </div>
            <div class="filter-category">
                <h2 on:click={() => toggleVisibility('japaneseFilters')} class="filter-title">Japanese</h2>
                <div class="filters" id="japaneseFilters">
                    <button style="background-color: #aaffaa;" on:click={() => applyFilter('mint')}>Mint</button>
                    <button style="background-color: #ff9966;" on:click={() => applyFilter('grapefruit')}>Grapefruit</button>
                    <button style="background-color: #66ccff;" on:click={() => applyFilter('summer')}>Summer</button>
                    <button style="background-color: #99ffcc;" on:click={() => applyFilter('refreshing')}>Refreshing</button>
                    <button style="background-color: #ccccff;" on:click={() => applyFilter('elegant')}>Elegant</button>
                    <button style="background-color: #ccffff;" on:click={() => applyFilter('tranquil')}>Tranquil</button>
                </div>
            </div>
            <div class="filter-category">
                <h2 on:click={() => toggleVisibility('filmFilters')} class="filter-title">Film</h2>
                <div class="filters" id="filmFilters">
                    <button style="background-color: #b3b300;" on:click={() => applyFilter('1970')}>1970</button>
                    <button style="background-color: #cc66ff;" on:click={() => applyFilter('must')}>Must</button>
                    <button style="background-color: #ff99cc;" on:click={() => applyFilter('fashion')}>Fashion</button>
                    <button style="background-color: #99ff99;" on:click={() => applyFilter('flourishing')}>Flourishing</button>
                    <button style="background-color: #ffcc99;" on:click={() => applyFilter('warm')}>Warm</button>
                    <button style="background-color: #66ccff;" on:click={() => applyFilter('clear')}>Clear</button>
                </div>
            </div>
            <div class="filter-category">
                <h2 on:click={() => toggleVisibility('styleFilters')} class="filter-title">Style</h2>
                <div class="filters" id="styleFilters">
                    <button style="background-color: #6666ff;" on:click={() => applyFilter('sketch')}>Sketch</button>
                    <button style="background-color: #ff9933;" on:click={() => applyFilter('lomo')}>Lomo</button>
                    <button style="background-color: #996633;" on:click={() => applyFilter('vintage')}>Vintage</button>
                    <button style="background-color: #cc66ff;" on:click={() => applyFilter('time')}>Time</button>
                    <button style="background-color: #333333;" on:click={() => applyFilter('blackAndWhite')}>Black and White</button>
                    <button style="background-color: #3366cc;" on:click={() => applyFilter('british')}>British</button>
                </div>
            </div>
        </div>
    </div>
</main>

<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .canvas-container {
        width: 100%;
        max-width: 500px; /* Adjust as needed */
        border: 1px solid #ddd;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
    }

    canvas {
        width: 100%;
        height: auto;
    }

    .filter-categories {
        width: 100%;
        max-width: 500px; /* Adjust as needed */
    }

    .filter-category {
        margin-bottom: 10px;
        background-color: #1a1a1a;
        border-radius: 5px;
        overflow: hidden;
    }

    .filter-category h2 {
        padding: 10px;
        margin: 0;
        cursor: pointer;
        color: white;
        font-size: 1.5em;
        background-color: #333;
        transition: background-color 0.3s ease;
    }

    .filters {
        display: none;
        padding: 10px;
    }

    .filters button {
        margin-bottom: 5px;
        padding: 8px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        color: white;
        transition: background-color 0.3s ease;
    }

    .filters button:hover {
        opacity: 0.8;
    }

    .expanded {
        display: block;
    }
</style>

<main>
<style>
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .canvas-container {
        width: 100%;
        max-width: 500px; /* Adjust as needed */
        border: 1px solid #ddd;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
    }

    canvas {
        width: 100%;
        height: auto;
    }

    .filter-categories {
        display: grid;
        grid-template-columns: repeat(3, 1fr); /* Adjust columns as needed */
        gap: 10px;
    }

    h2 {
        margin-top: 20px;
        color: white;
        font-size: 1.5em;
        grid-column: span 3; /* Span full width of grid */
    }

    button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        color: #fff;
        transition: background-color 0.3s ease;
    }

    button:hover {
        opacity: 0.8;
    }
    .container {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .canvas-container {
        width: 100%;
        max-width: 500px; /* Adjust as needed */
        border: 1px solid #ddd;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-bottom: 20px;
    }

    canvas {
        width: 100%;
        height: auto;
    }

    .filter-categories {
        width: 100%;
        max-width: 500px; /* Adjust as needed */
    }

    .filter-category {
        margin-bottom: 10px;
        background-color: #1a1a1a;
        border-radius: 5px;
        overflow: hidden;
    }

    .filter-category h2 {
        padding: 10px;
        margin: 0;
        cursor: pointer;
        color: white;
        font-size: 1.5em;
        background-color: #333;
        transition: background-color 0.3s ease;
    }

    .filters {
        display: none;
        padding: 10px;
    }

    .filters button {
        margin-bottom: 5px;
        padding: 8px 20px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        color: white;
        transition: background-color 0.3s ease;
    }

    .filters button:hover {
        opacity: 0.8;
    }

    .expanded {
        display: block;
    }
    .save-button {
      display: flex;
      justify-content: center;
      margin-top: 10px;
  }

  .save-button button {
      padding: 8px 16px;
      cursor: pointer;
      background-color: #28a745;
      color: #fff;
      border: none;
      border-radius: 4px;
  }

  .save-button button:hover {
      background-color: #218838;
  }
</style>



</main>
