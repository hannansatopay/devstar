<script lang="ts">
  	import ColorPicker from '../ColorPicker.svelte';

	import Intro from '../Intro.svelte';
	import { Label, Input, Range } from 'flowbite-svelte';
	import { Radio } from 'flowbite-svelte'
	import { Checkbox } from 'flowbite-svelte'

	export let data;

	let pin;

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

	// $: {
	// 	(() => {
	// 		let charset = '';
	// 		if (characters.includes('uppercase')) {
	// 			charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	// 		}
	// 		if (characters.includes('lowercase')) {
	// 			charset += 'abcdefghijklmnopqrstuvwxyz';
	// 		}
	// 		if (characters.includes('numbers')) {
	// 			charset += '0123456789';
	// 		}
	// 		if (characters.includes('symbols')) {
	// 			charset += '!@#$%^&*?';
	// 		}
	// 		password = '';
	// 		for (let i = 0; i < length; i++) {
	// 			const randomIndex = Math.floor(Math.random() * charset.length);
	// 			password += charset[randomIndex];
	// 		}
	// 	})();
	// }
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div
			class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg"
		>
			<div class="p-8">
				<span class="text-gray-900 dark:text-white">{pin}</span>
			</div>
			<div class="p-8 h-full rounded-lg relative">
				<ColorPicker bind:value={pin}/>
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
