// import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-node';

import { vitePreprocess } from '@sveltejs/kit/vite';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: [vitePreprocess({})],
	kit: {
	    
		adapter: adapter({ out: 'build' })
	}
};

/**const config = {
	kit: {
	  // hydrate the <div id="svelte"> element in src/app.html
	  target: '#svelte',
	  adapter: adapter()
	}
  };**/
  
  export default config;