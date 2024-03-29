
<script>
	import { onMount } from 'svelte';
	import { Button, Dropdown, DropdownItem, P } from 'flowbite-svelte';
	import { ChevronDownSolid } from 'flowbite-svelte-icons';
	import * as am5 from '@amcharts/amcharts5?client';
	import * as am5xy from '@amcharts/amcharts5/xy?client';
	import am5themes_Animated from '@amcharts/amcharts5/themes/Animated?client';
	import * as am5plugins_exporting from "@amcharts/amcharts5/plugins/exporting?client";


	let chartdiv;
	let chart;
	let data = [];
	let chartWidth = '100%';
	let exportFun;

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

		let exporting = am5plugins_exporting.Exporting.new(root, {
		});

		exportFun = exporting;

	});

	function downloadChart(){
			exportFun.download("png");
		}

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

			document.querySelector('#last_data_added').style.display = 'flex';
			document.querySelector('#Xaxis_value').innerHTML = XaxisInput;
			document.querySelector('#Yaxis_value').innerHTML = YaxisInput;

			// Clear the input fields
			document.querySelector('#XaxisInput').value = '';
			document.querySelector('#YaxisInput').value = '';
		}
	}

	function viewAllData(){

		if(document.querySelector('#alldata').style.display == "none"){
			document.querySelector('#alldata').style.display = "block";
			document.querySelector('#view_all_btn').innerText = "close";
		}else{
			document.querySelector('#alldata').style.display = "none";
			document.querySelector('#view_all_btn').innerText = "view all";
		}
		
		let i =1;
		let sum = `<tr class="text-xs"> 
				<td class="p-1 mx-2 w-2/4 text-gray-800 bg-gray-200 border-b-2 border-gray-500 "> srno </td> 
				<td class="p-1 mx-2 w-2/4 text-gray-800 bg-gray-200 border-b-2 border-gray-500 "> x-axis </td> 
				<td class="p-1 mx-2 w-2/4 text-gray-800 bg-gray-200 border-b-2 border-gray-500 "> y-axis </td>  
				</tr>`;

		data.forEach(e => {
			
			sum += `<tr class="py-1 text-xs px-2  "> 
				<td class="p-2 m-2 text-violet-700 bg-violet-200 "> ${i} </td> 
				<td class="p-2 m-2 text-green-700 bg-green-200 "> ${ e.country} </td> 
				<td class="p-2 m-2 text-blue-700 bg-blue-200 "> ${ e.value} </td> 
				<tr>`;

			i += 1;
			
		});

		document.querySelector('#alldata_table').innerHTML= sum;
}


</script>

<div
	class="main-container mb-4 flex justify-center items-center flex-col lg:flex-row py-4 px-12 border-2 rounded-lg shadow-sm shadow-blue-300"
>
	<!-- Input fields to capture user input for each data item -->

	<div class="min-w-full lg:min-w-0 bg-transparent lg:w-1/3">
		<Button class="mb-4 w-3/4  bg-gray-600 hover:bg-gray-700 focus:ring-gray-400"
			>Select Chart Type<ChevronDownSolid class="w-3 h-3 ml-2 text-white dark:text-white" /></Button
		>
		<Dropdown>
			<DropdownItem>Bar Chart</DropdownItem>
		</Dropdown>

		<div id="input-div">
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
				class="mt-4  bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
				on:click={addData}
			>
				Add Data
			</button>
			<button
				class="mt-4  bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
				on:click={updateChart}
			>
				Update Chart
			</button>
			<button
				class="mt-4 text-xs bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
				on:click={downloadChart}
			>
				Download ⬇️
			</button>
		</div>

		<div style="display: none;" id="last_data_added" class="py-2">
			<p class="text-sm font-bold py-2 dark:text-white">
				Added Data 
				<span class="px-2 py-1 text-green-700 bg-green-200 rounded-md" id="Xaxis_value"/>
				<span class="py-1 px-2 text-green-700 bg-green-200 rounded-md" id="Yaxis_value" />
				<button on:click={viewAllData} id="view_all_btn" class="btn py-1 px-2 text-blue-700 bg-blue-200 rounded-md" >View all</button>
			</p>

		
		</div>

		<div style="display: none;" id="alldata" class="w-3/4 h-32 bg-gray-100 mt-2 rounded-sm py-4 overflow-y-auto">
			<table id="alldata_table" class="w-full overflow-y-auto">
				
			</table>
		</div>
	</div>

	<div class="chart_container lg:w-1/3">
		<div
			id="chartdiv"
			bind:this={chartdiv}
			style="width: {chartWidth}; height: 400px; background-color: rgb(243, 243, 243); border-radius: 10px;"
		/>
	</div>
</div>

<style>
	body {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif,
			'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
	}

	.chart_container {
		display: flex;
		padding: 20px;
		width: 500px;
	}

	@media (max-width: 768px) {
		.main-container {
			min-width: 350px;
		}
		.chart_container {
			flex-direction: column;
			justify-content: center;
			align-items: center;
			width: 350px;
			height: 300px;
		}
		.button-container {
			justify-content: center;
		}
		#chartdiv {
			width: 100%;
		}

		
	}
</style>
