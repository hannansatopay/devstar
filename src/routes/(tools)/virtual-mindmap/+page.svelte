<script>
  import { writable } from 'svelte/store';
  import html2canvas from 'html2canvas';
  import { onMount } from 'svelte';

  onMount(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('click', handleClickOutside);
    };
  });

  const initialNodes = [
    {
      id: 1,
      text: "Main Topic",
      x: 500,
      y: 200,
      parentId: null,
      color: "#ffffff",
      locked: false,
      lineColor: "#007BFF",
      backgroundColor: "#ffffff",
    },
  ];

  export let nodes = writable([...initialNodes]);

  let nextId = 2;
  let dragNode = null;
  let newParent = null;
  let title = "MindMap";
  const lineThickness = 2;
  const directions = [
    [-150, 0],
    [150, 0],
    [0, -150],
    [0, 150],
    [-150, 150],
    [150, -150],
  ];
  let directionIndex = 0;
  let showPanel = false;
  let showOptionsPanel = false;
  let buttonRect;
  let nodeRect;
  let mindmapBgColor = '#f0f4f8';
  let mindmapBgImage = '';

  function resetMindmap() {
    nodes.set([...initialNodes]);
    nextId = 2;
  }

  function addNode(parentId) {
    nodes.update((n) => {
      const parentNode = n.find((node) => node.id === parentId);
      const newX = parentNode.x + directions[directionIndex][0] + 75;
      const newY = parentNode.y + directions[directionIndex][1] + 75;
      directionIndex = (directionIndex + 1) % directions.length;
      return [
        ...n,
        {
          id: nextId++,
          text: `Node ${nextId}`,
          x: newX,
          y: newY,
          parentId: parentId,
          color: "#ffffff",
          locked: false,
          lineColor: "#007BFF",
          backgroundColor: "#ffffff",
        },
      ];
    });
  }

  function updateText(node, newText) {
    nodes.update(n => {
      const targetNode = n.find(n => n.id === node.id);
      if (targetNode) {
        targetNode.text = newText;
      }
      return [...n];
    });
  }

  function deleteNode(nodeId) {
    nodes.update(n => {
      const remainingNodes = n.filter(node => node.id !== nodeId && node.parentId !== nodeId);
      return remainingNodes.length > 0 ? remainingNodes : n;
    });
  }

  function handleMouseDown(event, node) {
    if (!node.locked) {
      dragNode = node;
    }
  }

  function handleMouseMove(event) {
    if (dragNode) {
      const container = document.querySelector('.mindmap-container-small');
      const containerRect = container.getBoundingClientRect();

      let newX = event.clientX - containerRect.left - 75;
      let newY = event.clientY - containerRect.top - 25;

      newX = Math.max(0, Math.min(newX, containerRect.width - 150));
      newY = Math.max(0, Math.min(newY, containerRect.height - 50));

      dragNode.x = newX;
      dragNode.y = newY;
      nodes.update(n => [...n]);
    }
  }

  function handleMouseUp() {
    dragNode = null;
  }

  function setNewParent(node) {
    newParent = node;
  }

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

  function updateLineColor(node, newColor) {
    nodes.update((n) => {
      const targetNode = n.find((n) => n.id === node.id);
      if (targetNode) {
        targetNode.lineColor = newColor;
      }
      return [...n];
    });
  }

  function updateNodeColor(node, newColor) {
    nodes.update((n) => {
      const targetNode = n.find((n) => n.id === node.id);
      if (targetNode) {
        targetNode.backgroundColor = newColor;
      }
      return [...n];
    });
  }

  async function downloadMindmap() {
    const mindmapContainer = document.querySelector('.mindmap-container-small');
    const canvas = await html2canvas(mindmapContainer);
    const pngUrl = canvas.toDataURL('image/png');

    const downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = title;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  function toggleLock(node) {
    nodes.update((n) => {
      const targetNode = n.find((n) => n.id === node.id);
      if (targetNode) {
        targetNode.locked = !targetNode.locked;
      }
      return [...n];
    });
  }

  let zoomLevel = 1;

  function zoomIn() {
    zoomLevel = Math.min(zoomLevel + 0.1, 2);
  }

  function zoomOut() {
    zoomLevel = Math.max(zoomLevel - 0.1, 0.5);
  }

  function togglePanel(event, node) {
    showPanel = !showPanel;
    if (showPanel) {
      buttonRect = event.target.getBoundingClientRect();
      nodeRect = document.getElementById(`node-${node.id}`).getBoundingClientRect();
    }
  }

  function handleClickOutside(event) {
    if (!event.target.closest('.panel') && !event.target.closest('.more-button')) {
      showPanel = false;
    }
  }

  function positionPanel(panel) {
    const panelElement = document.getElementById('options-panel');
    if (panelElement) {
      panelElement.style.top = `${buttonRect.bottom + window.scrollY}px`;
      panelElement.style.left = `${buttonRect.left + window.scrollX}px`;
    }
  }
  
    // Toggle options panel visibility
    function toggleOptionsPanel(event) {
    showOptionsPanel = !showOptionsPanel;
    if (showOptionsPanel) {
      positionOptionsPanel();
    }
  }

  // Update background color for mindmap
  function updateBgColor(event) {
    mindmapBgColor = event.target.value;
    mindmapBgImage = '';
  }

  // Update background image for mindmap
  function updateBgImage(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        mindmapBgImage = `url(${e.target.result})`;
      }
      reader.readAsDataURL(file);
    }
  }

  // Position options panel relative to button
  function positionOptionsPanel() {
    const optionsButton = document.querySelector('.options-button button');
    const optionsPanel = document.querySelector('.options-panel');

    if (optionsButton && optionsPanel) {
      const optionsButtonRect = optionsButton.getBoundingClientRect();
      optionsPanel.style.top = `${optionsButtonRect.top + window.scrollY}px`;
      optionsPanel.style.left = `${optionsButtonRect.left + window.scrollX}px`;
    }
  }
