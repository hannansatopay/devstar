<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	export let data;
	
	let op=100;
	let dis=15;
	let prin;

	function discount(){
		var sp=Number(op*((100-dis)/100));
		var sav=Number(op-sp);
		let result="<p style='font-weight: bold'>Price after discount="+sp+"</p><p style='font-weight: bold'>You Saved="+sav+"</p>";
		prin.innerHTML=result;
	}
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<main>
    <div class="input">
            <form action="">
                   <p>Price before Disount</p><input type="number" bind:value={op} min="1">
				   <p>Discount</p><input type="number" bind:value={dis} min="1">
            </form>
            <button on:click={discount}>Calculate</button>
            <div bind:this={prin}></div>
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