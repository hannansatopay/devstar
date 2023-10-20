<script>
// @ts-nocheck

	import { flip } from 'svelte/animate'
	import { crossfade } from 'svelte/transition'
	import * as d3 from 'd3-color'
	
	const [send, receive] = crossfade({})
	
	export let colors
	export let title = null
	
	let selected = null
	
	function expand() {
		if (colors.length == 9) return
		colors = interpolate(colors, {color: null})
		colors = colors.map((item,i) => {
			if (item.color)
				return item

			item.color = mix(colors[i-1].color, colors[i+1].color).formatHsl()
			return item
		})
	}
	
	function interpolate(array, value) {
		return array.map(e => [{...value}, e]).flat().slice(1)
	}
	
	function toggle(item) {
		if (selected == item) {
			selected = null
			return
		}
		
		selected = item
	}
	
	function mix(colorA, colorB) {
		colorA = d3.hsl(colorA)
		colorB = d3.hsl(colorB)
			
		return d3.hsl(
			colorB.h + ((colorA.h - colorB.h)/2),
			colorA.s,
			colorB.l + ((colorA.l - colorB.l)/2)
		)
	}
</script>


{#if title}
	<h3 contenteditable bind:innerHTML={title}/>
{/if}

<div class="grid">
	{#each colors as item, n (item)}
		<div class="color" style="--color: {item.color}" animate:flip={{duration: 500}} in:send={{key: item}} out:receive={{key: item}} on:click={() => toggle(item)}/>
	{/each}

	<button on:click={expand}>
		<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
		</svg>
	</button>
</div>

{#if selected}
	<input bind:value={selected.color} on:keyup={() => colors = colors}/>
{/if}

<style>

	.grid {
		display: grid;
		gap: 0px;
		grid-template-columns: repeat(10, 60px);
		grid-template-rows: 60px;
	}
	
	.color {
		background: var(--color);
		border-radius: 0px;
		border: inset 1px #fff2;
		display: flex;
		justify-content:center;
		align-items: center;
		box-shadow: 3px 3px 10px #fff4;
	}
	
	button {
		background: none;
		border: none;
		cursor: pointer;
		margin: 2px;
		width: 24px;
		border-radius: 7px;
		color: #787575;
		transition: all 0.2s ease-in;
	}
	button:hover {
		background: #8f8c8c;
		color: black;
	}
	button svg {
		height: 24px;
	}
	
	:global(body) {
		color: #666;
	}
</style>

