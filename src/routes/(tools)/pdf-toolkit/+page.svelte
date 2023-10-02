<script lang="ts">
  import { Label, Input, Range } from 'flowbite-svelte';
  import Intro from '$lib/Intro.svelte';
  import Copy from '$lib/Copy.svelte';
  export let data;
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
  
</section>

<style>

</style>
