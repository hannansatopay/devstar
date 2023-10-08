<script>
    import Navbar from "../components/Navbar.svelte";
    import Editor from "../components/Editor.svelte";
	import Footer from "../components/Footer.svelte";
</script>

<main>
    <Navbar />
    <Editor />
    <Footer />
</main>

<style lang="postcss">
    :global(html) {
        background-color: theme(colors.gray.100);
    }
</style>