</script>

  
  <div class="header rounded-lg" style="border-width: 2px 2px 0 2px; border-color: #a0aec0; border-style: solid;">	
	<div class="title">
		<h1 class=" text-blue-800 bg-gray-50 border-2 border-dashed border-gray-500 rounded-lg p-2" contenteditable bind:textContent={title}></h1>
	</div>
	<div class="actions">
		<button class="text-sm font-bold bg-red" on:click={resetMindmap}>Reset</button>
		<button class="text-sm font-bold bg-red" on:click={downloadMindmap}>Download</button>
		<div class="zoom-controls mt-1">
			<button on:click={zoomIn}>+</button>
			<button on:click={zoomOut} class="px-3">-</button>
		</div>
  
      <button class="options-button text-sm font-bold" on:click={(e) => toggleOptionsPanel()}>Options</button>
      {#if showOptionsPanel}
          <div class="options-panel" id="options-panel" style="position: absolute; z-index: 1000 bind:this={positionOptionsPanel}">
            <label>
              Background Color:
              <input type="color" value={mindmapBgColor} on:input={updateBgColor} />
            </label>
            <label>
              Background Image:
              <input type="file" accept="image/*" on:change={updateBgImage} />
            </label>
          </div>
        {/if}
    
    
    </div>
  </div>
    
	

<div class="mindmap-container-big rounded-lg" style="border-width: 0 2px 2px 2px; border-color: #a0aec0; border-style: solid;">
<div
  class="mindmap-container-small rounded-lg" 
  style="--zoom-level: {zoomLevel};  background-color: {mindmapBgColor}; background-image: {mindmapBgImage};"
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
              style="stroke: {node.lineColor}; stroke-width: {lineThickness}px;"
            ></line>
          {/if}
        {/each}
      {/if}
    {/each}
  </svg>
  {#each $nodes as node}
      <div
      id={"node-" + node.id}
      class="node"
      style="left: {node.x}px; top: {node.y}px; background-color: {node.backgroundColor};"
      on:mousedown={(e) => handleMouseDown(e, node)}
    >
      <textarea
        value={node.text}
        on:input={(e) => updateText(node, e.target.value)}
        readonly={node.locked}
      />
      <div class="buttons">
        <button on:click={() => addNode(node.id)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3a.5.5 0 0 1 .5-.5z" />
          </svg>
        </button>

        <button class="delete-button" on:click={() => deleteNode(node.id)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6zm3-.5a.5.5 0 0 0-.5.5v6a.5.5 0 0 0 1 0V6a.5.5 0 0 0-.5-.5z"/>
            <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9.5A1.5 1.5 0 0 1 11.5 15h-7A1.5 1.5 0 0 1 3 13.5V4h-.5a1 1 0 0 1 0-2H5V1.5A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5V2h2.5a1 1 0 0 1 1 1zM6 2v1h4V2H6z"/>
          </svg>
        </button>
        
        <button on:click={(e) => togglePanel(e, node)} class="more-button">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 9.5a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm-4 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3zm8 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z" />
          </svg>
        </button>

        

        {#if showPanel}
          <div id="options-panel" class="panel" style="position: absolute; z-index: 1000 bind:this={positionPanel}">
            <div class="panel-item">
              <label>
                Node Color:
                <input type="color" value={node.backgroundColor} on:input={(e) => updateNodeColor($nodes.find(n => n.id === node.id), e.target.value)} />
              </label>
              <label>
                Line Color:
                <input type="color"  value={node.lineColor} on:input={(e) => updateLineColor($nodes.find(n => n.id === node.id), e.target.value)} />
              </label>
            </div>
            
              
	    <button on:click={() => toggleLock(node)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                {#if node.locked}
                <path d="M4.5 7.5V4a3.5 3.5 0 1 1 7 0v3.5h1V4a4.5 4.5 0 1 0-9 0v3.5h1zm6.5-3a.5.5 0 0 1 .5.5v3h-7v-3a.5.5 0 0 1 .5-.5h6z"/>
                {:else}
                <path d="M4 4v3h8V4a4 4 0 1 0-8 0zM8 1a3 3 0 0 1 3 3v3H5V4a3 3 0 0 1 3-3zm2 6.5v1H6v-1h4zm-4 2v4h4v-4H6zm2 3.5a1.5 1.5 0 0 1-1.415-1h2.83A1.5 1.5 0 0 1 8 13zm-3-4h1v1H5v-1zm6 0v1h-1v-1h1z"/>
                {/if}
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
          
        {/if}
      </div>
    </div>
  {/each}
</div>
</div>


  <style>
	.mindmap-container-big {
	  position: relative;
	  width: 100%;
	  height: calc(100vh - 64px); /* Adjust height for header */
	  background-color: #f0f4f8;
	  overflow: auto;
	  padding: 20px;
	}
	.mindmap-container-small {
    position: relative;
    width: 100%;
    height: 800px;
    overflow: auto;
    background-color: #F8F8F8;
    transform: scale(var(--zoom-level));
    transform-origin: 0 0;
    transition: transform 0.3s ease;
  }
	.panel {
    display: none;
    position: absolute;
    top: 40px;
    right: 5px;
    background-color: #fff;
    border: 1px solid #cccccc81;
    border-radius: 0.5em;
    padding: 5px;
    z-index: 10;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    opacity: 0.8;
    transition: opacity 0.3s ease;
    font-size: 12px;
	}

	.node:hover .panel {
		display: block;
		opacity: 1;
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

	.node textarea {
    width: 100%;
    height: 100%;
    border: none;
	  border-bottom: 2px solid #ddd;
    border-radius: 0.5em;
    resize: none;
    outline: none;
    overflow: hidden;
    background: #ffffff;
    text-align: center;
    font-size: 14px;
    font-family: Arial, Helvetica, sans-serif;
	}

	.node .panel svg {
		margin: 2px;
		cursor: pointer;
		width: 18px;
		height: 18px;
	}

	.absolute {
		position: absolute;
		top: 0;
		left: 0;
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

	.zoom-controls button {
    padding: 8px 16px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    margin-right: 5px;
  }

  .zoom-controls button:hover {
    background-color: #0056b3;
  }

  .more-button {
    background: none;
    border: none;
    cursor: pointer;
  }

  .more-button svg {
    vertical-align: middle;
  }

  .options-button {
    padding: 4px 4px;
    background-color: #007BFF;
	  color: rgb(255, 255, 255);
	  border: none;
	  border-radius: 5px;
	  cursor: pointer;
	  transition: background-color 0.2s;
    
  }
  .options-panel {
    background-color: white;
    border: 1px solid #000000;
    border-radius: 0.5em;
    padding: 10px;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    font-size: 12px;
    z-index: 10;
  }
  .options-panel label {
    display: block;
    margin-bottom: 10px;
    
  }
  </style>
