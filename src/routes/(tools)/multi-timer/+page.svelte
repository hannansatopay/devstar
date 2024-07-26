<script>
	import { onMount } from 'svelte';
	
	// Timer 1: Counts up from zero
	let time1 = 0;
	let interval1 = null;
	
	function startTimer1() {
	  if (!interval1) {
		interval1 = setInterval(() => {
		  time1 += 1;
		}, 1000);
	  }
	}
	
	function stopTimer1() {
	  clearInterval(interval1);
	  interval1 = null;
	}
	
	function resetTimer1() {
	  stopTimer1();
	  time1 = 0;
	}
	
	// Timer 2: Counts down from a given time with alarm and repeat option
	let time2 = 60;
	let initialTime2 = 60;
	let interval2 = null;
	let repeat = false;
	let inputTime2 = 60; // Separate variable for input
	
	function startTimer2() {
	  if (!interval2) {
		interval2 = setInterval(() => {
		  if (time2 > 0) {
			time2 -= 1;
		  } else {
			stopTimer2();
			document.getElementById('alarm').play();
			if (repeat) {
			  time2 = initialTime2; // Reset to initial time
			  startTimer2(); // Restart the timer
			}
		  }
		}, 1000);
	  }
	}
	
	function stopTimer2() {
	  clearInterval(interval2);
	  interval2 = null;
	}
	
	function resetTimer2() {
	  stopTimer2();
	  time2 = initialTime2;
	}
	
	function updateInitialTime2() {
	  initialTime2 = inputTime2;
	  time2 = inputTime2;
	}
	
	// Timer 3: Lap Timer
	let lapTime = 0;
	let intervalLap = null;
	let laps = [];
	
	function startLapTimer() {
	  if (!intervalLap) {
		intervalLap = setInterval(() => {
		  lapTime += 1;
		}, 1000);
	  }
	}
	
	function stopLapTimer() {
	  clearInterval(intervalLap);
	  intervalLap = null;
	}
	
	function resetLapTimer() {
	  stopLapTimer();
	  lapTime = 0;
	  laps = [];
	}
	
	function lap() {
	  laps = [...laps, lapTime];
	}
	
	// Utility function to format time in HH:MM:SS format
	function formatTime(time) {
	  const seconds = time % 60;
	  const minutes = Math.floor(time / 60) % 60;
	  const hours = Math.floor(time / 3600);
	  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
	}
	
	// Timer 4: World Clock
	let selectedCountry = "Sydney, Australia";
	let worldClock = {};
	const countries = {
	  "India": "Asia/Kolkata",
	  "New York, USA": "America/New_York",
	  "London, UK": "Europe/London",
	  "Tokyo, Japan": "Asia/Tokyo",
	  "Sydney, Australia": "Australia/Sydney"
	};
	
	function updateWorldClock() {
	  const now = new Date();
	  for (const [city, timezone] of Object.entries(countries)) {
		worldClock[city] = new Date(now.toLocaleString("en-US", { timeZone: timezone }));
	  }
	}
	
	function selectCountry(country) {
	  selectedCountry = country;
	}
	
	onMount(() => {
	  setInterval(updateWorldClock, 1000);
	  updateWorldClock();
	});
	
	// Timer 5: Event Countdown Timer
	let eventDateInput = '';
	let eventDate = null;
	let eventCountdown = '';
	
	function setEventDate() {
	  const date = new Date(eventDateInput);
	  if (!isNaN(date.getTime())) {
		eventDate = date;
	  }
	}
	
	function updateEventCountdown() {
	  const now = new Date();
	  const timeDifference = eventDate - now;
	
	  if (timeDifference > 0) {
		const years = Math.floor(timeDifference / (1000 * 60 * 60 * 24 * 365));
		const months = Math.floor((timeDifference % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30));
		const days = Math.floor((timeDifference % (1000 * 60 * 60 * 24 * 30)) / (1000 * 60 * 60 * 24));
		const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
		const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));
		const seconds = Math.floor((timeDifference % (1000 * 60)) / 1000);
	
		eventCountdown = `${years} years, ${months} months, ${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds`;
	  } else {
		eventCountdown = "0";
	  }
	}
	
	onMount(() => {
	  setInterval(updateEventCountdown, 1000);
	});
  </script>
   
 
