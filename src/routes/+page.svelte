<script>
  import { Search, Card } from "flowbite-svelte";
  import { onMount } from "svelte";

  export let data;
  let query = "";
  let greeting = "";
  let currentDate = "";
  let favorites = [];
  let timeTicker;
  const isBrowser = typeof window !== "undefined";

  // Function to get the current greeting based on the time
  function updateGreeting() {
    const hours = new Date().getHours();
    if (hours >= 22 || hours < 5) {
      greeting = "Good Night";
    } else if (hours < 12) {
      greeting = "Good Morning";
    } else if (hours < 17) {
      greeting = "Good Afternoon";
    } else {
      greeting = "Good Evening";
    }
  }

  // Function to get the current date
  function updateDate() {
    const today = new Date();
    currentDate = today.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
    });
  }

  function syncClock() {
    updateGreeting();
    updateDate();
  }

  // Update greeting and date on load
  syncClock();

  onMount(() => {
    if (!isBrowser) {
      return;
    }
    initializeFavorites();
    timeTicker = window.setInterval(syncClock, 60_000);

    return () => {
      if (timeTicker) {
        window.clearInterval(timeTicker);
      }
    };
  });

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

  function handleCardPointer(event) {
    const card = event.currentTarget;
    const pointer = event.touches ? event.touches[0] : event;
    if (!card || !pointer) {
      return;
    }

    const rect = card.getBoundingClientRect();
    const x = ((pointer.clientX - rect.left) / rect.width) * 100;
    const y = ((pointer.clientY - rect.top) / rect.height) * 100;

    card.style.setProperty("--px", x.toFixed(2));
    card.style.setProperty("--py", y.toFixed(2));
  }

  function resetCardPointer(event) {
    const card = event.currentTarget;
    if (!card) {
      return;
    }
    card.style.removeProperty("--px");
    card.style.removeProperty("--py");
  }
</script>

<!-- Search / Hero -->
<section
  class="py-12 px-4 mx-auto max-w-screen-xl text-center lg:px-16"
>
  <h1
    class="my-4 text-4xl font-extrabold tracking-tight leading-none lg:text-6xl gradient-title"
  >
    {greeting}!
  </h1>
  <p class="muted mb-4 text-base lg:text-xl sm:px-16 xl:px-48">
    Today is {currentDate}
  </p>

  <div
    class="px-4 mx-auto text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-32 text-base lg:text-xl"
  >
    <!-- subtle frosted shell around the search -->
    <div class="p-2 hero-search">
      <Search bind:value={query} class="w-full search-input rounded-2xl" />
    </div>
  </div>
</section>

