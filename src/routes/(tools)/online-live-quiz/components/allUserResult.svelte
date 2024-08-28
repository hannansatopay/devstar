<script>
  import { onMount } from "svelte";
  import { Modal } from "flowbite-svelte";
  import BarGraph from "./BarGraph.svelte";
  let users = [];
  let loading = true;
  let error = null;
  //   let showModal = false;

  let openModal = false;
  let size;

  // find the submission in object from fetched data
  function findSubmissions(obj) {
    if (!obj || typeof obj !== "object") {
      return null;
    }

    if (obj.submissions) {
      return obj.submissions;
    }

    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const result = findSubmissions(obj[key]);
        if (result) {
          return result;
        }
      }
    }

    return null;
  }

  onMount(async () => {
    try {
      const binId = localStorage.getItem("quizBinId");
      if (!binId) {
        throw new Error("Quiz bin ID not found in localStorage.");
      }

      const response = await fetch(
        `https://api.jsonbin.io/v3/b/${binId}/latest`,
        {
          headers: {
            "X-Master-Key":
              "$2a$10$gbJlp4k7J07Dnq0Jq3abFuq/1aAHMbLAPuT3BUlK.BkssQ1/JR0eK",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Error fetching data : ${response.statusText}`);
      }

      const data = await response.json();
      // console.log("fetched data", data);

      const submissions = findSubmissions(data.record);
      if (submissions) {
        users = submissions.map((submission) => {
          return {
            username: submission.username,
            score: calculateScore(submission),
          };
        });

        users.sort((a, b) => b.score - a.score);
      } else {
        throw new Error("No submissions found in the fetched data.");
      }
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  });
  function calculateScore(submission) {
    let score = 0;
    submission.questions.forEach((question, index) => {
      if (question.correct_answer === submission.selectedOptions[index]) {
        score += 1;
      }
    });
    return score;
  }
</script>

{#if loading}
  <p>Loading...</p>
{:else if error}
  <p>Error: {error}</p>
{:else}
  <div class="dark:text-white">
    <div class="flex flex-col justify-center">
      <h1 class="my-3">Click here to check the graph:</h1>
      <button
        class="border p-2 rounded-md my-3 bg-black text-white hover:bg-gray-900"
        size="xl"
        on:click={() => {
          size = "lg";
          openModal = true;
        }}>Show Graph</button
      >
    </div>
    <ul>
      <div class="flex justify-around">
        <p>UserName</p>
        <p>score</p>
      </div>
      <li class="my-1">
        {#each users as user}
          <div
            class="flex p-5 my-2 justify-around border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700"
          >
            <span>{user.username}</span>
            <span>{user.score}</span>
          </div>
        {/each}
      </li>
    </ul>
  </div>
{/if}

<Modal title="Graph" bind:open={openModal} {size} autoclose>
  <BarGraph data={users} />
</Modal>
