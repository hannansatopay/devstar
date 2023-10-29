<script>
	import Download from "../../../Download.svelte";
	let formData = {
	  name: "Company Name",
	  email: "Your@email.in",
	  address: "Address",
	  phoneNumber: "PhoneNumber",
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
	  width: 45%;
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
	  border: 1px solid #333;
	  background-color: gray;
	  font-family: 'Playfair Display';
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  justify-content: center;
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
      --font-size-5xs-4: 7.4px;
      --font-size-6xl-7: 25.7px;


      /* Colors */
      --color-white: #fff;


      /* Gaps */
      --gap-mini: 15px;
    }


    .icon5,
    .icon6 {
      position: absolute;
      top: 0;
      left: 0;
      width: 147px;
      height: 134px;
      object-fit: cover;
    }


    .icon6 {
      top: 8px;
      left: 171px;
      width: 85.74px;
      height: 59.34px;
    }


    .fauget1 {
      margin: 0;
    }


    .fauget-catering1 {
      position: absolute;
      top: 76px;
      left: 129px;
      font-weight: 600;
      display: inline-block;
      width: 170.57px;
      height: 68.57px;
    }


    .front3 {
      position: relative;
      width: 300px;
      height: 200px;
      overflow: hidden;
      background-image: url(./front@3x.png);
      background-size: cover;
      background-position: bottom;
      cursor: pointer;
      text-align: center;
      font-size: 25.74px;
      color: var(--color-white);
      font-family: var(--font-playfair-display);
    }


    @media screen and (max-width: 1200px) {
      .front3 {
        width: 300px;
        height: 200px;
      }
    }


    /* back css */


    .icon {
      position: relative;
      width: 136px;
      height: 135.43px;
      object-fit: cover;
      opacity: 0.9;
      mix-blend-mode: normal;
    }


    .frame,
    .icon1 {
      position: absolute;
    }


    .frame {
      top: 0;
      left: 0;
      width: 148px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      justify-content: center;
    }


    .icon1 {
      top: 10px;
      left: 84px;
      width: 51.43px;
      height: 35.59px;
      object-fit: cover;
    }



    .fauget-catering,
    .frame3 {
      position: absolute;
      top: 0;
      width: 144px;
      height: 68px;
    }


    .fauget-catering {
      left: 0;
      font-weight: 600;
      display: inline-block;
    }


    .frame3 {
      right: 0;
      overflow: hidden;
      font-size: 25.74px;
      font-family: var(--font-playfair-display);
    }


    .icon2 {
      position: relative;
      width: 22.86px;
      height: 22.86px;
      object-fit: cover;
    }


    .nagpurmaharashtraindia {
      flex: 1;
      position: relative;
    }


    .frame4,
    .frame5 {
      overflow: hidden;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: var(--gap-mini);
    }


    .frame4 {
      position: absolute;
      top: 158.71px;
      left: 0;
      width: 144px;
    }


    .frame5 {
      top: 123.86px;
    }


    .frame2,
    .frame5,
    .frame6 {
      position: absolute;
      left: 0;
      width: 144px;
    }


    .frame6 {
      top: 89px;
      overflow: hidden;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: var(--gap-mini);
    }


    .frame2 {
      top: 0;
      height: 199px;
    }


    .back3,
    .frame1,
    .frame2 {
      overflow: hidden;
    }


    .frame1 {
      position: absolute;
      top: 0;
      left: 156px;
      width: 144px;
      height: 181.57px;
    }


    .back3 {
      position: relative;
      width: 100%;
      height: 200px;
      background-image: url(./back@3x.png);
      background-size: cover;
      background-repeat: no-repeat;
      background-position: top;
      cursor: pointer;
      text-align: left;
      font-size: 7.43px;
      color: var(--color-white);
      font-family: var(--font-dm-serif-display);
    }


    @media screen and (max-width: 1200px) {
      .frame4 {
        align-items: center;
        justify-content: flex-start;
      }
    }


    @media screen and (max-width: 960px) {
      .frame4 {
        width: 300px;
      }
	}
  </style>


  
  {#if currentPage === "home"}
  <div class="business-card-container">
	<div class="input-section">
	  <h3>Your Business Card:</h3>
	  <div class="form-group">
		<label for="name">Name:</label>
		<input type="text" id="name" bind:value={formData.name} placeholder="Your Name" />
	  </div>
	  
	  <div class="form-group">
		<label for="address">Address:</label>
		<input type="text" id="address" bind:value={formData.address} placeholder="Your Address" />
	  </div>
	  <div class="form-group">
		<label for="phoneNumber">Phone Number:</label>
		<input type="text" id="phoneNumber" bind:value={formData.phoneNumber} placeholder="Your Phone Number with Country Code" />
	  </div>
	  

	  <div class="button-section">
		<button on:click={submitForm}>Submit</button>
	  </div>
	</div>
	<div class="preview-section">
	
	  <h3>Front Side:</h3>
	  <div class="business-card-front">
		<div class="front3" id="frontContainer">
			<img class="icon5" alt="" src="./a.png" />
		
		
			<img class="icon6" alt="" src="./f.png" />
		
		
			<div class="fauget-catering1">
			  <p class="fauget1">{formData.name}</p>
			</div>
		  </div>
	    </div>
	    <h3>Reverse Side:</h3>
	    <div class="business-card-back">
			<div class="back3" id="backContainer">
				<div class="frame">
				  <img class="icon" alt="" src="./b.png" />
				</div>
				<div class="frame1">
				  <div class="frame2">
					<div class="frame3">
					  <img class="icon1" alt="" src="./g.png" />
			
			
					  <div class="fauget-catering">
						{formData.name}
					  </div>
					</div>
					<div class="frame4">
					  <img class="icon2" alt="" src="./c.png" />
			
			
					  <div class="nagpurmaharashtraindia">{formData.address}</div>
					</div>
					<div class="frame5">
					  <img class="icon2" alt="" src="./d.png" />
			
			
					  <div class="nagpurmaharashtraindia">{formData.email}</div>
					</div>
					<div class="frame6">
					  <img class="icon2" alt="" src="./e.png" />
			
			
					  <div class="nagpurmaharashtraindia">{formData.phoneNumber}</div>
					</div>
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
	  <div class="front3" id="frontContainer">
			<img class="icon5" alt="" src="./a.png" />
		
		
			<img class="icon6" alt="" src="./f.png" />
		
		
			<div class="fauget-catering1">
			  <p class="fauget1">{formData.name}</p>
			</div>
		  </div>
      </div>
	  <h3>Reverse Side:</h3>
	  <div class="business-card-back" id="card-back">
			<div class="back3" id="backContainer">
				<div class="frame">
				  <img class="icon" alt="" src="./b.png" />
				</div>
				<div class="frame1">
				  <div class="frame2">
					<div class="frame3">
					  <img class="icon1" alt="" src="./g.png" />
			
			
					  <div class="fauget-catering">
						{formData.name}
					  </div>
					</div>
					<div class="frame4">
					  <img class="icon2" alt="" src="./c.png" />
			
			
					  <div class="nagpurmaharashtraindia">{formData.address}</div>
					</div>
					<div class="frame5">
					  <img class="icon2" alt="" src="./d.png" />
			
			
					  <div class="nagpurmaharashtraindia">{formData.email}</div>
					</div>
					<div class="frame6">
					  <img class="icon2" alt="" src="./e.png" />
			
			
					  <div class="nagpurmaharashtraindia">{formData.phoneNumber}</div>
					</div>
				  </div>
				</div>
			  </div>
	    </div>
	  <button on:click={closePrompt}>Close</button>
	  <Download />
	</div>
  </div>
  {/if}
  