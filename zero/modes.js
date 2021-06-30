
const MODE = (title, name, role, code) => ( { title, credits: [ { name, role } ], code } )

const AUTO = 'AUTO'
const SDTV = 'SDTV'
const HDMI = 'HDMI'

module.exports = [
    MODE( 
        AUTO, 
        `Auto-detect`,`CVBS or HDMI`, 
        `` ),
    MODE( 
        SDTV, 
        `NTSE`, 
        `interlaced`, 
        `sdtv_mode=0` ),
    MODE( 
        SDTV, 
        `NTSE`, 
        `Japanese`, 
        `sdtv_mode=1` ),
    MODE( 
        SDTV, 
        `PAL`, 
        `interlaced`, 
        `sdtv_mode=2` ),
    MODE( 
        SDTV, 
        `PAL`, 
        `Brazilian`, 
        `sdtv_mode=3` ), 
    MODE( 
        SDTV, 
        `NTSE`, 
        `progressive scan`, 
        `sdtv_mode=16` ),
    MODE( 
        SDTV, 
        `PAL`, 
        `progressive scan`, 
        `sdtv_mode=18` ),
    MODE( 
        HDMI, 
        `Force`, 
        `3.5mm audio`, 
        `hdmi_group=0\nhdmi_force_hotplug=1\nhdmi_drive=1` ),
    MODE( 
        HDMI, 
        `Force`, 
        `HDMI audio`, 
        `hdmi_group=0\nhdmi_force_hotplug=1\nhdmi_drive=2` )
]