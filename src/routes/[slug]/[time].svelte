<script>
	import { get } from "svelte/store"
	import { onMount, onDestroy } from 'svelte'
	import { goto, prefetch, prefetchRoutes } from '$app/navigation'
	import { navigating, page, session } from '$app/stores'
	import { store, voldown, volup, skipprev, playpause, skipnext, toggle } from '$lib/store.js'


	let counter, stamp, req, lastCounter

	let intro = true
	let refresh = true
	let canplay = false
	let inited = false

	function frame() {
		const s = new Date()
		const ms = (s - stamp) / 1000
		stamp = s
		counter += ms
		const int = parseInt( Math.round(counter) )
		if ( int != lastCounter ) {
			console.log('[time] counting down', int )
			const bit = int == 0 ? '' : '-'
			const str = bit + toTimestamp( int * -1 ) 
			if (info.slug) window.history.replaceState( {} , 'timestamp', `/${info.slug}/${str}` )
		}
		if (counter > 0 && canplay) {
			intro = false
			// currentTime = 50
			el.play()
			console.log('[time] starting play')
		} else {
			req = requestAnimationFrame( frame )
		}
		lastCounter = int
	}

	onMount( init )

	const pageListener = page.subscribe( async p => {
		await init()
	})

	$: info = $store.current.info

	async function init() {
		inited = false
		refresh = true
		canplay = false
		intro = true
		counter = fromTimestamp( $page.params.time ) 
		stamp = new Date()
		requestAnimationFrame( frame )
		setTimeout( e => {
			refresh = false
			inited = true
			setTimeout( ee => volume = $store.volume, 10 )
		}, 10)
	}

	function fromTimestamp( str ) {
		let t = 0
		const split = str.split(':')
		const mult = str[0] == '-' ? -1 : 1
		if (split[0]) t += parseInt(split[0]) * 60 * 60 * mult
		if (split[1]) t += parseInt(split[1]) * 60 * mult
		if (split[2]) t += parseFloat(split[2]) * mult
		return t
	}
	function toTimestamp( t ) {
		return (new Date(t * 1000)).toISOString().substr(11, 8)
	}

	let currentTime, duration, paused, lastTime, volume


	let lookup = []
	let playback = []
	let volumes = []
	let showPlayback, showVolume = false

	const add = ( id, ref, keys, subscribe, arr, icon ) => {
		const o = { id, ref, keys, subscribe, icon, value: false }
		lookup.push( o )
		if (arr) arr.push( o )
	}

	let lastVol

	async function saveVolume( vol ) {
		if (vol != lastVol && inited) {

			const response = await fetch( '/set.txt', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify( { volume } )
			})

			lastVol = vol
		}
	}

	$: saveVolume( volume )

	add( 'voldown', voldown, ['-', '_'], async b => {
		if (b) {
			volume -= 0.05
			if (volume < 0) volume = 0
		}
	}, volumes)

	add( 'volup', volup, ['=', '+'], async b => {
		if (b) {
			volume += 0.05
			if (volume > 1) volume = 1
		}
	}, volumes)


	add( 'skipprev', skipprev, ['ArrowUp', 'ArrowLeft'], async b => {
		if (!b) {
		}
	}, playback, `
		<g transform="rotate(180 0 0), translate(20,20)">
			<path d="M0 0 L70 50 L0 100" />
			<path d="M0 0 L70 50 L0 100" transform="translate(60, 0)" />
			<path d="M100 0 L100 100" transform="translate(55,0)" />
		</g>
	`)

	add( 'playpause', playpause, [' '], async b => {
		if (!b) {
			paused = !paused
			console.log( paused ? 'paused' : 'playing' )
		}
	}, playback, `<path transform="translate(40,0)" d="M0 0 L70 50 L0 100" />`)

	add( 'skipnext', skipnext, ['ArrowDown', 'ArrowRight'], async b => {
		if (!b) {
		}

	}, playback,`
		<g>
			<path d="M0 0 L70 50 L0 100" />
			<path d="M0 0 L70 50 L0 100" transform="translate(60, 0)" />
			<path d="M100 0 L100 100" transform="translate(55,0)" />
		</g>
	`)


	let states = {}

	// bind subscribe and unsubscribe

	let volTimeout, playTimeout

	for (let i = 0; i < lookup.length; i++) {
		const o = lookup[i]
		const { ref, subscribe } = o
		o.unsubscribe = ref.subscribe( b => {
			if (!inited) return
			states[o.id] = b
			if (playback.indexOf(o) != -1) {
				console.log('[time] SHOW', b, o.id)
				showPlayback = true
				clearTimeout( playTimeout )
				playTimeout = setTimeout( e => showPlayback = false, $store.timeout )
			}
			if (volumes.indexOf(o) != -1) {
				showVolume = true
				clearTimeout( volTimeout )
				volTimeout = setTimeout( e => showVolume = false, $store.timeout )
			}
			subscribe( b )
		})
	}

	onDestroy( async e => {
		cancelAnimationFrame( req )
		for (let i = 0; i < lookup.length; i++) lookup[i].unsubscribe()
		if (pageListener) pageListener()
	})

	function onCurrentTime( t ) {

		t = parseInt( Math.round(t) )
		const str = toTimestamp( t || 0 )
		if (t != lastTime && t >= 0) {
			if (info.slug) window.history.replaceState( {} , 'timestamp', `/${info.slug}/${str}` )
			lastTime = t
		}

	}

	$: onCurrentTime( currentTime )

	function onLoadStart( e ) {
	}

	function onCanPlay( e ) {
		canplay = true

	}
	let el 

	function getFilled( ref ) {
		if (ref == skipnext) return $skipnext
		if (ref == skipprev) return $skipprev
		if (ref == playpause) return $playpause
		return 'blag'
	}

	async function onEnded() {

		const i = await store.next()
		window.location = `/${i.slug}/${$store.intro}`
	}

	function getSVG( o, p ) {
		let svg = (o.icon || '')
		if (o.id == 'playpause' && !p) {
			svg = `
				<path transform="translate(40,0)" d="M0 0 L0 100" />
				<path transform="translate(100,0)" d="M0 0 L0 100" />
			`
		}
		return svg.replaceAll('<path', '<path vector-effect="non-scaling-stroke" ')
	}

	let error = null
	function onError( e, m ) {
		error = `error getting ${e.target.src}`
		console.error( error )
	}

	function trigger( o, value ) {
		if (o.id == 'skipprev') $skipprev = value
		if (o.id == 'skipnext') $skipnext = value
		if (o.id == 'playpause') $playpause = value
	}
