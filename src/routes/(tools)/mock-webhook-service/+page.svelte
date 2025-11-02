<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import { onDestroy } from "svelte";

  type LogEntry = {
    id: string;
    timestamp: string;
    event: string;
    payload: Record<string, unknown> | string;
    status: number;
  };

  const sampleEvents = [
    {
      event: "order.created",
      payload: {
        id: "ord_932",
        amount: 8900,
        currency: "USD",
        status: "pending",
      },
    },
    {
      event: "user.invited",
      payload: { id: "user_204", email: "team@example.com", role: "editor" },
    },
    {
      event: "invoice.paid",
      payload: { id: "inv_882", total: 12900, due_date: "2025-02-12" },
    },
  ];

  let endpointId = generateId();
  let baseUrl = "https://hooks.devstar.local/api";
  let httpMethod = "POST";
  let eventType = sampleEvents[0].event;
  let payload = JSON.stringify(sampleEvents[0].payload, null, 2);
  let responseStatus = 200;
  let autoSimulate = false;
  let simulateHandle: ReturnType<typeof setTimeout> | undefined;
  let logs: LogEntry[] = [];

  $: resolvedUrl = `${baseUrl.replace(/\/$/, "")}/${endpointId}`;
  $: curlSnippet = buildCurlSnippet();

  function generateId() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz0123456789";
    return Array.from(
      { length: 12 },
      () => alphabet[Math.floor(Math.random() * alphabet.length)],
    ).join("");
  }

  function resetEndpoint() {
    endpointId = generateId();
    logs = [];
  }

  function buildCurlSnippet() {
    return `curl -X ${httpMethod} \\
  '${resolvedUrl}' \\
  -H 'Content-Type: application/json' \\
  -H 'X-Webhook-Signature: demo-signature' \\
  -d '${payload.replace(/\s+/g, " ")}'`;
  }

  function tryParsePayload() {
    try {
      return JSON.parse(payload);
    } catch {
      return payload;
    }
  }

  function sendEvent(manual = false) {
    const body = tryParsePayload();
    const timestamp = new Date().toISOString();

    logs = [
      {
        id: `log_${Date.now()}`,
        timestamp,
        event: eventType,
        payload: body,
        status: responseStatus,
      },
      ...logs,
    ].slice(0, 24);

    if (!manual && autoSimulate) {
      scheduleSimulation();
    }
  }

  function scheduleSimulation() {
    clearTimeout(simulateHandle);
    if (!autoSimulate) return;
    simulateHandle = setTimeout(
      () => {
        const sample =
          sampleEvents[Math.floor(Math.random() * sampleEvents.length)];
        eventType = sample.event;
        payload = JSON.stringify(sample.payload, null, 2);
        sendEvent();
      },
      4000 + Math.random() * 4000,
    );
  }

  function applySample(sample: {
    event: string;
    payload: Record<string, unknown>;
  }) {
    eventType = sample.event;
    payload = JSON.stringify(sample.payload, null, 2);
  }

  onDestroy(() => {
    clearTimeout(simulateHandle);
  });
</script>

<section class="space-y-6">
  <div class="grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
    <!-- Endpoint -->
    <div class="space-y-6">
      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Endpoint
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Copy the mock URL into integration settings or CLI commands.
            </p>
          </div>
          <Copy text={resolvedUrl} label="Copy URL" floating={false} />
        </div>
        <div
          class="rounded-2xl border border-slate-200 bg-slate-100/70 px-4 py-3 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300"
        >
          {resolvedUrl}
        </div>
        <button
          type="button"
          class="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          on:click={resetEndpoint}
        >
          Generate new endpoint
        </button>
      </div>

      <!-- Request Builder -->
      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"
      >
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
              Request builder
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Swap between sample events or craft your own JSON payload.
            </p>
          </div>
          <Copy text={curlSnippet} label="Copy curl" floating={false} />
        </div>

        <!-- HTTP Method -->
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>HTTP method</span>
          <select
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            bind:value={httpMethod}
          >
            <option>POST</option>
            <option>PUT</option>
            <option>PATCH</option>
          </select>
        </label>

        <!-- Event Type -->
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Event type</span>
          <input
            class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            type="text"
            bind:value={eventType}
            placeholder="order.created"
          />
        </label>

        <!-- Response Status -->
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Response status</span>
          <input
            class="w-32 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            type="number"
            min="100"
            max="599"
            bind:value={responseStatus}
          />
        </label>

        <!-- Payload -->
        <label
          class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <span>Payload (JSON)</span>
          <textarea
            class="h-40 rounded-2xl border border-slate-300 bg-white px-3 py-3 font-mono text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
            bind:value={payload}
            spellcheck="false"
          />
        </label>

        <!-- Sample Buttons -->
        <div class="flex flex-wrap gap-2">
          {#each sampleEvents as sample}
            <button
              type="button"
              class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
              on:click={() => applySample(sample)}
            >
              {sample.event}
            </button>
          {/each}
        </div>

        <!-- Simulation Controls -->
        <div class="flex items-center justify-between">
          <div
            class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <input
              class="size-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900"
              type="checkbox"
              bind:checked={autoSimulate}
              on:change={() => {
                clearTimeout(simulateHandle);
                if (autoSimulate) scheduleSimulation();
              }}
            />
            Auto simulate
          </div>
          <button
            type="button"
            class="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            on:click={() => sendEvent(true)}
          >
            Send test event
          </button>
        </div>
      </div>
    </div>

    <!-- Logs -->
    <div
      class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Request log
        </h2>
        <span
          class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300"
        >
          {logs.length} events
        </span>
      </div>

      {#if logs.length === 0}
        <p class="text-sm text-slate-500 dark:text-slate-400">
          Fire your first test event to populate the console.
        </p>
      {:else}
        <div class="space-y-3">
          {#each logs as log}
            <div
              class="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
            >
              <div class="flex flex-wrap items-center justify-between gap-2">
                <span class="font-semibold text-indigo-600 dark:text-indigo-300"
                  >{log.event}</span
                >
                <span
                  class="font-mono text-xs text-slate-400 dark:text-slate-500"
                >
                  {new Date(log.timestamp).toLocaleString()}
                </span>
              </div>
              <p
                class="mt-1 text-xs uppercase tracking-wide text-slate-400 dark:text-slate-500"
              >
                Status - {log.status}
              </p>
              <pre
                class="mt-3 max-h-40 overflow-auto rounded-xl border border-slate-200 bg-white/80 p-3 font-mono text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
{typeof log.payload === "string"
                  ? log.payload
                  : JSON.stringify(log.payload, null, 2)}
              </pre>
            </div>
          {/each}
        </div>
      {/if}
    </div>
  </div>
</section>
