<script>
	import { page } from "$app/stores";
	import { onDestroy, onMount, tick } from "svelte";
	import "../app.pcss";
	import {
		Navbar,
		NavBrand,
		NavLi,
		NavUl,
		NavHamburger,
		DarkMode,
		Search,
	} from "flowbite-svelte";

	export let data;
	let query = "";
	let isSearchOpen = false;
	let filteredTools = [];
	let totalMatches = 0;
	let activeResultIndex = 0;
	let previousQuery = "";
	let previouslyFocusedElement = null;
	const isBrowser = typeof window !== "undefined";
	const isMac = isBrowser ? /mac/i.test(navigator.platform) : false;
	const searchShortcutKeys = isMac ? ["Cmd", "K"] : ["Ctrl", "K"];

	function resultId(index) {
		return `search-result-${index}`;
	}

	async function focusSearchInput(select = true) {
		if (!isBrowser || !isSearchOpen) {
			return;
		}
		await tick();
		const input = document.querySelector(
			".search-modal input[type='search']",
		);
		if (input instanceof HTMLInputElement) {
			input.focus();
			if (select) {
				input.select();
			}
		}
	}

	function openSearch() {
		if (!isBrowser) {
			return;
		}
		previouslyFocusedElement =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
		query = "";
		previousQuery = "";
		activeResultIndex = 0;
		isSearchOpen = true;
	}

	function closeSearch({ restoreFocus = true } = {}) {
		if (!isBrowser) {
			isSearchOpen = false;
			query = "";
			previousQuery = "";
			activeResultIndex = 0;
			return;
		}
		isSearchOpen = false;
		query = "";
		previousQuery = "";
		activeResultIndex = 0;

		if (restoreFocus && previouslyFocusedElement) {
			previouslyFocusedElement.focus({ preventScroll: true });
		}
		previouslyFocusedElement = null;
	}

	function toggleSearch() {
		if (isSearchOpen) {
			closeSearch();
		} else {
			openSearch();
		}
	}

	function handleGlobalKeydown(event) {
		if (!isBrowser) {
			return;
		}

		const target = event.target;
		const isTypingTarget =
			target instanceof HTMLInputElement ||
			target instanceof HTMLTextAreaElement ||
			(target && target.isContentEditable);

		const isShortcut =
			event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey);

		if (isShortcut) {
			event.preventDefault();
			if (isSearchOpen) {
				focusSearchInput();
			} else {
				openSearch();
			}
			return;
		}

		if (event.key === "/" && !isSearchOpen && !isTypingTarget) {
			event.preventDefault();
			openSearch();
			return;
		}

		if (event.key === "Escape" && isSearchOpen) {
			event.preventDefault();
			closeSearch();
		}
	}

	function moveActiveIndex(step) {
		if (!filteredTools.length) {
			return;
		}
		const nextIndex =
			(activeResultIndex + step + filteredTools.length) %
			filteredTools.length;
		activeResultIndex = nextIndex;
		scrollActiveResultIntoView();
	}

	function scrollActiveResultIntoView() {
		if (!isBrowser) {
			return;
		}
		const container = document.querySelector(".search-modal__list");
		if (!container) {
			return;
		}
		const activeEl = container.querySelector(
			"[data-search-result][data-active='true']",
		);
		if (activeEl instanceof HTMLElement) {
			activeEl.scrollIntoView({ block: "nearest" });
		}
	}

	async function selectActiveTool() {
		const tool = filteredTools[activeResultIndex];
		if (!tool) {
			return;
		}
		closeSearch({ restoreFocus: false });
		await tick();
		await goto(tool.link);
	}

	function handleInputKeydown(event) {
		if (!isSearchOpen) {
			return;
		}

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				moveActiveIndex(1);
				break;
			case "ArrowUp":
				event.preventDefault();
				moveActiveIndex(-1);
				break;
			case "Enter":
				if (filteredTools.length && query.trim()) {
					event.preventDefault();
					selectActiveTool();
				}
				break;
			case "Escape":
				event.preventDefault();
				closeSearch();
				break;
			default:
				break;
		}
	}

	function handleToolClick() {
		closeSearch({ restoreFocus: false });
	}

	function handleOverlayKeydown(event) {
		if (
			event.key === "Escape" ||
			event.key === "Enter" ||
			event.key === " "
		) {
			event.preventDefault();
			closeSearch();
		}
	}

	function handleListKeydown(event) {
		if (!filteredTools.length) {
			return;
		}

		switch (event.key) {
			case "ArrowDown":
				event.preventDefault();
				moveActiveIndex(1);
				break;
			case "ArrowUp":
				event.preventDefault();
				moveActiveIndex(-1);
				break;
			case "Enter":
			case " ":
				event.preventDefault();
				selectActiveTool();
				break;
			case "Escape":
				event.preventDefault();
				closeSearch();
				break;
			default:
				break;
		}
	}

	$: {
		if (!query.trim()) {
			filteredTools = [];
			totalMatches = 0;
		} else {
			const normalizedQuery = query.trim().toLowerCase();
			const matches = [];

			for (const category of data.tools.categories) {
				for (const tool of category.tools) {
					const nameMatch = tool.name
						.toLowerCase()
						.includes(normalizedQuery);
					const descriptionMatch = tool.description
						?.toLowerCase()
						.includes(normalizedQuery);

					if (!nameMatch && !descriptionMatch) {
						continue;
					}

					matches.push({
						...tool,
						category: category.title,
						_score: nameMatch ? 2 : 1,
					});
				}
			}

			totalMatches = matches.length;
			matches.sort(
				(a, b) => b._score - a._score || a.name.localeCompare(b.name),
			);

            filteredTools = matches
                .map(({ _score, ...tool }) => tool);
		}
	}

	$: {
		if (query !== previousQuery) {
			previousQuery = query;
			activeResultIndex = 0;
		}
	}

	$: {
		if (isBrowser) {
			document.body.classList.toggle("modal-open", isSearchOpen);
		}
	}

	$: {
		if (isSearchOpen) {
			focusSearchInput();
		}
	}

	onMount(() => {
		if (!isBrowser) {
			return;
		}
		const listener = (event) => handleGlobalKeydown(event);
		window.addEventListener("keydown", listener);
		return () => {
			window.removeEventListener("keydown", listener);
		};
	});

	onDestroy(() => {
		if (isBrowser) {
			document.body.classList.remove("modal-open");
		}
	});
