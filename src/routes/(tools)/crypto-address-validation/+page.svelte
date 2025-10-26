<script>
  import { browser } from "$app/environment";

  const networks = [
    {
      id: "bitcoin",
      label: "Bitcoin (BTC)",
      badge: "BTC",
      description:
        "Supports legacy (1), script (3), and Bech32 (bc1) addresses.",
      patterns: [/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, /^bc1[0-9a-z]{25,87}$/i],
      checksum: {
        type: "base58",
        applies: (value) => /^[13]/.test(value),
      },
      sample: "bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kygt080",
      hints: [
        "Bitcoin addresses are case sensitive; avoid typing them manually.",
        "Bech32 (bc1…) addresses are always lowercase.",
      ],
    },
    {
      id: "ethereum",
      label: "Ethereum (ETH)",
      badge: "ETH",
      description: "Checksums follow EIP-55 for mixed-case addresses.",
      patterns: [/^0x[a-fA-F0-9]{40}$/],
      checksum: {
        type: "hex",
        applies: (value) => /^0x/.test(value),
      },
      sample: "0xde0B295669a9FD93d5F28D9Ec85E40f4cb697BAe",
      hints: [
        "Lowercase or uppercase addresses skip checksum enforcement.",
        "For smart-contract deposits, confirm network (Mainnet vs. L2).",
      ],
    },
    {
      id: "litecoin",
      label: "Litecoin (LTC)",
      badge: "LTC",
      description: "Legacy (L/M) and Bech32 (ltc1) formats.",
      patterns: [
        /^[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}$/,
        /^ltc1[0-9a-z]{39,59}$/i,
      ],
      checksum: {
        type: "base58",
        applies: (value) => /^[LM3]/.test(value),
      },
      sample: "ltc1qgaw92vxq6xk7df8n2z2gqzcnf0p6l5fa5h0h3f",
      hints: ["M addresses are SegWit-compatible P2SH formats."],
    },
    {
      id: "ripple",
      label: "XRP (Ripple)",
      badge: "XRP",
      description: "Base58 (r…) with optional destination tags.",
      patterns: [/^r[1-9A-HJ-NP-Za-km-z]{25,34}$/],
      checksum: null,
      sample: "rEb8TK3gBgk5auZkwc6sHnwrGVJH8DuaLh",
      hints: [
        "Ripple addresses may require a destination tag for exchanges.",
        "Digits 0, O, I, and l are excluded to avoid confusion.",
      ],
    },
    {
      id: "bitcoin-cash",
      label: "Bitcoin Cash (BCH)",
      badge: "BCH",
      description: "CashAddr format with optional bitcoincash: prefix.",
      patterns: [/^(bitcoincash:)?(q|p)[a-z0-9]{41}$/],
      checksum: null,
      sample: "bitcoincash:qzt0h3e2ln9yhma8udm6hsvsv9j8k37uk0p6m7f3xr",
      hints: [
        "Legacy BCH addresses can collide with BTC—use CashAddr when possible.",
        "Always retain the bitcoincash: prefix when sharing.",
      ],
    },
    {
      id: "cardano",
      label: "Cardano (ADA)",
      badge: "ADA",
      description: "Shelley-era Bech32 addresses (addr1…).",
      patterns: [/^addr1[0-9a-z]{58}$/],
      checksum: null,
      sample:
        "addr1qx2fxvxezfq3p5c5zucvch2v6l2gmx0au7k82d9vwy4n7f5u9wj06eq6k9r5gj5qs7z92l4vk0x8rmyukt8y8n5l7x7qqcsaqd",
      hints: [
        "Stake (stake1…) addresses are for delegation, not payments.",
        "Testnet addresses start with addr_test1.",
      ],
    },
    {
      id: "polkadot",
      label: "Polkadot (DOT)",
      badge: "DOT",
      description: "SS58 format (starts with 1).",
      patterns: [/^1[0-9A-HJ-NP-Za-km-z]{47}$/],
      checksum: {
        type: "base58",
        applies: (value) => /^1/.test(value),
      },
      sample: "1zugcac7JQeS6Xw1Vg9tE5biBHgz1N1C77V5YyuvMz6z6kP",
      hints: [
        "Kusama uses a different SS58 prefix—ensure you select the correct network.",
        "Check the crowdloan or parachain requirements before transferring.",
      ],
    },
    {
      id: "dogecoin",
      label: "Dogecoin (DOGE)",
      badge: "DOGE",
      description: "Legacy Base58 (starts with D).",
      patterns: [/^D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}$/],
      checksum: {
        type: "base58",
        applies: (value) => /^D/.test(value),
      },
      sample: "DJ7z5sAbQW5x1G3rG8ZfgaCaygS1MsfG6h",
      hints: ["If the address starts with A or 9 it is a testnet wallet."],
    },
  ];

  const alphabet = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

  let selectedId = networks[0].id;
  $: selectedNetwork =
    networks.find((item) => item.id === selectedId) ?? networks[0];

  let address = "";
  let touched = false;
  let isChecking = false;
  let result = {
    status: "idle",
    message: "Enter an address to validate.",
  };

  let supportsSubtle = false;
  if (browser && typeof window !== "undefined") {
    supportsSubtle = Boolean(window.crypto?.subtle);
  }

  let debounceHandle;

  function scheduleValidation() {
    touched = true;
    clearTimeout(debounceHandle);
    debounceHandle = setTimeout(() => {
      void handleValidate();
    }, 300);
  }

  async function handleValidate() {
    if (!browser) return;
    const candidate = address.trim();

    if (!candidate.length) {
      result = { status: "idle", message: "Enter an address to validate." };
      return;
    }

    isChecking = true;
    try {
      result = await validateAddress(candidate, selectedNetwork);
    } catch (error) {
      result = {
        status: "error",
        message: "Unable to validate this address.",
        debug: error instanceof Error ? error.message : String(error),
      };
    } finally {
      isChecking = false;
    }
  }

  async function validateAddress(value, network) {
    const matchesPattern = network.patterns.some((matcher) =>
      matcher.test(value),
    );

    if (!matchesPattern) {
      return {
        status: "invalid",
        message: `This does not match any known ${network.label} address format.`,
        details: [
          { label: "Expected pattern", value: network.description },
          { label: "Sample", value: network.sample },
        ],
        notes: [
          "Addresses should be copied exactly; even a single character difference invalidates them.",
          ...(network.hints ?? []),
        ],
      };
    }

    let checksumVerified = false;
    if (
      network.checksum &&
      network.checksum.type === "base58" &&
      network.checksum.applies(value) &&
      supportsSubtle
    ) {
      checksumVerified = await validateBase58(value);
      if (!checksumVerified) {
        return {
          status: "invalid",
          message: "Checksum validation failed. The address might be mistyped.",
          details: [
            { label: "Network", value: network.label },
            { label: "Format", value: describeFormat(value) },
          ],
          notes: [
            "Check for hidden spaces or swapped characters before trying again.",
            ...(network.hints ?? []),
          ],
        };
      }
    }

    return {
      status: "valid",
      message: `This ${network.label} address looks valid.`,
      details: [
        { label: "Network", value: network.label },
        { label: "Format", value: describeFormat(value) },
        {
          label: "Validation",
          value: checksumVerified
            ? "Checksum verified"
            : network.checksum
              ? "Pattern validated"
              : "Pattern validated",
        },
      ],
      notes: [
        ...(supportsSubtle || !network.checksum
          ? []
          : ["Checksum validation is unavailable in this environment."]),
        ...(network.hints ?? []),
      ],
      sample: network.sample,
    };
  }

  function describeFormat(value) {
    if (/^bc1/i.test(value)) return "Bech32 (SegWit)";
    if (/^ltc1/i.test(value)) return "Bech32";
    if (/^0x/i.test(value)) return "Hex (EIP-55 compatible)";
    if (/^addr1/i.test(value)) return "Bech32 (Shelley)";
    if (/^bitcoincash:/i.test(value)) return "CashAddr";
    if (/^[13LM3D]/.test(value)) return "Base58";
    return "Alphanumeric";
  }

  function base58Decode(input) {
    let value = 0n;
    for (const char of input) {
      const index = alphabet.indexOf(char);
      if (index === -1) {
        return null;
      }
      value = value * 58n + BigInt(index);
    }

    const bytes = [];
    while (value > 0n) {
      bytes.push(Number(value % 256n));
      value /= 256n;
    }
    bytes.reverse();

    const leadingZeros = input.match(/^1+/)?.[0].length ?? 0;
    const resultBytes = new Uint8Array(leadingZeros + bytes.length);
    for (let index = 0; index < bytes.length; index += 1) {
      resultBytes[leadingZeros + index] = bytes[index];
    }
    return resultBytes;
  }

  async function validateBase58(input) {
    if (!supportsSubtle || !browser || typeof window === "undefined")
      return false;
    const decoded = base58Decode(input);
    if (!decoded || decoded.length < 5) return false;

    const payload = decoded.slice(0, -4);
    const checksum = decoded.slice(-4);
    const first = await window.crypto.subtle.digest("SHA-256", payload);
    const second = await window.crypto.subtle.digest("SHA-256", first);
    const expected = new Uint8Array(second).slice(0, 4);

    return checksum.every((byte, index) => byte === expected[index]);
  }

  $: badgeClasses =
    result.status === "valid"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-200"
      : result.status === "invalid"
        ? "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-200"
        : result.status === "error"
          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-200"
          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
