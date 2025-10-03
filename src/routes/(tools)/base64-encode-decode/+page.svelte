<script lang="ts">
	import { Button } from "flowbite-svelte";

	export let data;

	var reqfunc;

	var output;

	function encodedecode(input) {
		if (reqfunc == "encode") {
			output = btoa(input.target.value);
		} else if (reqfunc == "decode") {
			output = atob(input.target.value);
		}
	}

	function copyText() {
		if (output.length > 0) {
			var textarea = document.createElement("textarea");
			textarea.value = output;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
		}
	}

	function downloadText() {
		if (output.length > 0) {
			var filename = "devstar_output.txt";
			var blob = new Blob([output], { type: "text/plain" });
			var url = window.URL.createObjectURL(blob);

			var a = document.createElement("a");
			a.href = url;
			a.download = filename;
			document.body.appendChild(a);
			a.click();

			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		}
	}

	$: placeholder =
		reqfunc === "decode" ? "Type Base64 code here" : "Type text here";
</script>

<section class="py-2">
	<div
		class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg"
	>
		<div class="p-8 gap-4 grid grid-cols-1">
			<select
				bind:value={reqfunc}
				class="bg-gray-50 border border-gray-300 text-gray-900 text-sm lg:text-lg rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
			>
				<option value="encode">Text to Base64 Encode</option>
				<option value="decode">Base64 to Text Decode</option>
			</select>

			<div
				class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300"
			>
				<textarea
					{placeholder}
					rows="8"
					class="resize-none block p-2.5 w-full text-sm lg:text-lg text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					on:input={encodedecode}
				/>
			</div>
		</div>

		<div
			class="p-8 h-full flex rounded-lg relative bg-gray-100 overflow-hidden grid grid-cols-1"
		>
			<div class="flex space-x-2 justify-end mb-2">
				<Button
					class="text-xs lg:text-base text-gray-700 hover:text-white border border-blue-400 dark:border-blue-900 bg-gray-100 dark:bg-gray-100 hover:bg-blue-600 hover:dark:bg-blue-700"
					on:click={downloadText}>Download as txt</Button
				>
				<Button
					class="text-xs lg:text-base bg-green-400 dark:bg-green-500 hover:bg-green-700 hover:dark:bg-green-700 w-20"
					on:click={copyText}>Copy</Button
				>
			</div>

			<textarea
				readOnly
				placeholder="Result"
				bind:value={output}
				rows="8"
				class="resize-none block p-2.5 w-full text-sm lg:text-lg text-gray-900 rounded-lg border border-gray-300 dark:border-gray-600 dark:placeholder-gray-400"
			/>
		</div>
	</div>
</section>
