<script>
	import Download from "../../../Download.svelte";
;
  // add ID for card-front card-back in promp container
	let formData = {
	  company: "Healthcare",
	  services: "Medical Services",
	  website: "www.google.com",
	  name: "Dr Krishna",
	  designation: "MBBS ,MD ",
	  phoneNumber: "1234567890",
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
	  border: 1px solid #1ca46f;
	  background-color: lightblue;
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
	  background-color: lightcoral;
	}

	.prompt {
	  position:fixed;
	  top: 0;
	  left: 0;
	  width: 100%;
	  height: 100%;
	  display:flex;
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
      --font-amiko: Amiko;

      /* font sizes */
      --font-size-2xs-3: 10.3px;
      --font-size-lg-3: 18.3px;
      --font-size-3xs-1: 9.1px;

      /* Colors */
      --color-mediumseagreen: #1ca46f;
      --color-white: #fff;
      --color-darkslateblue: #3b308b;
      --color-gray: rgba(255, 255, 255, 0.1);

      /* Border radiuses */
      --br-11xs: 2px;
    }

    @keyframes flip-horizontal-bottom {
      0% {
        transform: rotateX(0);
      }

      to {
        transform: rotateX(-180deg);
      }
    }

    /* front css */
    .wwwgooglecom {
      position: relative;
    }

    .wwwgooglecom-wrapper {
      position: absolute;
      top: 159.67px;
      left: 0;
      border-radius: var(--br-11xs);
      background-color: var(--color-darkslateblue);
      border: 1px solid var(--color-gray);
      box-sizing: border-box;
      width: 300px;
      height: 25px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-end;
      padding: 4px 0;
    }

    .logo-icon {
      position: relative;
      width: 57.14px;
      height: 63.85px;
      object-fit: cover;
    }

    .healthcare {
      margin: 0;
    }

    .medical-servics {
      margin: 0;
      font-size: 10.29px;
    }

    .company {
      position: relative;
      display: inline-block;
      width: 99.14px;
      height: 10.29px;
      flex-shrink: 0;
    }

    .logo-parent {
      position: absolute;
      top: 25px;
      left: 41.23px;
      width: 99.14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      gap: 8px;
      font-size: 18.29px;
    }

    .icon {
      position: relative;
      width: 22.86px;
      height: 22.86px;
      object-fit: cover;
    }

    .parent {
      opacity: 1;
    }

    .frame-parent,
    .group,
    .parent {
      width: 96.29px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    .frame-parent {
      position: absolute;
      top: 27.67px;
      left: 179.14px;
      flex-direction: column;
      justify-content: center;
      gap: 15.43px;
    }

    .front4 {
      position: relative;
      background-color: var(--color-mediumseagreen);
      box-shadow: 0 4px 4px rgba(0, 0, 0, 0.25);
      width: 300px;
      height: 200px;
      overflow: hidden;
      cursor: pointer;
      text-align: center;
      font-size: 10.29px;
      color: var(--color-white);
      font-family: var(--font-amiko);
    }

    @media screen and (max-width: 1200px) {
      .front4 {
        height: 600px;
        width: 1050px;
      }
    }

    /* back css */
    .icon3,
    .icon7 {
      position: relative;
      width: 17.14px;
      height: 17.14px;
      object-fit: cover;
    }

    .frame-div {
      position: absolute;
      top: 0;
      left: 137.14px;
      border-radius: var(--br-11xs);
      background-color: var(--color-darkslateblue);
      border: 1px solid var(--color-gray);
      box-sizing: border-box;
      width: 22.86px;
      height: 200px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-end;
      padding: 0 2.5869998931884766px 30.66699981689453px;
      gap: 11px;
    }

    .pranjal-padole {
      margin: 0;
    }

    .manager {
      margin: 0;
      font-size: 6.86px;
    }

    .pranjal-padole-manager-container {
      position: relative;
      font-size: 10.29px;
    }

    .div {
      position: relative;
    }

    .pranjal-padole-manager-parent {
      position: absolute;
      top: 0;
      left: 160px;
      border-radius: var(--br-11xs);
      background-color: var(--color-mediumseagreen);
      border: 1px solid var(--color-gray);
      box-sizing: border-box;
      width: 141.14px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: flex-start;
      padding: 40px 8px 34px;
      gap: 14px;
    }

    .icon8 {
      position: relative;
      width: 57.14px;
      height: 60.79px;
      object-fit: cover;
    }

    .medical-servics1 {
      margin: 0;
      font-size: 10.29px;
    }

    .healthcare-medical-servics-container {
      align-self: stretch;
      position: relative;
    }

    .parent1 {
      position: absolute;
      top: 41.14px;
      left: 26.86px;
      width: 99.14px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: flex-start;
      font-size: 18.29px;
      color: var(--color-darkslateblue);
    }

    .back4 {
      position: relative;
      background-color: var(--color-white);
      width: 300px;
      height: 200px;
      overflow: hidden;
      opacity: 0.8;
      cursor: pointer;
      text-align: center;
      font-size: 9.14px;
      color: var(--color-white);
      font-family: var(--font-amiko);
    }

    @media screen and (max-width: 300px) {
      .icon7 {
        height: 200px;
      }

      .back4 {
        width: 300px;
      }

      .icon7 {
        width: 300px;
      }

      .back4 {
        height: 200px;
      }
    }

    @media screen and (max-width: 300px) {
      .icon7 {
        width: 300px;
      }

      .back4 {
        height: 200px;
      }
    }
  </style>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Amiko:wght@400;700&display=swap" />

  
  {#if currentPage === "home"}
  <div class="business-card-container">
	<div class="input-section">
		<h3>Your Business Card:</h3>
		<div class="form-group">
		  <label for="company">Company:</label>
		  <input type="text" id="company" bind:value={formData.company} placeholder="Your company" />
		</div>
		<div class="form-group">
		  <label for="services">Services:</label>
		  <input type="text" id="services" bind:value={formData.services} placeholder="Your tagline" />
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
		<div class="front4" id="frontContainer">
			<div class="wwwgooglecom-wrapper">
			  <div class="wwwgooglecom">{formData.website}</div>
			</div>
			<div class="logo-parent">
			  <img class="logo-icon" alt="" src="./logo@2x.png" />
		
			  <div class="company">
				<p class="healthcare">
				  <b>Healthcare</b>
				</p>
				<p class="medical-servics">{formData.services}</p>
			  </div>
			</div>
			<div class="frame-parent">
			  <div class="parent" data-animate-on-scroll>
				<img class="icon" alt="" src="./10-1@2x.png" />
		
				<div class="wwwgooglecom">Emergency</div>
			  </div>
			  <div class="group">
				<img class="icon" alt="" src="./11-1@2x.png" />
		
				<div class="wwwgooglecom">Vaccination</div>
			  </div>
			  <div class="group">
				<img class="icon" alt="" src="./12-1@2x.png" />
		
				<div class="wwwgooglecom">Blood Test</div>
			  </div>
			</div>
		  </div>
	  </div>
	  <h3>Reverse Side:</h3>
	  <div class="business-card-back">
		<div class="back4" id="backContainer">
			<div class="frame-div">
			  <img class="icon3" alt="" src="./5-1@2x.png" />
		
			  <img class="icon3" alt="" src="./4-1@2x.png" />
		
			  <img class="icon3" alt="" src="./6-1@2x.png" />
		
			  <img class="icon3" alt="" src="./8-1@2x.png" />
		
			  <img class="icon7" alt="" src="./7-1@2x.png" />
			</div>
			<div class="pranjal-padole-manager-parent">
			  <div class="pranjal-padole-manager-container">
				<p class="pranjal-padole">{formData.name}</p>
				<p class="manager">{formData.designation}</p>
			  </div>
			  <div class="div">{formData.phoneNumber}</div>
			  <div class="div">hellow@heathcare.com</div>
			  <div class="div">{formData.website}</div>
			  <div class="div">{formData.address}</div>
			</div>
			<div class="parent1">
			  <img class="icon8" alt="" src="./3-1@2x.png" />
		
			  <div class="healthcare-medical-servics-container">
				<p class="pranjal-padole">
				  <b>Healthcare</b>
				</p>
				<p class="medical-servics1">Medical Servics</p>
			  </div>
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
		<div class="front4" id="frontContainer">
			<div class="wwwgooglecom-wrapper">
			  <div class="wwwgooglecom">{formData.website}</div>
			</div>
			<div class="logo-parent">
			  <img class="logo-icon" alt="" src="./logo@2x.png" />
		
			  <div class="company">
				<p class="healthcare">
				  <b>Healthcare</b>
				</p>
				<p class="medical-servics">{formData.name}</p>
			  </div>
			</div>
			<div class="frame-parent">
			  <div class="parent" data-animate-on-scroll>
				<img class="icon" alt="" src="./10-1@2x.png" />
		
				<div class="wwwgooglecom">Emergency</div>
			  </div>
			  <div class="group">
				<img class="icon" alt="" src="./11-1@2x.png" />
		
				<div class="wwwgooglecom">Vaccination</div>
			  </div>
			  <div class="group">
				<img class="icon" alt="" src="./12-1@2x.png" />
		
				<div class="wwwgooglecom">Blood Test</div>
			  </div>
			</div>
		  </div>
	  </div>
	  <h3>Reverse Side:</h3>
	  <div class="business-card-back" id="card-back">
		<div class="back4" id="backContainer">
			<div class="frame-div">
			  <img class="icon3" alt="" src="./5-1@2x.png" />
		
			  <img class="icon3" alt="" src="./4-1@2x.png" />
		
			  <img class="icon3" alt="" src="./6-1@2x.png" />
		
			  <img class="icon3" alt="" src="./8-1@2x.png" />
		
			  <img class="icon7" alt="" src="./7-1@2x.png" />
			</div>
			<div class="pranjal-padole-manager-parent">
			  <div class="pranjal-padole-manager-container">
				<p class="pranjal-padole">{formData.name}</p>
				<p class="manager">{formData.designation}</p>
			  </div>
			  <div class="div">{formData.phoneNumber}</div>
			  <div class="div">hellow@heathcare.com</div>
			  <div class="div">{formData.website}</div>
			  <div class="div">{formData.address}</div>
			</div>
			<div class="parent1">
			  <img class="icon8" alt="" src="./3-1@2x.png" />
		
			  <div class="healthcare-medical-servics-container">
				<p class="pranjal-padole">
				  <b>Healthcare</b>
				</p>
				<p class="medical-servics1">Medical Servics</p>
			  </div>
			</div>
		  </div>
	  </div>
	  <button on:click={closePrompt}>Close</button>
	  <Download />
	</div>
  </div>
  {/if}
  