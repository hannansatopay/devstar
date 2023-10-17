<script>
 import { Heading, P, Span } from 'flowbite-svelte';
 import { GradientButton } from 'flowbite-svelte';
 import { ArrowRightOutline, ShoppingCartSolid } from 'flowbite-svelte-icons';
 import { Card, Button, Toggle } from 'flowbite-svelte';
      let hCard = false;
</script>
<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:px-12">
  <Heading tag="h1" class="mb-4">Welcome to the <Span highlight>#Ultimate <br></Span> <Span gradient>Fake Data Generator!</Span></Heading>
  <p class="mb-8 text-lg  font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-500">
    If you&#39;re in need of realistic but entirely fictional data for various purposes, you&#39;ve come to the right place.</p>
    <GradientButton color="cyanToBlue"text-3xl href="/generate"> Generate Data<ArrowRightOutline class="w-4.5 h-3.5 ml-3" /> </GradientButton>
</div>

<div padding-true  class="py-8 px-4 mx-auto max-w-screen-xl items-center text-left grid gap-6 md:grid-cols-3 grid-cols-2 sm:py-8 space-y-0 ">
        <Card size-sm rounded vertical  class="mb-4 sm-py-8">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">💸<br>Finance</h5> 
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">Create stubbed out Account Details, Transactions, and Crypto Addresses</p>
      </Card>
      <Card  size-sm rounded vertical class="mb-4 sm-py-8">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">👝<br>Products</h5> 
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">Generate Prices, Product Names, Adjectives, and Descriptions.</p>
      </Card>
      <Card size-sm rounded vertical  class="mb-4 sm-py-8">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">💌<br>Locations</h5> 
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">Generate valid Addresses, Zip Codes, Street Names, States, and Countries!</p>
      </Card>
      <Card  size-sm rounded vertical  class="mb-4 sm-py-8">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">👻<br>Profiles</h5> 
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">To generate realistic looking Names, Jobs, etc...</p>
      </Card>
      <Card size-sm rounded vertical  class="mb-4 sm-py-8">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">⏰<br>Time-Based-Data</h5> 
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">Past, present, future, recent, soon... whenever!</p>
      </Card>
      <Card size-sm rounded vertical  class="mb-4 sm-py-8">
        <h5 class="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">🌍<br>Localizations</h5> 
        <p class="mb-3 font-normal text-gray-700 dark:text-gray-400 leading-tight">Set a locale to generate realistic looking Names, Addresses, and Phone Numbers.</p>
      </Card>
    </div>

