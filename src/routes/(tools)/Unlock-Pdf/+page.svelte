<script lang="ts">
  import { Label, Input, Range } from 'flowbite-svelte';
  import Intro from '$lib/Intro.svelte';
  import Copy from '$lib/Copy.svelte';
  import { PDFDocument, rgb } from 'pdf-lib';

  let file = null;
  let fileName = "No file chosen";
  let password = "";
  let isDecrypted = false;

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      file = selectedFile;
      fileName = selectedFile.name;
    } else {
      file = null;
      fileName = "No file chosen";
    }
    console.log(fileName);
  }

  const handlePass = (e) => {
    password=e.target.value;
    console.log(password);
  }
  
  
export let data;
</script>


<Intro heading={data.meta.title} description={data.meta.description} />
<div class="flex justify-center font-sans">
  <section class="bg-white dark:bg-gray-900 " style="color: azure;">
    <label for="dropzone-file" class="mx-auto cursor-pointer flex w-full max-w-lg flex-col items-center rounded-xl border-2 border-dashed border-blue-400 bg-white p-6 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <h2 class="text-xl font-medium text-gray-700 tracking-wide">Decrypt your pdf for free</h2>
      <p class="mt-2 text-gray-500 tracking-wide">Upload your pdf</p>
      <input id="dropzone-file" type="file" class="mt-4 hidden" accept=".pdf" style="color:black" on:change={handleFile} />
    </label>
  </section>
</div>
<div class="flex justify-center font-sans mt-3">
  <div class="" style="color: white;">{fileName}</div>
</div>
<div class="flex justify-center font-sans mt-3">
  <input type="text" class="border rounded toggle" placeholder="Password"  on:change={handlePass} >
</div>
<div class="flex justify-center mt-5">
  <button  type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Decrypt Now</button>
</div>
<!-- on:click={decryptAndDownload} -->

<!-- <div class="flex justify-center mt-5">
  {#if !isDecrypted}
    <button on:click={decryptAndDownload} type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Decrypt Now</button>
  {:else}
    <a href="javascript:void(0);" class="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 focus:outline-none dark:focus:ring-green-800" download={fileName}>Download</a>
  {/if}
</div> -->

<style>
</style>