<script lang="ts">
    import {
      Label,
      Textarea,
      Helper,
      Input,
      ButtonGroup,
      Button,
    } from "flowbite-svelte";
    import Copy from "$lib/Copy.svelte";
    import Intro from "$lib/Intro.svelte";
    export let data;
    
    //Initializing default values of Variables
      let selectCategory = 'GET';
      let url = "";
      let requestData = "";
      let responseData = {
        statusCode: 0,
      statusText: "",
      headers: null,
        data: null,
      };
    let responseText = '';
  </script>
  
  <Intro heading={data.meta.title} description={data.meta.description} />
  <section class="bg-white dark:bg-gray-900">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
      <div class="card gap-16 items-center mx-auto max-w-screen-xl overflow-hidden rounded-lg">
        <div class="p-8">
          <!--Input Section for Handling Requests-->
          <Label class="mb-2">Enter URL</Label>
          <ButtonGroup class="w-full">
            <select
              class="bg-gray-50 border border-gray-400 text-gray-900 text-sm rounded-lg block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              bind:value={selectCategory}>
              <option value="GET" selected>GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
  
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
              >Send</Button
            >
          </ButtonGroup>
  
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
            {#if responseData.statusCode !== 0}
            <div class="text-sm mt-2 col-xs-2">
              <h2>Response Status Code: {responseData.statusCode} &nbsp;&nbsp;&nbsp; Response Status Text: {responseData.statusText}</h2>
            </div>
            {/if}
          </div>
          <div class="p-2.5 h-40 overflow-auto scroll-smooth text-sm relative text-gray-900 dark:text-white bg-gray-50 rounded-lg border border-gray-400 hover:border-blue-500 hover:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:hover:ring-blue-500 dark:hover:border-blue-500">
            <Copy text={responseText.replace(/<\/?p>/g, '\n')}/>
            <pre>{responseText}</pre>
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
  