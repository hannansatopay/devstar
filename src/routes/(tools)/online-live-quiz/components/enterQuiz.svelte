<script>
  import { Avatar } from "flowbite-svelte";
  import { onMount } from "svelte";
  import Category from "./enter-details/category.svelte";
  // const ENCRYPTION_KEY = "metacraft";
  let categories = [];
  export let quizCode = "";

  export let handleLogout;
  export let userData;
  let binId;
  function handleSendData(event) {
    binId = event.detail.binId;
  }

  let selectedCategory;

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

  // copy link of the quiz
  function copyToClipboard() {
    // const encryptedBinId = xorCipher(binId, ENCRYPTION_KEY);
    // console.log("enxrpyte bin", binId);
    const link = `${window.location.origin}/online-live-quiz/${quizCode}/?binId=${encodeURIComponent(binId)}`; // Replace with your actual game URL
    navigator.clipboard
      .writeText(link)
      .then(() => {
        // console.log("Link copied to clipboard:", link);
        alert("Link copied to clipboard!");
      })
      .catch((err) => {
        console.error("Failed to copy link:", err);
        alert("Failed to copy link. Please try again.");
      });
  }

  function handleQuizCode(code) {
    quizCode = code;
  }

  const instructions = [
    "Read each question carefully before answering.",
    "Select the best answer from the options provided.",
    "You can only choose one answer per question.",
    "There is time limit, be quick.",
    "You cannot go back to previous questions once answered.",
    "Your final score will be shown at the end of the quiz.",
    "Good luck and enjoy the quiz!",
  ];

  async function fetchCategories() {
    try {
      const response = await fetch("https://opentdb.com/api_category.php");
      const data = await response.json();
      categories = data.trivia_categories;
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  }

  onMount(async () => {
    fetchCategories();
    const storedData = localStorage.getItem("quizData");
    const storedCategory = localStorage.getItem("category");
    const storedBinId = localStorage.getItem("quizBinId");
    console.log(storedCategory);
    selectedCategory = storedCategory;
    binId = storedBinId;
    if (storedData) {
      const { code, timestamp } = JSON.parse(storedData);
      const currentTime = Date.now();
      const elapsedTime = currentTime - timestamp;

      // Check if the stored code is still valid (30 minutes = 1800000 milliseconds)
      if (elapsedTime < 1800000) {
        quizCode = code;
      } else {
        localStorage.removeItem("quizData");
      }
    }
  });
</script>

<main>
  <div
    class="w-full p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
  >
    <header class="flex justify-between">
      <Avatar
        size="sm"
        src={userData.avatar}
        class="object-cover cursor-pointer"
      />
      <button
        on:click={handleLogout}
        class=" px-6 rounded-lg hover:bg-gray-500 hover:text-white dark:text-white"
        >Logout</button
      >
    </header>
  </div>
  <div class="flex flex-col md:flex-row">
    <div
      class="w-full md:w-[60%] h-fit my-5 md:m-5 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="bg-gray-100 dark:bg-gray-200">
        <!-- <div
          class="bg-black h-32 w-full rounded-t-lg dark:rounded-none flex flex-col justify-center items-center"
        >
          <input
            type="text"
            placeholder="Code"
            class="mt-1 pr-10 py-2 mx-auto text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          />
          <button
            class="font-bold mt-4 border px-28 py-2 rounded-xl bg-gray-400 dark:bg-black dark:text-white dark:hover:bg-gray-900 hover:bg-gray-500"
            >Join</button
          >
        </div> -->
        {#if quizCode}
          <div
            class="bg-black mt-20 h-fit w-full rounded-b-lg dark:rounded-none flex flex-col justify-center items-center cursor-pointer"
          >
            <div class="my-4">
              <h3 class="text-white text-sm font-thin text-center">
                Quiz code :
              </h3>
              <h1 class="text-white tracking-widest text-3xl font-bold">
                {quizCode}
              </h1>
            </div>

            <div class="w-full my-5">
              <h5 class="text-white ml-5">Tell your friends about the quiz:</h5>
              <!-- <p class="text-white ml-5">
                Selected Category: {selectedCategory}
              </p> -->
              <button
                id="copyLinkButton"
                class="flex justify-center items-center border mt-4 w-fit p-2 m-2 mx-auto text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-3xl cursor-pointer"
                on:click={copyToClipboard}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M4.92386 3.96345C4.92386 3.32943 5.06293 3.01034 5.25539 2.83278C5.4577 2.64613 5.82952 2.51154 6.53789 2.51154H8.33352C9.04189 2.51154 9.41371 2.64613 9.61602 2.83278C9.80848 3.01034 9.94754 3.32943 9.94754 3.96345V5.62012C9.94754 6.25414 9.80848 6.57322 9.61602 6.75079C9.44156 6.91175 9.14102 7.03399 8.60731 7.06459V6.72457C8.60731 6.71318 8.60727 6.70181 8.6072 6.69046V6.39586C8.6072 5.60554 8.36751 5.00699 7.78018 4.6616C7.44157 4.46248 7.02222 4.37362 6.56486 4.33609C6.39402 4.31867 6.21586 4.31093 6.03155 4.31093H5.84351C5.83709 4.31092 5.83067 4.31091 5.82425 4.31091H4.92386V3.96345ZM3.96213 4.31707V3.96345C3.96213 3.21692 4.12233 2.56962 4.60324 2.12593C5.07429 1.69133 5.74991 1.5498 6.53789 1.5498H8.33352C9.1215 1.5498 9.79712 1.69133 10.2682 2.12593C10.7491 2.56962 10.9093 3.21692 10.9093 3.96345V5.62012C10.9093 6.36665 10.7491 7.01395 10.2682 7.45764C9.85264 7.84101 9.27792 7.99633 8.60731 8.02761V8.38124C8.60731 9.12777 8.4471 9.77507 7.9662 10.2188C7.49515 10.6534 6.81953 10.7949 6.03155 10.7949H4.23592C3.44794 10.7949 2.77232 10.6534 2.30127 10.2188C1.82036 9.77507 1.66016 9.12777 1.66016 8.38124V6.72457C1.66016 5.97804 1.82036 5.33074 2.30127 4.88705C2.71679 4.50368 3.29151 4.34836 3.96213 4.31707ZM5.84136 5.27266H4.23592C3.52755 5.27266 3.15572 5.40725 2.95341 5.5939C2.76096 5.77146 2.62189 6.09055 2.62189 6.72457V8.38124C2.62189 9.01526 2.76096 9.33434 2.95341 9.51191C3.15572 9.69856 3.52755 9.83314 4.23592 9.83314H6.03155C6.73991 9.83314 7.11174 9.69856 7.31405 9.51191C7.50651 9.33434 7.64557 9.01526 7.64557 8.38124V7.56342C7.6455 7.55992 7.64546 7.55641 7.64546 7.55289V6.69347C7.64097 6.08007 7.50333 5.76853 7.31405 5.5939C7.16187 5.45349 6.91376 5.34255 6.49864 5.29619C6.31101 5.28051 6.09344 5.27299 5.84136 5.27266Z"
                    fill="white"
                  ></path>
                </svg>

                <h3 class="text-white mx-2 text-lg font-thin">
                  Link to the Quiz
                </h3>
              </button>
            </div>
          </div>
        {/if}
        <div class="bg-white my-5">
          <h1 class="font-bold ml-5 pt-5 pb-4">All you need to know :</h1>
          <ul class="list-disc px-10 ml-5 space-y-2 text-sm mb-4">
            <li>Reload the page, if Quizz Does not appear.</li>
            <li>Quiz need to be complete within time Limit.</li>
            <li>There are 10 Questions in Each Quizz.</li>
            <li>Read and Answer Carefully.</li>
            <li>Reload the results page to see updated results.</li>
            <li>If the Result page is closed can't access again.</li>
            <li>Best of Luck.</li>
          </ul>
        </div>
      </div>
    </div>
    <div
      class="w-full my-5 md:m-5 p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
    >
      <div class="bg-gray-100 dark:bg-gray-200">
        <div
          class="bg-black dark:bg-white h-32 w-full rounded-t-lg flex justify-center items-center"
        >
          <Category
            {categories}
            onGenerateCode={handleQuizCode}
            on:sendData={handleSendData}
          />
        </div>
        <div>
          <div class="flex justify-center">
            <img src="/boyz.png" alt="Boyz" class="py-4" />
          </div>
          <div class="bg-white p-6 rounded-lg shadow-md">
            <h2 class="text-2xl font-semibold mb-4">Quiz Instructions</h2>
            <ul class="list-disc pl-5 space-y-2">
              {#each instructions as instruction}
                <li class="text-gray-700">{instruction}</li>
              {/each}
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</main>
