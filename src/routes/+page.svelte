<script>
  import { Search, Card } from "flowbite-svelte";

  export let data;
  let query = "";
  let greeting = "";
  let currentDate = "";
  let favorites = [];

  // Function to get the current greeting based on the time
  function updateGreeting() {
    const hours = new Date().getHours();
    if (hours < 12) {
      greeting = "Good Morning";
    } else if (hours < 18) {
      greeting = "Good Afternoon";
    } else {
      greeting = "Good Evening";
    }
  }

  // Function to get the current date
  function updateDate() {
    const today = new Date();
    currentDate = today.toLocaleDateString(undefined, {
      // weekday: "long",
      // year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  // Update greeting and date on load
  updateGreeting();
  updateDate();

  // Check if running in browser
  const isBrowser = typeof window !== "undefined";

  // Initialize favorites only in the browser
  $: if (isBrowser) {
    initializeFavorites();
  }

  // Filter tools based on search query
  $: filteredTools = query.trim()
    ? data.tools.categories.reduce((acc, category) => {
        const matchedTools = category.tools.filter((tool) =>
          tool.name.toLowerCase().includes(query.toLowerCase()),
        );
        return [...acc, ...matchedTools];
      }, [])
    : [];

  // Function to initialize favorites from localStorage
  function initializeFavorites() {
    if (localStorage) {
      const storedFavorites = localStorage.getItem("favorites");
      if (storedFavorites) {
        favorites = JSON.parse(storedFavorites);
      }
    }
  }

  // Check if a tool is favorited
  function isFavorited(toolName) {
    return favorites.some((fav) => fav.name === toolName);
  }

  // Toggle favorite state for a tool
  function toggleFavorite(tool) {
    if (isFavorited(tool.name)) {
      favorites = favorites.filter((fav) => fav.name !== tool.name);
    } else {
      favorites = [
        ...favorites,
        {
          name: tool.name,
          link: tool.link,
          description: tool.description,
          contributors: tool.contributors || [],
        },
      ];
    }

    // Update favorites in localStorage only in the browser
    if (isBrowser && localStorage) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
      dispatchBookmarkEvent(tool.name, isFavorited(tool.name));
    }
  }

  function dispatchBookmarkEvent(toolName, isFavorited) {
    const event = new CustomEvent("bookmarkUpdated", {
      detail: { name: toolName, isFavorited },
    });
    window.dispatchEvent(event);
  }
</script>

<!-- Search Section -->
<section
  class="bg-white dark:bg-gray-900 py-8 px-4 mx-auto max-w-screen-xl text-center lg:px-12"
>
  <h1
    class="my-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 lg:text-6xl dark:text-white"
  >
    {greeting}!
  </h1>
  <p
    class="mb-4 text-base font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400"
  >
    Today is {currentDate}
  </p>
  <div
    class="px-4 mx-auto text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-32 text-base lg:text-xl"
  >
    <Search bind:value={query} />
  </div>
</section>

<!-- Favorites Section -->
{#if favorites.length}
  <section
    class="bg-gray-100 dark:bg-gray-800 mt-6 p-8 mx-auto max-w-screen-xl text-center rounded-xl"
  >
    <h3
      class="mb-4 text-xl font-extrabold tracking-tight leading-none text-gray-900 lg:text-3xl dark:text-white"
    >
      Favorites
    </h3>
    <div
      class="grid grid-rows-2 gap-y-4 px-4 overflow-x-auto scrollbar-modern scrollbar-thumb-gray-400 scrollbar-track-gray-200 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
    >
      <!-- First row -->
      <div class="flex gap-4 justify-start px-4">
        {#each favorites.slice(0, Math.ceil(favorites.length / 2)) as tool}
          <Card
            href={tool.link}
            class="bg-white dark:bg-gray-900 flex-shrink-0"
          >
            <a href={tool.link} class="flex w-full">
              <h5
                class="text-sm lg:text-lg text-gray-500 dark:text-gray-400 mr-6"
              >
                {tool.name}
              </h5>
              <button
                on:click={(e) => {
                  e.preventDefault();
                  toggleFavorite(tool);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="16"
                  width="16"
                  viewBox="0 0 384 512"
                  class="fill-current text-gray-500 dark:text-gray-400"
                >
                  <path
                    d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                  />
                </svg>
              </button>
            </a>
          </Card>
        {/each}
      </div>

      <!-- Second row -->
      <div class="flex gap-4 justify-start px-4">
        {#each favorites.slice(Math.ceil(favorites.length / 2)) as tool}
          <Card
            href={tool.link}
            class="bg-white dark:bg-gray-900 flex-shrink-0"
          >
            <a href={tool.link} class="flex w-full">
              <h5
                class="text-sm lg:text-lg text-gray-500 dark:text-gray-400 mr-6"
              >
                {tool.name}
              </h5>
              <button
                on:click={(e) => {
                  e.preventDefault();
                  toggleFavorite(tool);
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="16"
                  width="16"
                  viewBox="0 0 384 512"
                  class="fill-current text-gray-500 dark:text-gray-400"
                >
                  <path
                    d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                  />
                </svg>
              </button>
            </a>
          </Card>
        {/each}
      </div>
    </div>
  </section>
{/if}

<!-- Categories Section -->
{#if query.trim() && filteredTools.length > 0}
  <section class="bg-white dark:bg-gray-900 py-10 px-4 mx-auto max-w-screen-xl">
    <h3
      class="mb-4 text-xl lg:text-3xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white"
    >
      All Tools
    </h3>
    <div class="grid gap-2 space-y-0 grid-cols-2 lg:grid-cols-4">
      {#each filteredTools as tool}
        <Card href={tool.link}>
          <h5
            class="text-base lg:text-xl font-semibold tracking-tight text-gray-900 dark:text-white"
          >
            {tool.name}
          </h5>
          <p class="text-sm lg:text-lg">
            {tool.description && tool.description.length > 60
              ? tool.description.substring(0, 60) + "..."
              : tool.description || "No description available"}
          </p>
        </Card>
      {/each}
    </div>
  </section>
{:else if query.trim() && filteredTools.length === 0}
  <section
    class="bg-white dark:bg-gray-900 py-10 px-4 mx-auto max-w-screen-xl text-center"
  >
    <p
      class="mb-4 text-2xl tracking-tight font-bold text-gray-900 lg:text-4xl dark:text-white"
    >
      No Results Found
    </p>
    <p
      class="mb-4 text-base lg:text-xl font-light text-gray-500 dark:text-gray-400"
    >
      We couldn't find any matching tool
    </p>
    <a
      href="/contact"
      class="font-medium text-xs lg:text-base px-5 py-2.5 text-center my-4 text-gray-500 dark:text-gray-400 underline"
    >
      Request this tool
    </a>
  </section>
{:else}
  {#each data.tools.categories as category}
    <section
      class="bg-white dark:bg-gray-900 py-10 px-4 mx-auto max-w-screen-xl"
    >
      <h2 class="text-xl lg:text-3xl font-bold text-gray-900 dark:text-white">
        {category.title}
      </h2>
      <p class="text-base lg:text-xl mb-4 text-gray-500 dark:text-gray-400">
        {category.details}
      </p>
      <div class="grid gap-2 space-y-0 grid-cols-2 lg:grid-cols-4">
        {#each category.tools as tool}
          <Card href={tool.link}>
            <h5
              class="text-base lg:text-xl font-semibold tracking-tight text-gray-900 dark:text-white"
            >
              {tool.name}
            </h5>
            <p class="text-sm lg:text-lg">
              {tool.description && tool.description.length > 60
                ? tool.description.substring(0, 60) + "..."
                : tool.description || "No description available"}
            </p>
          </Card>
        {/each}
      </div>
    </section>
  {/each}
{/if}
