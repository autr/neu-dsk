module.exports = text => {
	text = text || ''
    const title = text.split('\n')[0]
    const lines = text.split('\n').splice(1)

    const w = 720
    const h = 576
    return `
    <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
        <rect 
            x="0" 
            y="0" 
            width="${w}" 
            height="${h}"
            fill="black"/>
        <text 
            x="50%" 
            y="50%"
            width="${w}"
            height="${h}" 
            font-family="Helvetica, Arial, sans-serif"
            dominant-baseline="middle" 
            text-anchor="middle"
            font-style="normal"
            fill="white">
                <tspan 
                    font-size="${parseInt( h * 0.1 ) }"
                    text-anchor="middle" 
                    x="50%"
                    y="${parseInt( 45 - (lines.length * 5) )}%"
                    dy="0em">
                    ${title}
                </tspan>
                <tspan dy="2em"></tspan>
                ${lines.map( c => {
                    return `
                    <tspan 
                        font-size="${parseInt( h * 0.06 ) }"
                        text-anchor="middle" 
                        x="50%"
                        dy="2em">
                        ${c}
                    </tspan>`
                }).join('')}
        </text>
    </svg>`
}
