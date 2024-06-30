<script>
  import InputForm from './InputForm.svelte';
  import CrosswordGrid from './CrosswordGrid.svelte';

  let words = [];

  const addWord = (wordObj) => {
    words = [...words, wordObj];
  };
</script>

<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
	<!-- Add tool here -->
	<main>
    <h1 class="title">Crossword Puzzle Maker</h1>
    <InputForm {addWord} />
    <CrosswordGrid {words} />
  </main>
</div>

<style>
main {
    text-align: center;
    padding: 1em;
    max-width: 800px;
    margin: 0 auto;
    font-family: Arial, sans-serif;
  }
  h1 {
    font-size: 2em;
    margin-bottom: 20px;
  }
  .title {
    color: white;
  }
</style>