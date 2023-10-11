<svelte:head>
	<title> Photo Editor</title>
</svelte:head>
<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	export let data;
	
	let uploadedImage;
  let blurAmount = 0;

  async function handleFileInput(event) {
    const file = event.target.files[0];
    if (file && blurAmount !== undefined) {
      const imageUrl = URL.createObjectURL(file);
      const image = new Image();
      image.src = imageUrl;
      await image.decode(); // Ensure the image is loaded
      
      // Get a reference to the canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to match the image
      canvas.width = image.width;
      canvas.height = image.height;

      // Apply blur effect
      ctx.filter = `blur(${blurAmount}px)`;
      ctx.drawImage(image, 0, 0);
      
      // Replace the uploadedImage with the blurred image data URL
      uploadedImage = canvas.toDataURL();

      URL.revokeObjectURL(imageUrl); // Clean up the object URL
    }
    
  }

  function downloadImage() {
    if (uploadedImage) {
      const link = document.createElement('a');
      link.href = uploadedImage;
      link.download = 'blurred_image.png';
      link.click();
    }
  }

</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<main>
	<h1 class="text-white">Image Blur Effect</h1>
  
	<input
	  type="file"
	  accept="image/*"
	  on:change={handleFileInput}
	  class="text-white"
	/>
  
	<label class="text-white">
	  Blur Amount:
	  <input
		type="range"
		min="0"
		max="10"
		step="0.5"
		bind:value={blurAmount}
	  />
	  {blurAmount} pixels
	</label>
  
	{#if uploadedImage}
	<div class="image-container">
		<h2 class="text-white">Blurred Image</h2>
		<img src={uploadedImage} alt="Blurred Image"/>
		<button on:click={downloadImage} class="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Download Blurred Image</button>
	</div>
	{/if}

</main>


<style>
	main {
    text-align: center;
    margin: 20px;
  }
  img {
    max-width: 100%;
    margin-top: 10px;
  }	
  .image-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
</style>