<script lang="ts">
  import { onMount } from "svelte";
  import Copy from "$lib/Copy.svelte";

  type GradientKind =
    | "linear"
    | "linear-diagonal"
    | "radial"
    | "radial-ellipse"
    | "conic"
    | "solid";

  type MotionStyle =
    | "none"
    | "drift"
    | "pulse"
    | "rotate"
    | "heartbeat"
    | "snowfall";

  const MAX_COLORS = 6;
  const DEFAULT_COLORS = ["#000000", "#bb2d6f", "#fd9d1d", "#fcf437"];

  const gradientOptions: Array<{ label: string; value: GradientKind }> = [
    { label: "Linear (vertical)", value: "linear" },
    { label: "Linear (diagonal)", value: "linear-diagonal" },
    { label: "Radial circle", value: "radial" },
    { label: "Radial ellipse", value: "radial-ellipse" },
    { label: "Conic sweep", value: "conic" },
    { label: "Solid fill", value: "solid" },
  ];

  const motionOptions: Array<{ label: string; value: MotionStyle }> = [
    { label: "No motion", value: "none" },
    { label: "Slow drift", value: "drift" },
    { label: "Soft pulse", value: "pulse" },
    { label: "Orbit rotate", value: "rotate" },
    { label: "Heartbeat", value: "heartbeat" },
    { label: "Snowfall", value: "snowfall" },
  ];

  const snowflakes = Array.from({ length: 36 }, (_, index) => ({
    id: index,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 6 + Math.random() * 6,
    size: 4 + Math.random() * 6,
    opacity: 0.3 + Math.random() * 0.4,
  }));

  let colors = [...DEFAULT_COLORS];
  let newColor = "#70dd33";
  let newColorAlpha = 1;
  let gradientKind: GradientKind = "linear";
  let motionStyle: MotionStyle = "drift";
  let animationSpeed = 7;
  let angle = 90;

  let previewEl: HTMLDivElement;
  let cssSnippet = "";
  let htmlSnippet = "";
  let jsSnippet = "";

  let status = "";

  function notify(message: string) {
    status = message;
    setTimeout(() => (status = ""), 2000);
  }

  function formatColor(value: string, alpha = 1) {
    const hex = value.startsWith("#") ? value : `#${value}`;
    if (alpha >= 0.99) return hex;
    return hexToRgba(hex, alpha);
  }

  function hexToRgba(hex: string, alpha: number) {
    const normalized = hex.replace("#", "");
    const bigint = parseInt(normalized, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    const clamped = Math.min(1, Math.max(0.05, alpha));
    return `rgba(${r}, ${g}, ${b}, ${clamped.toFixed(2)})`;
  }

  function randomHex() {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i += 1) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  function addColor() {
    if (!newColor) return;
    if (colors.length >= MAX_COLORS) {
      notify("You've reached the 6 color limit.");
      return;
    }
    colors = [...colors, formatColor(newColor, newColorAlpha)];
    applyGradient();
  }

  function removeColor(index: number) {
    if (colors.length === 1) {
      notify("Keep at least one color.");
      return;
    }
    colors = colors.filter((_, i) => i !== index);
    applyGradient();
  }

  function resetPalette() {
    colors = [...DEFAULT_COLORS];
    newColorAlpha = 1;
    applyGradient();
  }

  function randomizeColors() {
    colors = Array.from({ length: 4 }, randomHex);
    newColorAlpha = 1;
    applyGradient();
  }

  function setGradientKind(kind: GradientKind) {
    gradientKind = kind;
    applyGradient();
  }

  function setMotionStyle(style: MotionStyle) {
    motionStyle = style;
    applyMotion();
    buildCSSSnippet();
  }

  function applyGradient() {
    if (!previewEl) return;

    const palette = colors.join(", ");
    previewEl.style.backgroundColor = "transparent";
    previewEl.style.backgroundImage = "none";
    previewEl.style.backgroundRepeat = "no-repeat";
    previewEl.style.backgroundSize = "200% 200%";

    switch (gradientKind) {
      case "linear":
        previewEl.style.backgroundImage = `linear-gradient(${angle}deg, ${palette})`;
        previewEl.style.backgroundSize = "400% 400%";
        break;
      case "linear-diagonal":
        previewEl.style.backgroundImage = `linear-gradient(${(angle + 45) % 360}deg, ${palette})`;
        previewEl.style.backgroundSize = "400% 400%";
        break;
      case "radial":
        previewEl.style.backgroundImage = `radial-gradient(circle at center, ${palette})`;
        previewEl.style.backgroundSize = "160% 160%";
        break;
      case "radial-ellipse":
        previewEl.style.backgroundImage = `radial-gradient(ellipse at center, ${palette})`;
        previewEl.style.backgroundSize = "180% 180%";
        break;
      case "conic":
        previewEl.style.backgroundImage = `conic-gradient(${palette})`;
        previewEl.style.backgroundSize = "180% 180%";
        break;
      case "solid":
        previewEl.style.backgroundColor = colors[0] ?? DEFAULT_COLORS[0];
        previewEl.style.backgroundImage = "none";
        previewEl.style.backgroundSize = "100% 100%";
        break;
    }

    applyMotion();
    buildCSSSnippet();
  }

  function applyMotion() {
    if (!previewEl) return;
    previewEl.dataset.motion = motionStyle;
    previewEl.style.setProperty(
      "--motion-duration",
      `${Math.max(2, animationSpeed)}s`,
    );
  }

  function buildCSSSnippet() {
    const palette = colors.join(", ");
    const duration = Math.max(2, animationSpeed);

    let base = "";
    switch (gradientKind) {
      case "linear":
        base = `background-image: linear-gradient(${angle}deg, ${palette});\n  background-size: 400% 400%;`;
        break;
      case "linear-diagonal":
        base = `background-image: linear-gradient(${(angle + 45) % 360}deg, ${palette});\n  background-size: 400% 400%;`;
        break;
      case "radial":
        base = `background-image: radial-gradient(circle at center, ${palette});`;
        break;
      case "radial-ellipse":
        base = `background-image: radial-gradient(ellipse at center, ${palette});`;
        break;
      case "conic":
        base = `background-image: conic-gradient(${palette});`;
        break;
      case "solid":
        base = `background-color: ${colors[0] ?? DEFAULT_COLORS[0]};`;
        break;
    }

    let motionDecl = "";
    let motionExtra = "";
    switch (motionStyle) {
      case "drift":
        motionDecl = `\n  animation: gradient-drift ${duration}s ease-in-out infinite;`;
        motionExtra = `
.living-background[data-motion="drift"] {
  background-size: 400% 400%;
}

@keyframes gradient-drift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}`;
        break;
      case "pulse":
        motionDecl = `\n  animation: gradient-pulse ${Math.max(2, duration * 0.6)}s ease-in-out infinite;`;
        motionExtra = `
@keyframes gradient-pulse {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.05); filter: brightness(1.06); }
}`;
        break;
      case "rotate":
        motionDecl = `\n  animation: gradient-rotate ${Math.max(2, duration * 0.8)}s linear infinite;\n  transform-origin: center;`;
        motionExtra = `
@keyframes gradient-rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}`;
        break;
      case "heartbeat":
        motionDecl = `\n  animation: gradient-heartbeat ${Math.max(2, duration * 0.7)}s ease-in-out infinite;\n  transform-origin: center;`;
        motionExtra = `
@keyframes gradient-heartbeat {
  0%, 20%, 100% { transform: scale(1); }
  30% { transform: scale(1.08); }
  45% { transform: scale(0.98); }
  60% { transform: scale(1.06); }
}`;
        break;
      case "snowfall":
        motionDecl = `\n  position: relative;\n  overflow: hidden;`;
        motionExtra = `
.living-background[data-motion="snowfall"] .snowflake {
  animation: snow-fall linear infinite;
}

@keyframes snow-fall {
  0% { transform: translate3d(0, -10vh, 0); opacity: 0; }
  20% { opacity: 1; }
  100% { transform: translate3d(15px, 110vh, 0); opacity: 0; }
}`;
        break;
      default:
        motionDecl = "";
        motionExtra = "";
    }

    const baseLines = [base, "background-repeat: no-repeat;"];
    if (motionDecl) {
      baseLines.push(motionDecl.trim());
    }

    cssSnippet = `.living-background {\n  ${baseLines.join("\n  ")}\n}`;
    if (motionExtra) {
      cssSnippet += `\n${motionExtra}`;
    }

    htmlSnippet = `<div class="living-background" data-motion="${motionStyle}"></div>`;

    if (motionStyle === "snowfall") {
      htmlSnippet = `<div class="living-background" data-motion="snowfall">
  <!-- render snowflake spans inside this element -->
</div>`;
    }

    if (motionStyle === "rotate" && gradientKind === "conic") {
      jsSnippet =
        "const el = document.querySelector('.living-background');\n// Optional: adjust rotation speed or pause on demand\nel?.style.setProperty('--motion-duration', '18s');";
    } else if (gradientKind === "solid") {
      jsSnippet = "// No additional JS required for solid backgrounds.";
    } else {
      jsSnippet =
        "const el = document.querySelector('.living-background');\n// Example: update gradient angle\nel?.style.setProperty('--gradient-angle', '120deg');";
    }
  }

  onMount(() => {
    applyGradient();
  });
</script>

<section class="bg-slate-50 dark:bg-slate-950">
  <div
    class="mx-auto grid max-w-6xl gap-6 px-4 py-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-10 lg:py-16"
  >
    <div class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-slate-900/80"
      >
        <h1
          class="text-2xl font-semibold text-slate-900 dark:text-white md:text-3xl"
        >
          Living background generator
        </h1>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Blend animated gradients and ambient motion for hero sections,
          dashboards, or ambient visuals. Tune palette, style, and motion
          instantly.
        </p>
        {#if status}
          <p
            class="mt-3 text-xs font-semibold text-emerald-600 dark:text-emerald-300"
          >
            {status}
          </p>
        {/if}
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Colors
        </p>
        <div class="mt-3 flex flex-wrap items-center gap-3">
          {#each colors as color, index}
            <button
              type="button"
              class="relative h-10 w-10 rounded-full border border-slate-200 shadow-sm transition hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:border-slate-700 dark:focus:ring-indigo-700"
              style={`background: ${color}`}
              on:click={() => removeColor(index)}
              aria-label={`Remove color ${color}`}
            >
              <span class="sr-only">Remove</span>
            </button>
          {/each}
          <label
            class="flex w-full flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 sm:w-auto sm:flex-row sm:items-center"
          >
            <div class="flex items-center gap-2">
              <span>Add</span>
              <input
                class="h-8 w-8 cursor-pointer rounded-full border border-slate-200 dark:border-slate-600"
                type="color"
                bind:value={newColor}
              />
            </div>
            <div class="flex flex-1 items-center gap-2">
              <input
                class="w-full accent-indigo-600"
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                bind:value={newColorAlpha}
              />
              <div
                class="h-8 w-8 rounded-full border border-slate-300 shadow-sm dark:border-slate-600"
                style={`background:${newColor};opacity:${newColorAlpha}`}
              ></div>
            </div>
            <button
              class="rounded-full bg-indigo-600 px-3 py-1 text-xs font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:focus:ring-indigo-700"
              type="button"
              on:click={addColor}
            >
              Add
            </button>
          </label>
          <button
            class="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            type="button"
            on:click={resetPalette}
          >
            Reset palette
          </button>
          <button
            class="rounded-full border border-indigo-200 px-3 py-1 text-xs font-semibold text-indigo-600 transition hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:border-indigo-700 dark:text-indigo-200 dark:hover:bg-indigo-900/30 dark:focus:ring-indigo-800"
            type="button"
            on:click={randomizeColors}
          >
            Random palette
          </button>
        </div>
      </div>

      <div
        class="space-y-6 rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
      >
        <div>
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Gradient type
          </p>
          <div class="mt-3 flex flex-wrap gap-2">
            {#each gradientOptions as option}
              <button
                type="button"
                class={`rounded-full px-4 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 ${
                  gradientKind === option.value
                    ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                    : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                }`}
                on:click={() => setGradientKind(option.value)}
              >
                {option.label}
              </button>
            {/each}
          </div>
        </div>
        {#if gradientKind === "linear" || gradientKind === "linear-diagonal"}
          <div class="space-y-2">
            <div
              class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              <span>Angle</span>
              <span>{angle}deg</span>
            </div>
            <input
              class="w-full accent-indigo-600"
              type="range"
              min="0"
              max="360"
              bind:value={angle}
              on:input={applyGradient}
            />
          </div>
        {/if}
        <div class="space-y-2">
          <div
            class="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            <span>Animation speed</span>
            <span>{animationSpeed}s</span>
          </div>
          <input
            class="w-full accent-indigo-600"
            type="range"
            min="3"
            max="30"
            bind:value={animationSpeed}
            on:input={() => {
              applyMotion();
              buildCSSSnippet();
            }}
          />
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
      >
        <p
          class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Motion
        </p>
        <div class="mt-3 flex flex-wrap gap-2">
          {#each motionOptions as option}
            <button
              type="button"
              class={`rounded-full px-4 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800 ${
                motionStyle === option.value
                  ? "bg-indigo-600 text-white shadow-sm dark:bg-indigo-500"
                  : "border border-slate-300 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
              on:click={() => setMotionStyle(option.value)}
            >
              {option.label}
            </button>
          {/each}
        </div>
      </div>

      <div
        class="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
      >
        <div class="flex flex-wrap items-center gap-3">
          <Copy text={cssSnippet} label="Copy CSS" floating={false} />
          <Copy text={htmlSnippet} label="Copy HTML" floating={false} />
          <Copy text={jsSnippet} label="Copy JS" floating={false} />
        </div>
        <div class="mt-4 grid gap-3">
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              HTML
            </p>
            <pre
              class="mt-2 max-h-40 overflow-auto rounded-xl bg-slate-900/95 p-4 font-mono text-xs text-emerald-300 dark:bg-black">{htmlSnippet}</pre>
          </div>
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              CSS
            </p>
            <pre
              class="mt-2 max-h-60 overflow-auto rounded-xl bg-slate-900/95 p-4 font-mono text-xs text-emerald-300 dark:bg-black">{cssSnippet}</pre>
          </div>
          <div>
            <p
              class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
            >
              JS (optional)
            </p>
            <pre
              class="mt-2 max-h-40 overflow-auto rounded-xl bg-slate-900/95 p-4 font-mono text-xs text-emerald-300 dark:bg-black">{jsSnippet}</pre>
          </div>
        </div>
      </div>
    </div>

    <aside class="space-y-6">
      <div
        class="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <div
          class="relative overflow-hidden rounded-[28px] border border-white/40 bg-slate-100 p-6 dark:border-white/10 dark:bg-slate-950/60"
        >
          <div
            class="living-preview relative min-h-[340px] rounded-[20px] border border-white/30 shadow-inner dark:border-white/10"
            bind:this={previewEl}
            data-motion={motionStyle}
          >
            <div
              class:opacity-100={motionStyle === "snowfall"}
              class:opacity-0={motionStyle !== "snowfall"}
              class="snow-layer pointer-events-none opacity-0 transition-opacity duration-500"
            >
              {#each snowflakes as flake}
                <span
                  class="snowflake"
                  style={`left:${flake.left}%;animation-delay:${flake.delay}s;animation-duration:${flake.duration}s;width:${flake.size}px;height:${flake.size}px;opacity:${flake.opacity}`}
                ></span>
              {/each}
            </div>
          </div>
          <div
            class="pointer-events-none absolute inset-0 rounded-[28px] bg-gradient-to-br from-white/10 via-transparent to-slate-900/40 dark:from-white/5"
          ></div>
        </div>
      </div>
    </aside>
  </div>
</section>

<style>
  .living-preview {
    position: relative;
    overflow: hidden;
    background-repeat: no-repeat;
    background-size: 200% 200%;
    transition:
      transform 0.6s ease,
      filter 0.6s ease;
  }

  .living-preview[data-motion="none"] {
    animation: none;
    transform: none;
  }

  .living-preview[data-motion="drift"] {
    animation: gradient-drift var(--motion-duration, 16s) ease-in-out infinite;
    background-size: 400% 400%;
  }

  .living-preview[data-motion="pulse"] {
    animation: gradient-pulse calc(var(--motion-duration, 16s) * 0.6)
      ease-in-out infinite;
  }

  .living-preview[data-motion="rotate"] {
    animation: gradient-rotate calc(var(--motion-duration, 16s) * 0.8) linear
      infinite;
    transform-origin: center;
  }

  .living-preview[data-motion="heartbeat"] {
    animation: gradient-heartbeat calc(var(--motion-duration, 14s) * 0.7)
      ease-in-out infinite;
    transform-origin: center;
  }

  .living-preview[data-motion="snowfall"] {
    animation: none;
    transform: none;
  }

  .snow-layer {
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  .snowflake {
    position: absolute;
    top: -10%;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 9999px;
    animation-name: snow-fall;
    animation-timing-function: linear;
    animation-iteration-count: infinite;
    will-change: transform;
  }

  @keyframes gradient-drift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  @keyframes gradient-pulse {
    0%,
    100% {
      transform: scale(1);
      filter: brightness(1);
    }
    50% {
      transform: scale(1.05);
      filter: brightness(1.06);
    }
  }

  @keyframes gradient-rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  @keyframes gradient-heartbeat {
    0%,
    20%,
    100% {
      transform: scale(1);
    }
    30% {
      transform: scale(1.08);
    }
    45% {
      transform: scale(0.98);
    }
    60% {
      transform: scale(1.06);
    }
  }

  @keyframes snow-fall {
    0% {
      transform: translate3d(0, -10vh, 0);
      opacity: 0;
    }
    20% {
      opacity: 1;
    }
    100% {
      transform: translate3d(15px, 110vh, 0);
      opacity: 0;
    }
  }
</style>
