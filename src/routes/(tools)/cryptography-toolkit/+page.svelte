<script>
  import { browser } from "$app/environment";

  const digestAlgorithms = [
    {
      id: "SHA-256",
      label: "SHA-256",
      note: "Balanced security for general use.",
    },
    {
      id: "SHA-384",
      label: "SHA-384",
      note: "Longer digest for compliance or TLS certs.",
    },
    { id: "SHA-512", label: "SHA-512", note: "High-security SHA-2 variant." },
    { id: "SHA-1", label: "SHA-1", note: "Legacy compatibility only." },
  ];

  const hmacAlgorithms = [
    { id: "SHA-256", label: "HMAC-SHA-256" },
    { id: "SHA-384", label: "HMAC-SHA-384" },
    { id: "SHA-512", label: "HMAC-SHA-512" },
    { id: "SHA-1", label: "HMAC-SHA-1 (legacy)" },
  ];

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let cryptoAvailable = false;
  if (browser && typeof window !== "undefined") {
    cryptoAvailable = Boolean(window.crypto?.subtle);
  }

  let hashInput = "Cryptography transforms trust into math.";
  let selectedAlgorithm = digestAlgorithms[0].id;
  let hashStatus = { state: "idle", message: "Awaiting text input." };
  let hashHex = "";
  let hashBase64 = "";
  let hashTicket = 0;

  let expectedHash = "";
  let expectedFormat = "hex";
  $: digestMatch = (() => {
    const candidate = expectedHash.trim();
    if (!candidate || (!hashHex && !hashBase64)) return null;
    const source =
      expectedFormat === "hex"
        ? hashHex.replace(/\s+/g, "").toLowerCase()
        : hashBase64.replace(/\s+/g, "");
    const target =
      expectedFormat === "hex"
        ? candidate.replace(/\s+/g, "").toLowerCase()
        : candidate.replace(/\s+/g, "");
    if (!source) return null;
    return source === target;
  })();

  let selectedFile = null;
  let fileHashStatus = { state: "idle", message: "Select a file to hash." };
  let fileHashHex = "";
  let fileHashBase64 = "";

  let hmacSecret = "";
  let hmacMessage = "Integrity matters.";
  let hmacAlgorithm = hmacAlgorithms[0].id;
  let hmacHex = "";
  let hmacBase64 = "";
  let hmacStatus = { state: "idle", message: "Provide a secret and message." };

  let encodeInput =
    "Hashing, encoding, randomness, and integrity in one place.";
  let encodeOutput = "";
  let decodeInput = "";
  let decodeOutput = "";
  let decodeError = "";

  let randomByteSize = 32;
  let randomBytesHex = "";
  let randomBytesBase64 = "";
  let randomTimestamp = "";
  let randomUuid = "";

  let copyNotice = "";
  let copyTimer;

  function bytesToHex(bytes) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  function bytesToBase64(bytes) {
    if (typeof btoa === "function") {
      let binary = "";
      bytes.forEach((byte) => {
        binary += String.fromCharCode(byte);
      });
      return btoa(binary);
    }
    if (typeof Buffer !== "undefined") {
      return Buffer.from(bytes).toString("base64");
    }
    return "";
  }

  function base64ToBytes(value) {
    try {
      if (typeof atob === "function") {
        const binary = atob(value);
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index += 1) {
          bytes[index] = binary.charCodeAt(index);
        }
        return bytes;
      }
      if (typeof Buffer !== "undefined") {
        return new Uint8Array(Buffer.from(value, "base64"));
      }
    } catch {
      return null;
    }
    return null;
  }

  async function digestBuffer(buffer, algorithm) {
    const digest = await window.crypto.subtle.digest(algorithm, buffer);
    const bytes = new Uint8Array(digest);
    return {
      hex: bytesToHex(bytes),
      base64: bytesToBase64(bytes),
      byteLength: bytes.length,
    };
  }

  async function refreshTextDigest() {
    if (!browser || !cryptoAvailable) {
      hashStatus = {
        state: "error",
        message: "Web Crypto digest API is unavailable here.",
      };
      hashHex = "";
      hashBase64 = "";
      return;
    }

    const trimmed = hashInput.trim();
    if (!trimmed.length) {
      hashStatus = { state: "idle", message: "Awaiting text input." };
      hashHex = "";
      hashBase64 = "";
      return;
    }

    const ticket = ++hashTicket;
    hashStatus = {
      state: "working",
      message: `Computing ${selectedAlgorithm} digest...`,
    };

    try {
      const digest = await digestBuffer(
        encoder.encode(trimmed),
        selectedAlgorithm,
      );
      if (ticket !== hashTicket) return;
      hashHex = digest.hex;
      hashBase64 = digest.base64;
      hashStatus = {
        state: "success",
        message: `${digest.byteLength * 8}-bit digest ready.`,
      };
    } catch (error) {
      hashStatus = {
        state: "error",
        message:
          error instanceof Error ? error.message : "Unable to compute digest.",
      };
      hashHex = "";
      hashBase64 = "";
    }
  }

  $: refreshTextDigest();

  async function handleFileSelection(event) {
    if (!browser || !cryptoAvailable) {
      fileHashStatus = {
        state: "error",
        message: "Hashing is unavailable in this context.",
      };
      return;
    }
    const file = event?.target?.files?.[0];
    selectedFile = file ?? null;
    if (!file) {
      fileHashStatus = { state: "idle", message: "Select a file to hash." };
      fileHashHex = "";
      fileHashBase64 = "";
      return;
    }

    fileHashStatus = { state: "working", message: `Hashing "${file.name}"...` };
    try {
      const buffer = await file.arrayBuffer();
      const digest = await digestBuffer(buffer, selectedAlgorithm);
      fileHashHex = digest.hex;
      fileHashBase64 = digest.base64;
      fileHashStatus = {
        state: "success",
        message: `Digest created for ${file.size.toLocaleString()} bytes.`,
      };
    } catch (error) {
      fileHashHex = "";
      fileHashBase64 = "";
      fileHashStatus = {
        state: "error",
        message:
          error instanceof Error ? error.message : "Failed to hash this file.",
      };
    }
  }

  async function computeHmac() {
    if (!browser || !cryptoAvailable) {
      hmacStatus = {
        state: "error",
        message: "Web Crypto HMAC API is unavailable here.",
      };
      return;
    }
    if (!hmacSecret.trim()) {
      hmacStatus = {
        state: "error",
        message: "Enter a secret key to derive an HMAC.",
      };
      return;
    }
    hmacStatus = {
      state: "working",
      message: `Signing message with ${hmacAlgorithm}...`,
    };
    try {
      const key = await window.crypto.subtle.importKey(
        "raw",
        encoder.encode(hmacSecret),
        { name: "HMAC", hash: { name: hmacAlgorithm } },
        false,
        ["sign"],
      );
      const signature = await window.crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(hmacMessage),
      );
      const bytes = new Uint8Array(signature);
      hmacHex = bytesToHex(bytes);
      hmacBase64 = bytesToBase64(bytes);
      hmacStatus = { state: "success", message: "HMAC signature ready." };
    } catch (error) {
      hmacHex = "";
      hmacBase64 = "";
      hmacStatus = {
        state: "error",
        message:
          error instanceof Error ? error.message : "Unable to compute HMAC.",
      };
    }
  }

  $: encodeOutput = encodeInput.trim().length
    ? bytesToBase64(encoder.encode(encodeInput))
    : "";

  $: (() => {
    const value = decodeInput.trim();
    if (!value.length) {
      decodeOutput = "";
      decodeError = "";
      return;
    }
    const bytes = base64ToBytes(value);
    if (!bytes) {
      decodeOutput = "";
      decodeError = "The provided text is not valid Base64.";
      return;
    }
    try {
      decodeOutput = decoder.decode(bytes);
      decodeError = "";
    } catch (error) {
      decodeOutput = "";
      decodeError =
        error instanceof Error
          ? error.message
          : "Unable to decode bytes to UTF-8.";
    }
  })();

  function generateRandomMaterial() {
    if (!(browser && window.crypto?.getRandomValues)) {
      randomBytesHex = "";
      randomBytesBase64 = "";
      randomTimestamp =
        "crypto.getRandomValues is unavailable. Falling back to Math.random().";
      const size = Math.min(256, Math.max(8, Math.round(randomByteSize)));
      const buffer = new Uint8Array(size);
      for (let index = 0; index < buffer.length; index += 1) {
        buffer[index] = Math.floor(Math.random() * 256);
      }
      randomBytesHex = bytesToHex(buffer);
      randomBytesBase64 = bytesToBase64(buffer);
      randomUuid =
        cryptoAvailable && window.crypto?.randomUUID
          ? window.crypto.randomUUID()
          : "";
      return;
    }

    const size = Math.min(512, Math.max(8, Math.round(randomByteSize)));
    const buffer = new Uint8Array(size);
    const chunkSize = 65_536;
    for (let offset = 0; offset < buffer.length; offset += chunkSize) {
      const slice = buffer.subarray(
        offset,
        Math.min(offset + chunkSize, buffer.length),
      );
      window.crypto.getRandomValues(slice);
    }
    randomBytesHex = bytesToHex(buffer);
    randomBytesBase64 = bytesToBase64(buffer);
    randomTimestamp = `Generated ${size} bytes at ${new Date().toLocaleTimeString()}.`;
    randomUuid = window.crypto.randomUUID?.() ?? "";
  }

  function statusClasses(state) {
    if (state === "success") {
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200";
    }
    if (state === "error") {
      return "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200";
    }
    if (state === "working") {
      return "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200";
    }
    return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
  }

  async function copyValue(value, label) {
    if (!value || !browser) return;
    try {
      await navigator.clipboard.writeText(value);
      copyNotice = `${label} copied to clipboard.`;
    } catch (error) {
      copyNotice =
        error instanceof Error
          ? error.message
          : "Clipboard permissions were denied.";
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copyNotice = "";
    }, 1800);
  }

  $: hashStats = (() => {
    const bytes = encoder.encode(hashInput);
    return [
      { label: "Characters", value: hashInput.length.toLocaleString() },
      { label: "Bytes", value: bytes.length.toLocaleString() },
      {
        label: "Entropy (est.)",
        value: `${Math.min(bytes.length * 8, 4096)} bits`,
      },
    ];
  })();