<style>
	:root {
    --primary-color: #4CAF50; /* green */
    --secondary-color: #333; /* dark gray */
    --background-color: #121212; /* dark background */
    --text-color: #f1f1f1; /* light gray text */
    --border-color: #444; /* darker gray */
}


main {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding: 1em;
    max-width: 1200px;
    margin: 0 auto;
	
}



.timercard {
    background-color: var(--secondary-color);
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 20px;
    margin: 20px;
	height:380px;
    flex: 1;
    min-width: 300px;
	
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5); /* Enhanced shadow for depth */
    transition: box-shadow 0.3s; /* Smooth transition for hover effect */
}

.timercard:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.7); /* Deeper shadow on hover */
}

.timer {
    font-size: 2em;
    text-align: center;
    margin-top: 20px;
    color: var(--text-color);
}

.controls {
    display: flex;
    justify-content: center;
    margin-top: 10px;
}

.controls button, .controls input {
    margin: 5px;
}

button {
    font-size: 1.2em;
    padding: 10px 2px;
    border: none;
    border-radius: 5px;
    background-color: var(--primary-color);
    color: var(--text-color);
    cursor: pointer;
    transition: background-color 0.3s, transform 0.3s; /* Smooth transition for color and transform */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4); /* Add a subtle shadow */
}

button:hover {
    background-color: #45a049; /* Darker shade of green */
    transform: scale(1.05); /* Slightly enlarge the button */
}

button:active {
    background-color: #388e3c; /* Even darker shade of green when clicked */
    transform: scale(0.95); /* Slightly shrink the button */
}

button:focus {
    outline: none; /* Remove the default outline */
    box-shadow: 0 0 0 2px var(--primary-color); /* Add a focus ring */
}

input[type="number"] {
    padding: 10px;
    border: 1px solid var(--border-color);
    border-radius: 5px;
    text-align: center;
    width: 100px;
    background-color: #222; /* Dark background for inputs */
    color: var(--text-color); /* Light text color */
}

audio {
    display: none;
}

.lap-list {
    margin-top: 10px;
}

.lap-list ul {
    list-style: none;
    padding: 0;
}

.lap-list li {
    background-color: var(--secondary-color);
    border: 1px solid var(--border-color);
    padding: 5px;
    margin-bottom: 5px;
    color: var(--text-color); /* Light text color */
}

.world-clock {
    margin-bottom: 20px;
    text-align: center;
    color: var(--text-color); /* Light text color */
}

.world-clock-controls {
    display: flex;
    flex-direction: column;
    align-items: center;
}

.button-row {
    display: flex;
    justify-content: center;
    margin-bottom: 10px;
}

.button-row button {
    margin: 0 5px;
    width: 150px; /* Adjust as needed */
}

.timer {
    font-size: 1.5em; /* Slightly smaller size for better alignment */
    text-align: center;
    margin-bottom: 20px;
    color: var(--text-color);
}


</style>
<main>

	
	<!-- Timer 1: Counts up from zero -->
	<div class="card gap-6 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
	<div class="timercard">
		<div class="timer">
			Timer 1: {formatTime(time1)}
		</div>
		<div class="controls" style="margin-top:75px">
			<button on:click={() => interval1 ? stopTimer1() : startTimer1()} style="padding:10px 80px">{interval1 ? 'Stop' : 'Start'}</button>
		</div>
		<div class="controls">
			<button on:click={resetTimer1} style="padding:10px 80px">Reset</button>
		</div>
	</div>

	<!-- Timer 2: Counts down from a given time with alarm and repeat option -->
