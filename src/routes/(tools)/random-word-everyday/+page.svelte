<script>
  import Copy from "$lib/Copy.svelte";
  import { onMount } from "svelte";

  const dictionary = [
    {
      word: "serendipity",
      partOfSpeech: "noun",
      pronunciation: "seh-ren-DIP-ih-tee",
      definition:
        "The occurrence of events by chance in a happy or beneficial way.",
      example:
        "Finding the tiny café on a rainy day felt like pure serendipity.",
      quote:
        "In reality, serendipity accounts for one percent of the blessings we receive in life, work, and love. The other 99 percent is due to our efforts. – Peter McWilliams",
      synonyms: ["chance", "providence", "fluke"],
    },
    {
      word: "petrichor",
      partOfSpeech: "noun",
      pronunciation: "PEH-tri-kor",
      definition:
        "The pleasant smell that frequently accompanies the first rain after a long period of warm dry weather.",
      example: "The petrichor after the monsoon arrived was intoxicating.",
      quote:
        "Petrichor is nature's way of telling us to breathe deeply and begin again.",
      synonyms: ["rain-scent", "earth-smell"],
    },
    {
      word: "lagom",
      partOfSpeech: "adjective",
      pronunciation: "LAH-gom",
      definition: "Not too little, not too much—just right (Swedish).",
      example: "She approached her workload with a lagom mindset.",
      quote:
        "Lagom is the secret to contentment: do enough, enjoy enough, be enough.",
      synonyms: ["balanced", "moderate", "measured"],
    },
    {
      word: "sonder",
      partOfSpeech: "noun",
      pronunciation: "SON-der",
      definition:
        "The realization that each random passerby is living a life as vivid and complex as your own.",
      example: "Watching commuters on the train sparked a moment of sonder.",
      quote:
        "To be human is to experience sonder—an empathy for a universe of stories.",
      synonyms: ["awareness", "empathy"],
    },
    {
      word: "eloquent",
      partOfSpeech: "adjective",
      pronunciation: "EL-uh-kwent",
      definition: "Fluent or persuasive in speaking or writing.",
      example:
        "Her eloquent defense of the project won over the entire committee.",
      quote:
        "Eloquent speech is not from lip to ear, but from heart to heart. – William Jennings Bryan",
      synonyms: ["expressive", "articulate", "persuasive"],
    },
    {
      word: "luminous",
      partOfSpeech: "adjective",
      pronunciation: "LOO-muh-nuhs",
      definition:
        "Full of or shedding light; bright or shining, especially in the dark.",
      example: "The luminous display filled the night sky with colour.",
      quote:
        "Be luminous in your kindness and people will remember your light.",
      synonyms: ["radiant", "glowing", "brilliant"],
    },
    {
      word: "palimpsest",
      partOfSpeech: "noun",
      pronunciation: "PAL-imp-sest",
      definition:
        "A manuscript or piece of writing material on which the original writing has been effaced to make room for later writing but of which traces remain.",
      example: "The old city was a palimpsest of styles and stories.",
      quote:
        "Every memory is a palimpsest: the past whispering beneath the present.",
      synonyms: ["manuscript", "document", "record"],
    },
    {
      word: "halcyon",
      partOfSpeech: "adjective",
      pronunciation: "HAL-see-on",
      definition:
        "Denoting a period of time in the past that was idyllically happy and peaceful.",
      example: "He spoke of the halcyon summers spent by the sea.",
      quote: "We carry our halcyon days folded like postcards in our pocket.",
      synonyms: ["calm", "peaceful", "golden"],
    },
    {
      word: "zenith",
      partOfSpeech: "noun",
      pronunciation: "ZEE-nith",
      definition: "The time at which something is most powerful or successful.",
      example:
        "The company reached its zenith with the launch of the flagship product.",
      quote: "Ambition seeks zeniths, wisdom enjoys the climb.",
      synonyms: ["acme", "apex", "pinnacle"],
    },
    {
      word: "ephemeral",
      partOfSpeech: "adjective",
      pronunciation: "ih-FEM-er-ul",
      definition: "Lasting for a very short time.",
      example: "The beauty of a sunset is ephemeral but unforgettable.",
      quote: "All things are ephemeral, yet meaning endures through memory.",
      synonyms: ["transient", "fleeting", "momentary"],
    },
    {
      word: "ethereal",
      partOfSpeech: "adjective",
      pronunciation: "ih-THEER-ee-ul",
      definition:
        "Extremely delicate and light in a way that seems too perfect for this world.",
      example: "The dancer’s ethereal movements captivated the audience.",
      quote: "Art is ethereal when it speaks directly to the soul.",
      synonyms: ["delicate", "airy", "heavenly"],
    },
    {
      word: "sonderlust",
      partOfSpeech: "noun",
      pronunciation: "SON-der-luhst",
      definition:
        "A desire to wander and explore inspired by the realization of others’ stories.",
      example:
        "Her sonderlust led her to travel alone through unfamiliar cities.",
      quote: "Sonderlust is curiosity meeting courage.",
      synonyms: ["wanderlust", "curiosity", "adventure"],
    },
    {
      word: "epiphany",
      partOfSpeech: "noun",
      pronunciation: "ih-PIH-fuh-nee",
      definition: "A sudden moment of realization or insight.",
      example:
        "During the lecture, he had an epiphany about his life's purpose.",
      quote: "An epiphany is the mind’s sunrise.",
      synonyms: ["revelation", "insight", "awakening"],
    },
    {
      word: "mellifluous",
      partOfSpeech: "adjective",
      pronunciation: "muh-LIF-loo-uhs",
      definition: "Sweet or musical; pleasant to hear.",
      example: "Her mellifluous voice calmed the entire room.",
      quote: "Words, when mellifluous, can heal as much as they can inspire.",
      synonyms: ["harmonious", "soothing", "melodious"],
    },
    {
      word: "solitude",
      partOfSpeech: "noun",
      pronunciation: "SOL-ih-tood",
      definition: "The state or situation of being alone, often by choice.",
      example: "He found peace in solitude after a long week of work.",
      quote: "Solitude is not loneliness—it’s the space where clarity is born.",
      synonyms: ["seclusion", "isolation", "peace"],
    },
    {
      word: "tranquility",
      partOfSpeech: "noun",
      pronunciation: "tran-KWIL-ih-tee",
      definition: "The quality or state of being calm and peaceful.",
      example: "The lake reflected the tranquility of the morning.",
      quote:
        "Tranquility is not the absence of noise but the presence of peace.",
      synonyms: ["serenity", "calmness", "peace"],
    },
    {
      word: "sonderlight",
      partOfSpeech: "noun",
      pronunciation: "SON-der-lyt",
      definition: "A gentle awareness of life's beauty in everyday moments.",
      example:
        "She watched the city lights flicker with a quiet sense of sonderlight.",
      quote: "Sonderlight is gratitude glowing softly in the ordinary.",
      synonyms: ["appreciation", "wonder", "grace"],
    },
    {
      word: "resilience",
      partOfSpeech: "noun",
      pronunciation: "ri-ZIL-yuhns",
      definition:
        "The capacity to recover quickly from difficulties; toughness.",
      example: "Her resilience during hard times inspired everyone around her.",
      quote: "Resilience is the art of falling and rising with purpose.",
      synonyms: ["fortitude", "endurance", "tenacity"],
    },
    {
      word: "luminary",
      partOfSpeech: "noun",
      pronunciation: "LOO-muh-ner-ee",
      definition:
        "A person who inspires or influences others, especially in a particular field.",
      example: "Marie Curie is regarded as a luminary in the world of science.",
      quote: "To be a luminary is to shine so others can see the path.",
      synonyms: ["inspiration", "leader", "icon"],
    },
    {
      word: "sonderwave",
      partOfSpeech: "noun",
      pronunciation: "SON-der-wayv",
      definition:
        "A wave of deep connection and empathy toward the world around you.",
      example:
        "As she listened to their stories, a sonderwave washed over her.",
      quote: "Sonderwave is the tide of empathy that connects us all.",
      synonyms: ["compassion", "connection", "empathy"],
    },
  ];

  const tongueTwisters = [
    "Six sleek swans swam swiftly southwards.",
    "Brisk brave brigadiers brandished broad bright blades.",
    "Fred fed Ted bread and Ted fed Fred bread.",
    "A proper copper coffee pot.",
    "Red lorry, yellow lorry.",
  ];

  const today = new Date();
  const seed =
    today.getFullYear() * 1000 + (today.getMonth() + 1) * 100 + today.getDate();
  const wordOfTheDay = dictionary[seed % dictionary.length];
  const twisterOfTheDay = tongueTwisters[seed % tongueTwisters.length];

  let currentWord = wordOfTheDay;
  let showTongueTwister = false;
  let showQuote = true;
  let speechAvailable = false;

  $: summary = buildSummary(currentWord);

  onMount(() => {
    speechAvailable =
      typeof window !== "undefined" && "speechSynthesis" in window;
  });

  function buildSummary(entry) {
    return `${entry.word} (${entry.partOfSpeech}) — ${entry.definition} Example: ${entry.example}`;
  }

  function randomWord() {
    if (!dictionary.length) return;
    let index = Math.floor(Math.random() * dictionary.length);
    if (dictionary.length > 1) {
      while (dictionary[index].word === currentWord.word) {
        index = Math.floor(Math.random() * dictionary.length);
      }
    }
    currentWord = dictionary[index];
  }

  function toggleQuote() {
    showQuote = !showQuote;
  }

  function toggleTongueTwister() {
    showTongueTwister = !showTongueTwister;
  }

  function speakWord() {
    if (!speechAvailable) return;
    const utterance = new SpeechSynthesisUtterance(
      `${currentWord.word}. ${currentWord.definition}`,
    );
    utterance.lang = "en-US";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }
