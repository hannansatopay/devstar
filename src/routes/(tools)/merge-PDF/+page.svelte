<script lang="ts">
	import { PDFDocument, rgb } from 'pdf-lib';
	import Intro from '$lib/Intro.svelte';
	let file1 = null;
	let file2 = null;
	let fileName1 = 'No file chosen';
	let fileName2 = 'No file chosen';
	const handleFile1 = (e1) => {
		const selectedFile1 = e1.target.files[0];
		if (selectedFile1) {
			file1 = selectedFile1;
			fileName1 = selectedFile1.name;
			console.log(fileName1);
		} else {
			file1 = null;
			fileName1 = 'No file chosen';
		}
	};
	const handleFile2 = (e2) => {
		const selectedFile2 = e2.target.files[0];
		if (selectedFile2) {
			file2 = selectedFile2;
			fileName2 = selectedFile2.name;
			console.log(fileName2);
		} else {
			file2 = null;
			fileName2 = 'No file chosen';
		}
	};
	const mergePDF = async () => {
		if (file1 && file2) {
			try {
				const pdfDoc1 = await PDFDocument.load(await file1.arrayBuffer());
				const pdfDoc2 = await PDFDocument.load(await file2.arrayBuffer());
				const mergedPdf = await PDFDocument.create();
				const [copiedPages1, copiedPages2] = await Promise.all([
					mergedPdf.copyPages(pdfDoc1, pdfDoc1.getPageIndices()),
					mergedPdf.copyPages(pdfDoc2, pdfDoc2.getPageIndices()),
				]);
				for (const page of copiedPages1) {
					mergedPdf.addPage(page);
				}
				for (const page of copiedPages2) {
					mergedPdf.addPage(page);
				}
				const mergedPdfBytes = await mergedPdf.save();
				const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
				const url = URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = fileName1+"_"+fileName2+".pdf";
				a.style.display = 'none';
				document.body.appendChild(a);
				a.click();
				URL.revokeObjectURL(url);
				file1 = null;
				file2 = null;
				fileName1 = 'No file chosen';
				fileName2 = 'No file chosen';
			} catch (error) {
				console.error('Error merging PDFs:', error);
			}
		}
	};

	export let data;
</script>

<Intro heading={data.meta.title} description={data.meta.description} />
<div class="flex justify-center font-sans m-2" style="align-items: center;gap:2vw">
	<div style="justify-content: center;display:flex;flex-direction:column;">
		<section class="bg-white dark:bg-gray-900 p-1" style="color: azure;">
			<label
				for="dropzone-file1"
				class="mx-auto cursor-pointer flex w-full max-w-lg flex-col items-center rounded-xl border-2 border-dashed border-blue-400 bg-white p-6 text-center">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
				</svg>
				<img src="https://img.freepik.com/premium-vector/pdf-format-file-template-your-design_97886-11001.jpg" alt="" style="height: 80px;"/>
				<h2 class="text-xl font-medium text-gray-700 tracking-wide">Merge PDF's</h2>
				<p class="mt-2 text-gray-500 tracking-wide">Upload your PDF1</p>
				<input id="dropzone-file1" type="file" class="mt-4 hidden" accept=".pdf" style="color: black" on:change={handleFile1}/>
			</label>
		</section>
		<div class="dark:text-white p-5" style="text-align: center;">{fileName1}</div>
	</div>
	<div>
		<div class="dark:text-white align font-black" style="font-size: 2rem;text-align: center;">
			+
		</div>
		<div class="dark:text-white p-5" style="text-align: center;" />
	</div>
	<div style="justify-content: center;display:flex;flex-direction:column;">
		<section class="bg-white dark:bg-gray-900 p-1" style="color: azure;">
			<label
				for="dropzone-file2"
				class="mx-auto cursor-pointer flex w-full max-w-lg flex-col items-center rounded-xl border-2 border-dashed border-blue-400 bg-white p-6 text-center">
				<svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
				</svg>
				<img src="https://img.freepik.com/premium-vector/pdf-format-file-template-your-design_97886-11001.jpg" alt="" style="height: 80px;"/>
				<h2 class="text-xl font-medium text-gray-700 tracking-wide">Merge PDF's</h2>
				<p class="mt-2 text-gray-500 tracking-wide">Upload your PDF2</p>
				<input id="dropzone-file2" type="file" class="mt-4 hidden" accept=".pdf" style="color: black" on:change={handleFile2}/>
			</label>
		</section>
		<div class="dark:text-white p-5" style="text-align: center;">{fileName2}</div>
	</div>
</div>
<div class="flex justify-center mt-5">
	<button
		type="button"
		class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focu s-ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus-outline-none dark:focus-ring-blue-800"
		on:click={mergePDF}>Merge Now</button
	>
</div>
