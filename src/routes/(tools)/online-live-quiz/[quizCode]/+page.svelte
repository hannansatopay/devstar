<script>
  import { onMount, onDestroy } from "svelte";
  // import { Avatar } from "flowbite-svelte";
  import DisplayQuestions from "../components/displayQuestions.svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  import { beforeNavigate } from "$app/navigation";
  import EnterDetailModal from "../components/enter-details/enterDetailModal.svelte";
  const ENCRYPTION_KEY = "metacraft";

  let selectedCategory;
  let questions = [];
  // console.log("q", questions);
  let error = "";
  let userData;
  // const userAvatar = writable("");
  // console.log("ud", userData);
  let timeLeft = 10 * 60;
  let intervalId;
  let quizStart = false;
  let quizData;
  let quizCompleted = false;

  let showModal = false;
  let userDetails = null;

  // Simple XOR cipher for encryption/decryption
  function xorCipher(text, key) {
    try {
      let result = "";
      for (let i = 0; i < text.length; i++) {
        result += String.fromCharCode(
          text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
        );
      }
      return result;
    } catch (error) {
      console.error("Error in xorCipher:", error);
      return null;
    }
  }

  // function to find the question in hte fetched object
  function findQuestions(obj) {
    if (!obj || typeof obj !== "object") {
      return null;
    }

    if (obj.questions && obj.questions.questions) {
      return obj.questions.questions;
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const result = findQuestions(obj[key]);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }

  // Function to start the quiz
  async function startQuiz() {
    // fetchQuestions();
    try {
      quizStart = true;
      // console.log("1");
      if (browser) {
        localStorage.setItem("quizStart", "true");
        // console.log("2");
      }
      // console.log("3");
      // After fetching and storing, retrieve the questions to display
      questions = await getStoredQuestions();
      // console.log("questions", questions);
      // console.log("4");
      startTimer();
    } catch (err) {
      console.error("Error starting quiz:", err);
      error = "An error occurred while starting the quiz. Please try again.";
    }
  }

  async function getStoredQuestions() {
    // console.log("3.1");
    if (browser) {
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
        if (quizBinId) {
          localStorage.setItem("quizBinId", quizBinId);
        }
      }
      if (!quizBinId) {
        console.error("Quiz Bin ID not found");
        return null;
      }

      try {
        const response = await fetch(
          `https://api.jsonbin.io/v3/b/${quizBinId}/latest`,
          {
            headers: {
              "X-Master-Key":
                "$2a$10$gbJlp4k7J07Dnq0Jq3abFuq/1aAHMbLAPuT3BUlK.BkssQ1/JR0eK", // Replace with your JSONBin master key
            },
          }
        );

        const data = await response.json();
        // console.log("this is getdata", data);
        // const encryptedQuestions = data.record.questions.questions;
        const encryptedQuestions = findQuestions(data.record);
        const decryptedQuestions = xorCipher(
          atob(encryptedQuestions),
          ENCRYPTION_KEY
        );
        // console.log("3.3");
        return JSON.parse(decryptedQuestions);
      } catch (error) {
        console.error("Error retrieving questions from JSONBin:", error);
      }
    }
    // console.log("3.4");
    return null;
  }

  function removeCategory() {
    if (browser) {
      localStorage.removeItem("category");
    }
  }

  function startTimer() {
    if (browser) {
      const now = Date.now();
      if (!localStorage.getItem("quizStartTime")) {
        localStorage.setItem("quizStartTime", now.toString());
      }
      const quizStartTime = parseInt(localStorage.getItem("quizStartTime"));
      timeLeft = 10 * 60 - Math.floor((now - quizStartTime) / 1000);

      intervalId = setInterval(() => {
        timeLeft -= 1;
        if (timeLeft <= 0) {
          clearInterval(intervalId);
          removeCategory();
          // goto("/online-live-quiz");
        }
      }, 1000);
    }
  }

  $: minutes = Math.floor(timeLeft / 60);
  $: seconds = timeLeft % 60;

  // Function to check timestamp and navigate if necessary
  const checkTimestamp = () => {
    if (typeof localStorage !== "undefined") {
      quizData = JSON.parse(localStorage.getItem("quizData"));
    }

    // Half an hour in milliseconds
    if (quizData && Date.now() - quizData.timestamp >= 30 * 60 * 1000) {
      navigate("/online-live-quiz");
    }
  };

  // Setup a periodic check using tick
  const interval = setInterval(checkTimestamp, 60000); // Check every minute

  onMount(() => {
    if (!localStorage.getItem("quizBinId")) {
      if (browser) {
        // localStorage.removeItem("quizStart");
        quizStart = false;
        goto("/online-live-quiz");
      }
    }
    const storedCategory = localStorage.getItem("category");
    const storedName = localStorage.getItem("name");
    const storedAvatar = localStorage.getItem("avatar");
    selectedCategory = storedCategory;
    userData = storedName;
    // console.log(storedAvatar);
    // if (storedAvatar) {
    // userAvatar.set(storedAvatar);
    // }
    const storedStartTime = localStorage.getItem("quizStartTime");
    if (storedStartTime) {
      const now = Date.now();
      const elapsedSeconds = Math.floor(
        (now - parseInt(storedStartTime)) / 1000
      );
      timeLeft = Math.max(600 - elapsedSeconds, 0);
      if (timeLeft > 0) {
        quizStart = true;
        startTimer();
      } else {
        removeCategory();
      }
    }

    quizStart = localStorage.getItem("quizStart") === "true";
    if (quizStart) {
      const storedQuestions = getStoredQuestions();
      if (storedQuestions) {
        questions = storedQuestions;
      } else {
        // If no stored questions found, reset quizStart
        quizStart = false;
        localStorage.removeItem("quizStart");
      }
    }

    if (storedName && storedAvatar) {
      userDetails = { name: storedName, avatar: storedAvatar };
    } else {
      showModal = true;
    }
    startQuiz();
  });

  function handleUserDetails(event) {
    const { name, avatar } = event.detail;
    userDetails = { name, avatar };
    userData = name;
    localStorage.setItem("name", name);
    localStorage.setItem("avatar", avatar);
    showModal = false;
  }

  beforeNavigate(({ cancel }) => {
    if (quizCompleted) {
      const confirmed = confirm(
        "Are you sure you want to leave? Your progress will be lost."
      );
      if (!confirmed) {
        cancel();
      } else {
        removeCategory();
        if (intervalId) clearInterval(intervalId);
      }
    }
  });

  onDestroy(() => {
    if (intervalId) clearInterval(intervalId);
  });
  onDestroy(() => {
    clearInterval(interval);
  });
</script>

<main>
  {#if showModal}
    <EnterDetailModal on:submit={handleUserDetails} />
  {:else}
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
          <h2>
            Time Remaining: {minutes}:{seconds.toString().padStart(2, "0")}
          </h2>
        </div>
      </header>
    </div>
    <!-- {#if !quizStart}
      <div class="flex justify-center my-20">
        <button
          class="font-bold md:w-40 w-full mt-4 border py-2 rounded-xl bg-gray-400 dark:bg-black dark:text-white dark:hover:bg-gray-900 hover:bg-gray-500"
          on:click={startQuiz}>Start Quiz</button
        >
      </div>
    {:else} -->
    <DisplayQuestions {error} {questions} {timeLeft} />
    <!-- {/if} -->
  {/if}
</main>
