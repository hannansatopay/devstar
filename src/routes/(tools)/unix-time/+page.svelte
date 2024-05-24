<script>
  let currentUnixTimestamp = Math.floor(Date.now() / 1000);
  let convertedUnixToHuman = '';
  let convertedHumanToUnix = '';
  
  function convertUnixToHuman() {
    const unixTimestamp = Number(convertedUnixToHuman);
    if (!isNaN(unixTimestamp)) {
      const date = new Date(unixTimestamp * 1000);
      convertedUnixToHuman = date.toISOString();
    }
  }
  
  function convertHumanToUnix() {
    const date = new Date(convertedHumanToUnix);
    if (!isNaN(date)) {
      convertedHumanToUnix = Math.floor(date.getTime() / 1000);
    }
  }
</script>

<main>
  <h1>Unix Timestamp Converter</h1>
  
  <div class="section">
    <p class="label">Current Unix Timestamp</p>
    <p class="value">{currentUnixTimestamp}</p>
  </div>
  
  <div class="converter">
    <label for="unixToHuman">Convert Unix to Human Date:</label>
    <input class="input" type="text" id="unixToHuman" bind:value={convertedUnixToHuman} />
    <button class="convert-button" on:click={convertUnixToHuman}>Convert</button>
    <p class="converted-result">Converted Human Date: {convertedUnixToHuman}</p>
  </div>
  
  <div class="converter">
    <label for="humanToUnix">Convert Human Date to Unix:</label>
    <input class="input" type="datetime-local" id="humanToUnix" bind:value={convertedHumanToUnix} />
    <button class="convert-button" on:click={convertHumanToUnix}>Convert</button>
    <p class="converted-result">Converted Unix Timestamp: {convertedHumanToUnix}</p>
  </div>
</main>

<style>
  main {
    font-family: Arial, sans-serif;
    padding: 20px;
    text-align: center;
    background-color: #f0f0f0;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .section {
    margin-bottom: 20px;
  }
  
  .label {
    font-weight: bold;
    margin-bottom: 5px;
  }
  
  .value {
    font-size: 18px;
  }
  
  .converter {
    background-color: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    margin-bottom: 20px;
  }
  
  .input {
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    width: 100%;
    margin-bottom: 10px;
  }
  
  .convert-button {
    padding: 10px 20px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .converted-result {
    margin-top: 10px;
    font-style: italic;
    color: #555;
  }
</style>
