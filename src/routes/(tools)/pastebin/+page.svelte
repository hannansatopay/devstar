<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import { browser } from "$app/environment";
  import { onMount } from "svelte";

  type Paste = {
    id: string;
    title: string;
    content: string;
    createdAt: string;
  };

  const STORAGE_KEY = "devstar-pastebin";

  let title = "Quick note";
  let content = "";
  let pastes: Paste[] = [];
  let selectedId: string | null = null;
  let toast = "";

  $: shareUrl =
    selectedId && browser
      ? `${window.location.origin}${window.location.pathname}?code=${selectedId}`
      : "";

  function loadPastes() {
    if (!browser) return;
    try {
      const cache = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      pastes = Array.isArray(cache) ? cache : [];
    } catch {
      pastes = [];
    }
  }

  function persist() {
    if (!browser) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pastes));
  }

  function generateId() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(
      { length: 8 },
      () => alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join("");
  }

  function savePaste() {
    const id = selectedId ?? generateId();
    const existingIndex = pastes.findIndex((item) => item.id === id);
    const record: Paste = {
      id,
      title: title.trim() || "Untitled note",
      content,
      createdAt:
        existingIndex >= 0
          ? pastes[existingIndex].createdAt
          : new Date().toISOString(),
    };
    if (existingIndex >= 0) {
      pastes = [record, ...pastes.filter((item) => item.id !== id)];
    } else {
      pastes = [record, ...pastes];
    }
    selectedId = id;
    persist();
    showToast("Paste saved locally.");
  }

  function loadPaste(id: string) {
    const entry = pastes.find((item) => item.id === id);
    if (!entry) return;
    selectedId = id;
    title = entry.title;
    content = entry.content;
  }

  function deletePaste(id: string) {
    pastes = pastes.filter((item) => item.id !== id);
    if (selectedId === id) {
      selectedId = null;
      title = "Quick note";
      content = "";
    }
    persist();
    showToast("Paste removed.");
  }

  function showToast(message: string) {
    toast = message;
    setTimeout(() => (toast = ""), 2000);
  }

  onMount(() => {
    loadPastes();
    if (!browser) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      const entry = pastes.find((item) => item.id === code);
      if (entry) {
        loadPaste(code);
      } else {
        showToast("Paste not found in local storage.");
      }
    }
  });
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)]">
    <div
      class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Saved pastes
        </h2>
        <span
          class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"
        >
          {pastes.length}
        </span>
      </div>
      {#if pastes.length === 0}
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Create your first paste to see it listed here.
        </p>
      {:else}
        <div class="space-y-2">
          {#each pastes as paste}
            <div
              class={`rounded-2xl border px-4 py-3 text-sm transition ${
                selectedId === paste.id
                  ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
                  : "border-slate-200 bg-slate-50 text-slate-600 hover:border-indigo-200 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
              }`}
            >
              <button
                type="button"
                class="w-full text-left"
                on:click={() => loadPaste(paste.id)}
              >
                <div class="flex items-center justify-between gap-3">
                  <span class="font-semibold text-slate-900 dark:text-white">
                    {paste.title}
                  </span>
                  <span class="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(paste.createdAt).toLocaleString()}
                  </span>
                </div>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  ID · {paste.id}
                </p>
              </button>
              <div class="mt-2 flex items-center justify-end gap-2">
                <Copy
                  text={`${browser ? window.location.origin + window.location.pathname : ""}?code=${paste.id}`}
                  label="Copy link"
                  floating={false}
                />
                <button
                  class="text-xs font-semibold uppercase tracking-wide text-rose-500 dark:text-rose-300"
                  type="button"
                  on:click={() => deletePaste(paste.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <div
      class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            Editor
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Notes are saved in localStorage; clearing browser data removes them.
          </p>
        </div>
        <div class="flex items-center gap-2">
          {#if shareUrl}
            <Copy text={shareUrl} label="Copy share URL" floating={false} />
          {/if}
          <button
            type="button"
            class="inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            on:click={savePaste}
          >
            Save paste
          </button>
          {#if toast}
            <p
              class="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-300"
            >
              {toast}
            </p>
          {/if}
        </div>
      </div>
      <label
        class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        <span>Title</span>
        <input
          class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
          type="text"
          bind:value={title}
        />
      </label>
      <label
        class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        <span>Content</span>
        <textarea
          class="h-[420px] rounded-2xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40"
          bind:value={content}
          spellcheck="false"
        />
      </label>
    </div>
  </div>
</section>
