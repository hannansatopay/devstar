<svelte:head>
	<script src="https://s.pageclip.co/v1/pageclip.js" charset="utf-8"></script>
	<link rel="stylesheet" href="https://s.pageclip.co/v1/pageclip.css" media="screen">
</svelte:head>
<script>
</script>
<section class="py-8 bg-white lg:py-24 dark:bg-gray-900">
	<div class="px-4 mx-auto max-w-8xl lg:px-4">
		<div class="xl:mx-64 2xl:mx-80">
			<h1
				class="mb-4 text-4xl font-bold text-gray-900 lg:font-extrabold lg:text-5xl lg:leading-none dark:text-white lg:text-center lg:mb-7"
			>
				Contact us
			</h1>
			<p
				class="mb-10 text-lg font-normal text-gray-500 dark:text-gray-400 lg:text-center lg:text-xl"
			>
				Let us know what you need and we will get back to you in no time.
			</p>
		</div>
	</div>
	<div class="px-4 mx-auto max-w-8xl lg:px-4">
		<div class="p-4 mx-auto max-w-3xl rounded-lg border-gray-50 shadow-md dark:bg-gray-800 lg:p-8">
			<form action="https://send.pageclip.co/ZDe8jQnoIlqujUxdqprrB3TNUYpZ8azq" class="pageclip-form" method="post">
				<div class="mb-6">
					<label for="name" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Name <span class="text-red-600">*</span></label>
					<input
						required
						type="text"
						id="name"
						name="name"
						placeholder="John Doe"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					/>
				</div>
				<div class="mb-6">
					<label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Email <span class="text-red-600">*</span></label>
					<input
						required
						type="email"
						id="email"
						name="email"
						placeholder="john.doe@company.com"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					/>
				</div>
				<div class="mb-6">
					<label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Message <span class="text-red-600">*</span></label>
					<textarea
						required
						id="message"
						name="message"
						rows="4"
						class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="Your message..."
					/>
				</div>
				<p class="mb-6 text-sm text-gray-500">
					By submitting this form you agree to our <a class="text-blue-600 dark:text-blue-500 hover:underline" href="/terms-and-conditions/">Terms & conditions</a> and our <a class="text-blue-600 dark:text-blue-500 hover:underline" href="/privacy-policy/">Privacy Policy</a> which explains how we may collect, use and disclose your personal information including to third parties.
				</p>
				<button type="submit" class="pageclip-form__submit text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">
					<span>Send message</span>
				</button>
			</form>
		</div>
	</div>
</section>