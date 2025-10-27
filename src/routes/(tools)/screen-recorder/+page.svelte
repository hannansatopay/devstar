<script lang="ts">
  import { onDestroy } from "svelte";
  import Copy from "$lib/Copy.svelte";

  const isBrowser = typeof window !== "undefined";

  let includeSystemAudio = true;
  let includeMicrophone = false;
  let frameRate = 30;

  let displayStream: MediaStream | null = null;
  let micStream: MediaStream | null = null;
  let mixedStream: MediaStream | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let recording = false;
  let recordedUrl = "";
  let recordedSize = "";
  let status = "";

  let previewVideo: HTMLVideoElement;

  function log(message: string) {
    status = message;
    setTimeout(() => (status = ""), 2200);
  }

  async function startRecording() {
    if (!isBrowser || !navigator.mediaDevices?.getDisplayMedia) {
      log("Screen capture is not supported in this browser.");
      return;
    }
    await stopAll();
    recordedUrl && URL.revokeObjectURL(recordedUrl);
    recordedUrl = "";
    recordedSize = "";
    try {
      displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: includeSystemAudio,
      });
      const tracks: MediaStreamTrack[] = [...displayStream.getVideoTracks()];
      if (includeSystemAudio) {
        tracks.push(...displayStream.getAudioTracks());
      }
      if (includeMicrophone) {
        micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
        tracks.push(...micStream.getAudioTracks());
      }
      mixedStream = new MediaStream(tracks);

      if (previewVideo) {
        previewVideo.srcObject = mixedStream;
        await previewVideo.play();
      }

      mediaRecorder = new MediaRecorder(mixedStream, {
        mimeType: "video/webm;codecs=vp9,opus",
      });
      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        recordedUrl = URL.createObjectURL(blob);
        recordedSize = humanSize(blob.size);
        log("Recording saved.");
      };
      mediaRecorder.start();
      recording = true;
      log("Recording in progress…");
      displayStream
        .getVideoTracks()[0]
        .addEventListener("ended", () => stopRecording());
    } catch (error) {
      console.error(error);
      log("Screen capture permission denied.");
      await stopAll();
    }
  }

  function stopRecording() {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      recording = false;
    }
  }

  async function stopAll() {
    if (!isBrowser) return;
    if (recording) {
      stopRecording();
    }
    const streams = [mixedStream, displayStream, micStream];
    streams.forEach((stream) => {
      if (stream && typeof stream.getTracks === "function") {
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      }
    });
    mediaRecorder = null;
    mixedStream = null;
    displayStream = null;
    micStream = null;
  }

  function humanSize(bytes: number) {
    if (!bytes) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const idx = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, idx)).toFixed(2)} ${units[idx]}`;
  }

  onDestroy(stopAll);
</script>

<section class="space-y-6">
  <div class="grid gap-6 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
    <div
      class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
    >
      <label
        class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
      >
        <span>Include system audio</span>
        <input
          class="h-4 w-4 accent-indigo-600"
          type="checkbox"
          bind:checked={includeSystemAudio}
        />
      </label>
      <label
        class="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300"
      >
        <span>Include microphone</span>
        <input
          class="h-4 w-4 accent-indigo-600"
          type="checkbox"
          bind:checked={includeMicrophone}
        />
      </label>

      <label class="space-y-2 font-semibold">
        <span>Frame rate</span>
        <input
          class="w-full accent-indigo-600"
          type="range"
          min="15"
          max="60"
          step="5"
          bind:value={frameRate}
        />
        <p class="text-xs text-slate-500 dark:text-slate-400">
          {frameRate} fps target
        </p>
      </label>

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
          on:click={stopAll}
        >
          Reset
        </button>
      </div>

      {#if status}
        <p class="text-xs text-emerald-600 dark:text-emerald-300">{status}</p>
      {/if}
    </div>

    <div class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <p
          class="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          Live preview
        </p>
        <!-- svelte-ignore a11y-media-has-caption -->
        <video
          bind:this={previewVideo}
          class="mt-3 aspect-video w-full rounded-xl bg-slate-900 object-contain"
          playsinline
          muted
        ></video>
      </div>

      {#if recordedUrl}
        <div
          class="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
        >
          <p class="text-xs font-semibold uppercase tracking-wide">
            Captured session
          </p>
          <!-- svelte-ignore a11y-media-has-caption -->
          <video
            class="aspect-video w-full rounded-lg bg-black"
            src={recordedUrl}
            controls
          ></video>
          <div class="flex flex-wrap items-center gap-3">
            <a
              class="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700"
              download="screen-recording.webm"
              href={recordedUrl}
            >
              Download • {recordedSize}
            </a>
            <Copy text={recordedUrl} label="Copy link" floating={false} />
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
