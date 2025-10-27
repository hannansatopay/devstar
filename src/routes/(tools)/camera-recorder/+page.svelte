<script lang="ts">
  import { onDestroy, onMount } from "svelte";
  import Copy from "$lib/Copy.svelte";

  const isBrowser = typeof window !== "undefined";

  let videoDevices: MediaDeviceInfo[] = [];
  let audioDevices: MediaDeviceInfo[] = [];
  let selectedVideoDevice = "";
  let selectedAudioDevice = "";
  let resolution = "1280x720";
  let includeAudio = true;

  let stream: MediaStream | null = null;
  let mediaRecorder: MediaRecorder | null = null;
  let recording = false;
  let recordedUrl = "";
  let recordedSize = "";

  let snapshots: Array<{ url: string; label: string }> = [];

  let videoPreview: HTMLVideoElement;
  let status = "";

  function log(message: string) {
    status = message;
    setTimeout(() => (status = ""), 2500);
  }

  async function enumerate() {
    if (!isBrowser || !navigator.mediaDevices) return;
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      videoDevices = devices.filter((d) => d.kind === "videoinput");
      audioDevices = devices.filter((d) => d.kind === "audioinput");
      if (!selectedVideoDevice && videoDevices.length) {
        selectedVideoDevice = videoDevices[0].deviceId;
      }
      if (!selectedAudioDevice && audioDevices.length) {
        selectedAudioDevice = audioDevices[0].deviceId;
      }
    } catch (error) {
      console.error(error);
    }
  }

  async function startPreview() {
    if (!isBrowser || !navigator.mediaDevices?.getUserMedia) {
      log("Camera access is not supported in this browser.");
      return;
    }
    try {
      stopAll();
      const [width, height] = resolution.split("x").map(Number);
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedVideoDevice
            ? { exact: selectedVideoDevice }
            : undefined,
          width: { ideal: width },
          height: { ideal: height },
        },
        audio: includeAudio
          ? selectedAudioDevice
            ? { deviceId: { exact: selectedAudioDevice } }
            : true
          : false,
      });
      if (videoPreview) {
        videoPreview.srcObject = stream;
        await videoPreview.play();
      }
      log("Preview ready.");
    } catch (error) {
      console.error(error);
      log("Unable to start camera. Check permissions.");
    }
  }

  function startRecording() {
    if (!stream) {
      log("Start the preview first.");
      return;
    }
    recordedUrl && URL.revokeObjectURL(recordedUrl);
    recordedUrl = "";
    recordedSize = "";
    const chunks: Blob[] = [];
    mediaRecorder = new MediaRecorder(stream, {
      mimeType: includeAudio
        ? "video/webm;codecs=vp9,opus"
        : "video/webm;codecs=vp9",
    });
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    };
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      recordedUrl = URL.createObjectURL(blob);
      recordedSize = humanSize(blob.size);
      log("Recording saved.");
    };
    mediaRecorder.start();
    recording = true;
    log("Recording started.");
  }

  function stopRecording() {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      recording = false;
      log("Recording stopped.");
    }
  }

  function captureSnapshot() {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    const settings = track.getSettings();
    const canvas = document.createElement("canvas");
    canvas.width = settings.width ?? 1280;
    canvas.height = settings.height ?? 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(videoPreview, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL("image/png");
    snapshots = [
      { url, label: `Snapshot ${snapshots.length + 1}` },
      ...snapshots,
    ].slice(0, 6);
    log("Snapshot captured.");
  }

  function downloadSnapshot(item) {
    const link = document.createElement("a");
    link.href = item.url;
    link.download = `${item.label.replace(/\s+/g, "-").toLowerCase()}.png`;
    link.click();
  }

  function stopAll() {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
    }
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    stream = null;
    recording = false;
  }

  function humanSize(size: number) {
    if (!size) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const idx = Math.floor(Math.log(size) / Math.log(1024));
    return `${(size / Math.pow(1024, idx)).toFixed(2)} ${units[idx]}`;
  }

  onMount(() => {
    enumerate();
    return stopAll;
  });

  onDestroy(stopAll);
