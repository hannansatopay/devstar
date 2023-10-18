<script lang="ts">
	import Intro from '$lib/Intro.svelte';

	export let data;

	// start
	let companyName = '';
	let websiteName = '';
	let websiteUrl = '';
	let email = '';
	let showTerms = true;


	let termsAndPolicy = '';

	function handleSubmit() {
		// Capture the user's input
		companyName = companyName.trim();
		websiteName = websiteName.trim();
		websiteUrl = websiteUrl.trim();
		email = email.trim();

		const companyNameBold = `<strong>${companyName}</strong>`;

		// Generate the terms and policy content
		termsAndPolicy = `
<div>
  <strong>Terms and Conditions</strong>
</div>
<br>
<div>
  Welcome to <span>${companyNameBold}</span>!
</div>
<div>
  These terms and conditions outline the rules and regulations for the use of <span>${companyNameBold}'s</span> Website, located at <span>${websiteUrl}</span>.
</div>
<br>

<div>
  By accessing this website, we assume you accept these terms and conditions. Do not continue to <span>${companyNameBold}</span> if you do not agree to take all of the terms and conditions stated on this page.
</div>
<br>
<div>
  <strong>Definitions</strong>
</div>
<br>
<div>
  The following terminology applies to these Terms and Conditions:
</div><br>

<div>
  <span>"Client," "You," and "Your"</span> refers to you, the individual accessing this website and agreeing to comply with the terms and conditions.
</div>
<div>
  <span>"The Company," "Ourselves," "We," "Our," and "Us"</span> refers to our Company.
</div>
<div>
  <span>"Party," "Parties," or "Us"</span> refers to both the Client and ourselves.
</div>
<div>
  All terms used herein, whether singular, plural, capitalized, or not, are considered interchangeable.
</div><br>

<div>
  <strong>Cookies</strong>
</div><br>
<div>
  We employ the use of cookies. By accessing <span>${companyNameBold}</span>, you agree to use cookies in agreement with <span>${companyNameBold}'s</span> Privacy Policy.
</div><br>
<div>
  <strong>License</strong>
</div><br>
<div>
	Unless otherwise stated,<span>${companyNameBold}</span> and/or its licensors own the intellectual property rights for all material on <span>${companyNameBold}</span>. All intellectual property rights are reserved. You may access this content from <span>${companyNameBold}</span> for personal use, subject to the restrictions specified in these terms and conditions.</div>
<div>
<div>You must not:</div>
<br>
<ul>
  <li>Republish material from ${companyNameBold}.</li>
  <li>Sell, rent, or sub-license material from ${companyNameBold}.</li>
  <li>Reproduce, duplicate, or copy material from ${companyNameBold}.</li>
  <li>Redistribute content from ${companyNameBold}.</li>
</ul>
<br>
<div>
<strong>Content Liability</strong>
</div>
<br>
<div> We shall not be responsible for any content appearing on your Website. You agree to protect and defend us against all claims that arise on your Website. No links should appear on any Website that could be interpreted as libelous, obscene, or criminal or that infringes, violates, or advocates the infringement or other violation of any third-party rights.
</div>
<div>
<strong>Termination</strong>
</div>
<br>
<div> The Company reserves the right to suspend, restrict, or terminate your access to the Platform at any time without notice or liability, for any reason or no reason, in its sole discretion.
</div>
<br>
<div>
  <strong>Contact Us</strong>
</div>
<div>
	If you have any questions or concerns about these Terms and Conditions or any other matter, you can contact us at <strong>${email}</strong> .
</div>
    `;
		showTerms = false;
	}

	function copyToClipboard() {
		// Create a new textarea element to hold the text
		const textarea = document.createElement('textarea');
		textarea.value = termsAndPolicy;
		document.body.appendChild(textarea);

		// Select the text inside the textarea
		textarea.select();

		// Copy the selected text to the clipboard
		document.execCommand('copy');

		// Remove the textarea from the DOM
		document.body.removeChild(textarea);

		alert('Terms and Conditions copied to clipboard!');
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<div class=" bg-[#323A49] mt-2 w-1/2 container mx-auto py-8 flex flex-col items-center">
	<h1 class="text-3xl comp font-semibold mb-4 tw-text-red">Company Information</h1>
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
			Generate My Terms & Conditions
			<svg
				class="w-3.5 h-3.5 ml-2"
				aria-hidden="true"
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 14 10"
				><path
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

<div class=" result w-1/2 content flex flex-col items-center justify-center mx-auto mt-8">
	{#if !showTerms}
		<button
			type="button"
			on:click={copyToClipboard}
			class="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-full text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
			>Copy</button
		>
	{/if}
	{#if showTerms}
		<h2>Terms & Conditions Will go here</h2>
	{/if}
	<div id="termsAndPolicyContainer" class="result">{@html termsAndPolicy}</div>
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
