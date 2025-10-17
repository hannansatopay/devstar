<script>
    import { onMount } from "svelte";
    import { createEventDispatcher } from "svelte";
    import { jsPDF } from "jspdf";
    import html2canvas from "html2canvas";

    let presentationName = "";
    let slides = [
        {
            id: 1,
            name: "Slide 1",
            content: {
                title: {
                    text: "Title",
                    fontSize: "36px",
                    fontFamily: "Arial",
                    color: "#000",
                },
                subtitle: {
                    text: "Subtitle",
                    fontSize: "24px",
                    fontFamily: "Arial",
                    color: "#000",
                },
                content:
                    '<p contenteditable="true">Content goes here. Click to edit.</p>',
            },
        },
    ];
    let currentSlideId = 1;
    let activeElement = null;

    const dispatch = createEventDispatcher();

    function addSlide() {
        const newSlideId = slides.length + 1;
        slides = [
            ...slides,
            {
                id: newSlideId,
                name: `Slide ${newSlideId}`,
                content: {
                    title: {
                        text: "Title",
                        fontSize: "36px",
                        fontFamily: "Arial",
                        color: "#000",
                    },
                    subtitle: {
                        text: "Subtitle",
                        fontSize: "24px",
                        fontFamily: "Arial",
                        color: "#000",
                    },
                    content:
                        '<p contenteditable="true">Content goes here. Click to edit.</p>',
                },
            },
        ];
        selectSlide(newSlideId);
    }

    function selectSlide(id) {
        currentSlideId = id;
    }

    function addText() {
        const slideIndex = slides.findIndex(
            (slide) => slide.id === currentSlideId,
        );
        slides[slideIndex].content.content +=
            '<p contenteditable="true">New Text</p>';
    }

    function changeSlideName(id, event) {
        const slideIndex = slides.findIndex((slide) => slide.id === id);
        slides[slideIndex].name = event.target.value;
    }

    function changeFont(event) {
        const fontSelect = document.getElementById("font-select");
        const font = fontSelect.value;
        document.execCommand("fontName", false, font);
    }

    function changeColor(event) {
        const colorPicker = document.getElementById("color-picker");
        const color = colorPicker.value;
        document.execCommand("foreColor", false, color);
    }

    function changeFontSize(event) {
        if (activeElement) {
            const fontSize = event.target.value + "px";
            activeElement.style.fontSize = fontSize;

            updateSlideContent(activeElement);
        }
    }

    function savePresentation() {
        alert(`Saving presentation "${presentationName}"`);
        // Implement actual saving logic here
    }

    function sharePresentation() {
        const slides = document.querySelectorAll(".slide-content"); // Replace with proper Svelte query selector
        const width = window.innerWidth; // Adjust width and height as needed
        const height = window.innerHeight;

        const processSlide = async (slideContent) => {
            const canvas = await html2canvas(slideContent, {
                backgroundColor: "#ffffff",
            });
            return new Promise((resolve) => {
                canvas.toBlob((blob) => resolve(blob), "image/jpeg");
            });
        };

        Promise.all(
            Array.from(slides).map((slideContent) =>
                processSlide(slideContent),
            ),
        )
            .then((slideBlobs) => {
                const shareItems = slideBlobs.map((blob) => {
                    return {
                        title: "Presentation Slide",
                        files: [
                            new File([blob], "slide.jpg", {
                                type: "image/jpeg",
                            }),
                        ],
                    };
                });

                if (
                    navigator.canShare &&
                    navigator.canShare({ items: shareItems })
                ) {
                    navigator
                        .share({
                            items: shareItems,
                            text: "Check out this presentation!",
                        })
                        .then(() => console.log("Successfully shared"))
                        .catch((error) =>
                            console.error("Error sharing:", error),
                        );
                } else {
                    alert(
                        "Native sharing not supported on this browser. Fallback to email or other methods.",
                    );
                    // Fallback to email or other methods (e.g., open share links)
                    const emailSubject = encodeURIComponent(
                        "Check out this presentation",
                    );
                    const emailBody = encodeURIComponent(
                        "Hey there! I thought you might be interested in this presentation.",
                    );
                    const mailtoLink = `mailto:?subject=${emailSubject}&body=${emailBody}`;
                    openShareLink(mailtoLink); // Open email share link
                }
            })
            .catch((error) => {
                console.error("Error generating slide images:", error);
            });
    }

    function openShareLink(link) {
        const newWindow = window.open(link, "_blank");
        if (newWindow) {
            newWindow.focus();
        } else {
            window.location.href = link; // Fallback to redirecting if popup blocking is enabled
        }
    }

    function downloadPresentation() {
        let htmlContent =
            "<html><head><title>" + presentationName + "</title></head><body>";

        slides.forEach((slide, index) => {
            htmlContent += `<div style="font-size: ${slide.content.title.fontSize}; font-family: ${slide.content.title.fontFamily}; color: ${slide.content.title.color};">${slide.content.title.text}</div>`;
            htmlContent += `<div style="font-size: ${slide.content.subtitle.fontSize}; font-family: ${slide.content.subtitle.fontFamily}; color: ${slide.content.subtitle.color};">${slide.content.subtitle.text}</div>`;
            htmlContent += slide.content.content;
        });

        htmlContent += "</body></html>";

        const blob = new Blob([htmlContent], { type: "text/html" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = `${presentationName}.html`; // Corrected interpolation
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function hexToRgb(hex) {
        // Convert hexadecimal color to RGB array
        return [
            parseInt(hex.substring(1, 3), 16),
            parseInt(hex.substring(3, 5), 16),
            parseInt(hex.substring(5, 7), 16),
        ];
    }

    function handleContentEditableInput(event, field) {
        const slideIndex = slides.findIndex(
            (slide) => slide.id === currentSlideId,
        );
        slides[slideIndex].content[field].text = event.target.innerText;
    }

    // Variables to handle drag-and-drop functionality
    let offsetX = 0;
    let offsetY = 0;

    function handleDragStart(event) {
        const { left, top } = event.target.getBoundingClientRect();
        offsetX = event.clientX - left;
        offsetY = event.clientY - top;

        activeElement = event.target;
        event.dataTransfer.setDragImage(new Image(), 0, 0); // Hide default drag image
    }

    function handleDrag(event) {
        if (activeElement) {
            const slideEditor = document.querySelector(".slide-editor");
            const editorRect = slideEditor.getBoundingClientRect();

            const newX = event.clientX - offsetX - editorRect.left;
            const newY = event.clientY - offsetY - editorRect.top;

            // Ensure the element stays within the bounds of the white screen
            if (
                newX >= 0 &&
                newX + activeElement.offsetWidth <= slideEditor.clientWidth
            ) {
                activeElement.style.left = `${newX}px`;
            }
            if (
                newY >= 0 &&
                newY + activeElement.offsetHeight <= slideEditor.clientHeight
            ) {
                activeElement.style.top = `${newY}px`;
            }
        }
    }

    function handleDragEnd() {
        if (activeElement) {
            updateSlideContent(activeElement);
            activeElement = null;
        }
    }

    function updateSlideContent(element) {
        const slideIndex = slides.findIndex(
            (slide) => slide.id === currentSlideId,
        );
        const field = element.dataset.field;
        slides[slideIndex].content[field].fontSize = element.style.fontSize;
        slides[slideIndex].content[field].fontFamily = element.style.fontFamily;
        slides[slideIndex].content[field].color = element.style.color;
    }
</script>

<h1>Online Presentation Builder</h1>
<div class="container">
    <div class="sidebar left">
        <input
            type="text"
            bind:value={presentationName}
            class="presentation-name"
            placeholder="Presentation Name"
        />
        {#each slides as slide}
            <div class="slide-item">
                <input
                    type="text"
                    bind:value={slide.name}
                    on:input={(e) => changeSlideName(slide.id, e)}
                    on:click={() => selectSlide(slide.id)}
                    class:active={currentSlideId === slide.id}
                />
            </div>
        {/each}
        <button class="addSlide" on:click={addSlide}>Add Slide</button>

        <div class="side-tools left">
            <button class="save" on:click={savePresentation}>Save</button>
            <button class="share" on:click={sharePresentation}>Share</button>
            <button class="download" on:click={downloadPresentation}
                >Download</button
            >
        </div>
    </div>

    <div class="main">
        <div class="toolbar">
            <label for="font-select">Font:</label>
            <select id="font-select" on:change={changeFont}>
                <option value="Arial">Arial</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
            </select>
            <label for="color-picker">Color:</label>
            <input type="color" id="color-picker" on:change={changeColor} />
            <button on:click={addText}>Add Text</button>
        </div>

        <div class="slide-editor">
            {#each slides as slide (slide.id)}
                {#if slide.id === currentSlideId}
                    <div
                        class="slide-content"
                        contenteditable="true"
                        style="font-size: {slide.content.title
                            .fontSize}; font-family: {slide.content.title
                            .fontFamily}; color: {slide.content.title
                            .color}; top: 20px;"
                        on:input={(e) => handleContentEditableInput(e, "title")}
                        on:dragstart={handleDragStart}
                        on:drag={handleDrag}
                        on:dragend={handleDragEnd}
                        draggable="true"
                        data-field="title"
                    >
                        {slide.content.title.text}
                    </div>
                    <div
                        class="slide-content"
                        contenteditable="true"
                        style="font-size: {slide.content.subtitle
                            .fontSize}; font-family: {slide.content.subtitle
                            .fontFamily}; color: {slide.content.subtitle
                            .color}; top: 80px;"
                        on:input={(e) =>
                            handleContentEditableInput(e, "subtitle")}
                        on:dragstart={handleDragStart}
                        on:drag={handleDrag}
                        on:dragend={handleDragEnd}
                        draggable="true"
                        data-field="subtitle"
                    >
                        {slide.content.subtitle.text}
                    </div>
                    <div
                        class="slide-content"
                        contenteditable="true"
                        style="font-size: {slide.content
                            .contentFontSize}; font-family: {slide.content
                            .contentFontFamily}; color: {slide.content
                            .contentColor}; top: 140px;"
                        on:input={(e) =>
                            handleContentEditableInput(e, "content")}
                        on:dragstart={handleDragStart}
                        on:drag={handleDrag}
                        on:dragend={handleDragEnd}
                        draggable="true"
                        data-field="content"
                    >
                        {@html slide.content.content}
                    </div>
                {/if}
            {/each}
        </div>
    </div>
</div>

<style>
    @import url("https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap");

    * {
        box-sizing: border-box;
        font-family: "Roboto", sans-serif;
    }

    h1 {
        font-size: 35px;
        font-weight: 500;
        color: #fff;
        padding-top: 0; /* Removes all margin */
        padding-bottom: 10px; /* Removes padding at the top and sets bottom padding */
    }
    .presentation-name {
        border-radius: 6px;
        border: 3px solid #023872;
    }
    .addSlide {
        padding: 10px 7px;
        width: 100px;
        border-radius: 5px;
        text-align: center;
        background-color: #5a04cb;
    }
    .addSlide:hover {
        font-size: 18px;
    }
    .container {
        display: flex;
        height: 100vh;
        background-color: #f4f4f4;
    }

    .sidebar {
        width: 250px;
        background-color: #1f2b46;
        color: #fff;
        padding: 15px;
        box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
        transition: width 0.3s ease;
    }

    .sidebar:hover {
        width: 280px;
    }

    .sidebar.left {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: flex-start;
    }

    .main {
        flex: 1;
        display: flex;
        flex-direction: column;
    }

    .toolbar {
        display: flex;
        align-items: center;
        padding: 15px;
        background-color: #fff;
        border-bottom: 2px solid #002348;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .toolbar label,
    .toolbar select,
    .toolbar input,
    .toolbar button {
        margin-right: 15px;
    }

    .toolbar button {
        padding: 8px 12px;
        border: none;
        background-color: #00a2ff;
        color: #fff;
        border-radius: 5px;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    .toolbar button:hover {
        font-size: 18px;
    }

    .slide-editor {
        flex: 1;
        position: relative;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        background-color: #f8f9fa;
        overflow: hidden;
    }

    .slide-content {
        position: absolute;
        border: 1px solid #ccc;
        padding: 10px;
        background-color: #fff;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        cursor: move;
        transition: box-shadow 0.3s ease;
    }

    .slide-content:focus {
        box-shadow: 0 0 15px rgba(0, 123, 255, 0.5);
    }

    .side-tools {
        display: flex;
        flex-direction: column;
        padding: 10px;
        margin-top: 20px;
        border-top: 1px solid #010d59;
    }

    .side-tools.left {
        align-items: flex-start;
        border-top: none;
    }

    .side-tools.left button {
        margin-bottom: 10px;
        color: #fff;
        padding: 10px 15px;
        cursor: pointer;
        border-radius: 5px;
        transition: background-color 0.3s ease;
    }
    .save {
        background-color: #15ff00;
    }
    .share {
        background-color: #ffc403;
    }
    .download {
        background-color: #ff4d00;
    }

    .side-tools.left button:hover {
        font-size: 18px;
    }

    .side-tools.left button:active {
        transform: translateY(5px);
    }

    .slide-item input {
        color: #000;
        background-color: #fff;
        border: none;
        width: 100%;
        padding: 5px;
        margin-bottom: 10px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: box-shadow 0.3s ease;
    }

    .slide-item input:focus {
        outline: none;
        box-shadow: 0 1px 5px rgba(0, 123, 255, 0.5);
    }

    .presentation-name {
        color: #000;
        background-color: #fff;
        border: none;
        padding: 8px;
        margin-bottom: 15px;
        width: 100%;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        transition: box-shadow 0.3s ease;
    }

    .presentation-name:focus {
        outline: none;
        box-shadow: 0 1px 5px rgba(0, 123, 255, 0.5);
    }
</style>