<!-- Favorites -->
{#if favorites.length}
  <section class="mt-10 px-4 mx-auto max-w-screen-xl">
    <div class="surface-panel rounded-3xl p-6 md:p-10 text-center">
      <h3
        class="mb-4 text-xl font-extrabold tracking-tight leading-none lg:text-3xl gradient-title"
      >
        Favorites
      </h3>

      <div class="grid grid-rows-2 gap-y-4 p-4 overflow-x-auto scrollbar-modern">
        <!-- First row -->
        <div class="flex gap-4 justify-start items-stretch px-4">
          {#each favorites.slice(0, Math.ceil(favorites.length / 2)) as tool}
            <Card
              href={tool.link}
              class="tool-card card-gradient theme-card"
              on:mousemove={handleCardPointer}
              on:mouseleave={resetCardPointer}
              on:touchmove={handleCardPointer}
              on:touchend={resetCardPointer}
            >
              <a href={tool.link} class="flex w-full items-start justify-between gap-4">
                <div class="flex-1 text-left space-y-2">
                  <h5 class="tool-title">{tool.name}</h5>
                  {#if tool.description}
                    <p class="tool-desc">
                      {tool.description.length > 60
                        ? tool.description.substring(0, 60) + "..."
                        : tool.description}
                    </p>
                  {/if}
                </div>

                <button
                  class={`favorite-toggle ${isFavorited(tool.name) ? "is-active" : ""}`}
                  on:click={(e) => {
                    e.preventDefault();
                    toggleFavorite(tool);
                  }}
                  aria-label="Toggle favorite"
                >
                  {isFavorited(tool.name) ? "\u2605" : "\u2606"}
                </button>
              </a>
            </Card>
          {/each}
        </div>

        <!-- Second row -->
        <div class="flex gap-4 justify-start items-stretch px-4">
          {#each favorites.slice(Math.ceil(favorites.length / 2)) as tool}
            <Card
              href={tool.link}
              class="tool-card card-gradient theme-card"
              on:mousemove={handleCardPointer}
              on:mouseleave={resetCardPointer}
              on:touchmove={handleCardPointer}
              on:touchend={resetCardPointer}
            >
              <a href={tool.link} class="flex w-full items-start justify-between gap-4">
                <div class="flex-1 text-left space-y-2">
                  <h5 class="tool-title">{tool.name}</h5>
                  {#if tool.description}
                    <p class="tool-desc">
                      {tool.description.length > 60
                        ? tool.description.substring(0, 60) + "..."
                        : tool.description}
                    </p>
                  {/if}
                </div>
                <button
                  class={`favorite-toggle ${isFavorited(tool.name) ? "is-active" : ""}`}
                  on:click={(e) => {
                    e.preventDefault();
                    toggleFavorite(tool);
                  }}
                  aria-label="Toggle favorite"
                >
                  {isFavorited(tool.name) ? "\u2605" : "\u2606"}
                </button>
              </a>
            </Card>
          {/each}
        </div>
      </div>
    </div>
  </section>
{/if}

<!-- Categories / Results -->
{#if query.trim() && filteredTools.length > 0}
  <section class="py-10 px-4 mx-auto max-w-screen-xl">
    <h3
      class="mb-4 text-xl lg:text-3xl font-extrabold leading-none gradient-title"
    >
      All Tools
    </h3>
    <div class="grid gap-2 space-y-0 grid-cols-2 lg:grid-cols-4 items-stretch">
      {#each filteredTools as tool}
        <Card
          href={tool.link}
          class="tool-card card-gradient theme-card"
          on:mousemove={handleCardPointer}
          on:mouseleave={resetCardPointer}
          on:touchmove={handleCardPointer}
          on:touchend={resetCardPointer}
        >
          <div class="space-y-2 text-left">
            <h5 class="tool-title">{tool.name}</h5>
            <p class="tool-desc">
              {tool.description && tool.description.length > 60
                ? tool.description.substring(0, 60) + "..."
                : tool.description || "No description available"}
            </p>
          </div>
        </Card>
      {/each}
    </div>
  </section>
{:else if query.trim() && filteredTools.length === 0}
  <section class="py-10 px-4 mx-auto max-w-screen-xl text-center">
    <p
      class="mb-4 text-2xl tracking-tight font-bold text-gray-900 lg:text-4xl dark:text-white"
    >
      No Results Found
    </p>
    <p
      class="muted mb-4 text-base lg:text-xl font-light"
    >
      We couldn't find any matching tool
    </p>
    <a
      href="/contact"
      class="primary-link font-medium text-xs lg:text-base px-5 py-2.5 text-center my-4"
    >
      Request this tool
    </a>
  </section>
{:else}
  {#each data.tools.categories as category}
    <section class="py-10 px-4 mx-auto max-w-screen-xl">
      <h2 class="text-xl lg:text-3xl font-bold gradient-title">
        {category.title}
      </h2>
      <p class="muted text-base lg:text-xl mb-4">
        {category.details}
      </p>
      <div class="grid gap-2 space-y-0 grid-cols-2 lg:grid-cols-4 items-stretch">
        {#each category.tools as tool}
          <Card
            href={tool.link}
            class="tool-card card-gradient theme-card"
            on:mousemove={handleCardPointer}
            on:mouseleave={resetCardPointer}
            on:touchmove={handleCardPointer}
            on:touchend={resetCardPointer}
          >
            <div class="space-y-2 text-left">
              <h5 class="tool-title">{tool.name}</h5>
              <p class="tool-desc">
                {tool.description && tool.description.length > 60
                  ? tool.description.substring(0, 60) + "..."
                  : tool.description || "No description available"}
              </p>
            </div>
          </Card>
        {/each}
      </div>
    </section>
  {/each}
{/if}
