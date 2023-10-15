<script lang="ts">
	import { Spinner } from 'flowbite-svelte';

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
				`https://ssl-checker-zaidmukaddam.koyeb.app/ssl-info?hostname=${hostname}`
			);
			const result = await response.json();
			if (response.ok && result) {
				sslInfo = result;
			} else {
				error = result?.message || "We couldn't reslove the IP address of your domain or your domain is using a deprecated version of SSL. Please update your DNS and SSL Certificate to the latest version.";
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
		hostname = cleanInputURL(hostname);
		fetchSSLData();
	}

	function parseDate(dateString: string): Date {
		const year = dateString.substring(0, 4);
		const month = dateString.substring(4, 6);
		const day = dateString.substring(6, 8);
		const hour = dateString.substring(8, 10);
		const minute = dateString.substring(10, 12);
		const second = dateString.substring(12, 14);

		// JavaScript months are 0-based (0 = January, 11 = December)
		return new Date(
			Date.UTC(
				Number(year),
				Number(month) - 1,
				Number(day),
				Number(hour),
				Number(minute),
				Number(second)
			)
		);
	}

	function calculateDaysToExpiry(validToDate: string): number {
		const currentDate = new Date();
		const expiryDate = parseDate(validToDate);

		const differenceInTime = expiryDate.getTime() - currentDate.getTime();
		return Math.ceil(differenceInTime / (1000 * 3600 * 24));
	}

	function formatCertDate(dateString: string) {
		const year = dateString.substring(0, 4);
		const month = dateString.substring(4, 6);
		const day = dateString.substring(6, 8);
		const hour = dateString.substring(8, 10);
		const minute = dateString.substring(10, 12);
		const second = dateString.substring(12, 14);

		const date = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`);

		// Now you can format the date any way you'd like. Here's one way:
		return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
	}

	function cleanInputURL(url: string) {
		// Remove http:// or https://
		let cleaned = url.replace(/^https?:\/\//, '');

		// Remove any routes or extra slashes
		cleaned = cleaned.split('/')[0];

		// Remove subdomains, keeping only the domain and TLD
		const parts = cleaned.split('.');
		if (parts.length > 2) {
			cleaned = parts.slice(-2).join('.');
		}

		return cleaned;
	}

	function isHostnameListed(): boolean {
		return sslInfo.commonName === hostname;
	}
</script>

<section class="bg-white dark:bg-gray-900 min-h-screen flex flex-col items-center">
	<div class="container mx-auto py-8 px-4">
		<h1 class="text-4xl font-bold text-blue-600 mb-8 mt-4">SSL Checker</h1>
		<div class="bg-gray-100 dark:bg-gray-800 p-6 rounded-md shadow-md">
			<div class="mb-4">
				<input
					bind:value={hostname}
					placeholder="Server Hostname"
					class="p-2 w-full rounded-md border dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
				/>
			</div>
			<div class="mb-4">
				<button
					on:click={handleCheckSSL}
					class="w-full bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-md"
				>
					Check SSL
				</button>
			</div>
			{#if error}
				<div class="text-red-500 mb-4">{error}</div>
			{/if}
			{#if isLoading}
				<div class="flex justify-center items-center h-40">
					<Spinner color="blue" />
				</div>
			{:else if sslInfo.commonName}
				<div class="bg-gray-700 p-6 rounded-md text-white shadow-lg">
					<div class="flex items-center mb-4">
						<img src="/server-ok.png" alt="Server OK" class="h-12 w-12 mr-4" />
						<div>
							<h2 class="text-2xl font-bold mb-2">{sslInfo.commonName}</h2>
							<p class="mb-1">{sslInfo.commonName} resolves to {sslInfo.ipAddress}</p>
							<p class="mb-1">
								Certificate expires in {calculateDaysToExpiry(sslInfo.validTo)} days
							</p>
							<p>
								Hostname is correctly listed in the certificate: {isHostnameListed() ? 'Yes' : 'No'}
							</p>
							<p>
								<span class="font-semibold">Valid From:</span>
								{formatCertDate(sslInfo.validFrom)} to {formatCertDate(sslInfo.validTo)}
							</p>
							<p>
								<span class="font-semibold">Serial Number:</span>
								{sslInfo.serialNumber}
							</p>
							<p>
								<span class="font-semibold">Signature Algorithm:</span>
								{sslInfo.signatureAlgorithm}
							</p>
						</div>
					</div>
					{#each sslInfo.chain as chainItem, index}
						<div class="p-4 border-t border-gray-600">
							<img src="/chain-ok.png" alt="Server OK" class="h-12 w-12 mr-4" />
							<h3 class="text-blue-400 mb-2">Chain {index + 1}</h3>
							<p class="mb-1">
								<span class="font-semibold">Common Name:</span>
								{chainItem.commonName}
							</p>
							<p class="mb-1">
								<span class="font-semibold">Organization:</span>
								{chainItem.organization}
							</p>
							<p class="mb-1"><span class="font-semibold">Location:</span> {chainItem.location}</p>
							<p class="mb-1">
								<span class="font-semibold">Valid From:</span>
								{formatCertDate(chainItem.validFrom)} to {formatCertDate(chainItem.validTo)}
							</p>
							<p class="mb-1">
								<span class="font-semibold">Serial Number:</span>
								{chainItem.serialNumber}
							</p>
							<p class="mb-1">
								<span class="font-semibold">Signature Algorithm:</span>
								{chainItem.signatureAlgorithm}
							</p>
							<p><span class="font-semibold">Issuer:</span> {chainItem.issuer}</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</section>
