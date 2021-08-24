import fs from 'fs'
import path from 'path'


export const post = async (req) => {
	try {

		const { volume } = req.body

		if (volume) await fs.writeFileSync( 'static/volume.txt', parseFloat( volume ).toFixed(2) + '' )
		return {
			status: 200,
			body: req.body
		}
	} catch( err ) {
		console.error( err.message )
		return {
			status: 500,
			body: err.message
		}
	}
}
