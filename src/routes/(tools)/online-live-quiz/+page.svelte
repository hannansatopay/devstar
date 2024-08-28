<script>
  import { onMount } from "svelte";
  import EnterDetails from "./components/enterDetails.svelte";
  import EnterQuiz from "./components/enterQuiz.svelte";
  import { writable } from "svelte/store";

  let isJoined = writable(false);
  let userData = writable({ name: "", avatar: "" });

  onMount(() => {
    const storedIsJoined = localStorage.getItem("isJoined");
    if (storedIsJoined === "true") {
      isJoined.set(true);
      userData.set({
        name: localStorage.getItem("name") || "",
        avatar: JSON.parse(localStorage.getItem("avatar")) || "",
      });
    }
  });

  const handleJoin = () => {
    isJoined.set(true);
    localStorage.setItem("isJoined", "true");
  };

  const handleLogout = () => {
    isJoined.set(false);
    localStorage.removeItem("isJoined");
  };
</script>

<div
  class="gap-16 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg"
>
  {#if $isJoined}
    <!-- Quiz start page -->
    <EnterQuiz {handleLogout} userData={$userData} />
  {:else}
    <EnterDetails onJoin={handleJoin} />
  {/if}
</div>

<style>
</style>
