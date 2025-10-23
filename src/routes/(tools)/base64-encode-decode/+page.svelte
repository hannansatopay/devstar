<script>
  import Copy from "$lib/Copy.svelte";

  let input = "Encode this string with Base64!";
  let mode = "encode";
  let result = "";
  let error = "";

  $: ({ output: result, error } =
    mode === "encode" ? encode(input) : decode(input));

  function encode(value) {
    if (!value) {
      return { output: "", error: "" };
    }

    try {
      const bytes = new TextEncoder().encode(value);
      let binary = "";
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      return { output: btoa(binary), error: "" };
    } catch (error) {
      return { output: "", error: "Unable to Base64 encode this value." };
    }
  }

  function decode(value) {
    if (!value) {
      return { output: "", error: "" };
    }

    try {
      const binary = atob(value);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return { output: new TextDecoder().decode(bytes), error: "" };
    } catch (error) {
      return { output: "", error: "Invalid Base64 string." };
    }
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div class="grid gap-6 lg:grid-cols-2">
    <div
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Mode
        <select
          class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={mode}
        >
          <option value="encode">Text → Base64</option>
          <option value="decode">Base64 → Text</option>
        </select>
      </label>
      <textarea
        class="min-h-[220px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
        bind:value={input}
        placeholder={mode === "encode"
          ? "Type plain text…"
          : "Paste Base64 encoded text…"}
      ></textarea>
      {#if error}
        <p class="text-xs text-rose-500 dark:text-rose-300">{error}</p>
      {:else}
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Base64 uses binary-safe encoding. Unicode characters are converted
          with TextEncoder/TextDecoder for accuracy.
        </p>
      {/if}
    </div>

    <div
      class="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {mode === "encode" ? "Base64 output" : "Decoded text"}
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
