<script lang="ts">
  import { tick } from "svelte";
  const defaultInput = `Svelte : Modern UI toolkit
Component : Reusable building block
Reactive : Updates automatically
Puzzle : Brain teaser
Maze : Twisty challenge`;

  type Entry = {
    index: number;
    answer: string;
    clue: string;
  };

  type Placement = {
    entry: Entry;
    row: number;
    col: number;
    orientation: "across" | "down";
  };

  let size = 13;
  let source = defaultInput;
  let grid: string[][] = [];
  let numbers: number[][] = [];
  let across: Array<{ number: number; clue: string; answer: string }> = [];
  let down: Array<{ number: number; clue: string; answer: string }> = [];
  let status = "Provide answers with clues separated by ':' or '-'.";
  let unplaced: string[] = [];
  let playerGrid: string[][] = [];
  let incorrectCells = new Set<string>();
  let activeCell: { row: number; col: number } | null = null;
  let activeDirection: "across" | "down" = "across";
  let inputRefs: (HTMLInputElement | null)[][] = [];

  function build() {
    const entries = parseEntries(source);
    if (entries.length === 0) {
      status = "Please add at least one answer with a clue.";
      grid = [];
      numbers = [];
      across = [];
      down = [];
      unplaced = [];
      return;
    }

    const dimension = Math.max(9, Math.min(21, size));
    const board = Array.from({ length: dimension }, () =>
      Array.from({ length: dimension }, () => ""),
    );
    const placements: Placement[] = [];
    const lookup = new Map<string, Placement>();

    const sorted = [...entries].sort((a, b) => b.answer.length - a.answer.length);
    const seed = sorted[0];
    const startRow = Math.floor(dimension / 2);
    const startCol = Math.max(0, Math.floor((dimension - seed.answer.length) / 2));
    put(seed, startRow, startCol, "across", board, placements);
    lookup.set(`${startRow}:${startCol}:across`, placements[placements.length - 1]);

    const misses: string[] = [];

    for (const entry of sorted.slice(1)) {
      const candidate = findSpot(entry, board, placements);
      if (candidate) {
        put(entry, candidate.row, candidate.col, candidate.orientation, board, placements);
        lookup.set(
          `${candidate.row}:${candidate.col}:${candidate.orientation}`,
          placements[placements.length - 1],
        );
      } else {
        const fallback = scanForSpace(entry, board);
        if (fallback) {
          put(entry, fallback.row, fallback.col, fallback.orientation, board, placements);
          lookup.set(
            `${fallback.row}:${fallback.col}:${fallback.orientation}`,
            placements[placements.length - 1],
          );
        } else {
          misses.push(entry.answer);
        }
      }
    }

    for (let row = 0; row < dimension; row += 1) {
      for (let col = 0; col < dimension; col += 1) {
        if (!board[row][col]) board[row][col] = "#";
      }
    }

    const clues = extractClues(board, lookup);
    grid = board;
    numbers = clues.numbers;
    across = clues.across;
    down = clues.down;
    unplaced = misses;
    status =
      misses.length === 0
        ? `Placed ${placements.length} answers.`
        : `Placed ${placements.length}; couldn't fit ${misses.join(", ")}.`;
    playerGrid = board.map((row) =>
      row.map((cell) => (cell === "#" ? "#" : "")),
    );
    incorrectCells = new Set();
    activeCell = null;
    activeDirection = "across";
    inputRefs = Array.from({ length: dimension }, () => []);
  }

  function isBlockCell(row: number, col: number) {
    return grid[row]?.[col] === "#";
  }

  function setPlayerCell(row: number, col: number, value: string) {
    playerGrid = playerGrid.map((r, rIdx) =>
      rIdx === row
        ? r.map((cell, cIdx) => (cIdx === col ? value : cell))
        : [...r],
    );
    const key = `${row}:${col}`;
    if (incorrectCells.has(key)) {
      const updated = new Set(incorrectCells);
      if (!value || value === grid[row][col]) {
        updated.delete(key);
        incorrectCells = updated;
      }
    }
  }

  function assignRef(row: number, col: number, node: HTMLInputElement | null) {
    const dimension = grid.length || size;
    inputRefs[row] = inputRefs[row] ?? Array(dimension).fill(null);
    inputRefs[row][col] = node;
  }

  function handleCellFocus(row: number, col: number) {
    activeCell = { row, col };
  }

  function moveToNextCell(row: number, col: number) {
    if (activeDirection === "across") {
      navigate(row, col, 0, 1);
    } else {
      navigate(row, col, 1, 0);
    }
  }

  function moveToPreviousCell(row: number, col: number) {
    if (activeDirection === "across") {
      navigate(row, col, 0, -1);
    } else {
      navigate(row, col, -1, 0);
    }
  }

  function navigate(
    row: number,
    col: number,
    deltaRow: number,
    deltaCol: number,
  ) {
    let nextRow = row + deltaRow;
    let nextCol = col + deltaCol;
    while (
      nextRow >= 0 &&
      nextRow < grid.length &&
      nextCol >= 0 &&
      nextCol < grid.length
    ) {
      if (!isBlockCell(nextRow, nextCol)) {
        focusCell(nextRow, nextCol);
        return;
      }
      nextRow += deltaRow;
      nextCol += deltaCol;
    }
  }

  function handleInput(row: number, col: number, event: Event) {
    const input = event.target as HTMLInputElement;
    const normalized = input.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const value = normalized.slice(-1);
    input.value = value;
    setPlayerCell(row, col, value);
    if (value) {
      moveToNextCell(row, col);
    }
  }

  function handleCellKeyDown(row: number, col: number, event: KeyboardEvent) {
    const key = event.key;
    if (key === "ArrowRight") {
      event.preventDefault();
      activeDirection = "across";
      navigate(row, col, 0, 1);
      return;
    }
    if (key === "ArrowLeft") {
      event.preventDefault();
      activeDirection = "across";
      navigate(row, col, 0, -1);
      return;
    }
    if (key === "ArrowDown") {
      event.preventDefault();
      activeDirection = "down";
      navigate(row, col, 1, 0);
      return;
    }
    if (key === "ArrowUp") {
      event.preventDefault();
      activeDirection = "down";
      navigate(row, col, -1, 0);
      return;
    }
    if (key === "Backspace") {
      event.preventDefault();
      const current = playerGrid[row]?.[col] ?? "";
      if (current) {
        setPlayerCell(row, col, "");
        const input = event.target as HTMLInputElement;
        input.value = "";
      } else {
        moveToPreviousCell(row, col);
      }
      return;
    }
    if (key === "Delete") {
      event.preventDefault();
      setPlayerCell(row, col, "");
      const input = event.target as HTMLInputElement;
      input.value = "";
      return;
    }
    if (key === "Enter") {
      event.preventDefault();
      activeDirection = activeDirection === "across" ? "down" : "across";
      return;
    }
  }

  function focusCell(row: number, col: number) {
    activeCell = { row, col };
    tick().then(() => {
      const el = inputRefs[row]?.[col];
      if (el) {
        el.focus();
        el.select();
      }
    });
  }

  function checkAnswers() {
    if (!grid.length) return;
    const errors = new Set<string>();
    for (let row = 0; row < grid.length; row += 1) {
      for (let col = 0; col < grid[row].length; col += 1) {
        const solution = grid[row][col];
        if (solution === "#") continue;
        const guess = playerGrid[row]?.[col] ?? "";
        if (!guess || guess !== solution) {
          errors.add(`${row}:${col}`);
        }
      }
    }
    incorrectCells = errors;
    if (errors.size === 0) {
      status = "Crossword complete! Nicely done.";
    } else {
      const count = errors.size;
      status = `${count} cell${count === 1 ? "" : "s"} need attention.`;
    }
  }

  function clearPlayerGrid() {
    if (!grid.length) return;
    playerGrid = grid.map((row) =>
      row.map((cell) => (cell === "#" ? "#" : "")),
    );
    incorrectCells = new Set();
    status = "Grid cleared. Try again!";
    activeCell = null;
  }

  function revealSolution() {
    if (!grid.length) return;
    playerGrid = grid.map((row) =>
      row.map((cell) => (cell === "#" ? "#" : cell)),
    );
    incorrectCells = new Set();
    status = "Solution revealed.";
  }

  function crosswordCellClass(row: number, col: number, cell: string) {
    if (cell === "#") {
      return "border-slate-300 bg-slate-400/50 text-transparent dark:border-slate-600 dark:bg-slate-700/70";
    }
    const key = `${row}:${col}`;
    if (incorrectCells.has(key)) {
      return "border-rose-400 bg-rose-200/70 text-rose-900 dark:border-rose-500 dark:bg-rose-500/20 dark:text-rose-100";
    }
    const playerValue = playerGrid[row]?.[col] ?? "";
    if (playerValue && playerValue === grid[row][col]) {
      return "border-emerald-400 bg-emerald-200/60 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-500/20 dark:text-emerald-200";
    }
    if (activeCell && activeCell.row === row && activeCell.col === col) {
      return "border-indigo-400 bg-indigo-200/40 text-slate-900 dark:border-indigo-500 dark:bg-indigo-500/20 dark:text-slate-100";
    }
    return "border-slate-200 bg-white/80 text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100";
  }

  function registerInput(
    node: HTMLInputElement,
    params: { row: number; col: number },
  ) {
    assignRef(params.row, params.col, node);
    let current = { ...params };
    return {
      update(newParams: { row: number; col: number }) {
        if (
          newParams.row !== current.row ||
          newParams.col !== current.col
        ) {
          assignRef(newParams.row, newParams.col, node);
          current = { ...newParams };
        }
      },
      destroy() {
        assignRef(current.row, current.col, null);
      },
    };
  }

  function findClueStart(orientation: "across" | "down", number: number) {
    for (let row = 0; row < numbers.length; row += 1) {
      for (let col = 0; col < numbers[row].length; col += 1) {
        if (numbers[row][col] !== number) continue;
        if (grid[row][col] === "#") continue;
        if (
          orientation === "across" &&
          (col === 0 || grid[row][col - 1] === "#")
        ) {
          return { row, col };
        }
        if (
          orientation === "down" &&
          (row === 0 || grid[row - 1]?.[col] === "#")
        ) {
          return { row, col };
        }
      }
    }
    return null;
  }

  function selectClue(orientation: "across" | "down", number: number) {
    const start = findClueStart(orientation, number);
    if (!start) return;
    activeDirection = orientation;
    focusCell(start.row, start.col);
  }

  function parseEntries(payload: string): Entry[] {
    return payload
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        const [answerPart, ...clueParts] = line.split(/\s*[:\-–—]\s*/);
        const answer = (answerPart || "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
        const clue = clueParts.join(" - ").trim() || "Clue not provided";
        return {
          index,
          answer,
          clue,
        };
      })
      .filter((entry) => entry.answer.length > 1);
  }

  function put(
    entry: Entry,
    row: number,
    col: number,
    orientation: "across" | "down",
    board: string[][],
    placements: Placement[],
  ) {
    for (let i = 0; i < entry.answer.length; i += 1) {
      const r = row + (orientation === "down" ? i : 0);
      const c = col + (orientation === "across" ? i : 0);
      board[r][c] = entry.answer[i];
    }
    placements.push({ entry, row, col, orientation });
  }

  function fits(
    answer: string,
    row: number,
    col: number,
    orientation: "across" | "down",
    board: string[][],
  ) {
    if (orientation === "across") {
      if (col < 0 || col + answer.length > board.length || row < 0 || row >= board.length) {
        return false;
      }
      if (col > 0 && board[row][col - 1] && board[row][col - 1] !== "#") return false;
      if (
        col + answer.length < board.length &&
        board[row][col + answer.length] &&
        board[row][col + answer.length] !== "#"
      )
        return false;
      for (let i = 0; i < answer.length; i += 1) {
        const r = row;
        const c = col + i;
        const cell = board[r][c];
        if (cell && cell !== answer[i]) return false;
        if (
          (board[r - 1]?.[c] && board[r - 1][c] !== "#") ||
          (board[r + 1]?.[c] && board[r + 1][c] !== "#")
        ) {
          if (cell !== answer[i]) return false;
        }
      }
    } else {
      if (row < 0 || row + answer.length > board.length || col < 0 || col >= board.length) {
        return false;
      }
      if (row > 0 && board[row - 1][col] && board[row - 1][col] !== "#") return false;
      if (
        row + answer.length < board.length &&
        board[row + answer.length][col] &&
        board[row + answer.length][col] !== "#"
      )
        return false;
      for (let i = 0; i < answer.length; i += 1) {
        const r = row + i;
        const c = col;
        const cell = board[r][c];
        if (cell && cell !== answer[i]) return false;
        if (
          (board[r][c - 1] && board[r][c - 1] !== "#") ||
          (board[r][c + 1] && board[r][c + 1] !== "#")
        ) {
          if (cell !== answer[i]) return false;
        }
      }
    }
    return true;
  }

  function findSpot(entry: Entry, board: string[][], placements: Placement[]) {
    for (let index = 0; index < entry.answer.length; index += 1) {
      const letter = entry.answer[index];
      for (const placed of placements) {
        for (let i = 0; i < placed.entry.answer.length; i += 1) {
          if (placed.entry.answer[i] !== letter) continue;
          const row =
            placed.row + (placed.orientation === "down" ? i : 0) -
            (placed.orientation === "across" ? index : 0);
          const col =
            placed.col + (placed.orientation === "across" ? i : 0) -
            (placed.orientation === "down" ? index : 0);
          const orientation = placed.orientation === "across" ? "down" : "across";
          if (fits(entry.answer, row, col, orientation, board)) {
            return { row, col, orientation };
          }
        }
      }
    }
    return null;
  }

  function scanForSpace(entry: Entry, board: string[][]) {
    for (let row = 0; row < board.length; row += 1) {
      for (let col = 0; col < board.length; col += 1) {
        if (fits(entry.answer, row, col, "across", board)) {
          return { row, col, orientation: "across" as const };
        }
        if (fits(entry.answer, row, col, "down", board)) {
          return { row, col, orientation: "down" as const };
        }
      }
    }
    return null;
  }

  function extractClues(board: string[][], lookup: Map<string, Placement>) {
    const size = board.length;
    const numbering = Array.from({ length: size }, () =>
      Array.from({ length: size }, () => 0),
    );
    let counter = 1;
    const acrossClues: typeof across = [];
    const downClues: typeof down = [];

    for (let row = 0; row < size; row += 1) {
      for (let col = 0; col < size; col += 1) {
        if (board[row][col] === "#") continue;
        const startAcross = col === 0 || board[row][col - 1] === "#";
        const startDown = row === 0 || board[row - 1]?.[col] === "#";
        if (!startAcross && !startDown) continue;
        numbering[row][col] = counter;
        const acrossPlacement = lookup.get(`${row}:${col}:across`);
        if (startAcross && acrossPlacement) {
          acrossClues.push({
            number: counter,
            clue: acrossPlacement.entry.clue,
            answer: acrossPlacement.entry.answer,
          });
        }
        const downPlacement = lookup.get(`${row}:${col}:down`);
        if (startDown && downPlacement) {
          downClues.push({
            number: counter,
            clue: downPlacement.entry.clue,
            answer: downPlacement.entry.answer,
          });
        }
        counter += 1;
      }
    }
    return { numbers: numbering, across: acrossClues, down: downClues };
  }
