
  

  <script>

 
    import { onMount } from 'svelte';
    import { imageUrl } from 'C:/Users/smutk/OneDrive/Documents/GitHub/devstar/src/routes/(tools)/image-editor/+page';
    // Adjust the import path based on your project structure
  
    let canvas;
    let context;
    let originalImageData;
  
    const loadImage = (src) => {
      const image = new Image();
      image.onload = () => {
        context = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);
        originalImageData = context.getImageData(0, 0, canvas.width, canvas.height);
      };
      image.src = src;
    };
  
    onMount(() => {
      const unsubscribe = imageUrl.subscribe((url) => {
        if (url) {
          loadImage(url);
        } else {
          alert('No image data found. Please upload an image first.');
        }
      });
  
      return () => {
        unsubscribe();
      };
    });

  </script>
  
  <canvas bind:this={canvas}></canvas>
  
  <style>
    canvas {
      max-width: 100%;
      height: auto;
    }
  </style>
  