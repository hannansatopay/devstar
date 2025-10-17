<script lang="ts">
	import FlashcardViewer, { type Flashcard } from './flashcards.svelte';

	const emptyForm: Omit<Flashcard, 'id'> = {
		title: '',
		description: '',
		frontContent: '',
		backContent: '',
		frontImage: '',
		backImage: ''
	};

let flashcards: Flashcard[] = [];
let form: Omit<Flashcard, 'id'> = { ...emptyForm };
let formErrors: string[] = [];
let editingId: number | null = null;
let currentIndex = 0;
let nextId = 1;
let activeCard: Flashcard | null = null;

$: activeCard = flashcards[currentIndex] ?? null;

	async function handleImageChange(event: Event, side: 'front' | 'back') {
		const input = event.target as HTMLInputElement;
		const file = input?.files?.[0];

		if (!file) {
			return;
		}

		const reader = new FileReader();
		const dataUrl: string = await new Promise((resolve, reject) => {
			reader.onload = () => resolve(String(reader.result));
			reader.onerror = () => reject(new Error('Could not read image file.'));
			reader.readAsDataURL(file);
		});

		form =
			side === 'front'
				? { ...form, frontImage: dataUrl }
				: { ...form, backImage: dataUrl };
	}

	function clearImage(side: 'front' | 'back') {
		form =
			side === 'front'
				? { ...form, frontImage: '' }
				: { ...form, backImage: '' };
	}

	function validateForm() {
		const errors: string[] = [];

		if (!form.title.trim()) {
			errors.push('Title is required.');
		}

		if (!form.frontContent.trim()) {
			errors.push('Front content is required.');
		}

		if (!form.backContent.trim()) {
			errors.push('Back content is required.');
		}

		formErrors = errors;
		return errors.length === 0;
	}

	function resetForm() {
		form = { ...emptyForm };
		formErrors = [];
		editingId = null;
	}

	function saveFlashcard() {
		if (!validateForm()) {
			return;
		}

		if (editingId !== null) {
			flashcards = flashcards.map((card) =>
				card.id === editingId ? { ...form, id: editingId } : card
			);
			const updatedIndex = flashcards.findIndex((card) => card.id === editingId);
			currentIndex = updatedIndex === -1 ? 0 : updatedIndex;
		} else {
			const newCard: Flashcard = { ...form, id: nextId++ };
			flashcards = [...flashcards, newCard];
			currentIndex = flashcards.length - 1;
		}

		resetForm();
	}

	function startEditing(card: Flashcard) {
		form = {
			title: card.title,
			description: card.description,
			frontContent: card.frontContent,
			backContent: card.backContent,
			frontImage: card.frontImage ?? '',
			backImage: card.backImage ?? ''
		};
		editingId = card.id;
		formErrors = [];
	}

	function removeFlashcard(id: number) {
		flashcards = flashcards.filter((card) => card.id !== id);

		if (flashcards.length === 0) {
			currentIndex = 0;
			resetForm();
			return;
		}

		if (currentIndex >= flashcards.length) {
			currentIndex = flashcards.length - 1;
		}

		if (editingId === id) {
			resetForm();
		}
	}

	function selectCard(index: number) {
		if (index >= 0 && index < flashcards.length) {
			currentIndex = index;
		}
	}

	function previousCard() {
		if (currentIndex > 0) {
			currentIndex -= 1;
		}
	}

	function nextCard() {
		if (currentIndex < flashcards.length - 1) {
			currentIndex += 1;
		}
	}
</script>

