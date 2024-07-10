<script>
  export let words = [];
  export let deleteWord;
  export let startEdit;

  const gridSize = 15;
  let grid = Array(gridSize)
    .fill(null)
    .map(() => Array(gridSize).fill(null));
  let highlightedCells = [];
  let wordStartPositions = [];

  function isValidPosition(word, row, col, direction) {
    if (direction === "across") {
      if (col + word.length > gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row][col + i] !== null && grid[row][col + i] !== word[i])
          return false;
      }
    } else {
      if (row + word.length > gridSize) return false;
      for (let i = 0; i < word.length; i++) {
        if (grid[row + i][col] !== null && grid[row + i][col] !== word[i])
          return false;
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
        highlightedCells.push({
          row: startRow,
          col: startCol,
          length: word.length,
          direction,
        });
        for (let i = 0; i < word.length; i++) {
          if (direction === "across") {
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
    grid = Array(gridSize)
      .fill(null)
      .map(() => Array(gridSize).fill(null));
    highlightedCells = [];
    wordStartPositions = [];
    words.forEach((wordObj, index) => placeWord(wordObj, index + 1));
  }
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://site-assets.fontawesome.com/releases/v6.4.2/css/all.css"
  />
</svelte:head>

<div class="crossword-container">
  <div class="crossword-grid">
    {#each grid as row, rowIndex}
      <div class="row">
        {#each row as cell, colIndex}
          <div
            class="cell {highlightedCells.find(
              (c) =>
                (c.row === rowIndex &&
                  c.direction === 'across' &&
                  colIndex >= c.col &&
                  colIndex < c.col + c.length) ||
                (c.col === colIndex &&
                  c.direction === 'down' &&
                  rowIndex >= c.row &&
                  rowIndex < c.row + c.length),
            )
              ? 'highlight'
              : ''}"
          >
            {#if wordStartPositions.find((p) => p.row === rowIndex && p.col === colIndex)}
              <span class="index"
                >{wordStartPositions.find(
                  (p) => p.row === rowIndex && p.col === colIndex,
                ).index}</span
              >
            {/if}
            &nbsp;
          </div>
        {/each}
      </div>
    {/each}
  </div>

  <div class="hints">
    {#each words as { word, description, direction }, index}
      <div class="hint-item">
        <p>{index + 1}. {description} ({direction})</p>
        <div class="hint-actions">
          <i class="fa-solid fa-pen-to-square edit-icon" on:click={() => startEdit(index)}></i>
          <i class="fa-solid fa-trash delete-icon" on:click={() => deleteWord(index)}></i>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .crossword-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .crossword-grid {
    display: grid;
    gap: 2px;
    border: 2px solid #333;
    padding: 10px;
    background-color: #f0f0f0;
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
    background-color: #ffd54f;
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
    max-width: 480px;
    width: 100%;
    background-color: #1e1e2f;
    border-radius: 10px;
    padding: 15px;
    color: white;
  }

  .hint-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 0;
    background-color: #2e2e3f;
    padding: 10px;
    border-radius: 5px;
    transition: background-color 0.3s ease;
  }

  .hint-item:hover {
    background-color: #3e3e4f;
  }

  .hints p {
    margin: 0;
    color: white;
    font-size: 1em;
  }

  .hint-actions {
    display: flex;
    gap: 10px;
  }

  .edit-icon,
  .delete-icon {
    padding: 5px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
    color: white;
    font-size: 1.2em;
  }

  .edit-icon {
    background-color: #ff9800;
  }

  .edit-icon:hover {
    background-color: #fb8c00;
  }

  .delete-icon {
    background-color: #f44336;
  }

  .delete-icon:hover {
    background-color: #e53935;
  }
</style>
