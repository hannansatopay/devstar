<script>
    import { onMount } from 'svelte';
    import { writable } from 'svelte/store';

    const dbName = 'sticky_notes_db';
    const dbVersion = 1;
    let db;

    const openDB = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, dbVersion);

            request.onerror = (event) => {
                console.error('Error opening database:', event.target.error);
                reject(event.target.error);
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                console.log('Database opened successfully');
                resolve();
            };

            request.onupgradeneeded = (event) => {
                db = event.target.result;
                if (!db.objectStoreNames.contains('notes')) {
                    const store = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
                    store.createIndex('name', 'name', { unique: false });
                    store.createIndex('color', 'color', { unique: false });
                    store.createIndex('content', 'content', { unique: false });
                }
            };
        });
    };

  
    const fetchNotes = async () => {
        const transaction = db.transaction(['notes'], 'readonly');
        const store = transaction.objectStore('notes');
        const request = store.getAll();
        return new Promise((resolve, reject) => {
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = (event) => {
                console.error('Error fetching notes:', event.target.error);
                reject(event.target.error);
            };
        });
    };

 
    const saveNote = async (note) => {
        const transaction = db.transaction(['notes'], 'readwrite');
        const store = transaction.objectStore('notes');
        if (note.id) {
            note.updatedAt = new Date().toISOString();
            store.put(note);
        } else {
            note.createdAt = new Date().toISOString();
            const request = store.add(note);
            request.onsuccess = () => {
                note.id = request.result; 
            };
        }
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                console.log('Note saved successfully');
                resolve();
            };
            transaction.onerror = (event) => {
                console.error('Error saving note:', event.target.error);
                reject(event.target.error);
            };
        });
    };

   
    const deleteNote = async (id) => {
        const transaction = db.transaction(['notes'], 'readwrite');
        const store = transaction.objectStore('notes');
        store.delete(id);
        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                console.log('Note deleted successfully');
                resolve();
            };
            transaction.onerror = (event) => {
                console.error('Error deleting note:', event.target.error);
                reject(event.target.error);
            };
        });
    };

    
    onMount(async () => {
        await openDB();
        const existingNotes = await fetchNotes();
        notes.set(existingNotes);
    });

    
    let notes = writable([]);

    
    async function addNote() {
        const newNote = {
            color: selectedColor,
            name: `Note ${$notes.length + 1}`,
            content: "",
            pinned: false 
        };
        
        await saveNote(newNote);
        notes.update(existingNotes => [...existingNotes, newNote]);
    }

    
    function togglePin(id) {
    notes.update(existingNotes => {
        const updatedNotes = existingNotes.map(note => {
            if (note.id === id) {
                note.pinned = !note.pinned;
                saveNote(note); 
            }
            return note;
        });
        
        return updatedNotes;
    });
}


function unpinNote(id) {
    notes.update(existingNotes => {
        const updatedNotes = existingNotes.map(note => {
            if (note.id === id) {
                note.pinned = false; 
                saveNote(note); 
            }
            return note;
        });
        return updatedNotes;
    });
}

   
    function updateNoteName(index, event) {
        notes.update(existingNotes => {
            const updatedNotes = [...existingNotes];
            updatedNotes[index].name = event.target.value;
            saveNote(updatedNotes[index]); 
            return updatedNotes;
        });
    }

    
    function updateNoteContent(index, event) {
        notes.update(existingNotes => {
            const updatedNotes = [...existingNotes];
            updatedNotes[index].content = event.target.value;
            saveNote(updatedNotes[index]); 
            return updatedNotes;
        });
    }

    
    async function handleDelete(id) {
        await deleteNote(id);
        notes.update(existingNotes => existingNotes.filter(note => note.id !== id));
    }

    function handleKeyPress(event) {
        if (event.key === "Enter") {
            event.preventDefault();
        }
    }

   
    let selectedColor = "#ffffff"; 

    
    function changeColor(color) {
        selectedColor = color;
    }

    
</script>

