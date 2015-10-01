;(function() {

  'use strict';

  /**
   * Main application controller
   *
   * You can use this controller for your whole app if it is small
   * or you can have separate controllers for each logical section
   *
   */

  angular
    .module('boilerplate')
    .controller('MainController', MainController);

  MainController.$inject = ['LocalStorage', 'QueryService', 'CONSTANTS', 'electron',
  '$window', '$http', 'fetchAPI', '$q'];


  function MainController(LocalStorage, QueryService, CONSTANTS, electron,
    $window, $http, fetchAPI, $q) {

    // 'controller as' syntax
    var self = this;
    self.scUserAuthorized = false;
    self.mcUserAuthorized = false;

    // soundCloud API node package
    var SC = require('node-soundcloud');

    // package to communicate with main window
    var ipc = require('ipc');


    ////////////  function definitions


    // get scCodeToken on page load from config file if exists
    var config = require('./../configuration.js'),
        scCodeToken = config.readSettings('scTokenCode'),
        mcCodeToken = config.readSettings('mcTokenCode');

    self.scAccessToken = config.readSettings('scAccessToken');
    self.mcAccessToken = config.readSettings('mcAccessToken');


    if (self.scAccessToken) {
      // $http.defaults.headers.common.Authorization = 'Oauth ' + self.scAccessToken;
      self.scUserAuthorized = true;
    }

    if (self.mcAccessToken) {
      // $http.defaults.headers.common.Authorization = 'Oauth ' + self.mcAccessToken;
      self.mcUserAuthorized = true;
    }

    /**
     * Initialize user
     */
    SC.init({
      id: CONSTANTS.SC.clientID,
      secret: CONSTANTS.SC.clientSecret,
      uri: CONSTANTS.SC.redirectUri,
      accessToken: self.scAccessToken
    });


    /**
     * Get SC redirect URL to be able authorize user
     */
    self.connect = function connect(service) {
      var mixcloudAuthURI = 'https://www.mixcloud.com/oauth/authorize?client_id=' + CONSTANTS.MC.clientID + '&redirect_uri=' + CONSTANTS.MC.redirectUri;
      var url = service === 'sc' ? SC.getConnectUrl() : mixcloudAuthURI;

      console.log(url);
      ipc.send('open-authorization-window', {scUrl: url});
    };


    /**
     * Authorize soundCloud user === obtain accessToken
     */
    self.scAuthorize = function authorize() {
      SC.authorize(scCodeToken, function(err, scAccessToken) {
        if ( err ) {
          throw err;
        } else {
          self.scUserAuthorized = true;
          config.saveSettings('scAccessToken', scAccessToken);
        }
      });
    };

    /**
     * Authorize mixCloud user === obtain accessToken
     */
    self.mcAuthorize = function authorize() {
      var mcAuthSettings = {
        client_id: CONSTANTS.MC.clientID,
        redirect_uri: CONSTANTS.MC.redirectUri,
        client_secret: CONSTANTS.MC.clientSecret,
        code: mcCodeToken
      };

      $http({
        method: 'GET',
        url: 'https://www.mixcloud.com/oauth/access_token',
        params: mcAuthSettings
      }).then(function(data) {
        var mcAccessToken = data.data.access_token;
        self.mcUserAuthorized = true;
        config.saveSettings('mcAccessToken', mcAccessToken);
      });
    };


    /**
     * if we have code but do not have accessToken user needs
     * to be authenticated === obtain accessToken
     */
    if (typeof mcCodeToken !== 'undefined' && self.mcAccessToken === undefined) {
      self.mcAuthorize();
    }


    /**
     * if we have code but do not have accessToken user needs
     * to be authenticated === obtain accessToken
     */
    if (typeof scCodeToken !== 'undefined' && self.scAccessToken === undefined) {
      self.scAuthorize();
    }


    /**
     * Unauthorize soundcloud user
     */
    self.logoutUser = function logoutUser(serviceType) {
      config.removeSettings(serviceType + 'AccessToken');
      config.removeSettings(serviceType + 'TokenCode');

      if (serviceType === 'sc') {
        self.scUserAuthorized = false;
      } else {
        self.mcUserAuthorized = false;
      }

      ipc.send(serviceType + '-unauthorized');
    };


    /**
     * if accessToken is set in config user is authenticated
     */
    var scUserAuhorized = typeof scCodeToken !== 'undefined' && self.scAccessToken !== undefined;
    console.log(scUserAuhorized);
    if (scUserAuhorized) {
      self.scUserAuthorized = true;
      SC.setToken(self.scAccessToken);
    }

    if (scUserAuhorized) {
      $http({
        method: 'GET',
        url: 'https://api.soundcloud.com/me',
        params: {
          'oauth_token': self.scAccessToken,
          client_id: CONSTANTS.clientID
        }
      }).then(function(data) {
         //  console.log(data);
      });


      // $http.get('https://api.soundcloud.com/me', {
      //   headers: {'oauth_token': self.scAccessToken}
      // })
      // fetchAPI.query('GET', 'me', {'oauth_token': self.scAccessToken, client_id: CONSTANTS.clientID}, {})
      //  .then(function(data) {
      //    console.log(data);
      //  }, function(error) {
      //    console.log(error);
      //  });

      // $http.get('https://api.soundcloud.com/users/doddiblog', {'oauth_token': self.scAccessToken, client_id: CONSTANTS.clientID})
      //  .then(function(data) {
      //    console.log(data);
      //  }, function(error) {
      //    console.log(error);
      //  });
    }

    self.fetchUserDashboard = function fetchUserDashboard() {

      var promises = {
        sc: fetchAPI.query('GET', 'https://api.soundcloud.com/me/activities/tracks/affiliated', {client_id: CONSTANTS.SC.clientID}, {}, {Authorization: 'Oauth ' + self.scAccessToken}),
        mc: fetchAPI.query('GET', 'https://api.mixcloud.com/me', {client_id: CONSTANTS.MC.clientID, access_token: self.mcAccessToken}, {}, {})
        //sc: $http.get('http://api.soundcloud.com/me/activities/tracks/affiliated?client_id=aade84c56054d6945c32b616bb7bce0b')
      };

      $q.all(promises).then(function(data) {
        console.log(data);
        self.scUserDashboard = data.sc.data.collection;
        self.mcUser = data.mc.data;
      });
    };
    self.fetchUserDashboard();
  }


})();