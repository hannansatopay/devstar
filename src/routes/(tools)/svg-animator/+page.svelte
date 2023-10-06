<script>
	let animationType = "None";
  
	const animations = [
	  { name: "None", animationClass: "" },
	  { name: "Scale", animationClass: "scale-animation" },
	  { name: "Rotate", animationClass: "rotate-animation" },
	  { name: "Translate", animationClass: "translate-animation" },
	  { name: "Opacity", animationClass: "opacity-animation" },
	];
  
	function applyAnimation() {
	  const selectedAnimation = animations.find((anim) => anim.name === animationType);
	  if (selectedAnimation) {
		animationType = selectedAnimation.animationClass;
	  }
	}
  </script>
  
  <div class="container">
	<h1>SVG Animator</h1>
	<div class="animation-controls">
	  <label for="animation-select">Select Animation:</label>
	  <select id="animation-select" bind:value={animationType} on:change={applyAnimation}>
		{#each animations as anim}
		  <option value={anim.name}>{anim.name}</option>
		{/each}
	  </select>
	</div>
	<div class="svg-container">
	  <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
		<rect width="100" height="100" fill="blue" class={animationType}></rect>
	  </svg>
	</div>
  </div>
  
  <style>
	.container {
	  text-align: center;
	  padding: 20px;
	}
  
	.animation-controls {
	  margin-bottom: 20px;
	}
  
	.svg-container {
	  display: inline-block;
	}
  
	rect {
	  transition: transform 2s, opacity 2s;
	}
  
	.scale-animation {
	  transform: scale(2);
	}
  
	.rotate-animation {
	  transform: rotate(45deg);
	}
  
	.translate-animation {
	  transform: translate(50px, 50px);
	}
  
	.opacity-animation {
	  opacity: 0.5;
	}
  </style>
  