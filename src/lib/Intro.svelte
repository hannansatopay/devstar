<script>
    /**
	 * @type {any}
	 */
     export let heading;
     /**
	 * @type {any}
	 */
     export let description;
</script>

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:px-12">
	  <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white">
		{heading}
	  </h1>
	  <p class="text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
        {description}
	  </p>
</section>