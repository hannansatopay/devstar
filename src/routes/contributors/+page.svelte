<script lang="ts">
	import { fly } from "svelte/transition";
	import type { PageData } from "./$types";

	export let data: PageData;
	type Contributor = PageData["contributors"][number];
	let contributors: PageData["contributors"] = [];
	$: contributors = data?.contributors ?? [];

	const spotlightRoster = {
		top: [
			{
				name: "Hannan Satopay",
				githubId: "hannansatopay",
			},
			{
				name: "RIYA KUSHWAHA",
				githubId: "RIYA1001",
			},
		],
		middle: [
			{
				name: "ANKITA MISHRA",
				githubId: "ANKITAMISHRA29",
			},
			{
				name: "Ashwani Kumar Singh",
				githubId: "ashwani2529",
			},
			{
				name: "Munsif Satopay",
				githubId: "munsifsatopay",
			},
			{
				name: "Rifat Perween",
				githubId: "rifatperween",
			},
		],
	};

	const normalizeHighlight = (
		source: { name: string; githubId: string },
		pool: Contributor[],
	) => {
		const match = pool.find((contributor) =>
			source.githubId
				? contributor.githubId?.toLowerCase() ===
					source.githubId.toLowerCase()
				: contributor.name.trim().toLowerCase() ===
					source.name.trim().toLowerCase(),
		);

		return (
			match ?? {
				name: source.name,
				githubId: source.githubId,
			}
		);
	};

	let topContributors: Contributor[] = [];
	let middleContributors: Contributor[] = [];
	$:
	topContributors = spotlightRoster.top.map((spotlight) =>
		normalizeHighlight(spotlight, contributors),
	);
	$:
	middleContributors = spotlightRoster.middle.map((spotlight) =>
		normalizeHighlight(spotlight, contributors),
	);

	const topTierBadges = ["Lead Developer", "Project Maintainer"];
	const middleTierBadges = ["Project Maintainer"];
	const lowerTierBadge = "Tool Developer";

	let highlightedIds = new Set<string>();
	$: highlightedIds = new Set(
		[...topContributors, ...middleContributors]
			.map((contributor) => contributor.githubId?.toLowerCase())
			.filter(Boolean) as string[],
	);

	let lowerContributors: Contributor[] = [];
	$: lowerContributors = contributors.filter((contributor) => {
		const id = contributor.githubId?.toLowerCase();
		return !id || !highlightedIds.has(id);
	});

	const getInitials = (name: string) => {
		if (!name?.trim()) {
			return "??";
		}
		const parts = name.trim().split(/\s+/).filter(Boolean).slice(0, 2);
		return parts.map((segment) => segment[0]?.toUpperCase() ?? "").join("");
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

<section class="mx-auto max-w-7xl space-y-12 px-4 py-14 sm:px-6 lg:px-8">
	<header class="space-y-4 text-center">
		<div
			class="mx-auto inline-flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/70 px-4 py-1 text-xs font-semibold uppercase tracking-[0.35em] text-slate-500 dark:border-white/20 dark:bg-white/10 dark:text-slate-300"
		>
			<span class="h-1.5 w-1.5 rounded-full bg-emerald-400" />
			Community Roster
		</div>
		<h1
			class="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl"
		>
			Contributors
		</h1>
		<p class="text-base text-slate-600 dark:text-slate-300 sm:text-lg">
			The builders, fixers, and dreamers keeping Devstar's toolkit in
			orbit.
		</p>
		<p class="text-sm text-slate-500 dark:text-slate-400">
			Every pull request, idea, and late-night debug makes the mission
			possible.
		</p>
	</header>

	{#if !contributors.length}
		<p class="text-center text-sm text-slate-500 dark:text-slate-300">
			No contributor information available yet. Check back soon!
		</p>
	{:else}
		<div class="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
			{#if topContributors.length}
				{#each topContributors as contributor, index (contributor.githubId ?? contributor.name)}
					<article
						class="group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-pink-100/70 bg-gradient-to-br from-pink-50/90 via-white to-pink-100/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-pink-500/30 dark:from-slate-900/60 dark:via-slate-950/40 dark:to-slate-950/70"
						in:fly={{ y: 22, duration: 220, delay: index * 70 }}
					>
						<span
							class="pointer-events-none absolute inset-0 bg-gradient-to-br from-pink-100/60 via-transparent to-transparent opacity-80 dark:from-pink-500/15"
							aria-hidden="true"
						/>

						<div class="relative flex items-start gap-4">
							<div
								class="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/80 bg-pink-50 text-lg font-semibold text-pink-600 shadow-inner dark:border-white/10 dark:bg-pink-500/20 dark:text-pink-100"
							>
								{#if contributor.githubId && getAvatar(contributor.githubId)}
									<img
										src={getAvatar(contributor.githubId)}
										alt={`Avatar for ${contributor.name}`}
										loading="lazy"
										class="h-full w-full object-cover"
									/>
								{:else}
									{getInitials(contributor.name)}
								{/if}
							</div>

							<div class="flex-1">
								<p
									class="text-lg font-semibold text-slate-900 dark:text-white"
								>
									{contributor.name}
								</p>

								{#if contributor.githubId}
									<a
										class="mt-1 inline-flex items-center gap-2 rounded-full border border-pink-100/70 bg-white/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-pink-600 transition hover:-translate-y-0.5 hover:bg-white dark:border-pink-500/40 dark:bg-pink-500/10 dark:text-pink-100"
										href={`https://github.com/${contributor.githubId}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										<span class="relative flex h-2 w-2">
											<span
												class="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-400/70"
												aria-hidden="true"
											/>
											<span
												class="relative inline-flex h-1.5 w-1.5 rounded-full bg-pink-500"
												aria-hidden="true"
											/>
										</span>
										GitHub @ {contributor.githubId}
									</a>
								{:else}
									<p
										class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500"
									>
										GitHub profile not available.
									</p>
								{/if}
							</div>
						</div>

						{#if topTierBadges.length}
							<p
								class="relative text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300"
							>
								{#each topTierBadges as badge, badgeIndex}
									{badge}
									{#if badgeIndex < topTierBadges.length - 1}
										<span
											aria-hidden="true"
											class="mx-1 text-slate-400 dark:text-slate-500"
											>.</span
										>
									{/if}
								{/each}
							</p>
						{/if}
					</article>
				{/each}
			{/if}

			{#if middleContributors.length}
				{#each middleContributors as contributor, index (contributor.githubId ?? contributor.name)}
					<article
						class="group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-purple-100/70 bg-gradient-to-br from-purple-50/90 via-white to-purple-100/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-purple-500/30 dark:from-slate-900/60 dark:via-slate-950/40 dark:to-slate-950/70"
						in:fly={{ y: 22, duration: 220, delay: index * 60 }}
					>
						<span
							class="pointer-events-none absolute inset-0 bg-gradient-to-br from-purple-100/60 via-transparent to-transparent opacity-80 dark:from-purple-500/15"
							aria-hidden="true"
						/>

						<div class="relative flex items-start gap-4">
							<div
								class="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/80 bg-purple-50 text-lg font-semibold text-purple-600 shadow-inner dark:border-white/10 dark:bg-purple-500/20 dark:text-purple-100"
							>
								{#if contributor.githubId && getAvatar(contributor.githubId)}
									<img
										src={getAvatar(contributor.githubId)}
										alt={`Avatar for ${contributor.name}`}
										loading="lazy"
										class="h-full w-full object-cover"
									/>
								{:else}
									{getInitials(contributor.name)}
								{/if}
							</div>

							<div class="flex-1">
								<p
									class="text-lg font-semibold text-slate-900 dark:text-white"
								>
									{contributor.name}
								</p>

								{#if contributor.githubId}
									<a
										class="mt-1 inline-flex items-center gap-2 rounded-full border border-purple-100/70 bg-white/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-purple-600 transition hover:-translate-y-0.5 hover:bg-white dark:border-purple-500/40 dark:bg-purple-500/10 dark:text-purple-100"
										href={`https://github.com/${contributor.githubId}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										<span class="relative flex h-2 w-2">
											<span
												class="absolute inline-flex h-full w-full animate-ping rounded-full bg-purple-400/70"
												aria-hidden="true"
											/>
											<span
												class="relative inline-flex h-1.5 w-1.5 rounded-full bg-purple-500"
												aria-hidden="true"
											/>
										</span>
										GitHub @ {contributor.githubId}
									</a>
								{:else}
									<p
										class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500"
									>
										GitHub profile not available.
									</p>
								{/if}
							</div>
						</div>

						{#if middleTierBadges.length}
							<p
								class="relative text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300"
							>
								{#each middleTierBadges as badge, badgeIndex}
									{badge}
									{#if badgeIndex < middleTierBadges.length - 1}
										<span
											aria-hidden="true"
											class="mx-1 text-slate-400 dark:text-slate-500"
											>.</span
										>
									{/if}
								{/each}
							</p>
						{/if}
					</article>
				{/each}
			{/if}

			{#if lowerContributors.length}
				{#each lowerContributors as contributor, index (contributor.githubId ?? contributor.name)}
					<article
						class="group relative flex h-full flex-col gap-5 overflow-hidden rounded-2xl border border-blue-100/70 bg-gradient-to-br from-blue-50/90 via-white to-blue-100/80 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl dark:border-blue-500/30 dark:from-slate-900/60 dark:via-slate-950/40 dark:to-slate-950/70"
						in:fly={{ y: 14, duration: 200, delay: index * 12 }}
					>
						<span
							class="pointer-events-none absolute inset-0 bg-gradient-to-br from-blue-100/60 via-transparent to-transparent opacity-80 dark:from-blue-500/15"
							aria-hidden="true"
						/>

						<div class="relative flex items-start gap-4">
							<div
								class="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-white/80 bg-blue-50 text-lg font-semibold text-blue-600 shadow-inner dark:border-white/10 dark:bg-blue-500/20 dark:text-blue-100"
							>
								{#if contributor.githubId && getAvatar(contributor.githubId)}
									<img
										src={getAvatar(contributor.githubId)}
										alt={`Avatar for ${contributor.name}`}
										loading="lazy"
										class="h-full w-full object-cover"
									/>
								{:else}
									{getInitials(contributor.name)}
								{/if}
							</div>

							<div class="flex-1">
								<p
									class="text-lg font-semibold text-slate-900 dark:text-white"
								>
									{contributor.name}
								</p>

								{#if contributor.githubId}
									<a
										class="mt-1 inline-flex items-center gap-2 rounded-full border border-blue-100/70 bg-white/80 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.3em] text-blue-600 transition hover:-translate-y-0.5 hover:bg-white dark:border-blue-500/40 dark:bg-blue-500/10 dark:text-blue-100"
										href={`https://github.com/${contributor.githubId}`}
										target="_blank"
										rel="noopener noreferrer"
									>
										<span class="relative flex h-2 w-2">
											<span
												class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400/70"
												aria-hidden="true"
											/>
											<span
												class="relative inline-flex h-1.5 w-1.5 rounded-full bg-blue-500"
												aria-hidden="true"
											/>
										</span>
										GitHub @ {contributor.githubId}
									</a>
								{:else}
									<p
										class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500"
									>
										GitHub profile not available.
									</p>
								{/if}
							</div>
						</div>

						<p
							class="relative text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-slate-500 dark:text-slate-300"
						>
							{lowerTierBadge}
						</p>
					</article>
				{/each}
			{:else}
				<p
					class="text-center text-sm text-slate-500 dark:text-slate-300"
				>
					No contributors to show yet.
				</p>
			{/if}
		</div>
	{/if}
</section>
