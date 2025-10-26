<script lang="ts">
  import { onMount } from "svelte";

  type Grid = number[][];

  const difficultySettings = {
    easy: 36,
    medium: 45,
    hard: 54,
  } satisfies Record<string, number>;

  let difficulty: keyof typeof difficultySettings = "medium";
  let puzzle: Grid = [];
  let solution: Grid = [];
  let board: Grid = [];
  let status = "Click a cell and type numbers. Backspace/Delete clears.";
  let selected: { row: number; col: number } | null = null;
  let showMistakes = false;
  let boardElement: HTMLDivElement | null = null;

  onMount(() => {
    generate();
  });

  function generate() {
    const solved = buildSolved();
    const carved = carvePuzzle(solved, difficultySettings[difficulty]);
    solution = solved;
    puzzle = carved;
    board = carved.map((row) => [...row]);
    selected = null;
    showMistakes = false;
    status = "Fresh puzzle ready. Click a cell and type numbers.";
    mistakeSet = new Set();
  }

  function buildSolved(): Grid {
    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    fill(grid, 0);
    return grid;
  }

  function fill(grid: Grid, index: number): boolean {
    if (index >= 81) return true;
    const row = Math.floor(index / 9);
    const col = index % 9;
    if (grid[row][col] !== 0) {
      return fill(grid, index + 1);
    }
    for (const value of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
      if (valid(grid, row, col, value)) {
        grid[row][col] = value;
        if (fill(grid, index + 1)) return true;
      }
    }
    grid[row][col] = 0;
    return false;
  }

  function carvePuzzle(solved: Grid, blanks: number): Grid {
    const puzzleGrid = solved.map((row) => [...row]);
    const indices = shuffle(Array.from({ length: 81 }, (_, idx) => idx));
    let removed = 0;
    for (const idx of indices) {
      if (removed >= blanks) break;
      const row = Math.floor(idx / 9);
      const col = idx % 9;
      if (puzzleGrid[row][col] === 0) continue;
      const backup = puzzleGrid[row][col];
      puzzleGrid[row][col] = 0;
      if (countSolutions(puzzleGrid, 2) !== 1) {
        puzzleGrid[row][col] = backup;
      } else {
        removed += 1;
      }
    }
    return puzzleGrid;
  }

  function countSolutions(grid: Grid, cap: number) {
    const copy = grid.map((row) => [...row]);
    let solutions = 0;
    function solve(index: number): boolean {
      if (index >= 81) {
        solutions += 1;
        return solutions >= cap;
      }
      const row = Math.floor(index / 9);
      const col = index % 9;
      if (copy[row][col] !== 0) {
        return solve(index + 1);
      }
      for (let value = 1; value <= 9; value += 1) {
        if (valid(copy, row, col, value)) {
          copy[row][col] = value;
          if (solve(index + 1)) return true;
          copy[row][col] = 0;
        }
      }
      return false;
    }
    solve(0);
    return solutions;
  }

  function valid(grid: Grid, row: number, col: number, value: number) {
    for (let i = 0; i < 9; i += 1) {
      if (grid[row][i] === value || grid[i][col] === value) return false;
    }
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r += 1) {
      for (let c = 0; c < 3; c += 1) {
        if (grid[boxRow + r][boxCol + c] === value) return false;
      }
    }
    return true;
  }

  function shuffle<T>(values: T[]) {
    const copy = [...values];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function selectCell(row: number, col: number) {
    if (puzzle[row][col] !== 0) return;
    selected = { row, col };
    boardElement?.focus();
  }

  function updateBoardCell(row: number, col: number, value: number) {
    board = board.map((r, rIdx) =>
      rIdx === row
        ? r.map((cell, cIdx) => (cIdx === col ? value : cell))
        : [...r],
    );
    const key = `${row}:${col}`;
    if (mistakeSet.has(key)) {
      const updated = new Set(mistakeSet);
      updated.delete(key);
      mistakeSet = updated;
    }
  }

  function moveSelection(deltaRow: number, deltaCol: number) {
    if (!selected) return;
    let row = selected.row;
    let col = selected.col;
    while (true) {
      row += deltaRow;
      col += deltaCol;
      if (row < 0 || row >= 9 || col < 0 || col >= 9) {
        return;
      }
      if (puzzle[row][col] === 0) {
        selected = { row, col };
        return;
      }
    }
  }

  function focusFirstEditable() {
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        if (puzzle[row][col] === 0) {
          selected = { row, col };
          return;
        }
      }
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    const { key } = event;
    if (!selected) {
      if (key.startsWith("Arrow")) {
        event.preventDefault();
        focusFirstEditable();
      }
      return;
    }

    if (/^[1-9]$/.test(key)) {
      updateBoardCell(selected.row, selected.col, Number(key));
      event.preventDefault();
      moveSelection(0, 1);
      return;
    }

    if (key === "Backspace" || key === "Delete" || key === "0") {
      event.preventDefault();
      const current = board[selected.row][selected.col];
      if (current !== 0) {
        updateBoardCell(selected.row, selected.col, 0);
      } else {
        moveSelection(0, -1);
      }
      return;
    }

    if (key === "ArrowUp") {
      event.preventDefault();
      moveSelection(-1, 0);
      return;
    }
    if (key === "ArrowDown") {
      event.preventDefault();
      moveSelection(1, 0);
      return;
    }
    if (key === "ArrowLeft") {
      event.preventDefault();
      moveSelection(0, -1);
      return;
    }
    if (key === "ArrowRight") {
      event.preventDefault();
      moveSelection(0, 1);
      return;
    }
  }

  function checkProgress() {
    const wrongCells: string[] = [];
    for (let row = 0; row < 9; row += 1) {
      for (let col = 0; col < 9; col += 1) {
        if (puzzle[row][col] !== 0) continue;
        if (board[row][col] === 0) continue;
        if (board[row][col] !== solution[row][col]) {
          wrongCells.push(`${row}:${col}`);
        }
      }
    }
    if (wrongCells.length === 0) {
      const finished = board.every((r, ri) =>
        r.every((value, ci) => value === solution[ri][ci]),
      );
      status = finished ? "Solved! Excellent focus." : "No mistakes so far.";
      showMistakes = false;
      mistakeSet = new Set();
    } else {
      status = `${wrongCells.length} cell${wrongCells.length === 1 ? "" : "s"} need attention.`;
      mistakeSet = new Set(wrongCells);
      showMistakes = true;
    }
  }

  function resetBoard() {
    board = puzzle.map((row) => [...row]);
    selected = null;
    showMistakes = false;
    status = "Entries cleared. Continue typing to solve.";
    mistakeSet = new Set();
  }

  function reveal() {
    board = solution.map((row) => [...row]);
    status = "Solution revealed.";
    showMistakes = false;
    mistakeSet = new Set();
  }

  $: completion = Math.round(
    (board.flat().filter((value) => value !== 0).length / 81) * 100,
  );

  let mistakeSet = new Set<string>();
