<script>
    let gifFile;
    let gifURL;
    let canvas;
    let context;
    let downloadLink;
    let originalGif;

    function handleFileChange(event) {
        const file = event.target.files[0];
        if (file && file.type === 'image/gif') {
            gifFile = file;
            gifURL = URL.createObjectURL(file);
            originalGif = gifURL;
            convertToGrayscale();
        }
    }

    $: if (canvas) {
        context = canvas.getContext('2d');
    }

    function convertToGrayscale() {
        const img = new Image();
        img.src = gifURL;
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            context.drawImage(img, 0, 0);
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
                const red = imageData.data[i];
                const green = imageData.data[i + 1];
                const blue = imageData.data[i + 2];
                const grayscale = red * 0.3 + green * 0.59 + blue * 0.11;
                imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = grayscale;
            }
            context.putImageData(imageData, 0, 0);
            prepareDownload();
        };
    }

    function prepareDownload() {
        downloadLink.href = canvas.toDataURL('image/gif');
        downloadLink.download = 'grayscale.gif';
    }
</script>

<div class="container">
    <div class="title">GIF To Grayscale</div>
    <div class="upload-container">
        <input type="file" accept="image/gif" on:change={handleFileChange} id="gif-upload" style="display: none;">
        <label for="gif-upload" class="upload-button">Upload GIF</label>
    </div>
    {#if gifFile}
        <div class="preview-container">
            <div class="preview">
                <div>Original GIF</div>
                <img src={originalGif} alt="Original GIF">
            </div>
            <div class="preview">
                <div>Grayscale GIF</div>
                <canvas bind:this={canvas}></canvas>
            </div>
        </div>
        <div>
            <a bind:this={downloadLink} class="download-button">Download Grayscale</a>
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