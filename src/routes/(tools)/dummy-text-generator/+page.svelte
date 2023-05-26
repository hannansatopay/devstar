<script lang="ts">
	import Intro from '../Intro.svelte';
	import { Label, Input, Range } from 'flowbite-svelte';
	import { Radio } from 'flowbite-svelte'
	import { Checkbox } from 'flowbite-svelte'

	export let data;

	import { Select } from 'flowbite-svelte';

	let length = 10;
	let type = "p";
	let types = [
		{value:"p", name: "Paragraphs"},
		{value:"s", name: "Sentences"},
		{value:"w", name: "Words"},
	]

	function generateLoremIpsum() {
  const loremIpsum = "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
  const words = loremIpsum.split(' ');
  const numWordsInIpsum = words.length;
  let result = '';

  if (type === 'p') {
    const numParagraphs = length;
    for (let i = 0; i < numParagraphs; i++) {
      let paragraph = '';
      const numSentences = Math.floor(Math.random() * 5) + 3; // between 3 and 7 sentences per paragraph
      for (let j = 0; j < numSentences; j++) {
        let sentence = '';
        const numWords = Math.floor(Math.random() * 10) + 4; // between 4 and 13 words per sentence
        for (let k = 0; k < numWords; k++) {
          const randomIndex = Math.floor(Math.random() * numWordsInIpsum);
          sentence += words[randomIndex] + ' ';
        }
        sentence = sentence.trim();
        sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
        paragraph += sentence + ' ';
      }
      result += '<p>' + paragraph.trim() + '</p>';
    }
  } else if (type === 's') {
    // Generate sentences
    const numSentences = length;
    for (let i = 0; i < numSentences; i++) {
      let sentence = '';
      const numWords = Math.floor(Math.random() * 10) + 4; // between 4 and 13 words per sentence
      for (let j = 0; j < numWords; j++) {
        const randomIndex = Math.floor(Math.random() * numWordsInIpsum);
        sentence += words[randomIndex] + ' ';
      }
      sentence = sentence.trim();
      sentence = sentence.charAt(0).toUpperCase() + sentence.slice(1) + '.';
      result += sentence + ' ';
    }
  } else if (type === 'w') {
    // Generate words
    const numWords = length;
    for (let i = 0; i < numWords; i++) {
      const randomIndex = Math.floor(Math.random() * numWordsInIpsum);
      result += words[randomIndex] + ' ';
    }
    result = result.trim();
  }

  return result;
}


let loremIpsum = generateLoremIpsum();

$: {
	console.log(length, type);
	loremIpsum = generateLoremIpsum();
}

	// function copy(e: any) {
	// 	e.target.innerText = 'Copied';
	// 	const element = document.createElement('textarea');
	// 	element.value = password;
	// 	document.body.appendChild(element);
	// 	element.select();
	// 	document.execCommand('copy');
	// 	document.body.removeChild(element);
	// 	setTimeout(()=>{
	// 		e.target.innerText = 'Copy';
	// 	}, 1000);
	// }
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div
			class="card gap-16 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg"
		>
		<div class="p-8 lg:grid lg:grid-cols-2 gap-16">
			<Label>Length
				<Input type="number" bind:value={length} />
			</Label>

			<Label>Select an option
				<Select items={types} bind:value={type} />
			</Label>
		</div>
		<div class="p-8 relative border-t-2 border-gray-500 text-gray-900 dark:text-white">
			<div
				class="bg-green-100 dark:bg-green-200 text-green-700 dark:text-green-800 rounded-lg py-1 px-2 text-sm font-medium absolute top-4 right-4 cursor-pointer"
				on:click={copy}
			>
				Copy
			</div>
			{@html loremIpsum}
		</div>
		</div>
	</div>
</section>

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<h2
			class="mb-4 text-2xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white"
		>
			How does it work?
		</h2>
		<p class="mb-4 text-gray-500 dark:text-gray-400">
			Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut
			labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco
			laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in
			voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat
			non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
		</p>
	</div>
</section>

<style>
	.box {
		border-radius: 20px;
	}

	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
</style>
