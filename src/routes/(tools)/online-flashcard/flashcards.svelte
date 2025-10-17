<script lang="ts">
	export interface Flashcard {
		id: number;
		title: string;
		description: string;
		frontContent: string;
		backContent: string;
		frontImage?: string;
		backImage?: string;
	}

	export let card: Flashcard | null = null;
	export let currentIndex = 0;

	let flipped = false;
	let lastCardId: number | null = null;

	$: {
		const activeId = card?.id ?? null;
		if (activeId !== lastCardId) {
			flipped = false;
			lastCardId = activeId;
		}
	}

	function toggleFlip() {
		if (card) {
			flipped = !flipped;
		}
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === ' ' || event.key === 'Enter') {
			event.preventDefault();
			toggleFlip();
		}
	}
</script>

{#if !card}
	<div class="placeholder">
		<p>Create a flashcard to preview it here.</p>
	</div>
{:else}
	<div class="viewer-shell">
		<article
			class:flipped={flipped}
			class="flashcard"
			tabindex="0"
			role="button"
			aria-label={`Flashcard ${currentIndex + 1}: ${card.title || 'Untitled'}`}
			on:click={toggleFlip}
			on:keydown={handleKeyDown}
		>
			<section class="face front">
				{#if card.frontImage}
					<img class="face-image" src={card.frontImage} alt="Front illustration" />
				{/if}
				{#if card.title}
					<h3>{card.title}</h3>
				{/if}
				<p>{card.frontContent}</p>
			</section>
			<section class="face back">
				{#if card.backImage}
					<img class="face-image" src={card.backImage} alt="Back illustration" />
				{/if}
				<p>{card.backContent}</p>
			</section>
		</article>

		{#if card.description}
			<p class="description">{card.description}</p>
		{/if}

		<p class="hint">Click, tap, or press space/enter to flip the card.</p>
	</div>
{/if}

<style>
	.placeholder {
		display: grid;
		place-items: center;
		min-height: 320px;
		border-radius: 1rem;
		border: 2px dashed rgba(148, 163, 184, 0.6);
		background: rgba(248, 250, 252, 0.75);
		color: rgba(71, 85, 105, 0.9);
		text-align: center;
		padding: 2rem;
		transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
	}

	.placeholder p {
		margin: 0;
		font-size: 1rem;
	}

	.viewer-shell {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
	}

	.viewer-shell {
		width: 100%;
		color: inherit;
	}

	.flashcard {
		position: relative;
		width: min(520px, 100%);
		min-height: 320px;
		perspective: 1400px;
		cursor: pointer;
	}

	.face {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		align-items: center;
		justify-content: center;
		text-align: center;
		padding: 1.5rem;
		border-radius: 1rem;
		backface-visibility: hidden;
		background: linear-gradient(160deg, rgba(255, 255, 255, 0.98) 0%, rgba(241, 245, 249, 0.94) 100%);
		box-shadow: 0 25px 45px -35px rgba(15, 23, 42, 0.6);
		border: 1px solid rgba(148, 163, 184, 0.4);
		transition: transform 0.6s ease;
	}

	.face h3 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 700;
		color: #1e293b;
	}

	.face p {
		margin: 0;
		font-size: 1rem;
		line-height: 1.6;
		color: #1e293b;
	}

	.face-image {
		max-width: 230px;
		max-height: 160px;
		object-fit: contain;
		border-radius: 0.75rem;
		border: 1px solid rgba(148, 163, 184, 0.35);
		background: rgba(248, 250, 252, 0.8);
		padding: 0.5rem;
	}

	.back {
		transform: rotateY(180deg);
	}

	.flashcard.flipped .front {
		transform: rotateY(180deg);
	}

	.flashcard.flipped .back {
		transform: rotateY(360deg);
	}

	.description {
		width: min(520px, 100%);
		margin: 0;
		text-align: center;
		color: rgba(71, 85, 105, 0.9);
		font-size: 0.95rem;
		line-height: 1.5;
		transition: color 0.3s ease;
	}

	.hint {
		margin: 0;
		font-size: 0.85rem;
		color: #6366f1;
		text-align: center;
		transition: color 0.3s ease;
	}

	:global(.dark) .placeholder {
		border-color: rgba(148, 163, 184, 0.35);
		background: rgba(15, 23, 42, 0.6);
		color: rgba(203, 213, 225, 0.85);
	}

	:global(.dark) .flashcard {
		box-shadow: 0 28px 55px -38px rgba(2, 6, 23, 0.9);
	}

	:global(.dark) .flashcard .face {
		background: linear-gradient(160deg, rgba(24, 30, 45, 0.95) 0%, rgba(17, 24, 39, 0.95) 100%);
		border-color: rgba(99, 102, 241, 0.25);
	}

	:global(.dark) .flashcard .face h3 {
		color: #e2e8f0;
	}

	:global(.dark) .flashcard .face p {
		color: rgba(226, 232, 240, 0.9);
	}

	:global(.dark) .flashcard .face-image {
		background: rgba(30, 41, 59, 0.85);
		border-color: rgba(99, 102, 241, 0.3);
	}

	:global(.dark) .description {
		color: rgba(203, 213, 225, 0.8);
	}

	:global(.dark) .hint {
		color: #a855f7;
	}
</style>
