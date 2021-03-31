'use strict';

/* 
	Description: 

	Useful Perl functions for JavaScript.
*/

exports.Perl = class { 

	/*
		Perl's reverse function (one layer deep) for hashes.
		http://nelsonwells.net/2011/10/swap-object-key-and-values-in-javascript/

		Turn:  { '0': 'cat', '1': 'hat', '2': 'brat' }
		Into:  { cat: '0', hat: '1', brat: '2' }

	*/
	ReverseHash( hash ) {

		let new_hash = {};

		for ( let k in hash ) { 
			new_hash[ hash[ k ] ] = hash.hasOwnProperty( k ) ? k : '';
		}

		return new_hash;
	}

	// Perl int() function.
	int( num ) { 
		num = num.toString();
		num = num.replace( /(\d+)\..+/, '$1' );
		num = parseInt( num );
		return num;
	}

	// From HTML::Entities.
	encode_entities( str ) { 
		return str.replace( /[\u00A0-\u9999<>\&]/gim, function( i ) {
   			return '&#' + i.charCodeAt(0) + ';';
		} );
	}

	// Just like the perl chop.
	chop( str ) { 
		str = str.slice( 0, str.length -1 );
		return str;
	}

	// Just like the perl chomp.
	chomp( str ) { 

		let len = str.length;

		if ( len > 1 ) {

			str = str.slice( 0, len );

			let rlen   = str.length;
			let last   = rlen - 1;
			let has_nl = ( str[ last ] === "\n" || str[ last ] === "\r" );

			if ( rlen > 1 && has_nl ) { 
			    str = str.slice( 0, last );
			}
		}

		return str;
	}
}
