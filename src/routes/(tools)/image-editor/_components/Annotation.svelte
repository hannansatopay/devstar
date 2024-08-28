<script>
  import { onMount } from 'svelte';
  import { saveAs } from 'file-saver'; // Make sure you have installed file-saver: npm install file-saver

  let annotations = []; // For storing all annotations
  let activeTool = 'drawLow'; // Default tool
  let drawingThickness = 'low'; // Default drawing thickness
  let drawColor = '#000000'; // Default draw color
  let imageSrc = null; // For storing the uploaded image source
  let textColor = '#000000'; // Default text color
  let zoomLevel = 1.0; // Initial zoom level
  let shapeType = 'rectangle'; // Default shape type
  
let textSize = 20; // Default text size
let textFont = 'Arial'; // Default text font
let canvas;
let ctx;

  const toolConfigs = {
    drawLow: {
      name: 'Draw (Low)',
      icon: '✏️',
      size: 2
    },
    drawMedium: {
      name: 'Draw (Medium)',
      icon: '✏️',
      size: 4
    },
    drawHigh: {
      name: 'Draw (High)',
      icon: '✏️',
      size: 6
    },
    text: {
      name: 'Text',
      icon: '🔤',
      size: 16,
      fontFamily: 'Arial'
    },
    shape: {
      name: 'Shape',
      icon: '🔶',
      type: 'rectangle'
    },
    highlight: {
      name: 'Highlight',
      icon: '🌟',
      color: 'rgba(255, 255, 0, 0.5)'
    },
    erase: {
      name: 'Eraser',
      icon: '🧽',
      size: 10
    }
  };

  function addAnnotation(event) {
    const { offsetX, offsetY } = event;
    const x = offsetX / zoomLevel;
    const y = offsetY / zoomLevel;

    switch (activeTool) {
      case 'drawLow':
      case 'drawMedium':
      case 'drawHigh':
        annotations.push({
          type: 'draw',
          points: [{ x, y }],
          color: drawColor,
          size: toolConfigs[activeTool].size
        });
        break;
      case 'text':
      const text = prompt('Enter text:');
      if (text) {
        annotations.push({
          type: 'text',
          text,
          x,
          y,
          color: textColor,
          size: textSize,
          font: textFont
        });
      }
      break;
        break;
      case 'shape':
        // Wait for the second click to define the end coordinates for shapes
        break;
      case 'highlight':
        annotations.push({
          type: 'highlight',
          x,
          y,
          width: 100,
          height: 20,
          color: toolConfigs.highlight.color
        });
        break;
      case 'erase':
        eraseAnnotation(x, y);
        break;
      default:
        break;
    }
  }

  function finishShape(event) {
    const { offsetX, offsetY } = event;
    const endX = offsetX / zoomLevel;
    const endY = offsetY / zoomLevel;

    annotations.push({
      type: 'shape',
      shapeType,
      startX: annotations[annotations.length - 1].startX,
      startY: annotations[annotations.length - 1].startY,
      endX,
      endY,
      color: drawColor
    });

    redrawCanvas();
  }

  function eraseAnnotation(x, y) {
annotations = annotations.filter(annotation => {
  switch (annotation.type) {
    case 'draw':
      // Check if any points are within the erase range
      return !annotation.points.some(point => isPointInRange(point, { x, y }, toolConfigs.erase.size));
    case 'text':
      // Check if the text position is within the erase range
      return !isPointInRange({ x: annotation.x, y: annotation.y }, { x, y }, toolConfigs.erase.size);
    case 'shape':
      // Check if the erase point falls within the bounds of the shape
      switch (annotation.shapeType) {
        case 'rectangle':
          return !isPointInRectangle({ x, y }, annotation);
        case 'circle':
          return !isPointInCircle({ x, y }, annotation);
        case 'line':
          return !isPointOnLine({ x, y }, annotation);
        case 'arrow':
          // Add arrow logic if needed
          break;
        default:
          break;
      }
      break;
    case 'highlight':
      // Check if the erase point is within the highlighted area
      return !isPointInHighlight({ x, y }, annotation);
    default:
      return true; // Keep other types of annotations
  }
});
}

