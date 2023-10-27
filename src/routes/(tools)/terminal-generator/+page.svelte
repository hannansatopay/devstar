
<!--  Introduction  -->

<Intro heading={data.meta.title} description={data.meta.description} />
<!--or-->
<!-- <section class="bg-custom-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:px-12">
		<h1
			class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white"
		>
			Terminal Generator
		</h1>
		<p class="text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
			Create and share beautiful images of your source code. <br />
			Start typing or drop a file into the text area to get started.
		</p>
	</div>
</section> -->

<svelte:window bind:innerWidth bind:innerHeight />

<!-- Terminal -->

<section class="bg-custom-white dark:bg-gray-900">
	<div class="page py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="editor min-h-[35rem] md:w-4/5 lg:w-full rounded-lg mx-auto flex flex-col p-2">
			<div class="container-bg" style="height: 100px; width: 100px; margin-top: 20px;"></div>
			<!-- Toolbar Section  -->
			<div class="toolbar flex flex-wrap justify-between mb-4">
				<!-- Themes & Languages Dropdown -->
				<!-- <div class="flex space-x-4"> -->
					<div class="theme">
						<span>Theme</span>
						<span class="ml-auto" />
						<ChevronDownSolid class="w-3 h-3 text-white dark:text-white" />
	
						<Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
							<div slot="header" class="p-3">
							  <Search size="md" />
							</div>
							<DropdownItem style="font-family: Roboto;">Roboto</DropdownItem>
							<DropdownDivider />
							<DropdownItem style="font-family: 'Open Sans';">Open Sans</DropdownItem>
							<DropdownDivider />
							<DropdownItem style="font-family: Lato;">Lato</DropdownItem>
							<!-- <DropdownItem slot="footer">Separated link</DropdownItem> -->
						  </Dropdown>
					</div>
				<div class="language">
					<span>Language</span>
					<span class="ml-auto" />
					<ChevronDownSolid class="w-3 h-3 text-white dark:text-white" />

					<Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
						<div slot="header" class="p-3">
							<Search size="md" />
						</div>
						<DropdownItem>C++</DropdownItem>
						<DropdownDivider />
						<DropdownItem>Java</DropdownItem>
						<DropdownDivider />
						<DropdownItem>Python</DropdownItem>
						<!-- <DropdownItem slot="footer">Separated link</DropdownItem> -->
					</Dropdown>
				</div>
				<!-- Second Toolbar Row -->
				<div class="toolbar-second-row">
					<div class="setting-buttons">
						<!-- <div class="flex space-x-4"> -->
						<!-- bg-select -->
						<div class="icon">
							<Button >
								<img src="/color-palatte.png" alt="Your  Description" />
								<div class="dropdown-content">
									<div class="color-palette">
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'violet'">
											<div class="color-box" style="background-color: violet;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'indigo'">
											<div class="color-box" style="background-color: indigo;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'blue'">
											<div class="color-box" style="background-color: blue;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'green'">
											<div class="color-box" style="background-color: green;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'yellow'">
											<div class="color-box" style="background-color: yellow;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'orange'">
											<div class="color-box" style="background-color: orange;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'red'">
											<div class="color-box" style="background-color: red;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'white'">
											<div class="color-box" style="background-color: white;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'black'">
											<div class="color-box" style="background-color: black;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'gray'">
											<div class="color-box" style="background-color: gray;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'brown'">
											<div class="color-box" style="background-color: brown;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'pink'">
											<div class="color-box" style="background-color: pink;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'purple'">
											<div class="color-box" style="background-color: purple;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'cyan'">
											<div class="color-box" style="background-color: cyan;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'magenta'">
											<div class="color-box" style="background-color: magenta;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'lime'">
											<div class="color-box" style="background-color: lime;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'teal'">
											<div class="color-box" style="background-color: teal;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'olive'">
											<div class="color-box" style="background-color: olive;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'navy'">
											<div class="color-box" style="background-color: navy;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'maroon'">
											<div class="color-box" style="background-color: maroon;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'aqua'">
											<div class="color-box" style="background-color: aqua;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'chartreuse'">
											<div class="color-box" style="background-color: chartreuse;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'crimson'">
											<div class="color-box" style="background-color: crimson;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkblue'">
											<div class="color-box" style="background-color: darkblue;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkcyan'">
											<div class="color-box" style="background-color: darkcyan;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkgoldenrod'">
											<div class="color-box" style="background-color: darkgoldenrod;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkgray'">
											<div class="color-box" style="background-color: darkgray;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkgreen'">
											<div class="color-box" style="background-color: darkgreen;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkkhaki'">
											<div class="color-box" style="background-color: darkkhaki;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkmagenta'">
											<div class="color-box" style="background-color: magenta;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkolivegreen'">
											<div class="color-box" style="background-color: darkolivegreen;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkorange'">
											<div class="color-box" style="background-color: darkorange;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkorchid'">
											<div class="color-box" style="background-color: darkorchid;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkred'">
											<div class="color-box" style="background-color: darkred;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkseagreen'">
											<div class="color-box" style="background-color: darkseagreen;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkslateblue'">
											<div class="color-box" style="background-color: darkslateblue;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkslategray'">
											<div class="color-box" style="background-color: darkslategray;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkturquoise'">
											<div class="color-box" style="background-color: dark turquoise;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'darkviolet'">
											<div class="color-box" style="background-color: darkviolet;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'deeppink'">
											<div class="color-box" style="background-color: deeppink;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'deepskyblue'">
											<div class="color-box" style="background-color: deepskyblue;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'dimgray'">
											<div class="color-box" style="background-color: dimgray;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'dodgerblue'">
											<div class="color-box" style="background-color: dodgerblue;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'firebrick'">
											<div class="color-box" style="background-color: firebrick;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'silver'">
											<div class="color-box" style="background-color: silver;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'plum'">
											<div class="color-box" style="background-color: plum;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'coral'">
											<div class="color-box" style="background-color: coral;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'yellowgreen'">
											<div class="color-box" style="background-color: yellowgreen;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'khaki'">
											<div class="color-box" style="background-color: khaki;"></div>
										</div>
										<div class="container-bg" style="background-color: white;" onclick="document.querySelector('.container-bg .bg').style.backgroundColor = 'sienna'">
											<div class="color-box" style="background-color: sienna;"></div>
										</div>
										

										
										
										<!-- Add more color boxes as needed -->
										<div class="container" style="height: 100px; width: 100px; margin-top: 20px;"></div>

									</div>
								</div>
							</Button>
						</div>
						<!-- Setting -->
						<div class="icon">
							<Button>
								<img src="/setting.png" alt="Your  Description" />
							</Button>
						</div>
						<!-- Copy-Menu -->
						<div class="icon">
							<Button>
								<img src="/copy.png" alt="Your  Description" />
							</Button>
						</div>
						<!-- Save Button -->
						<!-- <div class="save ml-auto">
							<span>Save</span>
							<span class="ml-auto" />
							<ChevronDownSolid class="w-3 h-3 text-white dark:text-white" />

						<Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
							<DropdownItem>Jpg</DropdownItem>
							<DropdownDivider />
							<DropdownItem>Png</DropdownItem>
							<DropdownDivider />
							<DropdownItem>Psd</DropdownItem>
							<Dropdown> -->
					</div>
					<div id="style-editor-button" class="jsx" />
					<div class="share-buttons">
						<div class="export-menu">
							<div class="id flex">
								<div class="post ml-auto">
									<span>Post</span>
									<span class="ml-auto" />
									<ChevronDownSolid class="w-3 h-3 text-white dark:text-white" />

									<Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
										<DropdownItem>
											<a href="https://www.facebook.com/share?url=YOUR_FACEBOOK_URL">Share on Facebook</a>
										</DropdownItem>
										<DropdownDivider />
										<DropdownItem>
											<a href="https://www.instagram.com/share?url=YOUR_INSTAGRAM_URL">Share on Instagram</a>
										</DropdownItem>
										<DropdownDivider />
										<DropdownItem>
											<a href="https://twitter.com/share?url=YOUR_TWITTER_URL">Share on Twitter</a>
										</DropdownItem>
									</Dropdown>
									
								</div>
							</div>
						</div>
						<!-- 
					<div class="icon">
						<Button>
							<img src="/Texttospeech.png" alt="Your  Description" />
						</Button>
					</div> -->
						<div class="export ml-auto">
							<span>Export</span>
							<span class="ml-auto" />
							<ChevronDownSolid class="w-3 h-3 text-white dark:text-white" />

							<Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
								<input type="checkbox" id="exportCheckbox" class="export-checkbox">
								<label for="exportCheckbox" class="dropdown-item">Code</label>
								<hr class="dropdown-divider">
							<Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
								<input type="checkbox" id="exportCheckbox" class="export-checkbox">
								<label for="exportCheckbox" class="dropdown-item">1 mb</label>
								<hr class="dropdown-divider">
							<Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
								<input type="checkbox" id="exportCheckbox" class="export-checkbox">
								<label for="exportCheckbox" class="dropdown-item">Export</label>
								<hr class="dropdown-divider">
								
								<!-- <DropdownItem slot="footer">Separated link</DropdownItem> -->
							</Dropdown>
							</Dropdown>
							</Dropdown>
						</div>
					</div>
				</div>
			</div>
			<!-- Terminal Area (or the Code Area) -->
			<div class="terminal relative rounded-md">
				<div class="dnd-container">
					<div class="section">
						<div class="export-container">
							<div class="container">
								<!-- <div class="Windows Controls"></div> -->
								<div class="react-codemirror2 CodeMirror__container window-theme__none">
									<div class="CodeMirror cm-s-base16-dark CodeMirror-wrap" translate="no">
										<div class="CodeMirror-scrollbar-filler" />
										<div class="CodeMirror-gutter-filler" />
										<div class="CodeMirror-scroll" tabindex="-1">
											<div
												class="CodeMirror-sizer"
												style="	 margin-left: 0px; margin-bottom: 0px; border-right-width: px; min-height: 27px; padding-right: 0px; padding-bottom: 0px;"
											>
												<div style="position: relative; top: 0px;">
													<div class="terminal-header">
														<!-- <span class="mr-auto ml-2"></span> -->
														<!-- <button class="close-btn bg-red-500 rounded-full w-4 h-4 mr-1" /> -->
														<button class="close-btn" />
														<!-- <button class="minimize-btn bg-yellow-500 rounded-full w-4 h-4 mr-1" /> -->
														<button class="minimize-btn" />
														<!-- <button class="maximize-btn bg-green-500 rounded-full w-4 h-4" /> -->
														<button class="maximize-btn" />
													</div>
													<div class="CodeMirror-lines" role="presentation">
														<div role="presentation" style="position: relative; outline: none;">
															<div
																class="CodeMirror-code"
																role="presentation"
																contenteditable="true"
																autocorrect="off"
																autocapitalize="off"
																style="text-rendering: auto;"
															>
																<CodeMirror
																	bind:value
																	lang={javascript()}
																	styles={{
																		'&': {
																			width: '100%',
																			maxWidth: '100%',
																			height: '250px',
																			borderRadius: '0px',
																			margin: '0 auto'
																		}
																	}}
																	theme={oneDark}
																/>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
								</div>
								<div class="container-bg">
									<div class="container-bg white eliminateOnRender" />
									<div class="container-bg alpha eliminateOnRender" />
									<div class="container-bg bg" />
								</div>
								<div class="handler" />
							</div>
						</div>
					</div>
				</div>
				<!-- <textarea>Terminal</textarea> -->
				<!-- The actual terminal or code content would go here -->
			</div>
		</div>
	</div>
