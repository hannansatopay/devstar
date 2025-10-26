<script>
  import { onMount, onDestroy } from "svelte";
  import Copy from "$lib/Copy.svelte";

  const isBrowser = typeof window !== "undefined";

  let generatedAt = "";
  let exportPayload = "";
  let cards = [];
  let currentDetails = null;

  let cleanupFns = [];
  let connectionCleanup;

  onMount(() => {
    refreshDetails();
    if (!isBrowser) return;

    const handleChange = () => refreshDetails();

    const registerMediaListener = (query) => {
      if (!query) return;
      if (typeof query.addEventListener === "function") {
        query.addEventListener("change", handleChange);
        cleanupFns.push(() =>
          query.removeEventListener("change", handleChange),
        );
      } else if (typeof query.addListener === "function") {
        query.addListener(handleChange);
        cleanupFns.push(() => query.removeListener(handleChange));
      }
    };

    if (typeof window.matchMedia === "function") {
      registerMediaListener(window.matchMedia("(prefers-color-scheme: dark)"));
      registerMediaListener(window.matchMedia("(prefers-color-scheme: light)"));
      registerMediaListener(
        window.matchMedia("(prefers-reduced-motion: reduce)"),
      );
    }

    const resizeListener = () => refreshDetails();
    window.addEventListener("resize", resizeListener);
    cleanupFns.push(() => window.removeEventListener("resize", resizeListener));

    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (connection) {
      const listener = () => refreshDetails();
      if (typeof connection.addEventListener === "function") {
        connection.addEventListener("change", listener);
        connectionCleanup = () =>
          connection.removeEventListener("change", listener);
      } else if ("onchange" in connection) {
        connection.onchange = listener;
        connectionCleanup = () => (connection.onchange = null);
      }
    }
  });

  onDestroy(() => {
    cleanupFns.forEach((fn) => fn?.());
    cleanupFns = [];
    connectionCleanup?.();
  });

  function refreshDetails() {
    if (!isBrowser) {
      cards = [];
      exportPayload = "";
      currentDetails = null;
      return;
    }

    const details = collectDetails();
    generatedAt = new Date().toLocaleString();
    exportPayload = JSON.stringify(details, null, 2);
    currentDetails = details;
    cards = buildCards(details);
  }

  function downloadSnapshot() {
    if (!isBrowser || !exportPayload) return;
    const blob = new Blob([exportPayload], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "device-details.json";
    link.click();
    URL.revokeObjectURL(url);
  }

  function collectDetails() {
    const nav = navigator ?? {};
    const ua = nav.userAgent || "";
    const uaData = nav.userAgentData;
    const screenInfo = window.screen ?? {};
    const connection =
      nav.connection || nav.mozConnection || nav.webkitConnection;

    const os = detectOS(ua, uaData);
    const browser = detectBrowser(ua, uaData);

    const languages =
      nav.languages && nav.languages.length
        ? nav.languages.join(", ")
        : nav.language || "Not reported";

    const timezone = (() => {
      try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
      } catch (error) {
        return "Not reported";
      }
    })();

    const colorScheme = (() => {
      if (typeof window.matchMedia !== "function") return "no preference";
      const darkQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const lightQuery = window.matchMedia("(prefers-color-scheme: light)");
      if (darkQuery?.matches) return "dark";
      if (lightQuery?.matches) return "light";
      return "no preference";
    })();

    const motion = (() => {
      if (typeof window.matchMedia !== "function") return "no preference";
      const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      return reduceQuery?.matches ? "reduce" : "no preference";
    })();

    const logicalCores =
      typeof nav.hardwareConcurrency === "number"
        ? nav.hardwareConcurrency
        : "Not exposed";
    const deviceMemory =
      typeof nav.deviceMemory === "number"
        ? `${nav.deviceMemory} GB`
        : "Not exposed";
    const touchPoints =
      typeof nav.maxTouchPoints === "number"
        ? nav.maxTouchPoints
        : "ontouchstart" in window
          ? "Yes"
          : "No";

    return {
      platform: {
        operatingSystem:
          [os.name, os.version].filter(Boolean).join(" ") || "Not detected",
        architecture:
          uaData?.architecture || (ua.includes("64") ? "64-bit" : "32-bit"),
        timezone,
        locale: languages,
      },
      browser: {
        name:
          [browser.name, browser.version].filter(Boolean).join(" ") ||
          "Not detected",
        userAgent: ua,
        colorScheme,
        reducedMotion: motion,
        cookiesEnabled: nav.cookieEnabled ? "Enabled" : "Disabled",
        onlineStatus: navigator.onLine ? "Online" : "Offline",
      },
      hardware: {
        logicalCores,
        deviceMemory,
        touchSupport: touchPoints,
        clipboard:
          typeof navigator.clipboard === "object" ? "Available" : "Unavailable",
        serviceWorker:
          "serviceWorker" in navigator ? "Available" : "Unavailable",
        mediaDevices:
          (navigator.mediaDevices?.enumerateDevices
            ? "Exposed"
            : "Unavailable") +
          (nav.getUserMedia || navigator.mediaDevices?.getUserMedia
            ? ""
            : " (no getUserMedia)"),
      },
      display: {
        viewport: `${Math.round(window.innerWidth)} × ${Math.round(window.innerHeight)}`,
        screenResolution:
          screenInfo.width && screenInfo.height
            ? `${screenInfo.width} × ${screenInfo.height}`
            : "Unknown",
        pixelRatio: window.devicePixelRatio
          ? window.devicePixelRatio.toFixed(2)
          : "Unknown",
        colorDepth: screenInfo.colorDepth || "Unknown",
      },
      network: {
        effectiveType: connection?.effectiveType ?? "Unknown",
        downlink: connection?.downlink
          ? `${connection.downlink} Mbps`
          : "Unknown",
        rtt: connection?.rtt ? `${connection.rtt} ms` : "Unknown",
        saveData: connection?.saveData ? "Enabled" : "Disabled",
      },
    };
  }

  function buildCards(details) {
    return [
      {
        title: "Platform",
        rows: [
          {
            label: "Operating system",
            value: details.platform.operatingSystem,
          },
          { label: "Architecture", value: details.platform.architecture },
          { label: "Timezone", value: details.platform.timezone },
          { label: "Locale", value: details.platform.locale },
        ],
      },
      {
        title: "Browser",
        rows: [
          { label: "Name", value: details.browser.name },
          { label: "User agent", value: details.browser.userAgent },
          { label: "Color scheme", value: details.browser.colorScheme },
          { label: "Reduced motion", value: details.browser.reducedMotion },
          { label: "Cookies", value: details.browser.cookiesEnabled },
          { label: "Online status", value: details.browser.onlineStatus },
        ],
      },
      {
        title: "Hardware",
        rows: [
          { label: "Logical cores", value: details.hardware.logicalCores },
          { label: "Device memory", value: details.hardware.deviceMemory },
          { label: "Touch support", value: details.hardware.touchSupport },
          { label: "Clipboard API", value: details.hardware.clipboard },
          { label: "Service worker", value: details.hardware.serviceWorker },
          { label: "Media devices", value: details.hardware.mediaDevices },
        ],
      },
      {
        title: "Display",
        rows: [
          { label: "Viewport", value: details.display.viewport },
          {
            label: "Screen resolution",
            value: details.display.screenResolution,
          },
          { label: "Pixel ratio", value: details.display.pixelRatio },
          { label: "Color depth", value: details.display.colorDepth },
        ],
      },
      {
        title: "Network",
        rows: [
          { label: "Effective type", value: details.network.effectiveType },
          { label: "Downlink", value: details.network.downlink },
          { label: "RTT", value: details.network.rtt },
          { label: "Save-data", value: details.network.saveData },
        ],
      },
    ];
  }

  function cardPayload(card) {
    if (!card?.rows?.length) return "";
    const snapshot = {};
    for (const row of card.rows) {
      snapshot[row.label] = row.value;
    }
    return JSON.stringify(snapshot, null, 2);
  }

  function detectOS(ua, uaData) {
    if (uaData?.platform) return { name: uaData.platform };
    const map = [
      { regex: /windows nt 10/i, name: "Windows", version: "10" },
      { regex: /windows nt 6\.[3|2|1]/i, name: "Windows", version: "7/8" },
      {
        regex: /mac os x ([\d_]+)/i,
        name: "macOS",
        version: (match) => match.replace(/_/g, "."),
      },
      {
        regex: /iphone os ([\d_]+)/i,
        name: "iOS",
        version: (match) => match.replace(/_/g, "."),
      },
      {
        regex: /ipad; cpu os ([\d_]+)/i,
        name: "iPadOS",
        version: (match) => match.replace(/_/g, "."),
      },
      {
        regex: /android ([\d.]+)/i,
        name: "Android",
        version: (match) => match,
      },
      { regex: /linux/i, name: "Linux" },
    ];
    for (const entry of map) {
      const match = ua.match(entry.regex);
      if (match) {
        return {
          name: entry.name,
          version:
            typeof entry.version === "function"
              ? entry.version(match[1])
              : entry.version,
        };
      }
    }
    return { name: "Unknown" };
  }

  function detectBrowser(ua, uaData) {
    if (uaData?.brands?.length) {
      const brand =
        uaData.brands.find((item) => !/Chromium/i.test(item.brand)) ||
        uaData.brands[0];
      if (brand) {
        return { name: brand.brand, version: brand.version };
      }
    }
    const map = [
      { regex: /(edg|edge)\/([\d.]+)/i, name: "Microsoft Edge" },
      { regex: /chrome\/([\d.]+)/i, name: "Google Chrome" },
      { regex: /safari\/([\d.]+)/i, name: "Safari" },
      { regex: /firefox\/([\d.]+)/i, name: "Firefox" },
      { regex: /opr\/([\d.]+)/i, name: "Opera" },
    ];
    for (const entry of map) {
      const match = ua.match(entry.regex);
      if (match) {
        const version = match[2] ?? match[1];
        return { name: entry.name, version };
      }
    }
    return { name: "Unknown" };
  }

  $: quickFacts = currentDetails
    ? [
        {
          label: "Operating system",
          value: currentDetails.platform?.operatingSystem,
        },
        { label: "Browser", value: currentDetails.browser?.name },
        { label: "Timezone", value: currentDetails.platform?.timezone },
        { label: "Locale", value: currentDetails.platform?.locale },
        { label: "Viewport", value: currentDetails.display?.viewport },
        { label: "Network", value: currentDetails.network?.effectiveType },
      ].filter(
        (item) =>
          item.value &&
          !["Not detected", "Not reported", "Unknown"].includes(item.value),
      )
    : [];

  $: hardwareChips = currentDetails
    ? [
        {
          label: "Logical cores",
          value: currentDetails.hardware?.logicalCores,
        },
        {
          label: "Device memory",
          value: currentDetails.hardware?.deviceMemory,
        },
        {
          label: "Touch support",
          value: currentDetails.hardware?.touchSupport,
        },
        { label: "Pixel ratio", value: currentDetails.display?.pixelRatio },
      ].filter((item) => item.value && item.value !== "Not exposed")
    : [];
