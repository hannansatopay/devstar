<script lang="ts">
  import Copy from "$lib/Copy.svelte";

  const today = new Date().toISOString().slice(0, 10);

  let businessName = "Northwind Studio";
  let website = "https://northwind.studio";
  let contactEmail = "hello@northwind.studio";
  let policyType = "privacy";
  let effectiveDate = today;
  let companyLocation = "United States";
  let includeCookies = true;
  let includeAnalytics = true;
  let includeMarketing = false;
  let includeThirdParty = true;
  let includeChildren = false;
  let revisionFrequency = "annually";
  let refundWindow = "30 days";
  let refundMethod = "original payment method";
  let disclaimer =
    "This generator provides a starting point. Always review the output with a qualified legal professional to ensure compliance with the laws that apply to your business.";

  const policyOptions = [
    { value: "privacy", label: "Privacy policy" },
    { value: "terms", label: "Terms of service" },
    { value: "refund", label: "Refund and cancellation policy" },
  ];

  type PolicySection = {
    heading: string;
    paragraphs: string[];
    bullets?: string[];
  };

  const isDefined = <T,>(value: T | null | undefined | false): value is T =>
    Boolean(value);

  function buildSections(): PolicySection[] {
    const privacySections = (): PolicySection[] => {
      const sections: Array<PolicySection | false> = [
        {
          heading: "Overview",
          paragraphs: [
            `${businessName} ("we", "us", or "our") operates ${website} (the "Service"). This Privacy Policy explains how we collect, use, disclose, and safeguard personal information when you interact with our applications, websites, documentation, plug-ins, and support channels.`,
            "Continuing to use the Service confirms that you understand this policy and the choices described below. If you do not agree, please discontinue the Service.",
          ],
        },
        {
          heading: "Personal data we collect",
          paragraphs: [
            "We collect personal information in three primary ways: data you provide directly, data gathered automatically, and data supplied by trusted partners.",
          ],
          bullets: [
            "Account and profile details such as names, job titles, passwords, billing contacts, addresses, and plan selections captured when you sign up or administer a workspace.",
            "Workspace metadata including team names, project identifiers, uploaded brand assets, and integration settings you choose to connect.",
            "Support communications, attachments, survey responses, and other content you share when requesting assistance or offering feedback.",
            includeAnalytics
              ? "Usage analytics such as device identifiers, IP addresses, browser types, referring pages, session duration, feature adoption, and crash diagnostics collected to keep the Service reliable."
              : null,
            includeMarketing
              ? "Marketing preferences covering email opt-ins, waitlist registrations, download history, and event participation captured when you engage with promotional content."
              : null,
          ].filter(isDefined),
        },
        {
          heading: "How we use personal data",
          paragraphs: ["We process personal information to:"],
          bullets: [
            "Provide, configure, and maintain the Service, including onboarding new workspaces, syncing integrations, and delivering requested functionality.",
            "Process transactions, issue invoices, verify identity, secure accounts, resolve incidents, and deliver required legal or service notifications.",
            includeAnalytics
              ? "Measure feature performance, improve usability, run controlled experiments, forecast infrastructure capacity, and inform the product roadmap."
              : null,
            includeMarketing
              ? "Send newsletters, launch updates, research opportunities, and tailored recommendations when you opt in. Non-essential messages include clear unsubscribe controls."
              : null,
            includeThirdParty
              ? "Collaborate with vetted processors who deliver hosting, payment processing, analytics, customer success, and security services under contractual safeguards."
              : null,
          ].filter(isDefined),
        },
        includeCookies && {
          heading: "Cookies and tracking technologies",
          paragraphs: [
            "We use first- and third-party cookies, pixels, and local storage to operate, secure, and personalise the Service. Cookies are small text files stored on your device that remember preferences and help us understand how features are used.",
          ],
          bullets: [
            "Strictly necessary cookies keep you signed in, secure session requests, and enable core features such as checkout, account switching, and form submission reliability.",
            "Preference cookies remember language, theme, accessibility, and notification settings so the Service behaves consistently across visits.",
            includeAnalytics
              ? "Performance cookies and similar scripts measure load times, detect errors, and surface aggregate usage insights that guide product decisions."
              : null,
            includeMarketing
              ? "Campaign cookies track newsletter effectiveness and attributed sign-ups so we can improve the relevance of future outreach."
              : null,
          ].filter(isDefined),
        },
        includeAnalytics && {
          heading: "Analytics and diagnostics",
          paragraphs: [
            "When analytics capture is enabled we record high-level behavioural metrics to understand how the Service performs. Data is aggregated whenever possible and access is limited to authorised personnel.",
            "You can disable analytics at any time through workspace settings or by contacting us. Even with analytics disabled we retain minimal diagnostic logs that are required to secure the Service.",
          ],
        },
        includeThirdParty && {
          heading: "Sharing with service providers and partners",
          paragraphs: [
            "We only share personal information with third parties when they are essential to delivering the Service or when you request a specific integration. Each partner is bound by written agreements to use data solely for the contracted purpose and to implement comparable safeguards.",
          ],
          bullets: [
            "Infrastructure, hosting, and storage providers that keep the Service available and performant.",
            "Payment processors who manage transactions, refunds, compliance checks, and fraud prevention.",
            includeMarketing
              ? "Marketing automation and customer experience tools used to send communications you have opted into."
              : null,
            "Professional advisers, auditors, or legal counsel assisting with compliance, accounting, or risk management obligations.",
          ].filter(isDefined),
        },
        {
          heading: "Legal bases for processing",
          paragraphs: [
            `If you access the Service from ${companyLocation}, we rely on legal bases such as the performance of a contract, compliance with legal obligations, legitimate interests (including improving and protecting the Service), and consent when required by law.`,
          ],
        },
        {
          heading: "How long we keep information",
          paragraphs: [
            "We retain personal information for as long as necessary to deliver the Service, meet legal or regulatory requirements, resolve disputes, and enforce agreements. When data is no longer required we delete it or anonymise it in accordance with internal retention schedules.",
            includeAnalytics
              ? "Aggregated analytics and performance data are stored only long enough to observe feature trends before being de-identified or deleted."
              : "Operational logs are retained for a limited duration that allows us to investigate security events and maintain system integrity.",
          ],
        },
        {
          heading: "Security of your information",
          paragraphs: [
            `${businessName} implements administrative, technical, and physical safeguards including encryption, role-based access controls, secure development practices, vendor reviews, and continuous monitoring to protect personal information.`,
            "Despite these measures, no method of transmission or storage is completely secure. We continually assess and improve our controls to keep risk proportionate.",
          ],
        },
        {
          heading: "Your privacy choices and rights",
          paragraphs: [
            `Depending on your location, you may have rights to access, correct, delete, restrict processing of, port, or object to the use of your personal information. Submit your request to ${contactEmail} and include sufficient detail for us to verify your identity.`,
          ],
          bullets: [
            "Adjust workspace settings to update account details, manage notifications, revoke integrations, or download a copy of select data exports.",
            includeMarketing
              ? "Opt out of marketing messages at any time by using the unsubscribe link or by contacting us directly."
              : null,
            includeCookies
              ? "Control cookies through browser preferences or dedicated cookie management tools. Essential functionality may be impacted if cookies are disabled."
              : null,
          ].filter(isDefined),
        },
        includeChildren && {
          heading: "Children's privacy",
          paragraphs: [
            "The Service is not directed to children under the age defined by applicable law. We do not knowingly collect personal information from children. If we learn that such information has been provided, we will delete it and close the account.",
          ],
        },
        {
          heading: "International transfers",
          paragraphs: [
            `${businessName} may store and process personal information in countries other than where it was collected. When data is transferred internationally we rely on safeguards such as standard contractual clauses, intra-group agreements, or other lawful transfer mechanisms.`,
          ],
        },
        {
          heading: "Policy updates",
          paragraphs: [
            `We review this Privacy Policy ${revisionFrequency} or whenever we introduce new features, partners, or regulatory requirements that materially change how personal information is handled.`,
            "If we make significant updates we will notify you within the Service or by email so you can review the changes before they take effect.",
          ],
        },
        {
          heading: "Contact us",
          paragraphs: [
            `Questions about this Privacy Policy or our privacy practices can be sent to ${contactEmail}.`,
          ],
        },
      ];

      return sections.filter(isDefined);
    };

    const termsSections = (): PolicySection[] => {
      const sections: Array<PolicySection | false> = [
        {
          heading: "Acceptance of Terms",
          paragraphs: [
            `${businessName} ("we", "us", or "our") operates ${website} (the "Service"). By accessing or using the Service you agree to these Terms of Service and any referenced policies. If you do not agree, discontinue use immediately.`,
            "We may update these Terms to reflect new features or legal requirements. We will post the updated Terms with a revised effective date.",
          ],
        },
        {
          heading: "Account Responsibilities",
          paragraphs: [
            "To use certain features you may need to create an account. You agree to provide accurate information, keep your credentials confidential, and promptly notify us of any unauthorised use.",
          ],
          bullets: [
            "You are responsible for all activities that occur under your account.",
            "You must be at least 16 years old (or the minimum age required in your jurisdiction) to create an account.",
            "We reserve the right to suspend or terminate accounts that violate these Terms.",
          ],
        },
        {
          heading: "Permitted and Prohibited Uses",
          paragraphs: [
            "You agree to use the Service only for lawful purposes and in accordance with these Terms.",
          ],
          bullets: [
            "Do not attempt to reverse engineer, decompile, or disassemble any portion of the Service.",
            "Do not upload malicious code, interfere with system integrity, or access areas of the Service you are not authorised to access.",
            "Do not use the Service to distribute spam, infringe intellectual property, or violate privacy rights.",
          ],
        },
        includeMarketing && {
          heading: "Promotions and Communications",
          paragraphs: [
            "From time to time we may offer promotional programmes or send messages about new features.",
            "Participation in promotions may require agreeing to supplemental terms. You can manage communication preferences within your account or unsubscribe from marketing emails.",
          ],
        },
        {
          heading: "Intellectual Property",
          paragraphs: [
            `The Service, including its content, features, and functionality, are owned by ${businessName} and are protected by intellectual property laws.`,
            "We grant you a limited, non-exclusive, non-transferable licence to use the Service for your internal business purposes.",
          ],
        },
        includeThirdParty && {
          heading: "Third-Party Services",
          paragraphs: [
            "The Service may link to or integrate with third-party websites, products, or services.",
            "We do not control and are not responsible for the content, policies, or practices of any third-party services. Use them at your own risk.",
          ],
        },
        {
          heading: "Termination",
          paragraphs: [
            "We may suspend or terminate access to the Service if you violate these Terms or if continued access poses harm to us or other users.",
            "Upon termination, your right to use the Service will cease immediately. Certain provisions such as intellectual property, warranties, and limitations of liability will survive termination.",
          ],
        },
        {
          heading: "Disclaimers and Limitation of Liability",
          paragraphs: [
            'The Service is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied.',
            `${businessName} will not be liable for indirect, incidental, consequential, or punitive damages arising from or related to your use of the Service to the fullest extent permitted by law.`,
          ],
        },
        {
          heading: "Governing Law",
          paragraphs: [
            `These Terms are governed by the laws of ${companyLocation}, without regard to conflict of law provisions.`,
            "Any disputes shall be resolved through binding arbitration or courts located in the governing jurisdiction unless otherwise required by applicable law.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            `If you have questions about these Terms, contact us at ${contactEmail}.`,
          ],
        },
      ];

      return sections.filter(isDefined);
    };

    const refundSections = (): PolicySection[] => {
      const sections: Array<PolicySection | false> = [
        {
          heading: "Overview",
          paragraphs: [
            `${businessName} aims to ensure you are satisfied with every purchase. This Refund and Cancellation Policy explains how to request a refund or exchange for purchases made on ${website}.`,
            `If you have any questions, contact us at ${contactEmail}.`,
          ],
        },
        {
          heading: "Eligibility Window",
          paragraphs: [
            `You can request a refund within ${refundWindow} of the original purchase date. Refund requests received after this period may not be processed.`,
          ],
        },
        {
          heading: "Items Eligible for Refund",
          paragraphs: [
            "A refund may be approved when the following conditions are met:",
          ],
          bullets: [
            "The product or subscription is unused, unactivated, or in the same condition as delivered.",
            "Digital goods are proven defective, inaccessible, or materially different from the description.",
            "Proof of purchase (receipt, order ID, or invoice number) is provided with the request.",
          ],
        },
        {
          heading: "Non-Returnable Items",
          paragraphs: [
            "The following items are generally non-refundable unless otherwise required by law:",
          ],
          bullets: [
            "Services that have already been performed or customised work that has commenced.",
            "Downloadable software or digital products once they have been accessed or activated, unless they are faulty.",
            "Gift cards, promotional credits, or third-party services purchased through the Service.",
          ],
        },
        {
          heading: "How to Request a Refund",
          paragraphs: [
            `Email ${contactEmail} with your name, order details, payment method, and reason for the request. Attach any supporting files or screenshots that help us verify the issue.`,
            "We will respond within 3 business days to confirm receipt and outline next steps.",
          ],
        },
        {
          heading: "Refund Method",
          paragraphs: [
            `Approved refunds are issued to the ${refundMethod}. Depending on your financial institution, it may take 5–10 business days for funds to appear on your statement.`,
            "Where possible, refunds will be issued in the original currency of purchase.",
          ],
        },
        includeThirdParty && {
          heading: "Marketplace Purchases",
          paragraphs: [
            "If you purchased through a marketplace (for example, App Store, Google Play, or partner platforms), refund requests must be directed to that marketplace. Each marketplace maintains its own policies and timelines.",
          ],
        },
        {
          heading: "Exchanges",
          paragraphs: [
            "If you wish to exchange a product for a different plan or licence, contact our team. Exchanges may be processed instead of refunds when a more suitable product is available.",
          ],
        },
        {
          heading: "Late or Missing Refunds",
          paragraphs: [
            "If you have not received a refund after the stated timeframe, please:",
          ],
          bullets: [
            "Check with your bank or payment provider for pending transactions.",
            "Contact your card issuer, as posting delays are possible.",
            `Reach back out to ${contactEmail} and we will investigate promptly.`,
          ],
        },
        {
          heading: "Changes to This Policy",
          paragraphs: [
            `We review refund practices ${revisionFrequency}. Changes take effect when posted on ${website}. Continued purchases after an update constitute acceptance of the revised policy.`,
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            `All refund, exchange, or cancellation questions can be directed to ${contactEmail}.`,
          ],
        },
      ];

      return sections.filter(isDefined);
    };

    switch (policyType) {
      case "terms":
        return termsSections();
      case "refund":
        return refundSections();
      default:
        return privacySections();
    }
  }

  $: sections = buildSections();

  $: policyHeading =
    policyType === "privacy"
      ? "Privacy policy"
      : policyType === "terms"
        ? "Terms of service"
        : "Refund and cancellation policy";

  $: policyIntro = [
    `${policyHeading} for ${businessName}`,
    `Website: ${website}`,
    `Effective date: ${effectiveDate}`,
    `Contact: ${contactEmail}`,
    `Jurisdiction: ${companyLocation}`,
    "",
  ];

  $: policyText = [
    ...policyIntro,
    ...sections.flatMap((section) => [
      section.heading,
      ...section.paragraphs,
      ...(section.bullets?.map((bullet) => `- ${bullet}`) ?? []),
      "",
    ]),
  ].join("\n");
