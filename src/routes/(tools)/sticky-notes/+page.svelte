<script lang="ts">
	import { onMount } from "svelte";
	import { derived, get, writable } from "svelte/store";

	type NoteRecord = {
		id?: number;
		name: string;
		content: string;
		color: string;
		pinned: boolean;
		createdAt: string;
		updatedAt: string;
	};

	const DB_NAME = "sticky_notes_db_v2";
	const STORE_NAME = "notes";
	const DB_VERSION = 1;

	let db: IDBDatabase | null = null;
	let opening: Promise<void> | null = null;

	const palette = [
		"#fde68a",
		"#fca5a5",
		"#a5f3fc",
		"#f9a8d4",
		"#bbf7d0",
		"#f5f5f4",
	];
	let selectedColour = palette[0];

	const notes = writable<NoteRecord[]>([]);
	const searchTerm = writable("");
	const pinnedOnly = writable(false);

	const openDB = () =>
		new Promise<void>((resolve, reject) => {
			const request = indexedDB.open(DB_NAME, DB_VERSION);

			request.onerror = (event) => {
				opening = null;
				reject((event.target as IDBRequest).error);
			};

			request.onsuccess = (event) => {
				db = (event.target as IDBRequest<IDBDatabase>).result;
				opening = null;
				resolve();
			};

			request.onupgradeneeded = (event) => {
				db = (event.target as IDBRequest<IDBDatabase>).result;
				opening = null;
				if (db && !db.objectStoreNames.contains(STORE_NAME)) {
					const store = db.createObjectStore(STORE_NAME, {
						keyPath: "id",
						autoIncrement: true,
					});
					store.createIndex("pinned", "pinned", { unique: false });
					store.createIndex("updatedAt", "updatedAt", {
						unique: false,
					});
				}
			};
		});

	const ensureDB = async () => {
		if (db) return;
		opening ??= openDB();
		await opening;
	};

	const sortNotes = (entries: NoteRecord[]) => {
		const byRecency = (a: NoteRecord, b: NoteRecord) =>
			new Date(b.updatedAt ?? b.createdAt).getTime() -
			new Date(a.updatedAt ?? a.createdAt).getTime();

		const pinned = entries.filter((item) => item.pinned).sort(byRecency);
		const others = entries.filter((item) => !item.pinned).sort(byRecency);
		return [...pinned, ...others];
	};

	const fetchNotes = async (): Promise<NoteRecord[]> => {
		await ensureDB();
		if (!db) return [];

		const transaction = db.transaction([STORE_NAME], "readonly");
		const store = transaction.objectStore(STORE_NAME);
		const request = store.getAll();

		return new Promise((resolve, reject) => {
			request.onsuccess = () =>
				resolve(sortNotes(request.result as NoteRecord[]));
			request.onerror = (event) =>
				reject((event.target as IDBRequest).error);
		});
	};

	const persistNote = async (note: NoteRecord): Promise<NoteRecord> => {
		await ensureDB();
		if (!db) throw new Error("Database is not open");

		const entry: NoteRecord = { ...note };
		const timestamp = new Date().toISOString();

		if (typeof entry.id === "number") {
			entry.updatedAt = timestamp;
		} else {
			entry.createdAt = timestamp;
			entry.updatedAt = timestamp;
		}

		const transaction = db.transaction([STORE_NAME], "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		const request =
			typeof entry.id === "number" ? store.put(entry) : store.add(entry);

		return new Promise((resolve, reject) => {
			request.onsuccess = (event) => {
				if (typeof entry.id !== "number") {
					entry.id = (event.target as IDBRequest<IDBValidKey>)
						.result as number;
				}
			};
			transaction.oncomplete = () => resolve(entry);
			transaction.onerror = (event) =>
				reject((event.target as IDBRequest).error);
		});
	};

	const deleteNote = async (id: number) => {
		await ensureDB();
		if (!db) return;

		const transaction = db.transaction([STORE_NAME], "readwrite");
		const store = transaction.objectStore(STORE_NAME);
		store.delete(id);

		return new Promise<void>((resolve, reject) => {
			transaction.oncomplete = () => resolve();
			transaction.onerror = (event) =>
				reject((event.target as IDBRequest).error);
		});
	};

	const filteredNotes = derived(
		[notes, searchTerm, pinnedOnly],
		([items, term, onlyPinned]) => {
			const normalized = term.trim().toLowerCase();
			const sorted = sortNotes([...items]);

			return sorted.filter((note) => {
				if (onlyPinned && !note.pinned) return false;
				if (!normalized) return true;
				const title = note.name?.toLowerCase() ?? "";
				const body = note.content?.toLowerCase() ?? "";
				return title.includes(normalized) || body.includes(normalized);
			});
		},
	);

	const boardStats = derived(notes, (items) => ({
		total: items.length,
		pinned: items.filter((note) => note.pinned).length,
	}));

	const formatTimestamp = (note: NoteRecord) => {
		const source = note.updatedAt ?? note.createdAt;
		return new Date(source).toLocaleString();
	};

	onMount(async () => {
		await ensureDB();
		const existing = await fetchNotes();
		if (existing.length) {
			selectedColour = existing[0]?.color ?? palette[0];
		}
		notes.set(existing);
	});

	const setColour = (colour: string) => {
		selectedColour = colour;
	};

	const createNote = async () => {
		const created = await persistNote({
			name: "Untitled",
			content: "",
			color: selectedColour,
			pinned: false,
			createdAt: "",
			updatedAt: "",
		});

		const current = get(notes);
		notes.set(sortNotes([...current, created]));
	};

	const updateNote = async (
		id: number | undefined,
		changes: Partial<NoteRecord>,
	) => {
		if (!id) return;

		const current = get(notes);
		const index = current.findIndex((item) => item.id === id);
		if (index === -1) return;

		const updated = {
			...current[index],
			...changes,
			updatedAt: new Date().toISOString(),
		};
		const next = [...current];
		next[index] = updated;
		notes.set(sortNotes(next));
		await persistNote(updated);
	};

	const togglePin = (note: NoteRecord) =>
		updateNote(note.id, { pinned: !note.pinned });

	const removeNote = async (id: number | undefined) => {
		if (!id) return;
		await deleteNote(id);
		notes.update((items) => items.filter((note) => note.id !== id));
	};

	const clearSearch = () => {
		searchTerm.set("");
	};

	const chipBaseClasses =
		"inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900";

	const pinChipClasses = (pinned: boolean) =>
		`${chipBaseClasses} ${
			pinned
				? "bg-emerald-500 text-white hover:bg-emerald-600 dark:bg-emerald-500 dark:hover:bg-emerald-400"
				: "bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-500/20 dark:text-sky-100 dark:hover:bg-sky-500/30"
		}`;

	const deleteChipClasses = `${chipBaseClasses} bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-100 dark:hover:bg-rose-500/30`;

	const handleTitleInput = (note: NoteRecord) => (event: Event) => {
		const target = event.target as HTMLInputElement;
		updateNote(note.id, { name: target.value });
	};

	const handleContentInput = (note: NoteRecord) => (event: Event) => {
		const target = event.target as HTMLTextAreaElement;
		updateNote(note.id, { content: target.value });
	};

	const autoResize = (node: HTMLTextAreaElement) => {
		let frame = 0;

		const resize = () => {
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => {
				node.style.height = "auto";
				node.style.height = `${node.scrollHeight}px`;
			});
		};

		const handleInput = () => resize();

		resize();
		node.addEventListener("input", handleInput);

		return {
			update: resize,
			destroy() {
				cancelAnimationFrame(frame);
				node.removeEventListener("input", handleInput);
			},
		};
	};
