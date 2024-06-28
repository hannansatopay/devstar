<script>
  let darkMode = false;
  let successToast = true;
  let successToastMessage = "JSON verified successfully.";
  let files = null;

  function fileUpload() {}

  function fnDarkModeToggler() {
    if (darkMode) {
      document.getElementById("mainContainer").style.backgroundColor =
        "rgb(226 232 240)";

      document.getElementById("divBox1").style.backgroundColor =
        "rgb(212 212 212)";
      document.getElementById("divBox2").style.backgroundColor =
        "rgb(212 212 212)";
      document.getElementById("divBox1").style.color = "black";
      document.getElementById("divBox2").style.color = "black";
      document.getElementById("divBox1").style.borderColor = "white";
      document.getElementById("divBox2").style.borderColor = "white";

      document.getElementById("downloadButton").style.color = "black";
      document.getElementById("uploadButton").style.color = "black";
      document.getElementById("darkModeButton").style.backgroundColor =
        "rgb(156 163 175)";
      document.getElementById("intendSizeLabel").style.color = "black";

      document.getElementById("validateButton").style.backgroundColor =
        "rgb(148 163 184)";
      document.getElementById("intendSize").style.backgroundColor =
        "rgb(148 163 184)";
      document.getElementById("formatButton").style.backgroundColor =
        "rgb(148 163 184)";
      document.getElementById("resetButton").style.backgroundColor =
        "rgb(148 163 184)";
      document.getElementById("validateButton").style.color = "black";
      document.getElementById("intendSize").style.color = "black";
      document.getElementById("formatButton").style.color = "black";
      document.getElementById("resetButton").style.color = "black";
      document.getElementById("headerDiv").style.backgroundColor =
        "rgb(71 85 105)";
      document.getElementById("bottomBorderBottomDiv1").style.borderTopColor =
        "white";
      document.getElementById("bottomBorderBottomDiv2").style.borderTopColor =
        "white";
    } else {
      /*dark theme*/

      document.getElementById("mainContainer").style.backgroundColor =
        "rgb(100 116 139)";

      document.getElementById("divBox1").style.backgroundColor =
        "rgb(71 85 105)";
      document.getElementById("divBox2").style.backgroundColor =
        "rgb(71 85 105)";

      document.getElementById("divBox1").style.color = "white";
      document.getElementById("divBox2").style.color = "white";
      document.getElementById("divBox1").style.borderColor = "black";
      document.getElementById("divBox2").style.borderColor = "black";

      document.getElementById("downloadButton").style.color = "black";
      document.getElementById("uploadButton").style.color = "black";
      document.getElementById("darkModeButton").style.backgroundColor =
        "rgb(71 85 105)";
      document.getElementById("intendSizeLabel").style.color = "white";
      document.getElementById("intendSize").style.color = "white";

      document.getElementById("validateButton").style.backgroundColor =
        "rgb(148 163 184)";
      document.getElementById("intendSize").style.backgroundColor =
        "rgb(148 163 184)";
      document.getElementById("formatButton").style.backgroundColor =
        "rgb(148 163 184)";
      document.getElementById("resetButton").style.backgroundColor =
        "rgb(148 163 184)";
      document.getElementById("validateButton").style.color = "black";
      document.getElementById("intendSize").style.color = "black";
      document.getElementById("formatButton").style.color = "black";
      document.getElementById("resetButton").style.color = "black";
      document.getElementById("headerDiv").style.backgroundColor = "black";
      document.getElementById("bottomBorderBottomDiv1").style.borderTopColor =
        "black";
      document.getElementById("bottomBorderBottomDiv2").style.borderTopColor =
        "black";
    }

    darkMode = !darkMode;
  }
</script>

<div
  class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg"
