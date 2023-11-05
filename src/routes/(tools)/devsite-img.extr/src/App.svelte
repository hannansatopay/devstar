<script>
	import { onMount } from "svelte";

	let url = "";
	let imgUrls = [];
	let allImgUrls = []; 
	let loading = false;
	let error = null;

	async function scrape() {
		loading = true;
		error = null;

		try {
			const response = await fetch("http://localhost:5000/api/scrape", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ url }),
			});

			const data = await response.json();
			if (data.success) {
				imgUrls = data.imgUrls;
				allImgUrls = data.imgUrls; 
			} else {
				error = data.error;
			}
		} catch (error) {
			console.error("Error:", error);
			error = "An error occurred during the scraping process.";
		} finally {
			loading = false;
		}
	}

	function filterImages(imageType) {
		if (imageType === "all") {
			imgUrls = allImgUrls;
		} else {
			imgUrls = allImgUrls.filter((imgUrl) =>
				imgUrl.toLowerCase().endsWith(`.${imageType}`)
			);
		}
		applyFilters();
	}

	function countImages(imageType) {
		return imgUrls.filter((imgUrl) =>
			imgUrl.toLowerCase().endsWith(`.${imageType}`)
		).length;
	}

	function showResults() {
		var urlInput = document.getElementById("url").value;
		if (urlInput) {
			var resultsContainer = document.getElementById("resultsContainer");
			resultsContainer.style.display = "block";
		}
	}


	function applyFilters() {
		const imageType = document.getElementById("imageType").value;
		const sortOption = document.getElementById("sortOptions").value;
		const imagesContainer = document.querySelector(".horizontal");

		let filteredImages = allImgUrls;
		if (imageType !== "all") {
			filteredImages = allImgUrls.filter((imgUrl) =>
				imgUrl.toLowerCase().endsWith(`.${imageType}`)
			);
		}
		// Sorting options
		switch (sortOption) {
			case "sizeAsc":
				sortImagesBySize(images, true);
				break;
			case "sizeDesc":
				sortImagesBySize(images, false);
				break;
			case "fileSizeAsc":
				sortImagesByFileSize(images, true);
				break;
			case "fileSizeDesc":
				sortImagesByFileSize(images, false);
				break;
			case "widthAsc":
				sortImagesByDimension(images, "width", true);
				break;
			case "widthDesc":
				sortImagesByDimension(images, "width", false);
				break;
			case "heightAsc":
				sortImagesByDimension(images, "height", true);
				break;
			case "heightDesc":
				sortImagesByDimension(images, "height", false);
				break;
			case "nameAsc":
				sortImagesByName(images, true);
				break;
			case "nameDesc":
				sortImagesByName(images, false);
				break;
			default:
				break;
		}
		imagesContainer.innerHTML = "";
		// Hide the download button for non-visible images
		filteredImages.forEach((imgUrl) => {
			const imageItem = document.createElement("div");
			imageItem.className = "image-frame-vertical";
			imageItem.dataset.selected = "false";
			imageItem.innerHTML = ``;
			imagesContainer.appendChild(imageItem);
		});

		// Add click event listener to toggle selection
		imagesContainer
			.querySelectorAll(".image-frame-vertical img")
			.forEach((image) => {
				image.addEventListener("click", () => {
					toggleSelection(image);
				});
			});
	}

	function sortImagesBySize(images, ascending) {
		images.forEach((image) =>
			image.setAttribute("data-size", image.src.length)
		);
		imagesContainer = document.querySelector(
			".horizontal .image-frame-vertical .frame-2"
		);
		[...images]
			.sort((a, b) =>
				ascending
					? a.getAttribute("data-size") - b.getAttribute("data-size")
					: b.getAttribute("data-size") - a.getAttribute("data-size")
			)
			.forEach((image) => imagesContainer.appendChild(image));
	}

	function sortImagesByFileSize(images, ascending) {
		images.forEach((image) =>
			image.setAttribute("data-size", image.src.length)
		);
		imagesContainer = document.querySelector(
			".horizontal .image-frame-vertical .frame-2"
		);
		[...images]
			.sort((a, b) =>
				ascending
					? a.getAttribute("data-size") - b.getAttribute("data-size")
					: b.getAttribute("data-size") - a.getAttribute("data-size")
			)
			.forEach((image) => imagesContainer.appendChild(image));
	}

	function sortImagesByDimension(images, dimension, ascending) {
		images.forEach((image) =>
			image.setAttribute(`data-${dimension}`, image.naturalWidth)
		);
		imagesContainer = document.querySelector(
			".horizontal .image-frame-vertical .frame-2"
		);
		[...images]
			.sort((a, b) =>
				ascending
					? a.getAttribute(`data-${dimension}`) -
					  b.getAttribute(`data-${dimension}`)
					: b.getAttribute(`data-${dimension}`) -
					  a.getAttribute(`data-${dimension}`)
			)
			.forEach((image) => imagesContainer.appendChild(image));
	}

	function sortImagesByName(images, ascending) {
		images.forEach((image) =>
			image.setAttribute("data-name", image.alt.toLowerCase())
		);
		imagesContainer = document.querySelector(
			".horizontal .image-frame-vertical .frame-2"
		);
		[...images]
			.sort((a, b) =>
				ascending
					? a
							.getAttribute("data-name")
							.localeCompare(b.getAttribute("data-name"))
					: b
							.getAttribute("data-name")
							.localeCompare(a.getAttribute("data-name"))
			)
			.forEach((image) => imagesContainer.appendChild(image));
	}

	function downloadImage(imageSrc, fileName) {
		fetch(imageSrc)
			.then((response) => response.blob())
			.then((blob) => {
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = fileName;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);
			})
			.catch((error) => {
				console.error("Error downloading image:", error);
			});
	}
	

	
	function selectAll() {
		const images = document.querySelectorAll(
			".horizontal .image-frame-vertical .frame-2 img"
		);
		images.forEach((image) => {
			image.setAttribute("data-selected", "true");
			image.style.border = "2px solid blue";
		});
	}

	function deselectAll() {
		const images = document.querySelectorAll(
			".horizontal .image-frame-vertical .frame-2 img"
		);
		images.forEach((image) => {
			image.setAttribute("data-selected", "false");
			image.style.border = "1px solid #ccc";
		});
	}
	
	function downloadSelectedImages() {
    const selectedImages = document.querySelectorAll(".horizontal .image-frame-vertical .frame-2 img[data-selected='true']");

    selectedImages.forEach((image) => {
        const imageSrc = image.src;
        const fileName = "image_" + Date.now(); 
        downloadImage(imageSrc, fileName);
    });
}

