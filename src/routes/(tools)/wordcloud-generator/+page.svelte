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

    let fontSize = 0;
    let fontType = "";
    let fontColor = "random";
    const colorNames = [
        "random",
        "blue",
        "orange",
        "green",
        "red",
        "purple",
        "brown",
        "pink",
        "gray",
        "yellow",
        "cyan",
    ];
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

        const uniqueWords = [...new Set(userInput.split(/\s+/))];

        const words = uniqueWords.map((word) => ({
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

<section class="py-2">
    <div
        class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-3 overflow-hidden rounded-lg"
    >
        <aside
            class="p-8 h-full bg-gray-100 dark:bg-gray-800 text-black dark:text-white rounded-lg"
        >
            <h2 class="mb-5 text-base lg:text-xl font-semibold">Settings</h2>

            <label for="fontSizeRange" class="block mb-4">
                <span class="block text-xs lg:text-base font-medium"
                    >Font Size:</span
                >
                <input
                    id="fontSizeRange"
                    type="range"
                    min="0"
                    max="100"
                    bind:value={fontSize}
                    class="w-full rounded-lg my-2"
                />
                <input
                    id="fontSizeInput"
                    type="number"
                    min="0"
                    max="100"
                    bind:value={fontSize}
                    class="w-full text-xs lg:text-base p-2 text-gray-900 rounded-lg"
                />
            </label>

            <label for="fontType" class="block mb-4">
                <span class="block text-xs lg:text-base font-medium"
                    >Font Type:</span
                >
                <select
                    id="fontType"
                    bind:value={fontType}
                    class="w-full mt-2 p-2 text-xs lg:text-base text-gray-900 rounded-lg"
                >
                    <option value="" disabled selected>Select an option</option>
                    {#each fontTypes as type}
                        <option value={type} class="text-xs lg:text-base"
                            >{type}</option
                        >
                    {/each}
                </select>
            </label>

            <label for="fontColor" class="block mb-4">
                <span class="block text-xs lg:text-base font-medium"
                    >Font Color:</span
                >
                <select
                    id="fontColor"
                    bind:value={fontColor}
                    class="w-full mt-2 p-2 text-xs lg:text-base text-gray-900 rounded-lg"
                >
                    <option value="" disabled selected>Select an option</option>
                    {#each colorNames as color}
                        <option
                            value={color}
                            class="text-xs lg:text-base"
                            style="color: {color};">{color}</option
                        >
                    {/each}
                </select>
            </label>

            <label for="color-pick" class="block mb-4">
                <span class="block text-xs lg:text-base font-medium"
                    >Background Color:</span
                >
                <input
                    id="color-pick"
                    type="color"
                    bind:value={color}
                    on:input={handleChange}
                    on:click={closeColorPicker}
                    class="w-1/6 h-10 rounded text-xs lg:text-base"
                />
            </label>
        </aside>

        <div class="p-8 lg:col-span-2">
            <div class="flex flex-col items-center">
                <label for="words" class="w-full mb-4">
                    <span
                        class="block text-base lg:text-xl font-medium text-gray-900 dark:text-white"
                        >Enter Words:</span
                    >
                    <textarea
                        id="words"
                        bind:value={userInput}
                        rows="3"
                        cols="50"
                        class="w-full mt-2 p-4 text-xs lg:text-base text-gray-900 border border-gray-300 rounded-lg"
                    ></textarea>
                </label>

                <div class="flex space-x-4 mb-4">
                    <button
                        on:click={generateWordCloud}
                        class="btn text-xs lg:text-base bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 hover:dark:bg-blue-700"
                        >Generate Word Cloud</button
                    >
                    <button
                        on:click={downloadImage}
                        class="btn text-xs lg:text-base bg-gray-500 dark:bg-gray-700 hover:bg-gray-600 hover:dark:bg-gray-800"
                        >Download</button
                    >
                </div>

                <svg
                    id="wordCloud"
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="xMidYMid meet"
                    style="background-color: {backgroundColor};"
                    class="w-full max-h-80 border border-gray-300 rounded-lg"
                >
                    {#if wordData.length > 0}
                        <g transform={`translate(${width / 2}, ${height / 2})`}>
                            {#each wordData as word}
                                <text
                                    x={word.x}
                                    y={word.y}
                                    style="font-size: {word.size}px; fill: {fontColor ===
                                    'random'
                                        ? cat10colors[
                                              Math.floor(Math.random() * 10)
                                          ]
                                        : fontColor}; transform: translate(${word.x}px, ${word.y}px) rotate({word.rotate}deg); font-family: {fontType};"
                                >
                                    {word.text}
                                </text>
                            {/each}
                        </g>
                    {/if}
                </svg>
            </div>
        </div>
    </div>
</section>

<style>
    .btn {
        font-size: 1em;
        padding: 10px 20px;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }
</style>
