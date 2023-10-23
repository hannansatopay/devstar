<script lang="ts">
  import Intro from '$lib/Intro.svelte';
  export let data;
//ok?kjwdbck
  let companyName = '';
  let websiteName = '';
  let websiteUrl = '';
  let email = '';
  let showCookiesPolicy = true;
  let cookiesPolicy = '';
  function handleSubmit() {
    companyName = companyName.trim();
    websiteName = websiteName.trim();
    websiteUrl = websiteUrl.trim();
    email = email.trim();
    const companyNameBold = `<strong>${companyName}</strong>`;
    cookiesPolicy = `
      <div>
        <strong>Cookies Policy</strong>
      </div>
      <br>
      <div>
        This cookies policy outlines how <span>${companyNameBold}</span> uses cookies when you visit our website at <span>${websiteUrl}</span>.
      </div>
      <br>
      <div>
        <strong>What are Cookies</strong>
      </div>
      <div>
        Cookies are small text files placed on your computer or device by websites you visit. They are widely used to make websites work or work more efficiently, as well as to provide information to the website owners.
      </div>
      <br>
      <div>
        <strong>How We Use Cookies</strong>
      </div>
      <div>
        We use cookies to analyze our web traffic, personalize your experience, and improve our website. By using our website, you consent to the use of cookies in accordance with this Cookies Policy.
      </div>
      <br>
      <div>
        <strong>Contact Us</strong>
      </div>
      <div>
        If you have any questions or concerns about this Cookies Policy or any other matter, you can contact us at <strong>${email}</strong>.
      </div>
    `;
    showCookiesPolicy = false;
  }
  function copyToClipboard() {
    const textarea = document.createElement('textarea');
    textarea.value = cookiesPolicy;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Cookies Policy copied to clipboard!');
  }
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<div class="bg-[#323A49] mt-2 w-1/2 container mx-auto py-8 flex flex-col items-center">
  <h1 class="text-3xl comp font-semibold mb-4 tw-text-red">Cookies Policy Generator</h1>
  <form on:submit={handleSubmit} class="space-y-4">

	  <h3 class="mb-4 font-semibold text-gray-900 comp dark:text-white">You set Cookies for..?</h3>
<ul class="w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
    <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
        <div class="flex items-center pl-3">
            <input id="vue-checkbox" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
            <label for="vue-checkbox" class="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Account Registrations</label>
        </div>
    </li>
    <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
        <div class="flex items-center pl-3">
            <input id="react-checkbox" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
            <label for="react-checkbox" class="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Login Features</label>
        </div>
    </li>
    <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
        <div class="flex items-center pl-3">
            <input id="angular-checkbox" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
            <label for="angular-checkbox" class="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Newsletter Subscriptions</label>
        </div>
    </li>
    <li class="w-full border-b border-gray-200 rounded-t-lg dark:border-gray-600">
        <div class="flex items-center pl-3">
            <input id="laravel-checkbox" type="checkbox" value="" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300  rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-700 dark:focus:ring-offset-gray-700 focus:ring-2 dark:bg-gray-600 dark:border-gray-500">
            <label for="laravel-checkbox" class="w-full py-3 ml-2 text-sm font-medium text-gray-900 dark:text-gray-300">Site Preferences</label>
        </div>

    </li>
</ul>
	   <div class="flex flex-col">
      <label for="companyName" class="text-lg text-white">Company Name:</label>
      <input
        type="text"
        id="companyName"
        bind:value={companyName}
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        required
      />
    </div>
    <div class="flex flex-col">
      <label for="websiteName" class="text-lg text-white">Website Name:</label>
      <input
        type="text"
        id="websiteName"
        bind:value={websiteName}
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        required
      />
    </div>
    <div class="flex flex-col">
      <label for="websiteUrl" class="text-lg text-white">Website URL:</label>
      <input
        type="text"
        id="websiteUrl"
        bind:value={websiteUrl}
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        required
      />
    </div>
    <div class="flex flex-col">
      <label for="email" class="text-lg text-white">Enter your Email</label>
      <input
        type="email"
        id="email"
        bind:value={email}
        class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="john.doe@company.com"
        required
      />
    </div>
    <button
      type="submit"
      class="text-white bg-blue-700 hover-bg-blue-800 focus-ring-4 focus-outline-none focus-ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark-bg-blue-600 dark-hover-bg-blue-700 dark-focus-ring-blue-800"
    >
      Generate Cookies Policy
      <svg
        class="w-3.5 h-3.5 ml-2"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 14 10"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M1 5h12m0 0L9 1m4 4L9 9"
        />
      </svg>
    </button>
  </form>
</div>

<div class="result w-1/2 content flex flex-col items-center justify-center mx-auto mt-8">
  {#if !showCookiesPolicy}
    <button
      type="button"
      on:click={copyToClipboard}
      class="text-gray-900 bg-white border border-gray-300 focus-outline-none hover-bg-gray-100 focus-ring-4 focus-ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 dark-bg-gray-800 dark-text-white dark-border-gray-600 dark-hover-bg-gray-700 dark-hover-border-gray-600 dark-focus-ring-gray-700"
    >
      Copy
    </button>
  {/if}
  {#if showCookiesPolicy}
    <h2>Cookies Policy Will go here</h2>
  {/if}
  <div id="cookiesPolicyContainer" class="result">{@html cookiesPolicy}</div>
</div>

<style>
  .content {
    padding: 20px;
    background-color: lightgray;
  }
  .comp {
    color: white;
  }
</style>
