<script lang="ts">
	import { Button, Input } from "flowbite-svelte";
	import Copy from "$lib/Copy.svelte";

	export let data;

	let inputText = "";
	let suffix = "";
	let prefix = "";
	let results = "";

	function updateText() {
		const lines = inputText.split("\n");
		results = lines.map((lines) => `${prefix}${lines}${suffix}`).join("\n");
	}

	function copyText() {
		if (results.length > 0) {
			const el = document.createElement("textarea");
			el.value = results;
			document.body.appendChild(el);
			el.select();
			document.execCommand("copy");
			document.body.removeChild(el);
		}
	}

	function downloadFile() {
		if (results.length > 0) {
			const resultString1 = results;
			const blob = new Blob([resultString1], { type: "text/plain" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = "devstar_output.txt";
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
		}
	}
</script>

<section class="py-2">
	<div
		class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg"
	>
		<div class="p-8 gap-4 grid grid-cols-1">
			<div class="grid grid-cols-2 gap-4">
				<div
					class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300"
				>
					<Input
						type="text"
						placeholder="Prefix"
						bind:value={prefix}
						class="rounded-none border-0 text-sm lg:text-lg"
						on:input={updateText}
					/>
				</div>

				<div
					class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300"
				>
					<Input
						type="text"
						placeholder="Suffix"
						bind:value={suffix}
						class="rounded-none border-0 text-sm lg:text-lg"
						on:input={updateText}
					/>
				</div>
			</div>

			<div
				class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300"
			>
				<textarea
					placeholder="Input text"
					rows="8"
					bind:value={inputText}
					class="resize-none block p-2.5 w-full text-sm lg:text-lg text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					on:input={updateText}
				/>
			</div>
		</div>

		<div
			class="p-8 h-full flex rounded-lg relative bg-gray-100 overflow-hidden grid grid-cols-1"
		>
			<div class="flex space-x-2 justify-end mb-2">
				<Button
					class="text-xs lg:text-base text-gray-700 hover:text-white border border-blue-400 dark:border-blue-900 bg-gray-100 dark:bg-gray-100 hover:bg-blue-600 hover:dark:bg-blue-700"
					on:click={downloadFile}>Download as txt</Button
				>
				<Button
					class="text-xs lg:text-base bg-green-400 dark:bg-green-500 hover:bg-green-700 hover:dark:bg-green-700 w-20"
					on:click={copyText}>Copy</Button
				>
			</div>

			<textarea
				readOnly
				placeholder="Result"
				bind:value={results}
				rows="8"
				class="resize-none block p-2.5 w-full text-sm lg:text-lg text-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 dark:placeholder-gray-400"
			/>
		</div>
	</div>
</section>
