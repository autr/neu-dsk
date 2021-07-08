
const MODE = (type, description, code) => ( { text: `${type}\n${description}`, code, type } )

const AUTO = 'AUTO'
const SDTV = 'SDTV'
const HDMI = 'HDMI'
const CUSTOM = 'CUSTOM'

module.exports = [
    MODE( 
        AUTO, 
        `Auto-detect CVBS or HDMI`, 
        `` ),
    MODE( 
        SDTV, 
        `NTSE(interlaced)`, 
        `sdtv_mode=0\nenable_tvout=1` ),
    MODE( 
        SDTV, 
        `NTSE (Japan)`, 
        `sdtv_mode=1\nenable_tvout=1` ),
    MODE( 
        SDTV, 
        `PAL (interlaced)`, 
        `sdtv_mode=2\nenable_tvout=1` ),
    MODE( 
        SDTV, 
        `PAL (Brazil)`, 
        `sdtv_mode=3\nenable_tvout=1` ), 
    MODE( 
        SDTV, 
        `NTSE (progressive scan)`, 
        `sdtv_mode=16\nenable_tvout=1` ),
    MODE( 
        SDTV, 
        `PAL (progressive scan)`, 
        `sdtv_mode=18\nenable_tvout=1` ),
    MODE( 
        HDMI, 
        `Safe mode (720p)`, 
        `hdmi_safe=1` ),
    MODE( 
        CUSTOM, 
        `Read from disk`, 
        `` )
]