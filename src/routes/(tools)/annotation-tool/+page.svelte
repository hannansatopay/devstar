<script lang="ts">
    import { browser } from "$app/environment";
    import { onDestroy, onMount, tick } from "svelte";

    type Annotation = {
        id: string;
        start: number;
        end: number;
        note: string;
        color: string;
        createdAt: string;
    };

    const palette = [
        "#f97316",
        "#22c55e",
        "#38bdf8",
        "#a855f7",
        "#ef4444",
        "#facc15",
    ];
    const storageKey = "annotation-tool-state-v1";

    let text = `Paste or type the content you want to annotate, select any passage, and capture a quick note. Annotations are stored locally so you can revisit them later.`;
    let annotations: Annotation[] = [];
    let sortedAnnotations: Annotation[] = [];
    let segments: Array<{
        start: number;
        end: number;
        text: string;
        annotation: Annotation | null;
    }> = [];

    let editor: HTMLTextAreaElement;
    let noteInput: HTMLTextAreaElement | null = null;
    let showForm = false;
    let noteValue = "";
    let selectedColour = palette[0];
    let selectedRange: { start: number; end: number; snippet: string } | null =
        null;
    let activeAnnotationId: string | null = null;
    let infoMessage = "";
    let messageTimeout: ReturnType<typeof setTimeout> | null = null;

    const clamp = (value: number, min: number, max: number) =>
        Math.min(Math.max(value, min), max);
    const createId = () =>
        typeof crypto !== "undefined" && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

    const exampleDocument = {
        text: `Product discovery checklist:
1. Interview three power users about onboarding friction and unmet needs.
2. Map the sign-up journey and capture every validation gap you uncover.
3. Share an annotated prototype with the team and schedule a follow-up review.`,
        entries: [
            {
                snippet:
                    "Interview three power users about onboarding friction",
                note: "Prioritize interviews with recent sign-ups that churned within the first week.",
                colourIndex: 0,
            },
            {
                snippet: "Map the sign-up journey",
                note: "Track copy tone inconsistencies between the pricing step and verification step.",
                colourIndex: 2,
            },
            {
                snippet: "Share an annotated prototype with the team",
                note: "Attach the latest Figma links and include the accessibility audit summary.",
                colourIndex: 3,
            },
        ],
    };

    onMount(() => {
        if (!browser) return;
        const stored = localStorage.getItem(storageKey);
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (typeof parsed?.text === "string") {
                    text = parsed.text;
                }
                if (Array.isArray(parsed?.annotations)) {
                    annotations = parsed.annotations
                        .filter(
                            (item: Annotation) =>
                                typeof item?.start === "number" &&
                                typeof item?.end === "number" &&
                                typeof item?.note === "string" &&
                                typeof item?.color === "string",
                        )
                        .map((item: Annotation) => ({
                            ...item,
                            id: item.id ?? createId(),
                        }));
                }
            } catch (error) {
                console.error("Unable to load saved annotations", error);
            }
        }
    });

    const setMessage = (message: string) => {
        infoMessage = message;
        if (!browser) return;
        if (messageTimeout) {
            clearTimeout(messageTimeout);
        }
        messageTimeout = setTimeout(() => {
            infoMessage = "";
        }, 3200);
    };

    const buildSegments = (baseText: string, list: Annotation[]) => {
        const length = baseText.length;
        if (length === 0) {
            return [];
        }

        const boundaries = new Set<number>([0, length]);
        for (const item of list) {
            const start = clamp(item.start ?? 0, 0, length);
            const end = clamp(item.end ?? 0, 0, length);
            if (start === end) continue;
            boundaries.add(start);
            boundaries.add(end);
        }

        const points = Array.from(boundaries).sort((a, b) => a - b);
        const output: Array<{
            start: number;
            end: number;
            text: string;
            annotation: Annotation | null;
        }> = [];

        for (let i = 0; i < points.length - 1; i += 1) {
            const start = points[i];
            const end = points[i + 1];
            if (start === end) continue;
            const snippet = baseText.slice(start, end);
            const active = list.filter(
                (item) => item.start <= start && item.end >= end,
            );
            const annotation = active.length ? active[active.length - 1] : null;
            output.push({ start, end, text: snippet, annotation });
        }

        return output;
    };

    const hexToRgba = (hex: string, alpha = 0.25) => {
        const sanitized = hex.replace("#", "");
        const full =
            sanitized.length === 3
                ? sanitized
                      .split("")
                      .map((ch) => ch + ch)
                      .join("")
                : sanitized;
        const bigint = parseInt(full, 16);
        const r = (bigint >> 16) & 255;
        const g = (bigint >> 8) & 255;
        const b = bigint & 255;
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    async function openAnnotationForm() {
        if (!editor) return;
        const start = editor.selectionStart ?? 0;
        const end = editor.selectionEnd ?? 0;
        if (start === end) {
            setMessage("Select some text before annotating.");
            return;
        }

        const normalizedStart = Math.max(0, Math.min(start, end));
        const normalizedEnd = Math.max(0, Math.max(start, end));

        selectedRange = {
            start: normalizedStart,
            end: normalizedEnd,
            snippet: text.slice(normalizedStart, normalizedEnd),
        };

        noteValue = "";
        selectedColour = palette[0];
        showForm = true;
        await tick();
        noteInput?.focus();
    }

    const saveAnnotation = () => {
        if (!selectedRange) {
            setMessage("Select text to annotate.");
            return;
        }
        if (!noteValue.trim()) {
            setMessage("Add a note before saving.");
            return;
        }

        const newAnnotation: Annotation = {
            id: createId(),
            start: selectedRange.start,
            end: selectedRange.end,
            note: noteValue.trim(),
            color: selectedColour,
            createdAt: new Date().toISOString(),
        };

        annotations = [...annotations, newAnnotation];
        activeAnnotationId = newAnnotation.id;
        showForm = false;
        selectedRange = null;
    };

    const deleteAnnotation = (id: string) => {
        annotations = annotations.filter((item) => item.id !== id);
        if (activeAnnotationId === id) {
            activeAnnotationId = null;
        }
    };

    const toggleActive = (annotation: Annotation) => {
        activeAnnotationId =
            activeAnnotationId === annotation.id ? null : annotation.id;
        if (editor) {
            editor.focus();
            editor.setSelectionRange(annotation.start, annotation.end);
        }
    };

    const clearAnnotations = () => {
        if (annotations.length === 0) return;
        annotations = [];
        activeAnnotationId = null;
        setMessage("Annotations cleared.");
    };

    const handleTextInput = () => {
        if (annotations.length) {
            annotations = [];
            activeAnnotationId = null;
            setMessage("Text updated. Previous annotations were removed.");
        }
    };

    const loadExample = () => {
        const { text: exampleText, entries } = exampleDocument;
        text = exampleText;
        const generated: Annotation[] = [];
        let searchCursor = 0;

        for (const entry of entries) {
            const colour =
                palette[entry.colourIndex % palette.length] ?? palette[0];
            let start = exampleText.indexOf(entry.snippet, searchCursor);
            if (start === -1) {
                start = exampleText.indexOf(entry.snippet);
            }
            if (start === -1) continue;
            const end = start + entry.snippet.length;
            searchCursor = end;
            generated.push({
                id: createId(),
                start,
                end,
                note: entry.note,
                color: colour,
                createdAt: new Date().toISOString(),
            });
        }

        annotations = generated;
        activeAnnotationId = generated.length ? generated[0].id : null;
        showForm = false;
        selectedRange = null;
        noteValue = "";
        setMessage("Example annotations loaded.");
    };

    const copySummary = async () => {
        if (!browser) return;
        const summary = annotations
            .sort((a, b) => a.start - b.start)
            .map(
                (item, index) =>
                    `${index + 1}. "${text.slice(item.start, item.end)}" -> ${item.note}`,
            )
            .join("\n");
        try {
            await navigator.clipboard.writeText(summary || "");
            setMessage("Annotation summary copied to the clipboard.");
        } catch (error) {
            setMessage("Unable to copy summary.");
        }
    };

    $: sortedAnnotations = [...annotations].sort(
        (a, b) => a.start - b.start || a.end - b.end,
    );
    $: segments = buildSegments(text, sortedAnnotations);
    $: if (browser) {
        const payload = JSON.stringify({ text, annotations });
        localStorage.setItem(storageKey, payload);
    }

    onDestroy(() => {
        if (messageTimeout) {
            clearTimeout(messageTimeout);
        }
    });
</script>

<section class="space-y-6 flex flex-col">
    <div class="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <div
            class="flex flex-col gap-6 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-slate-800/40 dark:bg-slate-900/70"
        >
            <div class="grid gap-5">
                <textarea
                    bind:this={editor}
                    bind:value={text}
                    on:input={handleTextInput}
                    class="min-h-[180px] w-full rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 text-sm leading-relaxed text-slate-700 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-200 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-200 dark:focus:border-sky-500 dark:focus:ring-sky-500/40"
                    title="Editable document"
                ></textarea>
                <div class="flex flex-wrap items-center gap-3">
                    <button
                        type="button"
                        on:click={openAnnotationForm}
                        class="inline-flex items-center justify-center rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white shadow-lg transition hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                    >
                        Annotate selection
                    </button>
                    <button
                        type="button"
                        on:click={loadExample}
                        class="inline-flex items-center justify-center rounded-full border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-600 transition hover:border-sky-300 hover:text-sky-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 focus-visible:ring-offset-2 dark:border-sky-500/40 dark:bg-slate-900 dark:text-sky-200 dark:hover:border-sky-500/60 dark:focus-visible:ring-offset-slate-950"
                    >
                        Load example
                    </button>
                    <button
                        type="button"
                        on:click={clearAnnotations}
                        class="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-400 dark:hover:border-rose-500/50 dark:hover:text-rose-300 dark:focus-visible:ring-offset-slate-950"
                    >
                        Clear annotations
                    </button>
                    <button
                        type="button"
                        on:click={copySummary}
                        class="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-sky-300 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-400 dark:hover:border-sky-500/40 dark:hover:text-sky-200 dark:focus-visible:ring-offset-slate-950"
                    >
                        Copy summary
                    </button>
                </div>
                <p class="text-xs text-slate-400 dark:text-slate-500">
                    Editing the base text clears existing annotations so they
                    always match your wording.
                </p>
            </div>

            <div
                class="rounded-2xl border border-slate-200/60 bg-white/70 p-5 shadow-inner dark:border-slate-800/40 dark:bg-slate-900/60"
            >
                <p
                    class="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500"
                >
                    Preview
                </p>
                <div
                    class="min-h-[160px] whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-slate-100"
                >
                    {#each segments as segment}
                        <span
                            class={`inline transition ${segment.annotation ? "cursor-pointer rounded-sm px-0.5" : ""} ${segment.annotation?.id === activeAnnotationId ? "ring-2 ring-sky-300 ring-offset-2 ring-offset-white dark:ring-offset-slate-900" : ""}`}
                            style={segment.annotation
                                ? `background:${hexToRgba(segment.annotation.color, 0.25)};border-bottom:2px solid ${segment.annotation.color};`
                                : ""}
                            on:click={() =>
                                segment.annotation &&
                                toggleActive(segment.annotation)}
                        >
                            {segment.text}
                        </span>
                    {/each}
                </div>
            </div>
        </div>
        <div
            class="flex flex-col gap-6 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-sm dark:border-slate-800/40 dark:bg-slate-900/70"
        >
            <div class="space-y-2">
                <p
                    class="text-sm font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400"
                >
                    Annotations
                </p>
                <p class="text-sm text-slate-500 dark:text-slate-300">
                    Colour map and quick summary of every note you have
                    captured.
                </p>
            </div>

            {#if showForm && selectedRange}
                <div
                    class="grid gap-3 rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm dark:border-slate-700/50 dark:bg-slate-900/70"
                >
                    <p
                        class="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500"
                    >
                        New annotation
                    </p>
                    <p
                        class="rounded-xl border border-dashed border-slate-200 bg-white/70 p-3 text-xs italic text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400"
                    >
                        "{selectedRange.snippet}"
                    </p>
                    <textarea
                        bind:this={noteInput}
                        rows="3"
                        class="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/60"
                        placeholder="Add a note or reminder"
                        bind:value={noteValue}
                    ></textarea>
                    <div class="flex flex-wrap items-center gap-2">
                        {#each palette as colour}
                            <button
                                type="button"
                                class={`h-8 w-8 rounded-full border-2 transition ${selectedColour === colour ? "border-slate-900 ring-2 ring-slate-300 dark:border-slate-50 dark:ring-slate-700" : "border-transparent"}`}
                                style={`background-color:${colour}`}
                                on:click={() => (selectedColour = colour)}
                            ></button>
                        {/each}
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            class="inline-flex items-center justify-center rounded-full bg-sky-500 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-950"
                            on:click={saveAnnotation}
                        >
                            Save annotation
                        </button>
                        <button
                            type="button"
                            class="inline-flex items-center justify-center rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 transition hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-400 dark:hover:text-slate-200 dark:focus-visible:ring-offset-slate-950"
                            on:click={() => {
                                showForm = false;
                                selectedRange = null;
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            {/if}

            {#if sortedAnnotations.length === 0}
                <p
                    class="rounded-2xl border border-dashed border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-400"
                >
                    No annotations yet. Select text in the document and use
                    "Annotate selection" to capture your notes.
                </p>
            {:else}
                <ul class="space-y-4">
                    {#each sortedAnnotations as annotation, index}
                        <li
                            class={`rounded-2xl border border-slate-200/60 bg-white/80 p-4 shadow-sm transition hover:shadow-md dark:border-slate-800/40 dark:bg-slate-900/60 ${annotation.id === activeAnnotationId ? "ring-2 ring-sky-300" : ""}`}
                        >
                            <div class="flex items-start justify-between gap-3">
                                <div class="flex-1 space-y-2">
                                    <div
                                        class="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500"
                                    >
                                        <span
                                            class="inline-flex h-3 w-3 rounded-full"
                                            style={`background-color:${annotation.color}`}
                                        ></span>
                                        <span>Annotation {index + 1}</span>
                                    </div>
                                    <p
                                        class="rounded-xl border border-slate-200/60 bg-white/80 px-3 py-2 text-xs italic text-slate-500 dark:border-slate-800/40 dark:bg-slate-900/50 dark:text-slate-300"
                                    >
                                        "{text.slice(
                                            annotation.start,
                                            annotation.end,
                                        )}"
                                    </p>
                                    <p
                                        class="text-sm text-slate-700 dark:text-slate-200"
                                    >
                                        {annotation.note}
                                    </p>
                                    <p
                                        class="text-xs text-slate-400 dark:text-slate-500"
                                    >
                                        {new Date(
                                            annotation.createdAt,
                                        ).toLocaleString()}
                                    </p>
                                </div>
                                <div class="flex flex-col gap-2">
                                    <button
                                        type="button"
                                        class="inline-flex items-center justify-center rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-sky-300 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 dark:border-slate-700 dark:text-slate-400 dark:hover:border-sky-500/40 dark:hover:text-sky-200 dark:focus-visible:ring-offset-slate-950"
                                        on:click={() =>
                                            toggleActive(annotation)}
                                    >
                                        Jump to text
                                    </button>
                                    <button
                                        type="button"
                                        class="inline-flex items-center justify-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-rose-500 transition hover:text-rose-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 focus-visible:ring-offset-2 dark:hover:text-rose-300 dark:focus-visible:ring-offset-slate-950"
                                        on:click={() =>
                                            deleteAnnotation(annotation.id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </li>
                    {/each}
                </ul>
            {/if}
        </div>
    </div>

    {#if infoMessage}
        <div class="flex justify-center">
            <p
                class="rounded-full border border-slate-200 bg-white/90 px-4 py-2 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-300"
            >
                {infoMessage}
            </p>
        </div>
    {/if}
</section>