</script>

<section class="space-y-6">
  <header class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
    <article
      class="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
    >
      <Copy text={exportPayload} label="Copy JSON" />
      <div class="space-y-2">
        <span
          class="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300"
          >Live snapshot</span
        >
        <h1 class="text-2xl font-semibold text-slate-900 dark:text-white">
          Device details
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Inspect everything your browser shares about the current environment.
        </p>
      </div>
      <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Captured {generatedAt ? generatedAt : "pending browser context"}
      </p>

      {#if quickFacts.length}
        <dl class="mt-6 grid gap-4 sm:grid-cols-2">
          {#each quickFacts as fact}
            <div
              class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <dt
                class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                {fact.label}
              </dt>
              <dd
                class="mt-1 text-sm font-medium text-slate-900 dark:text-slate-100"
              >
                {fact.value}
              </dd>
            </div>
          {/each}
        </dl>
      {:else}
        <p class="mt-6 text-sm text-slate-500 dark:text-slate-400">
          Waiting for the browser to expose details. Refresh if nothing appears.
        </p>
      {/if}
    </article>

    <aside class="space-y-4">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">
          Controls
        </p>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Data stays on this device. Refresh after changing browser settings or
          screen size for an updated snapshot.
        </p>
        <div class="mt-4 flex flex-wrap items-center gap-3">
          <button
            class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700"
            type="button"
            on:click={refreshDetails}
          >
            Refresh snapshot
          </button>
          <button
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            type="button"
            on:click={downloadSnapshot}
          >
            Download JSON
          </button>
        </div>
        <div
          class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400"
        >
          Refresh triggers new measurements for viewport, media queries, and
          network information if available.
        </div>
      </div>

      {#if hardwareChips.length}
        <div
          class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Hardware glance
          </p>
          <ul class="mt-3 grid gap-3 sm:grid-cols-2">
            {#each hardwareChips as item}
              <li
                class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                <p
                  class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  {item.label}
                </p>
                <p
                  class="mt-1 font-semibold text-slate-900 dark:text-slate-100"
                >
                  {item.value}
                </p>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </aside>
  </header>

  <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    {#each cards as card}
      <article
        class="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md dark:border-slate-800 dark:bg-slate-900/80"
      >
        <Copy text={cardPayload(card)} label="Copy section" />
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          {card.title}
        </h2>
        <dl class="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
          {#each card.rows as row}
            <div
              class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <dt class="font-semibold text-slate-900 dark:text-slate-100">
                {row.label}
              </dt>
              <dd
                class="mt-1 break-words text-sm text-slate-700 dark:text-slate-300"
              >
                {row.value ?? "-"}
              </dd>
            </div>
          {/each}
        </dl>
      </article>
    {/each}
  </div>
</section>
