<script>
  import Intro from '$lib/Intro.svelte';
  import { toasts, ToastContainer, FlatToast } from 'svelte-toasts';
  import * as XLSX from 'xlsx';
 
  let file = null;
  let fileName = 'No file chosen';

  const showToast = (title, description) => {
    const toast = toasts.add({
      title: title,
      description: description,
      duration: 3000,
      placement: 'bottom-right',
      type: 'success',
      theme: 'dark',
    });
  };

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      file = selectedFile;
      fileName = selectedFile.name;
    } else {
      file = null;
      fileName = 'No file chosen';
    }
  };

  const convertPdfToExcel=()=>{
    
  }
  export let data;
</script>

<Intro heading="PDF to Excel Converter" description="Convert your PDF file to Excel (.xlsx)" />

<div class="flex justify-center font-sans">
  <section class="bg-white dark:bg-gray-900" style="color: azure;">
    <label for="dropzone-file" class="mx-auto cursor-pointer flex w-full max-w-lg flex-col items-center rounded-xl border-2 border-dashed border-blue-400 bg-white p-6 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
      </svg>
      <img src="https://img.freepik.com/premium-vector/pdf-format-file-template-your-design_97886-11001.jpg" alt="" style="height: 80px;" />
      <h2 class="text-xl font-medium text-gray-700 tracking-wide">Convert your</h2>
      <h2 class="text-xl font-medium text-gray-700 tracking-wide">PDF file to Excel (.xlsx)</h2>
      <p class="mt-2 text-gray-500 tracking-wide">Upload your PDF File</p>
      <input id="dropzone-file" type="file" class="mt-4 hidden" accept=".pdf" style="color: black" on:change={handleFile} />
    </label>
  </section>
</div>

<div class="flex justify-center font-sans mt-3">
  <div class="dark:text-white">{fileName}</div>
</div>

<div class="flex justify-center mt-5">
  <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus-ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus-outline-none dark:focus-ring-blue-800" on:click={convertPdfToExcel}>Convert Now</button>
</div>

<ToastContainer />