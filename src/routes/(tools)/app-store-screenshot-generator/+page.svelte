<script lang="ts">
	import { browser } from "$app/environment";
	import { afterUpdate, onDestroy } from "svelte";
	import Copy from "$lib/Copy.svelte";

	type Platform = "ios" | "android";
	type Orientation = "portrait" | "landscape";

	type GradientPreset = {
		id: string;
		label: string;
		from: string;
		to: string;
	};
	type AccentPreset = { id: string; label: string; color: string };

	const gradients: GradientPreset[] = [
		{ id: "sky", label: "Sky Fade", from: "#38bdf8", to: "#6366f1" },
		{ id: "sunset", label: "Sunset", from: "#f97316", to: "#ef4444" },
		{ id: "forest", label: "Forest", from: "#22c55e", to: "#2563eb" },
	];

	const accents: AccentPreset[] = [
		{ id: "launch", label: "Launch Day", color: "#facc15" },
		{ id: "feature", label: "New Feature", color: "#38bdf8" },
		{ id: "tip", label: "Pro Tip", color: "#f472b6" },
	];

	const platformBadges = {
		ios: "App Store ready",
		android: "Google Play ready",
	} as const;

	let platform: Platform = "ios";
	let orientation: Orientation = "portrait";
	let gradientId = gradients[0].id;
	let accentId = accents[0].id;

	let heading = "Design that delights";
	let subheading = "Showcase your app in store-perfect frames";
	let body =
		"Swap gradients, copy, and device styles for App Store or Play Store exports. Ready-to-download PNGs keep every release consistent.";

	let screenshotSrc: string | null = null;
	let screenshotImage: HTMLImageElement | null = null;
	let canvas: HTMLCanvasElement | null = null;
	let infoMessage = "";
	let messageTimeout: ReturnType<typeof setTimeout> | null = null;

	$: selectedGradient =
		gradients.find((preset) => preset.id === gradientId) ?? gradients[0];
	$: selectedAccent =
		accents.find((preset) => preset.id === accentId) ?? accents[0];
	$: marketingCopy = [heading, subheading, body]
		.map((line) => line.trim())
		.filter(Boolean)
		.join("\n\n");
	$: settingsSnapshot = JSON.stringify(
		{
			platform,
			orientation,
			gradient: selectedGradient,
			accent: selectedAccent,
			heading,
			subheading,
			body,
			hasScreenshot: Boolean(screenshotSrc),
		},
		null,
		2,
	);

	const toggleBase =
		"inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition";
	const variantStyles = {
		indigo: {
			active: "border-indigo-500 bg-indigo-100 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-300",
			idle: "border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-500 dark:hover:text-indigo-300",
		},
		sky: {
			active: "border-sky-500 bg-sky-100 text-sky-600 dark:border-sky-400 dark:bg-sky-500/10 dark:text-sky-300",
			idle: "border-slate-300 text-slate-600 hover:border-sky-400 hover:text-sky-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-sky-500 dark:hover:text-sky-300",
		},
		emerald: {
			active: "border-emerald-500 bg-emerald-100 text-emerald-600 dark:border-emerald-400 dark:bg-emerald-500/10 dark:text-emerald-300",
			idle: "border-slate-300 text-slate-600 hover:border-emerald-400 hover:text-emerald-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-emerald-500 dark:hover:text-emerald-300",
		},
		slate: {
			active: "border-slate-400 bg-white text-slate-700 dark:border-slate-600 dark:bg-slate-900/70 dark:text-slate-200",
			idle: "border-slate-300 text-slate-600 hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-200",
		},
	} as const;

	type ToggleVariant = keyof typeof variantStyles;

	const toggleClasses = (
		active: boolean,
		variant: ToggleVariant = "indigo",
	) => `${toggleBase} ${variantStyles[variant][active ? "active" : "idle"]}`;

	const subtlePill =
		"rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 transition hover:border-slate-400 hover:text-slate-700 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-500 dark:hover:text-slate-200";

	const setMessage = (message: string) => {
		infoMessage = message;
		if (!browser) return;
		if (messageTimeout) clearTimeout(messageTimeout);
		messageTimeout = setTimeout(() => (infoMessage = ""), 2400);
	};

	const roundRect = (
		ctx: CanvasRenderingContext2D,
		x: number,
		y: number,
		width: number,
		height: number,
		radius: number,
	) => {
		ctx.beginPath();
		ctx.moveTo(x + radius, y);
		ctx.lineTo(x + width - radius, y);
		ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
		ctx.lineTo(x + width, y + height - radius);
		ctx.quadraticCurveTo(
			x + width,
			y + height,
			x + width - radius,
			y + height,
		);
		ctx.lineTo(x + radius, y + height);
		ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
		ctx.lineTo(x, y + radius);
		ctx.quadraticCurveTo(x, y, x + radius, y);
		ctx.closePath();
	};

	const wrapText = (
		ctx: CanvasRenderingContext2D,
		text: string,
		x: number,
		y: number,
		maxWidth: number,
		lineHeight: number,
	) => {
		const words = text.split(/\s+/);
		let line = "";
		let cursorY = y;

		for (const word of words) {
			const proposed = line ? `${line} ${word}` : word;
			if (ctx.measureText(proposed).width > maxWidth && line) {
				ctx.fillText(line, x, cursorY);
				line = word;
				cursorY += lineHeight;
			} else {
				line = proposed;
			}
		}

		if (line) {
			ctx.fillText(line, x, cursorY);
			cursorY += lineHeight;
		}

		return cursorY;
	};

	const handleFileChange = (event: Event) => {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;
		if (!file.type.startsWith("image/")) {
			setMessage("Choose an image file.");
			return;
		}

		const reader = new FileReader();
		reader.onload = () => {
			const image = new Image();
			image.onload = () => {
				screenshotSrc = reader.result as string;
				screenshotImage = image;
				drawPreview();
			};
			image.src = reader.result as string;
		};
		reader.readAsDataURL(file);
	};

	const removeScreenshot = () => {
		screenshotSrc = null;
		screenshotImage = null;
		drawPreview();
	};

	const createExampleImage = () => {
		if (!browser) return null;
		const offscreen = document.createElement("canvas");
		offscreen.width = 1080;
		offscreen.height = 1920;
		const ctx = offscreen.getContext("2d");
		if (!ctx) return null;

		const gradient = ctx.createLinearGradient(0, 0, 1080, 1920);
		gradient.addColorStop(0, "#312e81");
		gradient.addColorStop(1, "#6366f1");
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, 1080, 1920);

		ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
		roundRect(ctx, 150, 460, 780, 1040, 44);
		ctx.fill();

		ctx.fillStyle = "#0f172a";
		ctx.font = "600 60px 'Inter', 'Segoe UI', sans-serif";
		ctx.fillText("Schedule smarter", 210, 560);
		ctx.fillStyle = "#475569";
		ctx.font = "400 36px 'Inter', 'Segoe UI', sans-serif";
		ctx.fillText("Prioritize sprints and stakeholder reviews", 210, 640);

		ctx.fillStyle = "rgba(99, 102, 241, 0.16)";
		roundRect(ctx, 210, 780, 740, 520, 30);
		ctx.fill();

		ctx.fillStyle = "#4338ca";
		ctx.font = "500 36px 'Inter', 'Segoe UI', sans-serif";
		ctx.fillText("Prototype sprint", 250, 840);
		ctx.fillStyle = "#1e293b";
		ctx.font = "400 30px 'Inter', 'Segoe UI', sans-serif";
		ctx.fillText("08:30  •  Notes, agenda, attachments", 250, 900);

		return offscreen.toDataURL("image/png");
	};

	const loadExample = () => {
		heading = "Plan, launch, iterate";
		subheading = "Balanced visuals for both stores";
		body =
			"Use the gradient, accent, and device frame controls to build story-driven screenshots for feature updates and seasonal releases.";
		accentId = accents[1].id;
		const dataUrl = createExampleImage();
		if (dataUrl) {
			const image = new Image();
			image.onload = () => {
				screenshotSrc = dataUrl;
				screenshotImage = image;
				drawPreview();
			};
			image.src = dataUrl;
		} else {
			drawPreview();
		}
		setMessage("Example content loaded.");
	};

	const downloadImage = () => {
		if (!canvas) return;
		const link = document.createElement("a");
		link.href = canvas.toDataURL("image/png");
		link.download = `store-screenshot-${platform}-${orientation}.png`;
		link.click();
	};

	const drawPreview = () => {
		if (!canvas) return;
		const gradient =
			gradients.find((item) => item.id === gradientId) ?? gradients[0];
		const accent =
			accents.find((item) => item.id === accentId) ?? accents[0];
		const badge = platformBadges[platform];

		const metrics =
			orientation === "portrait"
				? {
						width: 1242,
						height: 2688,
						screen: {
							x: 190,
							y: 780,
							width: 862,
							height: 1640,
							radius: 88,
						},
						textX: 150,
						textWidth: 950,
						textY: 240,
						heading: 92,
						sub: 56,
						body: 38,
					}
				: {
						width: 2688,
						height: 1242,
						screen: {
							x: 1350,
							y: 160,
							width: 1240,
							height: 900,
							radius: 72,
						},
						textX: 240,
						textWidth: 920,
						textY: 210,
						heading: 78,
						sub: 50,
						body: 34,
					};

		const pixelRatio = browser
			? Math.min(window.devicePixelRatio || 1, 2.4)
			: 1;
		const displayScale = orientation === "portrait" ? 0.34 : 0.44;

		canvas.width = metrics.width * pixelRatio;
		canvas.height = metrics.height * pixelRatio;
		canvas.style.width = `${metrics.width * displayScale}px`;
		canvas.style.height = `${metrics.height * displayScale}px`;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.scale(pixelRatio, pixelRatio);

		const bg = ctx.createLinearGradient(
			0,
			0,
			metrics.width,
			metrics.height,
		);
		bg.addColorStop(0, gradient.from);
		bg.addColorStop(1, gradient.to);
		ctx.fillStyle = bg;
		ctx.fillRect(0, 0, metrics.width, metrics.height);

		ctx.save();
		ctx.shadowColor = "rgba(15, 23, 42, 0.32)";
		ctx.shadowBlur = orientation === "portrait" ? 140 : 110;
		ctx.shadowOffsetY = orientation === "portrait" ? 98 : 76;
		ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
		roundRect(
			ctx,
			metrics.screen.x - 60,
			metrics.screen.y - 60,
			metrics.screen.width + 120,
			metrics.screen.height + 120,
			orientation === "portrait" ? 110 : 90,
		);
		ctx.fill();
		ctx.restore();

		ctx.save();
		roundRect(
			ctx,
			metrics.screen.x,
			metrics.screen.y,
			metrics.screen.width,
			metrics.screen.height,
			metrics.screen.radius,
		);
		ctx.fillStyle = "#0f172a";
		ctx.fill();
		ctx.clip();

		if (screenshotImage) {
			const screenRatio = metrics.screen.width / metrics.screen.height;
			const imageRatio = screenshotImage.width / screenshotImage.height;
			let drawWidth = metrics.screen.width;
			let drawHeight = metrics.screen.height;

			if (imageRatio > screenRatio) {
				drawHeight = metrics.screen.height;
				drawWidth = drawHeight * imageRatio;
			} else {
				drawWidth = metrics.screen.width;
				drawHeight = drawWidth / imageRatio;
			}

			const offsetX =
				metrics.screen.x + (metrics.screen.width - drawWidth) / 2;
			const offsetY =
				metrics.screen.y + (metrics.screen.height - drawHeight) / 2;
			ctx.drawImage(
				screenshotImage,
				offsetX,
				offsetY,
				drawWidth,
				drawHeight,
			);
		} else {
			ctx.fillStyle = "rgba(255, 255, 255, 0.18)";
			ctx.fillRect(
				metrics.screen.x,
				metrics.screen.y,
				metrics.screen.width,
				metrics.screen.height,
			);
			ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
			ctx.font = `${metrics.body}px 'Inter', 'Segoe UI', sans-serif`;
			ctx.textAlign = "center";
			ctx.textBaseline = "middle";
			ctx.fillText(
				"Add your screenshot",
				metrics.screen.x + metrics.screen.width / 2,
				metrics.screen.y + metrics.screen.height / 2,
			);
		}
		ctx.restore();

		ctx.textAlign = "left";
		ctx.textBaseline = "top";

		const accentHeight = Math.round(metrics.body * 1.6);
		const accentPadding = Math.round(metrics.body * 0.8);
		ctx.fillStyle = accent.color;
		ctx.font = `600 ${Math.round(metrics.body * 0.8)}px 'Inter', 'Segoe UI', sans-serif`;
		const accentWidth =
			ctx.measureText(accent.label).width + accentPadding * 2;
		roundRect(
			ctx,
			metrics.textX,
			metrics.textY - accentHeight - 30,
			accentWidth,
			accentHeight,
			accentHeight / 2,
		);
		ctx.fill();
		ctx.fillStyle = "#0f172a";
		ctx.fillText(
			accent.label,
			metrics.textX + accentPadding,
			metrics.textY -
				accentHeight -
				30 +
				(accentHeight - metrics.body * 0.8) / 2.3,
		);

		ctx.fillStyle = "#0f172a";
		ctx.font = `700 ${metrics.heading}px 'Inter', 'Segoe UI', sans-serif`;
		const headingBottom = wrapText(
			ctx,
			heading,
			metrics.textX,
			metrics.textY,
			metrics.textWidth,
			metrics.heading + 12,
		);

		ctx.fillStyle = "#1f2937";
		ctx.font = `600 ${metrics.sub}px 'Inter', 'Segoe UI', sans-serif`;
		const subBottom = wrapText(
			ctx,
			subheading,
			metrics.textX,
			headingBottom,
			metrics.textWidth,
			metrics.sub + 10,
		);

		ctx.fillStyle = "#334155";
		ctx.font = `400 ${metrics.body}px 'Inter', 'Segoe UI', sans-serif`;
		const bodyBottom = wrapText(
			ctx,
			body,
			metrics.textX,
			subBottom,
			metrics.textWidth,
			metrics.body + 8,
		);

		const badgeHeight = Math.round(metrics.body * 1.6);
		const badgePadding = Math.round(metrics.body * 0.8);
		ctx.font = `600 ${Math.round(metrics.body * 0.85)}px 'Inter', 'Segoe UI', sans-serif`;
		const badgeWidth = ctx.measureText(badge).width + badgePadding * 2;
		roundRect(
			ctx,
			metrics.textX,
			bodyBottom + 12,
			badgeWidth,
			badgeHeight,
			badgeHeight / 2,
		);
		ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
		ctx.fill();
		ctx.strokeStyle =
			platform === "ios"
				? "rgba(37, 99, 235, 0.25)"
				: "rgba(22, 163, 74, 0.25)";
		ctx.lineWidth = 3;
		roundRect(
			ctx,
			metrics.textX,
			bodyBottom + 12,
			badgeWidth,
			badgeHeight,
			badgeHeight / 2,
		);
		ctx.stroke();
		ctx.fillStyle = "#0f172a";
		ctx.fillText(
			badge,
			metrics.textX + badgePadding,
			bodyBottom + 12 + (badgeHeight - metrics.body * 0.85) / 2.4,
		);
	};

	onDestroy(() => {
		if (messageTimeout) clearTimeout(messageTimeout);
	});

	afterUpdate(() => {
		if (canvas) {
			drawPreview();
		}
	});
