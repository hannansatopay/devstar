<script>
  import Copy from "$lib/Copy.svelte";

  const separators = ["Space", "Comma", "New line"];

  let input = "Hello!";
  let mode = "encode";
  let separator = separators[0];
  let result = "";

  $: separatorValue =
    separator === "Space" ? " " : separator === "Comma" ? ", " : "\n";
  $: result =
    mode === "encode" ? encodeAscii(input, separatorValue) : decodeAscii(input);

  function encodeAscii(value, sep) {
    if (!value) {
      return "";
    }
    return Array.from(value)
      .map((char) => char.charCodeAt(0).toString())
      .join(sep);
  }

  function decodeAscii(value) {
    if (!value) {
      return "";
    }
    return value
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((code) => String.fromCharCode(Number.parseInt(code, 10) || 0))
      .join("");
  }
</script>

<section class="space-y-6">
  <div
    class="grid gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80 lg:grid-cols-2"
  >
    <div class="space-y-4">
      <div class="grid gap-3">
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Mode
          <select
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={mode}
          >
            <option value="encode">Text → ASCII</option>
            <option value="decode">ASCII → Text</option>
          </select>
        </label>
        {#if mode === "encode"}
          <label
            class="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            Separator
            <select
              class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={separator}
            >
              {#each separators as option}
                <option value={option}>{option}</option>
              {/each}
            </select>
          </label>
        {/if}
      </div>
      <textarea
        class="min-h-[220px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
        bind:value={input}
        placeholder={mode === "encode"
          ? "Type text to encode…"
          : "Paste ASCII codes to decode…"}
      ></textarea>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        {mode === "encode"
          ? "Every character is converted to its ASCII code using your chosen separator."
          : "Separate ASCII codes with spaces, commas, or new lines before decoding."}
      </p>
    </div>

    <div class="flex flex-col gap-4">
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {mode === "encode" ? "ASCII output" : "Decoded text"}
        </h2>
      </div>
      <div class="relative">
        <pre
          class="min-h-[220px] whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">{result}</pre>
        <Copy text={result} customClass="top-3 right-3" />
      </div>
    </div>
  </div>
</section>
