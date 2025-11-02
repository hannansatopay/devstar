<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  let fileInput: HTMLInputElement;
  let sourceUrl = "";
  let base64 = "";
  let fileName = "image";
  let errorMessage = "";
  let loading = false;

  function handleBrowseClick() {
    fileInput?.click();
  }

  function handleFileChange(event: Event) {
    const target = event.currentTarget as HTMLInputElement | null;
    const file = target?.files?.[0];
    if (!file) return;

    loading = true;
    errorMessage = "";

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        sourceUrl = reader.result;
        base64 = reader.result;
        fileName = file.name.replace(/\.[^/.]+$/, "") || "image";
      } else {
        errorMessage = "Unable to read the selected file.";
      }
      loading = false;
    };

    reader.onerror = () => {
      errorMessage = "Something went wrong while reading the file.";
      loading = false;
    };

    reader.readAsDataURL(file);
  }

  function clearAll() {
    sourceUrl = "";
    base64 = "";
    errorMessage = "";
  }

  function downloadTextFile() {
    if (!base64) return;
    const blob = new Blob([base64], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${fileName}-base64.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInput.files = dataTransfer.files;
      handleFileChange({ currentTarget: fileInput } as unknown as Event);
    }
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
  }
</script>

<section class="space-y-6">
  <div class="flex flex-col gap-6 px-4 lg:flex-row">
    <div class="flex flex-1 flex-col gap-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="space-y-4">
          <div class="flex flex-wrap items-center gap-3">
            <button
              class="rounded-full border border-indigo-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-indigo-500 transition hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-300 dark:hover:bg-indigo-500/10"
              type="button"
              on:click={handleBrowseClick}
            >
              {sourceUrl ? "Replace image" : "Browse image"}
            </button>
            {#if sourceUrl}
              <button
                class="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-rose-400 hover:text-rose-600 dark:border-slate-700 dark:text-slate-200 dark:hover:border-rose-500 dark:hover:text-rose-300"
                type="button"
                on:click={clearAll}
              >
                Clear
              </button>
            {/if}
            <input
              class="hidden"
              type="file"
              accept="image/*"
              bind:this={fileInput}
              on:change={handleFileChange}
            />
          </div>

          <div
            class="rounded-2xl border border-dashed border-slate-300 bg-slate-100 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <p
              class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              How it works
            </p>
            <ul
              class="mt-3 space-y-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400"
            >
              <li>
                Images are converted locally to a Base64 data URL. Nothing is
                uploaded to a server.
              </li>
              <li>
                Use the copy button to grab the value for CSS, HTML, or JSON
                payloads.
              </li>
              <li>
                Download the Base64 string as a text file to share with
                teammates.
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div
          class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Base64 output
          </p>
          <div class="flex flex-wrap items-center gap-2">
            <Copy text={base64} label="Copy string" floating={false} />
            <button
              class="rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-emerald-400 hover:text-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:border-emerald-400 dark:hover:text-emerald-300 dark:focus:ring-emerald-900"
              type="button"
              on:click={downloadTextFile}
              disabled={!base64}
            >
              Download .txt
            </button>
          </div>
        </div>
        <textarea
          class="mt-3 h-64 w-full rounded-2xl border border-slate-200 bg-white/70 p-4 text-[13px] font-mono text-slate-600 shadow-inner focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          readonly
          placeholder="Your Base64 data URL will appear here."
          value={base64}
        />
      </div>

      {#if errorMessage}
        <div
          class="rounded-2xl border border-rose-200 bg-rose-100/70 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200"
        >
          {errorMessage}
        </div>
      {/if}
    </div>

    <div class="flex flex-1 flex-col gap-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div
          class="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center"
        >
          {#if loading}
            <div
              class="flex flex-col items-center gap-3 text-sm text-slate-500 dark:text-slate-400"
            >
              <span
                class="h-6 w-6 animate-spin rounded-full border-2 border-slate-400 border-t-indigo-500"
              ></span>
              Processing image…
            </div>
          {:else if sourceUrl}
            <div
              class="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-inner dark:border-slate-700 dark:bg-slate-900/60"
            >
              <img
                alt="Uploaded preview"
                class="max-h-72 w-full rounded-xl object-contain"
                src={sourceUrl}
              />
            </div>
          {:else}
            <div
              class="rounded-2xl border border-dashed border-slate-300 bg-slate-100 px-6 py-10 text-sm text-slate-500 transition hover:border-indigo-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
              on:dragover={handleDragOver}
              on:drop={handleDrop}
            >
              Upload an image to generate the Base64 data URL. Drag and drop is
              supported on modern browsers.
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
