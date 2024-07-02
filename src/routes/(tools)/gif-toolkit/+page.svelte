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
	  { name: "GIF Tool 1", component: Tool1 },
	  { name: "GIF Tool 2", component: Tool2 },
	  { name: "GIF Tool 3", component: Tool3 },
	  { name: "GIF Tool 4", component: Tool4 },
	  { name: "GIF Tool 5", component: Tool5 },
	  { name: "GIF Tool 6", component: Tool6 },
	  { name: "GIF Tool 7", component: Tool7 },
	  { name: "GIF Tool 8", component: Tool8 },
	  { name: "GIF Tool 9", component: Tool9 },
	  { name: "GIF Tool 10", component: Tool10 },
	  { name: "GIF Tool 11", component: Tool11 },
	  { name: "GIF Tool 12", component: Tool12 },
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
    <div>
      <svelte:component this={selectedTool}/>
	  <button on:click={() => selectedTool = null} class="backbutton bg-gray-700 hover:bg-gray-800 text-white p-3 rounded-lg mb-4">
        Back to Tools
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