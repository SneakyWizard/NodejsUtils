'use strict';

/* 
	DESCRIPTION:

		A config ini parser wrapper that converts it into an object result.

		https://www.npmjs.com/package/ini
*/

const ini = require('ini');
const fs  = require('fs');

exports.ConfigIni = class { 

	// Files.
	read_file( args ) { 

		args = args || [];

		let file_location = args['file_location'];
		let file_string   = fs.readFileSync( file_location, 'utf-8' );
		let ns            = this.parse_string( { string: file_string } );

		return ns;
	}

	// Convert the ini string into a ref.
	parse_string( args ) {

		args = args || [];

		let string = args['string'];

		let ns = ''

		if ( string ) {

			// Must make ;'s safe in the string.
			let st = string.split( /\n/ );
			
			for ( let num in st ) { 

				let line = st[ num ];

				// Must escape and allow comments in ini files.
				if ( line.match( /^[^;#\s]/ ) ) { 
					line = line.replace( /;/g, '\\;' );
					line = line.replace( /#/g, '\\#' );
					ns  += line;
				}
			}

			ns = ini.parse( ns );
		}

		return ns;
	}
}
