<script>
  import { writable } from "svelte/store";
  import { onMount, onDestroy } from "svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  export let questions = [];
  export let error;
  export let timeLeft;

  // store to keep track of the selected options
  let selectedOptions = writable({});
  let currentQuestionIndex = writable(0);
  let submissionError = writable("");
  let intervalId;
  let isTimeUp = writable(false);
  let usernameData;
  let startTimestamp;
  let isAutoSubmit = false;

  function saveSelectedOptions() {
    if (browser) {
      localStorage.setItem("selectedOptions", JSON.stringify($selectedOptions));
    }
  }

  function loadSelectedOptions() {
    if (browser) {
      const saved = localStorage.getItem("selectedOptions");
      if (saved) {
        selectedOptions.set(JSON.parse(saved));
      }
    }
  }
  // handle option selection
  function selectOption(questionIndex, answer) {
    if (!$isTimeUp) {
      selectedOptions.update((options) => {
        options[questionIndex] = answer;
        saveSelectedOptions();
        return options;
      });
    }
  }

  // Function to handle previous question
  function previousQuestion() {
    currentQuestionIndex.update((n) => (n > 0 ? n - 1 : n));
  }

  // Function to handle next question
  function nextQuestion() {
    currentQuestionIndex.update((n) => (n < questions.length - 1 ? n + 1 : n));
  }

  async function submitQuiz() {
    submissionError.set("");
    let endTime = Date.now();
    let quizBinId = localStorage.getItem("quizBinId");
    if (!quizBinId && typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      // let encryptedquizBinId = urlParams.get("binId");
      quizBinId = urlParams.get("binId");
      // console.log("encrp", encryptedquizBinId);
      // let decodedBinId = atob(
      //   encryptedquizBinId.replace(/-/g, "+").replace(/_/g, "/")
      // );
      // quizBinId = xorCipher(decodedBinId, ENCRYPTION_KEY);
      // console.log("dencrp", quizBinId);
    }
    if (!quizBinId) {
      console.error("Quiz Bin ID not found");
      return null;
    }

    try {
      // Fetch current JSONBin data
      const response = await fetch(`https://api.jsonbin.io/v3/b/${quizBinId}`, {
        headers: {
          "X-Master-Key":
            "$2a$10$gbJlp4k7J07Dnq0Jq3abFuq/1aAHMbLAPuT3BUlK.BkssQ1/JR0eK", // Replace with your JSONBin master key
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch quiz data: ${response.statusText}`);
      }

      const currentData = await response.json();

      // Append submission data to existing submissions array
      const updatedSubmissions = currentData.record.submissions || [];
      const submissionData = {
        username: usernameData,
        startTime: startTimestamp,
        endTime: endTime,
        questions,
        selectedOptions: $selectedOptions,
      };
      updatedSubmissions.push(submissionData);

      // Update JSONBin with merged data
      const updatedData = {
        ...currentData,
        submissions: updatedSubmissions,
      };

      const updateResponse = await fetch(
        `https://api.jsonbin.io/v3/b/${quizBinId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Master-Key":
              "$2a$10$gbJlp4k7J07Dnq0Jq3abFuq/1aAHMbLAPuT3BUlK.BkssQ1/JR0eK", // Replace with your JSONBin master key
          },
          body: JSON.stringify(updatedData),
        }
      );

      if (!updateResponse.ok) {
        throw new Error(
          `Failed to update quiz data: ${updateResponse.statusText}`
        );
      }

      // console.log("Quiz submitted!", $selectedOptions);
      localStorage.removeItem("quizStart");
      localStorage.removeItem("quizStartTime");
      localStorage.removeItem("quizData");
      goto("/online-live-quiz/results", {
        state: {
          questions,
          userAnswers: $selectedOptions,
        },
      });
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  }

  function autoSubmitQuiz() {
    // console.log("Time's up! Auto-submitting quiz.");
    isAutoSubmit = true;
    isTimeUp.set(true);
    submitQuiz();
  }

  function manualSubmitQuiz() {
    const unansweredQuestions = questions.filter(
      (_, index) => !$selectedOptions[index]
    );

    if (unansweredQuestions.length > 0) {
      alert(
        `Please answer all questions before submitting. ${unansweredQuestions.length} question(s) remaining.`
      );
      return; // Exit the function if there are unanswered questions
    }
    isAutoSubmit = false;
    submitQuiz();
  }
  onMount(() => {
    loadSelectedOptions();
    const storedName = localStorage.getItem("name");
    const storedTime = localStorage.getItem("quizStartTime");
    usernameData = storedName;
    startTimestamp = storedTime;
    intervalId = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(intervalId);
        autoSubmitQuiz();
      }
    }, 1000);
  });

  onDestroy(() => {
    if (intervalId) {
      clearInterval(intervalId);
    }
  });
</script>

<div class="m-10">
  {#if questions.length > 0}
    <div
      class=" w-full p-6 m-1 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
    >
      <h2 class="flex flex-col md:flex-row md:items-center">
        <span class=" text-xl font-bold mr-1"
          >Question {$currentQuestionIndex + 1}:
        </span>{@html questions[$currentQuestionIndex].question}
      </h2>
      <ul class="mt-2 grid grid-cols-2 gap-4">
        {#each questions[$currentQuestionIndex].answers as answer}
          <button
            class="bg-gray-100 dark:bg-gray-800 p-4 rounded-md text-center cursor-pointer {$selectedOptions[
              $currentQuestionIndex
            ] === answer
              ? 'bg-green-500 text-white'
              : ''}"
            on:click={() => selectOption($currentQuestionIndex, answer)}
          >
            {@html answer}
          </button>
        {/each}
      </ul>
    </div>

    <div class="flex justify-around mt-4">
      <button
        on:click={previousQuestion}
        class="bg-gray-400 dark:bg-black dark:text-white dark:hover:bg-gray-900 hover:bg-gray-500 px-4 py-2 rounded-md"
        disabled={$currentQuestionIndex === 0}
      >
        Back
      </button>
      {#if $currentQuestionIndex === questions.length - 1}
        <button
          on:click={manualSubmitQuiz}
          class="bg-green-500 dark:bg-green-700 text-white px-4 py-2 rounded-md hover:bg-green-600 dark:hover:bg-green-800"
        >
          Submit
        </button>
      {:else}
        <button
          on:click={nextQuestion}
          class="bg-gray-400 dark:bg-black dark:text-white dark:hover:bg-gray-900 hover:bg-gray-500 px-4 py-2 rounded-md"
        >
          Next
        </button>
      {/if}
    </div>
  {:else if error}
    <p>{error}</p>
  {:else}
    <p>Loading questions...</p>
  {/if}
</div>