</script>

<section class="space-y-6 flex flex-col">
	<header
		class="space-y-6 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-sm sm:p-8 dark:border-slate-700/60 dark:bg-slate-900/70"
	>
		<div class="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-end">
			<div
				class="flex flex-col gap-4 rounded-2xl border border-slate-200/60 bg-white/70 p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/60 dark:bg-slate-900/70"
			>
				<div class="flex flex-wrap items-center gap-3">
					<span
						class="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
						>Colour</span
					>
					{#each palette as colour}
						<button
							type="button"
							class={`h-10 w-10 rounded-full border-2 border-transparent shadow-sm transition hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:focus-visible:ring-sky-500 dark:focus-visible:ring-offset-slate-900 ${selectedColour === colour ? "border-sky-400 ring-4 ring-sky-200 dark:ring-sky-500/40" : ""}`}
							style={`background-color:${colour}`}
							aria-label={`New notes use ${colour}`}
							on:click={() => setColour(colour)}
						/>
					{/each}
				</div>
				<button
					type="button"
					class="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500 px-6 py-2.5 text-sm font-semibold text-slate-900 shadow-lg transition hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 dark:text-slate-950"
					on:click={createNote}
				>
					<span aria-hidden="true" class="text-lg leading-none"
						>＋</span
					>
					New note
				</button>
			</div>
			<div class="flex flex-wrap items-stretch gap-4 lg:justify-end">
				<div
					class="flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-slate-600 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300"
				>
					<span
						class="text-xs font-medium uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400"
						>Total</span
					>
					<span
						class="text-2xl font-semibold text-slate-900 dark:text-slate-50"
						>{$boardStats.total}</span
					>
				</div>
				<div
					class="flex flex-col justify-between rounded-2xl border border-slate-200/70 bg-white/90 px-4 py-3 text-slate-600 shadow-sm dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-300"
				>
					<span
						class="text-xs font-medium uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400"
						>Pinned</span
					>
					<span
						class="text-2xl font-semibold text-slate-900 dark:text-slate-50"
						>{$boardStats.pinned}</span
					>
				</div>
			</div>
		</div>
	</header>

	<div
		class="flex flex-col gap-4 rounded-3xl border border-slate-200/60 bg-white/80 p-6 shadow-xl backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-700/60 dark:bg-slate-900/70"
	>
		<label class="relative flex w-full max-w-xl items-center gap-3">
			<span class="sr-only">Search notes</span>
			<span class="text-slate-400 dark:text-slate-500">
				<svg
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
					aria-hidden="true"
				>
					<path
						fill-rule="evenodd"
						d="M9 3.5a5.5 5.5 0 013.966 9.316l3.109 3.109a.75.75 0 11-1.06 1.06l-3.11-3.108A5.5 5.5 0 119 3.5zm0 1.5a4 4 0 100 8 4 4 0 000-8z"
						clip-rule="evenodd"
					/>
				</svg>
			</span>
			<input
				type="search"
				placeholder="Search notes..."
				class="w-full rounded-full border border-slate-200/60 bg-white/90 px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/60"
				bind:value={$searchTerm}
			/>
			{#if $searchTerm}
				<button
					type="button"
					class="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
					on:click={clearSearch}
					aria-label="Clear search"
				>
					<svg
						class="h-4 w-4"
						viewBox="0 0 20 20"
						fill="currentColor"
						aria-hidden="true"
					>
						<path
							fill-rule="evenodd"
							d="M6.404 5.404a.75.75 0 011.06 0L10 7.94l2.536-2.536a.75.75 0 111.06 1.06L11.06 9l2.536 2.536a.75.75 0 11-1.06 1.06L10 10.06l-2.536 2.536a.75.75 0 11-1.06-1.06L8.94 9 6.404 6.464a.75.75 0 010-1.06z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			{/if}
		</label>

		<label
			class="inline-flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-300"
		>
			<input
				type="checkbox"
				class="h-5 w-5 rounded border-slate-300 text-sky-500 focus:ring-2 focus:ring-sky-400 dark:border-slate-600 dark:bg-slate-800 dark:text-sky-400 dark:focus:ring-sky-500"
				bind:checked={$pinnedOnly}
			/>
			<span>Show pinned only</span>
		</label>
	</div>

	{#if $filteredNotes.length === 0}
		<div
			class="grid place-items-center gap-4 rounded-3xl border border-slate-200/60 bg-white/90 p-12 text-center shadow-xl dark:border-slate-700/60 dark:bg-slate-900/70"
		>
			<h2
				class="text-2xl font-semibold text-slate-900 dark:text-slate-50"
			>
				No notes yet
			</h2>
			<p class="max-w-xl text-base text-slate-600 dark:text-slate-300">
				{#if $searchTerm}
					Try a different search or reset your filters to see
					everything again.
				{:else if $pinnedOnly}
					You haven't pinned anything yet. Turn off the toggle or pin
					a note to see it here.
				{:else}
					Start by choosing a colour, then add a note to capture your
					first idea.
				{/if}
			</p>
			<button
				type="button"
				class="inline-flex items-center justify-center rounded-full border border-sky-300 px-6 py-2 text-sm font-semibold text-sky-600 transition hover:border-sky-400 hover:text-sky-700 dark:border-sky-500/50 dark:text-sky-300 dark:hover:border-sky-400 dark:hover:text-sky-200"
				on:click={createNote}
			>
				Create a note
			</button>
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
			{#each $filteredNotes as note (note.id)}
				<article
					class={`relative flex flex-col gap-4 rounded-3xl border border-black/5 p-5 text-slate-900 shadow-md transition hover:-translate-y-1 hover:shadow-xl dark:border-black/40 ${note.pinned ? "ring-2 ring-emerald-400/60" : ""}`}
					style={`background-color:${note.color}`}
				>
					<div class="flex items-start justify-between gap-3">
						<input
							class="w-full border-none bg-transparent text-lg font-semibold text-slate-900 placeholder:text-slate-600 focus:outline-none dark:text-slate-900 dark:placeholder:text-slate-700"
							type="text"
							bind:value={note.name}
							placeholder="Untitled"
							on:input={handleTitleInput(note)}
						/>
						<div class="flex items-center gap-2">
							<button
								type="button"
								class={pinChipClasses(note.pinned)}
								on:click={() => togglePin(note)}
							>
								{note.pinned ? "Pinned" : "Pin"}
							</button>
							<button
								type="button"
								class={deleteChipClasses}
								on:click={() => removeNote(note.id)}
							>
								Delete
							</button>
						</div>
					</div>
					<textarea
						class="min-h-[140px] w-full resize-none border-none bg-transparent text-base leading-relaxed text-slate-800 placeholder:text-slate-600 focus:outline-none dark:text-slate-900 dark:placeholder:text-slate-700"
						use:autoResize
						placeholder="Type something memorable..."
						bind:value={note.content}
						on:input={handleContentInput(note)}
					/>
					<div
						class="flex items-center justify-between text-xs text-slate-700 dark:text-slate-800"
					>
						<span>Updated {formatTimestamp(note)}</span>
						<span
							class="h-3 w-3 rounded-full border border-black/10 shadow-sm"
							style={`background-color:${note.color}`}
							aria-hidden="true"
						/>
					</div>
				</article>
			{/each}
		</div>
	{/if}
</section>
