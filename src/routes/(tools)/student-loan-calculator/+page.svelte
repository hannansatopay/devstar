<head>    
    <title>Student Loan Calculator</title>
    <link rel="stylesheet" href="style.css">   
    <style type="text/css">
#about{
    margin:30px;
    width: 800px;
}

#box{
    margin:30px;
}

.container{
    display: center;
    justify-content: center;
    align-items: center;
    width: 400px;
    /* height: 300px; */
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0px 0px 10px 1px rgb(123, 114, 114);
}
.heading{
    text-align: center;
    font-size: 30px;    
    font-family:Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
    font-weight: bold;
    color:black;
    margin-top: 10px;
}
/* Style for all input containers */
.input-container{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 10px 30px;
}
.input-container label{
    font-size: larger;
    color:black;
    font-weight: bold;
}
.input-container input{
    font-size: larger;
    border:none;
    box-shadow: 0px 0px 2px 1px rgb(152, 145, 145);
    padding: 4px 10px;
    border-radius: 5px;
    font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;    
    outline: none;
    width: 50%;
}
.input-container input:hover{
    box-shadow: 0px 0px 2px 1px rgb(37, 34, 34);
}

/* submit button style */
.submit-container{
    margin: 20px;
    display: flex;
    justify-content: center;
}
#calculate{    
    padding:4px 10px;
    font-size: larger;
    background-color: rgb(182, 53, 53);
    border-radius: 3px;
    color: white;
    border:none;
    outline: none;
    box-shadow: 2px 3px 4px rgb(55, 52, 52);
    transition: 0.4s;
    cursor: pointer;
}
#calculate:active{
    box-shadow: none;
    font-size:large;
}

/* Loan duration style */
#loanTenure{
    width: 58px;
    margin-left: 65px;
    margin-right: 0;        
    /* background-color: aqua; */
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
}
.radio-container{    
    display: flex;
    margin-left: 0;
}
.radio-container input[type="radio"]{
    display: none;
}
.radio-container label{
    background-color: rgb(236, 235, 234);
    padding: 3.7px 5px;        
    box-shadow: 0px 0px 2px 1px rgb(152, 145, 145);
    cursor: pointer;
    transition: all 0.3s;    
    
}
#month + label{
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
}
.radio-container label:hover{
    background-color: rgb(116, 101, 101);
    color:white;
} 
.radio-container input[type="radio"]:checked+label{
    background-color:  rgb(116, 101, 101);
    color: white;
} 

/* Output */

.output{
    margin: 10px;    
    /* box-shadow: 0px 0px 5px rgb(51, 48, 48); */
    display: flex;
    flex-direction: column;
    /* display: none; */

}
.output p{
    font-size: 16px;
    border-radius: 4px;
    padding: 4px;
    margin:4px;    
    width: 100%;
    box-shadow: 0px 0px 5px rgb(51, 48, 48);
    color:rgb(62, 58, 58);
    font-weight: 550;
    

}
.output p span{
    float: right;
    word-wrap: break-word;
    color: rgb(101, 17, 41);
    font-weight: bolder;
    font-size: larger;
}
    </style> 
</head>
<body>
    
    <center>
        <div id="about">
            A student loan calculator is a tool that estimates monthly payments and total cost of student loans by considering factors like loan amount, interest rate, loan term, and repayment plan. It is useful for students to compare loan options and track their progress. To use a calculator, enter accurate information, compare loan options and repayment plans, and use the calculator to track progress. 
            </div>
        <div id="box">
    <form class="container">
        <p class="heading">Student Loan Calculator</p>
        <div class="input-container">
            <label for="amount">Loan Amount(₹)</label>
            <input type="number" id="amount" required>            
        </div>
        <div class="input-container">
            <label for="interest">Interest Rate(%)</label>
            <input type="number" id="interest" step="0.01" required>            
        </div>
        <div class="input-container loan-tenure-container">
            <label for="loanTenure">Loan Tenure</label>
            <input type="text" id="loanTenure" required>            
            <div class="radio-container">            
                <input type="radio" name="btn" id="year"><label for="year">Year</label>
                <input type="radio" name="btn" id="month"><label for="month">Month</label>
            </div>
        </div>
        <div class="submit-container">
            <input type="submit" value="Submit" id="calculate">            
        </div>
        
        <div class="output">
            <p >Loan EMI                           <span id="emi"         >₹</span></p>
            <p >Total Interest Payable             <span id="totalInterest"    >₹</span></p>
            <p >Total Payment(Principal + Interest)<span id="totalPayment">₹</span> </p>
            
        </div>
    </form> </div> </center> 
      
    <script>
      let loanAmount = document.getElementById("amount");
      let interestRate=document.getElementById("interest");
      let loanDuration = document.getElementById("loanTenure");
      let submit = document.getElementById("calculate");

      submit.addEventListener('click',(e)=>{
        e.preventDefault();
        calculateEMI();
     })
     function calculateEMI(){
      // First calculate total number of months in loan tenure if selected year
     let isYear = document.getElementById("year").checked;
     let isMonth = document.getElementById("month").checked;
     let noOfMonths=0;
     if(isYear=="" && isMonth==""){
        alert("Please select loan tenure type-> Month or year");
     }else{
        if(isYear==true){
            noOfMonths=loanDuration.value * 12 ;
        }else{
            noOfMonths=loanDuration.value;
        }
        let r = parseFloat(interestRate.value)/12/100;
        let P = loanAmount.value;
        let n = noOfMonths;
        //formula EMI= (P * r * (1 + r)^n ) / ((1+r)^n - 1)
        let EMI = (P*r* Math.pow((1+r),n)) / (Math.pow((1+r),n)-1);
        let totalInterest =(EMI * n) - P;
        let totalPayment  = totalInterest + parseFloat(P);
        document.getElementById("emi").innerText = "₹" + Math.round(EMI);
        document.getElementById("totalInterest").innerText="₹" + Math.round(totalInterest);
        document.getElementById("totalPayment").innerText="₹" + Math.round(totalPayment) ;
      }
     }
    </script>
</body>
