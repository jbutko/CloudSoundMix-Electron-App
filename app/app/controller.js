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
  '$window', '$http', 'fetchAPI', '$q', '$sce', '$location', '$scope', '$rootScope'];


  function MainController(LocalStorage, QueryService, CONSTANTS, electron,
    $window, $http, fetchAPI, $q, $sce, $location, $scope, $rootScope) {

    // 'controller as' syntax
    var self = this;

    // default values
    // get scCodeToken on page load from config file if exists
    var config = require('./../configuration.js'),
        scCodeToken = config.readSettings('scTokenCode'),
        mcCodeToken = config.readSettings('mcTokenCode'),
        defaultLimit = 3;

    self.scUserAuthorized = false;
    self.mcUserAuthorized = false;
    self.mainFeed = [];
    self.scAccessToken = config.readSettings('scAccessToken');
    self.mcAccessToken = config.readSettings('mcAccessToken');

    // exposed functions
    self.connect = connect;
    self.scAuthorize = scAuthorize;
    self.mcAuthorize = mcAuthorize;
    self.logoutUser = logoutUser;
    self.fetchUserDashboard = fetchUserDashboard;
    self.loadMoreTracks = loadMoreTracks;
    self.fetchNewTracks = fetchNewTracks;
    self.searchTracks = searchTracks;

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
    function scAuthorize() {
      scCodeToken = config.readSettings('scTokenCode');
      SC.authorize(scCodeToken, function(err, scAccessToken) {
        if ( err ) {
          throw err;
        } else {
          self.scUserAuthorized = true;

          if (scAccessToken) {
            config.saveSettings('scAccessToken', scAccessToken);
          }

          // load tracks
          self.fetchUserDashboard(defaultLimit);
        }
      });
    };

    /**
     * Authorize mixCloud user === obtain accessToken
     */
    function mcAuthorize() {
      var mcAuthSettings = {
        client_id: CONSTANTS.MC.clientID,
        redirect_uri: CONSTANTS.MC.redirectUri,
        client_secret: CONSTANTS.MC.clientSecret,
        code: config.readSettings('mcTokenCode')
      };

      $http({
        method: 'GET',
        url: 'https://www.mixcloud.com/oauth/access_token',
        params: mcAuthSettings
      }).then(function(data) {
        var mcAccessToken = data.data.access_token;

        self.mcUserAuthorized = true;
        config.saveSettings('mcAccessToken', mcAccessToken);

        // load tracks
        self.fetchUserDashboard(defaultLimit);
      });
    };


    /**
     * Unauthorize soundcloud user
     */
    function logoutUser(serviceType) {
      config.removeSettings(serviceType + 'AccessToken');
      config.removeSettings(serviceType + 'TokenCode');

      if (serviceType === 'sc') {
        self.scUserAuthorized = false;
      } else {
        self.mcUserAuthorized = false;
      }

      // load tracks
      self.fetchUserDashboard(defaultLimit);

      ipc.send(serviceType + '-unauthorized');
    };


    /**
     * Fetch user's feed or latests tracks
     */
    function fetchUserDashboard(limit) {

      if (!self.scUserAuthorized && !self.mcUserAuthorized) {
        return;
      }

      // default limit
      limit = limit || defaultLimit;

      var scDashboardQuery = self.scUserAuthorized ? fetchAPI.query('GET', 'https://api.soundcloud.com/me/activities/tracks/affiliated', {client_id: CONSTANTS.SC.clientID, limit: limit, linked_partitioning: 1}, {}, {Authorization: 'Oauth ' + self.scAccessToken}) : undefined,
          mcMeQuery = self.mcUserAuthorized ? fetchAPI.query('GET', 'https://api.mixcloud.com/me', {client_id: CONSTANTS.MC.clientID, access_token: config.readSettings('mcAccessToken')}, {}, {}) : undefined,
          mcFeed = self.mcUserAuthorized ? fetchAPI.query('GET', 'https://api.mixcloud.com/me/listens', {client_id: CONSTANTS.MC.clientID, access_token: config.readSettings('mcAccessToken'), limit: limit}, {}, {}) : undefined;

      var promises = {
        // scDashboard: fetchAPI.query('GET', 'https://api.soundcloud.com/me/activities/tracks/affiliated', {client_id: CONSTANTS.SC.clientID, limit: 3, offset: offset || offsetVal}, {}, {Authorization: 'Oauth ' + self.scAccessToken}),
        scDashboard: scDashboardQuery,
        // scReposted: fetchAPI.query('GET', 'https://api-v2.soundcloud.com/profile/soundcloud:users:41691970', {client_id: CONSTANTS.SC.clientID, limit: 3, offset: offset || offsetVal}, {}, {Authorization: 'Oauth ' + self.scAccessToken}),
        // scReposted1: fetchAPI.query('GET', 'https://api-v2.soundcloud.com', {client_id: CONSTANTS.SC.clientID, limit: 3}, {}, {Authorization: 'Oauth ' + self.scAccessToken}),
        mcMe: mcMeQuery,
        // mcFeed: fetchAPI.query('GET', 'https://api.mixcloud.com/doddiblog/feed', {client_id: CONSTANTS.MC.clientID, access_token: self.mcAccessToken, limit: 3, offset: offset || offsetVal}, {}, {})
        mcFeed: mcFeed
          //sc: $http.get('http://api.soundcloud.com/me/activities/tracks/affiliated?client_id=aade84c56054d6945c32b616bb7bce0b')
      };


      $q.all(promises).then(function(data) {
        self.mainFeed = [];

        var scUserDashboard = data && data.scDashboard && data.scDashboard.data && data.scDashboard.data.collection;
        var mcFeed = data && data.mcFeed && data.mcFeed.data && data.mcFeed.data.data;

        // SC data
        if (scUserDashboard) {
          scUserDashboard.platform = 'sc';

          scUserDashboard.map(function (value) {
            self.mainFeed.push(value);
          });

          // pagination for next results
          self.scNextPage = typeof self.scNextPage === 'undefined' ? data.scDashboard.data.next_href : self.scNextPage;

          // pagination for future results
          self.scFuturePage = data.scDashboard.data.future_href;
        }

        // MC data
        if (mcFeed) {
          self.mcUser = data.mcMe.data;

          mcFeed.map(function (value) {
            self.mainFeed.push(value);
          });

          // pagination for next results
          self.mcNextPage = typeof self.mcNextPage === 'undefined' ? data.mcFeed.data.paging.next : self.mcNextPage;

          // pagination for future results
          self.mcFuturePage = data.mcFeed.data.paging.next;
        }
      });
    };

    // load tracks on app load
    self.fetchUserDashboard(defaultLimit);

    /**
     * Load more tracks from history
     * @param  {string} scNextPage SoundCloud next pagination link
     * @param  {string} mcNextPage MixCloud next pagination link
     */
    function loadMoreTracks(scNextPage, mcNextPage) {
      var scDashboardQuery = self.scUserAuthorized ? fetchAPI.query('GET', scNextPage, {}, {}, {Authorization: 'Oauth ' + self.scAccessToken}) : undefined,
          mcMeQuery = self.mcUserAuthorized ? fetchAPI.query('GET', mcNextPage, {}, {}, {}) : undefined;

      var promises = {
        scDashboard: scDashboardQuery,
        mcFeed: mcMeQuery
      };

      $q.all(promises).then(function(data) {
        var scUserDashboard = data && data.scDashboard && data.scDashboard.data && data.scDashboard.data.collection;
        var mcFeed = data && data.mcFeed && data.mcFeed.data && data.mcFeed.data.data;

        // SC data
        if (scUserDashboard && !mcFeed) {
          scUserDashboard.platform = 'sc';

          // main view data
          scUserDashboard.map(function (value) {
            self.mainFeed.push(value);
          });

          // pagination for next results
          self.scNextPage = data.scDashboard.data.next_href;

          // pagination for future results
          self.scFuturePage = data.scDashboard.data.future_href;
        }

        // MC data
        if (mcFeed && !scUserDashboard) {
          // main view data
          mcFeed.map(function (value) {
            self.mainFeed.push(value);
          });

          // pagination for next results
          self.mcNextPage = data.mcFeed.data.paging.next;

          // pagination for future results
          self.mcFuturePage = data.mcFeed.data.paging.next;
        }

        // MC & SC data
        if (mcFeed && scUserDashboard) {

          scUserDashboard.platform = 'sc';

          scUserDashboard.map(function (value) {
            self.mainFeed.push(value);
          });

          mcFeed.map(function (value) {
            self.mainFeed.push(value);
          });

          // pagination for next results
          self.scNextPage = data.scDashboard.data.next_href;
          self.scFuturePage = data.scDashboard.data.future_href;
          self.mcNextPage = data.mcFeed.data.paging.next;
          self.mcFuturePage = data.mcFeed.data.paging.next;
        }
      });
    };


    /**
     * Load new/future tracks
     * @param  {string} scFuturePage SoundCloud future pagination link
     * @param  {string} mcFuturePage MixCloud future pagination link
     */
    function fetchNewTracks(scFuturePage, mcFuturePage) {
      var promises = {
        scDashboard: fetchAPI.query('GET', scFuturePage, {}, {}, {Authorization: 'Oauth ' + self.scAccessToken}),
        mcFeed: fetchAPI.query('GET', mcFuturePage, {}, {}, {})
      };

      $q.all(promises).then(function(data) {
        var scUserDashboard = data.scDashboard.data.collection;
        var mcFeed = data.mcFeed.data.data;

        // label SC data
        scUserDashboard.platform = 'sc';

        var newTracks = scUserDashboard.concat(mcFeed);

        // append new tracks to self.mainFeed array
        newTracks.map(function (value) {
          self.mainFeed.unshift(value);
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
    function searchTracks(keyword, searchType, platform, params, duration, limit) {

      self.mainFeed = [];

      fetchAPI.searchTracks(keyword, searchType, platform, params, duration, limit)
      .then(function(results) {
        var mcSearchResults = results.mcSearch.data.data;
        var scSearchResults = results.scSearch.data.collection;
        self.trackSearched = true;

        scSearchResults.map(function (value) {
          self.mainFeed.push(value);
        });

        mcSearchResults.map(function (value) {
          self.mainFeed.push(value);
        });

        self.scNextPage = results.scSearch.data.next_href;
        self.mcNextPage = results.mcSearch.data.paging.next;
      }).catch(function (err) {
        console.log(err);
      });
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

    /**
     * Events
     */
    ipc.on('user-authenticated', function (response) {
      if (response.type === 'sc') {
        self.scAuthorize();
      }

      if (response.type === 'mc') {
        self.mcAuthorize();
      }
    });

  }


})();