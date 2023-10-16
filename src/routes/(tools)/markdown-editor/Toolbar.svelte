<script>
  const addToTextArea = function (textToAdd) {
    const textarea = document.querySelector("#myTextarea");
    let start_position = textarea.selectionStart;
    let end_position = textarea.selectionEnd;

    textarea.value = `${textarea.value.substring(0, start_position)} ${textToAdd} ${textarea.value.substring(
      end_position,
      textarea.value.length
    )}`;
  }
</script>

<!-- bold, itallic, heading, strickthrough, unorder, order, checklist, undo, redo -->
<div class="toolbar">
  <button on:click={() => addToTextArea("**Strong Text**")}>B</button>
  <button on:click={() => addToTextArea("*emphasized text*")}>I</button>
  <button on:click={() => addToTextArea("## Heading")}>H</button>
  <button>S</button>
  <button>ul</button>
  <button>ol</button>
  <button>cl</button>
  <button>undo</button>
  <button>redo</button>
</div>

<style>
  .toolbar {
    display: flex;
    width: 100%;
    justify-content: space-around;
    margin: 1rem 0;
  }
  .toolbar button {
    padding: 0.5rem 1rem;
  }
  .toolbar button:hover {
    background: lightgray;
    border-radius: 0.5rem;
  }
</style>