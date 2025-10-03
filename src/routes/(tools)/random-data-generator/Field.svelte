<script lang="ts">
  import { Label, Input, Select } from "flowbite-svelte";

  import { storeFE, fieldTypes } from "./store";

  export let id;

  function removeComponent() {
    $storeFE = $storeFE.filter(function (value, index, arr) {
      if (value.id != $storeFE[id].id) {
        if (value.id > id) value.id -= 1;
        return value;
      }
    });
    console.log($storeFE);
  }
</script>

<div
  class="py-6 grid grid-cols-2 lg:grid-cols-5 gap-4 border-b border-gray-300 rounded-lg"
>
  <!-- Field Title and Input -->
  <div class="col-span-2">
    <Label
      for="fieldName"
      class="block text-sm lg:text-lg font-medium text-gray-700 dark:text-white"
      >Field:</Label
    >
    <Input
      id="fieldName"
      class="text-xs lg:text-base newField mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
      type="text"
      bind:value={$storeFE[id].name}
    />
  </div>

  <!-- Field Type -->
  <div class="col-span-2 lg:col-span-3">
    <Label
      for="fieldType"
      class="block text-sm lg:text-lg font-medium text-gray-700 dark:text-white"
      >Type:</Label
    >
    <div class="flex justify-between space-x-4">
      <Select
        name="fieldTypes"
        bind:value={$storeFE[id].type}
        class="text-xs lg:text-base newType mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
      >
        {#each fieldTypes as type}
          <option value={type} class="text-xs lg:text-base">{type}</option>
        {/each}
      </Select>

      <!-- Delete Icon -->
      <button
        class="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-600"
        on:click|preventDefault={removeComponent}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          height="20"
          width="20"
          viewBox="0 0 448 512"
          ><path
            fill="#ff7c5c"
            d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"
          /></svg
        >
      </button>
    </div>
  </div>
</div>
