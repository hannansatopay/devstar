<script>
	import { Textarea, Label, Button } from 'flowbite-svelte';

	let pathData = ' ';
	let svgPath;
	let viewBox = '0 0 100 100';
	const padding = 10;

	const commonPaths = {
		'Line': 'M 10 10 L 90 90',
		'Circle': 'M 50 10 A 40 40 0 1 1 49.999 10',
		'Square': 'M10 10 H 90 V 90 H 10 L 10 10',
		'Rectangle': 'M10 10 H 120 V 90 H 10 L 10 10',
		'Triangle': 'M 10 80 L 50 10 L 90 80 Z',
		'Ellipse': 'M 50 20 A 30 15 0 1 0 49.999 20',
		'Pentagon': 'M50 15 L72 38 L60 70 L40 70 L28 38 Z',
		'Hexagon': 'M30 10 L50 10 L60 30 L50 50 L30 50 L20 30 Z',
		'Heptagon': 'M 90 50 L 74.94 81.27 L 41.10 89.00 L 13.96 67.36 L 13.96 32.64 L 41.10 11.00 L 74.94 18.73 L 90.00 50.00',
		'Octagon': 'M30 10 L70 10 L90 30 L90 70 L70 90 L30 90 L10 70 L10 30 Z',
		'Star': 'M50 15 L61 33 L80 35 L67 50 L70 68 L50 60 L30 68 L33 50 L20 35 L39 33 Z',
		'Heart': 'M140 20C73 20 20 74 20 140c0 135 136 170 228 303 88-132 229-173 229-303 0-66-54-120-120-120-48 0-90 28-109 69-19-41-60-69-108-69z',
		'Diamond': 'M50 10 L80 50 L50 90 L20 50 Z',
		'Arrow': 'M10 40 L50 10 L90 40 L70 40 L70 90 L30 90 L30 40 Z',
		'Parallelogram': 'M30 10 L80 10 L60 90 L10 90 Z',
		'Trapezoid': 'M20 50 L80 50 L60 10 L40 10 Z',
		'Cross': 'M40 10 L60 10 L60 40 L90 40 L90 60 L60 60 L60 90 L40 90 L40 60 L10 60 L10 40 L40 40 Z',
		'Cylinder': 'M30 10 A20 10 0 1 0 69.999 10 L70 90 A20 10 0 1 0 29.999 90 Z',
		'Cone': 'M50 10 L90 90 A40 20 0 1 1 10 90 Z',
		'Prism': 'M20 20 L80 20 L80 80 L20 80 Z M20 20 L50 10 L80 20 M80 20 L50 10 L50 70 L80 80 M20 80 L50 70',
		'Wave': 'M10 50 C20 10, 40 90, 50 50 S80 10, 90 50',
		'Zigzag': 'M10 10 L30 30 L50 10 L70 30 L90 10',
		'Infinity': 'M 128 64 c 0 -23.201 -15.299 -40 -32 -40 s -32 16.799 -32 40 s 15.299 40 32 40 s 32 -16.799 32 -40 z m -64 0 c 0 23.201 -15.299 40 -32 40 s -32 -16.799 -32 -40 s 15.299 -40 32 -40 s 32 16.799 32 40 z',
		'Moon': 'M 50 25 A 30 30 0 0 0 50 75 A 20 20 0 0 1 50 25 Z',
	};

	function visualizePath() {		
		svgPath.setAttribute('d', pathData);
		const bbox = svgPath.getBBox();
		viewBox = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`;
	}

	function setCommonPath(path) {
		pathData = path;
		visualizePath();
	}

</script>

<div class="card mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 gap-8 overflow-hidden rounded-lg p-8">
	<div>
		<Label for="text" class="mb-2">Enter SVG Path Data</Label>
		<Textarea bind:value={pathData} on:input={visualizePath} id="text" placeholder="Enter SVG path data here..." rows="3" class="resize-none"/>
		<div class="mt-6 grid grid-cols-4 gap-1">
			{#each Object.keys(commonPaths) as path}
				<Button class="h-16" color="light" on:click={() => setCommonPath(commonPaths[path])}>{path}</Button>
			{/each}
		</div>
	</div>
	<div id="svgContainer" class="card rounded-lg bg-gray-200 dark:bg-gray-800 overflow-auto">
		<svg {viewBox} preserveAspectRatio="xMidYMid meet">
			<path bind:this={svgPath} fill="none" stroke="gray" stroke-width="1"></path>
		</svg>
	</div>
</div>
