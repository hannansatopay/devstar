<script>
    // import { onMount } from 'svelte';
	// import { Label, Input } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	import Copy from '$lib/Copy.svelte';

    let loanAmount = 0;
    let downPayment = 0;
    let titleRegistrationFees = 0;
    let otherFees = 0;
    let cashIncentives = 0;
    let interestRate = 0;
    let loanTerm = 0;
    let monthlyPayment = 0;
  
    function calculateMonthlyPayment() {
      const loanAmountWithDownPayment = loanAmount - downPayment;
      const loanAmountWithFees = loanAmountWithDownPayment + titleRegistrationFees + otherFees - cashIncentives;
      const monthlyInterest = (interestRate / 100) / 12;
      const numerator = loanAmountWithFees * monthlyInterest;
      const denominator = 1 - Math.pow(1 + monthlyInterest, -loanTerm);
      monthlyPayment = numerator / denominator;
    }
  </script>
  
  <style>
    
    .calculator {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      background-color: #f8f8f8;
    }
  
    .calculator h2 {
      font-size: 24px;
      margin-bottom: 20px;
    }
  
    .calculator div {
      margin-bottom: 10px;
    }
  
    .calculator div label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
  
    .calculator div input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
  
    .calculator button {
      width: 100%;
      padding: 10px 20px;
      border: solid;
      border-radius: 4px;
      background-color: #007BFF;
      color: #fff;
      cursor: pointer;
    }
  
    .calculator button:hover {
      background-color: grey;
    }
  
    .calculator h3 {
      font-size: 18px;
      margin-top: 20px;
    }
  </style>
  
  <div class="calculator">
    <h2>Auto Loan Calculator</h2>
    <div>
      <label for="loanAmount">Vehicle Price (INR):</label>
      <input type="number" id="loanAmount" bind:value={loanAmount} />
    </div>
    <div>
      <label for="downPayment">Down Payment (INR):</label>
      <input type="number" id="downPayment" bind:value={downPayment} />
    </div>
    <div>
      <label for="titleRegistrationFees">Registration Fees (INR):</label>
      <input type="number" id="titleRegistrationFees" bind:value={titleRegistrationFees} />
    </div>
    <div>
      <label for="otherFees">Other Fees like for acessories (INR):</label>
      <input type="number" id="otherFees" bind:value={otherFees} />
    </div>
    <div>
      <label for="cashIncentives">Cash Incentives (INR):</label>
      <input type="number" id="cashIncentives" bind:value={cashIncentives} />
    </div>
    <div>
      <label for="interestRate">Annual Interest Rate (%):</label>
      <input type="number" id="interestRate" bind:value={interestRate} />
    </div>
    <div>
      <label for="loanTerm">Loan Term (months):</label>
      <input type="number" id="loanTerm" bind:value={loanTerm} />
    </div>
    <button on:click={calculateMonthlyPayment}>Calculate Monthly Payment</button>
    {#if monthlyPayment > 0}
      <div>
        <h3>Monthly Payment (INR):</h3>
        <p>&#8377; {monthlyPayment.toFixed(2)}</p>
      </div>
    {/if}
  </div>
  
  
  