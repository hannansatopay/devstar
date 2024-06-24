<script lang="ts">
	import { Button, VideoPlaceholder } from 'flowbite-svelte';
	
	export let data;

	let recorder;
	let strm;
	let src;

	let recording = false;

	function stop() {
		recorder.stop();
		strm.getTracks().forEach(function (track) {
			track.stop();
		});
		recording = false;
	}

	function getMedia() {
		navigator.mediaDevices
			.getDisplayMedia({ video: true, audio: true })
			.then(function (stream) {
				strm = stream;
				// Create a new MediaRecorder instance to record the stream
				recorder = new MediaRecorder(stream);

				// Create an array to store the recorded chunks
				var chunks = [];

				recorder.start();

				recording = true;

				// Save the recorded video when the recorder has data available
				recorder.addEventListener('dataavailable', function (event) {
					chunks.push(event.data);
				});

				// Create a new video element and play the recorded video
				recorder.addEventListener('stop', function () {
					stop();
					var video = document.createElement('video');
					src = URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
					document.body.appendChild(video);
					video.play();
				});
			}).catch(function (error) {
				console.error('Could not get display media: ' + error);
			});
	}

	function download() {
		if (src) {
			var video = document.createElement('a');
			video.href = src;
			video.download = `screen-recording-${Date.now()}.webm`;
			video.click();
			URL.revokeObjectURL(src);
			document.body.removeChild(video);
		}
	}
</script>


<div class="card mx-auto max-w-screen-xl overflow-hidden rounded-lg">
	<div class="h-full flex rounded-lg relative justify-center items-center">
		{#if src}
			<video class="w-full h-auto" controls {src} />
			<Button color="green" on:click={download} class="absolute top-4 right-4">Download</Button>
		{:else}
			<VideoPlaceholder size='xxl' class="w-full max-w-full h-96"/>
		{/if}
		{#if recording}
			<Button on:click={stop} class="absolute top-4 left-4">Stop</Button>
		{:else}
			<Button on:click={getMedia} class="absolute top-4 left-4">Start</Button>
		{/if}
	</div>
</div>
