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
		try {
			const response = await fetch(`https://ssl-checker-zaidmukaddam.koyeb.app/ssl-info?hostname=${hostname}`);
			const result = await response.json();
			if (response.ok && result) {
				sslInfo = result;
			} else {
				error = result?.message || 'An error occurred.';
			}
		} catch (err) {
			console.error('Error fetching SSL data:', err);
			error = 'An error occurred.';
		} finally {
			isLoading = false;
		}
	}

	function handleCheckSSL() {
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

	function isHostnameListed(): boolean {
		return sslInfo.commonName === hostname;
	}
</script>

<section class="bg-white dark:bg-gray-900 h-max flex items-center">
	<div class="py-8 px-4 mx-auto max-w-screen-3xl lg:px-12">
		<input
			bind:value={hostname}
			placeholder="Server Hostname"
			class="mb-4 p-2 border rounded w-full"
		/>
		<button
			on:click={handleCheckSSL}
			class="mb-4 py-2.5 px-5 text-sm font-medium bg-blue-600 text-white rounded-lg w-full hover:bg-blue-700"
		>
			Check SSL
		</button>

		{#if error}
			<p class="text-red-600">{error}</p>
		{/if}

		{#if isLoading}
			<div class="flex justify-center items-center h-40">
				<Spinner color="blue" />
			</div>
		{:else if sslInfo.commonName}
			<div class="ssl-container bg-[#323A49] rounded-lg mx-auto p-4">
				<!-- Server Information -->
				<div class="flex w-full mb-4">
					<div>
						<img src="/server-ok.png" alt="Server OK" class="h-12 w-12" />
					</div>
					<div class="ml-2">
						<h1 class="text-white text-3xl mb-2">{sslInfo.commonName}</h1>
						<p class="text-white mb-1">{sslInfo.commonName} resolves to {sslInfo.ipAddress}</p>
						<p class="text-white mb-1">
							Certificate expires in {calculateDaysToExpiry(sslInfo.validTo)} days
						</p>
						<p class="text-white">
							Hostname is correctly listed in the certificate: {isHostnameListed() ? 'Yes' : 'No'}
						</p>
					</div>
				</div>
				<!-- Server Chain Information -->
				{#each sslInfo.chain as chainItem, index}
					<div class="ssl-section p-4 flex items-start">
						<div class="ssl-logo mr-4" style="background-image: url('/chain-ok.png');" />
						<div>
							<h2 class="text-blue-600 mb-2">Chain {index + 1}</h2>
							<p class="text-white mb-1"><strong>Common Name:</strong> {chainItem.commonName}</p>
							<p class="text-white mb-1"><strong>Organization:</strong> {chainItem.organization}</p>
							<p class="text-white mb-1"><strong>Location:</strong> {chainItem.location}</p>
							<p class="text-white mb-1">
								<strong>Valid From:</strong>
								{formatCertDate(chainItem.validFrom)} to {formatCertDate(chainItem.validTo)}
							</p>
							<p class="text-white mb-1">
								<strong>Serial Number:</strong>
								{chainItem.serialNumber}
							</p>
							<p class="text-white mb-1">
								<strong>Signature Algorithm:</strong>
								{chainItem.signatureAlgorithm}
							</p>
							<p class="text-white mb-1"><strong>Issuer:</strong> {chainItem.issuer}</p>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</section>

<style>
	/* Add the necessary styles here */
	.ssl-container {
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.ssl-section:first-child {
		border-top: none;
	}

	.ssl-section {
		border-top: 1px solid #e0e0e0;
	}

	.ssl-logo {
		width: 40px;
		height: 40px;
		background-size: cover;
	}
</style>
