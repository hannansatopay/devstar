<script>
    let amount = 0;
    let rate = 0;
    let months = 0;
    let total = 0;
  
    function calculate() {
      const interest = (amount * (rate * 0.01)) / months;
      // @ts-ignore
      total = ((amount / months) + interest).toFixed(2);
    }
  </script>
  
  <main>
    <div class="calculator">
      <h1>Student Loan Calculator</h1>
  
      <p>Amount (₹): <input bind:value={amount} on:change={calculate} type="number" /></p>
      <p>Interest Rate: <input bind:value={rate} on:change={calculate} type="number" /></p>
      <p>Months to Pay: <input bind:value={months} on:change={calculate} type="number" /></p>
      <button on:click={calculate}>Calculate EMI</button>
  
      <h2 id="total">EMI: (₹){total}</h2>
    </div>
  </main>
  
  <style>
   
    h1 {
      font-size: 30px;
    }
  
    h2 {
      font-size: 21px;
      margin-top: 20px;
    }
  
    .calculator {
      width: 400px;
      height: 500px;
      background-color: black;
      position: absolute;
      left: 50%;
      top: 50%;
      transform: translateX(-50%) translateY(-50%);
      padding: 20px 0px 0px 100px;
      border-radius: 50px;
      color: white;
    }
  
    input {
        color: black;
      padding: 7px;
      width: 70%;
      margin-top: 7px;
    }
  
    button {
      padding: 10px;
      margin: 20px;
      background-color: red;
      color: white;
      border: none;
      border-radius: 5px;
    }
  </style>
  