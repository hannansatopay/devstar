<script>
  const colors = ['rgba(255, 99, 132,0.9)','rgba(54, 162, 235,0.9)','rgba(255, 205, 86,0.9)','rgba(155, 99, 132,0.9)','rgba(94, 162, 235,0.9)',
            'rgba(155, 205, 86,0.9)','rgba(255, 255, 132,0.9)','rgba(54, 54, 235,0.9)','rgba(255, 255, 86,0.9)','rgba(155, 155, 132,0.9)',
            'rgba(94, 94, 235,0.9)','rgba(155, 155, 86,0.9)','rgba(255, 99, 99,0.9)','rgba(54, 162, 54,0.9)','rgba(255, 205, 255,0.9)',
            'rgba(155, 99, 152,0.9)','rgba(94, 162, 94,0.9)','rgba(155, 205, 156,0.9)','rgba(255, 255, 232,0.9)'
  ]
  import { onMount, onDestroy } from 'svelte';
  import { saveAs } from 'file-saver';
  import { Chart } from 'chart.js/auto';
  import Intro from '$lib/Intro.svelte';

  export let data;
  
  let file = null;
  let fileType = 'csv';
  let chartType = 'bar';
  let chart;
  let chartData = getRandomData();
  let xColumn = ''; // Selected column for X-axis
  let yColumn = ''; // Selected column for Y-axis
  let fileColumns = []; // Store file columns/headers

  const supportedFileTypes = ['csv', 'json'];
  const supportedChartTypes = ['bar', 'line', 'pie', 'doughnut'];
  
  onMount(() => {
    const ctx = document.getElementById('chart').getContext('2d');
    createChart(chartType, chartData, ctx);
  });

  onDestroy(() => {
    if (chart) {
      chart.destroy(); // Destroy the existing chart before the component is destroyed
    }
  });

  function updateChart() {

    if (fileType === 'csv') {
      parseCSV();
    } else if (fileType === 'json') {
      // Parse JSON
      try {
        chartData = JSON.parse(file);
      } catch (error) {
        console.error('Invalid JSON data:', error);
        return;
      }
    }

    // Clear and render the chart using chartData
    if (chart) {
      chart.destroy(); // Destroy the existing chart
    }
    const ctx = document.getElementById('chart').getContext('2d');
    createChart(chartType, chartData, ctx);
  }
  function getRandomData() {
    // Generate random data for demonstration
    const labels = ['Label 1', 'Label 2', 'Label 3', 'Label 4', 'Label 5'];
    const data = labels.map(() => Math.floor(Math.random() * 100));
    return {
      labels: labels,
      datasets: [
        {
          label: 'Default Graphs For Visualization',
          data: data,
          backgroundColor: colors,
          hoverOffset: 4,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        },
      ],
    };
  }

  function createChart(type, data, ctx) {
  if (chart) {
    chart.destroy();
  }
  chart = new Chart(ctx, {
    type: type,
    data: data,
    options: {
      responsive: true,
      scales: {
        x: {
          ticks: {
            font: {
              size: 16 
            }
          }
        },
        y: {
          ticks: {
            font: {
              size: 16
            }
          }
        }
      }
    },
  });
}

  async function parseCSV() {
    if (!xColumn || !yColumn) {
      console.error('X and Y columns must be selected.');
      return;
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvContent = event.target.result;
        const rows = csvContent.split('\n');
        const data = [];
        
        // Assuming the first row contains column names
        const columns = rows[0].split(',');
        const xColumnIndex = columns.indexOf(xColumn);
        const yColumnIndex = columns.indexOf(yColumn);

        if (xColumnIndex === -1 || yColumnIndex === -1) {
          console.error('X and Y columns not found in the file.');
          return;
        }

        for (let i = 1; i < rows.length; i++) {
          const row = rows[i].split(',');
          data.push({
            x: row[xColumnIndex],
            y: row[yColumnIndex],
          });
        }

        // Update chartData directly
        chartData = {
          labels: data.map(row => row.x),
          datasets: [
            {
              label: 'Data',
              data: data.map(row => row.y),
              backgroundColor: colors,
              hoverOffset: 4,
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            },
          ],
        };

        // Create the chart
        const ctx = document.getElementById('chart').getContext('2d');
        createChart(chartType, chartData, ctx);
      };
      reader.readAsText(file);
    }
  }

  function downloadChart() {
    const chartDataURL = document.getElementById('chart').toDataURL('image/png');
    saveAs(chartDataURL, 'chart.png');
  }

  // Function to read the columns/headers from the uploaded file
  function readFileColumns() {
    if (fileType === 'csv') {
      const reader = new FileReader();
      reader.onload = (event) => {
        const csvContent = event.target.result;
        const rows = csvContent.split('\n');
        if (rows.length > 0) {
          fileColumns = rows[0].split(','); // Assuming the first row contains column names
        }
      };
      reader.readAsText(file);
    } else if (fileType === 'json') {
      // Parse JSON
      try {
        const jsonData = JSON.parse(file);
        fileColumns = Object.keys(jsonData);
      } catch (error) {
        console.error('Invalid JSON data:', error);
      }
    }
  }

  // Event handler for file input change event
  function handleFileChange(event) {
    file = event.target.files[0];
    readFileColumns();

    const uploadIcon = document.getElementById('uploadIcon');
    if(file){
      uploadIcon.style.color = 'greenyellow';
    }
    else{
      uploadIcon.style.color = 'text-gray-500';
    }
  }
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
  <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
    <div class="card items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-12 overflow-hidden rounded-lg shadow-lg">
      <div class="p-8 col-span-5 flex h-full flex-col justify-between">
        <div class="file-container mb-4 flex flex-col items-center space-y-2">
          <i id="uploadIcon" class="icon-files text-gray-500 dark:text-gray-400 text-5xl cursor-pointer" on:click={() => fileInput.click()}></i>
          <legend for="fileInput" class="text-xm" style="color: #7b7b7b;">Upload File</legend>
          <input type="file" id="fileInput" accept=".csv, .json" class="hidden" on:change={handleFileChange}>
          <legend class="text-xm" style="color: #7b7b7b;">File Type</legend>
          <div class="flex">
            {#each supportedFileTypes as type}
            <input type="radio" id={type} name="fileType" value={type} class="text-xm appearance-none w-5 h-5 border border-gray-300 dark:border-gray-700 rounded-full mx-2">
            <legend for={type} class="text-xm" style="color: #7b7b7b;">{type}</legend>
            {/each}
          </div>
        </div>
        <legend for="chartType" class="text-xs" style="color: #7b7b7b;">Chart Type</legend>
        <select id="chartType" bind:value={chartType} class="text-xm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded p-2 focus:ring-2 focus:ring-blue-400 focus:outline-none">
          <option value="" disabled selected hidden>Chart Type</option>
          {#each supportedChartTypes as type}
          <option value={type} class="bg-gray-100 dark:bg-gray-800">{type}</option>
          {/each}
        </select>
        <div class="flex space-x-4 mt-6">
          <div class="w-1/2">
            <select id="xColumn" bind:value={xColumn} class="text-xm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded p-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none">
              <option value="" disabled selected hidden>X-Axis Column</option>
              {#each fileColumns as column}
              <option value={column} class="text-xm" style="color: #7b7b7b;">{column}</option>
              {/each}
            </select>
          </div>
          <div class="w-1/2">
            <select id="yColumn" bind:value={yColumn} class="text-xm bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400 border border-gray-300 dark:border-gray-700 rounded p-2 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none">
              <option value="" disabled selected hidden>Y-Axis Column</option>
              {#each fileColumns as column}
              <option value={column} class="text-xm" style="color: #7b7b7b;">{column}</option>
              {/each}
            </select>
          </div>
        </div>
        <div class="flex space-x-4 mt-6">
          <button on:click={updateChart} class="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xm py-2.5 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none">
            Generate Chart
          </button>
          <button on:click={downloadChart} class="w-1/2 bg-green-600 hover:bg-green-700 text-white font-medium text-xm py-2.5 rounded focus:ring-2 focus:ring-green-400 focus:outline-none">
            Download Chart
          </button>
        </div>
      </div>
      <div class="p-8 h-full flex rounded-lg relative justify-center items-center col-span-7 bg-gray-100">
        <div class="canvas-container w-full">
          <canvas id="chart" class="w-full h-full"></canvas>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .canvas-container {
    position: relative;
  }
  .card {
    box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
  }

  i:hover{
    color: rgb(35, 219, 158);
  }

  :is(.dark .card) {
    box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
  }
</style>
