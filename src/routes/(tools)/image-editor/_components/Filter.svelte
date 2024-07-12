<script>

</script>

<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
	<!-- Add tool here -->
</div>

<div id="main-container">
<div  class="container text-white">
    <canvas class="canvas-container text-white"></canvas>
</div>
<div class="button-container">
<button id="filter-button" class=" btn text-white bg-purple-700 hover:bg-yellow-800 font-medium rounded-lg text-sm px-5 py-2.5">Filters</button>

    <button id="share-button" type="submit" class=" btn text-white bg-green-700 hover:bg-purple-800 font-medium rounded-lg text-sm px-5 py-2.5">Save</button>

<button id="discard-button" class=" btn text-white bg-red-700 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5">Discard</button>
<button class="ml-8 btn"><a id="download" download>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" width="20px" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
    <span>Download</span>
</a></button>

</div>

</div>
<div id="filter-panel" class="filter-panel">
    <button id="close-filter-panel" class="close-filter-panel">Close</button>
    <button id="back-to-categories" class="back-button">Back</button>
    <div id="filters-container">
    </div>
</div>
<div id="effect-panel" class="filter-panel">
    <button id="close-effect-panel" class="close-filter-panel">Close</button>
    <button id="back-to-categories-effect" class="back-button">Back</button>
    <div id="effects-container">
        <!-- Effect categories will be appended here -->
    </div>
</div>

<div id="myModal" class="modal">
    <div class="modal-content">
        <span class="close1">&times;</span>
        <p>Your changes have been saved successfully!</p>
    </div>
</div>

<div id="myModal" class="modal">
    <div class="modal-content">
        <span class="close1">&times;</span>
        <p>Your changes have been saved successfully!</p>
    </div>
</div>

<main>
<style>
.modal {
    display: none; 
    position: fixed; 
    z-index: 1; 
    left: 0;
    top: 0;
    width: 100%; 
    height: 100%; 
    overflow: auto; 
    background-color: rgb(0,0,0); 
    background-color: rgba(0,0,0,0.4); 
    padding-top: 60px;
}

/* Modal Content */
.modal-content {
    background-color: #fefefe;
    margin: 5% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%; 
}

/* The Close Button */
.close1 {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
}

.close1:hover,
.close1:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
}

.button-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin: 20px 0;
}

.button {
  transition: background-color 0.3s ease;
}

.button svg {
  margin-right: 5px;
}

.ml-8 {
  margin-left: 20px;
}
#download, 
button,  
input::-webkit-file-upload-button {
    font-weight: 600;
    font-size: 1rem; 
    font-family: inherit;  
    border: none; 
    text-decoration: none;
    line-height: 1; 
    text-align: center;
    cursor: pointer; 
    transition: all 0.2s linear; 
    color: #FFF;
    box-shadow: var(--shadow);
}
#reset,
#download, 
input::-webkit-file-upload-button {
    padding: 1em 1.5em;
    border: 1px solid #FFF; 
    background-color: var(--neutral); 
}
#download {
display: flex; 
justify-content: center;
align-items: center;
gap: 0.5rem;
}
 #reset:hover,  
