<script>
  import { Avatar } from "flowbite-svelte";
  export let data;

  // Check if running in browser
  const isBrowser = typeof window !== "undefined";
  let isBookmarked = false;

  // Initialize bookmark state from localStorage
  $: if (isBrowser) {
    initializeBookmark();
  }

  // Function to initialize bookmark state
  function initializeBookmark() {
    if (localStorage) {
      const storedFavorites = JSON.parse(
        localStorage.getItem("favorites") || "[]"
      );
      isBookmarked = storedFavorites.some((fav) => fav.name === data.meta.name); // Using tool name to identify bookmarks
    }
  }

  // Toggle bookmark state and update localStorage
  function toggleBookmark() {
    let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    if (isBookmarked) {
      // Remove from favorites based on name
      favorites = favorites.filter((fav) => fav.name !== data.meta.name);
      isBookmarked = false;
    } else {
      // Add to favorites using unique name
      favorites = [
        {
          name: data.meta.title,
          description: data.meta.description,
          link: data.meta.link,
          contributors: data.meta.contributors,
        },
        ...favorites,
      ];
      isBookmarked = true;
    }

    localStorage.setItem("favorites", JSON.stringify(favorites));
    dispatchBookmarkEvent();
  }

  // Dispatch custom event to communicate between components
  function dispatchBookmarkEvent() {
    const event = new CustomEvent("bookmarkUpdated", {
      detail: { name: data.meta.name, isBookmarked },
    });
    window.dispatchEvent(event);
  }
</script>

<section class="bg-white dark:bg-gray-900">
  <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12 grid space-y-10">
    <div class="flex items-stretch">
      <h1
        class="text-3xl grow sm:text-4xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white"
      >
        {data.meta.title}
      </h1>
      <button
        on:click={toggleBookmark}
        class="self-start px-4 py-2 text-white rounded {isBookmarked
          ? 'bg-gray-600'
          : 'bg-blue-600'}"
      >
        {isBookmarked ? "Remove Bookmark" : "Add to Bookmark"}
      </button>
    </div>

    <div>
      <slot></slot>
    </div>

    <div>
      <h2
        class="mb-4 text-2xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white"
      >
        Details
      </h2>
      <p
        class="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400"
      >
        {data.meta.description}
      </p>
    </div>

    <div>
      <h2
        class="mb-4 text-2xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white"
      >
        Contributors
      </h2>
      <div class="flex items-center space-x-2">
        {#each data.meta.contributors as contributor}
          <a
            href="https://github.com/{contributor.githubId}"
            target="_blank"
            class="flex items-center space-x-2 font-medium inline-flex items-center justify-center px-2.5 py-1 text-sm text-gray-900 bg-gray-100 dark:bg-white border-primary-400 rounded"
          >
            <Avatar
              src="https://github.com/{contributor.githubId}.png"
              size="sm"
            />
            <div>{contributor.name}</div>
          </a>
        {/each}
      </div>
    </div>
  </div>
</section>
