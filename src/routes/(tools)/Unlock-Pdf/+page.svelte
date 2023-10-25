<script lang="ts">
  import { Label, Input, Range } from 'flowbite-svelte';
  import Intro from '$lib/Intro.svelte';
  import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

  let file = null;
  let fileName = "No file chosen";
  let watermarkType = 'text';
  let watermarkText = 'Watermark Text';
  let watermarkImage = null;

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      file = selectedFile;
      fileName = selectedFile.name;
    } else {
      file = null;
      fileName = "No file chosen";
    }
  };

  const handleImageUpload = (e) => {
    const imageFile = e.target.files[0];
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        watermarkImage = reader.result; // Store the base64-encoded image
      };
      reader.readAsDataURL(imageFile);
    }
  };

  const addWatermark = async () => {
    if (!file) {
      console.error('Please select a file.');
      return;
    }

    const pdfBytes = await (await fetch(URL.createObjectURL(file))).arrayBuffer();

    try {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();

      if (watermarkType === 'text') {
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        for (const page of pages) {
          const { width, height } = page.getSize();
          const textSize = 30;
          const textWidth = font.widthOfTextAtSize(watermarkText, textSize);
          const textHeight = font.heightAtSize(textSize);
          const textX = (width - textWidth) / 2;
          const textY = (height - textHeight) / 2;

          page.drawText(watermarkText, {
            x: textX,
            y: textY,
            font: font,
            size: textSize,
            color: rgb(0, 0, 0),
          });
        }
      } else if (watermarkType === 'image' && watermarkImage) {
        // Embed the image as a PDFImage
        const embeddedImage = await pdfDoc.embedPng(watermarkImage);
        for (const page of pages) {
          const { width, height } = page.getSize();
          const imageSize = embeddedImage.size();

          const imageX = (width - imageSize.width) / 2;
          const imageY = (height - imageSize.height) / 2;

          page.drawImage(embeddedImage, {
            x: imageX,
            y: imageY,
            width: imageSize.width,
            height: imageSize.height,
          });
        }
      }

      const modifiedPdfBytes = await pdfDoc.save();
      const modifiedPdfBlob = new Blob([modifiedPdfBytes], { type: 'application/pdf' });

      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(modifiedPdfBlob);
      downloadLink.download = 'modified-pdf-with-watermark.pdf';
      downloadLink.click();
    } catch (error) {
      console.error('Error adding watermark:', error);
    }
  };
</script>

<Intro heading="Add Watermark to PDF" description="Upload a PDF to add a watermark." />

<div class="flex justify-center font-sans">
  <label for="dropzone-file" class="mx-auto cursor-pointer flex w-full max-w-lg flex-col items-center rounded-xl border-2 border-dashed border-blue-400 bg-white p-6 text-center">
    <!-- ... (Your SVG and other elements) ... -->
    <input id="dropzone-file" type="file" class="mt-4 hidden" accept=".pdf" on:change={handleFile} />
  </label>
</div>

<div class="mt-3 flex justify-center">
  <Label>Watermark Type</Label>
  <select bind:value={watermarkType}>
    <option value="text">Text</option>
    <option value="image">Image</option>
  </select>
</div>

{#if watermarkType === 'text'}
  <div class="mt-3 flex justify-center">
    <Label for="watermark-text">Watermark Text</Label>
    <Input id="watermark-text" bind:value={watermarkText} />
  </div>
{:else if watermarkType === 'image'}
  <div class="mt-3 flex justify-center">
    <Label for="watermark-image">Watermark Image</Label>
    <Input id="watermark-image" type="file" accept="image/*" on:change={handleImageUpload} />
  </div>
{/if}

<div class="flex justify-center mt-5">
  <button type="button" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800" on:click={addWatermark}>
    Add Watermark
  </button>
</div>
