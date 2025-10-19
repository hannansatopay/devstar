<script lang="ts">
	import { onMount } from 'svelte';
	import { Spinner } from 'flowbite-svelte';

	type AdviceRecord = { text: string; id?: number; fallback?: boolean };

	const FALLBACK_ADVICE = [
		'Pause before you react; a thoughtful breath avoids careless words.',
		'Break big ambitions into tiny checkpoints so progress feels within reach.',
		'Ask one more question than feels comfortable—it often unlocks the insight you need.',
		'Document the why behind decisions; your future self will thank you.',
		'Generosity with feedback is great, but be even more generous with genuine praise.',
		'Keep a curiosity list so new ideas have somewhere to live before they fade.',
		'If it takes less than two minutes, do it immediately and move on.'
	];

	let advice: AdviceRecord | null = null;
	let loading = false;
	let error: string | null = null;
	let copied = false;
	let fallbackIndex = 0;

	const endpoint = 'https://api.adviceslip.com/advice';

	async function fetchAdvice() {
		if (loading) {
			return;
		}

		loading = true;
		error = null;
		copied = false;

		try {
			const response = await fetch(endpoint, { cache: 'no-store' });

			if (!response.ok) {
				throw new Error(`Request failed with status ${response.status}`);
			}

			const payload = await response.json();
			const slip = payload?.slip;

			if (!slip?.advice) {
				throw new Error('Unexpected response from advice service.');
			}

			advice = { text: slip.advice, id: slip.id ?? undefined };
		} catch (err) {
			const fallback = FALLBACK_ADVICE[fallbackIndex % FALLBACK_ADVICE.length];
			fallbackIndex += 1;
			advice = { text: fallback, fallback: true };

			error =
				err instanceof Error
					? `Live advice service is unavailable. Showing an offline tip instead. (${err.message})`
					: 'Live advice service is unavailable. Showing an offline tip instead.';
		} finally {
			loading = false;
		}
	}

	async function copyAdvice() {
		if (!advice || typeof navigator === 'undefined') {
			return;
		}

		try {
			if (!navigator.clipboard) {
				throw new Error('Clipboard access is not supported in this browser.');
			}

			await navigator.clipboard.writeText(advice.text);
			copied = true;

			setTimeout(() => {
				copied = false;
			}, 1500);
		} catch (err) {
			error =
				err instanceof Error
					? `Unable to copy the advice to your clipboard. (${err.message})`
					: 'Unable to copy the advice to your clipboard.';
		}
	}

	onMount(() => {
		void fetchAdvice();
	});
</script>

<section class="mx-auto space-y-6 px-4 py-6">
	<div class="relative overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl shadow-emerald-900/20 ring-1 ring-slate-700">
		<div class="pointer-events-none absolute -top-24 right-16 h-48 w-48 rounded-full bg-emerald-500/30 blur-3xl"></div>
		<div class="pointer-events-none absolute bottom-0 left-0 h-32 w-32 rounded-full bg-sky-500/20 blur-2xl"></div>

		<div class="relative space-y-6 p-8 md:p-10">
			<div class="space-y-3 text-center md:text-left">
				{#if advice}
					<p class="text-xs uppercase tracking-[0.4em] text-emerald-300">
						{advice.fallback ? 'Offline Tip' : `Advice ${advice.id ? `#${advice.id}` : ''}`}
					</p>

					<blockquote class="text-2xl font-semibold leading-snug md:text-[2rem]">
						<span class="text-emerald-300">“</span>{advice.text}<span class="text-emerald-300">”</span>
					</blockquote>

					{#if advice.fallback}
						<p class="text-xs text-slate-400">Refresh once you are back online to grab something new from the live feed.</p>
					{/if}
				{:else}
					<div class="flex h-36 items-center justify-center">
						<Spinner color="white" size="lg" />
					</div>
				{/if}
			</div>

			<div class="flex flex-col items-center gap-3 md:flex-row md:justify-between">
				<div class="flex gap-3">
					<button
						type="button"
						class="flex items-center gap-2 rounded-full bg-emerald-400 px-5 py-2 font-semibold text-slate-900 transition hover:bg-emerald-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 disabled:cursor-not-allowed disabled:opacity-70"
						disabled={loading}
						on:click={fetchAdvice}
					>
						{#if loading}
							<Spinner color="gray" size="sm" />
							<span>Loading…</span>
						{:else}
							<span>Shuffle Advice</span>
						{/if}
					</button>
					<button
						type="button"
						class="rounded-full border border-white/30 px-5 py-2 text-sm font-semibold text-white transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
						on:click={copyAdvice}
						disabled={!advice}
					>
						{copied ? 'Copied!' : 'Copy'}
					</button>
				</div>
				<p class="text-xs text-emerald-200/80">Advice rotates every request—share it with someone who needs a boost.</p>
			</div>

			{#if error}
				<p class="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-3 text-xs text-amber-100">
					{error}
				</p>
			{/if}
		</div>
	</div>
</section>
