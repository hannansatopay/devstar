<script>

	import { blank_object } from "svelte/internal";

</script>

<html lang='en'>
<head>
  <title>Web Page Speed Test</title>
  <link rel="manifest" href="manifest.json">
  <link rel="preload" href="https://www.google.com">
  <meta name="viewport" content="width=device-width initial-scale=1.0">
  <meta charset = "UTF-8">
  <style>
     body {
      background: linear-gradient(to left, white 5%, #000099 80%);
      color: white;
      display: block;
      
      padding: auto;
      margin: auto;
      justify-content: center;
    }

    h1 {
      font-family: sans-serif;
      font-weight: bold;
      color: pink;
      
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
}

input:focus {
  outline: 1px solid #ffffff;
  box-shadow: 0 0 10px #000000;
}
input::placeholder {
  color: #e6e6e6;
}

input:hover {
  background-color: #232528;
}
    button {
      transition-duration: 0.8s;
      box-shadow: 0 8px 16px 0 rgba(0,0,0,0.2), 0 6px 20px 0 rgba(0,0,0,0.19);
      border: none;
      border-radius: 32px;
      padding: 10px;
      font-size: 16px;
}
    

    button:hover {
      background: linear-gradient(to right, blue 5%, #FF0000 80%);
      color: white;
      box-shadow: 0 12px 16px 0 rgba(0,0,0,0.24), 0 17px 50px 0 rgba(0,0,0,0.19);
    }
    button {
      color: powderblue;
      justify-content: center;
      
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
      font-size: 16px;
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
      width: 80%;
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
.result-card {
  background-color: black;
  border-radius: 8px;
  box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  padding: 16px;
  margin-bottom: 16px;
}

.result-card h3 {
  font-size: 1.2em;
  margin-bottom: 8px;
}

.result-card p {
  font-size: 1em;
  margin: 0;
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

  </style>
</head>
<body>
  <h1>Web Page Speed Test</h1>
  <input type="text" placeholder="Enter a URL to test" id='urlInput'>
  <button onclick="startSpeedTest()">Start Speed Test</button>
  <button onclick="resetForm()" class='rst'>Reset</button>
  <button type="button" onclick="location.reload();" id='reload'>Reload Page</button>
  <div id="speed-test-results"></div>
</body>
<script lang='ts'>

function startSpeedTest() {
  // Perform the speed test and display the results.

  // Get the URL from the input field.
  const url = document.querySelector('input[type="text"]').value;

  // Make a request to the PageSpeed Insights API to get the speed test results.
  fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${url}`)
    .then(response => response.json())
    .then(results => {
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
</script>

</html>
