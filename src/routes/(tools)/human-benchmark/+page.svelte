<script lang="ts">
  import { onDestroy, tick } from "svelte";

  type TimeoutRef = ReturnType<typeof setTimeout>;

  const scheduledTimeouts: TimeoutRef[] = [];

  const testOptions = [
    { id: "reaction", label: "Reaction Time" },
    { id: "aim", label: "Aim Trainer" },
    { id: "memory", label: "Sequence Memory" },
    { id: "stats", label: "Progress Journal" }
  ] as const;

  type TestId = (typeof testOptions)[number]["id"];

  let activeTest: TestId = "reaction";

  function queueTimeout(handler: () => void, delay: number) {
    const id = setTimeout(handler, delay);
    scheduledTimeouts.push(id);
    return id;
  }

  function clearTimeoutSafely(ref: TimeoutRef | null) {
    if (!ref) return;
    clearTimeout(ref);
    const idx = scheduledTimeouts.indexOf(ref);
    if (idx >= 0) {
      scheduledTimeouts.splice(idx, 1);
    }
  }

  function clearAllTimeouts() {
    scheduledTimeouts.splice(0).forEach(clearTimeout);
  }

  function randomBetween(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const randomInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  onDestroy(clearAllTimeouts);

  // Reaction test ---------------------------------------------------------------
  const reactionDelays = { min: 1200, max: 2800 };
  let reactionPhase: "idle" | "waiting" | "ready" | "tooSoon" = "idle";
  let reactionMessage = "Click inside the pad to begin.";
  let reactionTimeout: TimeoutRef | null = null;
  let reactionStart = 0;
  let reactionTimes: number[] = [];
  let reactionAverage: number | null = null;
  let reactionBest: number | null = null;
  let reactionHistory: { timestamp: number; result: number }[] = [];

  function startReactionTest() {
    reactionMessage = "Wait for emerald...";
    reactionPhase = "waiting";
    reactionTimeout = queueTimeout(() => {
      reactionPhase = "ready";
      reactionMessage = "Tap now!";
      reactionStart = performance.now();
    }, randomBetween(reactionDelays.min, reactionDelays.max));
  }

  function handleReactionClick() {
    if (reactionPhase === "idle") {
      resetReaction(false);
      startReactionTest();
      return;
    }

    if (reactionPhase === "waiting") {
      reactionPhase = "tooSoon";
      reactionMessage = "Too soon! Tap to try again.";
      clearTimeoutSafely(reactionTimeout);
      reactionTimeout = null;
      return;
    }

    if (reactionPhase === "ready") {
      const elapsed = Math.round(performance.now() - reactionStart);
      reactionTimes = [...reactionTimes.slice(-24), elapsed];
      reactionHistory = [...reactionHistory.slice(-19), { timestamp: Date.now(), result: elapsed }];
      reactionPhase = "idle";
      reactionMessage = `Your time: ${elapsed} ms. Tap to go again.`;
      clearTimeoutSafely(reactionTimeout);
      reactionTimeout = null;
      return;
    }

    if (reactionPhase === "tooSoon") {
      resetReaction(false);
      startReactionTest();
    }
  }

  function resetReaction(clearScores = true) {
    reactionPhase = "idle";
    reactionMessage = "Click inside the pad to begin.";
    clearTimeoutSafely(reactionTimeout);
    reactionTimeout = null;
    if (clearScores) {
      reactionTimes = [];
      reactionHistory = [];
    }
  }

  $: reactionAverage =
    reactionTimes.length > 0
      ? Math.round(reactionTimes.reduce((sum, value) => sum + value, 0) / reactionTimes.length)
      : null;
  $: reactionBest = reactionTimes.length > 0 ? Math.min(...reactionTimes) : null;

  // Aim trainer ------------------------------------------------------------------
  const AIM_TOTAL = 20;
  let aimWrapper: HTMLDivElement | null = null;
  let aimPhase: "idle" | "active" | "complete" = "idle";
  let aimShotsRemaining = AIM_TOTAL;
  let aimStart = 0;
  let aimTimes: number[] = [];
  let aimAverage: number | null = null;
  let aimBest: number | null = null;
  let aimTarget = { top: 40, left: 40, size: 64 };

  async function startAimTrainer() {
    aimPhase = "active";
    aimTimes = [];
    aimShotsRemaining = AIM_TOTAL;
    placeAimTarget();
    await tick();
    aimStart = performance.now();
  }

  function placeAimTarget() {
    if (!aimWrapper) return;
    const rect = aimWrapper.getBoundingClientRect();
    const size = Math.max(32, Math.min(rect.width, rect.height) * 0.14);
    const maxLeft = Math.max(0, rect.width - size);
    const maxTop = Math.max(0, rect.height - size);
    aimTarget = {
      left: randomBetween(0, maxLeft),
      top: randomBetween(0, maxTop),
      size
    };
  }

  function handleAimHit() {
    if (aimPhase !== "active") return;
    const shot = Math.round(performance.now() - aimStart);
    aimTimes = [...aimTimes, shot];
    aimShotsRemaining -= 1;

    if (aimShotsRemaining <= 0) {
      aimPhase = "complete";
      aimHistory = [...aimHistory.slice(-19), { timestamp: Date.now(), average: aimAverage ?? 0 }];
      return;
    }

    placeAimTarget();
    aimStart = performance.now();
  }

  function resetAimTrainer() {
    aimPhase = "idle";
    aimShotsRemaining = AIM_TOTAL;
    aimTimes = [];
  }

  $: aimAverage =
    aimTimes.length > 0
      ? Math.round(aimTimes.reduce((sum, value) => sum + value, 0) / aimTimes.length)
      : null;
  $: aimBest = aimTimes.length > 0 ? Math.min(...aimTimes) : null;

  let aimHistory: { timestamp: number; average: number }[] = [];

  // Sequence memory --------------------------------------------------------------
  const MEMORY_GRID = 3;
  const totalMemoryTiles = MEMORY_GRID * MEMORY_GRID;
  let memorySequence: number[] = [];
  let memoryPhase: "idle" | "display" | "input" | "failed" = "idle";
  let memoryIndex = 0;
  let memoryHighlight: number | null = null;
  let memoryBest = 0;
  let memoryHistory: { level: number; timestamp: number }[] = [];

  async function startMemoryChallenge() {
    if (memoryPhase === "display") return;
    memoryPhase = "display";
    memorySequence = [...memorySequence, randomInt(0, totalMemoryTiles - 1)];
    memoryIndex = 0;
    await tick();
    await animateMemorySequence();
    memoryPhase = "input";
  }

  async function animateMemorySequence() {
    for (const tile of memorySequence) {
      memoryHighlight = tile;
      await wait(520);
      memoryHighlight = null;
      await wait(160);
    }
  }

  async function handleMemoryTileClick(index: number) {
    if (memoryPhase !== "input") return;
    memoryHighlight = index;
    await wait(160);
    memoryHighlight = null;

    if (memorySequence[memoryIndex] === index) {
      memoryIndex += 1;
      if (memoryIndex >= memorySequence.length) {
        memoryBest = Math.max(memoryBest, memorySequence.length);
        memoryHistory = [...memoryHistory.slice(-19), { timestamp: Date.now(), level: memorySequence.length }];
        memoryPhase = "display";
        await wait(600);
        startMemoryChallenge();
      }
      return;
    }

    memoryPhase = "failed";
  }

  function resetMemoryChallenge() {
    memorySequence = [];
    memoryPhase = "idle";
    memoryIndex = 0;
    memoryHighlight = null;
  }

  function wait(duration: number) {
    return new Promise<void>((resolve) => {
      queueTimeout(() => resolve(), duration);
    });
  }

  const formatMetric = (value: number | null, suffix = "ms") =>
    value !== null ? `${value} ${suffix}` : "?";

  $: activeDrillLabel =
    testOptions.find((option) => option.id === activeTest)?.label ?? "Reaction Time";
</script>

<div class="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
  <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
    <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Reaction best</p>
      <p class="mt-2 text-2xl font-semibold text-emerald-500 dark:text-emerald-300">{formatMetric(reactionBest)}</p>
      <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">Fastest tap captured in this session.</p>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Aim average</p>
      <p class="mt-2 text-2xl font-semibold text-sky-500 dark:text-sky-300">{formatMetric(aimAverage)}</p>
      <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">Mean time across completed targets.</p>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Memory streak</p>
      <p class="mt-2 text-2xl font-semibold text-amber-500 dark:text-amber-300">{memoryBest > 0 ? `${memoryBest} tiles` : "?"}</p>
      <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">Longest sequence remembered without error.</p>
    </div>
    <div class="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
      <p class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Active drill</p>
      <p class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{activeDrillLabel}</p>
      <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">Switch drills below to focus on a specific skill.</p>
    </div>
  </section>

  <section class="mt-8 space-y-6">
    <div class="flex flex-wrap gap-3">
      {#each testOptions as option}
        <button
          class={`inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 dark:focus-visible:outline-slate-200 ${
            activeTest === option.id
              ? "border-emerald-400 bg-emerald-500/10 text-emerald-500 dark:border-emerald-500 dark:bg-emerald-500/10"
              : "border-slate-300 bg-white/60 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          }`}
          on:click={() => (activeTest = option.id)}
        >
          {option.label}
        </button>
      {/each}
    </div>

    {#if activeTest === "reaction"}
      <div class="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <article
          class={`flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/95 text-center shadow-sm transition hover:border-emerald-400 dark:border-slate-700 dark:bg-slate-900 ${
            reactionPhase === "ready" ? "bg-emerald-50 dark:bg-emerald-500/20" : ""
          }`}
          on:click={handleReactionClick}
        >
          <p class="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {reactionPhase === "tooSoon"
              ? "Too soon!"
              : reactionPhase === "ready"
              ? "Tap now!"
              : reactionPhase === "waiting"
              ? "Wait..."
              : "Reaction Time"}
          </p>
          <p class="mt-3 max-w-sm text-sm text-slate-600 dark:text-slate-300">{reactionMessage}</p>
        </article>

        <aside class="space-y-4 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <div>
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Session summary</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Average: {formatMetric(reactionAverage)} ? Best: {formatMetric(reactionBest)}
            </p>
          </div>
          <div class="space-y-2">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">Recent attempts</h3>
            {#if reactionHistory.length === 0}
              <p class="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                Run the drill to populate your log.
              </p>
            {:else}
              <ul class="space-y-2 text-xs">
                {#each [...reactionHistory].reverse().slice(0, 6) as entry}
                  <li class="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
                    <span class="font-medium text-slate-700 dark:text-slate-200">{entry.result} ms</span>
                    <span class="text-[11px] text-slate-500 dark:text-slate-400">{new Date(entry.timestamp).toLocaleTimeString()}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
          <div class="flex gap-2 text-xs">
            <button
              class="flex-1 rounded-full border border-transparent bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-600"
              on:click={() => (reactionPhase === "idle" ? startReactionTest() : resetReaction())}
            >
              {reactionPhase === "idle" ? "Start" : "Reset"}
            </button>
            <button
              class="rounded-full border border-slate-300 px-3 py-2 font-medium text-slate-600 transition hover:border-slate-500 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300"
              on:click={() => {
                reactionHistory = [];
                resetReaction();
              }}
            >
              Clear log
            </button>
          </div>
        </aside>
      </div>
    {:else if activeTest === "aim"}
      <div class="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div
          class={`relative flex min-h-[320px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition dark:border-slate-700 dark:bg-slate-900 ${
            aimPhase === "complete" ? "ring-2 ring-sky-300 dark:ring-sky-500" : ""
          }`}
          bind:this={aimWrapper}
        >
          {#if aimPhase !== "active"}
            <div class="text-center">
              <p class="text-lg font-semibold text-slate-800 dark:text-slate-100">
                {aimPhase === "complete" ? "Completed" : "Aim trainer"}
              </p>
              <p class="mt-3 text-sm text-slate-600 dark:text-slate-300">
                {aimPhase === "complete"
                  ? "Great work! Review your average and try beating it."
                  : "Hit each target as quickly as you can. 20 targets per run."}
              </p>
            </div>
          {/if}

          <button
            class="absolute flex translate-x-[-50%] translate-y-[-50%] items-center justify-center rounded-full bg-sky-500 text-white shadow-lg transition hover:bg-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-200"
            style={`left:${aimTarget.left}px; top:${aimTarget.top}px; width:${aimTarget.size}px; height:${aimTarget.size}px;`}
            on:click={handleAimHit}
            disabled={aimPhase !== "active"}
          >
            ?
          </button>
          {#if aimPhase === "active"}
            <p class="absolute bottom-4 text-xs font-medium text-slate-600 dark:text-slate-300">
              {aimShotsRemaining} targets remaining
            </p>
          {/if}
        </div>

        <aside class="space-y-4 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
          <div>
            <h2 class="text-base font-semibold text-slate-900 dark:text-white">Session summary</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Average: {formatMetric(aimAverage)} ? Best: {formatMetric(aimBest)}
            </p>
          </div>
          <div class="flex gap-2 text-xs">
            <button
              class="flex-1 rounded-full border border-transparent bg-sky-500 px-4 py-2 font-semibold text-white transition hover:bg-sky-600"
              on:click={startAimTrainer}
            >
              {aimPhase === "active" ? "Restart" : "Start"}
            </button>
            <button
              class="rounded-full border border-slate-300 px-3 py-2 font-medium text-slate-600 transition hover:border-slate-500 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300"
              on:click={resetAimTrainer}
            >
              Reset
            </button>
          </div>
          <div class="space-y-2">
            <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">Previous sessions</h3>
            {#if aimHistory.length === 0}
              <p class="rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                Complete a run to populate your log.
              </p>
            {:else}
              <ul class="space-y-2 text-xs">
                {#each [...aimHistory].reverse().slice(0, 5) as entry}
                  <li class="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
                    <span class="font-medium text-slate-700 dark:text-slate-200">{entry.average} ms</span>
                    <span class="text-[11px] text-slate-500 dark:text-slate-400">{new Date(entry.timestamp).toLocaleString()}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </aside>
      </div>
    {:else if activeTest === "memory"}
      <div class="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <div class="flex flex-col gap-6">
          <div class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
            <div class="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Sequence memory</h2>
                <p class="text-sm text-slate-600 dark:text-slate-300">Repeat the illuminated tiles. Each round adds a new tile.</p>
              </div>
              <div class="flex gap-2 text-xs">
                <span class="rounded-full bg-emerald-100 px-3 py-1 font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">Level {memorySequence.length}</span>
                <span class="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-200">Best {memoryBest}</span>
              </div>
            </div>
          </div>

          <div class="grid aspect-square max-w-lg grid-cols-3 gap-3 self-center">
            {#each Array(totalMemoryTiles) as _, index}
              <button
                class={`aspect-square rounded-2xl border border-slate-200 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 ${
                  memoryHighlight === index
                    ? memoryPhase === "failed"
                      ? "bg-rose-400"
                      : "bg-emerald-400"
                    : memoryPhase === "input"
                    ? "bg-slate-100 hover:bg-emerald-200 dark:bg-slate-800"
                    : "bg-slate-200 dark:bg-slate-800"
                }`}
                on:click={() => handleMemoryTileClick(index)}
                disabled={memoryPhase !== "input"}
              />
            {/each}
          </div>
        </div>
        <aside class="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-lg dark:border-slate-700 dark:bg-slate-900/80">
          <p class="text-sm text-slate-600 dark:text-slate-300">
            {memoryPhase === "idle"
              ? "Tap Start to begin. Watch the pattern closely."
              : memoryPhase === "display"
              ? "Memorise the pattern ? your turn is next."
              : memoryPhase === "input"
              ? "Repeat the pattern by tapping the tiles."
              : "Sequence missed. Reset to try again."}
          </p>
          <div class="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <button
              class="flex-1 rounded-full border border-transparent bg-emerald-500 px-4 py-2 font-semibold text-white transition hover:bg-emerald-600"
              on:click={() => {
                if (memoryPhase === "idle" || memoryPhase === "failed") {
                  resetMemoryChallenge();
                  startMemoryChallenge();
                } else if (memoryPhase === "input") {
                  startMemoryChallenge();
                }
              }}
            >
              {memoryPhase === "idle"
                ? "Start"
                : memoryPhase === "failed"
                ? "Try again"
                : "Add next tile"}
            </button>
            <button
              class="rounded-full border border-slate-300 px-3 py-2 font-medium text-slate-600 transition hover:border-slate-500 hover:text-slate-800 dark:border-slate-700 dark:text-slate-300"
              on:click={() => {
                memoryHistory = [];
                memoryBest = 0;
                resetMemoryChallenge();
              }}
            >
              Reset
            </button>
          </div>
          <div>
            <h3 class="text-xs font-semibold uppercase tracking-wide text-slate-600 dark:text-slate-400">Completed streaks</h3>
            {#if memoryHistory.length === 0}
              <p class="mt-2 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800/70 dark:text-slate-400">
                Your cleared rounds will appear here.
              </p>
            {:else}
              <ul class="mt-3 space-y-2 text-xs">
                {#each [...memoryHistory].reverse().slice(0, 6) as item}
                  <li class="flex items-center justify-between rounded-xl bg-slate-100 px-3 py-2 dark:bg-slate-800">
                    <span class="font-medium text-slate-700 dark:text-slate-200">Level {item.level}</span>
                    <span class="text-[11px] text-slate-500 dark:text-slate-400">{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </li>
                {/each}
              </ul>
            {/if}
          </div>
        </aside>
      </div>
    {:else}
      <div class="grid gap-6 lg:grid-cols-2">
        <section class="space-y-4 rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-white p-6 shadow-lg dark:border-slate-700 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Training log</h2>
          <p class="text-sm text-slate-600 dark:text-slate-300">Quick snapshots from recent sessions.</p>
          <div class="space-y-3 text-sm">
            <div class="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80">
              <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Reaction</p>
              {#if reactionHistory.length === 0}
                <p class="mt-1 text-slate-600 dark:text-slate-300">Run a few attempts to populate the trend.</p>
              {:else}
                <div class="mt-2 flex flex-wrap gap-2">
                  {#each [...reactionHistory].slice(-6) as entry}
                    <span class="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-300">{entry.result} ms</span>
                  {/each}
                </div>
              {/if}
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80">
              <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Aim</p>
              {#if aimHistory.length === 0}
                <p class="mt-1 text-slate-600 dark:text-slate-300">Complete a run to unlock insights.</p>
              {:else}
                <div class="mt-2 flex flex-wrap gap-2">
                  {#each [...aimHistory].slice(-6) as entry}
                    <span class="rounded-full bg-sky-500/10 px-3 py-1 text-xs font-medium text-sky-600 dark:text-sky-300">{entry.average} ms</span>
                  {/each}
                </div>
              {/if}
            </div>
            <div class="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 dark:border-slate-700 dark:bg-slate-900/80">
              <p class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Memory</p>
              {#if memoryHistory.length === 0}
                <p class="mt-1 text-slate-600 dark:text-slate-300">Keep pushing to extend your streak.</p>
              {:else}
                <div class="mt-2 flex flex-wrap gap-2">
                  {#each [...memoryHistory].slice(-6) as entry}
                    <span class="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600 dark:text-amber-300">Level {entry.level}</span>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        </section>
        <section class="space-y-4 rounded-3xl border border-dashed border-slate-200 bg-white/80 p-6 shadow-inner dark:border-slate-700 dark:bg-slate-900/60">
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">Focus cues</h2>
          <div class="space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>? Keep a consistent posture and steady breathing before each run.<br />? Track environment changes that affect performance.<br />? Practise short, focused sessions.</p>
            <textarea
              class="w-full rounded-2xl border border-slate-300 bg-white/70 p-4 text-sm text-slate-700 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-emerald-500"
              rows="6"
              placeholder="Capture quick reflections, distractions, or improvement ideas from today's session."
            />
            <p class="text-xs text-slate-500 dark:text-slate-400">Notes stay local to this browser.</p>
          </div>
        </section>
      </div>
    {/if}
  </section>
</div>
