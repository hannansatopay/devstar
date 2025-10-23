<script>
  const defaultHost = "https://example.com";

  let host = defaultHost;
  let loading = false;
  let errorMessage = "";
  let certificate = null;

  async function checkSsl() {
    if (!host.trim()) {
      errorMessage = "Enter a domain or URL.";
      return;
    }

    loading = true;
    errorMessage = "";
    certificate = null;

    try {
      const response = await fetch(
        `/api/ssl-checker?host=${encodeURIComponent(host.trim())}`,
      );
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(
          payload?.error ?? `Request failed with status ${response.status}`,
        );
      }
      certificate = payload;
    } catch (error) {
      errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to retrieve SSL certificate information.";
    } finally {
      loading = false;
    }
  }

  function formatDate(input) {
    if (!input) {
      return "Unknown";
    }
    const date = new Date(input);
    if (Number.isNaN(date.getTime())) {
      return "Unknown";
    }
    return date.toLocaleString();
  }
</script>

<section class="mx-auto space-y-6 px-4 py-6">
  <div
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="flex flex-col gap-3 md:flex-row">
      <input
        class="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-400 dark:focus:ring-emerald-900"
        bind:value={host}
        placeholder="https://example.com"
      />
      <button
        class="inline-flex items-center justify-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
        on:click={checkSsl}
        disabled={loading}
      >
        {loading ? "Checking..." : "Check SSL"}
      </button>
    </div>
    {#if errorMessage}
      <p class="mt-2 text-xs text-rose-500 dark:text-rose-300">
        {errorMessage}
      </p>
    {:else}
      <p class="mt-2 text-xs text-slate-500 dark:text-slate-400">
        We connect directly to port 443 using a short-lived TLS handshake and
        report certificate dates, fingerprints, and alternate names. Make sure
        the domain allows standard HTTPS connections.
      </p>
    {/if}
  </div>

  {#if certificate}
    <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div
        class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Certificate overview
        </h2>
        <dl class="grid gap-3 text-sm md:grid-cols-2">
          <div
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Host
            </p>
            <p class="text-slate-700 dark:text-slate-200">{certificate.host}</p>
          </div>
          <div
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Certificate status
            </p>
            <p
              class="font-semibold"
              class:text-emerald-600={certificate.isValid}
              class:text-rose-600={!certificate.isValid}
            >
              {certificate.isValid === null
                ? "Unknown"
                : certificate.isValid
                  ? "Valid"
                  : "Expired"}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Valid from
            </p>
            <p class="text-slate-700 dark:text-slate-200">
              {formatDate(certificate.validFrom)}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Valid to
            </p>
            <p class="text-slate-700 dark:text-slate-200">
              {formatDate(certificate.validTo)}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Days remaining
            </p>
            <p class="text-slate-700 dark:text-slate-200">
              {certificate.daysRemaining ?? "Unknown"}
            </p>
          </div>
          <div
            class="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/60"
          >
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              Fingerprint (SHA256)
            </p>
            <p class="break-all text-slate-700 dark:text-slate-200">
              {certificate.fingerprint256 ?? "Unavailable"}
            </p>
          </div>
        </dl>
      </div>

      <div
        class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-md dark:border-slate-800 dark:bg-slate-900/80"
      >
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          Certificate details
        </h2>
        <div
          class="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Issuer
          </p>
          <pre
            class="mt-1 whitespace-pre-wrap break-words text-slate-700 dark:text-slate-200">{JSON.stringify(
              certificate.issuer,
              null,
              2,
            )}</pre>
        </div>
        <div
          class="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Subject
          </p>
          <pre
            class="mt-1 whitespace-pre-wrap break-words text-slate-700 dark:text-slate-200">{JSON.stringify(
              certificate.subject,
              null,
              2,
            )}</pre>
        </div>
        <div
          class="rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-900/60"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Alternate names
          </p>
          {#if certificate.altnames?.length}
            <ul
              class="mt-2 list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-200"
            >
              {#each certificate.altnames as name}
                <li>{name}</li>
              {/each}
            </ul>
          {:else}
            <p class="text-slate-600 dark:text-slate-300">None reported.</p>
          {/if}
        </div>
      </div>
    </div>
  {/if}
</section>
