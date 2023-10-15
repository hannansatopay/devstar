<script lang="js">
	import Intro from '$lib/Intro.svelte';
	import { marked } from 'marked';
	import "./markdown.css";

	export let data;

	$: markdownCode = '# Enter your markdown code here';
	$: preview = marked(markdownCode);

	const convert = (e) => {
		preview = marked(e.target.value);
	};
</script>

<Intro heading={data.meta.title} description={data.meta.description} />

<section class="bg-white dark:bg-gray-900 editor">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="card gap-4 lg:grid lg:grid-cols-2 overflow-hidden rounded-lg">
			<div class="p-2 bg-white">
				<h1 class="text-center">Markdown</h1>
				<textarea
					name="markdown"
					bind:value={markdownCode}
					on:input={convert}
					cols="30"
					rows="10"
					class="rounded-lg w-full h-full resize-none border-none p-1"
				/>
			</div>
			<div class="pl-4 p-2 h-full marked-preview bg-white">
				<h1 class="text-center">Preview</h1>
				{@html preview}
			</div>
		</div>
	</div>
</section>

<style>
	.marked-preview {
		border-left: 2px solid black;
	}

	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}
</style>
