<script>
	import { writable } from 'svelte/store';
  
	let title = '';
	let description = '';
	let frontImage = '';
	let frontContent = '';
	let backImage = '';
	let backContent = '';
	let isEditing = false;
	let editingIndex = null;
	let currentIndex = 0;
  
	const flashcards = writable([]);
	let showForm = true;
	let isInitialCard = true;
  
	function handleImageChange(event, isFront) {
	  const file = event.target.files[0];
	  if (file) {
		const reader = new FileReader();
		reader.onload = (e) => {
		  if (isFront) {
			frontImage = e.target.result;
		  } else {
			backImage = e.target.result;
		  }
		};
		reader.readAsDataURL(file);
	  }
	}
  
	function saveFlashcard() {
	  if ((isInitialCard && (!title || !description || !frontContent || !backContent)) || 
		  (!isInitialCard && (!frontContent || !backContent))) {
		alert('Please fill in all required fields.');
		return;
	  }
  
	  if (isEditing) {
		flashcards.update(cards => {
		  cards[editingIndex] = { title, description, frontImage, frontContent, backImage, backContent };
		  return cards;
		});
		isEditing = false;
		editingIndex = null;
	  } else {
		flashcards.update(cards => [
		  ...cards,
		  { title, description, frontImage, frontContent, backImage, backContent }
		]);
	  }
	  resetForm();
	  showForm = false;
	  isInitialCard = false;
	}
  
	function resetForm() {
	  title = '';
	  description = '';
	  frontImage = '';
	  frontContent = '';
	  backImage = '';
	  backContent = '';
	}
  
	function addNewFlashcard() {
	  resetForm();
	  showForm = true;
	  isEditing = false;
	  editingIndex = null;
	}
  
	function editFlashcard(index) {
	  flashcards.subscribe(cards => {
		const card = cards[index];
		title = card.title;
		description = card.description;
		frontImage = card.frontImage;
		frontContent = card.frontContent;
		backImage = card.backImage;
		backContent = card.backContent;
	  })();
	  showForm = true;
	  isEditing = true;
	  editingIndex = index;
	}
  
	function deleteFlashcard(index) {
	  flashcards.update(cards => cards.filter((_, i) => i !== index));
	  if (currentIndex > 0) currentIndex--;
	}
  
	function nextFlashcard() {
	  flashcards.subscribe(cards => {
		if (currentIndex < cards.length - 1) currentIndex++;
	  })();
	}
  
	function previousFlashcard() {
	  if (currentIndex > 0) currentIndex--;
	}
  </script>
  
  {#if showForm}
	<div class="max-w-md mx-auto p-4 ">
	  <h1 class="text-xl font-bold mb-4 theme-adaptive ">{isEditing ? 'Edit Flashcard' : isInitialCard ? 'Add Flashcard' : 'Add New Flashcard'}</h1>
	  {#if isInitialCard}
		<input type="text" class="block w-full p-2 mb-4 border-gray-300 rounded" placeholder="Title" bind:value={title} required />
		<textarea placeholder="Description" class="block w-full p-2 mb-4 border-gray-300 rounded" bind:value={description} required></textarea>
	  {/if}
	  <input type="file" accept="image/*" on:change={(event) => handleImageChange(event, true)} class="block w-full p-2 mb-4 border-gray-300 rounded" />
	  <input type="text" class="block w-full p-2 mb-4 border-gray-300 rounded" placeholder="Front Content" bind:value={frontContent} required />
	  <textarea placeholder="Back Content" class="block w-full p-2 mb-4 border-gray-300 rounded" bind:value={backContent} required></textarea>
	  <input type="file" accept="image/*" on:change={(event) => handleImageChange(event, false)} class="block w-full p-2 mb-4 border-gray-300 rounded" />
	  <button type="submit" class="bg-gray-900 text-white px-4 py-2 rounded hover:bg-blue-600 border-2 border-white" on:click={saveFlashcard}>Save</button>
	</div>
  {:else}
	<div >
	  <h1 class="text-xl font-bold mb-4 bg-white p-2">Flashcards</h1>
	  {#if $flashcards.length > 0}
		<div class="p-4 mb-4 border border-gray-400 rounded shadow">
		  {#each $flashcards.slice(currentIndex, currentIndex + 1) as card, index}
		  <div class="bg-white p-2">
			<h3 class="font-bold mb-2">{card.title}</h3>
			<p class="mb-2">{card.description}</p>
		   </div>
			<div class="flashcard">
			  <div class="front">
                                   {#if card.frontImage}
					<img src={card.frontImage} alt={card.title} class="w-full h-auto rounded mb-2" />
				   {/if}
                                  <h2>{card.frontContent}</h2>
			  </div>
			  <div class="back">
				{#if card.backImage}
				  <img src={card.backImage} alt="Back Image" class="w-full h-auto rounded mb-2" />
				{/if}
				<p>{card.backContent}</p>
			  </div>
			</div>
			<button class="bg-gray-900 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2 border-2 border-white" on:click={() => editFlashcard(currentIndex)}>Edit</button>
			<button class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700 border-2 border-white" on:click={() => deleteFlashcard(currentIndex)}>Delete</button>
		  {/each}
		</div>
		<div class="flex justify-between">
		  <button class="bg-gray-900 text-white px-4 py-2 rounded hover:bg-blue-600 border-2 border-white" on:click={previousFlashcard} disabled={currentIndex === 0}>Previous</button>
		  <button class="bg-gray-900 text-white px-4 py-2 rounded hover:bg-blue-600 border-2 border-white" on:click={nextFlashcard} disabled={currentIndex === $flashcards.length - 1}>Next</button>
		</div>
	  {:else}
		<p class="bg-red-800 p-2 text-white">No flashcards available. Please add a new flashcard.</p>
	  {/if}
	  <button class="bg-gray-900 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4 border-2 border-white" on:click={addNewFlashcard}>Add New Flashcard</button>
	</div>
  {/if}
  
  <style>
	body {
	  margin: 0;
	  padding: 0;
	}
	
    .theme-adaptive {
      background-color: #444;
      color: white;
	  padding: 0.5rem;
    }
  
        
  
	.flashcard {
	  perspective: 1000px;
	  width: 1000px;
	  height: 800px;
	  margin: 20px auto;
	  position: relative;
	}
  
	.flashcard .front,
	.flashcard .back {
	  width: 100%;
	  height: 100%;
	  position: absolute;
	  backface-visibility: hidden;
	  border: 1px solid #ccc;
	  border-radius: 10px;
	  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  font-family: Arial, sans-serif;
	  font-size: 1.2em;
	  transition: transform 0.6s;
	  padding: 10px;
	  box-sizing: border-box;
	  overflow: hidden;
	  text-align: center;
	  flex-direction: column;
	}
  
	.flashcard .front {
	  background-color: #ffffff;
	}
  
	.flashcard .back {
	  background-color: #f8f8f8;
	  transform: rotateY(180deg);
	}
  
	.flashcard:hover .front {
	  transform: rotateY(180deg);
	}
  
	.flashcard:hover .back {
	  transform: rotateY(0deg);
	}
  
	.flashcard .front img,
	.flashcard .back img {
	  width: 200px;
	  height: 200px;
	  object-fit: contain;
	}
  
	.flashcard .front h2,
	.flashcard .back p {
	  margin: 10px 0;
	  word-wrap: break-word;
	  overflow: hidden;
	  text-overflow: ellipsis;
	  max-height: 45%;
	}
  
	.bg-gray-900 {
	  background-color: #1a1a1a;
	}
  
	.hover\:bg-blue-600:hover {
	  background-color: #1a73e8;
	}
  
	.bg-red-500 {
	  background-color: #f56565;
	}
  
	.hover\:bg-red-700:hover {
	  background-color: #c53030;
	}
  
	.flex {
		display: flex;
    justify-content: space-between;
  }

  .justify-between {
    justify-content: space-between;
  }

  .mr-2 {
    margin-right: 0.5rem;
  }

  .mt-4 {
    margin-top: 1rem;
  }

  .disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
