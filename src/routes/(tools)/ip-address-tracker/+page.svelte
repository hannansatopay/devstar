<script>
	let ipAddress = '';
	let locationInfo = {};
  
	async function fetchLocation() {
	  try {
		const ipResponse = await fetch('https://api64.ipify.org?format=json');
		const ipData = await ipResponse.json();
		ipAddress = ipData.ip;
  
		const locationResponse = await fetch(`http://ip-api.com/json/${ipAddress}`);
		locationInfo = await locationResponse.json();
	  } catch (error) {
		console.error('Error fetching data:', error);
	  }
	}
  
	fetchLocation();
  </script>
  
  <div class="container">
	<h1 class="title">IP Address Tracker</h1>
	
	<div class="info-cards">
	  <div class="info-card">
		<div class="card">
		  <h2 class="font-normal text-gray-700 dark:text-gray-400">IP Tracker</h2>
		  <p class="value font-normal text-gray-700 dark:text-gray-400">{ipAddress}</p>
		</div>
	  </div>
	  
	  <div class="info-card">
		<div class="card">
		  <h2 class="font-normal text-gray-700 dark:text-gray-400">Location</h2>
		  <p class="value font-normal text-gray-700 dark:text-gray-400">{locationInfo.city}, {locationInfo.region}, {locationInfo.country}</p>
		</div>
	  </div>
	  
	  <div class="info-card">
		<div class="card">
		  <h2 class="font-normal text-gray-700 dark:text-gray-400">Latitude</h2>
		  <p class="value font-normal text-gray-700 dark:text-gray-400">{locationInfo.lat}</p>
		</div>
	  </div>
	  
	  <div class="info-card">
		<div class="card">
		  <h2 class="font-normal text-gray-700 dark:text-gray-400">Longitude</h2>
		  <p class="value font-normal text-gray-700 dark:text-gray-400">{locationInfo.lon}</p>
		</div>
	  </div>
	</div>
  </div>
  
  <style>
	.container {
	  display: flex;
	  flex-direction: column;
	  justify-content: center;
	  align-items: center;
	  min-height: 100vh;
	  background-color: #f5f5f5;
	  font-family: Arial, sans-serif;
	}
  
	.title {
	  font-size: 36px;
	  color: #333;
	  font-weight: bold;
	  margin-bottom: 200px;
	}
  
	.info-cards {
	  display: flex;
	  gap: 20px;
	}
  
	.info-card {
	  display: flex;
	  flex-direction: column;
	  gap: 12px;
	}
  
	.card {
	  display: flex;
	  flex-direction: column;
	  gap: 12px;
	  background-color: #ffffff;
	  border-radius: 10px;
	  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
	  padding: 16px;
	  width: 220px;
	}
  
	h2 {
	  font-size: 18px;
	  color: #333;
	  margin: 0;
	}
  
	.value {
	  font-size: 14px;
	  margin: 0;
	  color: #666;
	}
  </style>
  