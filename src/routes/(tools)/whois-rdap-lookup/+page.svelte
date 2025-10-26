<script>
  import Copy from "$lib/Copy.svelte";

  const isBrowser = typeof window !== "undefined";

  let query = "example.com";
  let loading = false;
  let rdapResponse = null;
  let parsed = null;
  let errorMessage = "";
  let showRaw = false;
  let history = [];

  function classifyQuery(value) {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const ipv4 = /^(?:\d{1,3}\.){3}\d{1,3}$/.test(trimmed);
    const ipv6 = /^[0-9a-f:]+$/i.test(trimmed) && trimmed.includes(":");
    if (ipv4 || ipv6)
      return { endpoint: `https://rdap.org/ip/${trimmed}`, kind: "ip" };
    const domain = /^[a-z0-9.-]+\.[a-z]{2,}$/i.test(trimmed);
    if (domain)
      return { endpoint: `https://rdap.org/domain/${trimmed}`, kind: "domain" };
    return null;
  }

  async function runLookup() {
    if (!isBrowser) return;
    const classification = classifyQuery(query);
    if (!classification) {
      errorMessage = "Enter a valid domain or IP address.";
      return;
    }
    loading = true;
    errorMessage = "";
    rdapResponse = null;
    parsed = null;

    try {
      const response = await fetch(classification.endpoint, {
        headers: { accept: "application/rdap+json, application/json" },
      });
      if (!response.ok)
        throw new Error(`RDAP service returned ${response.status}`);
      const json = await response.json();
      rdapResponse = json;
      parsed = parseRdap(json);
      history = [
        {
          id: `${query}_${Date.now()}`,
          query,
          kind: classification.kind,
          parsed,
          timestamp: new Date().toLocaleString(),
        },
        ...history,
      ].slice(0, 6);
    } catch (error) {
      errorMessage =
        error instanceof Error ? error.message : "WHOIS lookup failed.";
    } finally {
      loading = false;
    }
  }

  function parseRdap(data) {
    if (!data) return null;
    const events = (data.events ?? []).map((event) => ({
      action: event.eventAction,
      timestamp: event.eventDate,
    }));
    const nameservers = (data.nameservers ?? []).map(
      (ns) => ns.ldhName ?? ns.handle,
    );
    const status = data.status ?? [];
    const registrar = (data.entities ?? []).find((entity) =>
      (entity.roles ?? []).includes("registrar"),
    );
    const contacts = (data.entities ?? []).filter((entity) =>
      (entity.roles ?? []).some((role) => role !== "registrar"),
    );
    return {
      handle: data.handle,
      ldhName: data.ldhName ?? data.name,
      unicodeName: data.unicodeName,
      port43: data.port43,
      status,
      events,
      nameservers,
      registrar: registrar
        ? {
            name: registrar.vcardArray?.[1]?.find(
              (entry) => entry[0] === "fn",
            )?.[3],
            handle: registrar.handle,
            roles: registrar.roles,
          }
        : null,
      contacts: contacts.map((entity) => ({
        handle: entity.handle,
        name: entity.vcardArray?.[1]?.find((entry) => entry[0] === "fn")?.[3],
        roles: entity.roles,
      })),
      links: data.links ?? [],
    };
  }

  function whoisCommand() {
    const trimmed = query.trim();
    return trimmed ? `whois ${trimmed}` : "";
  }

  function downloadRdap() {
    if (!rdapResponse) return;
    const blob = new Blob([JSON.stringify(rdapResponse, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${(query.trim() || "whois").replace(/[^\w.-]+/g, "_")}-rdap.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function sectionPayload(value) {
    if (!value) return "";
    return typeof value === "string" ? value : JSON.stringify(value, null, 2);
  }

  $: summaryBadges = parsed
    ? [
        parsed.ldhName ? { label: "Object", value: parsed.ldhName } : null,
        parsed.status?.[0]
          ? { label: "Status", value: parsed.status[0] }
          : null,
        parsed.registrar?.name
          ? { label: "Registrar", value: parsed.registrar.name }
          : null,
      ].filter(Boolean)
    : [];

  $: nameserverList = parsed?.nameservers ?? [];
  $: timeline = parsed?.events ?? [];
</script>

<section class="space-y-6">
  <header class="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
    <article
      class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
    >
      <span
        class="text-xs font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-300"
        >Domain intelligence</span
      >
      <h1 class="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
        WHOIS & RDAP inspector
      </h1>
      <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Query global RDAP registries for domains or IP addresses, extract
        registrar details, status history, and keep a recent lookup trail.
      </p>
      <form
        class="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_160px]"
        on:submit|preventDefault={runLookup}
      >
        <label
          class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Domain or IP address</span>
          <input
            class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            placeholder="example.com"
            bind:value={query}
          />
        </label>
        <div
          class="flex flex-wrap items-center gap-3 sm:flex-col sm:items-stretch sm:justify-start"
        >
          <button
            class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:focus:ring-indigo-700"
            type="submit"
            disabled={loading}
          >
            {#if loading}
              <span
                class="mr-2 inline-flex h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
              ></span>
            {/if}
            Run lookup
          </button>
          <button
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            type="button"
            on:click={() => {
              query = "";
              parsed = null;
              rdapResponse = null;
              errorMessage = "";
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {#if errorMessage}
        <div
          class="mt-4 rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200"
        >
          {errorMessage}
        </div>
      {/if}

      {#if summaryBadges.length}
        <ul class="mt-4 flex flex-wrap gap-2 text-xs">
          {#each summaryBadges as badge}
            <li
              class="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
            >
              {badge.label}:
              <span class="ml-1 font-normal">{badge.value}</span>
            </li>
          {/each}
        </ul>
      {/if}
    </article>

    <aside
      class="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
    >
      {#if whoisCommand()}
        <Copy text={whoisCommand()} label="Copy whois command" />
      {/if}
      <p
        class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-4"
      >
        Command line
      </p>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">
        Use the <code
          class="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-slate-800"
          >whois</code
        > utility locally to validate registrar data or automate monitoring.
      </p>
      <pre
        class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">{whoisCommand() ||
          "whois example.com"}</pre>
      <div class="mt-4 flex flex-wrap gap-3">
        <button
          class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
          type="button"
          disabled={!rdapResponse}
          on:click={() => (showRaw = !showRaw)}
        >
          {showRaw ? "Hide raw JSON" : "Show raw JSON"}
        </button>
        <button
          class="inline-flex items-center rounded-full border border-indigo-300 px-4 py-2 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed dark:border-indigo-800 dark:text-indigo-200 dark:hover:bg-indigo-900/20 dark:focus:ring-indigo-700"
          type="button"
          disabled={!rdapResponse}
          on:click={downloadRdap}
        >
          Download RDAP JSON
        </button>
      </div>
    </aside>
  </header>

  <div class="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.55fr)]">
    <div class="space-y-6">
      <article
        class="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <Copy text={sectionPayload(parsed)} label="Copy summary" />
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-4"
        >
          Registration summary
        </h2>
        {#if parsed}
          <dl
            class="mt-4 grid gap-3 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-2"
          >
            <div
              class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Handle
              </dt>
              <dd class="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                {parsed.handle ?? "-"}
              </dd>
            </div>
            <div
              class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                LDH name
              </dt>
              <dd class="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                {parsed.ldhName ?? "-"}
              </dd>
            </div>
            <div
              class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Unicode
              </dt>
              <dd class="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                {parsed.unicodeName ?? "-"}
              </dd>
            </div>
            <div
              class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <dt
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Port 43
              </dt>
              <dd class="mt-1 font-semibold text-slate-900 dark:text-slate-100">
                {parsed.port43 ?? "Not provided"}
              </dd>
            </div>
          </dl>
          <div
            class="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Status codes
            </p>
            <div class="mt-2 flex flex-wrap gap-2 text-xs">
              {#if parsed.status?.length}
                {#each parsed.status as statusCode}
                  <span
                    class="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 font-semibold text-indigo-700 dark:border-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-200"
                    >{statusCode}</span
                  >
                {/each}
              {:else}
                <span class="text-slate-500 dark:text-slate-400"
                  >Not published</span
                >
              {/if}
            </div>
          </div>
        {:else}
          <p class="mt-4 text-sm text-slate-500 dark:text-slate-400">
            Run a lookup to populate RDAP registration details.
          </p>
        {/if}
      </article>

      <article
        class="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <Copy text={sectionPayload(nameserverList)} label="Copy nameservers" />
        <div class="flex items-center justify-between gap-3 mt-4">
          <h2
            class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Nameservers
          </h2>
          <span class="text-xs text-slate-500 dark:text-slate-400"
            >{nameserverList.length} listed</span
          >
        </div>
        {#if nameserverList.length}
          <ul class="mt-4 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            {#each nameserverList as ns}
              <li
                class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-[13px] dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                {ns}
              </li>
            {/each}
          </ul>
        {:else}
          <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
            No nameservers listed for this object.
          </p>
        {/if}
      </article>

      <article
        class="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <Copy text={sectionPayload(timeline)} label="Copy timeline" />
        <h2
          class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mt-4"
        >
          Lifecycle events
        </h2>
        {#if timeline.length}
          <ul class="mt-4 space-y-3 text-sm text-slate-700 dark:text-slate-200">
            {#each timeline as event}
              <li
                class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
              >
                <p
                  class="font-semibold capitalize text-slate-900 dark:text-slate-100"
                >
                  {event.action?.replace(/_/g, " ") ?? "Unknown event"}
                </p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {event.timestamp ?? "-"}
                </p>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="mt-4 text-xs text-slate-500 dark:text-slate-400">
            This registry response does not expose event history.
          </p>
        {/if}
      </article>

      {#if showRaw && rdapResponse}
        <div
          class="relative rounded-2xl border border-slate-200 bg-slate-50 p-6 text-xs text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <Copy
            text={JSON.stringify(rdapResponse, null, 2)}
            label="Copy raw JSON"
          />
          <div class="flex items-center justify-between gap-3 mt-4">
            <span
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Raw RDAP JSON</span
            >
            <span class="text-xs text-slate-500 dark:text-slate-400"
              >size {(JSON.stringify(rdapResponse).length / 1024).toFixed(1)} KB</span
            >
          </div>
          <pre
            class="mt-3 max-h-[420px] overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-200 bg-white p-4 font-mono text-[12px] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">{JSON.stringify(
              rdapResponse,
              null,
              2,
            )}</pre>
        </div>
      {/if}
    </div>

    <aside class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Registrar
        </p>
        {#if parsed?.registrar}
          <div
            class="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200"
          >
            <p class="font-semibold text-slate-900 dark:text-slate-100">
              {parsed.registrar.name ?? "Unknown registrar"}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Handle: {parsed.registrar.handle ?? "-"}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Roles: {(parsed.registrar.roles ?? []).join(", ") || "-"}
            </p>
          </div>
        {:else}
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Registrar information not provided.
          </p>
        {/if}
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Contacts
        </p>
        {#if parsed?.contacts?.length}
          <ul class="mt-3 space-y-2 text-sm text-slate-700 dark:text-slate-200">
            {#each parsed.contacts as contact}
              <li
                class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-900"
              >
                <p class="font-semibold text-slate-900 dark:text-slate-100">
                  {contact.name ?? contact.handle ?? "Unknown contact"}
                </p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Roles: {(contact.roles ?? []).join(", ") || "-"}
                </p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Handle: {contact.handle ?? "-"}
                </p>
              </li>
            {/each}
          </ul>
        {:else}
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            Contact roles not exposed for this record.
          </p>
        {/if}
      </div>

      {#if history.length}
        <div
          class="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
        >
          <div class="flex items-center justify-between gap-3">
            <span
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >Recent lookups</span
            >
            <button
              class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
              type="button"
              on:click={() => (history = [])}
            >
              Clear
            </button>
          </div>
          <ul class="mt-3 space-y-3">
            {#each history as item}
              <li
                class="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-indigo-500 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-indigo-500 dark:hover:bg-slate-900/60"
                on:click={() => {
                  query = item.query;
                  parsed = item.parsed;
                  rdapResponse = null;
                  runLookup();
                }}
              >
                <div
                  class="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400"
                >
                  <span>{item.timestamp}</span>
                  <span class="uppercase text-indigo-600 dark:text-indigo-300"
                    >{item.kind}</span
                  >
                </div>
                <p
                  class="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100"
                >
                  {item.query}
                </p>
                <p class="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {item.parsed?.status?.[0] ?? "status unknown"}
                </p>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </aside>
  </div>
</section>
