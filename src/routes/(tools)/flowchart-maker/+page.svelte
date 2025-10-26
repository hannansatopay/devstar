<script lang="ts">
  import { writable, derived } from "svelte/store";
  import Copy from "$lib/Copy.svelte";

  type NodeType = "start" | "process" | "decision" | "action" | "end";

  type FlowNode = {
    id: string;
    title: string;
    type: NodeType;
    details: string;
    next: string[];
  };

  const uid = () => Math.random().toString(36).slice(2, 10);

  const nodes = writable<FlowNode[]>([
    {
      id: uid(),
      title: "Kick-off meeting",
      type: "start",
      details: "Establish goals and constraints",
      next: [],
    },
    {
      id: uid(),
      title: "Design sprint",
      type: "process",
      details: "Prototype core flows and validate fit",
      next: [],
    },
    {
      id: uid(),
      title: "Launch readiness?",
      type: "decision",
      details: "Do acceptance criteria pass QA?",
      next: [],
    },
    {
      id: uid(),
      title: "Release",
      type: "end",
      details: "Ship to production",
      next: [],
    },
  ]);

  nodes.update(($nodes) => {
    if ($nodes.length >= 4) {
      $nodes[0].next = [$nodes[1].id];
      $nodes[1].next = [$nodes[2].id];
      $nodes[2].next = [$nodes[3].id];
    }
    return [...$nodes];
  });

  const flowJSON = derived(nodes, ($nodes) =>
    JSON.stringify({ nodes: $nodes }, null, 2),
  );

  const nodeLookup = derived(nodes, ($nodes) => {
    const map: Record<string, FlowNode> = {};
    $nodes.forEach((node) => {
      map[node.id] = node;
    });
    return map;
  });

  const flowStats = derived(nodes, ($nodes) => {
    const decisions = $nodes.filter((node) => node.type === "decision").length;
    const endings = $nodes.filter((node) => node.type === "end").length;
    return {
      total: $nodes.length,
      decisions,
      endings,
    };
  });

  let nodeForm: { title: string; type: NodeType; details: string } = {
    title: "",
    type: "process",
    details: "",
  };

  let connectionForm: { from: string; to: string } = { from: "", to: "" };

  let editingNodeId: string | null = null;
  let editDraft: { title: string; type: NodeType; details: string } = {
    title: "",
    type: "process",
    details: "",
  };

  const typeStyles: Record<
    NodeType,
    { bg: string; border: string; label: string; borderStrong: string }
  > = {
    start: {
      bg: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200",
      border: "border-emerald-300 dark:border-emerald-500/30",
      borderStrong: "border-emerald-400/70 dark:border-emerald-400/60",
      label: "Start",
    },
    process: {
      bg: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
      border: "border-blue-300 dark:border-blue-500/30",
      borderStrong: "border-blue-400/70 dark:border-blue-400/60",
      label: "Process",
    },
    decision: {
      bg: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
      border: "border-amber-300 dark:border-amber-500/30",
      borderStrong: "border-amber-400/70 dark:border-amber-400/60",
      label: "Decision",
    },
    action: {
      bg: "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-200",
      border: "border-purple-300 dark:border-purple-500/30",
      borderStrong: "border-purple-400/70 dark:border-purple-400/60",
      label: "Action",
    },
    end: {
      bg: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200",
      border: "border-rose-300 dark:border-rose-500/30",
      borderStrong: "border-rose-400/70 dark:border-rose-400/60",
      label: "End",
    },
  };

  let orderedNodes: FlowNode[] = [];

  $: orderedNodes = $nodes;

  $: {
    if (!orderedNodes.length) {
      connectionForm = { from: "", to: "" };
    } else {
      const firstId = orderedNodes[0].id;
      const defaultTo = orderedNodes[Math.min(1, orderedNodes.length - 1)].id;

      if (
        !connectionForm.from ||
        !orderedNodes.some((node) => node.id === connectionForm.from)
      ) {
        connectionForm = {
          from: firstId,
          to: orderedNodes.some((node) => node.id === connectionForm.to)
            ? connectionForm.to
            : defaultTo,
        };
      } else if (
        !connectionForm.to ||
        !orderedNodes.some((node) => node.id === connectionForm.to)
      ) {
        connectionForm = {
          ...connectionForm,
          to: defaultTo,
        };
      }

      if (
        connectionForm.from === connectionForm.to &&
        orderedNodes.length > 1
      ) {
        const fallback =
          orderedNodes.find((node) => node.id !== connectionForm.from)?.id ??
          defaultTo;
        if (fallback && fallback !== connectionForm.to) {
          connectionForm = { ...connectionForm, to: fallback };
        }
      }
    }
  }

  function addNode() {
    if (!nodeForm.title.trim()) return;
    nodes.update((list) => [
      ...list,
      {
        id: uid(),
        title: nodeForm.title.trim(),
        type: nodeForm.type,
        details: nodeForm.details.trim(),
        next: [],
      },
    ]);
    nodeForm = { title: "", type: "process", details: "" };
  }

  function startEditing(node: FlowNode) {
    editingNodeId = node.id;
    editDraft = {
      title: node.title,
      type: node.type,
      details: node.details,
    };
  }

  function cancelEditing() {
    editingNodeId = null;
    editDraft = { title: "", type: "process", details: "" };
  }

  function applyEdit() {
    if (!editingNodeId) return;
    if (!editDraft.title.trim()) return;
    nodes.update((list) =>
      list.map((node) =>
        node.id === editingNodeId
          ? {
              ...node,
              title: editDraft.title.trim(),
              type: editDraft.type,
              details: editDraft.details.trim(),
            }
          : node,
      ),
    );
    editingNodeId = null;
    editDraft = { title: "", type: "process", details: "" };
  }

  function removeNode(id: string) {
    nodes.update((list) => {
      const filtered = list.filter((node) => node.id !== id);
      return filtered.map((node) => ({
        ...node,
        next: node.next.filter((target) => target !== id),
      }));
    });
    if (editingNodeId === id) {
      editingNodeId = null;
      editDraft = { title: "", type: "process", details: "" };
    }
  }

  function moveNode(id: string, direction: -1 | 1) {
    nodes.update((list) => {
      const index = list.findIndex((node) => node.id === id);
      if (index === -1) return list;
      const target = index + direction;
      if (target < 0 || target >= list.length) return list;
      const clone = [...list];
      const [moved] = clone.splice(index, 1);
      clone.splice(target, 0, moved);
      return clone;
    });
  }

  function connectNodes() {
    if (!connectionForm.from || !connectionForm.to) return;
    if (connectionForm.from === connectionForm.to) return;
    nodes.update((list) =>
      list.map((node) =>
        node.id === connectionForm.from
          ? {
              ...node,
              next: node.next.includes(connectionForm.to)
                ? node.next
                : [...node.next, connectionForm.to],
            }
          : node,
      ),
    );
  }

  function removeConnection(sourceId: string, targetId: string) {
    nodes.update((list) =>
      list.map((node) =>
        node.id === sourceId
          ? { ...node, next: node.next.filter((next) => next !== targetId) }
          : node,
      ),
    );
  }
