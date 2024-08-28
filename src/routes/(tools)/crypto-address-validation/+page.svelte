<script>
    let address = '';
    let cryptoType = 'bitcoin';
    let result = '';

    const cryptoOptions = [
        { value: 'bitcoin', label: 'BTC Bitcoin', icon: 'https://static-ssl.minerstat.farm/96/btc.png' },
        { value: 'ethereum', label: 'ETH Ethereum', icon: 'https://static-ssl.minerstat.farm/96/eth.png' },
        { value: 'litecoin', label: 'LTC Litecoin', icon: 'https://static-ssl.minerstat.farm/96/ltc.png' },
        { value: 'ripple', label: 'XRP Ripple', icon: 'https://static-ssl.minerstat.farm/96/xrp.png' },
        { value: 'bitcoin-cash', label: 'BCH Bitcoin Cash', icon: 'https://static-ssl.minerstat.farm/96/bch.png' },
        { value: 'cardano', label: 'ADA Cardano', icon: 'https://static-ssl.minerstat.farm/96/ada.png' },
        { value: 'polkadot', label: 'DOT Polkadot', icon: 'https://static-ssl.minerstat.farm/96/dot.png' },
        { value: 'dogecoin', label: 'DOGE Dogecoin', icon: 'https://static-ssl.minerstat.farm/96/doge.png' },
    ];

    function validateAddress(address, cryptoType) {
        let regex;

        switch (cryptoType) {
            case 'bitcoin':
                regex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/;
                break;
            case 'ethereum':
                regex = /^0x[a-fA-F0-9]{40}$/;
                break;
            case 'litecoin':
                regex = /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/;
                break;
            case 'ripple':
                regex = /^r[1-9A-HJ-NP-Za-km-z]{25,34}$/;
                break;
            case 'bitcoin-cash':
                regex = /^[qQpP][a-zA-Z0-9]{41}$/;
                break;
            case 'cardano':
                regex = /^addr[a-zA-Z0-9]{58}$/;
                break;
            case 'polkadot':
                regex = /^1[a-zA-Z0-9]{47}$/;
                break;
            case 'dogecoin':
                regex = /^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/;
                break;
            default:
                return false;
        }

        return regex.test(address);
    }

    function handleSubmit() {
        if (validateAddress(address, cryptoType)) {
            result = `Valid ${cryptoType} address.`;
        } else {
            result = `Invalid ${cryptoType} address.`;
        }
    }
</script>
<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
   

    <div class="container">
        <h1>Bitcoin wallet address validator</h1>
        <p>Enter the BTC wallet address to check for valid syntax</p>
        <form on:submit|preventDefault={handleSubmit}>
            <div class="form-row">
                <div class="select-wrapper">
                    <select id="crypto-type" bind:value={cryptoType}>
                        {#each cryptoOptions as option}
                            <option value={option.value}>
                                {option.label}
                            </option>
                        {/each}
                    </select>
                </div>

                <input type="text" id="address" placeholder="Enter the wallet address" bind:value={address} required />

                <button type="submit">Check</button>
            </div>
        </form>
        {#if result}
            <div class="result" class:valid={result.startsWith('Valid')} class:invalid={result.startsWith('Invalid')}>
                {result}
            </div>
        {/if}
    </div>
</div>


<style>
    body {
        background-color: #1e1e2f;
        color: #d1d1e0;
        font-family: Arial, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        width: 100%;
        height: 100%;
        margin: 0;
    }

    .card {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        height: 100%;
    }

    .container {
        margin: 0 auto;
        padding: 20px;
        border: 1px solid #333;
        border-radius: 8px;
        background-color: #2c2c3e;
        box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
        text-align: center;
    }

    h1 {
        color: #ffffff;
        margin-bottom: 8px;
    }

    p {
        color: #cccccc;
        margin-bottom: 24px;
    }

    form {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .form-row {
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #ffffff;
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .select-wrapper {
        position: relative;
        margin-right: 10px;
    }

    select {
        appearance: none;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 4px;
        cursor: pointer;
        background: #fff url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEgNkwxMCAxNkwxOSAyIiBzdHJva2U9IiM0RjRGNzgiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+Cjwvc3ZnPgo=') no-repeat right 10px center;
        background-size: 12px;
    }

    select option {
        display: flex;
        align-items: center;
        padding: 10px;
    }

    select option::before {
        content: "";
        display: inline-block;
        width: 20px;
        height: 20px;
        background-size: contain;
        background-repeat: no-repeat;
        margin-right: 8px;
    }

    option[value='bitcoin']::before {
        background-image: url('https://static-ssl.minerstat.farm/96/btc.png');
    }

    option[value='ethereum']::before {
        background-image: url('https://static-ssl.minerstat.farm/96/eth.png');
    }

    option[value='litecoin']::before {
        background-image: url('https://static-ssl.minerstat.farm/96/ltc.png');
    }

    option[value='ripple']::before {
        background-image: url('https://static-ssl.minerstat.farm/96/xrp.png');
    }

    option[value='bitcoin-cash']::before {
        background-image: url('https://static-ssl.minerstat.farm/96/bch.png');
    }

    option[value='cardano']::before {
        background-image: url('https://static-ssl.minerstat.farm/96/ada.png');
    }

    option[value='polkadot']::before {
        background-image: url('https://static-ssl.minerstat.farm/96/dot.png');
    }

    option[value='dogecoin']::before {
        background-image: url('https://static-ssl.minerstat.farm/96/doge.png');
    }

    input {
        padding: 12px;
        border: 1px solid #ccc;
        border-radius: 4px;
        margin-right: 10px;
        flex-grow: 1;
        width:480px;
    }

    button {
        background-color: #4CAF50;
        color: white;
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
    }

    button:hover {
        background-color: #45a049;
    }

    .result {
        margin-top: 20px;
        font-size: 18px;
        text-align: center;
    }

    .valid {
        color: #28a745;
    }

    .invalid {
        color: #dc3545;
    }
</style>
