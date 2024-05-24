<script>
  /* GOAL: replicate the SVG syntax in Icon.svelte with the Canvas API and the Path2D interface
    **EXPERIMENTAL interface**
  */
  import Canvas from "./Canvas.svelte";

  let size = 128;
  let color = "rgb(0, 0, 0)";

  // attributes of the anchor link
  let href;

  // alphabet input
  let alphabet = "a";

  // function to generate the path for the given alphabet
  function generatePath(alphabet) {
    const path = new Path2D();

    // switch case for different alphabets
    switch (alphabet) {
      case "a":
        path.moveTo(0, 0);
        path.lineTo(size, 0);
        path.lineTo(size / 2, size);
        path.closePath();
        break;
      case "b":
        path.moveTo(0, 0);
        path.lineTo(0, size);
        path.lineTo(size, size);
        path.lineTo(size, 0);
        path.closePath();
        break;
      case "c":
        path.moveTo(0, size / 2);
        path.arc(size / 2, size / 2, size / 2, 0, Math.PI);
        path.closePath();
        break;
      // ... other alphabets
    }

    return path;
  }
</script>


<form on:submit|preventDefault>
  <label>
    Size
    <input type="number" bind:value="{size}" />
  </label>

  <label>
    Color
    <input type="color" bind:value="{color}" />
  </label>

  <label>
    Alphabet
    <input type="text" bind:value="{alphabet}" />
  </label>
</form>

<Canvas on:draw="{(e) => href = e.detail}" {size} {color} {alphabet} />

{#if href}
<a {href} {download}>Download <strong>{download}</strong></a>
{/if}

<style>
  :global(body) {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  a {
    font-size: 3rem;
    display: block;
  }
</style>

