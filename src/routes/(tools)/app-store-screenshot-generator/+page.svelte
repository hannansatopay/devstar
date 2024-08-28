<script lang="ts">
	import { onMount } from "svelte";
	import { Label, Input, Button, Textarea } from "flowbite-svelte";
	import Copy from "$lib/Copy.svelte";
  
	export let screenshotData = {
	  appName: '',
	  description: '',
	  contributors: [],
	  screenshots: []
	};
  
	let newContributorName = '';
	let newContributorGithubId = '';
	let newScreenshot = '';
  
	const addContributor = () => {
	  if (newContributorName && newContributorGithubId) {
		screenshotData.contributors = [...screenshotData.contributors, {
		  name: newContributorName,
		  githubId: newContributorGithubId
		}];
		newContributorName = '';
		newContributorGithubId = '';
	  }
	};
  
	const addScreenshot = () => {
	  if (newScreenshot) {
		screenshotData.screenshots = [...screenshotData.screenshots, newScreenshot];
		newScreenshot = '';
	  }
	};
  
	const removeContributor = (index: number) => {
	  screenshotData.contributors = screenshotData.contributors.filter((_, i) => i !== index);
	};
  
	const removeScreenshot = (index: number) => {
	  screenshotData.screenshots = screenshotData.screenshots.filter((_, i) => i !== index);
	};
  
	// Gradient Generator variables and functions
	let colorList = ['#000000', '#bb2d6f', '#fd9d1d', '#fcf437'];
	let angle = 90;
	let speed = 7;
	let gradientType: 'linear' | 'angular' | 'radial' = 'linear';
  
	$: bgGradient =
	  gradientType === 'linear'
		? colorList.length > 1
		  ? `linear-gradient(${angle}deg, ${colorList.join(', ')})`
		  : colorList[0]
		: gradientType === 'angular'
		? colorList.length > 1
		  ? `conic-gradient(from ${angle}deg, ${colorList.join(', ')})`
		  : colorList[0]
		: gradientType === 'radial'
		? colorList.length > 1
		  ? `radial-gradient(circle, ${colorList.join(', ')})`
		  : colorList[0]
		: colorList[0];
  
	// Handle gradient type change
	const setGradientType = (type: 'linear' | 'angular' | 'radial') => {
	  gradientType = type;
	};
  </script>
  
  <section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
	  <div class="card gap-16 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
		<div class="p-8">
		  <Label class="mb-2">App Name</Label>
		  <Input bind:value={screenshotData.appName} class="mb-4" placeholder="Enter the app name" />
  
		  <Label class="mb-2">Description</Label>
		  <Textarea bind:value={screenshotData.description} rows="4" class="mb-4" placeholder="Enter the app description" />
  
		  <Label class="mb-2">Contributors</Label>
		  <div class="flex gap-2 mb-2">
			<Input bind:value={newContributorName} placeholder="Name" class="flex-1" />
			<Input bind:value={newContributorGithubId} placeholder="GitHub ID" class="flex-1" />
			<Button on:click={addContributor} class="bg-blue-500 text-white">Add</Button>
		  </div>
		  {#each screenshotData.contributors as contributor, index (index)}
			<div class="flex gap-2 mb-2">
			  <span class="flex-1">{contributor.name} ({contributor.githubId})</span>
			  <Button on:click={() => removeContributor(index)} class="bg-red-500 text-white">Remove</Button>
			</div>
		  {/each}
  
		  <Label class="mb-2">Screenshots</Label>
		  <div class="flex gap-2 mb-2">
			<Input bind:value={newScreenshot} placeholder="Screenshot URL" class="flex-1" />
			<Button on:click={addScreenshot} class="bg-blue-500 text-white">Add</Button>
		  </div>
		  {#each screenshotData.screenshots as screenshot, index (index)}
			<div class="flex gap-2 mb-2">
			  <span class="flex-1">{screenshot}</span>
			  <Button on:click={() => removeScreenshot(index)} class="bg-red-500 text-white">Remove</Button>
			</div>
		  {/each}
  
		  <Label class="mb-2">Preview</Label>
		  <div class="bg-gray-100 p-4 rounded-lg mb-4">
			<h2 class="text-2xl font-bold mb-2">{screenshotData.appName}</h2>
			<p class="mb-4">{screenshotData.description}</p>
			<h3 class="text-xl font-semibold mb-2">Contributors</h3>
			<ul class="list-disc pl-5">
			  {#each screenshotData.contributors as contributor}
				<li>{contributor.name} ({contributor.githubId})</li>
			  {/each}
			</ul>
			<h3 class="text-xl font-semibold mt-4 mb-2">Screenshots</h3>
			<div class="grid grid-cols-2 gap-4">
			  {#each screenshotData.screenshots as screenshot}
				<div class="border rounded-lg p-2">
				  <img src={screenshot} alt="Screenshot" class="w-full h-auto" />
				</div>
			  {/each}
			</div>
		  </div>
  
		  <div class="p-2.5 overflow-auto text-sm text-gray-900 dark:text-white bg-gray-50 rounded-lg border border-gray-400 dark:bg-gray-700 dark:border-gray-600">
			<Copy text={JSON.stringify(screenshotData, null, 2)} />
			<pre>{JSON.stringify(screenshotData, null, 2)}</pre>
		  </div>
		</div>
	  </div>
	</div>
  </section>
  
  <style>
	pre {
	  white-space: pre-wrap;
	  word-wrap: break-word;
	}
	.living-background {
	  position: fixed;
	  height: 100vh;
	  width: 100vw;
	  z-index: -1;
	  background-size: 400% 400%;
	  animation: gradient 7s ease infinite;
	}
  
	@keyframes gradient {
	  0% {
		background-position: 0% 50%;
	  }
	  50% {
		background-position: 100% 50%;
	  }
	  100% {
		background-position: 0% 50%;
	  }
	}
  </style>
  
  <div class="living-background" style={bgGradient}></div>
  