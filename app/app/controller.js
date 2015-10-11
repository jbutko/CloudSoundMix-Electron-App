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
  '$window', '$http', 'fetchAPI', '$q', '$sce', '$location', '$scope'];


  function MainController(LocalStorage, QueryService, CONSTANTS, electron,
    $window, $http, fetchAPI, $q, $sce, $location, $scope) {

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
      self.scUserAuthorized = true;
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
    var counter = 0,
        offsetVal = 0;
    self.mainFeed = [];
    self.fetchUserDashboard = function(loadMore, limit, offset) {

      if (loadMore === true) {
        ++counter;
        offset = counter * offset;
      }

      var promises = {
        scDashboard: fetchAPI.query('GET', 'https://api.soundcloud.com/me/activities/tracks/affiliated', {client_id: CONSTANTS.SC.clientID, limit: 3, offset: offset || offsetVal}, {}, {Authorization: 'Oauth ' + self.scAccessToken}),
        scReposted: fetchAPI.query('GET', 'https://api-v2.soundcloud.com/profile/soundcloud:users:41691970', {client_id: CONSTANTS.SC.clientID, limit: 3, offset: offset || offsetVal}, {}, {Authorization: 'Oauth ' + self.scAccessToken}),
        // scReposted1: fetchAPI.query('GET', 'https://api-v2.soundcloud.com', {client_id: CONSTANTS.SC.clientID, limit: 3}, {}, {Authorization: 'Oauth ' + self.scAccessToken}),
        mcMe: fetchAPI.query('GET', 'https://api.mixcloud.com/me', {client_id: CONSTANTS.MC.clientID, access_token: self.mcAccessToken}, {}, {}),
        mcFeed: fetchAPI.query('GET', 'https://api.mixcloud.com/doddiblog/feed', {client_id: CONSTANTS.MC.clientID, access_token: self.mcAccessToken, limit: 3, offset: offset || offsetVal}, {}, {})
        //sc: $http.get('http://api.soundcloud.com/me/activities/tracks/affiliated?client_id=aade84c56054d6945c32b616bb7bce0b')
      };

      if (typeof loadMore === 'undefined') {
        $q.all(promises).then(function(data) {
          var scUserDashboard = data.scDashboard.data.collection;
          var mcFeed = data.mcFeed.data.data;
          scUserDashboard.platform = 'sc';

          self.mainFeed = scUserDashboard.concat(mcFeed);
          self.mcUser = data.mcMe.data;
        });
      } else {
        console.log(offset);
        $q.all(promises).then(function(data) {
          var scUserDashboard = data.scDashboard.data.collection;
          var mcFeed = data.mcFeed.data.data;
          var mixedFeed = scUserDashboard.concat(mcFeed);

          scUserDashboard.platform = 'sc';

          // push newly loaded data into main tracks array
          mixedFeed.map(function (array) {
            self.mainFeed.push(array);
          });

          console.log(self.mainFeed);

        });
      }


    };

    self.fetchUserDashboard();


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

    // self.searchTracks('LTJ Bukem', '', '', '');


    /**
     * Generate safe URL for iframe's src attribute
     *
     * @param  {object} trackUrl Sound object
     * @return {string}          Safe track URL
     */
    self.generateIframeUrl = function (trackUrl, type) {
      var urlMc = trackUrl && trackUrl.cloudcasts ? trackUrl.cloudcasts[0].url : trackUrl.url,
          urlSc = trackUrl && trackUrl.cloudcasts ? trackUrl.cloudcasts[0].url : trackUrl.url,
          mc, sc;

      if (type === 'mc') {
        mc = $sce.trustAsResourceUrl('https://www.mixcloud.com/widget/iframe/?feed=' + encodeURIComponent(urlMc) + '&amp;hide_cover=1&amp;hide_tracklist=1&amp;mini=0&amp;replace=0&amp;autoplay=1');
      } else {
        sc = $sce.trustAsResourceUrl('https://w.soundcloud.com/player/?url=' + trackUrl.origin.permalink_url + '&amp;show_artwork=true&amp;show_playcount=false&amp;liking=false&amp;sharing=true&amp;buying=true&amp;show_bpm=false&amp;show_comments=true');
      }
      return type === 'sc' ? sc : mc;
    };


    /**
     * Play mixcloud/soundcloud track
     */
    self.playSound = function (sound, type) {
      self.playSC = false;
      if (type === 'sc') {
        self.playSC = true;
        self.playMC = false;
        self.playSCurl = sound;
      } else if(type === 'mc') {
        self.playSC = false;
        self.playMC = true;
        self.playMCurl = self.generateIframeUrl(sound, type);
      }
    };


    /**
     * Open audio file
     *
     * @desc Open and play local audio file
     */
    self.openAudioFile = function() {
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