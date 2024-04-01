<script>
	import {languages} from "./languages";
  

	let recognition;
	let recording = false;
  
	let interimText = "";
	let text = "";
  
	let selectedLanguage = "en";
  
	
  
	  

	function speechToText() {
  if (!recognition) {
    try {
      recognition = new webkitSpeechRecognition();
      recognition.lang = selectedLanguage;
      recognition.interimResults = true;
      recognition.start();

      recording = true;
    } catch (error) {
      recording = false;
      console.log(error);
    }


    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;

        if (event.results[0].isFinal) {
          text += " " + speechResult;
          interimText = "";
        } else {
          interimText = " " + speechResult;
        }
      
    };

    recognition.onend = () => {
		if (recognition!=null) {
			recognition.start();
      recording = true;	
		}
		
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") {
        alert("No speech was detected. Stopping...");
      } else if (event.error === "audio-capture") {
        alert(
          "No microphone was found. Ensure that a microphone is installed."
        );
      } else if (event.error === "not-allowed") {
        alert("Permission to use microphone is blocked.");
      } else if (event.error === "aborted") {
        alert("Listening Stopped.");
      } else {
        alert("Error occurred in recognition: " + event.error);
      }
	  recording=false;
      stopRecording();
	  
    };
  }
}

	function restart() {
		stopRecording();
		speechToText();
		stopRecording();
	}


	function stopRecording() {
	  if (recognition) {
		recognition.stop();
		recognition = null;
		recording=false;
	  }
	}
  
	function download() {
	  const filename = "speech.txt";
	  const data = text;
  
	  const blob = new Blob([data], { type: "text/plain" });
	  const url = URL.createObjectURL(blob);
  
	  const a = document.createElement("a");
	  a.href = url;
	  a.download = filename;
	  a.style.display = "none";
	  document.body.appendChild(a);
	  a.click();
	  document.body.removeChild(a);
	}
  
	function clear() {
	  text = "";
	  interimText = "";
	}
  </script>
<body>
    <div class="py-8 px-4 mx-auto max-w-screen-xl text-center md:px-12">
        <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Convert Your Speech to Text
        </h1>
        <p>
            Accurately convert speech into text with an API powered by the best of Google’s AI research and technology.
            New customers get $300 in free credits to spend on Speech-to-Text. All customers get 60 minutes for transcribing and analyzing
            audio free per month, not charged against your credits.
        </p>
        <div class="mic">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" fill="gray" class="bi bi-mic-fill" viewBox="0 0 16 16">
                <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
                <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
              </svg>
        </div>
        <div id="btn_start">
                <label for = "language"></label>
				<select bind:value={selectedLanguage} on:change={restart}>
					{#each languages as lang}
					  <option value={lang.code}>{lang.name}</option>
					{/each}
				  </select>
                <button id="start-button"  on:click={recording ? stopRecording : speechToText}
				class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">{recording ? "Stop Listening" : "Start Listening"} </button>
               
            
        </div>
        <form>
            <div>
                <label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" style="margin-top: 10px;">Your Text goes here!</label>
                <textarea id="message" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">{text+""+interimText}</textarea>
            </div>
        </form>
        <div class="py-8 px-4 mx-auto max-w-screen-xl text-center md:px-12">
            <button  id="clear" class="focus:outline-none text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800" on:click={clear}> Clear </button>
            <button  id="download" class="focus:outline-none text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2 dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800" disabled={text === ""} on:click={download}> Download </button>
        </div>
    </div>
</body>
<style>
    h1
    {
        color:rgb(0, 0, 0);
        text-align: center;
        font-size: 50px;
    }
    p
    {
        color: #9CA3AF;
        text-align: justify;
        text-align: center;
        font-size: large;
    }
    #btn_start
    {
        margin-top: 20px;
    }
    .mic
    {
        margin-left: 48%;
        padding-top: 30px;
    }
</style>