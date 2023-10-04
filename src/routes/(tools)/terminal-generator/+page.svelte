<script lang="ts">
	// import Intro from '$lib/Intro.svelte';
	import {
		Label,
		Input,
		Range,
		Radio,
		Checkbox,
		ButtonGroup,
		Button,
		Search,
		Dropdown,
		DropdownItem,
		DropdownDivider
	} from 'flowbite-svelte';

	// import CodeMirror from 'codemirror';
	// import 'codemirror/lib/codemirror.css';
	// import 'codemirror/theme/dracula.css';

	import { onMount } from 'svelte';

	import {
		ChevronDownSolid,
		UserRemoveSolid,
		UserCircleSolid,
		AdjustmentsVerticalOutline,
		DownloadSolid,
		CopySolid,
		UserSettingsOutline,
		UserSettingsSolid
	} from 'flowbite-svelte-icons';

	export let data;

	let innerWidth: any = null;
	let innerHeight: any = null;

	// let editor;

	onMount(() => {
		// const codeEditor = document.querySelector('.code-editor');

		// if (codeEditor) {
		// 	editor = CodeMirror(codeEditor, {
		// 		lineNumbers: true,
		// 		theme: 'dracula'
		// 		// ... any other CodeMirror options you want
		// 	});
		// }
		
		innerWidth = window.innerWidth;
		innerHeight = window.innerHeight;
	});
</script>

<!-- <Intro heading={data.meta.title} description={data.meta.description} /> -->
<!--or-->
<section class="bg-custom-blue dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:px-12">
		<h1
			class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 dark:text-white"
		>
			Terminal Generator
		</h1>
		<p class="text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
			Create and share beautiful images of your source code. <br />
			Start typing or drop a file into the text area to get started.
		</p>
	</div>
</section>

<svelte:window bind:innerWidth bind:innerHeight />

<section class="bg-custom-blue dark:bg-gray-900">
	<div class="py-8 px-4 mx-auto max-w-screen-xl lg:px-12">
		<div class="bg min-h-[16rem] md:w-2/3 rounded-lg mx-auto flex flex-col p-2">
			<h5 class="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">
				<div class="toolbar">
					<div class="box">
						<span> Theme</span>
						<span class="ml-auto">
							<ChevronDownSolid class="w-3 h-3 text-white dark:text-white" />
						</span>
					</div>
					<Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
						<div slot="header" class="p-3">
							<Search size="md" />
						</div>
						<!-- Other list items ... -->
						<DropdownItem>File Name</DropdownItem>
						<DropdownDivider />
						<DropdownItem>File Name</DropdownItem>
						<DropdownDivider />
					</Dropdown>


					<!---------             Scripting            --------->
					<div class="box">
						<span>Languages</span>
						<span class="ml-auto">
							<ChevronDownSolid class="w-3 h-3 text-white dark:text-white" />
						</span>
					</div>
					<Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
						<div slot="header" class="p-3">
							<Search size="md" />
						</div>
						<!-- Other list items ... -->
						<DropdownItem>File Name</DropdownItem>
						<DropdownDivider />
					</Dropdown>

					<div class="icon">
						<Button>
							<img src="/setting.png" alt="Your  Description" />
						</Button>
					</div>

					<div class="icon">
						<Button>
							<img src="/copy.png" alt="Your  Description" />
						</Button>
					</div>

					<div class="export ml-auto">
						<span> Export</span>
						<span class="ml-auto">
							<ChevronDownSolid class="w-3 h-3 text-white dark:text-white" />
						</span>
					</div>
					<!-- 					
						<div slot="header" class="p-3" size="md">
							<Search size="md" />
						</div>
						<!-- Other list items ... 
					</Dropdown> -->
					<Dropdown class="overflow-y-auto px-3 pb-3 text-sm h-44">
						<DropdownItem>File Name</DropdownItem>
						<DropdownDivider />
						<DropdownItem>Size</DropdownItem>
						<DropdownDivider />
						<DropdownItem>Export</DropdownItem>
						<!-- <DropdownItem slot="footer">Separated link</DropdownItem> -->
					</Dropdown>
				</div>
			<!-- </h5>
			<div class="code-editor">
				<p class="font-normal text-gray-700 dark:text-gray-400">terminal</p>
			</div>-->
		</div>
	</div>
</section>

<style>
	.card {
		box-shadow: rgba(0, 0, 0, 0.1) 0 0 0 2px;
	}

	:is(.dark .card) {
		box-shadow: rgba(255, 255, 255, 0.5) 0 0 0 2px;
	}

	.toolbar {
		display: flex;
		align-items: center;
	}

	.export {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		border: 1px solid white;
		width: 180px;
		padding: 5px 20px;
		margin-right: 10px;
		border-radius: 5px;

		color: white;
	}
	.box {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		border: 1px solid white;
		width: 180px;
		padding: 5px 20px;
		margin-right: 10px;
		border-radius: 5px;

		color: white;
	}

	.icon img {
		width: 24px;
		height: 24px;
		object-fit: cover;
	}

	.icon {
		display: flex;
		align-items: center;
		margin-right: 10px;
		border-radius: 5px;
		color: white;
		background-color: #2d3748;
	}

	.dark .icon {
		background-color: #2d3748; /* Dark Mode Background Color */
	}

	.bg {
		background-color: #121212;
		border: white 2px solid;
	}
/* 
	.code-editor {
		height: 400px;
	} */
</style>
