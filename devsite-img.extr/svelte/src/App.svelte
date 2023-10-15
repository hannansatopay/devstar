<script>
  let url = '';
  let images = [];

  const extractImages = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/extractImages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
      });

      const data = await response.json();
      images = data.images;
    } catch (error) {
      console.error('Error extracting images:', error.message);
    }
  };
</script>

<main>
  <h1>Image Extractor</h1>
  <label for="url">Enter URL:</label>
  <input type="text" id="url" bind:value={url} placeholder="Enter URL" />

  <button on:click={extractImages}>Extract Images</button>

  {#if images.length > 0}
    <div>
      <h2>Extracted Images:</h2>
      <ul>
        {#each images as image (index)}
          <li key={index}>{image}</li>
        {/each}
      </ul>
    </div>
  {/if}
</main>

<style>
  main {
    text-align: center;
    padding: 20px;
  }

  input, button {
    margin: 10px;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    margin-bottom: 5px;
  }
</style>
