<script>
    import { onMount } from 'svelte';
    import { navigate } from 'svelte-routing';
    import { gridStore, wordsStore } from './gridStore';

    onMount(() => {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://site-assets.fontawesome.com/releases/v6.4.2/css/all.css';
        document.head.appendChild(link);
    });

    export let gridSize = 10;
    let words = [];
    let word = '';
    let grid = [];
    let isHighlighting = false;

    function addWord() {
        if (word && words.length < gridSize) {
            words = [...words, word.toUpperCase()];
            word = '';
            generateGrid();
        }
    }

    function removeWord(index) {
        words = words.filter((_, i) => i !== index);
        generateGrid();
    }

    function generateGrid() {
        grid = Array.from({ length: gridSize }, () => Array(gridSize).fill({ letter: '', highlight: false }));
        words.forEach(placeWord);
        fillEmptySpaces();
        if (isHighlighting) {
            highlightWords();
        }
        gridStore.set(grid);
        wordsStore.set(words);
    }

    function placeWord(word) {
        const directions = [
            { x: 1, y: 0 }, // Horizontal
            { x: 0, y: 1 }, // Vertical
            { x: 1, y: 1 }, // Diagonal down-right
            { x: 1, y: -1 } // Diagonal up-right
        ];

        let placed = false;
        while (!placed) {
            const direction = directions[Math.floor(Math.random() * directions.length)];
            const startX = Math.floor(Math.random() * gridSize);
            const startY = Math.floor(Math.random() * gridSize);

            if (canPlaceWord(word, startX, startY, direction)) {
                for (let i = 0; i < word.length; i++) {
                    grid[startY + i * direction.y][startX + i * direction.x] = { letter: word[i], highlight: false };
                }
                placed = true;
            }
        }
    }

    function canPlaceWord(word, startX, startY, direction) {
        for (let i = 0; i < word.length; i++) {
            const x = startX + i * direction.x;
            const y = startY + i * direction.y;
            if (x < 0 || x >= gridSize || y < 0 || y >= gridSize || (grid[y][x].letter && grid[y][x].letter !== word[i])) {
                return false;
            }
        }
        return true;
    }

    function fillEmptySpaces() {
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (!grid[y][x].letter) {
                    grid[y][x] = { letter: String.fromCharCode(65 + Math.floor(Math.random() * 26)), highlight: false };
                }
            }
        }
    }

    function refresh() {
        generateGrid();
    }

    function play() {
        if (words.length > 0) {
            navigate('/puzzle-maker/wordsearch/play');
        } else {
            alert('Please add at least one word before playing.');
        }
    }

    function toggleHighlightWords() {
        isHighlighting = !isHighlighting;
        if (isHighlighting) {
            highlightWords();
        } else {
            removeHighlights();
        }
    }

    function highlightWords() {
        words.forEach(word => {
            const directions = [
                { x: 1, y: 0 }, // Horizontal
                { x: 0, y: 1 }, // Vertical
                { x: 1, y: 1 }, // Diagonal down-right
                { x: 1, y: -1 } // Diagonal up-right
            ];

            let highlighted = false;

            for (let y = 0; y < gridSize && !highlighted; y++) {
                for (let x = 0; x < gridSize && !highlighted; x++) {
                    directions.forEach(direction => {
                        if (!highlighted && canPlaceWord(word, x, y, direction)) {
                            for (let i = 0; i < word.length; i++) {
                                grid[y + i * direction.y][x + i * direction.x].highlight = true;
                            }
                            highlighted = true;
                        }
                    });
                }
            }
        });
    }

    function removeHighlights() {
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                if (grid[y][x].highlight) {
                    grid[y][x].highlight = false;
                }
            }
        }
    }

    onMount(() => {
        generateGrid();
    });
</script>

<style>
    .container {
        display: flex;
        justify-content: space-between;
        padding: 20px;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(var(--grid-size), 1fr);
        grid-gap: 1px;
        max-width: 100%;
        margin-left: 100px;
        margin-top: 10px;
    }

    .grid .cell {
        background-color: #fff; /* Background color of the cell */
        color: #000; /* Text color of the cell */
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid #ccc; /* Border color and style */
    }

    .grid .cell.highlight {
        background-color: yellow; /* Highlight color */
    }

    .refresh-container button:hover i,
    .toggle-button-container button:hover i,
    .play-container button:hover i,
    .bg-red-500:hover i {
        transform: scale(1.2); /* Increase size by 20% */
        transition: transform 0.2s; /* Smooth transition */
    }

    .bg-green-500:hover {
        background-color: #04875e; 
    }

    .bg-blue-500:hover{
        background-color:#2563eb ;
    }

    .card {
        padding: 15px;
        margin-top: 4%;
    }

    .scrollable {
        max-height: 280px; /* Set the maximum height */
        overflow-y: auto; /* Enable vertical scrolling */
    }
</style>

<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
    <main>
        <div class="container">
            <div class="pl-2" style="margin-bottom: 20px;">
                <input type="text" bind:value={word} placeholder="Enter a word" class="bg-gray-200 border p-2 w-full mb-2" />
                <button on:click={addWord} class="bg-blue-500 text-white px-4 py-2 text-left pl-2">Add Word</button>
                <div class="scrollable">
                    <ul class="mt-4">
                        {#each words as w, index}
                            <li class="bg-gray-200 flex justify-between items-center mt-2">
                                <span class="ml-2">{w}</span>
                                <button on:click={() => removeWord(index)} class="bg-red-500 text-white px-2 py-1"><i class="fa-regular fa-trash fa-lg"></i></button>
                            </li>
                        {/each}
                    </ul>
                </div>
            </div>
            
            <div class="w-1 pl-80 mt-1">
                <div class="play-container" style="margin-top: -24px; margin-left: 320px;">
                    <button on:click={play} class="bg-green-500 text-white px-8 py-2">
                        <i class="fa-solid fa-circle-play fa-lg"></i>
                    </button>
                </div>
                <div class="refresh-container" style="margin-top: -40px; margin-left: 120px;">
                    <button on:click={refresh} class="bg-green-500 text-white px-8 py-2">
                        <i class="fa-regular fa-arrows-rotate fa-lg"></i>
                    </button>
                </div>
                <div class="toggle-button-container" style="margin-top: -40px; margin-left: 220px;">
                    <button on:click={toggleHighlightWords} class="bg-green-500 text-white px-8 py-2">
                        {#if isHighlighting}
                            <i class="fa-regular fa-eye-slash fa-lg"></i>
                        {:else}
                            <i class="fa-regular fa-eye fa-lg"></i>
                        {/if}
                    </button>
                </div>
                <div class="grid" style="--grid-size: {gridSize};">
                    {#each grid as row}
                        {#each row as cell}
                            <div class="cell w-8 h-8 {cell.highlight ? 'highlight' : ''}">{cell.letter}</div>
                        {/each}
                    {/each}
                </div>
            </div>
        </div>
    </main>
</div>
