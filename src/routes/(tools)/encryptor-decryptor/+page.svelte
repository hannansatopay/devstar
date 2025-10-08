<script>
    import CryptoJS from 'crypto-js';
    export let data;
    let isChecked1 = false; // to enable secret key for encryption
    let isChecked2 = false; // to enable secret key for decryption
    var encryptOutput = ''; // Encryption output variable
    var decryptOutput = ''; // Decryption output variable
    let secretKey1 = ''; // Secret key for encryption
    let secretKey2 = ''; // Secret key for decryption

    //Encryption function done by KANEEZ and RAVISH
    function encrypt(input) {
        const text = input.target.value;
        if (isChecked1 && secretKey1) {
            encryptOutput = CryptoJS.AES.encrypt(text, secretKey1).toString();
        } else {
            encryptOutput = btoa(text);
        }
    }

    //Decryption function done by SWAPNIL and SAKSHI
    function decrypt(input) {
        const text = input.target.value;
        if (isChecked2 && secretKey2) {
            try {
                const bytes = CryptoJS.AES.decrypt(text, secretKey2);
                decryptOutput = bytes.toString(CryptoJS.enc.Utf8);
            } catch (e) {
                decryptOutput = 'Invalid secret key or encrypted text';
            }
        } else {
            try {
                decryptOutput = atob(text);
            } catch (e) {
                decryptOutput = 'Invalid encrypted text';
            }
        }
    }

	import { onMount } from 'svelte';

	// Function to copy encrypted output to clipboard done by AMAN
	async function copyToClipboard(text) {
		try {
			await navigator.clipboard.writeText(text);
			alert('Copied to clipboard!');
		} catch (err) {
			console.error('Failed to copy:', err);
			alert('Failed to copy to clipboard.');
		}
	}

	// Function to download PDF done by RIYA
	function downloadPDF() {
		const { jsPDF } = window.jspdf;
		const doc = new jsPDF();
        const decryptInput = document.getElementById("textbox-decrypt").value;
        const decryptedOutput = typeof decryptOutput !== 'undefined' ? decryptOutput : 'No output available';
        doc.text(`Decryption Input: ${decryptInput}`, 10, 10);
        doc.text(`Decrypted Output: ${decryptedOutput}`, 10, 20);
		// doc.text("Decryption Input: " + document.getElementById("textbox-decrypt").value, 10, 10);
		// doc.text("Decrypted Output: " + decryptOutput, 10, 20);
		doc.save('decryption.pdf');
	}
    onMount(() => {
		// Load jsPDF library
		if (typeof window !== 'undefined' && !window.jspdf) {
			const script = document.createElement('script');
			script.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.4.0/jspdf.umd.min.js";
			script.onload = () => {
				window.jspdf = window.jspdf || window.jspdf.umd;
			};
			document.head.appendChild(script);
		}
	});

	// Function to download TXT done by RAM
	function downloadTXT() {
        const decryptInput = document.getElementById("textbox-decrypt").value;
        const decryptedOutput = typeof decryptOutput !== 'undefined' ? decryptOutput : 'No output available';
		const textContent = `Decryption Input: ${decryptInput}\nDecrypted Output: ${decryptedOutput}`;
		const blob = new Blob([textContent], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'decryption.txt';
        document.body.appendChild(a);
		a.click();
        document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}	
</script>


  <!-- UI done by NAVJEET  -->

<section class="bg-white dark:bg-gray-900">
	<div class="px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card p-8 relative items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
			<div class="gap-4 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
				<!-- Headings -->
				<h1 class="text-xl font-bold tracking-tight leading-none text-gray-900 dark:text-white">Text Encryption</h1>
				<h1 class="text-xl font-bold tracking-tight leading-none text-gray-900 dark:text-white">Text Decryption</h1>

				<!-- Input -->
				<div class="max-h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea
						placeholder="Enter Text to be Encrypted"
						id="textbox-encrypt"
						rows="8"
						class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						on:input={encrypt}
					></textarea>
				</div>

				<div class="max-h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea
						placeholder="Enter Text to be Decrypted"
						id="textbox-decrypt"
						rows="8"
						class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						on:input={decrypt}
					></textarea>
				</div>

				<!-- Secret key Enable/Disable -->
				<div class="flex items-center">
					<div class="flex items-center">
						<input
							id="myCheckbox1"
							type="checkbox"
							class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
							bind:checked={isChecked1}
						/>
						<label for="myCheckbox1" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Encrypt with a custom secret key</label>
					</div>
				</div>

				<div class="flex items-center">
					<div class="flex items-center">
						<input
							id="myCheckbox2"
							type="checkbox"
							class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
							bind:checked={isChecked2}
						/>
						<label for="myCheckbox2" class="ms-2 text-sm font-medium text-gray-900 dark:text-gray-300">Decryption requires a custom secret key</label>
					</div>
				</div>

				<!-- Secret Key TextArea -->
				<textarea
					id="myTextarea1"
					placeholder="Enter Secret Key"
					rows="1"
					class="resize-none block p-2.5 w-full text-sm text-gray-900 {isChecked1 ? 'bg-gray-50' : 'bg-gray-200'} rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:{isChecked1 ? 'bg-gray-700' : 'bg-gray-800'} dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					disabled={!isChecked1}
                    bind:value={secretKey1}
				></textarea>

				<textarea
					id="myTextarea2"
					placeholder="Enter Secret Key"
					rows="1"
					class="resize-none block p-2.5 w-full text-sm text-gray-900 {isChecked2 ? 'bg-gray-50' : 'bg-gray-200'} rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:{isChecked2 ? 'bg-gray-700' : 'bg-gray-800'} dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
					disabled={!isChecked2}
                    bind:value={secretKey2}
				></textarea>

				<!-- Output Buttons -->
				<div>
					<button
						type="button"
						class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-white focus:outline-none bg-blue-600 rounded-lg border border-blue-700 hover:bg-blue-700 hover:text-white focus:z-10 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
						on:click={() => encrypt({ target: document.getElementById('textbox-encrypt') })}
					>
						Encrypt
					</button>
				</div>
				<div>
					<button
						type="button"
						class="py-2.5 px-5 me-2 mb-2 text-sm font-medium text-white focus:outline-none bg-blue-600 rounded-lg border border-blue-700 hover:bg-blue-700 hover:text-white focus:z-10 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
						on:click={() => decrypt({ target: document.getElementById('textbox-decrypt') })}
					>
						Decrypt
					</button>
				</div>

				<!-- Result -->
				<div class="rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea
						placeholder="Encrypted Output"
						rows="8"
						class="max-h-20 resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						bind:value={encryptOutput}
                        readonly
					></textarea>
				</div>

				<div class="max-h-20 rounded-lg overflow-hidden bg-gray-50 border border-gray-300">
					<textarea
						placeholder="Decrypted Output"
						rows="8"
						class="resize-none block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
						bind:value={decryptOutput}
                        readonly
					></textarea>
				</div>

				<!-- Copy Button -->
				<div>
					<button
						type="button"
						class="py-2.5 px-5 text-sm font-medium text-white focus:outline-none bg-blue-600 rounded-lg border border-blue-700 hover:bg-blue-700 hover:text-white focus:z-10 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
						on:click={() => copyToClipboard(encryptOutput)}
					>
						Copy
					</button>
				</div>
			</div>
			<div class="mt-8 flex justify-end">
				<button
					type="button"
					class="py-2.5 px-5 text-sm font-medium text-white focus:outline-none bg-blue-600 rounded-lg border border-blue-700 hover:bg-blue-700 hover:text-white focus:z-10 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
					on:click={downloadPDF}
				>Download as PDF</button>
				<button
					type="button"
					class="py-2.5 px-5 ms-2 text-sm font-medium text-white focus:outline-none bg-blue-600 rounded-lg border border-blue-700 hover:bg-blue-700 hover:text-white focus:z-10 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
					on:click={downloadTXT}
				>Download as TXT</button>
            </div>
		</div>
	</div>
</section>