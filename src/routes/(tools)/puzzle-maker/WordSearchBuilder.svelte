<script lang="ts">
  const defaultWords = `Svelte
Tailwind
Puzzle
Maze
Logic
Memory
Focus`;

  const directions = [
    { row: 0, col: 1 },
    { row: 0, col: -1 },
    { row: 1, col: 0 },
    { row: -1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: -1 },
    { row: -1, col: 1 },
    { row: -1, col: -1 },
  ];

  let size = 12;
  let wordInput = defaultWords;
  let grid: string[][] = [];
  let placements: Array<{
    index: number;
    word: string;
    display: string;
    coords: { row: number; col: number }[];
  }> = [];
  let showSolution = false;
  let status = "Add your list and generate a fresh puzzle.";
  let isSelecting = false;
  let selectionStart: { row: number; col: number } | null = null;
  let selectionCells: Array<{ row: number; col: number }> = [];
  let foundWordIds = new Set<number>();
  let foundCells = new Set<string>();
  let selectionLookup = new Map<string, (typeof placements)[number]>();
  let selectionCellsSet = new Set<string>();
  let teardownPointerListeners: (() => void) | null = null;
  let lastHoveredCell: { row: number; col: number } | null = null;

  function generate() {
    const entries = wordInput
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((word, index) => ({
        index,
        display: word,
        word: word.replace(/[^A-Za-z0-9]/g, "").toUpperCase(),
      }))
      .filter(({ word }) => word.length > 1);

    if (entries.length === 0) {
      status = "Need at least one word with two or more letters.";
      grid = [];
      placements = [];
      return;
    }

    const puzzleSize = Math.max(
      size,
      Math.max(...entries.map(({ word }) => word.length)),
    );
    const puzzle = Array.from({ length: puzzleSize }, () =>
      Array.from({ length: puzzleSize }, () => ""),
    );

    const placed: typeof placements = [];
    const failed: string[] = [];

    for (const entry of [...entries].sort(
      (a, b) => b.word.length - a.word.length,
    )) {
      let success = false;
      for (let attempt = 0; attempt < 320 && !success; attempt += 1) {
        const direction =
          directions[Math.floor(Math.random() * directions.length)];
        const rowRange =
          direction.row === 1
            ? puzzleSize - entry.word.length
            : direction.row === -1
              ? puzzleSize - 1
              : puzzleSize - 1;
        const colRange =
          direction.col === 1
            ? puzzleSize - entry.word.length
            : direction.col === -1
              ? puzzleSize - 1
              : puzzleSize - 1;
        const startRow =
          Math.floor(
            Math.random() *
              (rowRange -
                (direction.row === -1 ? entry.word.length - 1 : 0) +
                1),
          ) + (direction.row === -1 ? entry.word.length - 1 : 0);
        const startCol =
          Math.floor(
            Math.random() *
              (colRange -
                (direction.col === -1 ? entry.word.length - 1 : 0) +
                1),
          ) + (direction.col === -1 ? entry.word.length - 1 : 0);

        if (canPlace(entry.word, startRow, startCol, direction, puzzle)) {
          const coords: { row: number; col: number }[] = [];
          for (let i = 0; i < entry.word.length; i += 1) {
            const row = startRow + direction.row * i;
            const col = startCol + direction.col * i;
            puzzle[row][col] = entry.word[i];
            coords.push({ row, col });
          }
          placed.push({
            index: entry.index,
            word: entry.word,
            display: entry.display,
            coords,
          });
          success = true;
        }
      }
      if (!success) failed.push(entry.display);
    }

    for (const row of puzzle) {
      for (let col = 0; col < row.length; col += 1) {
        if (!row[col]) row[col] = randomLetter();
      }
    }

    grid = puzzle;
    placements = placed.sort((a, b) => a.index - b.index);
    status =
      failed.length === 0
        ? `Placed ${placed.length} words.`
        : `Placed ${placed.length}; expand grid to include: ${failed.join(", ")}.`;
    foundWordIds = new Set();
    foundCells = new Set();
    selectionCells = [];
    selectionStart = null;
    isSelecting = false;
    showSolution = false;
  }

  function canPlace(
    word: string,
    startRow: number,
    startCol: number,
    direction: { row: number; col: number },
    puzzle: string[][],
  ) {
    for (let i = 0; i < word.length; i += 1) {
      const row = startRow + direction.row * i;
      const col = startCol + direction.col * i;
      const cell = puzzle[row]?.[col];
      if (cell === undefined) return false;
      if (cell && cell !== word[i]) return false;
    }
    return true;
  }

  function randomLetter() {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    return alphabet[Math.floor(Math.random() * alphabet.length)];
  }

  $: solutionCells = new Set(
    placements.flatMap((item) =>
      item.coords.map(({ row, col }) => `${row}:${col}`),
    ),
  );

  $: selectionCellsSet = new Set(
    selectionCells.map(({ row, col }) => `${row}:${col}`),
  );

  $: {
    selectionLookup = new Map();
    for (const item of placements) {
      const forward = item.coords
        .map(({ row, col }) => `${row}:${col}`)
        .join("|");
      const backward = [...item.coords]
        .reverse()
        .map(({ row, col }) => `${row}:${col}`)
        .join("|");
      selectionLookup.set(forward, item);
      selectionLookup.set(backward, item);
    }
  }

  async function copyAsText() {
    if (!grid.length) return;
    const payload = grid.map((row) => row.join(" ")).join("\n");
    await navigator.clipboard.writeText(payload);
    status = "Grid copied to clipboard.";
  }

  function startSelection(row: number, col: number, event: PointerEvent) {
    if (!grid.length) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (teardownPointerListeners) {
      teardownPointerListeners();
    }
    isSelecting = true;
    selectionStart = { row, col };
    selectionCells = [{ row, col }];
    lastHoveredCell = { row, col };
    attachPointerTracking(event, row, col);
    event.preventDefault();
  }

  function updateSelectionPath(row: number, col: number) {
    if (!isSelecting || !selectionStart) return;
    const path = computePath(selectionStart, { row, col });
    if (path) {
      selectionCells = path;
      lastHoveredCell = { row, col };
    }
  }

  function finishSelection(row: number, col: number) {
    if (!isSelecting || !selectionStart) return;
    updateSelectionPath(row, col);
    const matched = commitSelection();
    if (!matched && selectionCells.length > 1) {
      status = "No match. Try another path.";
    }
    resetSelection();
  }

  function resetSelection() {
    if (teardownPointerListeners) {
      teardownPointerListeners();
      teardownPointerListeners = null;
    }
    isSelecting = false;
    selectionStart = null;
    selectionCells = [];
    lastHoveredCell = null;
  }

  function commitSelection() {
    if (selectionCells.length < 2) return false;
    const key = selectionCells.map(({ row, col }) => `${row}:${col}`).join("|");
    const placement = selectionLookup.get(key);
    if (!placement) return false;
    if (foundWordIds.has(placement.index)) {
      status = `${placement.display} already found.`;
      return true;
    }

    const updatedFound = new Set(foundWordIds);
    updatedFound.add(placement.index);
    foundWordIds = updatedFound;

    const updatedCells = new Set(foundCells);
    placement.coords.forEach(({ row, col }) => {
      updatedCells.add(`${row}:${col}`);
    });
    foundCells = updatedCells;

    const total = placements.length;
    status = `Found "${placement.display}" (${updatedFound.size}/${total}).`;
    if (updatedFound.size === total) {
      status = "All words found! Great job.";
    }
    return true;
  }

  function computePath(
    start: { row: number; col: number },
    end: { row: number; col: number },
  ) {
    const dRow = end.row - start.row;
    const dCol = end.col - start.col;
    const stepRow = Math.sign(dRow);
    const stepCol = Math.sign(dCol);

    if (stepRow === 0 && stepCol === 0) {
      return [{ row: start.row, col: start.col }];
    }

    if (
      Math.abs(stepRow) > 1 ||
      Math.abs(stepCol) > 1 ||
      (stepRow !== 0 && stepCol !== 0 && Math.abs(dRow) !== Math.abs(dCol))
    ) {
      return null;
    }

    const length = Math.max(Math.abs(dRow), Math.abs(dCol)) + 1;
    const path: Array<{ row: number; col: number }> = [];
    for (let i = 0; i < length; i += 1) {
      const row = start.row + stepRow * i;
      const col = start.col + stepCol * i;
      if (!grid[row] || grid[row][col] === undefined) {
        return null;
      }
      path.push({ row, col });
    }
    return path;
  }

  function wordCellClass(row: number, col: number) {
    const key = `${row}:${col}`;
    if (foundCells.has(key)) {
      return "border-emerald-500 bg-emerald-500 text-white dark:border-emerald-500 dark:bg-emerald-500/80 dark:text-emerald-50";
    }
    if (selectionCellsSet.has(key)) {
      return "border-sky-500 bg-sky-500 text-white dark:border-sky-400 dark:bg-sky-500/80 dark:text-slate-100";
    }
    if (showSolution && solutionCells.has(key)) {
      return "border-emerald-400 bg-emerald-200 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-500/25 dark:text-emerald-100";
    }
    return "border-slate-200 bg-white/80 text-slate-800 dark:border-slate-700 dark:bg-slate-800/80 dark:text-slate-100";
  }

  function attachPointerTracking(
    event: PointerEvent,
    initialRow: number,
    initialCol: number,
  ) {
    const pointerId = event.pointerId;
    const target = event.currentTarget as HTMLElement;
    try {
      target.setPointerCapture(pointerId);
    } catch {
      /* ignore */
    }
    const handleMove = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const cell = cellFromEvent(e) ?? {
        row: initialRow,
        col: initialCol,
      };
      updateSelectionPath(cell.row, cell.col);
    };
    const handleUp = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      const cell =
        cellFromEvent(e) ?? lastHoveredCell ?? selectionStart ?? null;
      if (cell) {
        finishSelection(cell.row, cell.col);
      } else {
        resetSelection();
      }
      if (teardownPointerListeners) {
        teardownPointerListeners();
      }
    };
    const handleCancel = (e: PointerEvent) => {
      if (e.pointerId !== pointerId) return;
      resetSelection();
      if (teardownPointerListeners) {
        teardownPointerListeners();
      }
    };
    const cleanup = () => {
      try {
        target.releasePointerCapture(pointerId);
      } catch {
        /* ignore */
      }
      window.removeEventListener("pointermove", handleMove, true);
      window.removeEventListener("pointerup", handleUp, true);
      window.removeEventListener("pointercancel", handleCancel, true);
      teardownPointerListeners = null;
    };
    window.addEventListener("pointermove", handleMove, true);
    window.addEventListener("pointerup", handleUp, true);
    window.addEventListener("pointercancel", handleCancel, true);
    teardownPointerListeners = cleanup;
  }

  function cellFromEvent(event: PointerEvent) {
    const element = document.elementFromPoint(event.clientX, event.clientY);
    const cellElement =
      element instanceof Element
        ? (element.closest("[data-word-cell]") as HTMLElement | null)
        : null;
    if (!cellElement) return null;
    const row = Number(cellElement.dataset.row);
    const col = Number(cellElement.dataset.col);
    if (Number.isNaN(row) || Number.isNaN(col)) return null;
    return { row, col };
  }