</script>

<div class="grid gap-6 lg:grid-cols-[18rem_1fr]">
  <div class="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
    <div>
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Crossword</h2>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Format each row as <span class="font-mono text-xs text-slate-500">answer : clue</span>.
      </p>
    </div>
    <textarea
      bind:value={source}
      rows="9"
      class="w-full rounded-2xl border border-slate-300 bg-white/80 p-3 text-sm text-slate-700 shadow-sm transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-indigo-400"
    />
    <label class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
      Grid size ({size})
      <input
        type="range"
        min="10"
        max="19"
        bind:value={size}
        class="accent-indigo-500"
      />
    </label>
    <div class="flex flex-wrap gap-2 text-sm">
      <button
        class="inline-flex flex-1 items-center justify-center rounded-full border border-transparent bg-indigo-500 px-4 py-2 font-semibold text-white transition hover:bg-indigo-600"
        on:click={build}
      >
        Build grid
      </button>
    </div>
    <div class="flex flex-wrap gap-2 text-xs text-slate-600 dark:text-slate-300">
      <button
        class="rounded-full border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-200"
        on:click={checkAnswers}
        disabled={!grid.length}
      >
        Check answers
      </button>
      <button
        class="rounded-full border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-200"
        on:click={clearPlayerGrid}
        disabled={!grid.length}
      >
        Clear grid
      </button>
      <button
        class="rounded-full border border-slate-300 px-3 py-2 font-semibold text-slate-700 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-200"
        on:click={revealSolution}
        disabled={!grid.length}
      >
        Reveal solution
      </button>
    </div>
    <p class="rounded-2xl bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800/80 dark:text-slate-300">
      {status}
    </p>
    {#if unplaced.length}
      <p class="rounded-2xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700 dark:border-amber-500 dark:bg-amber-500/10 dark:text-amber-200">
        Not placed: {unplaced.join(", ")}
      </p>
    {/if}
    <div class="grid gap-4 text-xs text-slate-600 dark:text-slate-300 sm:grid-cols-2">
      <div>
        <p class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Across
        </p>
        <ul class="mt-2 space-y-2">
          {#each across as clue}
            <li
              class="cursor-pointer rounded-xl border border-transparent bg-slate-100 px-3 py-2 transition hover:border-indigo-400 hover:bg-indigo-100 dark:bg-slate-800/70 dark:hover:border-indigo-500"
              on:click={() => selectClue("across", clue.number)}
            >
              <span class="font-semibold text-indigo-600 dark:text-indigo-300">
                {clue.number}.
              </span>
              <span class="ml-2">{clue.clue}</span>
            </li>
          {:else}
            <li>No across clues yet.</li>
          {/each}
        </ul>
      </div>
      <div>
        <p class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Down
        </p>
        <ul class="mt-2 space-y-2">
          {#each down as clue}
            <li
              class="cursor-pointer rounded-xl border border-transparent bg-slate-100 px-3 py-2 transition hover:border-indigo-400 hover:bg-indigo-100 dark:bg-slate-800/70 dark:hover:border-indigo-500"
              on:click={() => selectClue("down", clue.number)}
            >
              <span class="font-semibold text-indigo-600 dark:text-indigo-300">
                {clue.number}.
              </span>
              <span class="ml-2">{clue.clue}</span>
            </li>
          {:else}
            <li>No down clues yet.</li>
          {/each}
        </ul>
      </div>
    </div>
  </div>
  <div class="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-inner dark:border-slate-700 dark:bg-slate-900/70">
    {#if grid.length === 0}
      <p class="text-sm text-slate-600 dark:text-slate-300">
        Build a crossword to preview the grid.
      </p>
    {:else}
      <div
        class="mx-auto grid max-w-full gap-[3px] text-center sm:gap-1"
        style={`grid-template-columns: repeat(${grid.length}, minmax(0, 1fr));`}
      >
        {#each grid as row, rowIndex}
          {#each row as cell, colIndex}
            <div
              class={`relative aspect-square select-none rounded-md border text-lg font-semibold uppercase tracking-wide ${crosswordCellClass(rowIndex, colIndex, cell)}`}
            >
              {#if numbers[rowIndex][colIndex]}
                <span class="absolute left-1 top-1 text-[10px] font-semibold text-slate-500 dark:text-slate-300">
                  {numbers[rowIndex][colIndex]}
                </span>
              {/if}
              {#if cell === "#"}
                <span class="flex h-full w-full items-center justify-center"></span>
              {:else}
                <input
                  use:registerInput={{ row: rowIndex, col: colIndex }}
                  value={playerGrid[rowIndex]?.[colIndex] ?? ""}
                  maxlength="1"
                  autocomplete="off"
                  autocapitalize="characters"
                  spellcheck={false}
                  class="h-full w-full bg-transparent text-center uppercase text-slate-900 outline-none focus:bg-indigo-100 dark:text-slate-100 dark:focus:bg-indigo-500/20"
                  on:input={(event) => handleInput(rowIndex, colIndex, event)}
                  on:keydown={(event) => handleCellKeyDown(rowIndex, colIndex, event)}
                  on:focus={() => handleCellFocus(rowIndex, colIndex)}
                />
              {/if}
            </div>
          {/each}
        {/each}
      </div>
    {/if}
  </div>
</div>