>
  <!-- Add tool here -->
  <div class="bg-slate-200 relative" id="mainContainer">
    <header class="bg-gray-400 py-4 sticky top-0 z-10" id="headerDiv">
      <div class="px-4 flex justify-between items-center">
        <h1 class="text-2xl text-white font-bold font-['Comic_Sans_MS']">
          JSON Formatter
        </h1>
        <button
          on:click={fnDarkModeToggler}
          id="darkModeButton"
          class="h-12 w-12 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <svg
            class="fill-white block dark:hidden"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"
            ></path>
          </svg>
          <svg
            class="fill-yellow-500 hidden dark:block"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              fill-rule="evenodd"
              clip-rule="evenodd"
            ></path>
          </svg>
        </button>
      </div>
    </header>

    <!--toast start here-->

    {#if successToast}
      <div
        id="toast-success"
        class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 absolute top-20 left-0"
        role="alert"
      >
        <div
          class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200"
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
          class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700"
          data-dismiss-target="#toast-success"
          aria-label="Close"
		  on:click={()=>{successToast=!successToast}}
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

    <!--<div id="toast-danger" class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 absolute top-16 left-0" role="alert">
	  <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-red-500 bg-red-100 rounded-lg dark:bg-red-800 dark:text-red-200">
		  <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
			  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z"/>
		  </svg>
		  <span class="sr-only">Error icon</span>
	  </div>
	  
	  <div class="ms-3 text-sm font-normal">Invalied JSON format.</div>
	  <button type="button" class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-danger" aria-label="Close">
		  <span class="sr-only">Close</span>
		  <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
			  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
		  </svg>
	  </button>
	</div>
	
	<div id="toast-warning" class="flex items-center w-full max-w-xs p-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800 absolute top-16 left-0" role="alert">
	  <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-orange-500 bg-orange-100 rounded-lg dark:bg-orange-700 dark:text-orange-200">
		  <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
			  <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM10 15a1 1 0 1 1 0-2 1 1 0 0 1 0 2Zm1-4a1 1 0 0 1-2 0V6a1 1 0 0 1 2 0v5Z"/>
		  </svg>
		  <span class="sr-only">Warning icon</span>
	  </div>
	  <div class="ms-3 text-sm font-normal">Invalied JSON format.</div>
	  <button type="button" class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-warning" aria-label="Close">
		  <span class="sr-only">Close</span>
		  <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
			  <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
		  </svg>
	  </button>
	</div> -->

    <!--toast start here-->

    <!--
			sample upload modal start here
			currently hidden property
		-->

    <div
      class="relative z-10"
      hidden
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
                      Click to upload
                    </p>
                  </div>
                </label>
              </form>
            </div>
            <div class="pb-5 pl-8">
              <button
                type="button"
                class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                >Upload</button
              >
              <button
                type="button"
                class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                >Cancel</button
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--sample upload modal ends here-->

    <!--main div starts here-->

    <div class="grid grid-cols-1 md:grid-cols-3 p-6">
      <div
        class="bg-neutral-300 h-screen mt-20 border-black border-2 rounded-3xl"
        id="divBox1"
      >
        <div class="px-4 py-2 my-4 flex justify-between items-center">
          <h3 class="truncate overflow-hidden">Upload Document</h3>
          <button
            class="py-2 px-4 rounded bg-slate-100 hover:bg-slate-200 font-bold"
            id="uploadButton">Upload</button
          >
        </div>
        <div
          class="p-2"
          style="border-top:2px solid black"
          id="bottomBorderBottomDiv1"
        >
          JSON here
        </div>
      </div>
      <div class="mx-auto my-16 content-center">
        <button
          id="validateButton"
          class="block text-black w-32 mt-5 bg-slate-400 hover:bg-slate-500 border border-gray-300 font-bold py-2 px-4 rounded-lg"
          >Validate</button
        >
        <label
          for="intendSize"
          id="intendSizeLabel"
          class="block my-2 mt-5 text-sm font-medium text-gray-900 font-bold"
          >Select intend size:</label
        >
        <select
          id="intendSize"
          class="bg-slate-400 text-black border border-gray-300 text-gray-900 text-md rounded-lg block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600"
        >
          <option selected value="2"
            ><span class="font-bold">2 </span>Intend</option
          >
          <option value="3"><span class="font-bold">3 </span>Intend</option>
          <option value="4"><span class="font-bold">4 </span>Intend</option>
        </select>
        <button
          id="formatButton"
          class="block w-32 mt-5 text-black bg-slate-400 hover:bg-slate-500 border border-gray-300 font-bold py-2 px-4 rounded-lg"
          >Format</button
        >
        <button
          id="resetButton"
          class="block w-32 mt-5 text-black bg-slate-400 hover:bg-slate-500 border border-gray-300 font-bold py-2 px-4 rounded-lg"
          >Reset</button
        >
      </div>
      <div
        class="bg-neutral-300 h-screen mt-20 border-black border-2 rounded-3xl"
        id="divBox2"
      >
        <div class="px-4 py-2 my-4 flex justify-between items-center">
          <h3 class="truncate overflow-hidden">Download Document</h3>
          <button
            class="py-2 px-4 rounded bg-slate-100 hover:bg-slate-200 font-bold"
            id="downloadButton">Download</button
          >
        </div>
        <div
          class="p-2"
          style="border-top:2px solid black"
          id="bottomBorderBottomDiv2"
        >
          Formatted JSON
        </div>
      </div>
    </div>
  </div>
  <!--main div ends here-->
</div>

<style>
</style>
