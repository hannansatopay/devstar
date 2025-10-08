<script>
  import { onMount } from 'svelte';
  import { timeZoneList } from './locale.js';

  export let city = '';
  export let country = '';
  export let timezone = '';

  let canvas;
  let selectedTimezone = timezone;
  let currentTime = '';

  onMount(() => {
      updateClock();
      const interval = setInterval(updateClock, 1000);
      return () => clearInterval(interval);
  });

  function updateClock() {
      const date = new Date(new Date().toLocaleString("en-US", { timeZone: selectedTimezone }));
      const second = date.getSeconds();
      const minute = date.getMinutes();
      const hour = date.getHours();
      currentTime = date.toLocaleTimeString('en-US', { hour12: true });

      const ctx = canvas.getContext('2d');
      const radius = canvas.height / 2;
      ctx.translate(radius, radius);
      drawFace(ctx, radius);
      drawNumbers(ctx, radius);
      drawTime(ctx, radius, hour, minute, second);
      ctx.translate(-radius, -radius);
  }

  function drawFace(ctx, radius) {
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.fillStyle = 'black';
      ctx.fill();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(0, 0, radius * 0.1, 0, 2 * Math.PI);
      ctx.fillStyle = '#333';
      ctx.fill();
  }

  function drawNumbers(ctx, radius) {
      ctx.font = `${radius * 0.18}px arial`;
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillStyle = 'white';
      for (let num = 1; num <= 12; num++) {
          const ang = (num * Math.PI) / 6;
          ctx.rotate(ang);
          ctx.translate(0, -radius * 0.85);
          ctx.rotate(-ang);
          ctx.fillText(num.toString(), 0, 0);
          ctx.rotate(ang);
          ctx.translate(0, radius * 0.85);
          ctx.rotate(-ang);
      }
  }

  function drawTime(ctx, radius, hour, minute, second) {
      // Hour
      const hourAngle = ((hour % 12) * Math.PI) / 6 + (minute * Math.PI) / (6 * 60) + (second * Math.PI) / (360 * 60);
      drawHand(ctx, hourAngle, radius * 0.5, radius * 0.07);

      // Minute
      const minuteAngle = (minute * Math.PI) / 30 + (second * Math.PI) / (30 * 60);
      drawHand(ctx, minuteAngle, radius * 0.8, radius * 0.05);

      // Second
      const secondAngle = (second * Math.PI) / 30;
      drawHand(ctx, secondAngle, radius * 0.9, radius * 0.02);
  }

  function drawHand(ctx, pos, length, width) {
      ctx.beginPath();
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.strokeStyle = 'white';
      ctx.moveTo(0, 0);
      ctx.rotate(pos);
      ctx.lineTo(0, -length);
      ctx.stroke();
      ctx.rotate(-pos);
  }
</script>

<div class="analog-clock-container p-4 w-full text-2xl">
  <canvas bind:this={canvas} width="200" height="200"></canvas>
  <p class="show-date">{currentTime}</p>
  <p class="country-name text-md mt-2">{city}, {country}</p>
</div>

<style>
  .analog-clock-container {
      text-align: center;
  }
  canvas {
      background: white;
      border-radius: 50%;
      border: 5px solid #000;
      padding: 5px;
  }
</style>