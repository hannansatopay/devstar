<script>
  import Download from "../../../Download.svelte";

  let formData = {
    name: "Company Name",
    tagline: "Tagline",
    owner: "John Doe",
    position: "Manager",
    address: "Address",
    email: "example@email.com",
    website: "example.com",
    phoneNumber: "+91 9999999999",
  };

  let showPrompt = false;

  let currentPage = "home";

  const changePage = (page) => {
    currentPage = page;
  };

  const submitForm = () => {
    showPrompt = true;
  };

  const closePrompt = () => {
    showPrompt = false;
  };
</script>

{#if currentPage === "home"}
  <div class="business-card-container">
    <div class="input-section">
      <h3>Your Business Card:</h3>
      <div class="form-group">
        <label for="name">Name:</label>
        <input
          type="text"
          id="name"
          bind:value={formData.name}
          placeholder="Your Name"
        />
      </div>
      <div class="form-group">
        <label for="tagline">Tagline:</label>
        <input
          type="text"
          id="tagline"
          bind:value={formData.tagline}
          placeholder="tagline's Name"
        />
      </div>
      <div class="form-group">
        <label for="owner">Your Name:</label>
        <input
          type="text"
          id="owner"
          bind:value={formData.owner}
          placeholder="owner's Name"
        />
      </div>
      <div class="form-group">
        <label for="owner">Position:</label>
        <input
          type="text"
          id="position"
          bind:value={formData.position}
          placeholder="Position"
        />
      </div>
      <div class="form-group">
        <label for="address">Address:</label>
        <input
          type="text"
          id="address"
          bind:value={formData.address}
          placeholder="Your address"
        />
      </div>
      <div class="form-group">
        <label for="email">Email:</label>
        <input
          type="email"
          id="email"
          bind:value={formData.email}
          placeholder="Your Email"
        />
      </div>
      <div class="form-group">
        <label for="phoneNumber">Phone Number:</label>
        <input
          type="text"
          id="phoneNumber"
          bind:value={formData.phoneNumber}
          placeholder="Your Phone Number with Country Code"
        />
      </div>
      <div class="form-group">
        <label for="phoneNumber">Website:</label>
        <input
          type="text"
          id="website"
          bind:value={formData.website}
          placeholder="Your Website URL"
        />
      </div>
      <div class="button-section">
        <button on:click={submitForm}>Apply</button>
      </div>
    </div>

    <div class="preview-section">
      <h3>Front Side:</h3>
      <div class="business-card-front" id="">
        <svg
          width="44"
          height="43"
          viewBox="0 0 44 43"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
        >
          <path
            d="M0 0V10.53H11V0H0ZM16.5 0V10.53H27.5V0H16.5ZM33 0V10.53H44V0H33ZM0 15.795V26.325H11V15.795H0ZM16.5 15.795V26.325H27.5V15.795H16.5ZM33 15.795V26.325H44V15.795H33ZM0 31.59V42.12H11V31.59H0ZM16.5 31.59V42.12H27.5V31.59H16.5ZM33 31.59V42.12H44V31.59H33Z"
            fill="white"
          />
        </svg>

        <div class="business-card-text name">{formData.name}</div>
        <div class="tagline">{formData.tagline}</div>
      </div>

      <h3>Reverse Side:</h3>
      <div class="business-card-back display-flex">
        <div class="frame-child" />
        <div class="arrow-right" />
        <div class="rev-left">
          <div class="">{formData.phoneNumber}</div>
          <div class="">{formData.address}</div>
          <div class="">{formData.email}</div>
          <div class="">{formData.website}</div>
        </div>

        <div class="rev-right">
          <div class="name-rev">{formData.owner}</div>
          <div class="position-rev">{formData.position}</div>
        </div>
      </div>
    </div>
  </div>
{/if}

{#if showPrompt}
  <div class="prompt">
    <div class="prompt-content" id="prompt-content">
      <p>Form Submitted!</p>
      <h3>Front Side:</h3>
      <div class="business-card-front" id="card-front">
        <svg
          width="44"
          height="43"
          viewBox="0 0 44 43"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          stroke="currentColor"
        >
          <path
            d="M0 0V10.53H11V0H0ZM16.5 0V10.53H27.5V0H16.5ZM33 0V10.53H44V0H33ZM0 15.795V26.325H11V15.795H0ZM16.5 15.795V26.325H27.5V15.795H16.5ZM33 15.795V26.325H44V15.795H33ZM0 31.59V42.12H11V31.59H0ZM16.5 31.59V42.12H27.5V31.59H16.5ZM33 31.59V42.12H44V31.59H33Z"
            fill="white"
          />
        </svg>

        <div class="business-card-text name">{formData.name}</div>
        <div class="tagline">{formData.tagline}</div>
      </div>

      <h3>Reverse Side:</h3>
      <div class="business-card-back display-flex" id="card-back">
        <div class="frame-child" />
        <div class="arrow-right" />
        <div class="rev-left">
          <div class="">{formData.phoneNumber}</div>
          <div class="">{formData.address}</div>
          <div class="">{formData.email}</div>
          <div class="">{formData.website}</div>
        </div>

        <div class="rev-right">
          <div class="name-rev">{formData.owner}</div>
          <div class="position-rev">{formData.position}</div>
        </div>
      </div>

      <button on:click={closePrompt}>Close</button>
      <Download />
    </div>
  </div>
{/if}

<style>
  .business-card-container {
    display: flex;
    justify-content: space-between;
  }

  .input-section,
  .preview-section {
    width: 40%;
    padding: 20px;
    background-color: #f0f0f0;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .input-section h3,
  .preview-section h3 {
    font-size: 20px;
    margin-bottom: 10px;
  }

  .form-group {
    margin-bottom: 10px;
  }

  .form-group label {
    display: block;
    margin-bottom: 5px;
  }

  .form-group input {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  .form-group input::placeholder {
    color: #aaa;
  }

  .button-section {
    display: flex;
    justify-content: space-between;
  }

  .button-section button {
    width: 48%;
    padding: 10px;
    background-color: #007bff;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }

  .button-section button:hover {
    background-color: #0056b3;
  }

  .preview-section .business-card-front,
  .prompt-content .business-card-front {
    width: 300px;
    height: 200px;
    border: 2px solid #333;
    background-color: lightblue;
    /* font-family: "Times New Roman", Times, serif; */
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: rgba(9, 45, 57, 0.89);
    color: white;
    overflow: hidden;
    text-align: left;
    font-size: 20px;
    font-family: var(--font-inter);
  }
  .preview-section .business-card-back,
  .prompt-content .business-card-back {
    width: 300px;
    height: 200px;
    border: 2px solid #333;
    background-color: lightblue;
    /* font-family: "Times New Roman", Times, serif; */
    display: flex;
    /* flex-direction: column; */
    align-items: center;
    justify-content: space-between;

    background-color: rgba(231, 240, 244, 0.89);
    overflow: hidden;
    text-align: left;
    font-size: var(--font-size-3xs);
    font-family: var(--font-inter);
    /* color: white; */
  }
  .preview-section .business-card-front:hover,
  .preview-section .business-card-back:hover {
    background-color: lightcoral;
  }

  .prompt {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 102;
  }

  .prompt-content {
    background-color: #fff;
    padding: 20px;
    border-radius: 5px;
    text-align: center;
  }
  .prompt-content .business-card-front:hover,
  .prompt-content .business-card-back:hover {
    background-color: lightcoral;
  }

  /* ---------------------------------------------- */
  /* front css */

  .name {
    font-size: x-large;
    font-weight: bolder;
    font-family: Arial, Helvetica, sans-serif;
    margin-top: 12px;
  }

  .tagline {
    font-size: large;
    font-weight: bolder;
    font-family: Arial, Helvetica, sans-serif;
    margin-top: 4px;
  }

  .display-flex {
    display: flex;
    background-color: burlywood;
  }

  :root {
    /* fonts */
    --font-inter: Inter;
    /* font sizes */
    --font-size-3xs: 10px;

    /* Colors */
    --color-white: #fff;
    --color-darkslategray: rgba(9, 45, 57, 0.89);
  }

  .frame-child {
    /* border: 1px solid blue; */
    /* position: absolute; */
    width: 150px;
    height: 120px;

    background: rgba(9, 45, 57, 0.89);
    /* opacity: 0.2;   */
    color: white;
    z-index: 100;
  }

  .rev-right {
    /* background-color: green; */
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-right: 8px;
  }

  .rev-left {
    display: flex;
    flex-direction: column;
    align-items: left;
    margin: 0;
    margin-left: -210px;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 12px;
    font-weight: bold;
    font-style: italic;
    color: #fff;
    z-index: 101;
    width: 128px;
    border: none;
  }

  .rev-left > div {
    margin-top: 2px;
  }

  .name-rev {
    font-size: x-large;
    font-weight: bolder;
    font-family: Arial, Helvetica, sans-serif;
    color: rgba(9, 45, 57, 0.89);
    /* margin-top: 50%; */
  }

  .position-rev {
    font-size: medium;
    font-weight: bolder;
    font-family: Arial, Helvetica, sans-serif;
    margin: 0;
  }

  .arrow-right {
    width: 0;
    height: 0;
    border-top: 60px solid transparent;
    border-bottom: 60px solid transparent;
    margin-left: -43px;
    /* margin-top: -1px; */

    border-left: 30px solid rgba(9, 45, 57, 0.89);
  }

  /* ----------------------------- */
</style>
