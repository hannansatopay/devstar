<script>
	import { flashcards } from './+page.svelte';
  
	let cards = [];
  
	flashcards.subscribe(value => {
	  cards = value;
	});
  </script>
  
  <div>
	<h1 class="text-xl font-bold mb-4 bg-white p-2">Flashcards</h1>
	{#each cards as card}
	  <div class="p-4 mb-4 border border-gray-400 rounded shadow">
		<h3 class="font-bold mb-2 bg-white p-2">{card.title}</h3>
		<p class="mb-2 bg-white p-2" >{card.description}</p>
		{#if card.frontImage}
		  <img src={card.frontImage} alt={card.title} class="w-full h-auto rounded" />
		{/if}
		<div class="flashcard">
		  <div class="front">
			<h2>{card.frontContent}</h2>
		  </div>
		  <div class="back">
			{#if card.backImage}
			  <img src={card.backImage} alt="Back Image" class="w-full h-auto rounded mb-2" />
			{/if}
			<p>{card.backContent}</p>
		  </div>
		</div>
	  </div>
	{/each}
  </div>
  
  <style>
	body {
	  margin: 0;
	  padding: 0;
	}
  
  
	.flashcard {
	  perspective: 1000px;
	  width: 1000px;
	  height: 600px;
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
	  max-height: 50%;
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
  </style>
  