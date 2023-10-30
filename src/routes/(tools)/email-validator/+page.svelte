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

      <label for="success" class="block mb-2 text-sm font-medium text-{colour}-700 dark:text-{colour}-500">Email Address</label>
      <input type="text" id="success" class="bg-{colour}-50 border border-{colour}-500 text-{colour}-900 dark:text-{colour}-400 placeholder-{colour}-700 dark:placeholder-{colour}-500 text-sm rounded-lg focus:ring-{colour}-500 focus:border-{colour}-500 block w-full p-2.5 dark:bg-gray-700 dark:border-{colour}-500"
      placeholder="Enter email address to validate"
      on:input={checkEmailValidity} bind:value={emailAddress}>
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