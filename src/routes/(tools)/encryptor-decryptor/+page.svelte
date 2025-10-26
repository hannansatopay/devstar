<script>
  import { browser } from "$app/environment";

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  const iterationPresets = [60000, 90000, 120000, 150000, 200000];
  const allowedKeyLengths = [128, 256];
  const MIN_ITERATIONS = 20000;
  const MAX_ITERATIONS = 400000;

  let cryptoAvailable =
    browser && typeof window !== "undefined" && Boolean(window.crypto?.subtle);

  let plainText = "Sensitive data deserves strong defaults.";
  let passphrase = "";
  let keyLength = 256;
  let iterations = 120000;
  let outputEncoding = "base64";

  let encryptedEnvelope = "";
  let ciphertextPreview = "";
  let encryptionStatus = {
    state: "idle",
    message: "Waiting for text and passphrase.",
  };
  let decryptInput = "";
  let decryptPassphrase = "";
  let decryptionStatus = { state: "idle", message: "Waiting for ciphertext." };
  let decryptedOutput = "";
  let envelopeDetails = null;
  let envelopeError = "";
  let copyHint = "";
  let copyTimer;

  function clampIterations(value) {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return 120000;
    return Math.min(
      MAX_ITERATIONS,
      Math.max(MIN_ITERATIONS, Math.round(numeric)),
    );
  }

  function clampKeyLength(value) {
    const numeric = Number(value);
    return allowedKeyLengths.includes(numeric) ? numeric : 256;
  }

  function bytesToHex(bytes) {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  function hexToBytes(hex) {
    const cleaned = hex.replace(/\s+/g, "");
    if (!/^[0-9a-fA-F]*$/.test(cleaned) || cleaned.length % 2 !== 0) {
      return null;
    }
    const bytes = new Uint8Array(cleaned.length / 2);
    for (let index = 0; index < cleaned.length; index += 2) {
      bytes[index / 2] = parseInt(cleaned.slice(index, index + 2), 16);
    }
    return bytes;
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

  function fillRandom(bytes) {
    if (!(browser && window.crypto?.getRandomValues)) {
      for (let index = 0; index < bytes.length; index += 1) {
        bytes[index] = Math.floor(Math.random() * 256);
      }
      return;
    }
    const chunkSize = 65_536;
    for (let offset = 0; offset < bytes.length; offset += chunkSize) {
      const slice = bytes.subarray(
        offset,
        Math.min(offset + chunkSize, bytes.length),
      );
      window.crypto.getRandomValues(slice);
    }
  }

  async function deriveKey(secret, salt, iterationCount, lengthBits) {
    const baseKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      "PBKDF2",
      false,
      ["deriveKey"],
    );
    return window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: iterationCount,
        hash: "SHA-256",
      },
      baseKey,
      { name: "AES-GCM", length: lengthBits },
      false,
      ["encrypt", "decrypt"],
    );
  }

  function describeEnvelope(envelope, cipherLength) {
    const saltBytes = base64ToBytes(envelope.salt) ?? new Uint8Array(0);
    const ivBytes = base64ToBytes(envelope.iv) ?? new Uint8Array(0);
    return [
      {
        label: "Cipher",
        value: `${envelope.cipher?.name ?? "AES-GCM"} (${envelope.cipher?.keyLength ?? 256}-bit)`,
      },
      {
        label: "Iterations",
        value: envelope.kdf?.iterations
          ? envelope.kdf.iterations.toLocaleString()
          : "Unknown",
      },
      {
        label: "Salt length",
        value: `${saltBytes.length} bytes`,
      },
      {
        label: "IV length",
        value: `${ivBytes.length} bytes`,
      },
      {
        label: "Ciphertext bytes",
        value: cipherLength.toLocaleString(),
      },
      {
        label: "Encoding",
        value: envelope.ciphertextEncoding ?? "base64",
      },
    ];
  }

  function describeLegacy(buffer, format) {
    return [
      {
        label: "Format",
        value: format === "hex" ? "Legacy hex blob" : "Legacy Base64 blob",
      },
      { label: "Total bytes", value: buffer.length.toLocaleString() },
      {
        label: "Salt length",
        value: buffer.length >= 16 ? "16 bytes" : "Unknown",
      },
      {
        label: "IV length",
        value: buffer.length >= 28 ? "12 bytes" : "Unknown",
      },
    ];
  }

  function setEnvelopeDetails(details) {
    envelopeDetails = details;
  }

  function setEnvelopeError(message) {
    envelopeError = message;
  }

  function clearClipboardHint() {
    clearTimeout(copyTimer);
    copyHint = "";
  }

  let parsedCipher = null;
  $: parsedCipher = (() => {
    const trimmed = decryptInput.trim();
    if (!trimmed.length) {
      setEnvelopeDetails(null);
      setEnvelopeError("");
      return null;
    }
    const parsed = parseEnvelope(trimmed);
    if (parsed.kind === "invalid") {
      setEnvelopeDetails(null);
      setEnvelopeError(parsed.error);
    } else if (parsed.kind === "json") {
      setEnvelopeDetails(
        describeEnvelope(parsed.envelope, parsed.cipherBytes.length),
      );
      setEnvelopeError("");
    } else if (
      parsed.kind === "legacy-base64" ||
      parsed.kind === "legacy-hex"
    ) {
      setEnvelopeDetails(
        describeLegacy(
          parsed.buffer,
          parsed.kind === "legacy-hex" ? "hex" : "base64",
        ),
      );
      setEnvelopeError("");
    } else {
      setEnvelopeDetails(null);
      setEnvelopeError("");
    }
    return parsed;
  })();

  function parseEnvelope(value) {
    const trimmed = value.trim();
    if (!trimmed.length) {
      return { kind: "empty" };
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed && parsed.ciphertext && parsed.salt && parsed.iv) {
        const encoding = parsed.ciphertextEncoding === "hex" ? "hex" : "base64";
        const cipherBytes =
          encoding === "hex"
            ? hexToBytes(parsed.ciphertext)
            : base64ToBytes(parsed.ciphertext);
        const saltBytes = base64ToBytes(parsed.salt);
        const ivBytes = base64ToBytes(parsed.iv);
        if (cipherBytes && saltBytes && ivBytes) {
          return {
            kind: "json",
            envelope: parsed,
            encoding,
            cipherBytes,
            saltBytes,
            ivBytes,
          };
        }
      }
    } catch {
      // fall through to legacy parsing
    }
    const base64Bytes = base64ToBytes(trimmed);
    if (base64Bytes && base64Bytes.length > 28) {
      return { kind: "legacy-base64", buffer: base64Bytes };
    }
    if (
      /^[0-9a-fA-F]+$/.test(trimmed) &&
      trimmed.length % 2 === 0 &&
      trimmed.length >= 120
    ) {
      const hexBytes = hexToBytes(trimmed);
      if (hexBytes && hexBytes.length > 28) {
        return { kind: "legacy-hex", buffer: hexBytes };
      }
    }
    return {
      kind: "invalid",
      error: "Ciphertext must be JSON, Base64, or hex produced by this tool.",
    };
  }

  async function encrypt() {
    if (!cryptoAvailable) {
      encryptionStatus = {
        state: "error",
        message: "Web Crypto API is unavailable in this environment.",
      };
      return;
    }
    const trimmedText = plainText.trim();
    if (!trimmedText.length) {
      encryptionStatus = {
        state: "error",
        message: "Enter some text to encrypt.",
      };
      return;
    }
    if (!passphrase.trim().length) {
      encryptionStatus = {
        state: "error",
        message: "Enter a passphrase to derive the encryption key.",
      };
      return;
    }
    const iterationCount = clampIterations(iterations);
    const lengthBits = clampKeyLength(keyLength);
    const salt = new Uint8Array(16);
    const iv = new Uint8Array(12);
    fillRandom(salt);
    fillRandom(iv);
    encryptionStatus = {
      state: "working",
      message: "Encrypting with AES-GCM...",
    };
    try {
      const key = await deriveKey(passphrase, salt, iterationCount, lengthBits);
      const cipherBuffer = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encoder.encode(trimmedText),
      );
      const cipherBytes = new Uint8Array(cipherBuffer);
      const envelope = {
        version: 1,
        cipher: { name: "AES-GCM", keyLength: lengthBits },
        kdf: { name: "PBKDF2", hash: "SHA-256", iterations: iterationCount },
        salt: bytesToBase64(salt),
        iv: bytesToBase64(iv),
        ciphertextEncoding: outputEncoding,
        ciphertext:
          outputEncoding === "hex"
            ? bytesToHex(cipherBytes)
            : bytesToBase64(cipherBytes),
      };
      encryptedEnvelope = JSON.stringify(envelope, null, 2);
      ciphertextPreview = envelope.ciphertext;
      decryptInput = encryptedEnvelope;
      decryptedOutput = "";
      setEnvelopeDetails(describeEnvelope(envelope, cipherBytes.length));
      setEnvelopeError("");
      encryptionStatus = {
        state: "success",
        message: `Encrypted ${cipherBytes.length.toLocaleString()} bytes with ${iterationCount.toLocaleString()} PBKDF2 iterations.`,
      };
      decryptionStatus = {
        state: "idle",
        message: "Ciphertext ready for decryption.",
      };
    } catch (error) {
      encryptionStatus = {
        state: "error",
        message: error instanceof Error ? error.message : "Encryption failed.",
      };
    }
  }

  async function decrypt() {
    if (!cryptoAvailable) {
      decryptionStatus = {
        state: "error",
        message: "Web Crypto API is unavailable in this environment.",
      };
      return;
    }
    if (!decryptInput.trim().length) {
      decryptionStatus = {
        state: "error",
        message: "Paste a ciphertext envelope first.",
      };
      return;
    }
    if (!decryptPassphrase.trim().length) {
      decryptionStatus = {
        state: "error",
        message: "Enter the passphrase used during encryption.",
      };
      return;
    }
    const parsed = parseEnvelope(decryptInput);
    if (parsed.kind === "invalid") {
      decryptionStatus = { state: "error", message: parsed.error };
      return;
    }
    if (parsed.kind === "empty") {
      decryptionStatus = { state: "error", message: "Ciphertext is empty." };
      return;
    }
    try {
      decryptionStatus = {
        state: "working",
        message: "Attempting to decrypt...",
      };
      let salt;
      let iv;
      let data;
      let iterationCount = clampIterations(iterations);
      let lengthBits = clampKeyLength(keyLength);
      if (parsed.kind === "json") {
        salt = parsed.saltBytes;
        iv = parsed.ivBytes;
        data = parsed.cipherBytes;
        iterationCount = parsed.envelope.kdf?.iterations
          ? clampIterations(parsed.envelope.kdf.iterations)
          : iterationCount;
        lengthBits = parsed.envelope.cipher?.keyLength
          ? clampKeyLength(parsed.envelope.cipher.keyLength)
          : lengthBits;
      } else if (
        parsed.kind === "legacy-base64" ||
        parsed.kind === "legacy-hex"
      ) {
        const buffer = parsed.buffer;
        if (buffer.length <= 28) {
          throw new Error("Ciphertext is truncated and cannot be decrypted.");
        }
        salt = buffer.slice(0, 16);
        iv = buffer.slice(16, 28);
        data = buffer.slice(28);
      } else {
        decryptionStatus = {
          state: "error",
          message: "Unsupported envelope format.",
        };
        return;
      }
      const key = await deriveKey(
        decryptPassphrase,
        salt,
        iterationCount,
        lengthBits,
      );
      const plainBuffer = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data,
      );
      decryptedOutput = decoder.decode(new Uint8Array(plainBuffer));
      decryptionStatus = { state: "success", message: "Decryption succeeded." };
    } catch (error) {
      decryptedOutput = "";
      decryptionStatus = {
        state: "error",
        message:
          error instanceof Error && error.message
            ? error.message
            : "Unable to decrypt with the provided passphrase.",
      };
    }
  }

  function resetEncryption() {
    plainText = "";
    passphrase = "";
    encryptedEnvelope = "";
    ciphertextPreview = "";
    encryptionStatus = {
      state: "idle",
      message: "Waiting for text and passphrase.",
    };
  }

  function resetDecryption() {
    decryptInput = "";
    decryptPassphrase = "";
    decryptedOutput = "";
    decryptionStatus = { state: "idle", message: "Waiting for ciphertext." };
    setEnvelopeDetails(null);
    setEnvelopeError("");
  }

  function generatePassphrase() {
    if (!(browser && window.crypto?.getRandomValues)) {
      passphrase =
        Math.random().toString(36).slice(2, 10) +
        Math.random().toString(36).slice(2, 10);
      return;
    }
    const buffer = new Uint8Array(24);
    fillRandom(buffer);
    const base = bytesToBase64(buffer).replace(/[^A-Za-z0-9]/g, "");
    passphrase = (base.slice(0, 20) || base).padEnd(20, "x");
  }

  async function copyValue(value, label) {
    if (!value || !browser) return;
    try {
      await navigator.clipboard.writeText(value);
      copyHint = `${label} copied to clipboard.`;
    } catch (error) {
      copyHint =
        error instanceof Error
          ? error.message
          : "Clipboard permissions were denied.";
    }
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
      copyHint = "";
    }, 1800);
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

  $: iterations = clampIterations(iterations);
