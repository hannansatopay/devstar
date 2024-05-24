<script>
  let days1 = 0;
  let hours1 = 0;
  let minutes1 = 0;
  let seconds1 = 0;
  let days2 = 0;
  let hours2 = 0;
  let minutes2 = 0;
  let seconds2 = 0;

  let selectedOperation = 'add';

  let resultDays = 0;
  let resultHours = 0;
  let resultMinutes = 0;
  let resultSeconds = 0;

  function calculateResult() {
    let totalSeconds1 = days1 * 86400 + hours1 * 3600 + minutes1 * 60 + seconds1;
    let totalSeconds2 = days2 * 86400 + hours2 * 3600 + minutes2 * 60 + seconds2;

    if (selectedOperation === 'add') {
      let combinedTotal = totalSeconds1 + totalSeconds2;
      resultDays = Math.floor(combinedTotal / 86400);
      combinedTotal %= 86400;
      resultHours = Math.floor(combinedTotal / 3600);
      combinedTotal %= 3600;
      resultMinutes = Math.floor(combinedTotal / 60);
      resultSeconds = combinedTotal % 60;
    } else if (selectedOperation === 'subtract') {
      let combinedTotal = totalSeconds1 - totalSeconds2;
      resultDays = Math.floor(Math.abs(combinedTotal) / 86400);
      combinedTotal %= 86400;
      resultHours = Math.floor(Math.abs(combinedTotal) / 3600);
      combinedTotal %= 3600;
      resultMinutes = Math.floor(Math.abs(combinedTotal) / 60);
      resultSeconds = Math.abs(combinedTotal) % 60;
    }
  }
</script>

<main>
  <h1 class="title">Time Calculator</h1>

  <div class="calculator-box horizontal center">
    <div class="input-box">
      <div class="horizontal-input-group">
        <div class="horizontal-input">
          <label>Days:</label>
          <input type="number" bind:value={days1} />
        </div>

        <div class="horizontal-input">
          <label>Hours:</label>
          <input type="number" bind:value={hours1} />
        </div>

        <div class="horizontal-input">
          <label>Minutes:</label>
          <input type="number" bind:value={minutes1} />
        </div>

        <div class="horizontal-input">
          <label>Seconds:</label>
          <input type="number" bind:value={seconds1} />
        </div>
      </div>
    </div>
  </div>

  <div class="operation-buttons horizontal center">
    <div class="radio-group">
      <input type="radio" id="add-radio" value="add" bind:group={selectedOperation} />
      <label for="add-radio" class="radio-label">Add</label>
      <input type="radio" id="subtract-radio" value="subtract" bind:group={selectedOperation} />
      <label for="subtract-radio" class="radio-label">Subtract</label>
    </div>
  </div>

  <div class="calculator-box horizontal center">
    <div class="input-box">
      <div class="horizontal-input-group">
        <div class="horizontal-input">
          <label>Days:</label>
          <input type="number" bind:value={days2} />
        </div>

        <div class="horizontal-input">
          <label>Hours:</label>
          <input type="number" bind:value={hours2} />
        </div>

        <div class="horizontal-input">
          <label>Minutes:</label>
          <input type="number" bind:value={minutes2} />
        </div>

        <div class="horizontal-input">
          <label>Seconds:</label>
          <input type="number" bind:value={seconds2} />
        </div>
      </div>
    </div>
  </div>

  <div class="calculate-button-container horizontal center">
    <button class="calculate-button" on:click={calculateResult}>Calculate</button>
  </div>

  <div class="result-box horizontal center">
    {#if resultDays !== 0}
      <div class="result-item">
        <p>Days:</p>
        <p>{resultDays}</p>
      </div>
    {/if}

    {#if resultHours !== 0}
      <div class="result-item">
        <p>Hours:</p>
        <p>{resultHours}</p>
      </div>
    {/if}

    {#if resultMinutes !== 0}
      <div class="result-item">
        <p>Minutes:</p>
        <p>{resultMinutes}</p>
      </div>
    {/if}

    {#if resultSeconds !== 0}
      <div class="result-item">
        <p>Seconds:</p>
        <p>{resultSeconds}</p>
      </div>
    {/if}
  </div>
</main>

<style>
  main {
    font-family: Arial, sans-serif;
    text-align: center;
    padding: 20px;
    background-color: #f0f0f0;
  }

  .title {
    font-weight: bold;
  }

  .calculator-box {
    display: inline-block;
    margin: 20px;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 10px;
    background-color: #ffffff;
    color: #000000;
  }

  .input-box, .operation-buttons {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .horizontal-input-group {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }

  .horizontal-input {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0 10px;
  }

  .radio-group {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
  }

  .radio-label {
    margin-right: 15px;
  }

  .calculate-button-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
  }

  .calculate-button {
    background-color: #007bff;
    color: white;
    font-weight: 600;
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .result-box {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    background-color: #ffffff;
    color: #000000;
    padding: 25px;
    border-radius: 5px;
    margin-top: 10px;
  }

  .result {
    display: flex;
    flex-wrap: wrap;
    width: 100%;
  }

  .result-item {
    width: 25%;
    padding: 10px;
    text-align: center;
  }

  .horizontal {
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .center {
    justify-content: center;
  }
</style>
