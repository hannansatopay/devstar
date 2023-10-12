<script>
	import { onMount } from 'svelte';
	import { Button, Dropdown, DropdownItem } from 'flowbite-svelte';
	import { ChevronDownSolid } from 'flowbite-svelte-icons';
	import * as am5 from '@amcharts/amcharts5?client';
	import * as am5xy from '@amcharts/amcharts5/xy?client';
	import am5themes_Animated from '@amcharts/amcharts5/themes/Animated?client';

    let chartdiv;
	let chart;
	let data = [];
	let chartWidth = '100%';

  	function handleResize() {
    	if (window.innerWidth > 768) {
      		chartWidth = '600px'; // Set a fixed width for larger screens
    	} else {
      		chartWidth = '100%'; // Use full width for smaller screens
    	}
  	}
	
	onMount(() => {
		var root = am5.Root.new(chartdiv);
		handleResize();
		// Set themes
		// https://www.amcharts.com/docs/v5/concepts/themes/
		root.setThemes([am5themes_Animated.new(root)]);

		// Create chart
		// https://www.amcharts.com/docs/v5/charts/xy-chart/
		chart = root.container.children.push(
			am5xy.XYChart.new(root, {
				panX: true,
				panY: true,
				wheelX: 'panX',
				wheelY: 'zoomX',
				pinchZoomX: true
			})
		);

		// Add cursor
		// https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
		var cursor = chart.set('cursor', am5xy.XYCursor.new(root, {}));
		cursor.lineY.set('visible', false);

		// Create axes
		// https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
		var xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
		xRenderer.labels.template.setAll({
			rotation: -90,
			centerY: am5.p50,
			centerX: am5.p100,
			paddingRight: 15
		});

		xRenderer.grid.template.setAll({
			location: 1
		});

		var xAxis = chart.xAxes.push(
			am5xy.CategoryAxis.new(root, {
				maxDeviation: 0.3,
				categoryField: 'country',
				renderer: xRenderer,
				tooltip: am5.Tooltip.new(root, {})
			})
		);

		var yAxis = chart.yAxes.push(
			am5xy.ValueAxis.new(root, {
				maxDeviation: 0.3,
				renderer: am5xy.AxisRendererY.new(root, {
					strokeOpacity: 0.1
				})
			})
		);

		// Create series
		// https://www.amcharts.com/docs/v5/charts/xy-chart/series/
		var series = chart.series.push(
			am5xy.ColumnSeries.new(root, {
				name: 'Series 1',
				xAxis: xAxis,
				yAxis: yAxis,
				valueYField: 'value',
				sequencedInterpolation: true,
				categoryXField: 'country',
				tooltip: am5.Tooltip.new(root, {
					labelText: '{valueY}'
				})
			})
		);

		series.columns.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5, strokeOpacity: 0 });
		series.columns.template.adapters.add('fill', function (fill, target) {
			return chart.get('colors').getIndex(series.columns.indexOf(target));
		});

		series.columns.template.adapters.add('stroke', function (stroke, target) {
			return chart.get('colors').getIndex(series.columns.indexOf(target));
		});

		xAxis.data.setAll(data);
		series.data.setAll(data);

		// Make stuff animate on load
		// https://www.amcharts.com/docs/v5/concepts/animations/
		series.appear(1000);
		chart.appear(1000, 100);
		updateChart();
		window.addEventListener('resize', handleResize);
	});
	function updateChart() {
    if (chart) {
      chart.xAxes.values[0].data.setAll(data);
      chart.series.values[0].data.setAll(data);
    }
  }

  function addData() {
    const XaxisInput = document.querySelector('#XaxisInput').value;
    const YaxisInput = parseFloat(document.querySelector('#YaxisInput').value);

    if (XaxisInput && !isNaN(YaxisInput)) {
      // Push the new data point into the data array
      data.push({ country: XaxisInput, value: YaxisInput });

      // Clear the input fields
      document.querySelector('#XaxisInput').value = '';
      document.querySelector('#YaxisInput').value = '';
    }
  }
	
</script>
<div class="flex justify-center items-center flex-col lg:flex-row py-4 px-12 border-2 rounded-lg shadow-sm shadow-blue-300">

  <!-- Input fields to capture user input for each data item -->

  <div class="bg-white lg:w-1/3">
    <Button class="mb-4 w-full bg-gray-600 hover:bg-gray-700 focus:ring-gray-400">Select Chart Type<ChevronDownSolid class="w-3 h-3 ml-2 text-white dark:text-white" /></Button>
    <Dropdown>
      <DropdownItem>Bar Chart</DropdownItem>
      <DropdownItem>Pie Chart</DropdownItem>
      <DropdownItem>Line Chart</DropdownItem>
      <DropdownItem>More coming Soon</DropdownItem>
    </Dropdown>

    <div class="bg-white">
      <input
        type="text"
        id="XaxisInput"
        class="mb-2 rounded-lg border-gray-300 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
        placeholder="Value on x-axis"
      />
      <input
        type="number"
        id="YaxisInput"
        class="rounded-lg border-gray-300 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500"
        placeholder="Value on y-axis"
        min="0"
        step="1"
      />
    </div>

    <div class="button-container">
		<button
      class="mt-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      on:click={addData}
    >
      Add Data
    </button>
    <button
      class="mt-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
      on:click={updateChart}
    >
      Update Data
    </button>
	</div>
  </div>

  <div class="chart_container lg:w-1/3">
    <div id="chartdiv" bind:this={chartdiv} style="width: {chartWidth}; height: 400px; background-color: rgb(243, 243, 243); border-radius: 5px;"></div>
  </div>
</div>

<style>
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
  }

  .chart_container {
    display: flex;
    padding: 20px;
  }

  @media (max-width: 768px) {
    .chart_container {
      flex-direction: column;
    }
	.button-container{
		justify-content: center;
	}
    #chartdiv {
      width: 100%;
    }
  }
</style>
