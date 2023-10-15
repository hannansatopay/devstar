<!-- src/routes/FlowchartArea.svelte -->
<script>
    import { onMount } from 'svelte';
    import { selectedTool } from './toolstore'; // Adjust the path to your store file
  
    let canvas;
    let context;
    let isDrawing = false;
    let textEditing = false;
    let tempText = '';
    let editText = '';
    let shapes = [];
    let startX, startY, endX, endY;
  
    onMount(() => {
      canvas = document.querySelector('.drawing-area canvas');
      context = canvas.getContext('2d');
  
      canvas.addEventListener('mousedown', handleMouseDown);
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseup', handleMouseUp);
    })
  
    function handleMouseDown(event) {
      isDrawing = true;
      startX = event.clientX - canvas.getBoundingClientRect().left;
      startY = event.clientY - canvas.getBoundingClientRect().top;
      if ($selectedTool === 'text') {
        textEditing = true;
        editText = ''; // Clear any previous text
        startX = event.clientX - canvas.getBoundingClientRect().left;
        startY = event.clientY - canvas.getBoundingClientRect().top;
      }
    }
  
    function handleMouseMove(event) {
      if (!isDrawing) return;
      if (textEditing) {
        // Update text position based on mouse position
        endX = event.clientX - canvas.getBoundingClientRect().left;
        endY = event.clientY - canvas.getBoundingClientRect().top;
      }
  
      endX = event.clientX - canvas.getBoundingClientRect().left;
      endY = event.clientY - canvas.getBoundingClientRect().top;
      context.clearRect(0, 0, canvas.width, canvas.height);
  
      // Redraw all existing shapes
      for (const shape of shapes) {
        switch (shape.type) {
          case 'rectangle':
            drawRectangle(shape.x1, shape.y1, shape.x2, shape.y2, shape.color);
            break;
          case 'circle':
            drawCircle(shape.x1, shape.y1, shape.x2, shape.y2, shape.color);
            break;
          case 'diamond':
            drawDiamond(shape.x1, shape.y1, shape.x2, shape.y2, shape.color);
            break;
          case 'arrow':
            drawArrow(shape.x1, shape.y1, shape.x2, shape.y2, shape.color);
            break;
          case 'text':
            drawText(shape.x, shape.y, shape.text);
            break;
        }
      }
  
      // Check the selected tool and draw the new shape accordingly
      switch ($selectedTool) {
        case 'rectangle':
          drawRectangle(startX, startY, endX, endY, 'blue');
          break;
        case 'circle':
          drawCircle(startX, startY, endX, endY, 'green');
          break;
        case 'diamond':
          drawDiamond(startX, startY, endX, endY, 'orange');
          break;
        case 'arrow':
          drawArrow(startX, startY, endX, endY, 'purple');
          break;
        case 'text':
          break;
        default:
          console.error('Invalid tool selected');
      }
    }
  
    function handleMouseUp() {
      isDrawing = false;
      // Check the selected tool to finalize drawing
      switch ($selectedTool) {
        case 'rectangle':
          addRectangle(startX, startY, endX, endY);
          break;
        case 'circle':
          addCircle(startX, startY, endX, endY);
          break;
        case 'diamond':
          addDiamond(startX, startY, endX, endY);
          break;
        case 'arrow':
          addArrow(startX, startY, endX, endY);
          break;
        case 'text':
          addText(startX, startY, editText);
          textEditing = false;
          break;
        default:
          console.error('Invalid tool selected');
      }
    }
  
    function handleTextBlur() {
      if (textEditing) {
        addText(startX, startY, editText);
        textEditing = false;
      }
    }
  
    function drawRectangle(x1, y1, x2, y2, color) {
      context.beginPath();
      context.rect(x1, y1, x2 - x1, y2 - y1);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
    }
  
    function drawCircle(x1, y1, x2, y2, color) {
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2;
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
    }
  
    function drawDiamond(x1, y1, x2, y2, color) {
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      const width = Math.abs(x2 - x1);
      const height = Math.abs(y2 - y1);
      context.beginPath();
      context.moveTo(centerX, centerY - height / 2);
      context.lineTo(centerX + width / 2, centerY);
      context.lineTo(centerX, centerY + height / 2);
      context.lineTo(centerX - width / 2, centerY);
      context.closePath();
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
    }
  
    function drawArrow(x1, y1, x2, y2, color) {
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.stroke();
      const angle = Math.atan2(y2 - y1, x2 - x1);
      const arrowSize = 10;
      context.beginPath();
      context.moveTo(x2, y2);
      context.lineTo(x2 - arrowSize * Math.cos(angle - Math.PI / 6), y2 - arrowSize * Math.sin(angle - Math.PI / 6));
      context.lineTo(x2 - arrowSize * Math.cos(angle + Math.PI / 6), y2 - arrowSize * Math.sin(angle + Math.PI / 6));
      context.closePath();
      context.fillStyle = color;
      context.fill();
    }
  
    function drawText(x, y, text) {
      context.font = '14px Arial';
      context.fillStyle = 'black';
      context.fillText(text, x, y);
    }
  
    function addRectangle(x1, y1, x2, y2) {
      const rectangleData = {
        type: 'rectangle',x1,y1,x2,y2,color: 'black',
      };
      shapes.push(rectangleData);
      console.log('Added Rectangle:', rectangleData);
    }
  
    function addCircle(x1, y1, x2, y2) {
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)) / 2;
      const circleData = {
        type: 'circle',x1,y1,x2,y2,color: 'black',
      };
      shapes.push(circleData);
      console.log('Added Circle:', circleData);
    }
  
    function addDiamond(x1, y1, x2, y2) {
      const centerX = (x1 + x2) / 2;
      const centerY = (y1 + y2) / 2;
      const width = Math.abs(x2 - x1);
      const height = Math.abs(y2 - y1);
      const diamondData = {
        type: 'diamond',x1,y1,x2,y2,color: 'black',
      };
      shapes.push(diamondData);
      console.log('Added Diamond:', diamondData);
    }
  
    function addArrow(x1, y1, x2, y2) {
      const arrowData = {
        type: 'arrow',x1,y1,x2,y2,color: 'black',
      };
      shapes.push(arrowData);
      console.log('Added Arrow:', arrowData);
    }
  
    function addText(x, y, text) {
      const textData = {
        type: 'text',x,y,text,
    };
      shapes.push(textData);
      console.log('Added Text:', textData);
    }
    function handleTextKeyDown(event) {
      if (event.key === 'Enter') {
        
        editText = tempText;
        handleTextBlur();
      }
    }
  
  </script>
  
  <div class="drawing-area">
    <canvas class=" bg-white w-3/5  lg:w-3/4 sm:w-full" height="430vh">The Flow Chart Generator module is designed to automate the creation of visual flowcharts, diagrams, and process maps. It streamlines the process of converting textual or logical information into easy-to-understand visual representations. Users can input data, define relationships, and choose from various shapes and connectors to generate professional-looking flowcharts, enhancing communication and decision-making in a visual format.</canvas>
  </div>
  
  {#if textEditing}
    <input
      type="text"
      bind:value={tempText}
      style="position: absolute; left: {startX}px; top: {startY}px; z-index: 2; outline: none;"
      on:blur={handleTextBlur}
      on:keydown={handleTextKeyDown}
    />
  
  {/if}
  
  
  <style>
    .drawing-area {
      width: 100%;
      height: 500px;
      border: 1px solid #ccc;
    }
  </style>
  