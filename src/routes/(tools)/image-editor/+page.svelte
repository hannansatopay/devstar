<script lang="ts">
	import { onMount } from "svelte";

	let sourceUrl = "";
	let fileName = "";
	let statusMessage = "";

	let brightness = 100;
	let contrast = 100;
	let saturation = 100;
	let grayscale = 0;
	let blur = 0;
	let rotation = 0;
	let flipHorizontal = false;
	let flipVertical = false;

	let exportFormat: "png" | "jpeg" | "webp" = "png";
	let exportQuality = 0.92;

	type CropBox = {
		left: number;
		top: number;
		right: number;
		bottom: number;
	};

	let crop: CropBox = { left: 0, top: 0, right: 1, bottom: 1 };
	let isDrawingCrop = false;
	let dragOrigin = { x: 0, y: 0 };

	let previewContainer: HTMLDivElement;
	let previewImage: HTMLImageElement;

	let naturalWidth = 0;
	let naturalHeight = 0;

	let imageMetrics = { width: 0, height: 0, left: 0, top: 0 };
	let resizeObserver: ResizeObserver | null = null;
	let metricsFrame: number | null = null;

	function scheduleMetricsUpdate() {
		if (metricsFrame !== null) {
			cancelAnimationFrame(metricsFrame);
		}
		metricsFrame = requestAnimationFrame(() => {
			updateImageMetrics();
			metricsFrame = null;
		});
	}

	function resetCrop() {
		crop = { left: 0, top: 0, right: 1, bottom: 1 };
	}

	function resetAdjustments() {
		brightness = 100;
		contrast = 100;
		saturation = 100;
		grayscale = 0;
		blur = 0;
		rotation = 0;
		flipHorizontal = false;
		flipVertical = false;
		resetCrop();
		statusMessage = "";
	}

	function resetAll() {
		sourceUrl = "";
		fileName = "";
		naturalWidth = 0;
		naturalHeight = 0;
		imageMetrics = { width: 0, height: 0, left: 0, top: 0 };
		resetAdjustments();
	}

	function handleFileChange(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) {
			resetAll();
			return;
		}

		fileName = file.name.replace(/\.[^/.]+$/, "");

		const reader = new FileReader();
		reader.onload = () => {
			const result = reader.result as string;
			sourceUrl = result;
			const metaImage = new Image();
			metaImage.onload = () => {
				naturalWidth = metaImage.naturalWidth;
				naturalHeight = metaImage.naturalHeight;
				resetAdjustments();
				scheduleMetricsUpdate();
			};
			metaImage.src = result;
		};
		reader.readAsDataURL(file);
	}

	$: filterStyle = [
		`brightness(${brightness}%)`,
		`contrast(${contrast}%)`,
		`saturate(${saturation}%)`,
		`grayscale(${grayscale}%)`,
		`blur(${blur}px)`
	].join(" ");

	$: transformStyle = `scaleX(${flipHorizontal ? -1 : 1}) scaleY(${flipVertical ? -1 : 1}) rotate(${rotation}deg)`;

	function changeRotation(step: number) {
		rotation = ((rotation + step) % 360 + 360) % 360;
	}

	const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

	function updateImageMetrics() {
		if (!previewContainer || !previewImage) {
			imageMetrics = { width: 0, height: 0, left: 0, top: 0 };
			return;
		}

		const containerRect = previewContainer.getBoundingClientRect();
		const imageRect = previewImage.getBoundingClientRect();

		const next = {
			width: imageRect.width,
			height: imageRect.height,
			left: imageRect.left - containerRect.left,
			top: imageRect.top - containerRect.top
		};

		const epsilon = 0.5;
		if (
			Math.abs(next.width - imageMetrics.width) > epsilon ||
			Math.abs(next.height - imageMetrics.height) > epsilon ||
			Math.abs(next.left - imageMetrics.left) > epsilon ||
			Math.abs(next.top - imageMetrics.top) > epsilon
		) {
			imageMetrics = next;
		}
	}

	function getRelativePoint(event: PointerEvent) {
		if (!previewImage) return null;
		const rect = previewImage.getBoundingClientRect();
		if (!rect.width || !rect.height) return null;
		const centerX = rect.left + rect.width / 2;
		const centerY = rect.top + rect.height / 2;

		const dx = event.clientX - centerX;
		const dy = event.clientY - centerY;

		const theta = (rotation * Math.PI) / 180;
		const cos = Math.cos(theta);
		const sin = Math.sin(theta);
		const sx = flipHorizontal ? -1 : 1;
		const sy = flipVertical ? -1 : 1;

		const xUnrotated = cos * dx + sin * dy;
		const yUnrotated = -sin * dx + cos * dy;

		const originalX = xUnrotated / sx;
		const originalY = yUnrotated / sy;

		const baseWidth = previewImage.clientWidth || rect.width;
		const baseHeight = previewImage.clientHeight || rect.height;
		if (!baseWidth || !baseHeight) return null;

		const x = clamp((originalX + baseWidth / 2) / baseWidth, 0, 1);
		const y = clamp((originalY + baseHeight / 2) / baseHeight, 0, 1);

		return { x, y };
	}

	function ensureCropBounds(box: CropBox): CropBox {
		const minSize = 0.01;
		let left = clamp(Math.min(box.left, box.right), 0, 1);
		let right = clamp(Math.max(box.left, box.right), 0, 1);
		let top = clamp(Math.min(box.top, box.bottom), 0, 1);
		let bottom = clamp(Math.max(box.top, box.bottom), 0, 1);

		if (right - left < minSize) {
			const center = (left + right) / 2;
			left = clamp(center - minSize / 2, 0, 1 - minSize);
			right = left + minSize;
		}

		if (bottom - top < minSize) {
			const center = (top + bottom) / 2;
			top = clamp(center - minSize / 2, 0, 1 - minSize);
			bottom = top + minSize;
		}

		return { left, top, right, bottom };
	}

	function startCrop(event: PointerEvent) {
		if (!sourceUrl) return;
		const point = getRelativePoint(event);
		if (!point) return;
		isDrawingCrop = true;
		dragOrigin = point;
		const overlay = event.currentTarget as HTMLElement;
		try {
			overlay.setPointerCapture(event.pointerId);
		} catch {
			// ignore capture errors
		}
		crop = ensureCropBounds({
			left: point.x,
			top: point.y,
			right: point.x,
			bottom: point.y
		});
	}

	function moveCrop(event: PointerEvent) {
		if (!isDrawingCrop) return;
		const point = getRelativePoint(event);
		if (!point) return;
		crop = ensureCropBounds({
			left: dragOrigin.x,
			top: dragOrigin.y,
			right: point.x,
			bottom: point.y
		});
	}

	function endCrop(event: PointerEvent) {
		if (!isDrawingCrop) return;
		const overlay = event.currentTarget as HTMLElement;
		try {
			overlay.releasePointerCapture(event.pointerId);
		} catch {
			// ignore release errors
		}
		isDrawingCrop = false;
		crop = ensureCropBounds(crop);
	}

	onMount(() => {
		if (typeof ResizeObserver !== "undefined") {
			resizeObserver = new ResizeObserver(() => updateImageMetrics());
		}
		window.addEventListener("resize", updateImageMetrics);

		return () => {
			window.removeEventListener("resize", updateImageMetrics);
			resizeObserver?.disconnect();
			resizeObserver = null;
		};
	});

	$: if (resizeObserver && previewContainer) {
		resizeObserver.observe(previewContainer);
	}

	$: if (resizeObserver && previewImage) {
		resizeObserver.observe(previewImage);
	}

	function handleImageLoad() {
		scheduleMetricsUpdate();
	}

	$: cropWidthPx = naturalWidth ? Math.round((crop.right - crop.left) * naturalWidth) : 0;
	$: cropHeightPx = naturalHeight ? Math.round((crop.bottom - crop.top) * naturalHeight) : 0;
	$: cropAreaStyle = {
		left: `${crop.left * 100}%`,
		top: `${crop.top * 100}%`,
		width: `${Math.max((crop.right - crop.left) * 100, 0.5)}%`,
		height: `${Math.max((crop.bottom - crop.top) * 100, 0.5)}%`
	};

	$: overlayStyle = (() => {
		const baseWidth = previewImage ? previewImage.clientWidth : 0;
		const baseHeight = previewImage ? previewImage.clientHeight : 0;

		if (!imageMetrics.width || !imageMetrics.height || !baseWidth || !baseHeight) {
			return {
				left: `${imageMetrics.left}px`,
				top: `${imageMetrics.top}px`,
				width: `${imageMetrics.width}px`,
				height: `${imageMetrics.height}px`,
				transform: ""
			};
		}

		const offsetLeft = imageMetrics.left + (imageMetrics.width - baseWidth) / 2;
		const offsetTop = imageMetrics.top + (imageMetrics.height - baseHeight) / 2;

		return {
			left: `${offsetLeft}px`,
			top: `${offsetTop}px`,
			width: `${baseWidth}px`,
			height: `${baseHeight}px`,
			transform: transformStyle
		};
	})();

	$: if (previewImage && sourceUrl) {
		rotation;
		flipHorizontal;
		flipVertical;
		scheduleMetricsUpdate();
	}

	async function downloadEditedImage() {
		if (!sourceUrl) {
			statusMessage = "Upload an image first.";
			return;
		}

		statusMessage = "Rendering your image...";

		try {
			const img = await loadImage(sourceUrl);
			naturalWidth = img.naturalWidth;
			naturalHeight = img.naturalHeight;

			const cropLeftPx = crop.left * img.naturalWidth;
			const cropTopPx = crop.top * img.naturalHeight;
			const cropWidthPx = Math.max(1, (crop.right - crop.left) * img.naturalWidth);
			const cropHeightPx = Math.max(1, (crop.bottom - crop.top) * img.naturalHeight);

			const rad = (rotation * Math.PI) / 180;
			const cos = Math.cos(rad);
			const sin = Math.sin(rad);
			const absCos = Math.abs(cos);
			const absSin = Math.abs(sin);

			const canvas = document.createElement("canvas");
			canvas.width = Math.round(cropWidthPx * absCos + cropHeightPx * absSin);
			canvas.height = Math.round(cropWidthPx * absSin + cropHeightPx * absCos);
			const ctx = canvas.getContext("2d");

			if (!ctx) {
				statusMessage = "Failed to access the drawing context.";
				return;
			}

			ctx.translate(canvas.width / 2, canvas.height / 2);
			ctx.scale(flipHorizontal ? -1 : 1, flipVertical ? -1 : 1);
			ctx.rotate(rad);

			const filterList = [
				`brightness(${brightness / 100})`,
				`contrast(${contrast / 100})`,
				`saturate(${saturation / 100})`,
				`grayscale(${grayscale / 100})`,
				`blur(${blur}px)`
			];

			ctx.filter = filterList.join(" ");
			ctx.drawImage(
				img,
				cropLeftPx,
				cropTopPx,
				cropWidthPx,
				cropHeightPx,
				-cropWidthPx / 2,
				-cropHeightPx / 2,
				cropWidthPx,
				cropHeightPx
			);

			const mimeType =
				exportFormat === "png"
					? "image/png"
					: exportFormat === "jpeg"
					? "image/jpeg"
					: "image/webp";

			const blob: Blob | null = await new Promise((resolve) =>
				canvas.toBlob(
					(result) => resolve(result),
					mimeType,
					exportFormat === "png" ? undefined : exportQuality
				)
			);

			if (!blob) {
				statusMessage = "Could not export the edited image.";
				return;
			}

			const blobUrl = URL.createObjectURL(blob);
			const anchor = document.createElement("a");
			anchor.href = blobUrl;
			anchor.download = `${fileName || "edited-image"}.${exportFormat === "jpeg" ? "jpg" : exportFormat}`;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
			URL.revokeObjectURL(blobUrl);

			statusMessage = "Image downloaded.";
		} catch (error) {
			console.error(error);
			statusMessage = "Something went wrong while processing the image.";
		}
	}

	function loadImage(src: string) {
		return new Promise<HTMLImageElement>((resolve, reject) => {
			const img = new Image();
			img.crossOrigin = "anonymous";
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error("Failed to load image"));
			img.src = src;
		});
	}
