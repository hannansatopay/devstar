<script>
  //   import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { v4 as uuidv4 } from "uuid";
  import { goto } from "$app/navigation";
  import { browser } from "$app/environment";
  import { createEventDispatcher } from "svelte";
  const ENCRYPTION_KEY = "metacraft";

  export let categories = [];
  let selectedCategory = "";
  let questions = [];
  let error = "";
  let countdown = 1; // 5 minutes in seconds
  let interval;
  let isLocked = false;

  export let onGenerateCode;
  let quizCode = "";
  const dispatch = createEventDispatcher();

  // Simple XOR cipher for encryption/decryption
  function xorCipher(text, key) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }

  // here quiz code is generated with time amd created a bin to store in bin
  async function generateQuizCode() {
    localStorage.setItem("isLocked", "true");
    isLocked = true;
    quizCode = uuidv4().slice(0, 6);
    const timestamp = Date.now();
    const quizData = { code: quizCode, timestamp, category: selectedCategory };

    try {
      const response = await fetch("https://api.jsonbin.io/v3/b", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key":
            "$2a$10$gbJlp4k7J07Dnq0Jq3abFuq/1aAHMbLAPuT3BUlK.BkssQ1/JR0eK", // Replace with your JSONBin master key
        },
        body: JSON.stringify(quizData),
      });

      const data = await response.json();
      const binId = data.metadata.id; // Store this ID for further operations
      localStorage.setItem("quizBinId", binId);
      dispatch("sendData", { binId });
      localStorage.setItem("quizData", JSON.stringify(quizData));
      startCountdown();

      const quizUrl = `${window.location.origin}/online-live-quiz/${quizCode}`;
      // console.log("url", quizUrl);
      onGenerateCode(quizCode);
      fetchQuestions();
    } catch (error) {
      console.error("Error storing quiz data in JSONBin:", error);
    }
  }

  // after generating code start the countdowm
  const startCountdown = () => {
    const quizData = JSON.parse(localStorage.getItem("quizData"));

    const elapsedTime = Math.floor((Date.now() - quizData.timestamp) / 1000);
    countdown = Math.max(0, 1 * 60 - elapsedTime); // 5 minutes in seconds

    interval = setInterval(() => {
      if (countdown > 0) {
        countdown--;
      } else {
        clearInterval(interval);
      }
    }, 1000); // Update countdown every second
  };

  function shuffle(array) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  async function fetchQuestions() {
    let url = "https://opentdb.com/api.php?amount=10";

    if (selectedCategory) {
      url += `&category=${selectedCategory}`;
    }
    try {
      const response = await fetch(url);
      const data = await response.json();
      // console.log("data: ", data);
      if (data.response_code === 0) {
        // Process questions
        questions = data.results.map((question) => {
          // Combine correct and incorrect answers and shuffle them
          const answers = shuffle([
            question.correct_answer,
            ...question.incorrect_answers,
          ]);
          return { ...question, answers };
        });

        const quizBinId = localStorage.getItem("quizBinId");
        // window.location.hash = quizBinId;

        // // Retrieve the hash fragment
        // const binId1 = window.location.hash.substring(1);
        // console.log("hash", binId1);
        if (quizBinId) {
          const encryptedQuestions = btoa(
            xorCipher(JSON.stringify(questions), ENCRYPTION_KEY)
          );

          // Store encrypted questions in JSONBin
          const questionsData = { questions: encryptedQuestions };
          const existingData = JSON.parse(localStorage.getItem("quizData"));
          const updatedData = {
            ...existingData,
            questions: questionsData,
          };

          await fetch(`https://api.jsonbin.io/v3/b/${quizBinId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "X-Master-Key":
                "$2a$10$gbJlp4k7J07Dnq0Jq3abFuq/1aAHMbLAPuT3BUlK.BkssQ1/JR0eK", // Replace with your JSONBin master key
            },
            body: JSON.stringify(updatedData),
          });

          // console.log("Questions loaded and stored successfully");
        } else {
          console.error("Quiz Bin ID not found");
        }
      } else {
        error = "Failed to load questions. Please try again.";
      }
    } catch (error) {
      console.log(error);
      console.error("Error fetching questions:", error);
      error = "An error occurred while fetching questions. Please try again.";
    }
  }

  function gotoQuiz() {
    goto(`/online-live-quiz/${quizCode}`);
  }

  onMount(() => {
    if (browser) {
      const quizData = JSON.parse(localStorage.getItem("quizData"));
      if (quizData) {
        quizCode = quizData.code;
        startCountdown();
      }
      const storedIsLocked = localStorage.getItem("isLocked");
      if (storedIsLocked === "true") {
        isLocked = true;
      }
    }
  });
</script>

<div class="my-5">
  <div class="md:w-full flex flex-col justify-center">
    <select
      id="category"
      bind:value={selectedCategory}
      disabled={isLocked}
      class="mt-1 w-52 md:w-80 pr-10 py-2 mx-auto text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
    >
      <option value="">Any Category</option>
      {#each categories as category}
        <option value={category.id}>{category.name}</option>
      {/each}
    </select>
  </div>
  {#if !quizCode}
    <button
      on:click={generateQuizCode}
      class="font-bold md:w-full w-full mt-4 border md:px-28 py-2 rounded-xl bg-gray-400 dark:bg-black dark:text-white dark:hover:bg-gray-900 hover:bg-gray-500"
    >
      Create Quiz
    </button>
  {:else if countdown === 0}
    <button
      on:click={gotoQuiz}
      class="font-bold md:w-full w-full mt-4 border md:px-28 py-2 rounded-xl bg-gray-400 dark:bg-black dark:text-white dark:hover:bg-gray-900 hover:bg-gray-500"
    >
      Start Quiz
    </button>
  {:else}
    <button
      class="font-bold md:w-full w-full mt-4 border md:px-28 py-2 rounded-xl bg-gray-400 dark:bg-black dark:text-white dark:hover:bg-gray-900 hover:bg-gray-500"
    >
      Start in {Math.floor(countdown / 60)}:{countdown % 60 < 10
        ? "0" + (countdown % 60)
        : countdown % 60}
    </button>
  {/if}
</div>
