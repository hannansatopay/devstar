<script>
	import { Avatar } from 'flowbite-svelte';
	export let contributors;
</script>

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:px-12">
	  <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white">
		Contributors
	  </h1>
	  <div class="flex items-center space-x-2">
		{#each contributors as contributor}
			<a href="https://github.com/{contributor.githubId}" target="_blank" class="flex items-center space-x-1 font-medium inline-flex items-center justify-center px-2.5 py-1 text-xs bg-gray-100 dark:bg-gray-700 border-primary-400 hover:bg-gray-200 rounded">
				<Avatar src="https://github.com/{contributor.githubId}.png" size="xs"/>
				<div>{contributor.name}</div>
			</a>
		{/each}
	</div>
</section>