</script>

<section class="space-y-6">
  {#if !cryptoAvailable}
    <div
      class="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800 shadow-sm dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
    >
      Web Crypto APIs are not available in this environment. Hashes, HMAC, and
      random bytes will remain empty until the page loads in a secure browser
      context.
    </div>
  {/if}

  <div class="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
    <div class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Text digest
            </p>
            <h2
              class="text-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              Hash text with modern algorithms
            </h2>
          </div>
          <select
            class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={selectedAlgorithm}
          >
            {#each digestAlgorithms as option}
              <option value={option.id}>{option.label}</option>
            {/each}
          </select>
        </div>
        <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {digestAlgorithms.find((item) => item.id === selectedAlgorithm)?.note}
        </p>

        <div class="mt-5 space-y-4">
          <label
            class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>Input text</span>
            <textarea
              class="h-40 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={hashInput}
              placeholder="Paste or type text to hash..."
            ></textarea>
          </label>

          <div class="grid gap-3 sm:grid-cols-3">
            {#each hashStats as stat}
              <div
                class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              >
                <p>{stat.label}</p>
                <p
                  class="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100"
                >
                  {stat.value}
                </p>
              </div>
            {/each}
          </div>

          <div
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <div class="flex items-center gap-2">
              <span
                class={`rounded-full px-2 py-0.5 font-semibold ${statusClasses(hashStatus.state)}`}
              >
                {hashStatus.state === "success"
                  ? "Ready"
                  : hashStatus.state === "error"
                    ? "Error"
                    : hashStatus.state === "working"
                      ? "Working"
                      : "Idle"}
              </span>
              <span class="font-medium text-slate-700 dark:text-slate-200"
                >{hashStatus.message}</span
              >
            </div>

            <div class="mt-3 space-y-3 font-mono">
              <div>
                <p
                  class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Hex digest
                </p>
                <textarea
                  class="mt-1 h-20 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  value={hashHex}
                  readonly
                ></textarea>
                <button
                  class="mt-2 inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
                  type="button"
                  on:click={() => copyValue(hashHex, "Hex digest")}
                  disabled={!hashHex}
                >
                  Copy hex
                </button>
              </div>

              <div>
                <p
                  class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
                >
                  Base64 digest
                </p>
                <textarea
                  class="mt-1 h-20 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  value={hashBase64}
                  readonly
                ></textarea>
                <button
                  class="mt-2 inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
                  type="button"
                  on:click={() => copyValue(hashBase64, "Base64 digest")}
                  disabled={!hashBase64}
                >
                  Copy Base64
                </button>
              </div>
            </div>
          </div>

          <div
            class="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Compare digest
            </p>
            <div class="mt-2 grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
              <input
                class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                bind:value={expectedHash}
                placeholder="Paste a known digest to check against..."
              />
              <select
                class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                bind:value={expectedFormat}
              >
                <option value="hex">Hex</option>
                <option value="base64">Base64</option>
              </select>
            </div>
            {#if digestMatch !== null}
              <div
                class="mt-3 rounded-lg border px-3 py-2 text-xs font-medium {digestMatch
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200'
                  : 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200'}"
              >
                {digestMatch ? "Match confirmed." : "Digest does not match."}
              </div>
            {/if}
          </div>
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              HMAC signer
            </p>
            <h2
              class="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              Authenticate content with keyed hashes
            </h2>
          </div>
          <select
            class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={hmacAlgorithm}
          >
            {#each hmacAlgorithms as option}
              <option value={option.id}>{option.label}</option>
            {/each}
          </select>
        </div>

        <div class="mt-4 space-y-3 text-sm">
          <label
            class="space-y-2 font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>Secret key</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="password"
              bind:value={hmacSecret}
              placeholder="Enter the shared secret or API key..."
            />
          </label>

          <label
            class="space-y-2 font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>Message</span>
            <textarea
              class="h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={hmacMessage}
              placeholder="Message that needs authentication..."
            ></textarea>
          </label>

          <button
            class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:focus:ring-indigo-700"
            type="button"
            on:click={computeHmac}
            disabled={!cryptoAvailable}
          >
            Generate HMAC
          </button>
        </div>

        <div
          class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <div class="flex items-center gap-2">
            <span
              class={`rounded-full px-2 py-0.5 font-semibold ${statusClasses(hmacStatus.state)}`}
            >
              {hmacStatus.state === "success"
                ? "Ready"
                : hmacStatus.state === "error"
                  ? "Error"
                  : hmacStatus.state === "working"
                    ? "Working"
                    : "Idle"}
            </span>
            <span class="font-medium text-slate-700 dark:text-slate-200"
              >{hmacStatus.message}</span
            >
          </div>
          <div class="mt-3 space-y-3 font-mono">
            <div>
              <p
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Hex
              </p>
              <textarea
                class="mt-1 h-16 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                value={hmacHex}
                readonly
              ></textarea>
            </div>
            <div>
              <p
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Base64
              </p>
              <textarea
                class="mt-1 h-16 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                value={hmacBase64}
                readonly
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Base64 utilities
        </p>
        <div class="mt-4 grid gap-4 md:grid-cols-2">
          <div class="space-y-3 text-sm">
            <label
              class="space-y-2 font-semibold text-slate-700 dark:text-slate-200"
            >
              <span>Encode text</span>
              <textarea
                class="h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                bind:value={encodeInput}
                placeholder="Write or paste text to encode..."
              ></textarea>
            </label>
            <textarea
              class="h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              value={encodeOutput}
              readonly
            ></textarea>
            <button
              class="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
              type="button"
              on:click={() => copyValue(encodeOutput, "Base64 output")}
              disabled={!encodeOutput}
            >
              Copy encoded text
            </button>
          </div>

          <div class="space-y-3 text-sm">
            <label
              class="space-y-2 font-semibold text-slate-700 dark:text-slate-200"
            >
              <span>Decode Base64</span>
              <textarea
                class="h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                bind:value={decodeInput}
                placeholder="Paste Base64 text..."
              ></textarea>
            </label>
            {#if decodeError}
              <div
                class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200"
              >
                {decodeError}
              </div>
            {/if}
            <textarea
              class="h-24 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              value={decodeOutput}
              readonly
            ></textarea>
            <button
              class="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
              type="button"
              on:click={() => copyValue(decodeOutput, "Decoded text")}
              disabled={!decodeOutput}
            >
              Copy decoded text
            </button>
          </div>
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Random material
            </p>
            <h2
              class="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              Generate secrets, tokens, and UUIDs
            </h2>
          </div>
          <div
            class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"
          >
            <label class="font-semibold">Bytes</label>
            <input
              class="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-center outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="number"
              min="8"
              max="512"
              bind:value={randomByteSize}
            />
          </div>
        </div>

        <button
          class="mt-4 inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-300 dark:focus:ring-emerald-700"
          type="button"
          on:click={generateRandomMaterial}
        >
          Generate random bytes
        </button>

        {#if randomTimestamp}
          <p class="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {randomTimestamp}
          </p>
        {/if}

        <div
          class="mt-4 space-y-3 font-mono text-[13px] text-slate-700 dark:text-slate-200"
        >
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Hex
            </p>
            <textarea
              class="mt-1 h-24 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              value={randomBytesHex}
              readonly
            ></textarea>
            <button
              class="mt-2 inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
              type="button"
              on:click={() => copyValue(randomBytesHex, "Random hex")}
              disabled={!randomBytesHex}
            >
              Copy hex
            </button>
          </div>

          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Base64
            </p>
            <textarea
              class="mt-1 h-20 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900"
              value={randomBytesBase64}
              readonly
            ></textarea>
            <button
              class="mt-2 inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
              type="button"
              on:click={() => copyValue(randomBytesBase64, "Random Base64")}
              disabled={!randomBytesBase64}
            >
              Copy Base64
            </button>
          </div>

          {#if randomUuid}
            <div>
              <p
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                UUID
              </p>
              <div
                class="mt-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                {randomUuid}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              File hashing
            </p>
            <h2
              class="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              Verify downloads with the same digest engine
            </h2>
          </div>
          <input
            class="w-full max-w-xs cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600 shadow-sm transition hover:bg-slate-100 focus:border-indigo-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:border-indigo-400"
            type="file"
            on:change={handleFileSelection}
          />
        </div>
        <div
          class="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <div class="flex items-center gap-2">
            <span
              class={`rounded-full px-2 py-0.5 font-semibold ${statusClasses(fileHashStatus.state)}`}
            >
              {fileHashStatus.state === "success"
                ? "Ready"
                : fileHashStatus.state === "error"
                  ? "Error"
                  : fileHashStatus.state === "working"
                    ? "Working"
                    : "Idle"}
            </span>
            <span class="font-medium text-slate-700 dark:text-slate-200"
              >{fileHashStatus.message}</span
            >
          </div>
          {#if selectedFile}
            <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
              {selectedFile.name} � {selectedFile.size.toLocaleString()} bytes
            </p>
          {/if}
          <div class="mt-3 space-y-3 font-mono">
            <div>
              <p
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Hex
              </p>
              <textarea
                class="mt-1 h-20 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                value={fileHashHex}
                readonly
              ></textarea>
            </div>
            <div>
              <p
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Base64
              </p>
              <textarea
                class="mt-1 h-20 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                value={fileHashBase64}
                readonly
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Best practices
        </p>
        <ul class="mt-3 space-y-2 leading-relaxed">
          <li class="flex gap-2">
            <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-500"
            ></span>
            <span
              >Prefer SHA-2 or SHA-3 families for new deployments. SHA-1 remains
              only for legacy compatibility.</span
            >
          </li>
          <li class="flex gap-2">
            <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-500"
            ></span>
            <span
              >Combine hashing with HMAC or digital signatures when authenticity
              matters, not just integrity.</span
            >
          </li>
          <li class="flex gap-2">
            <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-500"
            ></span>
            <span
              >Use random secrets from <code
                class="rounded bg-slate-800/60 px-1 py-0.5 text-xs text-slate-100"
                >crypto.getRandomValues</code
              > for tokens, API keys, and passphrases.</span
            >
          </li>
        </ul>

        {#if copyNotice}
          <div
            class="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200"
          >
            {copyNotice}
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
