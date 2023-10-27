<script lang="ts">
  import { Label, Input, Button } from 'flowbite-svelte';

  import Intro from '$lib/Intro.svelte';
  import Copy from '$lib/Copy.svelte';
  export let data;
  export let email = '';
  let isValid = false;

  function validateEmail() {
    // Regular expression for email validation
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;

    isValid = emailRegex.test(email);
  }
</script>

<Intro heading={data.meta.title} description={data.meta.description} />
<section class="bg-white dark:bg-gray-900">
  <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
    <div class="card gap-8 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden rounded-lg">
      <div class="p-8">
        <Label>Email Address</Label>
        <div class="flex items-center">
          <Input bind:value={email} type="email" />
          <Button on:click={validateEmail}>Validate</Button>
        </div>

        {#if isValid}
          <p class="text-green-500">Valid email address.</p>
        {:else}
          <p class="text-red-500">Invalid email address.</p>
        {/if}
      </div>
    </div>
  </div>
</section>

<style>
  .card {
    box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
  }

  :is(.dark .card) {
    box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
  }
</style>
