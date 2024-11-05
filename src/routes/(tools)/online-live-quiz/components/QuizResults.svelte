<script>
  import { onMount } from "svelte";

  export let questions = [];
  export let userAnswers = {};
  export let userData;
  import AllUserResult from "../components/allUserResult.svelte";
  // export let timeSpent = 0;

  let score = 0;
  $: {
    score = questions.reduce((acc, question, index) => {
      return acc + (userAnswers[index] === question.correct_answer ? 1 : 0);
    }, 0);
  }

  onMount(() => {
    const storedName = localStorage.getItem("name");
    userData = storedName;
  });
</script>

<main class="dark:text-white">
  <div
    class="w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
  >
    <header class="flex justify-between">
      <div class="flex justify-center items-center">
        <!-- <Avatar size="sm" src={$userAvatar} /> -->
        <h1 class="ml-2">{userData}</h1>
      </div>
      <div class="flex">
        <!-- <button class=" px-6 rounded-lg dark:text-white">Exit</button> -->
        <a href="/online-live-quiz">Home</a>
      </div>
    </header>
  </div>

  <div class="flex flex-col md:flex-row">
    <div
      class="w-full my-5 md:m-5 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="container mx-auto p-4">
        <h1 class="text-2xl font-bold mb-4">Quiz Results</h1>
        <p class="mb-4">Your Score: {score} / {questions.length}</p>
        <!-- <p class="mb-4">Time Spent: {formatTime(timeSpent)}</p> -->

        {#each questions as question, index}
          <div
            class="mb-6 p-4 border rounded-lg dark:text-black {userAnswers[
              index
            ] === question.correct_answer
              ? 'bg-green-100'
              : 'bg-red-100'}"
          >
            <h2 class="font-bold mb-2 dark:text-black">
              Question {index + 1}:
            </h2>
            <p class="mb-2">{@html question.question}</p>
            <p class="mb-1 dark:text-black">
              Your Answer: {userAnswers[index] || "Not answered"}
            </p>
            <p class="mb-1">Correct Answer: {question.correct_answer}</p>
            {#if userAnswers[index] !== question.correct_answer}
              <p class="text-red-600">Incorrect</p>
            {:else}
              <p class="text-green-600">Correct</p>
            {/if}
          </div>
        {/each}
      </div>
    </div>
    <div
      class="w-full md:w-[60%] h-fit my-5 md:m-5 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
    >
      <AllUserResult />
    </div>
  </div>
</main>
