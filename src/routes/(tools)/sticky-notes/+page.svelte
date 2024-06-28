<script>
    let notes = [];
    let selectedColor = '#ffffff'; // Initial color

    function addNote() {
        notes = [...notes, { color: selectedColor, name: `Note ${notes.length + 1}`, content: '' }];
    }

    function changeColor(color) {
        selectedColor = color;
    }

    function updateNoteName(index, event) {
        notes = notes.map((note, i) => i === index ? { ...note, name: event.target.textContent } : note);
    }

    function updateNoteContent(index, event) {
        notes = notes.map((note, i) => i === index ? { ...note, content: event.target.textContent } : note);
    }

    function handleKeyPress(event) {
        // Prevent new lines in contenteditable when pressing Enter
        if (event.key === 'Enter') {
            event.preventDefault();
        }
    }
</script>

<div class="flex h-screen">
    <aside class="w-64 bg-gray-100 p-4 shadow-lg flex flex-col items-start gap-4">
        <button on:click={addNote} class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full">Add Note</button>
        <span class="text-sm font-medium">Select Color:</span>
        <div class="flex gap-2 mt-2">
            
            <div class="w-8 h-8 rounded-full cursor-pointer border-2 border-white" style="background-color: #fbd38d" on:click={() => changeColor('#fbd38d')}></div>
            <div class="w-8 h-8 rounded-full cursor-pointer border-2 border-white" style="background-color: #fca5a5" on:click={() => changeColor('#fca5a5')}></div>
            <div class="w-8 h-8 rounded-full cursor-pointer border-2 border-white" style="background-color: #a0e7e5" on:click={() => changeColor('#a0e7e5')}></div>
            <div class="w-8 h-8 rounded-full cursor-pointer border-2 border-white" style="background-color: #fbb6ce" on:click={() => changeColor('#fbb6ce')}></div>
            <div class="w-8 h-8 rounded-full cursor-pointer border-2 border-white" style="background-color: #9ef3b3" on:click={() => changeColor('#9ef3b3')}></div>
           
        </div>
    </aside>

    <div class="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto">
        {#each notes as note, index}
            <div class="p-4 rounded shadow-sm relative" style="background-color: {note.color}; min-height: 150px;">
                <div contenteditable="true"
                     on:blur={() => updateNoteName(index, event)}
                     on:keypress={handleKeyPress}
                     class="absolute top-0 left-0 right-0 px-2 py-1 bg-transparent outline-none font-bold text-lg"
                     style="min-height: 1.5rem;">
                    {note.name}
                </div>
                <div contenteditable="true"
                     on:blur={() => updateNoteContent(index, event)}
                     on:keypress={handleKeyPress}
                     class="absolute inset-0 w-full p-2 bg-transparent outline-none text-base"
                     style="top: 2rem;">
                    {note.content}
                </div>
            </div>
        {/each}
    </div>
</div>

<style>
    :global(body) {
        margin: 0;
        font-family: 'Roboto', sans-serif; /* Replace with your preferred font */
    }
</style>