</script>

<section class="py-10">
	<div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
		<div class="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-700 dark:bg-slate-900/60">
			<div class="space-y-6">
				<label class="block space-y-2">
					<span class="text-sm font-medium text-slate-600 dark:text-slate-300">Upload an image</span>
					<input
						type="file"
						accept="image/*"
						on:change={handleFileChange}
						class="w-full cursor-pointer rounded-2xl border border-dashed border-slate-300 bg-white/90 px-4 py-3 text-sm text-slate-600 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
					/>
				</label>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
						<div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
							<span>Brightness</span>
							<span>{brightness}%</span>
						</div>
						<input type="range" min="20" max="180" bind:value={brightness} class="w-full accent-indigo-600" />
					</div>

					<div class="space-y-2 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
						<div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
							<span>Contrast</span>
							<span>{contrast}%</span>
						</div>
						<input type="range" min="20" max="180" bind:value={contrast} class="w-full accent-indigo-600" />
					</div>

					<div class="space-y-2 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
						<div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
							<span>Saturation</span>
							<span>{saturation}%</span>
						</div>
						<input type="range" min="0" max="200" bind:value={saturation} class="w-full accent-indigo-600" />
					</div>

					<div class="space-y-2 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
						<div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
							<span>Grayscale</span>
							<span>{grayscale}%</span>
						</div>
						<input type="range" min="0" max="100" bind:value={grayscale} class="w-full accent-indigo-600" />
					</div>

					<div class="space-y-2 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
						<div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
							<span>Blur</span>
							<span>{blur}px</span>
						</div>
						<input type="range" min="0" max="10" step="0.5" bind:value={blur} class="w-full accent-indigo-600" />
					</div>

					<div class="space-y-2 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
						<div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
							<span>Rotation</span>
							<span>{rotation}deg</span>
						</div>
						<input type="range" min="-180" max="180" step="1" bind:value={rotation} class="w-full accent-indigo-600" />
						<div class="flex gap-2">
							<button
								type="button"
								class="flex-1 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
								on:click={() => changeRotation(-90)}
							>
								-90deg
							</button>
							<button
								type="button"
								class="flex-1 rounded-xl border border-slate-300 bg-white py-2 text-xs font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200"
								on:click={() => changeRotation(90)}
							>
								+90deg
							</button>
						</div>
					</div>
				</div>

				<div class="grid gap-3 sm:grid-cols-2">
					<label class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
						<input type="checkbox" bind:checked={flipHorizontal} class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400" />
						Flip horizontally
					</label>
					<label class="flex items-center gap-3 rounded-xl border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-200">
						<input type="checkbox" bind:checked={flipVertical} class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-400" />
						Flip vertically
					</label>
				</div>

				<div class="space-y-2 rounded-2xl border border-slate-200/60 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
					<div class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
						<span>Crop</span>
						<button
							type="button"
							class="rounded-lg border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:text-slate-200"
							on:click={resetCrop}
							disabled={!sourceUrl}
						>
							Reset crop
						</button>
					</div>
					<p class="text-xs text-slate-500 dark:text-slate-400">
						Drag across the preview to choose the area to keep. Works for both landscape and portrait shots.
					</p>
					{#if naturalWidth && naturalHeight}
						<p class="text-xs text-slate-500 dark:text-slate-400">
							Selection: {cropWidthPx} x {cropHeightPx} px
						</p>
					{/if}
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<label class="space-y-1.5">
						<span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
							Export format
						</span>
						<select
							bind:value={exportFormat}
							class="w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-2.5 text-sm text-slate-900 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
						>
							<option value="png">PNG</option>
							<option value="jpeg">JPEG</option>
							<option value="webp">WEBP</option>
						</select>
					</label>

					{#if exportFormat !== "png"}
						<label class="space-y-1.5">
							<span class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
								Quality
							</span>
							<input
								type="range"
								min="0.2"
								max="1"
								step="0.02"
								bind:value={exportQuality}
								class="w-full accent-indigo-600"
							/>
							<p class="text-xs text-slate-500 dark:text-slate-400">{Math.round(exportQuality * 100)}%</p>
						</label>
					{/if}
				</div>

				<div class="flex flex-wrap gap-3">
					<button
						type="button"
						on:click={downloadEditedImage}
						class="rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:bg-indigo-300"
						disabled={!sourceUrl}
					>
						Download edited image
					</button>
					<button
						type="button"
						on:click={resetAdjustments}
						class="rounded-2xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 transition hover:border-indigo-400 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 dark:border-slate-600 dark:text-slate-200"
						disabled={!sourceUrl}
					>
						Reset adjustments
					</button>
				</div>

				{#if statusMessage}
					<p class="text-sm text-slate-500 dark:text-slate-300">{statusMessage}</p>
				{/if}
			</div>
		</div>

		<div class="flex flex-col gap-4">
			<div class="rounded-3xl border border-slate-200 bg-white/80 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/60">
				{#if sourceUrl}
					<div
						class="relative flex min-h-[320px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800"
						bind:this={previewContainer}
					>
						<img
							bind:this={previewImage}
							src={sourceUrl}
							alt="Editable preview"
							style={`filter:${filterStyle};transform:${transformStyle};`}
							class="max-h-[520px] max-w-full origin-center object-contain transition duration-150 ease-in-out"
							on:load={handleImageLoad}
						/>
						{#if imageMetrics.width && imageMetrics.height}
							<div
								class="absolute"
								style={`left:${overlayStyle.left};top:${overlayStyle.top};width:${overlayStyle.width};height:${overlayStyle.height};pointer-events:${sourceUrl ? "auto" : "none"};touch-action:none;transform:${overlayStyle.transform};transform-origin:center center;`}
							>
								<div
									class="absolute inset-0 cursor-crosshair"
									on:pointerdown|preventDefault={startCrop}
									on:pointermove|preventDefault={moveCrop}
									on:pointerup={endCrop}
									on:pointerleave={endCrop}
								></div>
								<div
									class="absolute border-2 border-indigo-400"
									style={`left:${cropAreaStyle.left};top:${cropAreaStyle.top};width:${cropAreaStyle.width};height:${cropAreaStyle.height};box-shadow:0 0 0 9999px rgba(15,23,42,0.45);pointer-events:none;`}
								></div>
							</div>
						{/if}
					</div>
				{:else}
					<div class="flex min-h-[360px] items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-400">
						Upload a photo to start editing. Adjust sliders and orientation, then download your polished image.
					</div>
				{/if}
			</div>

			<div class="rounded-3xl border border-slate-200 bg-white/80 p-6 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300">
				The adjustments preview updates live in your browser. When downloading, all filters and transforms are
				applied on a canvas so the exported image matches this preview.
			</div>
		</div>
	</div>
</section>
