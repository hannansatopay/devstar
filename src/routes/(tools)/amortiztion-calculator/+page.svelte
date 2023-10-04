<script lang="ts">
	import Intro from '$lib/Intro.svelte';
  	
	export let data;
	
	let start=1000;
    let year = 15;
    let interest = 5;
    let yes =false;
    let current_year =2023;
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<h1>Amortization Calculator</h1>
<form action="">
    Loan Amount<input type="number" class="sign" bind:value={start}>
    Loan Term<input type="number"  bind:value={year} placeholder="Year">
    <input type="number" placeholder="month">
    Interest rate<input type="number" bind:value={interest}>
    <br>
    <input type="checkbox" bind:checked={yes}> Optional: make extra
    <br>
    {#if yes}
    Loan start date 
    <select>
        <option value="1" selected>Jan</option>
        <option value="2">Feb</option>
        <option value="3">Mar</option>
        <option value="4">Apr</option>
        <option value="5">May</option>
        <option value="6">Jun</option>
        <option value="7">Jul</option>
        <option value="8">Aug</option>
        <option value="9">Sep</option>
        <option value="10">Oct</option>
        <option value="11">Nov</option>
        <option value="12">Dec</option>
    </select> 
    <input type="number" value={current_year}>
    <br>
    Extra monthly pay 
    <br>
    <input type="number" class="monthly_pay">
    {/if}
</form>
<style>
    h1{
        color: blue;
        text-align: center;
    }
    form{
        padding: 4%;
        text-align: center;
    }
    .monthly_pay{
        width: 100px;
    }
</style>