#download:hover, 
input::-webkit-file-upload-button:hover {
    border: 1px solid var(--orange); 
    background-color: var(--orange);
}
.canvas-container {
    width: 100%;
    max-width: 500px; /* Adjust as needed */
    border: 1px solid #ddd;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 20px;
}
canvas {
    width: 100%;
    height: auto;
}
.filter-panel {
    position: fixed;
    top: 0;
    left: -300px; /* Adjusted to slide from left */
    width: 300px;
    height: 100%;
    background-color: #1e2839; /* Dark blue background */
    border-right: 1px solid #ddd;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    transition: left 0.3s ease-in-out;
    overflow-y: auto;
    z-index: 1000;
    padding: 20px;
    color: #fff; /* White text */
}
.filter-panel.open {
    left: 0;
}
.close-filter-panel,
.back-button,
.filter-category,
.filter-preview {
    color: #fff; /* White text */
    cursor: pointer;
}
.close-filter-panel:hover,
    .back-button:hover,
    .filter-category:hover,
    .filter-preview:hover {
        color: #ccc; /* Light gray text on hover */
    }
    .close-filter-panel {
        display: block;
        margin-bottom: 20px;
    }
    .back-button {
        position: absolute;
        top: 20px;
        right: 20px;
        cursor: pointer;
        color: #007bff; /* Bootstrap's primary color */
    }
    .filter-category {
        margin-bottom: 10px;
        cursor: pointer;
    }
    .filter-category:hover {
        background-color: #2980b9; /* Darker blue on hover */
    }
    .filter-category.selected {
        font-weight: bold;
    }
    .filter-preview {
        margin-bottom: 20px;
        cursor: pointer;
    }
    .filter-preview:hover {
        background-color: #27ae60; /* Darker green on hover */
    }
    .filter-preview img {
        width: 100%;
        height: auto;
    }
    .filter-preview.selected {
        border: 2px solid #000;
    }
    .back-button:hover {
        background-color: #c0392b; /* Darker red on hover */
    }
    #main-container.adjusted {
        margin-left: 300px; /* Adjust according to the filter panel width */
        transition: margin-left 0.3s ease-in-out;
    }
</style>
<script>
    import { onMount } from 'svelte';
    export let image;
    const canvas = document.querySelector('canvas');
    const context = canvas.getContext('2d');
    const filterButton = document.getElementById('filter-button');
    const discardButton = document.getElementById('discard-button');
    const filterPanel = document.getElementById('filter-panel');
    const closeFilterPanel = document.getElementById('close-filter-panel');
    const backToCategoriesButton = document.getElementById('back-to-categories');
    const filtersContainer = document.getElementById('filters-container');
    const mainContainer = document.getElementById('main-container');
    let imageWidth = null;
    let imageHeight = null;
    let originalData = null;
    const img = new Image();

    onMount(() => {
      canvas = document.getElementById('imageCanvas');
      context = canvas.getContext('2d');
      downloadLink = document.createElement('a');
      img.crossOrigin = 'anonymous';
      img.src = image;
      img.onload = () => {
        img.addEventListener('load', () => {
            imageWidth = img.width; 
            imageHeight = img.height; 
            canvas.width = imageWidth; 
            canvas.height = imageHeight; 
            context.drawImage(img, 0, 0); 
        });
      };
    });
