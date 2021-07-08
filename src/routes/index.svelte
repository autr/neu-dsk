<script>
	import { store } from '$lib/store.js'
	// import config from '$lib/../../static/config.js'
	// import Counter from '$lib/Counter/index.svelte';

</script>

<svelte:head>
	<title>DSK</title>
</svelte:head>

<div class="flex grow column-stretch-stretch h100vh">
	{#each $store.playlist as item, idx }
		<a 
			on:mousedown={ e => store.index( idx ) }
			href={`/${item.slug}`}
			class:filled={ idx == $store.current.idx }
			class="grow flex row-center-center">
			<span class="flex grow row-space-between-center maxw38em plr2 ">
				<span class="bold f4 ">{item.title}</span>
				<span>
					{item.length}
				</span>
			</span>
		</a>
	{/each}
</div>