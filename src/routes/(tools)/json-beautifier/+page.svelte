<script>
  let successToast = false;
  let dangerToast = false;
  let warningToast = false;
  let isJsonValid = false;
  let toastTimeOutms = 10000;

  // hide download,intend size,and format buttons.show it when JSON validated successfully

  let successToastMessage = "";
  let dangerToastMessage = "";
  let warningToastMessage = "";

  let jsonData = "";
  let formattedJson = "";
  let intendSize = "2";

  // function validate() {
  //   isJsonValid value to true when JSON validated successfully
  // }

  function format(intendSize = 2) {
    // validate();
    let input = jsonData.trim();
    if (input) {
      try {
        const parsed = JSON.parse(input);
        formattedJson = JSON.stringify(parsed, null, Number(intendSize));
        successToastMessage = "JSON formatted successfully.";
        successToast = true;
        setTimeout(() => {
          successToast = false;
        }, toastTimeOutms);
      } catch (e) {
        dangerToastMessage = "Cannot format: Invalid JSON.";
        dangerToast = true;
        setTimeout(() => {
          dangerToast = false;
        }, toastTimeOutms);
      }
    } else {
      warningToastMessage = "Please enter JSON.";
      warningToast = true;
      setTimeout(() => {
        warningToast = false;
      }, toastTimeOutms);
    }
  }

  function reset() {
    intendSize = "2";
    jsonData = "";
    formattedJson = "";
    files = null;
  }

  const uploadJson = () => {
    const file = document.getElementById("jsonFileUpload").files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      jsonData = e.target.result;
    };
    reader.readAsText(file);
  };

  function downloadJson() {
    const blob = new Blob([formattedJson], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "formatted.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
</script>

<div
  class="card items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg border-2 dark:bg-gray-900 relative"
>
  <!-- Add tool here -->
  <div class="bg-white dark:bg-gray-900" id="mainContainer">
    <!--toast start here-->

    {#if successToast}
      <div
        id="toast-success"
        class="bg-green-500 flex items-center w-full max-w-xs p-4 mb-4 text-white rounded-lg shadow absolute top-0 right-0"
        role="alert"
      >
        <div
          class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg"
        >
          <svg
            class="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"
            />
          </svg>
          <span class="sr-only">Check icon</span>
        </div>
        <div class="ms-3 text-sm font-normal">{successToastMessage}</div>
        <button
          type="button"
          class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
          data-dismiss-target="#toast-success"
          aria-label="Close"
          on:click={() => {
            successToast = false;
          }}
        >
          <span class="sr-only">Close</span>
          <svg
            class="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </div>
    {/if}

    {#if dangerToast}
      <div
        id="toast-danger"
        class="flex items-center w-full max-w-xs p-4 mb-4 text-white rounded-lg shadow absolute top-0 right-0 bg-red-600"
        role="alert"
      >
        <div
          class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg"
        >
          <svg
            class="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"
            />
          </svg>
          <span class="sr-only">Error icon</span>
        </div>

        <div class="ms-3 text-sm font-normal">{dangerToastMessage}</div>
        <button
          type="button"
          class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
          data-dismiss-target="#toast-danger"
          aria-label="Close"
          on:click={() => {
            dangerToast = false;
          }}
        >
          <span class="sr-only">Close</span>
          <svg
            class="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </div>
    {/if}

    {#if warningToast}
      <div
        id="toast-warning"
        class="flex items-center w-full max-w-xs p-4 text-white bg-orange-500 rounded-lg shadow absolute top-0 right-0"
        role="alert"
      >
        <div
          class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200"
        >
          <svg
            class="w-5 h-5"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"
            />
          </svg>
          <span class="sr-only">Warning icon</span>
        </div>
        <div class="ms-3 text-sm font-normal">{warningToastMessage}</div>
        <button
          type="button"
          class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8"
          data-dismiss-target="#toast-warning"
          aria-label="Close"
          on:click={() => {
            warningToast = false;
          }}
        >
          <span class="sr-only">Close</span>
          <svg
            class="w-3 h-3"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 14 14"
          >
            <path
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
            />
          </svg>
        </button>
      </div>
    {/if}

    <!--toast ends here-->

    <!--
			  sample upload modal replaced by input file start here
			  currently hidden
		  -->

    <input
      type="file"
      id="jsonFileUpload"
      on:change={uploadJson}
      class="hidden"
    />

    <!-- file upload ends here-->

    <!--main div starts here-->

    <div class="md:grid grid-cols-[40%,20%,40%] p-6 dark:bg-gray-900">
      <div
        class="bg-gray-50 h-auto border-gray-400 border-2 rounded-3xl dark:bg-gray-800 dark:border-slate-300 dark:border-1 dark:text-white"
      >
        <div class="px-4 py-2 my-4 flex justify-between items-center">
          <h3 class="truncate overflow-hidden text-lg">Upload JSON</h3>
          <button
            on:click={() => {
              document.getElementById("jsonFileUpload").click();
              formattedJson = "";
            }}
            class="py-2 px-4 rounded bg-blue-700 hover:bg-blue-800 text-white"
            id="jsonFileUploadButton">Upload</button
          >
        </div>
        <div
          class="h-auto text-xl p-3 border-t-gray-400 border-t-2 dark:border-t-slate-300 dark:border-t-2"
          spellcheck="false"
        >
          <textarea
            on:keypress={() => {
              formattedJson = "";
            }}
            placeholder="JSON here..."
            rows="18"
            class="resize-none outline-none block p-2.5 w-full text-xl text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            bind:value={jsonData}
          />
        </div>
      </div>
      <div class="mx-auto place-content-center my-16 text-white">
        <!-- <button
          id="validateButton"
          class="block w-32 mt-5 bg-blue-700 hover:bg-blue-800 border border-gray-300 font-bold py-2 px-4 rounded-lg"
          on:click={validate}>Validate</button
        > -->
        <!-- {#if isJsonValid} -->
        <label
          for="intend"
          class="block my-2 mt-5 text-sm text-black dark:text-white"
          >Select intend size:</label
        >
        <select
          id="intend"
          class="bg-blue-700 w-32 border border-gray-300 text-md rounded-lg block p-2.5 dark:border-gray-600 hover:bg-blue-800"
          value={intendSize}
          on:change={(event) => {
            intendSize = event.target.value;
          }}
        >
          <option value="2" selected><span>2 </span>Intend</option>
          <option value="3"><span>3 </span>Intend</option>
          <option value="4"><span>4 </span>Intend</option>
        </select>
        <button
          id="formatButton"
          class="block w-32 mt-5 bg-blue-700 hover:bg-blue-800 border border-gray-300 py-2 px-4 rounded-lg"
          on:click={format(intendSize)}>Format</button
        >
        <!-- {/if} -->
        <button
          on:click={reset}
          id="resetButton"
          class="block w-32 mt-5 bg-blue-700 hover:bg-blue-800 border border-gray-300 py-2 px-4 rounded-lg"
          >Reset</button
        >
      </div>
      <div
        class="bg-gray-50 h-auto border-gray-400 border-2 dark:border-slate-300 dark:border-1 rounded-3xl dark:bg-gray-800 dark:text-white"
      >
        <div class="px-4 py-2 my-4 flex justify-between items-center">
          <h3 class="truncate overflow-hidden text-lg">Download JSON</h3>
          <!-- {#if isJsonValid} -->
          <button
            on:click={downloadJson}
            class="py-2 px-4 rounded bg-blue-700 hover:bg-blue-800 text-white"
            id="downloadButton">Download</button
          >
          <!-- {/if} -->
        </div>
        <div
          class="p-3 text-xl h-auto border-t-gray-400 border-t-2 dark:border-t-slate-300 dark:border-t-2"
          spellcheck="false"
        >
          <textarea
            readonly
            placeholder="Formatted JSON here..."
            rows="18"
            class="resize-none outline-none block p-2.5 w-full text-xl text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
            bind:value={formattedJson}
          />
        </div>
      </div>
    </div>
  </div>
  <!--main div ends here-->
</div>

<style>
</style>