</script>

<section class="space-y-6">
  {#if !cryptoAvailable}
    <div
      class="rounded-2xl border border-amber-300 bg-amber-50 p-6 text-sm text-amber-800 shadow-sm dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-200"
    >
      Web Crypto APIs are not available in this environment. Encryption and
      decryption output will remain empty until the page is opened in a secure
      browser context.
    </div>
  {/if}

  <div class="grid gap-8 lg:grid-cols-2">
    <div
      class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Encrypt
          </p>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
            Convert plain text into a sharable AES-GCM envelope
          </h2>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            class="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            type="button"
            on:click={resetEncryption}
          >
            Reset
          </button>
        </div>
      </div>

      <div class="mt-5 space-y-4">
        <label
          class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          <span>Plain text</span>
          <textarea
            class="h-36 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={plainText}
            placeholder="Enter the content to encrypt..."
          ></textarea>
        </label>

        <div class="grid gap-3 md:grid-cols-[minmax(0,1fr)_auto]">
          <label
            class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>Passphrase</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="password"
              bind:value={passphrase}
              placeholder="Minimum 8 characters"
            />
          </label>
          <button
            class="self-end rounded-full border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            type="button"
            on:click={generatePassphrase}
          >
            Generate passphrase
          </button>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Key length
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              {#each allowedKeyLengths as length}
                <button
                  class={`rounded-full px-3 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 ${
                    keyLength === length
                      ? "border-indigo-600 bg-indigo-600 text-white focus:ring-indigo-300 dark:border-indigo-400 dark:bg-indigo-500 dark:text-white dark:focus:ring-indigo-600"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-100 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
                  }`}
                  type="button"
                  on:click={() => (keyLength = length)}
                >
                  {length}-bit
                </button>
              {/each}
            </div>
          </div>

          <div
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Ciphertext encoding
            </p>
            <div class="mt-2 flex flex-wrap gap-2">
              {#each ["base64", "hex"] as option}
                <button
                  class={`rounded-full px-3 py-1 text-xs font-semibold transition focus:outline-none focus:ring-2 ${
                    outputEncoding === option
                      ? "border-emerald-600 bg-emerald-600 text-white focus:ring-emerald-300 dark:border-emerald-400 dark:bg-emerald-500 dark:text-white dark:focus:ring-emerald-600"
                      : "border border-slate-300 text-slate-600 hover:bg-slate-100 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
                  }`}
                  type="button"
                  on:click={() => (outputEncoding = option)}
                >
                  {option.toUpperCase()}
                </button>
              {/each}
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div
            class="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>PBKDF2 iterations</span>
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400"
              >{iterations.toLocaleString()}</span
            >
          </div>
          <input
            class="w-full accent-indigo-600"
            type="range"
            min="60000"
            max="200000"
            step="1000"
            bind:value={iterations}
          />
          <div
            class="flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400"
          >
            {#each iterationPresets as preset}
              <button
                class="rounded-full border border-slate-300 px-2 py-1 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
                type="button"
                on:click={() => (iterations = preset)}
              >
                {preset.toLocaleString()}
              </button>
            {/each}
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <button
            class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:focus:ring-indigo-700"
            type="button"
            on:click={encrypt}
            disabled={!cryptoAvailable}
          >
            Encrypt text
          </button>
          <button
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            type="button"
            on:click={() => copyValue(encryptedEnvelope, "Envelope JSON")}
            disabled={!encryptedEnvelope}
          >
            Copy envelope JSON
          </button>
          <button
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            type="button"
            on:click={() => copyValue(ciphertextPreview, "Ciphertext")}
            disabled={!ciphertextPreview}
          >
            Copy ciphertext
          </button>
        </div>
      </div>

      <div class="mt-5 space-y-4">
        <div
          class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
        >
          <div class="flex items-center gap-2">
            <span
              class={`rounded-full px-2 py-0.5 font-semibold ${statusClasses(encryptionStatus.state)}`}
            >
              {encryptionStatus.state === "success"
                ? "Success"
                : encryptionStatus.state === "error"
                  ? "Error"
                  : encryptionStatus.state === "working"
                    ? "Working"
                    : "Idle"}
            </span>
            <span class="font-medium text-slate-700 dark:text-slate-200"
              >{encryptionStatus.message}</span
            >
          </div>
          {#if encryptedEnvelope}
            <textarea
              class="mt-3 h-32 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              value={encryptedEnvelope}
              readonly
            ></textarea>
          {/if}
        </div>

        {#if ciphertextPreview}
          <div
            class="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Ciphertext preview
            </p>
            <p
              class="mt-2 break-all font-mono text-[13px] text-slate-700 dark:text-slate-200"
            >
              {ciphertextPreview}
            </p>
          </div>
        {/if}

        {#if envelopeDetails}
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Envelope summary
            </p>
            <div class="mt-3 grid gap-3 sm:grid-cols-2">
              {#each envelopeDetails as item}
                <div
                  class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                >
                  <p>{item.label}</p>
                  <p
                    class="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100"
                  >
                    {item.value}
                  </p>
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </div>
    </div>
    <div class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Decrypt
            </p>
            <h2
              class="text-xl font-semibold text-slate-900 dark:text-slate-100"
            >
              Restore the original text from an exported envelope
            </h2>
          </div>
          <button
            class="inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            type="button"
            on:click={resetDecryption}
          >
            Reset
          </button>
        </div>

        <div class="mt-5 space-y-4">
          <label
            class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>Encrypted envelope</span>
            <textarea
              class="h-40 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={decryptInput}
              placeholder="Paste the JSON, Base64, or hex produced by this tool..."
            ></textarea>
          </label>
          {#if envelopeError}
            <div
              class="rounded-lg border border-rose-300 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-800 dark:bg-rose-900/20 dark:text-rose-200"
            >
              {envelopeError}
            </div>
          {/if}

          <label
            class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
          >
            <span>Passphrase</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              type="password"
              bind:value={decryptPassphrase}
              placeholder="The same passphrase used for encryption"
            />
          </label>

          <div class="flex flex-wrap items-center gap-3">
            <button
              class="inline-flex items-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:bg-emerald-300 dark:focus:ring-emerald-700"
              type="button"
              on:click={decrypt}
              disabled={!cryptoAvailable}
            >
              Decrypt ciphertext
            </button>
          </div>
        </div>

        <div class="mt-5 space-y-3">
          <div
            class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
          >
            <div class="flex items-center gap-2">
              <span
                class={`rounded-full px-2 py-0.5 font-semibold ${statusClasses(decryptionStatus.state)}`}
              >
                {decryptionStatus.state === "success"
                  ? "Success"
                  : decryptionStatus.state === "error"
                    ? "Error"
                    : decryptionStatus.state === "working"
                      ? "Working"
                      : "Idle"}
              </span>
              <span class="font-medium text-slate-700 dark:text-slate-200"
                >{decryptionStatus.message}</span
              >
            </div>
            {#if decryptedOutput}
              <textarea
                class="mt-3 h-28 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-[13px] text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                value={decryptedOutput}
                readonly
              ></textarea>
              <button
                class="mt-2 inline-flex items-center rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
                type="button"
                on:click={() => copyValue(decryptedOutput, "Plain text")}
              >
                Copy plain text
              </button>
            {/if}
          </div>

          {#if envelopeDetails}
            <div
              class="rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
            >
              <p
                class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
              >
                Envelope details
              </p>
              <div class="mt-3 grid gap-3 sm:grid-cols-2">
                {#each envelopeDetails as item}
                  <div
                    class="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
                  >
                    <p>{item.label}</p>
                    <p
                      class="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100"
                    >
                      {item.value}
                    </p>
                  </div>
                {/each}
              </div>
            </div>
          {/if}
        </div>
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Implementation notes
        </p>
        <ul class="mt-3 space-y-2 leading-relaxed">
          <li class="flex gap-2">
            <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-500"
            ></span>
            <span
              >The envelope stores salt, IV, iterations, and ciphertext so
              recipients only supply the passphrase.</span
            >
          </li>
          <li class="flex gap-2">
            <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-500"
            ></span>
            <span
              >AES-GCM provides confidentiality and integrity. Tampering with
              the envelope causes decryption to fail.</span
            >
          </li>
          <li class="flex gap-2">
            <span class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-500"
            ></span>
            <span
              >Legacy envelopes (salt + IV + ciphertext) are still supported.
              Use the JSON format to capture iterations.</span
            >
          </li>
        </ul>

        {#if copyHint}
          <div
            class="mt-4 rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200"
          >
            {copyHint}
          </div>
        {/if}
      </div>
    </div>
  </div>
</section>
