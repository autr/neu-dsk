const fs = require('fs')
const path = require('path')
const { spawn, execSync, exec }  = require('child_process')
const keypress = require('keypress')
const template = require('./template.svg.js')
const MODES = require('./modes.js')
const minimist = require('minimist')
const os = require('os')
const RPiGPIOButtons = require('rpi-gpio-buttons') 
const TESTCMD = `omxplayer --vol 1000 -b -o alsa:hw:0,0 /home/dietpi/dsk/samples/001.mov`
const mime = require('mime')

console.log('[o-dsk] 👤  current user', os.userInfo().username, process.env.USER)


let ARGS = minimist( process.argv.slice(2) ) 
const VOLUP = 'VOLUP' 
const VOLDOWN = 'VOLDOWN'
const OMNI = 'OMNI'
const SKIPNEXT = 'SKIPNEXT'
const SKIPPREV = 'SKIPPREV'
const PLAYPAUSE = 'PLAYPAUSE'

 
console.log( `[o-dsk] 👁  argumnents ${JSON.stringify(ARGS)}`)

const BTNS = {
    12: VOLUP,
    9: VOLDOWN,
    8: OMNI,
    11: SKIPNEXT,
    10: PLAYPAUSE,
    7: SKIPPREV
}

console.log( `[o-dsk] 👁  pins ${Object.keys(BTNS).join(',')}`)

let HOLDING = 0

const config = async e => {

    const str = await (await fs.readFileSync( `/boot/config.txt` )).toString()

    const a = str.indexOf(STR.BEGIN)
    const b = str.indexOf(STR.END) + STR.END.length
    const found = !(b < a || a == -1 || b == -1)

    return { a, b, found, str }
}


const save = async e => {

    let { str, found, a, b } = await config()

    let mode = MODES[MODE]
    let txt = mode.text

    if ( mode.type == 'CUSTOM' ) {
        let custom = path.resolve(ROOT, 'custom.txt')
        if ( await fs.existsSync( custom ) ) {
            mode.code = (await fs.readFileSync( custom )).toString()
            console.log(`[o-dsk] 🛠  using custom mode\n`, txt)
        } else {
            console.warn(`[o-dsk] ❌  could not find a custom.txt`)
            return (await show( 'info', 1 ))
        }
    }

    let neu = `${STR.BEGIN}
${STR.MODE}${MODE}
# ${txt.replaceAll('\n', ' - ')}
${mode.code}
${STR.END}`
    let piece
    if (!found) {
        str += neu 
    } else {
        piece = str.substring(a, b)
        str = str.replace(piece, neu)
    }

    const ending = s => (s.substring( s.length - 40, s.length ))

    await fs.writeFileSync( '/boot/config.txt', str )
    console.log(`[o-dsk] 🗳  wrote mode ${MODE} to boot config\n`, neu)
    await show('info', 0)
    setTimeout( async e => {
        await execSync(`sudo reboot now`) 
    }, GAP)
}

const gpio = async e => {

    let buttons = new RPiGPIOButtons( { 
        pins: Object.keys(BTNS),
        mode: RPiGPIOButtons.MODE_BCM,
        usePullUp: false,
        debounce: 10,
        pressed: 10,
        clicked: 10
    })


    buttons.on('error', async err => {
        console.log('[o-dsk] 🚨  button error', err)
        
    })

    buttons.on('pressed', async pin => {
        let PIN = BTNS[pin] 
        console.log('[o-dsk] ❄️  button released', PIN, pin)
        if ( PIN == OMNI ) {
            let neu = new Date()
            if (neu - HOLDING > 4500) {
                console.log('[o-disk] 🛰  resetting to auto (pressed and held)')
                MODE = 0
                await save()
            } else {
                MODE_TOGGLE = !MODE_TOGGLE
                await modish( 0 )
            }
        }
    })



    buttons.on('released', async pin => {
        let PIN = BTNS[pin]
        console.log('[o-dsk] 🔆  button pressed', PIN, pin)

        if ( PIN == SKIPPREV ) {
            if (!MODE_TOGGLE) await skip(-1)
            if (MODE_TOGGLE) await modish(-1)
        }
        if ( PIN == SKIPNEXT ) {
            if (!MODE_TOGGLE) await skip(1)
            if (MODE_TOGGLE) await modish(1)
        }

        if ( PIN == VOLDOWN || PIN == VOLUP ) {
            if (!MODE_TOGGLE && PROC) {
                if ( PIN == VOLDOWN && VOL >= -4800 + 300 ) {
                    VOL -= 300
                    await PROC.stdin.write('-')
                }
                if ( PIN == VOLUP && VOL <= -300 - 300 ) {
                    VOL += 300
                    await PROC.stdin.write('+')
                }
                await fs.writeFileSync( DIRS.VOL, VOL + '' )
                console.log(`[o-disk] 🔊  volume -> ${VOL/1000}db ${VOL}`)
            } else {
                if ( PIN == VOLDOWN ) await modish(-1)
                if ( PIN == VOLUP ) await modish(1)
            }
        }

        if ( PIN == OMNI ) {
            if (!PROC) clearTimeout(TIMEOUT)
            HOLDING = new Date()
        }

        if ( PIN == PLAYPAUSE ) {
            if (PROC) await PROC.stdin.write(' ')
            if (!PROC) await save()
        }

    })

    
    buttons.init().catch(err => {
        console.error('[o-dsk] ❌  error initialising buttons:', err.message)
    })
}

