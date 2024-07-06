<!-- src/routes/+page.svelte -->
<script>
    let folders = [];
    let folderName = '';
    let flashCardName = '';
    let selectedFolder = null;

    function addFolder() {
        if (folderName.trim() !== '') {
            folders = [...folders, { name: folderName, flashCards: [] }];
            folderName = '';
        }
    }

    function addFlashCard() {
        if (flashCardName.trim() !== '' && selectedFolder !== null) {
            selectedFolder.flashCards = [...selectedFolder.flashCards, flashCardName];
            flashCardName = '';
        }
    }

    function selectFolder(folder) {
        selectedFolder = folder;
    }
</script>

<style>
    p{
      font-weight:bold; 
      
    }
   
    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        margin: 10px 0;
    }

    input[type="text"] {
        margin-top: 20px;
        border: solid;
        border-radius: 20px;
        margin-bottom: 20px;
        margin-right: 10px;
        padding: 8px;
        font-size: 1rem;
    }

    button {
        margin-left: 10px;
        padding: 8px 12px;
        font-size: 1rem;
        cursor: pointer;
        border: solid;
        border-radius: 20px;
    }

    .folder {
        cursor: pointer;
        font-weight: bold;
        margin-top: 20px;
        padding: 20px;
        font-size: 1.2rem;
        display: flex;
        width: 25%;
        height: 20%;
        border: 1px solid #ccc;
        border-radius: 15px;
        background-color: #f9f9f9;
        transition: background-color 0.3s, transform 0.3s;
        flex: 1 1 calc(25% - 20px); 
        box-sizing: border-box;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .folder:hover {
        background-color: #e9e9e9;
        transform: scale(1.05);
    }

    .selected {
        background-color: #d9d9d9;
    }

    .flash-card {
        margin-top: 10px;
    }
</style>

<div>
    <p>Create a New Folder</p>
    <input type="text" bind:value={folderName} placeholder="Folder name" />
    <button on:click={addFolder}>Add Folder</button>

    <p>Folders</p>
    <ul>
        {#each folders as folder}
            <li>
      <div class="folder {selectedFolder === folder ? 'selected' : ''}" on:click={() =>selectFolder(folder)}>
  {folder.name}
                </div>
                {#if selectedFolder === folder}
                    <div class="flash-card">
                        <input type="text" bind:value={flashCardName} placeholder="Flash Card name" />
                        <button on:click={addFlashCard}>Add Flash Card</button>
                    </div>
                    <ul>
                        {#each folder.flashCards as flashCard}
                            <li>{flashCard}</li>
                        {/each}
                    </ul>
                {/if}
            </li>
        {/each}
    </ul>
</div>
