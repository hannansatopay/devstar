<!-- src/routes/FlowchartArea.svelte -->
<script>
  import { onMount, afterUpdate } from 'svelte';
  import { selectedTool } from './toolstore'; // Adjust the path to your store file

  export let context;
  let canvas;
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
        case 'square':
          drawSquare(shape.x1, shape.y1, shape.x2, shape.y2, shape.color);
          break;
        case 'circle':
          drawCircle(shape.x1, shape.y1, shape.x2, shape.y2, shape.color);
          break;
        case 'triangle':
          drawTriangle(shape.x1, shape.y1, shape.x2, shape.y2, shape.color);
          break;
        case 'oval':
          drawOval(shape.x1, shape.y1, shape.x2, shape.y2, shape.color);
          break;
        case 'diamond':
          drawDiamond(shape.x1, shape.y1, shape.x2, shape.y2, shape.color);
          break;
        case 'arrow':
          drawArrow(shape.x1, shape.y1, shape.x2, shape.y2, shape.color);
          break;
        case 'parallelogram':
          drawParallelogram(shape.x1, shape.y1, shape.x2, shape.y2, shape.color);
          break;
        case 'text':
          drawText(shape.x, shape.y, shape.text);
          break;
      }
    }

    // Check the selected tool and draw the new shape accordingly
    switch ($selectedTool) {
      case 'rectangle':
        drawRectangle(startX, startY, endX, endY, 'black');
        break;
      case 'square':
        drawSquare(startX, startY, endX, endY, 'black');
        break;
      case 'circle':
        drawCircle(startX, startY, endX, endY, 'black');
        break;
      case 'triangle':
        drawTriangle(startX, startY, endX, endY, 'black');
        break;
      case 'oval':
        drawOval(startX, startY, endX, endY, 'black');
        break;
      case 'diamond':
        drawDiamond(startX, startY, endX, endY, 'black');
        break;
      case 'arrow':
        drawArrow(startX, startY, endX, endY, 'black');
        break;
      case 'parallelogram':
        drawParallelogram(startX, startY, endX, endY, 'black');
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
    case 'square':
      addSquare(startX, startY, endX, endY);
      break;
    case 'circle':
      addCircle(startX, startY, endX, endY);
      break;
    case 'triangle':
      addTriangle(startX, startY, endX, endY);
      break;
    case 'oval':
      addOval(startX, startY, endX, endY);
      break;
    case 'diamond':
      addDiamond(startX, startY, endX, endY);
      break;
    case 'arrow':
      addArrow(startX, startY, endX, endY);
      break;
    case 'parallelogram':
      addParallelogram(startX, startY, endX, endY);
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
  function addRectangle(x1, y1, x2, y2) {
    const rectangleData = {
      type: 'rectangle',x1,y1,x2,y2,color: 'black',
    };
    shapes.push(rectangleData);
    console.log('Added Rectangle:', rectangleData);
  }


  function addSquare(x1, y1, x2, y2) {
  const squareData = {
    type: 'square',x1,y1,x2,y2,color: 'black',
  };
  shapes.push(squareData);
  console.log('Added Square:', squareData);
  } 
  function drawSquare(x1, y1, x2, y2, color) {
    const sideLength = Math.min(Math.abs(x2 - x1), Math.abs(y2 - y1));
    context.beginPath();
    context.rect(x1, y1, sideLength, sideLength);
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

  function drawTriangle(x1, y1, x2, y2, color) {
    context.beginPath();
    const base = Math.abs(x2 - x1);
    const height = Math.abs(y2 - y1);
    const apexX = x1 + base / 2;
    const apexY = (y1 < y2) ? y1 : y2;
    const baseLeftX = x1;
    const baseRightX = x2;
    const baseY = (y1 < y2) ? y2 : y1;

    context.moveTo(apexX, apexY);
    context.lineTo(baseLeftX, baseY);
    context.lineTo(baseRightX, baseY);
    context.closePath();
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
  }
  function addTriangle(x1, y1, x2, y2) {
  const triangleData = {
    type: 'triangle',x1,y1,x2,y2,color: 'black',
  };
  shapes.push(triangleData);
  console.log('Added Triangle:', triangleData);
  }


  function drawOval(x1, y1, x2, y2, color) {
    context.beginPath();

    const centerX = (x1 + x2) / 2;
    const centerY = (y1 + y2) / 2;
    const radiusX = Math.abs(x2 - x1) / 2;
    const radiusY = Math.abs(y2 - y1) / 2;

    context.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
    context.strokeStyle = color;
    context.lineWidth = 2;
    context.stroke();
  }
  function addOval(x1, y1, x2, y2) {
    const ovalData = {
      type: 'oval',x1,y1,x2,y2,color: 'black',
    };
    shapes.push(ovalData);
    console.log('Added Oval:', ovalData);
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

  function addArrow(x1, y1, x2, y2) {
    const arrowData = {
      type: 'arrow',x1,y1,x2,y2,color: 'black',
    };
    shapes.push(arrowData);
    console.log('Added Arrow:', arrowData);
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

  function addParallelogram(x1, y1, x2, y2) {
    const parallelogramData = {
      type: 'parallelogram',x1,y1,x2,y2,color: 'black',
    };
    shapes.push(parallelogramData);
    console.log('Added Parallelogram:', parallelogramData);
  }
  function drawParallelogram(x1, y1, x2, y2, color) {
  context.beginPath();
  const centerX = (x1 + x2) / 2;
  const centerY = (y1 + y2) / 2;
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);
  const topX = centerX - width / 2;
  const topY = centerY - height / 2;
  const bottomX = centerX + width / 2;
  const bottomY = centerY + height / 2;
  const leftTopX = topX - width / 4;
  const rightTopX = topX + width / 4;
  
  context.moveTo(leftTopX, bottomY);
  context.lineTo(rightTopX, topY);
  context.lineTo(bottomX, topY);
  context.lineTo(bottomX - width / 2, bottomY);
  context.closePath();
  context.strokeStyle = color;
  context.lineWidth = 2;
  context.stroke();
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
  function drawText(x, y, text) {
    context.font = '14px Arial';
    context.fillStyle = 'black';
    context.fillText(text, x, y);
  }
  window.addEventListener('export-request', exportCanvas);
  function exportCanvas() {
    const url = canvas.toDataURL('image/png');

    // Create an anchor element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'flowchart.png';

    // Programmatically trigger a click event on the link
    const clickEvent = new MouseEvent('click', {
      view: window,
      bubbles: false,
      cancelable: true,
    });
    link.dispatchEvent(clickEvent);
  }
</script>

<div class="drawing-area">
  <canvas height="1800px" width="2000px"></canvas>
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
  .drawing-area{
    overflow: scroll;
    height: 600px;
    background-color: white;
  }
</style>
