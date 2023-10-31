
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
			<div class="container-bg" style="height: 0px; width: 0px; margin-top: 0px;"></div>
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
								<div class="div-violet" onclick="document.querySelector('.terminal').style.backgroundColor = 'violet'">Violet</div>
								<div class="div-indigo" onclick="document.querySelector('.terminal').style.backgroundColor = 'indigo'">Indigo</div>
								<div class="div-blue" onclick="document.querySelector('.terminal').style.backgroundColor = 'blue'">Blue</div>
								<div class="div-green" onclick="document.querySelector('.terminal').style.backgroundColor = 'green'">Green</div>
								<div class="div-yellow" onclick="document.querySelector('.terminal').style.backgroundColor = 'yellow'">Yellow</div>
								<div class="div-orange" onclick="document.querySelector('.terminal').style.backgroundColor = 'orange'">Orange</div>
								<div class="div-red" onclick="document.querySelector('.terminal').style.backgroundColor = 'red'">Red</div>
								<div class="div-white" onclick="document.querySelector('.terminal').style.backgroundColor = 'white'">White</div>
								<div class="div-black" onclick="document.querySelector('.terminal').style.backgroundColor = 'black'">Black</div>
								<div class="div-gray" onclick="document.querySelector('.terminal').style.backgroundColor = 'gray'">Gray</div>
								<div class="div-brown" onclick="document.querySelector('.terminal').style.backgroundColor = 'brown'">Brown</div>
								<div class="div-pink" onclick="document.querySelector('.terminal').style.backgroundColor = 'pink'">Pink</div>
								<div class="div-purple" onclick="document.querySelector('.terminal').style.backgroundColor = 'purple'">Purple</div>
								<div class="div-cyan" onclick="document.querySelector('.terminal').style.backgroundColor = 'cyan'">Cyan</div>
								<div class="div-magenta" onclick="document.querySelector('.terminal').style.backgroundColor = 'magenta'">Magenta</div>
								<div class="div-lime" onclick="document.querySelector('.terminal').style.backgroundColor = 'lime'">Lime</div>
								<div class="div-teal" onclick="document.querySelector('.terminal').style.backgroundColor = 'teal'">Teal</div>
								<div class="div-olive" onclick="document.querySelector('.terminal').style.backgroundColor = 'olive'">Olive</div>
								<div class="div-navy" onclick="document.querySelector('.terminal').style.backgroundColor = 'navy'">Navy</div>
								<div class="div-maroon" onclick="document.querySelector('.terminal').style.backgroundColor = 'maroon'">Maroon</div>
								<div class="div-aqua" onclick="document.querySelector('.terminal').style.backgroundColor = 'aqua'">Aqua</div>
								<div class="div-chartreuse" onclick="document.querySelector('.terminal').style.backgroundColor = 'chartreuse'">Chartreuse</div>
								<div class="div-crimson" onclick="document.querySelector('.terminal').style.backgroundColor = 'crimson'">Crimson</div>
								<div class="div-darkcyan" onclick="document.querySelector('.terminal').style.backgroundColor = 'darkcyan'">Darkcyan</div>
								<div class="div-darkgoldenrod" onclick="document.querySelector('.terminal').style.backgroundColor = 'darkgoldenrod'">Darkgoldenrod</div>
								<div class="div-darkgray" onclick="document.querySelector('.terminal').style.backgroundColor = 'darkgray'">Darkgray</div>
								<div class="div-darkgreen" onclick="document.querySelector('.terminal').style.backgroundColor = 'darkgreen'">Darkgreen</div>
								<div class="div-darkkhaki" onclick="document.querySelector('.terminal').style.backgroundColor = 'darkkhaki'">Darkkhaki</div>
								<div class="div-darkmagenta" onclick="document.querySelector('.terminal').style.backgroundColor = 'darkmagenta'">Darkmagenta</div>
								<div class="div-darkolivegreen" onclick="document.querySelector('.terminal').style.backgroundColor = 'darkolivegreen'">Darkolivegreen</div>
								<div class="div-darkorange" onclick="document.querySelector('.terminal').style.backgroundColor = 'darkorange'">Darkorange</div>
								<div class="div-darkorchid" onclick="document.querySelector('.terminal').style.backgroundColor = 'darkorchid'">Darkorchid</div>
								<div class="div-darkred" onclick="document.querySelector('.terminal').style.backgroundColor = 'darkred'">Darkred</div>
								<div class="div-darkseagreen" onclick="document.querySelector('.terminal').style.backgroundColor = 'darkseagreen'">Darkseagreen</div>
								<div class="div-darkslateblue" onclick="document.querySelector('.terminal').style.backgroundColor = 'darkslateblue'">Darkslateblue</div>
								<div class="div-darkslategray" onclick="document.querySelector('.terminal').style.backgroundColor = 'darkslategray'">Darkslategray</div>
								<div class="div-darkturquoise" onclick="document.querySelector('.terminal').style.backgroundColor = 'darkturquoise'">Darkturquoise</div>
								<div class="div-darkviolet" onclick="document.querySelector('.terminal').style.backgroundColor = darkviolet'">Darkviolet</div>
								<div class="div-deeppink" onclick="document.querySelector('.terminal').style.backgroundColor = 'deeppink'">Deeppink</div>
								<div class="div-deepskyblue" onclick="document.querySelector('.terminal').style.backgroundColor = 'deepskyblue'">Deepskyblue</div>
								<div class="div-dimgray" onclick="document.querySelector('.terminal').style.backgroundColor = 'dimgray'">dimgrayDimgray</div>
								<div class="div-dodgerblue" onclick="document.querySelector('.terminal').style.backgroundColor = 'dodgerblue'">Dodgerblue</div>
								<div class="div-firebrick" onclick="document.querySelector('.terminal').style.backgroundColor = 'firebrick'">Firebrick</div>
								<div class="div-silver" onclick="document.querySelector('.terminal').style.backgroundColor = 'silver'">Silver</div>
								<div class="div-plum" onclick="document.querySelector('.terminal').style.backgroundColor = 'plum'">Plum</div>
								<div class="div-coral" onclick="document.querySelector('.terminal').style.backgroundColor = 'coral'">Coral</div>
								<div class="div-yellowgreen" onclick="document.querySelector('.terminal').style.backgroundColor = 'yellowgreen'">Yellowgreen</div>
								<div class="div-khaki" onclick="document.querySelector('.terminal').style.backgroundColor = 'khaki'">Khaki</div>
								<div class="div-sienna" onclick="document.querySelector('.terminal').style.backgroundColor = 'sienna'">Sienna</div>

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
										<div class="container-bg" style="background-color: white;">
											<div class="color-box" style="background-color: khaki;"></div>
										  </div>
										  <div class="container-bg" style="background-color: white;">
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
											<a href="https://www.facebook.com">Share on Facebook</a>
										</DropdownItem>
										<DropdownDivider />
										<DropdownItem>
											<a href="https://www.instagram.com">Share on Instagram</a>
										</DropdownItem>
										<DropdownDivider />
										<DropdownItem>
											<a href="https://twitter.com">Share on Twitter</a>
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
					<div class="export ml-auto export-container">
						<span>Export</span>
						<span class="ml-auto"></span>
						<ChevronDownSolid class="w-3 h-3 text-white dark:text-white" />
					  
						<Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
						  <!-- <input type="checkbox" id="exportCheckbox" class="export-checkbox">
						  <label for="exportCheckbox" class="dropdown-item">Code</label>
						  <hr class="dropdown-divider"> -->
					  
						  <input type="checkbox" id="exportImageCheckbox" class="export-checkbox">
						  <label for="exportImageCheckbox" class="dropdown-item" on:click={exportToImage}>Export as Image</label>
						  <hr class="dropdown-divider">
					  
						  <!-- <input type="checkbox" id="exportSVGCheckbox" class="export-checkbox">
						  <label for="exportSVGCheckbox" class="dropdown-item" on:click={exportToSVG}>Export as SVG</label>
						  <hr class="dropdown-divider"> -->
					  
						  <input type="checkbox" id="copyTextCheckbox" class="export-checkbox">
						  <label for="copyTextCheckbox" class="dropdown-item" on:click={copyTextToClipboard}>Copy Code Text</label>
						  <hr class="dropdown-divider">
					  
						  <input type="checkbox" id="copyImageCheckbox" class="export-checkbox">
						  <label for="copyImageCheckbox" class="dropdown-item" on:click={copyImageToClipboard}>Copy Code Image</label>
						  <hr class="dropdown-divider">
						  
						  <input type="checkbox" id="copyURLCheckbox" class="export-checkbox">
                          <label for="copyURLCheckbox" class="dropdown-item" on:click={copyURLToClipboard}>Copy URL</label>
                          <hr class="dropdown-divider">
						  <!-- <DropdownItem slot="footer">Separated link</DropdownItem> -->
						</Dropdown>
					  </div>
					  
					</div>
				</div>
			</div>
			<!-- Terminal Area (or the Code Area) -->

			<div class="terminal relative rounded-md div-white">
    <div class="dnd-container">
        <div class="section">
            <div class="export-container">
                <div class="container">
                    <div class="react-codemirror2 CodeMirror__container window-theme__none">
                        <div class="CodeMirror cm-s-base16-dark CodeMirror-wrap" translate="no">
                            <div class="CodeMirror-scrollbar-filler"></div>
                            <div class="CodeMirror-gutter-filler"></div>
                            <div class="CodeMirror-scroll" tabindex="-1">
                                <div class="CodeMirror-sizer" style="margin-left: 0px; margin-bottom: 0px; border-right-width: px; min-height: 27px; padding-right: 0px; padding-bottom: 0px;">
                                    <div style="position: relative; top: 0px;">
                                        <div class="terminal-header div-deepskyblue">
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
																			height: '280px',
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
		z-index: 2;
	}

	body {
            font-family: Arial, sans-serif;
            transition: background-color 0.3s, color 0.3s;
        }

        #container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        /* Light Theme Styles */
        #light:checked ~ .CodeMirror.cm-s-base16-dark.CodeMirror-wrap {
            background-color: #121212;
            border: 2px solid white;
        }

        /* Dark Theme Styles */
        #dark:checked ~ .CodeMirror.cm-s-base16-dark.CodeMirror-wrap {
            background-color: #333;
            border: 2px solid white;
        }

        input[type="radio"] {
            display: none;
        }

        label {
            display: block;
            cursor: pointer;
            margin-bottom: 10px;
            padding: 5px 10px;
            background-color: #ddd;
            border: 1px solid #ccc;
            border-radius: 4px;
        }

        input[type="radio"] + label:hover {
            background-color: #eee;
        }

        .CodeMirror.cm-s-base16-dark.CodeMirror-wrap {
            /* Styles for your code editor container */
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
		z-index: 1;
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
		z-index: 1;
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
		z-index: 2;
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
		z-index: 2;
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
            border: 2px solid white;
            width: 100%;
            height: 100%;
            max-width: 800px;
			height: 500px;
            margin: auto;
    }

	.terminal {
	  	/* flex-grow: 1; Let the terminal consume all remaining vertical space */
		width: 753px;
  		height: 460px; /* Assuming 4rem is the height of your toolbar, adjust as needed */
  		display: flex;
  		/* flex-direction: column; */
  		margin: auto;
  		margin-top: 20px;
  		margin-bottom: 20px;
  		margin-left: auto;
  		margin-right: auto;
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
		padding: 0px;
	}

	.container-bg .white {
		background: #fff;
		position: absolute;
		top:0px;
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
		top: px;
		right: 0px;
		bottom: 0px;
		left: 0px;
		height: 440px;
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
			z-index: 2;
        }

        .color-palette .color-box {
            width: 30px;
            height: 30px;
            margin: 5px;
            cursor: pointer;
            border: 1px solid #ccc;
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

		.color-radio {
			display: none;
		}

		.color-option {
			cursor: pointer;
		}

		.color-radio:checked + .color-option {
				background-color: #fff; /* Change the background color to white when checked */
				color: #000; /* Change the text color to black when checked */
		}

		/* Define different classes for each div with different background colors */
		.div-violet {
        	background-color: violet;
        	color: white;
        	padding: 10px;
        	border-radius: 5px;
        	font-size: 18px;
        	text-align: center;
    	}

		.div-indigo {
			background-color: indigo;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-blue {
			background-color: blue;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-green {
			background-color: green;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-yellow {
			background-color: yellow;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-orange {
			background-color: orange;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-red {
			background-color: red;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-white {
			background-color: white;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-black {
			background-color: black;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-gray {
			background-color: gray;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-brown{
			background-color: brown;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-pink {
			background-color: pink;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-purple{
			background-color: purple;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-cyan{
			background-color: cyan;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-magenta {
			background-color: magenta;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-lime {
			background-color: lime;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-teal {
			background-color: teal;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-olive {
			background-color: olive;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-navy {
			background-color: navy;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}
		
		.div-maroon {
			background-color: maroon;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}
		
		.div-aqua {
			background-color: aqua;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-chartreuse {
			background-color: chartreuse;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-crimson {
			background-color: crimson;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

	    .div-darkblue {
			background-color: darkblue;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-darkcyan {
			background-color: darkcyan;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;	
		}

		.div-darkgoldenrod {
			background-color: darkgoldenrod;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;	
		}

		.div-darkgray {
			background-color: darkgray;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;	
		}

		.div-darkgreen {
			background-color: darkgreen;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;	
		}

		.div-darkkhaki {
			background-color: darkkhaki;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;	
		}

		.div-darkmagenta {
			background-color: darkmagenta;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;	
		}

		.div-darkolivegreen {
			background-color: darkolivegreen;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;	
		}

        .div-darkorange {
			background-color: darkorange;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;	
		}

		.div-darkorchid {
			background-color: darkorchid;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-darkred {
			background-color: darkred;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-darkseagreen {
			background-color: darkseagreen;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-darkslateblue {
			background-color: darkslateblue;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-darkslategray {
			background-color: darkslategray;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-darkturquoise {
			background-color: darkturquoise;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-darkviolet {
			background-color: darkviolet;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-deeppink {
			background-color: deeppink;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-deepskyblue {
			background-color: deepskyblue;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-dimgray {
			background-color: dimgray;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;	
		}

		.div-dodgerblue {
			background-color: dodgerblue;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;	
		}

		.div-firebrick {
			background-color: firebrick;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;		
		}

		.div-silver {
			background-color: silver;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;		
		}

		.div-plum {
			background-color: plum;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;		
		}

		.div-coral {
			background-color: coral;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;		
		}

		.div-yellowgreen {
			background-color: yellowgreen;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;		
		}

		.div-khaki {
			background-color: khaki;
			color: black;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
		}

		.div-sienna {
			background-color: sienna;
			color: white;
			padding: 10px;
			border-radius: 5px;
			font-size: 18px;
			text-align: center;
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

	
// shristi
	import html2canvas from 'html2canvas';

// Function to export the content as an image
const exportToImage = async () => {
  const element = documecdnt.querySelector('.section') as HTMLElement;

  if (element) {
    try {
      const canvas = await html2canvas(element);
      const image = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = image;
      link.download = 'code.png';
      link.click();
    } catch (error) {
      console.error('Failed to export as image: ', error);
    }
  } else {
    console.error('Element not found.');
  }
};

// Function to copy the text content to the clipboard-SHRISTI
 const copyTextToClipboard = () => {
   const element = document.querySelector('.section');

   if (element) {
     const text = element.textContent;

     if (text !== null && text.trim() !== '') {
       navigator.clipboard.writeText(text).then(() => {
         alert('Code copied to clipboard');
       }).catch((error) => {
         console.error('Unable to copy code: ', error);
       });
     } else {
    console.error('Element text is empty.');
     }
   } else {
     console.error('Element not found.');
   }
 };



//shristi 
  // Function to copy the image to the clipboard-SHRISTI
  const copyImageToClipboard = async () => {
     const element = document.querySelector('.dnd-container') as HTMLElement;

     if (element) {
       try {
         const canvas = await html2canvas(element);
         canvas.toBlob((blob) => {
           if (blob) {
             const clipboardItems = [new ClipboardItem({ "image/png": blob })];
             navigator.clipboard.write(clipboardItems).then(() => {
               alert('Code image copied to clipboard');
             }).catch((error) => {
               console.error('Unable to copy code image: ', error);
             });
           } else {
             console.error('Failed to convert canvas to blob.');
           }
         }, 'image/png');
       } catch (error) {
         console.error('Failed to copy image to clipboard: ', error);
       }
     } else {
       console.error('Element not found.');
     }
   };

//  COPY URL TO CLIPBOARD-SHRISTI
   const copyURLToClipboard = () => {
     const currentURL = window.location.href;

     if (currentURL) {
       navigator.clipboard.writeText(currentURL).then(() => {
         alert('URL copied to clipboard');
       }).catch((error) => {
         console.error('Unable to copy URL: ', error);
       });
     } else {
       console.error('URL not found.');
     }
   };



</script>
