<script>
	let principal = 0;       
	let rate = 0;            
	let time = 0;            
	let simpleInterest = 0;  
  
	function calculateSimpleInterest() {
	  simpleInterest = (principal * rate * time) / 100;
	}
  </script>
  
  <main>
	<h1 class="title">Simple Interest Calculator (INR)</h1>
  
	<div class="input-group">
	  <label for="principal" class="label">Principal Amount (INR):</label>
	  <input type="number" id="principal" class="input" bind:value={principal} />
	</div>
  
	<div class="input-group">
	  <label for="rate" class="label">Annual Interest Rate (%):</label>
	  <input type="number" id="rate" class="input" bind:value={rate} />
	</div>
  
	<div class="input-group">
	  <label for="time" class="label">Time (years):</label>
	  <input type="number" id="time" class="input" bind:value={time} />
	</div>
  
	<button class="calculate-button" on:click={calculateSimpleInterest}>CALCULATE</button>
  
	{#if simpleInterest > 0}
	  <p class="result">Simple Interest: ₹ {simpleInterest.toFixed(2)}</p>
	{/if}
  </main>
  
  <style>
	main {
	  padding: 40px;
	  font-family: 'Arial', sans-serif;
	  background-color: #f7f7f7;
	  border-radius: 10px;
	  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
	  text-align: center;
	  width: 80%;
	  margin: 0 auto;
	  max-width: 500px;
	}
  
	.title {
	  font-size: 24px;
	  margin-bottom: 20px;
	  color: #333;
	}
  
	.input-group {
	  margin-bottom: 15px;
	  text-align: left;
	}
  
	.label {
	  display: block;
	  margin-bottom: 5px;
	  font-size: 16px;
	  color: #333;
	}
  
	.input {
	  padding: 10px;
	  width: calc(100% - 20px);
	  font-size: 16px;
	  border: 1px solid #ccc;
	  border-radius: 5px;
	}
  
	.calculate-button {
	  padding: 15px 30px;
	  font-size: 18px;
	  background-color: #3498db;
	  color: white;
	  border: none;
	  cursor: pointer;
	  border-radius: 5px;
	  transition: background-color 0.3s;
	}
  
	.calculate-button:hover {
	  background-color: #2980b9;
	}
  
	.result {
	  font-size: 20px;
	  margin-top: 15px;
	  color: #333;
	}
  </style>
  