<div class="page-wrapper">
	<section class="editor">
		<h1 class="heading">{editingId === null ? 'Create Flashcard' : 'Edit Flashcard'}</h1>

		{#if formErrors.length}
			<ul class="error-list">
				{#each formErrors as error}
					<li>{error}</li>
				{/each}
			</ul>
		{/if}

		<form class="form" on:submit|preventDefault={saveFlashcard}>
			<label>
				<span>Title *</span>
				<input type="text" bind:value={form.title} placeholder="e.g. JavaScript Closures" />
			</label>

			<label>
				<span>Description</span>
				<textarea
					bind:value={form.description}
					placeholder="Add optional notes or context for this card"
				/>
			</label>

			<div class="field-pair">
				<label>
					<span>Front Content *</span>
					<textarea
						bind:value={form.frontContent}
						placeholder="Question, prompt, or term for the front side"
					/>
				</label>
				<label>
					<span>Back Content *</span>
					<textarea
						bind:value={form.backContent}
						placeholder="Answer, explanation, or definition for the back side"
					/>
				</label>
			</div>

			<div class="field-pair">
				<label class="file-input">
					<span>Front Image</span>
					<input type="file" accept="image/*" on:change={(event) => handleImageChange(event, 'front')} />
					{#if form.frontImage}
						<img class="thumbnail" src={form.frontImage} alt="Front preview" />
						<button type="button" class="link-button" on:click={() => clearImage('front')}>
							Remove
						</button>
					{/if}
				</label>

				<label class="file-input">
					<span>Back Image</span>
					<input type="file" accept="image/*" on:change={(event) => handleImageChange(event, 'back')} />
					{#if form.backImage}
						<img class="thumbnail" src={form.backImage} alt="Back preview" />
						<button type="button" class="link-button" on:click={() => clearImage('back')}>
							Remove
						</button>
					{/if}
				</label>
			</div>

			<div class="form-actions">
				<button type="submit" class="primary-button">
					{editingId === null ? 'Add Flashcard' : 'Update Flashcard'}
				</button>
				{#if editingId !== null}
					<button type="button" class="secondary-button" on:click={resetForm}>
						Cancel Edit
					</button>
				{/if}
			</div>
		</form>
	</section>

	<section class="viewer">
		<h2 class="heading">Card Preview</h2>
		<FlashcardViewer {currentIndex} card={activeCard} />

		{#if flashcards.length > 0}
			<div class="viewer-controls">
				<button class="secondary-button" on:click={previousCard} disabled={currentIndex === 0}>
					Previous
				</button>
				<span class="viewer-status">
					Card {currentIndex + 1} of {flashcards.length}
				</span>
				<button
					class="secondary-button"
					on:click={nextCard}
					disabled={currentIndex === flashcards.length - 1}
				>
					Next
				</button>
			</div>

			<ul class="card-list">
				{#each flashcards as card, index}
					<li class:active={index === currentIndex}>
						<button type="button" on:click={() => selectCard(index)}>
							{card.title || `Card ${index + 1}`}
						</button>
						<div class="card-actions">
							<button type="button" on:click={() => startEditing(card)}>Edit</button>
							<button type="button" on:click={() => removeFlashcard(card.id)}>Delete</button>
						</div>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="empty-state">
				No flashcards yet. Add your first card to see it here.
			</p>
		{/if}
	</section>
</div>

<style>
	.page-wrapper {
		--surface: rgba(255, 255, 255, 0.95);
		--surface-border: rgba(226, 232, 240, 0.9);
		--surface-shadow: 0 15px 40px -20px rgba(15, 23, 42, 0.2);
		--input-bg: rgba(255, 255, 255, 0.9);
		--input-border: #cbd5e1;
		--muted: #475569;
		--list-bg: #ffffff;
		--list-border: #e2e8f0;
		--list-active-border: #2563eb;
		--secondary-text: #111827;
		--secondary-border: #cbd5e1;
		--primary-bg: #111827;
		--primary-text: #ffffff;
		--hint: #6366f1;

		display: grid;
		gap: 2rem;
		padding: 2rem;
		background: linear-gradient(180deg, var(--surface-light, #f8f9fc) 0%, var(--surface-light-alt, #f4f4f6) 100%);
		color: #0f172a;
		transition: background 0.3s ease, color 0.3s ease;
	}

	:global(.dark) .page-wrapper {
		--surface: rgba(24, 26, 34, 0.94);
		--surface-border: rgba(118, 127, 173, 0.45);
		--surface-shadow: 0 22px 50px -28px rgba(5, 9, 20, 0.85);
		--input-bg: rgba(17, 20, 29, 0.95);
		--input-border: rgba(148, 163, 184, 0.35);
		--muted: #a5b4fc;
		--list-bg: rgba(15, 23, 42, 0.85);
		--list-border: rgba(148, 163, 184, 0.2);
		--list-active-border: rgba(99, 102, 241, 0.85);
		--secondary-text: #e2e8f0;
		--secondary-border: rgba(148, 163, 184, 0.35);
		--primary-bg: #6366f1;
		--primary-text: #ffffff;
		--hint: #a855f7;

		background: linear-gradient(180deg, var(--surface-dark, #0d0e12) 0%, var(--surface-dark-alt, #12131b) 100%);
		color: #e2e8f0;
	}

	@media (min-width: 960px) {
		.page-wrapper {
			grid-template-columns: 1fr 1fr;
			align-items: flex-start;
		}
	}

	.heading {
		margin: 0 0 1rem;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.editor,
	.viewer {
		background: var(--surface);
		border-radius: 1rem;
		padding: 1.5rem;
		border: 1px solid var(--surface-border);
		box-shadow: var(--surface-shadow);
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	label {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		font-weight: 600;
	}

	input[type='text'],
	textarea {
		width: 100%;
		padding: 0.75rem;
		border: 1px solid var(--input-border);
		border-radius: 0.75rem;
		background: var(--input-bg);
		font-size: 0.95rem;
		color: inherit;
		transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	}

	input[type='text']:focus,
	textarea:focus {
		outline: none;
		border-color: var(--list-active-border);
		box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.12);
	}

	textarea {
		min-height: 110px;
		resize: vertical;
	}

	.field-pair {
		display: grid;
		gap: 1rem;
	}

	@media (min-width: 720px) {
		.field-pair {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}

	.file-input {
		position: relative;
		gap: 0.75rem;
	}

	.file-input input[type='file'] {
		padding: 0.5rem 0;
	}

	.thumbnail {
		display: block;
		max-width: 100%;
		max-height: 160px;
		border-radius: 0.75rem;
		border: 1px solid rgba(148, 163, 184, 0.35);
		background: rgba(248, 250, 252, 0.85);
		object-fit: cover;
	}

	:global(.dark) .page-wrapper .thumbnail {
		background: rgba(30, 41, 59, 0.6);
	}

	.form-actions {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		align-items: center;
	}

	button {
		cursor: pointer;
		font-weight: 600;
	}

	button:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.primary-button {
		padding: 0.75rem 1.5rem;
		background: var(--primary-bg);
		color: var(--primary-text);
		border: none;
		border-radius: 999px;
		transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
	}

	.secondary-button {
		padding: 0.65rem 1.35rem;
		background: rgba(148, 163, 184, 0.08);
		color: var(--secondary-text);
		border: 1px solid var(--secondary-border);
		border-radius: 999px;
		transition: border-color 0.2s ease, background 0.2s ease;
	}

	.link-button {
		align-self: flex-start;
		padding: 0;
		border: none;
		background: none;
		color: var(--hint);
		font-size: 0.9rem;
	}

	.error-list {
		margin: 0 0 1rem;
		padding: 0.75rem 1rem;
		border-radius: 0.75rem;
		background: #fee2e2;
		color: #991b1b;
		list-style: disc;
		padding-left: 2.5rem;
	}

	.viewer-controls {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 1.5rem;
		gap: 1rem;
	}

	.viewer-status {
		font-size: 0.9rem;
		color: var(--muted);
	}

	.card-list {
		margin-top: 1.5rem;
		padding: 0;
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.card-list li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.75rem 1rem;
		border-radius: 0.9rem;
		border: 1px solid var(--list-border);
		background: var(--list-bg);
		transition: border-color 0.2s ease, box-shadow 0.2s ease;
	}

	.card-list li.active {
		border-color: var(--list-active-border);
		box-shadow: 0 12px 28px -18px rgba(37, 99, 235, 0.65);
	}

	.card-list li button {
		padding: 0.4rem 0.6rem;
		border: none;
		background: none;
		color: inherit;
		text-align: left;
	}

	.card-actions {
		display: flex;
		gap: 0.5rem;
	}

	.card-actions button {
		background: transparent;
		border: none;
		color: var(--hint);
		font-size: 0.85rem;
	}

	.empty-state {
		margin-top: 1rem;
		padding: 1rem;
		border-radius: 0.9rem;
		background: rgba(241, 245, 249, 0.75);
		color: var(--muted);
	}

	:global(.dark) .page-wrapper input[type='text'],
	:global(.dark) .page-wrapper textarea {
		box-shadow: inset 0 0 0 1px rgba(99, 102, 241, 0.05);
	}

	:global(.dark) .page-wrapper .primary-button:hover,
	.page-wrapper .primary-button:hover {
		transform: translateY(-1px);
		box-shadow: 0 12px 24px -18px rgba(99, 102, 241, 0.6);
	}

	.page-wrapper .secondary-button:hover {
		background: rgba(99, 102, 241, 0.08);
		border-color: var(--list-active-border);
	}

	:global(.dark) .page-wrapper .empty-state {
		background: rgba(30, 41, 59, 0.6);
	}

	:global(.dark) .page-wrapper .card-list li.active {
		box-shadow: 0 18px 30px -24px rgba(99, 102, 241, 0.9);
	}
</style>
