<svelte:head>
    <title>Photo Editor</title>
</svelte:head>

<script lang="ts">
    import { onMount } from 'svelte';
    import { Label, Input } from 'flowbite-svelte';
    import Intro from '$lib/Intro.svelte';
    import Copy from '$lib/Copy.svelte';

    let redPercentage = 100;
    let greenPercentage = 100;
    let bluePercentage = 100;
    let brightnessValue = 100;
    let contrastValue = 100;
    let displaySize = 40;
    let isNegative = false;
    let uploadedImage = null;
    let originalImage = null;
    let adjustments = { redPercentage, greenPercentage, bluePercentage, brightnessValue, contrastValue, displaySize };
    let adjustmentStack = [];
    let adjustmentIndex = -1;
    let originalAdjustments = { ...adjustments };

    export let data;

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                uploadedImage = reader.result;
                originalImage = uploadedImage;
                adjustments = { ...originalAdjustments };
                applyAdjustments();
                adjustmentStack = [];
                adjustmentIndex = -1;
            };
            reader.readAsDataURL(file);
        }
    }

    function applyAdjustments() {
        const img = document.querySelector('#image-preview');

        // Toggle negative effect
        if (isNegative) {
            img.style.filter = 'invert(100%)';
        } else {
            img.style.filter = `brightness(${adjustments.brightnessValue}%) contrast(${adjustments.contrastValue}%)`;
        }

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        const image = new Image();
        image.src = uploadedImage;

        image.onload = () => {
            const displayWidth = (image.width * adjustments.displaySize) / 100;
            const displayHeight = (image.height * adjustments.displaySize) / 100;

            canvas.width = displayWidth;
            canvas.height = displayHeight;

            ctx.drawImage(image, 0, 0, displayWidth, displayHeight);

            const imageData = ctx.getImageData(0, 0, displayWidth, displayHeight);
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                data[i] = (data[i] * adjustments.redPercentage) / 100;
                data[i + 1] = (data[i + 1] * adjustments.greenPercentage) / 100;
                data[i + 2] = (data[i + 2] * adjustments.bluePercentage) / 100;
            }

            ctx.putImageData(imageData, 0, 0);
            img.src = canvas.toDataURL('image/jpeg', 1.0);

            if (adjustmentIndex === adjustmentStack.length - 1) {
                adjustmentStack.push({ ...adjustments });
                adjustmentIndex = adjustmentStack.length - 1;
            }
        };
    }

    function resetToOriginal() {
        if (originalImage) {
            adjustments = { ...originalAdjustments };
            applyAdjustments();
        }
    }

    function undo() {
        if (adjustmentIndex > 0) {
            adjustmentIndex--;
            const previousAdjustments = adjustmentStack[adjustmentIndex];
            Object.assign(adjustments, previousAdjustments);
            applyAdjustments();
        }
    }

    function redo() {
        if (adjustmentIndex < adjustmentStack.length - 1) {
            adjustmentIndex++;
            const nextAdjustments = adjustmentStack[adjustmentIndex];
            Object.assign(adjustments, nextAdjustments);
            applyAdjustments();
        }
    }

    function downloadImage() {
        const link = document.createElement('a');
        link.href = uploadedImage;
        link.download = 'adjusted_image.jpg';
        link.click();
    }
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<style>
    .container {
        display: flex;
        justify-content: space-between;
    }
    .image-container {
        width: 60%;
    }
    .adjusters {
        width: 30%;
    }
    .adjuster-label {
        margin-top: 10px;
    }
    .adjuster-input {
        width: 100%;
    }
    button {
        background-color: #333; /* Blackish grey color */
        color: white;
        border: none;
        padding: 10px 20px;
        margin: 5px;
        cursor: pointer;
    }
</style>

<input type="file" accept="image/*" on:change={handleImageUpload} style="background-color: #333; color: white; border: none; padding: 10px 20px; margin: 5px; cursor: pointer;" />

<div class="container">
    <div class="image-container">
        <img id="image-preview" src="" alt="Uploaded Image" />
    </div>

    <div class="adjusters">
        <div class="adjuster-label">
            <label for="redPercentage">Red (%):</label>
        </div>
        <div class="adjuster-input">
            <input type="range" id="redPercentage" bind:value={adjustments.redPercentage} min="0" max="200" step="1" on:input={applyAdjustments} />
        </div>
        <div class="adjuster-label">
            <label for="greenPercentage">Green (%):</label>
        </div>
        <div class="adjuster-input">
            <input type="range" id="greenPercentage" bind:value={adjustments.greenPercentage} min="0" max="200" step="1" on:input={applyAdjustments} />
        </div>
        <div class="adjuster-label">
            <label for="bluePercentage">Blue (%):</label>
        </div>
        <div class="adjuster-input">
            <input type="range" id="bluePercentage" bind:value={adjustments.bluePercentage} min="0" max="200" step="1" on:input={applyAdjustments} />
        </div>
        <div class="adjuster-label">
            <label for="brightnessValue">Brightness:</label>
        </div>
        <div class="adjuster-input">
            <input type="range" id="brightnessValue" bind:value={adjustments.brightnessValue} min="0" max="200" step="1" on:input={applyAdjustments} />
        </div>
        <div class="adjuster-label">
            <label for="contrastValue">Contrast:</label>
        </div>
        <div class="adjuster-input">
            <input type="range" id="contrastValue" bind:value={adjustments.contrastValue} min="0" max="200" step="1" on:input={applyAdjustments} />
        </div>
        <div class="adjuster-label">
            <label for="displaySize">Display Size (%):</label>
        </div>
        <div class="adjuster-input">
            <input type="range" id="displaySize" bind:value={adjustments.displaySize} min="10" max="100" step="1" on:input={applyAdjustments} />
        </div>
        <div class="adjuster-label">
            <label for="isNegative">Negative Image:</label>
        </div>
        <div class="adjuster-input">
            <input type="checkbox" id="isNegative" bind:checked={isNegative} on:change={applyAdjustments} />
        </div>
    </div>
</div>

<div>
    <button on:click={resetToOriginal} disabled={!originalImage}>Reset to Original</button>
    <button on:click={undo} disabled={adjustmentIndex <= 0}>Undo</button>
    <button on:click={redo} disabled={adjustmentIndex >= adjustmentStack.length - 1}>Redo</button>
    <button on:click={downloadImage}>Download Adjusted Image</button>
</div>
