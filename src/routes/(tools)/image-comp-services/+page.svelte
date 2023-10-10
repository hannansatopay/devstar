<script>
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

	async function compressImage() {
		const fileInput = document.getElementById('fileInput');

		// @ts-ignore
		const selectedFile = fileInput.files[0];

		if (!selectedFile) {
			errorMessage = 'Please select an image.'; // Display an error message if no file is selected.
			return;
		}
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
		const maxSizeMB = 1; // Maximum file size in MB
		const maxWidth = 800; // Maximum width for resized image
		const maxHeight = 600; // Maximum height for resized image
		const quality = 0.7; // Image quality (0.0 to 1.0)

		// Check if the file size exceeds the maximum allowed size.
		if (file.size / (1024 * 1024) > maxSizeMB) {
			throw new Error('Image size exceeds the maximum allowed size.');
		}

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
</script>

<main>
	<input type="file" id="fileInput" accept="image/*" />
	<button on:click={compressImage}>Compress Image</button>

	{#if errorMessage}
		<p>{errorMessage}</p>
		<!-- Display error message if there is an error -->
	{/if}

	{#if compressedImageSrc}
		<!-- svelte-ignore a11y-img-redundant-alt -->
		<img src={compressedImageSrc} alt="Compressed Image" />
	{/if}
</main>

<style>
	img {
		max-width: 100%;
		margin-top: 20px;
	}
</style>
