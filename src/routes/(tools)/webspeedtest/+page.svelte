<script lang='ts'></script>


<html lang='en'>
<head>
  <title>Web Page Speed Test</title>
  <link rel="manifest" href="manifest.json">
  <link rel="preload" href="https://www.google.com">
  <meta name="viewport" content="width=device-width initial-scale=1.0">
  <meta charset = "UTF-8">
  <style>
     body {
      /*background: linear-gradient(to left, white 5%, #000099 80%);*/
      color: white;
      display: block;
      
      padding: auto;
      margin: auto;
      align-items: center;
      font-family: lucida console;
    }

    h3 {
  font-family: sans-serif;
  font-weight: bold;
  font-size: 24px;
  margin-left: 825px;
}
.animate-charcter
{
   text-transform: uppercase;
  background-image: linear-gradient(
    -225deg,
    #231557 0%,
    #44107a 29%,
    #ff1361 67%,
    #fff800 100%
  );
  background-size: auto auto;
  background-clip: border-box;
  background-size: 200% auto;
  color: #fff;
  background-clip: text;
  text-fill-color: transparent;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: textclip 2s linear infinite;
  display: inline-block;
     
}

@keyframes textclip {
  to {
    background-position: 200% center;
  }
}

     input {
      color: black;
     }
     #urlInput {
  background-color: #232528;
  color: white;
  border: none;
  border-radius: 32px;
  padding: 10px;
  font-size: 16px;
  margin-left: 600px;
}

input:focus {
  outline: 1px solid #ffffff;
  box-shadow: 0 0 10px #000000;
}
input::placeholder {
  color: grey;
}

input:hover {
  background-color: #232528;
}
    button {
      transition-duration: 0.8s;
      box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
      border: none;
      border-radius: 32px;
      padding: 10px 20px;
      font-size: 16px;
      transition: background 0.3s ease;
}
p {
  justify-content: center ;
  margin-left: 450px;
  margin-bottom: 50px;
}
p:hover {
color: powderblue;
}
#cont {
      display: inline-block;
      position: relative;
    }

    button:hover {
      background: linear-gradient(to right, blue 5%, #FF0000 80%);
      color: white;
      box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
      
    }
    button {
      color: hsl(0, 0%, 28%);
    font-size: 15px;
    font-weight: bold;
    font-family: Lucida;
    letter-spacing: 7px;
    cursor: pointer;
    transition: 0.5s ease-out;
    margin-right: 2px;
    }
    @keyframes gradientMove {
      0% {
        background-position: 0% 50%;
      }
      100% {
        background-position: 100% 50%;
      }
    }
    .rst {
      transition-duration: 0.4s;
      color: violet;
      content: center;
    }
    .rst:hover {
      background: linear-gradient(to right, blue, #FF0099);
      box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
    }
    #reload:hover {
      background: linear-gradient(to right, #6f4e37 , #4291db);
      box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
    }
    #reload {
      transition-duration: 0.4s;
      color: violet;
      content: center;
    }
    p {
      font-family: sans-serif;
      font-size: 22px;
      color: pink;
    }

    a {
      color: black;
      text-decoration: none;
    }

    a:hover {
      color: #ffff00;
    }
    #speed-test-results {
      margin: 0 auto;
      margin-top: 100px;
      width: 80%;

    }
    #speed-test-results {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 20px;
}
    #speed-test-results ul {
      list-style-type: circle;

      display: block;
      border: none;
      border-radius: 32px;
      padding: 10px;
      font-size: 16px;
    }
    
    #speed-test-results li {
      margin-bottom: 10px;
      display: block;
    }
    
    #speed-test-results li h3 {
      font-size: 1.2em;
      font-weight: bold;
    }
    
    #speed-test-results li p {
      font-size: 1em;
    }
    
    .score-good {
      color: green;
    }
    
    .score-moderate {
      color: orange;
    }
    
    .score-poor {
      color: red;
    }
    /* Add CSS for the result cards */