</script>

<section class="space-y-6">
  <div class="grid grid-cols-1 gap-6">
    <aside class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white/80 p-6 text-sm shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
      >
        <p class="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Configuration
        </p>

        <label class="mt-4 block space-y-2 font-semibold">
          <span>Policy type</span>
          <div class="grid grid-cols-1 gap-2 lg:grid-cols-5">
            {#each policyOptions as option}
              <button
                class={`rounded-xl border px-3 py-2 text-left text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 ${
                  policyType === option.value
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700 dark:border-indigo-400 dark:bg-indigo-900/30 dark:text-indigo-200"
                    : "border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
                type="button"
                on:click={() => (policyType = option.value)}
              >
                {option.label}
              </button>
            {/each}
          </div>
        </label>

        <div class="mt-4 grid gap-4 lg:grid-cols-3">
          <label class="space-y-1 font-semibold">
            <span>Business name</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={businessName}
            />
          </label>

          <label class="space-y-1 font-semibold">
            <span>Website</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={website}
            />
          </label>

          <label class="space-y-1 font-semibold">
            <span>Contact email</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={contactEmail}
              type="email"
            />
          </label>

          <label class="space-y-1 font-semibold">
            <span>Effective date</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={effectiveDate}
              type="date"
              max={today}
            />
          </label>

          <label class="space-y-1 font-semibold">
            <span>Company location</span>
            <input
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={companyLocation}
            />
          </label>

          <label class="block space-y-1 font-semibold">
            <span>Revision cadence</span>
            <select
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={revisionFrequency}
            >
              <option value="quarterly">Quarterly</option>
              <option value="bi-annually">Bi-annually</option>
              <option value="annually">Annually</option>
              <option value="as needed">As needed</option>
            </select>
          </label>
        </div>

        {#if policyType === "refund"}
          <div
            class="mt-4 grid gap-3 lg:grid-cols-2 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700"
          >
            <label class="space-y-1 font-semibold">
              <span>Refund window</span>
              <input
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                bind:value={refundWindow}
              />
            </label>
            <label class="space-y-1 font-semibold">
              <span>Refund method</span>
              <input
                class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
                bind:value={refundMethod}
              />
            </label>
          </div>
        {:else}
          <div
            class="mt-4 grid gap-2 lg:grid-cols-3 rounded-xl border border-slate-200 p-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:text-slate-300"
          >
            <label class="flex items-center gap-2">
              <input
                class="h-4 w-4 accent-indigo-600"
                type="checkbox"
                bind:checked={includeCookies}
              />
              Include cookies section
            </label>
            <label class="flex items-center gap-2">
              <input
                class="h-4 w-4 accent-indigo-600"
                type="checkbox"
                bind:checked={includeAnalytics}
              />
              Include analytics section
            </label>
            <label class="flex items-center gap-2">
              <input
                class="h-4 w-4 accent-indigo-600"
                type="checkbox"
                bind:checked={includeMarketing}
              />
              Include marketing section
            </label>
            <label class="flex items-center gap-2">
              <input
                class="h-4 w-4 accent-indigo-600"
                type="checkbox"
                bind:checked={includeThirdParty}
              />
              Mention third-party partners
            </label>
            <label class="flex items-center gap-2">
              <input
                class="h-4 w-4 accent-indigo-600"
                type="checkbox"
                bind:checked={includeChildren}
              />
              Children's privacy clause
            </label>
          </div>
        {/if}
      </div>

      <div
        class="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 text-xs font-semibold text-amber-700 dark:border-amber-600 dark:bg-amber-900/40 dark:text-amber-200"
      >
        {disclaimer}
      </div>
    </aside>

    <div class="space-y-4">
      <div
        class="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div class="space-y-1">
            <p
              class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              {policyHeading}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Generated with the currently selected options. Edit inline or copy
              to your editor of choice.
            </p>
          </div>
          <Copy text={policyText} label="Copy policy" floating={false} />
        </div>

        <div class="mt-6 space-y-6 text-sm text-slate-700 dark:text-slate-200">
          <div
            class="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-xs text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
          >
            <p><strong>Effective:</strong> {effectiveDate}</p>
            <p><strong>Contact:</strong> {contactEmail}</p>
            <p><strong>Jurisdiction:</strong> {companyLocation}</p>
          </div>

          {#each sections as section}
            <section
              class="space-y-3 rounded-xl border border-slate-200 px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70"
            >
              <h3
                class="text-base font-semibold text-slate-900 dark:text-white"
              >
                {section.heading}
              </h3>
              {#each section.paragraphs as paragraph}
                <p class="text-sm text-slate-600 dark:text-slate-300">
                  {paragraph}
                </p>
              {/each}
              {#if section.bullets && section.bullets.length}
                <ul
                  class="list-disc space-y-1 pl-5 text-sm text-slate-600 dark:text-slate-300"
                >
                  {#each section.bullets as bullet}
                    <li>{bullet}</li>
                  {/each}
                </ul>
              {/if}
            </section>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