function downloadAll() {
    downloadSelectedImages();
}
	function copyImageUrl() {
		var image = document.getElementById("imageToCopy");

		// Ensure an image is selected
		if (image && image.src) {
			var imageUrl = image.src;
			copyToClipboard(imageUrl);
			alert("Image URL copied to clipboard: " + imageUrl);
		}
	}
	
	function copyToClipboard(text) {
		var textarea = document.createElement("textarea");
		textarea.value = text;
		document.body.appendChild(textarea);
		textarea.select();
		document.execCommand("copy");
		document.body.removeChild(textarea);
	}
	// Initialize the component by scraping on mount
	onMount(() => {
		scrape();
	});
</script>
<link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.5.0/css/all.css" integrity="sha384-B4dIYHKNBt8Bc12p+WXckhzcICo0wtJAoU8YZTY5qE0Id1GSseTk6S+L3BlXeVIU" crossorigin="anonymous">
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css">

	 
<nav class="navbar navbar-expand-md navbar-light bg-light">
	<img style="height:100px;width:100px" class="image" src="img/image.png" alt="1" />
	
	<span style="color:black;margin-left:30px;"class="home-text"><span>Extract Image</span></span>
	<br /><br>
	
	<span class="home-text02" style="color:black;margin-top:80px;margin-left:10px;"
		><span>from any public website!</span></span
	>
  <div id="navb" class="navbar-collapse collapse hide">
    <ul class="navbar-nav"style="font-size:20px;">
      <li class="nav-item active">
        <a class="nav-link" href="/">Home</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#aboutus">About us</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#faq">Help Center</a>
      </li>
    </ul>

    <ul class="nav navbar-nav ml-auto">
      <li class="nav-item">
        <a class="nav-link" href="#"><span class="fas fa-user"></span> Sign Up</a>
      </li>
      <li class="nav-item">
        <a class="nav-link" href="#"><span class="fas fa-sign-in-alt"></span> Login</a>
      </li>
    </ul>
  </div>
</nav>



		

	<div class="header">
	
		<div class="home-container">
			
			<div class="home-searchbar">
				<div class="home-urlbar" style="margin-left: 300px; margin-top:200px;">
					<input style="color:white;font-size:20px;"
						class="home-text05"
						placeholder="Enter any URL"
						type="text"
						id="url"
						bind:value={url}
					/>
					<button
				on:click={scrape}
				disabled={loading}
				on:click={showResults}
				class="home-button"
				style="margin-left: 380px;"
			>
				{loading ? "Scraping..." : "Scrape Images"}
			</button>
				</div>
			</div>
			
		</div>

	</div>
<!-- </div> -->

