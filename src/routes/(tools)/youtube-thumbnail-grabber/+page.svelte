<script>
	let youtubeUrl = '';
  	let thumbnailUrl = '';
  	let isValidLink = true;
	let dropdownVisible = false;
	let selectedResolution = 'High'; // Default resolution
  	let thumbnailUrls = {
    	Medium: '',
    	High: '',
    	Maximum: ''
	};
  
	// Toggle dropdown visibility
	function toggleDropdown() {
		const dropdown = document.getElementById('resolutionDropdown');
		const buttonRect = document.getElementById('resolutionBtn').getBoundingClientRect();
		const dropdownHeight = dropdown.offsetHeight;

		// Check if there is enough space below the button
		const spaceBelow = window.innerHeight - buttonRect.bottom;

		if (spaceBelow < dropdownHeight) {
			// Position the dropdown above the button
			dropdown.style.top = `-${dropdownHeight + 10}px`;
		} else {
			// Position the dropdown below the button
			dropdown.style.top = 'calc(100% + 10px)';
		}
		
		dropdownVisible = !dropdownVisible;
	}
  
	// Select resolution
	function selectResolution(resolution) {
  	selectedResolution = resolution;
 	updateThumbnail();
  	dropdownVisible = false;
  	const resolutionBtn = document.getElementById('resolutionBtn');
  	resolutionBtn.textContent = `Select Resolution: ${resolution}`;
  	console.log(`Selected resolution: ${resolution}`);
	}

	// Close dropdown if clicked outside
	document.addEventListener('click', function(event) {
	  const dropdown = document.getElementById('resolutionDropdown');
	  const resolutionBtn = document.getElementById('resolutionBtn');
	  if (!resolutionBtn.contains(event.target) && dropdown && !dropdown.contains(event.target)) {
		dropdownVisible = false;
	  }
	});

	/* Thumbnail display functionality */
  	function handleUrlInput() {
    const videoId = extractVideoId(youtubeUrl);
	const validVideoIdPattern = /^[a-zA-Z0-9_-]{11}$/;

    if (videoId && validVideoIdPattern.test(videoId)) {
      isValidLink = true;
      updateThumbnail();
    } else {
      thumbnailUrl = '';
      thumbnailUrls = { Medium: '', High: '', Maximum: '' };
	  isValidLink = false;
    }
  }
  function extractVideoId(url) {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        if (urlObj.searchParams.has('v')) {
          return urlObj.searchParams.get('v');
        } else {
          throw new Error('Video ID not found in URL');
        }
      } else if (urlObj.hostname === 'youtu.be') {
        return urlObj.pathname.substr(1);
      } else {
        throw new Error('Invalid YouTube URL');
      }
    } catch (error) {
      console.error('Error extracting video ID:', error);
      return null;
    }
  }
  
  // Optional: Clear thumbnail when the URL input is cleared
  $: if (youtubeUrl === '') {
    thumbnailUrl = '';
    thumbnailUrls = { Medium: '', High: '', Maximum: '' };
	isValidLink = true;
  }

	/* Resolution button functionality */
	function updateThumbnail() {
    if (youtubeUrl) {
      const videoId = extractVideoId(youtubeUrl);
      if (videoId) {
        thumbnailUrls = {
          Medium: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          High: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          Maximum: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
        };
        thumbnailUrl = thumbnailUrls[selectedResolution];
      } else {
        thumbnailUrl = '';
        thumbnailUrls = { Medium: '', High: '', Maximum: '' };
      }
    } else {
      thumbnailUrl = '';
      thumbnailUrls = { Medium: '', High: '', Maximum: '' };
    }
  }

	/* Download button functionality */
	function downloadThumbnail() {
	  if (thumbnailUrls[selectedResolution]) {
		window.open(thumbnailUrls[selectedResolution], '_blank');
	  } else {
        alert('No thumbnail available for the selected resolution.');
      }
	}

	/* Invalid URL display functionality */
	function validateAndSubmit() {
		if (!youtubeUrl || !extractVideoId(youtubeUrl)) {
			isValidLink = false;
			alert('Please provide a valid YouTube link');
		} else {
			handleUrlInput();
			if (isValidLink) {
				downloadThumbnail(); // Only download if the link is valid
			}
		}
  	}

</script>

