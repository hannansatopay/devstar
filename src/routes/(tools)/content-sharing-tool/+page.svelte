<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import { writable, derived } from 'svelte/store';

    let content = writable({ category: '', tags: '', title: '', text: '' });
    let categories = writable([]);
    let tags = writable([]);
    let filteredCategories = writable([]);
    let sharedContent = writable([]);

    let showEmptyModal = false;
    let showSuccessModal = false;
    let showErrorModal = false;

    let contentSectionVisibility = 'display: block;';
    let sharedContentsVisibility = 'display: none;';
    let shareButtonClass = 'nav-btn';
    let showButtonClass = 'nav-btn';

    function fetchContents() {
        const storedContents = localStorage.getItem('sharedContents');
        if (storedContents) {
            sharedContent.set(JSON.parse(storedContents));
        }
    }

    function toggleContentSectionVisibility() {
        contentSectionVisibility = 'display: block;';
        sharedContentsVisibility = 'display: none;';
        shareButtonClass = 'nav-btn active';
        showButtonClass = 'nav-btn';
    }

    function toggleSharedContentsVisibility() {
        contentSectionVisibility = 'display: none;';
        sharedContentsVisibility = 'display: block;';
        shareButtonClass = 'nav-btn';
        showButtonClass = 'nav-btn active';
    }

    const dispatcher = createEventDispatcher();

    onMount(() => {
        dispatcher('toggleContentSectionVisibility', toggleContentSectionVisibility);
        dispatcher('toggleSharedContentsVisibility', toggleSharedContentsVisibility);
        fetchContents();
        initializeCategories();
        initializeTags();
    });

    function initializeCategories() {
        const storedCategories = localStorage.getItem('categories');
        if (!storedCategories) {
            localStorage.setItem('categories', JSON.stringify(['None', 'Technology', 'Science', 'Entertainment', 'Health']));
            categories.set(['None', 'Technology', 'Science', 'Entertainment', 'Health']);
        } else {
            try {
                const parsedCategories = JSON.parse(storedCategories);
                if (Array.isArray(parsedCategories)) {
                    categories.set(parsedCategories);
                } else {
                    console.error('Stored categories is not an array:', parsedCategories);
                    localStorage.setItem('categories', JSON.stringify(['None', 'Technology', 'Science', 'Entertainment', 'Health']));
                    categories.set(['None', 'Technology', 'Science', 'Entertainment', 'Health']);
                }
            } catch (error) {
                console.error('Error parsing stored categories:', error);
                localStorage.setItem('categories', JSON.stringify(['None', 'Technology', 'Science', 'Entertainment', 'Health']));
                categories.set(['None', 'Technology', 'Science', 'Entertainment', 'Health']);
            }
        }
    }

    function initializeTags() {
        const storedTags = localStorage.getItem('tags');
        if (storedTags) {
            tags.set(JSON.parse(storedTags));
        }
    }

    function filterCategories(event) {
        const inputValue = event.target.value.toLowerCase();
        const storedCategories = JSON.parse(localStorage.getItem('categories'));
        if (Array.isArray(storedCategories)) {
            filteredCategories.set(storedCategories.filter(cat => cat.toLowerCase().includes(inputValue)));
        } else {
            console.error('Stored categories is not an array:', storedCategories);
            filteredCategories.set([]);
        }
    }

    function shareContent() {
        if (!content.category || !content.title || !content.text) {
            showEmptyModal = true;
            return;
        }

        const newContent = {
            category: content.category,
            tags: content.tags,
            title: content.title,
            text: content.text
        };

        const storedContents = JSON.parse(localStorage.getItem('sharedContents')) || [];
        const updatedContents = [...storedContents, newContent];
        localStorage.setItem('sharedContents', JSON.stringify(updatedContents));
        sharedContent.set(updatedContents);

        showSuccessModal = true;
        content.set({ category: '', tags: '', title: '', text: '' });
        console.log('Shared content:', newContent);
    }

    function closeModal() {
        showEmptyModal = false;
        showSuccessModal = false;
        showErrorModal = false;
    }

    function addCategory(newCategory) {
        categories.update(arr => {
            if (!arr.includes(newCategory)) {
                arr.push(newCategory);
                localStorage.setItem('categories', JSON.stringify(arr));
            }
            return arr;
        });
    }

    function addTag(newTag) {
        tags.update(arr => {
            if (!arr.includes(newTag)) {
                arr.push(newTag);
                localStorage.setItem('tags', JSON.stringify(arr));
            }
            return arr;
        });
    }

    function handleNewCategory(event) {
        const newCategory = event.target.value;
        addCategory(newCategory);
        content.update(obj => ({ ...obj, category: newCategory }));
    }

    function handleCategorySelection(event) {
        content.update(obj => ({ ...obj, category: event.target.value }));
    }

    function handleNewTag(event) {
        const newTag = event.target.value;
        addTag(newTag);
        content.update(obj => ({ ...obj, tags: newTag }));
    }

    let searchQuery = writable('');
    let selectedCategory = writable('');
    let selectedTag = writable('');

    const filteredSharedContent = derived(
        [sharedContent, searchQuery, selectedCategory, selectedTag],
        ([$sharedContent, $searchQuery, $selectedCategory, $selectedTag]) => {
            const query = $searchQuery.toLowerCase().trim();
            const categoryFilter = $selectedCategory.toLowerCase();
            const tagFilter = $selectedTag.toLowerCase();

            return $sharedContent.filter(item =>
                (query === '' ||
                    item.category.toLowerCase().includes(query) ||
                    item.tags.toLowerCase().includes(query) ||
                    item.title.toLowerCase().includes(query) ||
                    item.text.toLowerCase().includes(query)) &&
                (categoryFilter === '' || item.category.toLowerCase() === categoryFilter) &&
                (tagFilter === '' || item.tags.toLowerCase().includes(tagFilter))
            );
        }
    );
