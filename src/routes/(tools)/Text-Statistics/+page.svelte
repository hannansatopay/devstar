<script>
  let text = '';
  let wordCount = 0;
  let charCount = 0;
  let sentenceCount = 0;
  let paragraphCount = 0;
  let avgWordLength = 0;
  let readingTime = 0;
  let uniqueWords = 0;
  let showStats = false;
  let wordLengthCounts = [];
  function calculateStatistics() {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    wordCount = words.length;
    charCount = text.length;
    sentenceCount = text.split(/[.!?]+\s*/).filter(Boolean).length;
    paragraphCount = text.split(/\n+/).filter(paragraph => paragraph.trim().length > 0).length;
    avgWordLength = (words.reduce((sum, word) => sum + word.length, 0) / wordCount) || 0;
    readingTime = (wordCount / 200).toFixed(2); // Assuming average reading speed of 200 wpm
    uniqueWords = new Set(words.map(word => word.toLowerCase())).size;
    showStats = true;
    // Calculate word length counts
    wordLengthCounts = Array(9).fill(0); // Initialize counts for words lengths 2-10
    words.forEach(word => {
      if (word.length >= 2 && word.length <= 10) {
        wordLengthCounts[word.length - 2]++;
      }
    });
  }
</script>


<div class="container mx-auto p-4 md:p-8 ">
  <h1 class="text-3xl sm:text-4xl font-bold mb-4 text-black-900 dark:text-white">Text Statistics</h1>
  <div class="card text-white rounded-lg shadow-lg border-black p-4 md:p-6 bg-white dark:bg-gray-900">
    <!-- Text Input Section -->
    <div class="mb-6 md:mb-8">
      <textarea class="w-full p-2 md:p-4 border border-gray-600 rounded-lg resize-none focus:outline-none focus:border-blue-500 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" bind:value={text} rows="6" md:rows="8" placeholder="Enter your text here..."></textarea>
      <button class="mt-4 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" on:click={calculateStatistics}>Calculate Statistics</button>
    </div>
    <!-- Statistics Display Section -->
    {#if showStats}
      <div class="space-y-4 ">
        <div>
          <p class="text-lg text-gray-900 dark:text-white"><span class="font-bold text-gray-900 dark:text-white">Word Count:</span> {wordCount}</p>
          <p class="text-lg text-gray-900 dark:text-white"><span class="font-bold text-gray-900 dark:text-white">Character Count:</span> {charCount}</p>
          <p class="text-lg text-gray-900 dark:text-white"><span class="font-bold text-gray-900 dark:text-white">Sentence Count:</span> {sentenceCount}</p>
          <p class="text-lg text-gray-900 dark:text-white"><span class="font-bold text-gray-900 dark:text-white">Paragraph Count:</span> {paragraphCount}</p>
          <p class="text-lg text-gray-900 dark:text-white"><span class="font-bold text-gray-900 dark:text-white">Average Word Length:</span> {avgWordLength.toFixed(2)}</p>
          <p class="text-lg text-gray-900 dark:text-white"><span class="font-bold text-gray-900 dark:text-white">Estimated Reading Time:</span> {readingTime} minutes</p>
          <p class="text-lg text-gray-900 dark:text-white"><span class="font-bold text-gray-900 dark:text-white ">Unique Words:</span> {uniqueWords}</p>
        </div>
        <!-- Word Length Count Table -->
        <div>
          <h2 class="text-2xl font-extrabold text-gray-900 dark:text-white">Word Length Count</h2>
          <table class="table-auto w-full mt-4 text-white ">
            <thead>
              <tr class="bg-white dark:bg-gray-900">
                <th class="px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-blue-700">Word Length</th>
                <th class="px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-blue-700">Count</th>
              </tr>
            </thead>
            <tbody>
              {#each wordLengthCounts as count, index}
                <tr class="bg-gray-700">
                  <td class="border px-2 md:px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-600">{index + 2} letters</td>
                  <td class="border px-2 md:px-4 py-2 text-gray-900 dark:text-white bg-white dark:bg-gray-600">{count}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      </div>
    {/if}
  </div>
</div>

