<script lang="ts">
    import { Label, Input, Select, Button } from "flowbite-svelte";

    export let data;

    import Field from "./Field.svelte";
    import { generateData } from "./generate.js";
    import { storeFE, idIncrement, dataFormats } from "./store";

    $storeFE = [{ id: 0, name: "Field 0", type: "Word" }];
    $idIncrement = 1;
    let dataFormat = "JSON";
    let noOfRows = 10;

    function addField() {
        var l = $storeFE.length;
        $storeFE[l] = {
            id: l,
            name: `Field ${$idIncrement}`,
            type: "Word",
        };
        $idIncrement++;
    }

    let schema = [];
    $: schema = $storeFE;
    function handleSubmit() {
        generateData(schema, dataFormat, noOfRows);
    }
</script>

<section class="py-2">
    <div
        class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg"
    >
        <!-- First Div - Field Input and Add Field Button -->
        <div class="p-8 mx-auto max-w-screen-xl rounded-lg">
            <div class="mb-6">
                <!-- Fields Section -->
                {#each $storeFE as field}
                    <svelte:component this={Field} id={field.id} />
                {/each}

                <!-- Add Field Button Row -->
                <div class="flex justify-start pt-6">
                    <button
                        class="flex items-center px-4 py-2 text-xs lg:text-lg font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300 dark:bg-blue-500 dark:hover:bg-blue-600"
                        on:click|preventDefault={addField}
                    >
                        <svg
                            class="fill-white w-5 h-5 mr-2"
                            xmlns="http://www.w3.org/2000/svg"
                            height="24"
                            width="24"
                        >
                            <path
                                d="M10.85 19.15v-6h-6v-2.3h6v-6h2.3v6h6v2.3h-6v6Z"
                            />
                        </svg>
                        <span>Add Field</span>
                    </button>
                </div>
            </div>
        </div>

        <!-- Second Div - Data Format and Generate Button -->
        <div
            class="p-8 h-full flex rounded-lg relative bg-gray-100 dark:bg-gray-800 overflow-hidden grid grid-cols-1"
        >
            <form id="inputForm" on:submit|preventDefault={handleSubmit}>
                <div class="mb-6 grid grid-cols-1 gap-4">
                    <!-- Data Format -->
                    <div>
                        <Label
                            for="dataFormat"
                            class="block text-sm lg:text-lg font-medium text-gray-700 dark:text-white"
                            >Data Format:</Label
                        >
                        <Select
                            id="dataFormat"
                            bind:value={dataFormat}
                            class="text-xs lg:text-base mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                            {#each dataFormats as format}
                                <option
                                    value={format}
                                    class="text-xs lg:text-base"
                                    >{format}</option
                                >
                            {/each}
                        </Select>
                    </div>

                    <!-- No. of Rows -->
                    <div>
                        <Label
                            for="noOfRows"
                            class="block text-sm lg:text-lg font-medium text-gray-700 dark:text-white"
                            >No. of Rows:</Label
                        >
                        <Input
                            id="noOfRows"
                            type="number"
                            min="1"
                            max="10000"
                            bind:value={noOfRows}
                            class="text-xs lg:text-base mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                        />
                    </div>
                </div>

                <!-- Generate Data Button -->
                <div class="flex justify-center mt-6">
                    <Button
                        type="submit"
                        class="text-sm lg:text-lg w-full max-w-xs text-white bg-green-500 rounded-lg font-semibold cursor-pointer hover:bg-green-600 focus:outline-none focus:ring focus:ring-green-300 dark:bg-green-500 dark:hover:bg-green-600"
                        >Generate Data
                    </Button>
                </div>
            </form>
        </div>
    </div>
</section>
