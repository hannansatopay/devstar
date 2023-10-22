<script lang="ts">
	// Define a type for the data object
	type Data = {
	  meta: {
		title: string;
		description: string;
	  };
	  // Add other properties as needed
	};
  
	// Initialize the data object
	let data: Data = {
	  meta: {
		title: "User Agent",
		description: "A user agent is a text string that tells the web server you're connecting to which browser and operating system you're using.Your User-Agent is a field in your HTTP header that is sent when you connect to a website. Operating systems and browsers have different user agent contents. The web server can use this data to deliver various web pages or simply gather visitor data for statistics. In analytics and statistics, a user agent can be used to identify the browsers and operating systems that visitors are using.",
		// Initialize other properties as needed
	  },
	  // Initialize other properties as needed
	};
  
	import Intro from '$lib/Intro.svelte';
	import { onMount } from 'svelte';
	import { each } from 'svelte/internal';
  
	// Declare variables with appropriate types
	let innerWidth: number | null = null;
	let innerHeight: number | null = null;
	let screenWidth: number | null = null;
	let screenHeight: number | null = null;
  
	let operatingSystem: string | null = null;
	let osVersion: string | null = null;
	let osArchitecture: string | null = null;
  
	let browserName: string | null = null;
	let browserVersion: string | null = null;
  
	// Add this variable to capture the user agent string
	let userAgentString: string = '';
  
	// Create a function to update device information
	function updateDeviceInfo() {
	  if (userAgentString) {
		// Use userAgentString to extract device information
  
		// Operating System information
		if (userAgentString.includes('Windows')) {
		  operatingSystem = 'Windows';
		  if (userAgentString.includes('Windows NT 10.0')) {
			osVersion = '10';
		  } else if (userAgentString.includes('Windows NT 6.3')) {
			osVersion = '8.1';
		  } else if (userAgentString.includes('Windows NT 6.2')) {
			osVersion = '8';
		  } else if (userAgentString.includes('Windows NT 6.1')) {
			osVersion = '7';
		  } else if (userAgentString.includes('Windows NT 6.0')) {
			osVersion = 'Vista';
		  } else if (userAgentString.includes('Windows NT 5.1') || userAgentString.includes('Windows XP')) {
			osVersion = 'XP';
		  }
		  osArchitecture =
			userAgentString.includes('WOW64') || userAgentString.includes('Win64') || userAgentString.includes('x64')
			  ? '64-bit'
			  : '32-bit';
		} else if (userAgentString.includes('Macintosh')) {
		  operatingSystem = 'MacOS';
		  const osMatch = userAgentString.match(/Mac OS X (\d+(?:[\.\_\d]+)?)/);
		  if (osMatch) {
			osVersion = osMatch[1].replace(/_/g, '.');
		  }
		} else if (userAgentString.includes('Linux')) {
		  operatingSystem = 'Linux';
		  osArchitecture = userAgentString.includes('x86_64') ? '64-bit' : '32-bit';
		} else if (userAgentString.includes('iPhone') || userAgentString.includes('iPad') || userAgentString.includes('iPod')) {
		  operatingSystem = 'iOS';
		  const osMatch = userAgentString.match(/OS (\d+(?:[\.\_\d]+)?)/);
		  if (osMatch) {
			osVersion = osMatch[1].replace(/_/g, '.');
		  }
		} else if (userAgentString.includes('Android')) {
		  operatingSystem = 'Android';
		  const osMatch = userAgentString.match(/Android (\d+(?:[\.\_\d]+)?)/);
		  if (osMatch) {
			osVersion = osMatch[1];
		  }
		}
  
		// Browser information
		if (userAgentString.includes('Edge')) {
		  browserName = 'Microsoft Edge';
		  const versionMatch = userAgentString.match(/Edge\/([\d.]+)/);
		  if (versionMatch) {
			browserVersion = versionMatch[1];
		  }
		} else if (userAgentString.includes('Chrome')) {
		  browserName = 'Google Chrome';
		  const versionMatch = userAgentString.match(/Chrome\/([\d.]+)/);
		  if (versionMatch) {
			browserVersion = versionMatch[1];
		  }
		} else if (userAgentString.includes('Safari')) {
		  browserName = 'Safari';
		  const versionMatch = userAgentString.match(/Version\/([\d.]+)/);
		  if (versionMatch) {
			browserVersion = versionMatch[1];
		  }
		} else if (userAgentString.includes('Firefox')) {
		  browserName = 'Mozilla Firefox';
		  const versionMatch = userAgentString.match(/Firefox\/([\d.]+)/);
		  if (versionMatch) {
			browserVersion = versionMatch[1];
		  }
		} else if (userAgentString.includes('Opera') || userAgentString.includes('OPR')) {
		  browserName = 'Opera';
		  const versionMatch = userAgentString.match(/(?:Opera|OPR)\/([\d.]+)/);
		  if (versionMatch) {
			browserVersion = versionMatch[1];
		  }
		} else if (userAgentString.includes('Trident')) {
		  browserName = 'Internet Explorer';
		  const versionMatch = userAgentString.match(/rv:([\d.]+)/);
		  if (versionMatch) {
			browserVersion = versionMatch[1];
		  }
		}
        
        let deviceType = 'Unknown';
        //Device Type
        if (userAgentString) { 
            if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgentString)) {
                deviceType = 'Tablet';
            } else if (/(mobi|ip(hone|od)|android)/i.test(userAgentString)) {
                deviceType = 'Mobile';
            } else {
                deviceType = 'Desktop';
            }
        }
	  }
	}
	// let userAgentCount = 1;
	// let browserType = "Chrome";
	// let generatedUserAgents = [];
	
	// function generateRandomUserAgents() {
	// 	generatedUserAgents = [];
	// 	for (let i = 0; i < userAgentCount; i++) {
	// 		// Generate a random version number between 1 and 99
	// 		const version = Math.floor(Math.random() * 99) + 1;
	// 		// Create a user agent string based on the selected browser type and random version
	// 		let userAgentString = '';
	// 		if (browserType === 'Chrome') {
	// 			userAgentString = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`;
	// 		} else if (browserType === 'Firefox') {
	// 			userAgentString = `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:${version}.0) Gecko/20100101 Firefox/${version}.0`;
	// 		} else if (browserType === 'Safari') {
	// 			userAgentString = `Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version}.0.0 Safari/605.1.15`;
	// 		} else if (browserType === 'Edge') {
	// 			userAgentString = `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36 Edg/${version}.0.0.0`;
	// 		}
	// 		generatedUserAgents.push(userAgentString);
	// 	}
	// }
	
	let userAgentCount = 1;
	let browserType = "Chrome";
	let generatedUserAgents = [];
	
	function getRandomVersion() {
		return Math.floor(Math.random() * 99) + 1;
	}
	
	function getRandomOS() {
		const osOptions = [
			{ os: "Windows", version: ["10.0", "6.3", "6.2", "6.1", "6.0", "5.1"] },
			{ os: "Macintosh", version: ["10_15_5"] },
			{ os: "Linux", version: ["x86_64"] },
			{ os: "iOS", version: ["14.0.0", "13.0.0"] },
			{ os: "Android", version: ["10.0.0", "9.0.0"] }
		];
		const randomOS = osOptions[Math.floor(Math.random() * osOptions.length)];
		const randomVersion = randomOS.version[Math.floor(Math.random() * randomOS.version.length)];
		return `(${randomOS.os}; ${randomVersion})`;
	}
	
	function getRandomDeviceType() {
		const deviceTypes = ["Desktop", "Mobile", "Tablet"];
		return deviceTypes[Math.floor(Math.random() * deviceTypes.length)];
	}
	
	function generateRandomUserAgents() {
		generatedUserAgents = [];
		
		for (let i = 0; i < userAgentCount; i++) {
			const version = getRandomVersion();
			const os = getRandomOS();
			const deviceType = getRandomDeviceType();
			let userAgentString = "";
			
			// Logical browser detection
			if (browserType === "Chrome") {
				userAgentString = `Mozilla/5.0 ${os} AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36`;
			} else if (browserType === "Firefox") {
				userAgentString = `Mozilla/5.0 ${os} Gecko/20100101 Firefox/${version}.0`;
			} else if (browserType === "Safari") {
				userAgentString = `Mozilla/5.0 ${os} AppleWebKit/605.1.15 (KHTML, like Gecko) Version/${version}.0.0 Safari/605.1.15`;
			} else if (browserType === "Edge") {
				userAgentString = `Mozilla/5.0 ${os} AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${version}.0.0.0 Safari/537.36 Edg/${version}.0.0.0`;
			}
			
			generatedUserAgents.push(userAgentString);
		}
  }









  onMount(() =>{
    screenWidth = screen.width;
    screenHeight = screen.height;
    // ...
  });