</script>

<section class="space-y-6">
  <div class="grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
    <div
      class="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
    >
      <div class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p
            class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Network
          </p>
          <h2 class="text-xl font-semibold text-slate-900 dark:text-slate-100">
            {selectedNetwork.label}
          </h2>
        </div>
        <span
          class="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-200"
        >
          {selectedNetwork.badge}
        </span>
      </div>

      <label class="space-y-2">
        <span class="text-sm font-semibold text-slate-700 dark:text-slate-200"
          >Choose a network</span
        >
        <select
          class="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
          bind:value={selectedId}
          on:change={scheduleValidation}
        >
          {#each networks as option}
            <option value={option.id}>{option.label}</option>
          {/each}
        </select>
      </label>

      <form class="space-y-3" on:submit|preventDefault={handleValidate}>
        <label class="space-y-2">
          <span class="text-sm font-semibold text-slate-700 dark:text-slate-200"
            >Wallet address</span
          >
          <textarea
            class="h-32 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
            bind:value={address}
            placeholder={`Paste a ${selectedNetwork.label} address here…`}
            on:input={scheduleValidation}
          ></textarea>
        </label>

        <div class="flex flex-wrap items-center gap-3">
          <button
            class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:focus:ring-indigo-700"
            type="submit"
            disabled={isChecking}
          >
            {#if isChecking}
              <span
                class="mr-2 inline-flex h-3 w-3 animate-spin rounded-full border-2 border-white/70 border-t-transparent"
              ></span>
            {/if}
            Validate address
          </button>
          <button
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            type="button"
            on:click={() => {
              address = selectedNetwork.sample;
              scheduleValidation();
            }}
          >
            Try sample
          </button>
          <button
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            type="button"
            on:click={() => {
              address = "";
              touched = false;
              result = {
                status: "idle",
                message: "Enter an address to validate.",
              };
            }}
          >
            Clear
          </button>
        </div>
      </form>

      <div
        class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Format guide
        </p>
        <p class="mt-2 leading-relaxed">{selectedNetwork.description}</p>
        <div
          class="mt-3 rounded-lg bg-white px-3 py-2 text-xs font-mono text-slate-600 shadow-sm dark:bg-slate-950 dark:text-slate-400"
        >
          Example: {selectedNetwork.sample}
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
      >
        <div class="flex items-start justify-between gap-4">
          <div>
            <p
              class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Status
            </p>
            <p
              class="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              {result.message}
            </p>
          </div>
          <span
            class={`rounded-full px-3 py-1 text-xs font-semibold ${badgeClasses}`}
          >
            {result.status === "valid"
              ? "Valid"
              : result.status === "invalid"
                ? "Invalid"
                : result.status === "error"
                  ? "Error"
                  : "Idle"}
          </span>
        </div>

        {#if result.details?.length}
          <div class="mt-4 grid gap-3 sm:grid-cols-2">
            {#each result.details as detail}
              <div
                class="rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs uppercase tracking-wide text-slate-500 shadow-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
              >
                <p>{detail.label}</p>
                <p
                  class="mt-1 text-sm font-semibold text-slate-900 dark:text-slate-100 wrap break-all"
                >
                  {detail.value}
                </p>
              </div>
            {/each}
          </div>
        {/if}

        {#if result.debug}
          <p class="mt-3 text-xs text-amber-600 dark:text-amber-300">
            {result.debug}
          </p>
        {/if}
      </div>

      <div
        class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Network checklist
        </p>
        <ul
          class="mt-3 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-200"
        >
          {#if result.notes?.length}
            {#each result.notes as note}
              <li class="flex gap-2">
                <span
                  class="mt-1 h-1.5 w-1.5 flex-none rounded-full bg-indigo-500"
                ></span>
                <span>{note}</span>
              </li>
            {/each}
          {:else}
            <li class="text-slate-500 dark:text-slate-400">
              Validation tips for {selectedNetwork.label} will appear here once you
              test an address.
            </li>
          {/if}
        </ul>

        <div
          class="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-mono text-slate-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
        >
          {#if touched && address.trim().length}
            {address.trim()}
          {:else}
            Paste an address to inspect the exact string that will be validated.
          {/if}
        </div>
      </div>
    </div>
  </div>
</section>
