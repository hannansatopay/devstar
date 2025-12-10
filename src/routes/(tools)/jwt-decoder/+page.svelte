<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import { browser } from "$app/environment";
  import { onDestroy } from "svelte";

  type Decoded = {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    signature: string | null;
    expiresAt?: number;
    issuedAt?: number;
  };

  type Sample = {
    label: string;
    description: string;
    token: string;
  };

  const samples: Sample[] = [
    {
      label: "Unsigned development token",
      description: "Basic JWT with mock claims for local testing.",
      token:
        "eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJpc3MiOiJEZXZzdGFyIiwic3ViIjoiamVhayIsImF1ZCI6ImFwcC5kZXZzdGFyIiwiaWF0IjoxNzAwMDAwMDAsImV4cCI6MTcwMDA4NjQwLCJyb2xlIjpbImRldmVsb3BlciIsIm1hbmFnZXIiXX0.",
    },
    {
      label: "Expired token",
      description: "Shows how expiration warnings surface in the UI.",
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJuYW1lIjoiQXZhIiwic3ViIjoiMTIzNDU2Nzg5MCIsImV4cCI6MTYwMDAwMDAwMCwiaXNzIjoiZGV2c3Rhci5hcHAifQ.dHaE3Ws0xS85d1KE7N_Jvni4QpI-MrANWsw2OPQ7M4w",
    },
  ];

  let token = samples[0].token;
  let decoded: Decoded | null = null;
  let error = "";
  let status = "";
  let autoDecode = true;
  let decodeHandle: ReturnType<typeof setTimeout> | undefined;

  function decodeToken() {
    error = "";
    status = "";
    decoded = null;

    if (!token.trim()) {
      error = "Paste a JWT above to decode.";
      return;
    }

    const parts = token.split(".");
    if (parts.length < 2) {
      error = "Invalid JWT: expecting header and payload segments.";
      return;
    }

    try {
      const header = parseSegment(parts[0]);
      const payload = parseSegment(parts[1]);
      const signature = parts[2] ?? null;
      decoded = {
        header,
        payload,
        signature,
        expiresAt: typeof payload.exp === "number" ? payload.exp : undefined,
        issuedAt: typeof payload.iat === "number" ? payload.iat : undefined,
      };
      status = "Token decoded successfully.";
      if (decoded.expiresAt) {
        const now = Math.floor(Date.now() / 1000);
        if (decoded.expiresAt < now) {
          status = "Token decoded - expired.";
        }
      }
    } catch (err) {
      console.error(err);
      error =
        err instanceof Error
          ? err.message
          : "Unable to decode token - verify signature and payload.";
    }
  }

  function parseSegment(segment: string) {
    const normalized = segment.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
    const jsonString = decodeBase64(padded);
    return JSON.parse(jsonString);
  }

  function decodeBase64(value: string) {
    if (typeof globalThis.atob === "function") {
      return globalThis.atob(value);
    }
    const buffer = (globalThis as any).Buffer;
    if (buffer) {
      return buffer.from(value, "base64").toString("utf-8");
    }
    throw new Error("Base64 decoding is not supported in this environment.");
  }

  function getDateLabel(unix?: number) {
    if (!unix) return "N/A";
    const date = new Date(unix * 1000);
    return `${date.toLocaleString()} (${unix})`;
  }

  function applySample(sample: Sample) {
    token = sample.token;
  }

  $: if (autoDecode && browser) {
    const snapshot = { token };
    clearTimeout(decodeHandle);
    decodeHandle = setTimeout(() => {
      if (snapshot.token === token) {
        decodeToken();
      }
    }, 160);
  }

  onDestroy(() => {
    clearTimeout(decodeHandle);
  });
</script>

