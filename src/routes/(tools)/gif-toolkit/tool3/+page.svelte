<script>
    import { parseGIF, decompressFrames } from 'gifuct-js';
    import GIF from 'gif.js.optimized';

    let originalGifUrl;
    let gifData;
    let frames = [];
    let modifiedGifUrl;

    const handleFileUpload = async (event) => {
        const uploadedFile = event.target.files[0];
        if (uploadedFile) {
            originalGifUrl = URL.createObjectURL(uploadedFile);
            const arrayBuffer = await uploadedFile.arrayBuffer();
            gifData = parseGIF(arrayBuffer);
            frames = decompressFrames(gifData, true);
            convertFramesToGrayscale();
        }
    };

    const convertFramesToGrayscale = () => {
        const gif = new GIF({ workers: 2, quality: 10, workerScript: 'node_modules/gif.js.optimized/dist/gif.worker.js' });

        frames.forEach(frame => {
            const canvas = createCanvasFromFrame(frame);
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < imageData.data.length; i += 4) {
                const red = imageData.data[i];
                const green = imageData.data[i + 1];
                const blue = imageData.data[i + 2];
                const grayscale = red * 0.3 + green * 0.59 + blue * 0.11;
                imageData.data[i] = imageData.data[i + 1] = imageData.data[i + 2] = grayscale;
            }
            ctx.putImageData(imageData, 0, 0);
            gif.addFrame(canvas, { delay: frame.delay });
        });

        gif.on('finished', (blob) => {
            modifiedGifUrl = URL.createObjectURL(blob);
        });

        gif.render();
    };

    const createCanvasFromFrame = (frame) => {
        const canvas = document.createElement('canvas');
        canvas.width = frame.dims.width;
        canvas.height = frame.dims.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        const imageData = new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height);
        ctx.putImageData(imageData, 0, 0);
        return canvas;
    };

    const downloadGif = () => {
        if (modifiedGifUrl) {
            const link = document.createElement('a');
            link.href = modifiedGifUrl;
            link.download = 'grayscale.gif';
            link.click();
        }
    };
</script>

<div class="container">
    <div class="title">GIF To Grayscale</div>
    <div class="upload-container">
        <input type="file" accept="image/gif" on:change={handleFileUpload} id="gif-upload" style="display: none;">
        <label for="gif-upload" class="upload-button">Upload GIF</label>
    </div>
    {#if originalGifUrl && modifiedGifUrl}
        <div class="preview-container">
            <div class="preview">
                <div>Original GIF</div>
                <img src={originalGifUrl} alt="Original GIF">
            </div>
            <div class="preview">
                <div>Grayscale GIF</div>
                <img src={modifiedGifUrl} alt="Grayscale GIF">
            </div>
        </div>
        <div>
            <a on:click={downloadGif} class="download-button">Download Grayscale</a>
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
        font-size: 18px;
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