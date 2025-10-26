<script lang="ts">
  import { afterUpdate, onMount, tick } from "svelte";

  type MazeCell = {
    x: number;
    y: number;
    walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  };

  type MazeGrid = MazeCell[][];

  const algorithms = [
    {
      id: "dfs",
      label: "Recursive Backtracker (DFS)",
      description:
        "Creates organic mazes with long corridors and gentle twists.",
    },
    {
      id: "prim",
      label: "Randomised Prim",
      description: "Produces denser mazes with lots of short branches.",
    },
  ] as const;

  let algorithm: (typeof algorithms)[number]["id"] = "dfs";
  let columns = 18;
  let rows = 12;
  let cellSize = 32;
  let showSolution = false;
  let maze: MazeGrid = [];
  let canvasElement: HTMLCanvasElement | null = null;
  let generationSummary = "";
  type Point = { x: number; y: number };
  let gameStatus: "idle" | "playing" | "won" = "idle";
  let playerPosition: Point = { x: 0, y: 0 };
  let playerTrail: Point[] = [];
  let stepsTaken = 0;
  let playMessage = 'Generate a maze and press "Start play" to explore it.';
  let playSurface: HTMLDivElement | null = null;
  let isPlayFocused = false;

  onMount(() => {
    resetPlayState();
    generateMaze();
  });
  afterUpdate(() => {
    if (canvasElement && maze.length) {
      drawMaze();
    }
  });

  function generateMaze() {
    const start = performance.now();
    maze =
      algorithm === "dfs"
        ? buildMazeRecursive(columns, rows)
        : buildMazePrim(columns, rows);
    const elapsed = Math.round(performance.now() - start);
    generationSummary = `Generated ${columns}x${rows} maze in ${elapsed} ms using ${algorithmLabel(
      algorithm,
    )}.`;
    resetPlayState();
  }
  function algorithmLabel(id: string) {
    return algorithms.find((algo) => algo.id === id)?.label ?? "Unknown";
  }

  function drawMaze() {
    if (!canvasElement) return;
    const padding = 16;
    const width = columns * cellSize + padding * 2;
    const height = rows * cellSize + padding * 2;
    const dpr = window.devicePixelRatio || 1;
    canvasElement.width = width * dpr;
    canvasElement.height = height * dpr;
    canvasElement.style.width = `${width}px`;
    canvasElement.style.height = `${height}px`;

    const ctx = canvasElement.getContext("2d");
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, width, height);

    ctx.fillStyle = "#0f172a";
    ctx.fillRect(0, 0, width, height);

    ctx.translate(padding, padding);

    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";

    for (const column of maze) {
      for (const cell of column) {
        const cx = cell.x * cellSize;
        const cy = cell.y * cellSize;
        if (cell.walls.top) {
          drawLine(ctx, cx, cy, cx + cellSize, cy);
        }
        if (cell.walls.right) {
          drawLine(ctx, cx + cellSize, cy, cx + cellSize, cy + cellSize);
        }
        if (cell.walls.bottom) {
          drawLine(ctx, cx, cy + cellSize, cx + cellSize, cy + cellSize);
        }
        if (cell.walls.left) {
          drawLine(ctx, cx, cy, cx, cy + cellSize);
        }
      }
    }

    if (showSolution) {
      drawSolutionPath(ctx);
    }

    drawCellHighlight(ctx, { x: 0, y: 0 }, "#22c55e", 0.25);
    drawCellHighlight(ctx, { x: columns - 1, y: rows - 1 }, "#ef4444", 0.25);

    if (playerTrail.length > 1) {
      drawPlayerTrail(ctx);
    }

    if (gameStatus !== "idle") {
      drawPlayer(ctx);
    }
  }

  function drawLine(
    ctx: CanvasRenderingContext2D,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
  ) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  function drawSolutionPath(ctx: CanvasRenderingContext2D) {
    const path = solveMaze(maze);
    if (path.length === 0) return;
    ctx.save();
    ctx.strokeStyle = "#22d3ee";
    ctx.lineWidth = Math.max(2, cellSize * 0.35);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    const offset = cellSize / 2;
    const [first] = path;
    ctx.moveTo(first.x * cellSize + offset, first.y * cellSize + offset);
    for (const point of path.slice(1)) {
      ctx.lineTo(point.x * cellSize + offset, point.y * cellSize + offset);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawCellHighlight(
    ctx: CanvasRenderingContext2D,
    point: Point,
    color: string,
    alpha = 0.3,
  ) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(
      point.x * cellSize + 3,
      point.y * cellSize + 3,
      cellSize - 6,
      cellSize - 6,
    );
    ctx.restore();
  }

  function drawPlayerTrail(ctx: CanvasRenderingContext2D) {
    if (playerTrail.length < 2) return;
    ctx.save();
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = Math.max(2, cellSize * 0.28);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    const offset = cellSize / 2;
    const first = playerTrail[0];
    ctx.moveTo(first.x * cellSize + offset, first.y * cellSize + offset);
    for (const step of playerTrail.slice(1)) {
      ctx.lineTo(step.x * cellSize + offset, step.y * cellSize + offset);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawPlayer(ctx: CanvasRenderingContext2D) {
    const offset = cellSize / 2;
    const radius = Math.max(6, cellSize * 0.28);
    ctx.save();
    ctx.fillStyle = gameStatus === "won" ? "#22c55e" : "#facc15";
    ctx.beginPath();
    ctx.arc(
      playerPosition.x * cellSize + offset,
      playerPosition.y * cellSize + offset,
      radius,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.restore();
  }

  function buildMazeRecursive(cols: number, rws: number): MazeGrid {
    const grid = createGrid(cols, rws);
    const stack: MazeCell[] = [];
    const startCol = Math.floor(Math.random() * cols);
    const startRow = Math.floor(Math.random() * rws);
    let current = grid[startCol][startRow];
    const visited = new Set<string>([cellKey(current.x, current.y)]);

    do {
      const neighbours = unvisitedNeighbours(current, grid, visited);
      if (neighbours.length > 0) {
        const next = neighbours[Math.floor(Math.random() * neighbours.length)];
        removeWallBetween(current, next);
        stack.push(current);
        current = next;
        visited.add(cellKey(current.x, current.y));
      } else {
        current = stack.pop() ?? current;
      }
    } while (
      stack.length > 0 ||
      unvisitedNeighbours(current, grid, visited).length > 0
    );

    return grid;
  }

  function buildMazePrim(cols: number, rws: number): MazeGrid {
    const grid = createGrid(cols, rws);
    const startCol = Math.floor(Math.random() * cols);
    const startRow = Math.floor(Math.random() * rws);
    const visited = new Set<string>();
    const frontier: MazeCell[] = [];

    function addFrontier(cell: MazeCell) {
      for (const neighbour of orthogonalNeighbours(cell, grid)) {
        const key = cellKey(neighbour.x, neighbour.y);
        if (!visited.has(key) && !frontier.includes(neighbour)) {
          frontier.push(neighbour);
        }
      }
    }

    const start = grid[startCol][startRow];
    visited.add(cellKey(start.x, start.y));
    addFrontier(start);

    while (frontier.length > 0) {
      const index = Math.floor(Math.random() * frontier.length);
      const cell = frontier.splice(index, 1)[0];
      const neighbours = orthogonalNeighbours(cell, grid).filter((n) =>
        visited.has(cellKey(n.x, n.y)),
      );
      const neighbour =
        neighbours[Math.floor(Math.random() * neighbours.length)];
      removeWallBetween(cell, neighbour);
      visited.add(cellKey(cell.x, cell.y));
      addFrontier(cell);
    }

    return grid;
  }

  function createGrid(cols: number, rws: number): MazeGrid {
    return Array.from({ length: cols }, (_, x) =>
      Array.from({ length: rws }, (_, y) => ({
        x,
        y,
        walls: { top: true, right: true, bottom: true, left: true },
      })),
    );
  }

  function unvisitedNeighbours(
    cell: MazeCell,
    grid: MazeGrid,
    visited: Set<string>,
  ) {
    return orthogonalNeighbours(cell, grid).filter(
      (neighbour) => !visited.has(cellKey(neighbour.x, neighbour.y)),
    );
  }

  function orthogonalNeighbours(cell: MazeCell, grid: MazeGrid) {
    const neighbours: MazeCell[] = [];
    const { x, y } = cell;
    if (grid[x]?.[y - 1]) neighbours.push(grid[x][y - 1]);
    if (grid[x + 1]?.[y]) neighbours.push(grid[x + 1][y]);
    if (grid[x]?.[y + 1]) neighbours.push(grid[x][y + 1]);
    if (grid[x - 1]?.[y]) neighbours.push(grid[x - 1][y]);
    return neighbours;
  }

  function removeWallBetween(a: MazeCell, b: MazeCell) {
    if (a.x === b.x) {
      if (a.y > b.y) {
        a.walls.top = false;
        b.walls.bottom = false;
      } else {
        a.walls.bottom = false;
        b.walls.top = false;
      }
    } else if (a.y === b.y) {
      if (a.x > b.x) {
        a.walls.left = false;
        b.walls.right = false;
      } else {
        a.walls.right = false;
        b.walls.left = false;
      }
    }
  }

  function cellKey(x: number, y: number) {
    return `${x}:${y}`;
  }

  function solveMaze(grid: MazeGrid) {
    const start = grid[0][0];
    const target = grid[grid.length - 1][grid[0].length - 1];
    const queue: MazeCell[] = [start];
    const visited = new Set<string>([cellKey(start.x, start.y)]);
    const previous = new Map<string, MazeCell>();

    while (queue.length > 0) {
      const cell = queue.shift()!;
      if (cell === target) break;
      for (const neighbour of connectedNeighbours(cell, grid)) {
        const key = cellKey(neighbour.x, neighbour.y);
        if (!visited.has(key)) {
          visited.add(key);
          previous.set(key, cell);
          queue.push(neighbour);
        }
      }
    }

    const path: MazeCell[] = [];
    let current: MazeCell | undefined = target;
    while (current) {
      path.push(current);
      const key = cellKey(current.x, current.y);
      current = previous.get(key);
    }
    return path.reverse();
  }

  function connectedNeighbours(cell: MazeCell, grid: MazeGrid) {
    const neighbours: MazeCell[] = [];
    const { x, y, walls } = cell;
    if (!walls.top && grid[x]?.[y - 1]) neighbours.push(grid[x][y - 1]);
    if (!walls.right && grid[x + 1]?.[y]) neighbours.push(grid[x + 1][y]);
    if (!walls.bottom && grid[x]?.[y + 1]) neighbours.push(grid[x][y + 1]);
    if (!walls.left && grid[x - 1]?.[y]) neighbours.push(grid[x - 1][y]);
    return neighbours;
  }

  function resetPlayState() {
    gameStatus = "idle";
    playerPosition = { x: 0, y: 0 };
    playerTrail = [];
    stepsTaken = 0;
    playMessage = 'Generate a maze and press "Start play" to explore it.';
    isPlayFocused = false;
  }

  async function startPlay() {
    if (!maze.length) return;
    gameStatus = "playing";
    playerPosition = { x: 0, y: 0 };
    playerTrail = [{ x: 0, y: 0 }];
    stepsTaken = 0;
    playMessage = "Use arrow keys or WASD to reach the exit portal.";
    await tick();
    playSurface?.focus();
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (gameStatus !== "playing") return;
    const key = event.key.toLowerCase();
    const movement: Record<string, [number, number]> = {
      arrowup: [0, -1],
      w: [0, -1],
      arrowdown: [0, 1],
      s: [0, 1],
      arrowleft: [-1, 0],
      a: [-1, 0],
      arrowright: [1, 0],
      d: [1, 0],
    };
    const delta = movement[key];
    if (!delta) return;
    event.preventDefault();
    movePlayer(delta[0], delta[1]);
  }

  function movePlayer(deltaX: number, deltaY: number) {
    if (!maze.length) return;
    const current = playerPosition;
    const next: Point = { x: current.x + deltaX, y: current.y + deltaY };

    if (!isWithinBounds(next)) return;
    if (!canMove(current, next)) return;

    playerPosition = next;
    stepsTaken += 1;
    playerTrail = [...playerTrail, next];

    if (isGoal(next)) {
      gameStatus = "won";
      const label = stepsTaken === 1 ? "step" : "steps";
      playMessage = `Goal reached in ${stepsTaken} ${label}!`;
    } else {
      playMessage = `Steps: ${stepsTaken} • Position (${next.x + 1}, ${
        next.y + 1
      })`;
    }
  }

  function isWithinBounds(point: Point) {
    return (
      point.x >= 0 &&
      point.y >= 0 &&
      point.x < maze.length &&
      point.y < (maze[0]?.length ?? 0)
    );
  }

  function canMove(from: Point, to: Point) {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    if (Math.abs(dx) + Math.abs(dy) !== 1) return false;
    const current = cellAt(from);
    if (!current) return false;
    if (dx === 1) return !current.walls.right;
    if (dx === -1) return !current.walls.left;
    if (dy === 1) return !current.walls.bottom;
    if (dy === -1) return !current.walls.top;
    return false;
  }

  function cellAt(point: Point) {
    return maze[point.x]?.[point.y] ?? null;
  }

  function isGoal(point: Point) {
    return point.x === columns - 1 && point.y === rows - 1;
  }

  function handlePlayFocus() {
    isPlayFocused = true;
  }

  function handlePlayBlur() {
    isPlayFocused = false;
  }

  function exportPng() {
    if (!canvasElement) return;
    const link = document.createElement("a");
    link.href = canvasElement.toDataURL("image/png");
    link.download = `maze-${columns}x${rows}.png`;
    link.click();
  }

  async function copyAscii() {
    try {
      await navigator.clipboard.writeText(createAscii(maze));
      generationSummary = "Maze copied as ASCII art to clipboard.";
    } catch (error) {
      generationSummary =
        "Clipboard permission denied. Try copying manually from the preview.";
    }
  }

  function createAscii(grid: MazeGrid) {
    let output = "";
    const horizontalWall = "+";
    const verticalWall = "|";
    const space = " ";

    // Top border
    output += horizontalWall + "-".repeat(grid.length * 2) + "+\n";

    for (let y = 0; y < grid[0].length; y += 1) {
      let topRow = verticalWall;
      let bottomRow = "+";
      for (let x = 0; x < grid.length; x += 1) {
        const cell = grid[x][y];
        topRow += space;
        topRow += cell.walls.right ? verticalWall : space;
        bottomRow += cell.walls.bottom ? "--" : "  ";
        bottomRow += "+";
      }
      output += `${topRow}\n${bottomRow}\n`;
    }
    return output;
  }
</script>

<section class="space-y-6">
  <div class="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
    <aside
      class="space-y-6 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900/80"
    >
      <div class="space-y-4">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Maze configuration
        </h2>
        <div class="space-y-3">
          <label
            class="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Columns
            <input
              type="range"
              min="6"
              max="38"
              bind:value={columns}
              class="accent-emerald-500"
            />
            <span class="text-xs text-slate-500 dark:text-slate-400"
              >Adjust width of the maze grid.</span
            >
          </label>
          <label
            class="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Rows
            <input
              type="range"
              min="6"
              max="38"
              bind:value={rows}
              class="accent-emerald-500"
            />
            <span class="text-xs text-slate-500 dark:text-slate-400"
              >Adjust height of the maze grid.</span
            >
          </label>
          <label
            class="flex flex-col gap-1 text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Cell size (px)
            <input
              type="range"
              min="16"
              max="56"
              step="4"
              bind:value={cellSize}
              class="accent-emerald-500"
            />
            <span class="text-xs text-slate-500 dark:text-slate-400"
              >Control output scale for print or digital use.</span
            >
          </label>
        </div>
      </div>
      <div>
        <p class="text-sm font-medium text-slate-700 dark:text-slate-200">
          Generation algorithm
        </p>
        <div class="mt-3 space-y-3">
          {#each algorithms as option}
            <label
              class="flex gap-3 rounded-2xl border px-4 py-3 text-sm transition hover:border-emerald-400 hover:bg-emerald-50/40 dark:hover:border-emerald-500 dark:hover:bg-emerald-500/10 {algorithm ===
              option.id
                ? 'border-emerald-400 bg-emerald-100/20 dark:border-emerald-500'
                : 'border-slate-200 dark:border-slate-700'}"
            >
              <input
                type="radio"
                name="algorithm"
                value={option.id}
                bind:group={algorithm}
                class="mt-1 accent-emerald-500"
              />
              <span>
                <span class="block font-semibold text-slate-900 dark:text-white"
                  >{option.label}</span
                >
                <span class="text-xs text-slate-500 dark:text-slate-400"
                  >{option.description}</span
                >
              </span>
            </label>
          {/each}
        </div>
      </div>
      <div class="flex flex-wrap items-center gap-3">
        <label
          class="inline-flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          <input
            type="checkbox"
            bind:checked={showSolution}
            class="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400 dark:border-slate-700"
          />
          Overlay solution path
        </label>
      </div>
      <div class="flex flex-wrap gap-3 text-sm">
        <button
          class="inline-flex flex-1 items-center justify-center rounded-full border border-transparent bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-600"
          on:click={generateMaze}
        >
          Generate maze
        </button>
        <button
          class="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
          on:click={exportPng}
        >
          Export PNG
        </button>
        <button
          class="inline-flex flex-1 items-center justify-center rounded-full border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-700 dark:text-slate-200"
          on:click={copyAscii}
        >
          Copy ASCII
        </button>
      </div>
      <p
        class="rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-600 dark:bg-slate-800/80 dark:text-slate-300"
      >
        {generationSummary}
      </p>
      <div
        class="space-y-3 rounded-2xl border border-slate-200 bg-white/85 p-4 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900/70"
      >
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <h3 class="text-base font-semibold text-slate-900 dark:text-white">
              Play this maze
            </h3>
            <p
              class="text-xs text-slate-600 dark:text-slate-400"
              aria-live="polite"
            >
              {playMessage}
            </p>
          </div>
          <div class="flex gap-2">
            <button
              class="rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-emerald-500 dark:text-slate-900 dark:hover:bg-emerald-400"
              on:click={startPlay}
              disabled={gameStatus === "playing"}
            >
              Start play
            </button>
            <button
              class="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 transition hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-200"
              on:click={resetPlayState}
            >
              Reset path
            </button>
          </div>
        </div>
        <div
          class="flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400"
        >
          <span>
            <span class="font-semibold text-slate-700 dark:text-slate-200"
              >Steps</span
            >:
            {stepsTaken}
          </span>
          <span>
            <span class="font-semibold text-slate-700 dark:text-slate-200"
              >Status</span
            >:
            {gameStatus === "won"
              ? "Goal reached"
              : gameStatus === "playing"
                ? "In progress"
                : "Ready"}
          </span>
          <span>
            <span class="font-semibold text-slate-700 dark:text-slate-200"
              >Goal</span
            >: ({columns}, {rows})
          </span>
        </div>
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Controls: Arrow keys or WASD. Click the maze canvas below if the
          keyboard stops responding.
        </p>
      </div>
    </aside>
    <div class="flex flex-col gap-4">
      <div
        class="rounded-3xl border border-slate-200 bg-slate-950 p-4 shadow-lg dark:border-slate-700"
      >
        <div
          bind:this={playSurface}
          class="relative rounded-2xl outline-none transition focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900"
          class:ring-2={isPlayFocused}
          class:ring-emerald-400={isPlayFocused}
          class:ring-offset-2={isPlayFocused}
          class:ring-offset-slate-900={isPlayFocused}
          tabindex="0"
          role="application"
          aria-label="Random maze play area"
          on:keydown={handleKeyDown}
          on:focus={handlePlayFocus}
          on:blur={handlePlayBlur}
        >
          <canvas
            bind:this={canvasElement}
            class="mx-auto block h-auto max-h-[70vh] w-full max-w-full rounded-2xl bg-slate-950"
          >
            Your browser does not support the HTML canvas element.
          </canvas>
          <div
            class="pointer-events-none absolute left-4 top-4 rounded-full bg-slate-900/70 px-3 py-1 text-xs font-semibold text-white dark:bg-slate-800/80"
          >
            {gameStatus === "won"
              ? "Goal reached"
              : gameStatus === "playing"
                ? isPlayFocused
                  ? "Use arrow keys or WASD"
                  : "Click to capture keyboard"
                : "Press start to begin"}
          </div>
          {#if gameStatus === "won"}
            <div
              class="pointer-events-none absolute inset-0 flex items-center justify-center"
            >
              <div
                class="rounded-full bg-emerald-500/80 px-5 py-3 text-sm font-semibold text-emerald-950 shadow-lg dark:bg-emerald-400/70 dark:text-emerald-950"
              >
                Goal reached in {stepsTaken}
                {stepsTaken === 1 ? "step" : "steps"}!
              </div>
            </div>
          {/if}
        </div>
      </div>
      <details
        class="rounded-3xl border border-dashed border-slate-200 bg-white/70 px-5 py-4 text-sm shadow-inner dark:border-slate-700 dark:bg-slate-900/70"
      >
        <summary
          class="cursor-pointer font-semibold text-slate-700 dark:text-slate-200"
        >
          Tips for richer mazes
        </summary>
        <ul class="mt-3 space-y-2 text-xs text-slate-600 dark:text-slate-300">
          <li>
            • Combine multiple PNG exports in a graphics editor to create
            layered labyrinths.
          </li>
          <li>
            • Toggle the solution overlay before sharing to preserve the
            challenge.
          </li>
          <li>
            • Smaller cell sizes produce denser puzzles ideal for advanced
            solvers.
          </li>
        </ul>
      </details>
    </div>
  </div>
</section>