<section class="space-y-6">
  <div class="grid gap-6 lg:grid-cols-3">
    <div class="space-y-6">
      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white/95 p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Token overview
        </p>
        <div class="grid gap-3 sm:grid-cols-2">
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Expiration
            </p>
            <p class="mt-1 font-semibold text-slate-900 dark:text-white">
              {decoded ? getDateLabel(decoded.expiresAt) : "N/A"}
            </p>
          </div>
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Issued at
            </p>
            <p class="mt-1 font-semibold text-slate-900 dark:text-white">
              {decoded ? getDateLabel(decoded.issuedAt) : "N/A"}
            </p>
          </div>
        </div>
      </div>

      <div
        class="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Quick samples
        </p>
        <div class="flex flex-col gap-3">
          {#each samples as sample}
            <button
              type="button"
              class="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm text-slate-600 transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200"
              on:click={() => applySample(sample)}
            >
              <span
                class="block text-sm font-semibold text-slate-800 dark:text-white"
              >
                {sample.label}
              </span>
              <span
                class="mt-1 block text-xs text-slate-500 dark:text-slate-400"
              >
                {sample.description}
              </span>
            </button>
          {/each}
        </div>

        <label
          class="flex items-center gap-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          <input
            class="size-4 rounded border border-slate-300 text-indigo-600 focus:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900 dark:text-indigo-400"
            type="checkbox"
            bind:checked={autoDecode}
          />
          Auto decode while typing
        </label>
        <button
          type="button"
          class="inline-flex items-center rounded-full border border-transparent bg-indigo-600 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          on:click={decodeToken}
        >
          Decode token
        </button>
      </div>
    </div>

    <div
      class="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
            JWT input
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400">
            Paste the full token including header, payload, and signature.
          </p>
        </div>
        <button
          type="button"
          class="rounded-full border border-transparent bg-slate-900 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
          on:click={() => (token = "")}
        >
          Clear
        </button>
      </div>
      <textarea
        class="mt-4 h-40 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 font-mono text-sm leading-relaxed text-slate-700 shadow-inner transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200 dark:focus:border-indigo-500 dark:focus:ring-indigo-700/40 sm:h-48"
        bind:value={token}
        spellcheck="false"
      />
      <div class="mt-4 flex flex-wrap items-center gap-3">
        <Copy text={token} label="Copy token" floating={false} />
        <button
          type="button"
          class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-600 dark:text-slate-300 dark:hover:border-indigo-400 dark:hover:text-indigo-200"
          on:click={async () => {
            try {
              const clipboard = await navigator.clipboard.readText();
              token = clipboard;
            } catch (clipboardError) {
              console.error("Clipboard read failed", clipboardError);
            }
          }}
        >
          Paste from clipboard
        </button>
      </div>
      {#if error}
        <p
          class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-200"
        >
          {error}
        </p>
      {/if}
      {#if status && !error}
        <p
          class="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200"
        >
          {status}
        </p>
      {/if}
    </div>

    <div
      class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition dark:border-slate-800 dark:bg-slate-900/85"
    >
      <div class="flex flex-wrap items-center justify-between gap-4">
        <h2 class="text-lg font-semibold text-slate-900 dark:text-white">
          Header & payload
        </h2>
        <Copy
          text={decoded
            ? JSON.stringify(
                { header: decoded.header, payload: decoded.payload },
                null,
                2,
              )
            : ""}
          label="Copy JSON"
          floating={false}
        />
      </div>

      {#if decoded}
        <div class="mt-4 grid gap-4">
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Header
            </p>
            <pre
              class="mt-2 overflow-auto rounded-xl bg-slate-900/95 p-4 font-mono text-xs text-emerald-200 dark:bg-black">
{JSON.stringify(decoded.header, null, 2)}</pre>
          </div>
          <div
            class="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/50"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Payload
            </p>
            <pre
              class="mt-2 overflow-auto rounded-xl bg-slate-900/95 p-4 font-mono text-xs text-emerald-200 dark:bg-black">
{JSON.stringify(decoded.payload, null, 2)}</pre>
          </div>
        </div>

        <div class="mt-4 space-y-3">
          <div
            class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
          >
            <span class="font-semibold">Signature</span>
            <div class="flex flex-wrap items-center gap-2">
              <code class="truncate font-mono text-xs">
                {decoded.signature ?? "N/A"}
              </code>
              <Copy
                text={decoded.signature ?? ""}
                label="Copy"
                floating={false}
              />
            </div>
          </div>
        </div>
      {:else}
        <p
          class="mt-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-300"
        >
          Decode a token to inspect its header and payload.
        </p>
      {/if}
    </div>
  </div>
</section>
