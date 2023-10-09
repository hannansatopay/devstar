<script lang="js">
	import Intro from '$lib/Intro.svelte';
	import { marked } from 'marked';

	export let data;

	$: markdownCode = '# Enter your markdown code here';
	$: preview = marked(markdownCode);

	const convert = (e) => {
		preview = e.target.value;
		preview = marked(preview.replace(/\n/g, '\n'));
		console.log(preview);
	};
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div
			class="card gap-16 items-center mx-auto max-w-screen-xl lg:grid lg:grid-cols-2 overflow-hidden rounded-lg markdown-editor-wrapper"
		>
			<div class="p-8">
				<textarea
					name="markdown"
					bind:value={markdownCode}
					on:input={convert}
					cols="30"
					rows="10"
				/>
			</div>
			<div class="p-8 h-full flex rounded-lg relative marked-preview">
				<!-- <h1
					class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-black"
				>
					Dummy text to check
				</h1> -->
				<br />
				{@html preview}
			</div>
		</div>
	</div>
</section>

<style>
	.marked-preview {
		border-left: 2px solid black;
		border-radius: 0;
	}

	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
		background: white;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
</style>
