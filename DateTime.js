'use strict'

/*

	Description:  

		Date and time related functions.

*/

exports.DateTime = class {

	// Return true if it's DST or 0 when not.
	is_dst() {

		return new Promise( res => {
			const date   = new Date();
			const jan    = new Date( date.getFullYear(), 0, 1 ).getTimezoneOffset();
			const jul    = new Date( date.getFullYear(), 6, 1 ).getTimezoneOffset();
			const is_dst = Math.min( jan, jul ) == date.getTimezoneOffset();
			res( is_dst );
		} );
	}
}

