<script>
    import { faTabletScreenButton } from "@fortawesome/free-solid-svg-icons";
    import { FontAwesomeIcon } from "@fortawesome/svelte-fontawesome";
    import { faDesktop } from "@fortawesome/free-solid-svg-icons";
    import { faMobile } from "@fortawesome/free-solid-svg-icons";

    $: defaultHeight = null;
    $: defaultWidth = null;
    $: inputUrl = "";
    $: storedUrl = "";

    let clicked = {
        mobile: false,
        desktop: false,
        tablet: false,
    };

    let isButtonClicked = false;

    let mobile = [
        { "Apple iPhone 3/4/4s": { width: 320, height: 480 } },
        { "Apple iPhone 5/5s": { width: 320, height: 568 } },
        { "Apple iPhone 6/6s/7": { width: 375, height: 667 } },
        { "Apple iPhone 6s Plus / 7 Plus": { width: 414, height: 736 } },
        { "Samsung Galaxy S5/S6/S7": { width: 360, height: 640 } },
        { "Sony Xperia Z2/Z3": { width: 360, height: 640 } },
        { "Google Pixel": { width: 411, height: 731 } },
        { "Nexus 4": { width: 384, height: 640 } },
        { "Samsung Galaxy S8": { width: 360, height: 740 } },
        { "OnePlus 8": { width: 412, height: 869 } },
    ];

    let desktop = [
        { "24_desktop": { width: 1920, height: 1200 } },
        { "23_desktop": { width: 1920, height: 1080 } },
        { "22_desktop": { width: 1680, height: 1050 } },
        { "20_desktop": { width: 1600, height: 900 } },
        { "19_desktop": { width: 1440, height: 900 } },
        { "15_notebook": { width: 1366, height: 768 } },
        { "13_notebook": { width: 1024, height: 800 } },
        { "10_notebook": { width: 1024, height: 600 } },
        { "Apple Thunderbolt Display": { width: 2560, height: 1440 } },
        { "Dell UltraSharp Monitor": { width: 1440, height: 900 } },
    ];

    let tablet = [
        { "Apple iPad Mini": { width: 768, height: 1024 } },
        { "Apple iPad Retina": { width: 768, height: 1024 } },
        { "Apple iPad Pro": { width: 1366, height: 1024 } },
        { "Amazon Kindle Fire": { width: 768, height: 1024 } },
        { "Amazon Kindle Fire HD": { width: 768, height: 1024 } },
        { "Asus Eee 1000": { width: 768, height: 1024 } },
        { "Nexus 7": { width: 600, height: 960 } },
        { "Nexus 9": { width: 1024, height: 768 } },
        { "Samsung Galaxy Tab S7": { width: 2560, height: 1600 } },
        { "Microsoft Surface Pro": { width: 2736, height: 1824 } },
    ];

    function toggleSidebar(deviceType) {
        clicked[deviceType] = !clicked[deviceType];

        // Close other sidebars
        for (let key in clicked) {
            if (key !== deviceType) {
                clicked[key] = false;
            }
        }
    }

    function dropDownPage(inputUrl) {
        defaultHeight = 1920;
        defaultWidth = 1080;
        storedUrl = inputUrl;
    }

    function selectDevice(width, height) {
        defaultWidth = width;
        defaultHeight = height;

        isButtonClicked = !isButtonClicked;

        for (let key in clicked) {
            clicked[key] = false;
        }
    }
</script>
<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden rounded-lg">
<div
    class="container mx-auto max-w-screen-xl flex flex-col lg:flex-row overflow-hidden rounded-lg"
