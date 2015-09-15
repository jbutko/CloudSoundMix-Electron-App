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

  MainController.$inject = ['LocalStorage', 'QueryService', 'CONSTANTS', 'electron', '$window', '$http'];


  function MainController(LocalStorage, QueryService, CONSTANTS, electron, $window, $http) {

    // 'controller as' syntax
    var self = this;
    self.userAuthorized = false;

    // soundCloud API node package
    var SC = require('node-soundcloud');

    // package to communicate with main window
    // var ipc = require('ipc');


    ////////////  function definitions


    // get scCodeToken on page load from config file if exists
    var config = require('./../configuration.js'),
        scCodeToken = config.readSettings('scTokenCode');
        self.accessToken = config.readSettings('accessToken');


    if (self.accessToken) {
      $http.defaults.headers.common.access_token = self.accessToken;
    }

    /**
     * Initialize user
     */
    //if (typeof self.accessToken !== undefined) {
      SC.init({
        id: CONSTANTS.scConfig.clientID,
        secret: CONSTANTS.scConfig.clientSecret,
        uri: CONSTANTS.scConfig.redirectUri,
        accessToken: self.accessToken
      });
    //}


    /**
     * Get code to be able authorize user
     */
    self.connect = function connect() {
      var url = SC.getConnectUrl();
      $window.location.href = url;
    };


    /**
     * Authorize soundCloud user === obtain accessToken
     */
    self.authorize = function authorize() {
      SC.authorize(scCodeToken, function(err, accessToken) {
        console.log(accessToken);
        if ( err ) {
          throw err;
        } else {
          self.userAuthorized = true;
          config.saveSettings('accessToken', accessToken);
        }
      });
    };


    /**
     * if we have code but do not have accessToken user needs
     * to be authenticated === obtain accessToken
     */
    if (typeof scCodeToken !== 'undefined' && self.accessToken === undefined) {
      self.authorize();
    }


    /**
     * Unauthorize soundcloud user
     */
    self.scLogoutUser = function scLogoutUser() {
      config.removeSettings('accessToken');
      config.removeSettings('scTokenCode');
      self.userAuthorized = false;
      // ipc.send('sc-unauthorized');
    };


    /**
     * if accessToken is set in config user is authenticated
     */
    var scUserAuhorized = typeof scCodeToken !== 'undefined' && self.accessToken !== undefined;
    if (scUserAuhorized) {
      self.userAuthorized = true;
      SC.setToken(self.accessToken);
    }

    if (scUserAuhorized) {
      SC.setToken(self.accessToken);
      console.log(SC);
      SC.get('/me', function(user) {
        console.log(user);
      });

      // SC.get('/tracks/164497989', {client_id: CONSTANTS.scConfig.clientID},  function(err, track) {
      //   if ( err ) {
      //     throw err;
      //   } else {
      //     console.log('track retrieved:', track);
      //   }
      // });
    }
  }


})();