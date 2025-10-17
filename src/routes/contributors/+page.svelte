<script lang="ts">
	import { fly } from "svelte/transition";
	import type { PageData } from "./$types";

	export let data: PageData;
	const { contributors } = data;

	const getInitials = (name: string) => {
		if (!name?.trim()) {
			return "??";
		}
		const parts = name
			.trim()
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 2);
		return parts
			.map((segment) => segment[0]?.toUpperCase() ?? "")
			.join("");
	};

	const getAvatar = (githubId?: string) =>
		githubId ? `https://github.com/${githubId}.png?size=160` : null;
</script>

<svelte:head>
	<title>Contributors | Devstar</title>
	<meta
		name="description"
		content="Discover the amazing contributors behind Devstar's collection of tools."
	/>
</svelte:head>

<section class="mx-auto max-w-6xl px-4 py-16">
	<header class="mb-12 text-center">
		<h1 class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
			Contributors
		</h1>
		<p class="mt-4 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
			A huge thank you to every developer who has helped shape our tools.
		</p>
	</header>

	{#if !contributors.length}
		<p class="text-center text-sm text-slate-500 dark:text-slate-300">
			No contributor information available yet. Check back soon!
		</p>
	{:else}
		<div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
			{#each contributors as contributor, index (contributor.githubId ?? contributor.name)}
				<div
					class="group relative overflow-hidden rounded-3xl border border-transparent bg-white/90 p-6 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl dark:bg-slate-900/80"
					in:fly={{ y: 18, duration: 250, delay: index * 40 }}
				>
					<div
						class="pointer-events-none absolute inset-px rounded-[26px] bg-gradient-to-br from-primary-500/10 via-purple-500/10 to-cyan-400/10 opacity-0 blur-0 transition duration-500 group-hover:opacity-100 dark:from-primary-400/10 dark:via-purple-400/10 dark:to-cyan-300/10"
					/>
					<div
						class="pointer-events-none absolute -top-20 right-[-40px] h-32 w-32 rounded-full bg-primary-500/30 blur-3xl transition duration-500 group-hover:scale-125 dark:bg-primary-400/40"
					/>
					<div
						class="pointer-events-none absolute bottom-[-48px] left-[-20px] h-28 w-28 rounded-full bg-cyan-400/30 blur-3xl transition duration-500 group-hover:scale-110 dark:bg-cyan-300/40"
					/>

					<div class="relative flex h-full flex-col justify-between gap-6">
						<div class="flex items-start gap-4">
							<div class="relative">
								<div
									class="absolute inset-0 rounded-full bg-gradient-to-br from-primary-400 via-fuchsia-400 to-cyan-400 opacity-60 blur-lg transition duration-500 group-hover:opacity-90"
								/>
								{#if contributor.githubId && getAvatar(contributor.githubId)}
									<img
										src={getAvatar(contributor.githubId)}
										alt={`Avatar for ${contributor.name}`}
										loading="lazy"
										class="relative z-10 h-16 w-16 rounded-full border-2 border-white object-cover shadow-sm transition duration-500 group-hover:rotate-3 dark:border-slate-900"
									/>
								{:else}
									<div
										class="relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-slate-100 to-slate-200 text-xl font-semibold text-slate-700 shadow-sm transition duration-500 group-hover:rotate-3 dark:border-slate-900 dark:from-slate-700 dark:to-slate-800 dark:text-slate-100"
									>
										{getInitials(contributor.name)}
									</div>
								{/if}
							</div>

							<div class="flex-1">
								<p class="text-xl font-semibold text-slate-900 transition-colors duration-300 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-300">
									{contributor.name}
								</p>

								{#if contributor.githubId}
									<a
										class="mt-2 inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-600 transition duration-300 group-hover:bg-primary-100 dark:bg-primary-400/10 dark:text-primary-200 dark:group-hover:bg-primary-400/20"
										href={`https://github.com/${contributor.githubId}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										<span class="relative flex h-2 w-2">
											<span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-75" />
											<span class="relative inline-flex h-2 w-2 rounded-full bg-primary-500" />
										</span>
										GitHub @ {contributor.githubId}
									</a>
								{:else}
									<p class="mt-2 text-sm text-slate-500 dark:text-slate-300">
										GitHub profile not available.
									</p>
								{/if}
							</div>
						</div>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</section>