// const exits = [`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`]

// exits.forEach((eventType) => {
//     process.on(eventType, e => {
//         console.log('YOYOYOYO EXIT', eventType) 
//         return process.exit(0)
//     }) 
// })



let DEBUG = false
let FORCE = ARGS.f
let ERRORS = false
let IDX = 0
let PROC = null
let VOL = -600
let LIST = [] 
let GAP = 5000
let TIMEOUT = null
let MODE = 0


let CMDS = {
    player: e => process.platform == 'darwin' ? 'mplayer' : 'omxplayer',
    settings: e => process.platform == 'darwin' ? '' : `-b --vol ${VOL} -o alsa:hw:0,0`
}
if ( !ARGS._[0] ) return console.error('[o-dsk] ❌  exiting - no folder specified')
let ROOT = path.resolve( ARGS._[0] )
let BIN = path.resolve( ROOT, './bin' )
const DIRS = {
    ROOT,
    BIN,
    VOL: path.resolve( BIN, './volume.txt'),
    TIMEOUT: path.resolve( BIN, './timeout.txt')
}

const KILL = {
    fbi: async e => {
        try { 
            await execSync( `sudo pkill fbi`) 
        } catch(err) {}
    },
    node: async e => {
        try {  
            await execSync( `sudo pkill node`)
        } catch(err) {}
    },
    player: async e => {
        try { 
            await execSync( `pkill ${CMDS.player()}`) 
        } catch(err) {}
    }
}

const skip = async num => {
    IDX += num
    if (IDX < 0) IDX = LIST.length - 1
    if (IDX >= LIST.length) IDX = 0
    console.log(`[o-dsk] ⏳  switched IDX ${IDX}` )
    await start()

}
const toggle = async e => {
    console.log('[o-dsk] 🏁  pause / play')
    if (PROC) PROC.stdin.write(' ')
}


const show = async (type, idx) => {

    await KILL.fbi()
    await execSync( `sudo fbi -d /dev/fb0 -T 1 --nocomments --noverbose --cachemem 1 ${path.resolve(DIRS.BIN, `${type}-${idx}.png`)}`)
}

let MODE_TOGGLE = false

const modish = async num => {
    MODE += num
    if (MODE < 0) MODE = MODES.length - 1
    if (MODE >= MODES.length) MODE = 0
    if (MODE_TOGGLE) {
        await show('mode', MODE)
        await KILL.player()
    } else {
        await start()
    }
}

const start = async e => {

    if (TIMEOUT) {
        clearTimeout( TIMEOUT )
        TIMEOUT = null
    }

    await show('video', IDX)

    await KILL.player()
    PROC = null

    TIMEOUT = setTimeout( ee => {

        const url = path.resolve(DIRS.ROOT, LIST[IDX].name )
        let ex = `${CMDS.player()} ${CMDS.settings()} ${url}`

        console.log(`[o-dsk] 🎬  playing ${ path.basename(url) }`)
        console.log(`[o-dsk] 🎬  ${ex}`)

        PROC = exec( ex, async (error, stdout, stderr) => {

            const data = {error,stdout,stderr}
            const type = error ? 'error' : stdout ? 'stdout' : stderr ? 'stderr' : ''
            const o = data[type]

            console.log(`[${CMDS.player()}] 📼  player ${type}:`, o.code, o.killed, o.signal )
            // console.log(`[${CMDS.player()}] exited with code ${code}`, id )
            PROC = null
            if (type == 'stdout') {
                console.log(`[${CMDS.player()}] 📼  skipping to next from stdout`)
                await skip(1)
            }
        })

    }, GAP)

}

const create = async (type, list) => {
    let count = 0
    for (let i = 0; i < list.length; i++ ) {
        const o = list[i]
        const svg = path.resolve(DIRS.BIN, `${type}-${i}.svg` )
        const png = path.resolve(DIRS.BIN, `${type}-${i}.png` )

        if (!(await fs.existsSync( png )) || FORCE ) {
            const cmd = `MAGICK_FONT_PATH=/usr/share/fonts/truetype/custom rsvg-convert ${svg} > ${png}` 
            await fs.writeFileSync( svg, template(o.text) )
            await execSync( cmd )
            count += 1
        }

    }

    if (count > 0) console.log(`[o-dsk] 🏭  generated ${count} ${type} overlays`)
}

