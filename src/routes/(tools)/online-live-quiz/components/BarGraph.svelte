<script>
    import { onMount } from "svelte";
    import Chart from "chart.js/auto";
    import ChartDataLabels from 'chartjs-plugin-datalabels';
  
    Chart.register(ChartDataLabels);
  
    export let data = [];
    let chartCanvas;
  
    onMount(() => {
      const ctx = chartCanvas.getContext("2d");
      const usernames = data.map((d) => d.username);
      const scores = data.map((d) => d.score);
      const colors = data.map(
        (_, i) => `hsl(${(i * 360) / data.length}, 100%, 50%)`
      );
  
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: usernames,
          datasets: [
            {
              label: "Scores",
              data: scores,
              backgroundColor: colors,
            },
          ],
        },
        options: {
          plugins: {
            datalabels: {
              color: '#000',
              anchor: 'end',
              align: 'top',
              formatter: (value) => value,
              font: {
                weight: 'bold',
                size: 14
              },
              padding: {
                top: 5,
                bottom: 5
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
          responsive: true,
        },
      });
    });
  </script>
  
  <canvas bind:this={chartCanvas}></canvas>
  
  <style>
    canvas {
      max-width: 100%;
      height: auto;
    }
  </style>