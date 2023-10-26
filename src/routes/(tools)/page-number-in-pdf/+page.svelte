<script lang="ts">
	import { Label, Input } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import { toasts, ToastContainer, FlatToast } from 'svelte-toasts';
	import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
	let file = null;
	let fileName = 'No file chosen';
	let pdfData = null;
	let pageNumberPosition = 'Bottom-Right';
	const showToast = (message, type) => {
		const toast = toasts.add({
			title: type === 'success' ? 'Success' : 'Error',
			description: message,
			duration: 3000,
			placement: 'bottom-right',
			type: type,
			theme: 'dark',
			showProgress: true,
			onClick: () => {},
			onRemove: () => {}
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
	const AddPageNumbers = async () => {
		if (!file) {
			showToast('Please select a PDF file.', 'error');
			return;
		}
		const pdfBytes = await (await fetch(URL.createObjectURL(file))).arrayBuffer();

		try {
			const pdfDoc = await PDFDocument.load(pdfBytes);
			const pages = pdfDoc.getPages();
			if (pageNumberPosition === 'Top-Right') {
				const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

				for (let i = 0; i < pages.length; i++) {
					const page = pages[i];
					const { width, height } = page.getSize();
					const textSize = 10;
					const textWidth = font.widthOfTextAtSize(`${i + 1}`, textSize);
					const textHeight = font.heightAtSize(textSize);
					const textX = width - textWidth * 3;
					const textY = height - textHeight * 3;

					page.drawText(`${i + 1}`, {
						x: textX,
						y: textY,
						font: font,
						size: textSize,
						color: rgb(0, 0, 0)
					});
				}
			}
            if (pageNumberPosition === 'Bottom-Right') {
				const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
				for (let i = 0; i < pages.length; i++) {
					const page = pages[i];
					const { width, height } = page.getSize();
					const textSize = 10;
					const textWidth = font.widthOfTextAtSize(`${i + 1}`, textSize);
					const textHeight = font.heightAtSize(textSize);
					const textX = width - textWidth * 3;
					const textY = textWidth * 3;
					page.drawText(`${i + 1}`, {
						x: textX,
						y: textY,
						font: font,
						size: textSize,
						color: rgb(0, 0, 0)
					});
				}
			}
			const modifiedPdfBytes = await pdfDoc.save();
			const modifiedPdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

			const downloadLink = document.createElement('a');
			downloadLink.href = URL.createObjectURL(modifiedPdfBlob);
			downloadLink.download = 'modified-pdf-with-pageno.pdf';
			downloadLink.click();
		} catch (error) {
			showToast('Error while adding page numbers.', 'error');
		}
		showToast('Page numbers added successfully! Download the modified PDF.', 'success');
	};

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
				class="h-14 w-14 text-blue-500"
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
			<h2 class="text-xl font-medium text-gray-700 tracking-wide">Add Page numbers</h2>
			<p class="mt-2 text-gray-500 tracking-wide">Upload your PDF file</p>
			<input
				id="dropzone-file"
				type="file"
				class="mt-4 hidden"
				accept=".pdf"
				style="color:black"
				on:change={handleFile}
			/>
		</label>
	</section>
</div>

<div class="flex justify-center font-sans mt-3">
	<div class="dark:text-white">{fileName}</div>
</div>

<div class="mt-8 flex justify-center">
	<Label class="text-lg">Position to Add Number</Label>
</div>
<section class="bg-white dark:bg-gray-900">
	<div class="mt-2 flex justify-center">
		<select class="ml-2 p-2 border border-gray-300 rounded-md" bind:value={pageNumberPosition}>
			<option value="Bottom-Right">Bottom-Right</option>
			<option value="Top-Right">Top-Right</option>
		</select>
	</div>
</section>

<div class="mt-5 flex justify-center" style="color: azure;">
	<button
		type="button"
		class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus-ring-blue-800"
		on:click={AddPageNumbers}>Add Numbers</button
	>
</div>

<ToastContainer let:data>
	<FlatToast {data} />
</ToastContainer>
