<script>
  let compressedImageSrc = null;
  
  async function compressImage() {
    const fileInput = document.getElementById('fileInput');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const selectedFile = fileInput.files[0];
    
    if (selectedFile) {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const img = new Image();
        img.src = event.target.result;
        
        img.onload = () => {
          // Resize the image if needed
          const maxWidth = 800;
          const maxHeight = 600;
          let newWidth = img.width;
          let newHeight = img.height;
          
          if (img.width > maxWidth) {
            newWidth = maxWidth;
            newHeight = (img.height * maxWidth) / img.width;
          }
          
          if (newHeight > maxHeight) {
            newHeight = maxHeight;
            newWidth = (img.width * maxHeight) / img.height;
          }
          
          canvas.width = newWidth;
          canvas.height = newHeight;
          
          // Draw the resized image on the canvas
          ctx.drawImage(img, 0, 0, newWidth, newHeight);
          
          // Convert the canvas image to a data URL with specified quality
          const compressedDataURL = canvas.toDataURL('image/jpeg', 0.7);
          
          // Update the compressed image source
          compressedImageSrc = compressedDataURL;
        };
      };
      
      reader.readAsDataURL(selectedFile);
    }
  }
</script>

<main>
  <input type="file" id="fileInput" accept="image/*" />
  <button on:click={compressImage}>Compress Image</button>
  
  {#if compressedImageSrc}
    <img src={compressedImageSrc} alt="Compressed Image" />
  {/if}
</main>

<style>
  img {
    max-width: 100%;
    margin-top: 20px;
  }
</style>
