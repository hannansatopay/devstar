<script>
	const tools = [
	  { name: "GIF Tool 1", path: "/tool1" },
	  { name: "GIF Tool 2", path: "/tool2" },
	  { name: "GIF Tool 3", path: "/tool3" },
	  { name: "GIF Tool 4", path: "/tool4" },
	  { name: "GIF Tool 5", path: "/tool5" },
	  { name: "GIF Tool 6", path: "/tool6" },
	  { name: "GIF Tool 7", path: "/tool7" },
	  { name: "GIF Tool 8", path: "/tool8" },
	  { name: "GIF Tool 9", path: "/tool9" },
	  { name: "GIF Tool 10", path: "/tool10" },
	  { name: "GIF Tool 11", path: "/tool11" },
	  { name: "GIF Tool 12", path: "/tool12" },
	  { name: "GIF Tool 13", path: "/tool13" },
	  { name: "GIF Tool 14", path: "/tool14" },
	  { name: "GIF Tool 15", path: "/tool15" },
	  { name: "GIF Tool 16", path: "/tool16" },
	  { name: "GIF Tool 17", path: "/tool17" },
	  { name: "GIF Tool 18", path: "/tool18" },
	  { name: "GIF Tool 19", path: "/tool19" },
	  { name: "GIF Tool 20", path: "/tool20" }
	];
</script>
  
<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
  <div class="grid grid-cols-4 gap-8 p-4">
    {#each tools as tool}
      <a href={tool.path} class="homebutton bg-blue-700 hover:bg-blue-800 text-white p-4 rounded-lg">
        {tool.name}
      </a>
    {/each}
  </div>
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
</style>