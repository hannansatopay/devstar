<script lang="ts">
  import { onMount } from "svelte";
  import Copy from "$lib/Copy.svelte";

  const STORAGE_KEY = "devstar.notepad.content";
  const TITLE_KEY = "devstar.notepad.title";

  const isBrowser = typeof window !== "undefined";

  let title = "";
  let body = "";
  let autosaveEnabled = true;
  let status = "";
  let statusTimer: ReturnType<typeof setTimeout> | null = null;

  const templates = [
    {
      label: "Daily journal",
      value:
        "Today I accomplished:\n- \nTomorrow I want to focus on:\n- \nHighlights:\n- ",
    },
    {
      label: "Meeting notes",
      value:
        "Attendees:\n- \nAgenda:\n- \nKey decisions:\n- \nNext steps:\n- \nOwner / Deadline:\n- ",
    },
    {
      label: "Ideas scratchpad",
      value: "Idea:\nWhy it matters:\nFirst experiment:\nPotential blockers:\n",
    },
  ];

  $: characterCount = body.length;
  $: wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  $: readingTime = Math.max(1, Math.round(wordCount / 200));

  function notify(message: string) {
    status = message;
    if (statusTimer) clearTimeout(statusTimer);
    statusTimer = setTimeout(() => (status = ""), 2000);
  }

  function saveToStorage(manual = false) {
    if (!isBrowser || !autosaveEnabled) return;
    localStorage.setItem(STORAGE_KEY, body);
    localStorage.setItem(TITLE_KEY, title);
    if (manual) notify("Saved to browser storage");
  }

  function restoreFromStorage() {
    if (!isBrowser) return;
    title = localStorage.getItem(TITLE_KEY) ?? "";
    body = localStorage.getItem(STORAGE_KEY) ?? "";
  }

  function clearNote() {
    title = "";
    body = "";
    saveToStorage();
    notify("Cleared note");
  }

  function downloadNote() {
    const blob = new Blob([body], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${title || "notepad"}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    notify("Downloaded text file");
  }

  async function importNote(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    const text = await file.text();
    body = text;
    title = file.name.replace(/\.[^.]+$/, "");
    saveToStorage();
    notify("Imported note");
    input.value = "";
  }

  function applyTemplate(value: string) {
    body = value;
    notify("Applied template");
    saveToStorage();
  }

  onMount(() => {
    restoreFromStorage();
  });

  $: if (autosaveEnabled) {
    saveToStorage();
  }
</script>

<section class="space-y-6">
  <div
    class="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div
        class="flex flex-wrap gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400"
      >
        <span
          class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          {wordCount} words
        </span>
        <span
          class="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          {characterCount} characters
        </span>
        <span
          class="inline-flex items-center rounded-full bg-indigo-100 px-3 py-1 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-200"
        >
          {readingTime} min read
        </span>
      </div>
      <label
        class="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <span>Autosave</span>
        <input
          class="h-4 w-4 accent-indigo-600"
          type="checkbox"
          bind:checked={autosaveEnabled}
        />
      </label>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <label
        class="space-y-1 text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        <span>Title</span>
        <input
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={title}
          placeholder="Untitled note"
        />
      </label>

      <div class="space-y-2 text-xs text-slate-500 dark:text-slate-400">
        <p class="font-semibold uppercase tracking-wide">Templates</p>
        <div class="flex flex-wrap gap-2">
          {#each templates as template}
            <button
              class="rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
              type="button"
              on:click={() => applyTemplate(template.value)}
            >
              {template.label}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>

  <div
    class="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
  >
    <textarea
      class="h-[420px] w-full resize-none rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm font-mono text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900 sm:text-base"
      bind:value={body}
      placeholder="Start typing..."
    ></textarea>

    <div class="mt-4 flex flex-wrap items-center gap-3">
      <button
        class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
        type="button"
        on:click={() => saveToStorage(true)}
      >
        Save now
      </button>
      <button
        class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
        type="button"
        on:click={downloadNote}
      >
        Download .txt
      </button>
      <label
        class="inline-flex cursor-pointer items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
      >
        Import
        <input
          class="hidden"
          type="file"
          accept=".txt,.md,.json"
          on:change={importNote}
        />
      </label>
      <button
        class="inline-flex items-center rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-rose-800 dark:text-rose-200 dark:hover:bg-rose-900/30 dark:focus:ring-rose-700"
        type="button"
        on:click={clearNote}
      >
        Clear
      </button>
      <Copy text={body} label="Copy note" floating={false} />
    </div>

    {#if status}
      <p class="mt-3 text-xs text-emerald-600 dark:text-emerald-300">
        {status}
      </p>
    {/if}
  </div>
</section>
