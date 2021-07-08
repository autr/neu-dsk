import WebSocket from 'ws'
import http from 'http'
import RPiGPIOButtons from 'rpi-gpio-buttons'

let _wss = null

const num = [26,24,21,19,23,32]
const ids = [7,8,9,10,11,12]

const pins = ids

console.log( `using pins ${pins.join(',')}`)

const lookup = {
	12: 'volup',
	9: 'voldown',
	8: 'toggle',
	11: 'skipnext',
	10: 'playpause',
	7: 'skipprev'
}

let buttons = new RPiGPIOButtons( { 
	pins,
	usePullUp: false,
	debounce: 10,
	pressed: 10,
	clicked: 10
} )

buttons.on('pressed', pin => inform( pin, lookup[pin], false ) )
buttons.on('released', pin => inform( pin, lookup[pin], true ) )
buttons.init().catch(err => console.error('error initialising buttons:', err.message) )

const wss = async () => {

	if (_wss) return _wss

	_wss = new WebSocket.Server( { port: 8765 } )

	console.log('creating websocket server: 8765')

	_wss.on('connection', function connection(ws) {

		const addr = ws._socket.address()
		console.log(`[websockets] 🌐 ✅  connection made: ${addr.address} ${addr.port}"`)

		ws.on('message', function incoming(message) {
			console.log('received: %s', message)
		})

		inform( 0, 'info', 'connected to client')
	})

}
const inform = async ( pid, type, message, extra ) => {
	console.log('inform')

	const msg = typeof( message ) == 'object' || typeof( message ) == 'array' ? JSON.stringify( message ) : message
	console.log(`[inform] ${type}  🌐  ${pid}: "${msg}"`, extra || '')

	if (!_wss) await wss()

	_wss.clients.forEach(function each(client) {
	  if (client.readyState === WebSocket.OPEN) {
	    client.send( JSON.stringify( { pid, type, msg } ) )
	  }
	})
}

wss()

process.stdin.resume()