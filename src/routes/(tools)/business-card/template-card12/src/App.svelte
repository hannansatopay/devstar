<script>
	import Download from "../../../Download.svelte";
	let formData = {
	  company: "Company",
	  tagline: "One Stop Solution",
	  website: "Website",
	  name: "James Bond",
	  designation: "Product Manager",
	  phoneNumber: "PhoneNumber",
	  email: "Email@gmail.com",
	  address: "Address",
	  
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
  
  <style>
	.business-card-container {
	  display: flex;
	  justify-content: space-evenly;
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
	.prompt-content .business-card-front,
	.preview-section .business-card-back,
	.prompt-content .business-card-back {
	  width: 300px;
	  height: 200px;
	  font-family: 'Times New Roman', Times, serif;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
	}
  
	.preview-section .business-card-front:hover,
	.preview-section .business-card-back:hover,
	.prompt-content .business-card-front:hover,
	.prompt-content .business-card-back:hover {
	  background-color: #012531;
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
	}
  
	.prompt-content {
	  background-color: #fff;
	  padding: 20px;
	  border-radius: 5px;
	  text-align: center;
	}

	:root {
  /* fonts */
  --font-dm-serif-display: "DM Serif Display";
  --font-playfair-display: "Playfair Display";

  /* font sizes */
  --font-size-xs: 12px;

  /* Colors */
  --color-gray: #012531;
  --color-burlywood-100: #dcb86f;
  --color-burlywood-200: #dcb76d;

  /* Gaps */
  --gap-mini: 15px;

  /* Border radiuses */
  --br-xl: 20px;
}

/* back css */
.back12-child {
  position: absolute;
  top: calc(50% - 74px);
  left: calc(50% - 67px);
  border-right: 1px solid var(--color-burlywood-100);
  box-sizing: border-box;
  width: 1px;
  height: 147px;
}
.logo-icon {
  position: absolute;
  top: calc(50% - 20.5px);
  left: 9px;
  width: 66.67px;
  height: 39.24px;
  object-fit: cover;
}
.james-bond,
.product-manager {
  position: relative;
  display: flex;
  align-items: flex-end;
  width: 157px;
  flex-shrink: 0;
}
.james-bond {
  margin: 0;
  font-size: inherit;
  font-weight: 600;
  font-family: inherit;
  height: 24px;
}
.product-manager {
  font-size: 13px;
  height: 15px;
}
.nameposition {
  position: absolute;
  top: 27px;
  left: 105px;
  width: 181px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 2px;
  font-size: 20px;
  font-family: var(--font-playfair-display);
}
.div,
.icon {
  position: relative;
}
.icon {
  width: 17.14px;
  height: 17.14px;
  object-fit: cover;
}
.div {
  display: flex;
  align-items: center;
  width: 162px;
  height: 9px;
  flex-shrink: 0;
}
.logocontact {
  position: absolute;
  top: 84px;
  left: 105px;
  width: 181px;
  flex-direction: row;
  justify-content: flex-start;
  gap: var(--gap-mini);
}
.logocontact,
.logoemail {
  display: flex;
  align-items: center;
}
.logoemail {
  position: relative;
  width: 108px;
  height: 14px;
  flex-shrink: 0;
}
.logoemail {
  position: absolute;
  top: 108px;
  left: 105px;
  width: 181px;
  flex-direction: row;
  justify-content: flex-start;
  gap: var(--gap-mini);
}
.logolocation {
  flex: 1;
  position: relative;
}
.logolocation {
  position: absolute;
  top: 132px;
  left: 105px;
  width: 181px;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: var(--gap-mini);
}
.logowebsite {
  position: relative;
  display: flex;
  align-items: center;
  width: 162px;
  height: 11px;
  flex-shrink: 0;
}
.logowebsite {
  position: absolute;
  top: 156px;
  left: 105px;
  width: 181px;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: var(--gap-mini);
}
.back12 {
  position: relative;
  border-radius: var(--br-xl);
  background-color: var(--color-gray);
  border: 1px solid var(--color-burlywood-100);
  box-sizing: border-box;
  width: 300px;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  font-size: var(--font-size-xs);
  color: var(--color-burlywood-200);
  font-family: var(--font-dm-serif-display);
}

/* front css */
.company-name,
.tagline {
  position: absolute;
  left: calc(50% - 71px);
  display: inline-block;
  width: 141.71px;
}
.company-name {
  top: 84px;
  font-size: 28.5px;
  font-weight: 600;
  text-align: left;
  height: 31.71px;
}
.tagline {
  top: 118px;
  font-weight: 500;
  height: 12.86px;
}
.logo-icon1 {
  position: absolute;
  top: 43px;
  left: calc(50% - 33px);
  width: 66.67px;
  height: 39.24px;
  object-fit: cover;
}
.website {
  position: absolute;
  bottom: 21.14px;
  left: calc(50% - 71px);
  display: inline-block;
  width: 141.71px;
  height: 12.86px;
}
.front12 {
  position: relative;
  border-radius: var(--br-xl);
  background-color: var(--color-gray);
  box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
  border: 1px solid var(--color-burlywood-100);
  box-sizing: border-box;
  width: 300px;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
  text-align: center;
  font-size: var(--font-size-xs);
  color: var(--color-burlywood-200);
  font-family: var(--font-playfair-display);
}

  </style>
  <!-- Include Google Fonts styles -->
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Playfair Display:wght@400;500;600&display=swap" />
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM Serif Display:wght@400&display=swap" />

  
  {#if currentPage === "home"}
  <div class="business-card-container">
	<div class="input-section">
	  <h3>Your Business Card:</h3>
	  <div class="form-group">
		<label for="company">Company:</label>
		<input type="text" id="company" bind:value={formData.company} placeholder="Your company" />
	  </div>
	  <div class="form-group">
		<label for="tagline">Tagline:</label>
		<input type="text" id="tagline" bind:value={formData.tagline} placeholder="Your tagline" />
	  </div>
	  <div class="form-group">
		<label for="website">Website:</label>
		<input type="text" id="website" bind:value={formData.website} placeholder="Your Website" />
	  </div>
	  <div class="form-group">
		<label for="name">Name:</label>
		<input type="text" id="name" bind:value={formData.name} placeholder="Your Name" />
	  </div>
	  <div class="form-group">
		<label for="designation">Designation:</label>
		<input type="text" id="designation" bind:value={formData.designation} placeholder="Your Designation" />
	  </div>
	  <div class="form-group">
		<label for="phoneNumber">Phone Number:</label>
		<input type="text" id="phoneNumber" bind:value={formData.phoneNumber} placeholder="Your Phone Number with Country Code" />
	  </div>
	  <div class="form-group">
		<label for="email">email:</label>
		<input type="text" id="email" bind:value={formData.email} placeholder="Your email" />
	  </div>
	  <div class="form-group">
		<label for="address">Address:</label>
		<input type="text" id="address" bind:value={formData.address} placeholder="Your Address" />
	  </div>
	  
	  <div class="button-section">
		<button on:click={submitForm}>Apply</button>
	  </div>
	</div>
  
	<div class="preview-section">
	  <h3>Front Side:</h3>
	  <div class="business-card-front">
		<div class="front12" id="front1Container">
			<div class="company-name">{formData.company}</div>
			<div class="tagline">{formData.tagline}</div>
			<img class="logo-icon1" alt="" src="./logo1@2x.png" />
			<div class="website">{formData.website}</div>
		  </div>
	  </div>
	  <h3>Reverse Side:</h3>
	  <div class="business-card-back">
		<div class="back12" id="back1Container">
			<div class="back12-child"></div>
			<img class="logo-icon" alt="" src="./logo@2x.png" />
			<div class="nameposition">
			  <div class="james-bond">{formData.name}</div>
			  <div class="product-manager">{formData.designation}</div>
			</div>
			<div class="logocontact">
			  <img class="icon" alt="" src="./5-1@2x.png" />
			  <div class="div">{formData.phoneNumber}</div>
			</div>
			<div class="logoemail">
			  <img class="icon" alt="" src="./6-1@2x.png" />
			  <div class="div">{formData.email}</div>
			</div>
			<div class="logolocation">
			  <img class="icon" alt="" src="./8-1@2x.png" />
			  <div class="div">{formData.address}</div>
			</div>
			<div class="logowebsite">
			  <img class="icon" alt="" src="./7-1@2x.png" />
			  <div class="div">{formData.website}</div>
			</div>
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
		<div class="front12" id="front1Container">
			<div class="company-name">{formData.company}</div>
			<div class="tagline">{formData.tagline}</div>
			<img class="logo-icon1" alt="" src="./logo1@2x.png" />
			<div class="website">{formData.website}</div>
		  </div>
	  </div>
	  <h3>Reverse Side:</h3>
	  <div class="business-card-back" id="card-back">
		<div class="back12" id="back1Container">
			<div class="back12-child"></div>
			<img class="logo-icon" alt="" src="./logo@2x.png" />
			<div class="nameposition">
			  <div class="james-bond">{formData.name}</div>
			  <div class="product-manager">{formData.designation}</div>
			</div>
			<div class="logocontact">
			  <img class="icon" alt="" src="./5-1@2x.png" />
			  <div class="div">{formData.phoneNumber}</div>
			</div>
			<div class="logoemail">
			  <img class="icon" alt="" src="./6-1@2x.png" />
			  <div class="div">{formData.email}</div>
			</div>
			<div class="logolocation">
			  <img class="icon" alt="" src="./8-1@2x.png" />
			  <div class="div">{formData.address}</div>
			</div>
			<div class="logowebsite">
			  <img class="icon" alt="" src="./7-1@2x.png" />
			  <div class="div">{formData.website}</div>
			</div>
		  </div>
	  </div>
	  <button on:click={closePrompt}>Close</button>
	  <Download />
	</div>
  </div>
  {/if}
  