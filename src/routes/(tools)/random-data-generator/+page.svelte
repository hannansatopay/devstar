<script lang='ts'>
    import { Label, Input, Select } from 'flowbite-svelte';
    import Intro from '$lib/Intro.svelte';

    export let data;

    import Field from "./Field.svelte";
    import { generateData } from "./generate.js";
    import { storeFE, idIncrement, dataFormats } from "./store";
  
    $storeFE = [{ id: 0, name: "Field 0", type: "Word" }];
    $idIncrement = 1;
    let dataFormat = "JSON";
    let noOfRows = 10;
  
    function addField() {
      var l = $storeFE.length; // get our current items list count
      $storeFE[l] = {
        id: l,
        name: `Field ${$idIncrement}`,
        type: "Word",
      };
      console.log($storeFE);
      $idIncrement++;
    }
  
    let schema = [];
    $: schema = $storeFE;
    function handleSubmit() {
      generateData(schema, dataFormat, noOfRows);
    }
</script>
  
<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">

    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
        <div class="card gap-8 items-center mx-auto max-w-screen-xl overflow-hidden border-2 border-gray-500 rounded-lg">
            <div class="bar p-4 lg:grid lg:grid-cols-3 gap-2 text-black dark:text-white">
                <p id="fieldHead">Field</p>
                <p id="typeHead">Type</p>
                <p id="delHead">Delete</p>
            </div>

            <hr>
        
            <form id="inputForm" on:submit|preventDefault={handleSubmit}>
            {#each $storeFE as field}
                <svelte:component this={Field} id={field.id} />
            {/each}
    
            <div class="add_div">
                <button class="add border-2 border-gray-500 text-gray-900 dark:text-white rounded-lg" on:click|preventDefault={addField}>
                    <svg class="fill-black dark:fill-white" xmlns="http://www.w3.org/2000/svg" height="24" width="24"
                    ><path d="M10.85 19.15v-6h-6v-2.3h6v-6h2.3v6h6v2.3h-6v6Z" /></svg
                    > <span>Add Field</span>
                </button>
            </div>

            <hr>
    
            <div class="submission">
                <div class="data p-8 lg:grid lg:grid-cols-2 gap-24">
                    <div>
                        <Label for="format">Data Format :</Label>
                        <Select
                        name="dataFormat"
                        class="dataFormat"
                        bind:value={dataFormat}
                        >
                        {#each dataFormats as format}
                            <option value={format}>{format}</option>
                        {/each}
                        </Select>
                    </div>
                    <div>
                        <Label for="rows">No. of Rows :</Label>
                        <Input
                        type="number"
                        class="rows"
                        min="1"
                        max="10000"
                        bind:value={noOfRows}
                        />
                    </div>
                </div>
                <Input class="border-2 border-gray-500 rounded-lg" id="submit" type="submit" value="GENERATE DATA" />
            </div>
            </form>
        </div>
    </div>
</section>

<style>
    .card {
        padding: 16px;
    }

    .bar {
        grid-template-columns: 3fr 3fr 0.3fr;
        grid-template-areas: "fieldHead typeHead delHead";
    }
    #fieldHead {
        grid-area: fieldHead;
    }

    #typeHead {
        grid-area: typeHead;
    }

    #delHead {
        grid-area: delHead;
    }
    
    .add_div {
        margin-top: 8px;
        margin-bottom: 8px;
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-items: flex-start;
    }

    .add {
        padding: 8px 12px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
</style>
