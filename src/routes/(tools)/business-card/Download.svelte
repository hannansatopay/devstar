<script>
  import { onMount, afterUpdate } from "svelte";
  import html2canvas from "html2canvas";

  let frontContainer, backContainer;

  onMount(() => {
    frontContainer = document.getElementById("card-front");
    backContainer = document.getElementById("card-back");
  });

  afterUpdate(() => {
    // Update the container reference if it changes
    frontContainer = document.getElementById("card-front");
    backContainer = document.getElementById("card-back");
  });

  const downloadContainer = async () => {
    const canvasFront = await html2canvas(frontContainer);
    const canvasBack = await html2canvas(backContainer);
    const linkFront = document.createElement("a");
    const linkBack = document.createElement("a");
    linkFront.download = "front.png";
    linkBack.download = "back.png";
    linkFront.href = canvasFront.toDataURL();
    linkBack.href = canvasBack.toDataURL();
    linkFront.click();
    linkBack.click();
  };
</script>

<button on:click={downloadContainer}>Download</button>