<div class="res-load">
	<div class="div">
		
		
		<div class="main-res-frame">
			<div
				class="main-res-frame-2"
				id="resultsContainer"
				style="display: none;"
			>
				<div class="side-bar-sort">
					<!-- <div class="sort">
						<div class="sort-head">
							<div class="text-wrapper">
								<label for="sortOptions">Sort By:</label>
							</div> -->
							<!-- <div class="sort-size">
								<div class="big-small">
									<div class="big-small-2">Big -> Small</div>
								</div>
							</div> -->
						<!-- </div>
						<div class="sort-menu">
							<select id="sortOptions" on:change={applyFilters}>
								<option value="default">Default</option>
								<option value="sizeAsc"
									>Image Size (Smallest to Largest)</option
								>
								<option value="sizeDesc"
									>Image Size (Largest to Smallest)</option
								>
								<option value="fileSizeAsc"
									>File Size (Smallest to Largest)</option
								>
								<option value="fileSizeDesc"
									>File Size (Largest to Smallest)</option
								>
								<option value="widthAsc"
									>Image Width (Smallest to Largest)</option
								>
								<option value="widthDesc"
									>Image Width (Largest to Smallest)</option
								>
								<option value="heightAsc"
									>Image Height (Smallest to Largest)</option
								>
								<option value="heightDesc"
									>Image Height (Largest to Smallest)</option
								>
								<option value="nameAsc"
									>Image Name (A to Z)</option
								>
								<option value="nameDesc"
									>Image Name (Z to A)</option
								>
							</select>
						</div> -->
					<!-- </div> -->
					<!-- <div class="filter">
						<div class="text-wrapper-3">Filter images by type</div>
						<div class="filter-menu">
							<select id="imageType" on:change={filterImages}>
								<option value="all">All Images</option>
								<option value="ico"
									>ICO ({countImages("ico")})</option
								>
								<option value="png"
									>PNG ({countImages("png")})</option
								>
								<option value="jpg"
									>JPG ({countImages("jpg")})</option
								>
							</select>
						</div>
					</div> -->
					<div class="download-buttons">
						<div class="select-deselect">
							<div class="white-button">
								<img
									class="img"
									src="img/check-circle.jpg"
									alt="a"
								/>
								<div class="text-wrapper-11">
									<button on:click={selectAll}
										>Select All</button
									>
								</div>
							</div>
							<div class="white-button">
								<img
									class="img"
									src="img/radio-button-unchecked.jpg"
									alt="h"
								/>
								<div class="text-wrapper-11">
									<button on:click={deselectAll}
										>Deselect All</button
									>
								</div>
							</div>
							<div class="white-button">
							
							<div class="text-wrapper-11">
								<button style="color:green;" on:click={downloadAll}>Download Selected</button>
							</div>
							
							</div>
						</div>
						
					</div>
				</div>
				<br>
				<div class="res-frame">
					<div class="result-header">
						<p class="showing-images-from">
							<span class="span">Showing images from </span>
							<span class="text-wrapper-13">{url}</span>
						</p>
					</div>
					<div class="horizontal">
						{#if imgUrls.length > 0}
							{#each imgUrls as imgUrl}
								<div
									class="image-frame-vertical"
									data-selected="false"
								>
									<div class="frame-2">
										<img
											class="rectangle"
											src={imgUrl}
											alt="image1"
											id="imageToCopy"
										/>
										<div class="text-wrapper-14">
											Image_name
										</div>
									</div>
									<div class="frame-3">
										<div class="file-size">
											<div class="text-wrapper-15">
												980 KB
											</div>
										</div>
										<div class="image-type">
											<div class="text-wrapper-4">
												ICO
											</div>
										</div>
										<div class="frame-4">
											<button on:click={copyImageUrl}
												>Copy Image URL</button
											>
											<button
												on:click={() =>
													downloadImage(
														imgUrl,
														"image.jpg"
													)}>Download</button
											>
										</div>
									</div>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
<br>
<br>
<br>
<section class="services">
	<h1>Why Choose Us?</h1>
	<br>
	 <div class="row">
	  <div class="services-col">
		<img src="img/1_serv.png" alt="Service Image 1">
		<h3>Efficiency</h3>
	
		<h5>Save time and effort with our automated image extraction process.</h5>
	  </div>
	  <div class="services-col">
		<img src="img/2_serv.png" alt="Service Image 2">
		<h3>User-Friendly</h3>

		<h5>Our intuitive interface makes the process accessible to all.</h5>
	  </div>
	  <div class="services-col">
		<img src="img/3_serv.png" alt="Service Image 3">
		<h3>Volunteer</h3>
		<h5>Tailor your image extraction settings to suit your needs.</h5>
	  </div>
	 </div>
  </section>
  
  <hr />
  
  <section class="FAQ" id="faq">
	<h2>Frequently Asked Questions:</h2>
	<br>


	<div>
	<h3>Can I download multiple images at once?</h3>
	<p>
	  Of course, you can select them by clicking the images and then use the "Download selected" button on the left to download all selected images in a ZIP file. This can take some time depending on how many images you selected. Note that there is a chance that some images cannot be downloaded and won't be included in the ZIP file.
	</p>
	</div>


	<div>
	<h3>Why might the extraction process not work?</h3>
	<p>
	  There are several reasons why the extraction might fail. The website you entered might not be publicly accessible or it might be protected by a login. Very slow or large websites might also cause issues. Additionally, if there are a lot of people using our website at the same time, it can cause performance issues on our side. In this case, you should try again later or try a different website. We are continuously working on improving the performance of our service.
	</p>
	</div>


  </section>
  
  <section class="aboutus" >
	<hr>
	<h3>About Us</h3>
	<h4>VisualHarbor: Your Gateway to Seamless Image Extraction !</h4>
  </section>
  <p>
	Welcome to VisualHarbor, where the art of visual storytelling meets efficiency. Our passion drives our mission – to transform the landscape of image gathering on the web for individuals, designers, content creators, and researchers alike.
	Behind VisualHarbor is a dedicated team of professionals committed to simplifying the process of image extraction. We recognize the potency of visuals in communication, creativity, and knowledge sharing. Therefore, our goal is clear: to empower you with tools that effortlessly streamline the collection and utilization of images.
	Our platform offers a user-friendly experience, allowing you to extract images seamlessly from web pages, URLs, and online documents. It's a one-stop solution for all your visual content needs, designed to enhance your efficiency and elevate your projects, research, or creative endeavors.
	At VisualHarbor, we understand the value of your time and energy. Our commitment is to help you save both, enabling you to focus on what truly matters – whether it's crafting exceptional projects, conducting groundbreaking research, or unleashing your creative genius.
	Embark on this visual journey with us, and together, let's paint the digital world with vibrant expressions, one extracted image at a time. VisualHarbor – where visuals meet simplicity and creativity knows no bounds.
  </p>
  <br>
  <section class="footer"id="aboutus">
	<h3>Contact Us</h3><p>

	<h4><a href="mailto:dvstrimgextractor@gmail.com">dvstrimgextractor@gmail.com</a> 
		<a href="tel:+9112345678910">+91 12345678910</a></h4>
	<p>Designed By: dvstr-image-extractor</p>
<p>Some images used under license from Shutterstock, Google. &copy; 2023 Pawsome. All rights reserved.</p>
  </section>

<style>
	.header {
		display: flex;
		width: 1300px;
		align-items: flex-start;
		gap: 300px;
		padding: 10px 20px;
		position: relative;
		background-color: #f5f0f3;
	}

	.header .image-extractor {
		display: flex;
		align-items: center;
		gap: 5px;
		position: relative;
		flex: 1;
		flex-grow: 1;
	}

	.header .text-wrapper {
		position: relative;
		width: fit-content;
		margin-top: -1px;
		font-family: "Jost-Medium", sans-serif;
		font-weight: 500;
		color: #282445;
		font-size: 30px;
		letter-spacing: 0;
		line-height: normal;
	}

	.header .nav-bar {
		margin-top:30px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2px;
		position: relative;
		flex: 1;
		flex-grow: 1;
	}
	/*-------------Services----------------*/
.services {
  text-align: center;
  background-color: #f9f9f9;
  padding: 20px;
}

.services h1 {
  font-size: 28px;
  margin-bottom: 20px;
}

.row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.home-text05
{background-color: #ffffff00;
	border: 0;
	

}

input {border:0;outline:0;}
input:focus {outline:none!important;}

.services-col {
  flex-basis: 300px; /* Adjust this value to control the width of each card */
  margin: 10px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.services-col img {
  width: 200px;
  height: 200px;
  border-radius: 50%; /* Make the image circular */
  object-fit: cover; /* Ensure the image retains its aspect ratio */
}

.services-col h3 {
  font-size: 24px;
  margin-top: 10px;
}

.services-col h5 {
  font-size: 16px;
  color: #211f1f;
}

.services-col a {
  text-decoration: none;
  color: #333;
  font-weight: bold;
  display: block;
}

.services-col a:hover {
  color: #ff6b6b;
}


/*--------footer------------*/
.aboutus{
  width: 100%;
  text-align: center;


}
.aboutus h4{
  margin-top: 10px;
  font-weight: 600;

}
.footer{
  background-color: #3cd9b7;
  width: 100%;
  text-align: center;
  padding: 10px 0;

 
}
.footer h3{
  color: #000000;
}
/* .footer img{
  padding: 15px 15px ;
  height: 40px;
  width: 40px;
}
.footer h5{
  color: #000000;
}
.footer h6{
  color: #000000;
}
.footer credit p{
  color: #000000;
}
.footer copyright p{
  color: #000000;
}
.socialLinks :hover{
zoom: 150%;
}
.credit{
  color:#000000;
}
.copyright{
  color:#000000;
}
.mail{
  color:#000000;
} */


	.header .login {
		margin-top:30px;
		justify-content: flex-end;
		gap: 12px;
		flex: 1;
		flex-grow: 1;
		display: flex;
		height: 40px;
		align-items: center;
		position: relative;
	}

	.header .button-wrapper-2 {
		width: 100px;
		justify-content: center;
		gap: 10px;
		padding: 10px;
		background-color: #6b73c1;
		border-radius: 25px;
		display: flex;
		height: 40px;
		align-items: center;
		position: relative;
		all: unset;
		box-sizing: border-box;
	}

	.header .button-2 {
		position: relative;
		width: fit-content;
		/* margin-top: -5.5px;
		margin-bottom: -5.5px; */
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #f5f0f3;
		font-size: 20px;
		letter-spacing: 0;
		line-height: normal;
		all: unset;
		box-sizing: border-box;
	}

	.home-frame14 {
		gap: 100px;
		top: 100px;
		width: 1350px;
		display: flex;
		position: relative;
		align-items: center;
		flex-direction: column;
	}

	.home-text {
	
		height: auto;
		font-size: 40px;
		font-style: Medium;
		text-align: left;
		font-family: Arial, Helvetica, sans-serif;
		font-weight: 400;
		line-height: normal;
		font-stretch: normal;
		text-decoration: none;
	}

	.home-text02 {
		color: rgb(0, 0, 0);
		height: auto;
		font-size: 20px;
		font-style: Bold;
		text-align: left;
		font-family: Cambria, Cochin, Georgia, Times, "Times New Roman", serif;
		font-weight: 700;
		line-height: normal;
		font-stretch: normal;
		text-decoration: none;
		
	}

	.home-searchbar {
		gap: 500px;
		display: flex;
		align-items: center;
		flex-direction: column;
	}

	

	.home-urlbar {
		gap: 10px;
		width: 600px;
		display: flex;
		padding: 10px;
		align-items: center;
		flex-shrink: 0;
		border-color: rgb(255, 255, 255);
		border-style: solid;
		border-width: 1px;
		border-radius: 10px;
	}

	.home-text04 {
		height: auto;
		font-size: 20px;
		font-style: Bold;
		font-weight: 700;
		line-height: normal;
	}

	.home-button {
		gap: 10px;
		width: 106px;
		display: flex;
		padding: 10px;
		align-items: center;
		flex-shrink: 0;
		border-radius: 25px;
		justify-content: center;
		background-color: rgb(255, 255, 255);
	}

	.home-text06 {
		color: rgba(188, 171, 171, 1);
		height: auto;
		font-size: 20px;
		font-style: Medium;
		text-align: left;
		font-family: Jost;
		font-weight: 500;
		line-height: normal;
		font-stretch: normal;
		text-decoration: none;
	}

	.res-load {
		display: flex;
		flex-direction: row;
		justify-content: center;
		position: relative;
		
		/* background-size: cover; */
	}
	.header {
   background-image: url(img/background.jpg);
    min-height: 120vh;
    width: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    background-position: center;
    background-size: cover;
    position: relative;
    
  }
	.res-load .div {
		background-color: transparent;
		background-size: cover;
		position: relative;
	}

	.res-load .main-res-frame {
		display: flex;
		flex-direction: column;
		width: 1300px;
		align-items: flex-start;
		gap: 100px;
		position: relative;
		top: 152px;
		left: 0;
	}

	.res-load .main-res-frame-2 {
		display: flex;
		width: 1250px;
		align-items: center;
		gap: 100px;
		padding: 0px 50px;
		position: relative;
		flex: 0 0 auto;
	}

	.res-load .side-bar-sort {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 31px;
		padding: 0px 10px;
		position: relative;
	}

	.res-load .sort {
		display: flex;
		flex-direction: column;
		width: 500px;
		align-items: center;
		gap: 9px;
		position: relative;
		flex: 0 0 auto;
	}

	.res-load .sort-head {
		display: flex;
		align-items: center;
		gap: 71px;
		position: relative;
		align-self: stretch;
		width: 100%;
		flex: 0 0 auto;
	}

	.res-load .text-wrapper {
		position: relative;
		flex: 1;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #ffffff;
		font-size: 18px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .sort-size {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		gap: 10px;
		padding: 10px;
		position: relative;
		flex: 1;
		flex-grow: 1;
	}

	.res-load .big-small {
		position: relative;
		width: 95px;
		height: 26px;
	}

	.res-load .big-small-2 {
		position: absolute;
		top: -1px;
		left: 0;
		font-family: "Jost-Regular", Helvetica;
		font-weight: 400;
		color: #9c9a9b;
		font-size: 18px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .sort-menu {
		display: flex;
		width: 486px;
		align-items: center;
		gap: 10px;
		padding: 15px 10px;
		position: relative;
		flex: 0 0 auto;
		background-color: #ffffff;
		border-radius: 10px;
		border: 1px solid;
		border-color: #3f392e;
	}

	.res-load .text-wrapper-2 {
		position: relative;
		width: fit-content;
		margin-top: -1px;
		font-family: "Jost-Regular", Helvetica;
		font-weight: 400;
		color: #1c1b1f;
		font-size: 18px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .frame {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		justify-content: center;
		gap: 8px;
		padding: 5px 8px;
		position: relative;
		flex: 1;
		flex-grow: 1;
	}

	.res-load .filter {
		flex-direction: column;
		width: 500px;
		gap: 20px;
		display: flex;
		align-items: flex-start;
		position: relative;
		flex: 0 0 auto;
	}

	.res-load .text-wrapper-3 {
		position: relative;
		width: 181px;
		margin-top: -1px;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #ffffff;
		font-size: 18px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .filter-menu {
		width: 489px;
		gap: 10px;
		padding: 15px 25px 15px 10px;
		background-color: #f5f0f3;
		border-radius: 10px;
		border: 1px solid;
		border-color: #3f392e;
		display: flex;
		align-items: flex-start;
		position: relative;
		flex: 0 0 auto;
	}

	.res-load .image-type-filter {
		display: flex;
		height: 30px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 10px;
		position: relative;
		flex: 1;
		flex-grow: 1;
		background-color: #f7e332;
		border-radius: 10px;
	}

	.res-load .text-wrapper-4 {
		position: relative;
		width: fit-content;
		margin-top: -7px;
		margin-bottom: -5px;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #3f392e;
		font-size: 15px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .div-wrapper {
		background-color: #96ff8d;
		display: flex;
		height: 30px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 10px;
		position: relative;
		flex: 1;
		flex-grow: 1;
		border-radius: 10px;
	}

	.res-load .text-wrapper-5 {
		position: relative;
		width: fit-content;
		margin-top: -7px;
		margin-bottom: -5px;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #31732b;
		font-size: 15px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .image-type-filter-2 {
		background-color: #ffd6b0;
		display: flex;
		height: 30px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 10px;
		position: relative;
		flex: 1;
		flex-grow: 1;
		border-radius: 10px;
	}

	.res-load .text-wrapper-6 {
		position: relative;
		width: fit-content;
		margin-top: -7px;
		margin-bottom: -5px;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #9a0c0c;
		font-size: 15px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .image-type-filter-3 {
		background-color: #6debf3;
		display: flex;
		height: 30px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 10px;
		position: relative;
		flex: 1;
		flex-grow: 1;
		border-radius: 10px;
	}

	.res-load .text-wrapper-7 {
		position: relative;
		width: fit-content;
		margin-top: -7px;
		margin-bottom: -5px;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #007880;
		font-size: 15px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .image-type-filter-4 {
		background-color: #c784cd;
		display: flex;
		height: 30px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 10px;
		position: relative;
		flex: 1;
		flex-grow: 1;
		border-radius: 10px;
	}

	.res-load .text-wrapper-8 {
		position: relative;
		width: fit-content;
		margin-top: -7px;
		margin-bottom: -5px;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #731a7b;
		font-size: 15px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .search {
		display: inline-flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 15px;
		position: relative;
		flex: 0 0 auto;
	}

	.res-load .text-wrapper-9 {
		position: relative;
		width: fit-content;
		margin-top: -1px;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #ffffff;
		font-size: 18px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .url-bar {
		display: flex;
		width: 500px;
		align-items: center;
		gap: 10px;
		padding: 10px;
		position: relative;
		flex: 0 0 auto;
		border-radius: 10px;
		border: 1px solid;
		border-color: #f5f0f3;
	}

	.res-load .enter-any-URL {
		position: relative;
		width: fit-content;
		margin-top: -1px;
		font-family: "Jost-Bold", Helvetica;
		font-weight: 700;
		color: #ffffff;
		font-size: 20px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .text-wrapper-10 {
		position: relative;
		width: fit-content;
		font-family: "Jost-Bold", Helvetica;
		font-weight: 700;
		color: #ffffff;
		font-size: 20px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .download-buttons {
		display: flex;
		flex-direction: column;
		width: 500px;
		align-items: center;
		justify-content: center;
		gap: 20px;
		position: relative;
		flex: 0 0 auto;
	}

	.res-load .select-deselect {
		display: flex;
		height: 37px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		position: relative;
		align-self: stretch;
		width: 100%;
	}

	.res-load .white-button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 5px 10px;
		position: relative;
		flex: 0 0 auto;
		margin-top: -1px;
		margin-bottom: -1px;
		background-color: #f5f0f3;
		border-radius: 10px;
		box-shadow: 0px 4px 4px #00000040;
	}

	.res-load .img {
		position: relative;
		width: 18px;
		height: 18px;
	}

	.res-load .text-wrapper-11 {
		position: relative;
		width: fit-content;
		margin-top: -1px;
		font-family: "Jost-Bold", Helvetica;
		font-weight: 700;
		/* color: #282445; */
		font-size: 20px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .white-button-2 {
		padding: 5px 15px;
		background-color: #ff029a;
		border-radius: 5px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		position: relative;
		flex: 0 0 auto;
		box-shadow: 0px 0px 0px #00000040;
	}

	.res-load .copy-selected-urls {
		position: relative;
		width: fit-content;
		margin-top: -1px;
		font-family: "Jost-Bold", Helvetica;
		font-weight: 700;
		color: #282445;
		font-size: 22px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .white-button-3 {
		/* padding: 10px 15px; */
		background-color: #00ff2af8;
		border-radius: 10px;
		display: inline-flex;
		justify-content: center;
		/* gap: 10px; */
		position: relative;
		flex: 0 0 auto;
		box-shadow: 0px 0px 0px #00000040;
	}

	.res-load .text-wrapper-12 {
		position: relative;
		width: fit-content;
		margin-top: -1px;
		font-family: "Jost-Bold", Helvetica;
		font-weight: 700;
		color: #f5f0f3;
		font-size: 22px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .res-frame {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 20px;
		position: relative;
		flex: 1;
		align-self: stretch;
		flex-grow: 1;
	}

	.res-load .result-header {
		display: flex;
		width: 452px;
		align-items: center;
		gap: 10px;
		padding: 10px;
		position: relative;
		flex: 0 0 auto;
	}

	.res-load .showing-images-from {
		position: relative;
		flex: 1;
		margin-top: -1px;
		font-family: "Jost-Regular", Helvetica;
		font-weight: 400;
		color: #000000;
		font-size: 18px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .span {
		font-family: "Jost-Regular", Helvetica;
		font-weight: 400;
		color: #000000;
		font-size: 18px;
		letter-spacing: 0;
	}

	.res-load .text-wrapper-13 {
		font-family: "Jost-SemiBold", Helvetica;
		font-weight: 600;
		font-size: 20px;
	}

	.res-load .image-frame-vertical {
		display: flex;
		align-items: flex-end;
		gap: 230px;
		padding: 10px 20px;
		position: relative;
		align-self: stretch;
		width: 100%;
		flex: 0 0 auto;
		background-color: #f5f0f3;
		border-radius: 5px;
		box-shadow: 0px 4px 4px #00000040;
	}

	.res-load .frame-2 {
		display: flex;
		align-items: center;
		gap: 23px;
		position: relative;
		flex: 1;
		flex-grow: 1;
	}

	.res-load .rectangle {
		position: relative;
		width: 100px;
		height: 100px;
	}

	.res-load .text-wrapper-14 {
		position: relative;
		width: fit-content;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #282445;
		font-size: 18px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .frame-3 {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 15px;
		position: relative;
		flex: 1;
		flex-grow: 1;
	}

	.res-load .file-size {
		display: inline-flex;
		height: 30px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 8px 15px;
		position: relative;
		flex: 0 0 auto;
		border-radius: 10px;
		border: 1px solid;
		border-color: #282445;
	}

	.res-load .text-wrapper-15 {
		position: relative;
		width: fit-content;
		margin-top: -5px;
		margin-bottom: -3px;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #282445;
		font-size: 15px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .image-type {
		display: inline-flex;
		height: 30px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 10px;
		position: relative;
		flex: 0 0 auto;
		background-color: #f7e332;
		border-radius: 10px;
	}

	.res-load .frame-4 {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		position: relative;
		flex: 0 0 auto;
	}

	.res-load .img-2 {
		position: relative;
		width: 24px;
		height: 24px;
	}

	.res-load .faq {
		display: flex;
		gap: 50px;
		left: 20px;
		flex-direction: column;
		align-items: flex-start;
		width: 1300px;
		position: relative;
	}

	.res-load .faq-header {
		display: inline-flex;
		flex: 0 0 auto;
		flex-direction: column;
		align-items: flex-start;
		position: relative;
	}

	.res-load .text-wrapper-16 {
		position: relative;
		align-self: stretch;
		margin-top: -1px;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #ffffff;
		font-size: 40px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .if-you-can-t-find {
		position: relative;
		align-self: stretch;
		font-family: "Jost-Regular", Helvetica;
		font-weight: 400;
		color: #ffffff;
		font-size: 30px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .text-wrapper-17 {
		font-family: "Jost-Regular", Helvetica;
		font-weight: 400;
		color: #ffffff;
		font-size: 30px;
		letter-spacing: 0;
	}

	.res-load .faq-frame {
		display: flex;
		width: 500px;
		gap: 8px;
		padding: 15px;
		flex-direction: column;
		align-items: flex-start;
		position: relative;
	}

	.res-load .text-wrapper-18 {
		position: relative;
		width: fit-content;
		margin-top: -1px;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #ffffff;
		font-size: 25px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .lorem-ipsum-dolor {
		position: relative;
		width: 745px;
		height: 203px;
		margin-right: -10px;
	}

	.res-load .p {
		position: absolute;
		width: 745px;
		top: -1px;
		left: 0;
		font-family: "Jost-Regular", Helvetica;
		font-weight: 400;
		color: #ffffff;
		font-size: 20px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .footer {
		display: flex;
		width: 1300px;
		align-items: flex-start;
		gap: 127px;
		position: relative;
		flex: 0 0 auto;
		margin-bottom: -129px;
		background-color: transparent;
	}

	.res-load .frame-7 {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 10px;
		position: relative;
		flex: 1;
		flex-grow: 1;
	}

	.res-load .text-wrapper-19 {
		position: relative;
		width: fit-content;
		margin-top: -1px;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #f5f0f3;
		font-size: 20px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .frame-8 {
		display: flex;
		align-items: flex-end;
		justify-content: flex-end;
		gap: 18px;
		padding: 15px 20px;
		position: relative;
		flex: 1;
		flex-grow: 1;
	}

	.res-load .text-wrapper-20 {
		position: relative;
		width: fit-content;
		margin-top: -1px;
		margin-left: -83px;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #f5f0f3;
		font-size: 20px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .text-wrapper-21 {
		position: relative;
		width: fit-content;
		margin-top: -1px;
		margin-left: -13px;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #f5f0f3;
		font-size: 20px;
		letter-spacing: 0;
		line-height: normal;
	}

	.horizontal {
		display: flex;
		gap: 20px;
		flex-direction: column;
	}

	.box {
		position: relative;
		width: 849px;
		height: 406px;
	}

	.box .image-frame {
		width: 849px;
		height: 406px;
		top: 0;
		left: 0;
		border-radius: 5px;
		overflow: hidden;
		border: 1px dashed;
		border-color: #9747ff;
	}

	.box .property-hover {
		left: 20px;
		display: flexbox;
		display: grid;
		grid-row: inherit;
		flex-direction: column;
		width: 243px;
		align-items: center;
		justify-content: center;
		padding: 8px;
		position: absolute;
		top: 20px;
		background-color: #f5f0f3;
		border-radius: 10px;
	}

	.box .size-select {
		display: flex;
		width: 162px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 10px;
		position: relative;
		flex: 0 0 auto;
	}

	.box .select {
		display: flex;
		width: 20px;
		height: 20px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		position: relative;
		overflow: hidden;
	}

	.box .image-dim {
		display: inline-flex;
		height: 20px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 10px;
		position: relative;
		flex: 0 0 auto;
		border-radius: 2px;
		border: 1px solid;
		border-color: #3f3b5f;
	}

	.box .text-wrapper {
		margin-top: -9.5px;
		margin-bottom: -7.5px;
		font-size: 12px;
		position: relative;
		width: fit-content;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #282445;
		letter-spacing: 0;
		line-height: normal;
	}

	.box .image-main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 10px;
		position: relative;
		align-self: stretch;
		width: 100%;
		flex: 0 0 auto;
	}

	.box .rectangle {
		position: relative;
		align-self: stretch;
		width: 100%;
		height: 200px;
		background-color: #d9d9d9;
	}

	.box .div {
		position: relative;
		width: fit-content;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #282445;
		font-size: 18px;
		letter-spacing: 0;
		line-height: normal;
	}

	.box .image-tail {
		display: flex;
		align-items: flex-end;
		gap: 30px;
		position: relative;
		align-self: stretch;
		width: 100%;
		flex: 0 0 auto;
		background-color: #f5f0f3;
	}

	.box .image-type {
		display: flex;
		align-items: center;
		gap: 8px;
		position: relative;
		flex: 1;
		flex-grow: 1;
	}

	.box .div-wrapper {
		display: inline-flex;
		height: 30px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 10px;
		position: relative;
		flex: 0 0 auto;
		background-color: #f7e332;
		border-radius: 10px;
	}

	.box .text-wrapper-2 {
		position: relative;
		width: fit-content;
		margin-top: -7px;
		margin-bottom: -5px;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #3f392e;
		font-size: 15px;
		letter-spacing: 0;
		line-height: normal;
	}

	.box .file-size {
		display: inline-flex;
		height: 30px;
		align-items: center;
		justify-content: center;
		gap: 10px;
		padding: 8px 15px;
		position: relative;
		flex: 0 0 auto;
		margin-right: -37.5px;
		border-radius: 10px;
		border: 1px solid;
		border-color: #282445;
	}

	.box .text-wrapper-3 {
		margin-top: -5px;
		margin-bottom: -3px;
		font-size: 15px;
		position: relative;
		width: fit-content;
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #282445;
		letter-spacing: 0;
		line-height: normal;
	}

	.box .frame {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 10px;
		position: relative;
		flex: 1;
		flex-grow: 1;
	}

	.box .property-selected {
		left: 586px;
		display: flex;
		flex-direction: column;
		width: 243px;
		align-items: center;
		justify-content: center;
		padding: 8px;
		position: absolute;
		top: 20px;
		background-color: #f5f0f3;
		border-radius: 10px;
	}

	.box .property-default {
		display: flex;
		flex-direction: column;
		width: 243px;
		align-items: center;
		justify-content: center;
		padding: 8px;
		position: absolute;
		top: 20px;
		left: 303px;
		background-color: #f5f0f3;
		border-radius: 10px;
	}
</style>
