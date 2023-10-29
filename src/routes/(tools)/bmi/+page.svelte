<script>
    let height = 0;
    let weight = 0;
    let age = 0;
    let gender = 'male';
    let bmi = 0;
  
    function calculateBMI() {
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters ** 2);
    }
  </script>

  <style>
    .container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #383838; 
    border-radius: 10px;
    background-color: #1e1e1e;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.1); 
  }
  .input-group {
    margin-bottom: 10px;
  }
  .input-group label {
    display: block;
    margin-bottom: 5px;
    color: #bbb; 
  }
  .input-group input, .input-group select {
    width: 100%;
    padding: 10px;
    border: 1px solid #2d2d2d; 
    border-radius: 5px;
    background-color: #2d2d2d; 
    color: white; 
  }
  .calculate-button {
    display: block;
    width: 100%;
    padding: 10px;
    background-color: #3498db; 
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
  }
  .calculate-button:hover {
    background-color: #2980b9; 
  }
  .result {
    margin-top: 20px;
    font-size: 18px;
    color: white; 
  }
  h2 {
    font-size: 24px; 
    font-weight: bold; 
    color: #3498db;
    margin-bottom: 20px; 
  }
  </style>

  <div class="container">
    <h2>BMI Calculator</h2>

    <div class="input-group">
      <label for="height">Height (cm): </label>
      <input type="number" id="height" bind:value={height} />
    </div>

    <div class="input-group">
      <label for="weight">Weight (kg): </label>
      <input type="number" id="weight" bind:value={weight} />
    </div>

    <div class="input-group">
      <label for="age">Age: </label>
      <input type="number" id="age" bind:value={age} />
    </div>

    <div class="input-group">
      <label for="gender">Gender: </label>
      <select id="gender" bind:value={gender}>
        <option value="male">Male</option>
        <option value="female">Female</option>
      </select>
    </div>

    <button class="calculate-button" on:click={calculateBMI}>Calculate BMI</button>

    {#if bmi > 0}
      <p class="result">Your BMI is: {bmi.toFixed(2)}</p>
    {/if}
  </div>