</script>

<section class="space-y-6">
  <div
    class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Word of the day
        </p>
        <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
          {wordOfTheDay.word}
        </h2>
      </div>
      <div class="flex flex-wrap gap-2">
        {#if speechAvailable}
          <button
            class="inline-flex items-center rounded-full border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            type="button"
            on:click={speakWord}
          >
            Play pronunciation
          </button>
        {/if}
        <button
          class="inline-flex items-center rounded-full border border-indigo-300 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
          on:click={randomWord}
          type="button"
        >
          Surprise me
        </button>
      </div>
    </div>

    <div
      class="relative rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-900/60"
    >
      <Copy text={summary} customClass="top-4 right-4" />
      <p
        class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        Current selection
      </p>
      <h3
        class="mt-1 text-3xl font-semibold text-slate-900 dark:text-slate-100"
      >
        {currentWord.word}
      </h3>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        {currentWord.partOfSpeech}
      </p>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div
          class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Definition
          </p>
          <p class="mt-1 leading-relaxed">{currentWord.definition}</p>
        </div>
        <div
          class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm italic text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Example
          </p>
          <p class="mt-1 leading-relaxed">"{currentWord.example}"</p>
        </div>
      </div>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div
          class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Pronunciation
          </p>
          <p class="mt-1 font-medium">{currentWord.pronunciation}</p>
        </div>
        {#if currentWord.synonyms?.length}
          <div
            class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Synonyms
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              {#each currentWord.synonyms as synonym}
                <span
                  class="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-600 dark:text-slate-200"
                >
                  {synonym}
                </span>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>

    <div class="flex flex-wrap gap-3">
      <button
        class="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        type="button"
        on:click={toggleQuote}
      >
        {showQuote ? "Hide quote" : "Show quote"}
      </button>
      <button
        class="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        type="button"
        on:click={toggleTongueTwister}
      >
        {showTongueTwister ? "Hide twister" : "Tongue twister"}
      </button>
    </div>

    {#if showQuote}
      <div
        class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm italic text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
      >
        {currentWord.quote}
      </div>
    {/if}

    {#if showTongueTwister}
      <div
        class="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-100"
      >
        {twisterOfTheDay}
      </div>
    {/if}

    <div
      class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
    >
      Refresh the page tomorrow for a new word of the day. Use “Surprise me”
      anytime for extra vocabulary inspiration.
    </div>
  </div>
</section>
