'use strict';

/*
	Description: 

		A really simple mail sender using net socket.

	Example: 

		var SendMail = require ('lib/Utils/SendMail').SendMail;
		SendMail = new SendMail;

		SendMail.init( { to: 'name@example.com', subject: 'New Subject', body: 'Testing 1 2 3' } );

*/

const net = require('net');
const os  = require('os');

const hostname = os.hostname();

exports.SendMail = class {

	init( args ) {

		args = args || [];

		let to      = args['to']   || 'example@example.com';
		let from    = args['from'] || `example@${hostname}`;
		let body    = args['body'];
		let remote  = args['remote'] || 'localhost';
		let subject = args['subject'];

		if ( body && subject ) {

			// Data must be in this format for a mesg to get sent properly.
			let data = `
DATA
From: ${from}
To: ${to}
Subject: ${subject}

${body}
.
`;

			let client = net.connect( 25, remote, () => {
				client.write( `HELO ${hostname}\r\n` );
				client.write( `MAIL FROM:${from}\r\n` );
				client.write( `RCPT TO:${to}\r\n` );
				client.write( data );
				client.end();
				client = null;
			} );

		} else { 
			console.log( 'SendMail missing args' );
			console.dir( args );
		}
	}
}
