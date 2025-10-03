<script>
    import { onMount } from "svelte";

    let inputXML = "";
    let outputXML = "";
    let inputLineNumbers = [];
    let outputLineNumbers = [];

    function updateLineNumbers(text, lineNumbers) {
        const lines = text.split("\n").length || 1;
        lineNumbers.length = lines;
        for (let i = 0; i < lines; i++) {
            lineNumbers[i] = i + 1;
        }
    }

    function formatXml(xml) {
        let formatted = "";
        let reg = /(>)(<)(\/*)/g;
        xml = xml.replace(reg, "$1\r\n$2$3");
        let pad = 0;
        xml.split("\r\n").forEach(function (node) {
            let indent = 0;
            if (node.match(/.+<\/\w[^>]*>$/)) {
                indent = 0;
            } else if (node.match(/^<\/\w/) && pad !== 0) {
                pad -= 1;
            } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                indent = 1;
            } else {
                indent = 0;
            }

            let padding = "";
            for (let i = 0; i < pad; i++) {
                padding += "  ";
            }

            formatted += padding + node + "\r\n";
            pad += indent;
        });

        return formatted;
    }

    function formatXML() {
        outputXML = formatXml(inputXML);
        updateLineNumbers(outputXML, outputLineNumbers);
    }

    function clearXML() {
        inputXML = "";
        outputXML = "";
        updateLineNumbers(inputXML, inputLineNumbers);
        updateLineNumbers(outputXML, outputLineNumbers);
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            alert("Copied to clipboard!");
        });
    }

    function loadXMLFromFile(event) {
        const file = event.target.files[0];
        if (file && (file.type === "text/xml" || file.type === "text/plain")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                inputXML = e.target.result;
                updateLineNumbers(inputXML, inputLineNumbers);
            };
            reader.readAsText(file);
        } else {
            alert("Please select a valid XML or text file.");
        }
    }

    function downloadXML() {
        if (!outputXML.trim()) {
            alert("Nothing to download. Output XML is empty.");
            return;
        }
        const blob = new Blob([outputXML], { type: "text/xml" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "formatted.xml";
        a.click();
        URL.revokeObjectURL(url);
    }

    onMount(() => {
        updateLineNumbers(inputXML, inputLineNumbers);
        updateLineNumbers(outputXML, outputLineNumbers);
    });
</script>

<section class="py-2">
    <div
        class="grid grid-cols-1 md:grid-cols-5 gap-4 mx-auto max-w-screen-xl p-4 bg-gray-200 rounded-lg shadow-lg"
    >
        <!-- Input Textarea Container -->
        <div
            class="md:col-span-2 flex flex-col items-start bg-gray-100 rounded-lg p-4 relative"
        >
            <button
                on:click={() => copyToClipboard(inputXML)}
                class="absolute top-3 right-4 hover:bg-gray-400 p-1 rounded-lg"
            >
                📋
            </button>
            <div
                class="line-numbers"
                id="inputLineNumbers"
                style="height: calc(100% - 22%);"
            >
                {#each inputLineNumbers as line}
                    <div>{line}</div>
                {/each}
            </div>
            <label
                for="inputXML"
                class="mb-2 text-sm lg:text-lg font-medium text-gray-700"
                >Input XML</label
            >
            <textarea
                id="inputXML"
                bind:value={inputXML}
                on:input={() => updateLineNumbers(inputXML, inputLineNumbers)}
                on:scroll={() =>
                    (document.getElementById("inputLineNumbers").scrollTop =
                        document.getElementById("inputXML").scrollTop)}
                class="text-sm lg:text-lg min-h-80 border border-gray-300 rounded-lg"
                placeholder="Enter your XML here..."
            ></textarea>
        </div>

        <!-- Buttons Between -->
        <div
            class="flex flex-row md:flex-col justify-center space-x-2 md:space-x-0 md:space-y-2"
        >
            <input
                type="file"
                accept=".xml, .txt"
                id="fileInput"
                class="hidden"
                on:change={loadXMLFromFile}
            />
            <button
                class="px-4 py-2 text-xs lg:text-base font-medium text-white bg-green-500 hover:bg-green-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                on:click={() => document.getElementById("fileInput").click()}
            >
                Load
            </button>
            <button
                class="px-4 py-2 text-xs lg:text-base font-medium text-white bg-gray-400 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                on:click={formatXML}
            >
                Format
            </button>
            <button
                class="px-4 py-2 text-xs lg:text-base font-medium text-white bg-gray-400 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                on:click={downloadXML}
            >
                Download
            </button>
            <button
                class="px-4 py-2 text-xs lg:text-base font-medium text-white bg-gray-400 rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                on:click={clearXML}
            >
                Clear
            </button>
        </div>

        <!-- Output Textarea Container -->
        <div
            class="md:col-span-2 flex flex-col items-start bg-gray-100 rounded-lg p-4 relative"
        >
            <button
                on:click={() => copyToClipboard(outputXML)}
                class="absolute top-3 right-4 hover:bg-gray-400 p-1 rounded-lg"
            >
                📋
            </button>
            <div
                class="line-numbers"
                id="outputLineNumbers"
                style="height: calc(100% - 22%);"
            >
                {#each outputLineNumbers as line}
                    <div>{line}</div>
                {/each}
            </div>
            <label
                for="outputXML"
                class="mb-2 text-sm lg:text-lg font-medium text-gray-700"
                >Output XML</label
            >
            <textarea
                id="outputXML"
                bind:value={outputXML}
                readonly
                on:scroll={() =>
                    (document.getElementById("outputLineNumbers").scrollTop =
                        document.getElementById("outputXML").scrollTop)}
                class="text-sm lg:text-lg min-h-80 border border-gray-300 rounded-lg bg-gray-50"
                placeholder="Output will be shown here..."
            ></textarea>
        </div>
    </div>
</section>

<style>
    .line-numbers {
        position: absolute;
        top: 56px;
        left: 0;
        width: 50px;
        height: calc(100% - 22%);
        border-right: 1px solid #ccc;
        text-align: right;
        padding-right: 10px;
        padding-left: 5px;
        color: #888;
        overflow: hidden;
        line-height: 1.5em;
        overflow-y: auto;
    }
    .line-numbers div {
        height: 1.5em;
    }
    textarea {
        width: 100%;
        height: 20rem;
        padding-left: 44px;
        line-height: 1.5em;
    }
</style>