/* Add CSS for the result cards */
.result-card {
  background: linear-gradient(90deg, rgba(24,17,136,1) 0%, rgba(0,0,1,1) 20%, rgba(2,5,70,1) 89%);
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  padding: 16px;
  margin-bottom: 16px;
  transition: background-color 0.3s, box-shadow 0.3s;
  animation: wipe-in 0.5s ease-in-out;
}

.result-card:hover {
  background: linear-gradient(90deg, rgba(66,8,18,1) 2%, rgba(0,0,1,1) 56%, rgba(41,5,12,1) 95%); /* Darken the background on hover */
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.4); /* Add a stronger shadow on hover */
}

.result-card h3 {
  font-size: 1.2em;
  margin-bottom: 8px;
  color: #fff; /* Text color */
}

.result-card p {
  font-size: 1em;
  margin: 0;
  color: #ccc; /* Text color */
}

.result-card .score-good {
  color: green;
}

.result-card .score-moderate {
  color: orange;
}

.result-card .score-poor {
  color: red;
}
@keyframes wipe-in {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

.loading-container {
      display: none;
      justify-content: center;
      align-items: center;
      height: 100%;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 9999;
    }

    .loading-circle {
      border: 8px solid #f3f3f3;
      border-top: 8px solid #3498db;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 2s linear infinite;
    }
    
  </style>
</head>
<body>
  <p> This is an awesome web page, where users can find the speed of the different website/pages on a click!<br> Especially a motivating and an hands-on experience website for cybersecurity professionals too!! <br>Moreover, very fast paced and perfect results web page!<br> And, please note: Do use https:// or http:// or else website wouldn't work!</p>
  <h3 class='animate-charcter'><i>Web Page Speed Test</i></h3>
  <input type="text" placeholder="https://www.ex.com/" id='urlInput'>
  <span id="error" class="error-message"></span>
  <div id='cont'>
  <button onclick="startSpeedTest()">Start Speed Test</button>
  </div>
  <button onclick="resetForm()" class='rst'>Reset</button>
  <button type="button" onclick="location.reload();" id='reload'>Reload Page</button>
  <div id="speed-test-results"></div>
   <!-- Loading circle container -->
   <div class="loading-container" id="loadingContainer">
    <div class="loading-circle"></div>
  </div>
  
  
</body>
<script lang='ts'>

function startSpeedTest() {
  // Show the loading circle
  const loadingContainer = document.getElementById('loadingContainer');
      loadingContainer.style.display = 'flex';
  // Perform the speed test and display the results.

  // Get the URL from the input field.
  const url = document.querySelector('input[type="text"]').value;


  // Make a request to the PageSpeed Insights API to get the speed test results.
  fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}`)
    .then(response => response.json())
    .then(results => {
       // Hide the loading circle
       loadingContainer.style.display = 'none';
      // Display the speed test results in the results div.
      const speedTestResults = document.querySelector('#speed-test-results');
      speedTestResults.innerHTML = ''; // Clear existing results

      // Convert JSON to HTML and append to the results div.
      const htmlResults = convertJSONToHTML(results.lighthouseResult.audits);
      htmlResults.forEach(item => {
        speedTestResults.appendChild(item);
      });
    });
}


function convertJSONToHTML(jsonResults) {
  const htmlResults = [];

  for (const key in jsonResults) {
    const result = jsonResults[key];

    const cardElement = document.createElement('div');
    cardElement.classList.add('result-card');

    const h3Element = document.createElement('h3');
    h3Element.textContent = key;

    const pElement = document.createElement('p');
    pElement.textContent = `Score: ${result.numericValue}`;

    // Add color class based on the score value
    if (result.numericValue >= 90) {
      pElement.classList.add('score-good');
    } else if (result.numericValue >= 50) {
      pElement.classList.add('score-moderate');
    } else {
      pElement.classList.add('score-poor');
    }

    

    cardElement.appendChild(h3Element);
    cardElement.appendChild(pElement);

    htmlResults.push(cardElement);
  }

  return htmlResults;
}
function resetForm() {
  // Clear the input field
  const urlInput = document.getElementById('urlInput');
  urlInput.value = '';
}
/*No Copyrights please - - by Priyant*/
</script>

</html>
