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




<div
    class="container mx-auto max-w-screen-xl flex flex-col lg:flex-row overflow-hidden rounded-lg"
>
    <div
        class="side bg-blue-300 w-40 shadow-xl min-h-screen top-0 left-0 bottom-0"
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
        <div class="input-area mt-16 sticky flex flex-row items-center">
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
        <div class="content mt-10 overflow-hidden max-h-auto">
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
                                    on:click={() => selectDevice(value.width, value.height)}
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
                                    on:click={() => selectDevice(value.width, value.height)}
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
                                    on:click={() => selectDevice(value.width, value.height)}
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




<style>
    * {
        box-sizing: border-box;
        padding: 0;
        margin: 0;
    }
    .container {
        position: relative;
        background-color: white;
        max-height: 100vh;
        background-color: blue;
    }
    .side {
        position: relative;
        padding-top: 15rem;
        box-shadow: 0 -1px 15px 2px rgb(0 0 0 / 0.7);
    }
    .input-area{
        position: fixed;
        position: absolute;
        transform: translate(1rem, -5rem);
    }
    .input-url {
        background-color: rgb(183, 231, 233);
        color: rgb(71, 69, 69);
        padding: 10px;
        padding-right: 0;
        border: none;
        border-radius: 5px;
        width: 52rem;
    }
    .submenu ul {
        position: absolute;
        top: 0;
        right: 0;
        color: rgb(90, 80, 83);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        z-index: 10;
        width: 170px;
        height: 44.5rem;
        opacity: 0.9;
        padding-top: 0.4rem;
        border-left: 1px solid #ccc;
        transform: translate(-59.47rem,0.01rem);
        background-color: rgb(148, 180, 148);
        overflow-y: auto;
        scrollbar-width: none;
    }
    .submenu ul button {
        padding-left: 0.6rem;
        margin-bottom: 3rem;
        border-bottom: 1px solid rgb(255, 255, 255);
    }
    main {
        margin-top: 8rem;
        margin-left: 2rem;
        overflow: auto;
        overflow-x: auto;
        /* scrollbar-width: none; */
    }
    .content {
        scroll-behavior: smooth;        
        scrollbar-width: 2rem;
        overflow-x: auto;
        overflow-y: auto;
        max-height:max-content;
        max-width: max-content;
    }
</style>