const node = require('@sveltejs/adapter-node')
const pkg = require('./package.json')
const sveltePreprocess = require('svelte-preprocess')

/** @type {import('@sveltejs/kit').Config} */
module.exports = {
	preprocess: sveltePreprocess(),
	kit: {
		// By default, `npm run build` will create a standard Node app.
		// You can create optimized builds for different platforms by
		// specifying a different adapter
		adapter: node(),

		// hydrate the <div id="svelte"> element in src/app.html
		target: '#svelte',
		ssr: true
	}
}
