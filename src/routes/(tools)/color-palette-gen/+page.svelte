

<script>
// @ts-nocheck

	import Palette from './Palette.svelte'
	import * as d3 from 'd3-color'
	
	let primaries = [
		{color: 'hsl(300, 100%, 90%)'},
		{color: 'hsl(300, 100%, 50%)'}
	]
	
	let accents = [
		{
			name: 'Blue',
			colors: [
				{color: 'hsl(250, 100%, 90%)'},
				{color: 'hsl(250, 100%, 50%)'}
			]
		}
	]
	
	let grays = [
		{color: 'hsl(0, 0%, 95%)'},
		{color: 'hsl(0, 0%, 40%)'}
	]
	
	function addAccent() {
		accents = [
			...accents,
			{
				name: 'Untitled',
				colors: [
					{color: 'hsl(0, 0%, 80%)'},
					{color: 'hsl(0, 0%, 0%)'}
				]
			}
		]
	}
</script>

<h1>COLOR PALETTE GENERATOR</h1>

<section>
	<h2>PRIMARY COLORS</h2>

	<Palette bind:colors={primaries}/>
</section>

<section>
	<h2>ACCENTS COLORS</h2>
	
	{#each accents as accent}
		<Palette bind:colors={accent.colors} bind:title={accent.name}/>
	{/each}
	
	<button on:click={addAccent}>
		Add another accent...
	</button>
</section>

<section>
	<h2>Neutral COLORS</h2>

	<Palette bind:colors={grays}/>
</section>
<!--
<section>
	<h2>
		CSS variables
	</h2>
	
	<pre>
{#each primaries as primary, n}--primary-color-{(n+1)*100}: {d3.color(primary.color).formatHsl()};<br>{/each}{#each accents as accent, n}{#each accent.colors as item, n}--{accent.name.toLowerCase()}-color-{(n+1)*100}: {d3.color(item.color).formatHsl()};<br>{/each}{/each}{#each grays as gray, n}--gray-color-{(n+1)*100}: {d3.color(gray.color).formatHsl()};<br>{/each}
	</pre>
</section>
-->

<style>
	:global(*) {
		box-sizing: border-box;
        margin-bottom: 0.25rem;
	}
	
	:global(body) {
		color: #666;
		padding: 3rem 10rem;
	}
	
	:global(h1) {
		font-weight: 800;
		font-size: 2rem;
		letter-spacing: 0px;
        word-spacing: 4px;
		margin-bottom: 4rem;
        color: rgb(249, 249, 250);
        text-align: center;
        background-color: rgb(46, 47, 62);
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
	}
	
	:global(h2) {
		margin-top: 4rem;
		font-weight: 600;
		font-size: 1.3rem;
        color: aliceblue;
	}
	:global(h3) {
		margin-top: 0.5rem;
		font-weight: 800;
		font-size: 0.9rem;
        color: rgb(224, 220, 215);
	}
	
	button {
		border: none;
		background: none;
		color: #787575;
		font-size: 0.8rem;
		cursor: pointer;
		border-radius: 6px;
		margin: 0;
		padding: 5px;
		margin-top: 10px;
	}
	button:hover {
		background: #8f8c8c;
        font-style: italic;
        color: black;
	}
	
	pre {
		background: #e1e1e1;
		border-radius: 5px;
		padding: 1.4rem 1rem;
		font-size: 0.8rem;
		margin-bottom: 2rem;
	}
</style>

