import { writable } from 'svelte/store'
import { get } from 'svelte/store'
import { goto, prefetch, prefetchRoutes } from '$app/navigation'
import { navigating, page, session } from '$app/stores'
import base from '../config.js'

function createStore() {
	const { subscribe, set, update } = writable({
		current: {
			idx: 0,
			info: {}
		},
		timeout: 1000,
		intro: '-00:00:01',
		volume: 0.0,
		playlist: []
	})

	return {
		subscribe,
		index: async idx => {
			let out
			await update( u => {
				u.current.idx = idx
				u.current.info = out = u.playlist[u.current.idx]
				return u
			})
			return out
		},
		prev: async e => {
			let out
			await update( u => {
				u.current.idx -= 1
				if (u.current.idx < 0) u.current.idx = u.playlist.length - 1
				u.current.info = out = u.playlist[u.current.idx]
				return u
			})
			return out
		},
		next: async e => {
			let out
			await update( u => {
				u.current.idx += 1
				if (u.current.idx >= u.playlist.length) u.current.idx = 0
				u.current.info = out = u.playlist[u.current.idx]
				return u
			})
			return out
		},
		fetch: async e => {
			try {
				const volume = parseFloat( await (await fetch(`/volume.txt`)).text() )
				const timeout = parseInt( await (await fetch(`/timeout.txt`)).text() )
				const intro = await (await fetch(`/intro.txt`)).text()
				const res = await fetch(`${base}/playlist.json`)
				if (res.ok) {
					const json = await res.json()
					update( u => {
						u.playlist = json.map( o => {
							o.file = `${base}/${o.file}`
							return o
						})
						u.volume = volume
						u.intro = intro
						u.timeout = timeout
						u.current.info = json[u.current.idx]
						return u
					})
					return { success: 'found config.json' }
				}
			} catch(err) {
				console.error(`could not get config.json:`, err.message)
				return { error: err.message }
			}
		}
	}
}

export const store = createStore()
export const voldown = writable(false)
export const volup = writable(false)
export const skipprev = writable(false)
export const playpause = writable(false)
export const skipnext = writable(false)
export const toggle = writable(false)