</script>

<svelte:head>
	{#if data.meta}
		<title>Devkit - {data.meta.title}</title>
		<meta name="title" content={data.meta.title} />
		<meta name="description" content={data.meta.description} />
	{:else}
		<title>Devkit - A Comprehensive Developer Toolkit</title>
		<meta
			name="title"
			content="Devkit - A Comprehensive Developer Toolkit"
		/>
		<meta
			name="description"
			content="Looking to boost your productivity and efficiency as a developer? Our free online developer toolkit has everything you need to unlock your full potential. From a user-friendly platform to a comprehensive collection of tools, we've got you covered. Experience the convenience and power of our toolkit today!"
		/>
	{/if}
	<meta
		name="keywords"
		content="developer toolkit, free online, efficiency, productivity, user-friendly platform, comprehensive collection of tools, unlock your full potential"
	/>
	<meta property="og:image" content="https://example.com/toolkit.jpg" />
</svelte:head>

<header class="header-shell sticky top-0 z-40 w-full backdrop-blur-2xl">
	<div
		class="flex flex-wrap items-center justify-between w-full max-w-7xl p-4 mx-auto"
	>
		<Navbar let:hidden let:toggle class="!bg-transparent">
			<div class="flex justify-between w-full md:w-auto">
				<div class="flex items-center">
					<NavBrand href="/">
						<span
							class="self-center whitespace-nowrap text-xl font-semibold gradient-title"
						>
							Devkit
						</span>
					</NavBrand>
				</div>
				<div class="flex items-center gap-2 md:hidden">
					<button
						class="nav-link font-semibold"
						on:click|preventDefault={toggleSearch}
						aria-label="Open search"
					>
						<svg
							class="w-5 h-5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 512 512"
							><path
								fill="currentColor"
								d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
							/></svg
						>
					</button>
					<a
						href="https://github.com/hannansatopay/devstar"
						target="_blank"
						class="nav-link font-semibold"
						aria-label="GitHub"
					>
						<svg
							class="w-5 h-5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 496 512"
							><path
								fill="currentColor"
								d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
							/></svg
						>
					</a>
					<DarkMode />
					<NavHamburger on:click={toggle} />
				</div>
			</div>
			<div class="flex items-center w-full md:w-auto">
				<NavUl {hidden}>
					<NavLi
						href="/about"
						class={`nav-link ${$page.url.pathname === "/about" ? "is-active" : ""}`}
					>
						About
					</NavLi>
					<NavLi
						href="/contact"
						class={`nav-link ${$page.url.pathname === "/contact" ? "is-active" : ""}`}
					>
						Contact
					</NavLi>
				</NavUl>
				<div class="hidden md:flex items-center gap-2 md:ml-6">
					<button
						class="nav-link font-semibold"
						on:click|preventDefault={toggleSearch}
						aria-label="Open search"
					>
						<svg
							class="w-5 h-5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 512 512"
							><path
								fill="currentColor"
								d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"
							/></svg
						>
					</button>
					<a
						href="https://github.com/hannansatopay/devstar"
						target="_blank"
						class="nav-link font-semibold"
						aria-label="GitHub"
					>
						<svg
							class="w-5 h-5"
							aria-hidden="true"
							xmlns="http://www.w3.org/2000/svg"
							viewBox="0 0 496 512"
							><path
								fill="currentColor"
								d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"
							/></svg
						>
					</a>
					<DarkMode />
				</div>
			</div>
		</Navbar>
	</div>
</header>

<main class="relative min-h-[calc(100vh-145px)] header-shell">
	{#if isSearchOpen}
		<div
			class="search-modal z-50"
			role="dialog"
			aria-modal="true"
			aria-labelledby="search-modal-title"
		>
			<div
				class="search-modal__overlay overlay-mask"
				tabindex="-1"
				aria-hidden="true"
				on:click={toggleSearch}
				on:keydown={handleOverlayKeydown}
			/>
			<div class="search-modal__dialog">
				<div class="search-shell rounded-2xl p-4 sm:p-6">
					<div class="search-modal__header">
						<h2 id="search-modal-title" class="search-modal__title">
							Quick search
						</h2>
						<div class="search-modal__actions">
							<div class="search-shortcut" aria-hidden="true">
								<kbd class="search-shortcut__key"
									>{searchShortcutKeys[0]}</kbd
								>
								<span class="search-shortcut__separator">+</span
								>
								<kbd class="search-shortcut__key"
									>{searchShortcutKeys[1]}</kbd
								>
							</div>
							<button
								type="button"
								on:click={() => closeSearch()}
								aria-label="Close search"
								class="search-close font-semibold"
							>
								Close
							</button>
						</div>
					</div>
					<div class="search-modal__body">
						<Search
							bind:value={query}
							class="w-full search-input rounded-2xl"
							placeholder="Search tools..."
							autocomplete="off"
							on:keydown={handleInputKeydown}
						/>
                        
					</div>

					<!-- Results -->
					<div class="search-modal__results">
						{#if query.trim() === ""}
							<p class="muted text-sm">
								Please type to search for tools.
							</p>
						{:else if filteredTools.length === 0}
							<p class="muted text-sm">No results found.</p>
						{:else}
							<div
								class="search-modal__list"
								role="listbox"
								aria-label="Search results"
								aria-activedescendant={filteredTools.length
									? resultId(activeResultIndex)
									: undefined}
								tabindex="0"
								on:keydown={handleListKeydown}
							>
								{#each filteredTools as tool, index (tool.link)}
									<a
										id={resultId(index)}
										href={tool.link}
										on:click={handleToolClick}
										class={`search-result-card card-gradient cursor-pointer h-12 ${index === activeResultIndex ? "is-active" : ""}`}
										data-search-result
										data-active={index ===
											activeResultIndex}
										role="option"
										aria-selected={index ===
											activeResultIndex}
										on:mouseenter={() =>
											(activeResultIndex = index)}
										on:focus={() =>
											(activeResultIndex = index)}
									>
										<div class="search-result-card__header">
											<span
												class="search-result-card__title"
												>{tool.name}</span
											>
											{#if tool.category}
												<span
													class="search-result-card__category"
													>{tool.category}</span
												>
											{/if}
										</div>
									</a>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	{/if}
	<slot />
</main>

<footer
	class="footer-shell px-4 py-6 md:flex md:items-center md:justify-between md:px-8 md:py-8"
>
	<span
		class="block text-sm text-slate-500 dark:text-slate-300 text-left sm:text-center"
	>
		&copy; {new Date().getFullYear()}
		<a
			href="https://craftlab.ai"
			target="_blank"
			class="primary-link font-semibold"
		>
			Meta Craftlab
		</a>
		All Rights Reserved.
	</span>
	<ul
		class="flex flex-wrap items-center mt-3 text-sm text-slate-500 dark:text-slate-300 sm:mt-0"
	>
		<li class="mr-4 last:mr-0 md:mr-6">
			<a href="/terms-and-conditions" class="primary-link font-medium">
				Terms &amp; Conditions
			</a>
		</li>
		<li class="mr-4 last:mr-0 md:mr-6">
			<a href="/privacy-policy" class="primary-link font-medium">
				Privacy Policy
			</a>
		</li>
	</ul>
</footer>
