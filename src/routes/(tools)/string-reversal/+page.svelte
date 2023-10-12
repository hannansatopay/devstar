<script lang="ts">

    import Intro from '$lib/Intro.svelte';

	export let data;

    let inputString = '';
    let reversedString = '';

    function reverseAllCharacters() {
        reversedString = inputString.split("").reverse().join("");
    }

    function reverseWords() {
        const words = inputString.split(" ");
        reversedString = words.reverse().join(" ");
    }

</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
        <div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
            <div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">

                <div class="container">

                    <div class="input-box">

                        <form id="form" on:submit|preventDefault>
                            <label for="input"><b>Enter a string:</b></label>
                            <input type="text" id="input" name="input" bind:value={inputString}>
                        </form>

                        <div class="buttons">
                            <button on:click={reverseAllCharacters}>Reverse All Characters</button>
                            <button on:click={reverseWords}>Reverse Words</button>
                        </div>

                    </div>

                    <div class="output-box">
                        <label for="output"><b>Output:</b></label>
                        <div>{reversedString}</div>
                    </div>

                </div>
                
            </div>
        </div>
    </div>
</section>


<style>

    .container {
        display: flex;
        padding: 20px;
        border-radius: 10px;
        border-color: rgb(251, 247, 247);
    }

    .input-box, .output-box {
        flex: 1;
        padding: 10px;
    }

    .input-box {
        margin-right: 40px;
    }

    .output-box {
        color: rgb(249, 246, 246);
        border-radius: 5px;
    }

    label {
        font-size: 18px;
    }

    input[type="text"] {
        width: 100%;
    }

    .buttons {
        margin-top: 10px;
    }

</style>

