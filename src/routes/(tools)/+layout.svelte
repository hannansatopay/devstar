<script>
  import { Avatar } from 'flowbite-svelte';

  export let data;
</script>

<section class="bg-white dark:bg-gray-900">
<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12 grid space-y-10">
  <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white">
    {data.meta.title}
  </h1>

    <div>
      <slot></slot>
    </div>

    <div>
      <h2 class="mb-4 text-2xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white">Details</h2>
      <p class="text-lg font-normal text-gray-500 lg:text-xl dark:text-gray-400">
        {data.meta.description}
      </p>
    </div>

    <div>
      <h2 class="mb-4 text-2xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white">Contributors</h2>
      <div class="flex items-center space-x-2">
          {#each data.meta.contributors as contributor}
              <a href="https://github.com/{contributor.githubId}" target="_blank" class="flex space-x-2 font-medium items-center justify-center px-2.5 py-1 text-sm text-gray-900 bg-gray-100 dark:bg-white border-primary-400 rounded">
                  <Avatar src="https://github.com/{contributor.githubId}.png" size="sm"/>
                  <div>{contributor.name}</div>
              </a>
          {/each}
      </div>
    </div>
  </div>
</section>