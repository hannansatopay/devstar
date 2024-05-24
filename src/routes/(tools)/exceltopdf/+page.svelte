<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import pdfMake from 'pdfmake/build/pdfmake';
	import pdfFonts from 'pdfmake/build/vfs_fonts';
	import * as XLSX from 'xlsx';
	pdfMake.vfs = pdfFonts.pdfMake.vfs;
	import { toasts, ToastContainer, FlatToast }  from "svelte-toasts";
	
	const showToast = () => {
    const toast = toasts.add({
      title: 'Converted',
      description: 'Excel to PDF',
      duration: 3000, 
      placement: 'bottom-right',
      type: 'info',
      theme: 'dark',
      placement: 'bottom-right',
			showProgress: true,
      type: 'success',
      theme: 'dark',
      onClick: () => {},
      onRemove: () => {},
    });

  };
	let file = null;
	let fileName = 'No file chosen';
	let pdfData = null;
	
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
	async function convertExcelToPdf() {
	  if (!file) {
		console.log('No file selected');
		return;
	  }
	  const data = await readFileAsync(file);
	  if (!data) {
		console.log('Error reading Excel file');
		return;
	  }
	  showToast();
	  const pdfDocDefinition = {
		content: [
		  {
			table: {
			  headerRows: 1,
			  body: data,
			},
		  },
		],
	  };
	
	  pdfData = pdfMake.createPdf(pdfDocDefinition);
	  pdfData.download('converted_file.pdf');
	}
	
	function readFileAsync(file) {
	  return new Promise((resolve) => {
		const reader = new FileReader();
		reader.onload = (e) => {
		  const arrayBuffer = e.target.result;
		  const workbook = XLSX.read(new Uint8Array(arrayBuffer), { type: 'array' });
		  const sheetName = workbook.SheetNames[0];
		  const worksheet = workbook.Sheets[sheetName];
		  const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
		  resolve(jsonData);
		};
		reader.readAsArrayBuffer(file);
	  });
	}
	
	export let data;
  </script>
  
  <Intro heading={data.meta.title} description={data.meta.description} />
  
  <div class="flex justify-center font-sans">
	<section class="bg-white dark:bg-gray-900" style="color: azure;">
	  <label for="dropzone-file" class="mx-auto cursor-pointer flex w-full max-w-lg flex-col items-center rounded-xl border-2 border-dashed border-blue-400 bg-white p-6 text-center">
		<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
		  <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
		</svg>
		<img src="https://static.vecteezy.com/system/resources/previews/022/100/657/non_2x/microsoft-excel-logo-transparent-free-png.png" alt="" style="height:80px;" />
		<h2 class="text-xl font-medium text-gray-700 tracking-wide">Convert your Excel for free</h2>
		<p class="mt-2 text-gray-500 tracking-wide">Upload your Excel File</p>
		<input id="dropzone-file" type="file" class="mt-4 hidden" accept=".xlsx" style="color:black" on:change={handleFile} />
	  </label>
	</section>
  </div>
  
  <div class="flex justify-center font-sans mt-3">
	<div class="dark:text-white" style="">{fileName}</div>
  </div>
  
  <div class="flex justify-center mt-5">
	<button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover-bg-blue-700 focus:outline-none dark:focus:ring-blue-800" on:click={convertExcelToPdf}>Convert Now</button>
  </div>
	<ToastContainer let:data={data}>
		<FlatToast {data}  />
	</ToastContainer>