function isPointInHighlight(point, highlight) {
return (
  point.x >= highlight.x &&
  point.x <= highlight.x + highlight.width &&
  point.y >= highlight.y &&
  point.y <= highlight.y + highlight.height
);
}
function isPointOnLine(point, line) {
// Check if the point is close to the line
const distance = Math.abs(
  (line.endY - line.startY) * point.x - (line.endX - line.startX) * point.y + line.endX * line.startY - line.endY * line.startX
) / Math.sqrt(Math.pow(line.endY - line.startY, 2) + Math.pow(line.endX - line.startX, 2));
return distance <= toolConfigs.erase.size;
}
function isPointInRectangle(point, rectangle) {
return (
  point.x >= rectangle.startX &&
  point.x <= rectangle.endX &&
  point.y >= rectangle.startY &&
  point.y <= rectangle.endY
);
}

function isPointInCircle(point, circle) {
const radius = Math.sqrt(Math.pow(circle.endX - circle.startX, 2) + Math.pow(circle.endY - circle.startY, 2));
return Math.pow(point.x - circle.startX, 2) + Math.pow(point.y - circle.startY, 2) <= Math.pow(radius, 2);
}


function isPointInRange(point1, point2, range) {
  return Math.abs(point1.x - point2.x) < range && Math.abs(point1.y - point2.y) < range;
}


  function clearAnnotations() {
    annotations = [];
    redrawCanvas(); // Redraw canvas after clearing annotations
  }

  function exportAnnotations() {
    const jsonAnnotations = JSON.stringify(annotations, null, 2);
    const blob = new Blob([jsonAnnotations], { type: 'application/json' });
    saveAs(blob, 'annotations.json');
  }

  function selectTool(tool) {
  activeTool = tool;
  if (tool === 'shape') {
    shapeType = 'rectangle'; // Default shape type

    // Update shapeType options for selection
    const shapeTypeSelect = document.getElementById('shape-type-select');
    shapeTypeSelect.style.display = 'inline-block'; // Display shape type selector
    shapeTypeSelect.addEventListener('change', (event) => {
      switch (event.target.value) {
        case 'rectangle':
        case 'circle':
        case 'arrow':
        case 'line':
          shapeType = event.target.value;
          break;
        default:
          break;
      }
    });
  }
}


  function selectDrawingThickness(thickness) {
    drawingThickness = thickness;
    switch (thickness) {
      case 'low':
        activeTool = 'drawLow';
        break;
      case 'medium':
        activeTool = 'drawMedium';
        break;
      case 'high':
        activeTool = 'drawHigh';
        break;
      default:
        break;
    }
  }

  function zoomIn() {
    if (zoomLevel < 2.0) {
      zoomLevel += 0.1;
      redrawCanvas();
    }
  }

  function zoomOut() {
    if (zoomLevel > 0.5) {
      zoomLevel -= 0.1;
      redrawCanvas();
    }
  }

  function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        imageSrc = e.target.result;
        redrawCanvas();
      };
      reader.readAsDataURL(file);
    }
  }

  onMount(() => {
    const canvas = document.getElementById('annotation-canvas');
    const ctx = canvas.getContext('2d');

    function drawAnnotations() {
      if (imageSrc) {
        const img = new Image();
        img.onload = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width * zoomLevel, canvas.height * zoomLevel);
          annotations.forEach(annotation => {
            switch (annotation.type) {
              case 'draw':
                drawFreehand(annotation);
                break;
              case 'text':
                drawText(annotation);
                break;
              case 'shape':
                drawShape(annotation);
                break;
              case 'highlight':
                drawHighlight(annotation);
                break;
              default:
                break;
            }
          });
        };
        img.src = imageSrc;
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    function drawFreehand(annotation) {
  ctx.strokeStyle = annotation.color;
  ctx.lineWidth = annotation.size;
  ctx.lineCap = 'round';

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  // Event handlers for drawing interaction
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseleave', stopDrawing);

  function startDrawing(event) {
    isDrawing = true;
    const { offsetX, offsetY } = event;
    lastX = offsetX;
    lastY = offsetY;
    ctx.beginPath();
    ctx.moveTo(offsetX * zoomLevel, offsetY * zoomLevel);
  }

  function draw(event) {
    if (!isDrawing) return;
    const { offsetX, offsetY } = event;
    ctx.lineTo(offsetX * zoomLevel, offsetY * zoomLevel);
    ctx.stroke();
    lastX = offsetX;
    lastY = offsetY;
  }

  function stopDrawing() {
    isDrawing = false;
    ctx.closePath();
  }

  // Draw existing points
  annotation.points.forEach((point, index) => {
    if (index === 0) {
      ctx.beginPath();
      ctx.moveTo(point.x * zoomLevel, point.y * zoomLevel);
    } else {
      ctx.lineTo(point.x * zoomLevel, point.y * zoomLevel);
      ctx.stroke();
    }
  });
}


function drawText(annotation) {
    ctx.font = `${annotation.size * zoomLevel}px ${annotation.font}`;
    ctx.fillStyle = annotation.color;
    ctx.fillText(annotation.text, annotation.x * zoomLevel, annotation.y * zoomLevel);
  }

  function drawShape(annotation) {
ctx.strokeStyle = annotation.color;
ctx.lineWidth = 2;
switch (annotation.shapeType) {
  case 'rectangle':
    ctx.strokeRect(
      annotation.startX * zoomLevel,
      annotation.startY * zoomLevel,
      (annotation.endX - annotation.startX) * zoomLevel,
      (annotation.endY - annotation.startY) * zoomLevel
    );
    break;
  case 'circle':
    const radius = Math.sqrt(
      Math.pow(annotation.endX - annotation.startX, 2) + Math.pow(annotation.endY - annotation.startY, 2)
    );
    ctx.beginPath();
    ctx.arc(annotation.startX * zoomLevel, annotation.startY * zoomLevel, radius * zoomLevel, 0, 2 * Math.PI);
    ctx.stroke();
    break;
  case 'line':
    ctx.beginPath();
    ctx.moveTo(annotation.startX * zoomLevel, annotation.startY * zoomLevel);
    ctx.lineTo(annotation.endX * zoomLevel, annotation.endY * zoomLevel);
    ctx.stroke();

    // Calculate angle of the line
    const angle = Math.atan2(annotation.endY - annotation.startY, annotation.endX - annotation.startX);

    // Arrowhead length
    const arrowLength = 10;

    // Draw arrowhead
    ctx.save();
    ctx.translate(annotation.endX * zoomLevel, annotation.endY * zoomLevel);
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowLength, arrowLength / 2);
    ctx.lineTo(-arrowLength, -arrowLength / 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    break;
  case 'arrow':
    // Draw arrow with arrowhead
    ctx.beginPath();
    ctx.moveTo(annotation.startX * zoomLevel, annotation.startY * zoomLevel);
    ctx.lineTo(annotation.endX * zoomLevel, annotation.endY * zoomLevel);
    ctx.stroke();

    // Calculate angle of the arrow
    const arrowAngle = Math.atan2(annotation.endY - annotation.startY, annotation.endX - annotation.startX);

    // Arrowhead length and width
    const arrowheadLength = 10;
    const arrowheadWidth = 8;

    // Draw arrowhead
    ctx.save();
    ctx.translate(annotation.endX * zoomLevel, annotation.endY * zoomLevel);
    ctx.rotate(arrowAngle);

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-arrowheadLength, arrowheadWidth / 2);
    ctx.lineTo(-arrowheadLength, -arrowheadWidth / 2);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
    break;
  default:
    break;
}
}


    function drawHighlight(annotation) {
      ctx.fillStyle = annotation.color;
      ctx.fillRect(annotation.x * zoomLevel, annotation.y * zoomLevel, annotation.width * zoomLevel, annotation.height * zoomLevel);
    }

    canvas.addEventListener('mousedown', (event) => {
      const { offsetX, offsetY } = event;
      const x = offsetX / zoomLevel;
      const y = offsetY / zoomLevel;

      switch (activeTool) {
        case 'drawLow':
        case 'drawMedium':
        case 'drawHigh':
          const size = toolConfigs[activeTool].size;
          const newPoint = { x, y };
          const lastAnnotation = annotations[annotations.length - 1];
          if (lastAnnotation && lastAnnotation.type === 'draw') {
            lastAnnotation.points.push(newPoint);
          } else {
            annotations.push({
              type: 'draw',
              points: [newPoint],
              color: drawColor,
              size
            });
          }
          break;
        case 'shape':
          annotations.push({
            type: 'shape',
            shapeType,
            startX: x,
            startY: y,
            color: drawColor
          });
          canvas.removeEventListener('mousedown', addAnnotation);
          canvas.addEventListener('mouseup', finishShape);
          break;
        default:
          addAnnotation(event);
          break;
      }
      redrawCanvas();
    });

    function redrawCanvas() {
      drawAnnotations();
    }

    return () => {
      canvas.removeEventListener('mousedown', addAnnotation);
      canvas.removeEventListener('mouseup', finishShape);
      canvas.addEventListener('mousedown',drawText)
    };
  });
