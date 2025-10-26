<script lang="ts">
	let fileName = "";
	let imageSrc = "";
	let originalWidth = 0;
	let originalHeight = 0;
	let outputWidth = 0;
	let outputHeight = 0;
	let maintainAspect = true;
	let selectedFormat: "png" | "jpeg" | "webp" = "png";
	let quality = 0.92;
	let statusMessage = "";

	function resetState() {
		fileName = "";
		imageSrc = "";
		originalWidth = 0;
		originalHeight = 0;
		outputWidth = 0;
		outputHeight = 0;
		statusMessage = "";
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];

		if (!file) {
			resetState();
			return;
		}

		fileName = file.name.replace(/\.[^/.]+$/, "");

		const reader = new FileReader();
		reader.onload = () => {
			const image = new Image();
			image.onload = () => {
				originalWidth = image.width;
				originalHeight = image.height;
				outputWidth = image.width;
				outputHeight = image.height;
				imageSrc = image.src;
			};
			image.src = reader.result as string;
		};
		reader.readAsDataURL(file);
	}

	$: aspectRatio =
		originalWidth && originalHeight ? originalWidth / originalHeight : 0;

	function updateWidth(value: number) {
		outputWidth = value;
		if (maintainAspect && aspectRatio) {
			outputHeight = Math.round(outputWidth / aspectRatio);
		}
	}

	function updateHeight(value: number) {
		outputHeight = value;
		if (maintainAspect && aspectRatio) {
			outputWidth = Math.round(outputHeight * aspectRatio);
		}
	}

	function handleWidthInput(event: Event) {
		const next = Number((event.target as HTMLInputElement).value);
		if (next > 0 && Number.isFinite(next)) {
			updateWidth(next);
		}
	}

	function handleHeightInput(event: Event) {
		const next = Number((event.target as HTMLInputElement).value);
		if (next > 0 && Number.isFinite(next)) {
			updateHeight(next);
		}
	}

	async function downloadResizedImage() {
		if (!imageSrc || !outputWidth || !outputHeight) {
			statusMessage = "Load an image and set the output size first.";
			return;
		}

		if (outputWidth > 8192 || outputHeight > 8192) {
			statusMessage =
				"Choose dimensions below 8192px to prevent memory issues.";
			return;
		}

		try {
			const canvas = document.createElement("canvas");
			canvas.width = Math.round(outputWidth);
			canvas.height = Math.round(outputHeight);
			const ctx = canvas.getContext("2d");

			if (!ctx) {
				statusMessage = "Unable to access drawing context.";
				return;
			}

			statusMessage = "Rendering image...";

			await new Promise<void>((resolve, reject) => {
				const img = new Image();
				img.onload = () => {
					ctx.clearRect(0, 0, canvas.width, canvas.height);
					ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
					resolve();
				};
				img.onerror = () => reject();
				img.src = imageSrc;
			});

			const mimeType =
				selectedFormat === "png"
					? "image/png"
					: selectedFormat === "jpeg"
						? "image/jpeg"
						: "image/webp";

			const blob: Blob | null = await new Promise((resolve) =>
				canvas.toBlob(
					(result) => resolve(result),
					mimeType,
					selectedFormat === "png" ? undefined : quality,
				),
			);

			if (!blob) {
				statusMessage = "Failed to create the resized image.";
				return;
			}

			const url = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = `${fileName || "resized-image"}.${selectedFormat === "jpeg" ? "jpg" : selectedFormat}`;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			URL.revokeObjectURL(url);

			statusMessage = "Resized image downloaded.";
		} catch (error) {
			console.error(error);
			statusMessage = "Something went wrong while processing the image.";
		}
	}
</script>

<section class="space-y-6">
	<div class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
		<div
			class="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60"
		>
			<div class="space-y-5">
				<label class="block space-y-2">
					<span
						class="text-sm font-medium text-slate-600 dark:text-slate-300"
						>Choose an image</span
					>
					<input
						type="file"
						accept="image/*"
						on:change={handleFileChange}
						class="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
					/>
				</label>

				<div class="grid gap-4 sm:grid-cols-2">
					<label class="space-y-1.5">
						<span
							class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
						>
							Output width (px)
						</span>
						<input
							type="number"
							min="1"
							step="1"
							value={outputWidth}
							on:input={handleWidthInput}
							class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
						/>
					</label>

					<label class="space-y-1.5">
						<span
							class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
						>
							Output height (px)
						</span>
						<input
							type="number"
							min="1"
							step="1"
							value={outputHeight}
							on:input={handleHeightInput}
							class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
						/>
					</label>
				</div>

				<label
					class="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300"
				>
					<input
						type="checkbox"
						bind:checked={maintainAspect}
						class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400"
					/>
					Maintain original aspect ratio
				</label>

				<div class="grid gap-4 sm:grid-cols-2">
					<label class="space-y-1.5">
						<span
							class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
						>
							Export format
						</span>
						<select
							bind:value={selectedFormat}
							class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
						>
							<option value="png">PNG (lossless)</option>
							<option value="jpeg">JPEG (compressed)</option>
							<option value="webp">WEBP (modern)</option>
						</select>
					</label>

					{#if selectedFormat !== "png"}
						<label class="space-y-1.5">
							<span
								class="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400"
							>
								Quality
							</span>
							<input
								type="range"
								min="0.2"
								max="1"
								step="0.02"
								bind:value={quality}
								class="w-full accent-indigo-600"
							/>
							<p
								class="text-xs text-slate-500 dark:text-slate-400"
							>
								{Math.round(quality * 100)}% image quality
							</p>
						</label>
					{/if}
				</div>

				{#if imageSrc}
					<p
						class="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-800/40 dark:text-slate-300"
					>
						Original size: {originalWidth}px x {originalHeight}px
					</p>
				{/if}

				<button
					class="w-full rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
					on:click|preventDefault={downloadResizedImage}
					disabled={!imageSrc}
				>
					Download resized image
				</button>

				{#if statusMessage}
					<p class="text-sm text-slate-500 dark:text-slate-300">
						{statusMessage}
					</p>
				{/if}
			</div>
		</div>

		<div class="flex w-full flex-col gap-4">
			<div
				class="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60"
			>
				{#if imageSrc}
					<div
						class="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
					>
						<img
							src={imageSrc}
							alt="Selected image preview"
							class="max-h-[480px] w-full object-contain"
						/>
					</div>
				{:else}
					<div
						class="flex h-full min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400"
					>
						Upload an image to preview resizing results.
					</div>
				{/if}
			</div>

			<div
				class="rounded-3xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
			>
				Tip: For web use, keep images below 2000px on the long edge and
				export as WEBP for a great balance between quality and file
				size.
			</div>
		</div>
	</div>
</section>
