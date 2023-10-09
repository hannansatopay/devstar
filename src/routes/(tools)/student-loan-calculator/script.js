function Calculate() {
    
    // Extracting value in the amount 
    // section in the variable
    const amount = document.querySelector("#amount").value;
    
    // Extracting value in the interest
    // rate section in the variable
    const rate = document.querySelector("#rate").value;
    
    // Extracting value in the months 
    // section in the variable
    const months = document.querySelector("#months").value;
    
    // Calculating interest per month
    const interest = (amount * (rate * 0.01)) / months;
    
    // Calculating total payment
    const total = ((amount / months) + interest).toFixed(2);
    
    document.querySelector("#total")
          .innerHTML = "EMI : (₹)" + total;
    }  