<script>
  let cardColor = "pink";
  let textColor = "black";
  let fontFamily = "Arial, sans-serif";
  let fontSize = "16px";
  let message = "Your Message";

  let src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAOEAAADhCAMAAAAJbSJIAAABF1BMVEU3scD/6t3///8BLUYBN1k8s8D/6t7MzMw3sMH/3cnL6u3//v8qqbfd9fcoqbsprLyy4OMZPVYXRmVfvMf/0LwBN1oBLkXNzMr/+PPNy83+4tMBMU7/8OT/6Nn97Nz/6N798OkAGzv+ybMALlIAIkzW0s0AHDj83czL4dyl0dD+5Nf/2cf/vZ//0L/c6OFQsrzt/v7g4OB4gpLT1dlfZ3U5ip0AGj2Cv8GRwsXs7+us0s2Cvb5susCMyMvx59bS2dHk5ty/2dG00tOi1NZbtbiGytCc29/8w6jTvac5pqzuvadeoZ6jxcIrrbbh1MhkubrHwbKlua+6y8pxrq+Ps7AkaoMTW3dXX26pz9iJvshDX3EAEDc5h5uZJsZxAAAOnklEQVR4nO2di3/aRhLHpTiSFWeD3IttMFk94p4NOA00zQPLhcTxoym9kt6111591///77iZXUlIQgLt8tLmwy8JEBvwfpnZmdnV7lrTvnAZm27AyrUlVF9bQvW1JVRfW0L1tSVUX1tC9bUlVF9bQvW1JVRfW0L1tSVUX1tC9bUlVF9bQvW1JVRfW0L1tSVUX1tC9bUlVF8LEFoW/Asfxl9jX4U7Ax5E3zQMK+fl69IChNBwKwSBR8hkMByNwduE2Fr4GRiatTnGhWxoGKn/hvfAY4/7nXb7+qI3Zla1ElZeuxbph9ByNJ1m2zVSs/G9DO6fo05AXVfXqd8eEIa3QT9dxIbshvQGnUtQ5/se4Xz2oAt0ummacOt3B4T578YQF7GhodXIsB24j7jef7gY1wjpXfsusukM03X8a6Kl/Xm9kv3JaC2bdBpUdx7FajlXH64o4DHC6M4MhiQRecP7tdlUihBjqKaRYQCO6LQeJdQM2ZiX4q3jNJtNp92zIfIaEddafVbShpANem0KGF4SsKknZQJd9N33P/cwd0RG1LT15Q9ZLx0PAuaGrRSfyTofl5Oybuv9zyN7jHE3jMHWunqm5M+pDamDwTKGaDUdV/c8j0dQBEx5L7Pjx4uLzvXHzl2P2GvMkOKE2DLSoa4HPQ0oOEjTYWEFkiCPM9N8LTCxS9Hu1O/ePIWCJ/F+q5QwIX765JIyOzVj+4V2ixy0OYXn6CnRbmdAmCmxDfieK+uX4jY0LLJPHexvYZ5ItB5cFP6m+FqMLnZe/jRW8Fy1hz2sXS1rpelDmNDQyI0PjuiY3BPRPyfNhwfnraTtzvUcufgS0wGv7V72CYkq99VI3EvtIYUkATAtluMz5kkYcMo107nEZJHXpEG7T2qRIVcgYUK770OQgbrsnPFlFEWY0Dcju+YT8jvT9K8ub8crCzjlCcNEfRs4IcsEwmR2RMfLsV4OIH8+h+QlrN++JZu3IWvBCMcN2LRmygfNiYe2MC8UGG6Gy/rXUNlhib7sIl3s7SzSdsPA6LiZRoYe2nJiG4kQQp8MbkYkHC8vs6YT8VIDowzrg1M2ikrwlsPjpBgg1rfwCjfo9HAwaRnLTI8iNrS0XxqA5rnudAsZYCK8iBLqrod29NtY0/Eftn5CSyNdx8xmh7CFLAs6kwaLAqIRAdLRIXsMb/kk1roJDV6sYUPSjYvq0OncISbPDLOk7gd7dwbRjHi4vB5CzRr4RY1jgIvxxWKcfuPBk7vaUibpBCIN6RY0CStRSBHC4aWIEPqBCyOQB09ucW5yfTa0O6auT8cYRthi1dtSACdy6RNiLT5QLv8GPd8toIAKTpeMoYV0+HYeHayzH5J2PkWUHCVMWPQKk2VH9JihvXiBU+odDOgNxWGmBEr0EZjnTdQ5m4HDu9RTWGWTfB29rdnCsox0tVCK0CoOM6XlMqpzB0KIH1wFvu8jLgwgzwGUoUaQHJhNmO+L64eajA0tw+5TaTY+bwp0HuSAlBrUY0ZtMYvGqNHr6AMJPSEyhJo27kqncyxZ0VrnEd7jx5P2PG40fGqGnK0IlvGa2c+jLKGRnqks1w81HNdLmxD5Xrw4B54JWeKWqcEFzkspDor9hhQfI7QyjZ8vLEhlLajr5+fIxwjFlbR3WcJMlVDKhtALTUkvRfsdnJycvHzRlCEUF+uHooRGrWvKOSl2wBcIeHJy0KowoTVw5Qgd7IAHBxzxRYUJ2dSFhNBDXx4wVZywF0hVnQ56aCwkFA4b6yC0cFBBZUbt0AcPvvl0EiNWlRC+TwJx+0Ged5ovvkGdHLxkrlrRSIOpZSBVsHnNRyefGOInbsOKEoJqcnGm2WS9DyE/MTNWNNLgSERu2NSMIkzIWFUbAuCQSqXCg08HacaqEoKTiuPBR/L+x7D/vYQ/J9gdD6pJqBnCkZTP6Q9HESLDPPnpp5O1JAtxQii6RQMNlHheQKzRxIrw9/M/fl4HnwzhR1f0OpJrut7NGEqhBOLBwcXTShJaLN2LXynze/hDeklH/fxLNb3UekpNUS+FF7RttvKA/PObuGp7eVHNqs3ugE0EER2TzeSiyL9OQsSXB79KDNjXQEjaEqMKsxvNd1n2bz9GVqxopBkFpujgF57dmSzpMkb//szGUJ/71bThgIoTopPGuxTgAfn+18+fP/yGsXQNiIKE0A35RRIhBfGkrMF/mk1GxK4mYW1PZlzRrSW3mESL1iqXD9k3IBtKXFO6tvMua1bQhpizKVQ0nqAd6UXu9ooqEhrWnSsxj0j7yhBqFsv3niAivVWDEJ9Ua+um8DSbSXu5b1g5QhS5Yk0WI8SyWxVCayw1y6aKDXHR7lM5wkHusrvKEeKzhnKEQzVsiOrIXby/HKtCaF9LzQVPBk/VJoSURiQmElGNXl5HrByh/NV7lw7zVqNVjxCHv1KEppPrphUktHoNKUKoavpKeKlh3cqFUtdzuyM1COUuHGKVR2+m/bSKhENXch2UB35Ksm9fPUKtdiO70ss0zWAw2dhcUUJDsy+ll/3CC4OBzY4BiX9ABQlJW57Q9HS/j7Omk9MUKkeoLbRcj+0s/Ej4ORLVJQwWW37v0uBubCcJqzbn3ZNfUxqJdofE5vvRjAoSPl2cEDfBXv7C92xXbkbY0vqLE5q6A5BXl3c9Qjjhys0oQGh3xK9YTBGaLu4vMCnttq8bjWp5KdsuuoR9MJ4ZLgTA/UwusIL8hHB192YIF0sWoczohh9FkL93Eb6MpNi82Mjy1n5CMntsZxAGy96qNefTkF6enyG00lTFXjqg3vxmLRXRM/1gb1Htj7WSu4Ks4VoJ0X2hw9L9Wq1m2zW7Jis7e7JYISH5uEa+CNJ13OB2DLWsgSejadFN6j+zvhyehpdSMWF3vd2QXQPCy1xBjzXTYkdllFHqWdz/5hGykR1uqJRboi9KllkLYbZtbZnnKuS8FTsPp9ehurfcfaFFhNmrW8F4qcec5BHC13rfPgCXWY8Ns49ob6lngOR6qQ2ADxoLbBoVAcRaIFnkmAFZ6jGLOYQGWhDUWPru7AJGv5HSTe6FnWUShoCIuBZCmgbcJ4ud5lhMGG8MjwBxFyvfAro0GL5C2uP7v/kxShkTfntDlnycUkzID/wztPEEkCMujY7tP8eUZ+KgkfpBt91mm5P39p4w7e3/cNezi9u6GGF47A2kiW+TlX0j5ywaWUD8x+IzwLVvBjAoJjX4k9TS8bSUxzM3ZRZM7s9dXrhhh+yw01l6pDbxxMlhO9ZSzxaaJgQD/v7H04SLLjncuLrj0gCP2tNSM8XJoz5XcRhWoh9av3/99XexAR8vhJiwfPSQNrqd8PygxMeaPrh1VYTh6YW/f/3w8O/fZfiicCNz6kV0xhlejAr4EYIbkBGt/0TAhzFiahZBDJHbzNOj11B61e4MxrWVHao3lzABeHg4seKCfZGlOuh33euLwSRGboIx7BIWsyAwAuKbRRG5X9Lu/vB2xM+0MsLhwqpOf5xHaMWAHPG7rJsKpX7TRNPdDMYkPmVko6eyG2lAICx21BmpMT6ARseLFTdRzJys8o5QN0GYAuSUEhHVDA8Gcmm3P7I3Za88oZdmACHg5EXUK9MpJgyPwNTd4K7GvKI6jAYHPEwBPnw47aivdk9n9EUTS2pTb3TYGZ0bPGN+WsaUBdOOGpnyVX1393RWP4RBFm334iMPq2TDv6UtGIabjBVf7e4eH89AxCgT9Gt8PVt16FCMcJovY0UARB2fTocbky1LMB1/P3fN5eaVQxgpCjePI8D6MfbFzPUjB88p98CApELRJaliwsPYUUNAIDw+Pp0aEgOwR9sju2reGamQcBJRI8DdOt5kIyqe2EpvyAaLljma4aWH3IqvjndjxDp31LQJ3aDPQ2g1EWcRsnDzandCuMsjahrR7WKOsIzN1NXzNaMfIuHDd/95Xd/N6NTnk4wYRHW3PaqsgzIV90N2+2zn7A0i1iNDHtd3o4iKQ0CP7o02+nty5ms24bOdnZ3nb14DVz1BeFw/Zb+ABaIMvcxeVK6cZvRDDrhzBIixCcGA9Sj1u55JO2P+K1U2jTFDswgZ4M7Rzrs3r4+T4SZ0VN2llxXOEpFyCQ/ZPw6Iep4MN8dRRDX1drjUeaO/G2+eimyIgEcxIliRsSXiDZThQc6K/Oqp0EsnFkSd8b4YOyuG19NBVVNgSkVjCx5kYsJniFhPZkYIOX/Wqh5HUQU2TLookB6xvoild4yHuh5VPcxoRYTPdlKEiHh0hnkxEW4gLdb/VMCIuV6a7oNxRGXhJipPjzHc3G+6+SWUIcRiFF30aBrwKEZEvDqm/nuiQKjJsWG+BUMr1rGCO+aOer+EE9NXr2lCHmSmjYh2PcNww7NF/fV9djVuNTVFmO+iUe5gNSp66W79vrLzFmllCYtdNOGoIGbB6gdSLU14mM2DMxDv8cJS9ctuLWvDYhediA2J+2MFoihXSHhYykVZZ8TUf082/Mu2BZS0YQlA5sRn/+W/gXvTbS+nBGEZwBDxD81QIsqgIi/l48H8TJiHuLrfyLhsIeFhcS06zcc+hCOwoioCwrAWFdP/3m665WUVeqkYIBThb5XpiNxL5yf6tBBw0y0vK2ZDURc9UwiQEUoAairUa1xAKBJFUc//2nSjhWRoXwlaUKU+iEJCoSijGiASzh9OZABVyRNcgl569pehxrh3opBwthmPorszDDJqAZayYYyvWBTlEvFSyIOqDCgSKk949PytgnwihGdqApYnVDCKcpUlfKdikGEqSahoH0SVyxbv1AUsZ0O0oIpdkKkMIQP8kgmhVFNmUiZH8wkVDjJM8whVrWQmmkeoaiUz0RzC53+pDjiHkFlQ3SDDNJMQxoMKJ8JQOYSJaUPV6VCFNjzCPvhFEyqfByMVEr57q8hqknkqIvwSoihXAaH6iT6SlRdLv5w+qBURqjzgzSqPUO0Bb1Z5hApdoy+hHEI2bbjpdi1PgPLVTrRQCMu1ox2woKHi7H2uwFjG/wFIT9Mf4oVMMwAAAABJRU5ErkJggg==";
  let alt = "random img";

  function changeBack(event) {
    cardColor = event.target.value;
  }

  function changeText(event) {
    textColor = event.target.value;
  }

  function changeFont(event) {
    fontFamily = event.target.value;
  }

  function changeFontSize(event) {
    fontSize = event.target.value;
  }

  function updateMessage(event) {
    message = event.target.value;
  }

  function addImage(event) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function () {
        src = reader.result;
      }
      reader.readAsDataURL(file);
    }
  }
	

  let location = '';
  function addLocation() {
    location = document.getElementById('locationInput').value;
  }
	
