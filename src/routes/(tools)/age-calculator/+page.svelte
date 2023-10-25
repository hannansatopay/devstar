<script lang="ts">
  import { onMount } from 'svelte';
  import { Input, Label } from 'flowbite-svelte';
  import Intro from '$lib/Intro.svelte';

  export let data;
  
  let fromInputValue = '';
  let toInputValue = '';
  let calculatedAge = null;

  function calculateAge() {
    const fromDate = new Date(fromInputValue);
    const toDate = new Date(toInputValue);
    
    if (!isNaN(fromDate) && !isNaN(toDate)) {
      let ageInMilliseconds = toDate - fromDate;

      const millisecondsInSecond = 1000;
      const millisecondsInMinute = 60 * millisecondsInSecond;
      const millisecondsInHour = 60 * millisecondsInMinute;
      const millisecondsInDay = 24 * millisecondsInHour;
      const millisecondsInWeek = 7 * millisecondsInDay;
      const millisecondsInMonth = 30.44 * millisecondsInDay; // Approximate number of days in a month
      const millisecondsInYear = 365.24 * millisecondsInDay; // Approximate number of days in a year

      const years = Math.floor(ageInMilliseconds / millisecondsInYear);
      

      const months = Math.floor(ageInMilliseconds / millisecondsInMonth);
      

      const weeks = Math.floor(ageInMilliseconds / millisecondsInWeek);
      

      const days = Math.floor(ageInMilliseconds / millisecondsInDay);
      

      const hours = Math.floor(ageInMilliseconds / millisecondsInHour);
      

      const minutes = Math.floor(ageInMilliseconds / millisecondsInMinute);
      

      const seconds = Math.floor(ageInMilliseconds / millisecondsInSecond);

      calculatedAge = {
        years,
        months,
        weeks,
        days,
        hours,
        minutes,
        seconds
      };
    }
  }
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
  <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
    <div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
      <div class="mt-3 gap-2 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
        <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
          <Label class="bg-white dark:bg-gray-900 px-4 py-5">From</Label>
          <Input id="input1" type="date" class="rounded-none border-0" bind:value={fromInputValue} />
          <Label class="bg-white dark:bg-gray-900 px-4 py-5">To</Label>
          <Input id="input2" type="date" class="rounded-none border-0" bind:value={toInputValue} />
        </div>
        <div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
          {#if calculatedAge !== null}
	  <ul class=" bg-gray-900 text-2xl text-black dark:text-white">The calculated age is:
		<div class="px-8">
			<li class="text-black dark:text-white">{calculatedAge.years} in years</li>
			<li class="text-black dark:text-white">{calculatedAge.months} in months</li>
			<li class="text-black dark:text-white">{calculatedAge.weeks} in week</li>
			<li class="text-black dark:text-white">{calculatedAge.days} in days</li>
			<li class="text-black dark:text-white">{calculatedAge.hours} in hours</li>
			<li class="text-black dark:text-white">{calculatedAge.minutes} in minutes</li>
			<li class="text-black dark:text-white">{calculatedAge.seconds} in seconds</li>
		</div> 
	  </ul>
	{/if}
        </div>
      </div>
      <button on:click={calculateAge} class="m-4 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover-bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
        Calculate age
      </button>
    </div>
	
  </div>
</section>

