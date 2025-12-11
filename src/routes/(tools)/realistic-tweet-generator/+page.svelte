<script>
  import html2canvas from "html2canvas";

  // input changes
  let dateTime = new Date().toISOString().slice(0, 16);
  let viewCount = 0;
  let retweetCount = 0;
  let quoteCount = 0;
  let likeCount = 0;
  let bookmarkCount = 0;
  let tweetTitle = "Tweet Generator";
  let tweetHandle = "@tweetgenerator";
  let tweetText = `
    Hey there, Welcome to tweet generator ✨


    - You can edit anything you want by clicking on them
    - Move to the preview mode from the top bar
    - Checkout the preview and download your image in one-click
  `;

  function handleDateClick() {
    const inputElement = document.querySelector(".date-edit");
    inputElement.hidden = !inputElement.hidden;
    if (!inputElement.hidden) {
      inputElement.focus();
    }
  }

  function handleViewClick() {
    const inputElement = document.querySelector(".view-input");
    inputElement.hidden = !inputElement.hidden;
    if (!inputElement.hidden) {
      inputElement.focus();
    }
  }

  function handleRetweetClick() {
    const inputElement = document.querySelector(".retweet-input");
    inputElement.hidden = !inputElement.hidden;
    if (!inputElement.hidden) {
      inputElement.focus();
    }
  }

  function handleQuoteClick() {
    const inputElement = document.querySelector(".quotes-input");
    inputElement.hidden = !inputElement.hidden;
    if (!inputElement.hidden) {
      inputElement.focus();
    }
  }

  function handleLikeClick() {
    const inputElement = document.querySelector(".like-input");
    inputElement.hidden = !inputElement.hidden;
    if (!inputElement.hidden) {
      inputElement.focus();
    }
  }

  function handleBookmarkClick() {
    const inputElement = document.querySelector(".bookmark-input");
    inputElement.hidden = !inputElement.hidden;
    if (!inputElement.hidden) {
      inputElement.focus();
    }
  }

  function updateDateTime(event) {
    dateTime = event.target.value;
  }

  function updateViewCount(event) {
    viewCount = event.target.value;
  }

  function updateRetweetCount(event) {
    retweetCount = event.target.value;
  }

  function updateQuoteCount(event) {
    quoteCount = event.target.value;
  }

  function updateLikeCount(event) {
    likeCount = event.target.value;
  }

  function updateBookmarkCount(event) {
    bookmarkCount = event.target.value;
  }

  let darkOn = false;
  let lightOn = false;
  let dimOn = false;
  function dark() {
    //3c9aff
    darkOn = true;
    lightOn = false;
    dimOn = false;
    const card = document.querySelector(".tweet-generator");
    const reset = document.querySelector(".reset-text");
    const likeCount = document.querySelector(".like-count");
    const retweetCount = document.querySelector(".retweet-count");
    const bookmarkCount = document.querySelector(".bookmark-count");
    const quotesCounts = document.querySelector(".quotes-count");
    const viewsCounts = document.querySelector(".view-count");
    card.style.backgroundColor = "#111419";
    likeCount.style.color = "white";
    retweetCount.style.color = "white";
    bookmarkCount.style.color = "white";
    viewsCounts.style.color = "white";
    quotesCounts.style.color = "white";
    card.style.color = "white";
    reset.style.color = "white";
  }
  function light() {
    lightOn = true;
    darkOn = false;
    dimOn = false;
    const card = document.querySelector(".tweet-generator");
    const reset = document.querySelector(".reset-text");
    const likeCount = document.querySelector(".like-count");
    const retweetCount = document.querySelector(".retweet-count");
    const bookmarkCount = document.querySelector(".bookmark-count");
    const quotesCounts = document.querySelector(".quotes-count");
    const viewsCounts = document.querySelector(".view-count");
    card.style.backgroundColor = "white";
    likeCount.style.color = "black";
    retweetCount.style.color = "black";
    bookmarkCount.style.color = "black";
    viewsCounts.style.color = "black";
    quotesCounts.style.color = "black";
    card.style.color = "black";
    reset.style.color = "black";
  }
  function dim() {
    dimOn = true;
    lightOn = false;
    darkOn = false;
    const card = document.querySelector(".tweet-generator");
    const reset = document.querySelector(".reset-text");
    const likeCount = document.querySelector(".like-count");
    const retweetCount = document.querySelector(".retweet-count");
    const bookmarkCount = document.querySelector(".bookmark-count");
    const quotesCounts = document.querySelector(".quotes-count");
    const viewsCounts = document.querySelector(".view-count");
    card.style.backgroundColor = "#232833";
    likeCount.style.color = "white";
    retweetCount.style.color = "white";
    bookmarkCount.style.color = "white";
    viewsCounts.style.color = "white";
    quotesCounts.style.color = "white";
    card.style.color = "white";
    reset.style.color = "white";
  }
  function downloadDivAsImage() {
    const divToDownload = document.querySelector(".tweet-generator");
    html2canvas(divToDownload).then((canvas) => {
      const link = document.createElement("a");
      link.download = "tweet-generator.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    });
  }
  function copyDivAsImage() {
    const divToCopy = document.querySelector(".tweet-generator");
    html2canvas(divToCopy).then((canvas) => {
      canvas.toBlob((blob) => {
        if (navigator.clipboard && navigator.clipboard.write) {
          const item = new ClipboardItem({ "image/png": blob });
          navigator.clipboard
            .write([item])
            .then(() => {
              alert("Image copied to clipboard");
            })
            .catch((error) => {
              console.error("Error copying image to clipboard:", error);
            });
        } else {
          console.error("Clipboard API not available");
        }
      });
    });
  }

  // image
  let imageUrl = "/avatar.svg";
  let fileInput;

  function handleImageChange(event) {
    const file = event.target.files[0];
    if (file) {
      imageUrl = URL.createObjectURL(file);
    }
  }

  let tweetImage = "";
  let imageInput;

  function handleImgChange(event) {
    const file = event.target.files[0];
    if (
      file &&
      (file.type === "image/png" ||
        file.type === "image/jpeg" ||
        file.type === "image/jpg")
    ) {
      const reader = new FileReader();
      reader.onload = (e) => {
        tweetImage = e.target.result;
        adjustWrapperSize(e.target.result);
      };
      reader.readAsDataURL(file);
    } else {
      alert("Please upload a valid PNG or JPEG image.");
    }
  }

  function adjustWrapperSize(imageSrc) {
    const img = new Image();
    img.onload = () => {
      const avatarWrapper = document.querySelector(".file-input");
      let width = img.width;
      let height = img.height;

      if (width > 500) {
        height = (height * 500) / width;
        width = 500;
      }
      if (height > 1000) {
        width = (width * 1000) / height;
        height = 1000;
      }

      avatarWrapper.style.width = `${width}px`;
      avatarWrapper.style.height = `${height}px`;
    };
    img.src = imageSrc;
  }

  // image
  //tweet generator
  import { onMount } from "svelte";
  let isEditing = false;
  let inputValue = tweetTitle;
  let characterCount = tweetTitle.length;

  function handleTweetTitleClick() {
    isEditing = true;
    onMount(() => {
      inputElement.focus();
    });
  }

  function updateTweetTitle(event) {
    inputValue = event.target.value;
    characterCount = inputValue.length;
  }

  function handleInputBlur() {
    if (inputValue.trim() === "") {
      inputValue = tweetTitle;
    }
    tweetTitle = inputValue;
    isEditing = false;
  }

  $: characterCount = inputValue.length > 50 ? 50 : inputValue.length;
  $: inputValue = inputValue.slice(0, 50);
  // tweet generator
  // tweet handle
  let inputHandle = tweetHandle;
  let isEditingHandle = false;

  let charCountHandle = tweetHandle.length;
  function handleTweetHandleClick() {
    isEditingHandle = true;
    onMount(() => {
      handleInputElement.focus();
    });
  }

  function updateTweetHandle(event) {
    inputHandle = event.target.value;
    if (inputValue.length > 50) {
      inputValue = inputValue.slice(0, 50);
    }
    charCountHandle = inputHandle.length;
  }

  function handleHandleBlur() {
    if (inputHandle.trim() === "") {
      inputHandle = tweetHandle;
    }
    tweetHandle = inputHandle;
    isEditingHandle = false;
  }

  // tweet handle
  // editing text
  let inputText = tweetText;
  let isEditingText = false;
  let charCountText = tweetText.length;
  function handleTweetTextClick() {
    isEditingText = true;
    onMount(() => {
      textInputElement.focus();
    });
  }
  function updateTweetText(event) {
    inputText = event.target.value;
    charCountText = inputText.length;
  }
  function handleTextBlur() {
    if (inputText.trim() === "") {
      inputText = tweetText;
    }
    tweetText = inputText;
    isEditingText = false;
  }
  $: charCountText = inputText.length > 280 ? 280 : inputText.length;
  $: inputText = inputText.slice(0, 280);
  // editing text
  // reset

  function resetValuesAndTheme() {
    dateTime = new Date().toISOString().slice(0, 16);
    viewCount = 0;
    retweetCount = 0;
    quoteCount = 0;
    likeCount = 0;
    bookmarkCount = 0;
    tweetTitle = "Tweet Generator";
    tweetHandle = "@tweetgenerator";
    tweetText = `
      Hey there, Welcome to tweet generator ✨

      - You can edit anything you want by clicking on them
      - Move to the preview mode from the top bar
      - Checkout the preview and download your image in one-click
    `;
    tweetImage = "";
    imageUrl = "/avatar.svg";
    fileInput.value = "";
    imageInput.value = "";
    inputHandle = tweetHandle;
    inputText = tweetText;
    charCountHandle = tweetHandle.length;
    charCountText = tweetText.length;
    light();
    dimOn = false;
    lightOn = false;
    darkOn = false;
  }
  // reset
  let isEditingOn = true;

  function toggleEditMode() {
    isEditingOn = true;
    resizeImage();
  }

  function togglePreviewMode() {
    isEditingOn = false;
    resizeImage();
  }

  function resizeImage() {
    const img = new Image();
    img.onload = () => {
      const avatarWrapper = document.querySelector(".file-input");
      let width = img.width;
      let height = img.height;

      if (width > 500) {
        height = (height * 500) / width;
        width = 500;
      }
      if (height > 1000) {
        width = (width * 1000) / height;
        height = 1000;
      }

      avatarWrapper.style.width = `${width}px`;
      avatarWrapper.style.height = `${height}px`;
    };
    img.src = tweetImage;
  }
</script>

<head>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link
    href="https://fonts.googleapis.com/css2?family=Open+Sans:wght@300;400;600;700&display=swap"
    rel="stylesheet"
  />
</head>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-2">
    <div class="space-y-6">
      <!-- SINGLE MAIN CONTAINER -->
      <div
        class="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"
      >
        <!-- TOP ROW: THEME TITLE (LEFT) + EDIT/PREVIEW TOGGLE (RIGHT) -->
        <div class="flex items-center justify-between w-full">
          <!-- Edit / Preview Toggle (Single Button) -->

          <button
            type="button"
            class={`flex flex-col rounded-xl border px-4 py-3 text-left text-sm transition
    focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800
    ${
      isEditingOn
        ? "border-indigo-500 bg-indigo-100 text-indigo-600 dark:border-indigo-400 dark:bg-indigo-500/10 dark:text-indigo-200"
        : "border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
    }`}
            on:click={() => {
              if (isEditingOn) {
                togglePreviewMode();
              } else {
                toggleEditMode();
              }
            }}
          >
            {isEditingOn ? "Preview" : "Edit"}
          </button>

          <!-- DOWNLOAD BUTTONS -->

          <button
            type="button"
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-500 dark:hover:text-emerald-200 dark:focus:ring-emerald-900"
            on:click={downloadDivAsImage}
          >
            Download
          </button>
        </div>

        <!-- Theme Label -->
        <div class="theme-group flex items-center">
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Theme
          </p>
        </div>

        <!-- THEME OPTIONS (3 BUTTONS) -->
        <div
          class="space-x-2 border-t pt-6 border-slate-200 dark:border-slate-700"
          role="radiogroup"
        >
          <button
            type="button"
            value="Light"
            name="theme"
            class="inline-flex items-center rounded-full border border-amber-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-600 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-amber-500 dark:text-amber-200 dark:hover:bg-amber-500/10 dark:focus:ring-amber-900 Light {lightOn
              ? 'active'
              : 'inactive'} {isEditingOn ? 'disabled' : ''}"
            on:click={light}
          >
            Light
          </button>

          <button
            type="button"
            value="Dark"
            name="theme"
            class="inline-flex items-center rounded-full border border-amber-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-600 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-amber-500 dark:text-amber-200 dark:hover:bg-amber-500/10 dark:focus:ring-amber-900 Dark {darkOn
              ? 'active'
              : 'inactive'} {isEditingOn ? 'disabled' : ''}"
            on:click={dark}
          >
            Dark
          </button>

          <button
            type="button"
            value="Dim"
            name="theme"
            class="inline-flex items-center rounded-full border border-amber-400 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-amber-600 transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-200 dark:border-amber-500 dark:text-amber-200 dark:hover:bg-amber-500/10 dark:focus:ring-amber-900 Dim {dimOn
              ? 'active'
              : 'inactive'} {isEditingOn ? 'disabled' : ''}"
            on:click={dim}
          >
            Dim
          </button>
        </div>
      </div>

      <!-- TOOLTIP / FEATURE LIST -->
      <div
        class="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50"
      >
        <h3
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
        >
          TOOLTIP
        </h3>

        <ul
          class="mt-5 space-y-4 rounded-2xl border border-slate-200/70 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40"
        >
          <li
            class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
          >
            <span class="text-sm font-semibold text-slate-900 dark:text-white"
              >•</span
            >
            Get a perfect tweet layout optimized for a clean desktop-style display.
          </li>
          <li
            class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
          >
            <span class="text-sm font-semibold text-slate-900 dark:text-white"
              >•</span
            >
            Create fake tweets that look identical to real Twitter posts.
          </li>
          <li
            class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
          >
            <span class="text-sm font-semibold text-slate-900 dark:text-white"
              >•</span
            >
            Customize everything—profile photo, handle, name, text, and attached
            media.
          </li>
          <li
            class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
          >
            <span class="text-sm font-semibold text-slate-900 dark:text-white"
              >•</span
            >
            Add likes, retweets, replies, bookmarks, and views for a fully authentic
            look.
          </li>
          <li
            class="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"
          >
            <span class="text-sm font-semibold text-slate-900 dark:text-white"
              >•</span
            >
            Download or share your generated tweet instantly with high quality.
          </li>
        </ul>
      </div>
    </div>

    <!-- tweet container -->
    <div
      class="rounded-3xl border border-slate-200 bg-blue-100 p-6 shadow-sm dark:border-slate-800 dark:bg-blue-700/85"
    >
      <div class="tweet-container w-full max-w-full">
        {#if isEditingOn}
          <div
            class="tweet-generator bg-white rounded-2xl p-4 sm:p-5 shadow-sm"
          >
            <div class="generator">
              <div class="gen-header flex items-start justify-between gap-3">
                <div class="twitter-header flex items-start gap-3">
                  <!-- avatar -->
                  <div class="generator-avatar">
                    <input
                      type="file"
                      class="files"
                      accept=".jpg, .jpeg, .png"
                      on:change={handleImageChange}
                      bind:this={fileInput}
                    />
                    <div class="avatar-wrapper">
                      <img
                        class="avatar rounded-full h-12 w-12 object-cover"
                        src={imageUrl}
                        alt=""
                      />
                    </div>
                  </div>

                  <!-- title + handle -->
                  <div class="gen-title">
                    <div class="editable">
                      {#if isEditing}
                        <input
                          class="tweet-generator-title px-2 py-1 rounded-md text-base"
                          value={inputValue}
                          on:blur={handleInputBlur}
                          on:input={updateTweetTitle}
                        />
                        <p class="character-count mt-1">
                          {characterCount}/50 characters written
                        </p>
                      {:else}
                        <span
                          class="editable_preview"
                          on:click={handleTweetTitleClick}
                        >
                          {tweetTitle}
                        </span>
                      {/if}

                      <button
                        type="button"
                        class="logo-button ml-2 p-1 rounded-md"
                        id="menu-button"
                        aria-expanded="false"
                        aria-haspopup="menu"
                        aria-controls="menu-list"
                      >
                        <!-- svg unchanged -->
                        <svg
                          fill="#3c9aff"
                          viewBox="0 0 22 22"
                          focusable="false"
                          class="chakra-icon"
                          aria-hidden="true"
                        >
                          <path
                            d="M20.396 11a3.487 3.487 0 00-2.008-3.062 3.474 3.474 0 00-.742-3.584 3.474 3.474 0 00-3.584-.742A3.468 3.468 0 0011 1.604a3.463 3.463 0 00-3.053 2.008 3.472 3.472 0 00-1.902-.14c-.635.13-1.22.436-1.69.882a3.461 3.461 0 00-.734 3.584A3.49 3.49 0 001.604 11a3.496 3.496 0 002.017 3.062 3.471 3.471 0 00.733 3.584 3.49 3.49 0 003.584.742A3.487 3.487 0 0011 20.396a3.476 3.476 0 003.062-2.007 3.335 3.335 0 004.326-4.327A3.487 3.487 0 0020.396 11zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
                          ></path>
                        </svg>
                      </button>
                    </div>

                    <div class="tweet-editable mt-2">
                      <div>
                        {#if isEditingHandle}
                          <input
                            class="tweet-subheading px-2 py-1 rounded-md"
                            bind:value={inputHandle}
                            on:blur={handleHandleBlur}
                            on:input={updateTweetHandle}
                            on:keyup={(event) =>
                              event.key === "Enter" && handleHandleBlur()}
                          />
                          <p class="character-count mt-1">
                            {charCountHandle}/15 characters. Should be only
                            numbers, letters, and _
                          </p>
                        {:else}
                          <span
                            class="tweet-editable_preview"
                            on:click={handleTweetHandleClick}
                          >
                            {tweetHandle}
                          </span>
                        {/if}
                      </div>
                    </div>
                  </div>
                </div>
                <div class="reset">
                  <button
                    type="button"
                    class="reset-button inline-flex items-center gap-2"
                    on:click={resetValuesAndTheme}
                  >
                    <span class="reset-button__icon"></span>
                    <p class="reset-text m-0">Reset</p>
                  </button>
                </div>
              </div>

              <!-- tweet text -->
              <div class="mt-3 para tweet-text">
                {#if isEditingText}
                  <textarea
                    class="tweet-textarea w-full min-h-[200px] rounded-md px-3 py-2 text-base"
                    bind:value={inputText}
                    on:blur={handleTextBlur}
                    on:input={updateTweetText}
                  ></textarea>
                  <p class="character-count mt-2">
                    {charCountText}/280 characters
                  </p>
                {:else}
                  <div on:click={handleTweetTextClick}>
                    {#each inputText.split("\n") as line}
                      {#if line.trim() === ""}
                        <br />
                      {:else}
                        <p class="m-0">{line}</p>
                      {/if}
                    {/each}
                  </div>
                {/if}
              </div>

              <!-- file input -->
              <div
                class="mt-4 para file-input relative w-full h-[70px] rounded-md border-2 border-dashed border-[#cfd6dd] overflow-hidden cursor-pointer flex items-center justify-center"
              >
                <input
                  type="file"
                  class="files"
                  accept=".jpg, .jpeg, .png"
                  on:change={handleImgChange}
                  bind:this={imageInput}
                />
                <div class="image-wrapper text-center">
                  <img class="photo max-h-36 mx-auto" src={tweetImage} alt="" />
                  <p class="file-text mt-2">
                    Drag and drop or click here to add image
                  </p>
                </div>
              </div>

              <!-- date & views -->
              <div class="date-views mt-4 flex flex-wrap gap-4 items-center">
                <div class="date-editable">
                  <div class="date-area edit-area cursor-pointer">
                    <input
                      type="datetime-local"
                      class="date-edit edit-input"
                      bind:value={dateTime}
                      on:input={updateDateTime}
                      hidden
                    />
                    <div
                      aria-label="Edit"
                      type="button"
                      class="date"
                      on:click={handleDateClick}
                    >
                      <p class="date-text m-0">
                        {new Date(dateTime).toLocaleString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })} ·
                        {new Date(dateTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="views-editable">
                  <div class="view-area edit-area cursor-pointer">
                    <input
                      type="text"
                      min="0"
                      class="view-input edit-input"
                      bind:value={viewCount}
                      on:input={updateViewCount}
                      hidden
                    />
                    <div
                      aria-label="Edit"
                      type="button"
                      class="view-div"
                      on:click={handleViewClick}
                    >
                      <p class="view-count m-0">{viewCount}</p>
                      <p class="view-text m-0">Views</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- counts row -->
              <div class="count-tab grid grid-cols-4 gap-4">
                <div class="col-span-1 retweet-area edit-area">
                  <input
                    type="text"
                    min="0"
                    class="retweet-input edit-input"
                    bind:value={retweetCount}
                    on:input={updateRetweetCount}
                    hidden
                  />
                  <div
                    aria-label="Edit"
                    type="button"
                    class="retweet-div grid grid-cols-3"
                    on:click={handleRetweetClick}
                  >
                    <p class="retweet-count col-span-1">{retweetCount}</p>
                    <p class="retweet-text col-span-2">Retweets</p>
                  </div>
                </div>

                <div class="quotes-area edit-area">
                  <input
                    type="text"
                    min="0"
                    class="quotes-input edit-input"
                    bind:value={quoteCount}
                    on:input={updateQuoteCount}
                    hidden
                  />
                  <div
                    aria-label="Edit"
                    type="button"
                    class="quotes-div grid grid-cols-3"
                    on:click={handleQuoteClick}
                  >
                    <p class="quotes-count col-span-1">{quoteCount}</p>
                    <p class="quotes-text col-span-2">Quotes</p>
                  </div>
                </div>

                <div class="like-area edit-area">
                  <input
                    type="text"
                    min="0"
                    class="like-input edit-input grid grid-cols-3"
                    bind:value={likeCount}
                    on:input={updateLikeCount}
                    hidden
                  />
                  <div
                    aria-label="Edit"
                    type="button"
                    class="like-div grid grid-cols-3"
                    on:click={handleLikeClick}
                  >
                    <p class="like-count col-span-1">{likeCount}</p>
                    <p class="like-text col-span-2">Likes</p>
                  </div>
                </div>

                <div class="bookmark-area edit-area">
                  <input
                    type="text"
                    min="0"
                    class="bookmark-input edit-input"
                    bind:value={bookmarkCount}
                    on:input={updateBookmarkCount}
                    hidden
                  />
                  <div
                    aria-label="Edit"
                    type="button"
                    class="bookmark-div"
                    on:click={handleBookmarkClick}
                  >
                    <p class="bookmark-count col-span-1">{bookmarkCount}</p>
                    <p class="bookmark-text col-span-2">Bookmarks</p>
                  </div>
                </div>
              </div>

              <!-- icons row -->
              <div class="icon-container mt-4 flex gap-4 items-center">
                <div class="icon-area">
                  <!-- svg unchanged -->
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentcolor"
                    width="1.2rem"
                    height="1.2rem"
                    focusable="false"
                    class="icon"
                    viewBox="0 0 24 24"
                    ><g
                      ><path
                        d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"
                      ></path></g
                    ></svg
                  >
                </div>
                <div class="icon-area">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentcolor"
                    width="1.2rem"
                    height="1.2rem"
                    focusable="false"
                    class="icon"
                    viewBox="0 0 24 24"
                    ><g
                      ><path
                        d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"
                      ></path></g
                    ></svg
                  >
                </div>
                <div class="icon-area">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentcolor"
                    width="1.2rem"
                    height="1.2rem"
                    focusable="false"
                    class="icon"
                    viewBox="0 0 24 24"
                    ><g
                      ><path
                        d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
                      ></path></g
                    ></svg
                  >
                </div>
                <div class="icon-area">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentcolor"
                    width="1.2rem"
                    height="1.2rem"
                    focusable="false"
                    class="icon"
                    viewBox="0 0 24 24"
                    ><g
                      ><path
                        d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"
                      ></path></g
                    ></svg
                  >
                </div>
                <div class="icon-area">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentcolor"
                    width="1.2rem"
                    height="1.2rem"
                    focusable="false"
                    class="icon"
                    viewBox="0 0 24 24"
                    ><g
                      ><path
                        d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"
                      ></path></g
                    ></svg
                  >
                </div>
              </div>
              <!--generator-->
            </div>
            <!--tweet-generator-->
          </div>
        {:else}
          <!-- preview / non-edit view — kept minimal and consistent -->
          <div
            class="tweet-generator bg-white rounded-2xl p-4 sm:p-5 shadow-sm"
          >
            <div class="generator">
              <div class="gen-header flex items-start gap-3">
                <div class="twitter-header flex items-center gap-3">
                  <!--image avatar-->
                  <div class="generator-avatar">
                    <div class="avatar-wrapper">
                      <img
                        class="avatar rounded-full h-12 w-12 object-cover"
                        src={imageUrl}
                        alt=""
                      />
                    </div>
                  </div>

                  <div class="gen-title">
                    <div class="editable">
                      <span
                        class="editable_preview {isEditingOn
                          ? ''
                          : 'active-area'}"
                      >
                        {tweetTitle}
                      </span>
                      <button
                        type="button"
                        class="logo-button no-border"
                        id="menu-button"
                        aria-expanded="false"
                        aria-haspopup="menu"
                        aria-controls="menu-list"
                      >
                        <!-- svg unchanged -->
                        <svg
                          fill="#3c9aff"
                          viewBox="0 0 22 22"
                          focusable="false"
                          class="chakra-icon"
                          aria-hidden="true"
                          ><path
                            d="M20.396 11a3.487 3.487 0 00-2.008-3.062 3.474 3.474 0 00-.742-3.584 3.474 3.474 0 00-3.584-.742A3.468 3.468 0 0011 1.604a3.463 3.463 0 00-3.053 2.008 3.472 3.472 0 00-1.902-.14c-.635.13-1.22.436-1.69.882a3.461 3.461 0 00-.734 3.584A3.49 3.49 0 001.604 11a3.496 3.496 0 002.017 3.062 3.471 3.471 0 00.733 3.584 3.49 3.49 0 003.584.742A3.487 3.487 0 0011 20.396a3.476 3.476 0 003.062-2.007 3.335 3.335 0 004.326-4.327A3.487 3.487 0 0020.396 11zM9.662 14.85l-3.429-3.428 1.293-1.302 2.072 2.072 4.4-4.794 1.347 1.246z"
                          ></path></svg
                        >
                      </button>
                    </div>

                    <div class="tweet-editable mt-1">
                      <span
                        class="tweet-editable_preview {isEditingOn
                          ? ''
                          : 'active-area'}"
                      >
                        {tweetHandle}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div class="mt-3">
                <div>
                  {#each inputText.split("\n") as line}
                    {#if line.trim() === ""}
                      <br />
                    {:else}
                      <p class="m-0">{line}</p>
                    {/if}
                  {/each}
                </div>
              </div>

              {#if tweetImage !== ""}
                <div
                  class="file-input {isEditingOn ? '' : 'file-input-active'}"
                >
                  <div class="image-wrapper">
                    <img
                      class="photo max-h-56 w-full object-cover rounded-md"
                      src={tweetImage}
                      alt=""
                    />
                  </div>
                </div>
              {/if}

              <!-- date-views + counts and icons same as above (kept minimal) -->

              <div class="date-views">
                <div class="date-editable">
                  <div
                    class="date-area edit-area {isEditingOn
                      ? ''
                      : 'active-area'}"
                  >
                    <div aria-label="Edit" type="button" class="date">
                      <p class="date-text">
                        {new Date(dateTime).toLocaleString("en-US", {
                          hour: "numeric",
                          minute: "numeric",
                          hour12: true,
                        })} · {new Date(dateTime).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="views-editable">
                  <div
                    class="view-area edit-area {isEditingOn
                      ? ''
                      : 'active-area'}"
                  >
                    <div aria-label="Edit" type="button" class="view-div">
                      <p class="view-count">{viewCount}</p>
                      <p class="view-text">Views</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="count-tab grid grid-cols-4 gap-4">
                <div
                  class="retweet-area edit-area {isEditingOn
                    ? ''
                    : 'active-area'}"
                >
                  <div
                    aria-label="Edit"
                    type="button"
                    class="retweet-div grid grid-cols-3"
                  >
                    <p class="retweet-count col-span-1">{retweetCount}</p>
                    <p class="retweet-text col-span-2">Retweets</p>
                  </div>
                </div>

                <div
                  class="quotes-area edit-area {isEditingOn
                    ? ''
                    : 'active-area'}"
                >
                  <div
                    aria-label="Edit"
                    type="button"
                    class="quotes-div grid grid-cols-3"
                  >
                    <p class="quotes-count col-span-1">{quoteCount}</p>
                    <p class="quotes-text col-span-2">Quotes</p>
                  </div>
                </div>

                <div
                  class="like-area edit-area {isEditingOn ? '' : 'active-area'}"
                >
                  <div
                    aria-label="Edit"
                    type="button"
                    class="like-div grid grid-cols-3"
                  >
                    <p class="like-count col-span-1">{likeCount}</p>
                    <p class="like-text col-span-2">Likes</p>
                  </div>
                </div>

                <div
                  class="bookmark-area edit-area {isEditingOn
                    ? ''
                    : 'active-area'}"
                >
                  <div
                    aria-label="Edit"
                    type="button"
                    class="bookmark-div grid grid-cols-3"
                  >
                    <p class="bookmark-count col-span-1">{bookmarkCount}</p>
                    <p class="bookmark-text col-span-2">Bookmarks</p>
                  </div>
                </div>
              </div>

              <div class="icon-container">
                <div class="icon-area">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentcolor"
                    width="1.2rem"
                    height="1.2rem"
                    focusable="false"
                    class="icon"
                    viewBox="0 0 24 24"
                    ><g
                      ><path
                        d="M1.751 10c0-4.42 3.584-8 8.005-8h4.366c4.49 0 8.129 3.64 8.129 8.13 0 2.96-1.607 5.68-4.196 7.11l-8.054 4.46v-3.69h-.067c-4.49.1-8.183-3.51-8.183-8.01zm8.005-6c-3.317 0-6.005 2.69-6.005 6 0 3.37 2.77 6.08 6.138 6.01l.351-.01h1.761v2.3l5.087-2.81c1.951-1.08 3.163-3.13 3.163-5.36 0-3.39-2.744-6.13-6.129-6.13H9.756z"
                      ></path></g
                    ></svg
                  >
                </div>
                <div class="icon-area">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentcolor"
                    width="1.2rem"
                    height="1.2rem"
                    focusable="false"
                    class="icon"
                    viewBox="0 0 24 24"
                    ><g
                      ><path
                        d="M4.5 3.88l4.432 4.14-1.364 1.46L5.5 7.55V16c0 1.1.896 2 2 2H13v2H7.5c-2.209 0-4-1.79-4-4V7.55L1.432 9.48.068 8.02 4.5 3.88zM16.5 6H11V4h5.5c2.209 0 4 1.79 4 4v8.45l2.068-1.93 1.364 1.46-4.432 4.14-4.432-4.14 1.364-1.46 2.068 1.93V8c0-1.1-.896-2-2-2z"
                      ></path></g
                    ></svg
                  >
                </div>
                <div class="icon-area">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentcolor"
                    width="1.2rem"
                    height="1.2rem"
                    focusable="false"
                    class="icon"
                    viewBox="0 0 24 24"
                    ><g
                      ><path
                        d="M16.697 5.5c-1.222-.06-2.679.51-3.89 2.16l-.805 1.09-.806-1.09C9.984 6.01 8.526 5.44 7.304 5.5c-1.243.07-2.349.78-2.91 1.91-.552 1.12-.633 2.78.479 4.82 1.074 1.97 3.257 4.27 7.129 6.61 3.87-2.34 6.052-4.64 7.126-6.61 1.111-2.04 1.03-3.7.477-4.82-.561-1.13-1.666-1.84-2.908-1.91zm4.187 7.69c-1.351 2.48-4.001 5.12-8.379 7.67l-.503.3-.504-.3c-4.379-2.55-7.029-5.19-8.382-7.67-1.36-2.5-1.41-4.86-.514-6.67.887-1.79 2.647-2.91 4.601-3.01 1.651-.09 3.368.56 4.798 2.01 1.429-1.45 3.146-2.1 4.796-2.01 1.954.1 3.714 1.22 4.601 3.01.896 1.81.846 4.17-.514 6.67z"
                      ></path></g
                    ></svg
                  >
                </div>
                <div class="icon-area">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentcolor"
                    width="1.2rem"
                    height="1.2rem"
                    focusable="false"
                    class="icon"
                    viewBox="0 0 24 24"
                    ><g
                      ><path
                        d="M4 4.5C4 3.12 5.119 2 6.5 2h11C18.881 2 20 3.12 20 4.5v18.44l-8-5.71-8 5.71V4.5zM6.5 4c-.276 0-.5.22-.5.5v14.56l6-4.29 6 4.29V4.5c0-.28-.224-.5-.5-.5h-11z"
                      ></path></g
                    ></svg
                  >
                </div>
                <div class="icon-area">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentcolor"
                    width="1.2rem"
                    height="1.2rem"
                    focusable="false"
                    class="icon"
                    viewBox="0 0 24 24"
                    ><g
                      ><path
                        d="M12 2.59l5.7 5.7-1.41 1.42L13 6.41V16h-2V6.41l-3.3 3.3-1.41-1.42L12 2.59zM21 15l-.02 3.51c0 1.38-1.12 2.49-2.5 2.49H5.5C4.11 21 3 19.88 3 18.5V15h2v3.5c0 .28.22.5.5.5h12.98c.28 0 .5-.22.5-.5L19 15h2z"
                      ></path></g
                    ></svg
                  >
                </div>
              </div>
              <!--generator-->
            </div>
            <!--tweet-generator-->
          </div>
        {/if}
        <!--tweet-container-->
      </div>
    </div>
  </div>
</section>

<style>
  .disabled {
    pointer-events: none;
    opacity: 0.5;
  }

  .editable_preview,
  .tweet-editable_preview {
    cursor: pointer;
  }

  .character-count {
    font-size: 10px;
    color: #777;
  }

  .tweet-text p {
    margin: 5px 0;
  }

  .tweet-subheading {
    width: 90%;
  }

  .tweet-generator-title {
    display: block;
    background-color: #edf2f7;
    font-size: 16px;
    font-weight: bold;
  }

  .view-input,
  .retweet-input,
  .quotes-input,
  .like-input,
  .bookmark-input {
    width: 50px;
  }

  .para {
    list-style-type: disc;
    margin-left: 20px;
  }

  .theme-group,
  .date-views,
  .icon-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .theme-label {
    font-weight: bold;
    font-size: 13px;
    margin-right: 10px;
  }

  .tweet-text {
    cursor: pointer;
  }

  .theme-option,
  .reset-button,
  .logo-button {
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 5px;
    font-size: 13px;
    font-weight: bold;
    display: flex;
    align-items: center;
  }

  .theme-option,
  .button-copy {
    border: 1px solid #e6e8eb;
    box-shadow: 5px 5px 10px rgba(126, 125, 125, 0.169);
  }

  .editable_preview:hover,
  .tweet-editable_preview:hover,
  .reset-button:hover,
  .date-area:hover,
  .view-area:hover,
  .tweet-text-textarea:hover,
  .tweet-text:hover,
  .tweet-subheading:hover,
  .tweet-genertor-title:hover,
  .bookmark-area:hover,
  .quotes-area:hover,
  .like-area:hover,
  .retweet-area:hover {
    background-color: #edf2f7;
    border-radius: 7px;
  }

  .icon {
    color: #888;
  }

  .count-tab,
  .date-views {
    margin: 6px 0;
    padding: 6px 0;
    border-bottom: 1.5px solid #e7eaed;
  }

  .date-area,
  .view-area,
  .bookmark-area,
  .quotes-area,
  .like-area,
  .retweet-area {
    cursor: pointer;
  }

  .date-text,
  .view-text,
  .bookmark-text,
  .quotes-text,
  .like-text,
  .retweet-text {
    font-size: 14px;
    color: #777;
  }

  .view-count,
  .bookmark-count,
  .quotes-count,
  .like-count,
  .retweet-count {
    font-weight: bold;
    color: #222;
  }

  .date-text,
  .view-count,
  .view-text,
  .bookmark-text,
  .quotes-text,
  .like-text,
  .retweet-text,
  .bookmark-count,
  .quotes-count,
  .like-count,
  .retweet-count,
  .icon-area {
    display: inline-block;
  }

  .file-text {
    color: #555;
    font-size: 12px;
    margin-top: 5px;
  }

  .files {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }

  .tweet-text-wrapper,
  .tweet-text-textarea,
  .tweet-text,
  .tweet-subheading,
  .tweet-genertor-title {
    width: 100%;
    border: none;
    outline: none !important;
    resize: vertical;
    line-height: 1.5;
    font-family: inherit;
    background-color: transparent;
    overflow: hidden;
    transition: border-color 0.3s ease;
    padding: 10px;
    margin-top: 10px;
  }

  .tweet-text-textarea {
    min-height: 200px;
    border-radius: 5px;
  }

  .tweet-text-textarea:focus,
  .tweet-subheading:focus,
  .tweet-genertor-title:focus {
    border-color: #edf2f7;
    outline-color: #edf2f7;
    background-color: #edf2f7;
    border-radius: 5px;
  }

  .tweet-text-textarea::placeholder,
  .tweet-subheading::placeholder,
  .tweet-genertor-title::placeholder {
    color: black;
  }

  .tweet-subheading {
    font-size: 13px;
    color: #7b7b7b;
  }

  .reset-text {
    font-size: 15px;
    font-weight: bold;
    color: #444;
  }

  .reset-button {
    padding: 10px;
  }

  .logo-button {
    background: none;
    border: none;
    padding: 5px;
    cursor: pointer;
    border: 2px dashed lightgrey;
  }
  .no-border {
    border: 0px;
  }
  .logo-button svg {
    width: 20px;
    height: 20px;
  }

  .logo-button:hover {
    background-color: #efefef;
  }

  .gen-title {
    display: flex;
    flex-direction: column;
    padding-left: 8px;
  }

  .editable {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .editable_preview {
    font-size: 16px;
    font-weight: bold;
  }

  .tweet-editable_preview {
    font-size: 13px;
    color: #7b7b7b;
  }

  .generator-avatar {
    position: relative;
    display: inline-block;
  }

  .generator {
    margin: 20px;
  }

  .flex {
    display: flex;
    align-items: center;
  }

  .active-area:hover {
    background-color: transparent;
  }
</style>