</script>

<Intro heading={data.meta.title} description={data.meta.description} />
 
  <svelte:window bind:innerWidth bind:innerHeight />
  
 
<style>
.title-font {
    font-size: 2rem;
    font-weight: bold;
    font-family: 'Jost', sans-serif;
  }
  
  /* Media query for dark mode */
@media (prefers-color-scheme: dark) {
    .title-font {
      color: white; /* Set the text color to white in dark mode */
      text-shadow: 2px 2px 0px white, -2px -2px 0px white, 2px -2px 0px white, -2px 2px 0px white; /* Add a white outline to the text */
    }
  }
   
.jost-font {
    font-family: 'Jost', sans-serif;
    font-weight: 700; /* Semi-bold */
} 
.center-content {
    display: flex;
    flex-direction: column;
    align-items: center; /* Center horizontally */
    justify-content: center; /* Center vertically */
}	 
		
</style>
    

<br><br>
<section class="bg-white dark:bg-gray-900 center-content">
	<h2 class="jost-font text-3xl text-gray-900 dark:text-white">Decode User Agent String</h2>
	<br>
	<div class="w-full max-w-md p-6 bg-white dark:bg-gray-800 text-center rounded-lg border border-gray-300 dark:border-gray-700 shadow-md">
	  <h2 class="text-2xl font-semibold text-gray-900 dark:text-white mb-4">User Agent Information</h2>
	  <input
		type="text"
		class="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-500 mb-4"
		placeholder="Enter the user agent string"
		bind:value={userAgentString}
	  />
	  <button
		class="bg-blue-500 text-white rounded-lg py-2 px-4 hover:bg-blue-600 shadow-md focus:outline-none"
		on:click={updateDeviceInfo}
	  >
		Get Device Info
	  </button>
	</div>
	<br><br>
  
	<!-- Display Section -->
	<div class="py-4 px-4 mx-auto max-w-screen-xl sm:py-8 lg:px-6 py-8">
	  <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"> <!-- Removed "Browser Resolution" and "Screen Resolution" -->
		{#each ['Operating System', 'Browser', 'Device Type'] as item}
		<div class="bg-white border border-gray-200 rounded-lg shadow-lg p-4 dark:bg-gray-800 dark:border-gray-700">
		  <h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">{item}</h2>
		  {#if item === 'Operating System'}
		  <p class="text-gray-700 dark:text-gray-400">
			{operatingSystem || ''} {osVersion || ''} {osArchitecture || ''}
		  </p>
		  {/if}
		  {#if item === 'Browser'}
		  <p class="text-gray-700 dark:text-gray-400">
			{browserName || ''} {browserVersion || ''}
		  </p>
		  {/if}
		  {#if item === 'Device Type'}
		  <p class="text-gray-700 dark:text-gray-400">
			{#if userAgentString}
			  {#if /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgentString)}
				Tablet
			  {:else if /(mobi|ip(hone|od)|android)/i.test(userAgentString)}
				Mobile
			  {:else}
				Desktop
			  {/if}
			{:else}
			  Unknown
			{/if}
		  </p>
		  {/if}
		</div>
		{/each}
	  </div>
	</div>
  
	
  </section>
  
  <section class="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 body-font relative p-2 shadow-md">
	<div class="container px-5 py-24 mx-auto">
	  <div class="flex flex-col text-center w-full mb-12">
		<h1 class="sm:text-3xl text-2xl font-medium title-font mb-4 text-gray-900 dark:text-white">Generate Random User Agents</h1>
		<p class="lg:w-2/3 mx-auto leading-relaxed text-base">Generate user agents based on your input.</p>
	  </div>
	  <div class="lg:w-1/2 md:w-2/3 mx-auto">
		<div class="flex flex-wrap -m-2">
			<div class="p-2 w-1/2">
                <div class="relative">
                    <label for="user-agent-count" class="leading-7 text-sm">Number of User Agents [Maximum 10 at a time] </label>
                    <input type="number" bind:value={userAgentCount} id="user-agent-count" name="user-agent-count" class="w-full bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-400 text-base outline-none text-gray-700 dark:text-gray-300 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out text-left" min="0" max="10">
                </div>
            </div>

		  <div class="p-2 w-1/2">
			<div class="relative">
			  <label for="browser-type" class="leading-7 text-sm">Browser Type</label>
			  <select bind:value={browserType} id="browser-type" name="browser-type" class="w-full bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600 focus:border-indigo-500 dark:focus:border-indigo-400 focus:bg-white dark:focus:bg-gray-800 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-400 text-base outline-none text-gray-700 dark:text-gray-300 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out text-left">
				<option value="Chrome">Chrome</option>
				<option value="Firefox">Firefox</option>
				<option value="Safari">Safari</option>
				<option value="Edge">Edge</option>
			  </select>
			</div>
		  </div>
		  <div class="p-2 w-full">
			<button class="flex mx-auto text-white bg-blue-500 dark:bg-blue-600 border-0 py-2 px-8 focus:outline-none hover:bg-blue-600 dark:hover:bg-blue-700 rounded text-lg" on:click={generateRandomUserAgents}>Generate</button>
		  </div>
		  <div class="p-2 w-full pt-8 mt-8 border-t border-gray-300 dark:border-gray-600 text-center">
			<div>
				{#each generatedUserAgents as userAgent(userAgent)}
					<p>{userAgent}</p>
				{/each}
			</div>					
		  </div>
		</div>
	  </div>
	</div>
 </section>
 
  




