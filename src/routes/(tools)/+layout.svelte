<script>
  import { Avatar } from "flowbite-svelte";
  export let data;

  const isBrowser = typeof window !== "undefined";
  let isBookmarked = false;

  // Initialize bookmark state from localStorage
  $: if (isBrowser) {
    initializeBookmark();
  }

  $: layoutClass = (() => {
    const length = data.meta.contributors.length;

    // Small devices
    if (length < 5) {
      return "grid grid-cols-2 gap-2 md:flex md:items-center";
    }

    // Large devices
    return "grid grid-cols-2 gap-2 md:grid-cols-5 lg:flex lg:items-center";
  })();

  // Initialize Bookmark
  function initializeBookmark() {
    if (localStorage) {
      const storedBookmarks =
        JSON.parse(localStorage.getItem("favorites")) || [];
      isBookmarked = storedBookmarks.some(
        (bookmark) => bookmark.name === data.meta.title,
      );
    }
  }

  // Toggle Bookmark
  function toggleBookmark() {
    if (isBrowser && localStorage) {
      let bookmarks = JSON.parse(localStorage.getItem("favorites")) || [];

      if (isBookmarked) {
        bookmarks = bookmarks.filter(
          (bookmark) => bookmark.name !== data.meta.title,
        );
      } else {
        bookmarks.push({
          name: data.meta.title,
          link: window.location.pathname,
          description: data.meta.description,
          contributors: data.meta.contributors || [],
        });
      }

      localStorage.setItem("favorites", JSON.stringify(bookmarks));
      isBookmarked = !isBookmarked;
      dispatchBookmarkEvent(data.meta.title, isBookmarked);
    }
  }

  // Dispatch Custom Event for Bookmark Update
  function dispatchBookmarkEvent(toolName, isFavorited) {
    const event = new CustomEvent("bookmarkUpdated", {
      detail: { name: toolName, isFavorited },
    });
    window.dispatchEvent(event);
  }
</script>

<section class="bg-white dark:bg-gray-900">
  <div class="p-4 md:p-8 mx-auto max-w-screen-xl grid space-y-6 lg:space-y-10">
    <div class="flex items-stretch">
      <h1
        class="text-2xl grow lg:text-4xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white"
      >
        {data.meta.title}
      </h1>
      <button
        on:click={toggleBookmark}
        class="text-md lg:text-xl self-start px-4 py-2 rounded {isBookmarked
          ? 'bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white'
          : 'bg-gray-400 dark:bg-gray-600 text-white dark:text-white'}"
      >
        {isBookmarked ? "Remove Bookmark" : "Add to Bookmark"}
      </button>
    </div>

    <div>
      <slot></slot>
    </div>

    <div>
      <h2
        class="mb-4 text-lg lg:text-2xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white"
      >
        Details
      </h2>
      <p
        class="text-md lg:text-xl font-normal text-gray-500 dark:text-gray-400"
      >
        {data.meta.description}
      </p>
    </div>

    <div>
      <h2
        class="mb-4 text-lg lg:text-2xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white"
      >
        Contributors
      </h2>
      <div class={layoutClass}>
        {#each data.meta.contributors as contributor}
          <a
            href="https://github.com/{contributor.githubId}"
            target="_blank"
            class="flex space-x-2 font-medium items-center justify-center px-2.5 py-1 text-sm text-gray-900 bg-gray-100 dark:bg-white border-primary-400 rounded"
          >
            <Avatar
              src="https://github.com/{contributor.githubId}.png"
              size="sm"
            />
            <div class="overflow-hidden">{contributor.name}</div>
          </a>
        {/each}
      </div>
    </div>
  </div>
</section>
