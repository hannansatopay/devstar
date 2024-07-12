<script>
    import { onMount } from 'svelte';
    import { parseGIF, decompressFrames } from 'gifuct-js';
    import { saveAs } from 'file-saver';

    let file = null;
    let frameNumbers = '';
    let extractedFrames = [];

    const extractFrames = () => {
        if (!file || !frameNumbers) {
            alert('Please upload a GIF and input frame numbers.');
            return;
        }

        const frameIndices = frameNumbers.split(',').map(num => parseInt(num.trim(), 10));
        const reader = new FileReader();

        reader.onload = async (e) => {
            const buffer = e.target.result;
            const gif = parseGIF(buffer);
            const frames = decompressFrames(gif, true);

            const baseCanvas = document.createElement('canvas');
            const baseCtx = baseCanvas.getContext('2d');

            baseCanvas.width = frames[0].dims.width;
            baseCanvas.height = frames[0].dims.height;

            const coalescedFrames = frames.map((frame, index) => {
                if (index === 0) {
                    baseCtx.putImageData(new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height), 0, 0);
                } else {
                    baseCtx.clearRect(0, 0, frame.dims.width, frame.dims.height);
                    baseCtx.putImageData(new ImageData(new Uint8ClampedArray(frame.patch), frame.dims.width, frame.dims.height), frame.dims.left, frame.dims.top);
                }
                return baseCanvas.toDataURL();
            });

            extractedFrames = frameIndices.map(index => coalescedFrames[index]).filter(frame => frame !== null);
        };

        reader.readAsArrayBuffer(file);
    };

    const handleDownload = () => {
        extractedFrames.forEach((frame, index) => {
            const link = document.createElement('a');
            link.href = frame;
            link.download = `frame${index + 1}.png`;
            link.click();
        });
    };

    onMount(() => {
        return () => {
            if (file) {
                URL.revokeObjectURL(file);
            }
        };
    });
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

    .input-container {
        margin-bottom: 20px;
        color: black;
    }

    .button {
        background-color: #007bff;
        color: white;
        padding: 12px 24px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
        margin-right: 10px;
    }

    .button:hover {
        background-color: #0056b3;
    }

    .gif-preview {
        text-align: center;
        margin-top: 20px;
        color: #ff6347;
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

    .gif-preview .horizontal-preview {
        display: flex;
        justify-content: space-between;
        overflow-x: auto; 
    }

    .gif-preview .frame-container {
        margin-right: 10px; 
    }

    .gif-preview .frame-container:last-child {
        margin-right: 0;
    }
</style>

<div class="container">
    <h1 class="title">GIF Frame Extractor</h1>

    <div class="upload-container">
        <input type="file" accept="image/gif" on:change="{e => file = e.target.files[0]}" id="gif-upload" style="display: none;">
        <label for="gif-upload" class="upload-button">Upload GIF</label>
    </div>

    {#if file}
        <div class="input-container">
            <input type="text" placeholder="Enter frame numbers (comma-separated)" bind:value="{frameNumbers}" />
        </div>

        <div>
            <button class="button" on:click="{extractFrames}">Extract Frames</button>
            <button class="button" on:click="{handleDownload}">Download Frames</button>
        </div>
    {/if}

    {#if extractedFrames.length > 0}
        <div class="gif-preview">
            <table>
                <tr>
                    <td style="text-align: center;">
                        <h3>Extracted Frames</h3>
                    </td>
                </tr>
                <tr>
                    <td>
                        <div class="preview horizontal-preview">
                            {#each extractedFrames as frame}
                                <div class="frame-container">
                                    <img src="{frame}" alt="Extracted Frame" />
                                </div>
                            {/each}
                        </div>
                    </td>
                </tr>
            </table>
        </div>
    {/if}
</div>