<script lang="ts">
	import { Button, Card } from 'flowbite-svelte';

	import Intro from '$lib/Intro.svelte';
	let regexPattern = '';
	let testText = '';
	let highlightedText = '';
	export let data;

	let language = 'python';
	const handleTextChange = () => {
		const data = findMatchingPatterns();
		console.log(data);
	};
	function findMatchingPatterns() {
		if (regexPattern == '') return;
		const regex = new RegExp(regexPattern, 'g');
		const matches = testText.match(regex);
		updateHighlightedText(matches?.length);
		if (matches) {
			return matches;
		} else {
			return [];
		}
	}
	function updateHighlightedText(len) {
		if (len == 0) return;
		console.log(len);
		highlightedText = testText.replace(
			new RegExp(regexPattern, 'g'),
			`<div class="bg-blue-200 text-black inline-block font-semibold opacity-75 h-6">&nbsp;$& &nbsp;</div>`
		);
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900 flex justify-center">
	<div class="border border-white h-96 mb-2 w-2/3">
		<div class="regex-Header">
			<div
				class="bg-gray-100 text-black dark:bg-gray-900 dark:text-gray-100"
				on:click={() => (language = 'Python')}
			>
				Python
			</div>
			<div
				class="bg-gray-100 text-black dark:bg-gray-900 dark:text-gray-100"
				on:click={() => (language = 'Javascript')}
			>
				Javascript
			</div>
			<div
				class="bg-gray-100 text-black dark:bg-gray-900 dark:text-gray-100"
				on:click={() => (language = 'PHP')}
			>
				PHP
			</div>
		</div>
		<div class="regex-container flex flex-col">
			<input
				class="text-gray-700 bg-gray-100 dark:text-white w-1/3 m-4 rounded-md dark:bg-gray-800 placeholder-gray-500 focus:placeholder-gray-400"
				type="text"
				bind:value={regexPattern}
				placeholder="Enter your {language} regular expression here"
			/>
			<input
				class="text-gray-700 bg-gray-100 dark:text-white w-3/3 h-20 m-4 flex justify-center text-center rounded-md dark:bg-gray-800 placeholder-gray-500 focus:placeholder-gray-400 color-gray-400"
				type="text"
				bind:value={testText}
				on:change={handleTextChange}
				placeholder="Input your text for regex testing here :)"
			/>
			<button
				on:click={findMatchingPatterns}
				class="w-1/3 m-2 bg-gray-100 text-gray-700 dark:text-white border border-gray-500 rounded-md dark:bg-gray-800 placeholder-gray-500 focus:placeholder-gray-400 relative left-2"
				>Test</button
			>
			<div
				class="w-3/3 h-20 m-4 bg-gray-100 flex justify-center text-center rounded-md text-gray-700 border border-gray-500 dark:bg-gray-800 placeholder-gray-500 focus:placeholder-gray-400"
			>
				{@html highlightedText}
			</div>
		</div>
	</div>
</section>

<style>
	.highlighted {
		border: 2px solid pink;
		background-color: yellow !important;
		font-weight: bold;
	}
	.regex-Header {
		height: 3rem;
		/* background-color: #172334; */
		display: flex;
	}

	.regex-Header > div {
		/* color: lightgray; */
		display: flex;
		align-items: center;
		justify-content: center;
		width: 6rem;
		cursor: pointer;
		transition: all 400ms ease-in-out;
		font-weight: bolder;
		border-top-right-radius: 12px;
		border-top-left-radius: 12px;
	}
</style>
