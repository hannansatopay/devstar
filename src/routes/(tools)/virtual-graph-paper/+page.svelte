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
    let darkMode = false;
    let scale = 1;
    let panX = 0;
    let panY = 0;

    function startDrawing(event) {
        drawing = true;
        const rect = event.target.getBoundingClientRect();
        startX = (event.clientX - rect.left - panX) / scale;
        startY = (event.clientY - rect.top - panY) / scale;
    }

    function stopDrawing(event) {
        if (!drawing) return;
        drawing = false;
        const rect = event.target.getBoundingClientRect();
        const endX = (event.clientX - rect.left - panX) / scale;
        const endY = (event.clientY - rect.top - panY) / scale;
        actions.push({ tool: currentTool, startX, startY, endX, endY, color, lineWidth });
        undoStack = [];
        redrawCanvas();
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
        }
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

    function drawActions() {
        actions.forEach(action => {
            ctx.lineWidth = action.lineWidth;
            ctx.strokeStyle = action.color;
            ctx.beginPath();
            ctx.moveTo(action.startX, action.startY);

            if (action.tool === 'line') {
                ctx.lineTo(action.endX, action.endY);
            } else if (action.tool === 'rectangle') {
                ctx.strokeRect(action.startX, action.startY, action.endX - action.startX, action.endY - action.startY);
            } else if (action.tool === 'circle') {
                const radius = Math.sqrt(Math.pow(action.endX - action.startX, 2) + Math.pow(action.endY - action.startY, 2));
                ctx.arc(action.startX, action.startY, radius, 0, Math.PI * 2);
            }
            ctx.stroke();
        });
    }

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
        windowContent += '<head><title>Print canvas</title></head>';
        windowContent += '<body>';
        windowContent += `<img src="${dataUrl}">`;
        windowContent += '</body>';
        windowContent += '</html>';
        const printWin = window.open('', '', 'width=600,height=400');
        printWin.document.open();
        printWin.document.write(windowContent);
        printWin.document.close();
        printWin.focus();
        printWin.print();
        printWin.close();
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
        align-items: flex-start;
    }

    .toolbar, .toolbar1 {
        display: flex;
        flex-direction: column;
        background-color: var(--toolbar-color);
        padding: 10px;
        border-left: 1px solid var(--border-color);
        margin-left: 10px;
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

<div class="app">
    <div class="drawing-container">
        <div class="controls">
            <div>
                <label>Color: <input type="color" bind:value={color}></label>
            </div>
            <div>
                <label>Line Width: <input type="number" min="1" max="10" bind:value={lineWidth}></label>
            </div>
        </div>

        <canvas id="canvas" width="1000" height="800" on:mousedown={startDrawing} on:mouseup={stopDrawing} on:mousemove={draw}></canvas>
    </div>
    <div class="toolbar">
        <button on:click={newCanvas}>New</button>
        <button on:click={saveCanvas}>Save</button>
        <button on:click={printCanvas}>Print</button>
        <button on:click={shareCanvas}>Share</button>
        <button on:click={undo}>Undo</button>
        <button on:click={redo}>Redo</button>
        <button on:click={zoomIn}>Zoom In</button>
        <button on:click={zoomOut}>Zoom Out</button>
    </div>
    <div class="toolbar1">
        <button class:active={currentTool === 'line'} on:click={() => currentTool = 'line'}>🖉</button>
        <button class:active={currentTool === 'rectangle'} on:click={() => currentTool = 'rectangle'}>▭</button>
        <button class:active={currentTool === 'circle'} on:click={() => currentTool = 'circle'}>◯</button>
    </div>
</div>