<style>
	body {
	  font-family: Arial, sans-serif;
	  margin: 0;
	  padding: 0;
	  display: flex;
	  flex-direction: column;
	  min-height: 100vh;
	}
	.card {
	  margin: 20px;
	  max-width: 100%;
	  display: flex;
	  justify-content: center;
	}
	.container {
	  flex: 1;
	  max-width: 800px;
	  margin: 20px auto;
	  padding: 20px;
	  background-color: #f0f0f0;
	  box-shadow: 0 0 10px rgba(0,0,0,0.1);
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  text-align: center;
	}
	.form-group {
	  margin-bottom: 15px;
	  display: flex;
	  flex-direction: column;
	  align-items: center;
	  text-align: center;
	}
	.preview-label, .form-group label {
	  text-align: left;
	  font-weight: bold;
	  font-size: 18px;
	  margin-bottom: 5px;
	  margin-left: 20px;
	}
	.form-group .url-input {
	  width: 600px;
	  padding: 8px;
	  border: 1px solid #ccc;
	  border-radius: 4px;
	  box-sizing: border-box;
	}
	.resolution-container {
	  position: relative;
	  display: inline-block;
	  margin-bottom: 15px;
	}
	.button {
	  padding: 10px 20px;
	  font-size: 14px;
	  font-weight: medium;
	  color: white;
	  background-color: #007bff;
	  border: none;
	  border-radius: 8px;
	  cursor: pointer;
	  outline: none;
	  transition: background-color 0.3s ease;
	}
	.button:hover {
	  background-color: #0056b3;
	}
	.button:focus {
	  outline: none;
	  box-shadow: 0 0 0 2px #007bff;
	}    
	.resolution-dropdown {
	  position: absolute;
	  top: calc(100% + 10px);
	  left: 0;
	  background-color: #fff;
	  box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.2);
	  z-index: 1;
	  display: none;
	  padding: 10px;
	  border-radius: 4px;
	}
	.resolution-dropdown.visible {
	  display: block;
	}
	.resolution-dropdown button {
	  width: 100%;
	  padding: 0;
	  text-align: left;
	  background-color: #fff;
	  border: none;
	  cursor: pointer;
	  transition: background-color 0.3s ease;
	}
	.resolution-dropdown button:hover {
	  background-color: #f0f0f0;
	}
	.preview-container {
   	  position: relative;
   	  width: 600px;
   	  height: 300px;
   	  border: 1px solid #ccc;
   	  padding: 10px;
   	  border-radius: 4px;
   	  background-color: white;
   	  margin-bottom: 20px;
   	  overflow: hidden;
   	  box-sizing: border-box;
   	  display: flex;
	  justify-content: center;
   	  align-items: center;
  	}
	.preview-container img {
	  max-width: 100%;
	  max-height: 100%;
	  height: auto;
	}
	.watermark {
	  position: absolute;
	  top: 50%;
	  left: 50%;
	  transform: translate(-50%, -50%);
	  font-size: 24px;
	  font-weight: bold;
	  color: rgba(0, 0, 0, 0.3);
	}
	.url-container {
	  width: 600px;
	  display: flex;
	  align-items: center;
	  justify-content: space-between;
	  position: relative;
	} 
	.invalid-link-message {
      color: red;
      font-size: 18px;
      font-weight: bold;
  	}
</style>
  
<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
	<div class="container">
	  <!-- Form Group for URL Input -->
	  <div class="form-group">
		<label for="urlInput">Enter YouTube URL:</label>
		<div class="url-container">
			<input type="text" id="urlInput" bind:value={youtubeUrl} on:input={handleUrlInput} placeholder="https://www.youtube.com/watch?v=..." class="url-input">
		</div>
	  </div>
  
	  <!-- Preview Container and Label -->
	  <div class="preview-label">Preview:</div>
	  <div class="preview-container" id="imagePreview">
		{#if thumbnailUrl}
		  <img src={thumbnailUrl} alt="Thumbnail Preview" />
		{:else if (!isValidLink && youtubeUrl !== '')}
			<span class="invalid-link-message">Please provide a valid YouTube link</span>
		{:else}
		  <span class="watermark">Thumbnail Preview</span>
		{/if}
	  </div>
  
	  <!-- Resolution Selection -->
	  <div class="form-group">
		<div class="resolution-container">
		  <button id="resolutionBtn" class="button" type="button" on:click={toggleDropdown}>
			Select Resolution: {selectedResolution}
		  </button>
		  <div id="resolutionDropdown" class="resolution-dropdown {dropdownVisible ? 'visible' : ''}">
			<button type="button" on:click={() => selectResolution('Medium')}>Medium</button>
			<button type="button" on:click={() => selectResolution('High')}>High</button>
			<button type="button" on:click={() => selectResolution('Maximum')}>Maximum</button>
		  </div>
		</div>
	  </div>
  
	  <!-- Download Button -->
	  <button class="button" type="button" on:click={validateAndSubmit}>Download Thumbnail</button>
	</div>
</div>