</script>

<section class="space-y-6">
	<div class="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
		<div
			class="process rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
		>
			<div class="grid gap-6">
				<fieldset class="grid gap-3">
					<legend
						class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-3"
						>Platform</legend
					>
					<div class="flex flex-wrap gap-2">
						{#each ["ios", "android"] as value}
							<label
								class={`${toggleClasses(platform === value)} cursor-pointer`}
							>
								<input
									class="sr-only"
									type="radio"
									name="platform"
									{value}
									bind:group={platform}
								/>
								<span class="capitalize"
									>{value === "ios"
										? "App Store"
										: "Play Store"}</span
								>
							</label>
						{/each}
					</div>
				</fieldset>

				<fieldset class="grid gap-3">
					<legend
						class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500 mb-3"
						>Orientation</legend
					>
					<div class="flex flex-wrap gap-2">
						{#each ["portrait", "landscape"] as value}
							<label
								class={`${toggleClasses(orientation === value)} cursor-pointer`}
							>
								<input
									class="sr-only"
									type="radio"
									name="orientation"
									{value}
									bind:group={orientation}
								/>
								<span class="capitalize">{value}</span>
							</label>
						{/each}
					</div>
				</fieldset>

				<div class="grid gap-3">
					<p
						class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500"
					>
						Background gradient
					</p>
					<div class="grid gap-2 sm:grid-cols-2">
						{#each gradients as preset}
							<button
								type="button"
								class={`${toggleClasses(gradientId === preset.id, "sky")} gap-3`}
								on:click={() => (gradientId = preset.id)}
							>
								<span
									class="flex h-10 w-10 items-center justify-center rounded-full"
									style={`background: linear-gradient(135deg, ${preset.from}, ${preset.to})`}
								></span>
								<span>{preset.label}</span>
							</button>
						{/each}
					</div>
				</div>
				<div class="grid gap-3">
					<p
						class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500"
					>
						Accent label
					</p>
					<div class="flex flex-wrap gap-2">
						{#each accents as preset}
							<button
								type="button"
								class={`${toggleClasses(accentId === preset.id, "emerald")} gap-2`}
								on:click={() => (accentId = preset.id)}
							>
								<span
									class="inline-flex h-3 w-3 rounded-full"
									style={`background-color:${preset.color}`}
								></span>
								<span>{preset.label}</span>
							</button>
						{/each}
					</div>
				</div>

				<div class="grid gap-4">
					<label
						class="grid gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300"
					>
						Heading
						<input
							class="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/60"
							bind:value={heading}
							maxlength="120"
						/>
					</label>
					<label
						class="grid gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300"
					>
						Subheading
						<input
							class="rounded-2xl border border-slate-200 px-4 py-2 text-sm text-slate-700 transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/60"
							bind:value={subheading}
							maxlength="140"
						/>
					</label>
					<label
						class="grid gap-1 text-sm font-semibold text-slate-600 dark:text-slate-300"
					>
						Supporting copy
						<textarea
							rows="3"
							class="rounded-2xl border border-slate-200 px-4 py-2 text-sm leading-relaxed text-slate-700 transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/60"
							bind:value={body}
						></textarea>
					</label>
				</div>

				<div class="flex flex-wrap gap-3">
					<Copy
						text={marketingCopy}
						label="Copy screen copy"
						floating={false}
						customClass="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-sky-400 hover:text-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-sky-500 dark:hover:text-sky-300 dark:focus:ring-sky-800"
					/>
					<Copy
						text={settingsSnapshot}
						label="Copy settings JSON"
						floating={false}
						customClass="rounded-full border border-slate-300 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-300 dark:focus:ring-emerald-800"
					/>
				</div>

				<div class="grid gap-2">
					<p
						class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500"
					>
						Screenshot
					</p>
					<div
						class="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500 transition hover:border-sky-300 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
					>
						{#if screenshotSrc}
							<div class="flex flex-col gap-3">
								<img
									src={screenshotSrc}
									alt="Uploaded screenshot"
									class="max-h-56 w-full rounded-xl object-contain"
								/>
								<div class="flex flex-wrap gap-2">
									<button
										type="button"
										class={`${subtlePill} hover:border-rose-400 hover:text-rose-500 dark:hover:border-rose-400 dark:hover:text-rose-300`}
										on:click={removeScreenshot}
									>
										Remove image
									</button>
									<label
										class={`${subtlePill} cursor-pointer`}
									>
										Replace image
										<input
											type="file"
											accept="image/*"
											class="sr-only"
											on:change={handleFileChange}
										/>
									</label>
								</div>
							</div>
						{:else}
							<label
								class="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white/80 px-4 py-6 text-center transition hover:border-sky-300 hover:text-sky-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
							>
								<span>Drop an image or click to upload</span>
								<input
									type="file"
									accept="image/*"
									class="sr-only"
									on:change={handleFileChange}
								/>
							</label>
						{/if}
						<button
							type="button"
							class={`${toggleClasses(false, "sky")} mt-3`}
							on:click={loadExample}
						>
							Load example preset
						</button>
					</div>
				</div>
			</div>
		</div>

		<div
			class="final-output rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
		>
			<div class="flex flex-col items-center gap-4">
				<canvas bind:this={canvas} class="max-w-full max-h-fit"
				></canvas>
				<div class="flex flex-wrap items-center justify-center gap-3">
					<button
						type="button"
						class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-700"
						on:click={downloadImage}
					>
						Download PNG
					</button>
					<button
						type="button"
						class={`${toggleClasses(false, "slate")} px-5`}
						on:click={() => {
							platform = "ios";
							orientation = "portrait";
							gradientId = gradients[0].id;
							accentId = accents[0].id;
							heading = "Design that delights";
							subheading =
								"Showcase your app in store-perfect frames";
							body =
								"Swap gradients, copy, and device styles for App Store or Play Store exports. Ready-to-download PNGs keep every release consistent.";
							removeScreenshot();
							setMessage("Defaults restored.");
						}}
					>
						Reset layout
					</button>
				</div>
			</div>
			<p
				class="text-sm leading-relaxed text-slate-500 dark:text-slate-300 mt-3"
			>
				Canvas exports use native store ratios (1242x2688 portrait,
				2688x1242 landscape) so you can upload screenshots without
				additional editing.
			</p>
		</div>
	</div>

	{#if infoMessage}
		<div class="flex justify-center">
			<p
				class="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
			>
				{infoMessage}
			</p>
		</div>
	{/if}
</section>