</script>
{#if !error}
	{#if !refresh}
		{#if intro}
			<div class="fixed z-index97 column-center-center flex cpb1">
				<div><span class="f5 bold">{info.title}</span></div>
				<!-- <div class="flex column grow"> -->
					{#each info?.credits || [] as credit }
						<div class="pb1 flex column-center-center grow">
							<div>	{credit.role}</div>
							<div>{credit.name}</div>
						</div>
					{/each}
				<!-- </div> -->

				<div>{info.date}</div>
			</div>
		{/if}
		<div 
			on:mouseover={ e => showPlayback = true }
			on:mouseout={ e => showPlayback = false }
			class="fixed w100vw b0 z-index98 pb1 flex row-center-center" >
			<div class="flex row-center-center" class:hidden={ !showPlayback }>
				{#each playback as o}
					<div 
						on:mousedown={ e => trigger( o, true ) }
						on:mouseup={ e => trigger( o, false ) }
						class:filled={ states[ o.id ] }
						class="pointer icon p1 b2-solid w4em h4em relative flex">
						<svg class="icon w100pc h100pc clickable" viewBox="0 0 180 120">
							<g transform="translate(10,0)">
								{@html getSVG( o, paused ) }
							</g>
						</svg>
					</div>
				{/each}
			</div>
		</div>
		<div 
			class="fixed r0 z-index99 t0 flex column-center-center h100vh">
			<div 
				on:mouseover={ e => showVolume = true }
				on:mouseout={ e => showVolume = false }
				class="w12em h100vh abs t0 r0 z-index98" />
			<div 
				on:mouseover={ e => showVolume = true }
				on:mouseout={ e => showVolume = false }
				class:hidden={ !showVolume }
				class="flex column-center-center grow w4em" >
				<input 
					class="vertical w12em z-index99"
					bind:value={volume} 
					type="range" 
					min={0} 
					max={1} 
					step={0.05} />
				<div class="rel t6">
					{ parseInt( volume * 100 ) || '' }
				</div>
			</div>
		</div>
		{#if info.file}
		<video
			class:hidden={intro}
			bind:this={el}
			class="w100vw h100vh p0 m0"
			src={ `${info.file}?v=${ parseInt(Math.random() * 1000) }` }
			autoplay={false}
			controls={false}
			on:canplay={ onCanPlay }
			on:error={ onError }
			on:loadstart={onLoadStart}
			on:ended={onEnded}
			bind:volume
			bind:currentTime
			bind:duration
			bind:paused></video>
		{/if}
	{/if}
{:else}
	<div class="f4 maxw32em text-center">{error}</div>
{/if}