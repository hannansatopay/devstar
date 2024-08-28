<script>
	import { onMount } from "svelte";
	import { writable } from 'svelte/store';
  
	let canvas;
	let angle = 0;
	let rotationSpeed = 0;
	let selectedSegment = "";
	let newSegment = "";
	let segments = writable([]);
  
	const randomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0")}`;
  
	const createWheel = (segments) => {
	  const ctx = canvas.getContext("2d");
	  const numSegments = segments.length;
	  const segmentAngle = 2 * Math.PI / numSegments;
  
	  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
	  for (let i = 0; i < numSegments; i++) {
		const startAngle = i * segmentAngle;
		ctx.beginPath();
		ctx.moveTo(200, 200);
		ctx.arc(200, 200, 150, startAngle, startAngle + segmentAngle);
		ctx.fillStyle = randomColor();
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.strokeStyle = "black";
		ctx.stroke();
		ctx.closePath();
  
		ctx.save();
		ctx.translate(200, 200);
		ctx.rotate(startAngle + segmentAngle / 2);
		ctx.textAlign = "right";
		ctx.fillStyle = "black";
		ctx.font = "14px Arial";
		ctx.fillText(segments[i], 140, 10);
		ctx.restore();
	  }
	};
  
	const spin = () => {
	  rotationSpeed = Math.random() * 10 + 10;
	  updateWheel();
	};
  
	const updateWheel = () => {
	  angle = (angle + rotationSpeed) % 360;
	  rotationSpeed *= 0.98;
  
	  segments.subscribe(currentSegments => {
		const ctx = canvas.getContext("2d");
		ctx.clearRect(0, 0, canvas.width, canvas.height);
  
		ctx.save();
		ctx.translate(200, 200);
		ctx.rotate((angle * Math.PI) / 180);
		ctx.translate(-200, -200);
		createWheel(currentSegments);
		ctx.restore();
	  });
  
	  if (rotationSpeed > 0.1) {
		requestAnimationFrame(updateWheel);
	  } else {
		selectSegment();
	  }
	};
  
	const selectSegment = () => {
	  segments.subscribe(currentSegments => {
		const numSegments = currentSegments.length;
		const segmentAngle = 360 / numSegments;
		const selectedIndex = Math.floor((angle % 360) / segmentAngle);
		selectedSegment = currentSegments[selectedIndex];
	  });
	};
  
	const addSegment = () => {
	  if (newSegment.trim() !== "") {
		segments.update(currentSegments => [...currentSegments, newSegment]);
		newSegment = "";
		segments.subscribe(createWheel);
	  }
	};
  
	onMount(() => {
	  segments.subscribe(createWheel);
	});
  </script>
  
  <style>
	.container {
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	  margin: 20px;
	  padding: 20px;
	  border: 1px solid #ccc;
	  border-radius: 10px;
	  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	  background-color: transparent;
	}
  
	.wheel-container {
	  position: relative;
	  width: 400px;
	  height: 400px;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	}
  
	canvas {
	  border: 1px solid #333;
	  border-radius: 50%;
	  background-color: white;
	}
  
	.spin-button {
	  position: absolute;
	  width: 100px;
	  height: 100px;
	  border: none;
	  border-radius: 50%;
	  background-color: #28a745;
	  color: white;
	  cursor: pointer;
	  transition: background-color 0.3s;
	  display: flex;
	  align-items: center;
	  justify-content: center;
	  font-size: 16px;
	  font-weight: bold;
	}
  
	.spin-button:hover {
	  background-color: #218838;
	}
  
	input {
	  margin: 10px 0;
	  padding: 10px;
	  border: 1px solid #ccc;
	  border-radius: 5px;
	  width: 200px;
	}
  
	button {
	  margin: 10px;
	  padding: 10px 20px;
	  border: none;
	  border-radius: 5px;
	  background-color: #28a745;
	  color: white;
	  cursor: pointer;
	  transition: background-color 0.3s;
	}
  
	button:hover {
	  background-color: #218838;
	}
  
	.output-box {
	  margin-top: 20px;
	  padding: 20px;
	  border: 1px solid #333;
	  border-radius: 5px;
	  background-color: #f8f9fa;
	  color: black;
	  font-size: 18px;
	  font-weight: bold;
	}
  </style>
  
  <div class="container">
	<input type="text" bind:value={newSegment} placeholder="Add a segment" />
	<button on:click={addSegment}>Add Segment</button>
	<div class="wheel-container">
	  <canvas bind:this={canvas} width="400" height="400"></canvas>
	  <button class="spin-button" on:click={spin}>Spin</button>
	</div>
	{#if selectedSegment}
	  <div class="output-box">
		<p>You got: {selectedSegment}</p>
	  </div>
	{/if}
  </div>