<div class="flex h-screen">
    <aside class="w-64 bg-gray-800 text-white p-6 shadow-lg flex flex-col items-start gap-6">
        <button on:click={addNote} class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full">Add Note</button>
        <span class="text-sm font-medium">Select Color:</span>
        <div class="flex gap-2 mt-2">
            <button class="w-8 h-8 rounded-full cursor-pointer hover:border-black border-2 color-button" style="background-color: #fbd38d" on:click={() => changeColor("#fbd38d")}></button>
            <button class="w-8 h-8 rounded-full cursor-pointer hover:border-black border-2 color-button" style="background-color: #fca5a5" on:click={() => changeColor("#fca5a5")}></button>
            <button class="w-8 h-8 rounded-full cursor-pointer hover:border-black border-2 color-button" style="background-color: #a0e7e5" on:click={() => changeColor("#a0e7e5")}></button>
            <button class="w-8 h-8 rounded-full cursor-pointer hover:border-black border-2 color-button" style="background-color: #fbb6ce" on:click={() => changeColor("#fbb6ce")}></button>
            <button class="w-8 h-8 rounded-full cursor-pointer hover:border-black border-2 color-button" style="background-color: #9ef3b3" on:click={() => changeColor("#9ef3b3")}></button>
        </div>        
    </aside>

    <div class="flex-1 p-4 grid md:grid-cols-3 gap-4 overflow-y-auto">
        {#each $notes as note, index (note.id)}
            {#if note.pinned}
               
                <div class="note-item p-4 rounded shadow-lg relative hover:cursor-pointer h-64 pinned-note" style="background-color: {note.color};">
                    <form method="post" enctype="multipart/form-data">
                        <input type="hidden" name="id" value={note.id} />
                        <input type="hidden" name="color" value={note.color} />
                        <input type="text" name="name" class="px-2 py-1 bg-transparent outline-none font-bold text-lg w-full autocomplete-off" value={note.name} on:input={(event) => updateNoteName(index, event)} on:keypress={handleKeyPress} />
                        <textarea name="content" class="p-2 bg-transparent outline-none text-base w-full resize-none autocomplete-off" rows="4" on:input={(event) => updateNoteContent(index, event)} on:keypress={handleKeyPress}>{note.content}</textarea>
                        <div class="flex justify-between items-center mt-3">
                            <span class="text-xs text-gray-500">Last updated: {note.updatedAt ? new Date(note.updatedAt).toLocaleString() : new Date(note.createdAt).toLocaleString()}</span>
                            <button type="button" class="text-black-500 hover:text-red-600 flex items-center gap-1" on:click={() => handleDelete(note.id)}>
                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="35" height="35" viewBox="0 0 64 64">
                                    <path d="M 28 7 C 25.243 7 23 9.243 23 12 L 23 15 L 13 15 C 11.896 15 11 15.896 11 17 C 11 18.104 11.896 19 13 19 L 15.109375 19 L 16.792969 49.332031 C 16.970969 52.510031 19.600203 55 22.783203 55 L 41.216797 55 C 44.398797 55 47.029031 52.510031 47.207031 49.332031 L 48.890625 19 L 51 19 C 52.104 19 53 18.104 53 17 C 53 15.896 52.104 15 51 15 L 41 15 L 41 12 C 41 9.243 38.757 7 36 7 L 28 7 z M 28 11 L 36 11 C 36.552 11 37 11.449 37 12 L 37 15 L 27 15 L 27 12 C 27 11.449 27.448 11 28 11 z M 32 23.25 C 32.967 23.25 33.75 24.034 33.75 25 L 33.75 45 C 33.75 45.966 32.967 46.75 32 46.75 C 31.033 46.75 30.25 45.966 30.25 45 L 30.25 25 C 30.25 24.034 31.033 23.25 32 23.25 z M 40.007812 23.25 C 40.972813 23.284 41.728313 24.094547 41.695312 25.060547 L 40.998047 45.146484 C 40.965047 46.092484 40.190953 46.836937 39.251953 46.835938 C 39.230953 46.835938 39.210453 46.833984 39.189453 46.833984 C 38.224453 46.799984 37.468953 45.989438 37.501953 45.023438 L 38.197266 24.9375 C 38.231266 23.9725 39.039813 23.223 40.007812 23.25 z M 23.990234 23.251953 C 24.954234 23.228953 25.766781 23.973453 25.800781 24.939453 L 26.498047 45.025391 C 26.532047 45.991391 25.776547 46.801938 24.810547 46.835938 C 24.790547 46.835937 24.769047 46.835938 24.748047 46.835938 C 23.810047 46.835938 23.033 46.091484 23 45.146484 L 22.302734 25.060547 C 22.268734 24.094547 23.024234 23.285953 23.990234 23.251953 z"></path>
                                </svg> 
                            </button>
                            <button type="button" class="text-black-500 hover:text-red-600 flex items-center gap-1" on:click={() => unpinNote(note.id)}>
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1218 1.87023C15.7573 0.505682 13.4779 0.76575 12.4558 2.40261L9.61062 6.95916C9.61033 6.95965 9.60913 6.96167 9.6038 6.96549C9.59728 6.97016 9.58336 6.97822 9.56001 6.9848C9.50899 6.99916 9.44234 6.99805 9.38281 6.97599C8.41173 6.61599 6.74483 6.22052 5.01389 6.87251C4.08132 7.22378 3.61596 8.03222 3.56525 8.85243C3.51687 9.63502 3.83293 10.4395 4.41425 11.0208L7.94975 14.5563L1.26973 21.2363C0.879206 21.6269 0.879206 22.26 1.26973 22.6506C1.66025 23.0411 2.29342 23.0411 2.68394 22.6506L9.36397 15.9705L12.8995 19.5061C13.4808 20.0874 14.2853 20.4035 15.0679 20.3551C15.8881 20.3044 16.6966 19.839 17.0478 18.9065C17.6998 17.1755 17.3043 15.5086 16.9444 14.5375C16.9223 14.478 16.9212 14.4114 16.9355 14.3603C16.9421 14.337 16.9502 14.3231 16.9549 14.3165C16.9587 14.3112 16.9606 14.31 16.9611 14.3098L21.5177 11.4645C23.1546 10.4424 23.4147 8.16307 22.0501 6.79853L17.1218 1.87023ZM14.1523 3.46191C14.493 2.91629 15.2528 2.8296 15.7076 3.28445L20.6359 8.21274C21.0907 8.66759 21.0041 9.42737 20.4584 9.76806L15.9019 12.6133C14.9572 13.2032 14.7469 14.3637 15.0691 15.2327C15.3549 16.0037 15.5829 17.1217 15.1762 18.2015C15.1484 18.2752 15.1175 18.3018 15.0985 18.3149C15.0743 18.3316 15.0266 18.3538 14.9445 18.3589C14.767 18.3699 14.5135 18.2916 14.3137 18.0919L5.82846 9.6066C5.62872 9.40686 5.55046 9.15333 5.56144 8.97583C5.56651 8.8937 5.58877 8.84605 5.60548 8.82181C5.61855 8.80285 5.64516 8.7719 5.71886 8.74414C6.79869 8.33741 7.91661 8.56545 8.68762 8.85128C9.55668 9.17345 10.7171 8.96318 11.3071 8.01845L14.1523 3.46191Z" fill="#0F0F0F"/>
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            {:else}
                
                <div class="note-item p-4 rounded shadow-lg relative hover:cursor-pointer h-64" style="background-color: {note.color};">
                    <form method="post" enctype="multipart/form-data">
                        <input type="hidden" name="id" value={note.id} />
                        <input type="hidden" name="color" value={note.color} />
                        <input type="text" name="name" class="px-2 py-1 bg-transparent outline-none font-bold text-lg w-full autocomplete-off" value={note.name} on:input={(event) => updateNoteName(index, event)} on:keypress={handleKeyPress} />
                        <textarea name="content" class="p-2 bg-transparent outline-none text-base w-full resize-none autocomplete-off" rows="4" on:input={(event) => updateNoteContent(index, event)} on:keypress={handleKeyPress}>{note.content}</textarea>
                        <div class="flex justify-between items-center mt-3">
                            <span class="text-xs text-gray-500">Last updated: {note.updatedAt ? new Date(note.updatedAt).toLocaleString() : new Date(note.createdAt).toLocaleString()}</span>
                            <button type="button" class="text-black-500 hover:text-red-600 flex items-center gap-1" on:click={() => handleDelete(note.id)}>
                                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="35" height="35" viewBox="0 0 64 64">
                                    <path d="M 28 7 C 25.243 7 23 9.243 23 12 L 23 15 L 13 15 C 11.896 15 11 15.896 11 17 C 11 18.104 11.896 19 13 19 L 15.109375 19 L 16.792969 49.332031 C 16.970969 52.510031 19.600203 55 22.783203 55 L 41.216797 55 C 44.398797 55 47.029031 52.510031 47.207031 49.332031 L 48.890625 19 L 51 19 C 52.104 19 53 18.104 53 17 C 53 15.896 52.104 15 51 15 L 41 15 L 41 12 C 41 9.243 38.757 7 36 7 L 28 7 z M 28 11 L 36 11 C 36.552 11 37 11.449 37 12 L 37 15 L 27 15 L 27 12 C 27 11.449 27.448 11 28 11 z M 32 23.25 C 32.967 23.25 33.75 24.034 33.75 25 L 33.75 45 C 33.75 45.966 32.967 46.75 32 46.75 C 31.033 46.75 30.25 45.966 30.25 45 L 30.25 25 C 30.25 24.034 31.033 23.25 32 23.25 z M 40.007812 23.25 C 40.972813 23.284 41.728313 24.094547 41.695312 25.060547 L 40.998047 45.146484 C 40.965047 46.092484 40.190953 46.836937 39.251953 46.835938 C 39.230953 46.835938 39.210453 46.833984 39.189453 46.833984 C 38.224453 46.799984 37.468953 45.989438 37.501953 45.023438 L 38.197266 24.9375 C 38.231266 23.9725 39.039813 23.223 40.007812 23.25 z M 23.990234 23.251953 C 24.954234 23.228953 25.766781 23.973453 25.800781 24.939453 L 26.498047 45.025391 C 26.532047 45.991391 25.776547 46.801938 24.810547 46.835938 C 24.790547 46.835937 24.769047 46.835938 24.748047 46.835938 C 23.810047 46.835938 23.033 46.091484 23 45.146484 L 22.302734 25.060547 C 22.268734 24.094547 23.024234 23.285953 23.990234 23.251953 z"></path>
                                </svg> 
                            </button>
                            <button type="button" class="text-black-500 hover:text-red-600 flex items-center gap-1" on:click={() => togglePin(note.id)}>
                                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path fill-rule="evenodd" clip-rule="evenodd" d="M17.1218 1.87023C15.7573 0.505682 13.4779 0.76575 12.4558 2.40261L9.61062 6.95916C9.61033 6.95965 9.60913 6.96167 9.6038 6.96549C9.59728 6.97016 9.58336 6.97822 9.56001 6.9848C9.50899 6.99916 9.44234 6.99805 9.38281 6.97599C8.41173 6.61599 6.74483 6.22052 5.01389 6.87251C4.08132 7.22378 3.61596 8.03222 3.56525 8.85243C3.51687 9.63502 3.83293 10.4395 4.41425 11.0208L7.94975 14.5563L1.26973 21.2363C0.879206 21.6269 0.879206 22.26 1.26973 22.6506C1.66025 23.0411 2.29342 23.0411 2.68394 22.6506L9.36397 15.9705L12.8995 19.5061C13.4808 20.0874 14.2853 20.4035 15.0679 20.3551C15.8881 20.3044 16.6966 19.839 17.0478 18.9065C17.6998 17.1755 17.3043 15.5086 16.9444 14.5375C16.9223 14.478 16.9212 14.4114 16.9355 14.3603C16.9421 14.337 16.9502 14.3231 16.9549 14.3165C16.9587 14.3112 16.9606 14.31 16.9611 14.3098L21.5177 11.4645C23.1546 10.4424 23.4147 8.16307 22.0501 6.79853L17.1218 1.87023ZM14.1523 3.46191C14.493 2.91629 15.2528 2.8296 15.7076 3.28445L20.6359 8.21274C21.0907 8.66759 21.0041 9.42737 20.4584 9.76806L15.9019 12.6133C14.9572 13.2032 14.7469 14.3637 15.0691 15.2327C15.3549 16.0037 15.5829 17.1217 15.1762 18.2015C15.1484 18.2752 15.1175 18.3018 15.0985 18.3149C15.0743 18.3316 15.0266 18.3538 14.9445 18.3589C14.767 18.3699 14.5135 18.2916 14.3137 18.0919L5.82846 9.6066C5.62872 9.40686 5.55046 9.15333 5.56144 8.97583C5.56651 8.8937 5.58877 8.84605 5.60548 8.82181C5.61855 8.80285 5.64516 8.7719 5.71886 8.74414C6.79869 8.33741 7.91661 8.56545 8.68762 8.85128C9.55668 9.17345 10.7171 8.96318 11.3071 8.01845L14.1523 3.46191Z" fill="#0F0F0F"/>
                                </svg>
                            </button>
                        </div>
                    </form>
                </div>
            {/if}
        {/each}
    </div>
</div>
<style>
    
    .pinned-note {
        border: 2px solid #ffcc00; 
    }

  
    .color-button {
        border: none;
    }

    :global(body) {
        margin: 0;
        font-family: "Roboto", sans-serif;
        background-color: #1a202c;
        color: black;
    }

    .note-item {
        transition: transform 0.2s;
    }

    .note-item:hover {
        transform: scale(1.05);
    }

    .text-black-500 {
        color: #000;
    }

    .hover\:text-red-600:hover {
        color: #f56565;
    }

    .note-item form .flex > button {
        padding: 0.25rem;
        background: transparent;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 0.25rem;
    }
</style>
