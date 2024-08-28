<script lang="ts">
  import { Button, Dropdown, DropdownItem, DropdownDivider, Popover,Label, Input} from 'flowbite-svelte';
  import { onMount } from 'svelte';

  export let data;

  let Types = ['Linear','Radial','Conic','Repeating-linear-gradient','Repeating-radial-gradient'];
  let percentages = [0,10,20,30,40,50,60,70,80,90,100];
  let Rotations = [0,45,90,135,180,225,270,315,360];
  
  let gradienttype = `${Types[0]}`;
  let gradientrotation = 0;
  let gradientColors = ['',''];
  let gradientper = 0;
  let gradientCode = `Linear-gradient(${gradientrotation}deg ,${gradientColors[0]}, ${gradientColors[1]})`;

  function generateGradient() {
      gradientCode = `Linear-gradient(${gradientrotation}deg ,${gradientColors[0]}, ${gradientColors[1]})`;

      if (gradienttype === 'Linear')
      {
        gradientCode = `Linear-gradient(${gradientrotation}deg, ${gradientColors[0]} ${gradientper}%, ${gradientColors[1]} 100%)`;
      }
      else if (gradienttype === 'Radial')
      {
        gradientCode = `Radial-gradient(at center, ${gradientColors[0]} ${gradientper}%, ${gradientColors[1]} 100%)`;
      }
      else if (gradienttype === 'Conic')
      {
        gradientCode = `conic-gradient(${gradientColors[0]} ${gradientper}%, ${gradientColors[1]})`;
      }
      else if (gradienttype === 'Repeating-linear-gradient')
      {
        gradientCode = `repeating-linear-gradient(to right, ${gradientColors[0]} ${gradientper}%, ${gradientColors[1]})`;
      }
      else if (gradienttype === 'Repeating-radial-gradient')
      {
        gradientCode = `repeating-radial-gradient(circle, ${gradientColors[0]} ${gradientper}%, ${gradientColors[1]})`;
      }
    }

 function generateRandomGradient() {
  const r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  const g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  const b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');

  const color1 = `#${r}${g}${b}`;
  const color2 = `#${g}${b}${r}`;

  gradientColors = [color1,color2];
  generateGradient();
}

const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(gradientCode);
      console.log("CSS Copied");
    } catch (error) {
      console.error("Error copying text to clipboard:", error);
    }
  }

  onMount(generateRandomGradient);

   function updateGradient() {
    generateGradient();
  }

  function downloadAsText() {
  const hexColor1 = gradientColors[0];
  const hexColor2 = gradientColors[1];
  
  function hexToRgb(hex) {
    hex = hex.replace(/^#/, '');
    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r}, ${g}, ${b}`;
  }
  const gradientText = `background: ${gradientCode};`;
  const hexText = `Hex Color 1: ${hexColor1}, Hex Color 2: ${hexColor2}`;
  const rgbText = `RGB Color 1: ${hexToRgb(hexColor1)}, RGB Color 2: ${hexToRgb(hexColor2)}`;
  const text = `${gradientText}\n${hexText}\n${rgbText}`;
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'gradient.txt';
  link.click();
}
</script>

<div class="bg-white dark:bg-gray-900"> 
<main class="min-h-screen flex items-center justify-center">
  <div class="w-full max-w-4xl p-8 bg-white rounded-lg shadow-md dark:bg-gray-800 flex">
    <!-- Settings (Left Half) -->
    <div class="w-1/2 p-2 grid grid-cols-2 gap-8">

      <!-- Gradient Type Selector -->
      <div class="mt-4">
        <Label for="gradientType" class="text-gray-700 dark:text-gray-400">Gradient Type:</Label>
        <select bind:value={gradienttype} on:click={updateGradient} class="text-gray-900 bg-white text-center w-full col-sm border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
        {gradienttype}
        {#each Types as type}
          <option>{type}</option>
        {/each}
        </select>
      </div>

      <!-- Color Pickers -->
      <div class="mt-4">
        <Label class="text-gray-700 dark:text-gray-400">Gradient Colors:</Label>
        <div class="flex space-x-2">
          {#each gradientColors as color,index}
            <input
              type="color"
              bind:value={gradientColors[index]}
              class="mt-1"
              on:input={updateGradient}
            />
          {/each}
        </div>
      </div>

      <!-- Rotation -->
      <div class="flex-grow-1 space-x-2">
        <Label class="text-gray-700 dark:text-gray-400">Rotation:</Label>
          <select bind:value={gradientrotation} on:click={updateGradient} class="text-gray-900 w-full bg-white text-center col-sm border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
            {#each Rotations as Rotation,index}
                <option>{Rotation}</option>
            {/each}
          </select>
      </div>

      <!-- Position -->
      <div class="flex-grow-1 space-x-2">
        <Label class="text-gray-700 dark:text-gray-400">Position:</Label>
        <select bind:value={gradientper} on:click={updateGradient} class="text-gray-900 w-full bg-white text-center col-sm border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700">
          {#each percentages as percentage}
            <option>{percentage}</option>
            {/each}
          </select>
      </div>

      <!-- Button Container -->
      <div class="grid grid-cols-2 col-span-2 gap-4 mr-4">
        <!-- Generate Gradient Button -->
        <button
          type="button"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mt-2"
          on:click={updateGradient}
        >
        Generate Gradient
        </button>

        <!-- Random Button -->
        <button
          type="button"
          class="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800 mt-2"
          on:click={generateRandomGradient}
        >
        Random
        </button>

        <!-- Copy CSS Button -->
        <button
          id="b1"
          type="button"
          class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 mt-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
          on:click={copyCode}
        >
        Copy CSS
        </button>

        <Popover class="w-64 text-sm font-light " title="CSS Output" triggeredBy="#b1">
          background: {gradientCode}
        </Popover>

        <!-- More Button with Dropdown -->
        <button
          type="button"
          class="flex items-center justify-center text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 mt-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"        
        >
        More
        <svg class="w-2.5 h-2.5 ml-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 4 4 4-4"/>
        </svg>
        </button>
        <Dropdown>
          <DropdownItem on:click={copyCode}>Copy</DropdownItem>
          <DropdownDivider />
          <DropdownItem on:click={downloadAsText}><svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 19"><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 15h.01M4 12H2a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-4a1 1 0 0 0-1-1h-3M9.5 1v10.93m4-3.93-4 4-4-4"/>
          </svg>Download</DropdownItem>
        </Dropdown>
     </div>    
  </div>

  <!-- Gradient Display (Right Half) {gradientCode}-->
  <div class="w-1/2 p-2">
    <div
      class="w-full h-full rounded-lg"
      style="background-Image: {gradientCode};"
    >
  </div>
</main>
</div>
