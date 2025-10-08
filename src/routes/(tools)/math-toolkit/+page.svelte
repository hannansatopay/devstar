<!DOCTYPE html>
<html lang="en">
<head>
   <meta charset="UTF-8">
   <meta http-equiv="X-UA-Compatible" content="IE=edge">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Number System Converter</title>
   <!--<link rel="stylesheet" href="style.css">-->
   <!--<script src="script.js" defer></script>-->
</head>
<body>

  <!--</header>-->
   <main>
      <h1 style="color:white;">Number System Converter</h1>
      <div id="select-container">
         <select id="from-select">
            <option value="from-binary">Binary</option>
            <option value="from-decimal">Decimal</option>
            <option value="from-hexadecimal">Hexadecimal</option>
            <option value="from-octal">Octal</option>
         </select>
         <span style="color:white">to</span>
         <select id="to-select">
            <option value="to-binary">Binary</option>
            <option value="to-decimal">Decimal</option>
            <option value="to-hexadecimal">Hexadecimal</option>
            <option value="to-octal">Octal</option>
         </select>
      </div>
      <div id="input-container">
         <input type="text" id="from-input" placeholder="Binary Number">
         <span id="error"></span>
      </div>
      <button id="convert-button">Convert</button>
      <input type="text" id="to-input" placeholder="Binary Number" readonly>
   </main>
</body>

<script>
const fromSelected = document.getElementById("from-select");
const toSelected = document.getElementById("to-select");
const from = document.getElementById("from-input");
const to = document.getElementById("to-input");
const error = document.getElementById("error");
let fromNS = "Binary", toNS = "Binary";
fromSelected.addEventListener("change", function () {
   fromNS = fromSelected.options[fromSelected.selectedIndex].text;
   from.placeholder = fromNS + " Number";
});
toSelected.addEventListener("change", function () {
   toNS = toSelected.options[toSelected.selectedIndex].text;
   to.placeholder = toNS + " Number";
});
from.addEventListener("input", function () {
   error.style.display = "none";
});
let fromValue;
document.getElementById("convert-button").addEventListener("click", function () {
   switch (fromNS) {
      case "Binary":
         fromValue = from.value;
         if (/^[01]*$/.test(fromValue)) {
            switch (toNS) {
               case "Decimal": to.value = parseInt(fromValue, 2);
                  break;
               case "Hexadecimal": to.value = parseInt(fromValue, 2).toString(16).toUpperCase();
                  break;
               case "Octal": to.value = parseInt(fromValue, 2).toString(8);
                  break;
               default: to.value = fromValue;
            }
         } else {
            error.style.display = "inherit";
            error.innerText = "Invalid " + fromNS + " Number";
            to.value = "";
         }
         break;
      case "Decimal":
         fromValue = from.value;
         if (/^[0-9]*$/.test(fromValue)) {
            switch (toNS) {
               case "Binary": to.value = Math.abs(fromValue).toString(2);
                  break;
               case "Hexadecimal": to.value = Math.abs(fromValue).toString(16).toUpperCase();
                  break;
               case "Octal": to.value = Math.abs(fromValue).toString(8);
                  break;
               default: to.value = fromValue;
            }
         } else {
            error.style.display = "inherit";
            error.innerText = "Invalid " + fromNS + " Number";
            to.value = "";
         }
         break;
      case "Hexadecimal":
         fromValue = from.value;
         if (/^[0-9a-fA-F]*$/.test(fromValue)) {
            switch (toNS) {
               case "Binary": to.value = parseInt(fromValue, 16).toString(2);
                  break;
               case "Decimal": to.value = parseInt(fromValue, 16);
                  break;
               case "Octal": to.value = parseInt(fromValue, 16).toString(8);
                  break;
               default: to.value = fromValue;
            }
         } else {
            error.style.display = "inherit";
            error.innerText = "Invalid " + fromNS + " Number";
            to.value = "";
         }
         break;
      case "Octal":
         fromValue = from.value;
         if (/^[0-7]*$/.test(fromValue)) {
            switch (toNS) {
               case "Binary": to.value = parseInt(fromValue, 8).toString(2);
                  break;
               case "Decimal": to.value = parseInt(fromValue, 8);
                  break;
               case "Hexadecimal": to.value = parseInt(fromValue, 8).toString(16).toUpperCase();
                  break;
               default: to.value = fromValue;
            }
         } else {
            error.style.display = "inherit";
            error.innerText = "Invalid " + fromNS + " Number";
            to.value = "";
         }
         break;
   }
});
</script>

<style>
@import url("https://fonts.googleapis.com/css2?family=Poppins&display=swap");
* {
  font-family: "Poppins", sans-serif;
  margin: 0;
  padding: 0;
}
 .navbar{
  width: 100%;
  margin: auto;
  padding: 35px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: white;
 }
 .logo{
  width: 120px;
  cursor: pointer;
  background-color: white;
 }
 .navbar ul li{
  list-style: none;
  display: inline-block;
  margin: 0 20px;
  position: relative;
 }
 .navbar ul li a{
  text-decoration: none;
  color: #000;
  text-transform: uppercase;
 }
 .navbar ul li::after{
  content: '';
  height: 3px;
  width: 0;
  background: #009688;
  position: absolute;
  left: 0;
  bottom: -10px;
  transition: 0.5s;
 }
 .navbar ul li:hover::after{
  width: 100%;
 }
body,
main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
body {
   background-image: linear-gradient(214deg,
      #FFFFFF 14%,
      #F7C9F8 46%,
      #A0AEA9 86%);
      background-image: url(num.png);
  min-height: 100vh;
}
main {
  background-image: linear-gradient(325deg, #101010, #101010, #101010);
  padding: 120px 100px;
  border-radius: 10px;
}
#select-container {
  display: flex;
  justify-content: space-evenly;
  align-items: center;
}
select {
  margin: 10px 20px;
  padding: 7px 15px;
  outline: none;
}
input {
  background-color: #fff;
  min-width: 350px;
  margin: 15px;
  padding: 15px;
  border: none;
  border-radius: 8px;
  outline: none;
  transition: 0.5s;
}
input:focus {
  box-shadow: 0px 6px 10px 1px rgb(255, 255, 255);
}
#convert-button {
  padding: 7px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: 0.3s transform;
  background-color: #fff;
}
#convert-button:active {
  transform: scale(0.9);
}
#input-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
#error {
  display: none;
  color: #f00;
  font-size: small;
  margin: 0 0 10px 30px;
  text-align: start;
}
#written-by-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border: 2px solid #000;
  border-radius: 10px;
  padding: 1rem;
  margin-top: 5px;
}
#written-by-container a {
  color: #000;
}
</style>
</html>