</script>

<style>
  /* Add your custom styles here */
  #annotation-canvas {
    border: 1px solid #000;
    cursor: crosshair;
    margin-top: 20px;
    display: block;
    margin-left: auto;
    margin-right: auto;
    background-color: aliceblue;
    margin-left: 150px;
  }

  .tools-container {
  width: 250px;
            position: absolute; /* Position the container absolutely */
            top: 50%; /* Center the container vertically */
            right: 0; /* Align the container to the right side */
            transform: translateY(-50%); /* Adjust the centering */
            display: flex;
            flex-direction: column; /* Arrange tools in a column */
            gap: 10px; /* Space between tools */
            padding: 8px 16px;
            margin: 5px 0;
            border: none;
            border-radius: 4px;
            background-color: #d6bebe; /* Button background color */
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Light shadow for buttons */
            font-size: 16px;
            color: #333; 
            margin-top: 170px;
            margin-right: 50px;/* Dark text color */
        }

        .tool {
            cursor: pointer;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 4px;
            transition: background-color 0.3s, transform 0.3s;
            display: flex;
            align-items: center;
            justify-content: center; /* Center text horizontally */
            background-color: aliceblue; /* Button background color */
        }
/* Center the tools-container in its parent */


/* If you want to add some spacing around the tools-container */



  .tool:hover {
    background-color: #1ae300;
    transform: scale(1.1);
    
  }

  .tool-dropdown {
    position: relative;
    display: inline-block;
  }

  .tool-dropdown-content {
    display: none;
    position: absolute;
    background-color: #f9f9f9;
    min-width: 160px;
    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    z-index: 1;
    background-color: antiquewhite;
  }

  .tool-dropdown-content .tool-option {
    padding: 12px 16px;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .tool-dropdown-content .tool-option:hover {
    background-color: #f1f1f1;
  }

  .tool-dropdown:hover .tool-dropdown-content {
    display: block;
  }

  .zoom-controls {
    margin-top: 10px;
    margin-right: 10px;
    padding: 10px 20px 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border: 1px solid #ccc;
    border-radius: 4px;
    transition: background-color 0.3s, transform 0.3s;
    background-color: ghostwhite;
  }

  .zoom-controls .tool {
    display: block;
    margin-bottom: 5px;
  }
  .zoom-controls:hover{
    background-color: antiquewhite;
  }

  .upload-container {
    position: absolute;
    text-align: center;
    margin-top: 20px;
  }

  .color-picker {
    margin-left: 10px;
  }
  .buttons-container{
    display: flex;
  justify-content: center; /* Center horizontally */
  align-items: center; /* Center vertically if needed */
  margin-right: 250px;
  }
  button {
    padding: 10px 20px;
  margin-right: 10px;
  font-size: 16px;
  cursor: pointer;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: aliceblue;
  transition: background-color 0.3s, transform 0.3s;
  justify-content: center; /* Center horizontally */
  align-items: center;
   /* Center vertically if needed */
  }

  button:hover {
    background-color: #f0f0f0;
    transform: scale(1.1);
    background-color: aquamarine;

  }

  input[type="color"] {
    width: 27px; /* Adjust width to desired size */
    height: 20px; /* Adjust height to desired size */
    padding-left: 5px;
    margin-left: 5px;
    vertical-align: middle;
  }
  .toolbar {
  display: flex;
  gap: 5px;
  align-items: center;
  text-align: center;
}

.toolbar select,
.toolbar input[type="number"],
.toolbar input[type="color"] {
  padding: 5px;
  font-size: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.toolbar select {
  border-radius: 4px;

  width: 70px;
  align-items: center;
  text-align: center;
  box-shadow: #333;
  margin-left: 3px;

}

.toolbar input[type="number"] {
  width: 40px;
  align-items: center;
  text-align: center;
  box-shadow: #333;
}
</style>

<div class="tools-container">
  <!-- Dropdown for Draw tool -->
  <div class="tool-dropdown">
    <div class="tool">{toolConfigs.drawLow.icon} Draw
      {#if activeTool.startsWith('draw')}
      <div class="color-picker">
        <label for="draw-color"></label>
        <input type="color" id="draw-color" bind:value={drawColor}>
      </div>
    {/if}
    </div>
    <div class="tool-dropdown-content">
      <div class="tool-option" on:click={() => selectDrawingThickness('low')}>Low</div>
      <div class="tool-option" on:click={() => selectDrawingThickness('medium')}>Medium</div>
      <div class="tool-option" on:click={() => selectDrawingThickness('high')}>High</div>
    </div>
  </div>

  <!-- Other tools -->
  <span class="tool" on:click={() => selectTool('text')}>{toolConfigs.text.icon} Text 
    <div class="toolbar">
<select class="font" bind:value={textFont} title="Font">
  <option value="Arial">Arial</option>
  <option value="Verdana">Verdana</option>
  <option value="Times New Roman">Times New Roman</option>
  <option value="Courier New">Courier New</option>
  <option value="Georgia">Georgia</option>
  <option value="Palatino Linotype">Palatino Linotype</option>
  <option value="Book Antiqua">Book Antiqua</option>
  <option value="Lucida Sans Unicode">Lucida Sans Unicode</option>
  <option value="Tahoma">Tahoma</option>
  <option value="Geneva">Geneva</option>
  <option value="Helvetica">Helvetica</option>
  <option value="Trebuchet MS">Trebuchet MS</option>
  <option value="Arial Black">Arial Black</option>
  <option value="Impact">Impact</option>
  <option value="Comic Sans MS">Comic Sans MS</option>
  <option value="Lucida Console">Lucida Console</option>
  <option value="Monaco">Monaco</option>
  <option value="Courier">Courier</option>
  <option value="Copperplate">Copperplate</option>
  <option value="Brush Script MT">Brush Script MT</option>
  <option value="Arial Narrow">Arial Narrow</option>
  <option value="Gill Sans">Gill Sans</option>
  <option value="Verdana Pro">Verdana Pro</option>
  <option value="Futura">Futura</option>
  <option value="Calibri">Calibri</option>
  <option value="Segoe UI">Segoe UI</option>
  <option value="Franklin Gothic Medium">Franklin Gothic Medium</option>
  <option value="Rockwell">Rockwell</option>
  <option value="Palatino">Palatino</option>
  <option value="Baskerville">Baskerville</option>
  <option value="Century Gothic">Century Gothic</option>
</select>

<input class="size" type="number" bind:value={textSize} min="10" max="100" title="Text Size" />

<input type="color" bind:value={textColor} title="Text Color" />
</div>

  </span>
  
  <div class="tool-dropdown">
    <span class="tool" on:click={() => selectTool('shape')}>{toolConfigs.shape.icon} Shape</span>
    <div class="tool-dropdown-content">
      <div class="tool-option" on:click={() => shapeType = 'rectangle'}>Rectangle</div>
      <div class="tool-option" on:click={() => shapeType = 'circle'}>Circle</div>
      <div class="tool-option" on:click={() => shapeType = 'line'}>Line</div>
      <div class="tool-option" on:click={() => shapeType = 'arrow'}>Arrow</div>
    </div>
  </div>
  
  <span class="tool" on:click={() => selectTool('highlight')}>{toolConfigs.highlight.icon} Highlight</span>
  <span class="tool" on:click={() => selectTool('erase')}>{toolConfigs.erase.icon} Erase</span>

  <!-- Zoom controls -->
  <div class="zoom-controls">
    <button class="tool" on:click={zoomIn}>Zoom In 🌐</button>
    <button class="tool" on:click={zoomOut}>Zoom Out 🌍</button>
  </div>
</div>

<!-- Image upload -->
<div class="upload-container">
  <input type="file" accept="image/*" on:change={handleImageUpload}>
</div>

<!-- Clear and Export buttons -->
<div class="buttons-container">
  <button on:click={clearAnnotations}>Clear Annotations</button>
  <button on:click={exportAnnotations}>Export Annotations</button>
</div>

<!-- Canvas for drawing annotations -->
<canvas id="annotation-canvas" width="600" height="400"></canvas>