</script>

<div class="grid gap-6 lg:grid-cols-[15rem_1fr]">
  <div class="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
    <div>
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Sudoku</h2>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Choose a difficulty and generate a unique puzzle.
      </p>
    </div>
    <div class="space-y-2 text-sm">
      {#each Object.keys(difficultySettings) as level}
        <label class="flex items-center justify-between rounded-2xl border px-3 py-2 transition hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/10 {difficulty === level ? 'border-emerald-400 bg-emerald-100/30 dark:border-emerald-500' : 'border-slate-200 dark:border-slate-700'}">
          <span class="font-semibold capitalize text-slate-800 dark:text-slate-100">
            {level}
          </span>
          <input
            type="radio"
            name="difficulty"
            value={level}
            bind:group={difficulty}
            class="accent-emerald-500"
          />
        </label>
      {/each}
    </div>
    <div class="flex flex-wrap gap-2 text-sm">
      <button
        class="inline-flex flex-1 items-center justify-center rounded-full border border-transparent bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-600"
        on:click={generate}
      >
        Generate puzzle
      </button>
    </div>
    <div class="flex flex-wrap gap-2 text-sm">
      <button
        class="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
        on:click={checkProgress}
      >
        Check progress
      </button>
      <button
        class="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
        on:click={resetBoard}
      >
        Clear entries
      </button>
    </div>
    <button
      class="w-full rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
      on:click={reveal}
    >
      Reveal solution
    </button>
    <p class="rounded-2xl bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
      {status} Completion: {completion}%.
    </p>
    <p class="text-xs text-slate-500 dark:text-slate-400">
      Tip: Use digits 1-9 on your keyboard. Backspace or Delete clears a cell. Arrow keys jump between empty cells.
    </p>
  </div>
  <div class="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-inner dark:border-slate-700 dark:bg-slate-900/70">
    {#if board.length === 0}
      <p class="text-sm text-slate-600 dark:text-slate-300">
        Generate a puzzle to begin.
      </p>
    {:else}
      <div
        bind:this={boardElement}
        class="mx-auto w-full max-w-lg focus:outline-none"
        tabindex="0"
        on:keydown={handleKeyDown}
        role="grid"
        aria-label="Sudoku board"
      >
        <div class="grid grid-cols-9 overflow-hidden rounded-3xl border border-slate-300 shadow-sm dark:border-slate-700">
          {#each board as row, rowIndex}
            {#each row as value, colIndex}
              <button
                type="button"
                tabindex="-1"
                class="relative aspect-square border text-lg font-semibold leading-none transition {puzzle[rowIndex][colIndex] !== 0
                  ? 'border-slate-200 bg-slate-200/80 text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-300'
                  : 'border-slate-200 bg-white/80 text-slate-800 hover:bg-emerald-100/60 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100 dark:hover:bg-emerald-500/10'}"
                class:border-b-2={rowIndex % 3 === 2 && rowIndex !== 8}
                class:border-r-2={colIndex % 3 === 2 && colIndex !== 8}
                class:border-emerald-300={selected && selected.row === rowIndex && selected.col === colIndex}
                class:border-rose-400={showMistakes && mistakeSet.has(`${rowIndex}:${colIndex}`)}
                on:click={() => selectCell(rowIndex, colIndex)}
              >
                <span class="flex h-full w-full items-center justify-center">
                  {value === 0 ? "" : value}
                </span>
              </button>
            {/each}
          {/each}
        </div>
        <p class="mt-3 text-xs text-slate-600 dark:text-slate-400">
          {selected
            ? `Selected row ${selected.row + 1}, column ${selected.col + 1}.`
            : "Tap any blank cell to select it."}
        </p>
      </div>
    {/if}
  </div>
</div>

