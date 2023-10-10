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