<script>
    export let image;
    let canvas;
    let ctx;
    let img = new Image();
    let imgLoaded = false;
    let history = [];
    let historyIndex = -1;
    let isDrawing = false;
    let startX, startY;
    let currentTool = 'fill';
    let imgX, imgY, imgWidth, imgHeight;

    function saveState() {
        if (historyIndex < history.length - 1) {
            history = history.slice(0, historyIndex + 1);
        }
        history.push(canvas.toDataURL());
        historyIndex++;
    }

    function undo() {
        if (historyIndex <= 0) return;
        historyIndex--;
        let canvasPic = new Image();
        canvasPic.src = history[historyIndex];
        canvasPic.onload = function() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(canvasPic, 0, 0, canvas.width, canvas.height);
        }
    }

    function saveImage() {
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = canvas.toDataURL();
        link.click();
    }

    function startDrawing(event) {
        if (!imgLoaded) {
            alert('Please upload an image first.');
            return;
        }
        isDrawing = true;
        const rect = canvas.getBoundingClientRect();
        startX = (event.clientX - rect.left) * (canvas.width / rect.width);
        startY = (event.clientY - rect.top) * (canvas.height / rect.height);
    }

    function draw(event) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * (canvas.width / rect.width);
        const y = (event.clientY - rect.top) * (canvas.height / rect.height);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        fitImageOnCanvas(img, ctx, canvas);
        ctx.fillStyle = currentTool === 'fill' ? 'rgba(0, 255, 0, 0.5)' : 'black';
        drawRectangle(startX, startY, x, y);
    }

    function stopDrawing(event) {
        if (!isDrawing) return;
        isDrawing = false;
        const rect = canvas.getBoundingClientRect();
        const x = (event.clientX - rect.left) * (canvas.width / rect.width);
        const y = (event.clientY - rect.top) * (canvas.height / rect.height);
        ctx.fillStyle = currentTool === 'fill' ? 'rgba(0, 255, 0, 0.5)' : 'black';
        drawRectangle(startX, startY, x, y);
        saveState();
    }

    function drawRectangle(startX, startY, endX, endY) {
        let x = Math.min(startX, endX);
        let y = Math.min(startY, endY);
        let width = Math.abs(startX - endX);
        let height = Math.abs(startY - endY);
        if (
            x < imgX + imgWidth &&
            x + width > imgX &&
            y < imgY + imgHeight &&
            y + height > imgY
        ) {
            x = Math.max(x, imgX);
            y = Math.max(y, imgY);
            width = Math.min(width, imgX + imgWidth - x);
            height = Math.min(height, imgY + imgHeight - y);
            ctx.fillRect(x, y, width, height);
        }
    }

    function fitImageOnCanvas(image, context, canvas) {
        let ratio = Math.min(canvas.width / image.width, canvas.height / image.height);
        imgWidth = image.width * ratio;
        imgHeight = image.height * ratio;
        imgX = (canvas.width - imgWidth) / 2;
        imgY = (canvas.height - imgHeight) / 2;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, image.width, image.height, imgX, imgY, imgWidth, imgHeight);
    }

    $: if (canvas && image) {
        ctx = canvas.getContext('2d');
        img.src = image;
        img.onload = function() {
            if (canvas) {
                canvas.width = 500; // Set your desired canvas width
                canvas.height = 500; // Set your desired canvas height
                fitImageOnCanvas(img, ctx, canvas);
                imgLoaded = true;
                saveState();
            }
        }
    }
</script>

<style>
    .editor-container {
        text-align: center;
        margin-top: 20px;
    }
    #imageEditor {
        border: 1px solid #ccc;
        display: block;
        margin: 0 auto;
    }
    .buttons {
        margin-top: 10px;
    }
    .buttons button {
        margin-right: 5px;
    }
    #fill {
        background-color: cadetblue;
        padding: 5px;
        word-spacing: 10px;
    }
    #redact {
        background-color: cadetblue;
        padding: 5px;
        word-spacing: 10px;
    }
    #undo {
        background-color: cadetblue;
        padding: 5px;
        word-spacing: 10px;
    }
    #save {
        background-color: cadetblue;
        padding: 5px;
        word-spacing: 10px;
    }
    canvas {
        background-color: rgb(232, 217, 196);
    }
    .editor {
        font-size: 40px;
        margin-top: -40px;
        color: cadetblue;
    }
</style>

<div class="editor-container bg-inherit">
    <canvas bind:this="{canvas}" id="imageEditor"
        on:mousedown="{startDrawing}"
        on:mousemove="{draw}"
        on:mouseup="{stopDrawing}"
        on:mouseleave="{stopDrawing}">
    </canvas>
    <div class="buttons">
        <button id="fill" on:click="{() => currentTool = 'fill'}">Fill</button>
        <button id="redact" on:click="{() => currentTool = 'redact'}">Redact</button>
        <button id="undo" on:click="{undo}">Undo</button>
        <button id="save" on:click="{saveImage}">Save</button>
    </div>
</div>
