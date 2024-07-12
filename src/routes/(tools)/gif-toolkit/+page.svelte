<script>
	import Tool1 from "./tool1/+page.svelte";
	import Tool2 from "./tool2/+page.svelte";
	import Tool3 from "./tool3/+page.svelte";
	import Tool4 from "./tool4/+page.svelte";
	import Tool5 from "./tool5/+page.svelte";
	import Tool6 from "./tool6/+page.svelte";
	import Tool7 from "./tool7/+page.svelte";
	import Tool8 from "./tool8/+page.svelte";
	import Tool9 from "./tool9/+page.svelte";
	import Tool10 from "./tool10/+page.svelte";
	import Tool11 from "./tool11/+page.svelte";
	import Tool12 from "./tool12/+page.svelte";
	import Tool13 from "./tool13/+page.svelte";
	import Tool14 from "./tool14/+page.svelte";
	import Tool15 from "./tool15/+page.svelte";
	import Tool16 from "./tool16/+page.svelte";
  
	const tools = [
	  { name: "GIF To Base64", component: Tool1 },
	  { name: "Blur a GIF", component: Tool2 },
	  { name: "Color GIF To Grayscale", component: Tool3 },
	  { name: "GIF Manipulator", component: Tool4 },
	  { name: "Extracxt Frames From GIF", component: Tool5 },
	  { name: "Generate Random GIF", component: Tool6 },
	  { name: "Create a 1x1 Pixel GIF", component: Tool7 },
	  { name: "Remove GIF Frames", component: Tool8 },
	  { name: "Change GIF Contrast", component: Tool9 },
	  { name: "GIF Boomerang Converter", component: Tool10 },
	  { name: "Change Loop Count", component: Tool11 },
	  { name: "GIF to Sprite Sheet", component: Tool12 },
	  { name: "GIF Tool 13", component: Tool13 },
	  { name: "GIF Tool 14", component: Tool14 },
	  { name: "GIF Tool 15", component: Tool15 },
	  { name: "GIF Tool 16", component: Tool16 },
	];
  
	let selectedTool = null;
  </script>
  
  <div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
	{#if selectedTool === null}
	  <div class="grid grid-cols-4 gap-8 p-4">
		{#each tools as tool}
		  <button on:click={() => selectedTool = tool.component} class="homebutton bg-blue-700 hover:bg-blue-800 text-white p-4 rounded-lg">
			{tool.name}
		  </button>
		{/each}
	  </div>
	{:else}
	  <div class="flex flex-col items-center">
		<svelte:component this={selectedTool}/>
		<button on:click={() => selectedTool = null} class="backbutton bg-gray-700 hover:bg-gray-800 text-white p-3 rounded-lg mb-4 mt-8">
		  Back To Tools
		</button>
	  </div>
	{/if}
  </div>
  
  <style>
	.card {
	  padding: 20px;
	  display: flex;
	  flex-direction: column;
	  justify-content: center;
	  align-items: center;
	  border-radius: 20px;
	  margin: 20px;
	  margin-top: 20px;
	}
	.grid {
	  width: 100%;
	}
	.homebutton {
	  border-radius: 15px;
	}
	.backbutton {
	  border-radius: 15px;
	}
  </style>