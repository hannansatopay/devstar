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
