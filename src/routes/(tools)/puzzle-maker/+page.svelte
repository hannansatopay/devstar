<script lang="ts">
  import CrosswordBuilder from "./CrosswordBuilder.svelte";
  import SudokuBuilder from "./SudokuBuilder.svelte";
  import WordSearchBuilder from "./WordSearchBuilder.svelte";

  const tabs = [
    { id: "wordsearch", label: "Word Search", accent: "text-emerald-500" },
    { id: "crossword", label: "Crossword", accent: "text-indigo-500" },
    { id: "sudoku", label: "Sudoku", accent: "text-emerald-500" },
  ] as const;

  type TabId = (typeof tabs)[number]["id"];
  let activeTab: TabId = "wordsearch";
</script>

<section class="space-y-6">
  <div class="flex flex-wrap gap-3">
    {#each tabs as tab}
      <button
        class="inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 {activeTab ===
        tab.id
          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-500 dark:border-emerald-500'
          : 'border-slate-300 bg-white/60 text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'}"
        on:click={() => (activeTab = tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  {#if activeTab === "wordsearch"}
    <WordSearchBuilder />
  {:else if activeTab === "crossword"}
    <CrosswordBuilder />
  {:else}
    <SudokuBuilder />
  {/if}
</section>
