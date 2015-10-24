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
  '$window', '$http', 'fetchAPI', '$q', '$sce', '$location', '$scope', 'playlist'];


  function MainController(LocalStorage, QueryService, CONSTANTS, electron,
    $window, $http, fetchAPI, $q, $sce, $location, $scope, playlist) {

    // 'controller as' syntax
    var self = this;
    self.scUserAuthorized = false;
    self.mcUserAuthorized = false;

    // soundCloud API node package
    var SC = require('node-soundcloud');

    // package to communicate with main window
    var ipc = require('ipc');


    ////////////  function definitions

    // playlist.addTrack('dodod', {
    //   test: 'fdgdg'
    // }).then(function (results, err) {
    //   console.log(results);
    // });

    // console.log(playlist.getAllTracks('playlists'));
    // console.log(playlist.getPlaylistTracks('dodod'));
    // console.log(playlist.removeTrack(1445188623096));
    // console.log(playlist.getPlaylistNames('playlists'));

    // get scCodeToken on page load from config file if exists
    var config = require('./../configuration.js'),
        scCodeToken = config.readSettings('scTokenCode'),
        mcCodeToken = config.readSettings('mcTokenCode');

    self.scAccessToken = config.readSettings('scAccessToken');
    self.mcAccessToken = config.readSettings('mcAccessToken');

    if (self.scAccessToken) {
      self.scUserAuthorized = true;

      var scAccessTokenStored = LocalStorage.get('scAccessToken');
      if (!scAccessTokenStored) {
        LocalStorage.set('scAccessToken', 'OAuth ' + self.scAccessToken);
      }
    }

    if (self.mcAccessToken) {
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

      // fetchAPI.query('GET', 'me', {'oauth_token': self.scAccessToken, client_id: CONSTANTS.clientID}, {})
      //  .then(function(data) {
      //    console.log(data);
      //  }, function(error) {
      //    console.log(error);
      //  });

    }

    /**
     * Fetch user's feed or latests tracks
     */
    self.mainFeed = [];
    self.fetchUserDashboard = function(limit) {

      // default limit
      limit = limit || 5;

      var promises = {
        // scDashboard: fetchAPI.query('GET', 'https://api.soundcloud.com/me/activities/tracks/affiliated', {client_id: CONSTANTS.SC.clientID, limit: 3, offset: offset || offsetVal}, {}, {Authorization: 'Oauth ' + self.scAccessToken}),
        scDashboard: fetchAPI.query('GET', 'https://api.soundcloud.com/me/activities/tracks/affiliated', {client_id: CONSTANTS.SC.clientID, limit: limit, linked_partitioning: 1}, {}, {Authorization: 'Oauth ' + self.scAccessToken}),
        // scReposted: fetchAPI.query('GET', 'https://api-v2.soundcloud.com/profile/soundcloud:users:41691970', {client_id: CONSTANTS.SC.clientID, limit: 3, offset: offset || offsetVal}, {}, {Authorization: 'Oauth ' + self.scAccessToken}),
        // scReposted1: fetchAPI.query('GET', 'https://api-v2.soundcloud.com', {client_id: CONSTANTS.SC.clientID, limit: 3}, {}, {Authorization: 'Oauth ' + self.scAccessToken}),
        mcMe: fetchAPI.query('GET', 'https://api.mixcloud.com/me', {client_id: CONSTANTS.MC.clientID, access_token: self.mcAccessToken}, {}, {}),
        // mcFeed: fetchAPI.query('GET', 'https://api.mixcloud.com/doddiblog/feed', {client_id: CONSTANTS.MC.clientID, access_token: self.mcAccessToken, limit: 3, offset: offset || offsetVal}, {}, {})
        mcFeed: fetchAPI.query('GET', 'https://api.mixcloud.com/doddiblog/feed', {client_id: CONSTANTS.MC.clientID, access_token: self.mcAccessToken, limit: limit}, {}, {})
        //sc: $http.get('http://api.soundcloud.com/me/activities/tracks/affiliated?client_id=aade84c56054d6945c32b616bb7bce0b')
      };

      $q.all(promises).then(function(data) {
        var scUserDashboard = data.scDashboard.data.collection;
        var mcFeed = data.mcFeed.data.data;

        // label SC data
        scUserDashboard.platform = 'sc';

        // main view data
        self.mainFeed = scUserDashboard.concat(mcFeed);
        self.mcUser = data.mcMe.data;

        // pagination
        self.scNextPage = data.scDashboard.data.next_href;
        self.mcNextPage = data.mcFeed.data.paging.next;
      });
    };

    // load tracks on app load
    self.fetchUserDashboard(3);

    /**
     * Load more tracks
     * @param  {string} scNextPage SoundCloud future pagination link
     * @param  {string} mcNextPage MixCloud future pagination link
     */
    self.loadMoreTracks = function (scNextPage, mcNextPage) {
      var promises = {
        scDashboard: fetchAPI.query('GET', scNextPage, {}, {}, {Authorization: 'Oauth ' + self.scAccessToken}),
        mcFeed: fetchAPI.query('GET', mcNextPage, {}, {}, {})
      };

      $q.all(promises).then(function(data) {
        var scUserDashboard = data.scDashboard.data.collection;
        var mcFeed = data.mcFeed.data.data;

        // label SC data
        scUserDashboard.platform = 'sc';

        var newTracks = scUserDashboard.concat(mcFeed);

        // append new tracks to self.mainFeed array
        newTracks.map(function (value) {
          self.mainFeed.push(value);
        });

        // store new pagination links
        self.scNextPage = data.scDashboard.data.next_href;
        self.mcNextPage = data.mcFeed.data.paging.next;
      });
    };


    /**
     * Search tracks
     */
    self.trackSearched = false;
    self.searchTracks = function(keyword, searchType, platform, params, duration, limit) {

      fetchAPI.searchTracks(keyword, searchType, platform, params, duration, limit).then(function(results) {
        var mcSearchResults = results.mcSearch.data.data;
        var scSearchResults = results.scSearch.data;
        self.trackSearched = true;

        self.mainFeed = scSearchResults.concat(mcSearchResults);
      }).catch(function (err) {
        console.log(err);
      });
    };


    /**
     * Open audio file
     * @desc Open and play local audio file
     */
    self.loadLocalAudioFile = function() {
      var remote = require('remote'),
          dialog = remote.require('dialog');

      // 'Open file' system dialog
      dialog.showOpenDialog(function(fileNames) {
        if (fileNames === undefined) {
          return false;
        }

        self.audioFileName = fileNames[0];
        console.log(_readAudioMetadata(self.audioFileName));
        $scope.$apply();
        // _readAudioMetadata(self.audioFileName).then(function(data) {
        //     console.log(data);
        //     // self.audioTitle =
        //     console.log(self.audioTitle);
        // });
      });
    };


    /**
     * Stream network audio file
     * @desc Open and play local audio file
     */
    self.streamAudioFile = function(url) {
      self.audioFileName = url;
      self.streamAudioInput = false;
    };

    function _readAudioMetadata(filename) {
      var id3 = require('id3js');

      id3({ file: filename, type: id3.OPEN_LOCAL }, function(err, tags) {
        if (tags.title && tags.artist) {
          console.log(tags);
          return tags;
        } else {
          // return filename.replace(/_/g, ' ');
          return filename;
        }
      });
    }

  }


})();