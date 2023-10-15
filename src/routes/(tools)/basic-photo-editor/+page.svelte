<svelte:head>
  <title>Photo Editor</title>
</svelte:head>
<script lang="ts">
  import Intro from '$lib/Intro.svelte';
  import { onMount } from 'svelte'
  export let data;

  let imageSrc = '';
  let downloadLink = '';

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imageSrc = e.target.result;
        downloadLink = imageSrc;
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadImage = () => {
    const a = document.createElement('a');
    a.href = downloadLink;
    a.download = 'image.png';
    a.click();
  };
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<div class="image-editor">
  <div class="image-input">
    <input type="file" accept="image/*" on:change={handleImageUpload} />
    <button class="download-button" on:click={downloadImage}>Download</button>
  </div>
  {#if imageSrc}
    <div class="image-preview-container">
      <img src={imageSrc} alt="Uploaded Image" class="image-preview" />
    </div>
  {/if}
</div>

<style>
  .image-editor {
    text-align: center;
  }

  .image-input {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;
  }

  .download-button {
    margin-left: 20px;
    color: white;
    background-color: grey;
    padding: 10px 20px;
    border: none;
    cursor: pointer;
  }

  .image-preview-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 300px; /* Set a fixed height */
  }

  .image-preview {
    max-width: 100%;
    max-height: 100%;
  }
</style>
