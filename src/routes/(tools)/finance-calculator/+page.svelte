<script>
    import { onMount } from 'svelte';
   
    let calculators = [
      {
        title: "ROI Calculator",
        description: "Calculate returns on investments to assess profitability.",
        id: "roi",
      },
      {
        title: "Currency Converter",
        description: "Quickly convert currencies using live exchange rates.",
        id: "currency",
      },
      {
        title: "Salary Calculator",
        description: "Estimate your monthly or annual salary after deductions.",
        id: "salary",
      },
      {
        title: "GST Calculator",
        description: "Calculate Goods and Services Tax for your transactions.",
        id: "gst",
      },
      {
        title: "Home Loan Calculator",
        description: "Estimate your home loan EMIs and total payment.",
        id: "homeLoan",
      },
      {
        title: "TVM Calculator",
        description: "Plan your financial future by calculating Time Value of Money.",
        id: "tvm",
      },
      {
        title: "Stock Return Calculator",
        description: "Estimate your investment’s growth with our stock return calculator.",
        id: "stockCalculator",
      },
    ];
   
    let selectedCalculator = null;
   
    // ROI Calculator variables and function
    let initialInvestment = 0, finalValue = 0, roi = 0;
    function calculateROI() {
      roi = ((finalValue - initialInvestment) / initialInvestment) * 100;
    }
   
    // Currency Converter variables and function (assuming static exchange rate for simplicity)
    let amount = 0, convertedAmount = 0, exchangeRate = 1.2; // Example: USD to EUR
    function convertCurrency() {
      convertedAmount = amount * exchangeRate;
    }
   
    // Salary Calculator variables and function
    let grossSalary = 0, deductions = 0, netSalary = 0;
    function calculateNetSalary() {
      netSalary = grossSalary - deductions;
    }
   
    // GST Calculator variables and function
    let priceWithoutGST = 0, gstRate = 18, priceWithGST = 0;
    function calculateGST() {
      priceWithGST = priceWithoutGST * (1 + gstRate / 100);
    }
   
    // Home Loan Calculator variables and function
    let loanAmount = 0, annualInterestRate = 0, loanTenure = 0, emi = 0, totalPayment = 0;
    function calculateHomeLoan() {
      let monthlyInterestRate = annualInterestRate / 12 / 100;
      let numberOfPayments = loanTenure * 12;
      emi = (loanAmount * monthlyInterestRate) / (1 - Math.pow(1 + monthlyInterestRate, -numberOfPayments));
      totalPayment = emi * numberOfPayments;
    }
   
    // TVM Calculator variables and function
    let presentValue = 0, interestRate = 0, periods = 0, futureValue = 0;
    function calculateFutureValue() {
      futureValue = presentValue * Math.pow(1 + interestRate / 100, periods);
    }
   
    //stock return calculator variable and function
     let initialPrice = 0;
      let finalPrice = 0;
      let numberOfShares = 0;
      let totalReturn = 0;

      function calculateReturn() {
        totalReturn = (finalPrice - initialPrice) * numberOfShares;
      }

    function selectCalculator(id) {
      selectedCalculator = id;
    }

  </script>
   
  <style>
    .card {
      cursor: pointer;
    }
    .calculator {
      border-radius: 8px;
      max-width: 400px;
      box-shadow: 0px -10px 0px rgb(24, 14, 14), 0px 10px 0px rgb(24, 14, 14);
    }
    .calculator label {
      display: block;
      margin-top: 8px;
    }
    .calculator input {
      margin-top: 4px;
      width: 100%;
      padding: 8px;
      box-sizing: border-box;
    }
  </style>
   
  <!-- <header class="bg-white py-4 shadow-md sticky top-0 z-10">
    <div class="container mx-auto px-4 flex flex-wrap justify-between items-center text-[#374151] p-3">
      <h1 class="text-2xl font-bold">Craftlab</h1>
      <div class="flex space-x-4 font-semibold text-base md:text-1xl">
        <h1 class="text-blue-700">Home</h1>
        <h1>Free Trial</h1>
        <h1>Information</h1>
        <h1>Calculators</h1>
        <h1>Contact Us</h1>
      </div>
    </div>
  </header> -->
   
  <div class="container mx-auto my-5 p-5">
    <section class="bg-gray-50">
      <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:px-12">
        <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl">
          Powerful Financial Calculators at Your Fingertips
        </h1>
        <p class="mb-8 text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48">
          Optimize your financial decisions with our comprehensive suite of online calculators.
          Explore our user-friendly tools and harness the full potential of your financial planning.
        </p>
        <div class="px-4 mx-auto text-center md:max-w-screen-md lg:max-w-screen-lg lg:px-36">
          <div class="relative w-full p-2 border bg-white border-gray-300 rounded-lg">
            <div class="flex absolute inset-y-0 items-center text-gray-500 left-0 pl-2.5 pointer-events-none">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path>
              </svg>
            </div>
            <input class="hover:border-none block w-full disabled:cursor-not-allowed disabled:opacity-50 pl-11 bg-white text-gray-900 sm:text-base rounded-lg focus:outline-none focus:border-gray-300" placeholder="Search" type="search" />
          </div>
        </div>
      </div>
    </section>
   
    <section class="container mx-auto my-5 p-5">
      <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {#each calculators as calculator}
          <div class="card block bg-white shadow-md hover:shadow-lg rounded-lg overflow-hidden hover:bg-gray-100" on:click={() => selectCalculator(calculator.id)}>
            <div class="card-content p-4">
              <h5 class="text-lg font-semibold tracking-tight text-gray-900 dark:text-white p-1">
                {calculator.title}
              </h5>
              <p class="card-description text-[#6B7280] p-2 text-base">
                {calculator.description}
              </p>
            </div>
          </div>
        {/each}
      </div>
    </section>
   
    {#if selectedCalculator === 'roi'}
        <div class="calculator p-6 rounded-lg shadow-lg max-w-md mx-auto mt-10 mb-10">
        <h2 class="text-2xl font-bold mb-4 text-center py-2 rounded-lg">ROI Calculator</h2>
    
        <label class="block mb-2">
            Initial Investment:
            <input type="number" bind:value={initialInvestment} class="border border-gray-300 rounded w-full py-2 px-3 mt-1" />
        </label>
        <label class="block mb-4">
            Final Value:
            <input type="number" bind:value={finalValue} class="border border-gray-300 rounded w-full py-2 px-3 mt-1" />
        </label>
        <button on:click={calculateROI} class="bg-blue-500 text-white py-2 px-4 rounded w-full font-bold">
            Calculate ROI
        </button>
        <p class="mt-4 text-lg font-semibold">ROI: {roi.toFixed(2)}%</p>
        </div>
     {/if}

    {#if selectedCalculator === 'stockCalculator'}
        <div class="calculator p-6 rounded-lg shadow-lg max-w-md mx-auto mt-10 mb-10">
          <h2 class="text-2xl font-bold mb-4 text-center  py-2 rounded-lg">Stock Return Converter</h2>
            <label for="initialPrice"  class="block mb-4">Initial Price per Share
              <input type="number" id="initialPrice" bind:value={initialPrice} min="0" step="0.01" class="border border-gray-300 rounded w-full py-2 px-3 mt-1"/>
            </label>

            <label for="finalPrice"  class="block mb-4">Final Price per Share
              <input type="number" id="finalPrice" bind:value={finalPrice} min="0" step="0.01" class="border border-gray-300 rounded w-full py-2 px-3 mt-1"/>
            </label> 
        
            <label for="numberOfShares"  class="block mb-4">Number of Shares
              <input type="number" id="numberOfShares" bind:value={numberOfShares} min="0" class="border border-gray-300 rounded w-full py-2 px-3 mt-1"/>
            </label>
                    
            <button on:click={calculateReturn} class="bg-teal-900 text-white py-2 px-4 rounded w-full font-bold">Calculate Return</button>
                    
            {#if totalReturn !== 0}
              <div class="result mt-5">
                Total Return: ₹{totalReturn.toFixed(2)}
              </div>
            {/if}
        </div>
    {/if}

  {#if selectedCalculator === 'currency'}
    <div class="calculator p-6 rounded-lg shadow-lg max-w-md mx-auto mt-10 mb-10">
      <h2 class="text-2xl font-bold mb-4 text-center  py-2 rounded-lg">Currency Converter</h2>
   
      <label class="block mb-2">
        Amount in USD:
        <input type="number" bind:value={amount} class="border border-gray-300 rounded w-full py-2 px-3 mt-1" />
      </label>
      <button on:click={convertCurrency} class="bg-teal-600 text-white py-2 px-4 rounded w-full font-bold">
        Convert to EUR
      </button>
        <p class="mt-4 text-lg font-semibold">Converted Amount: {convertedAmount.toFixed(2)} EUR</p>
    </div>
  {/if}
   
  {#if selectedCalculator === 'salary'}
    <div class="calculator p-6 rounded-lg shadow-lg max-w-md mx-auto mt-10 mb-10">
      <h2 class="text-2xl font-bold mb-4 text-center   py-2 rounded-lg">Salary Calculator</h2>
   
      <label class="block mb-2">
        Gross Salary:
        <input type="number" bind:value={grossSalary} class="border border-gray-300 rounded w-full py-2 px-3 mt-1" />
      </label>
      <label class="block mb-2">
        Deductions:
        <input type="number" bind:value={deductions} class="border border-gray-300 rounded w-full py-2 px-3 mt-1" />
      </label>
      <button on:click={calculateNetSalary} class="bg-green-500 text-white py-2 px-4 rounded w-full font-bold">
        Calculate Net Salary
      </button>
        <p class="mt-4 text-lg font-semibold">Net Salary: {netSalary.toFixed(2)}</p>
    </div>
  {/if}
   
  {#if selectedCalculator === 'gst'}
    <div class="calculator p-6 rounded-lg shadow-lg max-w-md mx-auto mt-10 mb-10">
      <h2 class="text-2xl font-bold mb-4 text-center py-2 rounded-lg">GST Calculator</h2>
   
      <label class="block mb-2">
        Price without GST:
        <input type="number" bind:value={priceWithoutGST} class="border border-gray-300 rounded w-full py-2 px-3 mt-1" />
      </label>
      <label class="block mb-2">
        GST Rate (%):
        <input type="number" bind:value={gstRate} class="border border-gray-300 rounded w-full py-2 px-3 mt-1" />
      </label>
      <button on:click={calculateGST} class="bg-yellow-400 text-white py-2 px-4 rounded w-full font-bold">
        Calculate Price with GST
      </button>
        <p class="mt-4 text-lg font-semibold">Price with GST: {priceWithGST.toFixed(2)}</p>
    </div>
  {/if}
   
  {#if selectedCalculator === 'homeLoan'}
    <div class="calculator p-6 rounded-lg shadow-lg max-w-md mx-auto mt-10 mb-10">
      <h2 class="text-2xl font-bold mb-4 text-center   py-2 rounded-lg">Home Loan Calculator</h2>
   
      <label class="block mb-2">
        Loan Amount:
        <input type="number" bind:value={loanAmount} class="border border-gray-300 rounded w-full py-2 px-3 mt-1" />
      </label>
      <label class="block mb-2">
        Annual Interest Rate (%):
        <input type="number" bind:value={annualInterestRate} class="border border-gray-300 rounded w-full py-2 px-3 mt-1" />
      </label>
      <label class="block mb-2">
        Loan Tenure (years):
        <input type="number" bind:value={loanTenure} class="border border-gray-300 rounded w-full py-2 px-3 mt-1" />
      </label>
      <button on:click={calculateHomeLoan} class="bg-purple-500 text-white py-2 px-4 rounded w-full font-bold">
        Calculate EMI
      </button>
        <p class="mt-4 text-lg font-semibold">EMI: {emi.toFixed(2)}</p>
      <p>Total Payment: {totalPayment.toFixed(2)}</p>
    </div>
  {/if}
   
  {#if selectedCalculator === 'tvm'}
    <div class="calculator p-6 rounded-lg shadow-lg max-w-md mx-auto mt-10 mb-10">
      <h2 class="text-2xl font-bold mb-4 text-center  py-2 rounded-lg">TVM Calculator</h2>
   
      <label class="block mb-2">
        Present Value:
        <input type="number" bind:value={presentValue} class="border border-gray-300 rounded w-full py-2 px-3 mt-1" />
      </label>
      <label class="block mb-2">
        Interest Rate (%):
        <input type="number" bind:value={interestRate} class="border border-gray-300 rounded w-full py-2 px-3 mt-1" />
      </label>
      <label class="block mb-2">
        Number of Periods:
        <input type="number" bind:value={periods} class="border border-gray-300 rounded w-full py-2 px-3 mt-1" />
      </label>
      <button on:click={calculateFutureValue} class="bg-indigo-500 text-white py-2 px-4 rounded w-full font-bold">
        Calculate Future Value
      </button>
        <p class="mt-4 text-lg font-semibold">Future Value: {futureValue.toFixed(2)}</p>
    </div>
  {/if}
   
    <footer class="bg-gray-100 py-4 text-center mt-10">
      <p class="text-gray-600">&copy; All rights reserved.</p>
    </footer>
  </div>