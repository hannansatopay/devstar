<script lang="ts">
	let domainName = '';
	let email = '';
	let certificate: any = null;
	let privateKey: any = null;
	let error: any = null;
	let isLoading = false;

	const debounce = (func: Function, wait: number) => {
		let timeout: any;
		return function executedFunction(...args: any) {
			const later = () => {
				clearTimeout(timeout);
				func(...args);
			};
			clearTimeout(timeout);
			timeout = setTimeout(later, wait);
		};
	};

	const handleIssueCertificate = async () => {
		isLoading = true;
		error = null;

		const params = new URLSearchParams();
		params.append('domain', domainName);
		params.append('email', email);

		try {
			const response = await fetch('https://ssl-checker-production.up.railway.app/createCert', {
				method: 'POST',
				body: params
			});

			if (!response.ok) {
				error = 'Failed to issue certificate. Please try again.';
				return;
			}

			const data = await response.json();
			certificate = data.certificate;
			privateKey = data.private_key;
		} catch (err) {
			console.error(err);
			error = 'An unexpected error occurred. Please try again.';
		} finally {
			isLoading = false;
		}
	};

	const debouncedIssueCertificate = debounce(handleIssueCertificate, 300);
</script>

<section class="flex flex-col items-center justify-center">
	<div class="container mx-auto p-2.5 max-w-2xl">
		<h1 class="text-3xl sm:text-4xl font-semibold text-blue-500 mb-12 mt-8 text-center">
			Issue SSL Certificate
		</h1>

		<div class="bg-white my-8 p-8 rounded-lg shadow-md">
			<div class="mb-6">
				<label for="domainName" class="block text-sm font-medium text-gray-700 mb-2">
					Domain Name
				</label>

				<input
					id="domainName"
					type="text"
					bind:value={domainName}
					class="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-150"
				/>
			</div>

			<div class="mb-6">
				<label for="email" class="block text-sm font-medium text-gray-700 mb-2">
					Email Address
				</label>

				<input
					id="email"
					type="email"
					bind:value={email}
					class="p-3 w-full border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-150"
				/>
			</div>

			{#if error}
				<div class="text-red-600 mb-6 font-medium">
					{error}
				</div>
			{/if}

			<button
				class="w-full bg-black text-white font-semibold p-3 rounded-lg hover:bg-gray-800 transition duration-150 disabled:bg-gray-500 disabled:cursor-not-allowed"
				on:click={debouncedIssueCertificate}
				disabled={isLoading}
			>
				{#if isLoading}
					<i class="fas fa-spinner fa-spin" /> Processing...
				{:else}
					Request Certificate
				{/if}
			</button>

			{#if certificate}
				<div class="mt-4">
					<div class="flex flex-col">
						<h3 class="font-semibold">Certificate</h3>
						<pre class="bg-gray-100 p-2 rounded-lg overflow-auto max-h-64">{certificate}</pre>
						<a
							download="certificate.pem"
							href="data:application/x-pem-file,{encodeURIComponent(certificate)}"
							class="text-blue-600 hover:underline mt-2"
						>
							Download Certificate
						</a>
					</div>

					<div class="flex flex-col mt-4">
						<h3 class="font-semibold">Private Key</h3>
						<pre class="bg-gray-100 p-2 rounded-lg overflow-auto max-h-64">{privateKey}</pre>
						<a
							download="private.key"
							href="data:application/x-pem-file,{encodeURIComponent(privateKey)}"
							class="text-blue-600 hover:underline mt-2"
						>
							Download Private Key
						</a>
					</div>

					<div class="mt-4 text-green-600 font-medium">Certificate generated successfully!</div>

					<div class="mt-4 p-4 bg-gray-100 rounded-lg">
						<h3 class="font-semibold mb-4">Manual Installation Instructions</h3>
						<p class="mb-4">
							Follow the steps below to manually install and configure the SSL certificate and
							private key on your server:
						</p>

						<h4 class="font-semibold mb-2">1. Download the Files</h4>
						<p class="mb-4">
							Use the links provided above to download the certificate and private key files.
						</p>

						<h4 class="font-semibold mb-2">2. Upload to Server</h4>
						<p class="mb-4">
							Upload the downloaded files to your server. You can use SCP, SFTP, or any method you
							prefer. Make sure to upload the files to a secure directory that is not accessible
							from the web. For example:
						</p>
						<pre class="mb-4 bg-white p-3 rounded-lg">/etc/ssl/certs/ for the certificate file<br
							/>/etc/ssl/private/ for the private key file</pre>

						<h4 class="font-semibold mb-2">3. Apache Configuration</h4>
						<p class="mb-4">
							If you are using Apache, add the following lines to your virtual host configuration,
							adjusting the paths and filenames to match where you uploaded your certificate and
							private key:
						</p>
						<pre class="mb-4 bg-white p-3 rounded-lg">
SSLEngine on
SSLCertificateFile /etc/ssl/certs/certificate.pem
SSLCertificateKeyFile /etc/ssl/private/private.key
            </pre>
						<p class="mb-4">Then, restart Apache to apply the changes:</p>
						<pre class="mb-4 bg-white p-3 rounded-lg">sudo systemctl restart apache2</pre>

						<h4 class="font-semibold mb-2">4. Nginx Configuration</h4>
						<p class="mb-4">
							If you are using Nginx, add the following lines to your server block, adjusting the
							paths and filenames to match where you uploaded your certificate and private key:
						</p>
						<pre class="mb-4 bg-white p-3 rounded-lg">
listen 443 ssl;
ssl_certificate /etc/ssl/certs/certificate.pem;
ssl_certificate_key /etc/ssl/private/private.key;
            </pre>
						<p class="mb-4">Then, test the configuration and restart Nginx to apply the changes:</p>
						<pre class="mb-4 bg-white p-3 rounded-lg">
sudo nginx -t
sudo systemctl restart nginx
            </pre>

						<h4 class="font-semibold mb-2">5. Verify Installation</h4>
						<p>
							After restarting your web server, visit your domain using "https://" to ensure that
							the SSL certificate is working correctly. Look for the padlock icon in the address bar
							of your browser.
						</p>
						<h4 class="font-semibold mb-2">6. Certbot Configuration (Optional)</h4>
						<p class="mb-4">
							If you are using Certbot to manage your SSL certificates, you can follow the
							instructions below to configure it to use the generated certificate and private key.
							Make sure you have Python3 and Certbot installed on your server.
						</p>

						<h5 class="font-semibold mb-2">Check Python3 Installation</h5>
						<pre class="mb-4 bg-white p-3 rounded-lg">python3 --version</pre>
						<p class="mb-4">
							If Python3 is not installed, you can install it using your package manager. For
							example, on Ubuntu:
						</p>
						<pre class="mb-4 bg-white p-3 rounded-lg">sudo apt update<br
							/>sudo apt install python3</pre>

						<h5 class="font-semibold mb-2">Check Certbot Installation</h5>
						<pre class="mb-4 bg-white p-3 rounded-lg">certbot --version</pre>
						<p class="mb-4">
							If Certbot is not installed, you can install it following the instructions on the <a
								href="https://certbot.eff.org/instructions"
								target="_blank"
								class="text-blue-600 hover:underline">Certbot website</a
							>.
						</p>

						<h5 class="font-semibold mb-2">Configure Certbot</h5>
						<p class="mb-4">
							Move the downloaded certificate and private key files to the directory where Certbot
							stores certificates and keys, usually <code
								>/etc/letsencrypt/live/your_domain_name/</code
							>. Then, configure Certbot to use these files. You may need to modify the Apache or
							Nginx configuration files to point to the correct certificate and private key paths if
							they are not already set correctly.
						</p>
						<pre class="mb-4 bg-white p-3 rounded-lg">
sudo cp /path_to_downloaded_files/certificate.pem /etc/letsencrypt/live/your_domain_name/fullchain.pem
sudo cp /path_to_downloaded_files/private.key /etc/letsencrypt/live/your_domain_name/privkey.pem
            </pre>
						<p class="mb-4">
							Make sure to replace <code>/path_to_downloaded_files</code> with the actual path to
							where you saved the downloaded certificate and private key, and
							<code>your_domain_name</code> with your actual domain name.
						</p>
						<p class="mb-4">
							After moving the files and ensuring the configurations are correct, reload your web
							server to apply the changes.
						</p>
					</div>
				</div>
			{/if}
		</div>
	</div>
</section>

<style>
	pre {
		font-family: monospace;
		white-space: pre-wrap;
		word-wrap: break-word;
	}
</style>
