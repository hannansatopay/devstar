<script>
	import { onMount, createEventDispatcher } from 'svelte';

	
  
	let content = []; // Change to an array to store multiple contents
	let showEmptyModal = false; // Variable to control the visibility of the empty fields modal
	let showSuccessModal = false; // Variable to control the visibility of the success modal
	let showErrorModal = false; // Variable to control the visibility of the error modal
  
	let contentSectionVisibility = 'display: block;';
	let sharedContentsVisibility = 'display: none;';
	let shareButtonClass = 'nav-btn';
	let showButtonClass = 'nav-btn';
  
	function fetchContents() {
	  // Load shared contents from local storage
	  const storedContents = localStorage.getItem('sharedContents');
	  if (storedContents) {
		content = JSON.parse(storedContents);
		console.log('Fetched contents:', content);
	  }
	}
  
	function toggleContentSectionVisibility() {
	  contentSectionVisibility = 'display: block;';
	  sharedContentsVisibility = 'display: none;';
	  shareButtonClass = 'nav-btn active';
	  showButtonClass = 'nav-btn';
	}
  
	function toggleSharedContentsVisibility() {
	  contentSectionVisibility = 'display: none;';
	  sharedContentsVisibility = 'display: block;';
	  shareButtonClass = 'nav-btn';
	  showButtonClass = 'nav-btn active';
	}
  
	const dispatcher = createEventDispatcher();
  
	onMount(() => {
	  dispatcher('toggleContentSectionVisibility', toggleContentSectionVisibility);
	  dispatcher('toggleSharedContentsVisibility', toggleSharedContentsVisibility);
	  fetchContents();
	});
  
	function shareContent() {
	  // Validate if any field is empty
	  if (!content.category || !content.title || !content.text) {
		showEmptyModal = true; // Display modal if any field is empty
		return; // Exit function early if any field is empty
	  }
  
	  // Create a new content object
	  const newContent = {
		category: content.category,
		tags: content.tags,
		title: content.title,
		text: content.text
	  };
  
	  // Append the new content to the array
	  content.push(newContent);
  
	  // Save updated contents to local storage
	  localStorage.setItem('sharedContents', JSON.stringify(content));
	  console.log('Shared content:', newContent);
  
	  // Show the success modal
	  showSuccessModal = true;
	}
  
	function closeModal() {
	  // Close the empty fields modal, success modal, or error modal
	  showEmptyModal = false;
	  showSuccessModal = false;
	  showErrorModal = false;
	}
  </script>
  
  <style>
	/* Navbar */
	.navbar {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  background-color: #333;
	  color: white;
	  padding: 1rem;
	}
  
	.nav-buttons {
	  display: flex;
	  gap: 1rem;
	}
  
	.nav-btn {
	  background-color: #2c2b2b;
	  color: white;
	  padding: 0.5rem 1rem;
	  border: none;
	  border-radius: 5px;
	  cursor: pointer;
	}
  
	.nav-btn.active {
	  background-color: #1a1a1a;
	}
  
	/* Content Section */
	.content-section {
	  padding: 2rem;
	}
  
	.content-box {
	  background-color: #bde7ea;
	  padding: 1rem;
	  border-radius: 5px;
	}
  
	textarea {
	  width: 100%;
	  min-height: 150px;
	  padding: 0.5rem;
	  border: 1px solid #c099ae;
	  border-radius: 5px;
	  margin: 1rem 0;
	}
  
	.additional-settings {
	  margin-top: 1rem;
	}
  
	select,
	input {
	  width: 100%;
	  padding: 0.5rem;
	  margin: 0.5rem 0;
	  border: 1px solid #ccc;
	  border-radius: 5px;
	}
  
	.share-btn {
	  background-color: #2c2b2b;
	  color: white;
	  padding: 0.5rem 1rem;
	  border: none;
	  border-radius: 5px;
	  cursor: pointer;
	}
  
	/* Shared Contents */
	.shared-contents {
	  padding: 2rem;
	  background-color: #f9f9f9;
	  border-radius: 5px;
	  margin-top: 2rem;
	  display: none;
	}
  
	.shared-contents h2 {
	  margin-bottom: 1rem;
	  color: #333;
	}
  
	.shared-contents .content-box {
	  background-color: #bde7ea;
	  padding: 1rem;
	  border-radius: 5px;
	  margin-bottom: 1rem;
	}
  
	.shared-contents h3 {
	  margin-bottom: 0.5rem;
	  color: #555;
	}
  
	.shared-contents p {
	  margin: 0.5rem 0;
	  color: #777;
	}
  
	/* Modals */
	.modal {
	  position: fixed;
	  top: 0;
	  left: 0;
	  width: 100%;
	  height: 100%;
	  background-color: rgba(0, 0, 0, 0.5);
	  display: none;
	  justify-content: center;
	  align-items: center;
	  z-index: 9999;
	}
  
	.modal-content {
	  background-color: white;
	  padding: 2rem;
	  border-radius: 5px;
	  width: 50%;
	  max-width: 600px;
	  text-align: center;
	  position: relative;
	}
  
	.close {
	  position: absolute;
	  top: 0;
	  right: 0;
	  padding: 0.5rem;
	  cursor: pointer;
	}
  </style>
  
  <main>
	<nav class="navbar">
	  <div class="nav-buttons">
		<button class="{shareButtonClass}" on:click={toggleContentSectionVisibility}>Share Your Content</button>
		<button class="{showButtonClass}" on:click={toggleSharedContentsVisibility}>Show Shared Contents</button>
	  </div>
	</nav>
  
	<section class="content-section" style={contentSectionVisibility}>
	  <h2>Paste your content here</h2>
	  <div class="content-box">
		<textarea bind:value={content.text} placeholder="Enter your content here"></textarea>
		<div class="additional-settings">
		  <h3>Additional settings:</h3>
		  <label for="category">Category:</label>
		  <select id="category" bind:value={content.category}>
			<option value="None">None</option>
			<option value="Technology">Technology</option>
			<option value="Science">Science</option>
			<option value="Entertainment">Entertainment</option>
			<!-- Add more categories here -->
		  </select>
		  <label for="tags">Tags:</label>
		  <input type="text" id="tags" bind:value={content.tags} placeholder="Add tags (comma-separated)" />
		  <label for="title">Name/Title:</label>
		  <input type="text" id="title" bind:value={content.title} placeholder="Add a title" />
		</div>
		<button class="share-btn" on:click={shareContent}>Share Your Content</button>
	  </div>
	</section>
  
	<section class="shared-contents" style={sharedContentsVisibility}>
	  <h2>Shared Contents</h2>
	  {#if content.length > 0}
		{#each content as sharedContent, index}
		  <div class="content-box" id="content-{index}">
			<h3>{sharedContent.title}</h3>
			<p>Category: {sharedContent.category}</p>
			<p>Tags: {sharedContent.tags}</p>
			<p>{sharedContent.text}</p>
		  </div>
		{/each}
	  {:else}
		<p>No shared contents yet.</p>
	  {/if}
	</section>
  
	<!-- Empty Fields Modal -->
	<div class="modal" style="{showEmptyModal ? 'display: flex;' : 'display: none;'}">
	  <div class="modal-content">
		<span class="close" on:click={closeModal}>&times;</span>
		<h2>Please Fill All Fields</h2>
		<p>Please make sure to fill all fields before sharing.</p>
	  </div>
	</div>
  
	<!-- Success Modal -->
	<div class="modal" style="{showSuccessModal ? 'display: flex;' : 'display: none;'}">
	  <div class="modal-content">
		<span class="close" on:click={closeModal}>&times;</span>
		<h2>Sharing Successful</h2>
		{#if content.length > 0}
		  <p>Your content has been successfully shared and stored!</p>
		{:else}
		  <p>Oops! Something went wrong. Your content couldn't be stored.</p>
		{/if}
	  </div>
	</div>
  </main>
  