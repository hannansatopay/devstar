export type ScreenshotProvider = {
	id: "thumio" | "screenshotmachine";
	label: string;
	build: (url: string, width: number, full: boolean) => string;
};

export const SCREENSHOT_PROVIDERS: ScreenshotProvider[] = [
	{
		id: "thumio",
		label: "Thum.io",
		build: (url: string, width: number, full: boolean) =>
			`https://image.thum.io/get/${full ? "fullpage/" : ""}width/${width}/${url}`
	},
	{
		id: "screenshotmachine",
		label: "ScreenshotMachine (demo)",
		build: (url: string, width: number, full: boolean) => {
			const params = new URLSearchParams({
				dm: url,
				device: width > 800 ? "desktop" : "tablet",
				cacheLimit: "0",
				format: "png",
				full: full ? "yes" : "no"
			});
			return `https://api.screenshotmachine.com/?${params.toString()}`;
		}
	}
];

export function resolveScreenshotProvider(id: string) {
	return SCREENSHOT_PROVIDERS.find((provider) => provider.id === id);
}
