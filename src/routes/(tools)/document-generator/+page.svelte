<script>
    import { writable } from 'svelte/store';
    import { jsPDF } from 'jspdf';
    import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
    import { saveAs } from 'file-saver';

    let sections = writable([]);
    let format = writable('pdf');

    const addSection = () => {
        sections.update(s => [...s, { type: 'header', content: '', size: 24, bold: true, alignment: 'left', fontFamily: 'Helvetica', highlightColor: '#ffffff' }]);
    };

    const removeSection = (index) => {
        sections.update(s => s.filter((_, i) => i !== index));
    };

    const updateSection = (index, key, value) => {
        sections.update(s => {
            s[index][key] = value;
            return s;
        });
    };

    const generatePDF = async () => {
        const doc = new jsPDF();
        let y = 20;

        const getImageDimensions = async (url) => {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve({ width: img.width, height: img.height });
                img.onerror = (err) => reject(err);
                img.src = url;
            });
        };

        for (let section of $sections) {
            doc.setFontSize(section.size);
            doc.setFont(section.fontFamily, section.bold ? 'bold' : 'normal');

            let x;
            switch (section.alignment) {
                case 'center':
                    x = doc.internal.pageSize.getWidth() / 2;
                    break;
                case 'right':
                    x = doc.internal.pageSize.getWidth() - 20;
                    break;
                default:
                    x = 20;
                    break;
            }

            if (section.type === 'header' || section.type === 'paragraph') {
                const lines = doc.splitTextToSize(section.content, doc.internal.pageSize.getWidth() - 40);
                const lineHeight = section.size / doc.internal.scaleFactor;
                const pageHeight = doc.internal.pageSize.height;

                if (section.type === 'header') {
                    const textWidth = doc.getStringUnitWidth(section.content) * section.size / doc.internal.scaleFactor;
                    const textHeight = lineHeight * lines.length;
                    doc.setFillColor(section.highlightColor);
                    doc.rect(20, y - lineHeight + 2, doc.internal.pageSize.getWidth() - 40, textHeight, 'F');
                }

                lines.forEach(line => {
                    if (y + lineHeight > pageHeight - 20) {
                        doc.addPage();
                        y = 20;
                    }
                    doc.text(line, x, y, { align: section.alignment });
                    y += lineHeight;
                });
                y += 10; // Add some extra space between paragraphs
            } else if (section.type === 'image' && section.content) {
                try {
                    const dimensions = await getImageDimensions(section.content);
                    const imageWidth = doc.internal.pageSize.getWidth() - 40;
                    const imageHeight = dimensions.height * imageWidth / dimensions.width;

                    if (y + imageHeight > doc.internal.pageSize.height - 20) {
                        doc.addPage();
                        y = 20;
                    }

                    doc.addImage(section.content, 'JPEG', 20, y, imageWidth, imageHeight);
                    y += imageHeight + 10; // Add some extra space after the image
                } catch (error) {
                    console.error('Error loading image:', error);
                }
            }
        }

        doc.save('document.pdf');
    };

    const fetchImage = async (url) => {
        const response = await fetch(url);
        const blob = await response.blob();
        return blob.arrayBuffer();
    };

    const generateDOC = async () => {
        const children = [];

        for (let section of $sections) {
            if (section.type === 'header' || section.type === 'paragraph') {
                let runs = [
                    new TextRun({
                        text: section.content,
                        bold: section.bold,
                        size: section.size * 2,
                        font: section.fontFamily
                    })
                ];

                if (section.type === 'header') {
                    children.push(new Paragraph({
                        children: runs,
                        alignment: section.alignment,
                        shading: {
                            fill: section.highlightColor
                        },
                        spacing: { after: 200 }
                    }));
                } else {
                    children.push(new Paragraph({
                        children: runs,
                        alignment: section.alignment,
                        spacing: { after: 200 }
                    }));
                }
            } else if (section.type === 'image' && section.content) {
                const imageBuffer = await fetchImage(section.content);
                children.push(new Paragraph({
                    children: [new ImageRun({ data: imageBuffer, transformation: { width: 600, height: 400 } })],
                    spacing: { after: 200 },
                }));
            }
        }

        const doc = new Document({
            sections: [{ properties: {}, children }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, "document.docx");
    };

    const generateDocument = () => {
        if ($format === 'pdf') {
            generatePDF();
        } else {
            generateDOC();
        }
    };
</script>

<style>
    body {
        font-family: 'Roboto', Arial, sans-serif;
        background-color: #f0f0f0;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
        padding: 0;
    }
    .container {
        max-width: 800px;
        padding: 20px;
        background-color: #ffffff;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
        border-radius: 8px;
    }
    h2 {
        color: #007bff;
        text-align: center;
        margin-bottom: 20px;
    }
    label {
        display: block;
        margin-top: 10px;
        color: #555555;
    }
    input, textarea, select {
        width: 100%;
        padding: 10px;
        margin-top: 5px;
        border: 1px solid #cccccc;
        border-radius: 4px;
        font-size: 14px;
    }
    button {
        margin-top: 20px;
        padding: 10px 20px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        transition: background-color 0.3s ease;
    }
    .highlightColor, .boldCheck{
        width:20px;
        display:flex;
        align-items: center;
        justify-content: center;
    }
    button:hover {
        background-color: #0056b3;
    }
    .section {
        margin-bottom: 20px;
        padding: 15px;
        border: 1px solid #dddddd;
        border-radius: 4px;
        background-color: #fafafa;
    }
    .section-actions {
        margin-top: 10px;
        text-align: right;
    }
    .section-actions button {
        background-color: #dc3545;
        margin-left: 10px;
        font-size: 14px;
    }
    .section-actions button:hover {
        background-color: #bd2130;
    }
</style>
<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden rounded-lg">
<main style="display: flex;
    align-items: center;
    justify-content: center; padding:15px;">
    <div class="container">
        <h2>Create Document</h2>

        {#each $sections as section, index}
            <div class="section">
                <label>Type:</label>
                <select bind:value={section.type} on:change={e => updateSection(index, 'type', e.target.value)}>
                    <option value="header">Header</option>
                    <option value="paragraph">Paragraph</option>
                    <option value="image">Image</option>
                </select>

                {#if section.type === 'header' || section.type === 'paragraph'}
                    <label>Content:</label>
                    <textarea bind:value={section.content} on:input={e => updateSection(index, 'content', e.target.value)}></textarea>
                {/if}

                {#if section.type === 'image'}
                    <label>Image URL:</label>
                    <input type="text" bind:value={section.content} on:input={e => updateSection(index, 'content', e.target.value)} />
                {/if}

                <label>Font Size:</label>
                <input type="number" min="1" max="72" bind:value={section.size} on:input={e => updateSection(index, 'size', e.target.value)} />

                <label>Font Family:</label>
                <select bind:value={section.fontFamily} on:change={e => updateSection(index, 'fontFamily', e.target.value)}>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times New Roman">Times New Roman</option>
                    <option value="Arial">Arial</option>
                    <option value="Courier New">Courier New</option>
                    <option value="Georgia">Georgia</option>
                </select>

                {#if section.type === 'header'}
                    <label>Highlight Color:</label>
                    <input class="highlightColor" type="color" bind:value={section.highlightColor} on:input={e => updateSection(index, 'highlightColor', e.target.value)} />
                {/if}

                <label>Bold:</label>
                <input class="boldCheck" type="checkbox" bind:checked={section.bold} on:change={e => updateSection(index, 'bold', e.target.checked)} />

                <label>Alignment:</label>
                <select bind:value={section.alignment} on:change={e => updateSection(index, 'alignment', e.target.value)}>
                    <option value="left">Left</option>
                    <option value="center">Center</option>
                    <option value="right">Right</option>
                </select>

                <div class="section-actions">
                    <button on:click={() => removeSection(index)}>Remove Section</button>
                </div>
            </div>
        {/each}

        <button on:click={addSection}>Add Section</button>

        <label for="format">Select Format:</label>
        <select id="format" bind:value={$format}>
            <option value="pdf">PDF</option>
            <option value="doc">DOC</option>
        </select>

        <button on:click={generateDocument}>Generate Document</button>
    </div>
</main>
</div>