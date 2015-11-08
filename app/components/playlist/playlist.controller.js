;(function() {

  'use strict';

  /**
   * Playlist controller
   *
   */

  angular
    .module('boilerplate')
    .controller('PlaylistController', PlaylistController);

  PlaylistController.$inject = ['$scope', '$rootScope', '$sce', 'playlist',
  'ngDialog', '$location'];


  ////////////////


  function PlaylistController($scope, $rootScope, $sce, playlist,
    ngDialog, $location) {


    /**
     * Default values
     */
    var path = $location.path();


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
      // stop playing current track
      $rootScope.audioPath = false;
      $rootScope.playSC = false;
      $rootScope.playMC = false;

      if (type === 'sc') {
        $rootScope.playSC = true;
        $rootScope.playSCurl = sound;
      } else if (type === 'mc') {
        $rootScope.playMC = true;
        $rootScope.playMCurl = $scope.generateIframeUrl(sound, type);
      } else if (type === 'local') {
        $rootScope.audioPath = sound.path;
      } else if (type === 'stream') {
        $rootScope.audioPath = sound.trackData.url;
      }
    };


    /**
     * Open Add track to playlist modal window
     */
    $scope.addToPlaylistModal = function(sound, type) {

      // pass added track data to ngDialog modal
      $scope.addTrackScope = {
        sound: sound,
        type: type
      }

      // update available playlists
      $scope.getPlaylistNames('playlists');

      var ngDialogOpts = {
        template: 'components/playlist/playlist-modal.html',
        showclose: true,
        closeByDocument: true,
        closeByEscape: true,
        scope: $scope,
        controller: 'PlaylistController'
      };

      var dialog = ngDialog.open(ngDialogOpts);
    };


    /**
     * Add track to playlist
     * @param {string} playlistTitle Playlist name
     * @param {object} soundObj      Sound object
     */
    $scope.addTrackToPlaylist = function (playlistTitle, soundObj, type) {
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
    // $scope.removeAllTracksFromPlaylist = function (playlistName, dbName) {
    //   playlist.removeAllTracks(playlistName, dbName);
    //   $scope.playlistSource = playlist.getPlaylistTracks(playlistName);
    // };


    /**
     * Remove all tracks from playlist
     * @param {string} playlistName Playlist name
     */
    $scope.removePlaylist = function (playlistName, dbName) {
      playlist.removeAllTracks(playlistName, dbName);

      // update available playlists
      $scope.getPlaylistNames('playlists');

      // update playlist tracks
      $scope.playlistSource = playlist.getPlaylistTracks(playlistName);
    };


    /**
     * Get all tracks of the playlist
     * @param  {string} playlistName Playlist name
     * @return {object}              Tracks
     */
    $scope.getPlaylistTracks = function (playlistName) {
      $scope.playlistSource = playlist.getPlaylistTracks(playlistName);
      $scope.currentPlaylist = playlistName;
    };


    /**
     * Get all playlists names
     * @param  {string} dbName DB Name
     * @return {object}        Tracks
     */
    $scope.getPlaylistNames = function (dbName) {
      $scope.playlistNames = playlist.getPlaylistNames(dbName);

      // if there is at least one playlist load tracks from the first one
      if ($scope.playlistNames.length && path === '/playlist') {
        $scope.playlist = true;
        $scope.getPlaylistTracks($scope.playlistNames[0]);
      }
    };

    if (path === '/playlist') {
      $scope.getPlaylistNames('playlists');
    }


    /**
     * Open audio file
     * @desc Open and play local audio file
     */
    $scope.loadLocalAudioFile = function() {
      var remote = require('remote'),
          dialog = remote.require('dialog');

      // 'Open file' system dialog
      dialog.showOpenDialog(function(fileNames) {
        if (fileNames === undefined) {
          return false;
        }

        var trackName = fileNames[0].split('\\').pop().split('.')[0];
        playlist.addTrack($scope.currentPlaylist, {
          path: fileNames[0],
          title: trackName
        }, 'local');

        $scope.playlistSource = playlist.getPlaylistTracks($scope.currentPlaylist);
        $scope.$apply();
      });
    };


    /**
     * Stream network audio file
     * @param {string} url Network audio url
     * @desc Open and play local audio file
     */
    $scope.streamAudioFile = function(url) {

      var title = url.split('/').pop() || url;

      playlist.addTrack($scope.currentPlaylist, {
        url: url,
        title: title
      }, 'stream');

      $scope.playlistSource = playlist.getPlaylistTracks($scope.currentPlaylist);
      $scope.streamAudioInput = false;
    };


    /**
     * Check stream network audio file type
     * @param {string} url Network audio url
     * @return {boolean} True/false
     */
    $scope.checkStreamAudioFileType = function(url) {

      var fileType = url.split('.').pop(),
          protocol = url.split('://')[0],
          isLink = (protocol === 'http' || protocol === 'https'),
          isAudioFile = fileType === 'mp3' || fileType === 'ogg' || fileType === 'wav';

      if (!isAudioFile || !isLink) {
        $scope.streamAudioError = 'Error loading file, unsupported audio format. Only mp3, ogg and wav are supported.'
      } else {
        $scope.streamAudioError = null;
      }

      return isAudioFile;
    };
  }


})();