<script>
  let successToast = false;
  let dangerToast = true;
  let warningToast = false;
  let fileUploadModal = false;
  let isJsonValid = false;

  // hide download,intend size,and format buttons.show it when JSON validated successfully

  let successToastMessage = "JSON verified successfully.";
  let dangerToastMessage = "Invalied JSON format.";
  let warningToastMessage = "warning";

  let jsonData = "";
  let formattedJson = "";
  let intendSize = "2";

  let files = null;

  function validate() {
    // isJsonValid value to true when JSON validated successfully
  }

  function beautify(intendSize = 2) {
    validate();
  }

  function reset() {
    intendSize = "2";
    jsonData = "";
    formattedJson = "";
    files = null;
  }

  function fileUpload() {
    // check file type, call validation function when file uploaded successfully and change isJsonValid value
  }

  function downloadJson() {}
</script>

<div
  class="card items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg dark:bg-gray-900"
>
  <!-- Add tool here -->
  <div class="bg-slate-200 relative dark:bg-gray-900" id="mainContainer">
    <!--toast start here-->

    {#if successToast}
      <div
        id="toast-success"
        class="bg-green-500 flex items-center w-full max-w-xs p-4 mb-4 text-white rounded-lg shadow absolute top-5 left-0"
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
        class="flex items-center w-full max-w-xs p-4 mb-4 text-white rounded-lg shadow absolute top-5 left-0 bg-red-600"
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
        class="flex items-center w-full max-w-xs p-4 text-white bg-orange-500 rounded-lg shadow absolute top-5 left-0"
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
			sample upload modal start here
			currently hidden property
		-->

    {#if fileUploadModal}
      <div
        class="relative z-10"
        aria-labelledby="modal-title"
        role="dialog"
        aria-modal="true"
      >
        <!--
		use hidden propery or logical if 
		Background backdrop, show/hide based on modal state.
	
		Entering: "ease-out duration-300"
		  From: "opacity-0"
		  To: "opacity-100"
		Leaving: "ease-in duration-200"
		  From: "opacity-100"
		  To: "opacity-0"
	  -->
        <div
          class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>

        <div class="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div
            class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0"
          >
            <!--
			Modal panel, show/hide based on modal state.
	
			Entering: "ease-out duration-300"
			  From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
			  To: "opacity-100 translate-y-0 sm:scale-100"
			Leaving: "ease-in duration-200"
			  From: "opacity-100 translate-y-0 sm:scale-100"
			  To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
		  -->
            <div
              class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
            >
              <div
                class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6"
              >
                <button
                  type="button"
                  class="ms-auto -mx-1.5 -my-1.5 bg-red-500 text-white rounded-lg focus:ring-2 focus:ring-white p-1.5 hover:bg-red-700 inline-flex items-center justify-center h-8 w-8"
                  data-dismiss-target="#toast-danger"
                  aria-label="Close"
                  on:click={() => {
                    fileUploadModal = false;
                    files = null;
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

                <form
                  class="container mx-auto p-5"
                  method="POST"
                  enctype="multipart/form-data"
                >
                  <label
                    for="dropzone"
                    class="mb-3 flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50"
                  >
                    <input
                      bind:files
                      id="dropzone"
                      name="json"
                      type="file"
                      on:change={fileUpload}
                      class="hidden"
                      required
                    />

                    <div
                      class="flex flex-col items-center justify-center pt-5 pb-5"
                    >
                      <svg
                        class="w-8 h-8 mb-4 text-gray-500"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 16"
                        ><path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                        /></svg
                      >
                      <p class="text-sm text-gray-500 font-semibold">
                        Click to upload JSON file
                      </p>
                    </div>
                  </label>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!--sample upload modal ends here-->

    <!--main div starts here-->

    <div class="grid grid-cols-1 md:grid-cols-3 p-6 dark:bg-gray-900">
      <div
        class="bg-neutral-300 h-screen mt-20 border-black border-2 rounded-3xl dark:bg-gray-600 dark:border-white dark:border-2 dark:text-white"
      >
        <div class="px-4 py-2 my-4 flex justify-between items-center">
          <h3 class="truncate overflow-hidden">Upload Document</h3>
          <button
            on:click={() => {
              fileUploadModal = true;
            }}
            class="py-2 px-4 rounded bg-slate-100 hover:bg-slate-200 font-bold dark:text-black"
            id="uploadButton">Upload</button
          >
        </div>
        <div
          class="h-screen text-xl p-3 border-t-black border-t-2 dark:border-t-white dark:border-t-2 overflow-x-scroll"
          bind:innerHTML={jsonData}
          contenteditable
          spellcheck="false"
        ></div>
      </div>
      <div class="mx-auto my-16 content-center">
        <button
          id="validateButton"
          class="block text-black w-32 mt-5 bg-slate-400 hover:bg-slate-500 border border-gray-300 font-bold py-2 px-4 rounded-lg"
          on:click={validate}>Validate</button
        >
        {#if isJsonValid}
          <label
            for="intend"
            class="block my-2 mt-5 text-sm font-medium text-gray-900 font-bold dark:text-white"
            >Select intend size:</label
          >
          <select
            id="intend"
            class="bg-slate-400 text-black font-bold border border-gray-300 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:border-gray-600 hover:bg-slate-500"
            value={intendSize}
            on:change={(event) => {
              intendSize = event.target.value;
              beautify(intendSize);
            }}
          >
            <option value="2" selected><span>2 </span>Intend</option>
            <option value="3"><span>3 </span>Intend</option>
            <option value="4"><span>4 </span>Intend</option>
          </select>
          <button
            id="formatButton"
            class="block w-32 mt-5 text-black bg-slate-400 hover:bg-slate-500 border border-gray-300 font-bold py-2 px-4 rounded-lg"
            on:click={beautify(intendSize)}>Format</button
          >
        {/if}
        <button
          on:click={reset}
          id="resetButton"
          class="block w-32 mt-5 text-black bg-slate-400 hover:bg-slate-500 border border-gray-300 font-bold py-2 px-4 rounded-lg"
          >Reset</button
        >
      </div>
      <div
        class="bg-neutral-300 h-screen mt-20 border-black border-2 dark:border-white dark:border-2 rounded-3xl dark:bg-gray-600 dark:text-white"
      >
        <div class="px-4 py-2 my-4 flex justify-between items-center">
          <h3 class="truncate overflow-hidden">Download Document</h3>
          {#if isJsonValid}
            <button
              on:click={downloadJson}
              class="py-2 px-4 rounded bg-slate-100 hover:bg-slate-200 font-bold dark:text-black"
              id="downloadButton">Download</button
            >
          {/if}
        </div>
        <div
          class="p-3 text-xl h-screen border-t-black border-t-2 dark:border-t-white dark:border-t-2 overflow-x-scroll"
          spellcheck="false"
        >
          {formattedJson}
        </div>
      </div>
    </div>
  </div>
  <!--main div ends here-->
</div>

<style>
  [contenteditable] {
    outline: 0px solid transparent;
  }
</style>
