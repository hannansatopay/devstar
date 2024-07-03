<script>
    import { onMount } from 'svelte';

    let gifFile;
    let gifURL;
    let canvas;
    let context;
    let downloadLink;

    function handleFileChange(event) {
        const file = event.target.files[0];
        if (file && file.type === 'image/gif') {
            gifFile = file;
            gifURL = URL.createObjectURL(file);
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

<style>
    canvas {
        max-width: 100%;
        height: auto;
        margin-top: 10px;
    }
    .download-button {
        display: inline-block;
        margin-top: 10px;
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        text-decoration: none;
        border-radius: 5px;
    }
    .download-button:hover {
        background-color: #0056b3;
    }
</style>

<div>
    <input type="file" accept="image/gif" on:change={handleFileChange}>
    {#if gifFile}
        <canvas bind:this={canvas}></canvas>
        <a bind:this={downloadLink} class="download-button">Download Grayscale GIF</a>
    {/if}
</div>