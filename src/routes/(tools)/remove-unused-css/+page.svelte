<script>
    import { onMount } from "svelte";
    import { parse } from "@babel/parser";
    import { parse as parseCSS, stringify } from "css";

    let htmlFile = "";
    let cssFile = "";
    let originalCSS = "";
    let cleanedCSS = "";

    async function removeUnusedCSS() {
        // Store original CSS for comparison
        originalCSS = cssFile;

        // Parse HTML
        const htmlAst = parse(htmlFile, {
            sourceType: "module",
            plugins: ["jsx"],
        });

        // Parse CSS
        const cssAst = parseCSS(cssFile, { source: cssFile });

        // Extract CSS selectors from HTML
        const usedSelectors = new Set();
        htmlAst.program.body.forEach((node) => {
            if (
                node.type === "JSXElement" &&
                node.openingElement.name.type === "JSXIdentifier"
            ) {
                usedSelectors.add(node.openingElement.name.name.toLowerCase());
            }
        });

        // Remove unused CSS rules
        cssAst.stylesheet.rules = cssAst.stylesheet.rules.filter((rule) => {
            if (rule.type === "rule") {
                return rule.selectors.some((selector) =>
                    usedSelectors.has(selector.toLowerCase()),
                );
            }
            return true; // Keep other types of rules (e.g., @keyframes, @media)
        });

        // Generate cleaned CSS
        cleanedCSS = stringify(cssAst);
    }

    function handleHTMLFileChange(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            htmlFile = e.target.result;
        };
        reader.readAsText(file);
    }

    function handleCSSFileChange(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = function (e) {
            cssFile = e.target.result;
        };
        reader.readAsText(file);
    }

    // Example of using onMount to initialize data
    let initialized = false;
    onMount(() => {
        if (!initialized) {
            console.log("Component mounted");
            initialized = true;
        }
    });
</script>

<div>
    <input
        style="color: aqua;"
        type="file"
        accept=".html"
        onchange={handleHTMLFileChange}
    />
    <input
        style="color: aqua;"
        type="file"
        accept=".css"
        onchange={handleCSSFileChange}
    />
    <button style="color: aqua;" on:click={removeUnusedCSS}
        >Remove Unused CSS</button
    >
</div>

{#if originalCSS && cleanedCSS}
    <div class="diff-line">
        Original CSS:
        <pre>{originalCSS}</pre>
    </div>
    <div class="diff-line">
        Cleaned CSS:
        <pre>{cleanedCSS}</pre>
    </div>
    <div class="diff-line">
        Difference:
        <pre>
		{#each cleanedCSS.split("\n") as line, index}
                {#if originalCSS.split("\n")[index] !== line}
                    <span
                        class={originalCSS.split("\n")[index]
                            ? "removed"
                            : "added"}>
			  {originalCSS.split("\n")[index] ? originalCSS.split("\n")[index] : line}
			</span>
                {:else}
                    {line}
                {/if}
		  {#if index !== cleanedCSS.split("\n").length - 1}<br
                    />{/if}
            {/each}
	  </pre>
    </div>
{/if}

<style>
    .diff-line {
        font-family: monospace;
        white-space: pre-wrap;
        padding: 10px;
        background-color: #f7f7f7;
        border: 1px solid #ccc;
        margin-top: 10px;
    }

    .removed {
        background-color: #ffe6e6;
        text-decoration: line-through;
    }

    .added {
        background-color: #e6ffe6;
        font-weight: bold;
    }
</style>
