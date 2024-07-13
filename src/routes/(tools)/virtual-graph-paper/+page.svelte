<script>
    import { onMount } from 'svelte';

    let ctx;
    let drawing = false;
    let startX, startY;
    let currentTool = 'line';
    let color = '#00bfff';
    let lineWidth = 2;
    let actions = [];
    let undoStack = [];
    let scale = 1;
    let panX = 0;
    let panY = 0;

	let currentFreehandPoints = [];
	let controlPoint = null;

	function startDrawing(event) {
		drawing = true;
		const rect = event.target.getBoundingClientRect();
		startX = (event.clientX - rect.left - panX) / scale;
		startY = (event.clientY - rect.top - panY) / scale;

		if (currentTool === 'freehand') {
			currentFreehandPoints = [{ x: startX, y: startY }];
		} else if (currentTool === 'curve') {
			controlPoint = { x: startX, y: startY }; 
		}
	}

	function draw(event) {
		if (!drawing) return;
		const rect = event.target.getBoundingClientRect();
		const x = (event.clientX - rect.left - panX) / scale;
		const y = (event.clientY - rect.top - panY) / scale;

		redrawCanvas();
		ctx.lineWidth = lineWidth;
		ctx.strokeStyle = color;
		ctx.lineCap = 'round';

		if (currentTool === 'line') {
			ctx.beginPath();
			ctx.moveTo(startX, startY);
			ctx.lineTo(x, y);
			ctx.stroke();
		} else if (currentTool === 'rectangle') {
			ctx.strokeRect(startX, startY, x - startX, y - startY);
		} else if (currentTool === 'circle') {
			ctx.beginPath();
			const radius = Math.sqrt(Math.pow(x - startX, 2) + Math.pow(y - startY, 2));
			ctx.arc(startX, startY, radius, 0, Math.PI * 2);
			ctx.stroke();
		} else if (currentTool === 'curve') {
			controlPoint = { x, y }; 
			ctx.beginPath();
			ctx.moveTo(startX, startY);
			ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, x, y);
			ctx.stroke();
		} else if (currentTool === 'arrow') {
			const headlen = 10; 
			const angle = Math.atan2(y - startY, x - startX);
			ctx.beginPath();
			ctx.moveTo(startX, startY);
			ctx.lineTo(x, y);
			ctx.lineTo(x - headlen * Math.cos(angle - Math.PI / 6), y - headlen * Math.sin(angle - Math.PI / 6));
			ctx.moveTo(x, y);
			ctx.lineTo(x - headlen * Math.cos(angle + Math.PI / 6), y - headlen * Math.sin(angle + Math.PI / 6));
			ctx.stroke();
		} else if (currentTool === 'freehand') {
			currentFreehandPoints.push({ x, y });
			ctx.beginPath();
			for (let i = 0; i < currentFreehandPoints.length - 1; i++) {
				ctx.moveTo(currentFreehandPoints[i].x, currentFreehandPoints[i].y);
				ctx.lineTo(currentFreehandPoints[i + 1].x, currentFreehandPoints[i + 1].y);
			}
			ctx.stroke();
		}
	}

	function stopDrawing(event) {
		if (!drawing) return;
		drawing = false;
		const rect = event.target.getBoundingClientRect();
		const endX = (event.clientX - rect.left - panX) / scale;
		const endY = (event.clientY - rect.top - panY) / scale;

		if (currentTool === 'freehand') {
			actions.push({ tool: 'freehand', points: currentFreehandPoints, color, lineWidth });
		} else if (currentTool === 'text') {
			const text = prompt('Enter text:');
			if (text) {
				actions.push({ tool: 'text', startX, startY, text, color, lineWidth });
			}
		} else if (currentTool === 'curve') {
			actions.push({ tool: 'curve', startX, startY, controlX: controlPoint.x, controlY: controlPoint.y, endX, endY, color, lineWidth });
		} else {
			actions.push({ tool: currentTool, startX, startY, endX, endY, color, lineWidth });
		}

		undoStack = [];
		redrawCanvas();
	}

	function drawActions() {
		actions.forEach(action => {
			ctx.lineWidth = action.lineWidth;
			ctx.strokeStyle = action.color;
			ctx.fillStyle = action.color;
			ctx.beginPath();

			if (action.tool === 'line') {
				ctx.moveTo(action.startX, action.startY);
				ctx.lineTo(action.endX, action.endY);
			} else if (action.tool === 'rectangle') {
				ctx.strokeRect(action.startX, action.startY, action.endX - action.startX, action.endY - action.startY);
			} else if (action.tool === 'circle') {
				const radius = Math.sqrt(Math.pow(action.endX - action.startX, 2) + Math.pow(action.endY - action.startY, 2));
				ctx.arc(action.startX, action.startY, radius, 0, Math.PI * 2);
			} else if (action.tool === 'curve') {
				ctx.moveTo(action.startX, action.startY);
				ctx.quadraticCurveTo(action.controlX, action.controlY, action.endX, action.endY);
			} else if (action.tool === 'arrow') {
				const headlen = 10; // length of head in pixels
				const angle = Math.atan2(action.endY - action.startY, action.endX - action.startX);
				ctx.moveTo(action.startX, action.startY);
				ctx.lineTo(action.endX, action.endY);
				ctx.lineTo(action.endX - headlen * Math.cos(angle - Math.PI / 6), action.endY - headlen * Math.sin(angle - Math.PI / 6));
				ctx.moveTo(action.endX, action.endY);
				ctx.lineTo(action.endX - headlen * Math.cos(angle + Math.PI / 6), action.endY - headlen * Math.sin(angle + Math.PI / 6));
			} else if (action.tool === 'freehand') {
				for (let i = 0; i < action.points.length - 1; i++) {
					ctx.moveTo(action.points[i].x, action.points[i].y);
					ctx.lineTo(action.points[i + 1].x, action.points[i + 1].y);
				}
			} else if (action.tool === 'text') {
				ctx.font = `${action.lineWidth * 10}px Arial`;
				ctx.fillText(action.text, action.startX, action.startY);
			}

			ctx.stroke();
			ctx.closePath();
		});
	}


    function redrawCanvas() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.save();
        ctx.translate(panX, panY);
        ctx.scale(scale, scale);
        drawGrid(ctx);
        drawActions();
        ctx.restore();
    }

    onMount(() => {
        ctx = document.getElementById('canvas').getContext('2d');
        redrawCanvas();
    });

    function drawGrid(ctx) {
        const width = ctx.canvas.width / scale;
        const height = ctx.canvas.height / scale;
        const step = 20;

        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--grid-color');
        ctx.lineWidth = 0.5;

        for (let x = step; x < width; x += step) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        for (let y = step; y < height; y += step) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }

    // Toolbar 
    function undo() {
        const lastAction = actions.pop();
        if (lastAction) undoStack.push(lastAction);
        redrawCanvas();
    }

    function redo() {
        const lastUndo = undoStack.pop();
        if (lastUndo) actions.push(lastUndo);
        redrawCanvas();
    }

    function saveCanvas() {
        const link = document.createElement('a');
        link.download = 'drawing.png';
        link.href = document.getElementById('canvas').toDataURL();
        link.click();
    }

	function printCanvas() {
        const dataUrl = document.getElementById('canvas').toDataURL();
        let windowContent = '<!DOCTYPE html>';
        windowContent += '<html>';
        windowContent += '<head><title>Print canvas</title>';
        windowContent += '<style>';
        windowContent += 'body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }';
        windowContent += 'img { max-width: 100%; max-height: 100%; }';
        windowContent += '</style>';
        windowContent += '</head>';
        windowContent += '<body>';
        windowContent += `<img src="${dataUrl}">`;
        windowContent += '</body>';
        windowContent += '</html>';
        const printWin = window.open('', '', 'width=600,height=400');
        printWin.document.open();
        printWin.document.write(windowContent);
        printWin.document.close();
        printWin.focus();
        printWin.onload = function () {
            printWin.print();
            printWin.onafterprint = function () {
                printWin.close();
            };
        };
    }

    function newCanvas() {
        if (confirm('Are you sure you want to create a new canvas? Unsaved changes will be lost.')) {
            actions = [];
            undoStack = [];
            redrawCanvas();
        }
    }

    function shareCanvas() {
        if (navigator.share) {
            document.getElementById('canvas').toBlob(blob => {
                const file = new File([blob], 'drawing.png', { type: 'image/png' });
                navigator.share({
                    title: 'My Drawing',
                    files: [file]
                }).catch(console.error);
            });
        } else {
            alert('Sharing is not supported in this browser.');
        }
    }

    function zoomIn() {
        scale *= 1.1;
        redrawCanvas();
    }

    function zoomOut() {
        scale /= 1.1;
        redrawCanvas();
    }