</script>

<section class="space-y-6">
  <div
    class="grid gap-6 px-4 py-10 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
  >
    <div class="space-y-6">
      <div
        class="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
      >
        <div class="grid gap-4 md:grid-cols-2">
          <label class="space-y-1 font-semibold">
            <span>Video source</span>
            <select
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={selectedVideoDevice}
              on:change={startPreview}
            >
              {#each videoDevices as device}
                <option value={device.deviceId}
                  >{device.label ||
                    `Camera ${device.deviceId.slice(-4)}`}</option
                >
              {/each}
            </select>
          </label>
          <label class="space-y-1 font-semibold">
            <span>Audio source</span>
            <select
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={selectedAudioDevice}
              on:change={startPreview}
            >
              <option value="">Muted</option>
              {#each audioDevices as device}
                <option value={device.deviceId}
                  >{device.label || `Mic ${device.deviceId.slice(-4)}`}</option
                >
              {/each}
            </select>
          </label>
          <label class="space-y-1 font-semibold">
            <span>Resolution</span>
            <select
              class="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-indigo-400 dark:focus:ring-indigo-900"
              bind:value={resolution}
            >
              <option value="640x480">SD (640×480)</option>
              <option value="1280x720">HD (1280×720)</option>
              <option value="1920x1080">Full HD (1920×1080)</option>
            </select>
          </label>
          <label
            class="flex items-center gap-2 font-semibold text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300"
          >
            <input
              class="h-4 w-4 accent-indigo-600"
              type="checkbox"
              bind:checked={includeAudio}
              on:change={startPreview}
            />
            Include audio
          </label>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            class="inline-flex items-center rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:focus:ring-slate-700"
            type="button"
            on:click={startPreview}
          >
            Start preview
          </button>
          <button
            class="inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:cursor-not-allowed disabled:bg-indigo-300 dark:focus:ring-indigo-700"
            type="button"
            on:click={startRecording}
            disabled={recording || !stream}
          >
            {recording ? "Recording…" : "Record"}
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
            on:click={captureSnapshot}
            disabled={!stream}
          >
            Snapshot
          </button>
        </div>

        {#if status}
          <p class="text-xs text-emerald-600 dark:text-emerald-300">{status}</p>
        {/if}
      </div>
    </div>
    <div class="space-y-6">
      <div
        class="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/80"
      >
        <video
          bind:this={videoPreview}
          class="aspect-video w-full rounded-xl bg-black object-cover"
          playsinline
        ></video>
      </div>

      {#if recordedUrl}
        <div
          class="space-y-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200"
        >
          <p class="font-semibold uppercase tracking-wide">Latest recording</p>
          <video
            class="aspect-video w-full rounded-lg bg-black"
            src={recordedUrl}
            controls
          ></video>
          <div class="flex flex-wrap items-center gap-3">
            <a
              class="inline-flex items-center rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-300 dark:focus:ring-emerald-700"
              href={recordedUrl}
              download="camera-recording.webm"
            >
              Download • {recordedSize}
            </a>
            <Copy text={recordedUrl} label="Copy link" floating={false} />
          </div>
        </div>
      {/if}

      {#if snapshots.length}
        <div
          class="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/80 dark:text-slate-200"
        >
          <p
            class="font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
          >
            Snapshots
          </p>
          <div class="grid gap-3 sm:grid-cols-2">
            {#each snapshots as snapshot}
              <div
                class="space-y-2 rounded-xl border border-slate-200 p-3 dark:border-slate-700"
              >
                <img
                  class="h-32 w-full rounded-lg object-cover"
                  src={snapshot.url}
                  alt={snapshot.label}
                />
                <div class="flex items-center justify-between">
                  <p class="text-xs text-slate-500 dark:text-slate-400">
                    {snapshot.label}
                  </p>
                  <button
                    class="text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-300"
                    type="button"
                    on:click={() => downloadSnapshot(snapshot)}
                  >
                    Download
                  </button>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </div>
  </div>
</section>
