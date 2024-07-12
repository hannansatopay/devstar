<script>
  let uploadedGif = null;
  let base64String = '';

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/gif')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        uploadedGif = e.target.result;
        convertToBase64();
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please upload a GIF file.');
    }
  };

  const convertToBase64 = () => {
    if (uploadedGif) {
      const base64 = uploadedGif.split(',')[1];
      base64String = base64;
    }
  };

  const downloadBase64 = () => {
    const a = document.createElement('a');
    a.href = uploadedGif;
    a.download = 'base64_gif.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyBase64 = () => {
    navigator.clipboard.writeText(base64String)
      .then(() => {
        alert('Base64 text copied to clipboard.');
      })
      .catch(err => {
        console.error('Unable to copy base64 text: ', err);
      });
  };
</script>

<div class="container">
  <div class="title">Convert GIF to Base64</div>
  
  <div class="upload-container">
    <input type="file" accept="image/gif" on:change={handleFileUpload} id="gif-upload" style="display: none;">
    <label for="gif-upload" class="upload-button">Upload GIF</label>
  </div>

  {#if uploadedGif}
    <div class="preview-container">
      <div class="preview">
        <div>Uploaded GIF</div>
        <img src={uploadedGif} alt="Uploaded GIF">
      </div>
      <div class="preview">
        <div>Base64 String</div>
        <textarea rows="5" readonly>{base64String}</textarea>
      </div>
    </div>
    <div class="bt-download">
      <button on:click={copyBase64} class="copy-button">Copy Base64 Text</button>
      <button on:click={downloadBase64} class="download-button">Download Base64 Text</button>
    </div>
  {/if}
</div>

<style>
  .container {
    max-width: 900px;
    margin: auto;
    text-align: center;
    color: white;
  }

  .title {
    font-size: 24px;
    margin-bottom: 20px;
    font-weight: 600;
    color: #ff6347;
  }

  .upload-container {
    margin-bottom: 20px;
  }

  .upload-button {
    display: inline-block;
    padding: 12px 24px;
    background-color: #28a745;
    color: white;
    text-decoration: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .upload-button:hover {
    background-color: #218838;
  }

  .preview-container {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
    gap: 20px;
    font-size: 18px;
  }

  .preview {
    width: 45%;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #ff6347;
  }

  .preview img {
    max-width: 100%;
    height: auto;
    border: 2px solid #ccc;
    border-radius: 5px;
    margin-top: 10px;
  }

  .preview textarea {
    width: 100%;
    margin-top: 10px;
    padding: 10px;
    font-size: 14px;
    color: black;
    border: 1px solid #ccc;
    border-radius: 4px;
    resize: vertical;
  }

  .copy-button,
  .download-button {
    display: inline-block;
    margin-top: 20px;
    padding: 8px 16px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease;
  }

  .copy-button:hover,
  .download-button:hover {
    background-color: #0056b3;
  }

  .copy-button {
    margin-right: 10px;
  }
</style>