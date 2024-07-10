<script>
  import { Router, Route, navigate } from 'svelte-routing';
  import CrosswordPage from './crossword/+page.svelte';
  import WordsearchPage from './wordsearch/+page.svelte';
  import wheeloffortune from './wheeloffortune/+page.svelte';
  import Play from './wordsearch/Play.svelte';
</script>

<div class="head">
  <h2>Create, Customize, and Share unique puzzles, providing endless fun and mental challenges for puzzle enthusiasts of all ages</h2>
</div>
<div class="position">
  <button on:click={() => navigate('/puzzle-maker/crossword')}>
    <img src="src\routes\(tools)\puzzle-maker\photos\crossword.png" alt="Crossword Icon" />
    <h2>Go to Crossword</h2>
  </button>
  <button on:click={() => navigate('/puzzle-maker/wordsearch')}>
    <img src="src\routes\(tools)\puzzle-maker\photos\Wordsearch.png" alt="Wordsearch Icon" />
    <h2>Go to Wordsearch</h2>
  </button>
  <button on:click={() => navigate('/puzzle-maker/wheeloffortune')}>
    <img src="src\routes\(tools)\puzzle-maker\photos\wheel.jpeg" alt="Wheel of Fortune Icon" />
    <h2>Go to Wheel of Fortune</h2>
  </button>
</div>

<Router>
  <Route path="/puzzle-maker/crossword" component={CrosswordPage} />
  <Route path="/puzzle-maker/wordsearch" component={WordsearchPage} />
  <Route path="/puzzle-maker/wordsearch/play" component={Play} />
  <Route path="/puzzle-maker/wheeloffortune" component={wheeloffortune} />
</Router>

<style>
  .head {
    text-align: center;
    margin-bottom: 24px;
  }
  .position h2{
    font-size: 1.4rem; /* Adjust size as needed */
    color: #fff;
    font-weight: 600;
  }
  .head h2 {
    font-size: 1.5rem; /* Adjust size as needed */
    color: #fff;
    line-height: 1.2;
    font-weight: 600;
    padding: 0 20px; /* Adjust padding for responsive design */
    margin-top: -10px;
  }

  .position {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 16px;
  }

  button {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 12px 24px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.3s ease;
    position: relative;
    font-weight: 600;
    
  }

  button:hover {
    background-color: #0056b3;
    transform: scale(1.05);
  }

  button img {
    width: 250px; /* Adjusted size */
    height: 250px; /* Adjusted size */
    margin-bottom: 8px; /* Adjust spacing if needed */
    transition: transform 0.3s ease;
  }

  button:hover img {
    transform: scale(1.1);
  }
</style>
