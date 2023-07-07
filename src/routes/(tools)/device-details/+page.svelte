<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import { Label, Input, Range, Radio, Checkbox } from 'flowbite-svelte';
	import { onMount } from 'svelte';

	export let data;

	let innerWidth: any = null;
	let innerHeight: any = null;
	let screenWidth: any = null;
	let screenHeight: any = null;

	let operatingSystem: any = null;
	let osVersion: any = null;
	let osArchitecture: any = null;

	let browserName: any = null;
	let browserVersion: any = null;

	onMount(() => {
		screenWidth = screen.width;
		screenHeight = screen.height;

		if (navigator.userAgent) {
			let userAgent = navigator.userAgent.toLowerCase();

			if (userAgent.includes('win')) {
				operatingSystem = 'Windows';
				if (userAgent.includes('windows nt 10.0')) {
					osVersion = '10';
				} else if (userAgent.includes('windows nt 6.3')) {
					osVersion = '8.1';
				} else if (userAgent.includes('windows nt 6.2')) {
					osVersion = '8';
				} else if (userAgent.includes('windows nt 6.1')) {
					osVersion = '7';
				} else if (userAgent.includes('windows nt 6.0')) {
					osVersion = 'Vista';
				} else if (userAgent.includes('windows nt 5.1') || userAgent.includes('windows xp')) {
					osVersion = 'XP';
				}
				osArchitecture =
					userAgent.includes('wow64') || userAgent.includes('win64') || userAgent.includes('x64')
						? '64-bit'
						: '32-bit';
			} else if (userAgent.includes('mac')) {
				operatingSystem = 'MacOS';
				osVersion = userAgent.match(/mac os x (\d+(?:[\.\_\d]+)?)/)[1];
			} else if (userAgent.includes('linux')) {
				operatingSystem = 'Linux';
				osArchitecture = userAgent.includes('x86_64') ? '64-bit' : '32-bit';
			} else if (
				userAgent.includes('iphone') ||
				userAgent.includes('ipad') ||
				userAgent.includes('ipod')
			) {
				operatingSystem = 'iOS';
				osVersion = userAgent.match(/os (\d+(?:[\.\_\d]+)?)/)[1].replace(/_/g, '.');
			} else if (userAgent.includes('android')) {
				operatingSystem = 'Android';
				osVersion = userAgent.match(/android (\d+(?:[\.\_\d]+)?)/)[1];
			}

			if (userAgent.indexOf('edge') !== -1) {
				browserName = 'Microsoft Edge';
				browserVersion = userAgent.match(/edge\/([\d.]+)/)[1];
			} else if (userAgent.indexOf('chrome') !== -1) {
				browserName = 'Google Chrome';
				browserVersion = userAgent.match(/chrome\/([\d.]+)/)[1];
			} else if (userAgent.indexOf('safari') !== -1) {
				browserName = 'Safari';
				browserVersion = userAgent.match(/version\/([\d.]+)/)[1];
			} else if (userAgent.indexOf('firefox') !== -1) {
				browserName = 'Mozilla Firefox';
				browserVersion = userAgent.match(/firefox\/([\d.]+)/)[1];
			} else if (userAgent.indexOf('opera') !== -1 || userAgent.indexOf('opr') !== -1) {
				browserName = 'Opera';
				browserVersion = userAgent.match(/(?:opera|opr)\/([\d.]+)/)[1];
			} else if (userAgent.indexOf('trident') !== -1) {
				browserName = 'Internet Explorer';
				browserVersion = userAgent.match(/rv:([\d.]+)/)[1];
			}
		}
	});
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<svelte:window bind:innerWidth bind:innerHeight />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl sm:py-16 lg:px-6">
		<div class="space-y-8 md:grid md:grid-cols-2 lg:grid-cols-4 md:gap-12 md:space-y-0">
			{#each ['Operating System', 'Browser', 'Browser Resolution', 'Screen Resolution'] as item}
				<div
					class="block max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
				>
					<h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
						{item}
					</h5>
					{#if item === 'Operating System'}
						<p class="font-normal text-gray-700 dark:text-gray-400">
							{operatingSystem || ''}
							{osVersion || ''}
							{osArchitecture || ''}
						</p>
					{/if}
					{#if item === 'Browser'}
						<p class="font-normal text-gray-700 dark:text-gray-400">
							{browserName || ''}
							{browserVersion || ''}
						</p>
					{/if}
					{#if item === 'Browser Resolution'}
						{#if innerWidth || innerHeight}
							<p class="font-normal text-gray-700 dark:text-gray-400">
								{innerWidth} x {innerHeight}
							</p>
						{/if}
					{/if}
					{#if item === 'Screen Resolution'}
						{#if screenWidth || screenHeight}
							<p class="font-normal text-gray-700 dark:text-gray-400">
								{screenWidth} x {screenHeight}
							</p>
						{/if}
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>