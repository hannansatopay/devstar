<script>
    import * as cloud from 'd3-cloud';

    let userInput = "";
    let wordData = [];
    const cat10colors = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"];
    let width = 800;
    let height = 600;
    let layout;

    let fontSize = 0; // Initialize to 0
    let fontType = ''; // Initialize as an empty string
    const fontTypes = [
        'Arial', 'Courier New', 'Georgia', 'Times New Roman', 'Verdana', 
        'Nunito', 'Roboto', 'Lato', 'Oswald', 'Montserrat', 
        'Raleway', 'Poppins', 'Merriweather', 'Ubuntu', 'Playfair Display', 
        'Open Sans', 'Lobster', 'Raleway', 'Slabo 27px', 'PT Sans'
    ];

    const generateWordCloud = () => {
        if (fontSize <= 0 || !fontType) {
            alert("Please select both font size and font type");
            return;
        }
        const words = userInput.split(/\s+/).map(word => ({ text: word, size: Math.random() * 100 + fontSize }));
        layout = cloud()
            .size([width, height])
            .words(words)
            .padding(5)
            .rotate(() => ~~(Math.random() * 2) * 90)
            .font(fontType)
            .fontSize(d => d.size)
            .on("end", draw);

        layout.start();
    };

    const draw = words => {
        wordData = words.map(word => ({
            ...word,
            x: word.x,
            y: word.y
        }));
    };
</script>

<svelte:head>
    <title>Word Cloud Generator</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Oswald:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Raleway:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Lobster&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=Slabo+27px&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet">
</svelte:head>

<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
    <section>
        <label for="words">
            <h2 class="text-white m-5">Enter Words:</h2>
            <textarea id="words" bind:value={userInput} rows="4" cols="50"></textarea>
        </label>
        
        <label for="fontSizeRange">
            <h2 class="text-white m-5">Font Size:</h2>
            <input id="fontSizeRange" type="range" min="0" max="100" bind:value={fontSize} />
            <input id="fontSizeInput" type="number" min="0" max="100" bind:value={fontSize} />
        </label>

        <label for="fontType">
            <h2 class="text-white m-5">Font Type:</h2>
            <select id="fontType" bind:value={fontType}>
                <option value="" disabled selected>Select an option</option>
                {#each fontTypes as type}
                    <option value={type}>{type}</option>
                {/each}
            </select>
        </label>

        <button on:click={generateWordCloud}>Generate Word Cloud</button>

        <svg id="wordCloud" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="xMidYMid meet">
            {#if wordData.length > 0}
                <g transform={`translate(${width / 2}, ${height / 2})`}>
                    {#each wordData as word}
                        <text
                            x={word.x}
                            y={word.y}
                            style="font-size: {word.size}px; fill: {cat10colors[Math.floor(Math.random() * 10)]}; transform: translate(${word.x}px, ${word.y}px) rotate({word.rotate}deg); font-family: {fontType};">
                            {word.text}
                        </text>
                    {/each}
                </g>
            {/if}
        </svg>
    </section>
</div>

<style>
    .card {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
    }

    section {
        font-family: 'Nunito', sans-serif;
        max-width: 800px;
        margin: 0 auto;
        text-align: center;
    }

    h1 {
        font-size: 2em;
        margin-bottom: 20px;
    }

    label {
        display: block;
        margin-bottom: 10px;
        font-size: 1.2em;
    }

    textarea, select, input[type="number"], input[type="range"] {
        width: 100%;
        font-size: 1em;
        padding: 10px;
        border: 2px solid #ccc;
        border-radius: 5px;
        margin-bottom: 10px;
        resize: vertical;
    }

    button {
        font-size: 1em;
        padding: 10px 20px;
        background-color: #1f77b4;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    button:hover {
        background-color: #155a8a;
    }

    #wordCloud {
        border: 2px solid #ccc;
        border-radius: 10px;
        margin-top: 20px;
        background-color: #f9f9f9;
    }

    text {
        text-anchor: middle;
        alignment-baseline: middle;
    }
</style>