<div class="timercard">
	<div class="timer">
		Timer 2: {formatTime(time2)}
	</div>
	<div class="controls">
		<input type="number" bind:value={inputTime2} on:change={updateInitialTime2} min="0" />
	</div>
	<div class="controls">
		<button on:click={() => interval2 ? stopTimer2() : startTimer2()} style="padding:10px 95px">{interval2 ? 'Stop' : 'Start'}</button>
	</div>
	<div class="controls">
		<button on:click={resetTimer2} style="padding:10px 95px">Reset</button>
	</div>
	<div class="controls" style="background-color: #f1f1f1; width:100px;margin-left:100px">
		<label>
			<input type="checkbox" bind:checked={repeat} />
			Repeat
		</label>
	</div>
	<div class="controls">
		<audio id="alarm" src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg" />
	</div>
</div>


	<!-- Timer 3: Lap Timer -->
	<div class="timercard">
		<div class="timer">
			Lap Timer: {formatTime(lapTime)}
		</div>
		<div class="controls" style="margin-top:75px">
			<button on:click={() => intervalLap ? stopLapTimer() : startLapTimer()} style="padding:10px 95px">{intervalLap ? 'Stop' : 'Start'}</button>
		</div>
		<div class="controls">
			<button on:click={lap} style="padding:10px 40px">Lap</button>
			<button on:click={resetLapTimer} style="padding:10px 40px">Reset</button>
		</div>
		<div class="lap-list">
			<ul>
				{#each laps as lap, index}
					<li>Lap {index + 1}: {formatTime(lap)}</li>
				{/each}
			</ul>
		</div>
	</div>

	<!-- Timer 4: World Clock
	<div class="timercard">
		<div class="timer">
			World Clock: {selectedCountry}
		</div>
		<div class="world-clock">
			<div>
				<strong>Local Time (India):</strong> {worldClock["India"] ? worldClock["India"].toLocaleTimeString() : 'Loading...'}
			</div>
			<div>
				<strong>{selectedCountry}:</strong> {worldClock[selectedCountry] ? worldClock[selectedCountry].toLocaleTimeString() : 'Loading...'}
			</div>
		</div>
		<div class="controls world-clock-controls">
			<div class="button-row">
				<button on:click={() => selectCountry("Sydney, Australia")}>Australia</button>
				<button on:click={() => selectCountry("New York, USA")}>New York</button>
			</div>
			<div class="button-row">
				<button on:click={() => selectCountry("London, UK")}>London, UK</button>
				<button on:click={() => selectCountry("Tokyo, Japan")}>Tokyo, Japan</button>
			</div>
		</div>
	</div> -->

	<!-- Timer 5: Event Countdown Timer -->
<!-- Timer 5: Event Countdown Timer -->
<div class="timercard">
	<h2 style="text-align:center;font-size:1.5em;color:#f1f1f1;margin-top:20px">Event Countdown Timer</h2>
	<div class="controls">
	  <input type="date" bind:value={eventDateInput} />
	</div>
	<div class="controls">
	  <button on:click={setEventDate} style="padding:10px 95px">Set Event Date</button>
	</div>
	<div class="timer" style="font-size: 1em;">
	  <div>Years: {eventCountdown.split(', ')[0]===undefined?'0':eventCountdown.split(', ')[0]}</div>
	  <div>Months: {eventCountdown.split(', ')[1]===undefined?'0':eventCountdown.split(', ')[1]}</div>
	  <div>Days: {eventCountdown.split(', ')[2]===undefined?'0':eventCountdown.split(', ')[2]}</div>
	  <div>Hours: {eventCountdown.split(', ')[3]===undefined?'0':eventCountdown.split(', ')[3]}</div>
	  <div>Minutes: {eventCountdown.split(', ')[4]===undefined?'0':eventCountdown.split(', ')[4]}</div>
	  <div>Seconds: {eventCountdown.split(', ')[5]===undefined?'0':eventCountdown.split(', ')[5]}</div>
	</div>
</div>
</div>
</main>
