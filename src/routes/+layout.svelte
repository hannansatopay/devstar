<script>
	// @ts-nocheck
	import { page } from '$app/stores';
	import '../app.css';
	// import HeaderBanner from './HeaderBanner.svelte';
	import {
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		Button
	} from "flowbite-svelte";
	import {
		Footer,
		FooterCopyright,
		FooterLinkGroup,
		FooterLink,
	} from "flowbite-svelte";
	import { DarkMode } from "flowbite-svelte";
	export let data;
</script>
  
<svelte:head>
	{#if data.meta}
		<title>Developerstar — {data.meta.title}</title>
		<meta name="title" content={data.meta.title}>
		<meta name="description" content="{data.meta.description}">
	{:else}
		<title>Developerstar — A Comprehensive Developer Toolkit</title>
		<meta name="title" content="Developerstar — A Comprehensive Developer Toolkit">
		<meta name="description" content="Looking to boost your productivity and efficiency as a developer? Our free online developer toolkit has everything you need to unlock your full potential. From a user-friendly platform to a comprehensive collection of tools, we've got you covered. Experience the convenience and power of our toolkit today!">
	{/if}
	<!-- <meta name="keywords" content="developer toolkit, free online, efficiency, productivity, user-friendly platform, comprehensive collection of tools, unlock your full potential"> -->
	<!-- <meta property="og:image" content="https://example.com/toolkit.jpg"> -->
</svelte:head>

<header class="sticky top-0 z-40 flex-none mx-auto w-full bg-white dark:bg-gray-900 fixed left-0 top-0 z-30 border-b border-gray-200 dark:border-gray-700">
	<div class="w-full px-3 py-3 mx-auto lg:flex lg:justify-between max-w-8xl lg:px-3">
		<Navbar let:hidden let:toggle>
		<div class="flex justify-between w-full lg:w-auto">
			<div class="flex items-center">
				<NavBrand href="/">
					<span class="self-center whitespace-nowrap text-xl font-semibold dark:text-white">
					&lt;/Dev&gt;star
					</span>
				</NavBrand>
			</div>
			<div class="flex items-center lg:hidden">
				<a href="https://github.com/hannansatopay/devstar" target="_blank" class="text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 mr-1" ><svg class="w-5 h-5 " aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" ><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" /></svg ></a>
				<DarkMode />
				<NavHamburger on:click={toggle}/>
			</div>
		</div>
		<div class="flex items-center w-full lg:w-auto" >
			<NavUl {hidden}>
				<NavLi href="/" active="{$page.url.pathname === '/'}">Home</NavLi>
				<NavLi href="/about" active="{$page.url.pathname === '/about'}">About</NavLi>
				<NavLi href="/roadmap" active="{$page.url.pathname === '/roadmap'}">Roadmap</NavLi>
				<NavLi href="/contact" active="{$page.url.pathname === '/contact'}">Contact</NavLi>
			</NavUl>
			<div class="lg:self-center flex items-center mb-4 lg:mb-0 hidden mr-3 lg:flex">
				<div class="items-center mr-3 flex">
					<a href="https://github.com/hannansatopay/devstar" target="_blank" class="hidden xl:inline-block text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 rounded-lg text-sm p-2.5 mr-1"><svg class="w-5 h-5 " aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" ><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z" /></svg ></a>
					<DarkMode class=""/>
				</div>
			</div>
		</div>
		</Navbar>
	</div>
</header>
<main class="bg-white dark:bg-gray-900" style="min-height: calc(100vh - 145px);">
	<slot/>
</main>
<Footer class="rounded-none">
	<FooterCopyright href="https://alhansat.com" by="Alhansat Solutions" target="_blank" year={2023}/>
	<FooterLinkGroup ulClass="flex flex-wrap items-center mt-3 text-sm text-gray-500 dark:text-gray-400 sm:mt-0">
	  <FooterLink href="/terms-and-conditions">Terms & Conditions</FooterLink>
	  <FooterLink href="/privacy-policy">Privacy Policy</FooterLink>
	</FooterLinkGroup>
</Footer>