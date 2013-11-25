define( [
	'aloha',
	'aloha/jquery',
	'aloha/plugin',
	'../repository.js' // custom repository
], function ( Aloha, jQuery, Plugin ) {
	
	var GENTICS = window.GENTICS;

	/**
	 * register the plugin with unique name
	 */
	return Plugin.create( 'btmimages', {

		/**
		 * Initialize the plugin and set initialize flag on true
		 */
		init: function () {
			// do something
		},

		/**
		* toString method
		* @return string
		*/
		toString: function () {
			return 'image';
		}
	} );
} );
