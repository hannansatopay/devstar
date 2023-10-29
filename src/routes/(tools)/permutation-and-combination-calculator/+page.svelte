<script>
    import { onMount } from 'svelte';
    import { Input, Label } from 'flowbite-svelte';
    import Intro from '$lib/Intro.svelte';
  
    export let data;
  
    let n = 4;
    let r = 2;
    let permutation = 12;
    let combination = 6;
  
    function calculate() {
      permutation = calculatePermutations(n, r);
      combination = calculateCombinations(n, r);
    }
  
    function calculatePermutations(n, r) {
      return factorial(n) / factorial(n - r);
    }
  
    function calculateCombinations(n, r) {
      return factorial(n) / (factorial(r) * factorial(n - r));
    }
  
    function factorial(num) {
      if (num === 0 || num === 1) {
        return 1;
      } else {
        return num * factorial(num - 1);
      }
    }
  
    onMount(() => {
      n = 4;
      r = 2;
      calculate();
    });
  </script>
  
  <Intro heading={data.meta.title} description={data.meta.description} />
  
  <section class="bg-white dark:bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
      <div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
        <ul class="bg-white dark:bg-gray-900 px-4 py-5 text-black dark:text-white text-2xl">
            <li>Permutation : <sup>n</sup>P<sub>r</sub></li>
            <li>Combination : <sup>n</sup>C<sub>r</sub></li>
          </ul>
        <div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
          <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300 flex">
            <Label class="bg-white dark:bg-gray-900 px-4 py-5">n</Label>
            <Input type="number" class="rounded-none border-0" bind:value={n} />
            <Label class="bg-white dark:bg-gray-900 px-4 py-5">r</Label>
            <Input type="number" class="rounded-none border-0" bind:value={r} />
          </div>
          <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300 mx-4">
            <ul class="bg-white dark:bg-gray-900 px-4 py-5 text-black dark:text-white text-2xl">
              <li>Permutation <sup>{n}</sup>P<sub>{r}</sub>: {permutation}</li>
              <li>Combination <sup>{n}</sup>C<sub>{r}</sub>: {combination}</li>
            </ul>
          </div>
        </div>
        <button on:click={calculate} class="m-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover-bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
          Calculate
        </button>
      </div>
    </div>
  </section>
  