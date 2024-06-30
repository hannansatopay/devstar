<script>
  export let words = [];

  const gridSize = 15;
  let grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
  let highlightedCells = [];
  let wordStartPositions = [];

  function isValidPosition(word, row, col, direction) {
    if (direction === 'across') {
      if (col + word.length > gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row][col + i] !== null && grid[row][col + i] !== word[i]) return false;
      }
    } else {
      if (row + word.length > gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row + i][col] !== null && grid[row + i][col] !== word[i]) return false;
      }
    }
    return true;
  }

  function placeWord(wordObj, index) {
    const { word, direction } = wordObj;
    let placed = false;

    for (let attempts = 0; attempts < 100 && !placed; attempts++) {
      const startRow = Math.floor(Math.random() * gridSize);
      const startCol = Math.floor(Math.random() * gridSize);

      if (isValidPosition(word, startRow, startCol, direction)) {
        wordStartPositions.push({ row: startRow, col: startCol, index });
        highlightedCells.push({ row: startRow, col: startCol, length: word.length, direction });
        for (let i = 0; i < word.length; i++) {
          if (direction === 'across') {
            grid[startRow][startCol + i] = word[i];
          } else {
            grid[startRow + i][startCol] = word[i];
          }
        }
        placed = true;
      }
    }

    if (!placed) {
      console.error(`Could not place word: ${word}`);
    }
  }

  $: {
    grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    highlightedCells = [];
    wordStartPositions = [];
    words.forEach((wordObj, index) => placeWord(wordObj, index + 1));
  }
</script>

<div class="crossword-grid">
  {#each grid as row, rowIndex}
    <div class="row">
      {#each row as cell, colIndex}
        <div class="cell {highlightedCells.find(c => (c.row === rowIndex && c.direction === 'across' && colIndex >= c.col && colIndex < c.col + c.length) || (c.col === colIndex && c.direction === 'down' && rowIndex >= c.row && rowIndex < c.row + c.length)) ? 'highlight' : ''}">
          {#if wordStartPositions.find(p => p.row === rowIndex && p.col === colIndex)}
            <span class="index">{wordStartPositions.find(p => p.row === rowIndex && p.col === colIndex).index}</span>
          {/if}
          &nbsp;
        </div>
      {/each}
    </div>
  {/each}
</div>

<div class="hints">
  {#each words as { word, description, direction }, index}
    <p>{index + 1}. {description} ({direction})</p>
  {/each}
</div>

<style>
  .crossword-grid {
    display: grid;
    gap: 2px;
    margin: 20px auto;
    border: 2px solid #333;
    padding: 10px;
    background-color: #f9f9f9;
    max-width: 480px;
  }
  .row {
    display: flex;
  }
  .cell {
    width: 30px;
    height: 30px;
    border: 1px solid #333;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    font-size: 1.2em;
    background-color: #fff;
    transition: background-color 0.3s;
  }
  .highlight {
    background-color: #ffeb3b;
  }
  .index {
    position: absolute;
    top: 2px;
    left: 2px;
    font-size: 0.7em;
    color: #333;
  }
  .hints {
    margin-top: 20px;
    text-align: left;
  }
  .hints p {
    margin: 5px 0;
    color: white;
  }
</style>