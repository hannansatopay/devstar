<script>
	let url = "";
	let imgUrls = [];
	let loading = false;
	let error = null;

	const scrape = async () => {
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
			} else {
				error = data.error;
			}
		} catch (error) {
			console.error("Error:", error);
			error = "An error occurred during the scraping process.";
		} finally {
			loading = false;
		}
	};

	function showResults() {
		var urlInput = document.getElementById("url").value;
		if (urlInput) {
			// Assuming the 'mainresframe-container' is the div you want to display
			var resultsContainer = document.getElementById("resultsContainer");
			resultsContainer.style.display = "block";

			// Hide other elements if needed
			// ...
		}
	}

	// function toggleImageOrientation() {
	// 	const horizontalImage = document.querySelector(".horizontal");
	// 	const verticalImage = document.querySelector(".vertical");

	// 	if (horizontalImage.style.display === "block") {
	// 		horizontalImage.style.display = "none";
	// 		verticalImage.style.display = "block";
	// 	} else {
	// 		horizontalImage.style.display = "block";
	// 		verticalImage.style.display = "none";
	// 	}
	// }

	function applyFilters() {
		const imageType = document.getElementById("imageType").value;
		const sortOption = document.getElementById("sortOptions").value;
		const images = document.querySelectorAll(
			".horizontal .image-frame-vertical .frame-2 img"
		);

		images.forEach((image) => {
			let shouldDisplay = true;

			// Check image type
			if (imageType !== "all") {
				const fileType = image.src.split(".").pop().toLowerCase();
				if (fileType !== imageType) {
					shouldDisplay = false;
				}
			}

			image.style.display = shouldDisplay ? "inline-block" : "none";
		});

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
		// Hide the download button for non-visible images
		images.forEach((image) => {
			const imageItem = image.closest(".image-frame-vertical");
			if (imageItem) {
				imageItem.querySelector("button").style.display =
					image.style.display;
			}
		});

		// Add click event listener to toggle selection
		images.forEach((image) => {
			image.addEventListener("click", () => {
				// toggleSelection(image);
			});
		});
		// Add click event listener to toggle selection
		images.forEach((image) => {
			image.addEventListener("click", () => {
				console.log("Image clicked:", image.src);
				// toggleSelection(image);
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
		const link = document.createElement("a");
		link.href = imageSrc;
		link.download = fileName;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
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
</script>

<div class="header">
	<div class="image-extractor">
		<!-- <img class="image" src="img/image.png" alt="1" /> -->
		<div class="text-wrapper">Image Extractor</div>
	</div>
	<!-- <div class="nav-bar">
		<button class="button-3"
			><a class="button-2" href="/#">Home</a></button
		>
		<button class="button-3"
			><a class="button-2" href="#aboutus">About us</a></button
		>
		<button class="button-3"
			><a class="button-2" href="#faq">Help Center</a></button
		>
	</div> -->
	<div class="login">
		<button class="button-wrapper-2"
			><a class="button-2" href="/#">Login</a></button
		>
		<button class="button-wrapper-2"
			><a class="button-2" href="/#">Sign up</a></button
		>
	</div>
</div>
<div class="res-load">
	<div class="div">
		<div class="home-container">
			<div class="home-frame14">
				<div class="home-heading">
					<span class="home-text"><span>Extract Image</span></span>
					<br />
					<span class="home-text02"
						><span>from any public website!</span></span
					>
				</div>
				<div class="home-searchbar">
					<div class="home-urlbar">
						<input
							class="home-text04"
							placeholder="Enter any URL"
							type="text"
							id="url"
							bind:value={url}
						/>
						<button style="color: black;"
					on:click={scrape}
					disabled={loading}
					on:click={showResults}
					class="home-button"
				>
					{loading ? "Scraping..." : "Scrape Images"}
				</button>
				{#if error}
					<p style="color: red;">Error: {error}</p>
				{/if}
					</div>
				</div>
				
			</div>
		</div>
		<div class="main-res-frame">
			<div
				class="main-res-frame-2"
				id="resultsContainer"
				style="display: none;"
			>
			
				<div class="side-bar-sort">
					<div class="sort">
						<br><br><br>
						<div class="sort-head">

							<div class="text-wrapper">
								<label for="sortOptions">Sort By:</label>
							</div>
							<!-- <div class="sort-size">
								<div class="big-small">
									<div class="big-small-2">Big -> Small</div>
								</div>
							</div> -->
						</div>
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
						</div>
					</div>
					<div class="filter">
						<div class="text-wrapper-3">Filter images by type</div>
						<div class="filter-menu">
							<div class="image-type-filter">
								<div class="text-wrapper-4">ICO (1)</div>
							</div>
							<div class="div-wrapper">
								<div class="text-wrapper-5">PNG (1)</div>
							</div>
							<div class="image-type-filter-2">
								<div class="text-wrapper-6">SVG (1)</div>
							</div>
							<div class="image-type-filter-3">
								<div class="text-wrapper-7">JPEG (1)</div>
							</div>
							<div class="image-type-filter-4">
								<div class="text-wrapper-8">GIF (1)</div>
							</div>
						</div>
					</div>
					<div class="search">
						<div class="text-wrapper-9">Search for images</div>
						<div class="url-bar">
							<div class="enter-any-URL">Type to Search....</div>
						</div>
						<div class="text-wrapper-10">Download</div>
					</div>
					<div class="download-buttons">
						<!-- <div class="select-deselect">
							 <div class="white-button">
								<img
									class="img"
									src="img/check-circle.png"
									alt="a"
								/>
								<div class="text-wrapper-11">
									<button on:click={selectAll}
										>Select All</button
									>
								</div> -->
							<!-- </div>  -->
							<!-- <div class="white-button">
								<img
									class="img"
									src="img/radio-button-unchecked.png"
									alt="h"
								/>
								<div class="text-wrapper-11">
									<button on:click={deselectAll}
										>Deselect All</button
									>
								</div>
							</div> -->
						<!-- </div>  -->
						<!-- <div class="white-button-2">
							 <img
								class="img"
								src="img/content-paste.png"
								alt="k"
							/> -->
							<!-- <div class="copy-selected-urls">
								Copy selected&nbsp;&nbsp;URLs
							</div>
						</div>
						<div class="white-button-3"> -->
							<!-- <img class="img" src="img/download-3.png" alt="j" /> -->
							<!-- <div class="text-wrapper-12">Download Selected</div> -->
						</div>
					</div> 
				</div>
				<div class="res-frame">
					<!-- <div class="result-header">
						<p class="showing-images-from">
							<span class="span">Showing images from </span>
							<span class="text-wrapper-13">dribble.com</span> -->
						<!-- </p>  -->
						<!-- <button on:click={toggleImageOrientation}
							>Toggle Image Orientation</button
						> -->
					<!-- </div>  -->
					<div class="horizontal">
						{#if imgUrls.length > 0}
							{#each imgUrls as imgUrl}
								<!-- <li>
									<a href={imgUrl} target="_blank">{imgUrl}</a
									>
								</li> -->
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
											<!-- <button
												on:click={() =>
													downloadImage(
														{ imgUrl },
														{ imgUrl }
													)}>Download</button
											> -->
										</div>
									</div>
								</div>
							{/each}
						{/if}
					</div>
					<div class="vertical" style="display: none;">
						<div class="box">
							<div class="image-frame">
								<div class="property-hover">
									{#if imgUrls.length > 0}
										{#each imgUrls as imgUrl}
											<div
												class="size-select"
												data-selected="false"
											>
												<div class="select" />
												<div class="image-dim">
													<div class="text-wrapper">
														1600 x 1200
													</div>
												</div>
											</div>
											<div class="image-main">
												<img
													class="rectangle"
													src={imgUrl}
													alt={imgUrl}
												/>
												<div class="div">
													Image_name
												</div>
											</div>
											<div class="image-tail">
												<div class="image-type">
													<div class="div-wrapper">
														<div
															class="text-wrapper-2"
														>
															ICO
														</div>
													</div>
													<div class="file-size">
														<div
															class="text-wrapper-3"
														>
															980 KB
														</div>
													</div>
												</div>
												<div class="frame">
													<button
														on:click={copyImageUrl}
														>Copy Image URL</button
													>
													<button
														on:click={() =>
															downloadImage(
																{ imgUrl },
																{ imgUrl }
															)}>Download</button
													>
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
			<!-- <div class="faq">
				<div class="faq-header">
					<div class="text-wrapper-16">
						Frequently asked questions
					</div>
					<p class="if-you-can-t-find">
						<span class="text-wrapper-17"
							>If you can’t find what you’re looking for, write us
							a message and we&#39;ll get back to you.</span
						>
					</p>
				</div>
				<div class="faq-frame">
					<div class="text-wrapper-18">What is extract.pics?</div>
					<div class="lorem-ipsum-dolor">
						<p class="p">
							Lorem ipsum dolor sit amet consectetur. Orci
							consequat congue orci etiam mattis aliquam tincidunt
							felis porttitor. Tortor turpis aliquam ullamcorper
							nam erat consequat. Et amet pellentesque turpis eget
							ac justo eu gravida. Sed sodales feugiat mauris
							aliquam blandit justo bibendum proin. Pretium risus
							quis varius vestibulum sed leo cras morbi. Cras
							lectus ut mattis ligula pretium lacus commodo.
							Ullamcorper nam consequat morbi eros lorem sit. Et
							ullamcorper consequat sit nunc eget quam. Lacus
							massa magna scelerisque ac interdum.
						</p>
					</div>
				</div>
				<div class="faq-frame">
					<div class="text-wrapper-18">What is extract.pics?</div>
					<div class="lorem-ipsum-dolor">
						<p class="p">
							Lorem ipsum dolor sit amet consectetur. Orci
							consequat congue orci etiam mattis aliquam tincidunt
							felis porttitor. Tortor turpis aliquam ullamcorper
							nam erat consequat. Et amet pellentesque turpis eget
							ac justo eu gravida. Sed sodales feugiat mauris
							aliquam blandit justo bibendum proin. Pretium risus
							quis varius vestibulum sed leo cras morbi. Cras
							lectus ut mattis ligula pretium lacus commodo.
							Ullamcorper nam consequat morbi eros lorem sit. Et
							ullamcorper consequat sit nunc eget quam. Lacus
							massa magna scelerisque ac interdum.
						</p>
					</div>
				</div>
			</div>
			<footer class="footer">
				<div class="frame-7">
					<img class="img-2" src="img/copyright.png" alt="" /> -->
					<!-- <div class="text-wrapper-19">image-extract</div> -->
				<!-- </div>
				<div class="frame-8">
					<div class="text-wrapper-20">Status</div>
					<div class="text-wrapper-21">Changelog</div>
					<div class="text-wrapper-19">Documentation</div>
					<div class="text-wrapper-19">Privacy and Cookie</div>
					<div class="text-wrapper-19">Terms of service</div>
				</div> -->
			<!-- </footer> -->
		 </div> 
	</div> 
<!-- </div> -->

<style>
	body
	{
		background-color: #6debf3;
	}
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
		font-family: "Jost-Medium", Helvetica;
		font-weight: 500;
		color: #282445;
		font-size: 30px;
		letter-spacing: 0;
		line-height: normal;
	}

	.header .nav-bar {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2px;
		position: relative;
		flex: 1;
		flex-grow: 1;
	}

	.header .login {
		/* border-radius: 2px;
		border-color: black; */
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
		border: 2px solid black; 
    	border-radius: 5px; 
    	padding: 8px 12px;
	}

	.header .button-2 {
		position: relative;
		width: fit-content;
		margin-top: -5.5px;
		margin-bottom: -3.5px;
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
		gap: 8px;
		top: 100px;
		width: 1350px;
		display: flex;
		position: relative;
		align-items: center;
		flex-direction: column;
	}

	.home-text {
		color: rgb(0, 0, 0);
		height: auto;
		font-size: 70px;
		font-style: Medium;
		text-align: left;
		font-family: Jost;
		font-weight: 500;
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
		font-family: Bitter;
		font-weight: 700;
		line-height: normal;
		font-stretch: normal;
		text-decoration: none;
	}

	.home-searchbar {
		/* gap: 43px; */
		display: flex;
		align-items: center;
		flex-direction: column;
	}

	.home-urlbar {
		gap: 10px;
		width: auto;
		display: flex;
		padding: 10px;
		align-items: center;
		flex-shrink: 0;
		border-color: rgba(245, 240, 243, 1);
		border-style: solid;
		border-width: 2px;
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
		/* gap: 10px; */
		width: 106px;
		display: flex;
		/* padding: 10px; */
		align-items: center;
		flex-shrink: 0;
		border-radius: 25px;
		/* justify-content: center; */
		/* background-color: rgba(85, 83, 99, 1); */
		margin-top: 0;
		padding-top: 0;
		margin-left: auto;
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
		background-color: transparent;
		display: flex;
		flex-direction: row;
		justify-content: center;
		position: relative;
		/* background-image: url("./background.jpg"); */
		background-color: #6debf3;
		background-size: cover;
		height: 100%;
	}

	.res-load .div {
		/* background-image: url(./background.jpg); */
		background-color: #6debf3;
		height: 100%;
		
		/* background-size: cover; */
		/* position: relative; */
	}

	.res-load .main-res-frame {
		display: flex;
		flex-direction: column;
		width: 1300px;
		align-items: flex-start;
		gap: 2px;
		position: relative;
		top: 22px;
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
		width: 520px;
		height: 615px;
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
		color: #282445;
		font-size: 20px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .white-button-2 {
		padding: 5px 15px;
		background-color: #f5f0f3;
		border-radius: 5px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		position: relative;
		flex: 0 0 auto;
		box-shadow: 0px 4px 4px #00000040;
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
		padding: 10px 20px;
		min-width: 120px;
		background-color: #282445;
		border-radius: 20px;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		position: relative;
		flex: 0 0 auto;
		box-shadow: 0px 4px 4px #00000040;
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
		color:black;
		font-size: 18px;
		letter-spacing: 0;
		line-height: normal;
	}

	.res-load .span {
		font-family: "Jost-Regular", Helvetica;
		font-weight: 400;
		color: #ffffff;
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
		color: #1c1b1f;
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
