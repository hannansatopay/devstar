<script lang="ts">
	import { onMount } from 'svelte';
	let canvasElement: HTMLCanvasElement;
	let stripElement: HTMLCanvasElement;
	export let value = '';

function hsvToRgb(h, s, v) {
  let c = v * s;
  let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  let m = v - c;
  let r, g, b;

  if (h >= 0 && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (h >= 60 && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (h >= 120 && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (h >= 180 && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (h >= 240 && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255)
  };
}

	onMount(() => {
		// get canvas context
		let ctx = canvasElement.getContext('2d');
		let cts = stripElement.getContext('2d');
		var cursorX = 0,
			cursorY = 0;
		var stripcursorX = 0,
			stripcursorY = 0;

		const width = canvasElement.width;
		const height = canvasElement.height;

		// console.log(width,height);

		const stripWidth = stripElement.width;
		const stripHeight = stripElement.height;

		// Default
		let stripColor = 'rgb(30,106,54)';

		function drawGradient() {
			ctx.fillStyle = stripColor;
			ctx.fillRect(0, 0, width, height);
			var grdWhite = ctx.createLinearGradient(0, 0, width, 0);
			grdWhite.addColorStop(0, 'rgb(255,255,255)');
			grdWhite.addColorStop(1, 'transparent');
			ctx.fillStyle = grdWhite;
			ctx.fillRect(0, 0, width, height);
			var grdBlack = ctx.createLinearGradient(0, 0, 0, height);
			grdBlack.addColorStop(0, 'transparent');
			grdBlack.addColorStop(1, 'rgb(0,0,0)');
			ctx.fillStyle = grdBlack;
			ctx.fillRect(0, 0, width, height);
		}

		function drawStrip() {
			cts.rect(0, 0, stripElement.width, stripElement.height);
			var grd1 = cts.createLinearGradient(0, 0, stripElement.width, 0);
			grd1.addColorStop(0, 'rgb(255, 0, 0)'); // red
			grd1.addColorStop(0.17, 'rgb(255, 255, 0)'); // yellow
			grd1.addColorStop(0.34, 'rgb(0, 255, 0)'); // green
			grd1.addColorStop(0.51, 'rgb(0, 255, 255)'); // aqua
			grd1.addColorStop(0.68, 'rgb(0, 0, 255)'); // blue
			grd1.addColorStop(0.85, 'rgb(255, 0, 255)'); // magenta
			grd1.addColorStop(1, 'rgb(255, 0, 0)'); // red
			cts.fillStyle = grd1;
			cts.fill();
		}

		function drawCursor() {
			ctx.beginPath();
			ctx.arc(cursorX, cursorY, 10, 0, 2 * Math.PI, false);
			ctx.fillStyle = 'transparent';
			ctx.fill();
			ctx.lineWidth = 2;
			ctx.strokeStyle = 'white';
			ctx.stroke();
		}

		function drawStripCursor() {
			cts.beginPath();
			cts.arc(stripcursorX, 10, 10, 0, 2 * Math.PI, false);
			cts.fillStyle = 'transparent';
			cts.fill();
			cts.lineWidth = 2;
			cts.strokeStyle = 'white';
			cts.stroke();
		}

		canvasElement.addEventListener(
			'click',
			function (event) {
				const rect = canvasElement.getBoundingClientRect();
				const x = event.clientX - rect.left;
				const y = event.clientY - rect.top;
				// console.log(x,y);
				
				generateColor(x, y);
			},
			false
		);

		function generateColor(x, y) {
			ctx.clearRect(0, 0, width, height);
			drawGradient();
			cursorX = x;
			cursorY = y;
			drawCursor();
			let h = Math.round((stripcursorX / 500) * 360);
			let s = Math.round((cursorX / 500) * 100);
			let v = 100 - Math.round((cursorY / 150) * 100);
			value = 'rgb(' + hsvToRgb(h,s/100,v/100).r + ',' + hsvToRgb(h,s/100,v/100).g + ',' + hsvToRgb(h,s/100,v/100).b + ')';
		}

		stripElement.addEventListener('click', function (event) {
			// Get the current mouse position
			const rect = stripElement.getBoundingClientRect();
			const x = event.clientX - rect.left;
			const y = event.clientY - rect.top;

			// Get the color at the clicked position
			const imageData = cts.getImageData(x, y, 1, 1);
			const pixel = imageData.data;
			const color = `rgb(${pixel[0]}, ${pixel[1]}, ${pixel[2]})`;
			stripColor = color;
			stripcursorX = x;
			stripcursorY = y;
			drawStrip();
			drawStripCursor();
			generateColor(cursorX, cursorY);
		});

		drawStrip();
		drawGradient();
	});
</script>

<canvas bind:this={canvasElement} width="500" />
<canvas bind:this={stripElement} width="500" height="20" />