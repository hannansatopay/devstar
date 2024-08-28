<script>
    import WordSearch from './WordSearch.svelte';
    import Play from './Play.svelte';
    import { Router, Route } from 'svelte-routing';
  </script>
  
  <Router>
    <Route path="/" component={WordSearch} />
    <Route path="/puzzle-maker/wordsearch" component={WordSearch} />
    <Route path="/puzzle-maker/wordsearch/play" component={Play} />
  </Router>
  
  <style>
    /* Add your styles here if needed */
  </style>
  