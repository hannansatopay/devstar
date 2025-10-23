<script>
  const themes = {
    midnight: {
      bg: "bg-slate-900",
      text: "text-emerald-200",
      accent: "text-emerald-400",
      cursor: "bg-emerald-400",
    },
    classic: {
      bg: "bg-black",
      text: "text-green-200",
      accent: "text-green-400",
      cursor: "bg-green-400",
    },
    ocean: {
      bg: "bg-slate-950",
      text: "text-sky-200",
      accent: "text-sky-400",
      cursor: "bg-sky-400",
    },
  };

  const defaultLines = [
    {
      command: "pwd",
      output: "/home/developer",
    },
    {
      command: "ls -a",
      output: ".\n..\n.git\nsrc\npackage.json",
    },
    {
      command: "npm run dev",
      output:
        "> devstar@1.0.0 dev\n> vite\n\n  VITE v5.2.0  ready in 432 ms\n\n  ➜  Local:   http://localhost:5173/\n  ➜  Network: use --host to expose\n",
    },
  ];

  let username = "developer";
  let hostname = "starship";
  let promptSymbol = "$";
  let showPromptHint = true;
  let themeId = "midnight";
  let blinkCursor = true;
  let lines = [...defaultLines];
  let editingIndex = -1;
  let modal = { open: false, command: "", output: "" };

  $: theme = themes[themeId];

  function openModal(index = -1) {
    editingIndex = index;
    if (index >= 0) {
      modal = {
        open: true,
        command: lines[index].command,
        output: lines[index].output,
      };
    } else {
      modal = { open: true, command: "", output: "" };
    }
  }

  function closeModal() {
    modal = { open: false, command: "", output: "" };
  }

  function saveLine() {
    const command = modal.command.trim();
    const output = modal.output.replace(/\r\n/g, "\n").trim();
    if (!command) {
      return;
    }

    const record = {
      command,
      output,
    };

    if (editingIndex >= 0) {
      lines = lines.map((line, index) =>
        index === editingIndex ? record : line,
      );
    } else {
      lines = [...lines, record];
    }
    closeModal();
  }

  function deleteLine(index) {
    lines = lines.filter((_, idx) => idx !== index);
  }

  function resetDefaults() {
    lines = [...defaultLines];
    username = "developer";
    hostname = "starship";
    promptSymbol = "$";
    themeId = "midnight";
    blinkCursor = true;
    showPromptHint = true;
  }

  function buildTerminalText() {
    const prompt = `${username}@${hostname}`;
    const blocks = lines.map((line) => {
      const commandLine = `${prompt}:${promptSymbol} ${line.command}`;
      return line.output ? `${commandLine}\n${line.output}` : commandLine;
    });
    return blocks.join("\n\n");
  }

  function copyTerminal() {
    const text = buildTerminalText();
    navigator.clipboard?.writeText(text).catch(() => {
      /* ignore clipboard errors */
    });
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
    <div
      class="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="grid gap-4 md:grid-cols-2">
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Username
          <input
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-900"
            bind:value={username}
          />
        </label>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Hostname
          <input
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-900"
            bind:value={hostname}
          />
        </label>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Prompt symbol
          <input
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-900"
            maxlength="5"
            bind:value={promptSymbol}
          />
        </label>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Theme
          <select
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-900"
            bind:value={themeId}
          >
            {#each Object.keys(themes) as key}
              <option value={key}>{key}</option>
            {/each}
          </select>
        </label>
      </div>

      <div class="flex flex-wrap items-center gap-4">
        <label
          class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
            bind:checked={blinkCursor}
          />
          Animated cursor
        </label>
        <label
          class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <input
            type="checkbox"
            class="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
            bind:checked={showPromptHint}
          />
          Show prompt hint
        </label>
      </div>

      <div class="flex flex-wrap gap-3">
        <button
          class="inline-flex items-center rounded-full border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
          type="button"
          on:click={() => openModal()}
        >
          Add command
        </button>
        <button
          class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          type="button"
          on:click={resetDefaults}
        >
          Reset defaults
        </button>
        <button
          class="inline-flex items-center rounded-full border border-emerald-300 px-4 py-2 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
          type="button"
          on:click={copyTerminal}
        >
          Copy terminal
        </button>
      </div>

      {#if showPromptHint}
        <p class="text-xs text-slate-500 dark:text-slate-400">
          The terminal preview combines your username (<code>{username}</code>),
          hostname (<code>{hostname}</code>), and prompt symbol (<code>
            {promptSymbol}</code
          >) for each command.
        </p>
      {/if}

      <div class="space-y-3">
        {#each lines as line, index}
          <div
            class="items-start justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-slate-700 dark:bg-slate-900/60 md:flex"
          >
            <div class="space-y-1">
              <p class="font-semibold text-slate-800 dark:text-slate-100">
                {line.command}
              </p>
              {#if line.output}
                <pre
                  class="whitespace-pre-wrap text-xs text-slate-600 dark:text-slate-300">{line.output}</pre>
              {/if}
            </div>
            <div class="mt-3 flex gap-2 md:mt-0">
              <button
                class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                on:click={() => openModal(index)}
              >
                Edit
              </button>
              <button
                class="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-200"
                on:click={() => deleteLine(index)}
              >
                Remove
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <div
      class={`relative overflow-hidden rounded-2xl border border-slate-900 shadow-xl ${theme.bg}`}
    >
      <div class="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
        <span class="inline-flex h-3 w-3 rounded-full bg-rose-500"></span>
        <span class="inline-flex h-3 w-3 rounded-full bg-amber-400"></span>
        <span class="inline-flex h-3 w-3 rounded-full bg-emerald-500"></span>
      </div>
      <div
        class={`space-y-4 px-5 py-5 font-mono text-sm leading-6 ${theme.text}`}
      >
        {#each lines as line}
          <div>
            <div>
              <span class={`font-semibold ${theme.accent}`}>
                {username}@{hostname}
              </span>
              <span class={theme.accent}>:</span>
              <span class={theme.accent}>{promptSymbol}</span>
              &nbsp;{line.command}
              {#if blinkCursor}
                <span
                  class={`ml-1 inline-block h-4 w-1 align-middle ${theme.cursor} animate-pulse`}
                ></span>
              {/if}
            </div>
            {#if line.output}
              <pre
                class="mt-2 whitespace-pre-wrap text-xs text-slate-200 opacity-90">{line.output}</pre>
            {/if}
          </div>
        {/each}
      </div>
    </div>
  </div>

  {#if modal.open}
    <div
      class="fixed inset-0 z-10 flex items-center justify-center bg-black/60 px-4"
    >
      <div
        class="w-full max-w-lg space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900"
      >
        <h3 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {editingIndex >= 0 ? "Edit command" : "Add command"}
        </h3>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Command
          <input
            class="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-900"
            bind:value={modal.command}
            placeholder="npm run build"
          />
        </label>
        <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Output (optional)
          <textarea
            class="mt-1 min-h-[120px] w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-900"
            bind:value={modal.output}
            placeholder="Command output..."
          ></textarea>
        </label>
        <div class="flex items-center justify-end gap-3">
          <button
            class="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            on:click={closeModal}
          >
            Cancel
          </button>
          <button
            class="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            on:click={saveLine}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  {/if}
</section>
