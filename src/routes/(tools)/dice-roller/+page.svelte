<script>
  import { onMount } from 'svelte';
  import { Input, Label } from 'flowbite-svelte';
  import Intro from '$lib/Intro.svelte';
  import img1 from './1.png';
  import img2 from './2.png';
  import img3 from './3.png';
  import img4 from './4.png';
  import img5 from './5.png';
  import img6 from './6.png';

  export let data;

  let numberOfDice = 1; // Set to 1 die by default
  let rollResult = null;
  let diceImages = [img1, img2, img3, img4, img5, img6];
  let rolledDice = [];

  function rollDice() {
    let sum = 0;
    rolledDice = [];

    for (let i = 0; i < numberOfDice; i++) {
      const roll = Math.floor(Math.random() * 6) + 1; // Generate a random value between 1 and 6
      sum += roll;
      rolledDice.push({ id: i, roll });
    }

    rollResult = sum;
  }

  onMount(() => {
    // Initialize with one die when the page is loaded
    rollDice();
  });
</script>

<style>
  .dice-container {
    display: flex;
    flex-wrap: wrap;
  }

  .dice {
    width: 20%; /* Adjust the width as needed */
    padding: 5px;
    box-sizing: border-box;
  }
</style>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
  <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
    <div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
      <div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
        <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
          <Label class="bg-white dark:bg-gray-900 px-4 py-5">Number of Dice</Label>
          <Input id="input1" type="number" class="rounded-none border-0" bind:value={numberOfDice} />
        </div>
        <div class="px-5">
          <div class="dice-container">
            {#each rolledDice as roll (roll.id)}
              <img src={diceImages[roll.roll - 1]} alt="" srcset="" class='dice rounded-2xl px-2' key={roll.id} />
            {/each}
          </div>
        </div>
      </div>
      <button on:click={rollDice} class="m-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover-bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
        Roll
      </button>
      {#if rollResult !== null}
        <p class="text-xl text-black dark:text-white">The sum of the rolled dice is: {rollResult}</p>
      {/if}
    </div>
  </div>
</section>


