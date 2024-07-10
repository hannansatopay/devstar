<script>
    import { onMount } from 'svelte';
    import { gridStore, wordsStore } from './gridStore';
    import { get } from 'svelte/store';
    import { writable } from 'svelte/store';

    let canvas;
    let ctx;
    let grid = [];
    let words = [];
    let cellSize = 40;
    let selectedCells = [];
    let foundWordsCells = [];
    let isDragging = false;
    let foundWords = writable([]);
    let nextHintWordIndex = 0;
    const MAX_HINTS = 3; // Maximum number of hints allowed
    let hintUsageCount = 0; // Initialize hint usage count

    onMount(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://site-assets.fontawesome.com/releases/v6.4.2/css/all.css';
        document.head.appendChild(link);

        grid = get(gridStore);
        words = get(wordsStore);
        foundWords.set(new Array(words.length).fill(false));

        // Clear any highlighted cells when the play page loads
        grid = grid.map(row => row.map(cell => ({ ...cell, highlight: false })));

        canvas.width = grid[0].length * cellSize;
        canvas.height = grid.length * cellSize;
        ctx = canvas.getContext('2d');
        drawGrid();
    });

    function drawGrid() {
        ctx.fillStyle = '#fff';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        grid.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const x = colIndex * cellSize;
                const y = rowIndex * cellSize;
                
                // Draw cell background
                ctx.fillStyle = cell.highlight ? (cell.hint ? '#E5B7B7' : 'yellow') : 'white';
                ctx.fillRect(x, y, cellSize, cellSize);
                
                // Draw cell border
                ctx.strokeStyle = '#ccc';
                ctx.strokeRect(x, y, cellSize, cellSize);
                
                // Draw letter
                ctx.fillStyle = '#000';
                ctx.font = '20px Roboto';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(cell.letter, x + cellSize / 2, y + cellSize / 2);
            });
        });
    }

    function getCellFromCoords(x, y) {
        const row = Math.floor(y / cellSize);
        const col = Math.floor(x / cellSize);
        return { row, col };
    }

    function startDrag(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const { row, col } = getCellFromCoords(x, y);

        isDragging = true;
        selectedCells = [{ row, col }];
        highlightCells();
    }

    function continueDrag(event) {
        if (isDragging) {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const { row, col } = getCellFromCoords(x, y);

            const startCell = selectedCells[0];
            const rowDiff = row - startCell.row;
            const colDiff = col - startCell.col;

            // Check if the movement is diagonal, horizontal, or vertical
            if (Math.abs(rowDiff) === Math.abs(colDiff) || rowDiff === 0 || colDiff === 0) {
                selectedCells = [];
                const steps = Math.max(Math.abs(rowDiff), Math.abs(colDiff));
                for (let i = 0; i <= steps; i++) {
                    const newRow = startCell.row + Math.sign(rowDiff) * i;
                    const newCol = startCell.col + Math.sign(colDiff) * i;
                    selectedCells.push({ row: newRow, col: newCol });
                }
                highlightCells();
            }
        }
    }

    function highlightCells() {
        grid = grid.map((row, rowIndex) => row.map((cell, colIndex) => {
            const isSelected = selectedCells.some(sc => sc.row === rowIndex && sc.col === colIndex);
            const isFound = foundWordsCells.some(fc => fc.row === rowIndex && fc.col === colIndex);
            return { ...cell, highlight: isSelected || isFound, hint: false };
        }));
        drawGrid();
    }

    function endDrag() {
        isDragging = false;
        const word = selectedCells.map(cell => grid[cell.row][cell.col].letter).join('');
        if (words.includes(word)) {
            markWordAsFound(word);
        }
        selectedCells = [];
        highlightCells();
    }

    function markWordAsFound(word) {
        words = words.map((w, index) => {
            if (w === word) {
                foundWords.update(fw => {
                    fw[index] = true;
                    return fw;
                });
                foundWordsCells = [...foundWordsCells, ...selectedCells];
                return `${w} ✓`;
            }
            return w;
        });
    }

    function hint() {
        if (hintUsageCount < MAX_HINTS) {
            let hintWordIndex = getNextHintWordIndex();
            if (hintWordIndex !== -1) {
                const hintWord = words[hintWordIndex].replace(' ✓', '');
                highlightHintWord(hintWord);
                nextHintWordIndex = hintWordIndex + 1; // Update next hint word index
                hintUsageCount++; // Increment hint usage count
            }
        } else {
            alert("You've used up all hints!");
            // Optionally disable the hint button or provide feedback
        }
    }

    function getNextHintWordIndex() {
        for (let i = nextHintWordIndex; i < words.length; i++) {
            if (!get(foundWords)[i]) {
                return i;
            }
        }
        return -1; // Return -1 if all words are found
    }

    function highlightHintWord(word) {
        const wordCells = [];

        // Find the starting cell of the hint word
        grid.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell.letter === word[0]) {
                    const cells = checkWordAtPosition(word, rowIndex, colIndex);
                    if (cells.length === word.length) {
                        wordCells.push(cells[0]); // Only highlight the starting cell
                    }
                }
            });
        });

        // Temporarily highlight the starting cell for the hint word
        selectedCells = wordCells;
        grid = grid.map((row, rowIndex) => row.map((cell, colIndex) => {
            const isSelected = selectedCells.some(sc => sc.row === rowIndex && sc.col === colIndex);
            const isFound = foundWordsCells.some(fc => fc.row === rowIndex && fc.col === colIndex);
            return { ...cell, highlight: isSelected || isFound, hint: isSelected };
        }));
        drawGrid();

        // Reset the highlight after a short delay
        setTimeout(() => {
            selectedCells = [];
            highlightCells();
        }, 1000); // Highlight for 1 second
    }

    function checkWordAtPosition(word, row, col) {
        const directions = [
            { row: 0, col: 1 },  // Horizontal
            { row: 1, col: 0 },  // Vertical
            { row: 1, col: 1 },  // Diagonal down-right
            { row: 1, col: -1 }  // Diagonal down-left
        ];

        for (const direction of directions) {
            const cells = [];
            for (let i = 0; i < word.length; i++) {
                const newRow = row + i * direction.row;
                const newCol = col + i * direction.col;
                if (grid[newRow] && grid[newRow][newCol] && grid[newRow][newCol].letter === word[i]) {
                    cells.push({ row: newRow, col: newCol });
                } else {
                    break;
                }
            }
            if (cells.length === word.length) {
                return cells;
            }
        }
        return [];
    }

    function printPuzzle() {
        window.print();
    }

    function shareLink() {
        if (navigator.share) {
            navigator.share({
                title: 'Word Search Puzzle',
                text: 'Check out this word search puzzle!',
                url: window.location.href
            })
            .catch(error => console.log('Error sharing:', error));
        } else {
            alert('Web Share API is not supported in your browser.');
        }
    }
