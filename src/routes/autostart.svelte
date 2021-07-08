<script>
	import { goto, prefetch, prefetchRoutes } from '$app/navigation'
	import { store } from '$lib/store.js'
	import { onMount, onDestroy } from 'svelte'
	onMount(async () => {
		const res = await store.fetch()
		goto(`/${$store.current.info.slug}/${$store.intro}`)
	})
</script>