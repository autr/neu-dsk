import fs from 'fs'
import path from 'path'

export const get = async (req) => {
	const pkg = JSON.parse( await fs.readFileSync( 'package.json', {encoding:'utf8'} ) )
	return {
		status: 500,
		body: pkg
	}
};


// PATCH /todos/:uid.json
export const patch = async (req) => {
	return {
		status: 500,
		body: 'yo'
	}
};