</script>

<main>
    <nav class="navbar">
        <div class="nav-buttons">
            <button class="{shareButtonClass}" on:click={toggleContentSectionVisibility}>Share Your Content</button>
            <button class="{showButtonClass}" on:click={toggleSharedContentsVisibility}>Show Shared Contents</button>
        </div>
    </nav>
    <section class="content-section" style={contentSectionVisibility}>
        <h2>Share your Content here</h2>
        <div class="content-box">
            <div class="additional-settings">
                <h3>Additional settings:</h3>
                <label for="title">Name/Title:</label>
                <input type="text" id="title" bind:value={content.title} placeholder="Add a title" />
                <label for="category">Category:</label>
                <input type="text" id="category" bind:value={content.category} on:input={filterCategories} on:change={handleNewCategory} list="categoryList" placeholder="Add or select a category" />
                <datalist id="categoryList">
                    {#each $filteredCategories as cat}
                        <option value={cat}></option>
                    {/each}
                </datalist>
                <label for="tags">Tags:</label>
                <input type="text" id="tags" bind:value={content.tags} on:change={handleNewTag} list="tagList" placeholder="Add or select tags (comma-separated)">
                <datalist id="tagList">
                    {#each $tags as tag}
                        <option value={tag}></option>
                    {/each}
                </datalist>
            </div>
            <label for="">Content</label>
            <textarea bind:value={content.text} placeholder="Enter your content here"></textarea>
            
            <button class="share-btn" on:click={shareContent}>Share Your Content</button>
        </div>
    </section>
    <section class="shared-contents" style={sharedContentsVisibility}>
        <h2>Shared Contents</h2>
        <div class="search-bar">
            <input type="text" placeholder="Search..." bind:value={$searchQuery}>
        </div>
        <div class="category-filter">
            <select bind:value={$selectedCategory}>
                <option value="">All Categories</option>
                {#each $categories as category}
                    <option value={category}>{category}</option>
                {/each}
            </select>
        </div>
        <div class="tag-filter">
            <select bind:value={$selectedTag}>
                <option value="">All Tags</option>
                {#each $tags as tag}
                    <option value={tag}>{tag}</option>
                {/each}
            </select>
        </div>
        {#if $filteredSharedContent.length > 0}
            {#each $filteredSharedContent as sharedContent, index}
                <div class="content-box" id="content-{index}">
                    <h3><strong>Title: {sharedContent.title} </strong></h3>
                    <p><strong>Category:</strong> {sharedContent.category}</p>
                    <p><strong>Tags:</strong> {sharedContent.tags}</p>
                    <p><strong>Content: </strong>{sharedContent.text}</p>
                </div>
            {/each}
        {:else}
            <p>No shared contents match the search criteria.</p>
        {/if}
    </section>

    <div class="modal" style="{showEmptyModal ? 'display: flex;' : 'display: none;'}">
        <div class="modal-content">
            <span class="close" on:click={closeModal}>&times;</span>
            <h2>Please Fill All Fields</h2>
            <p>Please make sure to fill all fields before sharing.</p>
        </div>
    </div>

    <div class="modal" style="{showSuccessModal ? 'display: flex;' : 'display: none;'}">
        <div class="modal-content">
            <span class="close" on:click={closeModal}>&times;</span>
            
            {#if $sharedContent.length > 0}
                <span>
                    <h2>Sharing Successful</h2>
                    <p>Your content has been successfully shared and stored!</p>
                </span>
            {:else}
                <p>Oops! Something went wrong. Your content couldn't be stored.</p>
            {/if}
        </div>
    </div>
</main>

<style>
    /* Navbar */
    .navbar {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: #333;
        color: white;
        padding: 1rem;
    }

    .nav-buttons {
        display: flex;
        gap: 1rem;
    }

    .nav-btn {
        background-color: #2c2b2b;
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .nav-btn.active {
        background-color: #1a1a1a;
    }

    /* Content Section */
    .content-section {
        padding: 2rem;
    }

    .content-box {
        background-color: #bde7ea;
        padding: 1rem;
        border-radius: 5px;
    }

    textarea {
        width: 100%;
        min-height: 150px;
        padding: 0.5rem;
        border: 1px solid #c099ae;
        border-radius: 5px;
        margin: 1rem 0;
    }

    .additional-settings {
        margin-top: 1rem;
    }

    select,
    input {
        width: 100%;
        padding: 0.5rem;
        margin: 0.5rem 0;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    .share-btn {
        background-color: #2c2b2b;
        color: white;
        padding: 0.5rem 1rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    /* Shared Contents */
    .shared-contents {
        padding: 2rem;
        background-color: #f9f9f9;
        border-radius: 5px;
        margin-top: 2rem;
        display: none;
    }

    .shared-contents h2 {
        margin-bottom: 1rem;
        color: #000000;
        font-size: 1.5rem
    }

    .shared-contents .content-box {
        background-color: #bde7ea;
        padding: 1rem;
        border-radius: 5px;
        margin-bottom: 1rem;
    }

    .shared-contents h3 {
        margin-bottom: 0.5rem;
        color: #000000;
    }

    .shared-contents p {
        margin: 0.5rem 0;
        color: #000000;
    }

    /* Content Section */
    .content-section h2{
        color: white;
        font-size: 1.5rem;
    }

    /* Modals */
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: none;
        justify-content: center;
        align-items: center;
        z-index: 9999;
    }

    .modal-content {
        background-color: white;
        padding: 2rem;
        border-radius: 5px;
        width: 50%;
        max-width: 600px;
        text-align: center;
        position: relative;
    }

    .close {
        position: absolute;
        top: 0;
        right: 0;
        padding: 0.5rem;
        cursor: pointer;
    }
</style>
