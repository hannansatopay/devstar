<script>
  import tools from "../tools.json";

  const categories = tools.categories ?? [];
</script>

<svelte:head>
  <title>Tool Categories • Devstar</title>
  <meta
    name="description"
    content="Browse all Devstar tool categories, explore their focus areas, and discover the tools grouped under each category."
  />
</svelte:head>

<section class="bg-white dark:bg-gray-900">
  <div class="py-10 px-4 mx-auto max-w-screen-xl space-y-8">
    <header class="space-y-2 text-center">
      <h1 class="text-2xl lg:text-4xl font-extrabold gradient-title">
        Tool Categories
      </h1>
      <p class="muted text-base lg:text-xl max-w-3xl mx-auto">
        Quickly understand the focus of each category and jump into the tools that
        fit your current workflow or project needs.
      </p>
    </header>

    <div class="grid gap-6 md:grid-cols-2">
      {#each categories as category (category.title)}
        <article class="card-gradient theme-card h-full p-6 space-y-3 text-left">
          <h2 class="text-xl lg:text-2xl font-bold">{category.title}</h2>
          <p class="muted text-base">{category.details}</p>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            {category.tools.length} {category.tools.length === 1 ? "tool" : "tools"}
          </p>
        </article>
      {/each}
    </div>
  </div>
</section>

