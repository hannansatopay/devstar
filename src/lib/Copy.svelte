<script lang="ts">
	import { onDestroy } from "svelte";

	export let text: string | undefined;
	export let customClass = "";
	export let label = "Copy";
	export let floating = true;

	const isBrowser = typeof window !== "undefined";
	let state: "idle" | "copied" | "error" = "idle";
	let timeoutId: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		if (!isBrowser || !text) {
			state = "error";
			scheduleReset();
			return;
		}

		try {
			if (navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(text);
			} else if (typeof document !== "undefined") {
				const element = document.createElement("textarea");
				element.value = text;
				element.setAttribute("readonly", "");
				element.style.position = "absolute";
				element.style.left = "-9999px";
				document.body.appendChild(element);
				element.select();
				document.execCommand("copy");
				document.body.removeChild(element);
			} else {
				throw new Error("Clipboard API unavailable");
			}
			state = "copied";
		} catch (error) {
			console.error("Copy failed", error);
			state = "error";
		}

		scheduleReset();
	}

	function scheduleReset() {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => {
			state = "idle";
		}, 1600);
	}

	onDestroy(() => {
		clearTimeout(timeoutId);
	});

	$: buttonLabel = state === "copied" ? "Copied" : state === "error" ? "Copy failed" : label;
</script>

<button
	type="button"
	class={`inline-flex items-center justify-center rounded-xl bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:bg-emerald-900/40 dark:text-emerald-200 dark:hover:bg-emerald-900/60 dark:focus:ring-emerald-800 ${floating ? "absolute top-3 right-3" : ""} ${customClass}`}
	on:click={copy}
	aria-live="polite"
>
	{buttonLabel}
</button>
