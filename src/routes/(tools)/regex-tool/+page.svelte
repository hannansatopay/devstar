<script>
	import { writable, derived } from 'svelte/store';
	const regex = writable('');
	const testString = writable('');
	const globalFlag = writable(true);
	const caseInsensitiveFlag = writable(false);
	const multilineFlag = writable(true);
	const singleLineFlag = writable(false);
	const unicodeFlag = writable(false);
	const stickyFlag = writable(false);
	const matches = derived(
	  [regex, testString, globalFlag, caseInsensitiveFlag, multilineFlag, singleLineFlag, unicodeFlag, stickyFlag],
	  ([$regex, $testString, $globalFlag, $caseInsensitiveFlag, $multilineFlag, $singleLineFlag, $unicodeFlag, $stickyFlag]) => {
		try {
		  let flags = '';
		  if ($globalFlag) flags += 'g';
		  if ($caseInsensitiveFlag) flags += 'i';
		  if ($multilineFlag) flags += 'm';
		  if ($singleLineFlag) flags += 's';
		  if ($unicodeFlag) flags += 'u';
		  if ($stickyFlag) flags += 'y';
		  const regExp = new RegExp($regex, flags);
		  const result = [...$testString.matchAll(regExp)];
		  return result.map(match => match[0]);
		} catch (e) {
		  return [];
		}
	  }
	);
	let showDropdown = false;
	function toggleDropdown() {
	  showDropdown = !showDropdown;
	}
  </script>
  <div class="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-lg rounded-lg">
	<h1 class="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-white">RegEx Tester</h1>
	<div class="space-y-6">
	  <div class="space-y-4">
		<label for="regex" class="block text-lg font-medium text-gray-700 dark:text-gray-300">Regular Expression:</label>
		<div class="flex items-center">
		  <input type="text" id="regex" bind:value={$regex} class="flex-1 p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white" />
		  <div class="relative ml-4">
			<button class="p-2 bg-gray-200 dark:bg-gray-800 rounded text-gray-900 dark:text-white" on:click={toggleDropdown}>Regex Flags</button>
			{#if showDropdown}
			  <div class="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded shadow-lg max-h-40 overflow-y-auto z-10">
				<label class="block p-2 text-gray-900 dark:text-white"><input type="checkbox" bind:checked={$globalFlag} /> global (g)</label>
				<label class="block p-2 text-gray-900 dark:text-white"><input type="checkbox" bind:checked={$caseInsensitiveFlag} /> case insensitive (i)</label>
				<label class="block p-2 text-gray-900 dark:text-white"><input type="checkbox" bind:checked={$multilineFlag} /> multiline (m)</label>
				<label class="block p-2 text-gray-900 dark:text-white"><input type="checkbox" bind:checked={$singleLineFlag} /> single line (s)</label>
				<label class="block p-2 text-gray-900 dark:text-white"><input type="checkbox" bind:checked={$unicodeFlag} /> unicode (u)</label>
				<label class="block p-2 text-gray-900 dark:text-white"><input type="checkbox" bind:checked={$stickyFlag} /> sticky (y)</label>
			  </div>
			{/if}
		  </div>
		</div>
	  </div>
	  <div class="space-y-4">
		<label for="testString" class="block text-lg font-medium text-gray-700 dark:text-gray-300">Test String:</label>
		<textarea id="testString" rows="4" bind:value={$testString} class="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"></textarea>
	  </div>
	  <div class="space-y-4">
		<h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300">Matches:</h2>
		{#each $matches as match, i}
		  <div class="bg-gray-100 dark:bg-gray-800 p-2 rounded text-gray-900 dark:text-white">Match {i + 1}: {match}</div>
		{/each}
	  </div>
	</div>
  </div>