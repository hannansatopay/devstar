<svelte:head>
    <script src="https://cdn.tailwindcss.com"></script>
</svelte:head>

<script>
    let input;
    let container;
    let image;
    let placeholder;
    let showImage = false;
    let selectedAnimation = "None";
    let backgroundColor = "white"; // Default background color

    const animations = [
        { name: "None", animationClass: "" },
        { name: "Scale", animationClass: "scale-animation" },
        { name: "Rotate", animationClass: "rotate-animation" },
        { name: "Translate", animationClass: "translate-animation" },
        { name: "Opacity", animationClass: "opacity-animation" },
    ];

    function onChange() {
        const file = input.files[0];

        if (file) {
            showImage = true;

            const reader = new FileReader();
            reader.addEventListener("load", function () {
                image.setAttribute("src", reader.result);
                applyAnimation(); // Apply animation when the image is loaded
            });
            reader.readAsDataURL(file);

            return;
        }
        showImage = false;
    }

    function applyAnimation() {
        image.style.transform = "none"; // Reset transform
        image.style.opacity = "1"; // Reset opacity

        switch (selectedAnimation) {
            case "Scale":
                image.style.transform = "scale(2)";
                break;
            case "Rotate":
                image.style.transform = "rotate(45deg)";
                break;
            case "Translate":
                image.style.transform = "translate(50px, 50px)";
                break;
            case "Opacity":
                image.style.opacity = "0.5";
                break;
            default:
                // No animation selected
                break;
        }
    }
</script>

<div>
    <h1 class="text-2xl font-bold">Upload SVG with Animation</h1>
    <input bind:this={input} on:change={onChange} type="file"
        class="w-full px-3 py-2 border border-gray-300 rounded-md file:py-2 file:px-4 file:rounded-full file:border-0" />
    <div class="mt-4">
        <label for="backgroundColor" class="block font-bold">Background Color:</label>
        <input type="color" id="backgroundColor" bind:value={backgroundColor}
            class="w-full px-3 py-2 border border-gray-300 rounded-md" />
    </div>
    <div class="flex items-center justify-center h-30 max-w-sm mt-4 border">
        <div style="background-color: {backgroundColor}; padding: 20px;">
            {#if showImage}
            <img bind:this={image} src="" alt="Preview" />
            {:else}
            <span bind:this={placeholder} class="text-blue-600">Image Preview</span>
            {/if}
        </div>
    </div>
    <div class="mt-4">
        <label for="animation-select" class="block font-bold">Select Animation:</label>
        <select id="animation-select" bind:value={selectedAnimation} on:change={applyAnimation}
            class="w-full px-3 py-2 border border-gray-300 rounded-md">
            {#each animations as anim}
            <option value={anim.name}>{anim.name}</option>
            {/each}
        </select>
    </div>
</div>
