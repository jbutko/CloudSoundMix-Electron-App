/**
 * Main application controller
 *
 * You can use this controller for your whole app if it is small
 * or you can have separate controllers for each logical section
 *
 */
;(function() {

  'use strict';

  angular
    .module('boilerplate')
    .controller('MainController', MainController);

  MainController.$inject = ['LocalStorage', 'QueryService', 'CONSTANTS', 'electron', '$window'];


  function MainController(LocalStorage, QueryService, CONSTANTS, electron, $window) {

    // 'controller as' syntax
    var self = this;
    self.userAuthorized = false;
    var SC = require('node-soundcloud');


    ////////////  function definitions

    // get scCodeToken on page load
    var config = require('./../configuration.js'),
        scCodeToken = config.readSettings('scTokenCode');
        self.accessToken = config.readSettings('accessToken');

        console.log(self.accessToken);
        console.log(config.removeSettings);


    self.init = function init() {
      // Initialize client
      SC.init({
        id: CONSTANTS.scConfig.clientID,
        secret: CONSTANTS.scConfig.clientSecret,
        uri: CONSTANTS.scConfig.redirectUri,
        loginStyle: 'popup'
      });
    };
    self.init();


    self.connect = function connect() {
      var url = SC.getConnectUrl();
      $window.location.href = url;
    };

    self.authorize = function authorize() {
      SC.authorize(scCodeToken, function(err, accessToken) {
        if ( err ) {
          throw err;
        } else {
          self.userAuthorized = true;
          config.saveSettings('accessToken', accessToken);
          // Client is now authorized and able to make API calls
          console.log('access token:', self.accessToken);
        }
      });
    };


    self.scLogoutUser = function scLogoutUser() {
      config.removeSettings('accessToken');
      config.removeSettings('scTokenCode');
      self.userAuthorized = false;
    };


    if (typeof scCodeToken !== 'undefined' && typeof self.accessToken === 'undefined') {
      self.authorize();
    }

    if (typeof self.accessToken !== 'undefined') {
      self.userAuthorized = true;
    }
  }


})();