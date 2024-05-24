<script lang="ts">
	import { PDFDocument, rgb } from 'pdf-lib';
	import Intro from '$lib/Intro.svelte';
	let file = null;
	let fileName = 'No file chosen';
	let page_number = 1;
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
	const splitPDF = async () => {
	  if (!file) {
		alert('Please select a PDF file');
		return;
	  }
	  if (page_number < 1) {
		alert('Invalid page number');
		return;
	  }
	  const arrayBuffer = await file.arrayBuffer();
	  const pdfDoc = await PDFDocument.load(arrayBuffer);
	  const pageCount = pdfDoc.getPageCount();
	  if (page_number >= pageCount) {
		alert('Page number exceeds the total number of pages');
		return;
	  }
	  const pdfDoc1 = await PDFDocument.create();
	  const pdfDoc2 = await PDFDocument.create();
	  for (let i = 0; i < page_number; i++) {
		const [copiedPage] = await pdfDoc1.copyPages(pdfDoc, [i]);
		pdfDoc1.addPage(copiedPage);
	  }
	  for (let i = page_number; i < pageCount; i++) {
		const [copiedPage] = await pdfDoc2.copyPages(pdfDoc, [i]);
		pdfDoc2.addPage(copiedPage);
	  }
	  const pdfBytes1 = await pdfDoc1.save();
	  const pdfBytes2 = await pdfDoc2.save();
	  const blob1 = new Blob([pdfBytes1], { type: 'application/pdf' });
	  const blob2 = new Blob([pdfBytes2], { type: 'application/pdf' });
	  const url1 = URL.createObjectURL(blob1);
	  const url2 = URL.createObjectURL(blob2);
	  const a1 = document.createElement('a');
	  a1.href = url1;
	  a1.download = 'first_half.pdf';
	  a1.click();
  
	  const a2 = document.createElement('a');
	  a2.href = url2;
	  a2.download = 'second_half.pdf';
	  a2.click();
	}
  
	export let data;
  </script>
  

<Intro heading={data.meta.title} description={data.meta.description} />
<div class="flex justify-center font-sans">
	<section class="bg-white dark:bg-gray-900" style="color: azure;">
		<label
			for="dropzone-file"
			class="mx-auto cursor-pointer flex w-full max-w-lg flex-col items-center rounded-xl border-2 border-dashed border-blue-400 bg-white p-6 text-center"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-10 w-10 text-red-500"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
				/>
			</svg>
			<img
				src="https://img.freepik.com/premium-vector/pdf-format-file-template-your-design_97886-11001.jpg"
				alt=""
				style="height: 80px;"
			/>
			<h2 class="text-xl font-medium text-gray-700 tracking-wide">
				Split your PDF file at positions
			</h2> 
			<p class="mt-2 text-gray-500 tracking-wide">Upload your PDF File</p>
			<input
				id="dropzone-file"
				type="file"
				class="mt-4 hidden"
				accept=".pdf"
				style="color: black"
				on:change={handleFile}
			/>
		</label>
	</section>
</div>
<div class="mt-2 flex justify-center">
	<h1 class="mt-2 dark:text-white">Add the Position to split</h1>
</div>
<div class="mt-2 flex justify-center rounded-md">
	<input class="ml-2 p-2 border  rounded-md" type="number" bind:value={page_number}>
</div>
<div class="flex justify-center font-sans mt-3">
	<div class="dark:text-white">{fileName}</div>
</div>

<div class="flex justify-center mt-5">
	<button
		type="button"
		class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focu	s-ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus-outline-none dark:focus-ring-blue-800"
		on:click={splitPDF}>Split Now</button
	>
</div>
