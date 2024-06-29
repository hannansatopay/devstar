<script>
	import { writable } from 'svelte/store';
	import html2canvas from 'html2canvas';
  
	// Initial nodes
	export let nodes = writable([
	  { id: 1, text: "Main Topic", x: 500, y: 100, parentId: null }
	]);
  
	let nextId = 2;
	let dragNode = null;
	let newParent = null;
	let title = 'MindMap';
  
	// Function to add a new node
	function addNode(parentId) {
	  nodes.update(n => {
		const parentNode = n.find(node => node.id === parentId);
		const newX = parentNode.x + (nextId % 2 === 0 ? -150 : 150);
		const newY = parentNode.y + 150;
		return [
		  ...n,
		  { id: nextId++, text: `Node ${nextId}`, x: newX, y: newY, parentId: parentId }
		];
	  });
	}
  
	// Function to update the text inside the node
	function updateText(node, newText) {
	  nodes.update(n => {
		const targetNode = n.find(n => n.id === node.id);
		if (targetNode) {
		  targetNode.text = newText;
		}
		return [...n];
	  });
	}
  
	// Function to delete a node
	function deleteNode(nodeId) {
	  nodes.update(n => {
		const remainingNodes = n.filter(node => node.id !== nodeId && node.parentId !== nodeId);
		return remainingNodes.length > 0 ? remainingNodes : n;
	  });
	}
  
	// Function to handle mouse down event for dragging
	function handleMouseDown(event, node) {
	  dragNode = node;
	}
  
	// Function to handle mouse move event for dragging
	function handleMouseMove(event) {
	  if (dragNode) {
		const container = document.querySelector('.mindmap-container');
		const containerRect = container.getBoundingClientRect();
  
		let newX = event.clientX - containerRect.left - 75; // Adjust for node width
		let newY = event.clientY - containerRect.top - 25; // Adjust for node height
  
		// Ensure the node stays within the container
		newX = Math.max(0, Math.min(newX, containerRect.width - 150));
		newY = Math.max(0, Math.min(newY, containerRect.height - 50));
  
		dragNode.x = newX;
		dragNode.y = newY;
		nodes.update(n => [...n]);
	  }
	}
  
	// Function to handle mouse up event to stop dragging
	function handleMouseUp() {
	  dragNode = null;
	}
  
	// Function to set a new parent for a node
	function setNewParent(node) {
	  newParent = node;
	}
  
	// Function to change the parent of a node
	function changeParent(nodeId) {
	  if (newParent) {
		nodes.update(n => {
		  const targetNode = n.find(node => node.id === nodeId);
		  if (targetNode) {
			targetNode.parentId = newParent.id;
		  }
		  return [...n];
		});
		newParent = null;
	  }
	}
  
	// Function to download mindmap as PNG using html2canvas
	async function downloadMindmap() {
	  const mindmapContainer = document.querySelector('.mindmap-container');
	  
	  // Use html2canvas to capture the container as a canvas
	  const canvas = await html2canvas(mindmapContainer);
  
	  // Convert canvas to PNG image data URL
	  const pngUrl = canvas.toDataURL('image/png');

	  console.log('Current title:', title);
  
	  // Create a temporary download link and trigger the download
	  const downloadLink = document.createElement('a');
	  downloadLink.href = pngUrl;
	  downloadLink.download = title ; // Change filename and extension as needed
	  document.body.appendChild(downloadLink);
	  downloadLink.click();
	  document.body.removeChild(downloadLink);
	}
  </script>
  
  <style>
	.mindmap-container {
	  position: relative;
	  width: 100%;
	  height: calc(100vh - 64px); /* Adjust height for header */
	  background-color: #f0f4f8;
	  overflow: auto;
	  padding: 20px;
	}
	.node {
	  position: absolute;
	  width: 150px;
	  padding: 10px;
	  background-color: #ffffff;
	  border: 2px solid #007BFF;
	  border-radius: 8px;
	  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	  transition: transform 0.2s, box-shadow 0.2s;
	  cursor: grab;
	  text-align: center;
	}
	.node:active {
	  cursor: grabbing;
	}
	.node input {
	  width: 100%;
	  border: none;
	  border-bottom: 2px solid #ddd;
	  text-align: center;
	  outline: none;
	}
	.node button {
	  margin-top: 10px;
	  background-color: #007BFF;
	  color: white;
	  border: none;
	  padding: 7px 9px;
	  border-radius: 5px;
	  cursor: pointer;
	  transition: background-color 0.2s;
	}
	.node button:hover {
	  background-color: #0056b3;
	}
	.node .delete-button {
	  background-color: #dc3545;
	}
	.node .delete-button:hover {
	  background-color: #c82333;
	}
	.controls {
	  margin: 10px;
	}
	line {
	  stroke: #007BFF;
	  stroke-width: 2;
	}
	.header {
	  display: flex;
	  align-items: center;
	  justify-content: space-between;
	  height: 70px;
	  background-color: #ffffff;
	  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	  padding: 0 20px;
	  position: sticky;
	  top: 0;
	  z-index: 10;
	}
	.header .title {
	  font-size: 1.2em;
	  font-weight: bold;
	}
	.header .actions {
	  display: flex;
	  gap: 10px;
	}
	.header button {
	  background-color: #007BFF;
	  color: white;
	  border: none;
	  padding: 10px 20px;
	  border-radius: 5px;
	  cursor: pointer;
	  transition: background-color 0.2s;
	}
	.header button:hover {
	  background-color: #0056b3;
	}
  </style>
  
    <div class="header rounded-lg" style="border-width: 2px 2px 0 2px; border-color: #a0aec0; border-style: solid;">	
		<div class="title">
		<h1 class=" text-blue-800 bg-gray-50 border-2 border-dashed border-gray-500 rounded-lg p-2" contenteditable bind:textContent={title}></h1>
		</div>
	<div class="actions">
	  <button class="text-sm font-bold bg-red" on:click={downloadMindmap}>Download</button>
	</div>
  </div>
  
  <div
	class="mindmap-container rounded-lg" style="border-width: 0 2px 2px 2px; border-color: #a0aec0; border-style: solid;"
	on:mousemove={handleMouseMove}
	on:mouseup={handleMouseUp}
  >
	<svg class="absolute w-full h-full">
	  {#each $nodes as node}
		{#if node.parentId !== null}
		  {#each $nodes as parent}
			{#if parent.id === node.parentId}
			  <line
				x1={parent.x + 75}
				y1={parent.y + 25}
				x2={node.x + 75}
				y2={node.y}
			  ></line>
			{/if}
		  {/each}
		{/if}
	  {/each}
	</svg>
	{#each $nodes as node}
	  <div
		class="node"
		style="left: {node.x}px; top: {node.y}px;"
		on:mousedown={(e) => handleMouseDown(e, node)}
	  >
		<input 
		  type="text" 
		  value={node.text} 
		  on:input={(e) => updateText(node, e.target.value)} 
		/>
		<div class="buttons">
			<button on:click={() => addNode(node.id)}>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
				  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
				</svg>
			  </button>
			  
			<button class="delete-button" on:click={() => deleteNode(node.id)}>
			  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
				<path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm3-.5a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 1 0V6a.5.5 0 0 0-.5-.5z"/>
				<path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9.5A1.5 1.5 0 0 1 11.5 15h-7A1.5 1.5 0 0 1 3 13.5V4h-.5a1 1 0 0 1 0-2H5V1.5A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5V2h2.5a1 1 0 0 1 1 1zM6 2v1h4V2H6z"/>
			  </svg>
			</button>
			<button on:click={() => setNewParent(node)}>
			  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
				<path d="M5.5 4a.5.5 0 0 1 .5.5v2.793L7.354 5.293a.5.5 0 1 1 .707.707l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 1 1 .707-.707L5 7.293V4.5A.5.5 0 0 1 5.5 4zM10.5 12a.5.5 0 0 1-.5-.5v-2.793l-1.854 1.854a.5.5 0 1 1-.707-.707l2-2a.5.5 0 0 1 .708 0l2 2a.5.5 0 1 1-.707.707L11 8.707V11.5a.5.5 0 0 1-.5.5z"/>
			  </svg>
			</button>
			{#if newParent && newParent.id !== node.id}
			  <button class="text-sm" on:click={() => changeParent(node.id)}>Change</button>
			{/if}
		  </div>
	  </div>
	{/each}
  </div>
  