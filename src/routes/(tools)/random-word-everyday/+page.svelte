<script>
  import { onMount } from 'svelte';
 let word = "";
 let definition = "";
 let quote = "";
 let tongueTwister = "";
 let showQuote = false;
 let showTongueTwister = false;
 let loading = false;
 let error = "";
 let lastType = "noun"; // Default to noun initially
 let wordOfTheDay = "";
 let definitionOfTheDay = "";
 let showWordOfTheDay = false;
 let currentDate = getCurrentDate();
  

  // Function to fetch a random quote
  async function getQuote() {
      loading = true;
      word = ""; // Clear word 
      definition = ""; // Clear definition 
      quote = "";
      tongueTwister = ""; // Clear tongue twister
      showQuote = false; // Reset visibility
      showTongueTwister = false;
      try {
          const response = await fetch("https://api.quotable.io/random");
          const data = await response.json();
          quote = data.content;
          showQuote = true; // Show quote
      } catch (error) {
          console.log(error);
          error = "Could not fetch a quote.";
      }
      loading = false;
  }

  // Function to fetch random adjectives
  async function getAdjective() {
      const url = "https://a883c9d9-d3f7-44a6-9d0b-f5f43c0d5931.mock.pstmn.io/";

      loading = true;
      word = "";
      definition = "";
      quote = ""; // Clear quote 
      tongueTwister = ""; // Clear tongue twister
      showQuote = false;
      showTongueTwister = false;


      try {
          const response = await fetch(url);
          const data = await response.json();

          // Assuming the API returns an array of objects with 'word' and 'description'
          if (data && data.length > 0) {
              const randomIndex = Math.floor(Math.random() * data.length);
              word = data[randomIndex].word;
              definition = data[randomIndex].description;
          } else {
              word = `No adjectives found.`;
              definition = "";
          }
      } catch (error) {
          console.log(error);
          error = "Could not fetch adjectives.";
      }

      loading = false;
  }

  async function getVerb() {
      const url = "https://bf684cca-f74a-4733-b103-0c362ee86e81.mock.pstmn.io/";

      loading = true;
      word = "";
      definition = "";
      quote = ""; // Clear quote 
      tongueTwister = ""; // Clear tongue twister
      showQuote = false;
      showTongueTwister = false;


      try {
          const response = await fetch(url);
          const data = await response.json();

          // Assuming the API returns an array of objects with 'word' and 'description'
          if (data && data.length > 0) {
              const randomIndex = Math.floor(Math.random() * data.length);
              word = data[randomIndex].word;
              definition = data[randomIndex].meaning;
          } else {
              word = `No verbs found.`;
              definition = "";
          }
      } catch (error) {
          console.log(error);
          error = "Could not fetch verbs.";
      }

      loading = false;
  }

  async function getNoun() {
      const url = "https://38b7e161-c5fc-418e-9c22-80637dc94684.mock.pstmn.io/";

      loading = true;
      word = "";
      definition = "";
      quote = ""; // Clear quote 
      tongueTwister = ""; // Clear tongue twister
      showQuote = false;
      showTongueTwister = false;


      try {
          const response = await fetch(url);
          const data = await response.json();

          // Assuming the API returns an array of objects with 'word' and 'description'
          if (data && data.length > 0) {
              const randomIndex = Math.floor(Math.random() * data.length);
              word = data[randomIndex].word;
              definition = data[randomIndex].meaning;
          } else {
              word = `No noun found.`;
              definition = "";
          }
      } catch (error) {
          console.log(error);
          error = "Could not fetch nouns.";
      }

      loading = false;
  }

  async function getAnotherWord() {
      const url = "https://38b7e161-c5fc-418e-9c22-80637dc94684.mock.pstmn.io/";

      loading = true;
      word = "";
      definition = "";
      quote = ""; // Clear quote 
      tongueTwister = ""; // Clear tongue twister
      showQuote = false;
      showTongueTwister = false;


      try {
          const response = await fetch(url);
          const data = await response.json();

          // Assuming the API returns an array of objects with 'word' and 'description'
          if (data && data.length > 0) {
              const randomIndex = Math.floor(Math.random() * data.length);
              word = data[randomIndex].word;
              definition = data[randomIndex].meaning;
          } else {
              word = `No word found.`;
              definition = "";
          }
      } catch (error) {
          console.log(error);
          error = "Could not fetch any word.";
      }

      loading = false;
  }

  // Function to fetch a random Tongue Twister
  async function getTongueTwister() {
      const url = "https://93a54bc7-4d9e-420a-b113-e49c4ef28649.mock.pstmn.io/";

      loading = true;
      word = ""; // Clear word
      definition = ""; // Clear definition
      quote = ""; // Clear quote
      tongueTwister = ""; // Clear tongue twister
      showQuote = false; // Reset visibility
      showTongueTwister = false;

      try {
          const response = await fetch(url);
          const data = await response.json();

          // Assuming the API returns an array of objects with 'twister'
          if (data && data.length > 0) {
              const randomIndex = Math.floor(Math.random() * data.length);
              tongueTwister = data[randomIndex].twister;
              showTongueTwister = true; // Set visibility to true
          } else {
              word = "No Tongue Twisters";
              definition = "";
          }
      } catch (error) {
          console.error(error);
          word = "Could not fetch tongue twisters.";
      } finally {
          loading = false;
      }
  }

  function getCurrentDate() {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
  }
  async function fetchWordOfTheDay() {
      const url = "https://7ccf6875-f278-4b2b-989e-c87db3e88a0d.mock.pstmn.io"; // Replace with your API endpoint

      try {
          const response = await fetch(url);
          const data = await response.json();

          if (data && data.length > 0) {
              const randomIndex = Math.floor(Math.random() * data.length);
              const wordData = data[randomIndex];
              wordOfTheDay = wordData.word;
              definitionOfTheDay = wordData.definition;
              showWordOfTheDay = true;
              localStorage.setItem('wordOfTheDay', JSON.stringify({ date: currentDate, word: wordOfTheDay, definition: definitionOfTheDay }));
          } else {
              wordOfTheDay = "No Word of the Day found.";
              definitionOfTheDay = "";
          }
      } catch (error) {
          console.error(error);
          wordOfTheDay = "Could not fetch Word of the Day.";
          definitionOfTheDay = "";
      }
  }

  function loadWordOfTheDay() {
      const storedData = JSON.parse(localStorage.getItem('wordOfTheDay'));
      if (storedData && storedData.date === currentDate) {
          wordOfTheDay = storedData.word;
          definitionOfTheDay = storedData.definition;
          showWordOfTheDay = true;
      } else {
          fetchWordOfTheDay();
      }
  }

  onMount(() => {
      loadWordOfTheDay();
  });

