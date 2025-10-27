<script lang="ts">
  import { onDestroy } from "svelte";

  const isBrowser = typeof window !== "undefined";

  let mediaRecorder: MediaRecorder | null = null;
  let recording = false;
  let audioUrl = "";
  let audioSize = "";
  let status = "";

  let audioBuffer: AudioBuffer | null = null;
  let waveform: number[] = [];
  let duration = 0;
  let trimStart = 0;
  let trimEnd = 0;
  let playbackRate = 1;
  let fade = true;

  let audioEl: HTMLAudioElement;
  let canvasEl: HTMLCanvasElement;

  function log(message: string) {
    status = message;
    setTimeout(() => (status = ""), 2200);
  }

  async function startRecording() {
    if (!isBrowser || !navigator.mediaDevices?.getUserMedia) {
      log("Recording is not supported in this browser.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const chunks: Blob[] = [];
      mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        audioUrl && URL.revokeObjectURL(audioUrl);
        audioUrl = URL.createObjectURL(blob);
        audioSize = humanSize(blob.size);
        await decodeAudio(blob);
        log("Recording ready.");
      };
      mediaRecorder.start();
      recording = true;
      log("Recording…");
    } catch (error) {
      console.error(error);
      log("Microphone permission denied.");
    }
  }

  function stopRecording() {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      recording = false;
    }
  }

  async function decodeAudio(blob: Blob) {
    if (!isBrowser) return;
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new AudioContext();
    audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    duration = audioBuffer.duration;
    trimStart = 0;
    trimEnd = duration;
    waveform = simplifyWaveform(audioBuffer.getChannelData(0), 300);
    drawWaveform();
    audioCtx.close();
  }

  function simplifyWaveform(data: Float32Array, points: number) {
    const block = Math.floor(data.length / points);
    const result: number[] = [];
    for (let i = 0; i < points; i++) {
      let sum = 0;
      for (let j = 0; j < block; j++) {
        sum += Math.abs(data[i * block + j]);
      }
      result.push(sum / block);
    }
    return result;
  }

  function drawWaveform() {
    if (!canvasEl || waveform.length === 0) return;
    const canvas = canvasEl;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { width, height } = canvas;
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "#6366f1";
    const mid = height / 2;
    const step = width / waveform.length;
    waveform.forEach((value, index) => {
      const x = index * step;
      const amplitude = value * height;
      ctx.fillRect(x, mid - amplitude / 2, step * 0.9, Math.max(1, amplitude));
    });
    if (duration > 0) {
      const startX = Math.min(
        width,
        Math.max(0, (trimStart / duration) * width),
      );
      const endX = Math.min(width, Math.max(0, (trimEnd / duration) * width));
      ctx.fillStyle = "rgba(148, 163, 184, 0.25)";
      ctx.fillRect(0, 0, startX, height);
      ctx.fillRect(endX, 0, width - endX, height);
      ctx.strokeStyle = "rgba(79, 70, 229, 0.9)";
      ctx.lineWidth = 2;
      ctx.strokeRect(startX, 0, Math.max(1, endX - startX), height);
    }
  }

  function humanSize(bytes: number) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB"];
    const idx = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, idx)).toFixed(2)} ${units[idx]}`;
  }

  function updatePlaybackRate() {
    if (audioEl) {
      audioEl.playbackRate = playbackRate;
    }
  }

  function calculateIndices() {
    if (!audioBuffer) return { startIndex: 0, endIndex: 0 };
    const startIndex = Math.floor(trimStart * audioBuffer.sampleRate);
    const endIndex = Math.floor(trimEnd * audioBuffer.sampleRate);
    return { startIndex, endIndex };
  }

  async function exportTrimmed() {
    if (!audioBuffer) {
      log("Record something first.");
      return;
    }
    const { startIndex, endIndex } = calculateIndices();
    const length = endIndex - startIndex;
    if (length <= 0) {
      log("Adjust trim handles to select audio.");
      return;
    }
    const numberOfChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const trimmedBuffer = new AudioContext().createBuffer(
      numberOfChannels,
      length,
      sampleRate,
    );

    for (let channel = 0; channel < numberOfChannels; channel++) {
      trimmedBuffer.copyToChannel(
        audioBuffer.getChannelData(channel).subarray(startIndex, endIndex),
        channel,
      );
    }

    if (fade) {
      applyFades(trimmedBuffer, sampleRate);
    }

    const wavBlob = bufferToWave(trimmedBuffer);
    audioUrl && URL.revokeObjectURL(audioUrl);
    audioUrl = URL.createObjectURL(wavBlob);
    audioSize = humanSize(wavBlob.size);
    await decodeAudio(wavBlob);
    log("Trimmed clip exported as WAV.");
  }

  function applyFades(buffer: AudioBuffer, sampleRate: number) {
    const fadeSamples = Math.min(sampleRate * 0.2, buffer.length / 8);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < fadeSamples; i++) {
        data[i] *= i / fadeSamples;
        const j = data.length - i - 1;
        data[j] *= i / fadeSamples;
      }
    }
  }

  function bufferToWave(buffer: AudioBuffer) {
    const length = buffer.length * buffer.numberOfChannels * 2 + 44;
    const arrayBuffer = new ArrayBuffer(length);
    const view = new DataView(arrayBuffer);
    const channels: Float32Array[] = [];
    let sampleIndex = 0;
    let offset = 0;

    writeString(view, 0, "RIFF");
    view.setUint32(4, 36 + buffer.length * buffer.numberOfChannels * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, buffer.numberOfChannels, true);
    view.setUint32(24, buffer.sampleRate, true);
    view.setUint32(28, buffer.sampleRate * buffer.numberOfChannels * 2, true);
    view.setUint16(32, buffer.numberOfChannels * 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, buffer.length * buffer.numberOfChannels * 2, true);

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      channels.push(buffer.getChannelData(channel));
    }

    offset = 44;
    while (sampleIndex < buffer.length) {
      for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
        let sample = channels[channel][sampleIndex];
        sample = Math.max(-1, Math.min(1, sample));
        view.setInt16(
          offset,
          sample < 0 ? sample * 0x8000 : sample * 0x7fff,
          true,
        );
        offset += 2;
      }
      sampleIndex++;
    }

    return new Blob([arrayBuffer], { type: "audio/wav" });
  }

  function writeString(view: DataView, offset: number, value: string) {
    for (let i = 0; i < value.length; i++) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  }

  $: if (canvasEl && waveform.length) {
    drawWaveform();
  }

  $: if (audioBuffer) {
    if (trimEnd > duration) {
      trimEnd = duration;
    }
    if (trimStart < 0) {
      trimStart = 0;
    }
    if (trimStart > trimEnd - 0.05) {
      trimStart = Math.max(0, trimEnd - 0.05);
    }
  }

  onDestroy(() => {
    stopRecording();
    audioUrl && URL.revokeObjectURL(audioUrl);
  });
</script>

<section class="space-y-6">
  <div class="grid gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
    <div
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
    >
      <div class="flex flex-wrap gap-3">
        <button
          class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:focus:ring-indigo-700"
          type="button"
          on:click={startRecording}
          disabled={recording}
        >
          {recording ? "Recording…" : "Start recording"}
        </button>
        <button
          class="inline-flex items-center rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:text-rose-300 dark:border-rose-700 dark:text-rose-200 dark:hover:bg-rose-900/30 dark:focus:ring-rose-700"
          type="button"
          on:click={stopRecording}
          disabled={!recording}
        >
          Stop
        </button>
        <button
          class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
          type="button"
          on:click={exportTrimmed}
          disabled={!audioBuffer}
        >
          Export trimmed WAV
        </button>
      </div>

      {#if status}
        <p class="text-xs text-emerald-600 dark:text-emerald-300">{status}</p>
      {/if}

      <div
        class="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/60"
      >
        <canvas bind:this={canvasEl} width="640" height="120" class="w-full"
        ></canvas>
      </div>

      {#if audioBuffer}
        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-1 font-semibold">
            <span>Trim start ({trimStart.toFixed(2)}s)</span>
            <input
              class="w-full accent-indigo-600"
              type="range"
              min="0"
              max={Math.max(0.1, duration)}
              step="0.01"
              bind:value={trimStart}
            />
          </label>
          <label class="space-y-1 font-semibold">
            <span>Trim end ({trimEnd.toFixed(2)}s)</span>
            <input
              class="w-full accent-indigo-600"
              type="range"
              min="0"
              max={Math.max(0.1, duration)}
              step="0.01"
              bind:value={trimEnd}
            />
          </label>
          <label class="space-y-1 font-semibold">
            <span>Playback speed</span>
            <input
              class="w-full accent-indigo-600"
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              bind:value={playbackRate}
              on:input={updatePlaybackRate}
            />
          </label>
          <label
            class="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300"
          >
            <input
              class="h-4 w-4 accent-indigo-600"
              type="checkbox"
              bind:checked={fade}
            />
            Apply fade in/out
          </label>
        </div>
      {/if}
    </div>

    <div class="space-y-6">
      {#if audioUrl}
        <div
          class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
        >
          <p
            class="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Playback
          </p>
          <audio
            bind:this={audioEl}
            class="w-full"
            src={audioUrl}
            controls
            on:loadedmetadata={updatePlaybackRate}
          ></audio>
          <a
            class="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700"
            download="voice-note.wav"
            href={audioUrl}
          >
            Download • {audioSize}
          </a>
        </div>
      {:else}
        <div
          class="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-300"
        >
          <p>No clips yet. Record something to get started.</p>
        </div>
      {/if}
    </div>
  </div>
</section>
