import adapter from '@sveltejs/adapter-node';
import { vitePreprocess } from '@sveltejs/kit/vite';

import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({ out: 'build' })
	}
};

export default {
	preprocess: [
		preprocess({
			// Add your preprocessing options here, e.g., typescript()
			typescript: {}
		})
	]
};
