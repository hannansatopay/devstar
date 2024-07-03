<script>
  import InputForm from "./InputForm.svelte";
  import CrosswordGrid from "./CrosswordGrid.svelte";

  let words = [];
  let wordToEdit = null;
  let editIndex = null;

  const addWord = (wordObj) => {
    words = [...words, wordObj];
  };

  const deleteWord = (index) => {
    words = words.filter((_, i) => i !== index);
  };

  const startEdit = (index) => {
    wordToEdit = { ...words[index] };
    editIndex = index;
  };

  const editWord = (updatedWord) => {
    words = words.map((word, i) => (i === editIndex ? updatedWord : word));
    wordToEdit = null;
    editIndex = null;
  };
</script>

<div
  class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg"
>
  <main>
    <h1 class="title">Crossword Puzzle Maker</h1>
    <InputForm {addWord} {editWord} {wordToEdit} />
    <CrosswordGrid {words} {deleteWord} {startEdit} />
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