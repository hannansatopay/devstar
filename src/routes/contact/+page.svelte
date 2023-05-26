<script>
    import { Label, Select } from 'flowbite-svelte'
  let selected;

  let countries = [
    {value:"us", name: "United States"},
    {value:"ca", name: "Canada"},
    {value:"fr", name: "France"},
  ]
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
			<form>
				<div class="grid md:gap-8 md:grid-cols-2">
					<div class="mb-6">
						<label
							for="first_name"
							class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
							>First name</label
						><input
							required=""
							type="text"
							id="first_name"
							placeholder="John"
							class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							value=""
						/>
						<div
							data-lastpass-icon-root="true"
							style="position: relative !important; height: 0px !important; width: 0px !important; float: left !important;"
						/>
					</div>
					<div class="mb-6">
						<label
							for="last_name"
							class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
							>Last name</label
						><input
							required=""
							type="text"
							id="last_name"
							placeholder="Doe"
							class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
							value=""
						/>
					</div>
				</div>
				<div class="mb-6">
					<label for="email" class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
						>Email address</label
					><input
						required=""
						type="email"
						id="email"
						placeholder="john.doe@company.com"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						value=""
					/>
				</div>
				<div class="mb-6">
					<!-- <label
						for="subject"
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300">Subject</label
					><input
						required=""
						type="text"
						id="subject"
						class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="Subject name"
						value=""
					/> -->
                    <Label>Select an option
                        <Select class="mt-2" items={countries} />
                    </Label>
				</div>
				<div class="mb-6">
					<label
						for="message"
						class="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-400">Message</label
					><textarea
						required=""
						id="message"
						rows="4"
						class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						placeholder="Your message..."
					/>
				</div>
				<div class="mb-6">
					<div>
						<div
							class="grecaptcha-badge"
							data-style="bottomright"
							style="width: 256px; height: 60px; display: block; transition: right 0.3s ease 0s; position: fixed; bottom: 14px; right: -186px; box-shadow: gray 0px 0px 5px; border-radius: 2px; overflow: hidden;"
						>
							<div class="grecaptcha-logo">
								<iframe
									title="reCAPTCHA"
									src="https://www.google.com/recaptcha/api2/anchor?ar=1&amp;k=6LcKn58eAAAAAFD-lFXQHCSkdJ9V76lq3KLyNygU&amp;co=aHR0cHM6Ly9mbG93Yml0ZS5jb206NDQz&amp;hl=en&amp;type=image&amp;v=NZrMWHVy58-S9gVvad9HVGxk&amp;theme=light&amp;size=invisible&amp;badge=bottomright&amp;cb=l2ot422qc1r6"
									width="256"
									height="60"
									role="presentation"
									name="a-k3ryqwv2riy"
									frameborder="0"
									scrolling="no"
									sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups-to-escape-sandbox allow-storage-access-by-user-activation"
								/>
							</div>
							<div class="grecaptcha-error" />
							<textarea
								id="g-recaptcha-response"
								name="g-recaptcha-response"
								class="g-recaptcha-response"
								style="width: 250px; height: 40px; border: 1px solid rgb(193, 193, 193); margin: 10px 25px; padding: 0px; resize: none; display: none;"
							/>
						</div>
						<iframe style="display: none;" />
					</div>
				</div>
				<p class="mb-6 text-sm text-gray-500">
					By submitting this form you agree to our <a
						class="text-blue-600 dark:text-blue-500 hover:underline"
						href="/terms-and-conditions/">Terms &amp; conditions</a
					>
					and our
					<a class="text-blue-600 dark:text-blue-500 hover:underline" href="/privacy-policy/"
						>Privacy Policy</a
					> which explains how we may collect, use and disclose your personal information including to
					third parties.
				</p>
				<button
					class="text-white font-medium rounded-lg text-base px-5 py-3 w-full sm:w-auto text-center bg-blue-700"
					type="submit"><span class="flex justify-center items-center">Send message</span></button
				>
			</form>
		</div>
	</div>
</section>