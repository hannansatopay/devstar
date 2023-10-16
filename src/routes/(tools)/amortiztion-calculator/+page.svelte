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
        let result='<p>Principal Amount='+start+'</p><br><p>Term='+term+'</p><br><p>Interest rate='+interest+'</p><br><p>Monthly Payment='+payment+'</p><br><p>Total Payment='+totpayment+'</p>';
        const tab= amorttable(start,interest,term);
        print.innerHTML= result+tab;
    }
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<h1>Amortization Calculator</h1>
    <form action="">
        Loan Amount<input type="number" class="sign" bind:value={start}>
        Loan Term<input type="number"  bind:value={year} placeholder="Year" on:input={amort}>
        <input type="number" placeholder="month" bind:value={month} on:input={amort}>
        Interest rate<input type="number" bind:value={interest}>
        <br>   
    </form>
    <button on:click={amort}>Calculate</button>
    <div bind:this={print}></div>
    
<style>
    h1{
        color: blue;
        text-align: center;
    }
    form{
        padding: 4%;
        text-align: center;
    }
    button{
        text-align: center;
        margin: auto;
        width: 95%;
    }
    div{
       text-align: center;
       margin-left: auto;
       margin-right: auto;
    }
    .monthly_pay{
        width: 100px;
    }
</style>