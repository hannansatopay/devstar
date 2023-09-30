<script>
    let start=1000;
    let year = 15;
</script>
<h1>Amortization Calculator</h1>
<form action="">
    Loan Amount<input type="number" class="sign" bind:value={start}>
    Loan Term<input type="number"  bind:value={year} placeholder="Year">
    <input type="number" placeholder="month">
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
</style>