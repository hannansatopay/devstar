<script>
    document.addEventListener("DOMContentLoaded", function() {
        const prevBtn = document.getElementById("prevBtn");
        const nextBtn = document.getElementById("nextBtn");
        const slideContainer = document.getElementById("slideContainer");
    
        prevBtn.addEventListener("click", function() {
            slideContainer.scrollBy({
                left: -300, // Adjust this value as needed to control the scroll amount
                behavior: 'smooth'
            });
        });
    
        nextBtn.addEventListener("click", function() {
            slideContainer.scrollBy({
                left: 300, // Adjust this value as needed to control the scroll amount
                behavior: 'smooth'
            });
        });
    });
  </script>
  
  <div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden rounded-lg">
      <div class="w-full h-full dark:text-white flex flex-col">
          <h1 class="text-center">Devstar Document Templates Module</h1>
          <div class="flex">
              <div class="w-[15%] border border-yellow-100">Left Side Navbar
                  <nav>
                      <ul>
                          <li>1</li>
                          <li>2</li>
                          <li>3</li>
                          <li>4</li>
                          <li>5</li>
                      </ul>
                  </nav>
              </div>
              <div class="w-[70%] flex gap-10 border border-yellow-100">
                  <div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-1 overflow-hidden rounded-lg">
                      <section class="template-section px-10 py-10 pt-5">
                      <h1 class="text-xl font-bold mb-6 text-gray-800">Templates</h1>
                      <div class="flex overflow-x-auto gap-4">
                          <div class="relative">
                              <button id="prevBtn" class="prev-btn absolute left-0 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded-md z-10">Prev</button>
                              <div id="slideContainer" class="flex overflow-hidden">
                                  <!-- Add your template items here -->
                                  <div class="group relative w-54 h-70 rounded-lg overflow-hidden bg-gray-900 cursor-pointer shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1 flex-shrink-0 mx-2">
                                      <img class="w-full h-full object-cover group-hover:opacity-50 transition duration-300 ease-in-out" src="https://picsum.photos/seed/picsum/200/300" alt="Template 1">
                                      <div class="absolute inset-0 px-4 py-2 bottom-0 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out bg-gradient-to-b from-gray-900 to-transparent">
                                          <h3 class="text-lg font-bold text-white mb-2">Dota 2</h3>
                                      </div>
                                      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out">
                                          <div class="flex flex-col space-y-2">
                                              <button class="bg-blue-500 text-white px-4 py-2 rounded-md w-24 text-center">Edit</button>
                                              <button class="bg-green-500 text-white px-4 py-2 rounded-md w-24 text-center">PDF</button>
                                              <button class="bg-red-500 text-white px-4 py-2 rounded-md w-24 text-center">Word</button>
                                          </div>
                                      </div>
                                  </div>
                                  <div class="group relative w-54 h-70 rounded-lg overflow-hidden bg-gray-900 cursor-pointer shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1 flex-shrink-0 mx-2">
                                    <img class="w-full h-full object-cover group-hover:opacity-50 transition duration-300 ease-in-out" src="https://picsum.photos/seed/picsum/200/300" alt="Template 1">
                                    <div class="absolute inset-0 px-4 py-2 bottom-0 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out bg-gradient-to-b from-gray-900 to-transparent">
                                        <h3 class="text-lg font-bold text-white mb-2">Dota 2</h3>
                                    </div>
                                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out">
                                        <div class="flex flex-col space-y-2">
                                            <button class="bg-blue-500 text-white px-4 py-2 rounded-md w-24 text-center">Edit</button>
                                            <button class="bg-green-500 text-white px-4 py-2 rounded-md w-24 text-center">PDF</button>
                                            <button class="bg-red-500 text-white px-4 py-2 rounded-md w-24 text-center">Word</button>
                                        </div>
                                    </div>
                                </div>
                                <div class="group relative w-54 h-70 rounded-lg overflow-hidden bg-gray-900 cursor-pointer shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1 flex-shrink-0 mx-2">
                                  <img class="w-full h-full object-cover group-hover:opacity-50 transition duration-300 ease-in-out" src="https://picsum.photos/seed/picsum/200/300" alt="Template 1">
                                  <div class="absolute inset-0 px-4 py-2 bottom-0 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out bg-gradient-to-b from-gray-900 to-transparent">
                                      <h3 class="text-lg font-bold text-white mb-2">Dota 2</h3>
                                  </div>
                                  <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out">
                                      <div class="flex flex-col space-y-2">
                                          <button class="bg-blue-500 text-white px-4 py-2 rounded-md w-24 text-center">Edit</button>
                                          <button class="bg-green-500 text-white px-4 py-2 rounded-md w-24 text-center">PDF</button>
                                          <button class="bg-red-500 text-white px-4 py-2 rounded-md w-24 text-center">Word</button>
                                      </div>
                                  </div>
                              </div>
                              <div class="group relative w-54 h-70 rounded-lg overflow-hidden bg-gray-900 cursor-pointer shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1 flex-shrink-0 mx-2">
                                <img class="w-full h-full object-cover group-hover:opacity-50 transition duration-300 ease-in-out" src="https://picsum.photos/seed/picsum/200/300" alt="Template 1">
                                <div class="absolute inset-0 px-4 py-2 bottom-0 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out bg-gradient-to-b from-gray-900 to-transparent">
                                    <h3 class="text-lg font-bold text-white mb-2">Dota 2</h3>
                                </div>
                                <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out">
                                    <div class="flex flex-col space-y-2">
                                        <button class="bg-blue-500 text-white px-4 py-2 rounded-md w-24 text-center">Edit</button>
                                        <button class="bg-green-500 text-white px-4 py-2 rounded-md w-24 text-center">PDF</button>
                                        <button class="bg-red-500 text-white px-4 py-2 rounded-md w-24 text-center">Word</button>
                                    </div>
                                </div>
                            </div>
                            <div class="group relative w-54 h-70 rounded-lg overflow-hidden bg-gray-900 cursor-pointer shadow-lg hover:shadow-xl transition duration-300 ease-in-out transform hover:-translate-y-1 flex-shrink-0 mx-2">
                              <img class="w-full h-full object-cover group-hover:opacity-50 transition duration-300 ease-in-out" src="https://picsum.photos/seed/picsum/200/300" alt="Template 1">
                              <div class="absolute inset-0 px-4 py-2 bottom-0 opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out bg-gradient-to-b from-gray-900 to-transparent">
                                  <h3 class="text-lg font-bold text-white mb-2">Dota 2</h3>
                              </div>
                              <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300 ease-in-out">
                                  <div class="flex flex-col space-y-2">
                                      <button class="bg-blue-500 text-white px-4 py-2 rounded-md w-24 text-center">Edit</button>
                                      <button class="bg-green-500 text-white px-4 py-2 rounded-md w-24 text-center">PDF</button>
                                      <button class="bg-red-500 text-white px-4 py-2 rounded-md w-24 text-center">Word</button>
                                  </div>
                              </div>
                          </div>
                                  <!-- Repeat the above div for each template -->
                              </div>
                              <button id="nextBtn" class="next-btn absolute right-0 top-1/2 transform -translate-y-1/2 bg-blue-500 hover:bg-blue-700 text-white px-3 py-2 rounded-md z-10">Next</button>
                          </div>
                      </div>
                      </section>
                  </div>
              </div>
              <div class="w-[15%] border border-yellow-100">Right Side Search bar with some text</div>
          </div>
      </div>
  </div>
  
  <style>
    /* Add your styles here */
    .prev-btn, .next-btn {
      background-color: #3b82f6; /* Blue color */
      color: white;
      border: none;
      cursor: pointer;
    }
  
    .prev-btn:hover, .next-btn:hover {
      background-color: #2563eb; /* Darker blue color for hover */
    }
  
    .prev-btn {
      left: 0;
    }
  
    .next-btn {
      right: 0;
    }
  </style>
  