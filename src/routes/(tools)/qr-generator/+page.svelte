<script>
    let inputText = "";
    let textPresent = false;
    let API_URL = 'https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=';
    function dataSubmit(e){
        e.preventDefault();
        if(inputText !== ""){
            textPresent = true;
            API_URL += inputText;
        }
    }
</script>

<style>
    img {
        margin-top: 100px;
        margin-bottom: 30px;
    }
    a {
        font-weight: 700px;
        font-size: 30px;
        color: black;
    }
    #textInput {
        width: 70%;
        height: 40px;
        color: #484848;
        border-width: 1.5px;
        border-style: solid;
        border-color: black;
        padding: 3px;
        font-weight: 700;
    }
    #btn {
        border-radius: 3px;
        background-color: black;
        color: whitesmoke;
        font-weight: 700;
        cursor: pointer;
    }
</style>

<div>
    <center>
        <h1>QR CODE GENERATOR</h1>
        <form on:submit={dataSubmit}>
            <input id="textInput" type="text" placeholder="Enter any text or URL..." bind:value={inputText} />
            <input id="btn" type="submit">
        </form>
        {#if textPresent}
            <img src={API_URL} alt="QR Code" /><br>
            <a href={API_URL} download>Download</a>
        {/if}
    </center>
</div>