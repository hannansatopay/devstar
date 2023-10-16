// <!-- AmortizationTable.svelte -->
export function amorttable(balance, interestRate, terms)
{
    //Calculate the per month interest rate
	var monthlyRate = interestRate/12;
	
	//Calculate the payment
    var payment = balance * (monthlyRate/(1-Math.pow(
        1+monthlyRate, -terms)));
	    
	//begin building the return string for the display of the amort table
    //var result = "balance.toFixed(2)+ (interestRate*100).toFixed(2)+ terms+ payment.toFixed(2)+ (payment * terms).toFixed(2)" ;
        
    //add header row for table to return string
	var result = "<table border='10'><tr><th>Month #</th><th>Balance</th><th>Interest</th><th>Principal</th>";
    //console.log(result);
    /**
     * Loop that calculates the monthly Loan amortization amounts then adds 
     * them to the return string 
     */
	for (var count = 0; count < terms; ++count)
	{ 
		//in-loop interest amount holder
		var interest = 0;
		
		//in-loop monthly principal amount holder
		var monthlyPrincipal = 0;
		
		//start a new table row on each loop iteration
		result += "<tr align=center>";
		
		//display the month number in col 1 using the loop count variable
		result += "<td>" + (count + 1) + "</td>";
		
		
		//code for displaying in loop balance
		result += "<td> $" + balance.toFixed(2) + "</td>";
		
		//calc the in-loop interest amount and display
		interest = balance * monthlyRate;
		result += "<td> $" + interest.toFixed(2) + "</td>";
		
		//calc the in-loop monthly principal and display
		monthlyPrincipal = payment - interest;
		result += "<td> $" + monthlyPrincipal.toFixed(2) + "</td>";
		
		//end the table row on each iteration of the loop	
		result += "</tr>";
		
		//update the balance for each loop iteration
		balance = balance - monthlyPrincipal;		
	}
	
	//Final piece added to return string before returning it - closes the table
    result += "</table>";
	
	//returns the concatenated string to the page
    return result;
};


export function myFunction(param1, param2) {
	// Add your custom logic here, using param1 and param2
	const result = param1 + param2;
	console.log('JavaScript function called from Svelte with result:', result);
	return result;
  }
  