</script>

<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
  <div class="container">
    <button class="text-white" on:click={() => getAnotherWord()}><u>Another Word</u></button>
    <button class="text-white" on:click={() => getNoun()}><u>Noun</u></button>
    <button class="text-white" on:click={() => getVerb()}><u>Verb</u></button>
    <button class="text-white" on:click={() => getAdjective()}><u>Adjective</u></button>
    <button class="text-white" on:click={() => getQuote()}><u>Quote</u></button>
    <button class="text-white" on:click={() => getTongueTwister()}><u>Tongue Twister</u></button>
    <h1 class="text-black dark:text-white text-2xl" class:loading={loading} class:noun={lastType === 'noun'} class:verb={lastType === 'verb'} class:adjective={lastType === 'adjective'}>
      {loading ? 'Loading...' : word}
    </h1>
    {#if !loading && definition}
      <h3 class="text-black dark:text-white text-xl" class:loading={loading} class:noun={lastType === 'noun'} class:verb={lastType === 'verb'} class:adjective={lastType === 'adjective'}>
        {definition}
      </h3>
    {/if}
    {#if !loading && showQuote}
      <h3 class="text-black dark:text-white text-2xl">
        {quote}
      </h3>
    {/if}
    {#if !loading && showTongueTwister}
    <h3 class="text-black dark:text-white text-2xl" class:loading={loading}>
        {tongueTwister}
    </h3>
{/if}
<hr>
{#if showWordOfTheDay}
<h1 class="text-black dark:text-white text-2xl">Word of the Day: {wordOfTheDay}</h1>
<h3 class="text-black dark:text-white text-xl">Definition: {definitionOfTheDay}</h3>
{/if}
  </div>
</div>

<style>
  .card {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 20px;
  }
  .container {
    text-align: center;
    margin-top: 50px;
    margin-bottom: 50px;
  }
  button {
    margin: 10px;
    padding: 10px 20px;
    font-size: 16px;
    background-color: #1C64F2;
    border: none;
    border-radius: 8px;
    font-weight: medium;
    color: white; /* Ensure button text is always white */
  }
  button:hover {
    cursor: pointer;
    border-radius: 8px;
    background-color: #A3CFF3;
  }
  h1, h3 {
    margin: 20px 0;
  }
  .loading {
    font-family: cursive;
    font-style: italic;
  }
</style>
