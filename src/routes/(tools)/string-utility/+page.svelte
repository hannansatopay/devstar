<script>
  import Copy from "$lib/Copy.svelte";

  let input = "String utilities make repetitive edits instantaneous.";
  let findValue = "";
  let replaceValue = "";

  const transforms = [
    { label: "Uppercase", fn: (value) => value.toUpperCase() },
    { label: "Lowercase", fn: (value) => value.toLowerCase() },
    { label: "Title case", fn: titleCase },
    { label: "Sentence case", fn: sentenceCase },
    { label: "Camel case", fn: camelCase },
    { label: "Snake case", fn: (value) => slugify(value, "_") },
    { label: "Slug", fn: (value) => slugify(value, "-") },
    { label: "Trimmed", fn: (value) => value.trim() },
    { label: "Collapsed whitespace", fn: collapseWhitespace },
    { label: "Reversed", fn: (value) => value.split("").reverse().join("") },
    { label: "URL encoded", fn: urlEncode },
    { label: "URL decoded", fn: urlDecode },
    { label: "Base64 encoded", fn: base64Encode },
    { label: "Base64 decoded", fn: base64Decode },
    { label: "Sanitised (A-Z, 0-9, _)", fn: sanitise },
    { label: "Split words (comma separated)", fn: splitWords },
    { label: "Joined lines (comma separated)", fn: joinLines },
  ];

  $: replacer = replacePreview(input, findValue, replaceValue);
  $: summary = buildSummary(input);

  function replacePreview(source, needle, replacement) {
    if (!needle || !source.length) {
      return source;
    }
    const escaped = escapeForRegExp(needle);
    try {
      return source.replace(new RegExp(escaped, "g"), replacement ?? "");
    } catch {
      return source.split(needle).join(replacement ?? "");
    }
  }

  function applyReplacement() {
    if (!findValue) {
      return;
    }
    input = replacePreview(input, findValue, replaceValue);
  }

  function escapeForRegExp(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  function titleCase(value) {
    return value
      .toLowerCase()
      .split(/\s+/)
      .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ""))
      .join(" ");
  }

  function sentenceCase(value) {
    return value.replace(
      /(^|[.!?]\s+)([a-z])/g,
      (_, prefix, char) => prefix + char.toUpperCase(),
    );
  }

  function camelCase(value) {
    const words = slugify(value, " ").split(" ").filter(Boolean);
    return words
      .map((word, index) =>
        index === 0
          ? word.toLowerCase()
          : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
      )
      .join("");
  }

  function slugify(value, separator) {
    return value
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, separator)
      .replace(new RegExp(`${separator}+`, "g"), separator)
      .replace(new RegExp(`^${separator}|${separator}$`, "g"), "");
  }

  function collapseWhitespace(value) {
    return value.replace(/\s+/g, " ").trim();
  }

  function urlEncode(value) {
    try {
      return encodeURIComponent(value);
    } catch (error) {
      return `Unable to encode: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  function urlDecode(value) {
    try {
      return decodeURIComponent(value);
    } catch (error) {
      return `Unable to decode: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  function base64Encode(value) {
    try {
      if (typeof btoa === "function") {
        return btoa(unescape(encodeURIComponent(value)));
      }
      if (typeof Buffer !== "undefined") {
        return Buffer.from(value, "utf-8").toString("base64");
      }
      return "Base64 encoding is not supported in this environment.";
    } catch (error) {
      return `Unable to encode: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  function base64Decode(value) {
    try {
      if (typeof atob === "function") {
        return decodeURIComponent(escape(atob(value)));
      }
      if (typeof Buffer !== "undefined") {
        return Buffer.from(value, "base64").toString("utf-8");
      }
      return "Base64 decoding is not supported in this environment.";
    } catch (error) {
      return `Unable to decode: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }

  function sanitise(value) {
    return value.replace(/[^\w\s-]/g, "");
  }

  function splitWords(value) {
    return value.trim().split(/\s+/).filter(Boolean).join(", ");
  }

  function joinLines(value) {
    return value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .join(", ");
  }

  function buildSummary(value) {
    const characters = value.length;
    const charactersNoSpace = value.replace(/\s/g, "").length;
    const words = value.trim().split(/\s+/).filter(Boolean).length;
    const lines = value.split(/\r?\n/).length;
    return {
      characters,
      charactersNoSpace,
      words,
      lines,
    };
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div
    class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
  >
    <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
      Source text
      <textarea
        class="mt-1 min-h-[220px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
        bind:value={input}
      ></textarea>
    </label>

    <div class="grid gap-3 md:grid-cols-2">
      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Find
        <input
          class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={findValue}
          placeholder="Pattern"
        />
      </label>
      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Replace with
        <input
          class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={replaceValue}
          placeholder="Replacement"
        />
      </label>
    </div>

    <div class="grid gap-4 md:grid-cols-2">
      <div
        class="relative rounded-xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800 dark:border-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-100"
      >
        <Copy text={replacer} customClass="top-3 right-3" />
        <div
          class="mb-2 flex items-center justify-between gap-3 pr-16 text-xs font-semibold uppercase tracking-wide"
        >
          <span>Find & replace</span>
          <button
            class="inline-flex items-center rounded-full border border-indigo-300 bg-white px-3 py-1 text-[11px] font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400 dark:border-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-200 dark:hover:bg-indigo-900/80 dark:focus:ring-indigo-700 dark:disabled:border-slate-700 dark:disabled:text-slate-500"
            type="button"
            on:click={applyReplacement}
            disabled={!findValue}
          >
            Apply to source
          </button>
        </div>
        <pre class="whitespace-pre-wrap break-words pt-2">{replacer}</pre>
      </div>

      {#each transforms as transform}
        <div
          class="relative rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
        >
          <Copy text={transform.fn(input)} customClass="top-3 right-3" />
          <p
            class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            {transform.label}
          </p>
          <pre class="whitespace-pre-wrap break-words pt-2">{transform.fn(
              input,
            )}</pre>
        </div>
      {/each}
    </div>

    <div
      class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      <p
        class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        String summary
      </p>
      <div class="mt-3 grid gap-3 sm:grid-cols-2">
        <div
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
        >
          <p>Characters</p>
          <p
            class="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            {summary.characters}
          </p>
        </div>
        <div
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
        >
          <p>Characters (no whitespace)</p>
          <p
            class="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            {summary.charactersNoSpace}
          </p>
        </div>
        <div
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
        >
          <p>Words</p>
          <p
            class="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            {summary.words}
          </p>
        </div>
        <div
          class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
        >
          <p>Lines</p>
          <p
            class="mt-1 text-base font-semibold text-slate-900 dark:text-slate-100"
          >
            {summary.lines}
          </p>
        </div>
      </div>
    </div>
  </div>
</section>
