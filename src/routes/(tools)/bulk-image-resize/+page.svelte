<script>
	import { P } from "flowbite-svelte";

  // import Counter from './Counter.svelte';
  let activeDiv = "Percentage";
  let selectedImage =[];
  let file;
  let imageSelected = true;
  let selectedFormat = "jpeg";
  let resizedImage;
  let resizePercentage = 50;
  let imageQuality = 70;
  let isvlue = false;
  let resizeWidth = 500;
  let resizeHeight = 500;
  let resizeLongSide = 500;
  let resizeDimensionsWidth = 500;
  let resizeDimensionsHeight = 500;
  let state1 = false;
  let isDownload = false;
  let fileSizeKbBefor = 0;
  let fileSizeKbAfter;
  let backFile = false;
  const formats = ["jpeg", "png", "webp"];

  //====================
  function handleChange(event) {
    selectedFormat = event.target.value;
  }

  //===========choose image function==========
  const handleImageSelect = (event) => {
    imageSelected = false;
    isvlue = true;
    
    selectedImage = Array.from(event.target.files);

    selectedImage.forEach((file, i) => {
      
     fileSizeKbBefor += (selectedImage[i].size / 1024);
         
         });

   
    // fileSizeKbBefor = file.size / 1024;
  };

  //======= Function to switch the active div================
  function switchDiv(divId) {
    activeDiv = divId;
  }
  //=========== percenta Function logic =========

  const percentaFunction = async () => {
    isDownload = true;
    isvlue = false;

    if (selectedImage.length === 0) {
          return;
      }
      let zip = new JSZip();


      selectedImage.forEach((file, i) => {
        console.log('i value '+ i + "file"+file);
    
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          const scaleFactor = resizePercentage / 100;
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scaleFactor;
          canvas.height = img.height * scaleFactor;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
         const resizedImage = canvas.toDataURL(
            "image/jpeg",
            imageQuality / 100
          );

          zip.file(`resized_image_${i}.`+selectedFormat, dataURItoBlob(resizedImage));
          if (i === selectedImage.length -1) {
                    console.log("manis"+selectedImage.length);
                      zip.generateAsync({ type: 'blob' }).then((content) => {
                          saveAs(content, "bulk_resize_.zip");
                      });
                  }
          
        };
      };
      reader.readAsDataURL(file);
     
      });
    };

  //=========== Image Dimensions function =========

  const imageDimFunctioin = async () => {
    isDownload = true;
    isvlue = false;

    if (selectedImage.length === 0) {
          return;
      }
      let zip = new JSZip();


      selectedImage.forEach((file, i) => {
        console.log('i value '+ i + "file"+file);
    
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          const scaleFactor = resizeDimensionsWidth / img.width;
          const canvas = document.createElement("canvas");
          canvas.width = resizeDimensionsWidth;
            canvas.height = resizeDimensionsHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
         const resizedImage = canvas.toDataURL(
            "image/jpeg",
            imageQuality / 100
          );

          zip.file(`resized_image_${i}.`+selectedFormat, dataURItoBlob(resizedImage));
          if (i === selectedImage.length -1) {
                    console.log("manis"+selectedImage.length);
                      zip.generateAsync({ type: 'blob' }).then((content) => {
                          saveAs(content, "bulk_resize_.zip");
                      });
                  }
          
        };
      };
      reader.readAsDataURL(file);
     
      });

    
  };

  //============Width functjion =============

  const widthFunction = async () => {
    isDownload = true;
    isvlue = false;

    if (selectedImage.length === 0) {
          return;
      }
      let zip = new JSZip();


      selectedImage.forEach((file, i) => {
        console.log('i value '+ i + "file"+file);
    
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          const scaleFactor = resizeWidth / img.width;
          const canvas = document.createElement("canvas");
          canvas.width = resizeWidth;
            canvas.height = img.height * scaleFactor;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
         const resizedImage = canvas.toDataURL(
            "image/jpeg",
            imageQuality / 100
          );

          zip.file(`resized_image_${i}.`+selectedFormat, dataURItoBlob(resizedImage));
          if (i === selectedImage.length -1) {
                    console.log("manis"+selectedImage.length);
                      zip.generateAsync({ type: 'blob' }).then((content) => {
                          saveAs(content, "bulk_resize_.zip");
                      });
                  }
          
        };
      };
      reader.readAsDataURL(file);
     
      });
   
  };
  //================Height Function=============

  const heightFunction = async () => {
    isDownload = true;
    isvlue = false;

   
    if (selectedImage.length === 0) {
          return;
      }
      let zip = new JSZip();


      selectedImage.forEach((file, i) => {
        console.log('i value '+ i + "file"+file);
    
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          const scaleFactor = resizeHeight / img.height;
          const canvas = document.createElement("canvas");
          canvas.width = img.width * scaleFactor;
            canvas.height = resizeHeight;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
         const resizedImage = canvas.toDataURL(
            "image/jpeg",
            imageQuality / 100
          );

          zip.file(`resized_image_${i}.`+selectedFormat, dataURItoBlob(resizedImage));
          if (i === selectedImage.length -1) {
                    console.log("manis"+selectedImage.length);
                      zip.generateAsync({ type: 'blob' }).then((content) => {
                          saveAs(content, "bulk_resize_.zip");
                      });
                  }
          
        };
      };
      reader.readAsDataURL(file);
     
      });
  };


  // ===========longest Side function ===========
  const longSideFunction = async () => {
    isDownload = true;
    isvlue = false;

    if (selectedImage.length === 0) {
          return;
      }
      let zip = new JSZip();


      selectedImage.forEach((file, i) => {
        console.log('i value '+ i + "file"+file);
    
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.src = reader.result;

        img.onload = () => {
          const scaleFactorW = resizeLongSide / img.width;
            const scaleFactorH = resizeLongSide / img.height;
          const canvas = document.createElement("canvas");
         
          if (img.width > img.height) {
              canvas.width = resizeLongSide;
              canvas.height = scaleFactorW * img.height;
            } else {
              canvas.height = resizeLongSide;
              canvas.width = scaleFactorH * img.width;
            }

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
         const resizedImage = canvas.toDataURL(
            "image/jpeg",
            imageQuality / 100
          );

          zip.file(`resized_image_${i}.`+selectedFormat, dataURItoBlob(resizedImage));
          if (i === selectedImage.length -1) {
                    console.log("manis"+selectedImage.length);
                      zip.generateAsync({ type: 'blob' }).then((content) => {
                          saveAs(content, "bulk_resize_.zip");
                      });
                  }
          
        };
      };
      reader.readAsDataURL(file);
     
      });
  };

  


  function dataURItoBlob(dataURI) {
      const byteString = atob(dataURI.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
      }
      return new Blob([ab], { type: 'image/jpeg' });
  }

 
  // ========on delete item======
  const deltetImage = () => {
    imageSelected = true;
    isvlue = false;
    fileSizeKbBefor = 0;
    
  };

  const backMenu =()=>{
    imageSelected = true;
    isvlue = false;
    backFile = true;
    fileSizeKbBefor = 0;
  }

  // ==========on back press =============
  const BackPage = () => {
    isvlue = true;
    isDownload = false;
    
     
  };

  const deleteFile = ()=> {
    backFile = false;
    fileSizeKbBefor = 0;
  }

