<svelte:head>
	<link rel="stylesheet" type="text/css" href="freakflags.css">
</svelte:head>
<script lang="ts">
	import { Label, Input, Select } from 'flowbite-svelte';
	import Intro from '$lib/Intro.svelte';
	export let data;
	let principalAmount = 500000;
	let rate = 6; // interest rate
	let years= 10; // time period
	let period = 12; // Amout of withdrawls in a year
	let result = 5550; // default value
    let error = ''; // space of error message
    let totalAmountReceived = 666000;
    let totalInterestReceived = 166000;

	let type = 'monthly';
	let types = [
		{ value: 'annually', name: 'Annually' },
		{ value: 'semi-annually', name: 'Semi-Annually' },
		{ value: 'quarterly', name: 'Quaterly' },
		{ value: 'monthly', name: 'Monthly' },
	];

	function updatePeriod(){
		if (type == 'monthly'){
			period = 12;
		}
		else if (type == 'quarterly'){
			period = 4;
		}
		else if (type == 'semi-annually'){
			period = 2;
		}
		else if(type == 'annually'){
			period = 1;
		}
	}

    function validateValues(){
        if(rate <= 1){
            rate = 1;
        }
        if(years <= 1){
            years=1;
        }
    }

	function calculate(){
        if(principalAmount <= 0){
            error = 'Principal Amount should be a non-zero positive value!';
            return;
        }
        error = '';
		let newrate = (rate/100);
		let numerator = (1 - ((1 + (newrate/period))**(-years*(period))) );
		let denominator = (newrate/period);
		let ans = numerator/denominator;
		result = principalAmount/ans;
        totalAmountReceived = result * (years*period);
        totalInterestReceived = totalAmountReceived - principalAmount;
	}

</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card gap-16 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
            
            {#if error}
                <div class="text-color border-danger font-semibold">
                    {error}
                </div>
            {/if}
			
            <div class="mt-5 gap-5 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden">
				
				<Label class="mt-5">
					Starting Principal
					<Input type="number"  bind:value={principalAmount}/>
				</Label>
				
				<Label class="mt-5">
					Interest Rate %
					<Input type="number" bind:value={rate} on:change={validateValues} on:change={calculate}/>
				</Label>
				
				<Label class="mt-5">
					Years to payout
					<Input type="number" bind:value={years} on:change={validateValues} on:change={calculate}/>
				</Label>

				<Label class="mt-5">Select an option
					<Select items={types} bind:value={type} on:change={updatePeriod} on:change={calculate}/>
				</Label>
			</div>
			
			<p class="mt-5 text-color text-2xl font-semibold">
                You can withdraw 
                <span class="text-green-500 text-3xl font-semibold">${new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format((result))}
                </span> {type}<br> 
                Total of <span class="text-green-500 text-3xl font-semibold">{years*period} </span>
                payments of 
                <span class="text-green-500 text-3xl font-semibold">${new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format((totalAmountReceived))}</span>
                <br>
                Total Interest on Investment is <span class="text-green-500 text-3xl font-semibold">${new Intl.NumberFormat('en-IN', { maximumSignificantDigits: 3 }).format((totalInterestReceived))}</span>
            </p>
			

		</div>
	</div>
</section>

<style>
	.text-color{
		color:#808080;
    }

    .border-danger{
        padding: 5px 5px;
        font-size: large;
        border-left:5px solid rgb(175, 6, 6);
        background-color: rgba(241, 86, 86, 0.27);
    }
</style>