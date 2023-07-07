<script lang="ts">
	export let text;
	export let customClass = '';

	function copy(e) {
		e.target.innerText = 'Copied';
		const element = document.createElement('textarea');
		element.value = text;
		document.body.appendChild(element);
		element.select();
		document.execCommand('copy');
		document.body.removeChild(element);
		setTimeout(() => {
			e.target.innerText = 'Copy';
		}, 1000);
	}
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<div on:click={copy} class="bg-green-100 dark:bg-green-200 text-green-700 dark:text-green-800 rounded-lg py-1 px-2 text-sm font-medium absolute top-4 right-4 cursor-pointer {customClass}">
	Copy
</div>
