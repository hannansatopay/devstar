<script lang="ts">
	import { Label, Range, Checkbox } from 'flowbite-svelte';

	import Intro from '$lib/Intro.svelte';
	import Copy from '$lib/Copy.svelte';

	export let data;

	const charsets = {
		uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
		lowercase: 'abcdefghijklmnopqrstuvwxyz',
		numbers: '0123456789',
		symbols: '!@#$%^&*?',
	};

	let length = 12;
	let characters = ['uppercase', 'lowercase', 'numbers', 'symbols'];
	let password: string;

	$: {
		(() => {
			let charset = Object.keys(charsets)
				.filter((character) => characters.includes(character))
				.map((character) => charsets[character])
				.join('');

			password = '';
			for (let i = 0; i < length; i++) {
				const randomIndex = Math.floor(Math.random() * charset.length);
				password += charset[randomIndex];
			}
		})();
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
			<div class="p-8">
				<Label>Password Length</Label>
				<div class="flex items-center">
					<span class="text-gray-900 dark:text-white mr-3">1</span><Range bind:value={length} min="1" max="50" /><span class="text-gray-900 dark:text-white ml-3">50</span>
				</div>

				<Label class="mt-3">Characters</Label>
				<div class="flex gap-3">
					<Checkbox bind:group={characters} value="uppercase" disabled={characters.length <= 1 && characters[0] == 'uppercase'}>Uppercase</Checkbox>
					<Checkbox bind:group={characters} value="lowercase" disabled={characters.length <= 1 && characters[0] == 'lowercase'}>Lowercase</Checkbox>
					<Checkbox bind:group={characters} value="numbers" disabled={characters.length <= 1 && characters[0] == 'numbers'}>Numbers</Checkbox>
					<Checkbox bind:group={characters} value="symbols" disabled={characters.length <= 1 && characters[0] == 'symbols'}>Symbols</Checkbox>
				</div>
				
			</div>
			<div class="p-8 h-full flex rounded-lg relative justify-center items-center {length > 10 ? 'bg-green-300' : length > 8 ? 'bg-orange-300' : 'bg-red-300'}">
				<Copy text={password}/>
				<span class="text-2xl font-extrabold break-all">{password}</span>
			</div>
		</div>
	</div>
</section>

<style>
	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
</style>