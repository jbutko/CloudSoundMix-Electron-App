;(function() {

  'use strict';

  /**
   * Playlist controller
   *
   */

  angular
    .module('boilerplate')
    .controller('PlaylistController', PlaylistController);

  PlaylistController.$inject = ['$scope', '$rootScope', '$sce', 'playlist', 'ngDialog'];


  function PlaylistController($scope, $rootScope, $sce, playlist, ngDialog) {

    /**
     * Generate safe URL for iframe's src attribute
     * @param  {object} trackUrl Sound object
     * @return {string}          Safe track URL
     */
    $scope.generateIframeUrl = function (trackUrl, type) {
      var urlMc = trackUrl && trackUrl.cloudcasts ? trackUrl.cloudcasts[0].url : trackUrl.url,
          urlSc = trackUrl && trackUrl.cloudcasts ? trackUrl.cloudcasts[0].url : trackUrl.url,
          mc, sc;

      if (type === 'mc') {
        mc = $sce.trustAsResourceUrl('https://www.mixcloud.com/widget/iframe/?feed=' + encodeURIComponent(urlMc) + '&amp;hide_cover=1&amp;hide_tracklist=1&amp;mini=0&amp;replace=0&amp;autoplay=1');
      } else {
        sc = $sce.trustAsResourceUrl('https://w.soundcloud.com/player/?url=' + trackUrl.origin.tracks_uri + '&amp;show_artwork=true&amp;show_playcount=false&amp;liking=false&amp;sharing=true&amp;buying=true&amp;show_bpm=false&amp;show_comments=true');
      }
      return type === 'sc' ? sc : mc;
    };


    /**
     * Play mixcloud/soundcloud track
     */
    $scope.playSound = function (sound, type) {
      // stop any playing track
      $rootScope.audioPath = false;
      $rootScope.playSC = false;
      $rootScope.playMC = false;

      if (type === 'sc') {
        $rootScope.playSC = true;
        $rootScope.playMC = false;
        $rootScope.playSCurl = sound;
      } else if (type === 'mc') {
        $rootScope.playSC = false;
        $rootScope.playMC = true;
        $rootScope.playMCurl = $scope.generateIframeUrl(sound, type);
      } else if (type === 'local') {
        $rootScope.audioPath = sound.path;
      }
    };

    /**
     * Get all playlists names
     * @param  {string} dbName DB Name
     * @return {object}        Tracks
     */
    $scope.getPlaylistNames = function (dbName) {
      $scope.playlistNames = playlist.getPlaylistNames(dbName);
    };

    $scope.getPlaylistNames('playlists');


    /**
     * Open Add track to playlist modal window
     */
    $scope.addToPlaylistModal = function(sound, type) {

      // pass added track data to ngDialog modal
      $scope.addTrackScope = {
        sound: sound,
        type: type
      }

      var ngDialogOpts = {
        template: 'components/playlist/playlist-modal.html',
        showclose: true,
        closeByDocument: true,
        closeByEscape: true,
        scope: $scope,
        controller: 'PlaylistController'
      };

      console.log($scope.addTrackScope);

      var dialog = ngDialog.open(ngDialogOpts);

      dialog.closePromise.then(function(data) {
        console.log(data);
      });
    };


    /**
     * Add track to playlist
     * @param {string} playlistTitle Playlist name
     * @param {object} soundObj      Sound object
     */
    $scope.addTrackToPlaylist = function (playlistTitle, soundObj, type) {
      console.log($scope.parent);
      playlist.addTrack(playlistTitle, soundObj, type);
    };

    /**
     * Remove track from playlist
     * @param  {number} createdAt ID of the track
     */
    $scope.removeTrackFromPlaylist = function (createdAt, currentPlaylist) {
      playlist.removeTrack(createdAt);

      // update playlist tracks
      $scope.playlistSource = playlist.getPlaylistTracks(currentPlaylist);

      // update available playlists
      $scope.getPlaylistNames('playlists');
    };

    /**
     * Remove all tracks from playlist
     * @param {string} playlistName Playlist name
     */
    $scope.removeAllTracksFromPlaylist = function (playlistName, dbName) {
      playlist.removeAllTracks(playlistName, dbName);
      $scope.playlistSource = playlist.getPlaylistTracks(playlistName);
    };

    /**
     * Get all tracks of the playlist
     * @param  {string} playlistName Playlist name
     * @return {object}              Tracks
     */
    $scope.getPlaylistTracks = function (playlistName) {
      $scope.playlistSource = playlist.getPlaylistTracks(playlistName);
    };

    /**
     * Open audio file
     * @desc Open and play local audio file
     */
    $scope.loadLocalAudioFile = function() {
      var remote = require('remote'),
          dialog = remote.require('dialog');

      // 'Open file' system dialog
      dialog.showOpenDialog(function(fileNames) {
        console.log(fileNames);
        if (fileNames === undefined) {
          return false;
        }

        var trackName = fileNames[0].split('\\').pop().split('.')[0];
        playlist.addTrack('one', {
          path: $rootScope.audioPath,
          title: trackName
        }, 'local');

        console.log(playlist.getPlaylistTracks('one'));
        $scope.$apply();
      });
    };


    /**
     * Stream network audio file
     * @desc Open and play local audio file
     */
    $scope.streamAudioFile = function(url) {
      $rootScope.audioPath = url;
      console.log(url);
      playlist.addTrack('one', {'url': $rootScope.audioPath}, 'stream');
      $scope.streamAudioInput = false;
    };

  }


})();