</section>

<style>


	@font-face {
	font-family: 'Roboto';
	src: url('/fonts/roboto.woff2') format('woff2'),
		url('/fonts/roboto.woff') format('woff');
	/* Add additional font formats if necessary */
	/* Specify the correct path to the font files based on your project structure */
	}

	@font-face {
	font-family: 'Open Sans';
	src: url('/fonts/open-sans.woff2') format('woff2'),
		url('/fonts/open-sans.woff') format('woff');
	/* Add additional font formats if necessary */
	/* Specify the correct path to the font files based on your project structure */
	}

	@font-face {
	font-family: 'Lato';
	src: url('/fonts/lato.woff2') format('woff2'),
		url('/fonts/lato.woff') format('woff');
	/* Add additional font formats if necessary */
	/* Specify the correct path to the font files based on your project structure */
	}
	
	.toolbar-second-row {
		/* display: flex;
		align-items: center;
		justify-content: flex-start; */
		display: -webkit-box;
		display: -webkit-flex;
		display: -moz-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-flex: 1;
		-webkit-flex: 1 1 auto;
		-moz-box-flex: 1;
		-ms-flex: 1 1 auto;
		flex: 1 1 auto;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}

	.toolbar {
		display: flex;
		align-items: center;
	}

	.theme {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: flex-start;
		border: 1px solid white;
		width: 120px;
		padding: 5px 20px;
		margin-right: 8px;
		margin-left: 9px;
		margin-top: 5px;
		border-radius: 10px;
		font-size: 15px;
		color: white;
	}

	.container-bg {
			position: relative;
			z-index: 0;
			width: 40px;
			height: 40px;
			/* Add any other styles you want for .container-bg */
		}

	body {
    	font-family: Arial, sans-serif; /* Default font family */
	}

	/* Apply the custom fonts to the components using a class */
	.custom-font {
		font-family: 'CustomBodyFont', sans-serif;
	}

	/* Define specific fonts for the DropdownItem and DropdownDivider components */
	.custom-font DropdownItem {
		font-family: 'Roboto', sans-serif;
	}

	.custom-font DropdownDivider {
		font-family: 'Open Sans', sans-serif;
	}

	.theme-selector {
		margin: 10px;
	}

	.theme-button {
		cursor: pointer;
		padding: 5px 10px;
		margin: 5px;
		border: none;
		background-color: #333;
		color: #fff;
		border-radius: 5px;
	}

	.theme-button:hover {
		background-color: #555;
	}

	.language {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		border: 1px solid white;
		width: 150px;
		padding: 5px 25px;
		margin-left: 0.5px;
		margin-right: 8px;
		margin-top: 5px;
		border-radius: 10px;
		font-size: 15px;
		color: white;
	}

	#style-editor-button.jsx {
		display: -webkit-box;
		display: -webkit-flex;
		display: -moz-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-align: center;
		-webkit-align-items: center;
		-moz-box-align: center;
		-ms-flex-align: center;
		align-items: center;
	}

	.share-buttons {
		margin-left: auto;
	}

	.share-buttons,
	.setting-buttons {
		display: -webkit-box;
		display: -webkit-flex;
		display: -moz-box;
		display: -ms-flexbox;
		display: flex;
		height: 40px;
	}
	.export-menu {
		position: relative;
		color: #c198fb;
		-webkit-box-flex: 1;
		-webkit-flex: 1;
		-moz-box-flex: 1;
		-ms-flex: 1;
		flex: 1;
	}
	.flex {
		display: -webkit-box;
		display: -webkit-flex;
		display: -moz-box;
		display: -ms-flexbox;
		display: flex;
		height: 100%;
	}

	.post {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		border: 1px solid white;
		width: 120px;
		padding: 5px 30px;
		margin-right: 8px;
		margin-top: 5px;
		margin-left: 0.5px;
		border-radius: 10px;
		font-size: 15px;
		color: white;
	}

	.export {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		border: 1px solid white;
		width: 120px;
		padding: 5px 20px;
		margin-right: 9px;
		margin-top: 5px;
		margin-left: 0.5px;
		border-radius: 10px;
		font-size: 15px;
		color: white;
	}

	.icon img {
		width: 28px;
		height: 28px;
		object-fit: cover;
	}

	.icon {
		display: flex;
		align-items: center;
		margin-right: 3px;
		margin-top: 5px;
		border-radius: 10px;
		color: white;
		background-color: #2d3748;
	}

	.dark .icon {
		background-color: #2d3748; /* Dark Mode Background Color */
	}

	.editor {
		background-color: #121212;
		border: white 2px solid;
		width: 100%;
		height: 100%;
		max-width: 800px;
	}

	.terminal {
		/* flex-grow: 1; Let the terminal consume all remaining vertical space */
		width: 800px;
		height: 400px; /* Assuming 4rem is the height of your toolbar, adjust as needed */
		display: flex;
		/* flex-direction: column; */
		margin: 0 auto;
	}

	.bg {
		background-color: #121212;
		border: white 2px solid;
		display: flex; /* Set the container to use Flexbox */
		flex-direction: column; /* Arrange children (toolbar & terminal) vertically */
		height: 100%; /* If you want it to fill the height of its parent */
	}

	.dnd-container {
		position: relative;
		flex-grow: 1; /* This makes the code container grow to take all available space */
	}

	.section,
	.export-container {
		height: 100%;
		display: -webkit-box;
		display: -webkit-flex;
		display: -moz-box;
		display: -ms-flexbox;
		display: flex;
		-webkit-box-orient: vertical;
		-webkit-box-direction: normal;
		-webkit-flex-direction: column;
		-moz-box-orient: vertical;
		-moz-box-direction: normal;
		-ms-flex-direction: column;
		flex-direction: column;
		-webkit-box-pack: center;
		-webkit-justify-content: center;
		-moz-box-pack: center;
		-ms-flex-pack: center;
		justify-content: center;
		-webkit-box-align: center;
		-webkit-align-items: center;
		-moz-box-align: center;
		-ms-flex-align: center;
		align-items: center;
		overflow: hidden;
		max-width: 100%;
	}

	/* @media (max-width: 768px) */
	.container {
		/* max-width: 480px; */
		position: relative;
		min-width: 400px;
		max-width: 700px;
		width: 750px;
		height: 800px;

		padding: 56px 56px;
	}

	.container .CodeMirror__container {
		min-width: inherit;
		position: relative;
		z-index: 1;
		-webkit-border-radius: 5px;
		-moz-border-radius: 5px;
		border-radius: 5px;
		box-shadow: 0 20px 68px rgba(0, 0, 0, 0.55);
	}

	.container .CodeMirror__container .CodeMirror {
		height: auto;
		background-color: #282c34;
		color: #abb2bf;
		min-width: inherit;
		padding: 5px 5px;
		padding-left: 5px;
		border-radius: 5px;
		font-family: Hack, monospace !important;
		font-size: 14px;
		line-height: 133%;
		-webkit-font-variant-ligatures: contextual;
		-moz-font-variant-ligatures: contextual;
		font-variant-ligatures: contextual;
		-webkit-font-feature-settings: 'calt' 1;
		-moz-font-feature-settings: 'calt' 1;
		font-feature-settings: 'calt' 1;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		outline: none;
	}

	.CodeMirror-gutter-filler,
	.CodeMirror-scrollbar-filler {
		position: absolute;
		z-index: 6;
		display: none;
		outline: 0;
	}

	.CodeMirror-gutter-filler,
	.CodeMirror-scrollbar-filler {
		background-color: #fff;
	}

	.container-bg {
		position: absolute;
		top: 0px;
		right: 0px;
		bottom: 0px;
		left: 0px;
	}

	.container-bg .white {
		background: #fff;
		position: absolute;
		top: 0px;
		right: 0px;
		bottom: 0px;
		left: 0px;
	}

	.container-bg .alpha {
		position: absolute;
		top: 0px;
		right: 0px;
		bottom: 0px;
		left: 0px;
		/* background: url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAMUlEQVQ4T2NkYGAQYcAP3uCTZhw1gGGYhAGBZIA/nYDCgBDAm9BGDWAAJyRCgLaBCAAgXwixzAS0pgAAAABJRU5ErkJggg==); */
	}

	.container-bg .bg {
		background: rgb(116, 116, 116);
		background-size: auto;
		background-repeat: repeat;
		position: absolute;
		top: 0px;
		right: 0px;
		bottom: 0px;
		left: 0px;
	}

	.handler {
		z-index: 2;
		position: absolute;
		background-color: #8c104e;
		top: 56px;
		bottom: 56px;
		right: 56px;
		width: 8px;
		cursor: ew-resize;
		opacity: 0;
	}

	.terminal-header {
		display: flex;
		align-items: center;
		border-radius: 0px;

		background-color: #282c34; /* One Dark background color */
		color: #abb2bf; /* One Dark foreground color */
		/* border-bottom: 1px solid #3e4451; Slight border to separate from the terminal content */
	}

	.close-btn,
	.minimize-btn,
	.maximize-btn {
		margin: 2px;
		cursor: pointer;
		transition: background-color 0.2s;
		width: 12px;
		height: 12px;
		border-radius: 50%;
	}

	.close-btn {
		background-color: #e06c75; /* One Dark red color */
	}

	.minimize-btn {
		background-color: #d19a66; /* One Dark yellow color */
	}

	.maximize-btn {
		background-color: #98c379; /* One Dark green color */
	}

	.close-btn:hover {
		background-color: darken(#e06c75, 10%); /* Slightly darken on hover */
	}

	.minimize-btn:hover {
		background-color: darken(#d19a66, 10%);
	}

	.maximize-btn:hover {
		background-color: darken(#98c379, 10%);
	}

	/* Include the fonts.css file if not already included */
	@import 'path/to/fonts.css';

	/* Apply custom fonts to the Dropdown component */
	Dropdown {
		font-family: 'CustomBodyFont', sans-serif;
	}

	/* Apply custom fonts to DropdownItem components */
	DropdownItem {
		font-family: 'Roboto', sans-serif;
	}

	/* Apply custom fonts to DropdownDivider components */
	DropdownDivider {
		font-family: 'Open Sans', sans-serif;
	}

	/* Style for the dropdown container */
	.icon {
            position: relative;
            display: inline-block;
        }

        /* Style for the button that triggers the dropdown */
        .icon button {
            background-color: #4CAF50;
            color: white;
            padding: 10px;
            border: none;
            cursor: pointer;
        }

        /* Style for the dropdown content */
        .icon .dropdown-content {
            display: none;
            position: absolute;
            background-color: #f1f1f1;
            min-width: 160px;
            box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
            z-index: 1;
        }

        /* Style for dropdown items */
        .icon .dropdown-content a {
            padding: 12px 16px;
            text-decoration: none;
            display: block;
            cursor: pointer;
        }

        /* Change color of dropdown items on hover */
        .icon .dropdown-content a:hover {
            background-color: #ddd;
        }

        /* Show the dropdown content when the button is clicked */
        .icon:hover .dropdown-content {
            display: block;
        }

        /* Style for the color palette items */
        .color-palette {
            display: flex;
            flex-wrap: wrap;
			height: 200px;
        }

        .color-palette .color-box {
            width: 30px;
            height: 30px;
            margin: 5px;
            cursor: pointer;
            border: 1px solid #ccc;
        }

		/* Include the fonts.css file if not already included */
		@import 'path/to/fonts.css';

		/* Apply custom fonts to the components */
		:global(.dropdown) {
		font-family: 'CustomBodyFont', sans-serif;
		}

		:global(.dropdown-item) {
		font-family: 'CustomBodyFont', sans-serif;
		}

		:global(.dropdown-divider) {
		font-family: 'CustomBodyFont', sans-serif;
		}

		/* Include the fonts.css file if not already included */
		@import 'path/to/fonts.css';

		/* Apply custom fonts to DropdownItem components */
		DropdownItem {
			font-family: 'Roboto', sans-serif; /* Replace with your desired font family */
		}

		/* Apply custom fonts to DropdownDivider components */
		DropdownDivider {
			font-family: 'Open Sans', sans-serif; /* Replace with your desired font family */
		}

		/* Apply custom fonts to the entire Dropdown component if needed */
		Dropdown {
			font-family: 'Lato', sans-serif; /* Replace with your desired font family */
		}

		.export-checkbox {
		display: none;
	}

		.dropdown-item {
		height: auto;
		background-color: #ffffff;
		color: #000000;
		min-width: inherit;
		padding: 5px 5px;
		padding-left: 5px;
		border-radius: 5px;
		font-family: Hack, monospace !important;
		font-size: 14px;
		line-height: 133%;
		-webkit-font-variant-ligatures: contextual;
		-moz-font-variant-ligatures: contextual;
		font-variant-ligatures: contextual;
		-webkit-user-select: none;
		-moz-user-select: none;
		-ms-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		outline: none;
		}

		.dropdown-divider {
			border-top: 1px solid #abb2bf;
			margin: 8px 0;
		}

		.export-checkbox:checked + .dropdown-item {
			/* Add your export styles here */
			/* This style will be applied when the checkbox is checked */
			/* You can customize it to change the appearance */
		}

		

</style>

<script lang="ts">
	import Intro from '$lib/Intro.svelte';
	import {
		Label,
		Input,
		Range,
		Radio,
		Checkbox,
		ButtonGroup,
		Button,
		Search,
		Dropdown,
		DropdownItem,
		DropdownDivider
	} from 'flowbite-svelte';

	import { onMount } from 'svelte';

	import {
		ChevronDownSolid,
		UserRemoveSolid,
		UserCircleSolid,
		AdjustmentsVerticalOutline,
		DownloadSolid,
		CopySolid,
		UserSettingsOutline,
		UserSettingsSolid
	} from 'flowbite-svelte-icons';

	import CodeMirror from 'svelte-codemirror-editor';
	import { javascript } from '@codemirror/lang-javascript';
	import { oneDark } from '@codemirror/theme-one-dark';

	export let data;

	let innerWidth: any = null;
	let innerHeight: any = null;

	let value = '';

	onMount(() => {
		// const codeEditor = document.querySelector('.code-editor');

		// if (codeEditor) {
		// 	editor = CodeMirror(codeEditor, {
		// 		lineNumbers: true,
		// 		theme: 'dracula'
		// 		// ... any other CodeMirror options you want
		// 	});
		// }

		innerWidth = window.innerWidth;
		innerHeight = window.innerHeight;
	});

	let event;
	let codeMirrorInstance: any = null;

	// function handleKeydown(event) {
	// 	if (event.keyCode === 8) {
	// 		// If the key is backspace
	// 		const cm = event.target.CodeMirror;
	// 		const cursor = cm.getCursor();
	// 		if (cursor.ch === 0 && cursor.line === 0) {
	// 			event.preventDefault();
	// 		}
	// 	}
	// }

</script>
