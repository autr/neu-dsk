
const { spawn, execSync, exec }  = require('child_process')

const CMD = `omxplayer --vol 1000 -b -o alsa:hw:0,0 /home/dietpi/dsk/samples/001.mov`

exec(CMD)