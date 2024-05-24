<script>
	import Intro from '$lib/Intro.svelte';
	import { Label, Button } from 'flowbite-svelte';


	// @ts-ignore
	export let data;

	// @ts-ignore
	/**
	 * @type {string | null}
	 */
	let compressedImageSrc = null;
	// @ts-ignore
	/**
	 * @type {string | null}
	 */
	let errorMessage = null;


	let isImageSizeValid = true;
	const maxSizeMB = 1; // Maximum file size in MB
	const maxWidth = 800; // Maximum width for resized image
	const maxHeight = 600; // Maximum height for resized image
	const quality = 0.7; // Image quality (0.0 to 1.0)

	
	// File input function
	// @ts-ignore
	let fileInput;
	function handleFileSelection() {
		const fileInput = document.getElementById('fileInput');

		// @ts-ignore
		const selectedFile = fileInput.files[0];

		if (!selectedFile) {
			errorMessage = 'Please select an image.';
			isImageSizeValid = true; // Reset the variable
			return;
		}

		// Check the file size using the constant defined above.
		if (selectedFile.size / (1024 * 1024) > maxSizeMB) {
			errorMessage = 'Image size exceeds the maximum allowed size.';
			isImageSizeValid = false; // Set it to false if size exceeds the maximum
			return; // Terminate the process here
		}

		errorMessage = null;
		isImageSizeValid = true;
		compressImage(selectedFile);
	}

	async function compressImage(selectedFile) {
		// const selectedFile = fileInput.files[0]; // Access the selected file from fileInput reference.

		// if (!selectedFile) {
		// 	errorMessage = 'Please select an image.'; // Display an error message if no file is selected.
		// 	isImageSizeValid = true;
		// 	return;
		// }

		try {
			// Compress the selected image and store the compressed data URL.
			const compressedDataURL = await resizeAndCompressImage(selectedFile);
			compressedImageSrc = compressedDataURL;
			errorMessage = null; // Reset the error message.
		} catch (error) {
			errorMessage = 'Image compression failed. Please try again.'; // Display an error message if compression fails.
			console.error('Image compression error:', error); // Log the error to the console.
		}
	}

	// Function to resize and compress the image.
	// @ts-ignore
	async function resizeAndCompressImage(file) {

		const img = new Image();
		const reader = new FileReader();

		reader.readAsDataURL(file); // Read the image file as a data URL.

		return new Promise((resolve, reject) => {
			reader.onload = async (event) => {
				// @ts-ignore
				img.src = event.target.result;

				img.onload = () => {
					// Resize the image if needed
					let newWidth = img.width;
					let newHeight = img.height;

					if (img.width > maxWidth) {
						newWidth = maxWidth;
						newHeight = (img.height * maxWidth) / img.width;
					}

					if (newHeight > maxHeight) {
						newHeight = maxHeight;
						newWidth = (img.width * maxHeight) / img.height;
					}

					const canvas = document.createElement('canvas');
					const ctx = canvas.getContext('2d');
					canvas.width = newWidth;
					canvas.height = newHeight;

					// Draw the resized image on the canvas
					// @ts-ignore
					ctx.drawImage(img, 0, 0, newWidth, newHeight);

					canvas.toBlob(
						(blob) => {
							// @ts-ignore
							const compressedDataURL = URL.createObjectURL(blob);
							resolve(compressedDataURL); // Resolve the promise with the compressed data URL.
						},
						'image/jpeg', // Specify the image format (JPEG).
						quality // Set the image quality.
					);
				};
				img.onerror = () => {
					reject(new Error('Failed to load the image.'));
				};
				reader.onerror = () => {
					reject(new Error('Failed to read the image file.'));
				};
			};
		});
	}

	function downloadImage() {
		if (compressedImageSrc) {
			const link = document.createElement('a');
			link.href = compressedImageSrc;
			link.download = 'compressed_image.jpg'; // You can specify the file name here
			link.style.display = 'none';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	}

</script>

<main>
	
	<Intro heading={data.meta.title} description={data.meta.description} />

	<section class="bg-white dark:bg-gray-900">
		<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
			<div class="card gap-12 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg p-8">
				<div class=" flex justify-between items-center">
				<Label for="Compress image" class="">Compresse Image</Label>
				
					{#if compressedImageSrc}
					<Button on:click={downloadImage} color="green" class="">Download</Button>
				{/if}

				</div>
				<div class="p-8  ">
					{#if compressedImageSrc}
						<!-- svelte-ignore a11y-img-redundant-alt -->
						<img src={compressedImageSrc} alt="Compressed Image" class="w-full rounded max-h-80"/>
					{:else}	
						<div role="status" class="space-y-8 animate-pulse md:space-y-0 md:space-x-8 md:flex md:items-center">
							<div class="flex justify-center items-center w-full h-64 bg-gray-300 rounded dark:bg-gray-700"><svg width="48" height="48" class="text-gray-200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" fill="currentColor" viewBox="0 0 640 512"><path d="M480 80C480 35.82 515.8 0 560 0C604.2 0 640 35.82 640 80C640 124.2 604.2 160 560 160C515.8 160 480 124.2 480 80zM0 456.1C0 445.6 2.964 435.3 8.551 426.4L225.3 81.01C231.9 70.42 243.5 64 256 64C268.5 64 280.1 70.42 286.8 81.01L412.7 281.7L460.9 202.7C464.1 196.1 472.2 192 480 192C487.8 192 495 196.1 499.1 202.7L631.1 419.1C636.9 428.6 640 439.7 640 450.9C640 484.6 612.6 512 578.9 512H55.91C25.03 512 .0006 486.1 .0006 456.1L0 456.1z"></path></svg></div>
						</div>
					{/if}
				</div>

				<button type="button" on:click={()=>fileInput.click()}  class="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Browse image</button>
				<input type="file" id="fileInput" class="hidden" accept="image/*" bind:this={fileInput} on:change={handleFileSelection}>			
				<!-- <button on:click={compressImage} type="button" class="mt-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" disabled={!isImageSizeValid}>Compress Image</button> -->
				
			</div>
		</div>
	</section>
	
	{#if errorMessage}
		<p>{errorMessage}</p>
		<!-- Display the error message if there is an error -->
	{/if}

	
</main>

<style>
	img {
		max-width: 100%;
		margin-top: 20px;
	}
	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
</style>
