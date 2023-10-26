<!-- src/SearchForm.svelte -->
<script lang="ts">
    import { onMount } from 'svelte';
    
    let domainName = "";
    let whoisData = null;
    let loading = false;
    let error = null;
    
    const apiKey = 'at_b1oL4SKVK7lly1IwdpgHcLqvNDVzx'; // Replace with your API key
    const apiEndpoint = `https://www.whoisxmlapi.com/whoisserver/WhoisService?apiKey=${apiKey}&outputFormat=JSON`;

    async function fetchWhoisData() {
        loading = true;
        error = null;

        try {
            const response = await fetch(`${apiEndpoint}&domainName=${domainName}`);
            const data = await response.json();

            if (data.WhoisRecord) {
                whoisData = data.WhoisRecord;
            } else {
                whoisData = null;
            }
        } catch (err) {
            console.error(err);
            error = "Error fetching WHOIS data. Please try again later.";
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        // Initialize domainName with a default value or empty string
        domainName = "example.com"; // Change to your default domain
    });
</script>

<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
    <div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 rounded-lg">
      <div class="p-8">
        <!-- Input section -->
        <label class="block text-gray-700 text-sm font-bold mb-2">Domain Name</label>
        <input type="text" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" bind:value={domainName} placeholder="Enter a domain name" />
  
        <button class="bg-blue-500 mt-2 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" on:click={fetchWhoisData} disabled={loading}>Lookup</button>
        {#if error}
          <p class="text-red-500 mt-2">{error}</p>
        {/if}
        
       
      </div>
      
      <div class="p-8 h-full flex rounded-lg relative justify-center items-center bg-gray-100">
        <div class="w-full">
          <!-- Additional content in the right column -->
          {#if whoisData}
          <!-- WHOIS Data table -->
          <label class="block text-gray-700 text-sm font-bold mt-4">WHOIS Data</label>
          <div class="max-h-96 overflow-auto">
            <table class="border rounded w-full p-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
              <tbody>
                {#each Object.entries(whoisData) as [key, value]}
                  <tr>
                    <td class="font-bold pr-4">{key}</td>
                    <td>{value}</td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <!-- No WHOIS data message -->
          <p class="text-gray-700 text-sm mt-4">No WHOIS data found for the given domain.</p>
        {/if}
        </div>
      </div>
    </div>
  </div>