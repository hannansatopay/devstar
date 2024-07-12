<script>
import AudioRecorder from './AudioRecorder.svelte';
</script>
<div class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
	<!-- Add tool here -->
    <AudioRecorder />
</div>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.card {
  display: flex;              
  flex-direction: column;
  gap: 16px;
  align-items: center;
  margin: 20px auto; 
  width: 90%;
  border-radius: 15px; 
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
  padding: 20px; 
  overflow: hidden;
}

main {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
}
</style>