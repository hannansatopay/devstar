<div id="chartdiv" bind:this={chartdiv}/>

<script>
	import { onMount } from 'svelte';
	import * as am5 from '@amcharts/amcharts5?client';
	import * as am5xy from '@amcharts/amcharts5/xy?client';
	import am5themes_Animated from '@amcharts/amcharts5/themes/Animated?client';

    let chartdiv;
	let chart;
	let data = [
			{
				country: 'USA',
				value: 2025
			},
			{
				country: 'China',
				value: 1882
			},
			{
				country: 'Japan',
				value: 1809
			},
			{
				country: 'Germany',
				value: 1322
			},
			{
				country: 'UK',
				value: 1122
			},
			{
				country: 'France',
				value: 1114
			}
			// {
			// 	country: 'India',
			// 	value: 984
			// },
			// {
			// 	country: 'Spain',
			// 	value: 711
			// },
			// {
			// 	country: 'Netherlands',
			// 	value: 665
			// },
			// {
			// 	country: 'South Korea',
			// 	value: 443
			// },
			// {
			// 	country: 'Canada',
			// 	value: 441
			// }
	];
	
	onMount(() => {
		var root = am5.Root.new(chartdiv);

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
	});
	function updateChart() {
    if (chart) {
      chart.xAxes.values[0].data.setAll(data);
      chart.series.values[0].data.setAll(data);
    }
  }
</script>
<div>
	<!-- Input fields to capture user input for each data item -->
	{#each data as item (item.country)}
	  <div>
		<input type="text" class="rounded-lg border-gray-300 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500" bind:value={item.country} placeholder="Country">
		<input type="number" class="rounded-lg border-gray-300 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500" bind:value={item.value} placeholder="Value" min="0" step="1" />
	  </div>
	{/each}
  
	<!-- Button to trigger chart update -->
	<div class="container"><button on:click={updateChart}>Update Chart</button></div>
  
	<!-- Chart container -->
	<div id={chartdiv}></div>
  </div>

<!-- <div class="container">
	<form>
		<div class="mb-6">
		  <label for="val1" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Value on x-axis</label>
		  <input type="val1" id="val1" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="X-axis input" required>
		</div>
		<div class="mb-6">
		  <label for="password" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Value on y-axis</label>
		  <input type="password" id="password" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Y-axis input" required>
		</div>
	
		<button type="submit" class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">Submit</button>
	</form>
</div> -->
  
  <style>
	body {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
			'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
	}

	#chartdiv {
        padding: 70 70 70 70px;
		width: 100%;
		height: 400px;
	}
</style>