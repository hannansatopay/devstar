<script>
  import Intro from '$lib/Intro.svelte';

  let file = null;
  let fileName = "No file chosen";
  let password = "";

  const handleFile = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      file = selectedFile;
      fileName = selectedFile.name;
    } else {
      file = null;
      fileName = "No file chosen";
    }
  }

  const handlePass = (e) => {
    password = e.target.value.trim(); // Trim leading/trailing spaces
  }

  const decryptAndOpenPdf = async () => {
    if (file && password) {
      try {
        const reader = new FileReader();
        reader.onloadend = async () => {
          const pdfData = new Uint8Array(reader.result);

          try {
            // Attempt to decrypt PDF with the provided password
            const loadingTask = window.pdfjsLib.getDocument({ data: pdfData });
            const pdfInstance = await loadingTask.promise;
            await pdfInstance.decrypt(password);

            // Get the total number of pages in the PDF
            const numPages = pdfInstance.numPages;

            // You can now work with the decrypted PDF here
            alert(`Decrypted PDF has ${numPages} pages.`);
          } catch (error) {
            console.error("Error decrypting the PDF:", error);
            alert("Error decrypting the PDF. Please check the password and try again.");
          }
        };
        reader.readAsArrayBuffer(file);
      } catch (error) {
        console.error("Error reading the PDF file:", error);
        alert("Error reading the PDF file. Please try again.");
      }
    } else {
      alert("Please select a PDF file and enter a password.");
    }
  }
</script>

<Intro heading={fileName} description="Upload your PDF and enter the password to decrypt" />
<main class="flex min-h-screen justify-center font-sans">
  <section class="bg-white dark:bg-gray-900" style="color: azure;">
    <label for="dropzone-file" class="mx-auto cursor-pointer flex w-full max-w-lg flex-col items-center rounded-xl border-2 border-dashed border-blue-400 bg-white p-6 text-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <h2 class="text-xl font-medium text-gray-700 tracking-wide">{fileName}</h2>
      <p class="mt-2 text-gray-500 tracking-wide">Upload your PDF and enter the password to decrypt</p>

      <input id="dropzone-file" type="file" class="mt-4" accept=".pdf" on:change={handleFile} />
      <input type="text" class="border rounded mt-3" placeholder="Password" on:input={handlePass} />
      <button class="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" on:click={decryptAndOpenPdf}>
        Decrypt and Open PDF
      </button>
    </label>
  </section>
</main>