</script>


<main>
  <div class="nav">
    <h1>Create Unique Business Cards!</h1>
    <img src={src} alt={alt} />
  </div>

  <div class="body">
    <div class="info">
      <div class="info1">
        <label for="colorSelect">Back Color:</label>
        <select id="colorSelect" on:change={changeBack}>
          <option value="lightblue">Light Blue</option>
                  <option value="pink">Pink</option>
                  <option value="lightgreen">Light Green</option>
                  <option value="lightyellow">Light Yellow</option>
								  <option value="purple">Purple</option>
								 <option value="darkorange">Dark Orange</option>
								<option value="darkgreen">Dark Green</option>
								 <option value="mediumaquamarine">Medium AquaMarine</option>
								<option value="	orange">Orange</option>
								<option value="black">Black</option>\
								<option value="white">White</option>
								<option value="darkcyan">Dark Cyan</option>
								<option value="powderblue">Powder Blue</option>
								<option value="plum">Plum</option>
								<option value="maroon">Maroon</option>
        </select>
      </div>

      <div class="info1">
        <label for="textColorSelect">Text Color:</label>
        <select id="textColorSelect" on:change={changeText}>
         <option value="black">Black</option>
                  <option value="red">Red</option>
                  <option value="green">Green</option>
                  <option value="white">White</option>
								<option value="midnightblue">Midnight Blue</option>
								<option value="white">White</option>
								<option value="powderblue">Powder Blue</option>
								<option value="plum">Plum</option>
								<option value="darkcyan">Dark Cyan</option>
									<option value="maroon">Maroon</option>
								<option value="lightyellow">Light Yellow</option>
								<option value="darkorange">Dark Orange</option>
								 <option value="mediumaquamarine">Medium AquaMarine</option>
											<option value="darkgreen">Dark Green</option>
        </select>
      </div>

      <div class="info1">
        <label for="fontSelect">Font Style:</label>
        <select id="fontSelect" on:change={changeFont}>
         <option value="Arial, sans-serif">Arial</option>
	                  <option value="Helvetica, sans-serif">Helvetica</option>
	                  <option value="Times New Roman, serif">Times New Roman</option>
	                  <option value="Courier New, monospace">Courier New</option>
									  <option value="Verdana, sans-serif">Verdana</option>
								    <option value="Georgia, serif">Georgia</option>
								    <option value="Tahoma, sans-serif">Tahoma</option>
								    <option value="Palatino, serif">Palatino</option>
								    <option value="Lucida Sans, sans-serif">Lucida Sans</option>
								    <option value="Book Antiqua, serif">Book Antiqua</option>
								    <option value="Arial Black, sans-serif">Arial Black</option>
								    <option value="Comic Sans MS, cursive">Comic Sans MS</option>
								    <option value="Garamond, serif">Garamond</option>
								    <option value="Copperplate, sans-serif">Copperplate</option>
								    <option value="Impact, sans-serif">Impact</option>
								    <option value="Didot, serif">Didot</option>
        </select>
      </div>

      <div class="info1">
        <label for="fontSizeSelect">Font Size:</label>
        <select id="fontSizeSelect" on:change={changeFontSize}>
          <option value="12px">Small</option>
        <option value="16px">Medium</option>
        <option value="20px">Large</option>
        <option value="24px">Extra Large</option>
        <option value="28px">XXL</option>
        <option value="32px">Huge</option>width: 100%;
      height: 250px;
      background-color:#002244;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
		  font-family: fantasy;
		 
        </select>
      </div>

      <div class="info1">
        <label for="messageInput">Business name:</label>
        <input type="text" id="messageInput" on:input={updateMessage} bind:value={message} />
      </div>

      <div class="info1">
        <label for="imageInput">Add Image:</label>
        <input type="file" id="imageInput" accept="image/*" on:change={addImage} />
      </div>

    <div class="card">
      <div class="card1" style="background-color: {cardColor}; color: {textColor}; font-family: {fontFamily}; font-size: {fontSize};">
        <p>{message}</p>
        <img src={src} alt="Uploaded Image" />
        <!-- <p>{location}</p> -->
      </div>
    </div>
  </div>