</script>

<style>
    :root {
        --background-color: #fff;
        --text-color: #000;
        --toolbar-color: #f0f0f0;
        --grid-color: #e0e0e0;
        --button-color: #fff;
        --active-button-color: #ddd;
        --border-color: #ddd;
    }

    body {
        background-color: var(--background-color);
        color: var(--text-color);
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
    }

    .dark-mode-toggle {
        position: absolute;
        top: 20px;
        right: 20px;
        background: var(--button-color);
        border: 1px solid var(--border-color);
        padding: 10px;
        cursor: pointer;
    }

    .app {
        display: flex;
        align-items: center;
        justify-content:center;
    }

    .toolbar, .toolbar1 {
        display: flex;
        flex-direction: column;
        background-color: var(--toolbar-color);
        padding: 10px;
        border-left: 1px solid var(--border-color);
    }

    .toolbar button, .toolbar1 button {
        margin: 5px 0;
        padding: 10px;
        border: 1px solid var(--border-color);
        background-color: var(--button-color);
        cursor: pointer;
    }

    .toolbar button.active, .toolbar1 button.active {
        background-color: var(--active-button-color);
    }

    .drawing-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding:5px;
    }

    .controls {
        display: flex;
        flex-direction: row;
        padding: 10px;
        background-color: var(--toolbar-color);
        border: 1px solid var(--border-color);
        margin-bottom: 20px;
    }

    canvas {
        border: 1px solid var(--text-color);
    }