</script>

<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
    <canvas 
        bind:this={canvas}
        on:mousedown={startDrag}
        on:mousemove={continueDrag}
        on:mouseup={endDrag}
        on:mouseleave={endDrag}
    ></canvas>
    <div class="words-container">
        <h2 class="word-heading text-2xl font-semibold">Words to Find:</h2>
        <ul class="words-list list-disc ml-8 text-white">
            {#each words as w, index}
                <li class="{get(foundWords)[index] ? 'line-through' : ''}">{w}</li>
            {/each}
        </ul>
        <div class="button-container">
            <button on:click={hint}>
                <i class="fa-solid fa-lightbulb-on fa-xl" style="color: yellow; vertical-align: middle;"></i>
                <span class="hint-count">{MAX_HINTS - hintUsageCount}</span> <!-- Display remaining hint count -->
            </button>
            <button on:click={printPuzzle}>
                <i class="fa-solid fa-print fa-xl" style="color: yellow; vertical-align: middle;"></i>
            </button>
            <button on:click={shareLink}>
                <i class="fa-solid fa-share-nodes fa-xl" style="color: yellow; vertical-align: middle;"></i>
            </button>
        </div>
    </div>
</div>

<style>
    .card {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        max-width: 1200px;
        padding: 40px;
        padding-top: 10px;
        margin: auto;
        overflow: hidden;
        border-radius: 8px;
        margin-top: 4%;
    }

    .words-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        margin-top: 30px; /* Adjust the margin-top as needed to move the content up */
    }

    .word-heading {
        background-color: #404A5B;
        color: white;
        padding: 8px 16px;
        margin-bottom: 8px;
        border-radius: 8px;
    }

    .words-list {
        margin-bottom: 16px; /* Adjust as needed */
        padding-left: 0; /* Remove default padding */
    }

    .line-through {
        text-decoration: line-through;
    }

    .button-container {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        margin-top: 90px;
    }

    .button-container button {
        background-color: #404A5B;
        color: white;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        border-radius: 8px;
        font-size: 16px;
        margin-right: 8px; /* Adjust spacing between buttons */
        position: relative; /* Position relative for .hint-count */
    }

    .button-container button:hover {
        background-color: #505A6B;
    }

    .button-container button:hover i {
        transform: scale(1.2);
        transition: transform 0.2s;
    }

    .hint-count {
        position: absolute;
        top: -10px;
        right: -5px;
        background-color: yellow;
        color: black;
        padding: 4px;
        border-radius: 50%;
        font-size: 12px;
        font-weight: bold;
    }
</style>