filterButton.addEventListener('click', () => {
    filterPanel.classList.add('open');
    mainContainer.classList.add('adjusted');
});
closeFilterPanel.addEventListener('click', () => {
    filterPanel.classList.remove('open');
    mainContainer.classList.remove('adjusted');
});
discardButton.addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0);
    context.filter = 'none'; // Reset any applied filter
});
backToCategoriesButton.addEventListener('click', () => {
    if (filtersContainer.dataset.view === 'filters') {
        const currentCategory = filtersContainer.dataset.category;
        showSubcategories(currentCategory, filterCategories.find(cat => cat.name === currentCategory).filters);
        filtersContainer.dataset.view = 'subcategories'; // Set the data attribute to 'subcategories'
    } else if (filtersContainer.dataset.view === 'subcategories') {
        createFilterCategories();
        filtersContainer.dataset.view = 'categories'; // Set the data attribute to 'categories'
    }
});
const filterCategories = [
    {
        name: 'B&W',
        filters: [
            { name: 'Agnes', filter: 'grayscale(100%)' },
            { name: 'Conny', filter: 'grayscale(100%) contrast(1.3) brightness(1.1)' },
            { name: 'Gorden', filter: 'grayscale(100%) brightness(1.25) contrast(1.3)' },
            { name: 'Harrison', filter: 'grayscale(100%) contrast(1.6)' },
                { name: 'Henry', filter: 'grayscale(100%) brightness(1.6) contrast(1.4)' },
                { name: 'Logan', filter: 'grayscale(100%) brightness(1.75) contrast(1.3)' },
                { name: 'Olay', filter: 'grayscale(100%) contrast(1.4) brightness(1.2)' },
                { name: 'Porter', filter: 'grayscale(100%) brightness(1.35) contrast(1.5)' },
                { name: 'Sampi', filter: 'grayscale(100%) brightness(1.7) contrast(1.5)' },
                { name: 'Tom', filter: 'grayscale(100%) contrast(1.2) brightness(1.1)' },
                { name: 'Vinny', filter: 'grayscale(100%) brightness(1.15) contrast(1.2)' }
            ]
        },
        {
            name: 'Friends',
            filters: [
                { name: 'Aladin', filter: 'sepia(1)' },
                { name: 'Alex', filter: 'sepia(1) contrast(1.2)' },
                { name: 'Amber', filter: 'sepia(1)' },
                { name: 'Anne', filter: 'sepia(1) contrast(1.2)' },
                { name: 'Antonio', filter: 'sepia(1) brightness(1.2) contrast(1.2)' },
                { name: 'Bob', filter: 'sepia(1) brightness(1.2) contrast(1.2)' },
                { name: 'Greg', filter: 'sepia(1)' },
                { name: 'Hagrid', filter: 'sepia(1) contrast(1.3)' },
                { name: 'Harry', filter: 'sepia(1) brightness(1.2)' },
                { name: 'Ivan', filter: 'sepia(1) contrast(1.2)' },
                { name: 'Jean', filter: 'sepia(1) brightness(1.1)' },
                { name: 'Josh', filter: 'sepia(1) contrast(1.3)' },
                { name: 'Karen', filter: 'sepia(1) brightness(1.1)' },
                { name: 'Lucas', filter: 'sepia(1) contrast(1.4)' },
                { name: 'Melissa', filter: 'sepia(1) contrast(1.2) brightness(1.1)' },
                { name: 'Peter', filter: 'sepia(1)' },
                { name: 'Saloman', filter: 'sepia(1) brightness(1.1)' },
                { name: 'Sara', filter: 'sepia(1) contrast(1.2)' },
                { name: 'Sophia', filter: 'sepia(1) contrast(1.4)' },
                { name: 'Tony', filter: 'sepia(1) contrast(1.3) brightness(1.1)' }
            ]
        },
{
    name: 'Instage',
    filters: [
        { name: 'Borg', filter: 'sepia(0.8) hue-rotate(10deg)' },
        { name: 'Carl', filter: 'sepia(0.8) hue-rotate(20deg)' },
        { name: 'Coco', filter: 'sepia(0.8) hue-rotate(30deg)' },
        { name: 'Doris', filter: 'sepia(0.8) hue-rotate(40deg)' },
        { name: 'Doug', filter: 'sepia(0.8) hue-rotate(50deg)' },
        { name: 'Earl', filter: 'sepia(0.8) hue-rotate(60deg)' },
        { name: 'Sun', filter: 'sepia(0.8) hue-rotate(70deg)' },
        { name: 'Blues', filter: 'sepia(0.8) hue-rotate(80deg)' },
        { name: 'Country', filter: 'sepia(0.8) hue-rotate(90deg)' },
        { name: 'Lemonpeli', filter: 'sepia(0.8) hue-rotate(100deg)' },
        { name: 'Tiny DC', filter: 'sepia(0.8) hue-rotate(110deg)' },
        { name: 'Minker', filter: 'sepia(0.8) hue-rotate(120deg)' }
    ]
}
,
{
        name: 'Retro',
        filters: [
            { name: 'Vib', filter: 'contrast(1.4) saturate(1.3)' },
            { name: 'Ranguit', filter: 'contrast(1.5) saturate(1.2)' },
            { name: 'Rangeen', filter: 'contrast(1.6) saturate(1.1)' },
            { name: 'Creamlow', filter: 'contrast(1.2) brightness(1.1)' },
            { name: 'Sven', filter: 'contrast(1.3) brightness(1.2)' },
            { name: 'Yenely', filter: 'contrast(1.4) brightness(1.3)' },
            { name: 'Ragwarm', filter: 'contrast(1.5) brightness(1.4)' },
            { name: 'Greered', filter: 'contrast(1.6) brightness(1.5)' },
            { name: 'Danlighter', filter: 'contrast(1.2) brightness(1.6)' },
            { name: 'Garage', filter: 'contrast(1.3) brightness(1.7)' }
        ]
    },{
    name: 'Tuning',
    filters: [
        { name: 'Punch', filter: 'contrast(1.5) saturate(1.2)' },
        { name: 'Bright', filter: 'brightness(1.5)' },
        { name: 'Contrast', filter: 'contrast(2)' },
        { name: 'Vivid', filter: 'saturate(2)' },
        { name: 'Clairify', filter: 'contrast(1.2) brightness(1.2) saturate(1.2)' }
    ]
}
,{
    name: 'Portrait',
    filters: [
        { name: 'Matte', filter: 'brightness(0.9) contrast(1.1) sepia(0.2)' },
        { name: 'Deep', filter: 'contrast(1.5) saturate(1.2)' },
        { name: 'Film', filter: 'sepia(0.3) contrast(1.2)' },
        { name: 'Sunny', filter: 'brightness(1.2) contrast(1.1) saturate(1.1)' },
        { name: 'Gritty', filter: 'contrast(2) brightness(0.8)' }
    ]
}
,{
    name: 'Food',
    filters: [
        { name: 'Berry', filter: 'saturate(1.5) contrast(1.2)' },
        { name: 'Ensalat', filter: 'brightness(1.1) contrast(1.1) saturate(1.2)' },
        { name: 'Morning', filter: 'brightness(1.2) contrast(1.2) sepia(0.1)' },
        { name: 'Corn', filter: 'saturate(1.3) brightness(1.1)' },
        { name: 'Sharp', filter: 'contrast(1.5) saturate(1.1)' }
    ]
}
,{
    name: 'Nature',
    filters: [
        { name: 'Beach', filter: 'brightness(1.1) saturate(1.2) contrast(1.1)' },
        { name: 'Flower', filter: 'saturate(1.5) brightness(1.2)' },
        { name: 'Forest', filter: 'contrast(1.3) saturate(1.3) brightness(1.1)' }
    ]
}
,{
    name: 'Colors',
    filters: [
        { name: 'Strawberry', filter: 'contrast(1.2) brightness(1.1) saturate(1.3)' },
        { name: 'Clementine', filter: 'brightness(1.1) hue-rotate(10deg) saturate(1.2)' },
        { name: 'Pear', filter: 'brightness(1.2) contrast(1.1) saturate(1.2)' },
        { name: 'Apple', filter: 'contrast(1.2) hue-rotate(5deg) brightness(1.1)' },
        { name: 'Blueberry', filter: 'contrast(1.3) hue-rotate(200deg) brightness(1.1)' },
        { name: 'Grapes', filter: 'contrast(1.3) hue-rotate(250deg) saturate(1.3)' },
        { name: 'Dragon', filter: 'contrast(1.4) brightness(1.1) saturate(1.2)' },
        { name: 'Superone', filter: 'contrast(1.5) saturate(1.4) brightness(1.2)' },
        { name: 'Tonola', filter: 'contrast(1.1) hue-rotate(50deg) brightness(1.1)' },
        { name: 'Reddish', filter: 'contrast(1.3) brightness(1.2) saturate(1.3)' },
        { name: 'Fellowing', filter: 'contrast(1.2) brightness(1.1) saturate(1.2)' },
        { name: 'Grasslands', filter: 'contrast(1.3) brightness(1.2) saturate(1.3)' },
        { name: 'Spring', filter: 'contrast(1.1) hue-rotate(30deg) brightness(1.1)' },
        { name: 'Justblues', filter: 'contrast(1.3) hue-rotate(210deg) saturate(1.2)' },
        { name: 'Bluesteel', filter: 'contrast(1.4) hue-rotate(220deg) saturate(1.3)' },
        { name: 'Flowerpot', filter: 'contrast(1.3) hue-rotate(15deg) saturate(1.2)' },
        { name: 'Stinker', filter: 'contrast(1.2) brightness(1.1) saturate(1.2)' },
        { name: 'Beyllo', filter: 'contrast(1.3) brightness(1.1) saturate(1.3)' }
    ]
}
,{
    name: 'Artzy',
    filters: [
        { name: 'Poster', filter: 'contrast(2) saturate(2) brightness(0.8)' },
        { name: 'Glitch', filter: 'hue-rotate(180deg) contrast(1.5)' },
        { name: 'Mozak', filter: 'sepia(1) contrast(1.2) brightness(1.1)' },
        { name: 'Frank', filter: 'grayscale(1) contrast(1.3)' },
        { name: 'Pinvet', filter: 'contrast(1.5) brightness(1.2) sepia(0.8)' },
        { name: 'Night Vision', filter: 'invert(1) brightness(1.3)' },
        { name: 'Darksheet', filter: 'brightness(0.5) contrast(1.3)' },
        { name: 'Blomberg', filter: 'contrast(1.2) saturate(1.5) hue-rotate(60deg)' },
        { name: 'Lolita', filter: 'contrast(1.1) sepia(0.6) brightness(1.1)' },
        { name: 'Atonic', filter: 'contrast(1.4) brightness(1.2) saturate(1.3)' }
    ]
}

    ];
