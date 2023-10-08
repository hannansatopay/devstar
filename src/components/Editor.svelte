<script>
    import { marked } from 'marked';
    let source = `
    # H1 heading

    ## H2 heading

    ### H3 heading

    --------

    **bold text**

    *italicized text*

    --------

    1. First item
    2. Second item
    3. Third item

    - First item
    - Second item
    - Third item

    [Svelte](https://svelte.dev/)
    `;
    let markdown = marked(source);
</script>


<main class="container w-full h-full">
    
    <div class="markdown-editor w-1/2">
        <div class="left-panel">
            <textarea bind:value={source} class="source"></textarea>
        </div>
    
        <div class="right-panel w-1/2">
            <div class="output">{@html markdown}</div>
        </div>
    </div>
    </main>

    
<style>
    .markdown-editor {
        width: 100%;
        height: 100vh;
        display: flex;
        align-items:flex-start;
        justify-content: space-evenly;
    }
    .left-panel, .right-panel {
        width: 50%;
        height: 100vh;
        color: black;
        margin-left: 10px;
    }
    .right-panel {
        overflow: auto;
        background: rgb(229 231 235);
        padding-top: 20px;
        padding-left: 20px;
    }
    .source {
        border: none;
        width: 100%;
        height: 100%;
        background: rgb(243 244 246);
    }
    .source:focus {
        outline: none;
    }
    .output {
        width: 100%;
    }
</style>

