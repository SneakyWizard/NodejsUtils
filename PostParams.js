'use strict';

/* 

	DESCRIPTION:  

		Take the express req object and extract the params.
		To merge params into the postdata key values object.
		
		This class saves on duplication of too many lines of code. 

*/

const classname = 'Utils::PostParams';

exports.PostParams = class { 

	async init( args ) {

		args = args || [];

		const req     = args['req'];
		const req_id  = args['req_id'];

		let params = {};

		if ( req ) {

			const postdata = req.body;
			params         = req.query;

			// Populate params when xmlsrc in postdata is used.
			if ( typeof postdata !== 'undefined' ) { 
				for ( let l in postdata ) { 
					let value = postdata[ l ];
					if ( typeof value !== 'undefined' ) { 
						params[ l ] = value;
					}
				}
			}

			// Make sure there are keys.
			if ( Object.keys( params ).length < 1 ) {

				const promise = new Promise( res => {
					req.on( 'data', async ( body ) => {
						if ( body ) {
							try { 
								body = Buffer.from( body ).toString();
								res( body );
							} catch( e ) {
								console.log( "CONSOLE:" );
								console.error( e );
								res();
							}
						}
					} );
				
					// With no data.
					req.on( 'end', async() => { 
						res({});
					});
				} );
				
				// Body string.
				params = await promise; 

				// Decode and parse the body if it's json.
				if ( params.length > 0 ) {
				
					params = params.replace(  /^.+?=/, '' );
					params = params.replace( /\+/g, '%20' );
					params = decodeURIComponent( params );
				
					try {
						params = JSON.parse( params );
					} catch( e ) { 
						// Not all bodies are JSON.
					}
				}
			}
		}

		return params;
	}
}
