<script lang="ts">
  import "../../app.pcss";
  import { onMount } from "svelte";

  export let data;

  const isBrowser = typeof window !== "undefined";
  const title = data?.meta?.title ?? "Devstar Tool";
  const description = data?.meta?.description ?? "";
  const categoryTitle = data?.meta?.categoryTitle ?? "Devstar Toolkit";

  let isBookmarked = false;
  function syncBookmark() {
    if (!isBrowser) return;
    const stored = JSON.parse(localStorage.getItem("favorites") || "[]");
    isBookmarked = stored.some(
      (entry: { name: string }) => entry.name === title,
    );
  }

  function toggleBookmark() {
    if (!isBrowser) return;
    const stored: Array<{ name: string; link: string; description: string }> =
      JSON.parse(localStorage.getItem("favorites") || "[]");
    const exists = stored.some((entry) => entry.name === title);
    let next = stored;

    if (exists) {
      next = stored.filter((entry) => entry.name !== title);
    } else {
      next = [
        ...stored,
        {
          name: title,
          link: window.location.pathname,
          description,
        },
      ];
    }

    localStorage.setItem("favorites", JSON.stringify(next));
    isBookmarked = !exists;
    dispatchBookmarkEvent(title, isBookmarked);
  }

  function dispatchBookmarkEvent(toolName: string, favorited: boolean) {
    if (!isBrowser) return;
    const event = new CustomEvent("bookmarkUpdated", {
      detail: { name: toolName, isFavorited: favorited },
    });
    window.dispatchEvent(event);
  }

  onMount(() => {
    syncBookmark();
  });
</script>

<div
  class="mx-auto max-w-7xl space-y-6 px-8 lg:px-12 2xl:px-16 py-12 lg:py-16 2xl:py-20"
>
  <header
    class="surface-panel rounded-3xl px-8 py-10 shadow-lg shadow-indigo-100/70 ring-1 ring-white/60 transition dark:shadow-slate-900/80 dark:ring-slate-800/60"
  >
    <p
      class="text-xs font-semibold uppercase tracking-[0.3em] text-indigo-500 dark:text-indigo-300"
    >
      {categoryTitle}
    </p>
    <div
      class="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
    >
      <h1 class="gradient-title text-3xl font-bold leading-tight sm:text-4xl">
        {title}
      </h1>
      <div class="flex items-center justify-start lg:justify-end">
        <button
          class={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700 ${
            isBookmarked
              ? "bg-indigo-600 text-white hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              : "border border-indigo-200 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-200 dark:hover:bg-indigo-900/40"
          }`}
          type="button"
          on:click={toggleBookmark}
        >
          {isBookmarked ? "Remove from favorites" : "Save to favorites"}
        </button>
      </div>
    </div>

    {#if description}
      <p
        class="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300"
      >
        {description}
      </p>
    {/if}
  </header>

  <div class="w-full max-w-full [&>*]:w-full [&>*]:max-w-full [&>*]:min-w-0">
    <slot />
  </div>
</div>