</script>

<div class="grid gap-6 lg:grid-cols-[16rem_1fr]">
  <div
    class="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900/80"
  >
    <div>
      <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
        Word Search
      </h2>
      <p class="mt-1 text-sm text-slate-600 dark:text-slate-300">
        Paste one entry per line. Letters and digits are supported. After
        generating, drag from the first letter to the last (forward or backward)
        with mouse or touch to mark words.
      </p>
    </div>
    <textarea
      bind:value={wordInput}
      rows="8"
      class="w-full rounded-2xl border border-slate-300 bg-white/80 p-3 text-sm text-slate-700 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500"
    />
    <label
      class="flex flex-col gap-1 text-xs font-medium text-slate-600 dark:text-slate-300"
    >
      Grid size ({size})
      <input
        type="range"
        min="8"
        max="22"
        bind:value={size}
        class="accent-emerald-500"
      />
    </label>
    <label
      class="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300"
    >
      <input
        type="checkbox"
        bind:checked={showSolution}
        class="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400 dark:border-slate-700"
      />
      Highlight placed words
    </label>
    <div class="flex flex-wrap gap-2 text-sm">
      <button
        class="inline-flex flex-1 items-center justify-center rounded-full border border-transparent bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-600"
        on:click={generate}
      >
        Generate
      </button>
      <button
        class="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
        on:click={copyAsText}
      >
        Copy grid
      </button>
    </div>
    <p
      class="rounded-2xl bg-slate-100 px-3 py-2 text-xs text-slate-600 dark:bg-slate-800/80 dark:text-slate-300"
    >
      {status}
    </p>
    <div class="space-y-1 text-xs text-slate-600 dark:text-slate-300">
      <p
        class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        Word list ({foundWordIds.size}/{placements.length})
      </p>
      <div class="flex flex-wrap gap-2">
        {#each placements as item}
          <span
            class={`rounded-full px-3 py-1 font-medium transition ${
              foundWordIds.has(item.index)
                ? "bg-rose-500/20 text-rose-700 line-through decoration-rose-400/60 dark:bg-rose-500/20 dark:text-rose-200"
                : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            }`}
          >
            {item.display}
          </span>
        {:else}
          <span class="text-slate-500 dark:text-slate-400">
            Generate to view placed words.
          </span>
        {/each}
      </div>
    </div>
  </div>
  <div
    class="rounded-3xl border border-slate-200 bg-slate-50/80 p-6 shadow-inner dark:border-slate-700 dark:bg-slate-900/70"
  >
    {#if grid.length === 0}
      <p class="text-sm text-slate-600 dark:text-slate-300">
        Generate a puzzle to preview the grid.
      </p>
    {:else}
      <div
        class="mx-auto grid max-w-full gap-1 text-center sm:gap-1.5 word-search"
        style={`grid-template-columns: repeat(${grid.length}, minmax(0, 1fr)); touch-action: none;`}
        on:pointerleave={resetSelection}
        on:pointercancel={resetSelection}
        on:contextmenu|preventDefault
      >
        {#each grid as row, rowIndex}
          {#each row as cell, colIndex}
            <div
              class={`aspect-square select-none rounded-xl border text-lg font-semibold uppercase hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-500/80 leading-none tracking-wide transition dark:text-white cursor-crosshair ${wordCellClass(rowIndex, colIndex)}`}
              data-word-cell
              data-row={rowIndex}
              data-col={colIndex}
              on:pointerdown={(event) =>
                startSelection(rowIndex, colIndex, event)}
              on:pointerenter={() => {
                if (isSelecting) {
                  updateSelectionPath(rowIndex, colIndex);
                }
              }}
            >
              <span
                class="pointer-events-none flex h-full w-full items-center justify-center"
              >
                {cell}
              </span>
            </div>
          {/each}
        {/each}
      </div>
    {/if}
  </div>
</div>
