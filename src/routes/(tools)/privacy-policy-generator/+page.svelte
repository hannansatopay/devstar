<script lang="ts">
  import Intro from '$lib/Intro.svelte';

  export let data;

  let companyName = '';
  let websiteName = '';
  let websiteUrl = '';
  let email = '';
  //jjfd
  let showPrivacyPolicy = true;
  let privacyPolicy = '';

  function handleSubmit() {
    companyName = companyName.trim();
    websiteName = websiteName.trim();
    websiteUrl = websiteUrl.trim();
    email = email.trim();

    const companyNameBold = `<strong>${companyName}</strong>`;

    privacyPolicy = `
      <div>
        <strong>Privacy Policy</strong>
      </div>
      <br>
      <div>
        This privacy policy outlines how <span>${companyNameBold}</span> collects, uses, and protects your personal information when you visit our website at <span>${websiteUrl}</span>.
      </div>
      <br>
      <div>
        <strong>Information We Collect</strong>
      </div>
      <div>
        We may collect information, including but not limited to your name, email address, and browsing activity on our website.
      </div>
      <br>
      <div>
        <strong>How We Use Your Information</strong>
      </div>
      <div>
        We may use the information we collect to personalize your experience, improve our website, and send periodic emails.
      </div>
      <br>
      <div>
        <strong>Security</strong>
      </div>
      <div>
        We are committed to ensuring that your information is secure. We have implemented suitable physical, electronic, and managerial procedures to safeguard and secure the information we collect online.
      </div>
      <br>
      <div>
        <strong>Contact Us</strong>
      </div>
      <div>
        If you have any questions or concerns about this Privacy Policy or any other matter, you can contact us at <strong>${email}</strong>.
      </div>
    `;

    showPrivacyPolicy = false;
  }

  function copyToClipboard() {
    const textarea = document.createElement('textarea');
    textarea.value = privacyPolicy;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    alert('Privacy Policy copied to clipboard!');
  }
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<div class="bg-[#323A49] mt-2 w-1/2 container mx-auto py-8 flex flex-col items-center">
  <h1 class="text-3xl comp font-semibold mb-4 tw-text-red">Privacy Policy Generator</h1>
  <form on:submit={handleSubmit} class="space-y-4">
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
      class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    >
      Generate Privacy Policy
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
  {#if !showPrivacyPolicy}
    <button
      type="button"
      on:click={copyToClipboard}
      class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
    >
      Copy
    </button>
  {/if}
  {#if showPrivacyPolicy}
    <h2>Privacy Policy Will go here</h2>
  {/if}
  <div id="privacyPolicyContainer" class="result">{@html privacyPolicy}</div>
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
