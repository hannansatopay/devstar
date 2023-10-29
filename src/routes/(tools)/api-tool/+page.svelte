<script>
// @ts-nocheck

  import { tools } from "../../tools";
	import { onMount } from "svelte";
  import { Label, Textarea, Helper, Input, Dropdown, DropdownItem, Button } from "flowbite-svelte";
  import Copy from "$lib/Copy.svelte";
  export let data;
	import axios from "axios";
	import Intro from "$lib/Intro.svelte";
  import { ChevronDownSolid } from 'flowbite-svelte-icons';
    
  const items = [{ label: 'GET' }, { label: 'POST' }, { label: 'PUT' }, { label: 'DELETE' }];
  
	let selectCategory = 'GET';
	let url = "";
	let requestData = "";
	let responseData = {
	  status: null,
	  headers: null,
	  data: null,
	};
	let errorResponse = null;
  
	// Detect whether the code is running on the client
	let client = false;
	onMount(() => {
	  client = true;
	});
  
	const handleRequest = async () => {
	  try {
		let response;
  
		if (selectCategory === "GET") {
		  response = await axios.get(url);
		} else if (selectCategory === "POST") {
		  response = await axios.post(url, { data: requestData });
		} else if (selectCategory === "PUT") {
		  response = await axios.put(url, { data: requestData });
		} else if (selectCategory === "DELETE") {
		  response = await axios.delete(url);
		}
  
		// Store the entire response object
		responseData.status = response.status;
		responseData.headers = response.headers;
		responseData.data = response.data;
  
		errorResponse = null; // Clear any previous error message
	  } catch (error) {
		errorResponse = `Error: ${error.message}`;
		responseData = {
		  status: null,
		  headers: null,
		  data: null,
		}; // Clear any previous response data
	  }
	};
</script>
  
<Intro heading={data.meta.title} description={data.meta.description} />
  <section class="bg-white dark:bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
      <div class="card gap-16 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
        <div class="p-8">
          <!--Input Section for Handling Requests-->
          <Button class="rounded-e-none whitespace-nowrap border border-r-0 border-primary-700">
            {selectCategory}
            <ChevronDownSolid class="w-2.5 h-2.5 ml-2.5" />
          </Button>
          <Dropdown classContainer="w-40">
            {#each items as { label }}
            <DropdownItem
            on:click={() => {
              selectCategory = label;
            }}
            class={selectCategory === label ? 'underline' : ''}
            >
            {label}
            </DropdownItem>
            {/each}
          </Dropdown>
  
            <Input
            bind:value={url}
              type="url"
              class="text-sm border-gray-400 focus:ring-blue-500 focus:border-blue-500 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="https://abc.com"
            />
  
            <Button
              type="submit"
              class="bg-blue-600 text-white hover:bg-gray-200 hover:text-blue-600 
              dark:bg-green-600 dark:text-white dark:hover:bg-gray-100 dark:hover:text-blue-700"
              on:click={handleRequest}>Send</Button>
  
          <Label for="json-body" class="text-sm mt-2 col-xs-2">Body</Label>
          <Helper class="text-sm mb-2"
            >Please enter the JSON body for POST and PUT requests</Helper
          >
          <Textarea
          bind:value = {requestData}
          class = "resize-none p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
            placeholder='Enter a valid json object.
  Eg:  {"{"}"name":"John", "age":30, "car":null{"}"} or
  {"{"}
  &#x09;"name":"John",
  &#x09;"age":30,
  &#x09;"car":null
  {"}"}'
            rows="7"
          />
  
          <!--Output section of Handled Requests-->
          <div class="flex w-full my-2 justify-between text-sm text-gray-900 dark:text-white">
            <Label for="response" class = "text-sm mt-2 col-xs-2">Response</Label>
            {#if responseData.status!== null}
            <div class="text-sm mt-2 col-xs-2">
              <h2>Response Status Code: {responseData.status}</h2>
            </div>
            {/if}
          </div>
          <div class="p-2.5 h-40 overflow-auto scroll-smooth text-sm relative text-gray-900 dark:text-white bg-gray-50 rounded-lg border border-gray-400 hover:border-blue-500 hover:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:hover:ring-blue-500 dark:hover:border-blue-500">
            <pre>{JSON.stringify(responseData.data, null, 2)}</pre>
          </div>
        </div>
      </div>
    </div>
  </section>
  
  <style>
    .card {
      box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
    }
  
    :is(.dark .card) {
      box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
    }
  
    pre {
      white-space: pre-wrap;
      word-wrap: break-word;
  }
  </style>
  