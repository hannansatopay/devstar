<script>
    import { onMount, onDestroy } from 'svelte';
    import WaveSurfer from 'wavesurfer.js';
  
    let mediaRecorder;
    let chunks = [];
    let recording = false;
    let paused = false;
    let wavesurferRecorded;
    let audioContext;
    let analyser;
    let dataArray;
    let source;
    let audioStream;
    let startTime;
    let elapsedTime = '00:00';
    let timerInterval;
    let audioURL = '';
    let isPlaying = false;
    let pausedTime = 0;
    let showingRecordedWaveform = false;
  
    const startRecording = async () => {
      try {
        audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
  
        source = audioContext.createMediaStreamSource(audioStream);
        source.connect(analyser);
  
        mediaRecorder = new MediaRecorder(audioStream);
  
        mediaRecorder.ondataavailable = (event) => {
          chunks.push(event.data);
        };
  
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/ogg; codecs=opus' });
          chunks = [];
          audioURL = URL.createObjectURL(blob);
          wavesurferRecorded.load(audioURL);
          showingRecordedWaveform = true; 
        };
  
        mediaRecorder.start(200);
  
        recording = true;
        paused = false;
        startTime = Date.now();
        timerInterval = setInterval(updateElapsedTime, 1000);
        drawLiveWaveform(); 
        showingRecordedWaveform = false; 
      } catch (error) {
        console.error('Error accessing microphone:', error);
      }
    };
  
    const stopRecording = () => {
      if (paused) {
        paused = false;
      }
      mediaRecorder.stop();
      audioStream.getTracks().forEach(track => track.stop());
      recording = false;
      clearInterval(timerInterval);
    };
  
    const playPauseRecording = () => {
      if (wavesurferRecorded.isPlaying()) {
        wavesurferRecorded.pause();
        isPlaying = false;
      } else {
        wavesurferRecorded.play();
        isPlaying = true;
      }
    };
  
    const pauseResumeRecording = () => {
      if (paused) {
        paused = false;
        startTime = Date.now() - (pausedTime - startTime);
        timerInterval = setInterval(updateElapsedTime, 1000);
        mediaRecorder.resume();
        drawLiveWaveform(); 
      } else {
        paused = true;
        pausedTime = Date.now();
        clearInterval(timerInterval);
        mediaRecorder.pause();
      }
    };
  
    const saveRecording = () => {
      if (audioURL) {
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = audioURL;
        a.download = 'recording.ogg';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(audioURL);
      }
    };
  
    const deleteRecording = () => {
      audioURL = '';
      wavesurferRecorded.empty();
      elapsedTime = '00:00';
      clearInterval(timerInterval);
      isPlaying = false;
      showingRecordedWaveform = false; 
      resetRecording(); 
    };
  
    const resetRecording = () => {
      recording = false;
      paused = false;
      chunks = [];
      audioContext.close(); 
      wavesurferRecorded.destroy(); 
      wavesurferRecorded = null;
      showingRecordedWaveform = false;
      initLiveWaveform(); 
    };
  
    const updateElapsedTime = () => {
      if (paused) return;
      const now = Date.now();
      const diff = Math.floor((now - startTime) / 1000);
      const minutes = Math.floor(diff / 60).toString().padStart(2, '0');
      const seconds = (diff % 60).toString().padStart(2, '0');
      elapsedTime = `${minutes}:${seconds}`;
    };
  
    const drawLiveWaveform = () => {
      if (!recording || paused) return;
      requestAnimationFrame(drawLiveWaveform);
      analyser.getByteFrequencyData(dataArray);
  
      const canvas = document.querySelector('#waveform canvas');
      const canvasCtx = canvas.getContext('2d');
      const width = canvas.width;
      const height = canvas.height;
  
      canvasCtx.clearRect(0, 0, width, height);
      const gradient = canvasCtx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(64, 64, 64, 0.8)');
      gradient.addColorStop(1, 'rgba(0, 0, 75, 0.8)');
      canvasCtx.fillStyle = gradient;
  
      const barWidth = 1;
      let x = 0;
      const middleY = height / 2;
      for (let i = 0; i < dataArray.length; i++) {
        const value = dataArray[i] / 255;
        const barHeight = height * value * 0.8;
        canvasCtx.fillRect(x, middleY - barHeight / 2, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
  
    const initLiveWaveform = () => {
      wavesurferRecorded = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#595959',
        progressColor: '#111522',
        cursorWidth: 1,
        barWidth: 0.5,
        barHeight: 0.5,
        height: 100,
        responsive: true,
        backend: 'MediaElement'
      });
  
      wavesurferRecorded.on('play', () => {
        isPlaying = true;
      });
  
      wavesurferRecorded.on('pause', () => {
        isPlaying = false;
      });
  
      wavesurferRecorded.on('finish', () => {
        isPlaying = false;
      });
    };
  
    onMount(() => {
      initLiveWaveform(); 
    });
  
    onDestroy(() => {
      if (wavesurferRecorded) {
        wavesurferRecorded.destroy();
      }
      if (audioContext) {
        audioContext.close();
      }
    });
  </script>
  
  <style>
    @import url('https://fonts.googleapis.com/icon?family=Material+Icons');
  
    body {
      font-family: 'Roboto', sans-serif;
      color: #333;
      margin: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
    }
  
    .craftlab {
      display: flex;
      text-align: center;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    }
  
    .title {
      text-align: center;
      font-size: 2rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
  
    .timer {
      font-size: 1.5rem;
      font-weight: 500;
      margin-bottom: 1rem;
    }
  
    .controls {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }
  
    .button-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      background-color: black;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      transition: background-color 0.3s ease;
    }
  
    .button-icon:hover {
      background-color: #333;
    }
  
    .button-icon:disabled {
      background-color: #999;
      cursor: not-allowed;
    }
  
    #waveform {
      width: 100%;
      height: 100px;
      background-color: rgba(255, 255, 255, 0.5);
      overflow: hidden;
      position: relative;
      margin-top: 1rem;
    }
  
    #waveform canvas {
      width: 100%;
      height: 100%;
      display: block;
      transform: scaleY(0.5)
    }
  
    .button-container {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-top: 1.5rem;
    }
  </style>
  
  <div class="craftlab">
    <h1 class="title">Voice Recorder</h1>
    <div class="timer">{elapsedTime}</div>
    <div class="controls">
      <div class="button-icon" on:click={startRecording} disabled={recording}>
        <span class="material-icons">mic</span>
      </div>
      <div class="button-icon" on:click={stopRecording} disabled={!recording}>
        <span class="material-icons">stop</span>
      </div>
      <div class="button-icon" on:click={pauseResumeRecording} disabled={!recording}>
        <span class="material-icons">{paused ? 'play_arrow' : 'pause'}</span>
        </div>
        
          </div>
          <div id="waveform">
            {#if !showingRecordedWaveform}
              <canvas></canvas>
            {/if}
          </div>
          <div class="button-container">
            <div class="button-icon" on:click={playPauseRecording} disabled={!audioURL}>
              <span class="material-icons">{isPlaying ? 'pause' : 'play_arrow'}</span>
            </div>
            <div class="button-icon" on:click={saveRecording} disabled={!audioURL}>
              <span class="material-icons">file_download</span>
            </div>
            <div class="button-icon" on:click={deleteRecording} disabled={!audioURL}>
              <span class="material-icons">delete</span>
            </div>
          </div>
          <div class="waveform-container">
            {#if showingRecordedWaveform}
              <div id="waveform-recorded"></div>
            {/if}
          </div>
        </div>