</script>

{#if imageSelected}
  <div>
    <!-- for Heading container Box  -->
    <center>
      <div class="Heading_container">
        <center>
          <h2>Bulk Resize Images</h2>
        </center>
      </div>

      <!-- for get a padding  -->
      <br /><br />
      {#if backFile }
      <h3 class = "h2">Select File(1)</h3>
     
      {#each selectedImage as file }
      <div class="backshowfile">
        <p class="fileName">{file.name}</p>
        <p class="filekb">{(file.size/1024).toFixed(1)} Kb</p>
        <button class="deleteFile" on:click={deleteFile}>Delete</button>
      </div>
    {/each}


      {/if}
    
      <br /><br />
      <br /><br />

       


      <!-- Drop image here or image choose  -->
      <div class="drop_image">
        <p>Drop images here <br /> or</p>
 
        <div>
          <input
            class=" chooseImage"
            id="imageInput"
            type="file"
            accept="image/*"
            multiple
            on:change={handleImageSelect}
          />
          <label class="inputValue" for="imageInput">Choose Images</label>
        </div>
      </div>
    </center>
  </div>
{/if}

{#if isvlue}
  <!-- for Heading container Box  -->
  <center>
    <div class="Heading_container1">
      <center>
        <h3>Bulk Resize Images</h3>
      </center>
    </div>
  </center>

  <div class="row">
    <div class="column">
      <!-- Navigation bar for controlling all page  -->
      <nav>
        <ul>
          <button class="Choose_file" on:click={() => switchDiv("Percentage")}
            >Percentage</button
          ><br />
          <button class="Choose_file" on:click={() => switchDiv("FileSize")}
            >File Size</button
          ><br />
          <button
            class="Choose_file"
            on:click={() => switchDiv("ImageDimensions")}
            >Image Dimensions</button
          ><br />
          <button class="Choose_file" on:click={() => switchDiv("WidthDiv")}
            >Width</button
          ><br />
          <button class="Choose_file" on:click={() => switchDiv("HeightDiv")}>
            Height</button
          ><br />
          <button class="Choose_file" on:click={() => switchDiv("LongestSide")}
            >Longest Side</button
          >
          <div class="row">
            <div class="column2">
              <button class="Choose_file1" on:click={() => backMenu()}
                >Back</button
              >
            </div>
            <div class="column2">
              <button class="Choose_file1" on:click={() => deltetImage()}
                >Delete</button
              >
            </div>
          </div>
        </ul>
      </nav>
    </div>

    {#if activeDiv == "Percentage"}
      <div id="Percentage">
        <!-- Name of page  -->
        <h1 class="percentage"><u>Percentage</u></h1>

        <div class="column1">
          <p class="p1">
            Scale images to <input
              class="input1"
              type="number"
              bind:value={resizePercentage}
              min="1"
              max="100"
            /> % of the original dimensions.
          </p>

          <div class="row">
            <div class="column">
              <p class="p2">Image Format</p>
              <select
                class="select"
                bind:value={selectedFormat}
                on:change={handleChange}
              >
                {#each formats as format}
                  <option value={format}>{format}</option>
                {/each}
              </select>
            </div>

            {#if selectedFormat !== "png"}
              <div>
                <p class="p3">Image Quality</p>
                <div class="slidecontainer">
                  <input
                    class="slider"
                    type="range"
                    bind:value={imageQuality}
                    min="1"
                    max="100"
                    step="1"
                  />
                  <span>{imageQuality}%</span>
                </div>
              </div>
            {/if}
          </div>

          <p class="p2">Image Background</p>
          <form style="margin-left: 50px;">
            <input type="color" id="favcolor" name="favcolor" value="#ff0000" />
            <label for="favcolor" style="font-size: 20px;">color</label>
          </form>

          {#if selectedImage}
            <center>
              <!-- <img   src={selectedImage} alt="Selected Image" /> -->
              <button type="button" class="bn" on:click={percentaFunction}
                >Start</button
              >
            </center>
          {/if}
        </div>
      </div>
    {/if}

    {#if activeDiv == "FileSize"}
      <div id="FileSize">
        <h1 class="percentage"><u>File Size</u></h1>

        <div class="column1">
          <p class="p4">Images will be resized to 97.7 kB or less.</p>

          <div class="slidecontainerfilesize">
            <input
              type="range"
              min="1"
              max="100"
              value="50"
              class="slider"
              id="myRange"
            />
            <p>Value: <span id="demo" /></p>
          </div>

          <div class="row">
            <div class="column">
              <p class="p2">Image Format</p>
              <!-- select image formate  -->
              <form>
                <select class="select">
                  <option value="JPEG">JPEG</option>
                  <option value="PNG">PNG</option>
                  <option value="WEBP">WEBP</option>
                </select>
              </form>
            </div>
            <div>
              <p class="p3">Image Quality</p>

              <div class="slidecontainer">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value="50"
                  class="slider"
                  id="myRange"
                />
                <p>Value: <span id="demo" /></p>
              </div>
            </div>
          </div>

          <p class="p2">Image Background</p>
          <form style="margin-left: 30px;">
            <input type="color" id="favcolor" name="favcolor" value="#ff0000" />
            <label for="favcolor" style="font-size: 20px;">color</label>
          </form>
        </div>
      </div>
    {/if}

    {#if activeDiv == "ImageDimensions"}
      <div id="ImageDimensions">
        <h1 class="percentage"><u> Image Dimensions</u></h1>

        <div class="column1">
          <p class="p1">
            Make images <input
              class="input1"
              type="number"
              bind:value={resizeDimensionsWidth}
              min="1"
            />
            x
            <input
              class="input1"
              type="number"
              bind:value={resizeDimensionsHeight}
              min="1"
            /> (Width × Height)
          </p>

          <label style="margin-left: 30px ; font-size: 12px;">
            <input type="checkbox" bind:checked={state1} />
            Use padding to avoid stretching or squashing images.
          </label>

          <div class="row">
            <div class="column">
              <p class="p2">Image Format</p>
              <select
                class="select"
                bind:value={selectedFormat}
                on:change={handleChange}
              >
                {#each formats as format}
                  <option value={format}>{format}</option>
                {/each}
              </select>
            </div>
            {#if selectedFormat !== "png"}
              <div>
                <p class="p3">Image Quality</p>
                <div class="slidecontainer">
                  <input
                    class="slider"
                    type="range"
                    bind:value={imageQuality}
                    min="1"
                    max="100"
                    step="1"
                  />
                  <span>{imageQuality}%</span>
                </div>
              </div>
            {/if}
          </div>

          <p class="p2">Image Background</p>
          <form style="margin-left: 50px;">
            <input type="color" id="favcolor" name="favcolor" value="#ff0000" />
            <label for="favcolor" style="font-size: 20px;">color</label>
          </form>

          {#if selectedImage}
            <center>
              <!-- <img   src={selectedImage} alt="Selected Image" /> -->
              <button type="button" class="bn" on:click={imageDimFunctioin}
                >Start</button
              >
            </center>
          {/if}
        </div>
      </div>
    {/if}

    {#if activeDiv == "WidthDiv"}
      <div id="WidthDiv">
        <h1 class="percentage"><u>Width</u></h1>
        <div class="column1">
          <p class="p1">
            Make the width of images <input
              class="input1"
              type="number"
              bind:value={resizeWidth}
              min="1"
            /> pixels.
          </p>

          <div class="row">
            <div class="column">
              <p class="p2">Image Format</p>
              <select
                class="select"
                bind:value={selectedFormat}
                on:change={handleChange}
              >
                {#each formats as format}
                  <option value={format}>{format}</option>
                {/each}
              </select>
            </div>
            {#if selectedFormat !== "png"}
              <div>
                <p class="p3">Image Quality</p>
                <div class="slidecontainer">
                  <input
                    class="slider"
                    type="range"
                    bind:value={imageQuality}
                    min="1"
                    max="100"
                    step="1"
                  />
                  <span>{imageQuality}%</span>
                </div>
              </div>
            {/if}
          </div>

          <p class="p2">Image Background</p>
          <form style="margin-left: 50px;">
            <input type="color" id="favcolor" name="favcolor" value="#ff0000" />
            <label for="favcolor" style="font-size: 20px;">color</label>
          </form>

          {#if selectedImage}
            <center>
              <!-- <img   src={selectedImage} alt="Selected Image" /> -->
              <button type="button" class="bn" on:click={widthFunction}
                >Start</button
              >
            </center>
          {/if}
        </div>
      </div>
    {/if}

    {#if activeDiv == "HeightDiv"}
      <div id="HeightDiv">
        <h1 class="percentage"><u>Height</u></h1>

        <div class="column1">
          <p class="p1">
            Make the height of images <input
              class="input1"
              type="number"
              bind:value={resizeHeight}
              min="1"
            /> pixels.
          </p>

          <div class="row">
            <div class="column">
              <p class="p2">Image Format</p>
              <select
                class="select"
                bind:value={selectedFormat}
                on:change={handleChange}
              >
                {#each formats as format}
                  <option value={format}>{format}</option>
                {/each}
              </select>
            </div>
            {#if selectedFormat !== "png"}
              <div>
                <p class="p3">Image Quality</p>
                <div class="slidecontainer">
                  <input
                    class="slider"
                    type="range"
                    bind:value={imageQuality}
                    min="1"
                    max="100"
                    step="1"
                  />
                  <span>{imageQuality}%</span>
                </div>
              </div>
            {/if}
          </div>

          <p class="p2">Image Background</p>
          <form style="margin-left: 50px;">
            <input type="color" id="favcolor" name="favcolor" value="#ff0000" />
            <label for="favcolor" style="font-size: 20px;">color</label>
          </form>

          {#if selectedImage}
            <center>
              <!-- <img   src={selectedImage} alt="Selected Image" /> -->
              <button type="button" class="bn" on:click={heightFunction}
                >Start</button
              >
            </center>
          {/if}
        </div>
      </div>
    {/if}

    {#if activeDiv == "LongestSide"}
      <div id="LongestSide">
        <h1 class="percentage"><u>Longest Side</u></h1>

        <div class="column1">
          <p class="p1">
            Make the longest side of images <input
              class="input1"
              type="number"
              bind:value={resizeLongSide}
              min="1"
            /> pixels.
          </p>

          <div class="row">
            <div class="column">
              <p class="p2">Image Format</p>
              <select
                class="select"
                bind:value={selectedFormat}
                on:change={handleChange}
              >
                {#each formats as format}
                  <option value={format}>{format}</option>
                {/each}
              </select>
            </div>
            {#if selectedFormat !== "png"}
              <div>
                <p class="p3">Image Quality</p>
                <div class="slidecontainer">
                  <input
                    class="slider"
                    type="range"
                    bind:value={imageQuality}
                    min="1"
                    max="100"
                    step="1"
                  />
                  <span>{imageQuality}%</span>
                </div>
              </div>
            {/if}
          </div>

          <p class="p2">Image Background</p>
          <form style="margin-left: 50px;">
            <input type="color" id="favcolor" name="favcolor" value="#ff0000" />
            <label for="favcolor" style="font-size: 20px;">color</label>
          </form>

          {#if selectedImage}
            <center>
              <!-- <img   src={selectedImage} alt="Selected Image" /> -->
              <button type="button" class="bn" on:click={longSideFunction}
                >Start</button
              >
            </center>
          {/if}
        </div>
      </div>
    {/if}
  </div>
{/if}

{#if isDownload}
  <center>
    <div class="Heading_container">
      <center>
        <h2>Bulk Resize Images</h2>
      </center>
    </div>
  </center>

  <center>
    <div class="complete">Completed</div>
    {#if activeDiv == "Percentage"}
    <button type="button" class="download" on:click={percentaFunction}
    >Download
  </button>
    {/if}

    {#if activeDiv == "ImageDimensions"}
    <button type="button" class="download" on:click={imageDimFunctioin}
    >Download
  </button>
    {/if}

    {#if activeDiv == "WidthDiv"}
    <button type="button" class="download" on:click={widthFunction}
    >Download
  </button>
    {/if}

    {#if activeDiv == "HeightDiv"}
    <button type="button" class="download" on:click={heightFunction}
    >Download
  </button>
    {/if}

    {#if activeDiv == "LongestSide"}
    <button type="button" class="download" on:click={longSideFunction}
    >Download
  </button>
    {/if}
    <div class="rowdown">
      <div>
        <div class="before">Before</div>
        <div class="kb"> {fileSizeKbBefor.toFixed(1)}Kb</div>
      </div>

      <div>
        <div class="after">After</div>
      </div>
    </div>
    <p class="result">
      You can find the result images in the Downloads folder.
    </p>

    <button class="back" on:click={() => BackPage()}>Back</button>
  </center>
{/if}

<!-- CSS style section -->

<style>
  .chooseImage {
    display: none;
  }
  h1 {
    width: 100%;
  }

 
  h2 {
    font-size: 30px;
  }

  /* drop image container style */
  .drop_image {
    pointer-events: auto;
    height: 250px;
    width: 1200px;
    background-color: #edf1f5;
    border-radius: 8px;
    display: inline-table;
    box-shadow: 0 8px 6px -6px rgb(36, 35, 35);
    align-content: center;
    justify-content: center;
    align-items: center;
    
    font-size: 28px;
    padding-top: 1%;
  }

  /* choose button style */
  .inputValue {
    height: 20%;
    width: 20%;
    font-size: medium;
    color: white;
    font-weight: 700;

    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 15px;
    gap: 15px;
    background-color: #181717;
    outline: 3px #181717 solid;
    outline-offset: -3px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    transition: 400ms;
  }

  .bn {
    height: 35px;
    width: 100%;
    font-size: 20px;
    
    color: white;
    font-weight: 700;
    margin-top: 70px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 15px;
    gap: 15px;
    background-color: #181717;
    outline: 3px #181717 solid;
    outline-offset: -3px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    transition: 400ms;
  }

  .slidecontainer {
    padding-left: 70px;
    width: 400px;
  }

  .slider {
    width: 100%;
    height: 10px;
    border-radius: 5px;
    background: #d3d3d3;
    outline: none;
    opacity: 0.7;
    -webkit-transition: 0.2s;
    transition: opacity 0.2s;
  }

  .slider:hover {
    opacity: 1;
  }

  .slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 23px;
    height: 24px;
    border: 0;
    background: url("contrasticon.png");
    cursor: pointer;
  }

  .slider::-moz-range-thumb {
    width: 23px;
    height: 24px;
    border: 0;
    background: url("contrasticon.png");
    cursor: pointer;
  }

  .select {
    height: 40px;
    width: 150px;
    margin-left: 30px;
    font-size: 18px;
    border-radius: 5px;
    margin-bottom: 20px;
  }

  .p2 {
    font-size: 20px;
    margin-left: 30px;
   margin-top: 30px;
    
  }
  .p3 {
    font-size: 20px;
    padding-left: 70px;
    margin-top: 30px;
  }

  .input1 {
    height: 23px;
    width: 80px;
    border-radius: 5px;
  }

  .p1 {
    font-size: 18px;
    margin-left: 30px;
    margin-top: 40px;
  }

  .row {
    display: flex;
  }

  /* Create two equal columns that sits next to each other */
  .column {
    font-size: 0;
    padding: 10px;
    height: 100px; /* Should be removed. Only for demonstration */
  }

  .column1 {
    flex: 50%;
    padding: 10px;
    padding-left: 100px;
    height: 400px; /* Should be removed. Only for demonstration */
  }

  .column2 {
    flex: 50%;
    padding: 3px;
    height: 400px; /* Should be removed. Only for demonstration */
  }
  /* heading Style */
  .Heading_container {
    /* border: 2px solid red; */
    height: 50px;
    width: 350px;

    display: flex;
    justify-content: center;
    align-items: center;
    align-content: flex-end;
    background-color: #edf1f5;
    border-radius: 8px;
    /* box-shadow: 0px 20px 50px grey  ; */
    box-shadow: 0 8px 6px -6px rgb(36, 35, 35);
    /* object-fit: ; */
    font-size: 20px;
  }
   /* heading Style */
   .Heading_container1 {
    /* border: 2px solid red; */
    height: 40px;
    width:250px;
margin-bottom: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
    align-content: flex-end;
    background-color: #edf1f5;
    border-radius: 8px;
    /* box-shadow: 0px 20px 50px grey  ; */
    box-shadow: 0 8px 6px -6px rgb(36, 35, 35);
    /* object-fit: ; */
    font-size: 20px;
  }

  .percentage {
    padding-left:80px;
    font-size: 25px;
                        
  }

  .Choose_file1 {
    height: 50px;
    width: 100px;
    margin-bottom: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* align-content: flex-end; */
    background-color: #d1d7dc;
    border-radius: 8px;
    /* box-shadow: 0px 20px 50px grey  ; */

    /* object-fit: ; */
    font-size: 20px;
  }

  /* Change the link color on hover */
  .Choose_file1 :hover {
    height: 50px;
    width: 100px;
    margin-bottom: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* align-content: flex-end; */
    background-color: #000000;
    border-radius: 8px;
    /* box-shadow: 0px 20px 50px grey  ; */

    /* object-fit: ; */
    font-size: 20px;
  }

  .Choose_file {
    height: 50px;
    width: 200px;
    margin-bottom: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* align-content: flex-end; */
    background-color: #d1d7dc;
    border-radius: 8px;
    /* box-shadow: 0px 20px 50px grey  ; */

    /* object-fit: ; */
    font-size: 20px;
  }

  /* Change the link color on hover */
  .Choose_file :hover {
    height: 50px;
    width: 200px;
    margin-bottom: 5px;
    display: flex;
    justify-content: center;
    align-items: center;
    /* align-content: flex-end; */
    background-color: #000000;
    border-radius: 8px;
    /* box-shadow: 0px 20px 50px grey  ; */

    /* object-fit: ; */
    font-size: 20px;
  }

  ul {
    margin: 0;
    padding: 0;
  
    width: 200px;
  }

  .complete {
    margin-top: 100px;

    width: 1000px;
    height: 25px;
    color: black;
    background-color: rgb(38, 228, 117);
    align-items: center;
    border-radius: 50px;
  }

  .download {
    height: 15%;
    width: 20%;
    font-size: medium;
    color: white;
    font-weight: 700;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 15px;
    gap: 15px;
    background-color: #181717;
    outline: 3px #181717 solid;
    outline-offset: -3px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    transition: 400ms;
    margin-top: 20px;
  }
  .rowdown {
    margin-top: 60px;
    display: inline-flex;
  }
  .before {
    width: 80px;
    height: 15px;
    background-color: rgb(77, 226, 226);
    padding: 10px;
    align-items: center;
    text-align: center;
    justify-content: center;
    display: flex;
    border-radius: 50px;
    margin-right: 600px;
    margin-bottom: 5px;
  }
  .after {
    width: 80px;
    height: 15px;
    background-color: rgb(77, 226, 226);
    padding: 10px;
    align-items: center;
    text-align: center;
    justify-content: center;
    display: flex;
    border-radius: 50px;
    margin-bottom: 5px;
  }
  .result {
    margin-top: 120px;
  }
  .kb {
    margin-right: 600px;
  }

  .back {
    height: 25px;
    width: 80px;
    font-size: small;
    color: white;
    font-weight: 700;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 10px 15px;
    gap: 15px;
    background-color: #181717;
    outline: 3px #181717 solid;
    outline-offset: -3px;
    border-radius: 5px;
    border: none;
    cursor: pointer;
    transition: 400ms;
    margin-top: 20px;
  }

  .h2{
    margin-right: 900px;
    
  }
  .backshowfile{
    width: 1000px;
    height: 40px;
    display: inline-flex;
    background-color: antiquewhite;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
    margin-bottom: 4px;
  }
  .fileName{
    margin-right: 300px;
  }
  .filekb{
    margin-right: 300px;
  }
  .deleteFile{
    width: 80px;
    height: 25px;
    background-color: red;
    border-radius: 50px;
    color: white;
    align-items: center;
    justify-content: center;
    display: flex;
    
  }
  
</style>
