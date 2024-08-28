<script>
  import { Search } from "flowbite-svelte";
  import { Card } from "flowbite-svelte";

  export let data;
  let query = "";
  let favorites = [];

  // Check if running in browser
  const isBrowser = typeof window !== "undefined";

  // Initialize favorites only in the browser
  $: if (isBrowser) {
    initializeFavorites();
  }

  // Filter tools based on search query
  $: results = Object.values(data.tools).filter((tool) => {
    return (
      tool.name.toLowerCase().includes(query.toLowerCase()) ||
      tool.description.toLowerCase().includes(query.toLowerCase())
    );
  });

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
  function isFavorited(toolId) {
    return favorites.some((fav) => fav.id === toolId);
  }

  // Toggle favorite state for a tool
  function toggleFavorite(tool) {
    if (isFavorited(tool.id)) {
      favorites = favorites.filter((fav) => fav.id !== tool.id);
    } else {
      favorites = [...favorites, tool];
    }

    // Update favorites in localStorage only in the browser
    if (isBrowser && localStorage) {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }
</script>

<section class="bg-white dark:bg-gray-900">
  <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:px-12">
    <!-- <a href="#" class="inline-flex justify-between items-center py-1 px-1 pr-4 mb-7 text-sm text-gray-700 bg-gray-100 rounded-full dark:bg-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700">	
			<span class="text-xs bg-blue-600 rounded-full text-white px-4 py-1.5 mr-3">New</span>	
			<span class="text-sm font-medium">Phase-I launched! Explore the story</span>	
			<i class="icon-angle-right ml-2" />	
		</a> -->
    <h1
      class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white"
    >
      A Comprehensive Developer Toolkit
    </h1>
    <p
      class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400"
    >
      Maximize your efficiency and productivity as a developer with our free
      online developer toolkit. Experience the convenience of our user-friendly
      platform and unlock your full potential.
    </p>
    <div
      class="px-4 mx-auto text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-36"
    >
      <Search bind:value={query} />
    </div>
  </div>
</section>

<!-- Favorites Section -->
<section class="bg-white dark:bg-gray-900 mt-6">
  <div class="py-4 px-4 mx-auto max-w-screen-xl">
    <h3
      class="mb-4 text-xl font-extrabold tracking-tight leading-none text-gray-900 md:text-xl lg:text-3xl dark:text-white"
    >
      Favorites
    </h3>
    {#if favorites.length}
      <div
        class="grid gap-2 grid-cols-2 lg:grid-cols-4 justify-items-center mt-6 mb-10"
      >
        {#each favorites as tool}
          <Card href={tool.link}>
            <a href={tool.link} class="flex flex-col h-full w-full">
              <div class="flex mb-2 items-stretch">
                <h5
                  class="text-lg grow font-semibold tracking-tight text-gray-900 dark:text-white"
                >
                  {tool.name}
                </h5>
                <button
                  on:click={(e) => {
                    e.preventDefault();
                    toggleFavorite(tool);
                  }}
                  class="self-start"
                >
                  {#if isFavorited(tool.id)}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="14"
                      width="15.75"
                      viewBox="0 0 576 512"
                      ><path
                        fill="#0ea5e9"
                        d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
                      /></svg
                    >
                  {:else}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="14"
                      width="15.75"
                      viewBox="0 0 576 512"
                      ><path
                        fill="#0ea5e9"
                        d="M287.9 0c9.2 0 17.6 5.2 21.6 13.5l68.6 141.3 153.2 22.6c9 1.3 16.5 7.6 19.3 16.3s.5 18.1-5.9 24.5L433.6 328.4l26.2 155.6c1.5 9-2.2 18.1-9.7 23.5s-17.3 6-25.3 1.7l-137-73.2L151 509.1c-8.1 4.3-17.9 3.7-25.3-1.7s-11.2-14.5-9.7-23.5l26.2-155.6L31.1 218.2c-6.5-6.4-8.7-15.9-5.9-24.5s10.3-14.9 19.3-16.3l153.2-22.6L266.3 13.5C270.4 5.2 278.7 0 287.9 0zm0 79L235.4 187.2c-3.5 7.1-10.2 12.1-18.1 13.3L99 217.9 184.9 303c5.5 5.5 8.1 13.3 6.8 21L171.4 443.7l105.2-56.2c7.1-3.8 15.6-3.8 22.6 0l105.2 56.2L384.2 324.1c-1.3-7.7 1.2-15.5 6.8-21l85.9-85.1L358.6 200.5c-7.8-1.2-14.6-6.1-18.1-13.3L287.9 79z"
                      /></svg
                    >
                  {/if}
                </button>
              </div>
              <p>
                {tool.description.length > 80
                  ? tool.description.substring(0, 80) + "..."
                  : tool.description}
              </p>
            </a>
          </Card>
        {/each}
      </div>
    {:else}
      <p class="text-gray-500 dark:text-gray-400">
        No favorite tools added yet.
      </p>
    {/if}
    <hr />
  </div>
</section>

<!-- All Tools Section -->
<section class="bg-white dark:bg-gray-900 mt-6">
  <div class="py-4 px-4 mx-auto max-w-screen-xl">
    <h3
      class="mb-4 text-xl font-extrabold tracking-tight leading-none text-gray-900 md:text-xl lg:text-3xl dark:text-white"
    >
      All Tools
    </h3>
    {#if results.length}
      <div
        class="grid gap-2 grid-cols-2 lg:grid-cols-4 justify-items-center mt-6"
      >
        {#each results as tool}
          <Card href={tool.link}>
            <div class="flex mb-2 items-stretch">
              <h5
                class="text-lg grow font-semibold tracking-tight text-gray-900 dark:text-white"
              >
                {tool.name}
              </h5>
              <button on:click={() => toggleFavorite(tool)} class="self-start">
                {#if isFavorited(tool.id)}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="14"
                    width="15.75"
                    viewBox="0 0 576 512"
                    ><path
                      fill="#0ea5e9"
                      d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329 113.2 474.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329 542.7 225.9c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7L381.2 150.3 316.9 18z"
                    /></svg
                  >
                {:else}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="14"
                    width="15.75"
                    viewBox="0 0 576 512"
                    ><path
                      fill="#0ea5e9"
                      d="M287.9 0c9.2 0 17.6 5.2 21.6 13.5l68.6 141.3 153.2 22.6c9 1.3 16.5 7.6 19.3 16.3s.5 18.1-5.9 24.5L433.6 328.4l26.2 155.6c1.5 9-2.2 18.1-9.7 23.5s-17.3 6-25.3 1.7l-137-73.2L151 509.1c-8.1 4.3-17.9 3.7-25.3-1.7s-11.2-14.5-9.7-23.5l26.2-155.6L31.1 218.2c-6.5-6.4-8.7-15.9-5.9-24.5s10.3-14.9 19.3-16.3l153.2-22.6L266.3 13.5C270.4 5.2 278.7 0 287.9 0zm0 79L235.4 187.2c-3.5 7.1-10.2 12.1-18.1 13.3L99 217.9 184.9 303c5.5 5.5 8.1 13.3 6.8 21L171.4 443.7l105.2-56.2c7.1-3.8 15.6-3.8 22.6 0l105.2 56.2L384.2 324.1c-1.3-7.7 1.2-15.5 6.8-21l85.9-85.1L358.6 200.5c-7.8-1.2-14.6-6.1-18.1-13.3L287.9 79z"
                    /></svg
                  >
                {/if}
              </button>
            </div>
            <p>
              {tool.description.length > 80
                ? tool.description.substring(0, 80) + "..."
                : tool.description}
            </p>
          </Card>
        {/each}
      </div>
    {:else}
      <div class="mx-auto max-w-screen-xl">
        <div class="mx-auto max-w-screen-sm text-center">
          <p
            class="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white"
          >
            No Results Found
          </p>
          <p class="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
            We couldn't find any matching tool
          </p>
          <a
            href="/contact"
            class="font-medium text-sm px-5 py-2.5 text-center my-4 text-gray-500 dark:text-gray-400 underline"
          >
            Request this tool
          </a>
        </div>
      </div>
    {/if}
  </div>
</section>
