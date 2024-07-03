<script>
  export let addWord;
  export let editWord;
  export let wordToEdit = null;

  let word = "";
  let description = "";
  let direction = "across";

  $: if (wordToEdit) {
    word = wordToEdit.word;
    description = wordToEdit.description;
    direction = wordToEdit.direction;
  }

  const handleSubmit = () => {
    if (word && description && direction) {
      if (wordToEdit) {
        editWord({ word, description, direction });
      } else {
        addWord({ word, description, direction });
      }
      resetForm();
    }
  };

  const resetForm = () => {
    word = "";
    description = "";
    direction = "across";
    wordToEdit = null;
  };
</script>

<form on:submit|preventDefault={handleSubmit} class="input-form">
  <div class="form-group">
    <label for="word">Word:</label>
    <input type="text" id="word" bind:value={word} required />
  </div>
  <div class="form-group">
    <label for="description">Description:</label>
    <input type="text" id="description" bind:value={description} required />
  </div>
  <div class="form-group">
    <label for="direction">Direction:</label>
    <select id="direction" bind:value={direction}>
      <option value="across">Across</option>
      <option value="down">Down</option>
    </select>
  </div>
  <button type="submit" class="submit-button"
    >{wordToEdit ? "Edit Word" : "Add Word"}</button
  >
  {#if wordToEdit}
    <button type="button" on:click={resetForm} class="cancel-button"
      >Cancel</button
    >
  {/if}
</form>

<style>
  .input-form {
    max-width: 480px;
    margin: 0 auto;
    padding: 20px;
    border: 2px solid #333;
    border-radius: 8px;
    background-color: #f9f9f9;
  }
  .form-group {
    margin-bottom: 15px;
  }
  .form-group label {
    display: block;
    font-weight: bold;
    margin-bottom: 5px;
  }
  .form-group input,
  .form-group select {
    width: calc(100% - 10px);
    padding: 8px;
    font-size: 1em;
    border: 1px solid #ccc;
    border-radius: 4px;
  }
  .form-group input:focus,
  .form-group select:focus {
    border-color: #007bff;
    outline: none;
  }
  .submit-button,
  .cancel-button {
    display: block;
    width: 100%;
    padding: 10px;
    font-size: 1.2em;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }
  .submit-button {
    background-color: #007bff;
  }
  .submit-button:hover {
    background-color: #0056b3;
  }
  .cancel-button {
    margin-top: 10px;
    background-color: #e74c3c;
  }
  .cancel-button:hover {
    background-color: #c0392b;
  }
</style>