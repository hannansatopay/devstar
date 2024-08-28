<script>
  import { onMount } from "svelte";
  import { Card, Avatar, Button } from "flowbite-svelte";
  import { createEventDispatcher } from "svelte";

  let avatarData = "";
  let name = "";
  let isAvatarUploaded = false;
  let showQuiz = false;
  const dispatch = createEventDispatcher();

  onMount(() => {
    // Retrieve data from localStorage on component mount
    const storedAvatar = localStorage.getItem("avatar");
    const storedName = localStorage.getItem("name");

    if (storedAvatar) {
      avatarData = JSON.parse(storedAvatar);
      isAvatarUploaded = true;
    }
    if (storedName) {
      name = storedName;
    }
  });

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        avatarData = reader.result; // base64-encoded image data
        localStorage.setItem("avatar", JSON.stringify(avatarData));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleJoinClick = () => {
    // Save name and avatar in localStorage
    localStorage.setItem("name", name);
    localStorage.setItem("avatar", JSON.stringify(avatarData));

    // Dispatch the submit event with user details
    dispatch("submit", { name, avatar: avatarData });
  };

  const triggerFileInput = () => {
    document.getElementById("photo-id").click();
  };
</script>

<div>
  <div class="flex justify-center">
    <Card class="p-10 md:min-w-[600px] md:min-h-[400px]">
      <div class="border-b mb-6">
        <h1
          class="text-center font-thin tracking-wider text-gray-900 dark:text-white text-2xl md:text-4xl mb-5"
        >
          Enter Your Name
        </h1>
      </div>
      <div class="flex flex-col items-center pb-4">
        <div>
          <div class="flex flex-col justify-center items-center cursor-pointer">
            <Avatar
              style="object-fit: cover;"
              class="w-28 h-28 hover:scale-125 transition-transform"
              src={avatarData || "/avatar.svg"}
              on:click={triggerFileInput}
            />
            <input
              id="photo-id"
              name="ImageId"
              type="file"
              accept="image/*"
              class="hidden"
              on:change={handleAvatarUpload}
            />
            <button
              class="mt-4 text-blue-800 underline dark:text-white hover:no-underline hover:text-blue-500"
              on:click={triggerFileInput}
            >
              {isAvatarUploaded ? "Change avatar" : "Upload avatar"}
            </button>
          </div>
          <form>
            <input
              type="file"
              style="display: none;"
              accept="image/png,image/jpg,image/jpeg"
              on:change={handleAvatarUpload}
            />
          </form>
        </div>

        <div class="relative z-0 w-full md:w-96 mb-5 mt-3 group">
          <input
            type="text"
            name="floating_title"
            id="floating_title"
            class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none dark:text-white dark:border-gray-600 dark:focus:border-blue-500 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=""
            bind:value={name}
            required
          />
          <label
            for="floating_title"
            class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 rtl:peer-focus:translate-x-1/4 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
            >Name</label
          >
        </div>
        <div class="flex justify-center mt-4 w-full lg:mt-6">
          <Button class="w-full md:w-96" on:click={handleJoinClick}
            >Submit</Button
          >
        </div>
      </div>
    </Card>
  </div>
</div>
