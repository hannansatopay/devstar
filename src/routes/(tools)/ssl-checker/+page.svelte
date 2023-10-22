<script lang="ts">
	import { Spinner } from 'flowbite-svelte';
	import { Text, Timeline } from '@svelteuidev/core';
	import { LockClosed } from 'radix-icons-svelte';

	let hostname = '';
	let isLoading = false;
	let error: string | null = null;

	interface ChainItem {
		commonName: string;
		issuer: string;
		location: string;
		organization: string;
		serialNumber: string;
		signatureAlgorithm: string;
		validFrom: string;
		validTo: string;
		ipAddress: string;
	}

	interface SSLInfo extends ChainItem {
		chain: ChainItem[];
	}

	let sslInfo: SSLInfo = {
		chain: [],
		commonName: '',
		issuer: '',
		location: '',
		organization: '',
		serialNumber: '',
		signatureAlgorithm: '',
		validFrom: '',
		validTo: '',
		ipAddress: ''
	};

	async function fetchSSLData() {
		isLoading = true;
		error = null;

		// Reset the sslInfo object when starting a new search
		sslInfo = {
			chain: [],
			commonName: '',
			issuer: '',
			location: '',
			organization: '',
			serialNumber: '',
			signatureAlgorithm: '',
			validFrom: '',
			validTo: '',
			ipAddress: ''
		};

		try {
			const response = await fetch(
				`https://ssl-checker-production.up.railway.app/sslinfo?hostname=${hostname}`
				// `http://localhost:8080/sslinfo?hostname=${hostname}`
			);
			const result = await response.json();
			if (response.ok && result) {
				sslInfo = result;
			} else {
				error =
					result?.message ||
					"We couldn't reslove the IP address of your domain or your domain is using a deprecated version of SSL. Please update your DNS and SSL Certificate to the latest version.";
			}
		} catch (err) {
			console.error('Error fetching SSL data:', err);
			error =
				"We couldn't reslove the IP address of your domain or your domain is using a deprecated version of SSL. Please update your DNS and SSL Certificate to the latest version.";
		} finally {
			isLoading = false;
		}
	}

	function handleCheckSSL() {
		if (!hostname.trim()) {
			// Check if hostname is empty
			error = 'Please provide a hostname before checking SSL.';
			return; // Exit the function
		}
		hostname = cleanInputURL(hostname);
		fetchSSLData();
	}

	function parseDate(dateString: string): Date {
		// Split date and time
		const [datePart, timePart] = dateString.split(' ');

		// Extract date components
		const [year, month, day] = datePart.split('-').map(Number);
		const [hour, minute, second] = timePart.split(':').map(Number);

		// JavaScript months are 0-based (0 = January, 11 = December)
		return new Date(Date.UTC(year, month - 1, day, hour, minute, second));
	}

	function calculateDaysToExpiry(validToDate: string): number {
		const currentDate = new Date();
		const expiryDate = parseDate(validToDate);

		const differenceInTime = expiryDate.getTime() - currentDate.getTime();
		return Math.ceil(differenceInTime / (1000 * 3600 * 24));
	}

	function formatCertDate(dateString: string): string {
		const date = parseDate(dateString);

		// Now you can format the date any way you'd like. Here's one way:
		return date.toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit',
			timeZoneName: 'short'
		});
	}

	function cleanInputURL(url: string) {
		// Remove http:// or https://
		let cleaned = url.replace(/^https?:\/\//, '');

		// Remove any routes or extra slashes
		cleaned = cleaned.split('/')[0];

		return cleaned;
	}

	function isHostnameListed(): boolean {
		return sslInfo.commonName === hostname;
	}
</script>

<section class="flex flex-col items-center justify-center">
	<div class="container mx-auto p-2.5 max-w-xl">
		<h1 class="text-3xl sm:text-4xl font-semibold text-blue-400 mb-12 mt-8">SSL Checker</h1>
		<div class="bg-white p-8 rounded-lg shadow-md mb-4">
			<div class="mb-6 flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
				<input
					bind:value={hostname}
					placeholder="Enter Server Hostname"
					class="p-3 w-full sm:w-2/3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-150"
				/>
				<button
					on:click={handleCheckSSL}
					class="w-full sm:w-1/3 bg-black text-white font-semibold p-3 rounded-lg hover:bg-gray-800 transition duration-150"
				>
					Check SSL
				</button>
			</div>
			{#if error}
				<div class="text-red-600 mb-6 font-medium">{error}</div>
			{/if}
			{#if isLoading}
				<div class="flex justify-center items-center h-40">
					<Spinner color="gray" />
				</div>
			{:else if sslInfo.commonName}
				<div class="text-gray-700">
					<div class="flex items-center mb-6">
						<img src="/server-ok.png" alt="Server OK" class="h-16 w-16 mr-6" />
						<div>
							<h2 class="text-xl font-semibold mb-2">{sslInfo.commonName}</h2>
							<p class="text-sm mb-1">{sslInfo.commonName} resolves to {sslInfo.ipAddress}</p>
							<p class="text-sm mb-1">
								Certificate expires in <span class="font-semibold"
									>{calculateDaysToExpiry(sslInfo.validTo)}</span
								> days
							</p>
							<p class="text-sm">
								Hostname is correctly listed in the certificate:
								<span class="font-semibold">{isHostnameListed() ? 'Yes' : 'No'}</span>
							</p>
						</div>
					</div>
					<hr class="my-6" />
					<h2 class="text-xl font-semibold mb-4">SSL Chains</h2>
					<Timeline active={4} bulletSize={30} lineWidth={2}>
						{#each sslInfo.chain as chainItem, index}
							<Timeline.Item bullet={LockClosed} title={`Chain ${index + 1}`}>
								<Text color="dimmed" size="sm">
									{#if chainItem.commonName}
										<strong>Common Name:</strong>
										{chainItem.commonName} <br />
									{/if}
									{#if chainItem.organization}
										<strong>Organization:</strong>
										{chainItem.organization} <br />
									{/if}
									{#if chainItem.location}
										<strong>Location:</strong>
										{chainItem.location} <br />
									{/if}
									{#if chainItem.validFrom && chainItem.validTo}
										<strong>Valid From:</strong>
										{formatCertDate(chainItem.validFrom)} to {formatCertDate(chainItem.validTo)}
										<br />
									{/if}
									{#if chainItem.serialNumber}
										<strong>Serial Number:</strong>
										{chainItem.serialNumber} <br />
									{/if}
									{#if chainItem.signatureAlgorithm}
										<strong>Signature Algorithm:</strong>
										{chainItem.signatureAlgorithm} <br />
									{/if}
									{#if chainItem.issuer}
										<strong>Issuer:</strong>
										{chainItem.issuer}
									{/if}
								</Text>
							</Timeline.Item>
						{/each}
					</Timeline>
				</div>
			{/if}
		</div>
	</div>
</section>
