'use strict';

/*

	DESCRIPTION:  

		Use to log program traces.

	EXAMPLE: 

		const trace = global.objects.Trace.obj;
		Trace.WriteTrace( { level: 'INFO', text: 'hi', appname: 'app-name', screen: 1, stack: stack } );

*/

const fs         = require('fs');
const dateFormat = require('dateformat');

exports.Trace = class {

	// Trace.WriteTrace( { text: text, level: 'INFO', appname: 'app-name' } );
	async WriteTrace( args ) {

		args = args || [];

		// For non-passenger scripts.
		global.trace_data = global.trace_data || {};

		let text      = args['text'];
		let stack     = args['stack'];
		let level     = args['level'];
		let screen    = args['screen'];
		let req_id    = args['req_id' ]   || global.trace_data.req_id;
		let appname   = args['appname']   || global.trace_data.appname || 'NodeJS';
		let remote_ip = global.trace_data.remote_ip;

		if ( typeof text === 'object' ) { 
			text = JSON.stringify( text );
		}

		if ( level ) {

			// When the trace is active, then log.
			let enabled = await this.is_trace_enabled( { appname: appname, level: level } );

			if ( enabled == true ) {

				// Site dir log location.
				let log_dir = `/var/log/node-logs/`;
				
				await fs.access( log_dir, fs.constants.W_OK, async ( no_dir ) => {
				
					if ( !no_dir ) {

						// Trim.
						text = text.toString();
						text = text.trim();
				
						let file_date = this.set_date( { type: 1 } );
						let file_name = `${file_date}.log`;
						let file_loc  = `${log_dir}/${file_name}`;
						
						let log_file      = await fs.createWriteStream( file_loc, { flags: 'a' } );
						let log_stdout    = process.stdout;
						let log_line_time = await this.set_date( { type: 2 } );
						let log_line      = `${appname} [${level}] ${log_line_time} ${remote_ip}:  ${text}\n`;
				
						if ( req_id ) {
							log_line = `(SESS ${req_id}) ` + log_line;
						}
				
						// Begining of the log entry. 
						log_line = `*** ${log_line}`;

						// Stack trace.
						if ( level === 'ERROR' ) {
							if ( stack ) {
								log_line = log_line.replace( /\n$/, '' );
								log_line = log_line + ": \n" + stack + "\n";
							}
						}
				
						// Print out to console.
						if ( screen ) {
							log_stdout.write( log_line );
						}
						
						// Log entries start with:  16:09:02 SESS: 858 <log text>
						// for Error:  new Error().stack
						await log_file.write( log_line );
					} 
				
				} );

			}
		} 
	}

	// Just create the file name as the date format e.g. 180328.log
	set_date( args ) { 

		args = args || [];

		let type = args['type'] || 1;

		// type1:  log name.
		// type2:  entry inside log.
		let types = {};

		types[1] = 'yymmdd';
		types[2] = 'hh:mm:ss';
	
		let now      = new Date();
		let datetime = dateFormat( now, types[ type ] );

		return datetime;
	}

	// Fetch from the db and compare the inputs. 
	// Enabled when any of the inputs matches the db record. 
	// Use:  let v = await Trace.is_trace_enabled( { appname: 'app-name', level: 'INFO' } );
	async is_trace_enabled( args ) { 

		args = args || [];

		const level   = args['level'];
		const appname = args['appname'];

		let is_enabled = false;

		if ( level ) {

			const Memcache  = global.objects.Memcache.obj;
			const DBISimple = global.objects.DBISimple.obj;
			
			let result = {};
			
			let mem_key = `NODE:Trace:Records`;
			result      = await Memcache.init( { type: 'get', mem_key: mem_key } ) || null

			if ( result == null ) {

				let sql   = 'select * from Traces where appname = ? limit 1';
				let binds = [ appname ];

				const fetch         = await DBISimple.fetch( { sql: sql, binds: binds } );
				const fetch_success = fetch.success;

				if ( fetch_success && fetch_success.length ) {
					result = fetch_success[0];
					Memcache.init( { type: 'set', mem_key: mem_key, value: result, ttl: 60 } );
				}
			}

			if ( result != null ) {  
				const trace_res = result.Data.split(',');
				is_enabled      = trace_res.includes( level ) ? true : false;
			}
		}

		// Log, no matter.
		if ( level.match( /error|all/i ) ) {
			is_enabled = 1;
		}

		return is_enabled;
	}
}