>
    <div
        class="side bg-gray-400 w-40 shadow-xl min-h-screen top-0 left-0 bottom-0"
    >
        <button
            class="flex flex-col justify-between items-center"
            on:click={() => toggleSidebar("mobile")}
        >
            <FontAwesomeIcon class="w-14 h-14 py-6 px-14" icon={faMobile} />
        </button>

        <button
            class="flex flex-col justify-between items-center"
            on:click={() => toggleSidebar("desktop")}
        >
            <FontAwesomeIcon class="w-14 h-14 py-6 px-14" icon={faDesktop} />
        </button>

        <button
            class="flex flex-col justify-between items-center"
            on:click={() => toggleSidebar("tablet")}
        >
            <FontAwesomeIcon
                class="w-14 h-14 py-6 px-14"
                icon={faTabletScreenButton}
            />
        </button>
    </div>

    <main class="flex-1 py-16 w-screen">
        <div class="input-area gap-2 flex flex-row items-center">
            <input
                type="text"
                bind:value={inputUrl}
                placeholder=""
                class="input-url"
            />
            <button
                on:click={() => dropDownPage(inputUrl)}
                class="bg-black hover:bg-black-900 text-white w-11 h-11 rounded"
                >Go</button
            >
        </div>
        <div class="content overflow-hidden">
            <object
                type="text/html"
                data={storedUrl}
                width={defaultWidth}
                height={defaultHeight}
                title="drop-down-page"
            >
            </object>
        </div>
        <div class="mini-sidebar">
            {#if clicked.mobile}
                <div class="submenu">
                    <ul>
                        {#each mobile as device}
                            {#each Object.entries(device) as [key, value]}
                                <button
                                    class="block w-full mb-4 text-left font-bold"
                                    on:click={() =>
                                        selectDevice(value.width, value.height)}
                                >
                                    {key}<br />
                                    <p class="text-sm text-gray-500">
                                        {value.width}x{value.height}
                                    </p>
                                </button>
                            {/each}
                        {/each}
                    </ul>
                </div>
            {/if}

            {#if clicked.desktop}
                <div class="submenu">
                    <ul>
                        {#each desktop as device}
                            {#each Object.entries(device) as [key, value]}
                                <button
                                    class="block w-full mb-4 text-left font-bold"
                                    on:click={() =>
                                        selectDevice(value.width, value.height)}
                                >
                                    {key}<br />
                                    <p class="text-sm text-gray-500">
                                        {value.width}x{value.height}
                                    </p>
                                </button>
                            {/each}
                        {/each}
                    </ul>
                </div>
            {/if}

            {#if clicked.tablet}
                <div class="submenu">
                    <ul>
                        {#each tablet as device}
                            {#each Object.entries(device) as [key, value]}
                                <button
                                    class="block w-full h-32 text-left font-bold"
                                    on:click={() =>
                                        selectDevice(value.width, value.height)}
                                >
                                    {key}<br />
                                    <p class="text-sm text-gray-500">
                                        {value.width}x{value.height}
                                    </p>
                                </button>
                            {/each}
                        {/each}
                    </ul>
                </div>
            {/if}
        </div>
    </main>
</div>
</div>

<style>
    * {
        box-sizing: border-box;
        padding: 0;
        margin: 0;
    }
    .container {
        overflow:hidden;
        position: relative;
        background-color: rgb(161, 157, 157);
        height: 130vh;
        justify-content: center;
    }
    .side {
        position: relative;
        padding-top: 15rem;
        box-shadow: 0 -1px 15px 2px rgb(0 0 0 / 0.7);
    }
    .input-area {
        margin-top:10%;
        /* position: fixed; */
        position: absolute;
        transform: translate(1rem, -26rem);
    }
    .input-url {
        background-color: rgb(202, 222, 223);
        color: rgb(71, 69, 69);
        padding: 10px;
        padding-right: 0;
        border: none;
        border-radius: 5px;
        width: 40rem;
    }
    .submenu ul {
        position: absolute;
        top: 0;
        right: -6%;
        color: rgb(255, 255, 255);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 10;
        width: 170px;
        height: 55rem;
        padding-top: 0.4rem;
        border-left: 1px solid #ccc;
        transform: translate(-59.47rem, 0.01rem);
        background-color: rgb(34, 34, 34);
        overflow-y: auto;
        scrollbar-width: none;
    }
    .submenu ul button {
        padding-left: 0.6rem;
        margin-bottom: 3rem;
        border-bottom: 1px solid rgb(255, 255, 255);
        font-weight: 300;
    }
    main {
        display: flex;
        align-items: center;
        justify-content: center;
        /* margin-top: 2rem; */
    }
    .content {
        width:100%;
        /* padding:10px 20px 20px 20px; */
        scroll-behavior: smooth;
        transform:scale(0.584);
        scrollbar-width:auto;
        overflow-x: auto;
        overflow-y: auto;
       height: 800px;
        /* max-width: 1400px; */
    }
    
</style>
