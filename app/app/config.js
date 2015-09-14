;(function() {


	'use strict';


	/**
	 * Place to store API URL or any other constants
	 * Usage:
	 *
	 * Inject CONSTANTS service as a dependency and then use like this:
	 * CONSTANTS.API_URL
	 */
  angular
  	.module('boilerplate')
    .constant('CONSTANTS', {
      'scConfig': {
       'clientID': 'aade84c56054d6945c32b616bb7bce0b',
       'clientSecret': 'ffbda7e0908355703a934c207af4ceac',
       'redirectUri': 'http://127.0.0.1:3000',
       'endUserAuthorization': 'https://soundcloud.com/callback',
       'tokenUri': 'https://api.soundcloud.com/oauth2/token'
      }
    });


})();
