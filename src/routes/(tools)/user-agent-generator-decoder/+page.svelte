<script>
  const browsers = ["Chrome", "Firefox", "Safari", "Edge", "Opera"];
  const platforms = [
    "Windows NT 10.0; Win64; x64",
    "Macintosh; Intel Mac OS X 13_0",
    "X11; Linux x86_64",
    "iPhone; CPU iPhone OS 16_0 like Mac OS X",
    "Android 13; Mobile",
  ];
  const engines = [
    { name: "Blink", token: "AppleWebKit/537.36 (KHTML, like Gecko)" },
    { name: "Gecko", token: "Gecko/20100101" },
    { name: "WebKit", token: "AppleWebKit/605.1.15 (KHTML, like Gecko)" },
  ];

  let selectedBrowser = browsers[0];
  let selectedPlatform = platforms[0];
  let selectedEngine = engines[0];
  let browserVersion = "117.0.0";
  let isMobile = false;
  let isSafari = false;
  let generatedUA = "";
  let decodeInput = navigator.userAgent || "";
  let decoded = null;

  $: updateGenerated();
  $: parseDecode();

  function updateGenerated() {
    const platform = selectedPlatform;
    const engineToken = selectedEngine.token;
    const browserToken = buildBrowserToken(
      selectedBrowser,
      browserVersion,
      isMobile,
      isSafari,
    );
    const mobileSuffix = isMobile ? " Mobile" : "";
    generatedUA =
      `Mozilla/5.0 (${platform}${mobileSuffix}) ${engineToken} ${browserToken}`.trim();
  }

  function buildBrowserToken(browser, version, mobile, safari) {
    switch (browser) {
      case "Chrome":
        return `Chrome/${version} Safari/537.36`;
      case "Firefox":
        return `Firefox/${version}`;
      case "Safari":
        return safari
          ? `Version/${version} Safari/605.1.15`
          : `Version/${version} Safari/537.36`;
      case "Edge":
        return `Chrome/${version} Safari/537.36 Edg/${version}`;
      case "Opera":
        return `OPR/${version} Chrome/${version} Safari/537.36`;
      default:
        return `${browser}/${version}`;
    }
  }

  function parseDecode() {
    if (!decodeInput.trim()) {
      decoded = null;
      return;
    }
    const ua = decodeInput;
    decoded = {
      browser: detectBrowser(ua),
      os: detectOS(ua),
      device: detectDevice(ua),
      engine: detectEngine(ua),
    };
  }

  function detectBrowser(ua) {
    if (/Edg\//.test(ua)) return "Microsoft Edge";
    if (/OPR\//.test(ua)) return "Opera";
    if (/Chrome\//.test(ua)) return "Google Chrome";
    if (/Firefox\//.test(ua)) return "Mozilla Firefox";
    if (/Safari\//.test(ua)) return "Safari";
    return "Unknown browser";
  }

  function detectOS(ua) {
    if (/Windows NT 10/.test(ua)) return "Windows 10";
    if (/Mac OS X/.test(ua)) return "macOS";
    if (/Android/.test(ua)) return "Android";
    if (/iPhone|iPad/.test(ua)) return "iOS";
    if (/Linux/.test(ua)) return "Linux";
    return "Unknown OS";
  }

  function detectDevice(ua) {
    if (/Mobi|Android/.test(ua)) return "Mobile";
    if (/Tablet|iPad/.test(ua)) return "Tablet";
    return "Desktop";
  }

  function detectEngine(ua) {
    if (/Gecko\//.test(ua) && /Firefox\//.test(ua)) return "Gecko";
    if (/AppleWebKit/.test(ua) && /Chrome\//.test(ua)) return "Blink";
    if (/AppleWebKit/.test(ua)) return "WebKit";
    return "Unknown engine";
  }

  function copy(value) {
    navigator.clipboard?.writeText(value).catch(() => {
      /* ignore */
    });
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
    <div
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Generate user agent
      </h2>
      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Browser
        <select
          class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={selectedBrowser}
          on:change={updateGenerated}
        >
          {#each browsers as browser}
            <option value={browser}>{browser}</option>
          {/each}
        </select>
      </label>
      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Browser version
        <input
          class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={browserVersion}
          on:input={updateGenerated}
        />
      </label>
      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Platform
        <select
          class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={selectedPlatform}
          on:change={updateGenerated}
        >
          {#each platforms as platform}
            <option value={platform}>{platform}</option>
          {/each}
        </select>
      </label>
      <label class="text-sm font-semibold text-slate-700 dark:text-slate-200">
        Engine profile
        <select
          class="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={selectedEngine}
          on:change={updateGenerated}
        >
          {#each engines as engine}
            <option value={engine}>{engine.name}</option>
          {/each}
        </select>
      </label>
      <label
        class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        <input
          type="checkbox"
          bind:checked={isMobile}
          on:change={updateGenerated}
          class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        Mobile device
      </label>
      <label
        class="flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        <input
          type="checkbox"
          bind:checked={isSafari}
          on:change={updateGenerated}
          class="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        Safari-specific tokens
      </label>
      <div
        class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900/60"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Generated UA
        </p>
        <p class="mt-1 break-all text-sm text-slate-700 dark:text-slate-200">
          {generatedUA}
        </p>
        <button
          class="mt-3 inline-flex items-center justify-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          on:click={() => copy(generatedUA)}
        >
          Copy
        </button>
      </div>
    </div>

    <div
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
    >
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        Decode user agent
      </h2>
      <textarea
        class="min-h-[160px] w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
        bind:value={decodeInput}
        on:input={parseDecode}
        placeholder="Paste a user agent string to decode"
      ></textarea>

      {#if decoded}
        <div class="space-y-2 text-sm">
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Browser
            </p>
            <p class="text-slate-700 dark:text-slate-200">{decoded.browser}</p>
          </div>
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Operating system
            </p>
            <p class="text-slate-700 dark:text-slate-200">{decoded.os}</p>
          </div>
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Device
            </p>
            <p class="text-slate-700 dark:text-slate-200">{decoded.device}</p>
          </div>
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Rendering engine
            </p>
            <p class="text-slate-700 dark:text-slate-200">{decoded.engine}</p>
          </div>
        </div>
      {:else}
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Add a user agent to view the decoded summary.
        </p>
      {/if}
    </div>
  </div>
</section>
