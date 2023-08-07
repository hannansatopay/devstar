<script>
	let startDate = "";
	let endDate = "";
  
	let age = {
	  years: 0,
	  months: 0,
	  weeks: 0,
	  days: 0,
	  hours: 0,
	  minutes: 0,
	  seconds: 0
	};
  
	function calculateAge() {
	  const startDateTime = new Date(startDate);
	  const endDateTime = new Date(endDate);
  
	  const diffMillis = endDateTime - startDateTime;
	  const diffSeconds = Math.floor(diffMillis / 1000);
  
	  age.years = Math.floor(diffSeconds / (365 * 24 * 60 * 60));
	  age.months = Math.floor((diffSeconds % (365 * 24 * 60 * 60)) / (30 * 24 * 60 * 60));
	  age.weeks = Math.floor((diffSeconds % (30 * 24 * 60 * 60)) / (7 * 24 * 60 * 60));
	  age.days = Math.floor((diffSeconds % (7 * 24 * 60 * 60)) / (24 * 60 * 60));
	  age.hours = Math.floor((diffSeconds % (24 * 60 * 60)) / (60 * 60));
	  age.minutes = Math.floor((diffSeconds % (60 * 60)) / 60);
	  age.seconds = diffSeconds % 60;
	  
	  if (age.hours < 0) age.hours += 24; // Adjust for negative hours
	  if (age.minutes < 0) age.minutes += 60; // Adjust for negative minutes
	  if (age.seconds < 0) age.seconds += 60; // Adjust for negative seconds
	}
  </script>
  
  <main>
	<h1>Stylish Age Calculator</h1>
  
	<div class="input-container">
	  <label for="startDate">Start Date:</label>
	  <input type="date" id="startDate" bind:value={startDate} />
	</div>
  
	<div class="input-container">
	  <label for="endDate">End Date:</label>
	  <input type="date" id="endDate" bind:value={endDate} />
	</div>
  
	<button on:click={calculateAge}>Calculate Age</button>
  
	{#if age.years !== 0 || age.months !== 0 || age.weeks !== 0 || age.days !== 0 || age.hours !== 0 || age.minutes !== 0 || age.seconds !== 0}
	  <div class="result-container">
		<h2>Age/Interval:</h2>
		<p>
		  {age.years} years, {age.months} months, {age.weeks} weeks,
		  {age.days} days, {age.hours} hours, {age.minutes} minutes,
		  {age.seconds} seconds
		</p>
	  </div>
	{/if}
  </main>
  
  <style>
	main {
	  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
	  text-align: center;
	  padding: 2rem;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	}
  
	h1 {
	  margin-bottom: 1rem;
	  color: #333;
	  font-size: 2.5rem;
	}
  
	.input-container {
	  display: flex;
	  flex-direction: column;
	  align-items: flex-start;
	  margin-bottom: 1.5rem;
	}
  
	label {
	  margin-bottom: 0.5rem;
	  font-size: 1.2rem;
	  color: #555;
	}
  
	input {
	  padding: 0.5rem;
	  border: 1px solid #ccc;
	  border-radius: 4px;
	  font-size: 1rem;
	  color: #333;
	}
  
	button {
	  padding: 0.5rem 1.5rem;
	  background-color: #007bff;
	  color: #fff;
	  border: none;
	  border-radius: 4px;
	  cursor: pointer;
	  font-size: 1.2rem;
	  transition: background-color 0.3s ease-in-out;
	}
  
	button:hover {
	  background-color: #0056b3;
	}
  
	.result-container {
	  margin-top: 2rem;
	  background-color: #f8f9fa;
	  border: 1px solid #ccc;
	  padding: 1.5rem;
	  border-radius: 4px;
	  width: 100%;
	  max-width: 400px;
	  box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.1);
	}
  
	h2 {
	  margin-bottom: 1rem;
	  color: #333;
	  font-size: 1.8rem;
	}
  
	p {
	  margin: 0.5rem 0;
	  font-size: 1.2rem;
	  color: #555;
	}
  </style>
  