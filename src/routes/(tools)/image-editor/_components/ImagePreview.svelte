<script>
    export let image;
</script>

<div class="container flex justify-center">
    {#if image}
        <!-- svelte-ignore a11y-img-redundant-alt -->
        <img src={image} alt="Selected Image" class="max-w-full max-h-screen" />
    {/if}
</div>
