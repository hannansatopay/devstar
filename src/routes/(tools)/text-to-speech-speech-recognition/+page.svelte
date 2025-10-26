<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import Copy from "$lib/Copy.svelte";

  type VoiceOption = {
    id: string;
    label: string;
    voice: SpeechSynthesisVoice;
  };

  type RecognitionEntry = {
    id: number;
    text: string;
    timestamp: number;
    language: string;
    durationSeconds: number;
  };

  const recognitionLanguages = [
    { label: "English (US)", value: "en-US" },
    { label: "English (UK)", value: "en-GB" },
    { label: "English (Australia)", value: "en-AU" },
    { label: "English (India)", value: "en-IN" },
    { label: "English (Nigeria)", value: "en-NG" },
    { label: "Espanol (Mexico)", value: "es-MX" },
    { label: "Espanol (Spain)", value: "es-ES" },
    { label: "Espanol (US)", value: "es-US" },
    { label: "Francais (France)", value: "fr-FR" },
    { label: "Francais (Canada)", value: "fr-CA" },
    { label: "Deutsch", value: "de-DE" },
    { label: "Italiano", value: "it-IT" },
    { label: "Portugues (Brasil)", value: "pt-BR" },
    { label: "Portugues (Portugal)", value: "pt-PT" },
    { label: "Hindi", value: "hi-IN" },
    { label: "Bengali", value: "bn-IN" },
    { label: "Tamil", value: "ta-IN" },
    { label: "Japanese", value: "ja-JP" },
    { label: "Korean", value: "ko-KR" },
    { label: "Mandarin Chinese", value: "zh-CN" },
    { label: "Cantonese", value: "yue-Hant-HK" },
    { label: "Vietnamese", value: "vi-VN" },
    { label: "Thai", value: "th-TH" },
    { label: "Indonesian", value: "id-ID" },
    { label: "Malay", value: "ms-MY" },
    { label: "Filipino", value: "fil-PH" },
    { label: "Turkish", value: "tr-TR" },
    { label: "Arabic (Saudi)", value: "ar-SA" },
    { label: "Arabic (Egypt)", value: "ar-EG" },
    { label: "Russian", value: "ru-RU" },
    { label: "Polish", value: "pl-PL" },
    { label: "Dutch", value: "nl-NL" },
    { label: "Swedish", value: "sv-SE" },
    { label: "Danish", value: "da-DK" },
    { label: "Norwegian", value: "nb-NO" },
    { label: "Finnish", value: "fi-FI" },
    { label: "Czech", value: "cs-CZ" },
    { label: "Romanian", value: "ro-RO" },
    { label: "Ukrainian", value: "uk-UA" },
    { label: "Greek", value: "el-GR" },
    { label: "Hebrew", value: "he-IL" },
  ];

  const scriptSnippets = [
    "Welcome to our sprint review. We will walk through the highlights, blockers, and top asks before Q and A.",
    "Thanks for joining this usability readout. Listen for the biggest friction points, quotes, and near term fixes.",
    "Here is the onboarding walkthrough. Follow along, pause for context, and note experiments you want to run next.",
    "This is the client handoff update. It includes the delivery timeline, owners, and expectations for week one.",
    "Record your ideas for the support bot. Describe the tone, response pattern, and escalation rules you want to try.",
  ];

  const pacingPresets = [
    { label: "Balanced", rate: 1, pitch: 1 },
    { label: "Warm narration", rate: 0.92, pitch: 0.96 },
    { label: "Explainer upbeat", rate: 1.12, pitch: 1.04 },
    { label: "Podcast calm", rate: 0.85, pitch: 0.98 },
    { label: "Ad punchy", rate: 1.24, pitch: 1.1 },
  ];

  let synthesisSupported = false;
  let voices: VoiceOption[] = [];
  let filteredVoices: VoiceOption[] = [];
  let voiceFilter = "";
  let selectedVoiceId: string | null = null;
  let rate = 1;
  let pitch = 1;
  let volume = 1;
  let speaking = false;
  let paused = false;
  let utterance: SpeechSynthesisUtterance | null = null;

  let scriptTitle = "Conversation prototype";
  let script =
    "Thanks for joining our working session. This assistant will read the draft, capture feedback, and help you iterate.";
  let sampleIndex = 0;

  let recognitionSupported = false;
  // Provide fallback type aliases for the Web Speech API types so the file compiles
  // in projects where the DOM lib does not include SpeechRecognition declarations.
  type SpeechRecognition = any;
  type SpeechRecognitionEvent = any;
  type SpeechRecognitionErrorEvent = any;
  let recognition: SpeechRecognition | null = null;
  let recognitionLanguage = "en-US";
  let languageQuery = "";
  let visibleRecognitionLanguages = recognitionLanguages;
  let continuousMode = true;
  let showInterim = true;
  let maxAlternatives = 1;
  let autoClearTranscript = false;
  let restartRecognition = true;
  let recognitionActive = false;
  let recognitionInterim = "";
  let recognitionTranscript = "";
  let recognitionLog: RecognitionEntry[] = [];
  let recognitionError = "";
  let recognitionSessionSeconds = 0;
  let recognitionTimer: ReturnType<typeof setInterval> | null = null;

  const synthesis =
    typeof window !== "undefined" ? window.speechSynthesis : null;
  onMount(() => {
    synthesisSupported = Boolean(synthesis);
    if (synthesisSupported) {
      loadVoices();
      synthesis?.addEventListener("voiceschanged", loadVoices);
    }
    setupRecognition();
  });

  onDestroy(() => {
    synthesis?.removeEventListener("voiceschanged", loadVoices);
    stopSpeech();
    teardownRecognition();
  });

  function loadVoices() {
    if (!synthesis) return;
    const list = synthesis.getVoices();
    voices = list.map((voice, index) => ({
      id: `${voice.lang}-${voice.name}-${index}`,
      label: `${voice.name} (${voice.lang})${voice.default ? " - default" : ""}`,
      voice,
    }));
    filteredVoices = filterVoices(voiceFilter);
    if (!selectedVoiceId && voices.length) {
      const defaultVoice =
        voices.find((candidate) => candidate.voice.default) ?? voices[0];
      selectedVoiceId = defaultVoice.id;
    }
  }

  function filterVoices(query: string) {
    if (!query.trim()) return voices;
    const needle = query.toLowerCase();
    return voices.filter((candidate) =>
      candidate.label.toLowerCase().includes(needle),
    );
  }

  function getSelectedVoice() {
    return (
      voices.find((option) => option.id === selectedVoiceId)?.voice ?? null
    );
  }

  function speakText(text: string) {
    if (!synthesisSupported || !synthesis || !text.trim()) return;
    stopSpeech();
    const voice = getSelectedVoice();
    utterance = new SpeechSynthesisUtterance(text.trim());
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;
    if (voice) utterance.voice = voice;
    utterance.onstart = () => {
      speaking = true;
      paused = false;
    };
    utterance.onend = () => {
      speaking = false;
      paused = false;
      utterance = null;
    };
    utterance.onerror = () => {
      speaking = false;
      paused = false;
      utterance = null;
    };
    synthesis.cancel();
    synthesis.speak(utterance);
  }

  function speakScript() {
    speakText(script);
  }

  function previewSentence(sentence: string) {
    speakText(sentence);
  }

  function pauseSpeech() {
    if (!synthesisSupported || !synthesis || !speaking || paused) return;
    synthesis.pause();
    paused = true;
  }

  function resumeSpeech() {
    if (!synthesisSupported || !synthesis || !speaking || !paused) return;
    synthesis.resume();
    paused = false;
  }

  function stopSpeech() {
    if (!synthesisSupported || !synthesis) return;
    synthesis.cancel();
    speaking = false;
    paused = false;
    utterance = null;
  }

  function applyPreset(index: number) {
    const preset = pacingPresets[index];
    if (!preset) return;
    rate = Number(preset.rate.toFixed(2));
    pitch = Number(preset.pitch.toFixed(2));
  }

  function resetVoiceControls() {
    rate = 1;
    pitch = 1;
    volume = 1;
  }

  function downloadScript() {
    if (!script.trim()) return;
    const payload = `${scriptTitle}\nGenerated: ${new Date().toLocaleString()}\nVoice: ${
      getSelectedVoice()?.name ?? "Any"
    }\nRate: ${rate}\nPitch: ${pitch}\nVolume: ${volume}\n\n${script.trim()}`;
    const blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `conversation-script-${new Date().toISOString()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function useSnippet(index: number) {
    const snippet = scriptSnippets[index];
    if (!snippet) return;
    script = snippet;
    sampleIndex = index;
  }

  function cycleSnippet(direction: 1 | -1) {
    const count = scriptSnippets.length;
    sampleIndex = (sampleIndex + direction + count) % count;
    script = scriptSnippets[sampleIndex];
  }
  function setupRecognition() {
    const Constructor =
      typeof window !== "undefined"
        ? (window as any).SpeechRecognition ||
          (window as any).webkitSpeechRecognition
        : null;
    if (!Constructor) {
      recognitionSupported = false;
      return;
    }
    recognitionSupported = true;
    recognition = new Constructor();
    configureRecognitionOptions();
    recognition.onstart = () => {
      recognitionActive = true;
      recognitionError = "";
      recognitionSessionSeconds = 0;
      startRecognitionTimer();
    };
    recognition.onresult = (event: SpeechRecognitionEvent | any) => {
      let finalText = "";
      let interimText = "";
      for (
        let index = event.resultIndex;
        index < event.results.length;
        index += 1
      ) {
        const result = event.results[index];
        const text = result[0]?.transcript?.trim?.() ?? "";
        if (!text) continue;
        if (result.isFinal) {
          finalText = `${finalText} ${text}`.trim();
        } else {
          interimText = `${interimText} ${text}`.trim();
        }
      }
      if (finalText) {
        recognitionTranscript = `${recognitionTranscript} ${finalText}`.trim();
      }
      recognitionInterim = interimText;
    };
    recognition.onerror = (event: SpeechRecognitionErrorEvent | any) => {
      recognitionActive = false;
      recognitionError =
        event?.error === "not-allowed"
          ? "Microphone access was denied. Allow mic permissions and try again."
          : `Recognition error: ${event?.error ?? "unknown"}`;
      stopRecognitionTimer();
    };
    recognition.onend = () => {
      recognitionActive = false;
      stopRecognitionTimer();
      if (restartRecognition) {
        try {
          recognition?.start();
        } catch (error) {
          console.error(error);
          recognitionError = "Unable to restart speech recognition.";
          restartRecognition = false;
        }
      }
    };
  }

  function teardownRecognition() {
    restartRecognition = false;
    recognitionActive = false;
    try {
      recognition?.stop();
    } catch (error) {
      console.debug("stop recognition", error);
    }
    stopRecognitionTimer();
    recognition = null;
  }

  function configureRecognitionOptions() {
    if (!recognition) return;
    recognition.lang = recognitionLanguage;
    recognition.continuous = continuousMode;
    recognition.interimResults = showInterim;
    if ("maxAlternatives" in recognition) {
      (recognition as any).maxAlternatives = maxAlternatives;
    }
  }

  function startRecognition() {
    if (!recognitionSupported || !recognition) return;
    restartRecognition = true;
    recognitionError = "";
    try {
      recognition.stop();
    } catch {
      /* ignore */
    }
    try {
      recognition.start();
    } catch (error) {
      console.error(error);
      recognitionError = "Unable to start speech recognition.";
      restartRecognition = false;
    }
  }

  function stopRecognition(save = true) {
    if (!recognition) return;
    restartRecognition = false;
    recognitionActive = false;
    try {
      recognition.stop();
    } catch (error) {
      console.debug("stop", error);
    }
    stopRecognitionTimer();
    if (save) {
      captureRecognitionSnapshot();
    }
  }

  function startRecognitionTimer() {
    stopRecognitionTimer();
    recognitionTimer = setInterval(() => {
      recognitionSessionSeconds += 1;
    }, 1000);
  }

  function stopRecognitionTimer() {
    if (recognitionTimer) {
      clearInterval(recognitionTimer);
      recognitionTimer = null;
    }
  }

  function captureRecognitionSnapshot() {
    const text = recognitionTranscript.trim();
    if (!text) return;
    const entry: RecognitionEntry = {
      id: Date.now(),
      text,
      timestamp: Date.now(),
      language: recognitionLanguage,
      durationSeconds: recognitionSessionSeconds,
    };
    recognitionLog = [entry, ...recognitionLog].slice(0, 12);
    if (autoClearTranscript) {
      clearRecognitionTranscript();
    }
  }

  function removeRecognitionEntry(id: number) {
    recognitionLog = recognitionLog.filter((entry) => entry.id !== id);
  }

  function loadRecognitionEntry(
    entry: RecognitionEntry,
    mode: "replace" | "append",
  ) {
    if (mode === "replace") {
      recognitionTranscript = entry.text;
    } else {
      recognitionTranscript = `${recognitionTranscript} ${entry.text}`.trim();
    }
  }

  function applyEntryToScript(
    entry: RecognitionEntry,
    mode: "replace" | "append",
  ) {
    if (mode === "replace") {
      script = entry.text;
    } else {
      script = `${script.trim()} ${entry.text}`.trim();
    }
  }

  function clearRecognitionTranscript() {
    recognitionTranscript = "";
    recognitionInterim = "";
  }

  function appendInterimToTranscript() {
    if (!recognitionInterim.trim()) return;
    recognitionTranscript =
      `${recognitionTranscript} ${recognitionInterim}`.trim();
    recognitionInterim = "";
  }

  function downloadRecognitionLog() {
    if (!recognitionLog.length) return;
    const payload = recognitionLog
      .map((entry, index) => {
        return `#${recognitionLog.length - index}\nSaved: ${new Date(entry.timestamp).toLocaleString()}\nLanguage: ${entry.language}\nDuration: ${formatDuration(entry.durationSeconds)}\n\n${entry.text}\n`;
      })
      .join("\n------------------------------\n\n");
    const blob = new Blob([payload], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `recognition-log-${new Date().toISOString()}.txt`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function clearRecognitionLog() {
    recognitionLog = [];
  }

  function sendTranscriptToScript(mode: "replace" | "append") {
    if (!recognitionTranscript.trim()) return;
    if (mode === "replace") {
      script = recognitionTranscript.trim();
    } else {
      script = `${script.trim()} ${recognitionTranscript.trim()}`.trim();
    }
  }

  function sendScriptToTranscript(mode: "replace" | "append") {
    if (!script.trim()) return;
    if (mode === "replace") {
      recognitionTranscript = script.trim();
    } else {
      recognitionTranscript =
        `${recognitionTranscript.trim()} ${script.trim()}`.trim();
    }
  }

  function formatDuration(seconds: number) {
    if (!seconds) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const parts: string[] = [];
    if (hours) parts.push(`${hours}h`);
    if (minutes) parts.push(`${minutes}m`);
    if (secs || !parts.length) parts.push(`${secs}s`);
    return parts.join(" ");
  }

  $: filteredVoices = filterVoices(voiceFilter);
  $: configureRecognitionOptions();
  $: visibleRecognitionLanguages = !languageQuery.trim()
    ? recognitionLanguages
    : recognitionLanguages.filter((item) =>
        item.label.toLowerCase().includes(languageQuery.toLowerCase()),
      );
  $: scriptWordCount = script.trim() ? script.trim().split(/\s+/).length : 0;
  $: scriptCharCount = script.length;
  $: scriptSentences = script.trim()
    ? (script.match(/[^.!?]+[.!?]*/g) ?? [])
        .map((sentence) => sentence.trim())
        .filter(Boolean)
    : [];
  $: estimatedDurationSeconds = scriptWordCount
    ? Math.max(1, Math.round((scriptWordCount / (rate * 180)) * 60))
    : 0;
  $: estimatedDuration = estimatedDurationSeconds
    ? formatDuration(estimatedDurationSeconds)
    : "-";
  $: recognitionWordCount = recognitionTranscript.trim()
    ? recognitionTranscript.trim().split(/\s+/).length
    : 0;
  $: recognitionChars = recognitionTranscript.length;
  $: recognitionDurationFormatted = formatDuration(recognitionSessionSeconds);
</script>

<section class="space-y-6">
  <div
    class="flex flex-wrap items-start justify-between gap-4 rounded-3xl border px-6 py-6 shadow-sm border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-950"
  >
    <div
      class="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide"
    >
      <span
        class="rounded-full px-3 py-1 bg-white text-slate-700 shadow-sm dark:bg-slate-900/70 dark:text-slate-200"
        >Voices: {voices.length || "-"}</span
      >
      <span
        class="rounded-full px-3 py-1 bg-white text-slate-700 shadow-sm dark:bg-slate-900/70 dark:text-slate-200"
        >Script words: {scriptWordCount}</span
      >
      <span
        class="rounded-full px-3 py-1 bg-white text-slate-700 shadow-sm dark:bg-slate-900/70 dark:text-slate-200"
        >Transcript words: {recognitionWordCount}</span
      >
      <span
        class="rounded-full px-3 py-1 bg-white text-slate-700 shadow-sm dark:bg-slate-900/70 dark:text-slate-200"
        >Recognition time: {recognitionDurationFormatted}</span
      >
    </div>
    <div class="flex flex-wrap items-end gap-3 text-sm">
      <span
        class={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
          speaking
            ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200"
            : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
        }`}
      >
        <span
          class={`inline-flex h-2 w-2 rounded-full ${
            speaking ? "bg-violet-400 animate-ping" : "bg-slate-500"
          }`}
        ></span>
        {speaking ? "Playing" : "Voice ready"}
      </span>
      <span
        class={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
          recognitionActive
            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200"
            : recognitionSupported
              ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
              : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200"
        }`}
      >
        <span
          class={`inline-flex h-2 w-2 rounded-full ${
            recognitionActive ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
          }`}
        ></span>
        {recognitionActive
          ? "Listening"
          : recognitionSupported
            ? "Mic ready"
            : "Mic unavailable"}
      </span>
    </div>
  </div>

  <div class="grid gap-6 xl:grid-cols-2">
    <div class="space-y-6">
      <div
        class="space-y-4 rounded-3xl border px-6 py-6 shadow-sm border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold">Script workspace</h2>
            <p class="text-xs opacity-70">
              Draft the lines you want the assistant to perform.
            </p>
          </div>
          <Copy text={script} label="Copy" floating={false} />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Script title</span
            >
            <input
              class="w-full rounded-2xl border px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-violet-400 border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-50"
              bind:value={scriptTitle}
              placeholder="Script name"
            />
          </label>
          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Snippet library</span
            >
            <div class="flex gap-2">
              <button
                type="button"
                class="flex-1 rounded-2xl px-3 py-2 text-xs font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                on:click={() => cycleSnippet(-1)}
              >
                Previous
              </button>
              <button
                type="button"
                class="flex-1 rounded-2xl px-3 py-2 text-xs font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                on:click={() => cycleSnippet(1)}
              >
                Next
              </button>
            </div>
          </label>
        </div>

        <p
          class="rounded-2xl border px-4 py-3 text-sm leading-relaxed opacity-80 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
        >
          {scriptSnippets[sampleIndex]}
        </p>
        <button
          type="button"
          class="inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30"
          on:click={() => useSnippet(sampleIndex)}
        >
          Use this snippet
        </button>

        <textarea
          rows="10"
          bind:value={script}
          class="h-full w-full rounded-2xl border px-4 py-4 text-sm leading-relaxed transition focus:outline-none focus:ring-2 focus:ring-violet-400 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          placeholder="Write the lines you want to hear."
        ></textarea>

        <div
          class="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-wide opacity-80"
        >
          <span>Words: {scriptWordCount}</span>
          <span>Characters: {scriptCharCount}</span>
          <span>Est. duration: {estimatedDuration}</span>
        </div>

        <div class="flex flex-wrap gap-3 text-sm">
          <button
            type="button"
            class="inline-flex items-center justify-center rounded-2xl px-4 py-3 font-semibold transition bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-200 dark:hover:bg-violet-500/30"
            on:click={speakScript}
            disabled={!script.trim()}
          >
            Play script
          </button>
          <button
            type="button"
            class="rounded-2xl px-4 py-3 font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            on:click={pauseSpeech}
            disabled={!speaking || paused}
          >
            Pause
          </button>
          <button
            type="button"
            class="rounded-2xl px-4 py-3 font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            on:click={resumeSpeech}
            disabled={!paused}
          >
            Resume
          </button>
          <button
            type="button"
            class="rounded-2xl px-4 py-3 font-semibold transition bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:hover:bg-rose-500/30"
            on:click={stopSpeech}
            disabled={!speaking}
          >
            Stop
          </button>
          <button
            type="button"
            class="rounded-2xl px-4 py-3 font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            on:click={downloadScript}
            disabled={!script.trim()}
          >
            Download script
          </button>
        </div>
      </div>

      <div
        class="space-y-4 rounded-3xl border px-6 py-6 shadow-sm border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold">Voice and pacing</h2>
            <p class="text-xs opacity-70">
              Filter voices, adjust tempo, and fine tune tone before exporting.
            </p>
          </div>
          <button
            type="button"
            class="rounded-full px-3 py-1 text-xs font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            on:click={resetVoiceControls}
          >
            Reset sliders
          </button>
        </div>

        <label class="flex flex-col gap-2">
          <span class="text-xs font-semibold uppercase tracking-wide opacity-70"
            >Search voices</span
          >
          <input
            class="w-full rounded-2xl border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-violet-400 border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            bind:value={voiceFilter}
            placeholder="Filter by language or name"
          />
        </label>

        <div
          class="grid max-h-64 gap-2 overflow-y-auto rounded-2xl border p-3 text-sm border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
        >
          {#if filteredVoices.length === 0}
            <p class="text-sm opacity-70">No voices match your search.</p>
          {:else}
            {#each filteredVoices as option}
              <button
                type="button"
                class={`w-full rounded-xl px-3 py-2 text-left font-medium transition ${selectedVoiceId === option.id ? "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-100" : "hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                on:click={() => (selectedVoiceId = option.id)}
              >
                {option.label}
              </button>
            {/each}
          {/if}
        </div>

        <div class="grid gap-4 sm:grid-cols-3">
          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Rate</span
            >
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.01"
              bind:value={rate}
              class="w-full accent-violet-400"
            />
            <span class="text-xs opacity-70">{rate.toFixed(2)}x</span>
          </label>
          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Pitch</span
            >
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.01"
              bind:value={pitch}
              class="w-full accent-violet-400"
            />
            <span class="text-xs opacity-70">{pitch.toFixed(2)}</span>
          </label>
          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Volume</span
            >
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.01"
              bind:value={volume}
              class="w-full accent-violet-400"
            />
            <span class="text-xs opacity-70">{volume.toFixed(2)}</span>
          </label>
        </div>

        <div class="flex flex-wrap gap-2 text-xs">
          {#each pacingPresets as preset, index}
            <button
              type="button"
              class="rounded-full px-3 py-1 font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              on:click={() => applyPreset(index)}
            >
              {preset.label}
            </button>
          {/each}
        </div>
      </div>

      <div
        class="space-y-4 rounded-3xl border px-6 py-6 shadow-sm border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 class="text-xl font-semibold">Audition sentences</h2>
        <p class="text-xs opacity-70">
          Play a sentence at a time to perfect emphasis before exporting.
        </p>
        {#if scriptSentences.length === 0}
          <p
            class="rounded-2xl border px-4 py-4 text-sm opacity-70 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
          >
            Add copy to generate previews.
          </p>
        {:else}
          <ul class="space-y-3">
            {#each scriptSentences as sentence, index}
              <li
                class="rounded-2xl border px-4 py-4 text-sm leading-relaxed border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
              >
                <div class="flex items-start justify-between gap-3">
                  <span class="font-semibold opacity-70"
                    >Sentence {index + 1}</span
                  >
                  <button
                    type="button"
                    class="rounded-full px-3 py-1 text-xs font-semibold transition bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-200 dark:hover:bg-violet-500/30"
                    on:click={() => previewSentence(sentence)}
                  >
                    Preview
                  </button>
                </div>
                <p class="mt-2 opacity-90">{sentence}</p>
              </li>
            {/each}
          </ul>
        {/if}
      </div>
    </div>
    <div class="space-y-6">
      <div
        class="space-y-4 rounded-3xl border px-6 py-6 shadow-sm border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold">Speech recognition control</h2>
            <p class="text-xs opacity-70">
              Pick a language, tune restart behaviour, and capture transcripts
              as you talk.
            </p>
          </div>
          <button
            type="button"
            class={`rounded-full px-3 py-1 text-xs font-semibold transition ${restartRecognition ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}
            on:click={() => (restartRecognition = !restartRecognition)}
          >
            Auto restart: {restartRecognition ? "On" : "Off"}
          </button>
        </div>

        {#if !recognitionSupported}
          <p
            class="rounded-2xl border px-4 py-4 text-sm opacity-80 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
          >
            Your browser does not expose the Web Speech API. Use Chrome, Edge,
            or Safari on desktop with microphone access enabled.
          </p>
        {:else}
          <div class="grid gap-4 sm:grid-cols-2">
            <label class="flex flex-col gap-2">
              <span
                class="text-xs font-semibold uppercase tracking-wide opacity-70"
                >Filter languages</span
              >
              <input
                class="w-full rounded-2xl border px-3 py-2 text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-400 border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                bind:value={languageQuery}
                placeholder="Search languages"
              />
            </label>
            <label class="flex flex-col gap-2">
              <span
                class="text-xs font-semibold uppercase tracking-wide opacity-70"
                >Recognition language</span
              >
              <select
                class="w-full rounded-2xl border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-emerald-400 border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                bind:value={recognitionLanguage}
              >
                {#each visibleRecognitionLanguages as language}
                  <option value={language.value}>{language.label}</option>
                {/each}
              </select>
            </label>
          </div>

          <div class="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              class={`rounded-full px-3 py-1 font-semibold transition ${continuousMode ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}
              on:click={() => (continuousMode = !continuousMode)}
            >
              Continuous: {continuousMode ? "On" : "Off"}
            </button>
            <button
              type="button"
              class={`rounded-full px-3 py-1 font-semibold transition ${showInterim ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}
              on:click={() => (showInterim = !showInterim)}
            >
              Interim captions: {showInterim ? "On" : "Off"}
            </button>
            <button
              type="button"
              class={`rounded-full px-3 py-1 font-semibold transition ${autoClearTranscript ? "bg-emerald-500/20 text-emerald-200" : "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300"}`}
              on:click={() => (autoClearTranscript = !autoClearTranscript)}
            >
              Clear after snapshot: {autoClearTranscript ? "On" : "Off"}
            </button>
          </div>

          <label class="flex flex-col gap-2">
            <span
              class="text-xs font-semibold uppercase tracking-wide opacity-70"
              >Alternatives</span
            >
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              bind:value={maxAlternatives}
              class="w-full accent-emerald-400"
            />
            <span class="text-xs opacity-70"
              >Keep up to {maxAlternatives} hypothesis per phrase.</span
            >
          </label>

          <div class="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              class="inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30"
              on:click={startRecognition}
              disabled={recognitionActive}
            >
              {recognitionActive ? "Listening..." : "Start listening"}
            </button>
            <div class="grid grid-cols-2 gap-3">
              <button
                type="button"
                class="rounded-2xl px-3 py-3 text-xs font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                on:click={() => stopRecognition(true)}
              >
                Stop & save
              </button>
              <button
                type="button"
                class="rounded-2xl px-3 py-3 text-xs font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                on:click={() => stopRecognition(false)}
              >
                Stop (discard)
              </button>
            </div>
          </div>

          <div class="flex flex-wrap gap-2 text-xs">
            <button
              type="button"
              class="rounded-full px-3 py-1 font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              on:click={captureRecognitionSnapshot}
            >
              Save snapshot
            </button>
            <button
              type="button"
              class="rounded-full px-3 py-1 font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              on:click={appendInterimToTranscript}
              disabled={!recognitionInterim.trim()}
            >
              Append interim
            </button>
            <button
              type="button"
              class="rounded-full px-3 py-1 font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              on:click={clearRecognitionTranscript}
            >
              Clear transcript
            </button>
          </div>

          {#if recognitionError}
            <div
              class="rounded-2xl px-3 py-2 text-sm font-medium bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-200"
            >
              {recognitionError}
            </div>
          {/if}

          <div
            class="flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-wide opacity-80"
          >
            <span>Words: {recognitionWordCount}</span>
            <span>Characters: {recognitionChars}</span>
            <span>Session: {recognitionDurationFormatted}</span>
          </div>
        {/if}
      </div>

      <div
        class="space-y-4 rounded-3xl border px-6 py-6 shadow-sm border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 class="text-xl font-semibold">Transcript editor</h2>
            <p class="text-xs opacity-70">
              Review what was said, tidy wording, then feed it back into the
              script or export the log.
            </p>
          </div>
          <div class="flex gap-2">
            <Copy text={recognitionTranscript} label="Copy" floating={false} />
            <button
              type="button"
              class="rounded-full px-3 py-1 text-xs font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              on:click={downloadRecognitionLog}
              disabled={!recognitionLog.length}
            >
              Download log
            </button>
          </div>
        </div>

        <textarea
          rows="10"
          bind:value={recognitionTranscript}
          class="h-full w-full rounded-2xl border px-4 py-4 text-sm leading-relaxed transition focus:outline-none focus:ring-2 focus:ring-emerald-400 border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          placeholder="Live transcript will appear here."
        ></textarea>

        <div
          class="rounded-2xl px-4 py-3 text-sm bg-slate-100 text-slate-700 dark:bg-slate-950 dark:text-slate-200"
        >
          <span class="font-semibold">Interim:</span>
          <span class="ml-2 opacity-80"
            >{recognitionInterim || "Waiting for speech..."}</span
          >
        </div>

        <div class="flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold transition bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30"
            on:click={() => sendTranscriptToScript("replace")}
            disabled={!recognitionTranscript.trim()}
          >
            Replace script with transcript
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold transition bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30"
            on:click={() => sendTranscriptToScript("append")}
            disabled={!recognitionTranscript.trim()}
          >
            Append transcript to script
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold transition bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-200 dark:hover:bg-violet-500/30"
            on:click={() => sendScriptToTranscript("replace")}
            disabled={!script.trim()}
          >
            Replace transcript with script
          </button>
          <button
            type="button"
            class="rounded-full px-3 py-1 font-semibold transition bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-200 dark:hover:bg-violet-500/30"
            on:click={() => sendScriptToTranscript("append")}
            disabled={!script.trim()}
          >
            Append script to transcript
          </button>
        </div>
      </div>

      <div
        class="space-y-4 rounded-3xl border px-6 py-6 shadow-sm border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-xl font-semibold">Recognition history</h2>
          <div class="flex gap-2 text-xs">
            <button
              type="button"
              class="rounded-full px-3 py-1 font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              on:click={downloadRecognitionLog}
              disabled={!recognitionLog.length}
            >
              Download log
            </button>
            <button
              type="button"
              class="rounded-full px-3 py-1 font-semibold transition bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:hover:bg-rose-500/30"
              on:click={clearRecognitionLog}
              disabled={!recognitionLog.length}
            >
              Clear log
            </button>
          </div>
        </div>

        {#if recognitionLog.length === 0}
          <p
            class="rounded-2xl border px-4 py-4 text-sm opacity-70 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
          >
            Saved transcripts will appear here once you capture a snapshot.
          </p>
        {:else}
          <ul class="space-y-4">
            {#each recognitionLog as entry (entry.id)}
              <li
                class="space-y-3 rounded-2xl border px-4 py-4 border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-950"
              >
                <div
                  class="flex flex-wrap items-center justify-between gap-2 text-xs font-semibold uppercase tracking-wide opacity-70"
                >
                  <span>{new Date(entry.timestamp).toLocaleString()}</span>
                  <span>{entry.language}</span>
                  <span>{formatDuration(entry.durationSeconds)}</span>
                </div>
                <p class="text-sm leading-relaxed">{entry.text}</p>
                <div class="flex flex-wrap gap-2 text-xs">
                  <Copy text={entry.text} label="Copy" floating={false} />
                  <button
                    type="button"
                    class="rounded-full px-3 py-1 font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    on:click={() => loadRecognitionEntry(entry, "replace")}
                  >
                    Load transcript
                  </button>
                  <button
                    type="button"
                    class="rounded-full px-3 py-1 font-semibold transition bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                    on:click={() => loadRecognitionEntry(entry, "append")}
                  >
                    Append to transcript
                  </button>
                  <button
                    type="button"
                    class="rounded-full px-3 py-1 font-semibold transition bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30"
                    on:click={() => applyEntryToScript(entry, "replace")}
                  >
                    Replace script
                  </button>
                  <button
                    type="button"
                    class="rounded-full px-3 py-1 font-semibold transition bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-200 dark:hover:bg-emerald-500/30"
                    on:click={() => applyEntryToScript(entry, "append")}
                  >
                    Append to script
                  </button>
                  <button
                    type="button"
                    class="rounded-full px-3 py-1 font-semibold transition bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-500/20 dark:text-rose-200 dark:hover:bg-rose-500/30"
                    on:click={() => removeRecognitionEntry(entry.id)}
                  >
                    Delete
                  </button>
                </div>
              </li>
            {/each}
          </ul>
        {/if}
      </div>

      <div
        class="space-y-4 rounded-3xl border px-6 py-6 shadow-sm border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      >
        <h2 class="text-xl font-semibold">Workflow tips</h2>
        <ul class="space-y-3 text-sm leading-relaxed opacity-80">
          <li>
            - Run a line, listen back, and note reactions directly into the
            transcript for instant iteration.
          </li>
          <li>
            - Use transcript snapshots to compare tone options before shipping a
            final script.
          </li>
          <li>
            - When you find a voice you love, capture its name and language in
            your download for later reuse.
          </li>
          <li>
            - Pair this lab with screen recording or a DAW when you are ready to
            export studio quality audio.
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>
