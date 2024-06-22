<script>
	let content = {
	  category: 'None',
	  tags: '',
	  title: '',
	};
  
	function shareContent() {
	  // Implement the logic for sharing content here
	  console.log('Shared content:', content);
	}
  </script>
  
  <main>
	<nav class="navbar">
	  <img src="content-sharing-tool-logo.png" alt="Content Sharing Tool" class="logo" />
	  <div class="auth-buttons">
		<button class="btn">Login</button>
		<button class="btn">Sign Up</button>
	  </div>
	</nav>
	<section class="content-section">
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
  </main>
  
  <style>
	.navbar {
	  display: flex;
	  justify-content: space-between;
	  align-items: center;
	  background-color: #333;
	  color: white;
	  padding: 1rem;
	}
  
	.logo {
	  width: 100px;
	  height: 100px;
	}
  
	.auth-buttons {
	  display: flex;
	  gap: 1rem;
	}
  
	.btn {
	  background-color: #fff;
	  color: #333;
	  padding: 0.5rem 1rem;
	  border: none;
	  border-radius: 5px;
	  cursor: pointer;
	}
  
	.content-section {
	  padding: 2rem;
	}
  
	.content-box {
	  background-color: #f5f5f5;
	  padding: 1rem;
	  border-radius: 5px;
	}
  
	textarea {
	  width: 100%;
	  min-height: 150px;
	  padding: 0.5rem;
	  border: 1px solid #ccc;
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
	  background-color: #007bff;
	  color: white;
	  padding: 0.5rem 1rem;
	  border: none;
	  border-radius: 5px;
	  cursor: pointer;
	}
  </style>