function createFilterCategories() {
        filtersContainer.innerHTML = '';
        filtersContainer.dataset.view = 'categories'; // Set the initial view to 'categories'

        filterCategories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.className = 'filter-category';
            categoryElement.textContent = category.name;

            categoryElement.addEventListener('click', () => {
                showSubcategories(category.name, category.filters);
                filtersContainer.dataset.view = 'subcategories'; // Set the data attribute to 'subcategories'
            });

            filtersContainer.appendChild(categoryElement);
        });
    }
function showSubcategories(categoryName, filters) {
        filtersContainer.innerHTML = '';
        filtersContainer.dataset.category = categoryName; // Store the current category name

        filters.forEach(f => {
            const filterPreview = document.createElement('div');
            filterPreview.className = 'filter-preview';

            const filterImage = document.createElement('img');
            filterImage.src = originalData;
            filterImage.style.filter = f.filter;
            filterPreview.appendChild(filterImage);

            // Add filter name as a label
            const filterLabel = document.createElement('div');
            filterLabel.textContent = f.name;
            filterLabel.style.textAlign = 'center';
            filterLabel.style.color = 'white';
            filterPreview.appendChild(filterLabel);

            filterPreview.addEventListener('click', () => {
                applyFilter(f.filter);
                document.querySelectorAll('.filter-preview').forEach(fp => fp.classList.remove('selected'));
                filterPreview.classList.add('selected');
            });

            filtersContainer.appendChild(filterPreview);
        });
const backButton = document.createElement('button');
        backButton.className = 'back-button';
        backButton.textContent = 'Back';
        backButton.addEventListener('click', createFilterCategories);
        filtersContainer.appendChild(backButton);
    }
function applyFilter(filter) {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.filter = filter;
    context.drawImage(image, 0, 0);
    
        const download = document.getElementById('download');
download.href = canvas.toDataURL(); 
}
createFilterCategories();


  
    

// Get the modal
var modal = document.getElementById('myModal');

// Get the button that opens the modal
var btn = document.getElementById('share-button');

// Get the <span> element that closes the modal
var span = document.getElementsByClassName('close1')[0];

// When the user clicks the button, open the modal 
btn.onclick = function() {
    modal.style.display = 'block';
}

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
    modal.style.display = 'none';
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}


</script>
</main>