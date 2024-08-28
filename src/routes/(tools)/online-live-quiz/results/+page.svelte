<script>
  import { onMount, onDestroy } from "svelte";
  import QuizResults from "../components/QuizResults.svelte";
  import { browser } from "$app/environment";
  import { goto } from "$app/navigation";
  let navigatingAway = false;

  let quizData;
  const ENCRYPTION_KEY = "metacraft";

  function xorCipher(text, key) {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(
        text.charCodeAt(i) ^ key.charCodeAt(i % key.length)
      );
    }
    return result;
  }

  // function getStoredQuestions() {
  //   if (browser) {
  //     const encryptedQuestions = localStorage.getItem("encryptedQuizQuestions");
  //     if (encryptedQuestions) {
  //       const decryptedQuestions = xorCipher(
  //         atob(encryptedQuestions),
  //         ENCRYPTION_KEY
  //       );
  //       return JSON.parse(decryptedQuestions);
  //     }
  //   }
  //   return null;
  // }

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
        // const encryptedQuestions =
        //   data.record.record.record.questions.questions || data.record.record.questions.questions;
        // const encryptedQuestions =
        //   data?.record?.record?.questions?.questions ??
        //   data?.record?.questions?.questions;
        const encryptedQuestions = findQuestions(data.record);

        const decryptedQuestions = xorCipher(
          atob(encryptedQuestions),
          ENCRYPTION_KEY
        );
        // console.log("3.3");
        // console.log("3.3", decryptedQuestions);
        return JSON.parse(decryptedQuestions);
      } catch (error) {
        console.error("Error retrieving questions from JSONBin:", error);
      }
    }
    // console.log("3.4");
    return null;
  }

  async function getStoredAnswers() {
    if (browser) {
      // const storedUsername = localStorage.getItem("username");
      let quizBinId = localStorage.getItem("quizBinId");
      if (!quizBinId && typeof window !== "undefined") {
        const urlParams = new URLSearchParams(window.location.search);
        quizBinId = urlParams.get("binId");
      }
      if (!quizBinId) {
        console.error("Quiz Bin ID not found");
        return {};
      }

      try {
        const response = await fetch(
          `https://api.jsonbin.io/v3/b/${quizBinId}/latest`,
          {
            headers: {
              "X-Master-Key":
                "$2a$10$gbJlp4k7J07Dnq0Jq3abFuq/1aAHMbLAPuT3BUlK.BkssQ1/JR0eK",
            },
          }
        );

        const data = await response.json();
        // console.log("ans1", data.record.submissions);

        const userSubmissions = data.record.submissions;
        // console.log("ans", userSubmissions);

        // Loop through each submission to access the username and selected options
        // userSubmissions.forEach((submission) => {
        //   const username = submission.username;
        //   const selectedOptions = submission.selectedOptions;

        //   console.log("Username:", username);
        //   console.log("Selected Options:", selectedOptions);
        // });

        const storedUsername = localStorage.getItem("name");

        // Find the submission for the storedUsername
        const userAnswers = userSubmissions.find(
          (submission) => submission.username === storedUsername
        );

        if (userAnswers) {
          // console.log("User Answers:", userAnswers.selectedOptions);
          return userAnswers.selectedOptions;
        } else {
          console.error("User answers not found");
          return {};
        }
      } catch (error) {
        console.error("Error retrieving answers from JSONBin:", error);
      }
    }
    return {};
  }

  function cleanupLocalStorage() {
    // console.log("the page is destroyed");
    if (browser && !navigatingAway) {
      localStorage.removeItem("quizStart");
      localStorage.removeItem("quizCode");
      localStorage.removeItem("quizBinId");
      localStorage.removeItem("selectedOptions");
      localStorage.removeItem("quizStartTime");
      localStorage.removeItem("isJoined");
      localStorage.removeItem("isLocked");
    }
  }

  // Function to handle popstate event
  function handlePopState(event) {
    // Check if the user navigated back
    if (browser && !navigatingAway) {
      goto("/online-live-quiz");
    }
  }

  onMount(async () => {
    if (browser) {
      const questions = await getStoredQuestions();
      // console.log("dfssdf Q", questions);
      const userAnswers = await getStoredAnswers();
      // console.log("dfssdf A", userAnswers);

      const getBinID = localStorage.getItem("quizBinId");
      // const getoption = localStorage.getItem("selectedOptions");

      if (questions && userAnswers) {
        quizData = {
          questions: questions,
          userAnswers: userAnswers,
        };
      } else {
        console.error("Failed to load quiz data from localStorage");
      }

      if (!getBinID) {
        navigatingAway = true;
        goto("/online-live-quiz");
      }
      // Add the popstate event listener
      window.addEventListener("popstate", handlePopState);

      // Replace the current state to prevent going back
      history.replaceState(null, "", location.href);

      // Clean up the event listener when component unmounts
      return () => {
        window.removeEventListener("popstate", handlePopState);
      };
    }
  });

  onDestroy(() => {
    cleanupLocalStorage();
    if (browser && navigatingAway) {
      goto("/online-live-quiz");
    }
  });

  if (browser) {
    window.addEventListener("beforeunload", (event) => {
      navigatingAway = true;
    });
  }
</script>

{#if quizData}
  <QuizResults
    questions={quizData.questions}
    userAnswers={quizData.userAnswers}
  />
  <!-- timeSpent={quizData.timeSpent} -->
{:else}
  <p>Loading results...</p>
{/if}