</main>


<style>
  *{
      width: 100%;
      padding: 0;
      margin: 0;
      text-decoration: none;
      box-sizing: border-box;
      background-color: #e6e6e6;
  }

  h1{
      color:#002244;
      /* background-color: #fac769; */
      font-size: 3rem;
      text-align: center;
		background-color:powderblue;
  }

  .nav{
      width: 100%;
      height: 250px;
      background-color:#002244;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;
		  font-family: fantasy;
		 
  }

  img{
      width: 40%;
      height: 100%;
  }

  .body{
      width: 100%;
      /* height: 100vh; */
      margin-top: 1.5rem;
      padding: 2rem;
      background-color: #e6e6e6;
  }

  .info{
      width: 100%;
      padding: 1.5rem;
      /* margin-bottom: 2rem; */
      border: 1px solid rgba(0, 0, 0, 0.162);
      /* box-shadow: 1px 1px 1px rgb(101, 97, 97);          */
      display: flex;
      flex-direction: row;
      justify-content: space-evenly;
      align-items: center;
      flex-wrap: wrap;
      
  }

  .info1{
      width: 35%;
  }

  label{
      font-size: 1.5rem;
      font-weight: 500;
  } 

  select{
      font-size: 1.2rem;
      font-weight: 500;
      padding: 0.75rem;
      margin: 0.75rem;
      border-radius: 0.5rem;
      border: 2px solid black;
      background-color: white;
  }

  input{
      font-size: 1.2rem;
      font-weight: 500;
      padding: 0.75rem;
      margin: 0.75rem;
      font-size: 1.2rem;
      border-radius: 0.5rem;
      border: 2px solid black;
      background-color: white;
  }

  .card{
      width: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-content: center;
  } 

  .card1{
    width: 300px;
    height: 200px;
    border: 5px solid rgba(150, 135, 135, 0.171);
    margin: 3rem;
    padding: 2rem;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  p{
    background-color: transparent;
    text-align: center;
  }
</style>
