<svelte:head>
  <title>Photo Editor</title>
</svelte:head>
<script lang="ts">
  import Intro from '$lib/Intro.svelte';
  import { onMount } from 'svelte'
  import { Fileupload, Label, Helper } from 'flowbite-svelte';
  import '@pqina/pintura/pintura.css';
  import { getEditorDefaults } from '@pqina/pintura';
  import { PinturaEditor } from '@pqina/svelte-pintura';
  let uploadedImageSrc = null; // Store the uploaded image source
  let editedImageSrc = null;
  export let data;


  

  function handleFileUpload(event) {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      uploadedImageSrc = URL.createObjectURL(uploadedFile);
    }
  }



</script>


  <Intro heading={data.meta.title} description={data.meta.description} />


  

    
      <Label for="with_helper" class="pb-2">Upload file</Label>
      <Fileupload id="with_helper" class="mb-2" on:change={handleFileUpload} />
       <div class="flex justify-center">
     </div>
        <Helper>SVG, PNG, JPG or GIF (MAX. 800x400px).</Helper>
		
      
        <div style="height:80vh">
          <PinturaEditor
          {...getEditorDefaults()}
          src={uploadedImageSrc}
          />
          </div>
          <!-- Download Button -->
          <button on:click={saveEditedImage}>Download Edited Image</button>

          <!-- Provide a download link -->
          {#if editedImageSrc}
          <a href={editedImageSrc} download="edited_image.jpg">Download Edited Image</a>
          {/if}
