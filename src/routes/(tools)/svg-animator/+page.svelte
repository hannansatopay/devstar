<svelte:head>
    <style>
        /* Custom CSS styles */
        .left-section {
            flex: 1;
            padding: 20px;
        }

        .right-section {
            flex: 1;
            padding: 20px;
            border-left: 1px solid #e5e5e5;
        }

        
    </style>
</svelte:head>

<script>
    let input;
    let container;
    let image;
    let placeholder;
    let showImage = false;
    let selectedAnimation = "None";
		let selectedFillAnimation = "None";
    let backgroundColor = "white"; // Default background color
    const animations = [
        { name: "None", animationClass: "" },
        { name: "Scale", animationClass: "scale-animation" },
        { name: "Rotate", animationClass: "rotate-animation" },
        { name: "Translate", animationClass: "translate-animation" },
        { name: "Opacity", animationClass: "opacity-animation" },
    ];
		const fillAnimations = [ // Added fill animations
        { name: "None", animationClass: "" },
        { name: "FillScale", animationClass: "fill-scale-animation" },
        { name: "FillRotate", animationClass: "fill-rotate-animation" },
        { name: "FillTranslate", animationClass: "fill-translate-animation" },
    ];
    let animationDuration = "2s";
    let animationDelay = "0s";
    let animationDirection = "normal";
	let fillAnimationDuration = "2s"; // Added fill animation duration
    let fillAnimationStaggerStep = "0.1s"; // Added fill animation stagger step
    let fillAnimationDelay = "0s"; // Added fill animation delay
    let fillAnimationEasing = "ease-in-out";
    let svgCode = ""; // Store SVG code

		const easingOptions = [
        { name: "Ease In", value: "ease-in" },
        { name: "Ease Out", value: "ease-out" },
        { name: "Ease In Out", value: "ease-in-out" },
        { name: "Linear", value: "linear" },
        { name: "Custom Easing", value: "cubic-bezier(0.68, -0.55, 0.27, 1.55)" }, // You can customize the cubic-bezier function
    ];
    // Function to toggle code display window
    function toggleCodeWindow() {
        const codeWindow = document.getElementById("code-window");
        codeWindow.classList.toggle("hidden");
    }
   function onChange() {
        const file = input.files[0];
        if (file) {
            showImage = true;
            const reader = new FileReader();
            reader.addEventListener("load", function () {
                image.setAttribute("src", reader.result);

                // Assuming you have an SVG element with the ID "uploaded-svg" for display.
                const svgElement = document.getElementById("uploaded-svg");
	
                if (svgElement) {
                    // Apply the fill animation to the uploaded SVG
                    applyFillAnimationToSvg(svgElement);
                }
            });
            reader.readAsDataURL(file);
            return;
        }
        showImage = false;
    }
    function applyAnimation() {
        image.style.transform = "none"; // Reset transform
        image.style.opacity = "1"; // Reset opacity
        image.style.transition = `transform ${animationDuration} ${animationDelay} ${animationDirection}, opacity ${animationDuration} ${animationDelay} ${animationDirection}`;
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

		function applyFillAnimation() {
        // Apply fill animation properties to the image
        switch (selectedFillAnimation) {
            case "FillScale":
                image.style.animation = `fillScale ${fillAnimationDuration} ${fillAnimationStaggerStep} ${fillAnimationDelay} ${fillAnimationEasing}`;
                break;
            case "FillRotate":
                image.style.animation = `fillRotate ${fillAnimationDuration} ${fillAnimationStaggerStep} ${fillAnimationDelay} ${fillAnimationEasing}`;
                break;
            case "FillTranslate":
                image.style.animation = `fillTranslate ${fillAnimationDuration} ${fillAnimationStaggerStep} ${fillAnimationDelay} ${fillAnimationEasing}`;
                break;
            default:
                // No fill animation selected
                break;
        }
    }

		function applyStrokeAnimation(svgElement) {
        const path = svgElement.querySelector("path");
        if (path) {
            const pathLength = path.getTotalLength();
            path.style.transition = "none";
            path.style.strokeDasharray = pathLength;
            path.style.strokeDashoffset = pathLength;

            function animatePath() {
                path.style.strokeDashoffset -= 1;
                if (path.style.strokeDashoffset <= 0) {
                    cancelAnimationFrame(animation);
                } else {
                    requestAnimationFrame(animatePath);
                }
            }

            const animation = requestAnimationFrame(animatePath);
        }
    }
		

		function onFillEasingChange() {
     
        selectedFillEasing = document.getElementById("fill-animation-easing").value;

       
        const svgElement = document.getElementById("uploaded-svg");

        if (svgElement) {
            applyFillAnimationToSvg(svgElement);
        }
    }

		function applyFillAnimationToSvg(svgElement) {
        const svgElements = svgElement.querySelectorAll('path'); // You may need to adjust this selector based on your SVG structure

        svgElements.forEach((element, index) => {
            const staggeredDelay = `${fillAnimationDelay + index * fillAnimationStaggerStep}`;

            if (selectedFillAnimation === "FillScale") {
                element.style.transform = "scale(1.5)";
            } else if (selectedFillAnimation === "FillRotate") {
                element.style.transform = "rotate(45deg)";
            } else if (selectedFillAnimation === "FillTranslate") {
                element.style.transform = "translate(20px, 20px)";
            }

            // Apply fill animation properties with staggered delay and easing
            element.style.transition = `transform ${fillAnimationDuration} ${staggeredDelay} ${selectedFillEasing}`;
        });
    }

		
    function setAnimationSettings(property, value) {
        animationSettings[property] = value;
        applyAnimation();
    }
    function getSvgCode() {
        // Create an SVG element based on the current image and properties
        const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        svg.setAttribute("width", image.width);
        svg.setAttribute("height", image.height);
        svg.style.backgroundColor = backgroundColor;
        // Create an image element
        const svgImage = document.createElementNS("http://www.w3.org/2000/svg", "image");
        svgImage.setAttribute("x", "0");
        svgImage.setAttribute("y", "0");
        svgImage.setAttribute("width", image.width);
        svgImage.setAttribute("height", image.height);
        svgImage.setAttribute("href", image.src);
        // Add animation attributes
        if (selectedAnimation !== "None") {
            svgImage.style.transition = `transform ${animationDuration} ${animationDelay} ${animationDirection}, opacity ${animationDuration} ${animationDelay} ${animationDirection}`;
            svgImage.style.transform = image.style.transform;
            svgImage.style.opacity = image.style.opacity;
        }

				 if (selectedFillAnimation !== "None") {
            svgImage.style.animation = image.style.animation;
        }
        // Append image to SVG
        svg.appendChild(svgImage);
        // Serialize SVG to XML
        svgCode = new XMLSerializer().serializeToString(svg);
        // Toggle code display window
        toggleCodeWindow();
    }
</script>

<div class="flex">
    <div class="left-section">
        <div class="bg-blue-500 p-4 text-white">
            <button on:click={getSvgCode} class="px-3 py-1 bg-white text-blue-500 rounded-md">Get Code</button>
        </div>
        <h1 class="text-2xl font-bold">Upload SVG</h1>
        <input bind:this={input} on:change={onChange} type="file"
            class="w-full px-3 py-2 border border-gray-300 rounded-md file:py-2 file:px-4 file:rounded-full file:border-0" />
        <div class="mt-4">
            <label for="backgroundColor" class="block font-bold">Background Color:</label>
            <input type="color" id="backgroundColor" bind:value={backgroundColor}
                class="w px-20 py-5 border border-gray-300 rounded-md" />
        </div>
        <div class="flex items-center justify-center h-50 max-w-sm mt-5 border">
            <div style="background-color: {backgroundColor}; padding: 20px;">
                {#if showImage}
                <img bind:this={image} src="" alt="Preview" />
                {:else}
                <span bind:this={placeholder} class="text-blue-600">Image Preview</span>
                {/if}
            </div>
        </div>
    </div>

    <div class="right-section">
			<div class="mt-4">
        <label for="animation-select" class="block font-bold">Transform Animation:</label>
        <select id="animation-select" bind:value={selectedAnimation} on:change={applyAnimation}
            class="w px-3 py-2 border border-gray-300 rounded-md">
            {#each animations as anim}
            <option value={anim.name}>{anim.name}</option>
            {/each}
        </select>
    </div>
        <div class="mt-4">
        <h2><b>Stroke Animation:</b></h2>
        <label for="animation-duration" class="block font-bold">Animation Duration:</label>
        <input type="text" id="animation-duration" bind:value={animationDuration}
            class="w px-20 py-2 border border-gray-300 rounded-md" />
    </div>
    <div class="mt-4">
        <label for="animation-delay" class="block font-bold">Animation Delay:</label>
        <input type="text" id="animation-delay" bind:value={animationDelay}
            class="w px-20 py-2 border border-gray-300 rounded-md" />
    </div>
    <div class="mt-4">
        <label for="animation-direction" class="block font-bold">Animation Direction:</label>
        <select id="animation-direction" bind:value={animationDirection} on:change={applyAnimation}
            class="w px-3 py-2 border border-gray-300 rounded-md">
            <option value="normal">Normal</option>
            <option value="reverse">Reverse</option>
            <option value="alternate">Alternate</option>
            <option value="alternate-reverse">Alternate Reverse</option>
        </select>
    </div>
			<div class="mt-4">
            <h2><b>Fill Animation:</b></h2>
            <label for="fill-animation-select" class="block font-bold">Select Fill Animation:</label>
            <select id="fill-animation-select" bind:value={selectedFillAnimation} on:change={applyFillAnimation}
                class="w px-3 py-2 border border-gray-300 rounded-md">
                {#each fillAnimations as anim}
                <option value={anim.name}>{anim.name}</option>
                {/each}
            </select>
            <label for="fill-animation-duration" class="block font-bold">Fill Animation Duration:</label>
            <input type="text" id="fill-animation-duration" bind:value={fillAnimationDuration}
                class="w px-20 py-2 border border-gray-300 rounded-md" />
            <label for="fill-animation-stagger-step" class="block font-bold">Stagger Step:</label>
            <input type="text" id="fill-animation-stagger-step" bind:value={fillAnimationStaggerStep}
                class="w px-20 py-2 border border-gray-300 rounded-md" />
            <label for="fill-animation-delay" class="block font-bold">Fill Animation Delay:</label>
            <input type="text" id="fill-animation-delay" bind:value={fillAnimationDelay}
                class="w px-20 py-2 border border-gray-300 rounded-md" />
            <label for="fill-animation-easing" class="block font-bold">Fill Animation Easing:</label>
            <select id="fill-animation-easing" bind:value={fillAnimationEasing}
                class="w px-20 py-2 border border-gray-300 rounded-md">
                {#each easingOptions as easingOption}
                <option value={easingOption.value}>{easingOption.name}</option>
                {/each}
            </select>
        </div>

    </div>
</div>

<!-- Sliding code window -->
<div id="code-window" class="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 hidden">
    <div class="bg-white p-4 rounded-md w-2/3">
        <button on:click={toggleCodeWindow} class="absolute top-2 right-2 text-gray-600 hover:text-gray-800">
            &#x2715;
        </button>
        <h2 class="text-xl font-bold">SVG Code</h2>
        <pre>{svgCode}</pre>
    </div>
</div>


