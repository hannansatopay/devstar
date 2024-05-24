<script lang="ts">

  import Intro from '$lib/Intro.svelte';
  import { Button } from 'flowbite-svelte';

  export let data;

  var colour= "gray";
  var alert="";
  var emailAddress="";
  var subject="";
  var body="";

  function checkEmailValidity(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(input.target.value);

    if (isValidEmail) {
        colour = "green";
        alert = "Valid Email Address"
    } else {
        colour = "red";
        alert = "Invalid Email Address"
    }
  }

  function sendEmail() {
    // Construct the mailto URL with recipient email, subject, and body
    const mailtoUrl = `mailto:${emailAddress}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    // Open the default email client with the pre-filled data
    window.location.href = mailtoUrl;
  }

  function copyText() {
		if (emailAddress.length > 0) {
			var textarea = document.createElement("textarea");
			textarea.value = emailAddress;
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
		}
	}

</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
  <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
    <div class="card p-8 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">

     <label for="email-address-icon" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Email Address</label>
      <div class="relative">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <svg class="w-4 h-4 text-{colour}-500 dark:text-{colour}-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
            <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z"/>
            <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z"/>
          </svg>
        </div>
        <input type="text" id="success" class="bg-{colour}-50 border border-{colour}-500 text-{colour}-900 dark:text-{colour}-400 placeholder-{colour}-700 dark:placeholder-{colour}-500 text-sm rounded-lg focus:ring-{colour}-500 focus:border-{colour}-500 block w-full pl-10 p-2.5 dark:bg-gray-700 dark:border-{colour}-500"
        placeholder="Enter email address to validate"
        on:input={checkEmailValidity} bind:value={emailAddress}>
      </div>
      <p class="mt-2 text-sm text-{colour}-600 dark:text-{colour}-500">{alert}</p>

      <div class="items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden">
				<div class="mt-6 gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
					<Button color="blue" on:click={copyText}>Copy Email ID</Button>
					<Button color="blue" on:click={sendEmail}>Send an Email</Button>
        </div>
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