let STR = {
    BEGIN: '# <DSK>',
    END: '# </DSK>',
    MODE: '# MODE='
}

const patch = async e => {
    const res = (await execSync('python ../buttons.py')).toString()
    console.log(`[o-dsk] patching gpio buttons bug: ${res.replaceAll('\n', ' ')}`)
}
const wait = async ms => ( new Promise(resolve => setTimeout(resolve, ms) ) )

const run = async e => {


    await KILL.fbi()
    await KILL.player()
    await gpio()

    await patch()
    // await wait(1000)

    // let PINS = Object.keys(BTNS)
    // for (let i = 0; i < PINS.length; i++){
    //     let PIN = PINS[i]
    //     console.log(`[o-dsk] ♻️  refreshing pin ${PIN}`)
    //     let cmds = {
    //         unexport: `echo ${PIN} > /sys/class/gpio/unexport`,
    //         export: `echo ${PIN} > /sys/class/gpio/export`,
    //         direction: `echo in > /sys/class/gpio/gpio${PIN}/direction`
    //     }
    //     try { await execSync( cmds.unexport ) } catch(err) { console.error('[o-dsk] ❌ ', err.message) }
    //     try { await execSync( cmds.export ) } catch(err) { console.error('[o-dsk] ❌ ', err.message) }
    //     try { await execSync( cmds.direction ) } catch(err) { console.error('[o-dsk] ❌ ', err.message) }
    // }

    if ( !(await fs.existsSync( DIRS.BIN )) ) {
        console.log('[o-dsk] creating bin...')
        await fs.mkdirSync( DIRS.BIN )
    }

    // READ VOL

    try {
        if ( !(await fs.existsSync( DIRS.VOL )) ) await fs.writeFileSync( DIRS.VOL, VOL + '' )
        VOL = parseInt( await (await fs.readFileSync( DIRS.VOL )).toString() )
        console.log(`[o-dsk] 🔊  volume.txt ${VOL}`)
    } catch(err) {
        return console.error(`[o-dsk] could not load volume.txt ${err.message}`)
    }

    // READ TIMEOUT / GAP

    try {
        if ( !(await fs.existsSync( DIRS.TIMEOUT )) ) await fs.writeFileSync( DIRS.TIMEOUT, GAP + '' )
        GAP = parseInt( await (await fs.readFileSync( DIRS.TIMEOUT )).toString() )
        console.log(`[o-dsk] ⏱  timeout.txt ${VOL}`)
    } catch(err) {
        return console.error(`[o-dsk] ❌  could not load timeout.txt ${err.message}`) 
    }

    // READ PLAYLIST 

    try {
        LIST = await Promise.all( (await fs.readdirSync( DIRS.ROOT )).filter( url => (mime.getType(url).indexOf('video') != -1)).map( async url => {

            const TXT = path.resolve( DIRS.ROOT, path.parse(url).name + '.txt' )
            if (await fs.existsSync( TXT )) {
                return { text: (await fs.readFileSync( TXT )).toString(), name: url }
            }
            return url
        }) )

    } catch(err) {
        return console.error(`[o-dsk] ❌  could not load playlist.json ${err.message}`)
    }


    // READ MODE

    try {
        const { str, a, b, found } = await config() 

        if ( !found ) {
            MODE = 0
            console.log('[o-dsk] 🤖  no explicit mode set from config (auto)')
        } else {
            const c = str.indexOf(STR.MODE)
            MODE = parseInt( str.substring(c + STR.MODE.length).split('\n')[0] )
            console.log(`[o-dsk] 🤖  mode from boot config ${JSON.stringify(MODES[MODE])}`)
        }

    } catch(err) {
        return console.error(`[o-dsk] could not load boot config ${err.message}`)
    }

    await show( 'mode', MODE )

    setTimeout( async e => {
        await create('video', LIST) 
        await create('mode', MODES)
        await create('info', [ 
            { text: 'Restarting\nUpdating config'},
            { text: 'No config.txt\nAdd to disk root to enable'},
        ]) 
    }, GAP)


    // return console.log(LIST)
    await start()
}

run()


/* OMXPLAYER KEY BINDINGS 

1 Increase Speed
2 Decrease Speed
j Previous Audio stream
k Next Audio stream
i Previous Chapter
o Next Chapter
n Previous Subtitle stream
m Next Subtitle stream
s Toggle subtitles
q Exit OMXPlayer
Space or p Pause/Resume
- Decrease Volume
+ Increase Volume
Left Seek -30
Right Seek +30
Down Seek -600
Up Seek +600
*/