</style>
<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden rounded-lg">
<div class="app">
    <div class="toolbar1" style="margin-right:1%;">
		<button on:click="{() => currentTool = 'line'}" class:active="{currentTool === 'line'}">Line</button>
		<button on:click="{() => currentTool = 'rectangle'}" class:active="{currentTool === 'rectangle'}">Rectangle</button>
		<button on:click="{() => currentTool = 'circle'}" class:active="{currentTool === 'circle'}">Circle</button>
		<button on:click="{() => currentTool = 'curve'}" class:active="{currentTool === 'curve'}">Curve</button>
		<button on:click="{() => currentTool = 'arrow'}" class:active="{currentTool === 'arrow'}">Arrow</button>
		<button on:click="{() => currentTool = 'freehand'}" class:active="{currentTool === 'freehand'}">Freehand</button>
		<button on:click="{() => currentTool = 'text'}" class:active="{currentTool === 'text'}">Text</button>
    </div>
    <div class="drawing-container">
        <div class="controls">
            <div>
                <label>Color: <input type="color" bind:value={color}></label>
            </div>
            <div>
                <label>Line Width: <input type="number" min="1" max="10" bind:value={lineWidth}></label>
            </div>
        </div>

        <canvas id="canvas" width="800" height="700" on:mousedown={startDrawing} on:mouseup={stopDrawing} on:mousemove={draw}></canvas>
    </div>
  
    <div class="toolbar" style="margin-left:1%;">
        <button on:click={newCanvas}>New</button>
        <button on:click={saveCanvas}>Save</button>
        <button on:click={printCanvas}>Print</button>
        <button on:click={shareCanvas}>Share</button>
        <button on:click={undo}>Undo</button>
        <button on:click={redo}>Redo</button>
        <button on:click={zoomIn}>Zoom In</button>
        <button on:click={zoomOut}>Zoom Out</button>
    </div>
</div>
</div>
