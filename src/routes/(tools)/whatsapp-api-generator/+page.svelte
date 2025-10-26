<script lang="ts">
  import Copy from "$lib/Copy.svelte";
  import { countries } from "countries-list";

  const isBrowser = typeof window !== "undefined";

  const countryList = Object.entries(countries)
    .map(([code, value]) => {
      const dial = value.phone;
      return {
        code,
        name: value.name,
        dial:
          dial === undefined || dial === null
            ? ""
            : Array.isArray(dial)
              ? dial.join(",")
              : String(dial),
      };
    })
    .filter((item) => item.dial)
    .sort((a, b) => a.name.localeCompare(b.name));

  let selectedCountryCode = countryList[0]?.code ?? "";
  let phone = "";
  let message = "";
  let callToAction = "Chat on WhatsApp";

  $: selectedCountry =
    countryList.find((country) => country.code === selectedCountryCode) ??
    (countryList.length ? countryList[0] : null);
  $: dialCode = normaliseDialCode(selectedCountry?.dial);

  function normaliseDialCode(extension: string | undefined) {
    if (extension === undefined || extension === null) return "";
    const source = Array.isArray(extension)
      ? extension.join(",")
      : String(extension);
    const primary = source.split(",")[0] ?? "";
    return primary.replace(/[^\d]/g, "");
  }

  function normalisePhone(value: string) {
    return (value || "").replace(/[^\d]/g, "");
  }

  $: sanitisedPhone = normalisePhone(phone);
  $: fullNumber = `${dialCode}${sanitisedPhone}`.replace(/^0+/, "");
  $: hasValidNumber = Boolean(fullNumber && sanitisedPhone.length >= 6);
  $: baseLink = hasValidNumber ? `https://wa.me/${fullNumber}` : "";
  $: encodedMessage = message.trim() ? encodeURIComponent(message.trim()) : "";
  $: whatsappLink = baseLink
    ? `${baseLink}${encodedMessage ? `?text=${encodedMessage}` : ""}`
    : "";
  $: buttonLabel = callToAction.trim()
    ? callToAction.trim()
    : "Open WhatsApp chat";
  $: htmlSnippet = whatsappLink
    ? `<a href="${whatsappLink}" target="_blank" rel="noopener">${buttonLabel}</a>`
    : "<!-- add a valid number to generate the embed snippet -->";

  function openChat() {
    if (!whatsappLink || !isBrowser) return;
    window.open(whatsappLink, "_blank", "noopener");
  }
</script>

<section class="space-y-6">
  <div
    class="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
  >
    <div class="grid gap-4 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
      <label
        class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        <span>Country</span>
        <select
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
          bind:value={selectedCountryCode}
        >
          {#each countryList as country}
            <option value={country.code}>
              {country.name} (+{normaliseDialCode(country.dial)})
            </option>
          {/each}
        </select>
        <p class="text-xs font-normal text-slate-500 dark:text-slate-400">
          Dial code: {dialCode ? `+${dialCode}` : "select a country"}
        </p>
      </label>

      <label
        class="space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        <span>WhatsApp number</span>
        <input
          class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
          type="tel"
          inputmode="tel"
          autocomplete="tel"
          placeholder="7400001234"
          bind:value={phone}
        />
        <p class="text-xs font-normal text-slate-500 dark:text-slate-400">
          Normalised: {hasValidNumber
            ? `+${fullNumber}`
            : "waiting for a valid number"}
        </p>
      </label>
    </div>

    <label
      class="mt-6 block space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
    >
      <span>Prefilled message (optional)</span>
      <textarea
        class="h-28 w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
        placeholder="Hi! I'd like to know more about your services."
        bind:value={message}
      ></textarea>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        This message appears in the chat input when someone opens your link.
      </p>
    </label>

    <label
      class="mt-6 block space-y-2 text-sm font-semibold text-slate-700 dark:text-slate-200"
    >
      <span>Call-to-action label</span>
      <input
        class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-emerald-500 dark:focus:ring-emerald-900"
        placeholder="Chat with us on WhatsApp"
        bind:value={callToAction}
      />
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Used on the preview button and in the embed snippet.
      </p>
    </label>

    <div
      class="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >Generated link</span
        >
        {#if whatsappLink}
          <Copy text={whatsappLink} label="Copy link" floating={false} />
        {/if}
      </div>

      {#if whatsappLink}
        <div
          class="break-all rounded-xl border border-emerald-200 bg-white px-4 py-3 font-mono text-[13px] text-slate-900 shadow-sm dark:border-emerald-800 dark:bg-slate-950 dark:text-emerald-200"
        >
          {whatsappLink}
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <button
            class="inline-flex items-center rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700"
            type="button"
            on:click={openChat}
          >
            {buttonLabel}
          </button>
          <Copy text={whatsappLink} label="Copy link" floating={false} />
        </div>
      {:else}
        <p class="text-xs text-slate-500 dark:text-slate-400">
          Choose a country and number to generate the WhatsApp link here.
        </p>
      {/if}
    </div>

    <div
      class="mt-6 space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >Embed snippet</span
        >
        <Copy text={htmlSnippet} label="Copy HTML" floating={false} />
      </div>
      <textarea
        class="h-28 w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-mono text-[13px] text-slate-700 outline-none dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200"
        value={htmlSnippet}
        readonly
      ></textarea>
      <p class="text-xs text-slate-500 dark:text-slate-400">
        Paste this anchor tag anywhere on your site to launch WhatsApp with the
        prefilled message.
      </p>
    </div>
  </div>
</section>
