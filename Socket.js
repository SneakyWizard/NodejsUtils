'use strict';

/* 

	DESCRIPTION: 

		A general socket library to send and receive data. 

	EXAMPLE: 

		const sending_data = "... character data to send ...";
		const connect_data = await Socket.open( { host: host, port: port } );

		if ( Object.keys( connect_data ).length !== 0 ) {

			const client = socket_data['client'];
			const banner = socket_data['banner'];
			const cmd    = Buffer.from( sending_data ).toString( 'base64' );

			const result = await Socket.send( { data: cmd, client: client, end: end } );
		}

*/

const net       = require('net');
const classname = 'Socket';
const time_sec  = 5000;

exports.Socket = class { 

	// Open a connection to the remote TCP server.
	async open( args ) {

		args = args || [];

		let host = args['host'];
		let port = args['port'];

		let timeout = '';

		var self = this;

		return new Promise( ( res, rej ) => {

			// Promise returns this buffer.
			let client = new net.Socket();

			client.connect( port, host, function() {

				// Wait for the data, and if it doesn't happen, execute a timeout.
				timeout = setTimeout( function() {
					let error = `${classname} no data from the server sent`;
					self.close( { client: client } );
					rej( error );
				}, time_sec );

            } ).on( 'close', function( data ) {

				let error = `${classname} closed ${host}:${port}`;
				rej( error );

            } ).on( 'data', function( data ) {

				if ( timeout ) {
					clearTimeout( timeout );
				}

				res( { client: client, banner: data.toString() } );

			} ).on( 'error', function( err ) {

				// Desttroy.
                if ( client ) {
                    client.destroy();
               		client = null;
                }

				rej( err.message );

            } );

		} );
	}

	// Must be in the promise chain.  Sending data.
	async send( args ) {

		args = args || [];

		let end     = args['end'];
		let data    = args['data'];
		let client  = args['client'];

		var self = this;

		return new Promise( function( res, rej ) {

			client.setTimeout( time_sec );

			// Write to the tcp open socket.
			client.write( `${data}\r\n` );
			
			let ar = [];
			
			client.on( 'data', function( d ) {

				// Binary data that comes back, convert to ascii.
				let f = Buffer.from( d ).toString( 'ascii' )

				// Create the return buffer.
				ar.push( f );
			
				// When it reaches 'end', return and close.
				if ( end && f.match( new RegExp( end ) ) ) {

					// End the socket session.
					self.close( { client: client } );

					// Remove the end.
					ar[ ar.length -1 ] = ar[ ar.length -1 ].replace( new RegExp( end, 'g' ), '' );
					res( ar.join('').toString( "NO" ) );
				}
			
			} ).on( 'error', function( e ) { 
				let error = `${classname} send ${e}`;
				rej( error );
			} ).on( 'timeout', function() {
				self.close( { client: client } );
				rej( end );
			} );

		} );
	}

	// The end all wrapper.
	close( args ) { 

		args = args || [];

		let client  = args['client'];

		if ( client ) { 
			client.end();
			client = null;
		}
	}
}
