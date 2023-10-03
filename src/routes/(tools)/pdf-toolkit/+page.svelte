<script lang="ts">
  import { Label, Input, Range } from 'flowbite-svelte';
  import Intro from '$lib/Intro.svelte';
  import Copy from '$lib/Copy.svelte';
  export let data;
</script>

<Intro heading={data.meta.title} description={data.meta.description} />
<main class="flex min-h-screen justify-center font-sans">
<section class="bg-white dark:bg-gray-900" style="color: azure;">
    <label for="dropzone-file" class="mx-auto cursor-pointer flex w-full max-w-lg flex-col items-center rounded-xl border-2 border-dashed border-blue-400 bg-white p-6 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <h2 class="text-xl font-medium text-gray-700 tracking-wide">Decypt your pdf for free</h2>
  
      <p class="mt-2 text-gray-500 tracking-wide">Upload your pdf</p>
  
      <input id="dropzone-file" type="file" class="hidden" />
</section>
</main>
<div class="flex w-full h-screen items-center justify-center bg-grey-lighter">
  <label class="w-64 flex flex-col items-center px-4 py-6 bg-white text-blue rounded-lg shadow-lg tracking-wide uppercase border border-blue cursor-pointer hover:bg-blue hover:text-white">
      <svg class="w-8 h-8" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M16.88 9.1A4 4 0 0 1 16 17H5a5 5 0 0 1-1-9.9V7a3 3 0 0 1 4.52-2.59A4.98 4.98 0 0 1 17 8c0 .38-.04.74-.12 1.1zM11 11h3l-4-4-4 4h3v3h2v-3z" />
      </svg>
      <span class="mt-2 text-base leading-normal">Select a file</span>
      <input type='file' class="hidden" />
  </label>
</div>


<style>

</style>
