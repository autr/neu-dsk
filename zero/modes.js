
const MODE = (title, description, code) => ( { title, description, code } )

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
        `sdtv_mode=0` ),
    MODE( 
        SDTV, 
        `NTSE (Japan)`, 
        `sdtv_mode=1` ),
    MODE( 
        SDTV, 
        `PAL (interlaced)`, 
        `sdtv_mode=2` ),
    MODE( 
        SDTV, 
        `PAL (Brazil)`, 
        `sdtv_mode=3` ), 
    MODE( 
        SDTV, 
        `NTSE (progressive scan)`, 
        `sdtv_mode=16` ),
    MODE( 
        SDTV, 
        `PAL (progressive scan)`, 
        `sdtv_mode=18` ),
    MODE( 
        HDMI, 
        `Safe mode (720p)`, 
        `hdmi_safe=1` ),
    MODE( 
        CUSTOM, 
        `Read from disk`, 
        `` )
]