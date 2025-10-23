<script>
  import Copy from "$lib/Copy.svelte";

  let input = "Convert this sentence to binary!";
  let mode = "encode";
  let chunkSize = 8;

  const chunkOptions = [8, 7, 16];

  $: result =
    mode === "encode"
      ? encodeBinary(input, chunkSize)
      : decodeBinary(input, chunkSize);

  function encodeBinary(value, size) {
    if (!value) {
      return "";
    }
    return Array.from(value)
      .map((char) => char.charCodeAt(0).toString(2).padStart(size, "0"))
      .join(" ");
  }

  function decodeBinary(value) {
    if (!value) {
      return "";
    }
    return value
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((code) => String.fromCharCode(Number.parseInt(code, 2) || 0))
      .join("");
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div class="grid gap-6 lg:grid-cols-2">
    <div
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="grid gap-3 md:grid-cols-2">
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Mode
          <select
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={mode}
          >
            <option value="encode">Text → Binary</option>
            <option value="decode">Binary → Text</option>
          </select>
        </label>

        {#if mode === "encode"}
          <label
            class="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Bits per chunk
            <select
              class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={chunkSize}
            >
              {#each chunkOptions as option}
                <option value={option}>{option} bits</option>
              {/each}
            </select>
          </label>
        {/if}
      </div>

      <textarea
        class="min-h-[220px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
        bind:value={input}
        placeholder={mode === "encode"
          ? "Type the text you want to encode…"
          : "Paste binary numbers separated by spaces…"}
      ></textarea>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        {mode === "encode"
          ? `Each character is converted to its ASCII code and padded to ${chunkSize} bits.`
          : "Binary groups can be separated with spaces or new lines before decoding."}
      </p>
    </div>

    <div
      class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {mode === "encode" ? "Binary output" : "Decoded text"}
        </h2>
      </div>
      <div class="relative">
        <pre
          class="min-h-[220px] whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 pt-14 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">{result}</pre>
        <Copy text={result} customClass="top-3 right-3" />
      </div>
    </div>
  </div>
</section>
