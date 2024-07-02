<script>
  import axios from "axios";

  let userInput = "";
  let generatedSQL = "";
  let loading = false;
  const apiKey = "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"; // Replace with your Hugging Face API key
  const modelUrl =
    "https://api-inference.huggingface.co/models/juierror/text-to-sql-with-table-schema";

  const generateSQL = async (retryCount = 3) => {
    if (!userInput.trim()) {
      generatedSQL = "Please enter a prompt.";
      return;
    }

    loading = true;
    const prompt = `Generate SQL query: ${userInput} <mask>`;

    try {
      const response = await axios.post(
        modelUrl,
        {
          inputs: prompt,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Check if the response data is valid
      if (
        response.data &&
        response.data.length > 0 &&
        response.data[0].generated_text
      ) {
        generatedSQL = response.data[0].generated_text.trim();
      } else {
        generatedSQL =
          "Failed to generate SQL. Please check your input and try again.";
      }
    } catch (error) {
      // Handle model loading error
      if (
        error.response &&
        error.response.data &&
        error.response.data.error ===
          "Model is currently loading. Please try again."
      ) {
        if (retryCount > 0) {
          console.warn("Model is loading. Retrying...");
          setTimeout(() => generateSQL(retryCount - 1), 5000); // Retry after 5 seconds
          return;
        } else {
          generatedSQL =
            "Error generating SQL: Model is still loading. Please try again later.";
        }
      } else {
        console.error("Error generating SQL:", error);
        generatedSQL = `Error generating SQL: ${error.response ? error.response.data.error : error.message}. Please try again.`;
      }
    } finally {
      loading = false;
    }
  };

  const copyToClipboard = () => {
    if (generatedSQL) {
      navigator.clipboard
        .writeText(generatedSQL)
        .then(() => {
          alert("SQL query copied to clipboard!");
        })
        .catch((err) => {
          console.error("Error copying to clipboard:", err);
        });
    }
  };
</script>

<div class="justify-center font-sans mt-4 overflow-hidden rounded-lg">
  <div class="mt-5 ml-20">
    <label
      for="message"
      class="block mb-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white"
    >
      <span class="flex items-center">
        Enter Prompt....
        <img
          src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Travel%20and%20places/Rocket.png"
          alt="Rocket"
          width="35"
          height="35"
          class="ml-3"
        />
      </span>
    </label>
    <textarea
      id="message"
      rows="4"
      bind:value={userInput}
      class="block p-2.5 md:w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-100 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:border-gray-400 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      placeholder="Description of the query to generate..."
    ></textarea>
    <div class="mb-2 mt-4">
      <button
        type="button"
        on:click={generateSQL}
        class=" text-white tracking-tight bg-gradient-to-r from-purple-500 to-pink-500 hover:bg-gradient-to-l focus:ring-4 focus:outline-none focus:ring-purple-200 dark:focus:ring-purple-800 font-medium rounded-lg text-sm px-4 py-2.5 text-center me-2 mb-2 ml-1"
      >
        {loading ? "Generating..." : "Generate"}
      </button>
    </div>
    <div
      class="query-box mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
    >
      <h2 class="text-xl font-bold">Generated SQL Query:</h2>
      <pre>{generatedSQL}</pre>
    </div>
    <button
      type="button"
      on:click={copyToClipboard}
      class="text-white tracking-tight bg-blue-500 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2.5 text-center ml-1 mb-2 mt-4"
    >
      Copy to Clipboard
    </button>
  </div>
</div>

<style>
  .query-box {
    margin-top: 1rem;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 5px;
    background: transparent;
    text-wrap: wrap;
    overflow-wrap: hidden;
  }
</style>
