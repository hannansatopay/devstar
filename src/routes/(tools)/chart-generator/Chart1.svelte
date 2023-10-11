

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



<div class="flex justify-center items-center p-2 ">
	<!-- Chart container -->
	<div class="chart_container">
		<div id="chartdiv" bind:this={chartdiv}/>
	</div>
	
	<!-- Input fields to capture user input for each data item -->

	<div class="bg-white">
		{#each data as item (item.country)}
		  <div>
			<input type="text" class=" mb-2 rounded-lg border-gray-300 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500" bind:value={item.country} placeholder="Country">
			<input type="number" class="rounded-lg border-gray-300 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:border-blue-500" bind:value={item.value} placeholder="Value" min="0" step="1" />
		  </div>
		{/each}
  
			<!-- Button to trigger chart update -->
			<button class="mt-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow" 
			>Add Data</button>
			<!-- Button to trigger chart update -->
			<button class="mt-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow" 
			>Download</button>
			<!-- Button to trigger chart update -->
			<button class="mt-4 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow" 
			on:click={updateChart}>Update Data</button>

	</div>
  
	
</div>




  
  <style>
	body {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
			'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
	}

	.chart_container{
		padding: 20px;
	}

	#chartdiv {
		width: 600px;
		height: 400px;
		background-color: rgb(243, 243, 243);
		border-radius: 5px;
	}
</style>