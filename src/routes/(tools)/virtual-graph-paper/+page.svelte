<script>
    import { onMount } from "svelte";

    let ctx;
    let drawing = false;
    let startX, startY;
    let currentTool = "line";
    let strokeColor = "#00bfff";
    let lineWidth = 2;
    let actions = [];
    let undoStack = [];
    let scale = 1;
    let panX = 0;
    let panY = 0;
    let fillColor = "#ff00ff";
    let fill = false;
    let dashedStroke = false;
    let roundCorners = false;
    let cornerRadius = 50;

    let currentFreehandPoints = [];
    let controlPoint = null;

    function startDrawing(event) {
        drawing = true;
        const rect = event.target.getBoundingClientRect();
        startX = (event.clientX - rect.left - panX) / scale;
        startY = (event.clientY - rect.top - panY) / scale;

        if (currentTool === "freehand") {
            currentFreehandPoints = [{ x: startX, y: startY }];
        } else if (currentTool === "curve") {
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
        ctx.strokeStyle = strokeColor;
        ctx.fillStyle = fillColor;
        ctx.lineCap = "round";

        if (dashedStroke) {
            ctx.setLineDash([5, 5]); // Array represents dash pattern: [dashLength, gapLength]
        } else {
            ctx.setLineDash([]); // Set to an empty array to reset to solid line
        }

        if (currentTool === "line") {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (currentTool === "rectangle") {
            ctx.beginPath();
            if (roundCorners) {
                const width = x - startX;
                const height = y - startY;
                const radius = cornerRadius;
                ctx.moveTo(startX + radius, startY);
                ctx.arcTo(x, startY, x, startY + radius, radius);
                ctx.arcTo(x, y, x - radius, y, radius);
                ctx.arcTo(startX, y, startX, y - radius, radius);
                ctx.arcTo(startX, startY, startX + radius, startY, radius);
                ctx.closePath();
            } else {
                ctx.rect(startX, startY, x - startX, y - startY);
            }
            ctx.stroke();
            if (fill) {
                ctx.fill();
            }
        } else if (currentTool === "circle") {
            ctx.beginPath();
            const radius = Math.sqrt(
                Math.pow(x - startX, 2) + Math.pow(y - startY, 2),
            );
            ctx.arc(startX, startY, radius, 0, Math.PI * 2);
            ctx.stroke();
        } else if (currentTool === "curve") {
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, x, y);
            ctx.stroke();
        } else if (currentTool === "arrow") {
            const headlen = 10;
            const angle = Math.atan2(y - startY, x - startX);
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(x, y);
            ctx.lineTo(
                x - headlen * Math.cos(angle - Math.PI / 6),
                y - headlen * Math.sin(angle - Math.PI / 6),
            );
            ctx.moveTo(x, y);
            ctx.lineTo(
                x - headlen * Math.cos(angle + Math.PI / 6),
                y - headlen * Math.sin(angle + Math.PI / 6),
            );
            ctx.stroke();
        } else if (currentTool === "freehand") {
            currentFreehandPoints.push({ x, y });
            ctx.beginPath();
            for (let i = 0; i < currentFreehandPoints.length - 1; i++) {
                ctx.moveTo(
                    currentFreehandPoints[i].x,
                    currentFreehandPoints[i].y,
                );
                ctx.lineTo(
                    currentFreehandPoints[i + 1].x,
                    currentFreehandPoints[i + 1].y,
                );
            }
            ctx.stroke();
        }
        if (showGrid) {
            drawGrid();
        }
    }

    function stopDrawing(event) {
        if (!drawing) return;
        drawing = false;
        const rect = event.target.getBoundingClientRect();
        const endX = (event.clientX - rect.left - panX) / scale;
        const endY = (event.clientY - rect.top - panY) / scale;

        if (currentTool === "freehand") {
            actions.push({
                tool: "freehand",
                points: currentFreehandPoints,
                strokeColor,
                fillColor,
                lineWidth,
                fill,
                dashedStroke,
                roundCorners,
            });
        } else if (currentTool === "text") {
            const text = prompt("Enter text:");
            if (text) {
                actions.push({
                    tool: "text",
                    startX,
                    startY,
                    text,
                    strokeColor,
                    fillColor,
                    lineWidth,
                    fill,
                    dashedStroke,
                    roundCorners,
                });
            }
        } else if (currentTool === "curve") {
            actions.push({
                tool: "curve",
                startX,
                startY,
                controlX: controlPoint.x,
                controlY: controlPoint.y,
                endX,
                endY,
                strokeColor,
                fillColor,
                lineWidth,
                fill,
                dashedStroke,
                roundCorners,
            });
        } else if (currentTool === "line") {
            actions.push({
                tool: "line",
                startX,
                startY,
                endX,
                endY,
                strokeColor,
                fillColor,
                lineWidth,
                fill,
                dashedStroke,
                roundCorners,
            });
        } else {
            actions.push({
                tool: currentTool,
                startX,
                startY,
                endX,
                endY,
                strokeColor,
                fillColor,
                lineWidth,
                fill,
                dashedStroke,
                roundCorners,
            });
        }
        if (currentTool === "fill") {
            actions.push({ tool: "fill", startX, startY, color });
            fillShape(endX, endY);
        }

        undoStack = [];
        redrawCanvas();
    }

    function drawActions() {
        actions.forEach((action) => {
            ctx.lineWidth = action.lineWidth;
            ctx.strokeStyle = action.strokeColor;
            ctx.fillStyle = action.fillColor;
            ctx.beginPath();

            if (action.dashedStroke) {
                ctx.setLineDash([5, 5]); // Array represents dash pattern: [dashLength, gapLength]
            } else {
                ctx.setLineDash([]); // Set to an empty array to reset to solid line
            }

            if (action.tool === "line") {
                ctx.moveTo(action.startX, action.startY);
                ctx.lineTo(action.endX, action.endY);
            } else if (action.tool === "rectangle") {
                ctx.beginPath();
                if (action.roundCorners) {
                    const width = action.endX - action.startX;
                    const height = action.endY - action.startY;
                    const radius = cornerRadius;
                    ctx.moveTo(action.startX + radius, action.startY);
                    ctx.arcTo(
                        action.endX,
                        action.startY,
                        action.endX,
                        action.startY + radius,
                        radius,
                    );
                    ctx.arcTo(
                        action.endX,
                        action.endY,
                        action.endX - radius,
                        action.endY,
                        radius,
                    );
                    ctx.arcTo(
                        action.startX,
                        action.endY,
                        action.startX,
                        action.endY - radius,
                        radius,
                    );
                    ctx.arcTo(
                        action.startX,
                        action.startY,
                        action.startX + radius,
                        action.startY,
                        radius,
                    );
                    ctx.closePath();
                } else {
                    ctx.rect(
                        action.startX,
                        action.startY,
                        action.endX - action.startX,
                        action.endY - action.startY,
                    );
                }
                ctx.stroke();
                if (action.fill) {
                    ctx.fill();
                }
            } else if (action.tool === "circle") {
                const radius = Math.sqrt(
                    Math.pow(action.endX - action.startX, 2) +
                        Math.pow(action.endY - action.startY, 2),
                );
                ctx.arc(action.startX, action.startY, radius, 0, Math.PI * 2);
                if (action.fill) {
                    ctx.fill();
                }
            } else if (action.tool === "curve") {
                ctx.moveTo(action.startX, action.startY);
                ctx.quadraticCurveTo(
                    action.controlX,
                    action.controlY,
                    action.endX,
                    action.endY,
                );
                if (action.fill) {
                    ctx.fill();
                }
            } else if (action.tool === "arrow") {
                const headlen = 10; // length of head in pixels
                const angle = Math.atan2(
                    action.endY - action.startY,
                    action.endX - action.startX,
                );
                ctx.moveTo(action.startX, action.startY);
                ctx.lineTo(action.endX, action.endY);
                ctx.lineTo(
                    action.endX - headlen * Math.cos(angle - Math.PI / 6),
                    action.endY - headlen * Math.sin(angle - Math.PI / 6),
                );
                ctx.moveTo(action.endX, action.endY);
                ctx.lineTo(
                    action.endX - headlen * Math.cos(angle + Math.PI / 6),
                    action.endY - headlen * Math.sin(angle + Math.PI / 6),
                );
                ctx.stroke();
            } else if (action.tool === "freehand") {
                for (let i = 0; i < action.points.length - 1; i++) {
                    ctx.moveTo(action.points[i].x, action.points[i].y);
                    ctx.lineTo(action.points[i + 1].x, action.points[i + 1].y);
                }
                ctx.stroke();
            } else if (action.tool === "text") {
                ctx.font = `${action.lineWidth * 10}px Arial`;
                ctx.fillText(action.text, action.startX, action.startY);
            }

            ctx.stroke();
            ctx.closePath();
        });
        if (showGrid) {
            drawGrid();
        }
    }

    function isShapeClosed(action) {
        if (action.tool === "freehand") {
            const startPoint = action.points[0];
            const endPoint = action.points[action.points.length - 1];
            const distance = Math.sqrt(
                Math.pow(endPoint.x - startPoint.x, 2) +
                    Math.pow(endPoint.y - startPoint.y, 2),
            );
            return distance < 10; // A small threshold to consider the shape closed
        }
        if (
            action.tool === "line" ||
            action.tool === "rectangle" ||
            action.tool === "circle" ||
            action.tool === "curve"
        ) {
            return true; // Consider these shapes always closed
        }
        return false;
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
        ctx = document.getElementById("canvas").getContext("2d");
        redrawCanvas();
    });

    function drawGrid(ctx) {
        const width = ctx.canvas.width / scale;
        const height = ctx.canvas.height / scale;
        const step = 20;

        ctx.strokeStyle = getComputedStyle(
            document.documentElement,
        ).getPropertyValue("--grid-color");
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

    function fillShape(x, y) {
        const imageData = ctx.getImageData(
            0,
            0,
            ctx.canvas.width,
            ctx.canvas.height,
        );
        const data = imageData.data;
        const stack = [{ x, y }];
        const targetColor = getColorAtPixel(data, x, y);
        const fillColor = hexToRgb(color);

        if (colorsMatch(targetColor, fillColor)) {
            return;
        }

        while (stack.length) {
            const { x, y } = stack.pop();
            const currentColor = getColorAtPixel(data, x, y);

            if (colorsMatch(currentColor, targetColor)) {
                setColorAtPixel(data, x, y, fillColor);

                stack.push({ x: x + 1, y });
                stack.push({ x: x - 1, y });
                stack.push({ x, y: y + 1 });
                stack.push({ x, y: y - 1 });
            }
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function getColorAtPixel(data, x, y) {
        const index = (y * ctx.canvas.width + x) * 4;
        return [data[index], data[index + 1], data[index + 2], data[index + 3]];
    }

    function setColorAtPixel(data, x, y, color) {
        const index = (y * ctx.canvas.width + x) * 4;
        data[index] = color[0];
        data[index + 1] = color[1];
        data[index + 2] = color[2];
        data[index + 3] = 255;
    }

    function colorsMatch(a, b) {
        return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    }

    function hexToRgb(hex) {
        const bigint = parseInt(hex.slice(1), 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return [r, g, b];
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
        const link = document.createElement("a");
        link.download = "drawing.png";
        link.href = document.getElementById("canvas").toDataURL();
        link.click();
    }

    function printCanvas() {
        const dataUrl = document.getElementById("canvas").toDataURL();
        let windowContent = "<!DOCTYPE html>";
        windowContent += "<html>";
        windowContent += "<head><title>Print canvas</title>";
        windowContent += "<style>";
        windowContent +=
            "body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; height: 100vh; }";
        windowContent += "img { max-width: 100%; max-height: 100%; }";
        windowContent += "</style>";
        windowContent += "</head>";
        windowContent += "<body>";
        windowContent += `<img src="${dataUrl}">`;
        windowContent += "</body>";
        windowContent += "</html>";
        const printWin = window.open("", "", "width=600,height=400");
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
        if (
            confirm(
                "Are you sure you want to create a new canvas? Unsaved changes will be lost.",
            )
        ) {
            actions = [];
            undoStack = [];
            redrawCanvas();
        }
    }

    function shareCanvas() {
        if (navigator.share) {
            document.getElementById("canvas").toBlob((blob) => {
                const file = new File([blob], "drawing.png", {
                    type: "image/png",
                });
                navigator
                    .share({
                        title: "My Drawing",
                        files: [file],
                    })
                    .catch(console.error);
            });
        } else {
            alert("Sharing is not supported in this browser.");
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

<div class="container mx-auto p-4 bg-slate-100 font-bold rounded-3xl shadow shadow-red-100">
    <div
        class="mb-4 flex flex-wrap items-center justify-between border border-slate-400 rounded-xl pr-2"
    >
        <div class="space-x-9 flex justify-center items-center p-2">
            <select
                bind:value={currentTool}
                class="bg-gray-200 p-2 rounded-md gap-4 p-3"
            >
                <option value="line">Line</option>
                <option value="rectangle">Rectangle</option>
                <option value="circle">Circle</option>
                <option value="arrow">Arrow</option>
                <option value="freehand">Freehand</option>
                <option value="text">Text</option>
                <option value="curve">Curve</option>
            </select>
            <div>
                <label for="1">Color </label>
                <input
                    id="1"
                    type="color"
                    bind:value={strokeColor}
                    class="bg-gray-200 h-9 w-20 p-2 rounded-md"
                />
            </div>
            <div>
                <label for="2">FillColor</label>
                <input
                id={2}
                    type="color"
                    bind:value={fillColor}
                    class="bg-gray-200 p-2 h-9 w-20 rounded-md"
                />
            </div>

            <input
                type="number"
                bind:value={lineWidth}
                min="1"
                max="10"
                class="bg-gray-200 p-2 rounded-md"
            />
            <button on:click={undo} class="bg-gray-200 p-2 rounded-md hover:bg-blue-300"
                >Undo</button
            >
            <button on:click={redo} class="bg-gray-200 p-2 rounded-md  hover:bg-blue-300"
                >Redo</button
            >
        </div>
        <div class="space-x-2">
            <button on:click={zoomIn} class="bg-gray-200 p-2 rounded-md hover:bg-blue-300"
                >Zoom In</button
            >
            <button on:click={zoomOut} class="bg-gray-200 p-2 rounded-md hover:bg-blue-300"
                >Zoom Out</button
            >
        </div>
    </div>
    <div class="flex flex-wrap items-center justify-between">
        <div class="space-x-2 flex mb-6 mt-2 gap-5 text-xl">
            <label class="flex items-center">
                <input type="checkbox" bind:checked={fill} class="mr-1" />
                Fill
            </label>
            <label class="flex items-center">
                <input
                    type="checkbox"
                    bind:checked={dashedStroke}
                    class="mr-1"
                />
                Dashed
            </label>
            <label class="flex items-center">
                <input
                    type="checkbox"
                    bind:checked={roundCorners}
                    class="mr-1"
                />
                Round Corners
            </label>
            {#if roundCorners}
                <input
                    type="number"
                    bind:value={cornerRadius}
                    min="1"
                    max="100"
                    class="bg-gray-200 p-2 rounded-md"
                />
            {/if}
        </div>
    </div>
    <div class="relative overflow-hidden w-full h-screen border border-black">
        <canvas
            id="canvas"
            class="absolute top-0 left-0 w-full h-full"
            width="1024"
            height="768"
            on:mousedown={startDrawing}
            on:mousemove={draw}
            on:mouseup={stopDrawing}
            on:wheel={(event) => (event.deltaY < 0 ? zoomIn() : zoomOut())}
            on:contextmenu|preventDefault
        ></canvas>
    </div>
</div>
