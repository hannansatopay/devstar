<script>
    import { onMount } from 'svelte';
    export let image;
    export let canvasWidth = 800; // Default canvas width
    export let canvasHeight = 600; // Default canvas height
    let canvas;
    let context;
    let img = new Image();
    let originalImage = new Image();
    let downloadLink;
    let isDragging = false;
    let isMoving = false;
    let startX = 0, startY = 0;
    let cropStartX = 0, cropStartY = 0, cropWidth = 0, cropHeight = 0;
    let offsetX = 0, offsetY = 0;
    let showCropRect = false;
    let cropShape = 'rectangle';
    let rotation = 0;
    let history = [];
    let historyIndex = -1;

    function saveState() {
        if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
        }
        history.push(canvas.toDataURL());
        historyIndex++;
    }
  
    const draw = () => {
      // Calculate the new canvas dimensions based on the rotation
      const angle = rotation % 180;
      const radians = rotation * Math.PI / 180;
      const newWidth = Math.abs(canvasWidth * Math.cos(radians)) + Math.abs(canvasHeight * Math.sin(radians));
      const newHeight = Math.abs(canvasHeight * Math.cos(radians)) + Math.abs(canvasWidth * Math.sin(radians));
  
      canvas.width = newWidth;
      canvas.height = newHeight;
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.save();
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(rotation * Math.PI / 180);
      context.translate(-canvasWidth / 2, -canvasHeight / 2);
      context.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      context.restore();
  
      if (showCropRect) {
        context.strokeStyle = 'red';
        context.lineWidth = 2;
        if (cropShape === 'rectangle') {
          context.strokeRect(cropStartX, cropStartY, cropWidth, cropHeight);
        } else if (cropShape === 'circle') {
          context.beginPath();
          context.ellipse(
            cropStartX + cropWidth / 2, cropStartY + cropHeight / 2,
            Math.abs(cropWidth) / 2, Math.abs(cropHeight) / 2,
            0, 0, 2 * Math.PI
          );
          context.stroke();
        }
      }
    };
  
    const startDragging = (event) => {
      const rect = canvas.getBoundingClientRect();
      startX = event.clientX - rect.left;
      startY = event.clientY - rect.top;
      if (startX >= cropStartX && startX <= cropStartX + cropWidth && startY >= cropStartY && startY <= cropStartY + cropHeight) {
        isMoving = true;
        offsetX = startX - cropStartX;
        offsetY = startY - cropStartY;
      } else {
        cropStartX = startX;
        cropStartY = startY;
        cropWidth = 0;
        cropHeight = 0;
        isDragging = true;
      }
      showCropRect = true;
    };
  
    const drag = (event) => {
      if (isDragging || isMoving) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        if (isDragging) {
          cropWidth = mouseX - cropStartX;
          cropHeight = mouseY - cropStartY;
        } else if (isMoving) {
          cropStartX = mouseX - offsetX;
          cropStartY = mouseY - offsetY;
        }
        draw();
      }
    };
  
    const stopDragging = () => {
      isDragging = false;
      isMoving = false;
      draw();
    };
  
    const cropImage = () => {
      const croppedCanvas = document.createElement('canvas');
      const croppedContext = croppedCanvas.getContext('2d');
      croppedCanvas.width = cropWidth;
      croppedCanvas.height = cropHeight;
      croppedContext.drawImage(
        canvas,
        cropStartX, cropStartY, cropWidth, cropHeight,
        0, 0, cropWidth, cropHeight
      );
      if (cropShape === 'circle') {
        const circleCanvas = document.createElement('canvas');
        const circleContext = circleCanvas.getContext('2d');
        circleCanvas.width = cropWidth;
        circleCanvas.height = cropHeight;
        circleContext.beginPath();
        circleContext.ellipse(
          cropWidth / 2, cropHeight / 2,
          cropWidth / 2, cropHeight / 2,
          0, 0, 2 * Math.PI
        );
        circleContext.clip();
        circleContext.drawImage(croppedCanvas, 0, 0);
        img.src = circleCanvas.toDataURL();
      } else {
        img.src = croppedCanvas.toDataURL();
      }
      img.onload = () => {
        cropStartX = 0;
        cropStartY = 0;
        cropWidth = 0;
        cropHeight = 0;
        showCropRect = false;
        draw();
      };
      saveState();
    };
  
    const undoCrop = () => {
      img.src = originalImage.src;
      img.onload = () => {
        draw();
      };
      saveState();
    };
  
    const rotateImage = () => {
      rotation = (rotation + 90) % 360;
      draw();
      saveState();
    };
  
    const flipImage = (direction) => {
      const flipCanvas = document.createElement('canvas');
      const flipContext = flipCanvas.getContext('2d');
  
      flipCanvas.width = canvasWidth;
      flipCanvas.height = canvasHeight;
  
      if (direction === 'horizontal') {
        flipContext.scale(-1, 1); // Flip horizontally
        flipContext.drawImage(img, -canvasWidth, 0, canvasWidth, canvasHeight);
      } else if (direction === 'vertical') {
        flipContext.scale(1, -1); // Flip vertically
        flipContext.drawImage(img, 0, -canvasHeight, canvasWidth, canvasHeight);
      }
  
      img.src = flipCanvas.toDataURL();
      img.onload = () => {
        draw();
      };
      saveState();
    };

    function loadSavedImage() {
        const dataURL = localStorage.getItem('savedImage');
        if (dataURL) {
            const img = new Image();
            img.src = dataURL;
            
            img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
            };
        }
    }

    const downloadImage = () => {
        const dataURL = canvas.toDataURL('image/png');
        localStorage.setItem('savedImage', dataURL);
      downloadLink.href = canvas.toDataURL();
      downloadLink.download = 'edited-image.png';
      downloadLink.click();
      saveState();
    };
  
    onMount(() => {
      canvas = document.getElementById('imageCanvas');
      context = canvas.getContext('2d');
      downloadLink = document.createElement('a');
      img.crossOrigin = 'anonymous';
      img.src = image;
      originalImage.crossOrigin = 'anonymous';
      originalImage.src = image;
      img.onload = () => {
        draw();
      };
    });
  </script>
  
  <style>
    .image-editor {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    canvas {
      border: 1px solid #ccc;
      max-width: 100%;
      height: auto;
    }
    .buttons {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      align-items: center;
      gap: 1rem;
    }
    button {
      padding: 10px 20px;
      margin: 5px;
      border: none;
      border-radius: 5px;
      background-color: #4CAF50;
      color: white;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    button:hover {
      background-color: #45a049;
    }
  
    button:active {
      background-color: #397d3a;
    }
  
    .crop-btn {
      background-color: #FF5722;
    }
  
    .crop-btn:hover {
      background-color: #e64a19;
    }
  
    .crop-btn:active {
      background-color: #d84315;
    }
  
    .download-btn {
      background-color: #008CBA;
    }
  
    .download-btn:hover {
      background-color: #007bb5;
    }
  
    .download-btn:active {
      background-color: #006a99;
    }
  
    .rotate-btn {
      background-color: #9C27B0;
    }
  
    .rotate-btn:hover {
      background-color: #8E24AA;
    }
  
    .rotate-btn:active {
      background-color: #7B1FA2;
    }
  
    .shaped-crop-btn {
      background-color: #FF9800;
    }
  
    .shaped-crop-btn:hover {
      background-color: #FB8C00;
    }
  
    .shaped-crop-btn:active {
      background-color: #F57C00;
    }
  </style>
  
  <div class="image-editor">
    <canvas id="imageCanvas"
            on:mousedown="{startDragging}"
            on:mousemove="{drag}"
            on:mouseup="{stopDragging}"
            on:mouseleave="{stopDragging}"></canvas>
    <div class='buttons'>
      <button class="crop-btn" on:click="{cropImage}">Crop</button>
      <button on:click="{undoCrop}">Undo Crop</button>
      <button on:click="{() => flipImage('horizontal')}">Horizontal Flip</button>
      <button on:click="{() => flipImage('vertical')}">Vertical Flip</button>
      <button class='rotate-btn' on:click="{rotateImage}">Rotate Image</button>
      <button class='shaped-crop-btn' on:click="{() => cropShape = 'rectangle'}">Rectangle Crop</button>
      <button class='shaped-crop-btn' on:click="{() => cropShape = 'circle'}">Circle Crop</button>
      <button on:click="{loadSavedImage}">Load Saved Image</button>
      <button class='download-btn' on:click="{downloadImage}">Download Image</button>
    </div>
  </div>
  