</script>

<section class="space-y-6">
  <div
    class="mx-auto grid w-full max-w-6xl gap-8 xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
  >
    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex items-start justify-between gap-4">
          <Copy text={$flowJSON} label="Copy JSON" floating={false} />
        </div>

        <div class="mt-6 grid gap-3 sm:grid-cols-3">
          <div
            class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
          >
            <p class="text-xs uppercase tracking-wide opacity-70">
              Total nodes
            </p>
            <p
              class="mt-1 text-2xl font-semibold text-slate-900 dark:text-white"
            >
              {$flowStats.total}
            </p>
          </div>
          <div
            class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
          >
            <p class="text-xs uppercase tracking-wide opacity-70">
              Decision points
            </p>
            <p
              class="mt-1 text-2xl font-semibold text-slate-900 dark:text-white"
            >
              {$flowStats.decisions}
            </p>
          </div>
          <div
            class="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-200"
          >
            <p class="text-xs uppercase tracking-wide opacity-70">End states</p>
            <p
              class="mt-1 text-2xl font-semibold text-slate-900 dark:text-white"
            >
              {$flowStats.endings}
            </p>
          </div>
        </div>

        <div class="mt-6 grid gap-4">
          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Step title</span
            >
            <input
              class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
              placeholder="e.g. QA sign-off"
              bind:value={nodeForm.title}
            />
          </label>
          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Type</span
            >
            <select
              class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
              bind:value={nodeForm.type}
            >
              <option value="start">Start</option>
              <option value="process">Process</option>
              <option value="decision">Decision</option>
              <option value="action">Action</option>
              <option value="end">End</option>
            </select>
          </label>
          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Details</span
            >
            <textarea
              class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
              rows="2"
              bind:value={nodeForm.details}
              placeholder="Optional context"
            ></textarea>
          </label>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-2xl bg-blue-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            on:click={addNode}
          >
            Add node
          </button>
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 class="text-lg font-semibold">Connect steps</h2>
        <div class="mt-4 grid gap-4">
          <div class="grid gap-3 sm:grid-cols-2">
            <label class="flex flex-col gap-2">
              <span
                class="text-xs font-semibold uppercase tracking-wide opacity-70"
                >From node</span
              >
              <select
                class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950"
                bind:value={connectionForm.from}
              >
                {#each orderedNodes as node}
                  <option value={node.id}>{node.title}</option>
                {/each}
              </select>
            </label>
            <label class="flex flex-col gap-2">
              <span
                class="text-xs font-semibold uppercase tracking-wide opacity-70"
                >To node</span
              >
              <select
                class="rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-400 dark:border-slate-700 dark:bg-slate-950"
                bind:value={connectionForm.to}
              >
                {#each orderedNodes as node}
                  <option value={node.id}>{node.title}</option>
                {/each}
              </select>
            </label>
          </div>
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            on:click={connectNodes}
          >
            Connect nodes
          </button>
        </div>
      </div>
    </div>

    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 class="text-lg font-semibold">Flow preview</h2>
        <div class="mt-6 flex flex-col gap-6">
          {#each orderedNodes as node, index (node.id)}
            <div class="flex gap-6">
              <div class="flex flex-col items-center">
                <div
                  class="flex h-4 w-4 items-center justify-center rounded-full bg-slate-400 text-[10px] font-semibold text-white dark:bg-slate-600"
                >
                  {index + 1}
                </div>
                {#if index < orderedNodes.length - 1}
                  <div
                    class="h-full w-px flex-1 bg-slate-300 dark:bg-slate-700"
                  ></div>
                {/if}
              </div>

              <div
                class={`flex-1 rounded-2xl border ${
                  editingNodeId === node.id
                    ? typeStyles[node.type].borderStrong
                    : typeStyles[node.type].border
                } bg-white p-4 shadow-sm transition dark:bg-slate-900/70 ${
                  editingNodeId === node.id
                    ? "ring-2 ring-offset-2 ring-slate-900/10 dark:ring-blue-400/30 dark:ring-offset-slate-900"
                    : ""
                }`}
              >
                <div class="flex items-center justify-between gap-4">
                  <div
                    class={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${typeStyles[node.type].bg}`}
                  >
                    {typeStyles[node.type].label}
                  </div>
                  {#if editingNodeId === node.id}
                    <div
                      class="flex flex-wrap items-center gap-2 text-xs font-semibold"
                    >
                      <button
                        type="button"
                        class="rounded-full bg-emerald-500 px-3 py-1 text-white transition hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                        on:click={applyEdit}
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        class="rounded-full bg-slate-200 px-3 py-1 text-slate-700 transition hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                        on:click={cancelEditing}
                      >
                        Cancel
                      </button>
                    </div>
                  {:else}
                    <div
                      class="flex flex-wrap items-center gap-2 text-xs font-semibold"
                    >
                      <button
                        type="button"
                        class="rounded-full bg-slate-900 px-3 py-1 text-white transition hover:bg-slate-800 dark:bg-blue-500 dark:hover:bg-blue-600"
                        on:click={() => moveNode(node.id, -1)}
                      >
                        Up
                      </button>
                      <button
                        type="button"
                        class="rounded-full bg-slate-900 px-3 py-1 text-white transition hover:bg-slate-800 dark:bg-blue-500 dark:hover:bg-blue-600"
                        on:click={() => moveNode(node.id, 1)}
                      >
                        Down
                      </button>
                      <button
                        type="button"
                        class="rounded-full bg-indigo-500 px-3 py-1 text-white transition hover:bg-indigo-600"
                        on:click={() => startEditing(node)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        class="rounded-full bg-rose-500 px-3 py-1 text-white transition hover:bg-rose-600"
                        on:click={() => removeNode(node.id)}
                      >
                        Remove
                      </button>
                    </div>
                  {/if}
                </div>

                {#if editingNodeId === node.id}
                  <div class="mt-4 grid gap-3">
                    <label
                      class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide opacity-70"
                    >
                      Title
                      <input
                        class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
                        bind:value={editDraft.title}
                        placeholder="Update step title"
                      />
                    </label>
                    <label
                      class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide opacity-70"
                    >
                      Type
                      <select
                        class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
                        bind:value={editDraft.type}
                      >
                        <option value="start">Start</option>
                        <option value="process">Process</option>
                        <option value="decision">Decision</option>
                        <option value="action">Action</option>
                        <option value="end">End</option>
                      </select>
                    </label>
                    <label
                      class="flex flex-col gap-2 text-xs font-semibold uppercase tracking-wide opacity-70"
                    >
                      Details
                      <textarea
                        class="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-950"
                        rows="3"
                        bind:value={editDraft.details}
                        placeholder="Optional description"
                      ></textarea>
                    </label>
                  </div>
                {:else}
                  <h3 class="mt-3 text-lg font-semibold">{node.title}</h3>
                  {#if node.details}
                    <p class="mt-1 text-sm opacity-80">{node.details}</p>
                  {/if}
                {/if}

                {#if node.next.length}
                  <div class="mt-4 flex flex-wrap items-center gap-2 text-xs">
                    <span
                      class="font-semibold uppercase tracking-wide opacity-70"
                      >Next:</span
                    >
                    {#each node.next as targetId}
                      {#if $nodeLookup[targetId]}
                        <span
                          class="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                        >
                          {$nodeLookup[targetId].title}
                          <button
                            type="button"
                            class="text-rose-500"
                            on:click={() => removeConnection(node.id, targetId)}
                          >
                            Remove
                          </button>
                        </span>
                      {/if}
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>
