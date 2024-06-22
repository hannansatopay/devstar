<script lang="ts">
	import Intro from '$lib/Intro.svelte';
  	import { amorttable } from './AmortizationTable.js';
	export let data;
	
	let start=1000;
    let year = 1;
    let month=0;
    let interest = 5;
    let term=12;
    let payment:number;
    let totpayment:number;
    let print;
    
    function amort(){
        term = year*12+month;
        var monthinterest=Number((interest/(100*12)));
        var pay=start * (monthinterest/(1-Math.pow(1+monthinterest, -term)));
        payment = Number(pay.toFixed(2));
        totpayment=Number((payment*term).toFixed(2));
        let result='<p style="font-weight: bold">Principal Amount='+start+'</p><br><p style="font-weight: bold">Term='+term+'</p><br><p style="font-weight: bold">Interest rate='+interest+'</p><br><p style="font-weight: bold">Monthly Payment='+payment+'</p><br><p style="font-weight: bold">Total Payment='+totpayment+'</p>';
        const tab= amorttable(start,interest/100,term);
        print.innerHTML= result+tab;
    }
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<main>
    <div class="input">
            <form action="">
                <p>Loan Amount</p><input type="number" class="sign" bind:value={start}><br>
                <p>Loan Term</p><input type="number"  bind:value={year} placeholder="Year">
                <input type="number" placeholder="month" bind:value={month}><br>
                <p>Interest rate</p><input type="number" bind:value={interest}>
                <br>   
            </form>
            <button on:click={amort}>Calculate</button>
            <div bind:this={print}></div>
    </div>  
</main> 
    
<style>
    p{
        font-weight: bold;
    }
    form{
        padding: 4%;
        text-align: center;
    }
    button{
        text-align: center;
        margin: center;
        width: 43%;
        color: black;
        background-color: hsl(128, 89%, 25%);
    }
    div{
       text-align: center;
       margin-left: auto;
       margin-right: auto;
    }
    main{
        max-width: 400px;
        margin: 0 auto;
        padding: 20px;
        border: 2px solid hsl(0, 0%, 7%); 
        border-radius: 20px;
        background-color: #1666d6fb;
    }
    .input{
        box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
    }
</style>