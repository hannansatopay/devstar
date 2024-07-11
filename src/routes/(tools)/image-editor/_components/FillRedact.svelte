<script>
    let canvas;
    let ctx;
    let img = new Image();
    let imgLoaded = false;
    let history = [];
    let historyIndex = -1;
    let isDrawing = false;
    let startX, startY;
    let currentTool = 'fill';

    function handleFileUpload(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                imgLoaded = true;
                saveState();
            }
            img.src = e.target.result;
        }
        reader.readAsDataURL(file);
    }

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
        startX = event.clientX - rect.left;
        startY = event.clientY - rect.top;
    }

    function draw(event) {
        if (!isDrawing) return;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = currentTool === 'fill' ? 'rgba(0, 255, 0, 0.5)' : 'black';
        ctx.fillRect(startX, startY, x - startX, y - startY);
    }

    function stopDrawing(event) {
        if (!isDrawing) return;
        isDrawing = false;
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        ctx.fillStyle = currentTool === 'fill' ? 'rgba(0, 255, 0, 0.5)' : 'black';
        ctx.fillRect(startX, startY, x - startX, y - startY);
        saveState();
    }

    $: if (canvas) {
        ctx = canvas.getContext('2d');
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
    #fill{
    background-color: cadetblue;
    padding:5px;
    word-spacing:10px;
    }
    #redact{
    background-color: cadetblue;
    padding:5px;
    word-spacing:10px;
    }
    #undo{
    background-color: cadetblue;
    padding:5px;
    word-spacing:10px;
    }
    #save{
    background-color: cadetblue;
    padding:5px;
    word-spacing:10px;
    }
    canvas{
        background-color: rgb(232, 217, 196);
    }
    .editor{
    font-size:40px;
    margin-top:-40px;
    color:cadetblue;
    }
</style>

<div class="editor-container bg-inherit">
    <input type="file" accept="image/*" on:change="{handleFileUpload}"><br><br>
    <canvas bind:this="{canvas}" id="imageEditor" width="500" height="500"
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