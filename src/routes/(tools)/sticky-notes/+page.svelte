<script>
    export let data;
    let notes = data.Notes || [];
    let selectedColor = "#ffffff"; // Initial color

    function addNote() {
        notes = [
            ...notes,
            {
                color: selectedColor,
                name: `Note ${notes.length + 1}`,
                content: "",
            },
        ];
    }

    function changeColor(color) {
        selectedColor = color;
    }

    function updateNoteName(index, event) {
        notes = notes.map((note, i) =>
            i === index ? { ...note, name: event.target.value } : note,
        );
    }

    function updateNoteContent(index, event) {
        notes = notes.map((note, i) =>
            i === index ? { ...note, content: event.target.value } : note,
        );
    }

    function handleKeyPress(event) {
        // Prevent new lines in contenteditable when pressing Enter
        if (event.key === "Enter") {
            event.preventDefault();
        }
    }
</script>

<div class="flex h-screen">
    <aside
        class="w-64 bg-gray-100 p-4 shadow-lg flex flex-col items-start gap-4"
    >
        <button
            on:click={addNote}
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
            >Add Note</button
        >
        <span class="text-sm font-medium">Select Color:</span>
        <div class="flex gap-2 mt-2">
            <div
                class="w-8 h-8 rounded-full cursor-pointer border-2 border-white"
                style="background-color: #fbd38d"
                on:click={() => changeColor("#fbd38d")}>
            </div>
            <div
                class="w-8 h-8 rounded-full cursor-pointer border-2 border-white"
                style="background-color: #fca5a5"
                on:click={() => changeColor("#fca5a5")}>
            </div>
            <div
                class="w-8 h-8 rounded-full cursor-pointer border-2 border-white"
                style="background-color: #a0e7e5"
                on:click={() => changeColor("#a0e7e5")}>
            </div>
            <div
                class="w-8 h-8 rounded-full cursor-pointer border-2 border-white"
                style="background-color: #fbb6ce"
                on:click={() => changeColor("#fbb6ce")}>
            </div>
            <div
                class="w-8 h-8 rounded-full cursor-pointer border-2 border-white"
                style="background-color: #9ef3b3"
                on:click={() => changeColor("#9ef3b3")}>
            </div>
        </div>
    </aside>

    <div class="flex-1 p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 overflow-y-auto">
        {#each notes as note, index}
            <div
                class="note-item p-4 rounded shadow-sm relative hover:cursor-pointer h-64"
                style="background-color: {note.color};">
                <form method="post" enctype="multipart/form-data">
                    <input type="hidden" name="id" value={note.id} />
                    <input type="hidden" name="color" value={note.color} />
                    <input
                        type="text"
                        name="name"
                        class="px-2 py-1 m-4 bg-transparent outline-none font-bold text-lg"
                        style="min-height: 1.5rem; width: 100%; border: none;"
                        value={note.name}
                        on:input={(event) => updateNoteName(index, event)}
                        on:keypress={handleKeyPress}
                    />
                    <textarea
                        name="content"
                        class="p-2 bg-transparent outline-none text-base"
                        style="min-height: calc(100% - 2rem); width: 100%; border: none;"
                        rows="4"
                        on:input={(event) => updateNoteContent(index, event)}
                        on:keypress={handleKeyPress}>{note.content}</textarea
                    >
                    
                    <button
                        type="submit"
                       ><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 11.917 9.724 16.5 19 7.5"/>
                      </svg>
                      </button>
                    
                </form>
            </div>
        {/each}
    </div>
</div>
 
<style>
    :global(body) {
        margin: 0;
        font-family: "Roboto", sans-serif; /* Replace with your preferred font */
    }
</style>
