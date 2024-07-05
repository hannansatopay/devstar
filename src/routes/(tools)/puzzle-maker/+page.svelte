<script>
  import InputForm from './InputForm.svelte';
  import CrosswordGrid from './CrosswordGrid.svelte';

  let words = [];
  let wordToEdit = null;
  let editIndex = null;

  const addWord = (wordObj) => {
    words = [...words, wordObj];
  };

  const deleteWord = (index) => {
    words = words.filter((_, i) => i !== index);
    if (editIndex === index) {
      wordToEdit = null;
      editIndex = null;
    }
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

<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
  <main>
    <InputForm {addWord} {editWord} {wordToEdit} />
  </main>
  <aside>
    <CrosswordGrid {words} {deleteWord} {startEdit} />
  </aside>
</div>

<style>
  .card {
    display: grid;
    gap: 16px;
    align-items: top;
    max-width: 100%;
    overflow: hidden;
    border-radius: 8px;
  }  

  @media (min-width: 1024px) {
    .card {
      grid-template-columns: 1fr 1fr;
    }
  }

  main, aside {
    padding: 20px;
    background-color: #111827;
    border-radius: 8px;
  }

  main {
    order: 1;
  }

  aside {
    order: 2;
  }
</style>