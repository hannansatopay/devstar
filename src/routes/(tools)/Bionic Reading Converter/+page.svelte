<script>
	let inputText = "";
	let bionicText = "";
	let error = null;

	const fetchBionicReading = async () => {
		const url = "https://bionic-reading1.p.rapidapi.com/convert";
		const data = new FormData();
		data.append("content", inputText);
		data.append("response_type", "html");
		data.append("request_type", "html");
		data.append("fixation", "1");
		data.append("saccade", "10");

		const options = {
			method: "POST",
			headers: {
				"x-rapidapi-key":
					"cf5d7e1823msha4bc5a896a45c8ap11cc2bjsnfc09784dc141",
				"x-rapidapi-host": "bionic-reading1.p.rapidapi.com",
			},
			body: data,
		};
		try {
			const response = await fetch(url, options);
			if (!response.ok) {
				throw new Error(`HTTP error! Status: ${response.status}`);
			}
			const result = await response.text();
			bionicText = result;
		} catch (err) {
			error = err.message;
		}
	};

	function handleSubmit() {
		// event.preventDefault();
		fetchBionicReading();
	}
</script>

<div
	class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg"
>
	<section class="bg-white w-50 dark:bg-gray-200">
		<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
			<main>
				<form on:submit={handleSubmit}>
					<textarea
						bind:value={inputText}
						placeholder="Enter text to convert..."
					></textarea>
					<button type="submit" class="color-white">Convert</button>
				</form>
				{#if error}
					<p>Error: {error}</p>
				{:else if bionicText}
					<div class="output">{@html bionicText}</div>
				{/if}
			</main>
		</div>
	</section>
</div>

<style>
	main {
		text-align: center;
		padding: 1em;
		max-width: 600px;
		margin: 0 auto;
	}
	.output {
		margin-top: 1em;
		padding: 1em;
		background-color: #f0f0f0;
		border-radius: 8px;
	}
	b {
		font-weight: bold;
	}
	textarea {
		width: 100%;
		height: 100px;
		margin-bottom: 1em;
	}
	button {
		padding: 0.5em 1em;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 4px;
		cursor: pointer;
	}
</style>
