'use strict'

/*

	Description:  

		Customer-centric functions.

*/

const time       = require('time');
const dateformat = require('dateformat');

const classname = 'Util::Customer';

exports.Customer = class {

	// Fetches the 
	async get_customer_time( args ) {

		args = args || [];

		const site_name = args['site_name'];

		const ConfigJSON = global.objects.ConfigJSON.obj;
		const Trace      = global.objects.Trace.obj;
		const tpre       = `${classname} get_customer_time`;

		// Datetime string.
		let customer_time = '';

		const config_db = await ConfigJSON.fetch( { site_name: site_name, key: 'config.db' } );
		const success   = config_db.success;

		if ( success ) {

			const json = JSON.parse( success );
			const G1   = json.G1;

			if ( G1 ) { 

				// Abbreviation.
				const TIMEZONE    = 50;
				const time_abbrev = G1.split('|')[TIMEZONE];

				if ( time_abbrev ) { 

					// The offset from the db.
					const offset         = await this.get_offset( { time_abbrev: time_abbrev, site_name: site_name } );
					let   offset_seconds = offset * 60 * 60;

					offset_seconds = offset_seconds.toString() + '000';
					offset_seconds = parseInt( offset_seconds );

					// Final with format.  Default:  MM/DD/YY HH:MM:SS.
					customer_time = dateformat( offset_seconds, 'mm/dd/yy hh:mm:ss' );

				}

			} else { 
				await Trace.WriteTrace( { level: 'ERROR', text: `${tpre} No G1 record`, site_name: site_name } );
			}
		}

		return customer_time;
	}

	async get_offset( args ) {

		args = args || [];

		const time_abbrev = args['time_abbrev'];
		const site_name   = args['site_name'];

		const DBISimple = global.objects.DBISimple.obj;
		const DateTime  = global.objects.DateTime.obj;
		const Memcache  = global.objects.Memcache.obj;

		const mem_key = `${site_name}:customer:${time_abbrev}:offset`;
		let offset    = await Memcache.init( { type: 'get', mem_key: mem_key } ) || 0;

		// Offset can be zero.
		if ( !offset.toString.length ) {

			// Grab the offset for GMT.
			const is_dst  = await DateTime.is_dst(); 
			const type    = is_dst == true ? 'D' : 'S';
			const sql     = 'select offset from TimeZoneConfig where TimeZone = ? and type = ?';
			const binds   = [ time_abbrev, type ];
			const fetch   = await DBISimple.fetch( { site_name: site_name, sql: sql, binds: binds, db_name: 'hconfig' } );
			const success = fetch.success;
			
			if ( success ) {
				offset = success[0].offset;
				Memcache.init( { type: 'set', mem_key: mem_key, value: offset } );
			}
		}

		return offset;
	}
}
