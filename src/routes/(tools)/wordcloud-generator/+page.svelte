<script>
    import * as cloud from "d3-cloud";

    let userInput = "";
    let wordData = [];
    const cat10colors = [
        "#1f77b4",
        "#ff7f0e",
        "#2ca02c",
        "#d62728",
        "#9467bd",
        "#8c564b",
        "#e377c2",
        "#7f7f7f",
        "#bcbd22",
        "#17becf",
    ];
    let width = 800;
    let height = 600;
    let layout;

    let fontSize = 0; // Initialize to 0
    let fontType = ""; // Initialize as an empty string
    let fontColor = 'random';
    const colorNames = ["random","blue", "orange", "green", "red", "purple", "brown", "pink", "gray", "yellow", "cyan"];
    const fontTypes = [
        "Arial",
        "Courier New",
        "Georgia",
        "Times New Roman",
        "Verdana",
        "Nunito",
        "Roboto",
        "Lato",
        "Oswald",
        "Montserrat",
        "Raleway",
        "Poppins",
        "Merriweather",
        "Ubuntu",
        "Playfair Display",
        "Open Sans",
        "Lobster",
        "Slabo 27px",
        "PT Sans",
    ];

    const generateWordCloud = () => {
        if (fontSize <= 0 || !fontType) {
            alert("Please select both font size and font type");
            return;
        }
        const words = userInput
            .split(/\s+/)
            .map((word) => ({
                text: word,
                size: Math.random() * 100 + fontSize,
            }));
        layout = cloud()
            .size([width, height])
            .words(words)
            .padding(5)
            .rotate(() => ~~(Math.random() * 2) * 90)
            .font(fontType)
            .fontSize((d) => d.size)
            .on("end", draw);

        layout.start();
    };

    const draw = (words) => {
        wordData = words.map((word) => ({
            ...word,
            x: word.x,
            y: word.y,
            rotate: word.rotate,
            size: word.size,
            text: word.text,
        }));
    };

    const downloadImage = () => {
        const svgElement = document.getElementById("wordCloud");
        const serializer = new XMLSerializer();
        const source = serializer.serializeToString(svgElement);

        const svgBlob = new Blob([source], {
            type: "image/svg+xml;charset=utf-8",
        });
        const url = URL.createObjectURL(svgBlob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "wordcloud.svg";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();
    let color = "#ffffff";
    let backgroundColor = "#f9f9f9";

    function handleChange(event) {
        color = event.target.value;
        backgroundColor = color;
    }
    function closeColorPicker() {
        showColorPicker = false;
    }
</script>

<svelte:head>
    <title>Word Cloud Generator</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
        href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Lobster&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=Slabo+27px&display=swap"
        rel="stylesheet"
    />
    <link
        href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap"
        rel="stylesheet"
    />
</svelte:head>

<div class="container mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
    <aside class="sidebar p-4 bg-gray-800 text-white rounded-lg">
        <h2 class="mb-5 text-lg font-semibold">Settings</h2>

        <label for="fontSizeRange" class="block mb-4">
            <span class="block text-sm font-medium">Font Size:</span>
            <input
                id="fontSizeRange"
                type="range"
                min="0"
                max="100"
                bind:value={fontSize}
                class="w-full"
            />
            <input
                id="fontSizeInput"
                type="number"
                min="0"
                max="100"
                bind:value={fontSize}
                class="w-full mt-2 p-2 text-gray-900"
            />
        </label>

        <label for="fontType" class="block mb-4">
            <span class="block text-sm font-medium">Font Type:</span>
            <select
                id="fontType"
                bind:value={fontType}
                class="w-full mt-2 p-2 text-gray-900"
            >
                <option value="" disabled selected>Select an option</option>
                {#each fontTypes as type}
                    <option value={type}>{type}</option>
                {/each}
            </select>
        </label>

        <label for="fontColor" class="block mb-4">
            <span class="block text-sm font-medium">Font Color:</span>
            <select
                id="fontColor"
                bind:value={fontColor}
                class="w-full mt-2 p-2 text-gray-900"
            >
                <option value="" disabled selected>Select an option</option>
                {#each colorNames as color}
                    <option value={color} style="color: {color};">{color}</option>
                {/each}
            </select>
        </label>

        <label for="color-pick" class="block mb-4">
            <span class="block text-sm font-medium">Background Color:</span>
            <input
                id="color-pick"
                type="color"
                bind:value={color}
                on:input={handleChange}
                on:click={closeColorPicker}
                class="w-full h-10 p-2 rounded"
            />
        </label>
    </aside>

    <section class="main-content lg:col-span-2">
        <div class="flex flex-col items-center">
            <label for="words" class="w-full mb-4">
                <span class="block text-lg font-medium text-gray-900 dark:text-white">Enter Words:</span>
                <textarea
                    id="words"
                    bind:value={userInput}
                    rows="4"
                    cols="50"
                    class="w-full mt-2 p-4 text-gray-900 border border-gray-300 rounded-lg"
                ></textarea>
            </label>

            <div class="flex space-x-4 mb-4">
                <button on:click={generateWordCloud} class="btn">Generate Word Cloud</button>
                <button on:click={downloadImage} class="btn">Download</button>
            </div>

            <svg
                id="wordCloud"
                viewBox={`0 0 ${width} ${height}`}
                preserveAspectRatio="xMidYMid meet"
                style="background-color: {backgroundColor};"
                class="w-full border border-gray-300 rounded-lg"
            >
                {#if wordData.length > 0}
                    <g transform={`translate(${width / 2}, ${height / 2})`}>
                        {#each wordData as word}
                            <text
                                x={word.x}
                                y={word.y}
                                style="font-size: {word.size}px; fill: {fontColor==='random'?(cat10colors[
                                    Math.floor(Math.random() * 10)
                                ]):fontColor}; transform: translate(${word.x}px, ${word.y}px) rotate({word.rotate}deg); font-family: {fontType};"
                            >
                                {word.text}
                            </text>
                        {/each}
                    </g>
                {/if}
            </svg>
        </div>
    </section>
</div>

<style>
    .btn {
        font-size: 1em;
        padding: 10px 20px;
        background-color: #1f77b4;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .btn:hover {
        background-color: #155a8a;
    }

    .container {
        max-width: 1200px;
    }

    .sidebar {
        background-color: #1f2937;
        padding: 20px;
        border-radius: 10px;
    }

    .sidebar h2 {
        font-size: 1.5em;
        margin-bottom: 20px;
    }

    .main-content {
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }

    .main-content label {
        display: block;
        font-size: 1em;
        font-weight: bold;
        margin-bottom: 5px;
    }

    .main-content textarea,
    .main-content select,
    .main-content input[type="number"],
    .main-content input[type="range"] {
        width: 100%;
        padding: 10px;
        border: 2px solid #ccc;
        border-radius: 5px;
        margin-bottom: 10px;
    }

    .main-content #wordCloud {
        border: 2px solid #ccc;
        border-radius: 10px;
        margin-top: 20px;
        background-color: #f9f9f9;
    }

    .main-content text {
        text-anchor: middle;
        alignment-baseline: middle;
    }
</style>
